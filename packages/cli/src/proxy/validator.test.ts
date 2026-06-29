import {describe, it, expect} from 'vitest'
import {validateRequest} from '../protocol/validators/jsonrpc-validator.js'
import {validateResponse} from '../protocol/validators/mcp-validator.js'

describe('validateRequest', () => {
  const valid = {jsonrpc: '2.0', method: 'tools/list', id: 1}
  const MAX = 512
  const LEN = 100

  it('returns null for a valid request', () => {
    expect(validateRequest(valid, MAX, LEN)).toBeNull()
  })

  it('blocks when body size exceeds limit', () => {
    const r = validateRequest(valid, 1, 2000)
    expect(r?.decision).toBe('block')
    expect(r?.reason).toMatch(/exceeds/)
  })

  it('blocks null body', () => {
    expect(validateRequest(null, MAX, LEN)?.decision).toBe('block')
  })

  it('blocks array body', () => {
    expect(validateRequest([], MAX, LEN)?.decision).toBe('block')
  })

  it('blocks non-"2.0" jsonrpc version', () => {
    const r = validateRequest({...valid, jsonrpc: '1.0'}, MAX, LEN)
    expect(r?.decision).toBe('block')
    expect(r?.reason).toMatch(/jsonrpc must be/)
  })

  it('blocks missing jsonrpc field', () => {
    const {jsonrpc: _, ...noVersion} = valid
    expect(validateRequest(noVersion, MAX, LEN)?.decision).toBe('block')
  })

  it('blocks missing method', () => {
    const r = validateRequest({jsonrpc: '2.0', id: 1}, MAX, LEN)
    expect(r?.decision).toBe('block')
    expect(r?.reason).toMatch(/method is missing/)
  })

  it('blocks whitespace-only method', () => {
    expect(validateRequest({jsonrpc: '2.0', method: '   ', id: 1}, MAX, LEN)?.decision).toBe('block')
  })

  it('blocks boolean id', () => {
    const r = validateRequest({jsonrpc: '2.0', method: 'ping', id: true}, MAX, LEN)
    expect(r?.decision).toBe('block')
    expect(r?.reason).toMatch(/id must be/)
  })

  it('blocks object id', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'ping', id: {}}, MAX, LEN)?.decision).toBe('block')
  })

  it('allows null id', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'ping', id: null}, MAX, LEN)).toBeNull()
  })

  it('allows string id', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'ping', id: 'req-1'}, MAX, LEN)).toBeNull()
  })

  it('allows numeric id', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'ping', id: 42}, MAX, LEN)).toBeNull()
  })

  it('allows missing id (notification)', () => {
    expect(validateRequest({jsonrpc: '2.0', method: 'ping'}, MAX, LEN)).toBeNull()
  })
})

describe('validateResponse', () => {
  const base = {jsonrpc: '2.0', id: 1}

  it('blocks non-object response', () => {
    expect(validateResponse('nope', 'tools/call', true, true)?.decision).toBe('block')
  })

  it('blocks array response', () => {
    expect(validateResponse([], 'tools/call', true, true)?.decision).toBe('block')
  })

  it('blocks null response', () => {
    expect(validateResponse(null, 'tools/call', true, true)?.decision).toBe('block')
  })

  it('passes through error responses as-is', () => {
    const res = {...base, error: {code: -32600, message: 'bad'}}
    expect(validateResponse(res, 'tools/call', true, true)).toBeNull()
  })

  it('passes through non-tools/call methods without inspecting result', () => {
    expect(validateResponse({...base, result: null}, 'tools/list', true, true)).toBeNull()
    expect(validateResponse({...base, result: null}, 'initialize', true, true)).toBeNull()
  })

  describe('tools/call — null result', () => {
    it('blocks null result when blockNull=true', () => {
      const r = validateResponse({...base, result: null}, 'tools/call', true, false)
      expect(r?.decision).toBe('block')
      expect(r?.reason).toMatch(/null or missing/)
    })

    it('allows null result when blockNull=false', () => {
      expect(validateResponse({...base, result: null}, 'tools/call', false, false)).toBeNull()
    })

    it('blocks non-object result when blockNull=true', () => {
      const r = validateResponse({...base, result: 42}, 'tools/call', true, false)
      expect(r?.decision).toBe('block')
      expect(r?.reason).toMatch(/not an object/)
    })

    it('allows non-object result when blockNull=false', () => {
      expect(validateResponse({...base, result: 42}, 'tools/call', false, false)).toBeNull()
    })
  })

  describe('tools/call — empty content', () => {
    it('blocks empty content array when blockNull=true', () => {
      const r = validateResponse({...base, result: {content: []}}, 'tools/call', true, false)
      expect(r?.decision).toBe('block')
      expect(r?.reason).toMatch(/empty/)
    })

    it('blocks missing content when blockNull=true', () => {
      expect(validateResponse({...base, result: {}}, 'tools/call', true, false)?.decision).toBe('block')
    })

    it('allows empty content when blockNull=false', () => {
      expect(validateResponse({...base, result: {content: []}}, 'tools/call', false, false)).toBeNull()
    })
  })

  describe('tools/call — sanitize', () => {
    it('rewrites content items missing type field when sanitize=true', () => {
      const res = {...base, result: {content: [{text: 'hello'}]}}
      const r = validateResponse(res, 'tools/call', true, true)
      expect(r?.decision).toBe('rewrite')
      const content = (r?.body?.result as Record<string, unknown[]>)?.content
      expect((content[0] as Record<string, unknown>)['type']).toBe('text')
    })

    it('preserves existing type field when sanitizing', () => {
      const res = {...base, result: {content: [{type: 'image', url: 'x'}]}}
      expect(validateResponse(res, 'tools/call', true, true)).toBeNull()
    })

    it('skips sanitize when sanitize=false', () => {
      const res = {...base, result: {content: [{text: 'hello'}]}}
      expect(validateResponse(res, 'tools/call', true, false)).toBeNull()
    })

    it('converts non-object content items to {type: text, text: ...}', () => {
      const res = {...base, result: {content: ['bare string']}}
      const r = validateResponse(res, 'tools/call', true, true)
      expect(r?.decision).toBe('rewrite')
      const content = (r?.body?.result as Record<string, unknown[]>)?.content
      expect((content[0] as Record<string, unknown>)['type']).toBe('text')
      expect((content[0] as Record<string, unknown>)['text']).toBe('bare string')
    })

    it('returns null for fully valid response', () => {
      const res = {...base, result: {content: [{type: 'text', text: 'ok'}]}}
      expect(validateResponse(res, 'tools/call', true, true)).toBeNull()
    })
  })
})
