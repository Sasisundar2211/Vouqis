export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface McpContentItem {
  type: string
  text?: string
  [key: string]: unknown
}

export interface McpToolCallResult {
  content: McpContentItem[]
  isError?: boolean
}

export interface McpRawProbeResult {
  status: number
  body: unknown
}
