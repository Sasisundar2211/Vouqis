'use client'
import {useState} from 'react'
export default function CopyButton({text}: {text: string}) {
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
        backgroundColor: copied ? '#14532d' : '#1e293b',
        border: 'none',
        borderRadius: '4px',
        fontSize: '11px',
        color: copied ? '#4ade80' : '#64748b',
        cursor: 'pointer',
        fontFamily: 'var(--font-geist-mono)',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}
