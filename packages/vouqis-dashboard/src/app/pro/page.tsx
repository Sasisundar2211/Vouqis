'use client'

import {useState} from 'react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string | undefined
  amount: number | string
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {email?: string}
  theme?: {color?: string}
  handler: (response: RazorpaySuccessResponse) => void
  modal?: {ondismiss?: () => void}
}

interface RazorpayInstance {
  open(): void
  on(event: 'payment.failed', handler: (response: {error: {description: string}}) => void): void
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function ProPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  async function handleRazorpayPayment() {
    if (!email) return
    setLoading(true)
    setError('')

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setError('Failed to load payment gateway. Check your connection.')
      setLoading(false)
      return
    }

    let order: {order_id: string; amount: number; currency: string}
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amount: billingPeriod === 'annual' ? 900000 : 90000, currency: 'INR', receipt: `pro_${Date.now()}`}),
      })
      const data = await res.json() as typeof order & {error?: string}
      if (!res.ok) {
        setError(data.error ?? 'Failed to create order.')
        setLoading(false)
        return
      }
      order = data
    } catch {
      setError('Network error. Try again.')
      setLoading(false)
      return
    }

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Vouqis',
      description: billingPeriod === 'annual' ? 'Pro Plan — ₹9,000/year' : 'Pro Plan — ₹900/month',
      order_id: order.order_id,
      prefill: {email},
      theme: {color: '#000000'},
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          const vRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...response, email}),
          })
          const vData = await vRes.json() as {success?: boolean; error?: string}
          if (!vRes.ok) {
            setError(vData.error ?? 'Payment verification failed.')
            return
          }
          window.location.href = '/pro/success'
        } catch {
          setError('Verification failed. Contact hello@vouqis.tech.')
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    })

    rzp.on('payment.failed', (response) => {
      setError(response.error?.description ?? 'Payment failed. Try again.')
      setLoading(false)
    })

    rzp.open()
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

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

        {/* Cost-of-failure anchor */}
        <div className="border-l-2 border-amber-500 bg-amber-50/5 pl-4 py-3 pr-4 rounded-r-md text-xs font-mono text-muted-foreground leading-relaxed">
          <span className="text-amber-500 font-semibold">The math:</span> One undetected silent MCP failure = avg 4.5 engineering hours debugging + wasted LLM API costs.
          Vouqis Pro is ₹900/month — the same budget line as Datadog or Sentry.
          Frame it to your VP Eng as: &ldquo;the missing observability layer for our AI stack.&rdquo;
        </div>

        {/* 2-column tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

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
            {/* Billing toggle */}
            <div className="flex rounded-md border overflow-hidden text-xs font-mono">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-1.5 transition-colors ${billingPeriod === 'monthly' ? 'bg-foreground text-background' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 py-1.5 transition-colors ${billingPeriod === 'annual' ? 'bg-foreground text-background' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Annual <span className="text-green-600 font-semibold">−17%</span>
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono">{billingPeriod === 'annual' ? '₹9,000' : '₹900'}</span>
                <span className="text-sm text-muted-foreground font-mono">{billingPeriod === 'annual' ? '/year' : '/month'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {billingPeriod === 'annual' ? '2 months free · PO-friendly annual billing' : 'Cancel anytime.'}
              </p>
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
            <div className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
              />
              {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
              <button
                type="button"
                onClick={handleRazorpayPayment}
                disabled={loading || !email}
                className="w-full rounded-md px-4 py-2.5 text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? 'Opening checkout…' : billingPeriod === 'annual' ? 'Start Pro — ₹9,000/yr' : 'Start Pro — ₹900/mo'}
              </button>
              <p className="text-xs text-muted-foreground font-mono text-center">
                UPI · Net Banking · Indian cards
              </p>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-muted-foreground">
          Secure checkout via Razorpay. Questions? <a href="mailto:hello@vouqis.tech" className="underline underline-offset-2 hover:text-foreground transition-colors">hello@vouqis.tech</a>
        </p>

      </div>
    </main>
  )
}
