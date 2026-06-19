import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docs — Vouqis',
  description: 'Vouqis documentation: installation, quick start, failure classes, CLI reference, and telemetry.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const NAV = [
  { label: 'Getting Started', id: 'getting-started' },
  { label: 'Failure Classes',  id: 'failure-classes' },
  { label: 'CLI Reference',    id: 'cli-reference' },
  { label: 'Telemetry',        id: 'telemetry' },
]

const FAILURE_CLASSES = [
  {
    code: 'NULL_RESULT',
    title: 'Null Response',
    desc: 'The MCP tool returned HTTP 200 with a JSON-RPC success envelope, but the result field is null. The agent has no usable data and no indication of failure.',
    example: '{ "jsonrpc": "2.0", "id": 1, "result": null }',
  },
  {
    code: 'SCHEMA_DRIFT',
    title: 'Schema Violation',
    desc: 'The response shape does not match the expected output schema for the tool. Required fields are missing, field types have changed, or unexpected fields are present that indicate a server-side breaking change.',
    example: '{ "jsonrpc": "2.0", "id": 1, "result": { "items": null } }',
  },
  {
    code: 'TIMEOUT_AS_SUCCESS',
    title: 'Timeout Dressed as Success',
    desc: 'The tool completed after the configured timeout threshold, but returned HTTP 200 instead of an error. The result may be stale, partial, or based on an operation that was never committed.',
    example: '{ "jsonrpc": "2.0", "id": 1, "result": { "status": "ok" } }  // latency: 30,041 ms',
  },
  {
    code: 'EMPTY_CONTENT',
    title: 'Empty Content Array',
    desc: 'The result field is present but contains an empty content array. The agent interprets this as "no results found" when the actual cause is a tool failure.',
    example: '{ "jsonrpc": "2.0", "id": 1, "result": { "content": [] } }',
  },
]

const CLI_FLAGS = [
  { flag: '--upstream <url>', desc: 'URL of the MCP server to proxy. Required.' },
  { flag: '--port <number>',  desc: 'Port for the gateway to listen on. Default: 4444.' },
  { flag: '--host <host>',    desc: 'Host interface. Default: 127.0.0.1.' },
  { flag: '--timeout <ms>',   desc: 'Request timeout in milliseconds. Default: 30000.' },
  { flag: '--log <path>',     desc: 'Path to the NDJSON audit log. Default: vouqis-audit.log.' },
  { flag: '--version',        desc: 'Print the installed version and exit.' },
]

