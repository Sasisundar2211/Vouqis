'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'

export function ProCta() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)
  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan !== 'free') return null

  return (
    <Link
      href="/pro"
      className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors font-mono"
    >
      Pro: 90-day history + CI gate →
    </Link>
  )
}
