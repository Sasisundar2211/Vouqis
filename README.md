# Vouqis

**Reliability Gateway for MCP Servers**

---

The tool call succeeded.

The task failed.

Your customer found out first.

---

Vouqis sits between your AI agent and MCP server, detecting silent failures before they reach production.

```bash
npm install -g @vouqis/cli
vouqis proxy --upstream http://127.0.0.1:3010
```

→ [vouqis.tech](https://vouqis.tech) · [Docs](https://vouqis.tech/docs) · [Design Partner Program](https://vouqis.tech/design-partner)

---

## The Problem

MCP servers don't fail loudly.

They return `200 OK`.

They return valid JSON.

They return `null`.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": null
}
```

The HTTP layer said success.

The JSON-RPC layer said success.

The agent acted on nothing.

The workflow broke.

The customer discovered it first.

---

## Before / After

**Without Vouqis**

```
Agent
  ↓
MCP Server
  ↓
Null Response  ← looks like success
  ↓
Agent Continues
  ↓
Customer Impact
```

**With Vouqis**

```
Agent
  ↓
Vouqis Gateway  ← validates every frame
  ↓
MCP Server
  ↓
Null Response detected
  ↓
Blocked + Classified
  ↓
Agent never sees it
```

---

## Why Vouqis Exists

As AI agents move into production, they depend on MCP servers for tools, APIs, databases, and external actions.

Most failures never surface as errors.

A response returns successfully.

The result is invalid.

The workflow breaks.

The agent continues.

The customer discovers the problem first.

**Vouqis helps teams detect these failures before they become incidents.**

---

## What Vouqis Detects

| Failure Class | What Happens |
|---|---|
| `NULL_RESULT` | Tool returns `200 OK` with `result: null` |
| `SCHEMA_DRIFT` | Response shape changes without a breaking error |
| `TIMEOUT_AS_SUCCESS` | Tool completes after deadline but still returns success |
| `EMPTY_CONTENT` | Response contains an empty content array |

Every blocked response is classified with:

- **Failure type** — what class of failure was detected
- **Severity** — CRITICAL, HIGH, MEDIUM, LOW
- **Tool name** — which MCP tool triggered it
- **Timestamp** — when it happened

---

## Quick Start

### Install

```bash
npm install -g @vouqis/cli
```

### Start the gateway

```bash
vouqis proxy --upstream http://127.0.0.1:3010
```

Gateway listens on `http://127.0.0.1:4444` by default.

Point your AI agent at the gateway instead of the MCP server.

That's it.

### Options

```
--upstream <url>   URL of the MCP server to proxy  (required)
--port <number>    Gateway port                     (default: 4444)
--host <host>      Host interface                   (default: 127.0.0.1)
--timeout <ms>     Request timeout                  (default: 30000)
--log <path>       Audit log path                   (default: vouqis-audit.log)
```

---

## Architecture

```
                  Every request and response

  ┌──────────┐         ┌─────────────────┐         ┌────────────┐
  │ AI Agent │ ──────► │ Vouqis Gateway  │ ──────► │ MCP Server │
  └──────────┘         │                 │         └────────────┘
                       │  • validates    │
                       │  • classifies   │ ◄──────  response
                       │  • blocks       │
                       │  • logs         │
                       └─────────────────┘
                                │
                                ▼
                       Audit log (NDJSON)
```

Vouqis terminates the connection on both sides.

It reads every JSON-RPC frame in flight.

It validates the envelope.

It refuses to forward a response your agent shouldn't act on.

---

## Failure Classes

### NULL_RESULT

The MCP tool returned HTTP 200 with a success envelope, but the result field is null.

The agent has no usable data and no indication of failure.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": null
}
```

```
Vouqis classification:

  failure:  NULL_RESULT
  severity: HIGH
  tool:     query_orders
  decision: blocked
```

---

### SCHEMA_DRIFT

The response shape changed. Required fields are missing, field types have changed, or unexpected fields indicate a server-side breaking change.

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "items": null
  }
}
```

```
Vouqis classification:

  failure:  SCHEMA_DRIFT
  severity: HIGH
  tool:     search_documents
  decision: blocked
```

---

### TIMEOUT_AS_SUCCESS

The tool completed after the configured timeout threshold but still returned HTTP 200.

The result may be stale, partial, or based on an operation that was never committed.

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "status": "ok"
  }
}
```

```
Vouqis classification:

  failure:  TIMEOUT_AS_SUCCESS
  severity: CRITICAL
  tool:     create_invoice
  latency:  30,041 ms
  decision: blocked
```

---

### EMPTY_CONTENT

The result field is present but contains an empty content array.

The agent interprets this as "no results found" when the actual cause is a tool failure.

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": []
  }
}
```

```
Vouqis classification:

  failure:  EMPTY_CONTENT
  severity: MEDIUM
  tool:     list_records
  decision: blocked
```

---

## Audit Log

Every gateway event is written to `vouqis-audit.log` as NDJSON.

```json
{"timestamp":"2026-06-01T12:04:01Z","event":"blocked","tool":"query_orders","failure":"NULL_RESULT","severity":"HIGH","latency_ms":142}
{"timestamp":"2026-06-01T12:04:04Z","event":"passed","tool":"search_documents","latency_ms":84}
{"timestamp":"2026-06-01T12:04:09Z","event":"blocked","tool":"update_record","failure":"SCHEMA_DRIFT","severity":"HIGH","latency_ms":66}
```

Grep it. Tail it. Pipe it to any log platform.

---

## Who This Is For

**Founding Engineers** running MCP-powered agents in production.

You've seen a tool call return success while the actual task failed silently.

Your user discovered the problem before you did.

You want one command that sits in the path and tells you when it's happening — before it reaches production.

---

## Why Existing Tools Aren't Enough

**Observability platforms** (Langfuse, LangSmith, Arize) show what happened after a failure. Vouqis prevents failures before they reach the agent.

**API gateways** (Kong, Envoy, NGINX) route traffic. They don't understand MCP-specific failure modes like null results on success envelopes.

**Integration platforms** (Composio, Truto) connect tools. Vouqis validates what those tools return.

---

## Design Partner Program

We're working with a small number of teams running MCP-powered systems in production.

If your agents are failing silently today, we want to debug it with you.

**What you get:**

- Direct access to the Vouqis team
- Early access to new failure classes
- Weekly check-ins during onboarding
- Your failures define the roadmap

→ [Apply at vouqis.tech/design-partner](https://vouqis.tech/design-partner)

---

## Roadmap

**Phase 1 — Reliability Gateway** _(current)_

- Request validation
- Response validation (null, empty, schema, timeout)
- Structured audit log
- Rate limiting
- Automatic retry for idempotent methods

**Phase 2 — Reliability Policies** _(planned)_

```yaml
block_null_response: true
max_latency_ms: 5000
retry_attempts: 1
```

**Phase 3 — Reliability Analytics** _(future)_

Failure trends, per-tool health, operational dashboards.

---

## Contributing

Open an issue before opening a PR.

We're in early discovery — contributions that match the current Phase 1 scope are welcome.

---

## License

MIT

Copyright (c) 2026 Vouqis
