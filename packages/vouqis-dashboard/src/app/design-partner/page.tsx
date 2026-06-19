'use client'

import { useState, type FormEvent } from 'react'

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const BENEFITS = [
  { label: 'Founder support', desc: 'Direct access to the Vouqis team. We debug with you.' },
  { label: 'Early access', desc: 'Shape the product before it ships. Your failures define the roadmap.' },
  { label: 'Direct feedback loop', desc: 'Weekly check-ins during onboarding. No support queue.' },
  { label: 'Product influence', desc: "If you need a failure class we don't cover, we build it." },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function DesignPartnerPage() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/design-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? 'Submission failed')
      }
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(56px,8vw,104px) clamp(20px,5vw,72px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(48px,6vw,80px)' }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ED4B2A',
            marginBottom: 20,
          }}
        >
          Design partner program
        </div>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(40px,5.5vw,76px)',
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            color: '#15120E',
            margin: '0 0 24px',
            maxWidth: '18ch',
          }}
        >
          We work with teams that have real MCP failures.
        </h1>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(16px,1.2vw,19px)',
            lineHeight: 1.6,
            color: '#5C564A',
            maxWidth: '54ch',
            margin: 0,
          }}
        >
          We&apos;re working with a small number of teams running MCP-powered systems
          in production. If your agents are failing silently today, this is for you.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(40px,6vw,88px)',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: benefits */}
        <div style={{ flex: '1 1 260px', maxWidth: 360 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9A9486',
              marginBottom: 20,
            }}
          >
            What you get
          </div>
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              style={{
                padding: '18px 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: '#15120E',
                  marginBottom: 6,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: '#5C564A',
                }}
              >
                {b.desc}
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)' }} />

          <p
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(18px,1.6vw,22px)',
              lineHeight: 1.35,
              color: '#15120E',
              marginTop: 28,
            }}
          >
            No commitment. No contract. Just working software on your stack.
          </p>
        </div>

        {/* Right: form */}
        <div style={{ flex: '2 1 400px' }}>
          {state === 'success' ? (
            <div
              style={{
                background: '#16130E',
                borderRadius: 8,
                padding: 'clamp(32px,4vw,52px)',
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: '#69B98D',
                  marginBottom: 16,
                }}
              >
                ✓ APPLICATION RECEIVED
              </div>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(22px,2.4vw,30px)',
                  lineHeight: 1.25,
                  color: '#C9C2B2',
                  margin: 0,
                }}
              >
                We&apos;ll review your application and reach out within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Field name="name" label="Name" required style={{ flex: '1 1 160px' }} />
                <Field name="email" label="Email" type="email" required style={{ flex: '1 1 200px' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Field name="company" label="Company" style={{ flex: '1 1 160px' }} />
                <Field name="role" label="Your role" style={{ flex: '1 1 160px' }} />
              </div>
              <Field
                name="team_size"
                label="Engineering team size"
                placeholder="e.g. 3, 12, 50+"
              />
              <Field
                name="mcp_servers"
                label="Which MCP servers are you running?"
                placeholder="e.g. Supabase MCP, GitHub MCP, custom internal tools…"
                multiline
              />
              <Field
                name="failure_types"
                label="What failures have you seen? (optional)"
                placeholder="Null responses, schema drift, timeouts, other…"
                multiline
              />
              <Field
                name="current_approach"
                label="How are you handling reliability today? (optional)"
                placeholder="Manual log review, nothing yet, custom wrappers…"
                multiline
              />
              <Field
                name="why_now"
                label="Why is this a priority right now? (optional)"
                multiline
              />

              {state === 'error' && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: '#FF6A4D',
                    padding: '10px 14px',
                    background: 'color-mix(in srgb, #ED4B2A 10%, #EFEAE0)',
                    border: '1px solid color-mix(in srgb, #ED4B2A 30%, transparent)',
                    borderRadius: 4,
                  }}
                >
                  {errorMsg || 'Something went wrong. Try again or email hello@vouqis.tech.'}
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 52,
                  padding: '0 28px',
                  background: state === 'submitting' ? '#2A2520' : '#15120E',
                  color: '#E9E3D5',
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  border: 'none',
                  borderRadius: 3,
                  cursor: state === 'submitting' ? 'default' : 'pointer',
                  transition: 'background 150ms ease',
                  alignSelf: 'flex-start',
                }}
              >
                {state === 'submitting' ? 'Sending…' : 'Apply now →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

type FieldProps = {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  style?: React.CSSProperties
}

function Field({ name, label, type = 'text', placeholder, required, multiline, style }: FieldProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(21,18,14,0.04)',
    border: '1px solid rgba(21,18,14,0.16)',
    borderRadius: 3,
    padding: '11px 14px',
    fontFamily: MONO,
    fontSize: 13,
    color: '#15120E',
    outline: 'none',
    resize: multiline ? 'vertical' : undefined,
    minHeight: multiline ? 88 : undefined,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label
        htmlFor={name}
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.1em',
          color: '#6E6657',
        }}
      >
        {label}
        {required && <span style={{ color: '#ED4B2A', marginLeft: 4 }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
        />
      )}
    </div>
  )
}
