const TRACE = [
  { time: '09:14:22', actor: '[agent]',  dir: '→', content: 'createTicket("Deploy blocked — needs review")' },
  { time: '09:14:23', actor: '[jira]',   dir: '←', content: 'HTTP 200  {"id":"TKT-8821","status":"created"}' },
  { time: '09:14:23', actor: '[agent]',  dir: '',   content: 'success: true' },
]

const REALITIES = [
  { heading: 'Agent reported success', body: 'Logs looked healthy.' },
  { heading: 'User reported failure',  body: 'Action never completed.' },
  { heading: 'Engineer lost 4 hours',  body: 'Root cause hidden between systems.' },
]

const QUOTES = [
  {
    text: 'The agent completed successfully. The Slack message was never sent. We found out three days later when a customer asked why they weren\'t notified.',
    attr: 'Backend engineer, AI infrastructure team',
  },
  {
    text: 'We had a retry loop that hid the original failure. The agent retried six times, each retry logged as successful, and the underlying issue was invisible in the trace.',
    attr: 'Platform engineer, enterprise agentic system',
  },
  {
    text: 'Four hours. I spent four hours following success logs before I realized the MCP server had returned HTTP 200 with an error payload. The agent never checked the response body.',
    attr: 'Founding engineer, AI startup',
  },
  {
    text: 'State drift between agent steps. Agent A completed, Agent B started from a stale snapshot. Both logged success. The workflow was corrupted at step 3 but nobody knew until QA caught it manually.',
    attr: 'Staff engineer, multi-agent pipeline',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-44">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance mb-8">
            Your Agent Said Success.{' '}
            <span className="text-muted-foreground">The Action Never Happened.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-3 max-w-2xl">
            AI agents fail long before users see an error.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            Vouqis sits between agents and MCP servers, validating requests, responses,
            timeouts, and execution outcomes before failures reach production.
          </p>

          <div className="mb-12 rounded-md border border-border bg-card p-4 font-mono text-sm space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>npm install -g @vouqis/cli</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>vouqis proxy --upstream https://your-mcp-server.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="https://calendly.com/sasisundhar2211"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Book a Discovery Call
            </a>
            <a
              href="#incident"
              className="inline-flex items-center h-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See Real Failure Patterns →
            </a>
          </div>
        </div>
      </section>

      {/* ── Incident Block ───────────────────────────────────────────── */}
      <section id="incident" className="py-20 border-t border-border">
        <div className="rounded-md border border-border bg-card p-5 sm:p-6 max-w-2xl font-mono text-sm mb-6">
          <div className="space-y-1.5">
            {TRACE.map((row, i) => (
              <div key={i} className="grid gap-x-4 text-muted-foreground" style={{ gridTemplateColumns: '5.5rem 5.5rem 1rem 1fr' }}>
                <span className="tabular-nums">{row.time}</span>
                <span>{row.actor}</span>
                <span>{row.dir}</span>
                <span className="text-foreground/60">{row.content}</span>
              </div>
            ))}
          </div>

          <div className="my-5 border-t border-border" />

          <p className="text-xs text-muted-foreground/50 mb-3 tabular-nums">
            — 33 minutes pass —
          </p>

          <div className="grid gap-x-4 text-muted-foreground" style={{ gridTemplateColumns: '5.5rem 5.5rem 1rem 1fr' }}>
            <span className="tabular-nums">09:47:11</span>
            <span>[customer]</span>
            <span />
            <span className="text-incident font-medium">
              &ldquo;The ticket was never created.&rdquo;
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground max-w-xl">
          This is the failure mode we&rsquo;re investigating.
        </p>
      </section>

      {/* ── The Customer Problem ─────────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-8">
          {REALITIES.map(({ heading, body }) => (
            <div key={heading}>
              <h3 className="text-xl font-semibold mb-2 leading-snug text-balance">{heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Current Research ─────────────────────────────────────────── */}
      <section id="research" className="py-24 border-t border-border">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold mb-5">Current Research</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We&rsquo;re interviewing engineers running LangGraph, MCP integrations,
            multi-agent workflows, and tool orchestration in production.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            The question: how are silent tool failures discovered, debugged, and prevented?
            If you&rsquo;ve spent time debugging an agent that reported success while the
            underlying task failed, we&rsquo;d like to hear from you.
          </p>
          <a
            href="https://calendly.com/sasisundhar2211"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Book a Discovery Call
          </a>
        </div>
      </section>

      {/* ── Evidence ─────────────────────────────────────────────────── */}
      <section id="evidence" className="py-24 border-t border-border">
        <h2 className="text-2xl font-semibold mb-12">What Engineers Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
          {QUOTES.map((q, i) => (
            <figure key={i}>
              <blockquote className="text-base leading-relaxed mb-3 text-pretty">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="text-xs text-muted-foreground">
                — {q.attr}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground/60 max-w-md">
          These are representative patterns from discovery conversations, shared anonymously.
        </p>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap">
        <span>© 2026 Vouqis</span>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Sasisundar2211/vouqis/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href="mailto:sasisundhar2211@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            sasisundhar2211@gmail.com
          </a>
        </div>
      </footer>
    </div>
  )
}
