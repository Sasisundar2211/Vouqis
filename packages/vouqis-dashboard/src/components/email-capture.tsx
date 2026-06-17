'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="text-sm text-muted-foreground">
        Got it — we&rsquo;ll be in touch.
      </p>
    )
  }

  if (status === 'error') {
    return (
      <p className="text-sm text-incident">
        Something went wrong.{' '}
        <a
          href="mailto:sasisundhar2211@gmail.com"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Email us directly.
        </a>
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        disabled={status === 'loading'}
        className="flex-1 h-10 px-3 rounded-md border border-border/60 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending…' : 'Get Access'}
      </button>
    </form>
  )
}
