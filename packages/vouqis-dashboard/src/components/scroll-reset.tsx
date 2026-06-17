'use client'

import { useEffect } from 'react'

export function ScrollReset() {
  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  return null
}
