# Vouqis — Product Requirements Document

**Owner:** Sasi Sundar  
**Status:** Draft  
**Last Updated:** 2026-06-17  
**Stage:** Customer Discovery → MVP

---

## 1. Executive Summary

### Product Vision

Vouqis is an MCP reliability gateway that sits between AI agents and MCP servers to validate protocol behavior, classify silent failures, and build a trust layer for agent infrastructure — before failures become customer-visible incidents.

**Target User:** Founding engineers and AI infrastructure teams running production AI agents on MCP.

**Key Differentiator:** The only tool that understands the MCP protocol natively — validating JSON-RPC envelopes, schema compliance, and tool execution outcomes rather than operating at the LLM or trace layer.

**Success Definition:** 3 design partners actively using Vouqis in staging or production within 90 days. First paying customer within 120 days.

### Strategic Alignment

| Dimension | Detail |
|---|---|
| Business objective | Become the reliability standard for AI agent infrastructure |
| User problem | Silent MCP failures reach users before developers detect them |
| Market timing | MCP ecosystem expanding faster than reliability tooling |
| Competitive advantage | MCP-native protocol intelligence + reliability dataset moat |

### Resource Requirements (MVP)

| Item | Estimate |
|---|---|
| Development effort | 1 founding engineer, 8–12 weeks |
| Timeline | Week 1–4: discovery + CLI hardening; Week 5–12: cloud alpha |
| Key skills | Node.js/TypeScript, HTTP proxy, JSON-RPC, Next.js |
| Budget | Minimal — open-source distribution, Vercel hosting |

---

## 2. Problem Statement & Opportunity

### Problem Definition

AI agents increasingly depend on MCP (Model Context Protocol) servers to access tools, data, APIs, and external systems. The failure mode that matters is not crashes — it is silent failure.

**The exact failure chain:**
```
Agent calls tool
↓
MCP server returns HTTP 200
↓
Result field contains null, stale data, or a wrapped error
↓
Agent reads status code — not payload
↓
Agent logs: success
↓
User outcome: broken
↓
Discovery: customer complaint, 33 minutes later
```

**Documented failure patterns:**

1. **Null result propagation** — `{"success": true, "result": null}` passes every HTTP check. Agent passes null downstream. TypeError surfaces 8 steps later with no trace to origin.
2. **Retry masking** — Agent retries on timeout ×6. Upstream deduplicates. Agent logs success×6. No trace of retry count or original failure.
3. **State drift (multi-agent)** — Agent B reads shared state before Agent A finishes writing. Both log completion. Merge step processes stale snapshot. Silent corruption.
4. **Schema drift** — Upstream response shape changes. Agent reads a field that no longer exists. Silent wrong behavior.

**Quantified impact:**
- Engineering time: Hours of debugging per incident
- Customer trust: Failures discovered via user complaints
- Compliance risk: Silent failures in financial, healthcare, and legal agent workflows
- Demo reliability: Broken demos in sales cycles due to MCP failures

**Evidence:**
- MCP community forums: "The tool succeeded but nothing happened."
- Agent engineering discussions: "We only found out from users."
- Founder interviews: "Debugging took hours because every layer said success."

### Opportunity Analysis

**Market:** AI startups, agent infrastructure teams, enterprise AI groups, platform engineering teams building on MCP.

**Timing (10/10):** MCP is being adopted by Anthropic, Cursor, Claude Desktop, and OpenAI-compatible ecosystems as the standard tool-use protocol. The number of MCP servers is growing faster than reliability tooling. This window closes as larger observability platforms add MCP-awareness.

**Gap:** Existing tools (LangSmith, Helicone, Portkey, OpenTelemetry) operate at the LLM/trace layer. None validate at the MCP protocol layer — JSON-RPC envelopes, schema correctness, tool execution outcomes, or transport-level trust.

