'use client'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      style={{
        padding: '3px 10px',
        background: copied ? 'oklch(0.22 0.05 145)' : 'oklch(1 0 0 / 0.06)',
        border: `1px solid ${copied ? 'oklch(0.45 0.10 145 / 0.5)' : 'oklch(1 0 0 / 0.10)'}`,
        borderRadius: '4px',
        fontSize: '11px',
        color: copied ? 'oklch(0.72 0.15 145)' : 'oklch(0.52 0 0)',
        cursor: 'pointer',
        fontFamily: 'var(--font-geist-mono)',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        outline: 'none',
      }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}
