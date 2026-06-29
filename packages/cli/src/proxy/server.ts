import * as http from 'node:http'
import type {ProxyConfig, UpstreamConfig} from './config.js'
import {validateRequest} from '../protocol/validators/jsonrpc-validator.js'
import {validateResponse} from '../protocol/validators/mcp-validator.js'
import {buildRateLimiter, TokenBucket} from './ratelimit.js'
import {ReliabilityLogger} from '../reliability/events.js'
import {evaluateReliability, type EvaluationOutcome, type EventContext} from '../reliability/pipeline.js'
import type {JsonRpcRequest} from '../protocol/jsonrpc.js'
import {IDEMPOTENT_METHODS} from '../protocol/mcp.js'
import {distinctId, posthog} from '../analytics.js'
import {forwardWithRetry} from './retry.js'
import {forwardGetToUpstream, upstreamResponseHeaders} from './forwarder.js'
import {pipeStream} from './stream.js'

// Baseline security headers applied to every response from this gateway.
// HSTS/CSP are omitted intentionally — this is a local HTTP JSON-RPC proxy, not a TLS web app.
const SEC = {
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const

async function readBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

function errorResponse(id: string | number | null | undefined, code: number, message: string): string {
  return JSON.stringify({jsonrpc: '2.0', id: id ?? null, error: {code, message}})
}

export function createProxyServer(config: ProxyConfig, logger: ReliabilityLogger): http.Server {
  const upstream = config.upstreams[0] // MVP: single upstream
  const bucket: TokenBucket | null = buildRateLimiter(upstream.rate_limit_rps)
  const serverId = new URL(upstream.url).hostname

  const server = http.createServer(async (req, res) => {
    const start = Date.now()
    let rpcMethod = 'unknown'
    let rpcTool: string | undefined
    let rpcId: string | number | null | undefined
    let attempts = 1

    const emit = (outcome: EvaluationOutcome) => {
      const ctx: EventContext = {
        timestamp: new Date().toISOString(),
        upstream: upstream.url,
        server_id: serverId,
        method: rpcMethod,
        tool: rpcTool,
        requestId: rpcId,
        attempt: attempts,
        latency_ms: Date.now() - start,
      }
      const {event, policy} = evaluateReliability(ctx, outcome)
      logger.log(event)
      const {decision, reason} = policy
      if (decision === 'allow') {
        posthog.capture({
          distinctId,
          event: 'request_allowed',
          properties: {method: rpcMethod, tool: rpcTool, latency_ms: ctx.latency_ms, attempt: attempts, upstream: serverId},
        })
      } else if (decision === 'block') {
        posthog.capture({
          distinctId,
          event: 'request_blocked',
          properties: {method: rpcMethod, tool: rpcTool, latency_ms: ctx.latency_ms, reason, upstream: serverId},
        })
      } else if (decision === 'retry') {
        posthog.capture({
          distinctId,
          event: 'request_retried',
          properties: {method: rpcMethod, tool: rpcTool, attempt: attempts, reason, upstream: serverId},
        })
      } else if (decision === 'rewrite') {
        posthog.capture({
          distinctId,
          event: 'response_rewritten',
          properties: {method: rpcMethod, tool: rpcTool, reason, upstream: serverId},
        })
      }
    }

    const sendBlock = (code: number, message: string, error?: Error) => {
      emit({decision: 'block', reason: message, error})
      res.writeHead(200, {...SEC, 'Content-Type': 'application/json'})
      res.end(errorResponse(rpcId, code, message))
    }

    // OPTIONS — CORS preflight (browser-based MCP clients)
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Mcp-Session-Id, X-Api-Key',
        'Access-Control-Max-Age': '86400',
        'X-Content-Type-Options': 'nosniff',
      })
      res.end()
      return
    }

    // Health check — responds without forwarding to upstream
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, {...SEC, 'Content-Type': 'application/json'})
      res.end(JSON.stringify({ok: true}))
      return
    }

    // GET — SSE stream passthrough (MCP Streamable HTTP transport)
    if (req.method === 'GET') {
      const fwdHeaders: Record<string, string> = {}
      for (const [k, v] of Object.entries(req.headers)) {
        if (k.toLowerCase() === 'host') continue
        fwdHeaders[k] = Array.isArray(v) ? v.join(', ') : (v ?? '')
      }
      try {
        const sseRes = await forwardGetToUpstream(upstream, fwdHeaders)
        const ct = sseRes.headers.get('content-type') ?? 'text/event-stream'
        res.writeHead(sseRes.status, {
          ...upstreamResponseHeaders(sseRes),
          ...SEC,
          'Cache-Control': 'no-cache',  // streaming — override no-store
          'Content-Type': ct,
          'Connection': 'keep-alive',
        })
        await pipeStream(sseRes.body, res)
      } catch (err) {
        res.writeHead(502, {...SEC, 'Content-Type': 'application/json'})
        res.end(errorResponse(null, -32603, `Gateway: upstream unreachable — ${err instanceof Error ? err.message : String(err)}`))
      }
      return
    }

    // Non-POST methods → clean rejection
    if (req.method !== 'POST') {
      res.writeHead(405, {...SEC, 'Content-Type': 'application/json'})
      res.end(errorResponse(null, -32600, `Gateway: HTTP ${req.method ?? 'unknown'} not allowed — MCP requests must be POST`))
      return
    }

    try {
      const rawBody = await readBody(req)

      // Empty body check
      if (rawBody.length === 0) {
        sendBlock(-32700, 'Gateway: POST body is empty — expected JSON-RPC request')
        return
      }

      // Parse JSON-RPC envelope
      let parsedBody: unknown
      try {
        parsedBody = JSON.parse(rawBody.toString())
      } catch {
        sendBlock(-32700, 'Gateway: request body is not valid JSON')
        return
      }

      // Must be an object (not null, array, string, etc.) before we touch properties
      if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
        sendBlock(-32600, 'Gateway: request body is not a JSON object')
        return
      }

      const r = parsedBody as JsonRpcRequest
      rpcMethod = (r.method as string) ?? 'unknown'
      rpcId = r.id
      if (rpcMethod === 'tools/call') {
        const p = r.params as Record<string, unknown> | null | undefined
        if (p && typeof p['name'] === 'string') rpcTool = p['name']
      }

      // Validate request
      const reqValidation = validateRequest(parsedBody, upstream.policies.max_request_size_kb, rawBody.length)
      if (reqValidation) {
        sendBlock(-32600, `Gateway: ${reqValidation.reason}`)
        return
      }

      // Rate limiting
      if (bucket && !bucket.consume()) {
        sendBlock(-32000, `Gateway: rate limit exceeded (${upstream.rate_limit_rps} req/s)`)
        return
      }

      // Build forward headers (strip Host, set content-type and accept)
      const forwardHeaders: Record<string, string> = {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream',
      }
      for (const [k, v] of Object.entries(req.headers)) {
        if (k.toLowerCase() === 'host') continue
        forwardHeaders[k] = Array.isArray(v) ? v.join(', ') : (v ?? '')
      }

      // Forward to upstream with retry on timeout
      let upstreamRes: Response
      try {
        upstreamRes = await forwardWithRetry({
          upstream,
          headers: forwardHeaders,
          rawBody,
          retryAllowed: IDEMPOTENT_METHODS.has(rpcMethod),
          onRetry(event) {
            emit({decision: 'retry', reason: `timeout on attempt ${event.attempt} — retrying in ${event.delayMs}ms`})
            attempts = event.attempt + 1
          },
        })
      } catch (err) {
        const error = err instanceof Error ? err : undefined
        const isTimeout = error?.name === 'TimeoutError'
        sendBlock(
          isTimeout ? -32000 : -32603,
          isTimeout
            ? `Gateway: upstream timed out after ${upstream.timeout_ms}ms (${upstream.retry + 1} attempt(s))`
            : `Gateway: upstream unreachable — ${error?.message ?? String(err)}`,
          error,
        )
        return
      }

      const contentType = upstreamRes.headers.get('content-type') ?? ''

      // SSE streams: pipe through without buffering
      if (contentType.includes('text/event-stream')) {
        res.writeHead(upstreamRes.status, {
          ...upstreamResponseHeaders(upstreamRes),
          ...SEC,
          'Cache-Control': 'no-cache',  // streaming — override no-store
          'Content-Type': contentType,
          'Connection': 'keep-alive',
        })
        await pipeStream(upstreamRes.body, res)
        emit({decision: 'allow'})
        return
      }

      // Buffer and validate JSON response
      const responseText = await upstreamRes.text()
      let parsedResponse: unknown
      try {
        parsedResponse = JSON.parse(responseText)
      } catch {
        sendBlock(-32603, `Gateway: upstream returned non-JSON response (${upstreamRes.status} ${contentType || 'unknown'})`)
        return
      }

      // Response validation + policy
      const resPolicy = validateResponse(
        parsedResponse,
        rpcMethod,
        upstream.policies.block_null_result,
        upstream.policies.sanitize_schema,
      )

      if (resPolicy) {
        if (resPolicy.decision === 'block') {
          sendBlock(-32000, `Gateway: ${resPolicy.reason}`)
          return
        }
        if (resPolicy.decision === 'rewrite' && resPolicy.body) {
          const rewritten = JSON.stringify(resPolicy.body)
          emit({decision: 'rewrite', reason: resPolicy.reason})
          res.writeHead(upstreamRes.status, {
            ...upstreamResponseHeaders(upstreamRes),
            ...SEC,
            'Content-Type': 'application/json',
            'Content-Length': String(Buffer.byteLength(rewritten)),
          })
          res.end(rewritten)
          return
        }
      }

      emit({decision: 'allow'})
      const outBuf = Buffer.from(responseText)
      res.writeHead(upstreamRes.status, {
        ...upstreamResponseHeaders(upstreamRes),
        ...SEC,
        'Content-Type': 'application/json',
        'Content-Length': String(outBuf.byteLength),
      })
      res.end(outBuf)
    } catch (err) {
      const error = err instanceof Error ? err : undefined
      posthog.captureException(err, distinctId, {method: rpcMethod, tool: rpcTool, upstream: serverId})
      sendBlock(-32603, `Gateway internal error: ${error?.message ?? String(err)}`, error)
    }
  })

  return server
}

export function startServer(server: http.Server, listen: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [host, portStr] = listen.includes(':')
      ? [listen.slice(0, listen.lastIndexOf(':')), listen.slice(listen.lastIndexOf(':') + 1)]
      : ['127.0.0.1', listen]
    const port = parseInt(portStr, 10)
    server.once('error', reject)
    server.listen(port, host, () => resolve())
  })
}
