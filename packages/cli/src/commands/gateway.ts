import {Args, Command, Flags} from '@oclif/core'
import * as http from 'node:http'
import chalk from 'chalk'

const SEP = chalk.hex('#475569')('─'.repeat(50))
const blue = chalk.hex('#60a5fa')

interface JsonRpcRequest {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: unknown
}

interface JsonRpcError {
  code: number
  message: string
}

interface JsonRpcResponse {
  jsonrpc: string
  id?: string | number | null
  result?: unknown
  error?: JsonRpcError
}

interface GatewayLogEntry {
  ts: string
  action: 'pass' | 'block' | 'rewrite'
  method: string
  latencyMs: number
  reason?: string
}

function log(entry: GatewayLogEntry): void {
  const line = JSON.stringify(entry)
  if (entry.action === 'block') {
    process.stderr.write(chalk.red('[block]  ') + line + '\n')
  } else if (entry.action === 'rewrite') {
    process.stderr.write(chalk.yellow('[rewrite]') + ' ' + line + '\n')
  } else {
    process.stderr.write(chalk.dim('[pass]   ') + line + '\n')
  }
}

// Normalise a tools/call result so the agent always receives a valid content[].
// Returns the (potentially mutated) body and a description of what was fixed.
function normaliseMcpToolResult(
  body: JsonRpcResponse,
  rpcMethod: string,
): {body: JsonRpcResponse; rewritten: boolean; reason?: string} {
  if (rpcMethod !== 'tools/call' || body.error) {
    return {body, rewritten: false}
  }

  const result = body.result as Record<string, unknown> | null | undefined

  // result itself is null / not an object — wrap it
  if (!result || typeof result !== 'object') {
    return {
      body: {
        ...body,
        result: {content: [{type: 'text', text: result != null ? String(result) : ''}]},
      },
      rewritten: true,
      reason: 'result was not an object',
    }
  }

  const reasons: string[] = []

  // content missing or null
  if (!('content' in result) || result['content'] == null) {
    result['content'] = [{type: 'text', text: ''}]
    reasons.push('content was null or missing')
  }

  // content is not an array
  if (!Array.isArray(result['content'])) {
    result['content'] = [{type: 'text', text: String(result['content'])}]
    reasons.push('content was not an array')
  }

  // items missing type field
  const arr = result['content'] as unknown[]
  let fixed = 0
  result['content'] = arr.map((item) => {
    if (!item || typeof item !== 'object') {
      fixed++
      return {type: 'text', text: String(item ?? '')}
    }
    const obj = item as Record<string, unknown>
    if (!obj['type']) {
      fixed++
      return {...obj, type: 'text'}
    }
    return item
  })
  if (fixed > 0) reasons.push(`${fixed} content item(s) missing type field`)

  const rewritten = reasons.length > 0
  return {body, rewritten, reason: rewritten ? reasons.join('; ') : undefined}
}

async function readBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

export default class Gateway extends Command {
  static override description =
    'Start a local MCP proxy that enforces timeouts and normalises response schemas'

  static override examples = [
    '<%= config.bin %> gateway https://your-mcp-server.example.com',
    '<%= config.bin %> gateway https://your-mcp-server.example.com --port 4444 --timeout 3000',
    '<%= config.bin %> gateway https://your-mcp-server.example.com --no-sanitize',
  ]

  static override args = {
    url: Args.string({
      description: 'Target MCP server URL to proxy',
      required: true,
    }),
  }

