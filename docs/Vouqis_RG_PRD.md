# Vouqis Reliability Gateway — Product Requirements Document

**Product:** Vouqis — AI Agent Reliability Gateway
**Owner:** Sasisundar
**Status:** Draft
**Last Updated:** June 20, 2026
**Version:** 1.0

---

## 1. Executive Summary

| Field | Detail |
|---|---|
| Product | Vouqis — AI Agent Reliability Gateway |
| Type | Developer Infrastructure / B2B SaaS (CLI + Cloud) |
| Stage | Customer Discovery → Design Partner Acquisition |
| Strategic Priority | High — timing window is open, category is uncontested |

**Vision:** Vouqis is the reliability layer that sits between AI agents and MCP servers — catching silent tool failures, schema drift, and null responses before they reach users and become production incidents.

**One-sentence description:** Vouqis is a protocol-aware proxy that intercepts every MCP tool call and decides whether the response can be trusted before the agent acts on it.

| Horizon | Primary Success Metric | Target |
|---|---|---|
| Now (0–8 weeks) | Active design partners | 3 |
| Near (8–16 weeks) | Documented failure stories | 5 |
| Far (16–24 weeks) | First paying customer | $49+/month |

---

## 2. Problem Statement & Opportunity

### 2.1 The Problem

AI agents in production call MCP servers to execute tools — searching databases, writing files, calling APIs, triggering workflows. These calls appear to succeed. The agent moves on. The user sees a confident output. But the tool never actually did anything.

This is the **silent failure problem**. It has four forms:

| Failure Mode | What Happens | What the Agent Sees |
|---|---|---|
| Null result | Tool returns `null` content | `result: null` — agent assumes success |
| Schema drift | Field names or types change upstream | Partial data — agent fills in hallucinated gaps |
| Timeout success | Upstream times out mid-write | No error thrown — agent continues |
| Empty content array | `content: []` returned | Agent sees a valid JSON-RPC envelope |

**Why this is hard to debug:**
- The MCP server returns HTTP 200
- The JSON-RPC envelope is technically valid
- No exception is thrown anywhere in the stack
- The failure surfaces only when the user notices the outcome is wrong
- By then the trace is cold, the context is lost, and the engineer starts from scratch

**Quantified impact (hypothesis, to be validated):**
- Engineering teams report 2–6 hours of debugging per silent failure incident
- Customer trust is damaged before the team knows anything went wrong
- Current tools (LangSmith, OpenTelemetry, custom logging) observe tokens and traces — they do not understand MCP protocol behavior or evaluate whether a tool response should be trusted

### 2.2 The Opportunity

The MCP ecosystem is expanding fast. Anthropic, major agent frameworks, and developer tooling platforms have adopted MCP as the standard interface for agent tool access. The number of production MCP deployments is growing. Reliability tooling is not keeping pace.

**Market timing:** Early — the gap exists now, before a well-funded incumbent enters MCP-native observability.

**Target segments:**

| Segment | Description | Size Estimate |
|---|---|---|
| Primary | Founding Engineers at AI startups running production agent systems | ~5,000 globally |
| Secondary | AI Infrastructure Engineers at mid-market companies scaling agents | ~15,000 globally |
| Tertiary | Platform engineering teams at enterprises deploying internal agent tooling | ~2,000 orgs |

**Competitive gap:**

| Tool | What It Covers | What It Misses |
|---|---|---|
| LangSmith | Prompts, tokens, model outputs, agent traces | MCP protocol behavior, tool response trust |
| OpenTelemetry | Infrastructure spans and metrics | MCP JSON-RPC correctness |
| Custom logging | Whatever the engineer remembered to log | Silent failures by definition |
| **Vouqis** | MCP request/response validation, trust decisions | Model-level observability (by design) |

---

## 3. User Personas

### Persona 1 — The Founding Engineer (Primary)

**Name:** Marcus
**Role:** Founding Engineer / AI Lead at a 5–15 person AI startup
**Context:** Building the core agent infrastructure. Wearing 4 hats. Shipping fast.

**Goals:**
- Ship production agent features without breaking customer workflows
- Detect failures before customers report them
- Spend debugging time on real problems, not phantom MCP issues

