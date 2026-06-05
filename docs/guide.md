# Vouqis — How to Use It

This guide explains what Vouqis does, why you need it, and exactly how to set it up.  
No marketing speak. Just the steps.

---

## The Problem Vouqis Solves

When your AI agent calls an MCP server, it gets a response. The agent assumes that response is correct.

Most of the time, the response is not correct. The MCP server returns:

- A `null` result — no data, no error
- An empty array — looks fine, contains nothing
- A timeout — the request hangs until the agent gives up
- Malformed JSON — partially written response

The agent sees `HTTP 200` and continues as if everything worked.

That's a **silent failure**. The agent keeps going. The user gets a wrong answer. Nobody knows why.

Vouqis sits between your agent and the MCP server. It inspects every response. When a failure happens, Vouqis catches it, blocks it, and logs what went wrong — before it reaches your agent.

---

## How It Works

```
Without Vouqis:
  Agent → MCP Server → null → Agent says "done" → silent failure

With Vouqis:
  Agent → Vouqis → MCP Server → null → Vouqis blocks → Agent gets an error it can handle
```

Vouqis is a **local proxy**. It runs on your machine. You point your agent at it instead of the MCP server directly. That's it.

---

## Installation

```bash
npm install -g @vouqis/cli
```

Check it installed correctly:

```bash
vouqis --version
```

---

## Quick Start — Two Minutes to Running

**Step 1** — Start the proxy, pointed at your MCP server:

```bash
vouqis proxy --upstream https://your-mcp-server.com
```

**Step 2** — Point your agent at Vouqis instead of the MCP server:

```
Before: Agent → https://your-mcp-server.com
After:  Agent → http://127.0.0.1:4444
```

**Step 3** — Run your agent. Watch the terminal. Every request is logged live.

That's the whole setup.

---

## Real Examples by MCP Server

### GitHub MCP

```bash
vouqis proxy --upstream https://api.githubcopilot.com/mcp
```

Your agent config: point MCP server URL to `http://127.0.0.1:4444`

### Exa Search

```bash
vouqis proxy --upstream https://mcp.exa.ai/mcp
```

### Any local MCP server

```bash
vouqis proxy --upstream http://localhost:3000
```

---

## What Vouqis Checks

Vouqis runs two sets of checks: one on the **request going out**, one on the **response coming back**.

### Request Checks (before forwarding to your MCP server)

| What | Why |
|---|---|
| Is it valid JSON-RPC 2.0? | Malformed requests never reach the server |
| Does it have a `method` field? | Required by MCP spec |
| Is it too large? | Default cap is 512 KB |

If a request fails these checks, Vouqis blocks it immediately. The request never leaves your machine.

### Response Checks (after your MCP server replies)

| What | Why |
|---|---|
| Is the result `null`? | Silent failure — the server returned nothing |
| Is `content` empty or missing? | The tool call succeeded but produced no output |
| Is `content` malformed? | Items missing required `type` field |
| Did the server time out? | Request took longer than `--timeout` (default 5 seconds) |

---

## Decisions Vouqis Makes

For every request, Vouqis makes one of four decisions:

| Decision | What It Means |
|---|---|
| `allow` | Request and response look fine. Passed through. |
| `block` | Something is wrong. Request blocked. Agent gets an error. |
| `retry` | Timed out. Vouqis retried once automatically. |
| `rewrite` | Response had a fixable schema issue. Vouqis fixed it silently. |

---

## Live Output

When the proxy is running, you see every decision in your terminal:

```
  [14:23:11]  ALLOW    tools/call    web_search_exa          342ms
  [14:23:14]  ALLOW    tools/call    web_search_exa          289ms
  [14:23:19]  BLOCK    tools/call    web_search_exa          0ms  ← tools/call content is empty
  [14:23:31]  RETRY    tools/call    get_file_contents       5003ms ← timeout on attempt 1
  [14:23:36]  ALLOW    tools/call    get_file_contents       411ms
```

Each line shows:
- **Time** — when it happened
- **Decision** — what Vouqis did
- **Method** — the MCP method called
- **Tool** — the tool name (for `tools/call` requests)
- **Latency** — how long it took
- **Reason** — why it was blocked or retried (only shown when relevant)

---

## Audit Log

Every decision is also saved to a file: `./vouqis-audit.log`

Each line is a JSON object:

```json
{"timestamp":"2026-06-03T14:23:19.000Z","upstream":"https://mcp.exa.ai/mcp","server_id":"mcp.exa.ai","method":"tools/call","tool":"web_search_exa","requestId":5,"decision":"block","latency_ms":0,"reason":"tools/call content is empty or not an array","attempt":1}
```

Fields:

| Field | Description |
|---|---|
| `timestamp` | When the request happened (ISO 8601) |
| `upstream` | Full upstream URL (including any path) |
| `server_id` | Hostname only — used for cross-deployment aggregation |
| `method` | The JSON-RPC method (e.g. `tools/call`, `tools/list`) |
| `tool` | The tool name — only present for `tools/call` |
| `requestId` | The JSON-RPC request ID |
| `decision` | `allow`, `block`, `retry`, or `rewrite` |
| `latency_ms` | How long the round trip took |
| `reason` | Why it was blocked or rewritten (only present when relevant) |
| `attempt` | Which attempt number (1 normally, 2 after a retry) |

