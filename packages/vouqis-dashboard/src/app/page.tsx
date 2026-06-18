import { EmailCapture } from '@/components/email-capture'

const TRACE = [
  {
    ln: 1, time: '09:14:22',
    actor: '[agent]',   actorType: 'default' as const,
    dir: '→', content: 'tools/call  createInvoice({ "amount": 840 })',    contentType: 'default' as const,
  },
  {
    ln: 2, time: '09:14:23',
    actor: '[jira]',    actorType: 'default' as const,
    dir: '←', content: 'HTTP 200  { "success": true, "result": null }',   contentType: 'default' as const,
  },
  {
    ln: 3, time: '09:14:23',
    actor: '[vouqis]',  actorType: 'vouqis' as const,
    dir: ' ', content: '✓  envelope  jsonrpc: "2.0"  valid',              contentType: 'ok' as const,
  },
  {
    ln: 4, time: '09:14:23',
    actor: '[vouqis]',  actorType: 'vouqis' as const,
    dir: ' ', content: 'BLOCK  null_result  severity: HIGH',              contentType: 'incident' as const,
  },
]

const TRACE_REF = 'ref: TRC-8821  ·  tool: createInvoice  ·  upstream: jira.api'

const STATUS_CELLS = [
  { dot: 'dim',   label: 'Agent logged',        value: 'success: true' },
  { dot: 'amber', label: 'Action completed',    value: 'false' },
  { dot: 'amber', label: 'Time to discovery',   value: '33 min 48 sec' },
]

const WORKFLOW = [
  'Agent',
  'Vouqis',
  'MCP Server',
  'User',
]

const CAPABILITIES = [
  { label: 'Detect',      detail: 'Null results, schema mismatches, HTTP 200 errors' },
  { label: 'Classify',    detail: 'Tag failures by type before they propagate' },
  { label: 'Block',       detail: 'Halt calls that violate defined contracts' },
  { label: 'Retry',       detail: 'Re-attempt only idempotent methods within policy' },
  { label: 'Audit Log',   detail: 'Structured NDJSON record of every interaction' },
]

const BUILT_FOR = 'Founding Engineers running MCP-powered agents in production.'

const FAILURE_REPORTS = [
  {
    id: 'INC-001',
    type: 'Response Parse Failure',
    description:
      'MCP server returns HTTP 200 with an error object in the result field. Agent reads the status code, not the payload. Silent failure propagates downstream.',
    vector: 'tools/call → createTicket → HTTP 200 {"error":"quota_exceeded"} → agent: success',
  },
  {
    id: 'INC-002',
    type: 'Retry Masking',
    description:
      'Agent retries on timeout and logs each attempt independently. Upstream service deduplicates. Agent emits success×6 with no trace of the original failure or retry count.',
    vector: 'sendEmail → TIMEOUT → retry×6 → HTTP 200 (dedup) → logged: success',
  },
  {
    id: 'INC-003',
    type: 'State Drift — Multi-Agent',
    description:
      'Agent B reads shared state before Agent A finishes writing. Both log completion. The merge step processes a stale snapshot. Workflow corrupts silently at step 3.',
    vector: 'agent-A: writeState() → success | agent-B: readState(t−2s) → process(stale) → success',
  },
  {
    id: 'INC-004',
    type: 'Null Result Propagation',
    description:
      'Tool returns {"result": null}. Agent passes null to the next step. Failure surfaces eight steps later as a TypeError with no reference to the original null.',
    vector: 'fetchUser → {"result":null} → generateReport(null) → TypeError: cannot read "id" of null',
  },
]

const DESIGN_PARTNER_FEATURES = [
  'Proxy-based request + response validation',
  'Real-time failure classification and blocking',
  'Team dashboard with per-server reliability history',
  'Failure alerts via email or Slack',
  'Direct-to-founder support',
]

