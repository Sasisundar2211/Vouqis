import type {Failure} from './failure.js'

export type FailureSource =
  | {kind: 'protocol'; reason: string}
  | {kind: 'transport'; error: Error}
  | {kind: 'runtime'; statusCode: number; reason: string}

export function classify(source: FailureSource): Failure {
  switch (source.kind) {
    case 'protocol':  return classifyProtocol(source.reason)
    case 'transport': return classifyTransport(source.error)
    case 'runtime':   return classifyRuntime(source.statusCode, source.reason)
  }
}

function classifyProtocol(reason: string): Failure {
  if (reason.includes('not valid JSON') || reason.includes('body is empty')) {
    return {class: 'invalid_json', reason}
  }
  if (reason.includes('jsonrpc') || reason.includes('method') || reason.includes('id must be')) {
    return {class: 'invalid_jsonrpc', reason}
  }
  return {class: 'schema_violation', reason}
}

function classifyTransport(error: Error): Failure {
  if (error.name === 'TimeoutError') return {class: 'timeout', reason: error.message}
  return {class: 'transport_error', reason: error.message}
}

function classifyRuntime(statusCode: number, reason: string): Failure {
  if (statusCode >= 400) return {class: 'upstream_error', reason}
  return {class: 'unknown', reason}
}
