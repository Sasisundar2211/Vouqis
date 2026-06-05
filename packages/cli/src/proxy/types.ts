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
  timestamp: string
  upstream: string
  server_id: string      // hostname only — safe for cross-deployment aggregation
  method: string
  tool?: string          // populated for tools/call — the tool name from params.name
  requestId?: string | number | null
  decision: PolicyDecision
  latency_ms: number
  reason?: string
  attempt: number
}
