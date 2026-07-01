# Vouqis — 30-Day LinkedIn Campaign

**Author:** Sasisundar (Sundar), Founder — Vouqis  
**Audience:** Platform engineers, AI agent team leads, engineering managers deploying MCP servers in production  
**Goal:** Discovery calls and DMs from qualified platform engineers  
**Product truth:** Runtime reliability gateway. `vouqis proxy` + `vouqis logs`. No probes, no scores, no Exa data.

---

## Post Formatting Rules

- Hook: under 3 lines, no hedging, no questions, no emojis, never starts with "I"
- Data: only verified implementation facts
- CTA: one specific action per post
- Length: 150–300 words
- Bullets: → arrow character
- Pattern interrupt: one short standalone sentence mid-post
- After each post: 2 alternative hooks + 1 visual direction note

---

## Week 1 — The Problem (Posts 1–7)

---

### Post 1 — Tools Return Success. Things Still Fail.

Tools return success. Things still fail.
That gap is where MCP runtime failures live.

The AI agent calls a tool. The MCP server responds. The agent moves on.

But the response was missing the `content` field. Or the JSON-RPC envelope omitted the `id`. Or the `method` field was empty. The agent never knew. It trusted the response.

**The MCP specification defines the protocol. Whether requests and responses are validated before reaching the server depends on the implementation.**

Upstream monitoring tells you the server is up. Model evals tell you the prompt is good. Neither tells you whether the tool response that passed through was protocol-compliant.

This is the problem Vouqis addresses at runtime — by sitting between the agent and the MCP server and validating every request and response before either side sees it.

When validation fails, the gateway blocks and logs a structured event with the reason, the method, the tool name, and the latency. The agent receives a clean JSON-RPC error instead of a broken response it might silently mishandle.

→ Decision: `block`
→ Reason: `tools/call content is empty or not an array`
→ Latency: 34ms
→ Attempt: 1

If your team deploys MCP servers internally, I'd like to understand how you currently validate tool responses at runtime. DM me or comment **GATEWAY**.

---

**Alternative hooks:**
A: "200 OK arrived. The tool call still failed. Nobody noticed."
B: "The MCP server responded. The response was invalid. The agent trusted it anyway."

**Visual direction:** Terminal showing a single BLOCK event — red ✗, method `tools/call`, reason truncated but visible, latency in ms. Dark background. Nothing annotated.

---

### Post 2 — JSON-RPC 2.0 Has Four Required Fields. Most Clients Verify Zero.

JSON-RPC 2.0 defines three core request fields: jsonrpc, method, and id.
Whether your stack validates them depends on the implementation.

Every MCP request is a JSON-RPC 2.0 message. The spec is not ambiguous.

`jsonrpc` must be the string `"2.0"`. `method` must be a string — Vouqis also rejects empty strings as a gateway policy. `id` must be a string, number, or null — not an object. Notifications omit `id` entirely.

These are not edge cases. They are the baseline.

**Many deployments rely on the MCP server itself to reject malformed requests. Vouqis performs this validation before forwarding traffic.**

When a malformed request reaches your MCP server, the server's behavior varies by implementation. Some servers handle it gracefully. Some return opaque errors. The agent receives an unexpected response with no structured reason why.

Vouqis validates every incoming request against these rules before forwarding it upstream. If `jsonrpc` is missing or wrong, the request is blocked with error code `-32600` and a specific reason. If `method` is empty, same result. If `id` is an object, blocked.

The upstream never sees the malformed request. The agent receives a structured JSON-RPC error it can parse and act on.

→ `jsonrpc === "2.0"` — enforced
→ `method` is non-empty string — enforced
→ `id` is string, number, or null — enforced

If you run MCP servers in production, how do you currently handle malformed requests? Comment **VALIDATE** and I'll show you what the event output looks like.

---

**Alternative hooks:**
A: "A missing field in a JSON-RPC envelope. Your server never knew what hit it."
B: "JSON-RPC 2.0 is a spec. Not a suggestion. Whether your gateway enforces it is a different question."

**Visual direction:** Split terminal — left shows a raw malformed request (missing `jsonrpc` field), right shows the Vouqis BLOCK output with reason. Monospace, dark background.

---

### Post 3 — A Proxy Passes Traffic. A Gateway Makes Decisions.

A proxy passes traffic.
A gateway makes decisions.

When a request arrives at Vouqis, it produces one of four outcomes.

`allow` — the request and response are valid. Traffic passes through. An audit event is logged.

`block` — validation failed. The upstream never sees the request. The agent receives a structured JSON-RPC error with a specific reason code and message.

`retry` — the upstream timed out on an idempotent method. Vouqis retries automatically, once, after 300ms. Only for `tools/list`, `tools/call`, `initialize`, and `ping`.

`rewrite` — the response was structurally invalid in a fixable way. Vouqis normalizes it and passes it through. The audit log records what was changed and why.

**Every decision is logged. Every log entry is structured. Nothing is silent.**

This is the design goal behind Vouqis. A proxy moves bytes. A gateway evaluates every message against protocol rules and produces an operational record.

That record — structured NDJSON, one event per line — is what you use to understand what your MCP infrastructure is actually doing in production.

→ `allow` — green ✓ in the audit log
→ `block` — red ✗ with reason
→ `retry` — yellow ↺ with attempt count
→ `rewrite` — yellow ~ with normalization details

If you're running MCP agents in production, how many of these four decisions does your current stack surface? Comment **FOUR** and I'll share what our audit log looks like after a real session.

---

**Alternative hooks:**
A: "Four outcomes. Every MCP request gets one. Without a gateway in the path, there is no structured per-request record."
B: "Allow. Block. Retry. Rewrite. These are the decisions a reliability gateway makes."

**Visual direction:** Four rows in a terminal, one per decision type, each with colored badge, method name, latency, and reason. No annotations or callout boxes.

---

### Post 4 — Block Doesn't Mean the Request Failed. It Means the Agent Got a Clean Error.

Block does not mean the request failed.
It means the agent received a clean error instead of a broken response.

When Vouqis blocks a request, the agent does not receive silence. It does not receive an HTML error page. It does not receive a malformed JSON object it has to guess about.

It receives a JSON-RPC error response: `{"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"Gateway: request body is not a JSON object"}}`.

That message is parseable. It is structured. It carries a specific error code. The agent can handle it deterministically.

