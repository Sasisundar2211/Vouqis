import type {UpstreamConfig} from './config.js'
import {forwardToUpstream} from './forwarder.js'

const RETRY_DELAY_MS = 300

export interface RetryEvent {
  attempt: number      // the attempt number that just timed out (1-indexed)
  maxAttempts: number
  delayMs: number
  reason: 'timeout'
}

export interface ForwardWithRetryOptions {
  upstream: UpstreamConfig
  headers: Record<string, string>
  rawBody: Buffer
  retryAllowed: boolean
  onRetry?: (event: RetryEvent) => void
}

/**
 * Forward a request to upstream, retrying on timeout if retryAllowed.
 * Returns the raw Response. Throws if all attempts fail.
 */
export async function forwardWithRetry(opts: ForwardWithRetryOptions): Promise<Response> {
  const {upstream, headers, rawBody, retryAllowed, onRetry} = opts
  const maxAttempts = upstream.retry + 1

  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await forwardToUpstream(upstream, headers, rawBody)
    } catch (err) {
      lastError = err
      const isTimeout = err instanceof Error && err.name === 'TimeoutError'
      if (!isTimeout || attempt >= maxAttempts || !retryAllowed) break

      onRetry?.({attempt, maxAttempts, delayMs: RETRY_DELAY_MS, reason: 'timeout'})
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  throw lastError
}
