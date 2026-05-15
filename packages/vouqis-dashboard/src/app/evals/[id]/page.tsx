import Link from 'next/link'
import {notFound} from 'next/navigation'
import {supabase} from '@/lib/supabase'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {buttonVariants} from '@/components/ui/button'

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

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

function ScoreBadge({score}: {score: number}) {
  if (score >= 80)
    return (
      <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/20">
        High Trust
      </Badge>
    )
  if (score >= 60)
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600/30 bg-yellow-50 dark:bg-yellow-950/20">
        Medium Trust
      </Badge>
    )
  return (
    <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-50 dark:bg-red-950/20">
      Low Trust
    </Badge>
  )
}

function scoreBar(score: number): string {
  const filled = Math.round(score / 5)
  return '█'.repeat(filled) + '░'.repeat(20 - filled)
}

function JsonBlock({data}: {data: unknown}) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-96 leading-relaxed">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}

export default async function EvalDetailPage({
  params,
}: {
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data: run, error} = await supabase
    .from('eval_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !run) notFound()

  const total = run.pass_count + run.fail_count
  const passRate = total > 0 ? Math.round((run.pass_count / total) * 100) : 0
  const topFailures = run.top_failures as Record<string, number> | null

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/evals" className={buttonVariants({variant: 'outline', size: 'sm'})}>
            ← Back
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight font-mono break-all">
              {run.server_url}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(run.created_at).toLocaleString()} · {timeAgo(run.created_at)}
            </p>
          </div>
          <ScoreBadge score={run.trust_score} />
        </div>

        {/* Score hero */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className={`text-6xl font-bold font-mono ${scoreColor(run.trust_score)}`}>
                  {run.trust_score}
                </p>
                <p className="text-xs text-muted-foreground mt-1">/ 100</p>
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-mono text-sm tracking-widest text-muted-foreground">
                  {scoreBar(run.trust_score)}
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pass rate</p>
                    <p className="font-semibold">{passRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Probes</p>
                    <p className="font-semibold">
                      <span className="text-green-600">{run.pass_count}✓</span>
                      {' / '}
                      <span className="text-red-500">{run.fail_count}✗</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P50 Latency</p>
                    <p className="font-semibold font-mono">{run.latency_p50}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failures breakdown */}
        {topFailures && Object.keys(topFailures).length > 0 && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-red-600">
                Failures by Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(topFailures).map(([mode, count]) => (
                  <div key={mode} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{mode}</span>
                    <span className="text-red-500 font-medium">{count} failure{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Run ID</p>
              <p className="font-mono text-xs break-all">{run.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Server URL</p>
              <p className="font-mono text-xs break-all">{run.server_url}</p>
            </div>
          </CardContent>
        </Card>

        {/* Probe results */}
        {run.probe_results && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Probe Results
            </h2>
            <JsonBlock data={run.probe_results} />
          </div>
        )}
      </div>
    </main>
  )
}
