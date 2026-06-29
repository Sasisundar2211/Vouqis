// JSON-RPC 2.0 specification — types and constants.
// Nothing in this file is Vouqis-specific. It describes the protocol.

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

export const JSONRPC_VERSION = '2.0'

export const JSONRPC_ERROR = {
  PARSE_ERROR:      -32700,
  INVALID_REQUEST:  -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS:   -32602,
  INTERNAL_ERROR:   -32603,
  SERVER_ERROR:     -32000,
} as const
