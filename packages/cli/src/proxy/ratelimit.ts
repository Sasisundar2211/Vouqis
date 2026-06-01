/** Token-bucket rate limiter. One instance per upstream. */
export class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(private readonly rps: number) {
    this.tokens = rps
    this.lastRefill = Date.now()
  }

  /** Returns true if the request is allowed, false if rate-limited. */
  consume(): boolean {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.rps, this.tokens + elapsed * this.rps)
    this.lastRefill = now
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }
}

export function buildRateLimiter(rps: number | undefined): TokenBucket | null {
  return rps != null ? new TokenBucket(rps) : null
}
