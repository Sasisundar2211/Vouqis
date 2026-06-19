import {describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach} from 'vitest'
import * as http from 'node:http'
import type {AddressInfo} from 'node:net'
import {createProxyServer, startServer} from './server.js'
import type {ProxyConfig} from './config.js'
import type {AuditLogger} from './audit.js'

vi.mock('../analytics.js', () => ({
  distinctId: 'test-id',
  posthog: {capture: vi.fn(), captureException: vi.fn()},
}))

const VALID_REQUEST = {jsonrpc: '2.0', method: 'tools/list', id: 1}
const TOOLS_CALL = {jsonrpc: '2.0', method: 'tools/call', id: 2, params: {name: 'search'}}

function defaultConfig(upstreamOverrides: Record<string, unknown> = {}): ProxyConfig {
  return {
    listen: '127.0.0.1:0',
    log_file: './test.log',
    upstreams: [
      {
        name: 'test',
        url: 'http://upstream.test',
        timeout_ms: 500,
        retry: 0,
        policies: {block_null_result: true, sanitize_schema: true, max_request_size_kb: 512},
        ...upstreamOverrides,
      },
    ],
  }
}

function makeLogger() {
  return {log: vi.fn(), close: vi.fn()}
}

async function spawnServer(upstreamOverrides: Record<string, unknown> = {}) {
  const config = defaultConfig(upstreamOverrides)
  const logger = makeLogger()
  const server = createProxyServer(config, logger as unknown as AuditLogger)
  await startServer(server, config.listen)
  const {port} = server.address() as AddressInfo
  const baseUrl = `http://127.0.0.1:${port}`
  const close = () => new Promise<void>((r) => server.close(() => r()))
  return {baseUrl, server, logger, close}
}

// Use http.request so the stubbed global fetch doesn't intercept test calls
function httpReq(opts: {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
}): Promise<{statusCode: number; body: string; headers: http.IncomingHttpHeaders}> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(opts.url)
    const bodyBuf = opts.body !== undefined ? Buffer.from(opts.body) : undefined
    const reqHeaders: Record<string, string | number> = {...(opts.headers ?? {})}
    if (bodyBuf) reqHeaders['content-length'] = bodyBuf.length
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: Number(parsed.port),
        path: parsed.pathname || '/',
        method: opts.method ?? 'GET',
        headers: reqHeaders,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () =>
          resolve({statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString(), headers: res.headers}),
        )
      },
    )
    req.on('error', reject)
    if (bodyBuf) req.write(bodyBuf)
    req.end()
  })
}

function postJson(url: string, body: unknown) {
  return httpReq({url, method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)})
}

function jsonUpstream(body: unknown, status = 200) {
  const text = JSON.stringify(body)
  return {
    status,
    headers: {get: (k: string) => (k === 'content-type' ? 'application/json' : null)},
    text: () => Promise.resolve(text),
    body: null,
  }
}

