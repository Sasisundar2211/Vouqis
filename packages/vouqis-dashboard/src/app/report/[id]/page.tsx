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

const FIX_SUGGESTIONS: Record<string, string> = {
  'malformed-jsonrpc': 'Return a proper JSON-RPC error object for malformed requests instead of 2xx.',
  'missing-params': 'Validate required parameters and return a validation error, not a silent failure.',
  'timeout': 'Optimize tool response time to stay under 5 seconds for all tool calls.',
  'unexpected-schema': 'Ensure all responses include a content[] array where each item has a type field.',
  'null-response': 'Return non-empty content[] on every tool call — even errors should return a message.',
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

function ScoreBar({score}: {score: number}) {
  const filled = Math.round((score / 100) * 24)
  const color = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171'
  return (
    <span className="font-mono text-lg tracking-tight" aria-label={`Score bar: ${score}/100`}>
      <span style={{color}}>{('▰').repeat(filled)}</span>
      <span style={{color: '#334155'}}>{'▱'.repeat(24 - filled)}</span>
    </span>
  )
}

function VerdictBanner({verdict, score}: {verdict: string; score: number}) {
  const cfg =
    verdict === 'APPROVED'
      ? {bg: '#052e16', border: '#166534', text: '#4ade80', icon: '✓'}
      : verdict === 'RISKY'
        ? {bg: '#2d1a00', border: '#92400e', text: '#fbbf24', icon: '⚠'}
        : {bg: '#2d0a0a', border: '#991b1b', text: '#f87171', icon: '✗'}

  return (
    <div
      className="rounded-lg border p-6 text-center"
      style={{backgroundColor: cfg.bg, borderColor: cfg.border}}
    >
      <p className="text-4xl font-bold font-mono" style={{color: cfg.text}}>
        {cfg.icon} {verdict}
      </p>
      <p className="mt-2 text-sm" style={{color: '#94a3b8'}}>
        Trust score: <span className="font-mono font-semibold" style={{color: cfg.text}}>{score} / 100</span>
      </p>
    </div>
  )
}

export default async function ReportPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params

  const freeHistoryDays = process.env.NEXT_PUBLIC_FREE_REPORT_HISTORY_DAYS || '7'
  const proHistoryDays = process.env.NEXT_PUBLIC_PRO_REPORT_HISTORY_DAYS || '90'
  const proPrice = process.env.NEXT_PUBLIC_PRO_PRICE_MONTHLY || '49'

  const {data: report, error} = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', id)
    .single()

  const expired = report?.expires_at && new Date(report.expires_at) < new Date()

  if (error || !report || expired) {
    return (
      <main style={{backgroundColor: '#0d0d0d', color: '#e2e8f0'}} className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <p className="text-xl font-mono" style={{color: '#f87171'}}>Report not found or expired.</p>
          <p className="text-sm" style={{color: '#64748b'}}>Free reports are kept for {freeHistoryDays} days.</p>
          <p className="text-sm" style={{color: '#64748b'}}>
            Upgrade to Pro for {proHistoryDays}-day history.{' '}
            <a href="/pro" style={{color: '#4ade80'}} className="underline">Upgrade →</a>
          </p>
        </div>
      </main>
    )
  }

  const r = report as AuditReport
  const failures = (r.probe_results ?? []).filter((p) => !p.passed)

  return (
    <main style={{backgroundColor: '#0d0d0d', color: '#e2e8f0'}} className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-widest" style={{color: '#475569'}}>
            Vouqis Audit Report
          </p>
          <p className="font-mono text-sm break-all" style={{color: '#60a5fa'}}>{r.server_url}</p>
          <p className="text-xs" style={{color: '#475569'}}>
            {new Date(r.created_at).toLocaleString()} · {timeAgo(r.created_at)}
          </p>
        </div>

        {/* Verdict banner */}
        <VerdictBanner verdict={r.verdict} score={r.trust_score} />

        {/* Score breakdown */}
        <div
          className="rounded-lg border p-5 space-y-3"
          style={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
        >
          <ScoreBar score={r.trust_score} />
          <div className="grid grid-cols-3 gap-4 text-sm pt-2">
            <div>
              <p style={{color: '#64748b'}}>Pass rate</p>
              <p className="font-mono font-semibold" style={{color: '#e2e8f0'}}>
                {r.pass_count}/{r.pass_count + r.fail_count} probes
              </p>
            </div>
            <div>
              <p style={{color: '#64748b'}}>P50 latency</p>
              <p className="font-mono font-semibold" style={{color: r.latency_p50 <= 500 ? '#4ade80' : r.latency_p50 <= 2000 ? '#fbbf24' : '#f87171'}}>
                {r.latency_p50}ms
              </p>
            </div>
            <div>
              <p style={{color: '#64748b'}}>Failures</p>
              <p className="font-mono font-semibold" style={{color: r.fail_count === 0 ? '#4ade80' : '#f87171'}}>
                {r.fail_count} / {r.pass_count + r.fail_count}
              </p>
            </div>
          </div>
        </div>

        {/* Top failures from probe_results */}
        {failures.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest" style={{color: '#475569'}}>
              Failures
            </p>
            <div className="space-y-2">
              {failures.map((f, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-4 space-y-1"
                  style={{backgroundColor: '#1a0a0a', borderColor: '#7f1d1d'}}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold" style={{color: '#f87171'}}>{f.failureMode}</span>
                    {f.toolCalled && (
                      <span className="font-mono text-xs" style={{color: '#64748b'}}>{f.toolCalled}</span>
                    )}
                  </div>
                  {f.errorText && (
                    <p className="text-xs font-mono break-all" style={{color: '#94a3b8'}}>{f.errorText}</p>
                  )}
                  <p className="text-xs" style={{color: '#475569'}}>
                    {FIX_SUGGESTIONS[f.failureMode] ?? 'Review server logs for this failure mode.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Install CTA */}
        <div
          className="rounded-lg border p-5 space-y-2"
          style={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
        >
          <p className="text-xs font-mono" style={{color: '#64748b'}}>Run your own audit:</p>
          <pre className="font-mono text-sm overflow-x-auto" style={{color: '#e2e8f0'}}>
{`npm install -g @vouqis/cli
vouqis audit ${r.server_url}`}
          </pre>
        </div>

        {/* Upgrade banner */}
        <div
          className="rounded-lg border p-5 space-y-2"
          style={{backgroundColor: '#0f1a0f', borderColor: '#166534'}}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold font-mono" style={{color: '#4ade80'}}>Vouqis Pro</p>
              <p className="text-xs" style={{color: '#94a3b8'}}>
                Free reports expire after {freeHistoryDays} days.
                Pro keeps {proHistoryDays} days of history — ${proPrice}/month.
              </p>
              {r.expires_at && (
                <p className="text-xs" style={{color: '#475569'}}>
                  This report expires in {daysUntil(r.expires_at)} days.
                </p>
              )}
            </div>
            <a
              href="/pro"
              className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold font-mono whitespace-nowrap"
              style={{backgroundColor: '#4ade80', color: '#052e16'}}
            >
              Upgrade to Pro →
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
