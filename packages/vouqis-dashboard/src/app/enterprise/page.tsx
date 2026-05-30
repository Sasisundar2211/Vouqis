'use client'

import {useState} from 'react'
import Link from 'next/link'

const FEATURES = [
  {
    title: 'Unlimited seats + SSO',
    detail: 'SAML 2.0 / OIDC — works with Okta, Azure AD, Google Workspace, and any compliant IdP.',
  },
  {
    title: '99.9% uptime SLA with credits',
    detail: 'Contractual SLA with automatic credits if we fall short. Not a marketing claim.',
  },
  {
    title: 'CI/CD enforcement across all repos',
    detail: 'One API key, unlimited repos. Block any deploy that drops below your trust threshold.',
  },
  {
    title: 'Private audit history (custom retention)',
    detail: 'Choose your own retention window. Data residency options available.',
  },
  {
    title: 'Security questionnaire & SOC 2 docs',
    detail: 'Pre-filled security questionnaire, architecture diagram, and compliance documentation.',
  },
  {
    title: '30-day pilot with dedicated onboarding',
    detail: 'We audit your full MCP stack, set up CI gates, and train your team — together.',
  },
]

export default function EnterprisePage() {
  const [pilotEmail, setPilotEmail] = useState('')

  function handlePilotSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pilotEmail) return
    const subject = encodeURIComponent('Enterprise Pilot Request')
    const body = encodeURIComponent(`Hi,\n\nI'd like to start a 30-day Enterprise Pilot.\n\nEmail: ${pilotEmail}\n`)
    window.location.href = `mailto:hello@vouqis.tech?subject=${subject}&body=${body}`
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Vouqis Enterprise</h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Production-grade MCP reliability for teams shipping AI agents at scale.
          </p>
        </div>

        {/* Hero stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {stat: '17,468', label: 'MCP servers audited'},
            {stat: '12.9%', label: 'production-ready'},
            {stat: '87.1%', label: 'have silent failures'},
          ].map(({stat, label}) => (
            <div key={label} className="border rounded-lg px-6 py-5 space-y-1">
              <p className="text-3xl font-bold font-mono">{stat}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="border rounded-lg px-5 py-4 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-xs font-mono text-green-600">✓</span>
                  <p className="text-sm font-medium">{f.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pilot offer box */}
        <div className="border-2 border-foreground rounded-lg p-8 space-y-5">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-xl font-semibold tracking-tight">30-Day Paid Pilot</h2>
              <span className="text-xl font-bold font-mono">$2,000</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get your entire MCP stack audited. Full report. No commitment after 30 days.
            </p>
          </div>
          <form onSubmit={handlePilotSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={pilotEmail}
              onChange={(e) => setPilotEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={!pilotEmail}
              className="rounded-md px-5 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
            >
              Start Pilot →
            </button>
          </form>
        </div>

        {/* Social proof */}
        <blockquote className="border-l-2 border-foreground pl-6 space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            &ldquo;Vouqis caught 3 silent MCP failures in our CI pipeline before they reached production.
            It&apos;s now a required gate for every MCP integration we ship.&rdquo;
          </p>
          <footer className="text-xs text-muted-foreground font-mono">
            — AI Infrastructure Lead, Series B SaaS Company
          </footer>
        </blockquote>

        {/* Back link */}
        <Link href="/pro" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
          ← Back to pricing
        </Link>

      </div>
    </main>
  )
}
