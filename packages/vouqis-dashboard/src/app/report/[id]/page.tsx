export const dynamic = 'force-dynamic'

import {supabase} from '@/lib/supabase'

interface ProbeResult {
  promptId: string
  failureMode: string
  passed: boolean
  durationMs: number
  errorText?: string
  toolCalled?: string
}

interface AuditReport {
  id: string
  created_at: string
  server_url: string
  trust_score: number
  verdict: string
  pass_count: number
  fail_count: number
  latency_p50: number
  top_failures: Record<string, number>
  probe_results: ProbeResult[]
  expires_at: string | null
}

const PROBE_LABELS: Record<string, string> = {
  'mal-01': 'Malformed JSON-RPC body',
  'mal-02': 'Invalid JSON-RPC method type',
  'mis-01': 'Empty arguments (stripped)',
  'mis-02': 'All arguments set to null',
  'tmo-01': 'Cold-start response time',
  'tmo-02': 'Repeat-call response time',
  'sch-01': 'Response conforms to MCP content-array schema',
  'sch-02': 'Each content item has a valid type field',
  'nul-01': 'Null tool arguments',
  'nul-02': 'Empty string arguments',
}

const FIX_SUGGESTIONS: Record<string, string> = {
  'malformed-jsonrpc': 'Return a proper JSON-RPC error for malformed requests — not 2xx.',
  'missing-params': 'Validate required parameters and return a validation error, not a silent pass.',
  'timeout': 'Tool response must stay under 5s. Optimize or add a timeout guard.',
  'unexpected-schema': 'Responses must include a content[] array with a type field on each item.',
  'null-response': 'Return non-empty content[] on every call — even error paths need a message.',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

function VerdictBadge({verdict}: {verdict: string}) {
  if (verdict === 'APPROVED')
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2.5 py-1 font-mono">
        ✓ Approved
      </span>
    )
  if (verdict === 'RISKY')
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2.5 py-1 font-mono">
        ⚠ Risky
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1 font-mono">
      ✗ Do Not Integrate
    </span>
  )
}

function latencyLabel(ms: number): string {
  if (ms <= 500) return 'fast'
  if (ms <= 2000) return 'acceptable'
  return 'slow'
}

export default async function ReportPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params

  const freeHistoryDays = process.env.NEXT_PUBLIC_FREE_REPORT_HISTORY_DAYS || '7'

  const {data: report, error} = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', id)
    .single()

  const expired = report?.expires_at && new Date(report.expires_at) < new Date()

  if (error || !report || expired) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-base font-medium">Report not found or expired</p>
          <p className="text-sm text-muted-foreground">
            Free reports are kept for {freeHistoryDays} days. Run the audit again to get a fresh report.
          </p>
          <p className="text-sm text-muted-foreground">
            Run <code className="text-xs font-mono">vouqis audit</code> again to get a fresh report.
          </p>
        </div>
      </main>
    )
  }

  const r = report as AuditReport
  const total = r.pass_count + r.fail_count
  const failures = (r.probe_results ?? []).filter((p) => !p.passed)

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Vouqis Audit Report
          </p>
          <div className="flex items-start gap-3 flex-wrap">
            <a
              href={r.server_url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-medium hover:underline underline-offset-2 break-all"
            >
              {r.server_url}
            </a>
            <VerdictBadge verdict={r.verdict} />
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(r.created_at).toLocaleString()} · {timeAgo(r.created_at)}
          </p>
        </div>

        {/* Score summary */}
        <div className="border rounded-lg divide-y">
          <div className="grid grid-cols-3 divide-x">
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">Trust score</p>
              <p className="text-2xl font-bold font-mono">{r.trust_score}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">Probes passed</p>
              <p className="text-2xl font-bold font-mono">
                <span className="text-green-600">{r.pass_count}</span>
                <span className="text-muted-foreground text-base font-normal"> / {total}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {r.fail_count === 0 ? 'all passed' : `${r.fail_count} failed`}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">Response time</p>
              <p className={`text-2xl font-bold font-mono ${r.latency_p50 <= 500 ? 'text-green-600' : r.latency_p50 <= 2000 ? 'text-yellow-600' : 'text-red-500'}`}>
                {r.latency_p50}
                <span className="text-base font-normal text-muted-foreground">ms</span>
              </p>
              <p className="text-xs text-muted-foreground">{latencyLabel(r.latency_p50)} · target &lt;500ms</p>
            </div>
          </div>
        </div>

        {/* Probe results table */}
        {r.probe_results && r.probe_results.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              10 Probe Results
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground w-20">Probe</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">What it tests</th>
                    <th className="text-center px-4 py-2 font-medium text-muted-foreground w-20">Result</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground w-20">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {r.probe_results.map((p, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.promptId}</td>
                      <td className="px-4 py-2.5 text-sm">{PROBE_LABELS[p.promptId] ?? p.promptId}</td>
                      <td className="px-4 py-2.5 text-center">
                        {p.passed
                          ? <span className="text-green-600 font-medium text-xs">✓ pass</span>
                          : <span className="text-red-500 font-medium text-xs">✗ fail</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {p.durationMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Failures detail — only shown if there are failures */}
        {failures.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              What Failed — and Why It Matters
            </h2>
            <div className="border rounded-lg divide-y">
              {failures.map((f, i) => (
                <div key={i} className="px-5 py-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-mono text-xs font-medium">{f.promptId}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-sm font-medium">{PROBE_LABELS[f.promptId] ?? f.failureMode}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Fix:</strong>{' '}
                    {FIX_SUGGESTIONS[f.failureMode] ?? 'Review server logs for this failure mode.'}
                  </p>
                  {f.errorText && (
                    <pre className="text-xs font-mono text-muted-foreground bg-muted rounded px-3 py-2 overflow-x-auto">
                      {f.errorText.slice(0, 200)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run it yourself */}
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Run This Audit Yourself
          </h2>
          <div className="bg-muted rounded-lg px-4 py-3">
            <pre className="text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
{`npm install -g @vouqis/cli
vouqis audit ${r.server_url}`}
            </pre>
          </div>
        </div>

        {/* Expiry + upgrade — quiet, not a banner */}
        <div className="border-t pt-6 space-y-1">
          <p className="text-xs text-muted-foreground">
            {r.expires_at
              ? `This report expires in ${daysUntil(r.expires_at)} days.`
              : 'Reports are kept for 7 days.'}
          </p>
        </div>

      </div>
    </main>
  )
}
