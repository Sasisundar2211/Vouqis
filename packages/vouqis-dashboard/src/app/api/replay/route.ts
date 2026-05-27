import {NextRequest, NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {supabase} from '@/lib/supabase'
import {createClient} from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

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
    // MCP Streamable HTTP requires an initialize handshake before tools/call.
    // Step 1: initialize to get a session ID.
    const initRes = await fetch(trace.server_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream'},
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          clientInfo: {name: 'vouqis-replay', version: '1.0.0'},
          capabilities: {},
        },
      }),
      signal: AbortSignal.timeout(10_000),
    })

    // Extract session ID from response header (Streamable HTTP transport).
    const sessionId = initRes.headers.get('mcp-session-id')

    // Drain the init response body so the connection is freed.
    await initRes.text()

    // Build headers for subsequent requests — include session ID if the server issued one.
    const mcpHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    }
    if (sessionId) mcpHeaders['mcp-session-id'] = sessionId

    // Step 2: Send initialized notification (fire-and-forget; ignore response).
    fetch(trace.server_url, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({jsonrpc: '2.0', method: 'notifications/initialized'}),
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined)

    // Step 3: Call the tool.
    const res = await fetch(trace.server_url, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {name: trace.tool_name, arguments: trace.params ?? {}},
      }),
      signal: AbortSignal.timeout(10_000),
    })

    let json: Record<string, unknown>
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('text/event-stream')) {
      // SSE: find the first `data:` line and parse it
      const text = await res.text()
      const dataLine = text.split('\n').find((l) => l.startsWith('data:'))
      json = dataLine ? JSON.parse(dataLine.slice(5).trim()) : {}
    } else {
      json = await res.json()
    }

    if (json.error) {
      const err = json.error
      callError =
        typeof err === 'object' && err !== null
          ? ((err as Record<string, unknown>).message ?? JSON.stringify(err)) as string
          : String(err)
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
  const {error: insertError} = await supabaseAdmin.from('traces').insert({
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
