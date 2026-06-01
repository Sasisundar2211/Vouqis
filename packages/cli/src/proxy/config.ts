import * as fs from 'node:fs'
import {parse as parseYaml} from 'yaml'

export interface UpstreamPolicies {
  block_null_result: boolean
  sanitize_schema: boolean
  max_request_size_kb: number
}

export interface UpstreamConfig {
  name: string
  url: string
  timeout_ms: number
  retry: number
  rate_limit_rps?: number
  policies: UpstreamPolicies
}

export interface ProxyConfig {
  listen: string
  log_file: string
  upstreams: UpstreamConfig[]
}

const DEFAULT_POLICIES: UpstreamPolicies = {
  block_null_result: true,
  sanitize_schema: true,
  max_request_size_kb: 512,
}

function normaliseUpstream(raw: Record<string, unknown>, index: number): UpstreamConfig {
  if (!raw['url'] || typeof raw['url'] !== 'string') {
    throw new Error(`upstream[${index}]: url is required`)
  }
  return {
    name: typeof raw['name'] === 'string' ? raw['name'] : `upstream-${index}`,
    url: raw['url'].replace(/\/$/, ''),
    timeout_ms: typeof raw['timeout_ms'] === 'number' ? raw['timeout_ms'] : 5000,
    retry: typeof raw['retry'] === 'number' ? Math.min(raw['retry'], 3) : 0,
    rate_limit_rps: typeof raw['rate_limit_rps'] === 'number' ? raw['rate_limit_rps'] : undefined,
    policies: {
      ...DEFAULT_POLICIES,
      ...(raw['policies'] && typeof raw['policies'] === 'object' ? raw['policies'] as Partial<UpstreamPolicies> : {}),
    },
  }
}

export function parseConfig(raw: unknown): ProxyConfig {
  if (!raw || typeof raw !== 'object') throw new Error('config must be a YAML/JSON object')
  const r = raw as Record<string, unknown>

  const upstreams = Array.isArray(r['upstreams'])
    ? r['upstreams'].map((u, i) => normaliseUpstream(u as Record<string, unknown>, i))
    : []

  if (upstreams.length === 0) throw new Error('config must define at least one upstream')

  return {
    listen: typeof r['listen'] === 'string' ? r['listen'] : '127.0.0.1:4444',
    log_file: typeof r['log_file'] === 'string' ? r['log_file'] : './vouqis-audit.log',
    upstreams,
  }
}

export function loadConfigFile(path: string): ProxyConfig {
  const text = fs.readFileSync(path, 'utf8')
  const raw = path.endsWith('.json') ? JSON.parse(text) : parseYaml(text)
  return parseConfig(raw)
}

/** Build a minimal single-upstream config from CLI flags */
export function inlineConfig(opts: {
  upstream: string
  listen: string
  timeoutMs: number
  retry: number
  rateLimitRps?: number
  logFile: string
  blockNull: boolean
  sanitize: boolean
}): ProxyConfig {
  return {
    listen: opts.listen,
    log_file: opts.logFile,
    upstreams: [
      {
        name: 'default',
        url: opts.upstream.replace(/\/$/, ''),
        timeout_ms: opts.timeoutMs,
        retry: opts.retry,
        rate_limit_rps: opts.rateLimitRps,
        policies: {
          block_null_result: opts.blockNull,
          sanitize_schema: opts.sanitize,
          max_request_size_kb: 512,
        },
      },
    ],
  }
}