  static override flags = {
    port: Flags.integer({
      description: 'Local port to listen on',
      default: 4444,
      char: 'p',
    }),
    timeout: Flags.integer({
      description: 'Upstream request timeout in milliseconds',
      default: 5000,
      char: 't',
    }),
    sanitize: Flags.boolean({
      description: 'Normalise malformed MCP response schemas (enabled by default)',
      default: true,
      allowNo: true,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Gateway)
    const target = args.url.replace(/\/$/, '')
    const {port, timeout: timeoutMs, sanitize} = flags

    const server = http.createServer(async (req, res) => {
      const start = Date.now()
      let rpcMethod = 'unknown'
      let rpcId: string | number | null | undefined

      try {
        const rawBody = await readBody(req)

        // Parse JSON-RPC envelope for method/id — needed for logging and normalisation
        try {
          const parsed = JSON.parse(rawBody.toString()) as JsonRpcRequest
          rpcMethod = parsed.method ?? 'unknown'
          rpcId = parsed.id
        } catch {
          // Not JSON — proxy transparently
        }

        // Forward all headers except Host, which must match the upstream
        const forwardHeaders: Record<string, string> = {}
        for (const [k, v] of Object.entries(req.headers)) {
          if (k.toLowerCase() === 'host') continue
          forwardHeaders[k] = Array.isArray(v) ? v.join(', ') : (v ?? '')
        }

        let upstreamRes: Response
        try {
          upstreamRes = await fetch(target, {
            method: req.method ?? 'GET',
            headers: forwardHeaders,
            body: rawBody.length > 0 ? rawBody : undefined,
            signal: AbortSignal.timeout(timeoutMs),
          })
        } catch (err) {
          const latencyMs = Date.now() - start
          const isTimeout = err instanceof Error && err.name === 'TimeoutError'

          log({
            ts: new Date().toISOString(),
            action: 'block',
            method: rpcMethod,
            latencyMs,
            reason: isTimeout ? `upstream timeout after ${timeoutMs}ms` : String(err),
          })

          const errorBody: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: rpcId ?? null,
            error: {
              code: isTimeout ? -32000 : -32603,
              message: isTimeout
                ? `Gateway: upstream timed out after ${timeoutMs}ms`
                : `Gateway: upstream unreachable — ${err instanceof Error ? err.message : String(err)}`,
            },
          }
          res.writeHead(200, {'Content-Type': 'application/json'})
          res.end(JSON.stringify(errorBody))
          return
        }

        const contentType = upstreamRes.headers.get('content-type') ?? ''

        // SSE streams: pipe through without buffering — timeout already fired or didn't
        if (contentType.includes('text/event-stream')) {
          res.writeHead(upstreamRes.status, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          })
          const reader = upstreamRes.body?.getReader()
          if (reader) {
            try {
              for (;;) {
                const {done, value} = await reader.read()
                if (done) break
                res.write(value)
              }
            } finally {
              res.end()
            }
          } else {
            res.end()
          }
          log({ts: new Date().toISOString(), action: 'pass', method: rpcMethod, latencyMs: Date.now() - start})
          return
        }

        // JSON response: buffer, optionally normalise, forward
        const responseText = await upstreamRes.text()
        let action: 'pass' | 'rewrite' = 'pass'
        let rewriteReason: string | undefined
        let finalBody = responseText

        if (sanitize) {
          try {
            const parsed = JSON.parse(responseText) as JsonRpcResponse
            const normalised = normaliseMcpToolResult(parsed, rpcMethod)
            if (normalised.rewritten) {
              action = 'rewrite'
              rewriteReason = normalised.reason
              finalBody = JSON.stringify(normalised.body)
            }
          } catch {
            // Not valid JSON — forward as-is
          }
        }

        log({
          ts: new Date().toISOString(),
          action,
          method: rpcMethod,
          latencyMs: Date.now() - start,
          reason: rewriteReason,
        })

        const outBuf = Buffer.from(finalBody)
        res.writeHead(upstreamRes.status, {
          'Content-Type': 'application/json',
          'Content-Length': String(outBuf.byteLength),
        })
        res.end(outBuf)
      } catch (err) {
        // Unhandled error in request handler — return 500 rather than crashing
        const errorBody: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: rpcId ?? null,
          error: {code: -32603, message: `Gateway internal error: ${err instanceof Error ? err.message : String(err)}`},
        }
        res.writeHead(500, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(errorBody))

        log({
          ts: new Date().toISOString(),
          action: 'block',
          method: rpcMethod,
          latencyMs: Date.now() - start,
          reason: `internal error: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    })

    server.listen(port, () => {
      console.log('')
      console.log(chalk.bold.white('VOUQIS') + chalk.hex('#475569')(' ── gateway ── ') + blue(target))
      console.log(SEP)
      console.log('')
      console.log(`  Listening on   ${chalk.bold.white(`http://localhost:${port}`)}`)
      console.log(`  Proxying to    ${blue(target)}`)
      console.log(`  Timeout        ${chalk.white(String(timeoutMs))}ms`)
      console.log(`  Sanitize       ${sanitize ? chalk.green('enabled') : chalk.dim('disabled')}`)
      console.log('')
      console.log(chalk.dim('  Actions are logged to stderr as structured JSON.'))
      console.log(chalk.dim('  Point your agent at http://localhost:' + port + ' instead of the real server.'))
      console.log('')
      console.log(SEP)
      console.log('')
    })

    await new Promise<void>((resolve) => {
      process.on('SIGINT', () => {
        console.log('\n' + chalk.dim('  Gateway stopped.'))
        server.close()
        resolve()
      })
      process.on('SIGTERM', () => {
        server.close()
        resolve()
      })
    })
  }
}
