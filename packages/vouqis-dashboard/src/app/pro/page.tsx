'use client'

import {useState} from 'react'

const FEATURES = [
  'Unlimited audits per day',
  'Priority queue — results in under 60s',
  'Private reports (not publicly shareable)',
  'CI/CD badge embeds',
  'Slack & webhook alerts on score drops',
  'Team seats (up to 5)',
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
    <main
      style={{backgroundColor: '#0d0d0d', color: '#e2e8f0'}}
      className="min-h-screen py-16 px-4 flex items-center justify-center"
    >
      <div className="max-w-md w-full space-y-10">
        {/* Header */}
        <div className="space-y-2 text-center">
          <p className="text-xs font-mono uppercase tracking-widest" style={{color: '#475569'}}>
            Vouqis
          </p>
          <h1 className="text-3xl font-bold font-mono" style={{color: '#e2e8f0'}}>
            Go Pro
          </h1>
          <p className="text-sm" style={{color: '#94a3b8'}}>
            Production-grade MCP trust monitoring for teams.
          </p>
        </div>

        {/* Feature list */}
        <div
          className="rounded-lg border p-6 space-y-3"
          style={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
        >
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 text-sm">
              <span style={{color: '#4ade80'}}>✓</span>
              <span style={{color: '#cbd5e1'}}>{f}</span>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest" style={{color: '#64748b'}}>
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border px-4 py-3 text-sm font-mono outline-none"
              style={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#e2e8f0',
              }}
            />
          </div>

          {error && (
            <p className="text-sm font-mono" style={{color: '#f87171'}}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg px-6 py-3 text-sm font-semibold font-mono transition-opacity disabled:opacity-50"
            style={{backgroundColor: '#4ade80', color: '#052e16'}}
          >
            {loading ? 'Redirecting…' : 'Upgrade to Pro →'}
          </button>

          <p className="text-center text-xs" style={{color: '#475569'}}>
            Secure checkout via Polar · Cancel anytime
          </p>
        </form>
      </div>
    </main>
  )
}
