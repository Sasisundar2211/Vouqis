import { google } from 'googleapis'
import { NextResponse } from 'next/server'

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
    range: 'Feedback!A:F',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const pr = searchParams.get('pr') ?? ''
  const q1 = searchParams.get('q1') ?? ''
  const q2 = searchParams.get('q2') ?? ''
  const q3 = searchParams.get('q3') ?? ''

  await appendToSheet([pr, q1, q2, q3, new Date().toISOString()]).catch(()  => {})

  const { track } = await import('@/lib/analytics/track')
  await track('feedback.submitted', { q1, q2, q3 })

  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Thanks — Vouqis</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}
.card{text-align:center;max-width:400px;padding:2rem}
h1{font-size:1.5rem;margin-bottom:.5rem}
p{color:#6b7280;margin:0}
</style>
</head>
<body>
<div class="card">
  <h1>Thanks for the feedback</h1>
  <p>This helps us understand whether Vouqis is actually useful — not just interesting.</p>
</div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    },
  )
}
