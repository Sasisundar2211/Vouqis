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
import {FreePlanBanner} from '@/components/FreePlanBanner'

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
      {Array.from({length: 6}).map((_, i) => (
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
  const [urlFilter, setUrlFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')

  const fetchTraces = useCallback(async () => {
    let query = supabase
      .from('traces')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(50)

    if (urlFilter) query = query.ilike('server_url', `%${urlFilter}%`)
    if (statusFilter === 'success') query = query.eq('success', true)
    else if (statusFilter === 'error') query = query.eq('success', false)

    const {data, error} = await query

    if (!error && data) {
      setTraces(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }, [urlFilter, statusFilter])

  useEffect(() => {
    const initial = setTimeout(() => {
      void fetchTraces()
    }, 0)
    const interval = setInterval(() => {
      void fetchTraces()
    }, 10_000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [fetchTraces])

  const clearFilters = () => {
    setUrlFilter('')
    setStatusFilter('all')
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Live Traces
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              SDK-captured tool call traces. Install{' '}
              <code className="font-mono text-xs bg-muted px-1 rounded">@vouqis/sdk</code>{' '}
              to start capturing.
            </p>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </div>

        <FreePlanBanner />

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Filter by server URL…"
            value={urlFilter}
            onChange={(e) => setUrlFilter(e.target.value)}
            className="h-8 rounded-md border bg-background px-3 text-xs font-mono w-64 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All statuses</option>
            <option value="success">✓ Success</option>
            <option value="error">✗ Error</option>
          </select>
          {(urlFilter || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="h-8 px-3 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Clear filters
            </button>
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
                  <TableHead>Server URL</TableHead>
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
                    <TableCell colSpan={6} className="py-16">
                      <div className="flex flex-col items-center gap-3 text-center max-w-sm mx-auto">
                        <p className="text-sm font-medium">No traces yet</p>
                        <p className="text-xs text-muted-foreground">
                          Install the Vouqis SDK to capture live tool call traces from your MCP servers.
                        </p>
                        <pre className="bg-muted rounded-md px-4 py-2 text-xs font-mono text-left w-full">
                          npm install @vouqis/sdk
                        </pre>
                        <a
                          href="https://github.com/Sasisundar2211/Vouqis#sdk"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                        >
                          View setup docs →
                        </a>
                      </div>
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
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                        {trace.server_url ?? '—'}
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
