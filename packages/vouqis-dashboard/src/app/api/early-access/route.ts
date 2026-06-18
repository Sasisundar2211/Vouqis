import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'sasisundhar2211@gmail.com'

export async function POST(request: Request): Promise<Response> {
  let email: string
  try {
    const body = await request.json() as { email?: unknown }
    if (typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    email = body.email.trim()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: 'Vouqis <onboarding@resend.dev>',
    to: [NOTIFY_EMAIL],
    subject: `Early access: ${email}`,
    text: `New early access request\n\nEmail: ${email}\n`,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
