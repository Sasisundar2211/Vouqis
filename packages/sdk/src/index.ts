import {randomUUID} from 'node:crypto'

export interface VouqisSDKOptions {
  projectId: string
  apiKey?: string
  dashboardUrl?: string
  // Retry policy for failed tool calls
  retries?: number
  retryDelayMs?: number
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
  attempt: number
}

interface HasCallTool {
  callTool(toolName: string, params: Record<string, unknown>): Promise<unknown>
}

async function uploadTrace(
  trace: TraceRecord,
  dashboardUrl: string,
  apiKey: string,
): Promise<void> {
  await fetch(`${dashboardUrl}/api/traces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vouqis-Api-Key': apiKey,
    },
    body: JSON.stringify(trace),
    signal: AbortSignal.timeout(3000),
  })
}

export class VouqisSDK {
  private readonly projectId: string
  private readonly apiKey: string | undefined
  private readonly dashboardUrl: string
  private readonly retries: number
  private readonly retryDelayMs: number

  constructor(options: VouqisSDKOptions) {
    this.projectId = options.projectId
    this.apiKey = options.apiKey ?? process.env['VOUQIS_API_KEY']
    this.dashboardUrl = options.dashboardUrl ?? 'https://vouqis.tech'
    this.retries = options.retries ?? 0
    this.retryDelayMs = options.retryDelayMs ?? 300
  }

  wrap<T extends HasCallTool>(client: T): T {
    const sdk = this

    return new Proxy(client, {
      get(target, prop, receiver) {
        if (prop !== 'callTool') {
          return Reflect.get(target, prop, receiver)
        }

        return async function wrappedCallTool(
          toolName: string,
          params: Record<string, unknown>,
        ): Promise<unknown> {
          let attempt = 0
          const maxAttempts = sdk.retries + 1

          for (;;) {
            attempt++
            const startTime = Date.now()
            let response: unknown = null
            let error: string | null = null

            try {
              response = await target.callTool(toolName, params)
              return response
            } catch (err) {
              error = err instanceof Error ? err.message : String(err)
              if (attempt < maxAttempts) {
                await new Promise((r) => setTimeout(r, sdk.retryDelayMs * attempt))
                continue
              }
              throw err
            } finally {
              const trace: TraceRecord = {
                traceId: randomUUID(),
                projectId: sdk.projectId,
                timestamp: new Date().toISOString(),
                toolName,
                params,
                response,
                latencyMs: Date.now() - startTime,
                error,
                attempt,
              }

              if (sdk.apiKey) {
                // Fire-and-forget upload — never block the caller
                uploadTrace(trace, sdk.dashboardUrl, sdk.apiKey).catch(() => {
                  // swallow silently; tracing must never affect agent behaviour
                })
              } else {
                // No API key: write to stdout so the developer can see what's happening
                console.log(JSON.stringify(trace))
              }
            }
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
        `Run \`vouqis audit ${serverUrl}\` for the full report.`,
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
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

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