**Pain points:**
- "The tool call returned success but the document was never created. We found out from the customer 3 hours later."
- No visibility into what the MCP server actually returned before the agent used it
- Every debugging session starts from scratch — no history, no patterns

**Current workflow:**
```
Agent executes
  → MCP tool called
  → response logged (maybe)
  → agent continues
  → user outcome wrong
  → customer reports
  → engineer digs through logs
  → finds a null response from 3 hours ago
  → reproduces manually
  → closes ticket
  → same failure happens again next week
```

**Ideal future workflow:**
```
Agent executes
  → Vouqis intercepts
  → validates response
  → BLOCK: null result detected
  → agent receives structured error
  → engineer sees alert in real time
  → incident never reaches user
```

**Willingness to pay:** Yes, once the failure pattern is confirmed. Will pay for infrastructure that removes a class of production incidents entirely.

**Budget control:** Yes — Founding Engineers typically own infrastructure spend at early-stage startups.

---

### Persona 2 — The AI Infrastructure Engineer (Secondary)

**Name:** Priya
**Role:** AI Platform / Infrastructure Engineer at a 50–200 person company
**Context:** Scaling an agent system built by another team. Now responsible for reliability.

**Goals:**
- Establish reliability standards across multiple MCP integrations
- Create audit trails for compliance and incident review
- Reduce on-call burden from MCP-related incidents

**Pain points:**
- No consistent validation layer across different MCP servers
- Each integration has different failure modes, different response shapes
- No structured data from past failures to inform future reliability decisions

**Budget control:** Partial — needs CTO or VP Engineering sign-off above ~$500/month.

---

### Persona 3 — The Developer Tool Builder (Tertiary)

**Name:** James
**Role:** Developer at a company building MCP servers or agent frameworks
**Context:** Needs to test their own MCP server for reliability before customers hit it.

**Goals:**
- Validate that their MCP server returns correctly-shaped responses
- Catch schema regressions during CI
- Give customers a reliability guarantee

**Budget control:** Yes, within developer tooling budget.

---

## 4. User Stories

### Epic 1 — Install and intercept in under 5 minutes

```
As a Founding Engineer,
I want to put Vouqis in front of my MCP server with one command,
so that I don't have to change my agent code or my MCP server to get reliability protection.
```

**Acceptance Criteria:**
- Single `npm install`, single command to start the proxy
- Zero changes required to the agent or the MCP server
- Proxy is running and intercepting within 60 seconds of install
- Startup banner clearly shows what is being proxied and what policies are active
- `--help` output is sufficient to get started without reading documentation

**Definition of Done:**
- Works on macOS, Linux, and Windows (Node.js ≥18)
- Time-to-first-intercept measured at < 5 minutes in user testing
- 80%+ of testers complete setup without asking a question

---

### Epic 2 — Catch silent failures automatically

```
As a Founding Engineer,
I want Vouqis to block null, empty, and malformed MCP responses before they reach my agent,
so that my agent never acts on a response that should not be trusted.
```

**Acceptance Criteria:**
- `tools/call` with `null` content is blocked with JSON-RPC error code `-32000`
- `tools/call` with empty `content[]` is blocked when `block_null_result` is enabled
- `tools/call` response with content items missing `type` field is rewritten with `type:'text'` before forwarding
- Upstream HTML error pages (502, Cloudflare, nginx) are wrapped in JSON-RPC errors — never forwarded raw
- `null` JSON body returns `-32600` ("not a JSON object") not `-32700` ("not valid JSON")
- Every block decision is logged with: timestamp, method, tool name, reason, latency, attempt count

---

### Epic 3 — See what's happening in real time

```
As a Founding Engineer,
I want to see every gateway decision printed to my terminal in real time,
so that I can monitor my agent's MCP traffic without opening a separate tool.
```

**Acceptance Criteria:**
- Every request shows: `[HH:MM:SS]  DECISION  method  tool  latency`
- Blocked requests show the reason inline after `←`
- Retry attempts show attempt number and reason
- Color-coded: green=ALLOW, red=BLOCK, yellow=RETRY/REWRITE, dim=context
- Method names truncated at 14 chars with `…` — output never wraps or misaligns
- Tool names truncated at 24 chars with `…`

