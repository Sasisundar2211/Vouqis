const DETECTIONS = [
  'Schema mismatches',
  'Null responses',
  'Timeouts',
  'Retry loops',
  'Partial executions',
  'State drift',
  'Tool success but task failure',
]

const FLOW = [
  { label: 'User', note: null },
  { label: 'AI Agent', note: null },
  { label: 'Vouqis Gateway', note: 'validates every hop', highlight: true },
  { label: 'MCP Server', note: null },
  { label: 'External System', note: null },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-28 lg:py-36">
        <div className="max-w-3xl">
          <span className="inline-block mb-6 text-xs font-mono tracking-widest uppercase text-muted-foreground border border-border px-3 py-1 rounded-full">
            Early Access
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Prevent Silent AI Agent Failures{' '}
            <span className="text-muted-foreground">Before They Reach Users</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Vouqis is a reliability gateway between AI agents and MCP servers. It validates
            requests, responses, timeouts, and execution outcomes — before failures become
            customer-visible incidents.
          </p>

          {/* CLI quickstart */}
          <div className="mb-10 rounded-lg border border-border bg-card p-4 font-mono text-sm space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>npm install -g @vouqis/cli</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>vouqis proxy --upstream https://your-mcp-server.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:hello@vouqis.tech?subject=Discovery Call Request"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Book a Discovery Call
            </a>
            <a
              href="mailto:hello@vouqis.tech?subject=Founding Design Partner Program"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Join Founding Design Partner Program
            </a>
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* How It Works */}
      <section className="py-20">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-10">
          How It Works
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 flex-wrap">
          {FLOW.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={`rounded-md px-3 py-2 text-sm font-medium border ${
                  step.highlight
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <div>{step.label}</div>
                {step.note && (
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {step.note}
                  </div>
                )}
              </div>
              {i < FLOW.length - 1 && (
                <span className="text-muted-foreground px-1 hidden sm:inline">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground max-w-xl">
          Every request your agent sends and every response it receives passes through the
          gateway. Vouqis inspects, validates, retries, and audits — so your agent operates on
          ground truth, not stale or corrupted state.
        </p>
      </section>

      <div className="border-t border-border" />

      {/* What Vouqis Detects */}
      <section className="py-20">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-10">
          What Vouqis Detects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DETECTIONS.map((item) => (
            <div
              key={item}
              className="rounded-md border border-border bg-card px-4 py-3 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Social proof / status */}
      <section className="py-20">
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Currently speaking with AI infrastructure teams to understand production reliability
          failures across MCP and agent workflows.{' '}
          <a
            href="mailto:hello@vouqis.tech?subject=Reliability Failure — I Want to Talk"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Tell us about a failure you&apos;ve hit.
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap">
        <span>© 2026 Vouqis</span>
        <div className="flex items-center gap-4">
          <a href="https://github.com/Sasisundar2211/vouqis/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="mailto:hello@vouqis.tech" className="hover:text-foreground transition-colors">
            hello@vouqis.tech
          </a>
        </div>
      </footer>
    </div>
  )
}
