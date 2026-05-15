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

function latencyClass(ms: number): string {
  if (ms < 500) return 'text-green-500'
  if (ms <= 2000) return 'text-yellow-500'
  return 'text-red-500'
}

function JsonBlock({data}: {data: unknown}) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-96 leading-relaxed">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  )
}

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data: trace, error} = await supabase
    .from('traces')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !trace) notFound()

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/" className={buttonVariants({variant: 'outline', size: 'sm'})}>
            ← Back
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              {trace.tool_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(trace.created_at).toLocaleString()} · {timeAgo(trace.created_at)}
            </p>
          </div>
          {trace.success ? (
            <Badge
              variant="outline"
              className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/20"
            >
              ✓ ok
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-red-500 border-red-500/30 bg-red-50 dark:bg-red-950/20"
            >
              ✗ error
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Project ID</p>
              <p className="font-mono">{trace.project_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Server URL</p>
              <p className="font-mono break-all">{trace.server_url}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Latency</p>
              <p className={`font-medium font-mono ${latencyClass(trace.latency_ms)}`}>
                {trace.latency_ms}ms
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Trace ID</p>
              <p className="font-mono text-xs break-all">{trace.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {trace.error && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                {trace.error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Params */}
        <Section title="Params">
          <JsonBlock data={trace.params ?? {}} />
        </Section>

        {/* Response */}
        <Section title="Response">
          <JsonBlock data={trace.response ?? {}} />
        </Section>
      </div>
    </main>
  )
}
