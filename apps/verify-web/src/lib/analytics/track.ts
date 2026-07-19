import { google } from 'googleapis'

export type FunnelEvent =
  | 'app.installed'
  | 'pr.opened'
  | 'ai.detected'
  | 'package.generated'
  | 'package.viewed'
  | 'feedback.submitted'
  | 'pr.merged'
  | 'pr.changes_requested'
  | 'pr.closed_unmerged'

type EventProperties = {
  owner?: string
  repo?: string
  prNumber?: number
  aiFileCount?: number
  changeTypes?: string[]
  risk?: string
  score?: number
  q1?: string
  q2?: string
  q3?: string
  mergeLatencyMinutes?: number | null
  packageVersion?: number
  [key: string]: unknown
}

export async function track(event: FunnelEvent, props: EventProperties = {}): Promise<void> {
  const accountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!accountEmail || !privateKey || !sheetId) return

  const row = [
    event,
    new Date().toISOString(),
    props.owner ?? '',
    props.repo ?? '',
    String(props.prNumber ?? ''),
    String(props.aiFileCount ?? ''),
    (props.changeTypes ?? []).join(','),
    props.risk ?? '',
    String(props.score ?? ''),
    props.q1 ?? '',
    props.q2 ?? '',
    props.q3 ?? '',
    props.mergeLatencyMinutes != null ? String(props.mergeLatencyMinutes) : '',
    props.packageVersion != null ? String(props.packageVersion) : '',
  ]

  try {
    const auth = new google.auth.JWT({
      email: accountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Events!A:N',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  } catch {
    // analytics must never crash the main path
  }
}
