'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'

export function PlanBadge() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)

  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan === null) return null

  if (plan === 'pro') {
    return (
      <span className="ml-auto text-xs font-mono font-medium px-2 py-0.5 rounded border border-green-600/40 text-green-600">
        Pro
      </span>
    )
  }

  return (
    <Link
      href="/pro"
      className="ml-auto text-xs text-muted-foreground font-mono px-2 py-0.5 rounded border border-border hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      Free
    </Link>
  )
}