function sseUpstream(chunks: string[] = []) {
  let i = 0
  return {
    status: 200,
    headers: {get: (k: string) => (k === 'content-type' ? 'text/event-stream' : null)},
    text: () => Promise.resolve(''),
    body: {
      getReader: () => ({
        read: vi.fn().mockImplementation(() => {
          const item = chunks[i++]
          return item !== undefined
            ? Promise.resolve({done: false, value: Buffer.from(item)})
            : Promise.resolve({done: true, value: undefined})
        }),
      }),
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Shared server (default config) — most tests run against this
// ────────────────────────────────────────────────────────────────────────────
describe('createProxyServer', () => {
  let baseUrl: string
  let logger: ReturnType<typeof makeLogger>
  let closeServer: () => Promise<void>
  let mockFetch: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    const s = await spawnServer()
    baseUrl = s.baseUrl
    logger = s.logger
    closeServer = s.close
  })

  afterAll(() => closeServer())

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // ── HTTP method routing ───────────────────────────────────────────────────

  it('OPTIONS → 204 with CORS headers', async () => {
    const res = await httpReq({url: baseUrl, method: 'OPTIONS'})
    expect(res.statusCode).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/)
  })

  it('DELETE → 405 method not allowed', async () => {
    const res = await httpReq({url: baseUrl, method: 'DELETE'})
    expect(res.statusCode).toBe(405)
    const body = JSON.parse(res.body)
    expect(body.error.message).toMatch(/not allowed/)
  })

  it('GET → SSE passthrough with upstream content-type', async () => {
    mockFetch.mockResolvedValueOnce(sseUpstream(['data: ok\n\n']))
    const res = await httpReq({url: baseUrl, method: 'GET'})
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/event-stream')
  })

  it('GET → 502 when upstream throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    const res = await httpReq({url: baseUrl, method: 'GET'})
    expect(res.statusCode).toBe(502)
  })

  // ── POST body validation ──────────────────────────────────────────────────

  it('empty POST body → block -32700', async () => {
    const res = await httpReq({url: baseUrl, method: 'POST', headers: {'content-type': 'application/json'}, body: ''})
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32700)
    expect(body.error.message).toMatch(/empty/)
  })

  it('malformed JSON body → block -32700', async () => {
    const res = await httpReq({
      url: baseUrl,
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: 'not { valid json',
    })
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32700)
    expect(body.error.message).toMatch(/not valid JSON/)
  })

  it('null JSON body → block -32600 (not a JSON object, not -32700)', async () => {
    const res = await httpReq({
      url: baseUrl,
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: 'null',
    })
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32600)
    expect(body.error.message).toMatch(/not a JSON object/)
  })

  it('invalid jsonrpc version → block -32600', async () => {
    const res = await postJson(baseUrl, {jsonrpc: '1.0', method: 'ping', id: 1})
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32600)
    expect(body.error.message).toMatch(/jsonrpc must be/)
  })

  it('missing method → block -32600', async () => {
    const res = await postJson(baseUrl, {jsonrpc: '2.0', id: 1})
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32600)
    expect(body.error.message).toMatch(/method is missing/)
  })

  // ── Upstream failures ─────────────────────────────────────────────────────

  it('upstream timeout → block -32000 with timed out message', async () => {
    const err = Object.assign(new Error('The operation timed out'), {name: 'TimeoutError'})
    mockFetch.mockRejectedValueOnce(err)
    const res = await postJson(baseUrl, VALID_REQUEST)
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32000)
    expect(body.error.message).toMatch(/timed out/)
  })

  it('upstream network error → block -32603 with unreachable message', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    const res = await postJson(baseUrl, VALID_REQUEST)
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32603)
    expect(body.error.message).toMatch(/unreachable/)
  })

  // ── Response handling ─────────────────────────────────────────────────────

  it('happy path → forwards upstream JSON and emits allow', async () => {
    const upstream = {jsonrpc: '2.0', id: 1, result: {content: [{type: 'text', text: 'ok'}]}}
    mockFetch.mockResolvedValueOnce(jsonUpstream(upstream))
    const res = await postJson(baseUrl, VALID_REQUEST)
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.result).toEqual(upstream.result)
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({decision: 'allow'}),
    )
  })

  it('POST with SSE upstream response → piped with text/event-stream header', async () => {
    mockFetch.mockResolvedValueOnce(sseUpstream(['data: hello\n\n']))
    const res = await postJson(baseUrl, VALID_REQUEST)
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/event-stream')
  })

  it('non-JSON upstream response → wrapped in JSON-RPC error', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 502,
      headers: {get: (k: string) => (k === 'content-type' ? 'text/html' : null)},
      text: () => Promise.resolve('<html><body>502 Bad Gateway</body></html>'),
      body: null,
    })
    const res = await postJson(baseUrl, VALID_REQUEST)
    const body = JSON.parse(res.body)
    expect(body.error).toBeDefined()
    expect(body.error.code).toBe(-32603)
    expect(body.error.message).toMatch(/non-JSON/)
  })

  it('null tools/call result → block when block_null_result=true', async () => {
    mockFetch.mockResolvedValueOnce(jsonUpstream({jsonrpc: '2.0', id: 2, result: null}))
    const res = await postJson(baseUrl, TOOLS_CALL)
    const body = JSON.parse(res.body)
    expect(body.error).toBeDefined()
    expect(body.error.message).toMatch(/null/)
  })

  it('tools/call content missing type field → rewritten with type:text', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonUpstream({jsonrpc: '2.0', id: 2, result: {content: [{text: 'no type here'}]}}),
    )
    const res = await postJson(baseUrl, TOOLS_CALL)
    const body = JSON.parse(res.body)
    expect(body.result.content[0].type).toBe('text')
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({decision: 'rewrite'}),
    )
  })

  // ── Audit logging ─────────────────────────────────────────────────────────

  it('logger.log called with block decision on request validation failure', async () => {
    await postJson(baseUrl, {jsonrpc: '1.0', method: 'ping', id: 1})
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({decision: 'block'}),
    )
  })

  it('logger.log records tool name from tools/call params.name', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonUpstream({jsonrpc: '2.0', id: 2, result: {content: [{type: 'text', text: 'res'}]}}),
    )
    await postJson(baseUrl, TOOLS_CALL)
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({method: 'tools/call', tool: 'search'}),
    )
  })
})