---

### Epic 4 — Review session history after incidents

```
As a Founding Engineer,
I want to run `vouqis logs` and see a summary of what happened,
so that I can diagnose what went wrong after a production incident without reading raw JSON.
```

**Acceptance Criteria:**
- `vouqis logs` shows: total events, allow/block/retry/rewrite counts, P50 and P95 latency
- Top 5 methods by frequency
- Top 5 block reasons by frequency, with counts
- Last N events listed with time, decision, tool, reason
- `--summary` flag shows stats only (no event rows)
- `--last N` and `--tail N` both accepted (aliases)
- `--file path` reads from a non-default log file
- Audit log is valid NDJSON — importable to any analytics tool

---

### Epic 5 — Protect production with rate limiting and retries

```
As an AI Infrastructure Engineer,
I want to configure rate limits and retry policies per upstream,
so that a misbehaving agent or a flaky upstream doesn't cascade into a production incident.
```

**Acceptance Criteria:**
- `--rate-limit N` enforces a token bucket at N req/s
- Rate-limited requests return `-32000` with the configured limit in the message
- `--retry N` retries only idempotent methods: `tools/list`, `tools/call`, `initialize`, `ping`
- Retry delay: fixed 300ms between attempts
- Max retry: capped at 3 (config or flag)
- `--timeout N` applies per attempt, not total request duration
- Retry events logged with attempt number and reason before each retry

---

### Epic 6 — Load config from file for production deployments

```
As an AI Infrastructure Engineer,
I want to define my proxy config in a vouqis.yml file,
so that I can version-control my reliability policies alongside my agent code.
```

**Acceptance Criteria:**
- `vouqis.yml` auto-detected in current working directory
- `--config path` loads from explicit path (overrides auto-detect)
- YAML schema: `listen`, `log_file`, `upstreams[].url`, `timeout_ms`, `retry`, `rate_limit_rps`, `policies.*`
- Invalid config produces a clear error naming the specific missing or invalid field
- `vouqis.yml` values take precedence over CLI flag defaults
- JSON config (`.json`) also supported

---

## 5. Functional Requirements

### 5.1 Must Have (MVP — Shipped ✅)

| Feature | Status | Description |
|---|---|---|
| HTTP proxy server | ✅ | Node.js `http` server intercepting MCP traffic |
| JSON-RPC request validation | ✅ | Validates jsonrpc version, method, id, body shape |
| Null / empty result blocking | ✅ | Blocks `tools/call` with null or empty `content[]` |
| Schema sanitization (rewrite) | ✅ | Rewrites content items missing `type` field |
| Token bucket rate limiter | ✅ | Per-upstream req/s cap |
| Timeout with idempotent retry | ✅ | Configurable timeout, idempotent-only retry |
| SSE stream passthrough | ✅ | Pipes `text/event-stream` responses without buffering |
| Upstream response header forwarding | ✅ | Forwards `mcp-session-id` and all non-hop-by-hop headers |
| NDJSON audit log | ✅ | Every decision logged with full context to file |
| Real-time stderr output | ✅ | Color-coded ALLOW/BLOCK/RETRY/REWRITE per request |
| `vouqis logs` command | ✅ | Summary stats + last N events from audit log |
| `--last` flag alias | ✅ | `--last N` accepted as alias for `--tail N` |
| YAML + JSON config file | ✅ | `vouqis.yml` auto-detect or `--config path` |
| Security headers (all paths) | ✅ | `nosniff`, `no-store`, CORS on every response path |
| Non-JSON upstream error wrapping | ✅ | HTML / plaintext upstream responses wrapped in `-32603` |
| Correct null-body error code | ✅ | `null` JSON body → `-32600`, not `-32700` |
| Method name truncation in logs | ✅ | 14-char max, `…` suffix |
| PostHog anonymous analytics | ✅ | No PII, no content, opt-out via missing key |

### 5.2 Should Have (Sprint 1 — Weeks 1–4)

