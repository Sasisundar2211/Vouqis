<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/Voquis_banner.png" alt="Vouqis — MCP Server Trust Score" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@vouqis/cli?style=flat-square&color=60a5fa" alt="npm version">
  &nbsp;
  <img src="https://img.shields.io/npm/dm/@vouqis/cli?style=flat-square&color=4ade80" alt="Monthly Downloads">
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-4ade80?style=flat-square" alt="License">
  &nbsp;
  <img src="https://img.shields.io/badge/node-%3E%3D20-60a5fa?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  &nbsp;
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-6C757D?style=flat-square" alt="Platform">
</p>

---

<p align="center">
  <strong>The trust layer for the MCP ecosystem</strong><br>
  <em>10 Probes · 30 Seconds · 0–100 Score · No LLM Calls · No Server Changes · CI/CD Gate</em>
</p>

<p align="center">
  <a href="https://www.vouqis.tech" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20View%20Dashboard-vouqis.tech-60a5fa?style=for-the-badge" alt="View Dashboard" height="45">
  </a>
  &nbsp;&nbsp;
  <a href="https://drive.google.com/file/d/1BiEqbEqb1lJ0xIF2jBeOQSdZzt_GFmgp/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/▶%20Watch%20Demo-Live%20Video-f87171?style=for-the-badge&logo=googledrive&logoColor=white" alt="Watch Demo" height="45">
  </a>
  &nbsp;&nbsp;
  <a href="https://www.vouqis.tech/pro" target="_blank">
    <img src="https://img.shields.io/badge/⚡%20Go%20Pro-$29%2Fmonth-4ade80?style=for-the-badge" alt="Go Pro" height="45">
  </a>
</p>

---

## 📋 Quick Navigation

<p align="center">

