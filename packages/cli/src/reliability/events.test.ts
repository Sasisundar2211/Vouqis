import {describe, it, expect, vi, beforeEach} from 'vitest'
import type {ReliabilityEvent} from './events.js'

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

function makeEvent(overrides: Partial<ReliabilityEvent> = {}): ReliabilityEvent {
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

describe('ReliabilityLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes a JSON line for each logged event', async () => {
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
    const event = makeEvent()
    logger.log(event)
    expect(mockWrite).toHaveBeenCalledWith(JSON.stringify(event) + '\n')
  })

  it('calls stream.end() when closed', async () => {
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
    logger.close()
    expect(mockEnd).toHaveBeenCalled()
  })

  it('writes to stderr for each event', async () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
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
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
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
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
    logger.log(makeEvent({decision: 'block', reason: 'null result detected'}))
    expect(output).toContain('null result detected')
    stderrSpy.mockRestore()
  })

  // Receipt rendering for block decisions
  describe('failure receipt', () => {
    it('renders FAILURE header for block decisions', async () => {
      let output = ''
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
        output += String(s)
        return true
      })
      const {ReliabilityLogger} = await import('./events.js')
      const logger = new ReliabilityLogger('./test.log')
      logger.log(makeEvent({decision: 'block', reason: 'null result detected'}))
      expect(output).toContain('FAILURE')
      stderrSpy.mockRestore()
    })

    it('includes the server_id in the receipt', async () => {
      let output = ''
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
        output += String(s)
        return true
      })
      const {ReliabilityLogger} = await import('./events.js')
      const logger = new ReliabilityLogger('./test.log')
      logger.log(makeEvent({decision: 'block', server_id: 'api.github.com'}))
      expect(output).toContain('api.github.com')
      stderrSpy.mockRestore()
    })

    it('includes the failureClass in the receipt', async () => {
      let output = ''
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
        output += String(s)
        return true
      })
      const {ReliabilityLogger} = await import('./events.js')
      const logger = new ReliabilityLogger('./test.log')
      logger.log(makeEvent({decision: 'block', reason: 'tools/call result is null', failureClass: 'schema_violation'}))
      expect(output).toContain('schema_violation')
      stderrSpy.mockRestore()
    })

    it('includes the requestId in the receipt', async () => {
      let output = ''
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
        output += String(s)
        return true
      })
      const {ReliabilityLogger} = await import('./events.js')
      const logger = new ReliabilityLogger('./test.log')
      logger.log(makeEvent({decision: 'block', requestId: 99}))
      expect(output).toContain('99')
      stderrSpy.mockRestore()
    })

    it('does not render FAILURE for allow decisions', async () => {
      let output = ''
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
        output += String(s)
        return true
      })
      const {ReliabilityLogger} = await import('./events.js')
      const logger = new ReliabilityLogger('./test.log')
      logger.log(makeEvent({decision: 'allow'}))
      expect(output).not.toContain('FAILURE')
      stderrSpy.mockRestore()
    })
  })

  it('logs multiple events independently', async () => {
    const {ReliabilityLogger} = await import('./events.js')
    const logger = new ReliabilityLogger('./test.log')
    const e1 = makeEvent({tool: 'tool_a'})
    const e2 = makeEvent({tool: 'tool_b', decision: 'block'})
    logger.log(e1)
    logger.log(e2)
    expect(mockWrite).toHaveBeenCalledTimes(2)
    expect(mockWrite).toHaveBeenNthCalledWith(1, JSON.stringify(e1) + '\n')
    expect(mockWrite).toHaveBeenNthCalledWith(2, JSON.stringify(e2) + '\n')
  })
})