// ── Body size limit (small limit server) ─────────────────────────────────────
describe('request size limit', () => {
  let baseUrl: string
  let closeServer: () => Promise<void>

  beforeAll(async () => {
    const s = await spawnServer({policies: {max_request_size_kb: 1, block_null_result: true, sanitize_schema: true}})
    baseUrl = s.baseUrl
    closeServer = s.close
  })

  afterAll(() => closeServer())

  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('body exceeding max_request_size_kb → block -32600', async () => {
    const big = JSON.stringify({jsonrpc: '2.0', method: 'ping', id: 1, params: 'x'.repeat(2 * 1024)})
    const res = await httpReq({url: baseUrl, method: 'POST', headers: {'content-type': 'application/json'}, body: big})
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32600)
    expect(body.error.message).toMatch(/exceeds/)
  })
})

// ── Rate limiting (fresh server per test to avoid token state leakage) ────────
describe('rate limiting', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('first request within limit is forwarded', async () => {
    const s = await spawnServer({rate_limit_rps: 2})
    const mockFetch = vi.fn().mockResolvedValueOnce(
      jsonUpstream({jsonrpc: '2.0', id: 1, result: {content: [{type: 'text', text: 'ok'}]}}),
    )
    vi.stubGlobal('fetch', mockFetch)
    const res = await postJson(s.baseUrl, VALID_REQUEST)
    await s.close()
    const body = JSON.parse(res.body)
    expect(body.error).toBeUndefined()
  })

  it('request after tokens exhausted → block -32000', async () => {
    const s = await spawnServer({rate_limit_rps: 1})
    const mockFetch = vi.fn().mockResolvedValue(
      jsonUpstream({jsonrpc: '2.0', id: 1, result: {content: [{type: 'text', text: 'ok'}]}}),
    )
    vi.stubGlobal('fetch', mockFetch)
    await postJson(s.baseUrl, VALID_REQUEST) // consumes the single token
    const res = await postJson(s.baseUrl, VALID_REQUEST)
    await s.close()
    const body = JSON.parse(res.body)
    expect(body.error.code).toBe(-32000)
    expect(body.error.message).toMatch(/rate limit/)
  })
})

// ── Retry logic ───────────────────────────────────────────────────────────────
describe('retry on timeout', () => {
  let baseUrl: string
  let logger: ReturnType<typeof makeLogger>
  let closeServer: () => Promise<void>
  let mockFetch: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    // Short retry delay is hardcoded in server.ts (300ms); use retry:1 to keep tests fast
    const s = await spawnServer({retry: 1, timeout_ms: 100})
    baseUrl = s.baseUrl
    logger = s.logger
    closeServer = s.close
  })

  afterAll(() => closeServer())

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('retries idempotent method on timeout then succeeds', async () => {
    const timeout = Object.assign(new Error('timed out'), {name: 'TimeoutError'})
    mockFetch
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(jsonUpstream({jsonrpc: '2.0', id: 1, result: {content: [{type: 'text', text: 'ok'}]}}))
    const res = await postJson(baseUrl, VALID_REQUEST) // tools/list is idempotent
    expect(mockFetch).toHaveBeenCalledTimes(2)
    const body = JSON.parse(res.body)
    expect(body.result).toBeDefined()
    const logCalls = logger.log.mock.calls
    const decisions = logCalls.map((c: unknown[]) => (c[0] as {decision: string}).decision)
    expect(decisions).toContain('retry')
    expect(decisions.at(-1)).toBe('allow')
  }, 10_000)

  it('does not retry non-idempotent method on timeout', async () => {
    const timeout = Object.assign(new Error('timed out'), {name: 'TimeoutError'})
    mockFetch.mockRejectedValue(timeout)
    const nonIdempotent = {jsonrpc: '2.0', method: 'sampling/createMessage', id: 3}
    await postJson(baseUrl, nonIdempotent)
    expect(mockFetch).toHaveBeenCalledTimes(1) // no retry
  }, 10_000)
})

// ── startServer ───────────────────────────────────────────────────────────────
describe('startServer', () => {
  it('binds to explicit host:port', async () => {
    const server = http.createServer()
    await startServer(server, '127.0.0.1:0')
    const addr = server.address() as AddressInfo
    expect(addr.address).toBe('127.0.0.1')
    expect(addr.port).toBeGreaterThan(0)
    await new Promise<void>((r) => server.close(() => r()))
  })

  it('binds with bare port string (defaults host to 127.0.0.1)', async () => {
    const server = http.createServer()
    await startServer(server, '0')
    const addr = server.address() as AddressInfo
    expect(addr.address).toBe('127.0.0.1')
    expect(addr.port).toBeGreaterThan(0)
    await new Promise<void>((r) => server.close(() => r()))
  })
})