**Missing protocol validation increases the chance that malformed traffic propagates further into the system before it's detected.**

The upstream MCP server never sees the blocked request. It doesn't have to handle a malformed envelope or produce an error of its own. The gateway absorbs the invalid traffic.

Block reasons map to specific JSON-RPC error codes:

→ `-32700` — parse error (invalid JSON, empty body)
→ `-32600` — invalid request (schema violation, missing method)
→ `-32000` — server error (rate limit exceeded, upstream timeout)
→ `-32603` — internal error (unexpected exception)

Every block is logged with the reason, the method, the latency in milliseconds, and the attempt number.

If you're building MCP infrastructure, how does your stack communicate validation failures back to the agent today? Comment **BLOCK** or DM me.

---

**Alternative hooks:**
A: "Your agent deserves a structured error, not silence. That's what blocking means."
B: "The request was invalid. The agent got a parseable JSON-RPC error. The upstream saw nothing."

**Visual direction:** Terminal showing a BLOCK event with the full reason string and error code visible. Red badge. Clean and minimal.

---

### Post 5 — Three Failures Before the Method Name Is Even Read

Empty body. Invalid JSON. Non-object payload.
Three failure modes before the method name is even read.

Before Vouqis reads `method` or `id` from a request, it checks three things that have nothing to do with MCP semantics.

First: is there a body? An empty POST to an MCP server is not defined by the protocol. Vouqis blocks it with error code `-32700`.

Second: is the body valid JSON? Non-JSON payloads — corrupted bytes, partial writes, wrong content-type — are blocked at parse time.

Third: is the parsed value an object? JSON allows `null`, arrays, strings, and numbers as top-level values. A JSON-RPC envelope is none of those. Vouqis blocks anything that isn't an object before touching a single field.

**These checks exist because the MCP transport layer gives you no guarantees about what arrives.**

Client bugs happen. Misconfigured proxies send wrong content types. The gateway's job is to enforce a known-good contract before the upstream has to.

Only after these three checks pass does Vouqis validate `jsonrpc`, `method`, and `id`. Only after all six checks pass does the request reach the upstream.

If you'd like to see what this looks like in a real audit log, DM me and I'll share a structured block event from an actual test run.

---

**Alternative hooks:**
A: "The method field matters. So do the three things checked before it."
B: "MCP validation typically starts at the method name. Vouqis starts three steps earlier."

**Visual direction:** Six-step vertical checklist in terminal style — each item either marked PASS or BLOCK with a reason. Monospace. Clean.

---

### Post 6 — The Upstream Didn't Respond in 5 Seconds. The Agent Is Still Waiting.

The upstream didn't respond in 5 seconds.
The agent is still waiting.

Timeouts are the most common MCP runtime failure that doesn't produce a structured error.

The upstream is slow. The agent blocks. After some undefined period, the connection drops or the framework surfaces an exception without structured context. Nothing tells the agent: "this tool call timed out, here is the duration, here is the attempt count, here is a JSON-RPC error you can parse."

Vouqis enforces a configurable timeout on every upstream request. Default is 5000ms. When a request times out, the gateway does three things.

First: it checks whether the method is in Vouqis's retry list. `tools/list`, `tools/call`, `initialize`, and `ping` are retryable by gateway policy. Other methods are not.

Second: if the method is retryable, it retries once after 300ms. The retry is logged as a separate audit event with the attempt number.

Third: if the retry also times out, the agent receives: `Gateway: upstream timed out after 5000ms (1 attempt(s))`.

**A timeout is not a mystery. It is a measurable event with a duration.**

→ `--timeout 5000` — configurable per deployment
→ `--retry 1` — max retry attempts on idempotent methods

What does your current MCP stack give the agent when the upstream times out? Curious whether your experience matches this.

---

**Alternative hooks:**
A: "5 seconds elapsed. The upstream returned nothing. The agent received a structured error."
B: "Timeout is a failure mode. It should produce a structured event, not silence."

**Visual direction:** Terminal showing a RETRY event (yellow ↺) followed by a BLOCK event (red ✗) with the timeout reason. Two rows. Latency visible on both.

---

### Post 7 — The Server Returned 200 OK. The JSON Inside Was Not a Valid JSON-RPC Response.

The server returned 200 OK.
The JSON inside was not a valid JSON-RPC response.

HTTP status codes describe the transport layer. They say nothing about the protocol layer.

A server can return 200 OK with a JSON body that has no `result` field. Or with an HTML error page because a CDN intercepted the request. Or with a `tools/call` response where `content` is an empty array.

None of these are caught by HTTP-level monitoring.

**Uptime is not the same as reliability.**

Vouqis validates the JSON-RPC response body after the HTTP status check. If the upstream returns a non-JSON body at any status code, Vouqis wraps it in a structured JSON-RPC error and logs the upstream status code and content type. The agent receives something it can parse.

If the upstream returns 200 OK with a `tools/call` response that has an empty `content` array, Vouqis blocks it by default. This is a configurable policy — use `--no-block-null` to allow empty results through.

→ Non-JSON upstream response: blocked, reason includes HTTP status and content-type
→ Empty `content` array: blocked (configurable via `--no-block-null`)
→ Valid response: allowed, logged, passed through

This is protocol validation on the actual JSON-RPC payload. Not HTTP monitoring. Not model evals.

DM me if you want to see how this surfaces in the audit log.

---

**Alternative hooks:**
A: "200 OK. Non-JSON body. The agent received an HTML error page."
B: "HTTP monitoring and MCP reliability are not the same measurement."

**Visual direction:** Terminal showing a BLOCK event where the reason reads `upstream returned non-JSON response (200 application/json)` — the irony of 200 OK causing a block is the point.

---

## Week 2 — The Gateway (Posts 8–14)

---

### Post 8 — Every MCP Request Produces a Structured Record

Every MCP request produces a structured record.
Not after an incident. At the time of the request.

When Vouqis processes an MCP request, it writes a structured NDJSON event to the audit log regardless of the decision.

The event contains:

→ `timestamp` — ISO 8601, precise to millisecond
→ `server_id` — upstream hostname only
→ `method` — the JSON-RPC method
→ `tool` — the tool name, for `tools/call` requests
→ `requestId` — the `id` from the JSON-RPC envelope
→ `decision` — `allow`, `block`, `retry`, or `rewrite`
→ `latency_ms` — total time from request receipt to response
→ `reason` — populated for all non-allow decisions
→ `attempt` — which attempt produced the outcome

