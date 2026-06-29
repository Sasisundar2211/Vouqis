import type {JsonRpcRequest} from '../jsonrpc.js'
import type {PolicyResult} from '../../proxy/types.js'

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
