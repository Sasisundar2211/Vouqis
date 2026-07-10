'use client'

import { useState, useEffect } from 'react'

type OS = 'mac' | 'win'

const INSTALL: Record<OS, string> = {
  mac: 'pipx install vouqis-verify',
  win: 'pip install vouqis-verify',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'

type CopyButtonProps = {
  size?: 'sm' | 'lg'
  /** When provided, copies this text instead of the default install command.
   *  Also renders as a minimal inline copy button (used by /proxy page). */
  text?: string
}

export function CopyButton({ size = 'sm', text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [os, setOs] = useState<OS>('mac')

  useEffect(() => {
    if (/Win/i.test(navigator.userAgent)) setOs('win')
  }, [])

  const cmd = text ?? INSTALL[os]

  function handleClick() {
    navigator.clipboard?.writeText(cmd).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  // Minimal inline variant when a custom text is passed
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
          fontFamily: MONO,
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
    <div>
      {/* macOS / Windows tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {(['mac', 'win'] as OS[]).map((o) => (
          <button
            key={o}
            onClick={() => setOs(o)}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.04em',
              padding: '4px 12px',
              background: os === o ? '#15120E' : 'transparent',
              color: os === o ? '#E9E3D5' : '#8C8473',
              border: '1px solid rgba(21,18,14,0.20)',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 120ms ease',
              outline: 'none',
            }}
          >
            {o === 'mac' ? 'macOS' : 'Windows'}
          </button>
        ))}
      </div>

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
          fontFamily: MONO,
          fontSize,
          transition: 'transform 160ms cubic-bezier(0.23,1,0.32,1), background 150ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#ED4B2A' }}>$</span>
        <span>{cmd}</span>
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
    </div>
  )
}
