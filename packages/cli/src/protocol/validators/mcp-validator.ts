import type {JsonRpcResponse} from '../jsonrpc.js'
import type {PolicyResult} from '../../reliability/policy.js'

/** Validate an upstream MCP response. Returns a policy result describing what to do. */
export function validateResponse(
  res: unknown,
  method: string,
  blockNull: boolean,
  sanitize: boolean,
): PolicyResult | null {
  if (!res || typeof res !== 'object' || Array.isArray(res)) {
    return {decision: 'block', reason: 'upstream returned a non-object response'}
  }

  const r = res as JsonRpcResponse

  if (r.error) return null // error responses are valid as-is

  if (method !== 'tools/call') return null // only enforce MCP schema on tool calls

  const result = r.result as Record<string, unknown> | null | undefined

  // null/empty result
  if (result == null) {
    if (blockNull) return {decision: 'block', reason: 'tools/call result is null or missing'}
    return null
  }

  if (typeof result !== 'object') {
    if (blockNull) return {decision: 'block', reason: `tools/call result is not an object (got ${typeof result})`}
    return null
  }

  const content = result['content']

  // empty or missing content array
  if (!Array.isArray(content) || content.length === 0) {
    if (blockNull) return {decision: 'block', reason: 'tools/call content is empty or not an array'}
    return null
  }

  // content items missing type field
  if (sanitize) {
    const needsFix = (content as unknown[]).some(
      (item) => !item || typeof item !== 'object' || !(item as Record<string, unknown>)['type'],
    )
    if (needsFix) {
      const fixed: JsonRpcResponse = {
        ...r,
        result: {
          ...result,
          content: normalizeContent(content as unknown[]),
        },
      }
      return {decision: 'rewrite', reason: 'content item(s) missing type field — normalised', body: fixed}
    }
  }

  return null // valid
}

function normalizeContent(content: unknown[]): unknown[] {
  return content.map((item) => {
    if (!item || typeof item !== 'object') return {type: 'text', text: String(item ?? '')}
    const obj = item as Record<string, unknown>
    return obj['type'] ? obj : {...obj, type: 'text'}
  })
}
