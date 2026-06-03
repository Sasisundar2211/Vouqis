# Vouqis

<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/vouqis-logo.png" alt="Vouqis" width="560">
</p>

<p align="center">
  <strong>AI Agent Reliability Gateway</strong>
</p>

<p align="center"><strong>Sits between your agent and every MCP server — blocks silent failures before they reach production</strong></p>

<p align="center">
  <a href="https://vouqis-page.vercel.app/">Website</a> ·
  <a href="https://www.vouqis.tech/proxy">Live Gateway</a> ·
  <a href="mailto:sasisundhar2211@gmail.com?subject=Founding%20Customer%20Application">Founding Customer (3 months free)</a> ·
  <a href="https://github.com/Sasisundar2211/Vouqis/issues">Issues</a>
</p>

---

## The Problem

HTTP 200 is not success for MCP. Your AI agent calls a tool, gets a 200, logs "success" — and your user sees nothing happen.

```
Without Vouqis:
  Agent → MCP Server → result: null → Agent says "done" → silent failure

With Vouqis:
  Agent → Vouqis → MCP Server → result: null → Vouqis blocks → Agent gets an error it can handle
```

These are real documented incidents where servers returned 200 while broken:

* HTTP 200 with empty content
* Null responses
* Invalid schemas
* Partial results
* Hung requests that never resolve

Standard monitoring stays green. Your agent believes the task succeeded. Your user receives a broken outcome.

---

## The Gateway

`vouqis proxy` is the core product. It sits between your agent and every MCP server. Point your agent at `localhost:4444` instead of the upstream. Every call is validated, timed, and logged.

---

## Quick Start

Install:

```bash
npm install -g @vouqis/cli
```

Start the gateway:

```bash
vouqis proxy --upstream https://your-mcp-server.com
```

```
VOUQIS ── proxy ── https://your-mcp-server.com

  Listening on   http://127.0.0.1:4444
  Upstream       https://your-mcp-server.com
  Timeout        5000ms
  Retry          1 (idempotent requests)
  Block null     yes
  Audit log      ./vouqis-audit.log

  Point your agent at http://127.0.0.1:4444 instead of the real server.

  [14:23:11]  ALLOW    tools/call    list_repos          142ms
  [14:23:19]  ALLOW    tools/call    search_code         388ms
  [14:23:31]  RETRY    tools/call    get_file            5003ms  ← timeout on attempt 1
  [14:23:36]  ALLOW    tools/call    get_file            411ms
  [14:23:44]  BLOCK    tools/call    search              0ms     ← tools/call content is empty
```

The only change to your agent is the URL:

```typescript
// Before
const client = new MCPClient({ url: 'https://your-mcp-server.com' })

// After — one line changes
const client = new MCPClient({ url: 'http://127.0.0.1:4444' })
```

---

## What The Gateway Does

### Request Validation

Every request is validated before reaching the upstream:

| Check | What it catches |
|:---|:---|
| Valid JSON-RPC 2.0 | Malformed requests rejected before they reach the upstream |
| `method` field present | Required by MCP spec |
| Request size ≤ 512 KB | Oversized payloads rejected before forwarding |

### Response Validation

Every response is validated before reaching your agent:

| Check | What it catches |
|:---|:---|
| `result` is not null | Silent null returns |
| `content[]` is non-empty | Tool calls that succeeded but produced nothing |
| `content[]` items have `type` field | Schema drift — items normalized automatically |
| Response within `--timeout` ms | Hung requests — retried once automatically |

### Decision on every call

| Decision | What it means |
|:---|:---|
| `allow` | Request and response valid. Passed through. |
| `block` | Something is wrong. Agent gets a structured error. |
| `retry` | Timed out. Retried once. Logged. |
| `rewrite` | Schema drift fixed silently. |

### Config file

For production or teams, create `vouqis.yml` in your project root:

```yaml
listen: 127.0.0.1:4444
log_file: ./vouqis-audit.log

upstreams:
  - name: github-mcp
    url: https://your-mcp-server.com
    timeout_ms: 5000
    retry: 1
    policies:
      block_null_result: true
      sanitize_schema: true
      max_request_size_kb: 512
```

```bash
vouqis proxy   # auto-detects vouqis.yml
```

---

## Structured Logs

Every decision is written to `./vouqis-audit.log` in JSONL:

```json
{"timestamp":"2026-06-03T14:23:44.000Z","upstream":"https://your-mcp-server.com","method":"tools/call","tool":"search","requestId":7,"decision":"block","latency_ms":0,"reason":"tools/call content is empty or not an array","attempt":1}
```

View with:

```bash
vouqis logs
```

```
VOUQIS ── audit log summary

  Total events   47
  Allowed        41
  Blocked        4
  Retried        2
  Latency P50    312ms
  Latency P95    1847ms

  Top block reasons:
    ✗ tools/call content is empty or not an array (3)
    ✗ upstream timed out after 5000ms (1)
```

Options: `--tail 50`, `--summary` (stats only), `--file ./path/to/log`

---

## Run A Reliability Audit

Before deploying the gateway — run a one-off audit to test whether a server is safe to integrate. 10 protocol-level probes, 30 seconds, no LLM calls.

```bash
vouqis audit https://your-mcp-server.com
```

```
  Vouqis — MCP Reliability Audit
  Running 10 probes against your-mcp-server.com...

  mal-01  ✓  malformed jsonrpc rejected           12ms
  mis-01  ✓  missing params → error returned      340ms
  tmo-01  ✓  cold-start response within 5s        487ms
  sch-01  ✓  response conforms to content[] spec  691ms
  nul-01  ✓  non-empty response returned          441ms
  ...

  Trust Score    90 / 100  ✅ APPROVED
  Pass Rate      9 / 10
```

The audit answers: *should I integrate this server?*

The gateway answers: *is it behaving correctly right now, on this specific call?*

Use both.

---

## Architecture

```text
                    Request
                       ↓

┌────────────┐
│ AI Agent   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│   Vouqis   │
│  Gateway   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ MCP Server │
└────────────┘

Inside Vouqis:

Request → Validation → Forward → Response Validation → Retry Logic → Structured Logs → Return Result
```

---

## Current MVP

Vouqis v0.3 focuses on five core capabilities:

* Request Validation
* Response Validation
* Timeout Detection
* Retry Logic
* Structured Logs

Everything else is secondary.

---

## Why Existing Tools Aren't Enough

**Observability platforms** (Langfuse, LangSmith, Braintrust, Arize) show what happened after a failure. Vouqis prevents failures before users see them.

**Integration platforms** (Composio, Truto, Klavis) connect tools. Vouqis validates reliability.

**API gateways** (Kong, Envoy, NGINX) route traffic. Vouqis understands MCP-specific failures.

---

## Privacy

Vouqis is local-first.

| What | When | Where |
|:---|:---|:---|
| JSON-RPC requests | Every run | Your MCP server only |
| Audit results | Only with `--report` or `--api-key` | `vouqis.tech/api` |

No telemetry. No account required. Nothing leaves your machine unless you explicitly opt in.

---

## Roadmap

**Phase 1 — Reliability Gateway** (now)
Request validation, response validation, timeout detection, retry logic

**Phase 2 — Reliability Policies**
Config-driven rules: `blockNullResponse`, `maxLatencyMs`, `retryAttempts`

**Phase 3 — Reliability Analytics**
Operational visibility for MCP reliability across your fleet

**Phase 4 — Trust Layer**
A reliability network powered by real-world MCP interactions

---

## Mission

Cloudflare protects websites. Snyk protects software. Vouqis protects AI agents.

Our goal is to become the reliability layer between AI agents and the tools they depend on.

---

## Contributing

```bash
git clone https://github.com/Sasisundar2211/Vouqis.git
cd Vouqis
npm install
npm test
```

Contributions are welcome. Open an issue or submit a pull request.

---

## License

MIT License

Copyright (c) Vouqis
