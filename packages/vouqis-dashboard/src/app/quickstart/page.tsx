import CopyButton from '@/components/copy-button'

const INSTALL_CMD = 'npm install -g @vouqis/cli'
const RUN_CMD = 'vouqis proxy --upstream https://your-mcp-server.example.com'

const TRACE = [
  { ln: 1, time: '09:14:22', actor: '[agent]',    dir: '→', content: 'tools/call  createTicket  {"title":"Deploy blocked"}',  role: 'agent' },
  { ln: 2, time: '09:14:22', actor: '[vouqis]',   dir: ' ', content: '✓  request schema valid',                               role: 'ok' },
  { ln: 3, time: '09:14:22', actor: '[vouqis]',   dir: '→', content: 'forwarding to mcp-server.example.com',                  role: 'relay' },
  { ln: 4, time: '09:14:23', actor: '[upstream]', dir: '←', content: 'HTTP 200  {"result":null}',                             role: 'upstream' },
  { ln: 5, time: '09:14:23', actor: '[vouqis]',   dir: ' ', content: '✗  result is null — expected {"id":string}',           role: 'fail' },
  { ln: 6, time: '09:14:23', actor: '[vouqis]',   dir: ' ', content: 'audit emitted  null_result_propagation  ref:9024',      role: 'audit' },
  { ln: 7, time: '09:14:24', actor: '[agent]',    dir: ' ', content: 'result.id  →  TypeError: cannot read "id" of null',    role: 'agent' },
]

const ARCH_ITEMS = [
  'Validates requests before forwarding',
  'Validates responses before returning',
  'Detects timeouts and retries failures',
  'Emits structured audit logs',
  'Catches null results, schema drift, and silent errors',
]

const VALIDATING = [
  'Null responses treated as success',
  'Schema mismatches',
  'Timeout masking',
  'Silent execution failures',
]

function contentColor(role: string): string {
  switch (role) {
    case 'ok':    return 'oklch(0.65 0.14 145)'
    case 'fail':  return 'oklch(0.72 0.18 28)'
    case 'audit': return 'oklch(0.55 0.08 28)'
    case 'relay': return 'oklch(0.52 0 0)'
    default:      return 'oklch(0.58 0 0)'
  }
}

function CommandBlock({ step, label, cmd }: { step: number; label: string; cmd: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[0.625rem] tabular-nums text-muted-foreground/30 select-none w-[1.5ch]">
          {step}
        </span>
        <span className="text-[0.65rem] font-mono text-muted-foreground/45 tracking-[0.07em] uppercase">
          {label}
        </span>
      </div>
      <div
        className="flex items-center justify-between gap-4 rounded-md px-4 py-3 font-mono text-[0.78rem] text-foreground/70"
        style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}
      >
        <span className="min-w-0 break-all">{cmd}</span>
        <CopyButton text={cmd} />
      </div>
    </div>
  )
}