| Feature | Priority | Description |
|---|---|---|
| SSRF protection on `--upstream` | **High** | Block RFC 1918 + `169.254.*` ranges unless explicitly opted in |
| `vouqis logs --watch` | **High** | Live tail of audit log as new events arrive |
| `vouqis init` scaffold | **Medium** | Generate a commented `vouqis.yml` with sensible defaults |
| Structured YAML validation errors | **Medium** | Config errors include field name and line number |
| `--allow-methods` whitelist flag | **Medium** | Pass only listed MCP methods; block everything else |

### 5.3 Could Have (Sprint 2 — Weeks 4–8)

| Feature | Priority | Description |
|---|---|---|
| Webhook on block | Low | POST to a URL on block event — Slack, PagerDuty integration |
| `vouqis report` command | Low | Export session summary as Markdown or JSON |
| Failure signature library | Low | Named failure patterns: `null-result`, `timeout-loop`, `schema-drift` |
| `--log-max-size` rotation | Low | Rotate audit log at N MB to prevent disk exhaustion |
| Multi-upstream routing | Low | Route different MCP methods to different upstreams |

### 5.4 Won't Have (This Phase)

| Feature | Reason |
|---|---|
| TLS termination | Gateway is local; TLS is the MCP server's responsibility |
| Agent SDK integration | Gateway is transparent — zero SDK changes required by design |
| Model-level observability | LangSmith owns this; Vouqis is MCP-layer only |
| Web dashboard (v1) | Requires 3 design partners first to validate what to show |
| Automatic MCP server discovery | Scope creep — manual `--upstream` is sufficient for MVP |
| Authentication on the gateway port | Local use only; auth is out of scope until cloud deployment |

---

## 6. Technical Requirements

### 6.1 Current Architecture

```
packages/
├── cli/                        # @vouqis/cli — the gateway product
│   ├── bin/run.js              # CLI entry point (oclif)
│   └── src/
│       ├── commands/
│       │   ├── proxy.ts        # Startup, config resolution, banner
│       │   └── logs.ts         # Log viewer, summary stats
│       ├── proxy/
│       │   ├── server.ts       # HTTP server, full request pipeline
│       │   ├── validator.ts    # JSON-RPC + MCP response validation
│       │   ├── ratelimit.ts    # Token bucket rate limiter
│       │   ├── audit.ts        # NDJSON logger + stderr output
│       │   ├── config.ts       # YAML/JSON config loading + defaults
│       │   └── types.ts        # Shared TypeScript types
│       └── analytics.ts        # PostHog anonymous event capture
└── vouqis-dashboard/           # vouqis.tech — Next.js 16 marketing site
```

### 6.2 Request Pipeline

```
Client POST
  ↓
readBody()
  ↓
JSON.parse guard            ← null/array check before property access
  ↓
validateRequest()           ← size limit, jsonrpc version, method, id type
  ↓
TokenBucket.consume()       ← rate limit check
  ↓
forwardToUpstream()         ← with retry on TimeoutError (idempotent methods only)
  ↓
contentType check:
  text/event-stream → pipe SSE chunks, emit allow
  JSON              → validateResponse() → block / rewrite / allow
  non-JSON          → wrap in -32603 JSON-RPC error, emit block
  ↓
writeHead:
  upstreamResponseHeaders() spread first   ← mcp-session-id, www-authenticate, etc.
  SEC spread second                        ← SEC always wins for security headers
  ↓
emit AuditEvent → NDJSON file + stderr
```

### 6.3 JSON-RPC Error Code Conventions

| Code | Meaning | When Used |
|---|---|---|
| `-32700` | Parse error | Body is not valid JSON |
| `-32600` | Invalid request | Schema violation (wrong jsonrpc, missing method, bad id type, not an object) |
| `-32000` | Server error | Rate limit exceeded, upstream timeout |
| `-32603` | Internal error | Unexpected exception, non-JSON upstream response |

### 6.4 Performance Requirements

| Metric | Target | Measured (local, vs Context7) |
|---|---|---|
| Proxy overhead P50 | < 5ms | ~1ms |
| Proxy overhead P95 | < 15ms | ~13ms |
| Startup time | < 1s | ~600ms |
| Audit log write | Non-blocking | Async `fs.WriteStream` |
| Memory footprint | < 50MB | ~30MB (Node.js baseline) |
| Concurrent connections | ≥ 100 | Not yet load-tested |

