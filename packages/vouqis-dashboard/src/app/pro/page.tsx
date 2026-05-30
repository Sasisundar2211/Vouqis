'use client'

import {useState} from 'react'
import Link from 'next/link'

const FREE_FEATURES = [
  '10-probe Trust Score audit',
  'Local JSON report output',
  '7-day audit history',
  '1 seat',
]

const PRO_FEATURES: {label: string; live: boolean}[] = [
  {label: 'Everything in Free', live: true},
  {label: '90-day audit history', live: true},
  {label: 'CI/CD gate via API key', live: true},
  {label: '--fail-below flag', live: true},
  {label: 'Private shareable report links', live: false},
  {label: 'Score regression alerts', live: false},
]

const ENTERPRISE_FEATURES = [
  'Everything in Pro',
  'Unlimited seats + SSO',
  'SLA: 99.9% uptime guarantee',
  'Dedicated Slack channel',
  'Security questionnaire & compliance docs',
  '30-day pilot with white-glove onboarding',
  'Custom retention & data residency',
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
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Back */}
        <Link href="/evals" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
          ← Back to audits
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Vouqis Pricing</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start free. Upgrade when you need CI gates, longer history, or team-wide coverage.
          </p>
        </div>

        {/* 3-column tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Free tier */}
          <div className="border rounded-lg p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono">$0</span>
                <span className="text-sm text-muted-foreground font-mono">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">No credit card required.</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 text-xs font-mono text-muted-foreground">○</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/evals"
              className="block w-full text-center rounded-md border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro tier */}
          <div className="border-2 border-foreground rounded-lg p-6 space-y-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-foreground text-background text-xs font-mono px-3 py-1 rounded-full">
                Most popular
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono">$9</span>
                <span className="text-sm text-muted-foreground font-mono">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">Cancel anytime.</p>
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f.label} className={`flex items-start gap-2.5 text-sm ${!f.live ? 'opacity-50' : ''}`}>
                  <span className={`mt-0.5 text-xs font-mono ${f.live ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {f.live ? '✓' : '○'}
                  </span>
                  <span>
                    {f.label}
                    {!f.live && (
                      <span className="ml-1.5 text-xs text-muted-foreground font-mono font-normal">coming soon</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
              />
              {error && (
                <p className="text-xs text-red-500 font-mono">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-md px-4 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? 'Redirecting to Stripe…' : 'Start Pro — $9/mo'}
              </button>
            </form>
          </div>

          {/* Enterprise tier */}
          <div className="border rounded-lg p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Enterprise</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono">$499</span>
                <span className="text-sm text-muted-foreground font-mono">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">30-day pilot available.</p>
            </div>
            <ul className="space-y-2.5">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 text-xs font-mono text-green-600">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/enterprise"
              className="block w-full text-center rounded-md px-4 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Talk to Sales →
            </Link>
          </div>

        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pro: Secure checkout via Stripe. Enterprise: We&apos;ll reach out within 1 business day.
        </p>

      </div>
    </main>
  )
}
