import {describe, it, expect} from 'vitest'
import {validateRequest, validateResponse} from '../src/proxy/validator.js'

describe('validateRequest', () => {
  it('passes a valid JSON-RPC request', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'tools/call', id: 1}, 512, 50)).toBeNull()
  })

  it('blocks oversized body', () => {
    const result = validateRequest({jsonrpc: '2.0', method: 'tools/call'}, 1, 2000)
    expect(result?.decision).toBe('block')
  })

  it('blocks wrong jsonrpc version', () => {
    const result = validateRequest({jsonrpc: '1.0', method: 'tools/call'}, 512, 50)
    expect(result?.decision).toBe('block')
  })

  it('blocks missing method', () => {
    const result = validateRequest({jsonrpc: '2.0'}, 512, 50)
    expect(result?.decision).toBe('block')
  })

  it('blocks non-object body', () => {
    const result = validateRequest('not an object', 512, 20)
    expect(result?.decision).toBe('block')
  })
})

describe('validateResponse', () => {
  it('passes a valid tools/call result', () => {
    const res = {jsonrpc: '2.0', id: 1, result: {content: [{type: 'text', text: 'hello'}]}}
    expect(validateResponse(res, 'tools/call', true, true)).toBeNull()
  })

  it('blocks null result when blockNull is true', () => {
    const res = {jsonrpc: '2.0', id: 1, result: null}
    const r = validateResponse(res, 'tools/call', true, false)
    expect(r?.decision).toBe('block')
  })

  it('passes null result when blockNull is false', () => {
    const res = {jsonrpc: '2.0', id: 1, result: null}
    expect(validateResponse(res, 'tools/call', false, false)).toBeNull()
  })

  it('blocks empty content array', () => {
    const res = {jsonrpc: '2.0', id: 1, result: {content: []}}
    const r = validateResponse(res, 'tools/call', true, false)
    expect(r?.decision).toBe('block')
  })

  it('rewrites content items missing type field', () => {
    const res = {jsonrpc: '2.0', id: 1, result: {content: [{text: 'no type'}]}}
    const r = validateResponse(res, 'tools/call', true, true)
    expect(r?.decision).toBe('rewrite')
    const content = (r?.body?.result as Record<string, unknown>)?.content as {type: string}[]
    expect(content[0].type).toBe('text')
  })

  it('passes non-tools/call methods without checking content', () => {
    const res = {jsonrpc: '2.0', id: 1, result: null}
    expect(validateResponse(res, 'tools/list', true, true)).toBeNull()
  })

  it('passes error responses without inspection', () => {
    const res = {jsonrpc: '2.0', id: 1, error: {code: -32600, message: 'bad'}}
    expect(validateResponse(res, 'tools/call', true, true)).toBeNull()
  })
})
