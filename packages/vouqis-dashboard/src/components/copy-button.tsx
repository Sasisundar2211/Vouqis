'use client'

import { useState } from 'react'

type CopyButtonProps = {
  size?: 'sm' | 'lg'
  /** When provided, copies this text instead of the default install command.
   *  Also renders as a minimal inline copy button (used by /proxy page). */
  text?: string
}

export function CopyButton({ size = 'sm', text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleClick() {
    navigator.clipboard?.writeText(text ?? 'pip install vouqis-verify').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  // Minimal inline variant when a custom text is passed (proxy page usage)
  if (text !== undefined) {
    return (
      <button
        onClick={handleClick}
        style={{
          padding: '3px 10px',
          background: copied ? 'rgba(105,185,141,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${copied ? 'rgba(105,185,141,0.4)' : 'rgba(255,255,255,0.10)'}`,
          borderRadius: 4,
          fontSize: 11,
          color: copied ? '#69B98D' : '#8C8473',
          cursor: 'pointer',
          fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          outline: 'none',
        }}
      >
        {copied ? '✓ copied' : 'copy'}
      </button>
    )
  }

  const height = size === 'lg' ? 56 : 52
  const paddingLeft = size === 'lg' ? 20 : 18
  const fontSize = size === 'lg' ? 15 : 14
  const badgeSize = size === 'lg' ? 44 : 40

  return (
    <button
      onClick={handleClick}
      className="vq-btn-dark"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        height,
        padding: `0 6px 0 ${paddingLeft}px`,
        background: '#15120E',
        color: '#E9E3D5',
        border: 'none',
        borderRadius: 3,
        cursor: 'pointer',
        fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
        fontSize,
        transition: 'transform 160ms cubic-bezier(0.23,1,0.32,1), background 150ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#ED4B2A' }}>$</span>
      <span>pip install vouqis-verify</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: badgeSize,
          height: badgeSize,
          background: 'rgba(255,255,255,0.07)',
          color: '#B9B2A1',
          fontSize: 11,
          letterSpacing: '0.08em',
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        {copied ? 'copied' : 'copy'}
      </span>
    </button>
  )
}