**One line per event. One event per decision. Nothing is batched or summarized.**

This is designed to be the record you reach for during incident investigation. When a tool call fails, the audit log tells you: what method was called, what tool was invoked, what decision was made, why, and how long it took.

You don't have to reconstruct this from model logs or infer it from user reports. The gateway captures it at the moment it happens.

That log persists to `./vouqis-audit.log` by default. You can point it anywhere.

Here is what a block event looks like:

```
{"timestamp":"2026-07-01T05:44:22.341Z","server_id":"api.github.com","method":"tools/call","tool":"search_repositories","requestId":42,"decision":"block","latency_ms":87,"reason":"tools/call result is null","attempt":1}
```

One line. Every field. Machine-readable. Ingestible by any log aggregator.

Comment **AUDIT** if you want to see what a full session produces.

---

**Alternative hooks:**
A: "One structured event per MCP request. Logged at the moment of decision."
B: "The audit log is not a debugging tool. It is the operational record your team reaches for during incidents."

**Visual direction:** Raw NDJSON event line, monospace, showing all fields — decision in emphasis, reason visible, latency included. No decorative framing.

---

### Post 9 — vouqis logs. 24 Hours of MCP Traffic in a Structured Summary.

`vouqis logs`.
24 hours of MCP traffic in a structured summary.

After running the gateway against a real MCP server, `vouqis logs` produces a summary of every decision in the audit log.

The summary includes:

→ Total events processed
→ Allowed — requests that passed validation and reached the upstream
→ Blocked — requests or responses that failed validation
→ Retried — upstream timeouts that triggered the retry path
→ Rewritten — responses that were normalized before passing through
→ Latency P50 — median round-trip time from the gateway's perspective
→ Latency P95 — tail latency at the 95th percentile
→ Top methods — which JSON-RPC methods were called most
→ Top block reasons — which specific validation failures occurred most often

**The block reason breakdown is where the operational intelligence lives.**

"Our MCP infrastructure has reliability problems" is a vague complaint. "`tools/call content is empty or not an array` with an occurrence count" is an engineering ticket.

That is the difference between `vouqis logs` and a generic error rate dashboard.

`vouqis logs --summary` prints stats only. `vouqis logs --tail 50` shows the last 50 events. `vouqis logs --file ./path/to/log` reads from a specific file.

Comment **LOGS** if you want to see what this output looks like after a real session.

---

**Alternative hooks:**
A: "P50: 87ms. P95: 412ms. Blocked: 3. Two distinct failure modes. That's a 24-hour MCP summary."
B: "The logs command doesn't show you error rates. It shows you named failure modes."

**Visual direction:** `vouqis logs` output screenshot — the full summary block with all stats, then the top block reasons section showing 3–4 named reasons with counts. Real terminal output. Nothing staged.

---

### Post 10 — Latency P50 at the MCP Layer Is Not the Same as Latency P50 at the HTTP Layer

Latency P50 at the MCP layer is not the same as latency P50 at the HTTP layer.
The difference is the protocol overhead nobody measures.

AI agent observability tools typically measure latency from the model's perspective: time to first token, total completion time, tool call duration as reported by the framework. None of these measure what happens at the MCP transport layer specifically.

Vouqis measures the time from when the JSON-RPC request arrives at the gateway to when a validated response is dispatched — for every request — and records it in milliseconds in the audit event.

**Latency is not abstract. It is a number per request, timestamped, attached to a specific tool and method.**

After enough traffic, `vouqis logs` produces P50 and P95 from those numbers. If your P95 is 800ms and your P50 is 90ms, that is not uniform slowness. Most requests are fast; a fraction are significantly slower. Those slow requests are worth investigating as individual audit events.

The latency in the Vouqis audit log reflects gateway-side measurement: request receipt to response dispatch. It includes upstream round-trip time and any retry delay.

That measurement, attached to a specific method and tool name, is more operationally useful than an aggregate latency metric with no context.

→ `latency_ms` — per-event, in every audit record
→ `attempt` — retry attempts reflected in the total latency

If you're measuring MCP latency in a different layer, I'd like to compare notes.

---

**Alternative hooks:**
A: "P95 latency on tools/call: 812ms. P50: 93ms. Those two numbers tell different stories."
B: "Aggregate latency hides the failure mode. Per-request latency with method and tool context doesn't."

**Visual direction:** `vouqis logs` output focused on the latency section only. P50 and P95 clearly visible. Could show two runs — before and after a fix — demonstrating measurement value.

---

### Post 11 — The Response Was Structurally Invalid. Vouqis Fixed It Before the Agent Saw It.

The response was structurally invalid.
Vouqis fixed it before the agent saw it.

Not every MCP response failure warrants a block. Some failures are fixable.

The MCP spec requires that `tools/call` response content items include a `type` field. Some MCP server implementations omit it. The content is there. The tool produced a result. The result is just not technically spec-compliant.

When Vouqis detects a content item missing the `type` field, it adds `"type": "text"` and passes the normalized response through. The agent receives a compliant response. The fix is logged as a `rewrite` event.

**A rewrite is not silence. It is a logged, traceable normalization.**

The audit event for a rewrite includes the same fields as any other decision: method, tool, latency, reason, and attempt count. Nothing is invisible.

This policy is configurable. If you want Vouqis to pass responses through without normalization, `--no-sanitize` disables the rewrite behavior. If you want strict behavior, the default block-null policy catches empty content arrays before they reach the agent.

The default is: fix and log. Because a normalized response with a logged reason is more useful than a blocked request when the underlying data is valid.

→ `rewrite` decision — yellow ~ in the audit log
→ `--no-sanitize` — disables normalization
→ Reason logged: `content item(s) missing type field — normalised`

If your team has encountered this specific failure mode, I'd like to hear how you handled it.

---

**Alternative hooks:**
A: "Content item missing type field. Vouqis added it. The agent received a spec-compliant response."
B: "Fix and log, or block and log. Both are better than pass and hope."

**Visual direction:** Terminal showing a REWRITE event (yellow ~) with the reason `content item(s) missing type field — normalised`. Then the audit event fields below it. Two sections. Clean.

---

### Post 12 — The Tool Call Succeeded. The Result Was Null.

The tool call succeeded. The result was null.
The agent built on that assumption.

