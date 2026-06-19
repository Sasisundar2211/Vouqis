import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog — Vouqis',
  description: 'Version history for Vouqis, the MCP reliability gateway.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

type ChangeType = 'feat' | 'fix' | 'refactor' | 'chore'

type Change = {
  type: ChangeType
  text: string
}

type Release = {
  version: string
  date: string
  summary: string
  changes: Change[]
}

const RELEASES: Release[] = [
  {
    version: 'v0.4.4',
    date: '2026-05-12',
    summary: 'Dependency security patches, CI typecheck hardening.',
    changes: [
      { type: 'fix',    text: 'Resolve five Dependabot security alerts across transitive dependencies.' },
      { type: 'chore',  text: 'Add TypeScript strict-mode check to CI pipeline.' },
      { type: 'fix',    text: 'Restore scroll position to top on every page load via inline head script.' },
    ],
  },
  {
    version: 'v0.4.3',
    date: '2026-04-28',
    summary: 'Analytics hardening; PostHog event contract locked.',
    changes: [
      { type: 'refactor', text: 'PostHog events no longer include upstream URL path or query string.' },
      { type: 'chore',    text: 'Confirm opt-out behaviour: SDK is a no-op when POSTHOG_API_KEY is unset.' },
      { type: 'fix',      text: 'Rate-limit refill now correctly resets on the configured interval boundary.' },
    ],
  },
  {
    version: 'v0.4.2',
    date: '2026-04-11',
    summary: 'EMPTY_CONTENT failure class added; audit log schema revision.',
    changes: [
      { type: 'feat', text: 'Detect and classify empty content arrays (result.content === []) as EMPTY_CONTENT.' },
      { type: 'feat', text: 'Audit log now includes severity field: CRITICAL, HIGH, MEDIUM, LOW.' },
      { type: 'fix',  text: 'OPTIONS pre-flight response now returns explicit CORS header list instead of wildcard.' },
    ],
  },
  {
    version: 'v0.4.1',
    date: '2026-03-29',
    summary: 'Retry policy scoped to idempotent MCP methods only.',
    changes: [
      { type: 'fix',      text: 'Retry now fires only for tools/list, tools/call, initialize, and ping.' },
      { type: 'refactor', text: 'RETRY_DELAY_MS constant extracted; default is 300 ms.' },
      { type: 'feat',     text: 'Retry events are emitted to the audit log before each attempt.' },
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-03-14',
    summary: 'First public release. Core proxy, validator, rate limiter, audit logger.',
    changes: [
      { type: 'feat', text: 'vouqis proxy command: HTTP gateway listening on 127.0.0.1:4444 by default.' },
      { type: 'feat', text: 'NULL_RESULT, SCHEMA_DRIFT, TIMEOUT_AS_SUCCESS failure class detection.' },
      { type: 'feat', text: 'NDJSON audit log at vouqis-audit.log.' },
      { type: 'feat', text: 'Token-bucket rate limiter with configurable window and max requests.' },
      { type: 'feat', text: 'Security headers (X-Content-Type-Options, Cache-Control: no-store) on every response.' },
    ],
  },
]

const TYPE_COLORS: Record<ChangeType, string> = {
  feat:     '#69B98D',
  fix:      '#FF6A4D',
  refactor: '#C9A96E',
  chore:    '#8C8473',
}

export default function ChangelogPage() {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: 'clamp(56px,8vw,104px) clamp(20px,5vw,72px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(56px,7vw,88px)' }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ED4B2A',
            marginBottom: 18,
          }}
        >
          Changelog
        </div>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(38px,5vw,66px)',
            lineHeight: 1.02,
            color: '#15120E',
            margin: '0 0 18px',
          }}
        >
          Version history
        </h1>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(15px,1.1vw,17.5px)',
            lineHeight: 1.65,
            color: '#5C564A',
            maxWidth: '52ch',
            margin: 0,
          }}
        >
          Every release of <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>@vouqis/cli</code>.
          Unreleased changes are on{' '}
          <a
            href="https://github.com/Sasisundar2211/Vouqis"
            target="_blank"
            rel="noopener noreferrer"
            className="vq-text-link"
            style={{ color: '#15120E', borderBottom: '1px solid rgba(21,18,14,0.3)', textDecoration: 'none' }}
          >
            GitHub
          </a>.
        </p>
      </div>

      {/* Releases */}
      {RELEASES.map((release, i) => (
        <div
          key={release.version}
          style={{
            paddingBottom: 'clamp(40px,5vw,64px)',
            marginBottom: 'clamp(40px,5vw,64px)',
            borderBottom: i < RELEASES.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(18px,2vw,24px)',
                color: '#15120E',
                fontWeight: 600,
              }}
            >
              {release.version}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: '#9A9486',
                letterSpacing: '0.04em',
              }}
            >
              {release.date}
            </span>
          </div>

          <p
            style={{
              fontFamily: SANS,
              fontSize: 15.5,
              lineHeight: 1.6,
              color: '#46402F',
              maxWidth: '56ch',
              margin: '0 0 22px',
            }}
          >
            {release.summary}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {release.changes.map((change, j) => (
              <div
                key={j}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'baseline',
                  padding: '8px 0',
                  borderTop: j === 0 ? '1px solid rgba(21,18,14,0.10)' : undefined,
                  borderBottom: '1px solid rgba(21,18,14,0.10)',
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    color: TYPE_COLORS[change.type],
                    flex: '0 0 54px',
                  }}
                >
                  {change.type}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: '#38332A',
                  }}
                >
                  {change.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
