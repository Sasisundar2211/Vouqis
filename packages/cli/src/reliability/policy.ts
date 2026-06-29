import type {JsonRpcResponse} from '../protocol/jsonrpc.js'

export type PolicyDecision = 'allow' | 'block' | 'retry' | 'rewrite'

export interface PolicyResult {
  decision: PolicyDecision
  reason?: string
  body?: JsonRpcResponse
}
