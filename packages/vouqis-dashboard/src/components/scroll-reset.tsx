'use client'

import { useEffect } from 'react'

export function ScrollReset() {
  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])
  return null
}
