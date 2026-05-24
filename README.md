# Vouqis — MCP Server Trust Score

**Your AI agent calls an MCP server. The server returns `200 OK`. The agent logs "success." Your customer sees nothing.**

This is not an edge case. A 2026 stress test of 100 MCP servers found the median server passes only **71% of tool calls**. Five chained tools at 71% reliability succeed end-to-end just **18% of the time**. Standard API monitoring never fires — the HTTP layer looks fine.

Vouqis fixes this in one command.

```bash
npm install -g @vouqis/cli
vouqis audit https://your-mcp-server.example.com
```

```
VOUQIS ── audit ── https://your-mcp-server.example.com
──────────────────────────────────────────────────────
  ✓ Connected — 5 tools found
  Running 10 reliability probes...

  [████████████████████░░░░] 10 / 10   ✓ 8   ✗ 2

──────────────────────────────────────────────────────
  Vouqis Trust Score Report
──────────────────────────────────────────────────────
  Server         https://your-mcp-server.example.com
  Score          87 / 100  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱
  Tests passed   8 of 10  (80%)
  P50 latency    340ms  (target: ≤ 500ms)

  Failures:
    ✗ [nul-01] get_data → returned null or empty content
    ✗ [mjr-02] list_items → accepted malformed request silently

  Shareable report → https://vouqis.vercel.app/report/abc123
──────────────────────────────────────────────────────

  ✓ APPROVED — passed all reliability tests
```

30 seconds. No server changes. No instrumentation. Just a URL.

---

## The Problem Vouqis Solves

MCP server failures are invisible at the HTTP layer:

| Failure Type | What Happens | What You See |
|---|---|---|
| Null response | Tool returns `{"content": []}` | Agent logs success, user gets nothing |
| Schema mismatch | Response ignores declared output shape | Downstream agent parses garbage |
| Timeout | Tool takes 6s, agent framework retries silently | 3× cost, no error log |
| Malformed request accepted | Server returns `200 OK` on garbage input | Retry logic, error signals, observability all break |
| Missing-param silent fail | Null args produce `200 OK` | Agent assumes success, chain continues with bad data |

These are not hypotheticals. They are documented production failures:

- **Smithery (June 2025)**: Path traversal exposed 3,243 hosted MCP deployments and thousands of API keys. No active reliability monitoring existed.
- **CVE-2025-6514**: CVSS 9.6 RCE in `mcp-remote` — 150M+ npm downloads affected.
- **Asana MCP (May 2025)**: Cross-tenant data isolation failure exposed customer data for two weeks.

38% of MCP builders say security and reliability concerns are **actively blocking adoption** (Zuplo MCP Report, 2026). Vouqis is the answer to the question they are already asking.

---

## What Vouqis Catches

Vouqis probes your MCP server with 10 deterministic tests across 5 failure modes. No LLM inference. No test case authoring. Point it at any URL.

| Probe IDs | Failure Mode | What It Checks |
|---|---|---|
| `mjr-01, 02` | Malformed JSON-RPC | Server rejects garbage requests with proper errors, not silent `200 OK` |
| `mrp-01, 02` | Missing parameters | Server handles empty/null args without hanging or silently succeeding |
| `tmo-01, 02` | Timeout | Every tool responds within 5 seconds |
| `urs-01, 02` | Schema compliance | Response matches MCP content-array spec (`content[]`, typed items) |
| `nul-01, 02` | Empty response | Tool returns actual content — not `[]`, `null`, or `""` |

---

## Trust Score Algorithm

Every audit produces a **0–100 Trust Score** from three weighted signals:

| Signal | Weight | How It's Measured |
|---|---|---|
| Pass rate | 50% | Fraction of the 10 probes answered correctly |
| P50 latency | 30% | Median response time across all tool calls (your real user experience) |
| Error taxonomy | 20% | Penalty for failures spread across multiple failure modes |

The 20% error diversity weight matters: a server that fails 4 times in one mode has one bug. A server that fails across 4 modes is architecturally broken. The score punishes breadth of failure, not just depth.

**Latency tiers (P50):**

| P50 Response Time | Latency Score | Score Contribution |
|---|---|---|
| ≤ 500ms | 100 | 30 pts |
| ≤ 1,000ms | 90 | 27 pts |
| ≤ 2,000ms | 75 | 22.5 pts |
| ≤ 4,000ms | 50 | 15 pts |
| ≤ 8,000ms | 25 | 7.5 pts |
| > 8,000ms | 0 | 0 pts |

> **P50 vs P95**: Vouqis scores your server on P50 (median) latency — the response time your typical tool call sees. Industry-wide, MCP server P95 latency runs 1,840ms and P99 reaches 6,200ms (Digital Applied, 2026). If your P50 is already above 500ms, your P95 is a production problem waiting to be discovered.