`tools/call` is the highest-stakes method in MCP. When an agent calls a tool, it expects a result it can use.

A null result — `result: null` in the JSON-RPC response — is not an error. The server returns 200 OK. The JSON-RPC envelope is valid. Everything upstream says this was a success.

But the agent now has a null it has to handle. An agent receiving a null result may proceed on an assumption, or fail in a way that's difficult to trace back to the tool response.

**By default, Vouqis treats a null tool result as a policy violation — downstream agents may not distinguish it from a successful response.**

Vouqis has a configurable policy for null results on `tools/call`. When `block_null_result` is enabled (the default), a response with `result: null` or an empty `content` array is blocked. The agent receives a structured JSON-RPC error instead of a null it might silently mishandle.

When `block_null_result` is disabled via `--no-block-null`, null results pass through. Use this when your MCP server legitimately returns null as a valid empty response.

The point is that the behavior is a decision, not an accident. You configure it. You know what happens. You have a log entry either way.

→ Default: block null results on `tools/call`
→ `--no-block-null` to allow them through
→ Logged either way with the decision recorded

Comment **NULL** if this failure mode has appeared in your production agent stack.

---

**Alternative hooks:**
A: "tools/call returned null. The agent moved on. The failure arrived three steps later."
B: "Null is not an error code. It is a gap the agent has to fill. Vouqis makes that a configurable policy."

**Visual direction:** Terminal BLOCK event — reason: `tools/call result is null or missing`. Red ✗. Clean.

---

### Post 13 — Rate Limiting Belongs at the Gateway

Rate limiting belongs at the gateway.
Not in the agent. Not in the MCP server.

When an AI agent runs into a rate-limited MCP server, the failure mode is usually uncontrolled. The server returns an error. The agent retries immediately. The retries hit the rate limit again. The cascade produces noise that is hard to distinguish from a real failure.

Rate limiting at the gateway layer intercepts this before it starts.

Vouqis implements a token bucket rate limiter configured per upstream. When requests arrive faster than the configured rate, the gateway blocks them with error code `-32000` and a specific message: `Gateway: rate limit exceeded (N req/s)`. The upstream never sees the excess requests.

**The gateway absorbs the load. The upstream operates within its limits. The agent receives structured errors, not timeouts.**

Configuration is a single flag: `--rate-limit N` where N is maximum requests per second. No SDK changes on the MCP server. No changes to the agent. One flag on the gateway.

The rate limit is enforced at the gateway process level. If you run multiple agents pointing at the same Vouqis instance, the limit applies to combined traffic across all of them.

→ `--rate-limit 10` — 10 requests per second maximum
→ Excess requests: blocked with structured error
→ Logged with reason and latency

Comment **RATELIMIT** if your MCP server has been hit by agent retry storms.

---

**Alternative hooks:**
A: "The agent retried 40 times in 2 seconds. The gateway allowed 20. The server saw none of the excess."
B: "Token bucket at the gateway. One flag. No SDK changes. No upstream modifications."

**Visual direction:** Terminal showing a rapid sequence of BLOCK events with reason `rate limit exceeded (10 req/s)`. Timestamps close together. Latency near-zero because they're stopped before upstream.

---

### Post 14 — Retry on Timeout. Idempotent Methods Only.

Vouqis retries on timeout.
Only for methods where retrying is safe.

Automatic retry is a common mitigation for upstream timeouts. But not all retries are safe.

If `tools/call` invokes a tool that sends an email or writes to a database, retrying on timeout means the operation might happen twice. That is not a reliability improvement. That is a silent duplication.

Vouqis retries on timeout only for methods in its default retry list:

→ `tools/list` — retryable by gateway policy
→ `tools/call` — retryable by gateway policy
→ `initialize` — retryable by gateway policy
→ `ping` — retryable by gateway policy

For any other method, a timeout produces a single structured error and stops. No retry.

**The retry policy is a gateway-level decision, not a network-level heuristic.**

When a retry occurs, Vouqis logs a `retry` event before the next attempt. The final outcome is logged with the attempt count. You can see in the audit log exactly how many attempts each request took and why.

Default: 1 retry, 300ms delay. Configurable via `--retry N`.

→ `--retry 1` — one retry on timeout (default)
→ `--timeout 5000` — timeout per attempt in ms
→ Retry logged separately from final decision

If retry behavior on MCP timeouts has caused problems in your stack, I'd like to hear what happened.

---

**Alternative hooks:**
A: "One retry. 300ms delay. Idempotent methods only. Everything else fails fast."
B: "The retry policy is a protocol decision. Not a network heuristic. There is a difference."

**Visual direction:** Two-row terminal sequence: RETRY (yellow ↺, attempt 1, reason: `timeout on attempt 1 — retrying in 300ms`) followed by ALLOW (green ✓, attempt 2). Timestamps and latencies visible on both rows.

---

## Week 3 — The Output (Posts 15–21)

---

### Post 15 — The Block Reason Is Not a Log Entry. It Is a Named Failure Mode.

The block reason is not a log entry.
It is a named failure mode.

Generic observability tools produce error rates. Percentage of failed requests. Count of 5xx responses. Aggregate timeout numbers. These tell you something is wrong. They don't tell you what.

When Vouqis blocks a request or response, it records the specific reason in the audit event as a human-readable string. Not an error code. Not a status number. A reason.

`tools/call content is empty or not an array`

`request body is not valid JSON`

`upstream timed out after 5000ms (2 attempt(s))`

`jsonrpc must be "2.0" — got undefined`

**Each of those is a different problem. They require different fixes.**

`vouqis logs` aggregates these reasons and shows you the top failure modes by frequency. The most common block reason in your deployment is not a generic reliability number. It is the specific protocol behavior your MCP server exhibits most often under real traffic.

When you fix the underlying issue — add the missing `content` field, fix the `jsonrpc` version string, increase the upstream timeout — the block reason disappears from the logs. You have a specific, verifiable signal that the fix worked.

Comment **REASONS** and I'll share what a real block reason breakdown looks like after a test session.

---

**Alternative hooks:**
A: "Error rates tell you how much is broken. Block reasons tell you what is broken."
B: "`jsonrpc must be "2.0" — got undefined`. That is a named problem with a named fix."

**Visual direction:** `vouqis logs` output showing the "Top block reasons" section only — four distinct reasons with counts. Each reason is distinct and specific enough to imply a different fix.

