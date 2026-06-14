import {describe, it, expect, vi, beforeEach} from 'vitest'
import type {AuditEvent} from './types.js'

const mockWrite = vi.fn()
const mockEnd = vi.fn()

vi.mock('node:fs', () => ({
  default: {},
  createWriteStream: vi.fn(() => ({write: mockWrite, end: mockEnd})),
}))

// chalk strips ANSI in test env, but we only care about structure
vi.mock('chalk', () => {
  const tag = (s: string) => s
  const proxy = new Proxy(tag, {
    get: () => proxy,
  })
  return {default: proxy}
})

function makeEvent(overrides: Partial<AuditEvent> = {}): AuditEvent {
  return {
    timestamp: '2026-01-01T12:00:00.000Z',
    upstream: 'https://example.com',
    server_id: 'example.com',
    method: 'tools/call',
    tool: 'search',
    requestId: 1,
    decision: 'allow',
    latency_ms: 42,
    attempt: 1,
    ...overrides,
  }
}

describe('AuditLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes a JSON line for each logged event', async () => {
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    const event = makeEvent()
    logger.log(event)
    expect(mockWrite).toHaveBeenCalledWith(JSON.stringify(event) + '\n')
  })

  it('calls stream.end() when closed', async () => {
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    logger.close()
    expect(mockEnd).toHaveBeenCalled()
  })

  it('writes to stderr for each event', async () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    logger.log(makeEvent())
    expect(stderrSpy).toHaveBeenCalledOnce()
    stderrSpy.mockRestore()
  })

  it('includes the tool name in the stderr line', async () => {
    let output = ''
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
      output += String(s)
      return true
    })
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    logger.log(makeEvent({tool: 'my_special_tool'}))
    expect(output).toContain('my_special_tool')
    stderrSpy.mockRestore()
  })

  it('includes the block reason in the stderr line', async () => {
    let output = ''
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
      output += String(s)
      return true
    })
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    logger.log(makeEvent({decision: 'block', reason: 'null result detected'}))
    expect(output).toContain('null result detected')
    stderrSpy.mockRestore()
  })

  it('logs multiple events independently', async () => {
    const {AuditLogger} = await import('./audit.js')
    const logger = new AuditLogger('./test.log')
    const e1 = makeEvent({tool: 'tool_a'})
    const e2 = makeEvent({tool: 'tool_b', decision: 'block'})
    logger.log(e1)
    logger.log(e2)
    expect(mockWrite).toHaveBeenCalledTimes(2)
    expect(mockWrite).toHaveBeenNthCalledWith(1, JSON.stringify(e1) + '\n')
    expect(mockWrite).toHaveBeenNthCalledWith(2, JSON.stringify(e2) + '\n')
  })
})
