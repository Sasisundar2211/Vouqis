export interface JsonRpcRequest {
  jsonrpc?: unknown
  id?: string | number | null
  method?: unknown
  params?: unknown
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcResponse {
  jsonrpc: string
  id?: string | number | null
  result?: unknown
  error?: JsonRpcError
}

export type PolicyDecision = 'allow' | 'block' | 'retry' | 'rewrite'

export interface PolicyResult {
  decision: PolicyDecision
  reason?: string
  body?: JsonRpcResponse
}

export interface AuditEvent {
  ts: string
  upstream: string
  method: string
  requestId?: string | number | null
  decision: PolicyDecision
  latencyMs: number
  reason?: string
  attempt: number
}