---

### Post 16 — MCP Uses Server-Sent Events for Streaming. The Gateway Handles Them.

MCP uses Server-Sent Events for streaming.
The gateway handles them without buffering.

The MCP Streamable HTTP transport opens a GET connection to the server before sending any JSON-RPC POST requests. The server responds with `text/event-stream` and keeps the connection open.

Vouqis passes SSE streams through without buffering. When the upstream responds with `text/event-stream`, the gateway pipes the response directly to the client as chunks arrive. No latency added by accumulation.

The same applies to SSE responses from POST requests. If a `tools/call` produces a streaming response, Vouqis detects the content type and switches to streaming passthrough mode automatically.

**The gateway does not assume your MCP traffic is request-response. It handles both.**

For streaming paths, the gateway still applies security headers and forwards upstream response headers correctly. CORS preflight is handled separately via OPTIONS. `Cache-Control` is set to `no-cache` on streaming paths rather than `no-store`, because streaming requires it.

This is not a feature. It is required for any gateway implementing MCP Streamable HTTP — buffering SSE responses breaks streaming clients.

→ GET requests: SSE passthrough
→ POST with `text/event-stream` response: streaming passthrough
→ Security headers applied on all paths

If your MCP deployment uses streaming and you've had issues with proxies buffering, I'd like to hear how it surfaced.

---

**Alternative hooks:**
A: "The upstream returned text/event-stream. Vouqis piped it. Nothing was buffered."
B: "SSE passthrough is not optional for MCP gateways. It is a protocol requirement."

**Visual direction:** Vouqis startup banner showing a live session — upstream URL, listen address, a stream of events arriving. Real terminal output from an actual run.

---

### Post 17 — Observability Tools Show You What Happened. A Reliability Gateway Acts on What's Happening.

Observability tools show you what happened.
A reliability gateway acts on what's happening.

Tracing tools, log aggregators, and APM platforms are retrospective. They record what occurred. They surface it after the fact. That is valuable. It is not sufficient for MCP reliability.

When a malformed JSON-RPC request reaches your MCP server, a trace tells you it happened. It does not stop the server from processing it. It does not give the agent a structured error it can handle. It does not normalize the response before it reaches downstream components.

**An observability tool is a record. A gateway is an enforcement layer.**

Vouqis operates in the request path. Every validation rule executes before the upstream sees the request or before the agent sees the response. A block does not appear in a dashboard hours later. It happens at the millisecond the invalid request arrives.

The audit log Vouqis produces can feed into your existing observability stack. It is NDJSON — one structured event per line — which most log aggregators ingest directly. The two are not in competition.

The distinction is: observability shows you your MCP reliability after the fact. A gateway enforces it in real time.

If your team is evaluating infrastructure for production MCP deployments and wants to understand where a gateway fits relative to your current observability stack, comment **INFRA** or DM me directly.

---

**Alternative hooks:**
A: "Tracing tells you the request failed. The gateway stopped it from failing downstream."
B: "Retrospective and real-time are not the same. A gateway is real-time."

**Visual direction:** Two-column monospace text — LEFT: "Observability: records decisions after" / RIGHT: "Gateway: makes decisions during". Minimal. No image needed.

---

### Post 18 — One URL Change in Your Agent Config. Nothing Changes on the MCP Server.

One URL change in your agent config.
Nothing changes on the MCP server.

Deploying Vouqis does not require changes to the MCP server. It does not require an SDK integration. It does not require touching the agent's core logic.

The deployment pattern is:

→ Run `vouqis proxy --upstream https://your-mcp-server.example.com`
→ Gateway starts on `http://127.0.0.1:4444` by default
→ Point your agent at `http://127.0.0.1:4444` instead of the real server
→ Traffic flows: agent → Vouqis → MCP server → Vouqis → agent

Every request and response passes through the gateway. Validation, rate limiting, retry, and audit logging happen transparently.

**The MCP server does not know a gateway is in the path. The agent does not need to know either.**

The gateway presents itself as an MCP endpoint. It speaks JSON-RPC. Agents that speak MCP talk to Vouqis exactly as they would to any MCP server.

This is what outside-in validation means. The gateway evaluates traffic without requiring any cooperation from either side. No SDK. No instrumentation. No changes to production code.

→ Default listen: `127.0.0.1:4444`
→ Custom listen: `--listen 127.0.0.1:8787`
→ Config file: `--config vouqis.yml`

DM me **DEPLOY** if you want to walk through what this looks like in your specific agent architecture.

---

**Alternative hooks:**
A: "One command. One URL change. No changes to the MCP server. No SDK installation."
B: "The agent points at the gateway. The gateway points at the server. Nothing else changes."

**Visual direction:** Architecture diagram in monospace text — Agent → Vouqis (4444) → MCP Server — with the one-line startup command below it. No decorative elements.

---

### Post 19 — vouqis proxy --upstream. That Is the Entire Setup.

`vouqis proxy --upstream https://your-mcp-server.example.com`
That is the entire setup.

There is no configuration file required for the first run. No API key. No account creation. No SDK. No environment variables.

One command. One argument. The gateway starts.

The startup output shows every configuration Vouqis applied:

→ Listening address
→ Upstream URL
→ Timeout in ms
→ Retry count
→ Rate limit (if configured)
→ Block null policy
→ Schema sanitization policy
→ Audit log path

Every decision from that point is logged to stderr in real time and written to `./vouqis-audit.log` as structured NDJSON.

**The simplest path to a running MCP gateway is a single terminal command.**

When you need more configuration — timeout, retry, rate limit, log path, and policy flags are all available from day one — you can add flags or point to a `vouqis.yml` config file.

Flags available:
→ `--upstream` / `-u` — target MCP server URL
→ `--listen` / `-l` — local bind address (default `127.0.0.1:4444`)
→ `--timeout` / `-t` — upstream timeout in ms (default 5000)
→ `--retry` — max retries on idempotent timeout (default 1)
→ `--rate-limit` — max requests per second
→ `--log-file` — audit log path (default `./vouqis-audit.log`)

DM me or comment **START** and I'll help you run it against your MCP server.

---

**Alternative hooks:**
A: "No account. No SDK. No environment variables. One command and the gateway is running."
B: "The barrier to running a production MCP gateway should not be a three-day integration project."

