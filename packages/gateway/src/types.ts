export type FailureType = 'null_response' | 'schema_violation' | 'timeout'
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

export interface FailureReport {
  type: FailureType
  tool: string
  severity: Severity
  detail: string
}

export interface GatewayOptions {
  upstream: string
  timeoutMs?: number
}

export interface JsonRpcResponse {
  jsonrpc?: string
  id?: string | number | null
  result?: unknown
  error?: {
    code?: number
    message?: string
    data?: unknown
  }
}
