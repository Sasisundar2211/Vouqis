import {NextRequest, NextResponse} from 'next/server'
import {supabase} from '@/lib/supabase'

export async function POST(request: NextRequest) {
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
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400})
  }

  const {serverUrl, trustScore, verdict, passCount, failCount, latencyP50, topFailures, probeResults} = body

  if (!serverUrl || trustScore === undefined || !verdict) {
    return NextResponse.json({error: 'Missing required fields'}, {status: 400})
  }

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
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({error: error?.message ?? 'Insert failed'}, {status: 500})
  }

  return NextResponse.json({
    id: data.id,
    url: `https://vouqis.vercel.app/report/${data.id}`,
  })
}