### 6.5 Security Requirements

| Requirement | Status | Notes |
|---|---|---|
| `X-Content-Type-Options: nosniff` on all responses | ✅ Done | Applied via SEC constant |
| `Cache-Control: no-store` on all responses | ✅ Done | `no-cache` override for SSE |
| `Access-Control-Allow-Origin: *` with explicit header list | ✅ Done | OPTIONS returns explicit header allowlist |
| Host header stripped before upstream forwarding | ✅ Done | Prevents host leakage |
| No request/response content in analytics | ✅ Done | PostHog receives method names and hostnames only |
| SSRF protection (`--upstream` URL validation) | ❌ Sprint 1 | Blocks AWS metadata, RFC 1918 ranges |
| Hop-by-hop headers stripped from upstream responses | ✅ Done | `connection`, `keep-alive`, `transfer-encoding`, etc. |

### 6.6 Supported Platforms

| Platform | Status |
|---|---|
| macOS (Apple Silicon + Intel) | ✅ Tested |
| Linux (Ubuntu 22.04+) | ✅ Expected (Node.js cross-platform) |
| Windows (Node.js ≥18) | Not yet tested |
| Node.js ≥18 | ✅ Required (AbortSignal.timeout, ReadableStream) |

### 6.7 MCP Transport Compatibility

| Transport | Status | Notes |
|---|---|---|
| Streamable HTTP (POST + SSE) | ✅ Supported | Tested against Context7 v3.2.0 |
| SSE-only GET stream | ✅ Supported | Passthrough without buffering |
| STDIO | ❌ Not applicable | Vouqis is an HTTP proxy; STDIO servers need an HTTP adapter |

---

## 7. UX Requirements

### 7.1 Design Principles

1. **Zero friction to first intercept.** One `npm install`, one command, under 5 minutes.
2. **Every line earns its place.** If a user can't act on a piece of output, it doesn't belong in the terminal.
3. **Decisions are legible.** A non-expert reading the log should understand what happened and why.
4. **Errors are actionable.** Every block message answers: what failed, why, and what to check.
5. **Silence is not an option.** Every request produces a log line — nothing passes through invisibly.

### 7.2 Startup Banner Standard

```
VOUQIS ── proxy ── https://mcp.context7.com/mcp
──────────────────────────────────────────────────

  Listening on   http://127.0.0.1:4444
  Upstream       https://mcp.context7.com/mcp
  Timeout        5000ms
  Retry          1 (idempotent requests)
  Rate limit     10 req/s
  Block null     yes
  Sanitize       yes
  Audit log      ./vouqis-audit.log

  Point your agent at http://127.0.0.1:4444 instead of the real server.
  Every decision is logged to stderr and to ./vouqis-audit.log.

──────────────────────────────────────────────────
```

