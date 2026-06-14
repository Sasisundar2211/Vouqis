import {describe, it, expect, vi, beforeEach} from 'vitest'

const mockMkdirSync = vi.fn()
const mockExistsSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockWriteFileSync = vi.fn()

vi.mock('node:fs', () => ({
  default: {},
  mkdirSync: mockMkdirSync,
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}))

vi.mock('posthog-node', () => ({
  PostHog: class {
    capture() {}
    captureException() {}
  },
}))

describe('getOrCreateDistinctId', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('returns existing ID when file exists and has content', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('saved-uuid-abc\n')
    const {distinctId} = await import('./analytics.js')
    expect(distinctId).toBe('saved-uuid-abc')
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('creates and writes a new UUID when file does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    const {distinctId} = await import('./analytics.js')
    expect(typeof distinctId).toBe('string')
    expect(distinctId).not.toBe('anonymous')
    expect(distinctId.length).toBeGreaterThan(0)
    expect(mockWriteFileSync).toHaveBeenCalledOnce()
  })

  it('creates and writes a new UUID when file exists but is empty', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('   ')
    const {distinctId} = await import('./analytics.js')
    expect(distinctId).not.toBe('anonymous')
    expect(mockWriteFileSync).toHaveBeenCalledOnce()
  })

  it('returns "anonymous" when mkdirSync throws', async () => {
    mockMkdirSync.mockImplementation(() => {
      throw new Error('EACCES: permission denied')
    })
    const {distinctId} = await import('./analytics.js')
    expect(distinctId).toBe('anonymous')
  })
})
