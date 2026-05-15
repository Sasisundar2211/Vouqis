'use client'

import {useState} from 'react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'

interface ReplayResult {
  success: boolean
  newTraceId?: string
  latencyMs?: number
  error?: string
}

export function ReplayButton({traceId}: {traceId: string}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReplayResult | null>(null)

  async function handleReplay() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/replay', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({traceId}),
      })
      const data: ReplayResult = await res.json()
      setResult(data)
    } catch (err) {
      setResult({success: false, error: err instanceof Error ? err.message : 'Network error'})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        disabled={loading}
        onClick={handleReplay}
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Replaying…
          </span>
        ) : (
          'Replay This Call'
        )}
      </Button>

      {result?.success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <span>
            Replayed — new latency:{' '}
            <span className="font-mono font-semibold">{result.latencyMs}ms</span>
          </span>
          {result.newTraceId && (
            <Link
              href={`/traces/${result.newTraceId}`}
              className="underline underline-offset-2 font-medium hover:no-underline ml-4 whitespace-nowrap"
            >
              View new trace →
            </Link>
          )}
        </div>
      )}

      {result && !result.success && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {result.error ?? 'Replay failed'}
        </div>
      )}
    </div>
  )
}