export default function DocsPage() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,72px)',
        display: 'flex',
        gap: 'clamp(40px,6vw,80px)',
        alignItems: 'flex-start',
      }}
    >
      {/* Sidebar */}
      <nav
        aria-label="Documentation sections"
        style={{
          flex: '0 0 180px',
          position: 'sticky',
          top: 76,
        }}
        className="vq-docs-sidebar"
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#9A9486',
            marginBottom: 14,
          }}
        >
          Contents
        </div>
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="vq-nav-link"
            style={{
              display: 'block',
              fontFamily: MONO,
              fontSize: 12.5,
              color: '#5C564A',
              textDecoration: 'none',
              padding: '6px 0',
              borderLeft: '2px solid rgba(21,18,14,0.10)',
              paddingLeft: 12,
              transition: 'color 150ms ease',
              lineHeight: 1.4,
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: '1 1 0', minWidth: 0 }}>

        {/* Getting Started */}
        <section id="getting-started" style={{ marginBottom: 'clamp(56px,7vw,96px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Getting Started
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4vw,52px)',
              lineHeight: 1.05,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            What is Vouqis?
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '62ch',
              margin: '0 0 32px',
            }}
          >
            Vouqis is a reliability gateway that sits between AI agents and MCP servers. It
            validates every JSON-RPC request and response in real time, detecting silent failures
            before they reach your agent and cause downstream incidents.
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '62ch',
              margin: '0 0 40px',
            }}
          >
            One command in front of any MCP server. No SDK, no per-tool wrappers, no code changes
            in your agent.
          </p>

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '0 0 12px',
            }}
          >
            Installation
          </h2>
          <CodeBlock code="npm install -g @vouqis/cli" />

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '32px 0 12px',
            }}
          >
            Quick Start
          </h2>
          <CodeBlock code="vouqis proxy --upstream http://127.0.0.1:3010" />
          <p
            style={{
              fontFamily: SANS,
              fontSize: 14.5,
              lineHeight: 1.65,
              color: '#5C564A',
              maxWidth: '58ch',
              marginTop: 14,
            }}
          >
            This starts the gateway on <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>127.0.0.1:4444</code>.
            Point your AI agent at the gateway instead of the MCP server directly. Vouqis intercepts
            every tool call, validates the response, and blocks anything your agent shouldn&apos;t act on.
          </p>

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '32px 0 16px',
            }}
          >
            Architecture
          </h2>
          <div
            style={{
              background: '#16130E',
              borderRadius: 6,
              padding: '22px 26px',
              fontFamily: MONO,
              fontSize: 13,
              lineHeight: 2.2,
              color: '#C9C2B2',
              display: 'inline-block',
            }}
          >
            <div style={{ color: '#8C8473' }}>AI Agent</div>
            <div style={{ color: '#4A4540' }}>  ↓</div>
            <div style={{ color: '#ED4B2A' }}>Vouqis Gateway <span style={{ color: '#4A4540', fontSize: 11 }}>(validates every frame)</span></div>
            <div style={{ color: '#4A4540' }}>  ↓</div>
            <div style={{ color: '#8C8473' }}>MCP Server</div>
          </div>
        </section>

        {/* Failure Classes */}
        <section id="failure-classes" style={{ marginBottom: 'clamp(56px,7vw,96px)', paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Failure Classes
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            What Vouqis catches
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '58ch',
              margin: '0 0 36px',
            }}
          >
            Every blocked response is classified with a failure code, severity level, tool name, and timestamp. The audit log is NDJSON — grep-able, tail-able, pipe-able.
          </p>
          {FAILURE_CLASSES.map((fc) => (
            <div
              key={fc.code}
              style={{
                padding: 'clamp(20px,2.4vw,28px) 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    color: '#FF6A4D',
                    background: 'color-mix(in srgb, #FF6A4D 10%, #EFEAE0)',
                    padding: '3px 8px',
                    borderRadius: 3,
                  }}
                >
                  {fc.code}
                </code>
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: '#15120E' }}>
                  {fc.title}
                </span>
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: '#5C564A',
                  maxWidth: '60ch',
                  margin: '0 0 14px',
                }}
              >
                {fc.desc}
              </p>
              <CodeBlock code={fc.example} />
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)' }} />
        </section>

        {/* CLI Reference */}
        <section id="cli-reference" style={{ marginBottom: 'clamp(56px,7vw,96px)', paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            CLI Reference
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 28px',
            }}
          >
            vouqis proxy
          </h2>
          <CodeBlock code="vouqis proxy --upstream <url> [options]" />
          <div style={{ marginTop: 28 }}>
            {CLI_FLAGS.map((f, i) => (
              <div
                key={f.flag}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '14px 0',
                  borderTop: i === 0 ? '1px solid rgba(21,18,14,0.12)' : undefined,
                  borderBottom: '1px solid rgba(21,18,14,0.12)',
                }}
              >
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    color: '#15120E',
                    flex: '0 0 auto',
                    minWidth: 220,
                  }}
                >
                  {f.flag}
                </code>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: '#5C564A', flex: '1 1 200px' }}>
                  {f.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Telemetry */}
        <section id="telemetry" style={{ paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Telemetry
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            Anonymous usage data
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '58ch',
              margin: '0 0 20px',
            }}
          >
            Vouqis collects anonymous usage telemetry via PostHog to understand which failure
            classes are most common and how the gateway is being used. We never collect request or
            response content, full upstream URLs, authentication tokens, or any personally
            identifiable information.
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '58ch',
              margin: 0,
            }}
          >
            To opt out, run without the <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>POSTHOG_API_KEY</code> environment
            variable. The SDK disables itself completely when the key is absent.
          </p>
        </section>

      </main>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div
      style={{
        background: '#16130E',
        borderRadius: 5,
        padding: '14px 18px',
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: 1.7,
        color: '#C9C2B2',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}
    >
      {code}
    </div>
  )
}
