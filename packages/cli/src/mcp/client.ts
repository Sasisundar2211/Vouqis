import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — SSEClientTransport is deprecated but required for 2024-11-05 server fallback
import {SSEClientTransport} from '@modelcontextprotocol/sdk/client/sse.js'
import {
  ListToolsResultSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type {McpTool, McpToolCallResult, McpRawProbeResult} from './types.js'

export class McpClient {
  private sdk: Client | null = null

  constructor(
    private readonly url: string,
    private readonly headers: Record<string, string> = {},
  ) {}

  async connect(): Promise<McpTool[]> {
    this.sdk = await this.connectWithFallback()
    const result = await this.sdk.request(
      {method: 'tools/list', params: {}},
      ListToolsResultSchema,
    )
    return result.tools.map((t) => ({
      name: t.name,
      description: t.description ?? '',
      inputSchema: (t.inputSchema ?? {}) as Record<string, unknown>,
    }))
  }

  async callTool(
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<McpToolCallResult> {
    if (!this.sdk) throw new Error('McpClient not connected — call connect() first')
    const result = await this.sdk.request(
      {method: 'tools/call', params: {name: toolName, arguments: input}},
      CallToolResultSchema,
    )
    return {
      content: result.content as McpToolCallResult['content'],
      isError: result.isError,
    }
  }

  // Sends an arbitrary body directly to the server URL, bypassing the SDK.
  // Used exclusively by the malformed-rpc probes.
  async probeRaw(body: unknown): Promise<McpRawProbeResult> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...this.headers,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const text = await response.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
    return {status: response.status, body: parsed}
  }

  async disconnect(): Promise<void> {
    await this.sdk?.close()
    this.sdk = null
  }

  // Tries StreamableHTTP (2025-03-26 spec) first, falls back to SSE (2024-11-05 spec).
  // Transport branching is fully contained here — callers see only McpClient.
  private async connectWithFallback(): Promise<Client> {
    const baseUrl = new URL(this.url)
    const requestInit = Object.keys(this.headers).length > 0
      ? {headers: this.headers}
      : undefined

    const streamableClient = new Client({name: 'vouqis', version: '0.0.1'})
    let streamableError: unknown
    try {
      await streamableClient.connect(
        new StreamableHTTPClientTransport(baseUrl, requestInit ? {requestInit} : undefined),
      )
      return streamableClient
    } catch (err) {
      streamableError = err
      // If auth failure, surface immediately — fallback won't help
      if (isAuthError(err)) throw buildAuthError(this.url)
    }

    const sseOpts = Object.keys(this.headers).length > 0
      ? {requestInit: {headers: this.headers}}
      : undefined
    const sseClient = new Client({name: 'vouqis', version: '0.0.1'})
    try {
      await sseClient.connect(new SSEClientTransport(baseUrl, sseOpts))
      return sseClient
    } catch (err) {
      if (isAuthError(err)) throw buildAuthError(this.url)
      // Throw the original streamable error if SSE also fails generically
      throw streamableError ?? err
    }
  }
}

function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('forbidden')
}

function buildAuthError(url: string): Error {
  return new Error(
    `This server requires authentication (HTTP 401).\n\n` +
    `Pass your credentials with the --header flag:\n` +
    `  vouqis audit ${url} --header "Authorization: Bearer YOUR_TOKEN"\n\n` +
    `Or embed the key in the URL if the server supports query params:\n` +
    `  vouqis audit ${url}?api_key=YOUR_KEY`,
  )
}
