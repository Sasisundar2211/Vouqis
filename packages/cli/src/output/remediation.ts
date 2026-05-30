export interface Remediation {
  probe: string
  category: string
  issue: string
  fix: string
  severity: 'critical' | 'high' | 'medium'
  docsUrl: string
}

const REMEDIATION_MAP: Record<string, Remediation> = {
  'mjr-01': {
    probe: 'mjr-01',
    category: 'Malformed JSON-RPC',
    issue: 'Server does not reject requests with invalid id field types',
    fix: 'Validate jsonrpc request id is string|number|null before processing. Return error code -32600 for invalid ids.',
    severity: 'critical',
    docsUrl: 'https://www.jsonrpc.org/specification#request_object',
  },
  'mjr-02': {
    probe: 'mjr-02',
    category: 'Malformed JSON-RPC',
    issue: 'Server accepts non-string method names without error',
    fix: 'Add method name type check at request entry point. Return error code -32601 if method is not a string.',
    severity: 'critical',
    docsUrl: 'https://www.jsonrpc.org/specification#request_object',
  },
  'mrp-01': {
    probe: 'mrp-01',
    category: 'Missing Parameters',
    issue: 'Server crashes or returns unstructured error on missing required params',
    fix: 'Add parameter presence validation before handler dispatch. Return structured JSON-RPC error code -32602 with field name.',
    severity: 'high',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/server/tools/',
  },
  'mrp-02': {
    probe: 'mrp-02',
    category: 'Missing Parameters',
    issue: 'Error response is not a valid JSON-RPC error object',
    fix: "Ensure all error paths return {jsonrpc:'2.0', id, error:{code, message}}. Never throw unhandled exceptions.",
    severity: 'high',
    docsUrl: 'https://www.jsonrpc.org/specification#error_object',
  },
  'tmo-01': {
    probe: 'tmo-01',
    category: 'Timeout / Latency',
    issue: 'Cold-start response exceeds 5 second threshold',
    fix: 'Add connection pooling or pre-warm the server process. Cold-start >5s will cause agent timeouts in production.',
    severity: 'high',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/basic/transports/',
  },
  'tmo-02': {
    probe: 'tmo-02',
    category: 'Timeout / Latency',
    issue: 'Repeat-call response exceeds 5 second threshold',
    fix: 'Profile and optimise hot path. Cache tool metadata. Ensure no per-request auth roundtrips.',
    severity: 'medium',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/basic/transports/',
  },
  'urs-01': {
    probe: 'urs-01',
    category: 'Schema Compliance',
    issue: 'tools/list response does not return valid JSON Schema for tool input',
    fix: "Ensure each tool definition includes inputSchema with type:'object' and properties. Validate against JSON Schema draft-07.",
    severity: 'critical',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/server/tools/#listing-tools',
  },
  'urs-02': {
    probe: 'urs-02',
    category: 'Schema Compliance',
    issue: 'Tool output does not match declared input schema',
    fix: 'Validate actual tool call responses against the inputSchema declared in tools/list. Add a schema conformance test to your CI.',
    severity: 'high',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/server/tools/#calling-tools',
  },
  'nul-01': {
    probe: 'nul-01',
    category: 'Null Arguments',
    issue: 'Server crashes or hangs on null parameter input',
    fix: 'Add null guard at parameter validation layer. Treat null as missing for required params, return -32602.',
    severity: 'critical',
    docsUrl: 'https://spec.modelcontextprotocol.io/specification/server/tools/#calling-tools',
  },
  'nul-02': {
    probe: 'nul-02',
    category: 'Null Arguments',
    issue: 'Error response on null input is not a valid JSON-RPC error',
    fix: "Ensure null-input code path returns {jsonrpc:'2.0', id, error:{code:-32602, message:'...'}}. Add integration test for null inputs.",
    severity: 'high',
    docsUrl: 'https://www.jsonrpc.org/specification#error_object',
  },
}

export function getRemediation(promptId: string): Remediation | null {
  return REMEDIATION_MAP[promptId] ?? null
}