export default function QuickstartPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20">
        <h1 className="text-balance text-[2rem] sm:text-[2.5rem] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
          Get started in 60 seconds
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
          Route MCP traffic through Vouqis and see exactly what your agents are
          sending, receiving, and silently mishandling.
        </p>
      </section>

      {/* ── Where Vouqis sits ────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/50">
        <h2 className="text-[0.8rem] font-semibold tracking-tight mb-10">Where Vouqis sits</h2>

        <div className="grid md:grid-cols-[auto_1fr] gap-x-20 gap-y-10 items-start">

          {/* Flow diagram */}
          <div className="font-mono text-[0.72rem]">
            <div
              className="inline-block px-4 py-2 rounded text-muted-foreground/55"
              style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.07)' }}
            >
              Agent
            </div>
            <div className="pl-4 py-1.5 text-muted-foreground/25">↓</div>
            <div
              className="inline-block px-4 py-2 rounded text-foreground/80"
              style={{ background: 'oklch(1 0 0 / 0.06)', border: '1px solid oklch(1 0 0 / 0.14)' }}
            >
              Vouqis Gateway
            </div>
            <div className="pl-4 py-1.5 text-muted-foreground/25">↓</div>
            <div
              className="inline-block px-4 py-2 rounded text-muted-foreground/55"
              style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px solid oklch(1 0 0 / 0.07)' }}
            >
              MCP Server
            </div>
          </div>

          {/* What it does */}
          <div className="space-y-3 pt-1">
            {ARCH_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-[0.35rem] w-1 h-1 rounded-full shrink-0 bg-foreground/20" />
                <span className="text-sm text-muted-foreground leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Install + Run ────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/50">
        <h2 className="text-[0.8rem] font-semibold tracking-tight mb-8">Install and run</h2>
        <div className="space-y-5">
          <CommandBlock step={1} label="Install" cmd={INSTALL_CMD} />
          <CommandBlock step={2} label="Run"     cmd={RUN_CMD} />
        </div>
        <p className="mt-5 text-[0.78rem] text-muted-foreground/45 pl-[calc(1.5ch+0.75rem)]">
          Listens on <span className="font-mono">127.0.0.1:4444</span> by default.
          Point your agent at that address instead of your MCP server directly.
        </p>
      </section>

      {/* ── What Vouqis captures ─────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/50">
        <h2 className="text-[0.8rem] font-semibold tracking-tight mb-8">What Vouqis captures</h2>

        <div
          className="rounded-lg border border-border/60 bg-card/70 overflow-hidden"
          style={{ boxShadow: '0 0 0 1px oklch(1 0 0 / 0.04), 0 16px 48px -8px oklch(0 0 0 / 0.5)' }}
        >
          <div className="flex items-center gap-2 px-3.5 h-9 border-b border-border/40 bg-muted/15">
            <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.55_0.18_25)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.68_0.14_82)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.60_0.17_145)]" />
            <span className="ml-3 text-[0.625rem] font-mono text-muted-foreground/45 tracking-wide">
              vouqis/audit · live trace
            </span>
          </div>

          <div className="px-4 py-4 font-mono text-[0.7rem] leading-[1.85]">
            {TRACE.map((row) => (
              <div
                key={row.ln}
                className="trace-in flex"
                style={{ animationDelay: `${0.2 + row.ln * 0.22}s` }}
              >
                <span className="w-[2ch] tabular-nums text-muted-foreground/25 select-none shrink-0 mr-2.5">
                  {row.ln}
                </span>
                <span className="w-[7.5ch] tabular-nums text-muted-foreground/40 shrink-0 mr-2.5">
                  {row.time}
                </span>
                <span
                  className="w-[11ch] shrink-0 mr-2.5"
                  style={{
                    color: row.actor === '[vouqis]'
                      ? 'oklch(0.62 0.09 155)'
                      : 'oklch(0.50 0 0)',
                  }}
                >
                  {row.actor}
                </span>
                <span className="w-[1.5ch] text-muted-foreground/40 shrink-0 mr-2.5 text-center">
                  {row.dir}
                </span>
                <span
                  className="min-w-0 break-words"
                  style={{ color: contentColor(row.role) }}
                >
                  {row.content}
                </span>
              </div>
            ))}

            <div
              className="trace-in mt-1 pl-4"
              style={{ animationDelay: `${0.2 + (TRACE.length + 1) * 0.22}s` }}
            >
              <span className="cursor-blink text-muted-foreground/30">▋</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Example failure caught ───────────────────────────────────────── */}
      <section className="py-16 border-t border-border/50">
        <h2 className="text-[0.8rem] font-semibold tracking-tight mb-8">Example failure caught</h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 divide-y divide-border/40 sm:divide-y-0 sm:divide-x sm:divide-border/40 overflow-hidden rounded-md"
          style={{ border: '1px solid oklch(1 0 0 / 0.08)' }}
        >
          {[
            { label: 'Agent logged',      value: 'success: true',           highlight: false },
            { label: 'Upstream returned', value: '{"result": null}',        highlight: false },
            { label: 'Vouqis emitted',    value: 'null_result_propagation', highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="px-5 py-5" style={{ background: 'oklch(1 0 0 / 0.015)' }}>
              <div className="text-[0.6rem] font-mono text-muted-foreground/38 tracking-[0.07em] uppercase mb-2.5">
                {label}
              </div>
              <div
                className="text-[0.8rem] font-mono font-medium"
                style={{ color: highlight ? 'oklch(0.72 0.18 28)' : 'oklch(0.60 0 0)' }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What we're validating ────────────────────────────────────────── */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-[48ch]">
          <h2 className="text-[0.8rem] font-semibold tracking-tight mb-5">What we&rsquo;re validating</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            We&rsquo;re working with teams running MCP servers in staging and production.
            Current focus:
          </p>
          <div className="space-y-2.5 mb-7">
            {VALIDATING.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="font-mono text-muted-foreground/30 text-[0.7rem] mt-px select-none">—</span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Interested in testing?{' '}
            <a
              href="mailto:sasisundhar2211@gmail.com"
              className="text-foreground/65 underline underline-offset-2 decoration-border hover:text-foreground transition-colors"
            >
              Talk to the founder.
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-[42ch]">
          <h2 className="text-xl font-semibold tracking-tight mb-3">Route traffic through Vouqis</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-9">
            Five minutes with the proxy is worth more than any landing page.
            Install it, run it, and see your agent&rsquo;s actual behavior.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <a
              href="https://calendly.com/sasisundhar2211"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-pulse inline-flex items-center h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Book Discovery Call
            </a>
            <a
              href="mailto:sasisundhar2211@gmail.com"
              className="inline-flex items-center h-10 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Email the Founder →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-7 text-[0.68rem] text-muted-foreground/50 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-mono">© 2026 Vouqis</span>
        <div className="flex items-center gap-6">
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