**Verdicts:**

| Score | Verdict | Action |
|---|---|---|
| 80–100 | ✓ APPROVED | Safe to integrate |
| 50–79 | ⚠ RISKY | Review failures, fix before production |
| 0–49 | ✗ DO NOT INTEGRATE | Something fundamental is broken |

---

## Installation

```bash
npm install -g @vouqis/cli
```

Node.js 20 or later required.

---

## Commands

```bash
# Audit an MCP server — returns verdict + shareable report URL
vouqis audit https://your-mcp-server.example.com

# Block CI if trust score drops below your threshold
vouqis audit https://your-mcp-server.example.com --fail-below 80

# Write full probe results to JSON
vouqis audit https://your-mcp-server.example.com --json-path ./results.json

# Score only (no shareable report generated)
vouqis score https://your-mcp-server.example.com
```

---

## CI/CD Integration

Gate every deployment on MCP server reliability. One line in your GitHub Actions workflow:

```yaml
# .github/workflows/mcp-trust-gate.yml
name: MCP Trust Gate
on:
  pull_request:
  push:
    branches: [main]

jobs:
  trust-score:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vouqis
        run: npm install -g @vouqis/cli

      - name: Audit MCP servers
        run: |
          vouqis audit ${{ vars.GITHUB_MCP_URL }} --fail-below 80
          vouqis audit ${{ vars.SLACK_MCP_URL }} --fail-below 80
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

Pipeline fails → PR blocked → engineer investigates → fix or find an alternative → pipeline passes → deploy.

**Threshold guide:**

| Threshold | When to use |
|---|---|
| `--fail-below 80` | Standard production gate (requires APPROVED) |
| `--fail-below 50` | Minimum bar — block only DO NOT INTEGRATE |
| `--fail-below 90` | High-reliability use cases: financial, healthcare, customer-facing agents |

---

## Dashboard & Shareable Reports

Every `vouqis audit` run automatically generates:

1. **A terminal report** — score, verdict, failure breakdown, P50 latency
2. **A local JSON file** — full probe results at `./vouqis-report.json`
3. **A shareable URL** — `https://vouqis.vercel.app/report/<id>`

The shareable URL is the fastest way to communicate a reliability issue to an MCP server vendor:

> *"Your server scored 72. Two malformed-request failures and one null response. Here's the report: https://vouqis.vercel.app/report/abc123"*

No login required to view a shared report. No setup required to generate one.

View all your audit history at **[vouqis.vercel.app](https://vouqis.vercel.app)**.

---

## Pricing

| Plan | Price | What You Get |
|---|---|---|
| **Free** | $0 | Unlimited CLI runs · 30-day report retention · Public dashboard |
| **Pro** | $29/month | 90-day report retention · Pro API key · Priority support · Continuous monitoring (coming June 2026) |
| **Team** | $99/month | 5 seats · Shared dashboard · Team report history *(coming Q3 2026)* |
| **Enterprise** | Custom | SSO · On-prem · SLA · Custom probe weights · Dedicated support |

[**Start free → vouqis.vercel.app**](https://vouqis.vercel.app)

---

## Why Not Just Use Existing Tools?

| Tool | What it actually does | Tests your MCP server? |
|---|---|---|
| LangSmith / LangFuse / Arize | Traces LLM calls after they happen | ✗ — wrong layer |
| Braintrust | Evaluates LLM output quality | ✗ — wrong layer |
| MCP Inspector (Anthropic) | Manual interactive debugger, one call at a time | ✗ — no scoring, no CI |
| mcpevals.io | LLM-based output eval — requires test case authoring | Partial — no protocol compliance |
| MCPSkills / MCP Scorecard | GitHub metadata analysis (stars, last commit) | ✗ — never fires a real request |
| **Vouqis** | Fires 10 deterministic probes at the live server | **✓ — the only one that does** |

No funded competitor has active probe testing, a trust score, and CI/CD gate integration. Vouqis is the gap.

---

## Roadmap

| Version | Date | What Ships |
|---|---|---|
| **v0.1** | May 2026 ✓ | CLI · 10-probe harness · Trust score · Shareable reports · Pro subscription |
| **v0.2** | June 2026 | User auth · API key management · Dashboard filtering · Webhook lifecycle events |
| **v0.3** | July 2026 | Continuous monitoring · Slack/Discord alerts · Score badge embed · Smithery integration |
| **v1.0** | Q3 2026 | Team accounts · Historical trend charts · REST API · Custom probe weights |

---

## License

MIT © [Sasi Sundar](https://github.com/Sasisundar2211)
