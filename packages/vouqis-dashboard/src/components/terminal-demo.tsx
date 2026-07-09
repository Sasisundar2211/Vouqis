'use client'

import { useState, useEffect, useRef } from 'react'

type Line = {
  text: string
  color: string
  weight: string
  style: string
}

const LINES: Line[] = [
  { text: '$ vouqis verify --config vouqis.yml', color: '#E9E3D5', weight: '500', style: 'normal' },
  { text: '→ baseline: origin/main', color: '#69B98D', weight: '400', style: 'normal' },
  { text: '→ changed: 7 files across 3 ai_paths', color: '#69B98D', weight: '400', style: 'normal' },
  { text: ' ', color: '#8C8473', weight: '400', style: 'normal' },
  { text: '  prompts/          4 files   ████████', color: '#C9C2B2', weight: '400', style: 'normal' },
  { text: '  evals/            2 files   ████', color: '#C9C2B2', weight: '400', style: 'normal' },
  { text: '  config/           1 file    ██', color: '#C9C2B2', weight: '400', style: 'normal' },
  { text: ' ', color: '#8C8473', weight: '400', style: 'normal' },
  { text: '→ running: python evals/run.py', color: '#8C8473', weight: '400', style: 'normal' },
  { text: '  exit 0  ·  score: 0.71  ·  1240 ms', color: '#FF6A4D', weight: '500', style: 'normal' },
  { text: ' ', color: '#8C8473', weight: '400', style: 'normal' },
  { text: '✕  BLOCK MERGE   (High confidence)', color: '#FF6A4D', weight: '600', style: 'normal' },
  { text: '   eval score 0.71 < threshold 0.80', color: '#FF6A4D', weight: '400', style: 'normal' },
  { text: ' ', color: '#8C8473', weight: '400', style: 'normal' },
  { text: '→ posting report to PR #47...  done', color: '#69B98D', weight: '400', style: 'normal' },
  { text: '// without vouqis: this PR would have merged without eval evidence', color: '#6E6657', weight: '400', style: 'italic' },
]

export function TerminalDemo() {
  const [visN, setVisN] = useState(0)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function runDemo() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setVisN(0)
    setRunning(true)
    setStarted(true)

    let count = 0
    intervalRef.current = setInterval(() => {
      count += 1
      setVisN(count)
      if (count >= LINES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRunning(false)
      }
    }, 420)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          runDemo()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(el)

    const fallback = setTimeout(() => {
      if (!started) runDemo()
    }, 4500)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Terminal box */}
      <div
        ref={containerRef}
        style={{
          background: '#16130E',
          borderRadius: 8,
          boxShadow: '0 40px 80px -34px rgba(21,18,14,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3A352C', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3A352C', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3A352C', display: 'inline-block' }} />
          <span
            style={{
              marginLeft: 10,
              fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
              fontSize: 11.5,
              color: '#8C8473',
              letterSpacing: '0.04em',
            }}
          >
            vouqis — verify
          </span>
        </div>

        {/* Content area */}
        <div
          style={{
            padding: 'clamp(20px,3vw,34px) clamp(20px,3vw,38px)',
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            fontSize: 'clamp(12.5px, 1.15vw, 14.5px)',
            lineHeight: 1.95,
            minHeight: 330,
          }}
        >
          {LINES.slice(0, visN).map((line, i) => (
            <div
              key={i}
              style={{
                whiteSpace: 'pre-wrap',
                color: line.color,
                fontWeight: line.weight,
                fontStyle: line.style,
                animation: 'vq-line 0.34s cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              {line.text}
            </div>
          ))}
          {running && (
            <span
              style={{
                display: 'inline-block',
                width: 9,
                height: 16,
                background: '#69B98D',
                animation: 'vq-blink 1s step-end infinite',
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>
      </div>

      {/* Legend + replay */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px 24px',
          marginTop: 20,
          fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <span>
            <span style={{ color: '#FF6A4D' }}>●</span>
            <span style={{ color: '#6E6657', marginLeft: 8 }}>without vouqis: PR merged without eval evidence</span>
          </span>
          <span>
            <span style={{ color: '#69B98D' }}>●</span>
            <span style={{ color: '#6E6657', marginLeft: 8 }}>with vouqis: verdict posted to PR before merge</span>
          </span>
        </div>
        <button
          onClick={runDemo}
          className="vq-btn-outline"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            fontSize: 12,
            color: '#5C564A',
            background: 'transparent',
            border: '1px solid rgba(21,18,14,0.18)',
            borderRadius: 3,
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
        >
          replay ↺
        </button>
      </div>
    </div>
  )
}