**Revenue potential:** $1M–$10M ARR at scale. Comparable: Portkey, Langfuse, Helicone, Composio, MintMCP.

### Success Criteria

| Metric | Target | Timeline |
|---|---|---|
| Design partners using Vouqis in staging/production | 3 | Day 90 |
| First paying customer | 1 | Day 120 |
| Documented failure stories collected | 5 | Week 1 |
| CLI installs | 100 | Month 1 |
| Audit reports generated | 50 | Month 1 |
| Conversion: free audit → design partner conversation | 20% | Ongoing |

---

## 3. User Requirements & Stories

### Primary Persona: Founding Engineer

**Name:** Alex, Founding Engineer  
**Company:** 5–25 person AI startup building customer-facing agent workflows  
**Stack:** Claude + MCP servers for CRM, ticketing, email, calendar, or custom APIs

**Goals:**
- Ship agents to production with confidence
- Catch failures before users do
- Debug incidents faster when they occur
- Understand which MCP servers are reliable

**Pain Points:**
- "I don't know if a tool call actually did what it claimed"
- "Every layer says success but the outcome is wrong"
- "I have 6 MCP servers and no idea which one is causing issues"
- "We only find out about failures from users or via Slack alerts"

**Current Workflow:**
```
Agent calls tool → HTTP 200 → assume success → user reports bug → grep logs →
find tool call → check upstream → realize response was null → fix → repeat
```

**Success Criteria:** "I want to see a failure before my user does."

---

### Secondary Persona: AI Infrastructure Engineer

**Name:** Sam, Senior Infrastructure Engineer  
**Company:** 50–200 person company with multiple agent pipelines in production

**Goals:**
- SLO-style reliability guarantees for agent infrastructure
- Structured failure data for postmortems
- Trust scoring across MCP server fleet

**Pain Points:**
- No protocol-layer observability for MCP traffic
- Custom middleware is fragile and undocumented
- Reliability is treated as per-engineer tribal knowledge

**Success Criteria:** "I want a reliability score per MCP server with historical trend data."

---

### User Journey: Current State (Broken)

```
1. Engineer builds agent workflow
2. Agent calls MCP tool
3. MCP server returns HTTP 200 with result: null
4. Agent reads .success field — true
5. Agent continues, passes null to next step
6. 8 steps later: TypeError or silent wrong outcome
7. User reports bug (33 min later on average)
8. Engineer grepping logs for 2+ hours
9. Root cause identified: null from step 3
10. Fix deployed
11. Repeat next week with different tool
```

### User Journey: Future State (With Vouqis)

```
1. Engineer routes agent through Vouqis proxy
2. Agent calls MCP tool (same as before)
3. MCP server returns HTTP 200 with result: null
4. Vouqis intercepts, validates against schema
5. Vouqis classifies: null_result_propagation
6. Vouqis emits audit event, blocks or alerts
7. Engineer sees structured failure in Vouqis dashboard
8. User never sees broken outcome
9. MCP server trust score updated
10. Trend visible across all servers in fleet
```

---

### Core User Stories

#### Epic 1: Route & Validate Traffic

**Story 1.1**
> As a founding engineer, I want to point my agent at Vouqis instead of my MCP server so that all tool calls are validated before they reach my agent.

*Acceptance Criteria:*
- `vouqis proxy --upstream <url>` starts a local proxy on port 4444
- All JSON-RPC requests are forwarded to upstream
- All responses are validated against MCP protocol schema
- Proxy adds < 10ms latency on happy path
- Proxy handles GET (SSE), POST (JSON-RPC), and OPTIONS

**Story 1.2**
> As a founding engineer, I want Vouqis to detect null results even when HTTP status is 200 so that I know about failures before my agent acts on them.

*Acceptance Criteria:*
- Proxy inspects response body, not just status code
- null in result field triggers classification
- Failure is written to audit log with failure type, timestamp, upstream, and request ID
- Failure is surfaced in structured format

