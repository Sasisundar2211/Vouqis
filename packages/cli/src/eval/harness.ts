import type {McpClient} from '../mcp/client.js'
import type {McpTool, McpToolCallResult} from '../mcp/types.js'
import type {TestPrompt} from './prompts.js'
import type {EvalResult} from './scoring.js'

export interface HarnessOptions {
  mcpClient: McpClient
  tools: McpTool[]
  prompts: TestPrompt[]
  onProgress?: (result: EvalResult) => void
}

interface ProbeOutcome {
  passed: boolean
  errorText?: string
  toolCalled?: string
}

const PROBE_TIMEOUT_MS = 8000
const TIMEOUT_PROBE_DEADLINE_MS = 5000

// ── Entry point ──────────────────────────────────────────────────────────────

export async function runEval(options: HarnessOptions): Promise<EvalResult[]> {
  const results: EvalResult[] = []

  for (const prompt of options.prompts) {
    const start = Date.now()
    let outcome: ProbeOutcome

    try {
      outcome = await runProbe(prompt, options)
    } catch (err: unknown) {
      outcome = {
        passed: false,
        errorText: err instanceof Error ? err.message : String(err),
      }
    }

    const result: EvalResult = {
      promptId: prompt.id,
      failureMode: prompt.failureMode,
      passed: outcome.passed,
      durationMs: Date.now() - start,
      errorText: outcome.errorText,
      toolCalled: outcome.toolCalled,
    }
    results.push(result)
    options.onProgress?.(result)
  }

  return results
}

// ── Probe router ─────────────────────────────────────────────────────────────

async function runProbe(
  prompt: TestPrompt,
  options: HarnessOptions,
): Promise<ProbeOutcome> {
  if (options.tools.length === 0 && prompt.probingStrategy !== 'malformed-request') {
    return {passed: false, errorText: 'No tools available on server'}
  }

  switch (prompt.probingStrategy) {
    case 'malformed-request':
      return runMalformedRpcProbe(prompt, options.mcpClient)
    case 'strip-params':
      return runStripParamsProbe(prompt, options.tools, options.mcpClient)
    case 'slow-timeout':
      return runTimeoutProbe(options.tools, options.mcpClient)
    case 'schema-check':
      return runSchemaValidationProbe(options.tools, options.mcpClient)
    case 'normal':
      return runNullCheckProbe(options.tools, options.mcpClient)
  }
}

// ── Probe implementations ────────────────────────────────────────────────────

async function runMalformedRpcProbe(
  prompt: TestPrompt,
  client: McpClient,
): Promise<ProbeOutcome> {
  const malformedBodies: Record<string, unknown> = {
    'mjr-01': {this: 'is not valid jsonrpc', garbage: true},
    'mjr-02': {jsonrpc: '2.0', method: 'tools/call'}, // missing id and params
  }

  const body = malformedBodies[prompt.id] ?? {bad: 'request'}
  const {status, body: responseBody} = await client.probeRaw(body)

  const hasErrorField =
    typeof responseBody === 'object' &&
    responseBody !== null &&
    'error' in responseBody

  if (status >= 400 || hasErrorField) {
    return {passed: true, errorText: JSON.stringify(responseBody).slice(0, 300)}
  }

  return {
    passed: false,
    errorText: `Server accepted malformed request (HTTP ${status}): ${JSON.stringify(responseBody).slice(0, 200)}`,
  }
}

async function runStripParamsProbe(
  prompt: TestPrompt,
  tools: McpTool[],
  client: McpClient,
): Promise<ProbeOutcome> {
  if (tools.length === 0) {
    return {passed: false, errorText: 'No tools available on server'}
  }

  const tool = tools[0]
  // mrp-01 → fully empty params; mrp-02 → all params set to null
  const badInput: Record<string, unknown> =
    prompt.id === 'mrp-01' ? {} : buildNullInput(tool)

  try {
    await withTimeout(
      client.callTool(tool.name, badInput),
      PROBE_TIMEOUT_MS,
      `strip-params/${prompt.id}`,
    )
    return {passed: true, toolCalled: tool.name}
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timed out')) {
      return {passed: false, errorText: msg, toolCalled: tool.name}
    }
    // Any non-timeout error (validation, rejection) counts as a handled response
    return {passed: true, errorText: msg.slice(0, 300), toolCalled: tool.name}
  }
}

