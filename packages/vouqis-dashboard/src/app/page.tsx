import { CopyButton } from '@/components/copy-button'
import { TerminalDemo } from '@/components/terminal-demo'

const TICKER_SIGS = [
  'NULL_RESULT', 'EMPTY_CONTENT', 'MALFORMED_JSON', 'SCHEMA_DRIFT',
  'TIMEOUT_AS_SUCCESS', 'TRUNCATED_PAYLOAD', 'WRONG_TYPE',
  'STALE_DATA', 'PARTIAL_BATCH', 'SILENT_RETRY',
]

const FAILURES = [
  {
    n: '01',
    title: 'The null that passes review',
    envelope: 'HTTP 200 · success',
    payload: '{\n  "jsonrpc": "2.0",\n  "result": null\n}',
    consequence: 'Your agent reads it as "record not found." The record exists. The tool just failed — and nothing in the response says so.',
  },
  {
    n: '02',
    title: 'The empty array dressed as an answer',
    envelope: 'HTTP 200 · success',
    payload: '{\n  "result": {\n    "content": []\n  }\n}',
    consequence: 'The agent reports "no results." Your user makes a decision on data that was never actually fetched.',
  },
  {
    n: '03',
    title: 'The timeout wearing a success badge',
    envelope: 'HTTP 200 · after 30,041 ms',
    payload: '{\n  "result": {\n    "status": "ok"\n  }\n}',
    consequence: 'The action never completed. The agent says "done." Nobody finds out until a customer does.',
  },
]

const CHECKS = [
  { k: '01', t: 'Validates the JSON-RPC request' },
  { k: '02', t: 'Validates the response envelope' },
  { k: '03', t: 'Detects null / empty / malformed / timeout' },
  { k: '04', t: 'Classifies the failure (NULL_RESULT, SCHEMA_DRIFT…)' },
  { k: '05', t: 'Emits protocol-aware reliability telemetry' },
]

const FAILURE_CLASSES = [
  { name: 'NULL_RESULT',    pct: '41%', color: '#FF6A4D' },
  { name: 'TIMEOUT_AS_OK', pct: '22%', color: '#E8915A' },
  { name: 'SCHEMA_DRIFT',  pct: '18%', color: '#D8B24A' },
  { name: 'EMPTY_CONTENT', pct: '12%', color: '#8C8473' },
  { name: 'MALFORMED_JSON', pct: '7%', color: '#6E6657' },
]

const SLIS = [
  { label: 'SUCCESS w/ CONTENT', value: '91.4%', target: 'target 99.9%',  color: '#FF6A4D' },
  { label: 'P95 LATENCY',        value: '142 ms', target: 'budget 250 ms', color: '#E9E3D5' },
  { label: 'SCHEMA STABILITY',   value: '97.2%', target: 'trailing 7d',    color: '#E9E3D5' },
  { label: 'SILENT-FAILURE RATE', value: '8.6%', target: 'target < 0.5%', color: '#FF6A4D' },
]

const SERVER_ROWS = [
  { name: 'mcp.acme.dev/db',     spark: '▆▅▆▄▅▃▄▂▃▂', score: '72', verdict: 'DEGRADED', color: '#C23A1E' },
  { name: 'mcp.payments.io',     spark: '▇▇▆▇▇█▇▇▆▇', score: '98', verdict: 'TRUSTED',  color: '#2E8B5E' },
  { name: 'mcp.search.dev',      spark: '▅▆▅▆▇▆▅▆▅▆', score: '85', verdict: 'WATCH',    color: '#B07A1E' },
  { name: 'mcp.legacy.internal', spark: '▃▂▃▁▂▁▂▁▁▂', score: '54', verdict: 'CRITICAL', color: '#C23A1E' },
]

