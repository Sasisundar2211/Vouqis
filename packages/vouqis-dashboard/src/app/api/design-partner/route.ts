import { google } from 'googleapis'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'sasisundhar2211@gmail.com'

type ApplicationBody = {
  name?: unknown
  email?: unknown
  company?: unknown
  role?: unknown
  team_size?: unknown
  ai_systems?: unknown
  failure_types?: unknown
  current_approach?: unknown
  why_now?: unknown
}

async function appendToSheet(row: string[]): Promise<void> {
  const accountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!accountEmail || !privateKey || !sheetId) return

  const auth = new google.auth.JWT({
    email: accountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

export async function POST(request: Request): Promise<Response> {
  let body: ApplicationBody
  try {
    body = await request.json() as ApplicationBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, company, role, team_size, ai_systems, failure_types, current_approach, why_now } = body

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Append to Google Sheet (non-blocking — email still sends even if Sheet fails)
  await appendToSheet([
    str(name),
    str(email),
    str(company),
    str(role),
    str(team_size),
    str(ai_systems),
    str(failure_types),
    str(current_approach),
    str(why_now),
    new Date().toISOString(),
  ]).catch(() => {})

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  const text = [
    'New Early Access Application',
    '',
    `Name:              ${name}`,
    `Email:             ${email}`,
    `Company:           ${company ?? '—'}`,
    `Role:              ${role ?? '—'}`,
    `Team size:         ${team_size ?? '—'}`,
    `AI systems:        ${ai_systems ?? '—'}`,
    `Failure types:     ${failure_types ?? '—'}`,
    `Current approach:  ${current_approach ?? '—'}`,
    `Why now:           ${why_now ?? '—'}`,
  ].join('\n')

  const { error } = await resend.emails.send({
    from: 'Vouqis <onboarding@resend.dev>',
    to: [NOTIFY_EMAIL],
    subject: `Early access: ${name} — ${company ?? email}`,
    text,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