**Story 1.3**
> As a founding engineer, I want schema validation on MCP responses so that I'm alerted when upstream server behavior changes.

*Acceptance Criteria:*
- Proxy validates response against JSON-RPC 2.0 schema
- Violations are classified and logged
- Agent receives a structured error (not a raw upstream payload)

---

#### Epic 2: Audit Logging

**Story 2.1**
> As a founding engineer, I want a local audit log of every MCP interaction so that I can debug failures after they occur.

*Acceptance Criteria:*
- Every request/response pair is written to `vouqis-audit.log` (NDJSON)
- Each entry contains: timestamp, method, upstream, latency, failure type (if any), ref ID
- Log is queryable via `vouqis logs` CLI command
- Log never contains request/response content or PII

**Story 2.2**
> As a founding engineer, I want to filter audit logs by failure type so that I can find all null_result_propagation failures in the last 24 hours.

*Acceptance Criteria:*
- `vouqis logs --filter null_result_propagation` returns matching entries
- `vouqis logs --since 24h` returns time-filtered results

---

#### Epic 3: MCP Reliability Audit

**Story 3.1**
> As a founding engineer, I want to run a point-in-time reliability audit against any MCP server URL so that I understand its behavior before integrating it.

*Acceptance Criteria:*
- `vouqis audit <url>` executes standard MCP test suite
- Output includes: Trust Score (0–100), failure classifications, response time
- Report is human-readable in terminal and exportable as JSON
- Audit completes in < 30 seconds

---

#### Epic 4: Trust Scoring

**Story 4.1**
> As an AI infrastructure engineer, I want each MCP server to accumulate a reliability score over time so that I can compare servers and make informed integration decisions.

*Acceptance Criteria:*
- Trust score is calculated from: null rate, schema violation rate, timeout rate, retry rate
- Score updates on every interaction
- Score is visible in CLI (`vouqis status`) and in cloud dashboard
- Score history is retained for trend analysis

---

## 4. Functional Requirements

### Must Have (MVP — Weeks 1–8)

| # | Feature | Description |
|---|---|---|
| F1 | Local proxy | `vouqis proxy --upstream <url>` — HTTP proxy on port 4444 |
| F2 | JSON-RPC validation | Schema check on every request and response |
| F3 | Failure classification | Classify: null_result, schema_violation, timeout, parse_error |
| F4 | Audit logging | NDJSON log of every interaction, no PII |
| F5 | CLI log viewer | `vouqis logs` with filtering |
| F6 | MCP audit command | `vouqis audit <url>` with Trust Score output |
| F7 | Rate limiting | Token bucket per upstream to prevent runaway retries |
| F8 | Retry policy | Retry only idempotent methods on TimeoutError, max 300ms delay |
| F9 | Security headers | `X-Content-Type-Options`, `Cache-Control: no-store` on all responses |
| F10 | SSE passthrough | GET requests forwarded as SSE streams |

### Should Have (Cloud Alpha — Weeks 9–16)

| # | Feature | Description |
|---|---|---|
| F11 | Trust scoring | Per-server score calculated from failure history |
| F12 | Cloud dashboard | Web UI showing real-time failures and server trust scores |
| F13 | Team accounts | Multi-user access with workspace isolation |
| F14 | Failure alerts | Email/Slack notification on failure threshold breach |
| F15 | Trend analytics | Score history and failure rate over time |

### Could Have (Post-Alpha)

| # | Feature | Description |
|---|---|---|
| F16 | SDK mode | Library integration instead of proxy |
| F17 | CI integration | Run audit in GitHub Actions, fail on trust score < threshold |
| F18 | Failure sharing | Anonymized cross-customer failure signatures |
| F19 | Custom schema registry | User-defined response schemas per tool |

### Won't Have (This Cycle)

- LLM trace or prompt observability (that's LangSmith's lane)
- MCP server hosting or management
- Agent orchestration features

---

## 5. Technical Requirements

