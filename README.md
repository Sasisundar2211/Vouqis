<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/vouqis-logo.png" alt="Vouqis" width="560">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vouqis/cli"><img src="https://img.shields.io/npm/v/%40vouqis%2Fcli?style=flat-square&color=4ade80" alt="npm"></a>
  &nbsp;
  <a href="https://www.npmjs.com/package/@vouqis/cli"><img src="https://img.shields.io/npm/dm/%40vouqis%2Fcli?style=flat-square&color=60a5fa" alt="downloads"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-6b7280?style=flat-square" alt="MIT">
  &nbsp;
  <img src="https://img.shields.io/badge/node-%3E%3D20-6b7280?style=flat-square" alt="Node 20+">
</p>

<p align="center"><strong>Runtime MCP trust layer — audit, proxy, and gate any MCP server</strong></p>

<p align="center">
  <a href="https://www.vouqis.tech">Dashboard</a> ·
  <a href="https://www.vouqis.tech/proxy">Live Proxy</a> ·
  <a href="mailto:sasisundhar2211@gmail.com?subject=Founding%20Customer%20Application">Founding Customer (3 months free)</a> ·
  <a href="https://github.com/Sasisundar2211/Vouqis/issues">Issues</a>
</p>

---

## The Problem

HTTP 200 is not success for MCP. Your AI agent called a server, got a 200, logged "success" — and your user saw nothing happen.

These aren't hypotheticals. Every one of these returned 200 OK while the MCP server was broken:

| Incident | Impact |
|:---|:---|
| mcp-remote CVE-2025-6514 | CVSS 9.6 RCE — 150M+ npm downloads affected |
| Smithery path traversal (June 2025) | 3,243 hosted MCP servers exposed, API keys leaked |
| Asana cross-tenant data leak (May 2025) | Customer data exposed across instances for 2 weeks |

Standard monitoring fires nothing. Uptime is green. Your agent is broken.

---

## Failure Math

A 2026 survey of 100 production MCP servers found the median server passes **71% of tool calls** — with silent empty responses and no errors.

```
Tool 1 → Tool 2 → Tool 3 → Tool 4 → Tool 5
  71%  →  50%  →  36%  →  25%  →  18%
```

At 71% per-tool reliability, a 5-tool agent chain succeeds only **18% of the time**. HTTP stays 200 throughout. Standard monitoring fires nothing.

*Source: Digital Applied — 100 MCP Servers Stress-Tested (April 2026)*

---

## Demo

```
$ vouqis audit https://mcp.exa.ai/mcp

  Vouqis — MCP Trust Auditor
  Running 10 probes against mcp.exa.ai...

  mal-01  ✓  malformed jsonrpc rejected           12ms
  mal-02  ✗  silent acceptance (unexpected)        18ms
  mis-01  ✓  missing params → error returned      340ms
  mis-02  ✓  null params → error returned         298ms
  tmo-01  ✓  cold-start response within 5s        487ms
  tmo-02  ✓  repeat-call response within 5s       412ms
  sch-01  ✓  response conforms to content[] spec  691ms
  sch-02  ✓  each content item has a type field   623ms
  nul-01  ✓  non-empty response returned          441ms
  nul-02  ✓  non-empty response returned          398ms

  ─────────────────────────────────────────────
  Trust Score    92 / 100
  Verdict        ✅ APPROVED
  Pass Rate      9 / 10  (90%)
  P50 Latency    487ms
  ─────────────────────────────────────────────
  Report  →  https://www.vouqis.tech/report/exa-abc123
```

**Install and run:**

```bash
npm install -g @vouqis/cli
vouqis audit https://your-mcp-server.com
```

By default the CLI is **fully local** — every run produces a terminal report and a `vouqis-report.json`. Pass `--report` to upload results and get a shareable URL. No login required.

---

## What It Tests

Ten deterministic JSON-RPC probes across five failure modes. No LLM calls. No test case authoring. No server-side changes.

| Probe | Failure Mode | What Passes |
|:---|:---|:---|
| `mal-01/02` | Malformed JSON-RPC | Server rejects the request — not silent `200 OK` |
| `mis-01/02` | Missing parameters | Server handles `{}` and `null` args without hanging |
| `tmo-01/02` | Response time | Every tool responds within 5 seconds |
| `sch-01/02` | Schema compliance | Response contains a valid `content[]` array with typed items |
| `nul-01/02` | Empty response | At least one non-blank result returned |

**Trust Score formula:**

```
Score = (pass rate × 0.50) + (latency score × 0.30) + (error diversity × 0.20)
```

| Score | Verdict | Action |
|:---|:---|:---|
| 95 – 100 | ✅ PRODUCTION-READY | Safe for enterprise multi-agent workflows |
| 80 – 94 | ✅ APPROVED | Safe to integrate |
| 50 – 79 | ⚠ RISKY | Review failures before production |
| 0 – 49 | ✗ DO NOT INTEGRATE | Something fundamental is broken |

Every JSON report includes a `remediation[]` array — machine-readable fix instructions for each failing probe, keyed to the exact MCP spec section.

