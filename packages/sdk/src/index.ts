import {randomUUID} from 'node:crypto'

export interface VouqisSDKOptions {
  projectId: string
}

export interface TraceRecord {
  traceId: string
  projectId: string
  timestamp: string
  toolName: string
  params: Record<string, unknown>
  response: unknown
  latencyMs: number
  error: string | null
}

interface HasCallTool {
  callTool(toolName: string, params: Record<string, unknown>): Promise<unknown>
}

export class VouqisSDK {
  private readonly projectId: string

  constructor(options: VouqisSDKOptions) {
    this.projectId = options.projectId
  }

  wrap<T extends HasCallTool>(client: T): T {
    const projectId = this.projectId

    return new Proxy(client, {
      get(target, prop, receiver) {
        if (prop !== 'callTool') {
          return Reflect.get(target, prop, receiver)
        }

        return async function wrappedCallTool(
          toolName: string,
          params: Record<string, unknown>,
        ): Promise<unknown> {
          const startTime = Date.now()
          let response: unknown = null
          let error: string | null = null

          try {
            response = await target.callTool(toolName, params)
            return response
          } catch (err) {
            error = err instanceof Error ? err.message : String(err)
            throw err
          } finally {
            const trace: TraceRecord = {
              traceId: randomUUID(),
              projectId,
              timestamp: new Date().toISOString(),
              toolName,
              params,
              response,
              latencyMs: Date.now() - startTime,
              error,
            }
            console.log(JSON.stringify(trace))
          }
        }
      },
    }) as T
  }
}

export class TrustGuardError extends Error {
  constructor(
    public readonly serverUrl: string,
    public readonly score: number,
    public readonly minScore: number,
  ) {
    super(
      `TrustGuard blocked: ${serverUrl} scored ${score}/100 (minimum: ${minScore}). ` +
      `Run \`vouqis audit ${serverUrl}\` for the full report.`
    )
    this.name = 'TrustGuardError'
  }
}

export interface TrustGuardOptions {
  minScore: number
  apiKey?: string
  timeoutMs?: number
  onBlock?: (url: string, score: number) => void
}

/**
 * Audit a server's Trust Score before allowing any tool calls.
 * Throws TrustGuardError if the score is below minScore.
 *
 * @example
 * ```ts
 * const client = await withTrustGuard(mcpClient, 'https://mcp.example.com', {
 *   minScore: 80,
 *   onBlock: (url, score) => logger.warn(`Blocked ${url} with score ${score}`)
 * })
 * // client is now safe to use
 * await client.callTool('search', { query: 'hello' })
 * ```
 */
export async function withTrustGuard<T extends HasCallTool>(
  client: T,
  serverUrl: string,
  options: TrustGuardOptions,
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 30_000
  const apiKey = options.apiKey ?? process.env['VOUQIS_API_KEY']

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let score: number

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const res = await fetch('https://vouqis.tech/api/score', {
      method: 'POST',
      headers,
      body: JSON.stringify({url: serverUrl}),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.warn(
        `[vouqis] TrustGuard: score endpoint returned ${res.status} for ${serverUrl} — failing open`,
      )
      return client
    }

    const data = (await res.json()) as {score: number}
    score = data.score
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn(
      `[vouqis] TrustGuard: could not reach score endpoint for ${serverUrl} (${message}) — failing open`,
    )
    return client
  } finally {
    clearTimeout(timer)
  }

  if (score < options.minScore) {
    options.onBlock?.(serverUrl, score)
    throw new TrustGuardError(serverUrl, score, options.minScore)
  }

  return client
}
