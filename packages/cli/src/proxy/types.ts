import type {JsonRpcResponse} from '../protocol/jsonrpc.js'

// Gateway/application types. Protocol types live in src/protocol/.
// These will migrate to src/reliability/ when that layer is introduced.

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
