# Vouqis

**Know if your MCP server actually works — before your users find out it doesn't.**

```bash
npm install -g @vouqis/cli
vouqis audit https://mcp.exa.ai/mcp
```

Real output from a real audit, run right now against [Exa's MCP server](https://mcp.exa.ai/mcp):

```
VOUQIS ── audit ── https://mcp.exa.ai/mcp
──────────────────────────────────────────────────

  ✓ Connected — found 2 tools
  Running 10 reliability tests against https://mcp.exa.ai/mcp

  [████████████████████████░░░░░░░░░░] 10 / 10
  ✓ 9   ✗ 1

──────────────────────────────────────────────────
  Vouqis Trust Score Report
──────────────────────────────────────────────────
  Server          https://mcp.exa.ai/mcp
  Score           92 / 100  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱
  Tests passed    9 of 10  (90%)
  Response time   691ms  typical · target <500ms

  What failed:
  ✗ Did not reject invalid requests · 1 time
    — Server accepted malformed JSON-RPC (HTTP 202)

──────────────────────────────────────────────────
  report written → ./vouqis-report.json
  view traces:     https://vouqis.vercel.app

  ✓ APPROVED — this server passed all reliability tests
```

**No LLM calls. No test case writing. No server changes.** Vouqis fires 10 deterministic probes directly at the MCP protocol layer. One command, ~30 seconds, 0–100 trust score.

---

## Why This Exists

Your AI agent calls an MCP server. The server returns `200 OK`. The agent logs "success." Your customer sees nothing.

This is not an edge case. A 2026 stress test of 100 MCP servers found:

- **Median server passes only 71% of tool calls** — it just silently returns empty content
- **Five chained tools at 71% reliability succeed end-to-end just 18% of the time**
- **Standard API monitoring never fires** — the HTTP layer looks completely healthy

And the failures aren't theoretical. These are documented production incidents:

| Incident | Impact |
|---|---|
| Smithery path traversal (June 2025) | 3,243 hosted MCP servers exposed; thousands of API keys leaked |
| CVE-2025-6514 in `mcp-remote` | CVSS 9.6 RCE — 150M+ npm downloads affected |
| Asana MCP cross-tenant leak (May 2025) | Customer data exposed across instances for 2 weeks |

**38% of MCP developers say security and reliability concerns are actively blocking adoption** (Zuplo MCP Report, 2026).

Vouqis is one command that answers: *does this server actually work?*

---

## What Vouqis Tests

Vouqis runs **10 probes across 5 failure modes**. Every probe is deterministic — no AI inference, no randomness, no test case authoring required on your side.

| Probe | Failure Mode | What It Checks |
|---|---|---|
| `mjr-01, 02` | **Malformed JSON-RPC** | Does the server reject garbage requests with a proper error — or silently return `200 OK`? |
| `mrp-01, 02` | **Missing parameters** | Does the server handle empty / null arguments without hanging or silently succeeding? |
| `tmo-01, 02` | **Timeout** | Does every tool respond within 5 seconds? |
| `urs-01, 02` | **Schema compliance** | Does the response match the MCP content-array spec? (`content[]` with typed items) |
| `nul-01, 02` | **Empty response** | Does the tool return actual content — not `[]`, `null`, or `""`? |

The Exa result above (92/100) failed only `mjr-02`: it returned HTTP 202 instead of an error when given a malformed JSON-RPC envelope. The other 9 probes passed cleanly.

---

## Trust Score — How It's Calculated

Every audit produces a **0–100 Trust Score** from three signals:

| Signal | Weight | What It Measures |
|---|---|---|
| Pass rate | **50%** | Fraction of the 10 probes the server answered correctly |
| Response time | **30%** | Median (P50) response time across all tool calls |
| Error spread | **20%** | Penalty for failures across multiple failure modes — not just one |

> **On "Response time":** The CLI reports the P50 (median) latency across all 10 probes. This is what a typical tool call takes. Industry-wide P95 latency for MCP servers runs 1,840ms and P99 hits 6,200ms (Digital Applied, 2026). If your P50 is already above 500ms, your P95 is a customer-visible problem.

**Response time scoring:**

| Median (P50) | Score | Points added |
|---|---|---|
| ≤ 500ms | 100 | 30 |
| ≤ 1,000ms | 90 | 27 |
| ≤ 2,000ms | 75 | 22.5 |
| ≤ 4,000ms | 50 | 15 |
| ≤ 8,000ms | 25 | 7.5 |
| > 8,000ms | 0 | 0 |

**Error spread scoring:** A server that fails 4 times in one mode has one bug. A server that fails across 4 modes is architecturally broken. Each additional failure mode beyond the first costs 20 points — so diverse failures score far worse than repeated failures in one category.

**Verdicts:**

| Score | Verdict | What to do |
|---|---|---|
| 80–100 | ✓ **APPROVED** | Safe to integrate |
| 50–79 | ⚠ **RISKY** | Review failures, fix before production |
| 0–49 | ✗ **DO NOT INTEGRATE** | Something fundamental is broken |

---

## Installation

```bash
npm install -g @vouqis/cli
```

Node.js 20 or later required.

---

## Commands

```bash
# Full audit — returns verdict (APPROVED / RISKY / DO NOT INTEGRATE) + shareable URL
vouqis audit https://mcp.exa.ai/mcp

# Fail CI if the trust score drops below your threshold
vouqis audit https://mcp.exa.ai/mcp --fail-below 80

# Save full probe results to a JSON file
vouqis audit https://mcp.exa.ai/mcp --json-path ./results.json

# Score only — no shareable report URL generated
vouqis score https://mcp.exa.ai/mcp
```

---

## CI/CD — Gate Deployments on Trust Score

Add one step to your GitHub Actions workflow and your pipeline will break the moment an MCP server degrades — before your users notice.

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
          vouqis audit ${{ vars.SLACK_MCP_URL }}  --fail-below 80
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

**When to use each threshold:**

| Flag | Use case |
|---|---|
| `--fail-below 80` | Standard production gate — requires APPROVED verdict |
| `--fail-below 50` | Minimum bar — block only DO NOT INTEGRATE servers |
| `--fail-below 90` | High-reliability services: financial, healthcare, customer-facing agents |

---

## Dashboard & Shareable Reports

Every `vouqis audit` automatically generates three outputs at once:

1. **Terminal report** — score, verdict, failure details, response time
2. **Local JSON file** — full probe results at `./vouqis-report.json`
3. **Shareable URL** — `https://vouqis.vercel.app/report/<id>` (no login to view)

The shareable URL turns every audit into a vendor conversation:

> *"Your server scored 92 but failed mjr-02 — it accepted a malformed JSON-RPC request with HTTP 202 instead of returning an error. Fix this before we integrate. Here's the full report: https://vouqis.vercel.app/report/abc123"*

Every report link is a new person discovering Vouqis.

Browse all public audit history at **[vouqis.tech](https://www.vouqis.tech/)**.

---

## Pricing

| | **Free** | **Pro** | **Team** | **Enterprise** |
|---|---|---|---|---|
| **Price** | $0 | $29/month | $99/month | Custom |
| CLI runs | Unlimited | Unlimited | Unlimited | Unlimited |
| Report retention | 30 days | **90 days** | **90 days** | Custom |
| API key | — | ✓ | ✓ | ✓ |
| Shareable report URLs | ✓ | ✓ | ✓ | ✓ |
| Continuous monitoring | — | ✓ coming June | ✓ coming June | ✓ |
| Team seats | — | — | 5 | Custom |
| Shared dashboard | — | — | ✓ | ✓ |
| SSO / on-prem | — | — | — | ✓ |
| Priority support | — | ✓ | ✓ | ✓ |

**[Start free → vouqis.vercel.app](https://www.vouqis.tech/)**  
**[Go Pro → vouqis.vercel.app/pro](https://www.vouqis.tech/pro)**

---

## Why Not Use Existing Tools?

| Tool | What it actually does | Tests a live MCP server? |
|---|---|---|
| MCP Inspector (Anthropic) | Interactive debugger — one manual call at a time | No scoring, no CI, no history |
| LangSmith / LangFuse / Arize | Traces LLM calls after they happen | ✗ Wrong layer entirely |
| Braintrust | Evaluates LLM output quality | ✗ Wrong layer entirely |
| mcpevals.io | LLM-based eval — requires you to write test cases per server | Partial — no protocol compliance |
| MCPSkills / MCP Scorecard | Reads GitHub metadata (stars, last commit date) | ✗ Never fires a real request |
| **Vouqis** | Fires 10 deterministic protocol probes at the live server | ✓ The only tool that does |

No funded competitor has all four: active probe testing + trust score + CI gate + shareable reports.

---

## Roadmap

| Version | Date | What ships |
|---|---|---|
| **v0.1** | May 2026 ✓ | CLI · 10-probe harness · Trust score · Shareable reports · Pro subscription |
| **v0.2** | June 2026 | User auth · API key management · Dashboard filters · Webhook lifecycle events |
| **v0.3** | July 2026 | Continuous monitoring · Slack/Discord alerts · Score badge embed · Smithery integration |
| **v1.0** | Q3 2026 | Team accounts · Historical trend charts · REST API · Custom probe weights |

---

## License

MIT © [Sasi Sundar](https://github.com/Sasisundar2211)
