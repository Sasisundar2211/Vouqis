import { CopyButton } from '@/components/copy-button'
import { TerminalDemo } from '@/components/terminal-demo'

const CATCHES = [
  {
    code: 'NULL_RESULT',
    title: 'Null Responses',
    desc: 'The response succeeds but contains no usable result. HTTP 200 with result: null. The agent reads it as truth.',
  },
  {
    code: 'SCHEMA_DRIFT',
    title: 'Schema Violations',
    desc: 'The response shape changes unexpectedly. Required fields disappear. Field types silently change. The agent processes corrupt data.',
  },
  {
    code: 'TIMEOUT_AS_SUCCESS',
    title: 'Timeouts',
    desc: 'The tool never completes successfully but returns 200. The agent says "done." The action never happened.',
  },
]

const OUTPUTS = ['Failure Type', 'Severity', 'Tool Name', 'Timestamp']

const CHECKS = [
  { k: '01', t: 'Validates the JSON-RPC request' },
  { k: '02', t: 'Validates the response envelope' },
  { k: '03', t: 'Detects null / empty / malformed / timeout' },
  { k: '04', t: 'Classifies the failure (NULL_RESULT, SCHEMA_DRIFT…)' },
  { k: '05', t: 'Emits protocol-aware reliability telemetry' },
]

const GATEWAY_STATS = [
  { label: 'Requests',        value: '1,284', sub: 'last 24 hours',         alert: false },
  { label: 'Blocked',         value: '23',    sub: 'silent failures caught', alert: true  },
  { label: 'Failure rate',    value: '1.8%',  sub: 'of all tool calls',     alert: false },
  { label: 'Vouqis overhead', value: '4 ms',  sub: 'p95 latency added',     alert: false },
]

const REQUEST_FEED = [
  { id: '#1284', tool: 'create_invoice',   status: 'BLOCKED', reason: 'Missing Required Field', ts: '12:31:05', ms: null    },
  { id: '#1283', tool: 'search_documents', status: 'PASSED',  reason: null,                      ts: '12:31:04', ms: '84 ms' },
  { id: '#1282', tool: 'query_orders',     status: 'BLOCKED', reason: 'NULL_RESULT',             ts: '12:31:01', ms: null    },
  { id: '#1281', tool: 'get_user_profile', status: 'PASSED',  reason: null,                      ts: '12:30:58', ms: '61 ms' },
  { id: '#1280', tool: 'update_record',    status: 'BLOCKED', reason: 'SCHEMA_DRIFT',            ts: '12:30:55', ms: null    },
]

const FAILURE_BREAKDOWN = [
  { type: 'Schema Violations', count: 12, pct: '52%' },
  { type: 'Null Responses',    count: 7,  pct: '30%' },
  { type: 'Timeouts',          count: 4,  pct: '18%' },
]

const PARTNER_BENEFITS = [
  'Founder support — direct access to the Vouqis team',
  'Early access — shape the product before it ships',
  'Direct feedback loop — weekly check-ins during onboarding',
  'Product influence — your failures define the roadmap',
]

