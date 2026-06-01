import type {JsonRpcRequest, JsonRpcResponse, PolicyResult} from './types.js'

const VALID_JSONRPC = '2.0'

/** Validate an incoming JSON-RPC request. Returns a block result on failure. */
export function validateRequest(body: unknown, maxSizeKb: number, rawBodyLen: number): PolicyResult | null {
  if (rawBodyLen > maxSizeKb * 1024) {
    return {
      decision: 'block',
      reason: `request body exceeds ${maxSizeKb} KB limit (got ${(rawBodyLen / 1024).toFixed(1)} KB)`,
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {decision: 'block', reason: 'request body is not a JSON object'}
  }

  const r = body as JsonRpcRequest

  if (r.jsonrpc !== VALID_JSONRPC) {
    return {
      decision: 'block',
      reason: `jsonrpc must be "${VALID_JSONRPC}" — got ${JSON.stringify(r.jsonrpc)}`,
    }
  }

  if (typeof r.method !== 'string' || r.method.trim() === '') {
    return {decision: 'block', reason: 'method is missing or not a string'}
  }

  // id must be string | number | null (per JSON-RPC spec) — undefined is also acceptable (notification)
  if (r.id !== undefined && r.id !== null && typeof r.id !== 'string' && typeof r.id !== 'number') {
    return {decision: 'block', reason: `id must be string, number, or null — got ${typeof r.id}`}
  }

  return null // valid
}

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
          content: (content as unknown[]).map((item) => {
            if (!item || typeof item !== 'object') return {type: 'text', text: String(item ?? '')}
            const obj = item as Record<string, unknown>
            return obj['type'] ? obj : {...obj, type: 'text'}
          }),
        },
      }
      return {decision: 'rewrite', reason: 'content item(s) missing type field — normalised', body: fixed}
    }
  }

  return null // valid
}
