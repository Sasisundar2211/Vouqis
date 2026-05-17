import {NextRequest, NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {supabase} from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let traceId: string
  try {
    const body = await request.json()
    traceId = body.traceId
    if (!traceId || typeof traceId !== 'string') {
      return NextResponse.json({success: false, error: 'traceId is required'}, {status: 400})
    }
  } catch {
    return NextResponse.json({success: false, error: 'Invalid JSON body'}, {status: 400})
  }

  // Fetch original trace
  const {data: trace, error: fetchError} = await supabase
    .from('traces')
    .select('*')
    .eq('id', traceId)
    .single()

  if (fetchError || !trace) {
    return NextResponse.json({success: false, error: 'Trace not found'}, {status: 404})
  }

  // Re-run the tool call
  const startTime = Date.now()
  let response: unknown = null
  let callError: string | null = null
  let success = true

  try {
    const res = await fetch(trace.server_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {name: trace.tool_name, arguments: trace.params ?? {}},
      }),
      signal: AbortSignal.timeout(10_000),
    })

    const json = await res.json()

    if (json.error) {
      // JSON-RPC error object
      callError =
        typeof json.error === 'object' && json.error !== null
          ? (json.error.message ?? JSON.stringify(json.error))
          : String(json.error)
      success = false
    } else {
      response = json.result ?? json
    }
  } catch (err) {
    callError = err instanceof Error ? err.message : String(err)
    success = false
    const latencyMs = Date.now() - startTime
    return NextResponse.json({success: false, error: callError, latencyMs}, {status: 200})
  }

  const latencyMs = Date.now() - startTime

  // Insert replay trace row
  const newTraceId = randomUUID()
  const {error: insertError} = await supabase.from('traces').insert({
    id: newTraceId,
    project_id: trace.project_id,
    server_url: trace.server_url,
    tool_name: trace.tool_name,
    params: trace.params,
    response,
    latency_ms: latencyMs,
    error: callError,
    success,
  })

  if (insertError) {
    return NextResponse.json(
      {success: false, error: `Failed to save replay: ${insertError.message}`},
      {status: 500},
    )
  }

  return NextResponse.json({success, newTraceId, latencyMs, response})
}
