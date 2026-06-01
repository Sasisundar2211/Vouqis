export type FailureMode =
  | 'malformed-jsonrpc'
  | 'missing-params'
  | 'timeout'
  | 'unexpected-schema'
  | 'null-response'

export type ProbingStrategy =
  | 'normal'
  | 'strip-params'
  | 'malformed-request'
  | 'slow-timeout'
  | 'schema-check'

export interface TestPrompt {
  id: string
  failureMode: FailureMode
  userMessage: string
  description: string
  probingStrategy: ProbingStrategy
  /** Exact payload sent to the server (literal JSON or template with <placeholders>) */
  requestPayload: string
  /** What a passing response looks like */
  expectedResponse: string
  /** What triggers a failure verdict */
  failureCondition: string
  /** Fraction of the pass-rate component this probe contributes (all 10 sum to 1.0) */
  weight: number
  /** Why this probe exists — the real-world failure it prevents */
  rationale: string
}

export const DEFAULT_PROMPTS: TestPrompt[] = [
  // ── Category 1: Malformed JSON-RPC (weight: 0.30 total) ──────────────────
  {
    id: 'mal-01',
    failureMode: 'malformed-jsonrpc',
    description: 'Server rejects a completely invalid JSON body with a proper error',
    probingStrategy: 'malformed-request',
    userMessage: '',
    requestPayload: 'POST /mcp  {"this":"is not valid jsonrpc","garbage":true}',
    expectedResponse: 'HTTP 4xx  OR  HTTP 2xx with top-level "error" field',
    failureCondition: 'Server returns HTTP 2xx with no "error" field — treats garbage as a valid request',
    weight: 0.15,
    rationale: 'A server that silently accepts random payloads cannot validate real requests; attackers can probe it without detection.',
  },
  {
    id: 'mal-02',
    failureMode: 'malformed-jsonrpc',
    description: 'Server rejects a JSON-RPC envelope missing id and params',
    probingStrategy: 'malformed-request',
    userMessage: '',
    requestPayload: 'POST /mcp  {"jsonrpc":"2.0","method":"tools/call"}  — id and params omitted',
    expectedResponse: 'HTTP 4xx  OR  JSON-RPC error response per spec §5',
    failureCondition: 'Server returns 2xx with no error — accepts an incomplete envelope as valid',
    weight: 0.15,
    rationale: 'JSON-RPC 2.0 §5 requires rejection of requests missing id/params; compliance here predicts overall protocol hygiene.',
  },

  // ── Category 2: Missing Parameters (weight: 0.20 total) ──────────────────
  {
    id: 'mis-01',
    failureMode: 'missing-params',
    description: 'Server handles a tool call with completely empty arguments',
    probingStrategy: 'strip-params',
    userMessage: '',
    requestPayload: 'tools/call  name=<first-tool>  arguments={}',
    expectedResponse: 'Any response (error or result) returned within 8 s — no hang',
    failureCondition: 'Request times out — server hangs indefinitely on empty input',
    weight: 0.10,
    rationale: 'Agents often call tools with partial context; a server that hangs on missing input blocks the entire agent pipeline.',
  },
  {
    id: 'mis-02',
    failureMode: 'missing-params',
    description: 'Server handles a tool call where all params are replaced with null',
    probingStrategy: 'strip-params',
    userMessage: '',
    requestPayload: 'tools/call  name=<first-tool>  arguments={<param1>:null, <param2>:null, ...}',
    expectedResponse: 'Any response returned within 8 s — no crash or hang',
    failureCondition: 'Request times out — server crashes or hangs when params are null',
    weight: 0.10,
    rationale: 'LLMs sometimes emit null for unknown fields; a server that crashes on null inputs is fragile in production.',
  },

  // ── Category 3: Timeout / Latency (weight: 0.20 total) ───────────────────
  {
    id: 'tmo-01',
    failureMode: 'timeout',
    description: 'Tool responds within 5 s on first (cold) call',
    probingStrategy: 'slow-timeout',
    userMessage: 'Use any available tool to perform a simple operation.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>  (cold call)',
    expectedResponse: 'Valid MCP response received within 5000 ms',
    failureCondition: 'No response within 5000 ms',
    weight: 0.10,
    rationale: 'Cold-start latency directly impacts agent UX; a >5 s first response breaks most LLM orchestration timeouts.',
  },
  {
    id: 'tmo-02',
    failureMode: 'timeout',
    description: 'Tool responds within 5 s on a repeat call',
    probingStrategy: 'slow-timeout',
    userMessage: 'Call any available tool one more time and show its result.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>  (warm call)',
    expectedResponse: 'Valid MCP response received within 5000 ms',
    failureCondition: 'No response within 5000 ms',
    weight: 0.10,
    rationale: 'Warm-path regressions (connection leaks, resource exhaustion) appear only on repeat calls, not cold starts.',
  },

  // ── Category 4: Schema Compliance (weight: 0.20 total) ───────────────────
  {
    id: 'sch-01',
    failureMode: 'unexpected-schema',
    description: 'Tool response conforms to MCP content-array schema',
    probingStrategy: 'schema-check',
    userMessage: 'Use any available tool and show its raw output.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>',
    expectedResponse: '{"content":[{"type":"text","text":"..."}],"isError":false}  — content is a non-null array',
    failureCondition: 'Response content field is missing, null, or not an array',
    weight: 0.10,
    rationale: 'MCP spec requires content to be an array; agents that expect an array will throw or produce garbage on non-array responses.',
  },
  {
    id: 'sch-02',
    failureMode: 'unexpected-schema',
    description: 'Each content item in the response has a valid type field',
    probingStrategy: 'schema-check',
    userMessage: 'Call a tool and return its result verbatim.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>',
    expectedResponse: 'Every item in content array has typeof item.type === "string"',
    failureCondition: 'Any content item is missing a type field, or type is not a string',
    weight: 0.10,
    rationale: 'Agents dispatch on item.type to render content; a missing type causes silent failures or crashes in downstream handlers.',
  },

  // ── Category 5: Null / Empty Response (weight: 0.10 total) ───────────────
  {
    id: 'nul-01',
    failureMode: 'null-response',
    description: 'Tool returns a non-empty content array',
    probingStrategy: 'normal',
    userMessage: 'Use any available tool and tell me what it returned.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>',
    expectedResponse: 'content array with length > 0',
    failureCondition: 'content array is empty ([])',
    weight: 0.05,
    rationale: 'An empty response gives the agent nothing to work with; the LLM will hallucinate a result or retry endlessly.',
  },
  {
    id: 'nul-02',
    failureMode: 'null-response',
    description: 'Tool response contains at least one non-blank text item',
    probingStrategy: 'normal',
    userMessage: 'Call any tool and verify the response has real content.',
    requestPayload: 'tools/call  name=<first-tool>  arguments=<minimal-valid-input>',
    expectedResponse: 'At least one content item of type "text" with text.trim().length > 0',
    failureCondition: 'All text content items are empty string or whitespace-only',
    weight: 0.05,
    rationale: 'Whitespace-only responses are semantically empty; agents treat them as successful but produce garbage downstream.',
  },
]

// Sanity check: weights must sum to 1.0
const _totalWeight = DEFAULT_PROMPTS.reduce((sum, p) => sum + p.weight, 0)
if (Math.abs(_totalWeight - 1.0) > 0.001) {
  throw new Error(`Probe weights must sum to 1.0 — got ${_totalWeight}`)
}