### Architecture

```
Agent
  ↓ HTTP (JSON-RPC 2.0)
Vouqis Proxy (Node.js HTTP server)
  ├── Request validator
  ├── Rate limiter (token bucket)
  ├── Upstream forwarder
  ├── Response validator
  ├── Failure classifier
  ├── Audit logger (NDJSON)
  └── Retry engine
  ↓ HTTP
MCP Server
```

### JSON-RPC Error Codes

| Code | Meaning |
|---|---|
| -32700 | Parse error (invalid JSON or empty body) |
| -32600 | Invalid request (schema violation, missing method) |
| -32000 | Server error (rate limit, upstream timeout) |
| -32603 | Internal error (unexpected exception) |

### API Requirements

**POST** — JSON-RPC only. Return 405 with JSON-RPC error body for all other methods.  
**GET** — Reserved for SSE stream passthrough only.  
**OPTIONS** — 204 with explicit CORS headers (no wildcard `Access-Control-Allow-Headers`).

Security headers on every response path:
```ts
const SEC = {
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
}
```

### Data Model: Audit Log Entry

```ts
{
  timestamp: string           // ISO 8601
  id: string                  // JSON-RPC request id
  method: string              // e.g. "tools/call"
  upstream: string            // hostname only, no path or auth
  latencyMs: number
  status: 'ok' | 'failure'
  failureType?: string        // null_result | schema_violation | timeout | parse_error | retry
  ref: string                 // internal correlation ID
}
```

No request/response content. No full URLs. No tokens. No PII.

### Performance Requirements

| Requirement | Target |
|---|---|
| Proxy latency overhead (happy path) | < 10ms p95 |
| Proxy startup time | < 500ms |
| Audit log write | Non-blocking, async |
| `vouqis audit` completion | < 30 seconds |
| CLI test suite | 113 tests, < 10s |

### Reliability Requirements

| Requirement | Target |
|---|---|
| Proxy uptime (local) | Dependent on host machine |
| Cloud proxy uptime | 99.9% |
| Audit log durability | Flush to disk on every entry |
| Retry policy | Max 1 retry, 300ms delay, idempotent methods only |

### Idempotent MCP Methods (retry-eligible)

`tools/list`, `tools/call`, `initialize`, `ping`

### Security Requirements

- Strip `Host` header before forwarding to upstream
- Never expose raw exception messages — wrap in `Gateway: ...`
- All credentials via environment variables, never hardcoded
- PostHog analytics: hostname only, no content, no PII, opt-out via missing API key
- CLI: no network calls without explicit user consent

### Platform Requirements

| Platform | Support |
|---|---|
| Node.js | 18+ |
| OS | macOS, Linux (primary), Windows (best-effort) |
| Cloud hosting | Vercel (dashboard), self-hosted (proxy) |
| Package manager | npm |

---

## 6. User Experience Requirements

### Design Principles

1. **Zero configuration to start** — `npm install -g @vouqis/cli && vouqis proxy --upstream <url>` is the entire setup
2. **Failures are signal, not noise** — every failure event is structured and actionable
3. **Transparency** — audit log is human-readable NDJSON, not a black box
4. **Developer-native** — terminal-first, no required GUI for core functionality

### CLI Interface

```bash
# Start proxy
vouqis proxy --upstream https://your-mcp-server.example.com

# View audit log
vouqis logs
vouqis logs --filter null_result_propagation
vouqis logs --since 24h

# Run reliability audit
vouqis audit https://your-mcp-server.example.com

# View server trust scores
vouqis status
```

### CLI Output Standards

- Use structured output (JSON with `--json` flag) for programmatic use
- Human-readable default with color-coded failure severity
- Never truncate failure details
- Always include `ref` ID for cross-referencing with audit log

### Marketing Site (vouqis.tech)

- Single-page narrative: problem → solution → early access
- No authentication required to read
- Email capture as primary CTA → Resend notification to founder
- `/proxy` quickstart page for developer onboarding