const FAQ_ITEMS = [
  {
    question: 'What exactly is Vouqis?',
    answer:
      'Vouqis is a proxy gateway that sits between your AI agent and your MCP server. Every tool call routes through Vouqis, which validates the request, forwards it upstream, validates the response, and classifies any failure before it reaches your agent. You get structured failure data and a reliability score per server — without changing your agent code.',
  },
  {
    question: 'Do I have to change my agent to use it?',
    answer:
      'No. The proxy is transparent — your agent never knows it exists. Deploy in under 60 seconds with no application code changes.',
  },
  {
    question: 'What failure types does Vouqis detect?',
    answer:
      'Null result propagation — `result: null` despite HTTP 200. Schema violations — JSON-RPC 2.0 envelope or tool schema mismatch. Timeout failures — upstream did not respond within SLA. Parse errors — response is not valid JSON. Retry masking — retried requests where the original failure is hidden. More failure signatures are added based on design partner incidents.',
  },
  {
    question: 'Does the proxy add latency?',
    answer:
      'Less than 10ms on the happy path at p95. Validation and audit logging are asynchronous — they do not block the response pipeline. Benchmark numbers are available in the repository.',
  },
  {
    question: 'What data does Vouqis log or store?',
    answer:
      'The audit log captures: timestamp, method, upstream hostname, latency, failure classification, and an internal ref ID. It never captures request/response content, full URLs, authentication tokens, or PII. The local proxy writes logs to your machine only. The cloud tier stores logs in your isolated workspace.',
  },
  {
    question: 'Is this open source?',
    answer:
      'The CLI proxy is open source: `github.com/Sasisundar2211/Vouqis`. The cloud dashboard and reliability intelligence are commercial products. You can run the proxy locally indefinitely at no cost.',
  },
  {
    question: 'We already use LangSmith. Why do we need this?',
    answer:
      'LangSmith traces LLM calls — prompts, tokens, agent chains, model outputs. It does not inspect MCP protocol behavior. Vouqis validates at the transport layer: JSON-RPC envelopes, response schemas, null results, timeout handling. They are complementary, not competing.',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-24 lg:pt-44 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-start">

          {/* Left: statement + CTAs */}
          <div>
            <h1
              className="text-[2.6rem] sm:text-5xl lg:text-[3.4rem] font-bold tracking-[-0.03em] leading-[1.06] text-balance mb-5"
            >
              Catch MCP failures{' '}
              <span className="text-foreground/45">before your users do.</span>
            </h1>

            <p className="font-mono text-[0.7rem] text-muted-foreground/40 mb-6 leading-relaxed border-l border-border/40 pl-3 max-w-[34ch]">
              Your agent said success.<br />The action never happened.
            </p>

            <p className="text-[0.9375rem] leading-relaxed text-foreground/60 mb-6 max-w-[38ch]">
              Vouqis sits between your AI agent and MCP server. Every tool
              call is validated. Every failure is classified. Nothing propagates
              silently.
            </p>

            <p className="font-mono text-[0.65rem] text-muted-foreground/50 mb-8">
              For Founding Engineers running MCP-powered agents in production.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <a
                href="#design-partner"
                className="inline-flex items-center h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Join Design Partner Program
              </a>
              <a
                href="https://calendly.com/sasisundar2211"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center h-10 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Book a Discovery Call →
              </a>
            </div>
          </div>

          {/* Right: terminal trace panel */}
          <div
            className="rounded-lg border border-border/60 bg-card/70 overflow-hidden"
            style={{ boxShadow: '0 0 0 1px oklch(1 0 0 / 0.04), 0 16px 48px -8px oklch(0 0 0 / 0.5)' }}
          >
            <div className="flex items-center gap-2 px-3.5 h-9 border-b border-border/40 bg-muted/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.55_0.18_25)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.68_0.14_82)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.60_0.17_145)]" />
              <span className="ml-3 text-[0.625rem] font-mono text-muted-foreground/45 tracking-wide">
                agent-session · vouqis/trace
              </span>
            </div>

            <div className="px-4 py-4 font-mono text-[0.7rem] leading-[1.85]">
              {TRACE.map((row, i) => (
                <div
                  key={row.ln}
                  className="trace-in flex"
                  style={{ animationDelay: `${0.45 + i * 0.3}s` }}
                >
                  <span className="w-[2ch] tabular-nums text-muted-foreground/25 select-none shrink-0 mr-2.5">
                    {row.ln}
                  </span>
                  <span className="w-[7.5ch] tabular-nums text-muted-foreground/40 shrink-0 mr-2.5">
                    {row.time}
                  </span>
                  <span
                    className={`w-[9ch] shrink-0 mr-2.5 ${
                      row.actorType === 'vouqis' ? 'text-vouqis-actor' : 'text-muted-foreground/60'
                    }`}
                  >
                    {row.actor}
                  </span>
                  <span className="w-[1.5ch] text-muted-foreground/40 shrink-0 mr-2.5 text-center">
                    {row.dir}
                  </span>
                  <span
                    className={`min-w-0 break-words ${
                      row.contentType === 'ok'
                        ? 'text-ok'
                        : row.contentType === 'incident'
                        ? 'text-incident font-medium'
                        : 'text-foreground/55'
                    }`}
                  >
                    {row.content}
                  </span>
                </div>
              ))}

              <div
                className="trace-in mt-0.5"
                style={{ animationDelay: '1.85s', paddingLeft: 'calc(20ch + 2.5rem)' }}
              >
                <span className="text-muted-foreground/30 text-[0.62rem]">
                  {TRACE_REF}
                </span>
              </div>

              <div className="trace-in mt-1 pl-4" style={{ animationDelay: '2.2s' }}>
                <span className="cursor-blink text-muted-foreground/30">▋</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Status cells ─────────────────────────────────────────────────── */}
      <section className="border-t border-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y divide-border/50 sm:divide-y-0 sm:divide-x sm:divide-border/50">
          {STATUS_CELLS.map(({ dot, label, value }) => (
            <div key={label} className="py-9 sm:px-10 first:sm:pl-0 last:sm:pr-0">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      dot === 'amber' ? 'var(--incident)' :
                      'oklch(0.38 0 0)',
                  }}
                />
                <span className="text-[0.65rem] font-mono text-muted-foreground/55 tracking-[0.05em] uppercase">
                  {label}
                </span>
              </div>
              <div
                className={`text-[1.35rem] font-mono font-medium tabular-nums ${
                  dot === 'amber' ? 'text-incident' : 'text-foreground/30'
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-[52ch]">
          <div className="mb-10 space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">Tool call succeeds.</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground/50">User outcome fails.</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The agent reports success.<br />
              Your customer reports the bug.
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Most MCP failures aren&rsquo;t crashes.
              They&rsquo;re silent failures.
            </p>
          </div>
        </div>
      </section>

      {/* ── Concrete Failure Example ─────────────────────────────────────── */}
      <section className="pb-20 border-b border-border/50">
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl items-center">
          <div
            className="rounded-lg border border-border/60 overflow-hidden"
            style={{ background: 'oklch(1 0 0 / 0.02)' }}
          >
            <div className="flex items-center px-3.5 h-8 border-b border-border/40">
              <span className="text-[0.6rem] font-mono text-muted-foreground/40 tracking-wide">
                MCP response
              </span>
            </div>
            <pre className="px-4 py-4 font-mono text-[0.72rem] leading-relaxed text-foreground/55 overflow-x-auto">{`{
  "success": true,
  "result": null
}`}</pre>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[0.65rem] font-mono text-muted-foreground/40 tracking-[0.06em] uppercase mb-2">
                Agent
              </p>
              <p className="text-sm text-foreground/70">&ldquo;Invoice created.&rdquo;</p>
            </div>
            <div className="h-px bg-border/40" />
            <div>
              <p className="text-[0.65rem] font-mono text-muted-foreground/40 tracking-[0.06em] uppercase mb-2">
                Reality
              </p>
              <p className="text-sm text-incident font-medium">No invoice exists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Diagram ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <h2 className="text-[0.9rem] font-semibold tracking-[-0.015em] leading-[1.4] mb-10 text-balance">
          How it works
        </h2>
        <div className="flex flex-col items-start max-w-[14rem]">
          {WORKFLOW.map((step, i) => (
            <div key={step} className="flex flex-col items-start w-full">
              <div
                className={`px-4 py-2.5 rounded border text-sm font-mono w-full ${
                  step === 'Vouqis'
                    ? 'border-foreground/20 text-foreground/80 bg-foreground/5'
                    : 'border-border/35 text-muted-foreground/60'
                }`}
              >
                {step}
              </div>
              {i < WORKFLOW.length - 1 && (
                <div className="pl-[1.35rem] py-1">
                  <span className="text-muted-foreground/30 text-xs leading-none">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────────── */}
      <section className="pb-20 border-b border-border/50">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-8">
          {CAPABILITIES.map(({ label, detail }) => (
            <div key={label}>
              <p className="text-sm font-semibold text-foreground/80 mb-1.5">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built For ────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <p className="text-sm text-foreground/75 leading-relaxed max-w-[45ch]">
          {BUILT_FOR}
        </p>
        <p className="text-xs text-muted-foreground/40 font-mono mt-3">Not for hobby projects.</p>
      </section>

      {/* ── Failure Reports ──────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 tracking-tight text-balance">
            Failure Reports We&rsquo;re Collecting
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
            Documented MCP failure patterns. Real failure modes, not marketing
            scenarios.{' '}
            <a
              href="mailto:sasisundhar2211@gmail.com"
              className="text-foreground/65 underline underline-offset-2 decoration-border hover:text-foreground transition-colors"
            >
              Send us one you&rsquo;ve encountered.
            </a>
          </p>
        </div>

        <div className="divide-y divide-border/40">
          {FAILURE_REPORTS.map((r) => (
            <div key={r.id} className="py-8 grid md:grid-cols-[8rem_1fr] gap-x-8 gap-y-3">
              <div className="pt-0.5">
                <span className="font-mono text-[0.65rem] text-muted-foreground/40 tabular-nums">
                  {r.id}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/85 mb-2">{r.type}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-[60ch]">
                  {r.description}
                </p>
                <div
                  className="font-mono text-[0.63rem] text-foreground/38 rounded-sm px-3 py-2.5 max-w-full overflow-x-auto"
                  style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.07)' }}
                >
                  <span className="text-muted-foreground/30 select-none mr-3">VECTOR</span>
                  <span className="whitespace-nowrap">{r.vector}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Credibility ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
          Built after observing repeated MCP reliability failures in production.
          113 tests passing across 100+ protocol scenarios.{' '}
          <a
            href="https://github.com/Sasisundar2211/Vouqis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/65 underline underline-offset-2 decoration-border hover:text-foreground transition-colors"
          >
            Open source.
          </a>{' '}
           Founder-led support for design partners.
        </p>
      </section>

      {/* ── Design Partner Program ────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold mb-3 tracking-tight text-balance">
            Join the Design Partner Program
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            We are looking for teams running MCP-powered agents in production.
            You get early access and direct-to-founder support. We learn from
            your failure patterns.
          </p>
          <div className="rounded-lg border border-foreground/30 bg-foreground/5 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Design Partner</h3>
              <span className="text-xs font-mono bg-foreground/20 text-foreground/80 px-2 py-1 rounded">
                Free during discovery
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {DESIGN_PARTNER_FEATURES.map((feature, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">•</span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="#design-partner"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-colors"
            >
              Apply for Design Partner
            </a>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Or{' '}
            <a href="/proxy" className="underline underline-offset-2 decoration-border hover:text-foreground transition-colors">
              run a one-time MCP reliability audit
            </a>{' '}
            — no commitment required.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <h2 className="text-2xl font-semibold mb-10 tracking-tight text-balance">
          Common questions
        </h2>
        <div className="max-w-3xl divide-y divide-border/40">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="py-7 first:pt-0">
              <p className="text-sm font-semibold text-foreground/80 mb-3 leading-snug">
                {item.question}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.answer.includes('`')
                  ? item.answer.split('`').map((part, i) =>
                      i % 2 === 0 ? (
                        <span key={i}>{part}</span>
                      ) : (
                        <code key={i} className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                          {part}
                        </code>
                      )
                    )
                  : item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Design Partner + Discovery CTA ──────────────────────────────────── */}
      <section id="design-partner" className="py-20 border-t border-border/50">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-xl font-semibold mb-3 tracking-tight">Join the Design Partner Program</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Route MCP traffic through Vouqis. Shape the product. We&rsquo;ll help you set it up.
            </p>
            <EmailCapture />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3 tracking-tight">
              Have you seen an MCP failure reach a user?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Tell us what happened. This may be more valuable than another signup.
            </p>
            <a
              href="mailto:sasisundhar2211@gmail.com?subject=MCP failure report"
              className="inline-flex items-center h-10 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Share the details →
            </a>
          </div>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-[40ch] mb-10">
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
            MCP servers fail silently.
          </p>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground/50">
            Vouqis surfaces the evidence.
          </p>
        </div>
        <a
          href="https://calendly.com/sasisundar2211"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Book a Discovery Call
        </a>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-7 text-[0.68rem] text-muted-foreground/50 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-sans font-medium" style={{ letterSpacing: '0.2em', fontSize: '0.65rem' }}>
          © 2026 VOUQIS
        </span>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Sasisundar2211/Vouqis"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/80 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Sasisundar2211/Vouqis/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/80 transition-colors"
          >
            Privacy
          </a>
          <a
            href="mailto:sasisundhar2211@gmail.com"
            className="hover:text-foreground/80 transition-colors"
          >
            sasisundhar2211@gmail.com
          </a>
        </div>
      </footer>

    </div>
  )
}
