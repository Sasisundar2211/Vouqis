import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'sasisundhar2211@gmail.com'

type ApplicationBody = {
  name?: unknown
  email?: unknown
  company?: unknown
  role?: unknown
  team_size?: unknown
  mcp_servers?: unknown
  failure_types?: unknown
  current_approach?: unknown
  why_now?: unknown
}

async function saveToAirtable(fields: Record<string, string>): Promise<void> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) return

  await fetch(`https://api.airtable.com/v0/${baseId}/Applications`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
}

export async function POST(request: Request): Promise<Response> {
  let body: ApplicationBody
  try {
    body = await request.json() as ApplicationBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, company, role, team_size, mcp_servers, failure_types, current_approach, why_now } = body

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Save to Airtable (non-blocking — email still sends even if Airtable fails)
  await saveToAirtable({
    Name:             str(name),
    Email:            str(email),
    Company:          str(company),
    Role:             str(role),
    'Team Size':      str(team_size),
    'MCP Servers':    str(mcp_servers),
    'Failure Types':  str(failure_types),
    'Current Approach': str(current_approach),
    'Why Now':        str(why_now),
    'Submitted At':   new Date().toISOString(),
  }).catch(() => {})

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  const text = [
    'New Design Partner Application',
    '',
    `Name:              ${name}`,
    `Email:             ${email}`,
    `Company:           ${company ?? '—'}`,
    `Role:              ${role ?? '—'}`,
    `Team size:         ${team_size ?? '—'}`,
    `MCP servers:       ${mcp_servers ?? '—'}`,
    `Failure types:     ${failure_types ?? '—'}`,
    `Current approach:  ${current_approach ?? '—'}`,
    `Why now:           ${why_now ?? '—'}`,
  ].join('\n')

  const { error } = await resend.emails.send({
    from: 'Vouqis <onboarding@resend.dev>',
    to: [NOTIFY_EMAIL],
    subject: `Design partner: ${name} — ${company ?? email}`,
    text,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