### Accessibility

- Marketing site: WCAG 2.1 AA
- Skip-to-content link on all pages
- Color is never the only indicator (dot + label for status)
- Keyboard navigable

---

## 7. Non-Functional Requirements

### Security

- No customer data stored without explicit opt-in (cloud tier only)
- Audit logs stored locally by default (customer's machine)
- Cloud tier: encryption at rest, TLS in transit
- No third-party analytics in proxy path (PostHog is CLI-only, opt-out)

### Performance

| Metric | Requirement |
|---|---|
| Marketing site LCP | < 2.5s |
| Marketing site FID | < 100ms |
| Proxy added latency | < 10ms p95 |
| Cloud dashboard load | < 3s initial, < 1s subsequent |

### Scalability (Cloud Tier)

- Design for 10K requests/minute per workspace at launch
- Audit log storage: 90-day retention by default
- Trust score computation: eventual consistency acceptable (< 5s lag)

### Monitoring (Cloud)

- Error rate alerting on proxy failures > 1%
- Uptime monitoring with < 1 minute detection
- Structured logging for all server-side errors

---

## 8. Success Metrics & Analytics

### Primary KPIs

| KPI | Baseline | Target (Month 3) |
|---|---|---|
| Design partners | 0 | 3 |
| Paying customers | 0 | 1 |
| CLI installs | 0 | 100 |
| Failure stories collected | 0 | 5 |

### Secondary Metrics

| Metric | Purpose |
|---|---|
| Audit reports generated | Demand signal |
| Early access signups (vouqis.tech) | Top-of-funnel |
| GitHub stars | Developer awareness |
| Conversion: signup → discovery call | Engagement quality |
| Average failures detected per user per day | Product value proxy |

### Analytics Implementation

- CLI: PostHog anonymous UUID tracking (opt-out: remove `POSTHOG_API_KEY`)
- Events tracked: `proxy_start`, `audit_run`, `failure_detected`, `command_used`
- Never track: request/response content, upstream URLs, user emails, PII
- Marketing site: Vercel Analytics (page views, unique visitors)
- Early access signups: Resend notification to founder email

### Review Cadence

- Week 1: Outreach response rate and failure story quality
- Month 1: CLI install count and audit usage
- Month 3: Design partner activation and revenue pipeline

---

## 9. Implementation Plan

### Phase 0: Customer Discovery (Weeks 1–2)

**Goal:** Validate pain before building.

Tasks:
- 50 outreach messages to founding engineers and AI infra teams
- 10 discovery conversations
- 5 detailed failure story collection interviews
- Identify 3 potential design partners

Success gate: At least 3 engineers describe the exact failure chain (tool succeeded, outcome failed, user discovered first) before moving to Phase 1.

---

### Phase 1: CLI Hardening (Weeks 3–6)

**Goal:** Make the open-source CLI worth installing.

Scope:
- Proxy server (complete)
- Failure classification (null_result, schema_violation, timeout, parse_error)
- Audit logging (NDJSON, local)
- `vouqis logs` with filtering
- `vouqis audit <url>` with Trust Score output
- 100%+ test coverage on proxy logic
- npm publish `@vouqis/cli`

Success gate: 3 design partners install and run against a real MCP server.

---

### Phase 2: Design Partner Activation (Weeks 5–8)

**Goal:** Get 3 engineers actively using Vouqis in staging.

Tactics:
- White-glove onboarding for each design partner
- Weekly check-ins
- Collect failure reports from real production traffic
- Document failure signatures

Success gate: Each design partner has seen at least one real failure detected by Vouqis that they would have missed otherwise.

---

### Phase 3: Cloud Alpha (Weeks 9–16)

**Goal:** First paying customer.

Scope:
- Vouqis Cloud proxy (Vercel-hosted)
- Team accounts and workspace isolation
- Web dashboard: real-time failures, trust scores
- Failure alerts (email/Slack)
- Stripe billing: $49/month Starter

Success gate: 1 team paying $49+/month for cloud tier.

---

### Phase 4: Growth (Month 4+)

- Trust score trending and history
- Failure intelligence across anonymized fleet
- CI/CD integration (`vouqis audit` in GitHub Actions)
- Enterprise tier with private deployment and SLA

---

## 10. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Proxy adds unacceptable latency | Low | High | Benchmark at < 10ms; async logging; no blocking on audit write |
| MCP protocol evolves, breaking validator | Medium | Medium | Track Anthropic MCP spec; pin to tested versions; integration tests |
| SSE stream handling complexity | Medium | Medium | Passthrough SSE without buffering; test against real MCP servers |
| npm vulnerability in proxy path | Low | High | `npm audit` in CI; Dependabot alerts; `--audit-level=high` gate |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| No validated demand | Medium | Critical | Discovery before building; stop if 10 conversations yield no pain |
| Developers reject proxy model | Medium | High | Validate proxy vs. SDK vs. middleware preference in discovery |
| Anthropic/Cursor adds native MCP reliability | Low | High | Build reliability dataset and failure intelligence moat early; pivot to SDK if needed |
| Market too early (MCP not in production yet) | Low | High | Target teams already running MCP in staging/prod; avoid pure greenfield |
| Competition from LangSmith, Helicone | Low | Medium | MCP-native is the differentiator; they operate at LLM layer |

### Mitigation Summary

- **Discovery gate:** Do not write cloud code until 5 design partners confirmed
- **Distribution hedge:** Open-source CLI ensures reach regardless of sales motion
- **Moat:** Reliability dataset and failure signatures are defensible; start collecting Day 1
- **Pivot readiness:** SDK mode and CI integration are designed as alternative distribution channels if proxy adoption is slow

---

## Appendix A: Failure Taxonomy

| Classification | Description | Example |
|---|---|---|
| `null_result_propagation` | Result field is null despite HTTP 200 | `{"success": true, "result": null}` |
| `schema_violation` | Response does not match JSON-RPC 2.0 or tool schema | Missing `id` field, wrong type |
| `timeout` | Upstream did not respond within SLA | No response after 30s |
| `retry_masking` | Success logged after retry hides original failure | success×6 with upstream dedup |
| `parse_error` | Response is not valid JSON | Truncated body, HTML error page |
| `state_drift` | Concurrent agent state conflict detected | Stale read before write completes |

---

## Appendix B: Competitive Landscape

| Tool | Layer | MCP-native | Failure classification | Trust scoring |
|---|---|---|---|---|
| LangSmith | LLM / agent trace | ✗ | ✗ | ✗ |
| Helicone | LLM proxy | ✗ | ✗ | ✗ |
| Portkey | LLM gateway | ✗ | ✗ | ✗ |
| Langfuse | Observability | ✗ | ✗ | ✗ |
| OpenTelemetry | Infrastructure | ✗ | ✗ | ✗ |
| **Vouqis** | **MCP protocol** | **✓** | **✓** | **✓** |

No existing tool validates at the MCP protocol layer. This is the gap Vouqis owns.

---

## Appendix C: Value Ladder

| Tier | Price | Includes | Goal |
|---|---|---|---|
| MCP Reliability Report | Free | `vouqis audit <url>` — Trust Score + Failure Report | Demand generation |
| Design Partner Program | Free / Limited | Founder support, reliability analysis, early access | First users |
| Vouqis Cloud Starter | $49–$299/month | Runtime validation, failure classification, monitoring, dashboards | Recurring revenue |
| Reliability Intelligence | $199–$999/month | Historical trends, failure analytics, benchmarking, alerts | Retention |
| Enterprise Platform | $10K–$100K+/year | Private deployments, compliance, dedicated support, custom integrations | Large contracts |