### View the log

```bash
vouqis logs
```

This prints a summary:

```
VOUQIS ── audit log summary
──────────────────────────────────────────────────

  Total events   47
  Allowed        41
  Blocked        4
  Retried        2
  Rewritten      0
  Latency P50    312ms
  Latency P95    1847ms

  Top methods:
    tools/call               39
    tools/list               5
    initialize               3

  Top block reasons:
    ✗ tools/call content is empty or not an array (3)
    ✗ upstream timed out after 5000ms (1)

  Last 20 events:
  ✓ allow   14:23:11  web_search_exa           342ms
  ✗ block   14:23:19  web_search_exa           0ms — tools/call content is empty or not an array
  ...
```

Options:

```bash
vouqis logs --tail 50          # show last 50 events instead of 20
vouqis logs --summary          # stats only, no event rows
vouqis logs --file ./my.log    # read a different log file
```

---

## Flags Reference

```bash
vouqis proxy --upstream <url>        # required: the MCP server URL
            --listen 127.0.0.1:4444  # where Vouqis listens (default: 4444)
            --timeout 5000           # upstream timeout in ms (default: 5000)
            --retry 1                # retries on timeout, idempotent only (default: 1)
            --rate-limit 10          # max requests per second to upstream
            --log-file ./audit.log   # where to write the audit log
            --no-block-null          # let null results through (not recommended)
```

---

## Config File (for Production or Multiple Servers)

Instead of passing flags every time, create a `vouqis.yml` file in your project:

```yaml
listen: 127.0.0.1:4444
log_file: ./vouqis-audit.log

upstreams:
  - name: github-mcp
    url: https://api.githubcopilot.com/mcp
    timeout_ms: 5000
    retry: 1
    policies:
      block_null_result: true
      sanitize_schema: true
      max_request_size_kb: 512
```

Then just run:

```bash
vouqis proxy
```

Vouqis auto-detects `vouqis.yml` in the current directory.

---

## How to Update Your Agent

The only change you make to your agent is the MCP server URL. Everything else stays the same.

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "github": {
      "url": "http://127.0.0.1:4444"
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "url": "http://127.0.0.1:4444"
    }
  }
}
```

### Custom agent (TypeScript)

```typescript
// Before
const client = new MCPClient({ url: 'https://api.githubcopilot.com/mcp' })

// After — only this line changes
const client = new MCPClient({ url: 'http://127.0.0.1:4444' })
```

### Custom agent (Python)

```python
# Before
client = MCPClient(url="https://api.githubcopilot.com/mcp")

# After — only this line changes
client = MCPClient(url="http://127.0.0.1:4444")
```

---

## Confirming It Works

After setup, run your agent and do something that calls a tool.

You should see output like this in the Vouqis terminal:

```
  [14:23:11]  ALLOW    tools/call    search_files    342ms
```

If you see that, Vouqis is intercepting traffic correctly.

To verify blocking works, Vouqis will catch any null or empty response from the MCP server automatically. You don't need to do anything special.

---

## Running in a Team / CI Environment

Set the log file path explicitly so everyone writes to the same place:

```bash
vouqis proxy --upstream https://your-mcp-server.com --log-file ./logs/vouqis.log
```

To share logs across team members, commit `vouqis.yml` to the repo. Each developer starts the proxy with `vouqis proxy` and it picks up the shared config.

For CI, add a step that starts the proxy before running agent tests:

```bash
# In your CI script
vouqis proxy --upstream $MCP_SERVER_URL &
VOUQIS_PID=$!

# Run your tests
npm test

# Stop the proxy
kill $VOUQIS_PID
```

---

## Troubleshooting

**"No audit log found" when running `vouqis logs`**  
The proxy hasn't run yet, or was run with a different `--log-file` path. Start the proxy first.

**Agent can't connect to Vouqis**  
Make sure the proxy is running and the port matches. Default is `127.0.0.1:4444`. Check with `lsof -i :4444`.

**All requests are being blocked**  
The MCP server may require authentication headers. Vouqis forwards all headers from the agent — make sure your agent is sending the correct `Authorization` header.

**Vouqis shows `RETRY` for every request**  
Your upstream `--timeout` is too low. Increase it: `--timeout 10000` (10 seconds).

**Proxy exits immediately**  
The upstream URL is unreachable. Verify you can reach it: `curl -I https://your-mcp-server.com`

**I want to see null results, not block them**  
Pass `--no-block-null`. Vouqis will still log them but let them through.

---

## What to Look for in Your Logs

After running for a day, open `vouqis logs --summary`.

Things worth investigating:

- **Block rate above 5%** — your MCP server is returning failures regularly
- **P95 latency above 2000ms** — the server is slow; consider raising `--timeout` or escalating with the server provider
- **Recurring block reason** — the same tool failing repeatedly means something is broken on the server side
- **Retry rate above 10%** — the server is timing out frequently; investigate network or server load

These are the real signals. Use them to decide whether an MCP server is reliable enough to trust in production.
