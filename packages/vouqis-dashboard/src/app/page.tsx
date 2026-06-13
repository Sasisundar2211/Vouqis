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

const FOR_WHOM = [
  'Founding Engineers',
  'AI Infrastructure Teams',
  'Platform Engineers',
  'Technical Founders',
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-28 lg:py-36">
        <div className="max-w-3xl">
          <span className="inline-block mb-6 text-xs font-mono tracking-widest uppercase text-muted-foreground border border-border px-3 py-1 rounded-full">
            Customer Discovery
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Prevent Silent AI Agent Failures{' '}
            <span className="text-muted-foreground">Before They Reach Users</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl">
            AI agents often report success while user workflows quietly fail.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Vouqis sits between agents and tools to detect timeouts, invalid responses, schema
            mismatches, and execution failures before they become customer-visible incidents.
          </p>

          {/* CLI quickstart */}
          <div className="mb-10 rounded-lg border border-border bg-card p-4 font-mono text-sm space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>npm install -g @vouqis/cli</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">#</span>
              <span className="text-muted-foreground">Start a reliability gateway in front of your MCP server</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground select-none">$</span>
              <span>vouqis proxy --upstream https://your-mcp-server.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="https://calendly.com/sasisundhar2211"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Book a Discovery Call
            </a>
            <a
              href="mailto:sasisundhar2211@gmail.com?subject=Reliability Challenges"
              className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Share Your Reliability Challenges
            </a>
          </div>

          {/* Founder credibility */}
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            Building Vouqis after seeing AI agents report success while user workflows silently
            failed. Currently speaking with AI infrastructure teams and technical founders running
            production agent systems.
          </p>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Built For */}
      <section className="py-20">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-8">
          Built For
        </h2>
        <div className="flex flex-col gap-2 mb-4">
          {FOR_WHOM.map((role) => (
            <div key={role} className="flex items-center gap-3 text-sm">
              <span className="text-primary">✓</span>
              <span className="font-medium">{role}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Running production AI agents and MCP integrations.
        </p>
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

      {/* Concrete example */}
      <section className="py-20">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-10">
          The Problem, Concretely
        </h2>
        <div className="rounded-lg border border-border bg-card p-6 max-w-xl space-y-3 font-mono text-sm">
          <div className="flex items-baseline gap-4">
            <span className="text-muted-foreground w-20 shrink-0">User</span>
            <span>&quot;Create a meeting&quot;</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-muted-foreground w-20 shrink-0">Agent</span>
            <span className="text-green-400">Success</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-muted-foreground w-20 shrink-0">Calendar</span>
            <span className="text-green-400">Success</span>
          </div>
          <div className="border-t border-border pt-3 flex items-baseline gap-4">
            <span className="text-muted-foreground w-20 shrink-0">Reality</span>
            <span className="text-destructive">Meeting never created</span>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground max-w-xl">
          Vouqis detects the failure before the user does.
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

      {/* Validation / proof */}
      <section className="py-20 max-w-xl">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">
          Currently Validating
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Currently validating this problem with AI infrastructure teams. If you&apos;ve
          experienced any of these:
        </p>
        <ul className="space-y-2 mb-8">
          {[
            'Tool success but task failure',
            'Null responses from MCP servers',
            'Retry loops you couldn\'t explain',
            'State drift between agent steps',
            'Schema mismatches breaking downstream logic',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a
          href="mailto:sasisundhar2211@gmail.com?subject=Reliability Failure — I Want to Talk"
          className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Share Your Worst Production Failure
        </a>
      </section>

      <div className="border-t border-border" />

      {/* Founder */}
      <section className="py-20 max-w-xl">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">
          About
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          I&apos;m Sasi Sundar, founder of Vouqis.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          I&apos;m researching why AI agents report success while real-world workflows fail.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you&apos;re running production agents, I&apos;d love to learn from your experience.{' '}
          <a
            href="https://calendly.com/sasisundhar2211"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Book 20 minutes.
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-xs text-muted-foreground flex items-center justify-between gap-4 flex-wrap">
        <span>© 2026 Vouqis</span>
        <div className="flex items-center gap-4">
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
