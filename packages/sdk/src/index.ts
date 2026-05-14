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
