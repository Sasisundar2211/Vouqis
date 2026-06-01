import {createClient} from '@supabase/supabase-js'
import {NextRequest} from 'next/server'
import {sendFounderAlert} from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )

  let body: {
    serverUrl: string
    trustScore: number
    verdict: string
    passCount: number
    failCount: number
    latencyP50: number
    topFailures: Record<string, number>
    probeResults: unknown[]
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({error: 'Invalid JSON body'}, {status: 400})
  }

  const {serverUrl, trustScore, verdict, passCount, failCount, latencyP50, topFailures, probeResults} = body

  if (!serverUrl || trustScore === undefined || !verdict) {
    return Response.json({error: 'Missing required fields'}, {status: 400})
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const {data, error} = await supabase
    .from('audit_reports')
    .insert({
      server_url: serverUrl,
      trust_score: trustScore,
      verdict,
      pass_count: passCount,
      fail_count: failCount,
      latency_p50: latencyP50,
      top_failures: topFailures,
      probe_results: probeResults,
      expires_at: expiresAt.toISOString(),
      user_api_key: null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return Response.json({error: error?.message ?? 'Insert failed'}, {status: 500})
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const reportUrl = `${appUrl}/report/${data.id}`

  // Fire-and-forget founder alert — never block the response
  sendFounderAlert({serverUrl, score: trustScore, passCount, failCount, reportUrl}).catch(
    (err) => console.error('[reports] founder alert failed:', err),
  )

  return Response.json({id: data.id, url: reportUrl, reportUrl})
}
