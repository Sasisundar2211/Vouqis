import {describe, it, expect, vi, afterEach} from 'vitest'
import {TokenBucket, buildRateLimiter} from './ratelimit.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('TokenBucket', () => {
  it('allows the first request', () => {
    const bucket = new TokenBucket(10)
    expect(bucket.consume()).toBe(true)
  })

  it('allows up to rps requests before blocking', () => {
    const bucket = new TokenBucket(3)
    expect(bucket.consume()).toBe(true)
    expect(bucket.consume()).toBe(true)
    expect(bucket.consume()).toBe(true)
    expect(bucket.consume()).toBe(false)
  })

  it('blocks when all initial tokens are exhausted', () => {
    const bucket = new TokenBucket(1)
    bucket.consume()
    expect(bucket.consume()).toBe(false)
  })

  it('refills tokens after elapsed time', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket(1)
    bucket.consume()
    expect(bucket.consume()).toBe(false)
    vi.advanceTimersByTime(1100)
    expect(bucket.consume()).toBe(true)
  })

  it('does not refill beyond the rps cap', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket(5)
    vi.advanceTimersByTime(60_000) // long idle period
    let allowed = 0
    for (let i = 0; i < 10; i++) if (bucket.consume()) allowed++
    expect(allowed).toBe(5)
  })

  it('partially refills tokens proportional to elapsed time', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket(10)
    // exhaust all 10
    for (let i = 0; i < 10; i++) bucket.consume()
    expect(bucket.consume()).toBe(false)
    // advance 0.5s → 5 tokens refilled
    vi.advanceTimersByTime(500)
    let allowed = 0
    for (let i = 0; i < 6; i++) if (bucket.consume()) allowed++
    expect(allowed).toBe(5)
  })
})

describe('buildRateLimiter', () => {
  it('returns null when rps is undefined', () => {
    expect(buildRateLimiter(undefined)).toBeNull()
  })

  it('returns a TokenBucket instance when rps is provided', () => {
    expect(buildRateLimiter(10)).toBeInstanceOf(TokenBucket)
  })

  it('returned bucket respects the configured rps', () => {
    const bucket = buildRateLimiter(2)!
    expect(bucket.consume()).toBe(true)
    expect(bucket.consume()).toBe(true)
    expect(bucket.consume()).toBe(false)
  })
})