const FOOTER_COLS = [
  {
    h: 'Resources',
    items: [
      { label: 'Docs',       href: '/docs' },
      { label: 'GitHub',     href: 'https://github.com/Sasisundar2211/Vouqis' },
      { label: 'Changelog',  href: '/changelog' },
    ],
  },
  {
    h: 'Company',
    items: [
      { label: 'Design partners', href: '/design-partner' },
      { label: 'Blog',            href: '/blog' },
      { label: 'Contact',         href: 'mailto:hello@vouqis.tech' },
    ],
  },
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
                maxWidth: '14ch',
                margin: '0 0 28px',
                color: '#15120E',
              }}
            >
              Catch MCP failures{' '}
              <em
                style={{
                  position: 'relative',
                  fontStyle: 'italic',
                  color: '#ED4B2A',
                  whiteSpace: 'nowrap',
                }}
              >
                before
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '0.08em',
                    height: 3,
                    background: '#ED4B2A',
                    opacity: 0.28,
                  }}
                />
              </em>{' '}
              your users do.
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
              Vouqis is a reliability gateway for MCP servers. It sits between your
              AI agent and MCP server, detecting silent failures — null results,
              schema drift, timeouts — before they reach production.
            </p>

            {/* CTA row */}
            <div
              className="vq-cta-row"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                marginBottom: 28,
              }}
            >
              <a
                href="/design-partner"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 52,
                  padding: '0 24px',
                  background: '#15120E',
                  color: '#E9E3D5',
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                }}
              >
                Join Design Partners →
              </a>
              <a
                href="/docs"
                className="vq-text-link"
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: '#15120E',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(21,18,14,0.3)',
                  paddingBottom: 3,
                  transition: 'opacity 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Read Documentation →
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
              {['Free', 'Open source (MIT)', 'Design-partner program open', 'Microseconds of overhead'].map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
          </div>

          {/* Right column — Response Inspector */}
          <div className="vq-hero-rhs" style={{ flex: '1 1 380px', minWidth: 320, display: 'flex', justifyContent: 'flex-end' }}>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 'clamp(48px,5vw,80px)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(38px,5vw,68px)',
                lineHeight: 1.0,
                color: '#15120E',
                margin: '0 0 4px',
              }}
            >
              Your agent reported success.
            </h2>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(38px,5vw,68px)',
                lineHeight: 1.0,
                color: '#ED4B2A',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              The action never happened.
            </h2>
          </div>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.65,
              color: '#5C564A',
              maxWidth: '42ch',
              margin: 0,
            }}
          >
            MCP servers can return null responses, schema violations, or timeouts
            while the agent continues as if everything succeeded. Most teams
            discover these failures after a customer reports them.
          </p>
        </div>

        {/* Failure evidence blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 1,
            background: 'rgba(21,18,14,0.10)',
            border: '1px solid rgba(21,18,14,0.10)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'HTTP status', value: '200 OK', color: '#69B98D' },
            { label: 'Result',      value: 'null',   color: '#FF6A4D' },
            { label: 'Agent verdict', value: '"No orders found."', color: '#C9C2B2' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: '#EFEAE0',
                padding: 'clamp(20px,2.5vw,30px) clamp(20px,2.5vw,28px)',
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9A9486',
                  marginBottom: 10,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 'clamp(18px,2vw,26px)',
                  color: item.color,
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(18px,1.8vw,24px)',
            lineHeight: 1.4,
            color: '#5C564A',
            margin: 'clamp(28px,3vw,40px) 0 0',
            maxWidth: '52ch',
          }}
        >
          The HTTP layer said success. The JSON-RPC layer said success. The agent
          acted on nothing. Vouqis sits in the middle and catches it.
        </p>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
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
            How it works
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
              <div style={railNode('light')}>
                <div style={railNodeKey}>AGENT</div>
                <div style={railNodeVal('light')}>claude-3.7</div>
              </div>
              <div style={connectorWrapper}>
                <div style={connectorChip('normal')}>tools/call · query_orders</div>
                <div style={arrowLine('normal')} />
              </div>
              <div style={railNode('dark')}>
                <div style={railNodeKey}>VOUQIS</div>
                <div style={railNodeVal('dark')}>gateway :4444</div>
              </div>
              <div style={connectorWrapper}>
                <div style={connectorChip('normal')}>schema ✓ · forwarded</div>
                <div style={arrowLine('normal')} />
              </div>
              <div style={railNode('light')}>
                <div style={railNodeKey}>MCP SERVER</div>
                <div style={railNodeVal('light')}>127.0.0.1:3010</div>
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
              <div style={railNode('light')}>
                <div style={railNodeKey}>MCP SERVER</div>
                <div style={railNodeVal('light')}>127.0.0.1:3010</div>
              </div>
              <div style={connectorWrapper}>
                <div style={connectorChip('bad')}>200 · result: null</div>
                <div style={arrowLine('bad')} />
              </div>
              <div style={railNode('dark')}>
                <div style={railNodeKey}>VOUQIS</div>
                <div style={railNodeVal('dark')}>inspect envelope</div>
              </div>
              <div style={connectorWrapper}>
                <div style={connectorChip('bad')}>✕ NULL_RESULT · held</div>
                <div style={arrowLine('bad')} />
              </div>
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
            One round trip. The request is validated and forwarded; the response is
            inspected and{' '}
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
              <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#8C8473', marginBottom: 12 }}>
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
                verdict — <strong>NULL_RESULT</strong> · held, not forwarded
              </div>
            </div>
          </div>

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

      {/* ── WHAT VOUQIS CATCHES ─────────────────────────────────────────────── */}
      <section
        id="catches"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
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
            What Vouqis catches
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
            Three failure classes. One gateway. Every blocked response is a
            structured audit entry your team can act on.
          </p>
        </div>

        {/* Failure type rows */}
        <div>
          {CATCHES.map((c, i) => (
            <div
              key={c.code}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(20px,3vw,48px)',
                padding: 'clamp(24px,3vw,36px) 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
                borderBottom: i === CATCHES.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
                alignItems: 'flex-start',
              }}
            >
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: '#FF6A4D',
                  background: 'color-mix(in srgb, #FF6A4D 10%, #EFEAE0)',
                  padding: '4px 10px',
                  borderRadius: 3,
                  flex: '0 0 auto',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
              >
                {c.code}
              </code>
              <div style={{ flex: '1 1 260px' }}>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 'clamp(22px,2.2vw,30px)',
                    color: '#15120E',
                    margin: '0 0 10px',
                    lineHeight: 1.15,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: '#5C564A',
                    margin: 0,
                    maxWidth: '50ch',
                  }}
                >
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div style={{ marginTop: 'clamp(32px,4vw,48px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9A9486',
              marginBottom: 16,
            }}
          >
            Every blocked response includes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
            {OUTPUTS.map((o) => (
              <span
                key={o}
                style={{
                  fontFamily: MONO,
                  fontSize: 12.5,
                  color: '#38332A',
                  background: 'rgba(21,18,14,0.05)',
                  border: '1px solid rgba(21,18,14,0.12)',
                  padding: '6px 14px',
                  borderRadius: 3,
                }}
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── GATEWAY INTEL ───────────────────────────────────────────────────── */}
      <section
        id="intel"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
              maxWidth: '26ch',
            }}
          >
            Every blocked response has a paper trail.
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
            Vouqis intercepts every tool call, validates the response, and blocks
            anything your agent shouldn&apos;t act on — with a structured record
            of what it caught and why.
          </p>
        </div>

        {/* Metrics bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 1,
            background: 'rgba(21,18,14,0.10)',
            border: '1px solid rgba(21,18,14,0.12)',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 'clamp(20px,3vw,32px)',
          }}
        >
          {GATEWAY_STATS.map((s) => (
            <div key={s.label} style={{ background: '#EFEAE0', padding: 'clamp(14px,2vw,20px) clamp(16px,2vw,22px)' }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#8C8473',
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(26px,3vw,38px)',
                  color: s.alert ? '#ED4B2A' : '#15120E',
                  lineHeight: 0.95,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: '#8C8473' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Request feed */}
        <div
          style={{
            background: '#16130E',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 'clamp(20px,3vw,32px)',
            boxShadow: '0 30px 70px -36px rgba(21,18,14,0.45)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              padding: '13px clamp(16px,2vw,22px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8C8473' }}>
              Live gateway log
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', color: '#69B98D' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#69B98D', animation: 'vq-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
              INTERCEPTING
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 560 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1.4fr 110px 1fr 80px',
                  gap: 12,
                  padding: '10px clamp(16px,2vw,22px)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4A4540',
                }}
              >
                <span>REQ</span>
                <span>TOOL</span>
                <span>STATUS</span>
                <span>REASON</span>
                <span style={{ textAlign: 'right' }}>TIME</span>
              </div>

              {REQUEST_FEED.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1.4fr 110px 1fr 80px',
                    gap: 12,
                    alignItems: 'center',
                    padding: `14px clamp(16px,2vw,22px)`,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4540' }}>{r.id}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: '#C9C2B2' }}>{r.tool}</span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: r.status === 'BLOCKED' ? '#FF6A4D' : '#69B98D',
                      fontWeight: r.status === 'BLOCKED' ? 600 : 400,
                    }}
                  >
                    {r.status === 'BLOCKED' ? '✕  BLOCKED' : '✓  PASSED'}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: r.status === 'BLOCKED' ? '#C46A52' : '#4A4540' }}>
                    {r.reason ?? (r.ms ? r.ms : '—')}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4540', textAlign: 'right' }}>
                    {r.ts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,56px)' }}>
          <div style={{ flex: '1 1 260px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9A9486',
                marginBottom: 14,
              }}
            >
              Failure breakdown · last 24 h
            </div>
            {FAILURE_BREAKDOWN.map((f) => (
              <div
                key={f.type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  borderTop: '1px solid rgba(21,18,14,0.10)',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#38332A', flex: '1 1 auto' }}>
                  {f.type}
                </span>
                <span style={{ fontFamily: SERIF, fontSize: 26, color: '#15120E' }}>{f.count}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9A9486', width: 36, textAlign: 'right', flexShrink: 0 }}>
                  {f.pct}
                </span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.10)' }} />
          </div>

          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center' }}>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(22px,2.4vw,32px)',
                lineHeight: 1.22,
                color: '#15120E',
                margin: 0,
                maxWidth: '26ch',
              }}
            >
              23 responses blocked in 24 hours.{' '}
              <em style={{ fontStyle: 'italic', color: '#ED4B2A' }}>None</em>{' '}
              reached the agent.
            </p>
          </div>
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

        <div style={{ marginTop: 32 }}>
          <CopyButton size="sm" />
        </div>
      </section>

      {/* ── DESIGN PARTNER PROGRAM ──────────────────────────────────────────── */}
      <section
        id="partners"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1100,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(40px,6vw,88px)',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: '1 1 340px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#ED4B2A',
                marginBottom: 20,
              }}
            >
              Design partner program
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(34px,4.4vw,58px)',
                lineHeight: 1.02,
                color: '#15120E',
                margin: '0 0 20px',
                maxWidth: '18ch',
              }}
            >
              We&apos;re working with teams that have real failures.
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(15px,1.1vw,18px)',
                lineHeight: 1.65,
                color: '#5C564A',
                maxWidth: '44ch',
                margin: 0,
              }}
            >
              We&apos;re working with a small number of teams running MCP-powered
              systems in production. If your agents are failing silently today,
              this is for you.
            </p>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#9A9486',
                marginBottom: 16,
              }}
            >
              What you get
            </div>
            {PARTNER_BENEFITS.map((b, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '13px 0',
                  borderTop: '1px solid rgba(21,18,14,0.12)',
                  fontFamily: SANS,
                  fontSize: 15.5,
                  color: '#38332A',
                  lineHeight: 1.55,
                }}
              >
                <span style={{ color: '#69B98D', fontFamily: MONO, fontSize: 13, flexShrink: 0, marginTop: 2 }}>→</span>
                <span>{b}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)', marginBottom: 28 }} />

            <a
              href="/design-partner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 52,
                padding: '0 26px',
                background: '#ED4B2A',
                color: '#FCEFE9',
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                borderRadius: 3,
              }}
            >
              Apply now →
            </a>
          </div>
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

          {/* Footer columns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px 64px' }}>
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
                  <div key={item.label}>
                    <a
                      href={item.href}
                      className="vq-text-link"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{
                        color: '#9A9387',
                        textDecoration: 'none',
                        transition: 'color 150ms ease',
                      }}
                    >
                      {item.label}
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
          <span>© 2026 Vouqis · MIT</span>
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
