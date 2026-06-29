import type {UpstreamConfig} from './config.js'

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'transfer-encoding', 'upgrade',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers',
])

/** Strip hop-by-hop headers from an upstream response before forwarding to the client. */
export function upstreamResponseHeaders(upstreamRes: Response): Record<string, string> {
  const out: Record<string, string> = {}
  upstreamRes.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return
    out[key] = value
  })
  return out
}

export async function forwardToUpstream(
  upstream: UpstreamConfig,
  headers: Record<string, string>,
  rawBody: Buffer,
): Promise<Response> {
  return fetch(upstream.url, {
    method: 'POST',
    headers,
    body: rawBody,
    signal: AbortSignal.timeout(upstream.timeout_ms),
  })
}

export async function forwardGetToUpstream(
  upstream: UpstreamConfig,
  headers: Record<string, string>,
): Promise<Response> {
  return fetch(upstream.url, {method: 'GET', headers})
}