- **Bold white** = product name
- **Dim** = separators and context sentences
- **Blue** = upstream URL (what you're protecting)
- **White values** = settings the user controls
- **Green "yes"** = policy active (protecting you)
- **Dim "no"** = policy inactive

### 7.3 Live Decision Log Standard

```
  [01:20:22]  ALLOW    tools/list                    12ms
  [01:20:23]  ALLOW    tools/call    search          45ms
  [01:20:23]  BLOCK    tools/call    tool_b          2ms   ← tools/call content is empty or not an array
  [01:20:24]  RETRY    tools/call    fetch_data      1008ms ← timeout on attempt 1 — retrying in 300ms
  [01:20:25]  BLOCK    tools/call    fetch_data      2316ms ← upstream timed out after 1000ms (2 attempt(s))
```

Column widths:
- Time: `[HH:MM:SS]` — 10 chars
- Decision: 7 chars padded — `ALLOW  `, `BLOCK  `, `RETRY  `, `REWRITE`
- Method: 14 chars max, truncated with `…`
- Tool: 24 chars max, truncated with `…`
- Latency: right-aligned, dim
- Reason: dim, prefixed with `←`

### 7.4 Error Message Standard

Every gateway error message must answer three questions in one clause:
1. **Who decided** → `Gateway:`
2. **What was wrong** → `tools/call content is empty or not an array`
3. **Implicit: what to check** → the tool's response shape

| Bad | Good |
|---|---|
| `Validation error` | `Gateway: tools/call content is empty or not an array` |
| `Request blocked` | `Gateway: rate limit exceeded (10 req/s)` |
| `Upstream error` | `Gateway: upstream timed out after 5000ms (3 attempt(s))` |
| `Invalid JSON` | `Gateway: request body is not a JSON object` |

### 7.5 `vouqis logs` Output Standard

```
VOUQIS ── audit log summary
──────────────────────────────────────────────────

  Total events   247
  Allowed        198
  Blocked        42
  Retried        5
  Rewritten      2
  Latency P50    12ms
  Latency P95    340ms

  Top methods:
    tools/call               180
    tools/list               38
    initialize               22
    ping                     7

  Top block reasons:
    ✗ Gateway: rate limit exceeded (10 req/s) (28)
    ✗ Gateway: tools/call content is empty or not an array (9)
    ✗ Gateway: upstream timed out after 5000ms (3 attempt(s)) (5)

  Last 20 events:

  ✓ allow   1:26:18 AM search                   12ms
  ✗ block   1:26:19 AM tool_b                   2ms — tools/call content is empty or not an array

──────────────────────────────────────────────────
```

---

## 8. Non-Functional Requirements

### 8.1 Reliability

| Requirement | Target |
|---|---|
| Gateway uptime (local process) | N/A — user-managed process |
| Request failure rate (gateway fault) | < 0.1% |
| Audit log durability | All events written before process exit |
| Graceful shutdown | SIGINT/SIGTERM closes log stream cleanly |

### 8.2 Observability

| Signal | Implementation |
|---|---|
| Per-request decisions | NDJSON audit log + stderr |
| Error details | Reason field in every block/retry/rewrite event |
| Latency | `latency_ms` per event (wall clock from request start) |
| Retry visibility | Separate `retry` audit event before each attempt |
| Analytics | PostHog anonymous events (proxy_started, request_blocked, etc.) |

### 8.3 Analytics Events (PostHog)

| Event | Properties | Purpose |
|---|---|---|
| `proxy_started` | `upstream` (hostname only), `listen`, `timeout_ms`, `retry`, `rate_limit_rps`, `block_null`, `sanitize_schema` | Activation, config distribution |
| `proxy_stopped` | `upstream`, `uptime_ms` | Session duration |
| `request_allowed` | `method`, `tool`, `latency_ms`, `attempt`, `upstream` | Traffic volume, method mix |
| `request_blocked` | `method`, `tool`, `latency_ms`, `reason`, `upstream` | Failure pattern frequency |
| `request_retried` | `method`, `tool`, `attempt`, `reason`, `upstream` | Upstream flakiness |
| `response_rewritten` | `method`, `tool`, `reason`, `upstream` | Schema sanitize adoption |
| `logs_command_run` | `event_count`, `summary_mode` | Diagnostic behavior |
| `config_loaded` | `config_path`, `upstream_count` | YAML adoption rate |
| `proxy_start_error` | `listen`, `error` (message only) | Friction in startup |

**Privacy invariants — never sent:**
- Request body content
- Response body content
- Full upstream URLs (hostname only)
- Tool arguments
- User identifiers
- File paths

---

## 9. Success Metrics & Analytics

### 9.1 Phase 1 — Customer Discovery (Weeks 1–8)

| Metric | Target | How Measured |
|---|---|---|
| Outreach messages per week | 50 | Manual tracking |
| Discovery conversations per week | 10 | Calendar |
| Documented failure stories | 5 | Written case studies |
| Design partners signed | 3 | Agreements |
| Active pilots running | 1 | PostHog `proxy_started` |

### 9.2 Phase 2 — Design Partner Feedback (Weeks 8–16)

| Metric | Target | How Measured |
|---|---|---|
| Time to first intercept (new user) | < 5 minutes | User testing sessions |
| Setup without documentation | ≥ 80% success | Recorded sessions |
| Failures caught per partner per week | ≥ 3 | Audit log analytics |
| Partner NPS | ≥ 8/10 | Survey |
| Feature requests mapped to roadmap | 3 prioritized | Interview synthesis |

### 9.3 Phase 3 — Revenue (Weeks 16–24)

| Metric | Target | How Measured |
|---|---|---|
| Paying customers | 1 | Stripe |
| Monthly recurring revenue | ≥ $49 | Stripe |
| GitHub stars | 500 | GitHub |
| npm weekly downloads | 200 | npm |
| Install → active use conversion | ≥ 30% | PostHog funnel |

### 9.4 Leading Indicators (Weekly Review)

```
Week over week:
  proxy_started events      → adoption velocity
  request_blocked / total   → gateway value density (higher = more failures caught)
  request_retried events    → upstream reliability signal
  logs_command_run events   → post-incident diagnostic behavior
  proxy_stopped uptime_ms   → session stickiness
```

---

## 10. Implementation Plan

### 10.1 Current Shipped State (June 20, 2026)

**CLI v0.4.4 — production-ready core:**

| Item | Status |
|---|---|
| 125 unit tests passing | ✅ |
| Production-tested vs. Context7 MCP | ✅ |
| 4 bugs fixed in due diligence session | ✅ |
| Pushed to GitHub main | ✅ |
| vouqis.tech deployed | ✅ |

**Bugs fixed this session:**

| Commit | Fix |
|---|---|
| `499933f` | `null` JSON body → wrong code `-32700` instead of `-32600` |
| `499933f` | HTML upstream response forwarded raw → now wrapped in `-32603` |
| `499933f` | 200-char method names blew out log column alignment → truncated at 14 |
| `69c2cfd` | `--last` flag missing → added as alias for `--tail` |
| `e882940` | Upstream response headers dropped → `mcp-session-id` now forwarded |

---

### 10.2 Sprint 1 — Design Partner Acquisition (Weeks 1–4)

**Goal:** 3 design partners with Vouqis running in their dev environment.

| Task | Type | Effort |
|---|---|---|
| SSRF protection on `--upstream` | Engineering | 2h |
| `vouqis logs --watch` live tail | Engineering | 4h |
| `vouqis init` scaffold command | Engineering | 3h |
| Structured YAML validation errors with field names | Engineering | 3h |
| Technical Reliability Playbook (lead magnet PDF) | Content | 1 day |
| 50 outreach messages / week to Founding Engineers | GTM | Ongoing |
| 10 discovery calls / week | GTM | Ongoing |
| Design partner agreement template | Legal/Ops | 2h |

---

### 10.3 Sprint 2 — Design Partner Pilots (Weeks 4–8)

**Goal:** 1 active pilot. Collect 5 failure stories.

| Task | Type | Effort |
|---|---|---|
| Webhook on block (Slack / PagerDuty) | Engineering | 1 day |
| `--allow-methods` whitelist flag | Engineering | 4h |
| Failure signature library (named patterns) | Engineering | 2 days |
| `vouqis report` export command | Engineering | 1 day |
| `--log-max-size` rotation flag | Engineering | 3h |
| Weekly check-ins with design partners | GTM | Ongoing |
| Failure story documentation (5 case studies) | Content | Ongoing |

---

### 10.4 Sprint 3 — Path to Revenue (Weeks 8–16)

**Goal:** 1 paying customer. Define and scope cloud offering.

| Task | Type | Effort |
|---|---|---|
| Cloud gateway architecture design | Engineering | 1 week |
| Pricing page on vouqis.tech | Engineering + GTM | 1 day |
| Stripe self-serve integration | Engineering | 2 days |
| Reliability dashboard v1 (web UI) | Engineering | 2 weeks |
| Case studies → testimonials on vouqis.tech | Content | 3 days |
| 3 design partner → paying customer conversion calls | GTM | Ongoing |

---

### 10.5 MVP Boundaries

| In scope (CLI MVP — done) | Out of scope (until 3 design partners) |
|---|---|
| Single upstream per config | Cloud deployment |
| Local proxy (not cloud) | Team / org accounts |
| File-based audit log | Web dashboard |
| Terminal-only analytics (`logs` command) | Multi-upstream routing |
| PostHog anonymous telemetry | Automatic MCP server discovery |
| | Authentication on the proxy port |

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| SSRF via unvalidated `--upstream` | Medium | High | Block RFC 1918 + `169.254.*` — Sprint 1, 2h fix |
| SSE buffering stall on large streams | Low | Medium | Already uses streaming `ReadableStream.getReader()` — tested in production |
| Audit log disk exhaustion on long sessions | Low | Medium | `--log-max-size` rotation flag — Sprint 2 |
| Node.js single-thread bottleneck at high RPS | Low | High | Token bucket is synchronous — load test at 1000 RPS before cloud launch |
| Hop-by-hop filter breaks HTTP/2 multiplexed connections | Low | Low | Current proxy is HTTP/1.1 only; H2 is out of scope |

### 11.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| MCP adoption slows before reliability tooling matures | Medium | High | Maintain optionality: same proxy pattern applies to OpenAI tool-calling protocol |
| LangSmith ships MCP-native response validation | Medium | High | Accelerate on failure signatures and trust intelligence as durable moat |
| Design partners don't experience enough failures to validate | Medium | High | Instrument their existing agent systems — surface latent failures they haven't seen yet |
| Founding Engineers don't control infrastructure budget | Medium | Medium | Qualify budget ownership in discovery call (question 2 of 5) |
| CLI-to-cloud conversion requires more engineering than available | Low | High | Design partner contract includes cloud pilot clause with defined scope |

### 11.3 Discovery Risks

| Risk | Mitigation |
|---|---|
| Can't get 10 conversations per week | Lower barrier: offer a free MCP reliability review as value exchange for 20 minutes |
| Failure stories aren't specific enough to build from | Structured interview: "Walk me through the last time a tool call surprised you — what did you expect, what happened?" |
| Design partners want a feature that can't ship in 4 weeks | Commit to roadmap position, not delivery date — maintain trust without over-promising |
| `block_null_result: true` default is too aggressive for some upstream patterns | Add `--no-block-null` flag (already implemented) — make it discoverable in startup banner |

---

## 12. Open Questions (Require Discovery Calls)

These are hypotheses. They cannot be answered from the desk.

| # | Question | Why It Matters |
|---|---|---|
| 1 | How often do silent MCP failures occur in a typical production week? | Determines whether this is a daily annoyance or a rare emergency |
| 2 | Who approves infrastructure spend — Founding Engineer, CTO, or finance? | Determines sales motion (self-serve vs. top-down) |
| 3 | What triggers the decision to add a new reliability tool — customer complaint, near-miss, or audit? | Determines positioning angle and urgency framing |
| 4 | Should `block_null_result` default to `true` or `false`? | Too aggressive may cause friction; too lenient misses the core value |
| 5 | Do design partners want Vouqis Cloud or a self-hosted Docker image? | Determines cloud architecture investment priority |
| 6 | Do users want custom per-tool schema validation, or is generic MCP validation enough for v1? | Determines whether failure signatures are a Sprint 2 feature or a moat |
| 7 | Is this a personal developer install or shared team infrastructure from day one? | Determines whether multi-user config is a blocker for adoption |

---

## 13. Quality Checklist

| Criterion | Status | Notes |
|---|---|---|
| Problem defined with evidence | ✅ | Founder experience + production testing |
| Solution aligns with user needs | ✅ | Zero-config intercept matches Founding Engineer workflow |
| Requirements are specific and measurable | ✅ | Acceptance criteria are testable |
| Acceptance criteria are testable | ✅ | All user stories have binary pass/fail criteria |
| Technical feasibility validated | ✅ | Production-tested vs. Context7 MCP in this session |
| Success metrics defined and trackable | ✅ | PostHog + manual tracking defined |
| Security requirements identified | ⚠️ | SSRF gap documented, scheduled for Sprint 1 |
| Risks identified with mitigation plans | ✅ | Section 11 above |
| Stakeholder alignment confirmed | ❌ | Requires 3 design partner confirmations |
| Pricing validated | ❌ | $49–$299/month is hypothesis only |

---

*The gateway is production-ready. The only thing that can falsify or confirm this PRD is conversations with Founding Engineers running production agent systems. Every assumption above is a hypothesis until a design partner says: "yes, this is exactly what broke our demo last Tuesday."*