// Cycles every tool; fails on the first one that exceeds the 5 s deadline.
async function runTimeoutProbe(
  tools: McpTool[],
  client: McpClient,
): Promise<ProbeOutcome> {
  for (const tool of tools) {
    const input = buildMinimalInput(tool)
    try {
      await withTimeout(
        client.callTool(tool.name, input),
        TIMEOUT_PROBE_DEADLINE_MS,
        `slow-timeout/${tool.name}`,
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('timed out')) {
        return {passed: false, errorText: `${tool.name}: ${msg}`, toolCalled: tool.name}
      }
      // Non-timeout error (bad params, etc.) — tool is responsive, continue
    }
  }
  return {passed: true, toolCalled: tools[0]?.name}
}

// Cycles every tool; fails on the first response that lacks a valid content[].
async function runSchemaValidationProbe(
  tools: McpTool[],
  client: McpClient,
): Promise<ProbeOutcome> {
  for (const tool of tools) {
    const input = buildMinimalInput(tool)
    let result: McpToolCallResult
    try {
      result = await withTimeout(
        client.callTool(tool.name, input),
        PROBE_TIMEOUT_MS,
        `schema-check/${tool.name}`,
      )
    } catch {
      continue // timeout or call error — not a schema issue, skip
    }

    const valid =
      result &&
      Array.isArray(result.content) &&
      result.content.every(
        (item) => typeof item === 'object' && item !== null && typeof item.type === 'string',
      )

    if (!valid) {
      return {
        passed: false,
        errorText: `${tool.name}: response missing required MCP content schema — got ${JSON.stringify(result).slice(0, 200)}`,
        toolCalled: tool.name,
      }
    }
  }
  return {passed: true, toolCalled: tools[0]?.name}
}

// Cycles every tool; fails on the first response that is null or empty.
async function runNullCheckProbe(
  tools: McpTool[],
  client: McpClient,
): Promise<ProbeOutcome> {
  for (const tool of tools) {
    const input = buildMinimalInput(tool)
    let result: McpToolCallResult
    try {
      result = await withTimeout(
        client.callTool(tool.name, input),
        PROBE_TIMEOUT_MS,
        `null-check/${tool.name}`,
      )
    } catch {
      continue // timeout or call error — not a null-content issue, skip
    }

    const hasContent =
      Array.isArray(result.content) &&
      result.content.length > 0 &&
      result.content.some((item) => {
        if (item.type === 'text') return typeof item.text === 'string' && item.text.trim().length > 0
        return true
      })

    if (!hasContent) {
      return {
        passed: false,
        errorText: `${tool.name}: returned null or empty content — ${JSON.stringify(result).slice(0, 200)}`,
        toolCalled: tool.name,
      }
    }
  }
  return {passed: true, toolCalled: tools[0]?.name}
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildNullInput(tool: McpTool): Record<string, unknown> {
  const schema = tool.inputSchema as {properties?: Record<string, unknown>}
  if (!schema.properties) return {}
  return Object.fromEntries(Object.keys(schema.properties).map((k) => [k, null]))
}

// Builds a minimal valid-ish input: strings → "test", numbers → 1, booleans → true
function buildMinimalInput(tool: McpTool): Record<string, unknown> {
  const schema = tool.inputSchema as {
    properties?: Record<string, {type?: string}>
    required?: string[]
  }
  if (!schema.properties) return {}
  return Object.fromEntries(
    Object.entries(schema.properties).map(([k, v]) => {
      const t = v?.type
      if (t === 'number' || t === 'integer') return [k, 1]
      if (t === 'boolean') return [k, true]
      return [k, 'test']
    }),
  )
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Probe timed out after ${ms}ms [${label}]`)), ms),
  )
  return Promise.race([promise, timeout])
}
