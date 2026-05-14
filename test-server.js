/**
 * Local test MCP server for vouqis scoring.
 * Stateful Streamable HTTP (2025-03-26) with session map.
 *
 * Tools (5 total):
 *   echo          — works cleanly
 *   divide        — works cleanly
 *   slow_add      — 6 s delay → triggers timeout probe (5 s deadline)
 *   broken_schema — returns {result, value} not {content[]} → schema probe fails
 *   empty_result  — returns content:[] → null-check probe fails
 */
import {randomUUID} from 'node:crypto'
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {createMcpExpressApp} from '@modelcontextprotocol/sdk/server/express.js'
import {isInitializeRequest} from '@modelcontextprotocol/sdk/types.js'
import * as z from 'zod'

const PORT = 3001

// Session store: sessionId → transport
const transports = {}

function buildServer() {
  const server = new McpServer({name: 'vouqis-test-server', version: '0.0.1'})

  server.registerTool(
    'echo',
    {description: 'Echoes the input message back.', inputSchema: {message: z.string()}},
    async ({message}) => ({content: [{type: 'text', text: `Echo: ${message}`}]}),
  )

  server.registerTool(
    'divide',
    {
      description: 'Divides numerator by denominator.',
      inputSchema: {numerator: z.number(), denominator: z.number()},
    },
    async ({numerator, denominator}) => ({
      content: [{type: 'text', text: String(numerator / denominator)}],
    }),
  )

  server.registerTool(
    'slow_add',
    {
      description: 'Adds two numbers — takes 6 seconds (intentional delay for timeout testing).',
      inputSchema: {a: z.number(), b: z.number()},
    },
    async ({a, b}) => {
      await new Promise((r) => setTimeout(r, 6000))
      return {content: [{type: 'text', text: String(a + b)}]}
    },
  )

  server.registerTool(
    'broken_schema',
    {
      description: 'Returns a result missing the MCP content array (intentional schema break).',
      inputSchema: {input: z.string().optional()},
    },
    async () => {
      // Returns raw object — not a valid MCP CallToolResult shape
      return {result: 'ok', value: 42}
    },
  )

  server.registerTool(
    'empty_result',
    {
      description: 'Always returns an empty content array.',
      inputSchema: {input: z.string().optional()},
    },
    async () => ({content: []}),
  )

  return server
}

const app = createMcpExpressApp({host: '127.0.0.1'})

// POST — handles initialize (creates session) and subsequent requests (reuses session)
app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id']

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport for this session
      await transports[sessionId].handleRequest(req, res, req.body)
      return
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      // New session — create transport + server, store in map
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport
        },
      })
      transport.onclose = () => {
        const sid = transport.sessionId
        if (sid) delete transports[sid]
      }
      const server = buildServer()
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
      return
    }

    res.status(400).json({
      jsonrpc: '2.0',
      error: {code: -32000, message: 'Bad Request: no valid session ID'},
      id: null,
    })
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {code: -32603, message: String(err)},
        id: null,
      })
    }
  }
})

// GET — SSE stream for server-to-client notifications (reuses session)
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id']
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID')
    return
  }
  await transports[sessionId].handleRequest(req, res)
})

// DELETE — session termination
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id']
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID')
    return
  }
  await transports[sessionId].handleRequest(req, res)
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`vouqis-test-server on http://127.0.0.1:${PORT}/mcp`)
  console.log('tools: echo, divide, slow_add (6s), broken_schema, empty_result')
})
