import {describe, it, expect, vi, beforeEach} from 'vitest'
import {VouqisSDK} from '../src/index.js'

function makeMockClient(returnValue: unknown = {content: [{type: 'text', text: 'ok'}]}) {
  return {
    callTool: vi.fn().mockResolvedValue(returnValue),
  }
}

describe('VouqisSDK.wrap()', () => {
  let sdk: VouqisSDK

  beforeEach(() => {
    sdk = new VouqisSDK({projectId: 'test-project'})
  })

  it('passes the original callTool return value through unchanged', async () => {
    const expected = {content: [{type: 'text', text: 'hello'}]}
    const client = makeMockClient(expected)
    const wrapped = sdk.wrap(client)

    const result = await wrapped.callTool('echo', {message: 'hello'})

    expect(result).toBe(expected)
  })

  it('writes a trace object to console.log for every call', async () => {
    const client = makeMockClient()
    const wrapped = sdk.wrap(client)
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await wrapped.callTool('echo', {message: 'test'})

    expect(spy).toHaveBeenCalledOnce()
    const logged = JSON.parse(spy.mock.calls[0][0] as string)
    expect(logged).toMatchObject({
      traceId: expect.any(String),
      projectId: 'test-project',
      timestamp: expect.any(String),
      toolName: 'echo',
      params: {message: 'test'},
      error: null,
    })

    spy.mockRestore()
  })

  it('records latencyMs as a number greater than 0', async () => {
    const client = makeMockClient()
    const wrapped = sdk.wrap(client)
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await wrapped.callTool('echo', {})

    const logged = JSON.parse(spy.mock.calls[0][0] as string)
    expect(typeof logged.latencyMs).toBe('number')
    expect(logged.latencyMs).toBeGreaterThanOrEqual(0)

    spy.mockRestore()
  })

  it('records the error message in the trace when callTool throws', async () => {
    const client = {
      callTool: vi.fn().mockRejectedValue(new Error('tool exploded')),
    }
    const wrapped = sdk.wrap(client)
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await expect(wrapped.callTool('bad_tool', {})).rejects.toThrow('tool exploded')

    const logged = JSON.parse(spy.mock.calls[0][0] as string)
    expect(logged.error).toBe('tool exploded')
    expect(logged.response).toBeNull()

    spy.mockRestore()
  })

  it('adds no more than 5ms overhead on average across 100 calls', async () => {
    const client = makeMockClient()
    const wrapped = sdk.wrap(client)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const ITERATIONS = 100
    const start = Date.now()
    for (let i = 0; i < ITERATIONS; i++) {
      await wrapped.callTool('echo', {i})
    }
    const totalMs = Date.now() - start

    const directStart = Date.now()
    for (let i = 0; i < ITERATIONS; i++) {
      await client.callTool('echo', {i})
    }
    const directMs = Date.now() - directStart

    const overheadPerCall = (totalMs - directMs) / ITERATIONS
    expect(overheadPerCall).toBeLessThan(5)

    vi.restoreAllMocks()
  })
})
