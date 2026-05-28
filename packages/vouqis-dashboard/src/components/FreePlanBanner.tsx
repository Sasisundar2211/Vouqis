'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'

export function FreePlanBanner() {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)
  useEffect(() => {
    setPlan(localStorage.getItem('vouqis_plan') === 'pro' ? 'pro' : 'free')
  }, [])

  if (plan !== 'free') return null

  return (
    <p className="text-xs text-muted-foreground">
      Showing last 7 days.{' '}
      <Link href="/pro" className="underline underline-offset-2 hover:text-foreground transition-colors">
        Upgrade to Pro
      </Link>{' '}
      for 90-day history and CI gate.
    </p>
  )
}