const FOOTER_COLS = [
  { h: 'Product',   items: ['Reliability Audit', 'Gateway Cloud', 'Telemetry'] },
  { h: 'Resources', items: ['Docs', 'GitHub', 'Changelog'] },
  { h: 'Company',   items: ['Design partners', 'Blog', 'Contact'] },
]

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const SECTION_ANIM = {
  animation: 'vq-revealUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
  animationTimeline: 'view()',
  animationRange: 'entry 2% cover 18%',
} as React.CSSProperties

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px,8vw,104px) clamp(20px,5vw,72px) clamp(40px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(40px,5vw,76px)',
            alignItems: 'center',
          }}
        >
          {/* Left column */}
          <div style={{ flex: '1 1 460px', minWidth: 330 }}>
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 28,
                fontFamily: MONO,
                fontSize: 12.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#5C564A',
              }}
            >
              <span style={{ height: 1, width: 34, background: '#ED4B2A', flexShrink: 0 }} />
              Reliability gateway for MCP
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(46px,6.4vw,94px)',
                lineHeight: 0.96,
                letterSpacing: '-0.012em',
                maxWidth: '13ch',
                margin: '0 0 28px',
                color: '#15120E',
              }}
            >
              Your agent is{' '}
              <span
                style={{
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  fontStyle: 'italic',
                  color: '#ED4B2A',
                }}
              >
                lying
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '0.08em',
                    height: 3,
                    background: '#ED4B2A',
                    opacity: 0.32,
                  }}
                />
              </span>{' '}
              to you.
              <br />
              It doesn&apos;t know it yet.
            </h1>

            {/* Body */}
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(17px,1.35vw,20px)',
                lineHeight: 1.55,
                color: '#3B362C',
                maxWidth: '50ch',
                margin: '0 0 32px',
              }}
            >
              MCP tools return{' '}
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: '0.86em',
                  background: 'rgba(21,18,14,0.06)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                200 OK
              </code>{' '}
              with null, empty, or malformed payloads. Your agent reads the
              garbage as truth and answers your user with total confidence.
              Vouqis sits in the path and catches the failure{' '}
              <em style={{ fontStyle: 'italic', color: '#15120E' }}>
                before it ever reaches the agent.
              </em>
            </p>

            {/* CTA row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                marginBottom: 28,
              }}
            >
              <CopyButton size="sm" />
              <a
                href="#demo"
                className="vq-text-link"
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: '#15120E',
                  textDecoration: 'none',
                  borderBottom: '1px solid #ED4B2A',
                  paddingBottom: 3,
                  transition: 'opacity 150ms ease',
                }}
              >
                read the diagnostic →
              </a>
            </div>

            {/* Footer badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px 22px',
                fontFamily: MONO,
                fontSize: 12,
                color: '#6B6557',
              }}
            >
              {['Free', 'Open source (AGPL)', 'Design-partner program open', 'Microseconds of overhead'].map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
          </div>

          {/* Right column — Response Inspector */}
          <div style={{ flex: '1 1 380px', minWidth: 320, display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: '#16130E',
                borderRadius: 6,
                padding: 8,
                boxShadow: '0 34px 70px -28px rgba(21,18,14,0.5), 0 2px 0 rgba(255,255,255,0.04) inset',
                width: '100%',
                maxWidth: 480,
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px 10px',
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#8C8473',
                  }}
                >
                  Response inspector
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    color: '#69B98D',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#69B98D',
                      animation: 'vq-pulse 2s ease-in-out infinite',
                      display: 'inline-block',
                    }}
                  />
                  LIVE
                </span>
              </div>

              {/* Code area */}
              <div
                style={{
                  background: '#0E0C08',
                  borderRadius: 3,
                  padding: '18px 20px',
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: '#C9C2B2',
                }}
              >
                <div>
                  <span style={{ color: '#8C8473' }}>tools/call</span>
                  {' → '}
                  <span style={{ color: '#E9E3D5' }}>query_orders</span>
                </div>
                <div>
                  <span style={{ color: '#8C8473' }}>status</span>
                  {'   '}
                  <span style={{ color: '#69B98D' }}>200 OK ✓</span>
                </div>
                <div>
                  <span style={{ color: '#8C8473' }}>latency</span>
                  {'  '}
                  <span>142 ms</span>
                </div>
                <div>
                  <span style={{ color: '#8C8473' }}>jsonrpc</span>
                  {'  '}
                  <span>2.0 · valid</span>
                </div>

                <div
                  style={{
                    borderTop: '1px dashed rgba(255,255,255,0.1)',
                    margin: '10px 0',
                  }}
                />

                <div>
                  <span style={{ color: '#8C8473' }}>result</span>
                  {'   '}
                  <span style={{ color: '#FF6A4D', position: 'relative', display: 'inline-block' }}>
                    null
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 1,
                        height: 1,
                        background: '#FF6A4D',
                      }}
                    />
                  </span>
                </div>
              </div>

              {/* Alert bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  margin: '8px 0 0',
                  padding: '13px 15px',
                  background: 'color-mix(in srgb, #ED4B2A 16%, #16130E)',
                  border: '1px solid color-mix(in srgb, #ED4B2A 50%, transparent)',
                  borderRadius: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: '#FF6A4D',
                    border: '1.5px solid #FF6A4D',
                    padding: '5px 9px',
                    borderRadius: 2,
                    transform: 'rotate(-3deg)',
                    display: 'inline-block',
                    animation: 'vq-stamp 0.7s cubic-bezier(.2,.8,.2,1) 0.5s both',
                    flexShrink: 0,
                  }}
                >
                  SILENT FAILURE
                </span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: '#FF6A4D', fontWeight: 500 }}>
                    NULL_RESULT on success envelope
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#9A8E84', marginTop: 3 }}>
                    blocked before the agent saw it
                  </div>
                </div>
              </div>

              {/* Comment line */}
              <div
                style={{
                  padding: '10px 10px 4px',
                  fontFamily: MONO,
                  fontSize: 11,
                  fontStyle: 'italic',
                  color: '#6E6657',
                }}
              >
                {`// without vouqis: agent answers "No orders found."`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(21,18,14,0.12)',
          borderBottom: '1px solid rgba(21,18,14,0.12)',
          padding: '15px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)',
          WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            animation: 'vq-marquee 38s linear infinite',
            willChange: 'transform',
          }}
        >
          {[...TICKER_SIGS, ...TICKER_SIGS].map((sig, i) => (
            <span
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: 12.5,
                letterSpacing: '0.08em',
                color: '#5C564A',
                padding: '0 26px',
                display: 'inline-flex',
                gap: 26,
                alignItems: 'center',
              }}
            >
              {sig}
              <span style={{ color: '#ED4B2A', opacity: 0.5 }}>/</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section
        id="problem"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 24,
            marginBottom: 'clamp(48px,5vw,80px)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#ED4B2A',
                marginBottom: 20,
              }}
            >
              01 — The failure mode
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(34px,4.4vw,60px)',
                maxWidth: '22ch',
                margin: 0,
                color: '#15120E',
                lineHeight: 1.05,
              }}
            >
              Anatomy of a silent failure
            </h2>
          </div>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '38ch',
              margin: 0,
            }}
          >
            Every tool call is a contract between your agent and the outside
            world. Most tools break that contract{' '}
            <em style={{ fontStyle: 'italic', color: '#3B362C' }}>quietly</em> —
            with a success code and a body full of nothing.
          </p>
        </div>

        {/* Failures list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAILURES.map((f) => (
            <div
              key={f.n}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(20px,4vw,64px)',
                padding: 'clamp(28px,3.4vw,44px) 0',
                borderTop: '1px solid rgba(21,18,14,0.13)',
              }}
            >
              {/* Number */}
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(48px,5vw,76px)',
                  lineHeight: 0.8,
                  color: '#ED4B2A',
                  flex: '0 0 auto',
                  width: 84,
                }}
              >
                {f.n}
              </div>

              {/* Text block */}
              <div style={{ flex: '1 1 280px' }}>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 'clamp(24px,2.4vw,33px)',
                    margin: '0 0 12px',
                    color: '#15120E',
                    lineHeight: 1.15,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 16.5,
                    color: '#46402F',
                    maxWidth: '46ch',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {f.consequence}
                </p>
              </div>

              {/* Code block */}
              <div
                style={{
                  flex: '1 1 300px',
                  background: '#16130E',
                  borderRadius: 5,
                  padding: '18px 20px',
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: '#C9C2B2',
                  overflowX: 'auto',
                }}
              >
                <div
                  style={{
                    color: '#69B98D',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    marginBottom: 10,
                  }}
                >
                  {f.envelope}
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre', color: '#D8D1C1' }}>{f.payload}</pre>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(21,18,14,0.13)' }} />
      </section>

      {/* ── ARCHITECTURE ────────────────────────────────────────────────────── */}
      <section
        id="how"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'clamp(40px,5vw,64px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 20,
            }}
          >
            02 — The gateway
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
              maxWidth: '24ch',
            }}
          >
            A trust decision on{' '}
            <em style={{ fontStyle: 'italic', color: '#ED4B2A' }}>every</em>{' '}
            response.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '54ch',
              margin: 0,
            }}
          >
            Vouqis terminates the MCP connection on both sides. It reads every
            JSON-RPC frame in flight, validates the envelope, and refuses to pass
            a response your agent shouldn&apos;t act on.
          </p>
        </div>

        {/* FIG.02 — Architecture rails */}
        <figure
          style={{
            border: '1px solid rgba(21,18,14,0.16)',
            borderRadius: 8,
            background: '#F7F4EC',
            padding: 'clamp(24px,3vw,44px) clamp(20px,3vw,40px)',
            overflowX: 'auto',
            marginBottom: 'clamp(40px,4vw,56px)',
            margin: `0 0 clamp(40px,4vw,56px)`,
          }}
        >
          <div style={{ minWidth: 720 }}>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
                marginBottom: 30,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#7A7464',
              }}
            >
              <span>AGENT</span>
              <span style={{ color: '#ED4B2A', textAlign: 'center' }}>VOUQIS GATEWAY</span>
              <span style={{ textAlign: 'right' }}>MCP SERVER</span>
            </div>

            {/* REQUEST rail */}
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.2em',
                color: '#9A9486',
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              REQUEST →
            </div>
            <div
              style={{
                display: 'flex',
                gap: 4,
                alignItems: 'center',
                marginBottom: 26,
              }}
            >
              {/* Node: Agent */}
              <div style={railNode('light')}>
                <div style={railNodeKey}>AGENT</div>
                <div style={railNodeVal('light')}>claude-3.7</div>
              </div>
              {/* Connector */}
              <div style={connectorWrapper}>
                <div style={connectorChip('normal')}>tools/call · query_orders</div>
                <div style={arrowLine('normal')} />
              </div>
              {/* Node: Vouqis */}
              <div style={railNode('dark')}>
                <div style={railNodeKey}>VOUQIS</div>
                <div style={railNodeVal('dark')}>gateway :7070</div>
              </div>
              {/* Connector */}
              <div style={connectorWrapper}>
                <div style={connectorChip('normal')}>schema ✓ · forwarded</div>
                <div style={arrowLine('normal')} />
              </div>
              {/* Node: MCP */}
              <div style={railNode('light')}>
                <div style={railNodeKey}>MCP SERVER</div>
                <div style={railNodeVal('light')}>acme.dev/db</div>
              </div>
            </div>

            {/* RESPONSE rail */}
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.2em',
                color: '#9A9486',
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              RESPONSE →
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {/* Node: MCP */}
              <div style={railNode('light')}>
                <div style={railNodeKey}>MCP SERVER</div>
                <div style={railNodeVal('light')}>acme.dev/db</div>
              </div>
              {/* Connector BAD */}
              <div style={connectorWrapper}>
                <div style={connectorChip('bad')}>200 · result: null</div>
                <div style={arrowLine('bad')} />
              </div>
              {/* Node: Vouqis */}
              <div style={railNode('dark')}>
                <div style={railNodeKey}>VOUQIS</div>
                <div style={railNodeVal('dark')}>inspect envelope</div>
              </div>
              {/* Connector BAD */}
              <div style={connectorWrapper}>
                <div style={connectorChip('bad')}>✕ NULL_RESULT · held</div>
                <div style={arrowLine('bad')} />
              </div>
              {/* Node: Agent */}
              <div style={railNode('light')}>
                <div style={railNodeKey}>AGENT</div>
                <div style={railNodeVal('light')}>blocked</div>
              </div>
            </div>
          </div>

          <figcaption
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              color: '#7A7464',
              marginTop: 26,
              paddingTop: 16,
              borderTop: '1px solid rgba(21,18,14,0.12)',
            }}
          >
            FIG.02 — One round trip. The request is validated and forwarded; the
            response is inspected and{' '}
            <span style={{ color: '#ED4B2A' }}>held</span> before the agent can
            act on it.
          </figcaption>
        </figure>

        {/* Protocol inspection + checks */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(28px,4vw,56px)',
          }}
        >
          {/* LEFT — Protocol inspection */}
          <div style={{ flex: '1 1 420px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#9A9486',
                marginBottom: 14,
              }}
            >
              PROTOCOL INSPECTION
            </div>
            <div
              style={{
                background: '#16130E',
                borderRadius: 6,
                padding: '22px 24px',
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.8,
                color: '#C9C2B2',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#8C8473',
                  marginBottom: 12,
                }}
              >
                ↩ response frame · jsonrpc 2.0
              </div>
              <div style={{ color: '#8C8473' }}>{'{'}</div>
              <div>
                {'  '}
                <span style={{ color: '#9AB4C9' }}>&quot;jsonrpc&quot;</span>
                {': "2.0",   '}
                <span style={{ color: '#69B98D' }}>✓ valid</span>
              </div>
              <div>
                {'  '}
                <span style={{ color: '#9AB4C9' }}>&quot;id&quot;</span>
                {': 41,      '}
                <span style={{ color: '#69B98D' }}>✓ id match</span>
              </div>
              {/* Highlighted null row */}
              <div
                style={{
                  background: 'color-mix(in srgb, #ED4B2A 18%, transparent)',
                  margin: '2px -8px',
                  padding: '2px 8px 2px 18px',
                  borderRadius: 3,
                }}
              >
                {'  '}
                <span style={{ color: '#9AB4C9' }}>&quot;result&quot;</span>
                {': '}
                <span style={{ color: '#FF6A4D' }}>null</span>
                {'    '}
                <span style={{ color: '#FF6A4D' }}>✕ null on 200</span>
              </div>
              <div style={{ color: '#8C8473' }}>{'}'}</div>
              <div
                style={{
                  borderTop: '1px dashed rgba(255,255,255,0.12)',
                  paddingTop: 12,
                  marginTop: 14,
                  color: '#FF6A4D',
                  fontSize: 12,
                  whiteSpace: 'normal',
                }}
              >
                verdict —{' '}
                <strong>NULL_RESULT</strong> · held, not forwarded
              </div>
            </div>
          </div>

          {/* RIGHT — Inline checks */}
          <div style={{ flex: '1 1 320px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#9A9486',
                marginBottom: 14,
              }}
            >
              INLINE CHECKS · PER RESPONSE
            </div>
            {CHECKS.map((c) => (
              <div
                key={c.k}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '13px 0',
                  borderTop: '1px solid rgba(21,18,14,0.12)',
                  fontFamily: MONO,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  color: '#38332A',
                }}
              >
                <span style={{ color: '#ED4B2A', flex: '0 0 auto' }}>{c.k}</span>
                <span>{c.t}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)' }} />

            <p
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(20px,2vw,26px)',
                lineHeight: 1.3,
                color: '#15120E',
                marginTop: 22,
                maxWidth: '26ch',
              }}
            >
              Every request becomes a signal. Every failure becomes structured data.
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST SCORE ─────────────────────────────────────────────────────── */}
      <section
        id="trust"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 20,
            }}
          >
            03 — Trust intelligence
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
              maxWidth: '28ch',
            }}
          >
            Every server earns a reliability score.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '48ch',
              margin: 0,
            }}
          >
            Vouqis builds a reliability history for every MCP server it touches.
            Scores trend over time, fail classes are tracked, and SLIs surface
            the real health of your tool infrastructure.
          </p>
        </div>

        {/* Dark scorecard */}
        <div
          style={{
            background: '#16130E',
            borderRadius: 10,
            padding: 'clamp(24px,3vw,40px)',
            color: '#E9E3D5',
            boxShadow: '0 30px 70px -36px rgba(21,18,14,0.5)',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px 20px',
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 14, color: '#E9E3D5', flex: '0 0 auto' }}>
              mcp.acme.dev/db
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.14em',
                color: '#FF6A4D',
                border: '1px solid color-mix(in srgb, #ED4B2A 55%, transparent)',
                borderRadius: 2,
                padding: '4px 8px',
              }}
            >
              DEGRADED
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#8C8473' }}>
              trailing 30-day window · 1.2M requests
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(28px,4vw,56px)',
              padding: '28px 0',
            }}
          >
            {/* LEFT — Score */}
            <div style={{ flex: '1 1 300px' }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8C8473',
                  marginBottom: 10,
                }}
              >
                RELIABILITY SCORE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(64px,8vw,104px)',
                    lineHeight: 0.8,
                    color: '#fff',
                  }}
                >
                  72
                </span>
                <span style={{ fontFamily: MONO, fontSize: 20, color: '#8C8473' }}>/100</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#FF6A4D' }}>▼ 11 pts</span>
              </div>

              {/* Sparkline SVG */}
              <svg
                viewBox="0 0 320 70"
                style={{ width: '100%', height: 64, marginTop: 18, display: 'block' }}
              >
                <polyline
                  fill="none"
                  stroke="#FF6A4D"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  points="0,16 12,14 24,20 36,13 48,22 60,18 72,26 84,20 96,29 108,24 120,33 132,27 144,37 156,31 168,41 180,34 192,44 204,38 216,47 228,41 240,51 252,45 264,54 276,48 288,57 300,51 312,60 320,55"
                />
                <line
                  x1="0" y1="62" x2="320" y2="62"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              </svg>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: MONO,
                  fontSize: 10,
                  color: '#6E6657',
                  marginTop: 4,
                }}
              >
                <span>30d ago · 83</span>
                <span>today · 72</span>
              </div>
            </div>

            {/* RIGHT — Failure breakdown */}
            <div style={{ flex: '1 1 320px' }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8C8473',
                  marginBottom: 14,
                }}
              >
                FAILURE CLASS BREAKDOWN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {FAILURE_CLASSES.map((fc) => (
                  <div key={fc.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11.5,
                        color: '#C9C2B2',
                        width: 148,
                        flexShrink: 0,
                      }}
                    >
                      {fc.name}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 7,
                        background: 'rgba(255,255,255,0.07)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: fc.pct,
                          height: '100%',
                          background: fc.color,
                          transformOrigin: 'left',
                          animation: 'vq-growX 1.2s cubic-bezier(0.16,1,0.3,1) both',
                          animationTimeline: 'view()',
                          animationRange: 'entry 8% cover 36%',
                        } as React.CSSProperties}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11.5,
                        color: '#8C8473',
                        width: 36,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {fc.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SLI grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            {SLIS.map((s) => (
              <div
                key={s.label}
                style={{
                  background: '#16130E',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#8C8473',
                    marginBottom: 8,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 19, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: '#6E6657', marginTop: 4 }}>
                  {s.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server table */}
        <div
          style={{
            marginTop: 'clamp(28px,3vw,40px)',
            border: '1px solid rgba(21,18,14,0.16)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              background: '#EDE8DD',
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.2fr 0.5fr 0.9fr',
              gap: 16,
              padding: `14px clamp(18px,2.5vw,28px)`,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#7A7464',
            }}
          >
            <span>MCP SERVER</span>
            <span>30-DAY TREND</span>
            <span style={{ textAlign: 'right' }}>SCORE</span>
            <span style={{ textAlign: 'right' }}>VERDICT</span>
          </div>

          {/* Table rows */}
          {SERVER_ROWS.map((r) => (
            <div
              key={r.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.2fr 0.5fr 0.9fr',
                gap: 16,
                alignItems: 'center',
                padding: `16px clamp(18px,2.5vw,28px)`,
                borderTop: '1px solid rgba(21,18,14,0.10)',
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 13, color: '#15120E' }}>{r.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.04em', color: r.color }}>{r.spark}</span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  textAlign: 'right',
                  color: '#15120E',
                }}
              >
                {r.score}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: '0.1em',
                  textAlign: 'right',
                  color: r.color,
                }}
              >
                {r.verdict}
              </span>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: '#7A7464', marginTop: 16 }}>
          FIG.03 — Server reliability history, trailing 30 days.{' '}
          <span style={{ color: '#9A9486' }}>Illustrative; your fleet, your numbers.</span>
        </div>
      </section>

      {/* ── DEMO ────────────────────────────────────────────────────────────── */}
      <section
        id="demo"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1320,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,56px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 20,
            }}
          >
            04 — See it run
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
            }}
          >
            Watch it catch one.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            One command in front of any MCP server. No SDK, no per-tool wrappers,
            no code changes.
          </p>
        </div>

        <TerminalDemo />
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section
        id="cta"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1100,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
          textAlign: 'left',
        }}
      >
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(40px,6.2vw,90px)',
            lineHeight: 0.98,
            letterSpacing: '-0.015em',
            maxWidth: '15ch',
            marginBottom: 'clamp(40px,5vw,60px)',
            color: '#15120E',
          }}
        >
          Catch silent failures{' '}
          <em style={{ fontStyle: 'italic', color: '#ED4B2A' }}>before</em>
          {' '}your users do.
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 18,
            marginBottom: 30,
          }}
        >
          <CopyButton size="lg" />
          <a
            href="#cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 56,
              padding: '0 26px',
              background: '#ED4B2A',
              color: '#FCEFE9',
              fontFamily: MONO,
              fontSize: 14,
              letterSpacing: '0.02em',
              borderRadius: 3,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Join the design-partner program →
          </a>
          <a
            href="#"
            className="vq-text-link"
            style={{
              fontFamily: MONO,
              fontSize: 13,
              color: '#15120E',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(21,18,14,0.3)',
              paddingBottom: 3,
              transition: 'opacity 150ms ease',
            }}
          >
            read the docs
          </a>
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 12.5,
            letterSpacing: '0.04em',
            color: '#6B6557',
          }}
        >
          Free · Open source (AGPL-3.0) · Microseconds of overhead · 10 seconds to try
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#16130E',
          color: '#9A9387',
          padding: 'clamp(56px,6vw,88px) clamp(20px,5vw,72px) 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1500,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 48,
            justifyContent: 'space-between',
          }}
        >
          {/* Left */}
          <div style={{ flex: '1 1 280px', maxWidth: '34ch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#ED4B2A',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: '0.34em',
                  color: '#E9E3D5',
                }}
              >
                VOUQIS
              </span>
            </div>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 21,
                lineHeight: 1.35,
                color: '#C9C2B2',
                margin: 0,
              }}
            >
              The runtime trust layer for agent infrastructure.
            </p>
          </div>

          {/* Right: footer cols */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '48px 64px',
            }}
          >
            {FOOTER_COLS.map((col) => (
              <div key={col.h} style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 2.2 }}>
                <div
                  style={{
                    color: '#5C564A',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {col.h}
                </div>
                {col.items.map((item) => (
                  <div key={item}>
                    <a
                      href="#"
                      className="vq-text-link"
                      style={{
                        color: '#9A9387',
                        textDecoration: 'none',
                        transition: 'color 150ms ease',
                      }}
                    >
                      {item}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            maxWidth: 1500,
            margin: '48px auto 0',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontFamily: MONO,
            fontSize: 11.5,
            color: '#5C564A',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            justifyContent: 'space-between',
          }}
        >
          <span>© 2026 Vouqis · AGPL-3.0</span>
          <span>built for engineers tired of debugging silent agent failures</span>
        </div>
      </footer>
    </>
  )
}

// ── Architecture rail helpers ────────────────────────────────────────────────

function railNode(variant: 'light' | 'dark'): React.CSSProperties {
  return {
    flex: '0 0 auto',
    width: 150,
    background: variant === 'dark' ? '#16130E' : '#FFFFFF',
    border: variant === 'dark' ? '1.5px solid #ED4B2A' : '1px solid rgba(21,18,14,0.16)',
    borderRadius: 5,
    padding: '13px 12px',
    textAlign: 'center',
  }
}

const railNodeKey: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#7A7464',
  marginBottom: 4,
}

function railNodeVal(variant: 'light' | 'dark'): React.CSSProperties {
  return {
    fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
    fontSize: 12,
    color: variant === 'dark' ? '#E9E3D5' : '#15120E',
    fontWeight: 500,
  }
}

const connectorWrapper: React.CSSProperties = {
  flex: '1 1 60px',
  minWidth: 54,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
}

function connectorChip(type: 'normal' | 'bad'): React.CSSProperties {
  if (type === 'bad') {
    return {
      fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
      fontSize: 10,
      padding: '4px 8px',
      borderRadius: 3,
      whiteSpace: 'nowrap' as const,
      color: '#C23A1E',
      background: 'color-mix(in srgb, #ED4B2A 12%, #F7F4EC)',
      border: '1px solid color-mix(in srgb, #ED4B2A 45%, transparent)',
    }
  }
  return {
    fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
    fontSize: 10,
    padding: '4px 8px',
    borderRadius: 3,
    whiteSpace: 'nowrap' as const,
    color: '#15120E',
    background: 'rgba(21,18,14,0.05)',
    border: '1px solid rgba(21,18,14,0.12)',
  }
}

function arrowLine(type: 'normal' | 'bad'): React.CSSProperties {
  const lineColor = type === 'bad'
    ? 'color-mix(in srgb, #ED4B2A 55%, transparent)'
    : 'rgba(21,18,14,0.26)'

  return {
    width: '100%',
    height: 1,
    background: lineColor,
    position: 'relative' as const,
  }
}