---

## CI/CD Gate

Gate every deployment on server reliability. The build fails when a server degrades — before users notice.

```yaml
# .github/workflows/mcp-trust-gate.yml
name: MCP Trust Gate
on: [pull_request, push]

jobs:
  trust-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @vouqis/cli
      - name: Audit MCP server
        run: vouqis audit ${{ vars.MCP_SERVER_URL }} --fail-below 80
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

**Threshold guide:**

| Flag | When to use |
|:---|:---|
| `--fail-below 80` | Standard production gate — APPROVED required |
| `--fail-below 50` | Minimum bar — block only DO NOT INTEGRATE |
| `--fail-below 90` | High-reliability: finance, healthcare, customer-facing |
| `--fail-below 95` | Enterprise: PRODUCTION-READY required |

`VOUQIS_API_KEY` is a Pro feature. Free users can run `--fail-below` locally; CI gate persistence and history require Pro.

**SDK auto-block** — refuse to instantiate low-score servers at runtime:

```ts
import { withTrustGuard } from '@vouqis/sdk'

// Throws TrustGuardError before first tool call if score < 80
const client = await withTrustGuard(mcpClient, serverUrl, { minScore: 80 })
```

---

## Runtime Proxy

`vouqis proxy` sits in front of any MCP server and enforces reliability at the transport layer — before broken tool calls reach your agent.

```bash
vouqis proxy \
  --upstream https://your-mcp-server.com \
  --timeout 5000 \
  --retry 2 \
  --rate-limit 10 \
  --api-key $VOUQIS_API_KEY
```

Every request is validated, rate-limited, retried on timeout, and streamed live to the [proxy dashboard](https://www.vouqis.tech/proxy).

| Feature | What it does |
|:---|:---|
| Timeout enforcement | Kills requests exceeding `--timeout` ms; retries idempotent calls |
| Schema sanitization | Normalizes responses that drift from the MCP content[] spec |
| Rate limiting | Token-bucket limiter per upstream to prevent quota burns |
| Audit log | Every decision written to `./vouqis-audit.log` in JSONL format |
| Live dashboard | Pass `--api-key` to stream events to `vouqis.tech/proxy` in real time |
| Policy engine | Allow / block / retry / rewrite per tool and per server |

Start the proxy with a config file for full control:

```yaml
# vouqis.yml
upstream: https://your-mcp-server.com
listen: 127.0.0.1:4444
timeout: 5000
retry: 2
rateLimit: 10
blockNull: true
```

```bash
vouqis proxy --config vouqis.yml
```

View all audit events:

```bash
vouqis logs ./vouqis-audit.log
```

---

## SDK

The `@vouqis/sdk` package wraps any MCP client to intercept every `callTool()` call and apply the same trust policies as the proxy — without a separate process.

```bash
npm install @vouqis/sdk
```

```ts
import { VouqisSDK } from '@vouqis/sdk'

// Wrap any MCP client — intercepts every tool call transparently
const guarded = VouqisSDK.wrap(mcpClient, {
  serverUrl: 'https://your-mcp-server.com',
  blockNull: true,
  timeout: 5000,
})

// Or gate instantiation on a passing trust score:
import { withTrustGuard } from '@vouqis/sdk'

const client = await withTrustGuard(mcpClient, serverUrl, { minScore: 80 })
// Throws TrustGuardError immediately if the server scores below 80
```

---

## Pricing

| | Free | Pro | Enterprise |
|:---|:---:|:---:|:---:|
| Price | $0 | $9/mo | $499/mo |
| All 10 probes | ✓ | ✓ | ✓ |
| Shareable report URLs | ✓ | ✓ | ✓ |
| Report retention | 30 days | 90 days | 90 days |
| API key for CI/CD | — | ✓ | ✓ |
| `--fail-below` CI gate | — | ✓ | ✓ |
| Team seats | — | — | Unlimited |
| SAML 2.0 / OIDC SSO | — | — | ✓ |
| 99.9% uptime SLA | — | — | ✓ |
| Security questionnaire | — | — | ✓ |
| 30-day pilot available | — | — | ✓ |

[Pro — $9/mo →](https://www.vouqis.tech/pro) · [Enterprise — Talk to Sales →](https://www.vouqis.tech/enterprise)

---

## Privacy

Vouqis is local-first. Here is exactly what leaves your machine on each command:

| What | When | Where |
|:---|:---|:---|
| JSON-RPC probe requests | Every run | Your MCP server only |
| Audit results (score, probe data) | Only with `--report` or `VOUQIS_API_KEY` | `vouqis.tech/api/reports` |

No telemetry. No account required for free tier.

---

## Contributing

```bash
git clone https://github.com/Sasisundar2211/Vouqis.git
cd Vouqis && npm install
cd packages/cli && npx vitest run
npx tsc --noEmit
```

[Open an issue](https://github.com/Sasisundar2211/Vouqis/issues) · [Submit a PR](https://github.com/Sasisundar2211/Vouqis/pulls)

---

MIT © [Vouqis](https://github.com/Sasisundar2211)
