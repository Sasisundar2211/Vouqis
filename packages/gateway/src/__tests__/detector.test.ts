import { describe, it, expect } from 'vitest'
import { detect } from '../detector.js'
import type { JsonRpcResponse } from '../types.js'

describe('detector', () => {
  describe('detect', () => {
    it('returns null for a clean tools/call response', () => {
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: { content: [{ type: 'text', text: 'ok' }] },
      }
      expect(detect('create_invoice', 'tools/call', response)).toBeNull()
    })

    it('returns null for a clean tools/list response', () => {
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: { tools: [] },
      }
      expect(detect('tools/list', 'tools/list', response)).toBeNull()
    })

    it('detects null result', () => {
      const response: JsonRpcResponse = { jsonrpc: '2.0', id: 1, result: null }
      const failure = detect('create_invoice', 'tools/call', response)
      expect(failure?.type).toBe('null_response')
      expect(failure?.severity).toBe('HIGH')
      expect(failure?.tool).toBe('create_invoice')
    })

    it('detects undefined result', () => {
      const response: JsonRpcResponse = { jsonrpc: '2.0', id: 1 }
      const failure = detect('ping', 'ping', response)
      expect(failure?.type).toBe('null_response')
    })

    it('detects missing jsonrpc field', () => {
      const response: JsonRpcResponse = { id: 1, result: { content: [{ type: 'text', text: 'ok' }] } }
      const failure = detect('list_tools', 'tools/list', response)
      expect(failure?.type).toBe('schema_violation')
      expect(failure?.detail).toContain('"2.0"')
    })

    it('detects wrong jsonrpc version', () => {
      const response: JsonRpcResponse = {
        jsonrpc: '1.0',
        id: 1,
        result: { content: [{ type: 'text', text: 'ok' }] },
      }
      const failure = detect('list_tools', 'tools/list', response)
      expect(failure?.type).toBe('schema_violation')
      expect(failure?.detail).toContain('"1.0"')
    })

    it('detects missing content on tools/call', () => {
      const response: JsonRpcResponse = { jsonrpc: '2.0', id: 1, result: {} }
      const failure = detect('create_invoice', 'tools/call', response)
      expect(failure?.type).toBe('schema_violation')
      expect(failure?.detail).toContain('content')
    })

    it('detects empty content array on tools/call', () => {
      const response: JsonRpcResponse = { jsonrpc: '2.0', id: 1, result: { content: [] } }
      const failure = detect('create_invoice', 'tools/call', response)
      expect(failure?.type).toBe('schema_violation')
    })

    it('does not check content shape for non-tools/call methods', () => {
      const response: JsonRpcResponse = { jsonrpc: '2.0', id: 1, result: {} }
      expect(detect('tools/list', 'tools/list', response)).toBeNull()
    })
  })
})
