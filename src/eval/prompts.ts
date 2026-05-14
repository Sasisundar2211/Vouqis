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
}

export const DEFAULT_PROMPTS: TestPrompt[] = [
  // ── Failure mode 1: Malformed JSON-RPC ──────────────────────────────────
  {
    id: 'mjr-01',
    failureMode: 'malformed-jsonrpc',
    description: 'Server rejects a completely invalid JSON body with a proper error',
    probingStrategy: 'malformed-request',
    userMessage: '',
  },
  {
    id: 'mjr-02',
    failureMode: 'malformed-jsonrpc',
    description: 'Server rejects a JSON-RPC envelope missing id and params',
    probingStrategy: 'malformed-request',
    userMessage: '',
  },

  // ── Failure mode 2: Missing required parameters ──────────────────────────
  {
    id: 'mrp-01',
    failureMode: 'missing-params',
    description: 'Server handles a tool call with completely empty arguments',
    probingStrategy: 'strip-params',
    userMessage: '',
  },
  {
    id: 'mrp-02',
    failureMode: 'missing-params',
    description: 'Server handles a tool call where all params are replaced with null',
    probingStrategy: 'strip-params',
    userMessage: '',
  },

  // ── Failure mode 3: Timeout ──────────────────────────────────────────────
  {
    id: 'tmo-01',
    failureMode: 'timeout',
    description: 'Tool responds within 5 s on first (cold) call',
    probingStrategy: 'slow-timeout',
    userMessage: 'Use any available tool to perform a simple operation.',
  },
  {
    id: 'tmo-02',
    failureMode: 'timeout',
    description: 'Tool responds within 5 s on a repeat call',
    probingStrategy: 'slow-timeout',
    userMessage: 'Call any available tool one more time and show its result.',
  },

  // ── Failure mode 4: Unexpected return schema ─────────────────────────────
  {
    id: 'urs-01',
    failureMode: 'unexpected-schema',
    description: 'Tool response conforms to MCP content-array schema',
    probingStrategy: 'schema-check',
    userMessage: 'Use any available tool and show its raw output.',
  },
  {
    id: 'urs-02',
    failureMode: 'unexpected-schema',
    description: 'Each content item in the response has a valid type field',
    probingStrategy: 'schema-check',
    userMessage: 'Call a tool and return its result verbatim.',
  },

  // ── Failure mode 5: Null or empty response ───────────────────────────────
  {
    id: 'nul-01',
    failureMode: 'null-response',
    description: 'Tool returns a non-empty content array',
    probingStrategy: 'normal',
    userMessage: 'Use any available tool and tell me what it returned.',
  },
  {
    id: 'nul-02',
    failureMode: 'null-response',
    description: 'Tool response contains at least one non-blank text item',
    probingStrategy: 'normal',
    userMessage: 'Call any tool and verify the response has real content.',
  },
]
