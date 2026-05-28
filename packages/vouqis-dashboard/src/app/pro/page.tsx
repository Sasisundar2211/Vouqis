'use client'

import {useState} from 'react'
import Link from 'next/link'

const FEATURES: {label: string; detail: string; live: boolean}[] = [
  {
    label: '90-day audit history',
    detail: 'Free plan keeps 7 days. Pro keeps 90 — enough to catch slow regressions.',
    live: true,
  },
  {
    label: 'CI/CD gate via API key',
    detail: 'Push audit results from GitHub Actions. Use --fail-below to block deploys.',
    live: true,
  },
  {
    label: '--fail-below flag',
    detail: 'Fail builds when trust score drops below a threshold you set.',
    live: true,
  },
  {
    label: 'Private shareable report links',
    detail: 'Share audit reports with your team without making them public.',
    live: false,
  },
  {
    label: 'Score regression alerts',
    detail: 'Get notified when a server you monitor drops below your threshold.',
    live: false,
  },
]

export default function ProPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      })
      const data = await res.json() as {url?: string; error?: string}
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-lg mx-auto space-y-10">

        {/* Back */}
        <Link href="/evals" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
          ← Back to audits
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">Vouqis Pro</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vouqis runs 10 behavioral probes against your MCP servers and scores them 0–100.
            Pro unlocks the CI gate, longer history, and team features.
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-bold font-mono">$9</span>
            <span className="text-sm text-muted-foreground font-mono">/month</span>
            <span className="text-xs text-muted-foreground ml-2">Cancel anytime.</span>
          </div>
        </div>

        {/* Features */}
        <div className="border rounded-lg divide-y">
          {FEATURES.map((f) => (
            <div key={f.label} className={`px-5 py-4 ${!f.live ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 text-xs font-mono ${f.live ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {f.live ? '✓' : '○'}
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {f.label}
                    {!f.live && (
                      <span className="ml-2 text-xs text-muted-foreground font-mono font-normal">
                        coming soon
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-mono">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-md px-4 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'Redirecting to Stripe…' : 'Start Pro — $9/mo'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Secure checkout via Stripe. Cancel anytime from your billing portal.
          </p>
        </form>

      </div>
    </main>
  )
}
