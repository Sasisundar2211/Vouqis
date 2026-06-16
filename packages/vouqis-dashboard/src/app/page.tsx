const TRACE = [
  { ln: 1, time: '09:14:22', actor: '[agent]',    dir: '→', content: 'createTicket("Deploy blocked")' },
  { ln: 2, time: '09:14:23', actor: '[jira]',     dir: '←', content: 'HTTP 200  {"id":"TKT-8821","status":"created"}' },
  { ln: 3, time: '09:14:23', actor: '[agent]',    dir: ' ', content: 'result.success === true' },
]

const STATUS_CELLS = [
  { dot: 'green', label: 'Agent reported',    value: 'success: true' },
  { dot: 'amber', label: 'Action completed',  value: 'false' },
  { dot: 'red',   label: 'Time to discovery', value: '33 min 48 sec' },
]

const FAILURE_REPORTS = [
  {
    id: 'INC-001',
    type: 'Response Parse Failure',
    description:
      'MCP server returns HTTP 200 with an error object in the result field. Agent reads the status code, not the payload. Silent failure propagates downstream.',
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
      'Agent B reads shared state before Agent A finishes writing. Both log completion. The merge step processes a stale snapshot. Workflow corrupts silently at step 3.',
    vector: 'agent-A: writeState() → success | agent-B: readState(t−2s) → process(stale) → success',
  },
  {
    id: 'INC-004',
    type: 'Null Result Propagation',
    description:
      'Tool returns {"result": null}. Agent passes null to the next step. Failure surfaces eight steps later as a TypeError with no reference to the original null.',
    vector: 'fetchUser → {"result":null} → generateReport(null) → TypeError: cannot read "id" of null',
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
              className="text-[2.6rem] sm:text-5xl lg:text-[3.4rem] font-bold tracking-[-0.03em] leading-[1.06] text-balance mb-6"
            >
              Your Agent Said Success.{' '}
              <span className="text-foreground/40">The Action Never Happened.</span>
            </h1>

            <p className="text-[0.9375rem] leading-relaxed text-foreground/60 mb-10 max-w-[38ch]">
              Vouqis sits between AI agents and MCP servers — validating requests,
              responses, timeouts, and outcomes before silent failures reach production.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <a
                href="https://calendly.com/sasisundar2211"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-pulse inline-flex items-center h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Book a Discovery Call
              </a>
              <a
                href="mailto:sasisundhar2211@gmail.com"
                className="inline-flex items-center h-10 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Share a Failure Report →
              </a>
            </div>
          </div>

          {/* Right: terminal trace panel */}
          <div
            className="rounded-lg border border-border/60 bg-card/70 overflow-hidden"
            style={{ boxShadow: '0 0 0 1px oklch(1 0 0 / 0.04), 0 16px 48px -8px oklch(0 0 0 / 0.5)' }}
          >
            {/* Chrome bar */}
            <div className="flex items-center gap-2 px-3.5 h-9 border-b border-border/40 bg-muted/15">
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.55_0.18_25)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.68_0.14_82)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.60_0.17_145)]" />
              <span className="ml-3 text-[0.625rem] font-mono text-muted-foreground/45 tracking-wide">
                agent-session · vouqis/trace
              </span>
            </div>

            {/* Trace body */}
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
                  <span className="w-[9ch] text-muted-foreground/60 shrink-0 mr-2.5">
                    {row.actor}
                  </span>
                  <span className="w-[1.5ch] text-muted-foreground/40 shrink-0 mr-2.5 text-center">
                    {row.dir}
                  </span>
                  <span className="text-foreground/55 min-w-0 break-words">{row.content}</span>
                </div>
              ))}

              {/* Gap indicator */}
              <div
                className="trace-in flex items-center gap-3 my-3.5"
                style={{ animationDelay: '1.45s' }}
              >
                <div className="h-px flex-1 bg-incident/20" />
                <span className="text-incident/55 text-[0.6rem] tabular-nums tracking-[0.06em] whitespace-nowrap">
                  33 min 48 sec
                </span>
                <div className="h-px flex-1 bg-incident/20" />
              </div>

              {/* Customer complaint */}
              <div
                className="trace-in flex"
                style={{ animationDelay: '1.8s' }}
              >
                <span className="w-[2ch] tabular-nums text-muted-foreground/25 select-none shrink-0 mr-2.5">
                  4
                </span>
                <span className="w-[7.5ch] tabular-nums text-muted-foreground/40 shrink-0 mr-2.5">
                  09:47:11
                </span>
                <span className="w-[9ch] text-muted-foreground/60 shrink-0 mr-2.5">
                  [customer]
                </span>
                <span className="w-[1.5ch] shrink-0 mr-2.5" />
                <span className="text-incident font-medium min-w-0">
                  &ldquo;The ticket was never created.&rdquo;
                </span>
              </div>

              {/* Blinking cursor */}
              <div
                className="trace-in mt-1 pl-4"
                style={{ animationDelay: '2.15s' }}
              >
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
                      dot === 'green' ? 'oklch(0.65 0.17 145)' :
                      dot === 'amber' ? 'var(--incident)' :
                      'oklch(0.55 0.22 25)',
                  }}
                />
                <span className="text-[0.65rem] font-mono text-muted-foreground/55 tracking-[0.05em] uppercase">
                  {label}
                </span>
              </div>
              <div
                className={`text-[1.35rem] font-mono font-medium tabular-nums ${
                  dot === 'red' ? 'text-incident' : 'text-foreground/75'
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Failure Reports ──────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 tracking-tight">
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

      {/* ── Discovery CTA ────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-[44ch]">
          <h2 className="text-xl font-semibold mb-4 tracking-tight">We&rsquo;re In Discovery</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We&rsquo;re talking to engineers running LangGraph, MCP integrations, and
            multi-agent workflows in production.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-9">
            If you&rsquo;ve spent time debugging an agent that logged success while the
            underlying task failed — we want the details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <a
              href="https://calendly.com/sasisundar2211"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-pulse inline-flex items-center h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Book a Discovery Call
            </a>
            <a
              href="mailto:sasisundhar2211@gmail.com"
              className="inline-flex items-center h-10 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Share a Failure Report →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-7 text-[0.68rem] text-muted-foreground/50 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-mono">© 2026 Vouqis</span>
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
