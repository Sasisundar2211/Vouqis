import Link from 'next/link'
import {supabase} from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'

interface EvalResult {
  id: string
  server_url: string
  trust_score: number
  pass_count: number
  fail_count: number
  latency_p50: number
  created_at: string
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

function ScoreBadge({score}: {score: number}) {
  if (score >= 80) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/20 font-mono">
        {score}
      </Badge>
    )
  }
  if (score >= 60) {
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600/30 bg-yellow-50 dark:bg-yellow-950/20 font-mono">
        {score}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-50 dark:bg-red-950/20 font-mono">
      {score}
    </Badge>
  )
}

function scoreBar(score: number): string {
  const filled = Math.round(score / 5)
  return '█'.repeat(filled) + '░'.repeat(20 - filled)
}

export default async function EvalsPage() {
  const {data: evals} = await supabase
    .from('eval_results')
    .select('id,server_url,trust_score,pass_count,fail_count,latency_p50,created_at')
    .order('created_at', {ascending: false})
    .limit(50)

  const rows = evals ?? []

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Eval Runs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            CLI score runs — trust scores across your MCP servers
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Recent Runs
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({rows.length} shown)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Timestamp</TableHead>
                  <TableHead>Server URL</TableHead>
                  <TableHead className="w-24">Score</TableHead>
                  <TableHead className="w-24 font-mono text-xs">Progress</TableHead>
                  <TableHead className="w-24">Pass / Fail</TableHead>
                  <TableHead className="w-28">P50 Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      No eval runs yet — run <code className="font-mono text-xs bg-muted px-1 rounded">vouqis score &lt;url&gt;</code>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((run) => (
                    <TableRow
                      key={run.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <Link href={`/evals/${run.id}`} className="block">
                          {timeAgo(run.created_at)}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        <Link href={`/evals/${run.id}`} className="block truncate">
                          {run.server_url}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/evals/${run.id}`} className="block">
                          <ScoreBadge score={run.trust_score} />
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Link href={`/evals/${run.id}`} className="block">
                          {scoreBar(run.trust_score)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Link href={`/evals/${run.id}`} className="block">
                          <span className="text-green-600">{run.pass_count}✓</span>
                          {' / '}
                          <span className="text-red-500">{run.fail_count}✗</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        <Link href={`/evals/${run.id}`} className="block">
                          {run.latency_p50}ms
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
