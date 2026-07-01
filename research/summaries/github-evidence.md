# MCP & Agent Failure Evidence from GitHub

**Date:** June 21, 2026
**Researcher:** Vouqis Research
**Scope:** modelcontextprotocol/*, continuedev/continue, langchain-ai/*, anthropics/claude-code

---

## Executive Summary

Analysis of **30+ confirmed GitHub issues** across the MCP ecosystem reveals systemic reliability gaps in how AI agents interact with MCP servers. The documented failure modes fall into five categories: **validation gaps** (8 issues), **timeout mismanagement** (8 issues), **opaque error handling** (7 issues), **absent rate limiting** (4 issues), and **incomplete auth** (6 issues). Every category represents failures that Vouqis can detect, prevent, or mitigate through its proxy validation layer.

---

## Quantitative Analysis

| Category | Count | Severity Range |
|---|---|---|
| **Validation** (schema, response shape, JSON-RPC compliance) | 8 | Critical–High |
| **Timeouts** (default misconfig, override ignored, no negotiation) | 8 | Critical–High |
| **Error Handling** (silent failures, opaque errors, crash-on-error) | 7 | Critical–Medium |
| **Rate Limiting** (no protocol support, 429 not retried, spec gap) | 4 | Medium |
| **Authentication / Authorization** (incomplete SDK support, scope issues) | 6 | High–Medium |
| **Transport Stability** (stdio crashes, reconnection races, memory leaks) | 5 | Critical–High |
| **Total** | **38** | |

---

## Detailed Evidence Table

### Validation Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| Invalid JSON-RPC requests silently dropped — client hangs | `typescript-sdk` #2247 | Jun 2026 / open | Critical | Client hangs indefinitely waiting for response that never arrives | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/2247) |
| Invalid JSON-RPC requests do not respond with error | `typescript-sdk` #563 | May 2025 / closed | High | JSON-RPC spec violations produce no error response | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/563) |
| Fix invalid JSON-RPC errors with id correlation | `typescript-sdk` #2000 (PR) | Apr 2026 / merged | High | Malformed requests lacked Invalid Request response | [GH PR](https://github.com/modelcontextprotocol/typescript-sdk/pull/2000) |
| Invalid JSON-RPC envelope errors lack request id correlation | `python-sdk` #2857 (PR) | Jun 2026 / open | High | Error responses not correlateable to original request | [GH PR](https://github.com/modelcontextprotocol/python-sdk/pull/2857) |
| Transport errors silently swallowed (missing `onerror`) | `typescript-sdk` #1395 | Jan 2026 / open | Critical | Parse errors invisible — impossible to debug | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/1395) |
| HTTP non-2xx status codes swallowed — client hangs | `python-sdk` #2110 | Feb 2026 / open | Critical | 401/403/5xx cause indefinite hang | [GH Issue](https://github.com/modelcontextprotocol/python-sdk/issues/2110) |
| Tools returning unexpected response shapes; agent hallucinates | `python-sdk` #2741 | May 2026 / open | Critical | Exceptions masked as empty `-32603`, real cause invisible to client | [GH Issue](https://github.com/modelcontextprotocol/python-sdk/issues/2741) |
| No visibility of errors from tool call responses | `modelcontextprotocol` #2734 | May 2026 / open | High | Responses silently discarded; no acknowledgement edge in protocol | [GH Issue](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2734) |

### Timeout Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| SEP-1539: Timeout Coordination | `modelcontextprotocol` #1539 | Sep 2025 / open | High | 15+ documented cases of timeout mismatch; no standard negotiation | [GH Issue](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1539) |
| RFC: Standardize timeouts between servers and clients | `modelcontextprotocol` #1492 (PR) | Sep 2025 / open | High | Vendor-specific behavior; Anthropic uses 5s for `tools/list`, 60s for others | [GH PR](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1492) |
| MCP client times out after 60s ignoring timeout option | `typescript-sdk` #245 | 2025 / closed | High | Progress notifications don't extend timeout; `resetTimeoutOnProgress` defaults false | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/245) |
| No default timeout for requests (unlike TS SDK) | `python-sdk` #1374 | Sep 2025 / open | High | Python SDK has no default timeout; TS SDK has 60s | [GH Issue](https://github.com/modelcontextprotocol/python-sdk/issues/1374) |
| MCP_TIMEOUT env var ineffective (inner SDK overrides) | `claude-code` #43299 | Apr 2026 / open | Critical | `MCP_TIMEOUT=300000` ignored; SDK 60s default wins | [GH Issue](https://github.com/anthropics/claude-code/issues/43299) |
| MCP servers timeout on initialize with Claude Desktop | `servers` #4153 | May 2026 / open | Critical | Initialize handshake times out after 60s on Windows | [GH Issue](https://github.com/modelcontextprotocol/servers/issues/4153) |
| MCP-adapter tool timeouts never applied via ToolNode | `langchainjs` #8279 | May 2025 / closed | High | Custom timeouts silently dropped; 60s default always applies | [GH Issue](https://github.com/langchain-ai/langchainjs/issues/8279) |
| MCP tool invocations ignore custom timeout above 60s | `langchainjs` #9560 | Dec 2025 / closed | High | `timeout: 100000` overridden by SDK default | [GH Issue](https://github.com/langchain-ai/langchainjs/issues/9560) |

### Error Handling Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| SDK hides exception messages for non-McpException | `csharp-sdk` #635 | Jul 2025 / closed | Medium | Generic error returned; debugging impossible without opt-in | [GH Issue](https://github.com/modelcontextprotocol/csharp-sdk/issues/635) |
| Do not expose internal errors to client (security risk) | `typescript-sdk` #1429 | Jan 2026 / open | Medium | Internal errors leak to client via tool handler's catch-all | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/1429) |
| Promise/async handling causes unhandled rejections | `typescript-sdk` #392 | Apr 2025 / open | High | Rejected promises vanish with no `onerror` handler | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/392) |
| Agent crashes when MCP server returns non-compliant response | `continuedev/continue` #6033 | Jun 2025 / open | High | Tool schemas with missing fields cause HTTP 422 → agent crash | [GH Issue](https://github.com/continuedev/continue/issues/6033) |
| MCP Agent mode should not stop on tool failure | `continuedev/continue` #6911 | Jul 2025 / closed | High | Agent stops entirely on any MCP tool error | [GH Issue](https://github.com/continuedev/continue/issues/6911) |
| Agent fails to use MCP tools despite successful connection | `continuedev/continue` #6216 | Jun 2025 / open | Critical | Tools loaded but never called; streaming model output issues | [GH Issue](https://github.com/continuedev/continue/issues/6216) |
| MCP tools return list instead of string (serialization error) | `langchain` #34669 | Jan 2026 / open | High | `CallToolResult.content` as list causes Pydantic validation errors with OpenAI/Anthropic | [GH Issue](https://github.com/langchain-ai/langchain/issues/34669) |

### Rate Limiting Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| HTTP 429 responses not retried with Retry-After | `typescript-sdk` #1892 | Apr 2026 / open | Medium | Client crashes on rate limit instead of backing off | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/1892) |
| Rate limit error id compliance (JSON-RPC spec violation) | `zircote/subcog` #46 | Jan 2026 / closed | Medium | Rate limit responses missing required `id` field | [GH Issue](https://github.com/zircote/subcog/issues/46) |
| Implement rate limits to address misuse causing downtime | `registry` #826 | Dec 2025 / open | Medium | Registry abuse causing real downtime | [GH Issue](https://github.com/modelcontextprotocol/registry/issues/826) |
| Authorization layer between agent intent and MCP execution | `modelcontextprotocol` #2337 (discussion) | 2026 / open | Medium | No MCP-aware rate limiting in HTTP proxies; Envoy can't parse JSON-RPC | [GH Discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/2337) |

### Authentication / Authorization Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| SEP-1299: Server-Side Authorization Management | `modelcontextprotocol` #1299 | Aug 2025 / open | High | No standardized auth between agent and MCP server | [GH Issue](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1299) |
| OAuth exceptions silently swallowed in `auth()` | `typescript-sdk` #2034 | May 2026 / open | Critical | Token persistence failures invisible; rotating refresh tokens cause permanent lockout | [GH Issue](https://github.com/modelcontextprotocol/typescript-sdk/issues/2034) |
| WWW-Authenticate header not respected by Client SDK | `python-sdk` #1054 | Jun 2025 / closed | High | Python SDK ignores `WWW-Authenticate`; cannot connect to GitHub MCP server | [GH Issue](https://github.com/modelcontextprotocol/python-sdk/issues/1054) |
| Add OAuth auth support for MCP registries | `modelcontextprotocol` #1963 | Dec 2025 / open | High | Enterprises can't control registry access; VS Code shows errors instead of OAuth flow | [GH Issue](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1963) |
| Built-in server-side incremental scope consent | `csharp-sdk` #1482 | Mar 2026 / open | Medium | No built-in way for `[Authorize]` on tools to return proper 403 with WWW-Authenticate | [GH Issue](https://github.com/modelcontextprotocol/csharp-sdk/issues/1482) |
| Scope accumulation behavior during step-up auth | `modelcontextprotocol` #2349 | Mar 2026 / open | Medium | No client-side scope accumulation guidance leads to re-authorization loops | [GH Issue](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2349) |

### Transport Stability Issues

| Issue | Repo | Date / Status | Severity | Implication | Source |
|---|---|---|---|---|---|
| MCP STDIO transport reconnection race condition | `continuedev/continue` #11886 | Mar 2026 / open | Critical | "Already connected" error on reconnect; state corruption | [GH Issue](https://github.com/continuedev/continue/issues/11886) |
| `MultiServerMCPClient.get_tools()` silently returns no tools on single server failure | `langchain-mcp-adapters` #492 | Apr 2026 / open | Critical | One failed server kills all tools from all servers | [GH Issue](https://github.com/langchain-ai/langchain-mcp-adapters/issues/492) |
| How to create fallbacks when MCP servers unreachable | `langchain-mcp-adapters` #276 | Jul 2025 / open | High | No circuit breaker or fallback strategy for unreachable servers | [GH Issue](https://github.com/langchain-ai/langchain-mcp-adapters/issues/276) |
| MCP client requests out of order and missing session ID | `continuedev/continue` #6006 | Jun 2025 / open | High | SSE transport requests sent out of order; session ID not forwarded | [GH Issue](https://github.com/continuedev/continue/issues/6006) |
| MCP Agent fails to handle multiple tool calls (JSON parse error) | `continuedev/continue` #5590 | May 2025 / closed | High | Multiple tool calls concatenated as invalid JSON; `parallel_tool_calls` disabled as workaround | [GH Issue](https://github.com/continuedev/continue/issues/5590) |

---

## Key Incident Breakdowns

### 1. HTTP Transport Swallows Non-2xx Status Codes — Client Hangs Indefinitely

**Issue:** `modelcontextprotocol/python-sdk` [#2110](https://github.com/modelcontextprotocol/python-sdk/issues/2110)
**Date:** February 2026 (still open)
**Severity:** Critical

**What happened:** When an MCP server returns HTTP 401/403/404/5xx, the Streamable HTTP and SSE transports in the Python SDK catch the exception in `post_writer`, log it, but **never forward it through the read stream**. The caller blocks indefinitely waiting for a response that will never arrive. The fix (PR [#2124](https://github.com/modelcontextprotocol/python-sdk/pull/2124), [#2483](https://github.com/modelcontextprotocol/python-sdk/pull/2483)) requires propagating the exception to `read_stream_writer` — the same pattern already used in `stdio.py` and `websocket.py`.

**Impact:** Any agent using the Python SDK's HTTP transport hangs forever on server errors. No timeout, no error, no recovery. The session is poisoned and requires manual restart.

**Vouqis relevance:** Vouqis can intercept HTTP status codes in its proxy layer, enforce response timeouts, and surface structured error responses before the agent hangs.

---

### 2. Transport Errors Silently Swallowed — No Debugging Possible

**Issue:** `modelcontextprotocol/typescript-sdk` [#1395](https://github.com/modelcontextprotocol/typescript-sdk/issues/1395)
**Date:** January 2026 (still open)
**Severity:** Critical

**What happened:** Several `transport.handleRequest` error types are silently swallowed by the TS SDK even when using the `onerror` callback. Parse errors, session validation failures, and other handled errors vanish into nested try/catch blocks that never call `this.onerror`. The reporter discovered this while debugging why AWS AgentCore Gateway could not connect to their MCP server — AWS exposes no response information for debugging, and the SDK provides no observability.

**Key quote:** *"right now, my team is unable to debug why AWS AgentCore Gateway cannot connect to our MCP server, because AWS does not expose any response information for debugging, and neither does the SDK on our server."*

**Vouqis relevance:** Vouqis can log all transport-level errors in its audit trail, providing the observability that the SDK lacks.

---

### 3. MCP_TIMEOUT Env Var Completely Ineffective — SDK Override

**Issue:** `anthropics/claude-code` [#43299](https://github.com/anthropics/claude-code/issues/43299)
**Date:** April 2026 (still open)
**Severity:** Critical

**What happened:** The `MCP_TIMEOUT` environment variable is documented as controlling MCP server connection timeout, but it is completely ineffective. Claude Code instantiates the MCP Client without passing `requestTimeout`, so the `@modelcontextprotocol/sdk` defaults to 60 seconds. This inner timeout fires before the outer `MCP_TIMEOUT` wrapper, making the env var useless. Even setting `MCP_TIMEOUT=300000` (5 min) or `MCP_TIMEOUT=1800000` (30 min) has no effect — servers that take >60s to initialize (e.g., Slack MCP server with 12.8k users, 43k channels) are marked as failed after ~60s regardless.

**Impact:** Any Claude Code agent connecting to a slow MCP server (large workspace indexing, slow database queries, etc.) will systematically fail. The timeout configuration is broken by design.

**Vouqis relevance:** Vouqis can enforce configurable per-tool and per-server timeouts at the proxy layer, overriding broken client-side implementations.

---

### 4. OAuth Exceptions Silently Swallowed — Permanent Token Loss

**Issue:** `modelcontextprotocol/typescript-sdk` [#2034](https://github.com/modelcontextprotocol/typescript-sdk/issues/2034)
**Date:** May 2026 (still open)
**Severity:** Critical

**What happened:** In `auth()`, the catch block after `refreshAuthorization()` + `saveTokens()` silently discards all non-OAuthError exceptions — including I/O errors from `saveTokens()`. No log, no rethrow. With rotating refresh tokens (default in Keycloak), the Authorization Server invalidates the old refresh token upon issuing a new one, but `saveTokens()` failure is swallowed, so the new token is lost. **The client has no valid tokens at all** and must fully re-authenticate. The bug went undiagnosed because the catch block produces zero output — diagnosis required reading SDK source code and correlating Keycloak audit logs.

**Key quote:** *"No logs — that's the problem. The catch block produces zero output. Diagnosis required reading SDK source code."*

**Vouqis relevance:** Vouqis's proxy can track auth state, detect token persistence failures, and alert on authentication flow anomalies.

---

### 5. MultiServerMCPClient Silently Returns No Tools on Single Server Failure

**Issue:** `langchain-ai/langchain-mcp-adapters` [#492](https://github.com/langchain-ai/langchain-mcp-adapters/issues/492)
**Date:** April 2026 (still open)
**Severity:** Critical

**What happened:** When using `MultiServerMCPClient` with multiple servers, if any one server fails during `get_tools()`, all tools from all servers are lost. The root cause is `asyncio.gather(*load_mcp_tool_tasks)` without `return_exceptions=True`. A single `FileNotFoundError` (e.g., `npx` not installed in Docker) propagates immediately, cancels all remaining tasks, and returns `[]` — a healthy server's tools are silently discarded.

**Impact:** A single misconfigured MCP server renders the entire agent toolset empty. No partial results, no indication of which server failed. This is the cascading failure pattern in its purest form.

**Vouqis relevance:** Vouqis can isolate MCP server health monitoring per-server, provide partial tool availability, and surface per-server failure diagnostics instead of allowing silent cascading.

---

## Agent Failure Chain Analysis

The documented issues reveal a consistent cascade pattern when MCP servers fail:

```
MCP SERVER FAILURE
        │
        ▼
┌──────────────────────────────────────────────┐
│ 1. Error at source                            │
│    - Tool throws unhandled exception           │
│    - JSON-RPC message is malformed             │
│    - Server returns HTTP 5xx / 429             │
│    - Transport subprocess crashes              │
│    - Auth token persistence fails              │
│    - Timeout exceeded (60s default)            │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ 2. SDK swallows or masks the error            │
│    - Exception caught, logged, never sent     │
│      to caller (python-sdk #2110)             │
│    - JSON-RPC Parse Error generated with      │
│      no correlation id (python-sdk #2857)     │
│    - Nested try/catch never calls onerror     │
│      (typescript-sdk #1395)                   │
│    - Empty -32603 returned; real cause        │
│      logged separately (python-sdk #2741)     │
│    - Promise rejection unhandled, vanishes    │
│      (typescript-sdk #392)                    │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ 3. Client receives opaque/no response         │
│    - Empty response or indefinite hang         │
│    - Generic -32603 "Internal Error"           │
│    - Non-2xx HTTP converted to opaque error    │
│    - g.asyncio.gather cancels all pending      │
│      tasks (langchain-mcp-adapters #492)       │
│    - Timed out after 60s (hardcoded,           │
│      ignoring MCP_TIMEOUT var)                 │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ 4. Agent acts on bad/missing data             │
│    - Continues with empty toolset              │
│    - Hallucinates tool outputs                 │
│    - Agent stops entirely                      │
│      (continuedev/continue #6911)              │
│    - Crashes on invalid schema validation      │
│      (continuedev/continue #6033)              │
│    - JSON parse error on concatenated          │
│      tool calls (continuedev/continue #5590)   │
│    - Tool calls ignored, model hallucinates    │
│      response (continuedev/continue #6216)     │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ 5. User-visible incident                      │
│    - Wrong answer delivered to customer        │
│    - Silent failure with no logs               │
│    - Failed task with no retry                 │
│    - Developer spends hours debugging          │
│      SDK source code to find root cause        │
│    - Permanent token lockout                   │
│      (typescript-sdk #2034)                    │
└──────────────────────────────────────────────┘
```

### Chain Amplification Factors

1. **Error opacity at each layer** — Each hop in the chain adds opacity. The server error → SDK silent catch → transport swallow → client timeout → agent hallucination. No layer adds structured diagnostic information.

2. **Cascading isolation failure** — A single MCP server failure can take down an entire multi-server agent setup (`langchain-mcp-adapters` #492, `continue` #11886).

3. **Configuration broken by design** — Timeouts are hardcoded at 60s and override attempts are silently rejected (`claude-code` #43299, `langchainjs` #8279, #9560).

4. **Zero observability by default** — The SDK's error callbacks (`onerror`) are optional and default to no-op. No logging, no metrics, no structured audit trail.

5. **No recovery mechanism** — No circuit breakers, no retry logic (except manual), no fallback strategies. The protocol itself has no response acknowledgment edge (`modelcontextprotocol` #2734).

---

## Strongest Takeaway

**Every documented failure mode — every single one — is something Vouqis can detect, prevent, or mitigate.**

The evidence shows a systemic pattern: MCP SDKs prioritize simplicity over reliability, and the result is a chain of opaque failures that agents cannot recover from. There is no observability layer, no configurable validation, no timeout enforcement, no rate limiting, no error correlation, and no audit trail.

Vouqis sits between the agent and MCP servers and provides exactly these missing capabilities:

| Gap | Vouqis Solution |
|---|---|
| Silent error swallowing | Proxy intercepts and structures all error responses |
| Hardcoded 60s timeouts | Configurable per-tool and per-server timeout enforcement |
| No schema validation | Request/response validation against JSON Schema |
| No rate limiting (429 → crash) | Rate limiting with Retry-After compliance |
| Auth token persistence failures | Auth state monitoring and alerting |
| No audit trail | Complete NDJSON audit logging of every request/response |
| Cascading server failures | Per-server health isolation and circuit breaking |
| Opaque -32603 errors | Structured error surfaces with correlation IDs |
| SDK debug impossibility | Rich proxy-layer observability and debugging |

The evidence from GitHub proves the problem exists at scale. Vouqis provides the solution.
