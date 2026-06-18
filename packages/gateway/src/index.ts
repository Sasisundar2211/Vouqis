import type { GatewayOptions, JsonRpcResponse } from './types.js'
import { detect } from './detector.js'
import { report } from './reporter.js'

export type { FailureReport, FailureType, Severity, GatewayOptions } from './types.js'
export { detect } from './detector.js'
export { report } from './reporter.js'

export function createGateway(options: GatewayOptions) {
  const { upstream, timeoutMs = 30_000 } = options

  async function request(method: string, params?: unknown, toolName = method): Promise<JsonRpcResponse> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    let response: JsonRpcResponse

    try {
      const res = await fetch(upstream, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      })
      response = (await res.json()) as JsonRpcResponse
    } catch (err) {
      const timedOut = controller.signal.aborted
      const detail = timedOut
        ? `${method} did not respond within ${timeoutMs}ms`
        : `fetch failed: ${err instanceof Error ? err.message : String(err)}`

      const failure = { type: 'timeout' as const, tool: toolName, severity: 'HIGH' as const, detail }
      report(failure)
      throw err
    } finally {
      clearTimeout(timer)
    }

    const failure = detect(toolName, method, response)
    if (failure) report(failure)

    return response
  }

  return {
    request,
    call(toolName: string, args?: unknown): Promise<JsonRpcResponse> {
      return request('tools/call', { name: toolName, arguments: args }, toolName)
    },
  }
}
