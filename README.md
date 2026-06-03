# Vouqis

<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/vouqis-logo.png" alt="Vouqis" width="560">
</p>

<p align="center">
  <strong>AI Agent Reliability Gateway</strong>
</p>

<p align="center">
Prevent MCP failures before they reach production.
</p>

<p align="center">
  <a href="https://github.com/Sasisundar2211/Vouqis">GitHub</a> ·
  <a href="https://www.vouqis.tech">Website</a> ·
  <a href="https://github.com/Sasisundar2211/Vouqis/issues">Issues</a>
</p>

---

## The Problem

Most MCP failures don't look like failures.

An MCP server can return:

* HTTP 200
* Empty content
* Null responses
* Invalid schemas
* Partial results

while still appearing healthy.

Your AI agent believes the task succeeded.

Your user receives a broken outcome.

Standard monitoring stays green.

Developers discover the problem hours later while debugging logs.

---

## The Solution

Vouqis sits directly between AI agents and MCP servers.

```text
Agent
  ↓
Vouqis Gateway
  ↓
MCP Server
```

Every request and response passes through Vouqis before reaching production.

Vouqis validates requests, detects silent failures, retries recoverable errors, and produces structured reliability logs.

---

## Quick Start

Install:

```bash
npm install -g @vouqis/cli
```

Start the gateway:

```bash
vouqis proxy \
  --upstream https://your-mcp-server.com
```

Point your AI agent to:

```text
http://localhost:4444
```

That's it.

---

## Example

Without Vouqis:

```text
Agent
  ↓
GitHub MCP
  ↓
Returns null
  ↓
Agent believes task succeeded
```

With Vouqis:

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

## What The Gateway Does

### Request Validation

Reject malformed JSON-RPC requests before they reach the MCP server.

### Response Validation

Detect:

* Null responses
* Empty arrays
* Empty objects
* Missing content
* Invalid response structures

### Timeout Detection

Identify slow or hanging MCP servers.

### Automatic Retry

Recover from transient failures automatically.

### Structured Logs

Every decision is recorded.

Example:

```json
{
  "tool": "github.search",
  "latency_ms": 6210,
  "decision": "blocked",
  "reason": "timeout"
}
```

---

## Run A Reliability Audit

Before integrating a new MCP server, run a diagnostic audit.

```bash
vouqis audit https://your-mcp-server.com
```

The audit runs deterministic reliability probes and identifies:

* Timeout issues
* Error handling failures
* Schema compliance issues
* Empty responses
* Silent failures

Example:

```text
Vouqis Audit Report
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

The audit helps you evaluate a server before deployment.

The gateway protects traffic during execution.

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

Request
  ↓
Validation
  ↓
Forward
  ↓
Response Validation
  ↓
Retry Logic
  ↓
Structured Logs
  ↓
Return Result
```

---

## Current MVP

Vouqis currently focuses on five core capabilities:

* Request Validation
* Response Validation
* Timeout Detection
* Retry Logic
* Structured Logs

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

Vouqis prevents failures before users see them.

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
* Timeout detection
* Retry logic

### Phase 2

Reliability Policies

Examples:

```yaml
blockNullResponse: true

maxLatencyMs: 5000

retryAttempts: 1
```

### Phase 3

Reliability Analytics

Operational visibility for MCP reliability.

### Phase 4

Trust Layer For AI Agents

A reliability network powered by real-world MCP interactions.

---

## Why We Built Vouqis

We originally launched around MCP audits and trust scoring.

The launch taught us something important.

Developers don't actually want scores.

They want fewer failures.

The real problem isn't measuring reliability.

The real problem is preventing failures during execution.

That insight led to the gateway.

---

## Mission

Cloudflare protects websites.

Snyk protects software.

Vouqis protects AI agents.

Our goal is to become the reliability layer between AI agents and the tools they depend on.

---

## Contributing

```bash
git clone https://github.com/Sasisundar2211/Vouqis.git

cd Vouqis

npm install

npm test
```

Contributions are welcome.

Open an issue or submit a pull request.

---

## License

MIT License

Copyright (c) Vouqis
