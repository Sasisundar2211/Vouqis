'use client'

import {useState} from 'react'

const pro = {reportHistoryDays: 90}
const free = {reportHistoryDays: 7}

const FEATURES: {label: string; live: boolean}[] = [
  {label: `${pro.reportHistoryDays}-day report history (free: ${free.reportHistoryDays} days)`, live: true},
  {label: 'API key — push audit results from GitHub Actions / CI', live: true},
  {label: '--fail-below flag — fail builds when trust score drops', live: true},
  {label: 'Private shareable report links (team-only)', live: false},
  {label: 'Slack alerts on score regression', live: false},
  {label: 'Priority support', live: false},
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
        {/* Launch pricing banner */}
        <div
          className="rounded-lg px-4 py-3 text-center"
          style={{backgroundColor: '#1a2e1a', border: '1px solid #166534'}}
        >
          <p className="text-xs font-mono" style={{color: '#4ade80'}}>
            🚀 Launch pricing — first 50 customers only. Locks in at $9/mo forever.
          </p>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <p className="text-xs font-mono uppercase tracking-widest" style={{color: '#475569'}}>
            Vouqis
          </p>
          <h1 className="text-3xl font-bold font-mono" style={{color: '#e2e8f0'}}>
            Go Pro
          </h1>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold font-mono" style={{color: '#4ade80'}}>$9</span>
            <span className="text-sm font-mono" style={{color: '#475569'}}>/mo · launch price</span>
            <span className="text-sm font-mono line-through" style={{color: '#374151'}}>$49</span>
          </div>
          <p className="text-sm" style={{color: '#94a3b8'}}>
            Production-grade MCP trust monitoring. Cancel anytime.
          </p>
        </div>

        {/* Feature list */}
        <div
          className="rounded-lg border p-6"
          style={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
        >
          <ul style={{listStyle: 'none', margin: 0, padding: 0, fontSize: 14}}>
            {FEATURES.map((f) => (
              <li key={f.label} style={{marginBottom: 12, color: f.live ? '#94a3b8' : '#4b5563'}}>
                <span style={{color: f.live ? '#4ade80' : '#374151', marginRight: 10}}>✓</span>
                {f.label}
                {!f.live && (
                  <span style={{color: '#374151', fontSize: 11, marginLeft: 8}}>coming soon</span>
                )}
              </li>
            ))}
          </ul>
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
            {loading ? 'Redirecting…' : 'Get Pro for $9/mo — Lock in launch price →'}
          </button>

          <p className="text-center text-xs" style={{color: '#475569'}}>
            Secure checkout via Stripe · Cancel anytime
          </p>
        </form>
      </div>
    </main>
  )
}
