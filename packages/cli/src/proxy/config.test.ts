import {describe, it, expect, vi, beforeEach} from 'vitest'
import {parseConfig, inlineConfig} from './config.js'

describe('parseConfig', () => {
  it('throws on null input', () => {
    expect(() => parseConfig(null)).toThrow('config must be a YAML/JSON object')
  })

  it('throws on string input', () => {
    expect(() => parseConfig('upstream: x')).toThrow()
  })

  it('throws when upstreams array is empty', () => {
    expect(() => parseConfig({upstreams: []})).toThrow('at least one upstream')
  })

  it('throws when upstreams key is missing', () => {
    expect(() => parseConfig({listen: '0.0.0.0:4444'})).toThrow('at least one upstream')
  })

  it('throws when upstream is missing url', () => {
    expect(() => parseConfig({upstreams: [{name: 'test'}]})).toThrow('url is required')
  })

  it('strips trailing slash from upstream url', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com/'}]})
    expect(cfg.upstreams[0].url).toBe('https://example.com')
  })

  it('uses default listen address when not specified', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.listen).toBe('127.0.0.1:4444')
  })

  it('respects explicit listen value', () => {
    const cfg = parseConfig({listen: '0.0.0.0:9000', upstreams: [{url: 'https://example.com'}]})
    expect(cfg.listen).toBe('0.0.0.0:9000')
  })

  it('uses default log_file when not specified', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.log_file).toBe('./vouqis-audit.log')
  })

  it('uses upstream-N as name when name is absent', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.upstreams[0].name).toBe('upstream-0')
  })

  it('uses provided upstream name', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com', name: 'my-server'}]})
    expect(cfg.upstreams[0].name).toBe('my-server')
  })

  it('defaults timeout_ms to 5000', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.upstreams[0].timeout_ms).toBe(5000)
  })

  it('defaults retry to 0', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.upstreams[0].retry).toBe(0)
  })

  it('caps retry at 3', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com', retry: 99}]})
    expect(cfg.upstreams[0].retry).toBe(3)
  })

  it('applies default policies', () => {
    const cfg = parseConfig({upstreams: [{url: 'https://example.com'}]})
    expect(cfg.upstreams[0].policies.block_null_result).toBe(true)
    expect(cfg.upstreams[0].policies.sanitize_schema).toBe(true)
    expect(cfg.upstreams[0].policies.max_request_size_kb).toBe(512)
  })

  it('merges explicit policy overrides with defaults', () => {
    const cfg = parseConfig({
      upstreams: [{url: 'https://example.com', policies: {block_null_result: false}}],
    })
    expect(cfg.upstreams[0].policies.block_null_result).toBe(false)
    expect(cfg.upstreams[0].policies.sanitize_schema).toBe(true)
  })

  it('parses multiple upstreams', () => {
    const cfg = parseConfig({
      upstreams: [
        {url: 'https://a.example.com'},
        {url: 'https://b.example.com', name: 'b'},
      ],
    })
    expect(cfg.upstreams).toHaveLength(2)
    expect(cfg.upstreams[1].name).toBe('b')
  })
})

describe('inlineConfig', () => {
  const base = {
    upstream: 'https://example.com/',
    listen: '127.0.0.1:4444',
    timeoutMs: 5000,
    retry: 1,
    logFile: './audit.log',
    blockNull: true,
    sanitize: true,
  }

  it('builds a single upstream config', () => {
    const cfg = inlineConfig(base)
    expect(cfg.upstreams).toHaveLength(1)
    expect(cfg.upstreams[0].name).toBe('default')
  })

  it('strips trailing slash from upstream url', () => {
    expect(inlineConfig(base).upstreams[0].url).toBe('https://example.com')
  })

  it('maps blockNull=true to block_null_result policy', () => {
    expect(inlineConfig(base).upstreams[0].policies.block_null_result).toBe(true)
  })

  it('maps blockNull=false to block_null_result policy', () => {
    expect(inlineConfig({...base, blockNull: false}).upstreams[0].policies.block_null_result).toBe(false)
  })

  it('maps sanitize=false to sanitize_schema policy', () => {
    expect(inlineConfig({...base, sanitize: false}).upstreams[0].policies.sanitize_schema).toBe(false)
  })

  it('sets rate_limit_rps when provided', () => {
    expect(inlineConfig({...base, rateLimitRps: 10}).upstreams[0].rate_limit_rps).toBe(10)
  })

  it('leaves rate_limit_rps undefined when not provided', () => {
    expect(inlineConfig(base).upstreams[0].rate_limit_rps).toBeUndefined()
  })

  it('passes through listen and log_file', () => {
    const cfg = inlineConfig(base)
    expect(cfg.listen).toBe('127.0.0.1:4444')
    expect(cfg.log_file).toBe('./audit.log')
  })

  it('passes through timeoutMs as timeout_ms', () => {
    expect(inlineConfig({...base, timeoutMs: 8000}).upstreams[0].timeout_ms).toBe(8000)
  })

  it('passes through retry', () => {
    expect(inlineConfig({...base, retry: 2}).upstreams[0].retry).toBe(2)
  })
})
