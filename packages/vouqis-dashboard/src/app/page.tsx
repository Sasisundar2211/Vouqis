'use client'

import {useEffect, useState, useCallback} from 'react'
import {useRouter} from 'next/navigation'
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

interface Trace {
  id: string
  project_id: string
  created_at: string
  server_url: string
  tool_name: string
  params: Record<string, unknown> | null
  response: Record<string, unknown> | null
  latency_ms: number
  error: string | null
  success: boolean
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

function latencyClass(ms: number): string {
  if (ms < 500) return 'text-green-500 font-medium'
  if (ms <= 2000) return 'text-yellow-500 font-medium'
  return 'text-red-500 font-medium'
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({length: 5}).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function TracesPage() {
  const router = useRouter()
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchTraces = useCallback(async () => {
    const {data, error} = await supabase
      .from('traces')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(50)

    if (!error && data) {
      setTraces(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTraces()
    const interval = setInterval(fetchTraces, 10_000)
    return () => clearInterval(interval)
  }, [fetchTraces])

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Vouqis — MCP Trace Viewer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live tool call traces across your MCP servers
            </p>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Recent Traces
              {!loading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({traces.length} shown)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Timestamp</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead className="w-28">Latency</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({length: 6}).map((_, i) => <SkeletonRow key={i} />)
                ) : traces.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-16 text-muted-foreground"
                    >
                      No traces yet
                    </TableCell>
                  </TableRow>
                ) : (
                  traces.map((trace) => (
                    <TableRow
                      key={trace.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/traces/${trace.id}`)}
                    >
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo(trace.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {trace.tool_name}
                      </TableCell>
                      <TableCell className={`text-sm ${latencyClass(trace.latency_ms)}`}>
                        {trace.latency_ms}ms
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono max-w-xs">
                        {trace.error
                          ? trace.error.length > 60
                            ? `${trace.error.slice(0, 60)}…`
                            : trace.error
                          : '—'}
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
