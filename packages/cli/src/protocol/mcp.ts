// Model Context Protocol specification — constants and types.
// Nothing in this file is Vouqis-specific. It describes the protocol.

export const MCP_METHODS = {
  TOOLS_LIST:  'tools/list',
  TOOLS_CALL:  'tools/call',
  INITIALIZE:  'initialize',
  PING:        'ping',
} as const

// Methods that are safe to retry on timeout — idempotent per MCP spec.
export const IDEMPOTENT_METHODS = new Set<string>([
  MCP_METHODS.TOOLS_LIST,
  MCP_METHODS.TOOLS_CALL,
  MCP_METHODS.INITIALIZE,
  MCP_METHODS.PING,
])
