import {describe, it, expect} from 'vitest'
import {classify} from './classify.js'

describe('classify', () => {
  describe('classifyProtocol', () => {
    it('maps JSON parse failure to invalid_json', () => {
      expect(classify({kind: 'protocol', reason: 'request body is not valid JSON'}).class).toBe('invalid_json')
    })

    it('maps empty body to invalid_json', () => {
      expect(classify({kind: 'protocol', reason: 'POST body is empty — expected JSON-RPC request'}).class).toBe('invalid_json')
    })

    it('maps jsonrpc version mismatch to invalid_jsonrpc', () => {
      expect(classify({kind: 'protocol', reason: 'jsonrpc must be "2.0" — got "1.0"'}).class).toBe('invalid_jsonrpc')
    })

    it('maps missing method to invalid_jsonrpc', () => {
      expect(classify({kind: 'protocol', reason: 'method is missing or not a string'}).class).toBe('invalid_jsonrpc')
    })

    it('maps bad id type to invalid_jsonrpc', () => {
      expect(classify({kind: 'protocol', reason: 'id must be string, number, or null — got object'}).class).toBe('invalid_jsonrpc')
    })

    it('maps null tools/call result to schema_violation', () => {
      expect(classify({kind: 'protocol', reason: 'tools/call result is null or missing'}).class).toBe('schema_violation')
    })

    it('maps missing content array to schema_violation', () => {
      expect(classify({kind: 'protocol', reason: 'tools/call content is empty or not an array'}).class).toBe('schema_violation')
    })
  })

  describe('classifyTransport', () => {
    it('maps TimeoutError to timeout', () => {
      const err = Object.assign(new Error('upstream timed out'), {name: 'TimeoutError'})
      expect(classify({kind: 'transport', error: err}).class).toBe('timeout')
    })

    it('maps connection error to transport_error', () => {
      expect(classify({kind: 'transport', error: new Error('ECONNREFUSED')}).class).toBe('transport_error')
    })
  })

  describe('classifyRuntime', () => {
    it('maps 4xx upstream response to upstream_error', () => {
      expect(classify({kind: 'runtime', statusCode: 404, reason: 'not found'}).class).toBe('upstream_error')
    })

    it('maps 5xx upstream response to upstream_error', () => {
      expect(classify({kind: 'runtime', statusCode: 502, reason: 'bad gateway'}).class).toBe('upstream_error')
    })

    it('maps unrecognised 2xx to unknown', () => {
      expect(classify({kind: 'runtime', statusCode: 200, reason: 'unexpected state'}).class).toBe('unknown')
    })
  })

  it('preserves the reason string on every path', () => {
    const reason = 'method is missing or not a string'
    expect(classify({kind: 'protocol', reason}).reason).toBe(reason)

    const err = new Error('connection refused')
    expect(classify({kind: 'transport', error: err}).reason).toBe(err.message)

    expect(classify({kind: 'runtime', statusCode: 503, reason: 'service unavailable'}).reason).toBe('service unavailable')
  })

  it('is deterministic — same input always produces the same output', () => {
    const source = {kind: 'protocol' as const, reason: 'jsonrpc must be "2.0"'}
    const a = classify(source)
    const b = classify(source)
    expect(a).toEqual(b)
  })
})