**Visual direction:** The Vouqis startup banner exactly as it appears in the terminal — upstream URL, listen address, all config values printed cleanly. Real screenshot from an actual run. Nothing staged.

---

### Post 20 — The MCP Spec Says Content Items Need a Type Field. Not Every Server Knows That.

The MCP spec says content items need a type field.
Not every server knows that.

The MCP specification defines a content item as an object with a required `type` field. Values like `"text"`, `"image"`, and `"resource"` are valid. An item without a `type` field is not spec-compliant.

In practice, implementations that omit the `type` field return content items with valid data but without a required property.

Vouqis normalizes this by default. When it detects content items missing the `type` field, it adds `"type": "text"` before passing the response through. The audit log records a `rewrite` event with the reason `content item(s) missing type field — normalised`.

**Schema normalization is not a workaround. It is a policy decision with a logged record.**

With `--no-sanitize` enabled, the response passes through unchanged. You can also combine this with the null-block policy to catch empty content arrays before they reach the agent.

Every rewrite is traceable. The audit event tells you which tool call produced the non-compliant response, the latency, and the exact normalization applied. Rewrites appear in `vouqis logs` under the `Rewritten` count and in the event list.

The long-term action is to fix the MCP server. The gateway gives you operational visibility while you do.

If your MCP server has produced non-compliant content items, I'd like to hear whether it was caught at the server or the consumer.

---

**Alternative hooks:**
A: "Content item missing type field. Vouqis added it. The server still needs to fix it."
B: "Schema normalization is a policy. The gateway makes it explicit. The log makes it traceable."

**Visual direction:** Two JSON blobs side by side — before (missing `type`) and after (with `"type": "text"` injected). Monospace. No decorative boxes.

---

### Post 21 — Model Evals Measure What the LLM Does. Not What the Tools It Calls Do.

Model evals measure what the LLM does.
They do not measure what the tools it calls do.

Current AI agent reliability tooling — benchmark scores, eval frameworks, output quality assessments — operates at the model layer. These tools measure whether the LLM produces correct responses to well-formed inputs.

They do not measure whether the tools the LLM invokes return valid, protocol-compliant results.

A model can score well on every eval and still call a tool that returns a null result. Or a tool that returns a response missing the required `content` field. Or a tool that times out silently and the model proceeds on an assumption rather than actual data.

**The eval harness does not run your MCP traffic. The gateway does.**

Vouqis validates every `tools/call` response at runtime — not in a test environment, not against a synthetic fixture, but against the actual response your MCP server returns under real agent traffic.

That is the layer model evals do not reach.

The structured audit log from real traffic is the closest thing to a ground-truth record of whether your tool infrastructure is producing valid, trustworthy results. Not whether the model handled them well. Whether the results themselves were protocol-compliant.

This is not a replacement for model evals. It is the layer below them — the protocol layer — that evals assume is already working correctly.

Comment **EVAL** if your team has discovered tool reliability gaps that your eval framework didn't catch.

---

**Alternative hooks:**
A: "The model passed the eval. The tool call it made returned null. Neither caught the other."
B: "Eval frameworks measure the LLM. Vouqis measures the infrastructure the LLM depends on."

**Visual direction:** Simple three-layer monospace text diagram — "Model Eval: measures this → [Model]" and "Vouqis: measures this → [MCP Transport]". Minimal. No images needed.

---

## Week 4 — Positioning and ICP (Posts 22–28)

---

### Post 22 — After a Week of Running Vouqis, You Have a Named List of Failure Modes

After a week of running Vouqis, you have a named list of MCP failure modes.
Not a vague reliability complaint.

In the first week of running Vouqis against a real MCP server, the audit log accumulates a record of every decision the gateway made.

`vouqis logs --summary` at the end of the week produces:

→ Total requests processed
→ How many were allowed, blocked, retried, and rewritten
→ Which methods were called most frequently
→ Which block reasons appeared most often — sorted by frequency

That last item is the actionable output.

**"Our MCP infrastructure has reliability problems" is a vague complaint. "tools/call content is empty or not an array appeared 17 times across 340 requests" is an engineering ticket.**

After one week, you know:
→ Which tools time out most frequently under real traffic
→ Whether your upstream is returning spec-compliant responses
→ What your P95 latency looks like at the MCP transport layer
→ Whether your agent is sending malformed requests to the server

None of this requires instrumenting the MCP server. None of it requires changes to the agent. It comes from seven days of traffic through a gateway that validates and logs every message.

If you want to run this against your MCP server for a week and discuss what the results show, DM me **WEEK**.

---

**Alternative hooks:**
A: "Seven days of audit logs. A named list of MCP failure modes. That's the output."
B: "One week of gateway logs turns a vague reliability problem into a list of engineering tickets."

**Visual direction:** `vouqis logs --summary` output from a hypothetical week — stats block visible, top block reasons section showing 3–4 named failure modes with counts. Real terminal output style.

---

### Post 23 — Unbounded Request Bodies Are an Attack Surface

Unbounded request bodies are an attack surface.
They are also a symptom of a broken agent.

MCP requests are JSON-RPC messages. They should be small. A request containing an entire document, a large binary payload, or thousands of tokens in the params field is a signal that something in the agent-to-tool pipeline is not scoped correctly.

Vouqis enforces a configurable maximum request body size. Requests that exceed the limit are blocked before the body is fully parsed. The block reason includes the configured limit and the actual size received.

**A malformed agent sending a 10MB tool call to your MCP server is a problem you want to catch at the gateway, not at the upstream.**

This is infrastructure hygiene. An agent with a context leak or a bug in its tool parameter construction can produce requests orders of magnitude larger than intended. Without a configured size limit at the gateway, the upstream handles them — or fails trying — with no structured record of what arrived.

The gateway catches it. Logs it. Blocks it. Sends a structured error.

Even without a configured size limit, empty bodies and non-JSON bodies are always blocked at parse time. The size check is an additional configurable layer on top of that baseline.

→ Size limit configurable via `vouqis.yml`
→ Block reason includes limit and actual received size
→ Logged with latency and method

If your team has seen unexpectedly large payloads in MCP traffic, curious what produced them.

---

**Alternative hooks:**
A: "A 10MB JSON-RPC request reached your MCP server. The gateway should have seen it first."
B: "Request size limits are not a performance optimization. They are an integrity boundary."

**Visual direction:** Terminal BLOCK event — reason: `request body exceeds 512 KB limit (got 2847.3 KB)`. The mismatch in numbers is the point. Red ✗. Clean.

