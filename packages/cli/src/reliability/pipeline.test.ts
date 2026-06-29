import {describe, it, expect} from 'vitest'
import {evaluateReliability, type EventContext} from './pipeline.js'

const ctx: EventContext = {
  timestamp: '2026-01-01T12:00:00.000Z',
  upstream: 'https://example.com',
  server_id: 'example.com',
  method: 'tools/call',
  tool: 'search',
  requestId: 1,
  attempt: 1,
  latency_ms: 42,
}

describe('evaluateReliability', () => {
  it('returns no failure for allow', () => {
    const result = evaluateReliability(ctx, {decision: 'allow'})
    expect(result.failure).toBeUndefined()
    expect(result.policy.decision).toBe('allow')
  })

  it('classifies transport errors via the error field', () => {
    const err = Object.assign(new Error('timed out'), {name: 'TimeoutError'})
    const result = evaluateReliability(ctx, {decision: 'block', error: err})
    expect(result.failure?.class).toBe('timeout')
  })

  it('classifies protocol failures from the reason string', () => {
    const result = evaluateReliability(ctx, {decision: 'block', reason: 'jsonrpc must be "2.0"'})
    expect(result.failure?.class).toBe('invalid_jsonrpc')
  })

  it('classifies runtime failures from status code', () => {
    const result = evaluateReliability(ctx, {decision: 'block', statusCode: 502, reason: 'bad gateway'})
    expect(result.failure?.class).toBe('upstream_error')
  })

  it('error takes precedence over statusCode for classification', () => {
    const err = Object.assign(new Error('connection refused'), {name: 'Error'})
    const result = evaluateReliability(ctx, {decision: 'block', error: err, statusCode: 503})
    expect(result.failure?.class).toBe('transport_error')
  })

  it('produces no failure for rewrite (schema normalisation is not a failure)', () => {
    const result = evaluateReliability(ctx, {decision: 'rewrite', reason: 'content item(s) missing type field'})
    expect(result.failure?.class).toBe('schema_violation')
  })

  it('builds the event from context and outcome', () => {
    const result = evaluateReliability(ctx, {decision: 'block', reason: 'rate limit exceeded'})
    expect(result.event.decision).toBe('block')
    expect(result.event.reason).toBe('rate limit exceeded')
    expect(result.event.method).toBe('tools/call')
    expect(result.event.latency_ms).toBe(42)
  })

  it('event carries all context fields', () => {
    const result = evaluateReliability(ctx, {decision: 'allow'})
    expect(result.event).toMatchObject({
      timestamp: ctx.timestamp,
      upstream: ctx.upstream,
      server_id: ctx.server_id,
      method: ctx.method,
      attempt: ctx.attempt,
    })
  })

  it('sets failureClass on the event for classified failures', () => {
    const result = evaluateReliability(ctx, {decision: 'block', reason: 'jsonrpc must be "2.0"'})
    expect(result.event.failureClass).toBe('invalid_jsonrpc')
  })

  it('sets failureClass from transport error', () => {
    const err = Object.assign(new Error('timed out'), {name: 'TimeoutError'})
    const result = evaluateReliability(ctx, {decision: 'block', error: err})
    expect(result.event.failureClass).toBe('timeout')
  })

  it('leaves failureClass undefined for allow', () => {
    const result = evaluateReliability(ctx, {decision: 'allow'})
    expect(result.event.failureClass).toBeUndefined()
  })

  it('policy decision matches outcome decision', () => {
    for (const decision of ['allow', 'block', 'retry', 'rewrite'] as const) {
      expect(evaluateReliability(ctx, {decision}).policy.decision).toBe(decision)
    }
  })
})
