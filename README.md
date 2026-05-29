<p align="center">
  <img src="https://github.com/Sasisundar2211/Vouqis/blob/main/vouqis-logo.png" alt="Vouqis" width="600">
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/vouqis?style=flat-square&color=60a5fa" alt="npm version">
  &nbsp;
  <img src="https://img.shields.io/npm/dm/vouqis?style=flat-square&color=4ade80" alt="Monthly Downloads">
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
  <a href="https://www.vouqis.tech/pro" target="_blank">
    <img src="https://img.shields.io/badge/⚡%20Go%20Pro-$9%2Fmo-4ade80?style=for-the-badge" alt="Go Pro" height="45">
  </a>
</p>

---

## 📋 Quick Navigation

<p align="center">

[Why Vouqis?](#-why-vouqis) ·
[Quick Start](#-quick-start) ·
[What It Tests](#-what-vouqis-tests) ·
[CI/CD](#%EF%B8%8F-cicd-integration) ·
[Pricing](#-pricing) ·
[How It Works](#-how-it-works-plain-english) ·
[Protected Servers](#-auditing-protected-servers) ·
[Pro & 90-Day History](#-pro-plan--90-day-history) ·
[FAQ](#-faq)

</p>

---

## ❓ Why Vouqis?

Your AI agent calls an MCP server. The server returns `200 OK`. The agent logs "success." Your customer sees nothing happened.

This is not an edge case. A 2026 stress test of 100 MCP servers found:

- **Median server passes only 71% of tool calls** — silent empty responses, no errors
- **5 chained tools at 71% reliability succeed just 18% of the time end-to-end**
- **Standard API monitoring never fires** — the HTTP layer looks completely healthy

These are documented production failures:

| Incident | Date | Impact |
|:---|:---|:---|
| Smithery path traversal | June 2025 | 3,243 hosted MCP servers exposed; thousands of API keys leaked |
| CVE-2025-6514 (`mcp-remote`) | 2025 | CVSS 9.6 RCE — 150M+ npm downloads affected |
| Asana MCP cross-tenant leak | May 2025 | Customer data exposed across instances for 2 weeks |

> **38% of MCP developers say security and reliability concerns are actively blocking adoption** — Zuplo MCP Report, 2026

|  | Other Tools | **Vouqis** |
|:---|:---|:---|
| Tests the live server | ✗ reads GitHub stars | ✓ **fires real protocol probes** |
| Zero setup | ✗ requires test cases per server | ✓ **just a URL** |
| 0–100 trust score | ✗ | ✓ |
| CI/CD gate | ✗ | ✓ `--fail-below` |
| Shareable report URL | ✗ | ✓ auto-generated |
| Works without LLM calls | ✗ | ✓ 100% deterministic |

---

## 🚀 Quick Start

**Requirements:** Node.js 20 or later · Any MCP server URL

### Step 1 — Install

```bash
npm install -g @vouqis/cli
```

### Step 2 — Run your first audit

```bash
vouqis audit https://mcp.exa.ai/mcp
```

No API keys. No config files. No changes to the server.

### Step 3 — Read your results

```
VOUQIS ── audit ── https://mcp.exa.ai/mcp
──────────────────────────────────────────────────

  ✓ Connected — found 2 tools
  Running 10 reliability tests…

  ✓ 9   ✗ 1

──────────────────────────────────────────────────
  Score           92 / 100
  Tests passed    9 of 10
  Response time   691ms typical

  What failed:
  ✗ Did not reject invalid requests · 1 time

  ✓ APPROVED — this server passed all reliability tests
──────────────────────────────────────────────────
  Shareable report → https://www.vouqis.tech/report/abc123
```

### All Commands

```bash
# Full audit — score, verdict, shareable URL
vouqis audit https://your-mcp-server.com

# Audit a server that requires a token or API key
vouqis audit https://your-server.com --header "Authorization: Bearer YOUR_TOKEN"
vouqis audit https://your-server.com -H "X-Api-Key: YOUR_KEY"

# Fail CI if score drops below a threshold
vouqis audit https://your-server.com --fail-below 80

# Save full probe results to a JSON file
vouqis audit https://your-server.com --json-path ./results.json

# Quick score only — no dashboard report
vouqis score https://your-server.com
```

---

## 🔬 What Vouqis Tests

Vouqis runs **10 deterministic probes across 5 failure modes**. No LLM calls. No test case authoring. No server-side changes required.

| Probe IDs | Failure Mode | What It Checks |
|:---|:---|:---|
| `mjr-01, 02` | **Malformed JSON-RPC** | Does the server reject garbage requests — or silently return `200 OK`? |
| `mrp-01, 02` | **Missing parameters** | Does the server handle empty / null arguments without hanging or crashing? |
| `tmo-01, 02` | **Timeout** | Does every tool respond within 5 seconds? |
| `urs-01, 02` | **Schema compliance** | Does the response match the MCP `content[]` spec with typed items? |
| `nul-01, 02` | **Empty response** | Does the tool return actual content — not `[]`, `null`, or `""`? |

<details>
<summary><strong>How each probe works in detail</strong></summary>

<br>

**Malformed JSON-RPC** — Sends two structurally invalid requests directly to the server, bypassing the SDK. Pass = `status >= 400` OR body contains an `error` field. Fail = silent `200 OK`.

**Missing parameters** — Calls every tool with `{}` then `null` arguments. Pass = server responds without hanging. Fail = timeout.

**Timeout** — Calls every tool with minimal valid inputs. Pass = response within 5 seconds.

**Schema compliance** — Inspects `response.content[]` — must be an array where every item has a string `type` field per the MCP spec.

**Empty response** — Content must be non-empty with at least one non-blank text item.

</details>

---

## ⚙️ CI/CD Integration

Gate every deployment on MCP server reliability. The pipeline breaks the moment a server degrades — before users notice.

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
      - run: npm install -g @vouqis/cli

      - name: Audit MCP server
        run: vouqis audit ${{ vars.MCP_SERVER_URL }} --fail-below 80
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vouqis-report
          path: vouqis-report.json
```

**Auditing a protected server in CI:**

```yaml
- name: Audit protected MCP server
  run: |
    vouqis audit ${{ vars.MCP_SERVER_URL }} \
      --header "Authorization: Bearer ${{ secrets.MCP_SERVER_TOKEN }}" \
      --fail-below 80
  env:
    VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

**Threshold guide:**

| Flag | When to use |
|:---|:---|
| `--fail-below 80` | Standard production gate — requires APPROVED verdict |
| `--fail-below 50` | Minimum bar — block only DO NOT INTEGRATE servers |
| `--fail-below 90` | High-reliability: financial, healthcare, customer-facing agents |

---

## 💳 Pricing

| | **Free** | **Pro** | **Team** | **Enterprise** |
|:---|:---:|:---:|:---:|:---:|
| **Price** | $0 | **$9/mo** | $99/mo | Custom |
| CLI runs | Unlimited | Unlimited | Unlimited | Unlimited |
| Report retention | 30 days | **90 days** | 90 days | Custom |
| Shareable report URLs | ✓ | ✓ | ✓ | ✓ |
| Pro API key | — | ✓ | ✓ | ✓ |
| Continuous monitoring | — | ✓ *(June 2026)* | ✓ | ✓ |
| Team seats | — | — | 5 seats | Custom |
| Priority support | — | ✓ | ✓ | ✓ |

<p align="center">
  <a href="https://www.vouqis.tech/pro" target="_blank">
    <img src="https://img.shields.io/badge/Go%20Pro-$9%2Fmo%20launch-4ade80?style=for-the-badge" alt="Go Pro" height="40">
  </a>
</p>

---

## 💡 How It Works — Plain English

**What is an MCP server?**

It is how AI agents call tools. When Claude searches the web, reads your calendar, or sends a Slack message — it calls an MCP server. The server is the bridge between the AI and the real world.

**What does Vouqis do?**

Think of Vouqis as a building inspector for MCP servers. Before you let an AI agent use a server in production, Vouqis runs 10 real test calls against it and gives you a score from 0 to 100. It checks whether the server handles bad inputs gracefully, responds fast enough, and returns data in the correct format.

**One command. Thirty seconds. Done.**

```bash
vouqis audit https://mcp.exa.ai/mcp
```

You get a score, a verdict (APPROVED / RISKY / DO NOT INTEGRATE), and a shareable report link.

---

## 🔐 Auditing Protected Servers

### The Simple Explanation

Some MCP servers are public — the door is open, no key needed. Vouqis walks in and tests everything.

Some MCP servers are private — the door is locked with an API key or token. Without the key, the server returns `401 Unauthorized` and Vouqis cannot test anything. You need to give Vouqis the same key your AI agent uses to call that server.

**You are not creating a new key.** You are sharing the existing key with Vouqis so it can test the server as you.

### What You See When Auth Is Missing

```
✖ Could not connect to MCP server
 › This server requires authentication (HTTP 401).

   Pass your credentials with the --header flag:
     vouqis audit https://connect.composio.dev/mcp \
       --header "Authorization: Bearer YOUR_TOKEN"

   Or embed the key in the URL if the server supports query params:
     vouqis audit "https://connect.composio.dev/mcp?api_key=YOUR_KEY"
```

### How to Get Your Token — By Platform

| Platform | Where to find it | How to pass it |
|:---|:---|:---|
| **Composio** | composio.dev → Settings → API Keys | `-H "X-API-Key: YOUR_KEY"` |
| **Zapier MCP** | zapier.com → Settings → API Keys | `-H "Authorization: Bearer YOUR_KEY"` |
| **Supabase** | Project → Settings → API → anon key | `-H "Authorization: Bearer YOUR_KEY"` |
| **Your own server** | Wherever you configured auth in your code | Depends on your implementation |

**General rule:** Go to the platform's dashboard → Settings or Developer Settings → look for "API Keys", "Tokens", or "Access Keys". Copy the key. Pass it with `--header`.

### Examples

```bash
# Composio
vouqis audit https://connect.composio.dev/mcp \
  --header "X-API-Key: comp_abc123"

# Standard Bearer token
vouqis audit https://your-private-server.com/mcp \
  --header "Authorization: Bearer eyJhbGci..."

# Multiple headers (stack as many -H flags as needed)
vouqis audit https://your-server.com/mcp \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-Id: your-org-id"

# Key embedded in the URL
vouqis audit "https://your-server.com/mcp?api_key=YOUR_KEY"
```

---

## ⚡ Pro Plan & 90-Day History

### What the Free Plan Does

Every audit runs, scores, and produces a shareable report URL. Reports are visible for 30 days. Nothing to set up — it just works.

### What Pro Adds

Pro ($9/month) saves every audit result to your personal dashboard for **90 days**. You can:

- Browse your full audit history across all servers
- See how scores change over time (catch regressions before users do)
- **Replay any past tool call** — Vouqis re-runs the exact same call against the live server so you can debug what changed
- Filter traces by server URL, verdict, or date

You get a `VOUQIS_API_KEY` that connects the CLI to your dashboard account.

### Step-by-Step: Activating Pro

**Step 1 — Subscribe**

Go to [vouqis.tech/pro](https://www.vouqis.tech/pro) and complete checkout. You will receive an email titled "Your Vouqis Pro API key" containing your key. It looks like this:

```
vq_a1b2c3d4e5f6...
```

**Step 2 — Set the environment variable**

This tells the CLI to attach your identity to every audit and save results to your dashboard.

```bash
# Mac / Linux — temporary (lasts until terminal closes)
export VOUQIS_API_KEY=vq_a1b2c3d4e5f6

# Mac / Linux — permanent (add to shell profile)
echo 'export VOUQIS_API_KEY=vq_a1b2c3d4e5f6' >> ~/.zshrc
source ~/.zshrc

# Windows (Command Prompt — permanent)
setx VOUQIS_API_KEY vq_a1b2c3d4e5f6
```

**Step 3 — Run audits normally**

```bash
vouqis audit https://your-mcp-server.com
```

The CLI silently attaches your key to every request. Your results appear at [vouqis.tech](https://www.vouqis.tech) under your account.

### Environment Variables — Full Reference

| Variable | Who needs it | What it does |
|:---|:---|:---|
| `VOUQIS_API_KEY` | **Pro users only** | Links the CLI to your dashboard. Without it, audits still run — results just aren't saved to your account. Get this key after subscribing at vouqis.tech/pro. |
| `VOUQIS_DASHBOARD_URL` | Nobody (auto-configured) | Overrides the dashboard endpoint. Only needed if you are self-hosting Vouqis. Default: `https://www.vouqis.tech` |
| `VOUQIS_APPROVED_THRESHOLD` | Optional | Change the score required for an APPROVED verdict. Default: `80` |
| `VOUQIS_RISKY_THRESHOLD` | Optional | Change the score required for a RISKY verdict. Default: `50` |

### Setting Env Variables in CI (GitHub Actions)

```
1. Open your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: VOUQIS_API_KEY
5. Value: vq_a1b2c3d4e5f6 (paste your Pro key)
6. Click Add secret
```

Then reference it in your workflow:

```yaml
env:
  VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

### Two Keys — Never Confuse Them

| Key | What it is | Where it goes |
|:---|:---|:---|
| **MCP server's API key** | The credential the MCP server requires to let you in. This is the server's key, not ours. Only needed if the server is protected. | `--header "Authorization: Bearer THIS_KEY"` |
| **VOUQIS_API_KEY** | Our key that links your CLI to your Vouqis dashboard account. You get it when you subscribe to Pro. | `export VOUQIS_API_KEY=THIS_KEY` |

---

## 📊 Trust Score Algorithm

Every audit produces a **0–100 Trust Score** from three weighted signals:

| Signal | Weight | How It's Measured |
|:---|:---|:---|
| Pass rate | **50%** | Fraction of 10 probes passed |
| Response time | **30%** | Median (P50) response time across all tool calls |
| Error spread | **20%** | Penalty for failures spread across multiple failure modes |

**Response time → score:**

| P50 Response Time | Points contributed |
|:---|:---|
| ≤ 500ms | 30.0 |
| ≤ 1,000ms | 27.0 |
| ≤ 2,000ms | 22.5 |
| ≤ 4,000ms | 15.0 |
| > 8,000ms | 0.0 |

**Verdicts:**

| Score | Verdict | Meaning |
|:---|:---|:---|
| 80–100 | ✓ **APPROVED** | Safe to integrate |
| 50–79 | ⚠ **RISKY** | Review failures before production |
| 0–49 | ✗ **DO NOT INTEGRATE** | Something fundamental is broken |

---

## 📈 Dashboard & Shareable Reports

Every `vouqis audit` produces three outputs simultaneously:

1. **Terminal report** — score, verdict, failure breakdown, response time
2. **Local JSON file** — full probe results at `./vouqis-report.json`
3. **Shareable URL** — `https://www.vouqis.tech/report/<id>` — no login needed to view

The shareable URL turns every audit into a vendor conversation:

> _"Your server scored 92 but failed mjr-02 — it accepted a malformed JSON-RPC request silently. Fix this before we integrate: **https://www.vouqis.tech/report/abc123**"_

Browse all your audit history → **[vouqis.tech](https://www.vouqis.tech)**

---

## 🗺️ Roadmap

| Version | Date | What Ships |
|:---|:---|:---|
| **v0.1** | May 2026 ✓ | CLI · 10-probe harness · Trust score · Shareable reports · Pro subscription |
| **v0.2** | May 2026 ✓ | `--header` auth flag · Protected server support · Actionable 401 error messages |
| **v0.3** | July 2026 | Continuous monitoring · Slack/Discord alerts · Score badge embed |
| **v1.0** | Q3 2026 | Team accounts · Historical trend charts · REST API · Custom probe weights |

---

## ❓ FAQ

<details>
<summary><strong>Q: Does Vouqis require anything installed on the MCP server?</strong></summary>

No. Vouqis connects via JSON-RPC over HTTP — the same way an AI agent would. If you have a URL, you can audit it.

</details>

<details>
<summary><strong>Q: My server returns 401. What do I do?</strong></summary>

The server requires authentication. Get the API key or token for that server from its dashboard (Settings → API Keys), then pass it:

```bash
vouqis audit https://your-server.com --header "Authorization: Bearer YOUR_TOKEN"
```

</details>

<details>
<summary><strong>Q: Where do I get my VOUQIS_API_KEY?</strong></summary>

Subscribe at [vouqis.tech/pro](https://www.vouqis.tech/pro). After payment you will receive an email with your key. It starts with `vq_`. Set it:

```bash
export VOUQIS_API_KEY=vq_your_key_here
```

</details>

<details>
<summary><strong>Q: Do I need VOUQIS_API_KEY to run audits?</strong></summary>

No. The CLI works completely without it. You still get scores, verdicts, and shareable report URLs. The key only saves your results to your dashboard account for 90-day history and replay.

</details>

<details>
<summary><strong>Q: What is the difference between the server's API key and VOUQIS_API_KEY?</strong></summary>

They are completely different:

- **Server API key** — The credential the MCP server requires to let you in. Passed via `--header`. This is the other server's key.
- **VOUQIS_API_KEY** — Our key that links your CLI to your Vouqis account. You get it when you subscribe to Pro.

</details>

<details>
<summary><strong>Q: Does it use LLM calls or OpenAI / Anthropic?</strong></summary>

No. Every probe is a deterministic protocol-level test. Zero LLM inference. No OpenAI or Anthropic API keys required.

</details>

<details>
<summary><strong>Q: What is the difference between `audit` and `score`?</strong></summary>

Both run the same 10 probes and compute the same trust score.

- `vouqis audit` — full output: verdict, shareable URL, `--fail-below` CI gate
- `vouqis score` — score only, no dashboard report generated

Use `audit` in CI and for vendor communication. Use `score` for quick local checks.

</details>

<details>
<summary><strong>Q: Can I audit my own server before publishing?</strong></summary>

Yes — this is one of the primary use cases. Audit your server, fix the failures, re-audit, then embed your Vouqis score in your README or Smithery listing as a trust signal for anyone considering integrating it.

</details>

---

## 💬 Contributing

```bash
git clone https://github.com/Sasisundar2211/Vouqis.git
cd Vouqis && npm install

# Typecheck
cd packages/cli && npx tsc --noEmit
cd ../vouqis-dashboard && npx tsc --noEmit

# Tests
cd packages/cli && npx vitest run
```

- [Report a bug](https://github.com/Sasisundar2211/Vouqis/issues)
- [Request a feature](https://github.com/Sasisundar2211/Vouqis/issues)

---

## 📄 License

MIT © [Vouqis Team](https://github.com/Sasisundar2211)

---

<div align="center">

**If Vouqis saved you from a production incident, give it a ⭐**

[Dashboard](https://www.vouqis.tech) · [Go Pro](https://www.vouqis.tech/pro) · [Report Bug](https://github.com/Sasisundar2211/Vouqis/issues)

</div>