---

### Post 24 — When the Incident Call Happens, the Audit Log Is Already Written

When the incident call happens, the audit log is already written.

Most MCP reliability incidents are reconstructed after the fact. Engineers pull logs from multiple systems, correlate timestamps, and try to assemble a sequence of events from fragments.

The Vouqis audit log is not a fragment. It is a complete, structured, per-decision record of every MCP request and response that passed through the gateway during the incident window.

During an incident review, `vouqis logs --tail 100` shows the last 100 events with timestamps, decisions, methods, tool names, latencies, and block reasons. Each line is a structured event that can be inspected individually.

**The audit log is an incident timeline, not a debugging hint.**

If the incident happened at 14:23 UTC, the log contains every decision the gateway made in the minutes before and after — timestamped to the millisecond. If the upstream started timing out at 14:21, the `retry` events show exactly when and how often. If responses started returning empty content at 14:22, the `block` events show the exact reason.

That is what turns an incident investigation from reconstruction into reading.

NDJSON format means every log aggregator — Datadog, Loki, Splunk, anything — can ingest it directly. The gateway writes to a file. You decide where that file goes.

DM me **INCIDENT** if you want to discuss how this fits into your incident response process.

---

**Alternative hooks:**
A: "The audit log is not for debugging. It is the incident timeline, written in real time."
B: "Per-decision structured records. Millisecond timestamps. One line per event. That is your incident log."

**Visual direction:** Terminal tail showing a realistic incident sequence — ALLOW events, then a RETRY, then a BLOCK with timeout reason, then more BLOCKs. Timestamps showing the escalation. No annotations.

---

### Post 25 — Your MCP Client Sent an OPTIONS Request. The Gateway Handled It.

Your MCP client sent an OPTIONS request.
The gateway handled it. The upstream never saw it.

Browser-based MCP clients — and any agent running in an environment that enforces CORS — send a preflight OPTIONS request before the actual JSON-RPC POST.

If the gateway returns an incorrect or missing CORS response, the browser blocks the actual request before it is sent. The MCP server never sees it. The agent gets a CORS error, not an MCP error.

Vouqis handles OPTIONS at the gateway layer. The upstream is not involved. The response includes:

→ `Access-Control-Allow-Origin: *`
→ `Access-Control-Allow-Methods: GET, POST, OPTIONS`
→ `Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Mcp-Session-Id, X-Api-Key`
→ `Access-Control-Max-Age: 86400`

**The MCP-specific headers — `Mcp-Session-Id`, `X-Api-Key` — are explicitly included. This is not a generic CORS response.**

The session ID is forwarded through the gateway on all subsequent requests. Without it, the server creates a new session for every request. State is lost silently. The agent appears to work but operates without context across calls.

This is an infrastructure detail that produces silent failures when missing. Named. Traceable. Handled.

If your MCP deployment has encountered CORS-related failures, I'd like to understand what environment produced them.

---

**Alternative hooks:**
A: "OPTIONS request. 204 response. No upstream involvement. The browser was satisfied."
B: "`Mcp-Session-Id` in the CORS allow-headers. Not optional. State depends on it."

**Visual direction:** CORS response headers displayed in terminal format — each header on its own line, the MCP-specific ones standing out. Clean. No browser UI.

---

### Post 26 — The Upstream Returned 200 OK. The Body Was an HTML Error Page.

The upstream returned 200 OK.
The body was an HTML error page.

CDNs, load balancers, and reverse proxies in front of MCP servers can intercept requests and return their own error pages. These responses sometimes carry 200, sometimes 502, sometimes 503 — but the body is HTML, not JSON.

An agent receiving an HTML error page from what it believes is a JSON-RPC endpoint has no structured way to handle it. The JSON parse fails. The error handling depends on the framework. The failure is opaque.

**The agent doesn't know it received HTML. It knows the parse failed. That is not the same diagnosis.**

When Vouqis receives a non-JSON response from the upstream, it wraps it in a structured JSON-RPC error before returning it to the agent: `Gateway: upstream returned non-JSON response (502 text/html)`.

The agent receives a parseable error with the original HTTP status code and content type in the message. It does not receive raw HTML. The gateway absorbed the upstream failure and translated it into the protocol the agent expects.

The audit log records a `block` event with the reason, including the upstream status and content type.

MCP servers deployed behind CDN layers, platforms with health check interception, or misconfigured middleware can produce non-JSON responses.

If your MCP server has returned non-JSON under real load, I'd like to hear what was in front of it.

---

**Alternative hooks:**
A: "The upstream said 200 OK. The body was `<html>`. The gateway translated that into a JSON-RPC error."
B: "Non-JSON upstream responses are more common than MCP teams expect. The gateway handles them."

**Visual direction:** Terminal BLOCK event — reason: `upstream returned non-JSON response (502 text/html)`. The status code in the reason string is the key detail.

---

### Post 27 — Vouqis Does Not Observe MCP Traffic. It Enforces Protocol Rules on It.

Vouqis does not observe MCP traffic.
It enforces protocol rules on it.

Observability tools collect data about what happened. They surface it in dashboards, alerts, and traces. The value is retrospective visibility.

Infrastructure enforces behavior in the data path. A firewall doesn't observe bad packets and alert on them. It drops them. A load balancer doesn't observe upstream health and report it. It routes around unhealthy upstreams.

Vouqis is infrastructure. It sits in the request path. When a request fails validation, the upstream never sees it. When a response fails validation, the agent never receives it. The enforcement happens at the millisecond of the request.

**The audit log is a byproduct of enforcement. Not the primary output.**

This distinction matters for where Vouqis belongs in your stack. It is not a replacement for your log aggregator or your APM tool. It is a layer below them — the MCP transport layer — that those tools assume is already handled.

Most observability tools trace at the framework level: what the model did, what function was called, what the output was. They don't validate the JSON-RPC protocol compliance of the underlying MCP traffic. That is the layer Vouqis operates at.

Infrastructure that enforces protocol rules at runtime and produces structured records of every enforcement decision. That is the category.

If your team is building out MCP infrastructure and wants to understand where protocol enforcement fits in the stack, comment **INFRA** or DM me.

---

**Alternative hooks:**
A: "Observability tells you what happened. Infrastructure determines what can happen. Vouqis is the latter."
B: "The gateway is not in your observability stack. It is below it."

