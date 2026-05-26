import Link from 'next/link'
import CopyButton from '@/components/copy-button'

const INSTALL_CMD = 'npm install -g @vouqis/cli'

export default function LandingPage() {
  return (
    <div style={{backgroundColor: '#0a0a0a', color: '#e2e8f0', fontFamily: 'var(--font-geist-sans)'}}>

      {/* SECTION 0: Launch urgency banner */}
      <div
        style={{
          backgroundColor: '#14532d',
          borderBottom: '1px solid #166534',
          padding: '8px 16px',
          textAlign: 'center',
        }}
      >
        <p style={{fontSize: '12px', color: '#4ade80', fontFamily: 'var(--font-geist-mono)', margin: 0}}>
          Launch pricing — first 50 users only · $9/mo locks in forever ·{' '}
          <Link href="/pro" style={{color: '#4ade80', textDecoration: 'underline', fontWeight: 700}}>
            Claim your spot →
          </Link>
        </p>
      </div>

      {/* SECTION 1: Hero */}
      <section style={{padding: '80px 24px 64px', textAlign: 'center'}}>
        <div style={{maxWidth: '640px', margin: '0 auto'}}>
          {/* Badge */}
          <div style={{marginBottom: '24px'}}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#14532d',
                border: '1px solid #166534',
                color: '#4ade80',
                fontSize: '11px',
                fontFamily: 'var(--font-geist-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '999px',
              }}
            >
              Now live · Vouqis v1
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#e2e8f0',
              marginBottom: '24px',
            }}
          >
            Score any MCP server<br />
            <span style={{color: '#4ade80'}}>before your agent trusts it.</span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              maxWidth: '560px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            10 deterministic JSON-RPC probes. 0–100 trust score. CI/CD gate. No LLM calls. Results in 30 seconds.
          </p>

          {/* Install command */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              maxWidth: '480px',
              margin: '0 auto 16px',
            }}
          >
            <code style={{fontFamily: 'var(--font-geist-mono)', fontSize: '14px', color: '#4ade80', flex: 1, textAlign: 'left'}}>
              $ npm install -g @vouqis/cli
            </code>
            <CopyButton text={INSTALL_CMD} />
          </div>

          {/* Primary CTA */}
          <div style={{maxWidth: '480px', margin: '0 auto 16px'}}>
            <Link
              href="/pro"
              style={{
                display: 'block',
                backgroundColor: '#4ade80',
                color: '#052e16',
                fontWeight: 700,
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '15px',
                borderRadius: '8px',
                padding: '14px 24px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Get Pro for $9/mo — Lock in launch price →
            </Link>
          </div>

          {/* Below buttons note */}
          <p style={{fontSize: '12px', color: '#475569', fontFamily: 'var(--font-geist-mono)'}}>
            Free for single audits · No account needed · Cancel anytime
          </p>
        </div>
      </section>

      {/* SECTION 2: 3-stat strip */}
      <section style={{padding: '0 24px 64px'}}>
        <div
          className="max-w-4xl mx-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              num: '71%',
              label: 'median MCP tool call success rate',
              sub: '1 in 3 tool calls fails silently',
            },
            {
              num: '18%',
              label: '5-tool chain end-to-end success',
              sub: 'compounding unreliability at 71% per tool',
            },
            {
              num: '30s',
              label: 'time to your first trust score',
              sub: 'no account, no config, no SDK changes',
            },
          ].map((stat) => (
            <div
              key={stat.num}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '28px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#4ade80',
                  fontFamily: 'var(--font-geist-mono)',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {stat.num}
              </div>
              <div style={{fontSize: '13px', color: '#e2e8f0', fontWeight: 600, marginBottom: '4px'}}>
                {stat.label}
              </div>
              <div style={{fontSize: '12px', color: '#475569', fontFamily: 'var(--font-geist-mono)'}}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Live terminal demo */}
      <section style={{padding: '0 24px 80px'}}>
        <div style={{maxWidth: '720px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            See it in action
          </p>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '28px',
              letterSpacing: '-0.02em',
            }}
          >
            Real audit. Real server. 92/100.
          </h2>

          {/* Terminal window */}
          <div
            style={{
              backgroundColor: '#0d0d0d',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {/* Terminal top bar */}
            <div
              style={{
                backgroundColor: '#161616',
                borderBottom: '1px solid #1e293b',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block'}} />
              <span style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block'}} />
              <span style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block'}} />
            </div>

            {/* Terminal content */}
            <pre
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '13px',
                lineHeight: 1.7,
                padding: '24px',
                margin: 0,
                overflowX: 'auto',
                color: '#94a3b8',
              }}
            >
              <span style={{color: '#e2e8f0'}}>{'$ vouqis audit https://mcp.exa.ai/mcp'}</span>{'\n\n'}
              <span style={{color: '#4ade80'}}>{'  Vouqis — MCP Trust Auditor'}</span>{'\n\n'}
              {'  '}<span style={{color: '#64748b'}}>● Running 10 probes against mcp.exa.ai...</span>{'\n\n'}
              {'  mal-01  '}<span style={{color: '#4ade80'}}>✓</span>{'  malformed jsonrpc rejected          '}<span style={{color: '#f59e0b'}}>12ms</span>{'\n'}
              {'  mal-02  '}<span style={{color: '#ef4444'}}>✗</span>{'  silent acceptance (unexpected)      '}<span style={{color: '#f59e0b'}}>18ms</span>{'\n'}
              {'  mis-01  '}<span style={{color: '#4ade80'}}>✓</span>{'  missing params → error returned     '}<span style={{color: '#f59e0b'}}>340ms</span>{'\n'}
              {'  mis-02  '}<span style={{color: '#4ade80'}}>✓</span>{'  missing params → error returned     '}<span style={{color: '#f59e0b'}}>298ms</span>{'\n'}
              {'  tmo-01  '}<span style={{color: '#4ade80'}}>✓</span>{'  response within 500ms               '}<span style={{color: '#f59e0b'}}>487ms</span>{'\n'}
              {'  tmo-02  '}<span style={{color: '#4ade80'}}>✓</span>{'  response within 500ms               '}<span style={{color: '#f59e0b'}}>412ms</span>{'\n'}
              {'  sch-01  '}<span style={{color: '#4ade80'}}>✓</span>{'  response schema valid               '}<span style={{color: '#f59e0b'}}>691ms</span>{'\n'}
              {'  sch-02  '}<span style={{color: '#4ade80'}}>✓</span>{'  response schema valid               '}<span style={{color: '#f59e0b'}}>623ms</span>{'\n'}
              {'  nul-01  '}<span style={{color: '#4ade80'}}>✓</span>{'  non-empty response returned         '}<span style={{color: '#f59e0b'}}>441ms</span>{'\n'}
              {'  nul-02  '}<span style={{color: '#4ade80'}}>✓</span>{'  non-empty response returned         '}<span style={{color: '#f59e0b'}}>398ms</span>{'\n\n'}
              {'  '}<span style={{color: '#1e293b'}}>─────────────────────────────────────────────</span>{'\n'}
              {'  Trust Score          '}<span style={{color: '#ffffff', fontWeight: 700}}>92 / 100</span>{'\n'}
              {'  Status               '}<span style={{color: '#4ade80'}}>✅ APPROVED</span>{'\n'}
              {'  Pass Rate            '}<span style={{color: '#e2e8f0'}}>9/10  (90%)</span>{'\n'}
              {'  P50 Latency          '}<span style={{color: '#f59e0b'}}>487ms</span>{'\n'}
              {'  '}<span style={{color: '#1e293b'}}>─────────────────────────────────────────────</span>{'\n'}
              {'  Report URL  →  '}<span style={{color: '#4ade80'}}>https://vouqis.tech/report/exa-20260526</span>
            </pre>
          </div>

          <p style={{fontSize: '14px', color: '#94a3b8', marginTop: '20px', lineHeight: 1.6}}>
            Every audit generates a shareable report URL. Put it in your README. Gate on it in CI.
          </p>
        </div>
      </section>

      {/* SECTION 4: The Problem */}
      <section style={{padding: '64px 24px', backgroundColor: '#060606', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            The Problem
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            HTTP 200 is not the same as &#39;this worked.&#39;
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              marginBottom: '32px',
            }}
          >
            {/* Left: explanatory text */}
            <div>
              <p style={{fontSize: '15px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '16px'}}>
                MCP servers fail at the protocol layer in ways that are completely invisible to standard monitoring.
              </p>
              <p style={{fontSize: '15px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '16px'}}>
                Your uptime dashboard shows green. Every HTTP response came back 200. But the server silently accepted a malformed JSON-RPC request it should have rejected. Or it hung on tools/call instead of failing fast.
              </p>
              <p style={{fontSize: '15px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '0'}}>
                The math is brutal:
              </p>
            </div>

            {/* Right: math card */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '16px',
                }}
              >
                If each MCP tool has 71% reliability:
              </p>
              {[
                {tool: 'Tool 1', val: '0.71', pct: '71%'},
                {tool: 'Tool 2', val: '0.71', pct: '50%'},
                {tool: 'Tool 3', val: '0.71', pct: '36%'},
                {tool: 'Tool 4', val: '0.71', pct: '25%'},
                {tool: 'Tool 5', val: '0.71', pct: '18%'},
              ].map((row, i) => (
                <div
                  key={row.tool}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '13px',
                    marginBottom: '8px',
                    color: i === 4 ? '#ef4444' : '#94a3b8',
                    fontWeight: i === 4 ? 700 : 400,
                  }}
                >
                  <span style={{width: '48px'}}>{row.tool}</span>
                  <span style={{color: '#475569'}}>×</span>
                  <span style={{width: '40px'}}>{row.val}</span>
                  <span style={{color: '#475569'}}>=</span>
                  <span style={{color: i === 4 ? '#ef4444' : '#4ade80', fontWeight: 700}}>
                    {row.pct}
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #1e293b',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
              >
                5-tool chain:{' '}
                <span style={{fontSize: '24px', fontWeight: 800, color: '#ef4444'}}>18%</span>
                {' '}end-to-end success
              </div>
            </div>
          </div>

          {/* Callout bar */}
          <div
            style={{
              borderLeft: '3px solid #4ade80',
              paddingLeft: '16px',
              color: '#94a3b8',
              fontSize: '15px',
              lineHeight: 1.6,
            }}
          >
            Standard monitoring is blind to this. Vouqis isn&#39;t.
          </div>
        </div>
      </section>

      {/* SECTION 5: How It Works */}
      <section style={{padding: '80px 24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            Three commands. One trust score.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-geist-mono)',
                  color: '#4ade80',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                01
              </div>
              <h3 style={{fontSize: '17px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px'}}>
                Install the CLI
              </h3>
              <code
                style={{
                  display: 'block',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#4ade80',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '12px',
                }}
              >
                npm install -g @vouqis/cli
              </code>
              <p style={{fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0}}>
                One command. No account required. Works anywhere Node.js runs.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-geist-mono)',
                  color: '#4ade80',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                02
              </div>
              <h3 style={{fontSize: '17px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px'}}>
                Audit any MCP server
              </h3>
              <code
                style={{
                  display: 'block',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#4ade80',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '12px',
                }}
              >
                vouqis audit https://your-mcp-server-url
              </code>
              <p style={{fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0}}>
                10 protocol-layer probes. Results in under 30 seconds. Shareable report URL generated automatically.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-geist-mono)',
                  color: '#4ade80',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                03
              </div>
              <h3 style={{fontSize: '17px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px'}}>
                Gate your CI/CD
              </h3>
              <code
                style={{
                  display: 'block',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#4ade80',
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '12px',
                  whiteSpace: 'pre',
                }}
              >
                {`vouqis audit $MCP_URL \\\n  --fail-below 80`}
              </code>
              <p style={{fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0}}>
                Exit code 1 if trust score drops below your threshold. Block deployments when reliability regresses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: 5 Probe Categories */}
      <section style={{padding: '0 24px 80px', backgroundColor: '#060606', borderTop: '1px solid #1e293b'}}>
        <div style={{maxWidth: '900px', margin: '0 auto', paddingTop: '64px'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            What We Test
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            10 probes across 5 failure modes.
          </h2>
          <p style={{fontSize: '15px', color: '#94a3b8', marginBottom: '40px', lineHeight: 1.6}}>
            Every probe tests a real-world failure pattern observed in production MCP servers.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                icon: '✗',
                iconColor: '#ef4444',
                title: 'Malformed Request Rejection',
                body: 'Does the server correctly reject JSON-RPC requests with invalid structure? A server that silently accepts malformed requests is a reliability and security risk.',
                badge: 'mal-01 · mal-02',
              },
              {
                icon: '!',
                iconColor: '#f59e0b',
                title: 'Missing Parameter Handling',
                body: 'Does the server return a proper error when required parameters are absent? Silent success on missing params produces undefined behavior downstream.',
                badge: 'mis-01 · mis-02',
              },
              {
                icon: '⏱',
                iconColor: '#4ade80',
                title: 'Latency Under 500ms',
                body: 'Does the server respond within 500ms on standard tool calls? High latency in chained MCP workflows compounds — a 1s server in a 5-tool chain costs 5+ seconds.',
                badge: 'tmo-01 · tmo-02',
              },
              {
                icon: '✓',
                iconColor: '#4ade80',
                title: 'Response Schema Compliance',
                body: 'Does the server return responses that conform to the JSON-RPC 2.0 spec? Schema drift causes silent failures in downstream consumers.',
                badge: 'sch-01 · sch-02',
              },
              {
                icon: '⚠',
                iconColor: '#f59e0b',
                title: 'Non-Empty Response Detection',
                body: 'Does the server return a non-null, non-empty response body? Empty success responses are a common source of silent failure in MCP workflows.',
                badge: 'nul-01 · nul-02',
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px'}}>
                  <span
                    style={{
                      fontSize: '18px',
                      color: card.iconColor,
                      fontFamily: 'var(--font-geist-mono)',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: '2px',
                    }}
                  >
                    {card.icon}
                  </span>
                  <h3 style={{fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0}}>
                    {card.title}
                  </h3>
                </div>
                <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '14px'}}>
                  {card.body}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1e293b',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: '#475569',
                    fontFamily: 'var(--font-geist-mono)',
                  }}
                >
                  {card.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Trust Score Formula & Tiers */}
      <section style={{padding: '80px 24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            The Score
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '32px',
              letterSpacing: '-0.02em',
            }}
          >
            A weighted formula. Not a vibe check.
          </h2>

          {/* Formula block */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '40px',
            }}
          >
            <pre
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '14px',
                color: '#4ade80',
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              {`Trust Score = (Pass Rate × 0.50)
            + (Latency Score × 0.30)
            + (Error Diversity × 0.20)`}
            </pre>
          </div>

          {/* Tier cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#0f1f0f',
                border: '1px solid #166534',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                <span
                  style={{
                    backgroundColor: '#14532d',
                    color: '#4ade80',
                    fontSize: '11px',
                    fontFamily: 'var(--font-geist-mono)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #166534',
                  }}
                >
                  APPROVED
                </span>
                <span style={{fontSize: '12px', color: '#4ade80', fontFamily: 'var(--font-geist-mono)'}}>80–100</span>
              </div>
              <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0}}>
                Your server handles the core reliability requirements. Safe to integrate and monitor.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#1a1200',
                border: '1px solid #78350f',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                <span
                  style={{
                    backgroundColor: '#451a03',
                    color: '#f59e0b',
                    fontSize: '11px',
                    fontFamily: 'var(--font-geist-mono)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #78350f',
                  }}
                >
                  RISKY
                </span>
                <span style={{fontSize: '12px', color: '#f59e0b', fontFamily: 'var(--font-geist-mono)'}}>50–79</span>
              </div>
              <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0}}>
                Some failure modes present. Acceptable for non-critical workflows, but investigate before production use.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#1a0505',
                border: '1px solid #7f1d1d',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                <span
                  style={{
                    backgroundColor: '#450a0a',
                    color: '#ef4444',
                    fontSize: '11px',
                    fontFamily: 'var(--font-geist-mono)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #7f1d1d',
                  }}
                >
                  DO NOT INTEGRATE
                </span>
                <span style={{fontSize: '12px', color: '#ef4444', fontFamily: 'var(--font-geist-mono)'}}>0–49</span>
              </div>
              <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0}}>
                Critical reliability issues detected. This server will cause downstream failures in production agent workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: vs The Alternatives */}
      <section style={{padding: '0 24px 80px', backgroundColor: '#060606', borderTop: '1px solid #1e293b'}}>
        <div style={{maxWidth: '900px', margin: '0 auto', paddingTop: '64px'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Why Vouqis
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            Not another static checklist.
          </h2>

          {/* Comparison table */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                backgroundColor: '#0a0a0a',
                borderBottom: '1px solid #1e293b',
              }}
            >
              {['Feature', 'MCPSkills / Scorecard', 'MCP Inspector', 'Vouqis'].map((h, i) => (
                <div
                  key={h}
                  style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-geist-mono)',
                    color: i === 3 ? '#4ade80' : '#475569',
                    fontWeight: i === 3 ? 700 : 400,
                    backgroundColor: i === 3 ? '#0f1f0f' : 'transparent',
                    borderRight: i < 3 ? '1px solid #1e293b' : 'none',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {[
              ['Active protocol probes', '✗', 'partial', '✓'],
              ['Quantified trust score', '✗', '✗', '✓'],
              ['Shareable report URL', '✗', '✗', '✓'],
              ['CI/CD integration gate', '✗', '✗', '✓'],
              ['No server-side changes needed', 'partial', '✗', '✓'],
            ].map((row, ri) => (
              <div
                key={row[0]}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  borderBottom: ri < 4 ? '1px solid #1e293b' : 'none',
                }}
              >
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontFamily: ci > 0 ? 'var(--font-geist-mono)' : 'var(--font-geist-sans)',
                      color:
                        ci === 0
                          ? '#94a3b8'
                          : ci === 3
                          ? '#4ade80'
                          : cell === '✗'
                          ? '#475569'
                          : '#f59e0b',
                      backgroundColor: ci === 3 ? '#0f1f0f' : 'transparent',
                      borderRight: ci < 3 ? '1px solid #1e293b' : 'none',
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: Real Risk Incidents */}
      <section style={{padding: '80px 24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Why This Matters
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            MCP servers have already caused real incidents.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {[
              {
                title: 'Asana MCP — Customer Data Exposure',
                body: 'Malformed tool call responses exposed customer data. The issue persisted for 2 weeks before detection. Standard monitoring showed zero anomalies.',
                tags: ['data exposure', '2-week persistence'],
              },
              {
                title: 'Smithery Path Traversal',
                body: 'Path traversal vulnerability affecting 3,243 MCP servers simultaneously. Discoverable via protocol-layer probing — invisible to HTTP monitoring.',
                tags: ['path traversal', '3,243 servers affected'],
              },
              {
                title: 'mcp-remote CVE-2025-6514',
                body: 'Remote code execution vulnerability, CVSS score 9.6. The kind of issue that a well-implemented malformed-request probe catches at the protocol layer before integration.',
                tags: ['RCE', 'CVSS 9.6'],
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderLeft: '3px solid #ef4444',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <h3 style={{fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px', lineHeight: 1.4}}>
                  {card.title}
                </h3>
                <p style={{fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px'}}>
                  {card.body}
                </p>
                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#1a0505',
                        border: '1px solid #7f1d1d',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontFamily: 'var(--font-geist-mono)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: 1.6}}>
            Vouqis doesn&#39;t prevent these vulnerabilities. It detects the behavioral signatures that indicate a server isn&#39;t handling edge cases correctly — before you integrate it.
          </p>
        </div>
      </section>

      {/* SECTION 10: Pricing */}
      <section style={{padding: '0 24px 80px', backgroundColor: '#060606', borderTop: '1px solid #1e293b'}}>
        <div style={{maxWidth: '760px', margin: '0 auto', paddingTop: '64px'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Pricing
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            Free to try. $9/mo to own.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Free card */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '32px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-geist-mono)',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                Free
              </p>
              <div style={{display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px'}}>
                <span style={{fontSize: '40px', fontWeight: 800, color: '#e2e8f0', fontFamily: 'var(--font-geist-mono)'}}>$0</span>
              </div>
              <p style={{fontSize: '12px', color: '#475569', fontFamily: 'var(--font-geist-mono)', marginBottom: '24px'}}>Forever free</p>

              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '13px'}}>
                {[
                  {text: 'Single audit runs', included: true},
                  {text: '30-day report history', included: true},
                  {text: 'Public shareable reports', included: true},
                  {text: 'All 10 probes', included: true},
                  {text: 'Trust score + tier', included: true},
                  {text: 'API key for CI/CD', included: false},
                  {text: '90-day history', included: false},
                  {text: '--fail-below flag', included: false},
                ].map((f) => (
                  <li
                    key={f.text}
                    style={{
                      marginBottom: '8px',
                      color: f.included ? '#94a3b8' : '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{color: f.included ? '#4ade80' : '#374151', fontWeight: 700}}>
                      {f.included ? '✓' : '—'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '12px',
                  color: '#4ade80',
                }}
              >
                npm install -g @vouqis/cli
              </div>
            </div>

            {/* Pro card */}
            <div
              style={{
                backgroundColor: '#0f1f0f',
                border: '1px solid #166534',
                borderRadius: '12px',
                padding: '32px',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-geist-mono)',
                    color: '#4ade80',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: 0,
                  }}
                >
                  Pro
                </p>
                <span
                  style={{
                    backgroundColor: '#14532d',
                    color: '#4ade80',
                    fontSize: '10px',
                    fontFamily: 'var(--font-geist-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #166534',
                  }}
                >
                  Launch pricing — first 50 only
                </span>
              </div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px'}}>
                <span style={{fontSize: '40px', fontWeight: 800, color: '#4ade80', fontFamily: 'var(--font-geist-mono)'}}>$9</span>
                <span style={{fontSize: '13px', color: '#475569', fontFamily: 'var(--font-geist-mono)'}}>/mo · launch</span>
                <span style={{fontSize: '13px', color: '#374151', fontFamily: 'var(--font-geist-mono)', textDecoration: 'line-through'}}>$49</span>
              </div>
              <p style={{fontSize: '12px', color: '#475569', fontFamily: 'var(--font-geist-mono)', marginBottom: '24px'}}>Lock in forever. Cancel anytime.</p>

              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '13px'}}>
                {[
                  {text: 'Everything in Free', included: true, live: true},
                  {text: '90-day report history', included: true, live: true},
                  {text: 'Unlimited audit runs', included: true, live: true},
                  {text: 'API key for CI/CD pipelines', included: true, live: true},
                  {text: '--fail-below flag (CI/CD gate)', included: true, live: true},
                  {text: 'Private reports (team shareable)', included: true, live: false},
                  {text: 'Slack alerts on score regression', included: true, live: false},
                  {text: 'Priority support', included: true, live: true},
                ].map((f) => (
                  <li
                    key={f.text}
                    style={{
                      marginBottom: '8px',
                      color: f.live ? '#94a3b8' : '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{color: '#4ade80', fontWeight: 700}}>✓</span>
                    {f.text}
                    {!f.live && (
                      <span style={{color: '#374151', fontSize: '11px', fontFamily: 'var(--font-geist-mono)'}}>coming soon</span>
                    )}
                  </li>
                ))}
              </ul>

              <Link
                href="/pro"
                style={{
                  display: 'block',
                  backgroundColor: '#4ade80',
                  color: '#052e16',
                  fontWeight: 700,
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Get Pro for $9/mo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: Use Cases */}
      <section style={{padding: '80px 24px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Use Cases
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            Built for teams shipping AI agents.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                title: 'Before you integrate a vendor',
                body: 'Run a Vouqis audit before adding a third-party MCP server to your agent workflow. Know the trust score before your users experience the failures.',
              },
              {
                title: 'Before you deploy a new version',
                body: 'Add `vouqis audit --fail-below 80` to your CI pipeline. Block deployments when server reliability regresses. Catch regressions before production.',
              },
              {
                title: 'After every incident',
                body: 'MCP server behaved unexpectedly in production? Run a Vouqis audit immediately. The probe results tell you exactly which failure mode triggered — and whether the server is safe to re-enable.',
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '28px 24px',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#4ade80',
                    marginBottom: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  {card.title}
                </h3>
                <p style={{fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0}}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 12: FAQ */}
      <section style={{padding: '0 24px 80px', backgroundColor: '#060606', borderTop: '1px solid #1e293b'}}>
        <div style={{maxWidth: '720px', margin: '0 auto', paddingTop: '64px'}}>
          <p
            style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
            }}
          >
            Common questions.
          </h2>

          {[
            {
              q: 'Does my MCP server need any code changes?',
              a: 'No. Vouqis probes from the outside via JSON-RPC. Your server needs no SDK installation, no config changes, and no awareness of Vouqis. It just needs to be reachable at a URL.',
            },
            {
              q: 'How is this different from just checking if the server is up?',
              a: 'An uptime check confirms the server responds. Vouqis checks that the server responds correctly to edge cases — malformed requests, missing parameters, schema expectations. A server can have 100% uptime and still fail 3 out of 10 protocol-level probes.',
            },
            {
              q: 'What does the Pro API key do?',
              a: 'The Pro API key lets you run `vouqis audit` in CI/CD pipelines with the `--fail-below` flag. It also unlocks 90-day report history so you can track trust score over time and catch regressions across deploys.',
            },
            {
              q: 'Can I use Vouqis on a local MCP server?',
              a: 'Yes. Run `vouqis audit http://localhost:PORT` for local servers during development. The CLI works anywhere Node.js runs.',
            },
            {
              q: 'Is the audit deterministic?',
              a: 'Yes. All 10 probes are deterministic JSON-RPC calls — no LLM inference, no probabilistic behavior. The same server will produce the same score on every run (assuming server behavior is consistent).',
            },
            {
              q: 'What if my server scores below 80?',
              a: 'The audit output includes per-probe pass/fail results, so you know exactly which category failed. Most failures fall into one of two categories: error handling (missing/malformed request rejection) or latency (server responds too slowly). Both are fixable with targeted changes.',
            },
          ].map((item, i, arr) => (
            <div
              key={item.q}
              style={{
                paddingTop: '24px',
                paddingBottom: '24px',
                borderBottom: i < arr.length - 1 ? '1px solid #1e293b' : 'none',
              }}
            >
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px'}}>
                {item.q}
              </h3>
              <p style={{fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, margin: 0}}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 13: Final CTA */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid #166534',
          boxShadow: '0 0 80px 0 #14532d33',
          textAlign: 'center',
        }}
      >
        <div style={{maxWidth: '560px', margin: '0 auto'}}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#e2e8f0',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Your MCP server has a trust score.<br />
            Do you know what it is?
          </h2>
          <p style={{fontSize: '18px', color: '#94a3b8', marginBottom: '40px'}}>
            Find out in 30 seconds. Free.
          </p>

          {/* Install command */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              maxWidth: '480px',
              margin: '0 auto 16px',
            }}
          >
            <code style={{fontFamily: 'var(--font-geist-mono)', fontSize: '14px', color: '#4ade80', flex: 1, textAlign: 'left'}}>
              $ npm install -g @vouqis/cli
            </code>
            <CopyButton text={INSTALL_CMD} />
          </div>

          <div style={{maxWidth: '480px', margin: '0 auto 24px'}}>
            <Link
              href="/pro"
              style={{
                display: 'block',
                backgroundColor: '#4ade80',
                color: '#052e16',
                fontWeight: 700,
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '15px',
                borderRadius: '8px',
                padding: '14px 24px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Get Pro for $9/mo →
            </Link>
          </div>

          <p style={{fontSize: '12px', color: '#475569', fontFamily: 'var(--font-geist-mono)'}}>
            First 50 subscribers lock in $9/mo forever. After that, $49/mo.
          </p>
        </div>
      </section>

      {/* SECTION 14: Footer */}
      <footer
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #1e293b',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div>
            <p style={{fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px'}}>Vouqis</p>
            <p style={{fontSize: '13px', color: '#475569', margin: 0}}>Production reliability for MCP servers.</p>
          </div>
          <div style={{display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap'}}>
            <a
              href="https://github.com/Sasisundar2211/Vouqis"
              target="_blank"
              rel="noreferrer"
              style={{fontSize: '13px', color: '#94a3b8', textDecoration: 'none'}}
            >
              GitHub
            </a>
            <Link href="/pro" style={{fontSize: '13px', color: '#94a3b8', textDecoration: 'none'}}>
              Pro
            </Link>
            <a
              href="mailto:support@vouqis.tech"
              style={{fontSize: '13px', color: '#94a3b8', textDecoration: 'none'}}
            >
              support@vouqis.tech
            </a>
          </div>
        </div>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            borderTop: '1px solid #1e293b',
            paddingTop: '24px',
            fontSize: '12px',
            color: '#475569',
            fontFamily: 'var(--font-geist-mono)',
          }}
        >
          © 2026 Vouqis · Built by Sasi ·{' '}
          <a
            href="https://x.com/SasiSundar09"
            target="_blank"
            rel="noreferrer"
            style={{color: '#64748b', textDecoration: 'none'}}
          >
            @SasiSundar09
          </a>
        </div>
      </footer>
    </div>
  )
}