[Why Vouqis?](#-why-vouqis) ·
[▶ Video Demo](#-video-demo) ·
[Live Demo](#-live-demo---real-exa-mcp-audit) ·
[What It Tests](#-what-vouqis-tests) ·
[Trust Score](#-trust-score-algorithm) ·
[Quick Start](#-quick-start) ·
[CI/CD](#-cicd-integration) ·
[Dashboard](#-dashboard--shareable-reports) ·
[Pricing](#-pricing) ·
[FAQ](#-faq)

</p>

---

## ❓ Why Vouqis?

Your AI agent calls an MCP server. The server returns `200 OK`. The agent logs "success." Your customer sees nothing.

This is not an edge case. A 2026 stress test of 100 MCP servers found:

- **Median server passes only 71% of tool calls** — silent empty responses, no errors
- **5 chained tools at 71% reliability succeed just 18% of the time end-to-end**
- **Standard API monitoring never fires** — the HTTP layer looks completely healthy

These are not hypotheticals. They are documented production failures:

| Incident | Date | Impact |
|:---|:---|:---|
| Smithery path traversal | June 2025 | 3,243 hosted MCP servers exposed; thousands of API keys leaked |
| CVE-2025-6514 (`mcp-remote`) | 2025 | CVSS 9.6 RCE — 150M+ npm downloads affected |
| Asana MCP cross-tenant leak | May 2025 | Customer data exposed across instances for 2 weeks |
| Anthropic MCP design CVE | Jan 2026 | Arbitrary code execution via supply chain attack surface |

> **38% of MCP developers say security and reliability concerns are actively blocking adoption** — Zuplo MCP Report, 2026

|  | Other Tools | **Vouqis** |
|:---|:---|:---|
| Tests the live server | ✗ (reads GitHub stars) | ✓ **Fires real protocol probes** |
| No test case authoring | ✗ (requires setup per server) | ✓ **Zero setup — just a URL** |
| 0–100 trust score | ✗ | ✓ **Weighted algorithm** |
| CI/CD gate (`--fail-below`) | ✗ | ✓ **Built in** |
| Shareable report URL | ✗ | ✓ **Auto-generated** |
| Works without LLM calls | ✗ | ✓ **100% deterministic** |

---

## ▶ Video Demo

<p align="center">
  <a href="https://drive.google.com/file/d/1BiEqbEqb1lJ0xIF2jBeOQSdZzt_GFmgp/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/▶%20Watch%20Full%20Demo%20Video-Click%20to%20Play-f87171?style=for-the-badge&logo=googledrive&logoColor=white" alt="Watch Demo Video" height="55">
  </a>
</p>

<p align="center">
  <a href="https://drive.google.com/file/d/1BiEqbEqb1lJ0xIF2jBeOQSdZzt_GFmgp/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/%F0%9F%8E%AC%20Vouqis%20in%20Action%20%E2%80%94%20audit%20an%20MCP%20server%20in%2030%20seconds-Watch%20on%20Google%20Drive-%23475569?style=flat-square" alt="Vouqis demo video">
  </a>
</p>

<p align="center"><em>See Vouqis audit a live MCP server — trust score, verdict, and shareable report URL in under 30 seconds.</em></p>

---

## 🎬 Live Demo — Real Exa MCP Audit

https://github.com/user-attachments/assets/18fe230c-99cb-4c19-8e5b-2f69670cfd63

Output from an actual audit run against **[mcp.exa.ai/mcp](https://mcp.exa.ai/mcp)**, run just now:

```bash
vouqis audit https://mcp.exa.ai/mcp
```

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
  view traces:     https://www.vouqis.tech

  ✓ APPROVED — this server passed all reliability tests
```

**What this tells you:** Exa's MCP server is solid (92/100, APPROVED) — but it silently accepts a malformed JSON-RPC envelope with HTTP 202 instead of returning an error. That means any agent sending badly-formed requests gets a silent success instead of a clear failure signal. One line to fix; one audit to catch it.

---

## 🔬 What Vouqis Tests

Vouqis runs **10 deterministic probes across 5 failure modes**. No LLM calls. No test case writing. No server-side changes. Point it at any URL.

| Probe IDs | Failure Mode | What It Checks |
|:---|:---|:---|
| `mjr-01, 02` | **Malformed JSON-RPC** | Does the server reject garbage requests with a proper error — or silently return `200 OK`? |
| `mrp-01, 02` | **Missing parameters** | Does the server handle empty / null arguments without hanging or silently succeeding? |
| `tmo-01, 02` | **Timeout** | Does every tool respond within 5 seconds? |
| `urs-01, 02` | **Schema compliance** | Does the response match the MCP `content[]` spec with typed items? |
| `nul-01, 02` | **Empty response** | Does the tool return actual content — not `[]`, `null`, or `""`? |

Each probe is fired directly at the JSON-RPC protocol layer. The harness has zero external dependencies — no OpenAI, no Anthropic, no test fixtures. It discovers your server's tools, builds minimal valid inputs, and observes how the server behaves under each failure condition.

<details>
<summary><strong>🔍 How each probe strategy works</strong></summary>

<br>

**Malformed JSON-RPC (`malformed-request`)**
Sends two structurally invalid requests directly to the server URL, bypassing the MCP SDK:
- `mjr-01`: A completely invalid JSON body (`{this: "is not valid jsonrpc"}`)
- `mjr-02`: A JSON-RPC envelope missing both `id` and `params`

Pass condition: `status >= 400` OR response body contains an `error` field. A silent `200 OK` is a failure.

**Missing parameters (`strip-params`)**
Discovers the first tool on the server, then calls it with bad inputs:
- `mrp-01`: Completely empty arguments `{}`
- `mrp-02`: All parameters set to `null`

Pass condition: server responds (with an error, a result, or anything) without timing out. Hanging is the failure.

**Timeout (`slow-timeout`)**
Calls every tool on the server with minimal valid inputs and requires a response within **5 seconds**.

Pass condition: all tools respond within the deadline.

**Schema compliance (`schema-check`)**
Calls every tool and inspects the response structure:

Pass condition: `response.content` is an array where every item has a string `type` field — the MCP spec requirement.

**Empty response (`null-check`)**
Calls every tool and checks the response content:

Pass condition: `content[]` is non-empty and contains at least one item with non-blank text.

</details>

---

## 📊 Trust Score Algorithm

Every audit produces a **0–100 Trust Score** from three weighted signals:

| Signal | Weight | How It's Measured |
|:---|:---|:---|
| Pass rate | **50%** | Fraction of the 10 probes answered correctly |
| Response time | **30%** | Median (P50) response time across all tool calls |
| Error spread | **20%** | Penalty for failures spread across multiple failure modes |

> **Why P50 (median)?** The CLI measures and reports median (P50) response time — what a typical tool call takes in real use. Industry-wide, MCP server P95 latency runs 1,840ms and P99 reaches 6,200ms (Digital Applied, 2026). If your P50 is already above 500ms, your tail latency is a customer-visible production problem.

**Response time → score:**

| P50 Response Time | Latency Score | Points Contributed |
|:---|:---|:---|
| ≤ 500ms | 100 | 30.0 pts |
| ≤ 1,000ms | 90 | 27.0 pts |
| ≤ 2,000ms | 75 | 22.5 pts |
| ≤ 4,000ms | 50 | 15.0 pts |
| ≤ 8,000ms | 25 | 7.5 pts |
| > 8,000ms | 0 | 0.0 pts |

**Error spread → score:**

A server that fails 4 times in one mode has **one bug**. A server that fails across 4 modes is **architecturally broken**. Each additional failure mode beyond the first costs 20 points.

| Distinct Failure Modes | Error Score | Points Contributed |
|:---|:---|:---|
| 0 or 1 | 100 | 20.0 pts |
| 2 | 80 | 16.0 pts |
| 3 | 60 | 12.0 pts |
| 4 | 40 | 8.0 pts |
| 5 | 20 | 4.0 pts |

**Exa MCP score breakdown** (verified live):
```
Pass rate:    9/10 = 90%   →  90 × 0.50 = 45.0
Response time: 691ms P50   →  90 × 0.30 = 27.0   (≤1000ms tier)
Error spread:  1 mode       → 100 × 0.20 = 20.0
                                           ─────
Total:                                     92 / 100  ✓ APPROVED
```

**Verdicts:**

| Score | Verdict | Meaning |
|:---|:---|:---|
| 80–100 | ✓ **APPROVED** | Safe to integrate |
| 50–79 | ⚠ **RISKY** | Review failures before production |
| 0–49 | ✗ **DO NOT INTEGRATE** | Something fundamental is broken |

---

## 🚀 Quick Start

### Requirements

- Node.js 20 or later
- Any MCP server URL

### Install in 3 Steps

**Step 1 — Install the CLI:**
```bash
npm install -g @vouqis/cli
```

**Step 2 — Run your first audit:**
```bash
vouqis audit https://mcp.exa.ai/mcp
```

**Step 3 — Read your score and share the report URL.**

That's it. No API keys. No config files. No server changes.

### All Commands

```bash
# Full audit — score + verdict + shareable report URL
vouqis audit https://mcp.exa.ai/mcp

# Fail CI if trust score drops below threshold
vouqis audit https://mcp.exa.ai/mcp --fail-below 80

# Save full probe results to a JSON file
vouqis audit https://mcp.exa.ai/mcp --json-path ./results.json

# Score only — no shareable report URL generated
vouqis score https://mcp.exa.ai/mcp
```

### Environment Variables

| Variable | Default | Description |
|:---|:---|:---|
| `VOUQIS_API_KEY` | — | Pro API key for 90-day report retention |
| `VOUQIS_DASHBOARD_URL` | `https://www.vouqis.tech` | Override dashboard endpoint |
| `VOUQIS_APPROVED_THRESHOLD` | `80` | Override APPROVED verdict threshold |
| `VOUQIS_RISKY_THRESHOLD` | `50` | Override RISKY verdict threshold |

---

## ⚙️ CI/CD Integration

Gate every deployment on MCP server reliability. The pipeline breaks the moment a server degrades — before your users notice.

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

      - name: Upload JSON report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vouqis-trust-report
          path: vouqis-report.json
```

**Threshold guide:**

| Flag | When to use |
|:---|:---|
| `--fail-below 80` | Standard production gate — requires APPROVED verdict |
| `--fail-below 50` | Minimum bar — block only DO NOT INTEGRATE servers |
| `--fail-below 90` | High-reliability services: financial, healthcare, customer-facing agents |

<details>
<summary><strong>🔍 Running against a local MCP server in CI</strong></summary>

<br>

If your MCP server is part of the same repo, start it before auditing:

```yaml
- name: Start MCP server
  run: node packages/your-mcp-server/dist/index.js &

- name: Wait for server to be ready
  run: npx wait-on http://localhost:3001

- name: Audit
  run: vouqis audit http://localhost:3001 --fail-below 80
```

</details>

<details>
<summary><strong>🔍 Daily drift tracking — catch degradation over time</strong></summary>

<br>

A server that scores 92 today and 74 in three weeks has a reliability problem. Schedule a daily audit to catch it before users do:

```yaml
# .github/workflows/trust-score-drift.yml
name: Trust Score Drift Check
on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @vouqis/cli
      - run: vouqis audit ${{ secrets.MCP_SERVER_URL }} --fail-below 75
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

</details>

---

## 📈 Dashboard & Shareable Reports

Every `vouqis audit` automatically produces three outputs simultaneously:

1. **Terminal report** — score, verdict, failure breakdown, response time
2. **Local JSON file** — full probe results at `./vouqis-report.json`
3. **Shareable URL** — `https://www.vouqis.tech/report/<id>` — no login required to view

The shareable URL turns every audit into a vendor conversation:

> _"Your server scored 92 but failed mjr-02 — it accepted a malformed JSON-RPC request with HTTP 202 instead of returning an error. Fix this before we integrate: **https://www.vouqis.tech/report/abc123**"_

Every link is a new person discovering Vouqis. Every audit creates a new link.

Browse all public audit history → **[vouqis.tech](https://www.vouqis.tech)**

---

## 💳 Pricing

<p align="center">

| | **Free** | **Pro** | **Team** | **Enterprise** |
|:---|:---:|:---:|:---:|:---:|
| **Price** | $0 | **$29/mo** | $99/mo | Custom |
| CLI runs | Unlimited | Unlimited | Unlimited | Unlimited |
| Report retention | 30 days | **90 days** | 90 days | Custom |
| Shareable report URLs | ✓ | ✓ | ✓ | ✓ |
| Pro API key | — | ✓ | ✓ | ✓ |
| Continuous monitoring | — | ✓ *(June 2026)* | ✓ | ✓ |
| Team seats | — | — | **5 seats** | Custom |
| Shared dashboard | — | — | ✓ | ✓ |
| SSO / on-prem | — | — | — | ✓ |
| Priority support | — | ✓ | ✓ | ✓ |

</p>

<p align="center">
  <a href="https://www.vouqis.tech" target="_blank">
    <img src="https://img.shields.io/badge/Start%20Free-vouqis.tech-60a5fa?style=for-the-badge" alt="Start Free" height="40">
  </a>
  &nbsp;&nbsp;
  <a href="https://www.vouqis.tech/pro" target="_blank">
    <img src="https://img.shields.io/badge/Go%20Pro-$29%2Fmonth-4ade80?style=for-the-badge" alt="Go Pro" height="40">
  </a>
</p>

---

## 🔍 Why Not Use Existing Tools?

| Tool | What it actually does | Tests a live MCP server? |
|:---|:---|:---|
| **MCP Inspector** (Anthropic) | Interactive debugger — one manual call at a time, no scoring | No CI gate, no history |
| **LangSmith / LangFuse / Arize** | Traces LLM inference calls after they happen | ✗ Wrong layer entirely |
| **Braintrust** | Evaluates LLM output quality | ✗ Wrong layer entirely |
| **mcpevals.io** | LLM-based eval — requires writing test cases per server | Partial — no protocol compliance |
| **MCPSkills / MCP Scorecard** | Reads GitHub metadata (stars, last commit date) | ✗ Never fires a real request |
| **Vouqis** | Fires 10 deterministic protocol probes at the live server | ✓ **The only tool that does** |

No funded competitor has all four: **active probe testing + trust score + CI gate + shareable reports.**

---

## 🗺️ Roadmap

| Version | Date | What Ships |
|:---|:---|:---|
| **v0.1** | May 2026 ✓ | CLI · 10-probe harness · Trust score · Shareable reports · Pro subscription |
| **v0.2** | June 2026 | User auth · API key management · Dashboard filters · Webhook lifecycle events |
| **v0.3** | July 2026 | Continuous monitoring · Slack/Discord alerts · Score badge embed · Smithery integration |
| **v1.0** | Q3 2026 | Team accounts · Historical trend charts · REST API · Custom probe weights |

---

## ❓ FAQ

<details>
<summary><strong>Q: Does Vouqis require anything installed on the MCP server?</strong></summary>

**No.** Vouqis connects to any MCP server via JSON-RPC over HTTP — the same way an AI agent would. No SDK, no agent, no config on the server side. If you have a URL, you can audit it.

</details>

<details>
<summary><strong>Q: Does it use LLM calls or OpenAI/Anthropic?</strong></summary>

**No.** Every probe is a deterministic protocol-level test. Vouqis sends carefully crafted JSON-RPC requests directly to your server and inspects the HTTP response and body. Zero LLM inference, zero API keys required to run.

</details>

<details>
<summary><strong>Q: What does "Response time" in the output mean?</strong></summary>

It's the **P50 (median)** response time across all 10 probe calls — the latency your typical tool call experiences. The scoring algorithm uses P50 because it reflects real user experience better than P95 for a 10-probe sample. Industry-wide, MCP server P95 runs 1,840ms and P99 hits 6,200ms. If your P50 is already above 500ms, your tail latency is already customer-visible.

</details>

<details>
<summary><strong>Q: What's the difference between `audit` and `score`?</strong></summary>

Both run the same 10 probes and compute the same trust score.

- **`vouqis audit`** — full output: score, verdict (APPROVED / RISKY / DO NOT INTEGRATE), shareable report URL posted to the dashboard, `--fail-below` CI gate flag
- **`vouqis score`** — score only, no shareable report URL generated

Use `audit` in CI and for vendor communication. Use `score` for quick local checks.

</details>

<details>
<summary><strong>Q: How does the Pro API key work?</strong></summary>

Set `VOUQIS_API_KEY=your-key` in your environment before running an audit. The CLI sends it in the `X-Vouqis-Api-Key` header when posting results to the dashboard. With a valid Pro key, your reports are retained for 90 days instead of 30.

Get your key at [vouqis.tech/pro](https://www.vouqis.tech/pro).

</details>

<details>
<summary><strong>Q: Can I use Vouqis to audit my own MCP server before publishing?</strong></summary>

Yes — this is one of the primary use cases. Run `vouqis audit` against your server URL, fix the failures, re-audit, then embed your Vouqis score in your README or Smithery listing as a trust signal for prospective integrators.

</details>

<details>
<summary><strong>Q: What MCP protocol version does Vouqis support?</strong></summary>

Vouqis targets the **MCP Streamable HTTP** protocol (`2025-06-18`). It connects via `POST`-based JSON-RPC sessions — the same transport used by Claude, Cursor, Windsurf, and other MCP hosts.

</details>

---

## 💬 Community & Contributing

- [Report a bug](https://github.com/Sasisundar2211/vouqis/issues) — probe failures, scoring questions, CLI issues
- [Request a feature](https://github.com/Sasisundar2211/vouqis/issues) — new failure modes, integrations, dashboard features

### Contributing

```bash
# Clone the repo
git clone https://github.com/Sasisundar2211/vouqis.git
cd vouqis

# Install dependencies
npm install

# Run type checks
cd packages/cli && npx tsc --noEmit
cd ../vouqis-dashboard && npx tsc --noEmit

# Run tests
cd packages/cli && npx vitest run
```

---

## 📄 License

MIT © [Sasi Sundar](https://github.com/Sasisundar2211)

---

<div align="center">

**If Vouqis saved you from a production incident, give it a ⭐**

[View Dashboard](https://www.vouqis.tech) · [Go Pro](https://www.vouqis.tech/pro) · [Report Bug](https://github.com/Sasisundar2211/vouqis/issues)

</div>
