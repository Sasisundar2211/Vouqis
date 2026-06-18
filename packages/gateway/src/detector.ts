import type { FailureReport, JsonRpcResponse } from './types.js'

/**
 * Inspect a JSON-RPC response for the three silent failure classes.
 * Returns a FailureReport if one is found, null if the response is clean.
 */
export function detect(tool: string, method: string, response: JsonRpcResponse): FailureReport | null {
  // Check 1 — Null Response
  if (response.result === null || response.result === undefined) {
    return {
      type: 'null_response',
      tool,
      severity: 'HIGH',
      detail: `${method} returned null or missing result`,
    }
  }

  // Check 2 — Schema Violation: JSON-RPC 2.0 envelope
  if (!response.jsonrpc || response.jsonrpc !== '2.0') {
    return {
      type: 'schema_violation',
      tool,
      severity: 'HIGH',
      detail: `jsonrpc must be "2.0" — got ${JSON.stringify(response.jsonrpc ?? null)}`,
    }
  }

  // Check 2 — Schema Violation: MCP tools/call content shape
  if (method === 'tools/call') {
    const result = response.result as Record<string, unknown>
    const content = result['content']
    if (!Array.isArray(content) || content.length === 0) {
      return {
        type: 'schema_violation',
        tool,
        severity: 'HIGH',
        detail: 'result.content is missing, empty, or not an array',
      }
    }
  }

  return null
}
