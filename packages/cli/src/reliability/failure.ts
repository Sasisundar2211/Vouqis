export type FailureClass =
  | 'invalid_json'
  | 'invalid_jsonrpc'
  | 'schema_violation'
  | 'timeout'
  | 'transport_error'
  | 'upstream_error'
  | 'unknown'

export interface Failure {
  class: FailureClass
  reason: string
}
