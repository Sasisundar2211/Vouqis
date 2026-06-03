<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/vouqis-logo.png" alt="Vouqis" width="560">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vouqis/cli"><img src="https://img.shields.io/npm/v/%40vouqis%2Fcli?style=flat-square&color=4ade80" alt="npm"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-6b7280?style=flat-square" alt="MIT">
  &nbsp;
  <img src="https://img.shields.io/badge/node-%3E%3D20-6b7280?style=flat-square" alt="Node 20+">
</p>

<p align="center"><strong>AI Agent Reliability Gateway — intercept, validate, and enforce every MCP call at runtime</strong></p>
# Vouqis

AI Agent Reliability Gateway

Prevent MCP failures before they reach production.

```text
Agent
  ↓
Vouqis
  ↓
MCP Server
```

Vouqis sits between AI agents and MCP servers.

Every request and response is validated before reaching production.

Detect:

* Null responses
* Empty results
* Schema mismatches
* Timeouts
* Silent failures

before users see them.

---

## Why Vouqis Exists

Most MCP failures don't look like failures.

An MCP server can return:

```json
{
  "result": null
}
```

while still reporting success.

The agent thinks the task completed.

The user receives a broken outcome.

Developers discover the problem hours later while debugging logs.

Vouqis prevents these failures before they reach production.

---

## How It Works

Without Vouqis:

```text
Agent
  ↓
MCP Server
  ↓
Silent Failure
```

With Vouqis:

```text
Agent
  ↓
Vouqis Gateway
  ↓
MCP Server
```

Every interaction passes through Vouqis.

Vouqis validates requests, validates responses, detects failures, and enforces reliability policies in real time.

---

## Features

### Request Validation

Detect malformed MCP requests before they reach the server.

### Response Validation

Detect:

* Null responses
* Empty arrays
* Empty objects
* Missing content
* Invalid schemas

### Timeout Detection

Identify slow or hanging MCP servers.

### Automatic Retry

Recover from transient failures automatically.

### Structured Logs

Generate machine-readable reliability events.

Example:

```json
{
  "timestamp": "2026-06-01T12:00:00Z",
  "tool": "github.search",
  "latency_ms": 6210,
  "decision": "blocked",
  "reason": "timeout"
}
```

---

## Quick Start

### Install

```bash
npm install -g @vouqis/cli
```

### Start Gateway

```bash
vouqis proxy --upstream https://your-mcp-server.com
```

Point your agent to:

```text
http://localhost:4444
```

That's it.

---

## Example

### Without Vouqis

```text
Agent
  ↓
GitHub MCP
  ↓
Returns null
  ↓
Agent believes task succeeded
```

### With Vouqis

```text
Agent
  ↓
Vouqis
  ↓
GitHub MCP
```

Vouqis detects:

```text
null response
```

Blocks the response.

Logs the failure.

Returns a structured error.

---

## MCP Audit

Before routing production traffic, audit an MCP server.

```bash
vouqis audit https://your-mcp-server.com
```

Run reliability probes against a server.

Detect:

* Timeout issues
* Null responses
* Schema problems
* Error handling failures

Example:

```bash
vouqis audit https://github-mcp.example.com
```

Output:

```text
Audit Report
──────────────────────────────

Server:
github-mcp.example.com

Checks:
✓ Request Validation
✓ Error Handling
✓ Timeout Handling
✗ Null Response Protection

Summary:
1 critical issue detected

Recommendation:
Review before production use.
```

The audit tool helps identify issues before deployment.

The gateway protects traffic during execution.

---

## Architecture

```text
                    Request
                       ↓

┌───────────┐    ┌───────────┐    ┌───────────┐
│ AI Agent  │ → │  Vouqis   │ → │ MCP Server │
└───────────┘    └───────────┘    └───────────┘
                       ↓
                Validation
                Retry Logic
                Reliability Rules
                Structured Logs
```

---

## Current MVP

Vouqis currently focuses on five core capabilities:

1. Request Validation
2. Response Validation
3. Timeout Detection
4. Retry Logic
5. Structured Logs

Everything else is secondary.

---

## Why Existing Tools Aren't Enough

### Observability Platforms

Examples:

* Langfuse
* LangSmith
* Braintrust
* Arize

These show what happened after a failure.

Vouqis prevents failures before they reach users.

### Integration Platforms

Examples:

* Composio
* Truto
* Klavis

These connect tools.

Vouqis validates reliability.

### API Gateways

Examples:

* Kong
* Envoy
* NGINX

These route traffic.

Vouqis understands MCP-specific failures.

---

## Roadmap

### Phase 1

Reliability Gateway

* Request validation
* Response validation
* Retry
* Timeout detection

### Phase 2

Reliability Policies

Examples:

```yaml
block_null_response: true

max_latency_ms: 5000

retry_attempts: 1
```

### Phase 3

Reliability Analytics

Reliability trends, failure categories, and operational insights.

### Phase 4

Trust Layer For AI Agents

A reliability network powered by real-world MCP interactions.

---

## Mission

Cloudflare protects websites.

Snyk protects software.

Vouqis protects AI agents.

Our goal is to become the reliability layer between agents and the tools they depend on.

---

## License

MIT License

Copyright (c) Vouqis


MIT © [Vouqis](https://github.com/Sasisundar2211)