**Visual direction:** Three-layer monospace diagram — Application / Vouqis enforcement / MCP transport. Positioning without decoration. No images.

---

### Post 28 — One Question Every Platform Engineer Deploying MCP Servers Should Answer

One question every platform engineer deploying MCP servers should be able to answer:
What happens when your MCP server returns an invalid response?

Not "can it return one." If it does, what happens next? Under sustained traffic, a response that violates some aspect of the protocol is a realistic scenario.

The question is: what happens next?

Does the agent receive the invalid response and try to use it? Does the framework throw an unhandled exception? Does the failure surface to the user? Does it appear in your logs as a structured event with a specific reason, or as a generic error that requires investigation?

**Many MCP deployments reach this question without a structured answer. The MCP protocol defines the contract; whether violations are caught before the agent sees them depends on the implementation.**

This is not a criticism. The MCP ecosystem is young. Most teams are focused on getting tool calls to work at all, not on what happens when they fail in protocol-specific ways.

But the question gets more important as MCP servers move from experimental to production infrastructure that other engineering teams depend on.

When you can answer "what happens when the MCP server returns an invalid response" with "the gateway blocks it, logs a structured event with the specific failure reason, and sends the agent a parseable JSON-RPC error" — that is a different operational posture.

That is what a runtime reliability gateway provides.

If you're building or maintaining MCP infrastructure and want to answer this question concretely, DM me. I'll show you what the answer looks like in practice.

---

**Alternative hooks:**
A: "What does your MCP stack do when the server returns an invalid response? It's worth knowing before you need to answer it under pressure."
B: "The question is not whether your MCP server will return an invalid response. The question is what happens when it does."

**Visual direction:** No image needed. If a visual is added: a three-line monospace sequence — "Invalid response received. / Gateway blocks. / Agent gets structured error." — showing the answer.

---

## Close (Posts 29–30)

---

### Post 29 — Looking for 5 Platform Engineering Teams Running MCP Servers in Production

Looking for 5 platform engineering teams running MCP servers in production.

Vouqis is in early customer discovery. The product is a runtime reliability gateway that sits between AI agents and MCP servers, validates every request and response, and emits structured reliability events.

The commands are built. The validation runs. The audit log is structured and machine-readable.

What I am looking for are engineering teams that:

→ Own and deploy MCP servers as internal infrastructure
→ Have agents in production or late staging calling those servers
→ Are running into reliability gaps they don't currently have structured visibility into

Design partners get direct access to the product, direct access to me, and the ability to shape what gets built next.

**I am not looking for opinions on the idea. I am looking for people who have the problem and want to solve it.**

If you run MCP servers in production and your current stack cannot tell you — at the moment it happens — that a `tools/call` response returned an empty content array, this is the gap Vouqis addresses.

One conversation. No sales process. I want to understand your specific deployment and whether the gateway solves a real problem in it.

If that's your situation, DM me or comment **PARTNER** below.

---

**Alternative hooks:**
A: "5 platform engineering teams. MCP servers in production. Real reliability gaps. That's who I'm looking for."
B: "Design partner spots for teams running MCP infrastructure in production. Comment PARTNER."

**Visual direction:** No image. The post is a direct ask. If a visual is used: the gateway architecture diagram in monospace — clean, minimal — with "5 design partner spots open" below it.

---

### Post 30 — 30 Days of MCP Infrastructure Content, Distilled to One Starting Point

30 days of MCP infrastructure content, distilled to one starting point.

Here is what the gateway actually does, verified from the implementation:

→ Validates every JSON-RPC request before it reaches the upstream
→ Validates every response before it reaches the agent
→ Blocks invalid traffic and returns structured JSON-RPC errors
→ Retries timeouts on idempotent methods with configurable delay
→ Rewrites non-compliant responses when the fix is deterministic
→ Rate limits upstream traffic with a token bucket
→ Logs every decision as structured NDJSON with latency, reason, and attempt count
→ Passes SSE streams through without buffering
→ Handles CORS preflight for browser-based MCP clients

One command to start:

`vouqis proxy --upstream https://your-mcp-server.example.com`

**No SDK. No account. No changes to the MCP server. One URL.**

If you found any post in this sequence useful, the most valuable thing you can do is tell me whether the problem is real in your stack.

Not "interesting idea." Specifically: do you own MCP servers in production, and have you encountered the failure modes described in this sequence?

If yes, comment **REAL** or DM me. That conversation is more useful to me than any number of impressions.

---

**Alternative hooks:**
A: "30 posts. One product. One problem. Here is what the gateway actually does."
B: "The sequence is done. The product is real. Tell me if the problem is real in your stack."

**Visual direction:** The Vouqis startup banner — the clean terminal output that appears when `vouqis proxy` runs — as a closing image. The product speaking for itself.

---

## Campaign Summary

| Week | Theme | Posts | Primary CTA |
|------|-------|-------|-------------|
| 1 | The Problem | 1–7 | GATEWAY, VALIDATE, FOUR, BLOCK, LOG, TIMEOUT, PROTOCOL |
| 2 | The Gateway | 8–14 | AUDIT, LOGS, LATENCY, REWRITE, NULL, RATELIMIT, RETRY |
| 3 | The Output | 15–21 | REASONS, SSE, INFRA, DEPLOY, START, SCHEMA, EVAL |
| 4 | Positioning | 22–28 | WEEK, SIZE, INCIDENT, CORS, HTML, INFRA, DM |
| Close | Conversion | 29–30 | PARTNER, REAL |

**Product facts used in this campaign — all verified from codebase:**
- `vouqis proxy` and `vouqis logs` — only two commands claimed
- 4 gateway decisions: allow, block, retry, rewrite
- Idempotent retry methods: `tools/list`, `tools/call`, `initialize`, `ping`
- Default timeout: 5000ms, default retry: 1, default listen: `127.0.0.1:4444`
- Audit event schema: timestamp, upstream, server_id, method, tool, requestId, decision, latency_ms, reason, attempt
- `vouqis logs` outputs: P50, P95, top methods, top block reasons, event tail
- `--no-block-null`, `--no-sanitize`, `--rate-limit`, `--retry`, `--timeout`, `--log-file` flags confirmed

**Not mentioned anywhere in this campaign:**
- Probes, reliability scores, Exa, mjr-02, --fail-below, server rankings, audits as a product
