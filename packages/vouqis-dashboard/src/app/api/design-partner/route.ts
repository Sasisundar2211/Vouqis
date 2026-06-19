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
