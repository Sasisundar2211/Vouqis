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

<p align="center"><strong>MCP server reliability auditor for AI teams</strong></p>

<p align="center">
  <a href="https://www.vouqis.tech">Dashboard</a> ·
  <a href="https://www.vouqis.tech/pro">Pro — $9/mo</a> ·
  <a href="https://github.com/Sasisundar2211/Vouqis/issues">Issues</a>
</p>

---

```
$ vouqis audit https://mcp.exa.ai/mcp

  Vouqis — MCP Trust Auditor
  Running 10 probes against mcp.exa.ai...

  mjr-01  ✓  malformed jsonrpc rejected           12ms
  mjr-02  ✗  silent acceptance (unexpected)        18ms
  mrp-01  ✓  missing params → error returned      340ms
  mrp-02  ✓  null params → error returned         298ms
  tmo-01  ✓  cold-start response within 5s        487ms
  tmo-02  ✓  repeat-call response within 5s       412ms
  urs-01  ✓  response conforms to content[] spec  691ms
  urs-02  ✓  each content item has a type field   623ms
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

---

## The Problem

Your AI agent called an MCP server. The server returned `200 OK`. The agent logged "success." Your user saw nothing happen.

This is not rare. A 2026 survey of 100 production MCP servers found the median server passes 71% of tool calls — with silent empty responses and no errors. At 71% per-tool reliability, a 5-tool agent chain succeeds only 18% of the time. HTTP stays 200 throughout. Standard monitoring fires nothing.

Three incidents that would have been caught by protocol-layer probing:

| Incident | Impact |
|:---|:---|
| mcp-remote CVE-2025-6514 | CVSS 9.6 RCE — 150M+ npm downloads affected |
| Smithery path traversal (June 2025) | 3,243 hosted MCP servers exposed, API keys leaked |
| Asana cross-tenant data leak (May 2025) | Customer data exposed across instances for 2 weeks |

---

## What It Tests

Ten deterministic JSON-RPC probes across five failure modes. No LLM calls. No test case authoring. No server-side changes.

| Probe | Failure Mode | What Passes |
|:---|:---|:---|
| `mjr-01/02` | Malformed JSON-RPC | Server rejects the request — not silent `200 OK` |
| `mrp-01/02` | Missing parameters | Server handles `{}` and `null` args without hanging |
| `tmo-01/02` | Response time | Every tool responds within 5 seconds |
| `urs-01/02` | Schema compliance | Response contains a valid `content[]` array with typed items |
| `nul-01/02` | Empty response | At least one non-blank result returned |

**Trust Score formula:**

```
Score = (pass rate × 0.50) + (latency score × 0.30) + (error diversity × 0.20)
```

| Score | Verdict | Action |
|:---|:---|:---|
| 80 – 100 | ✅ APPROVED | Safe to integrate |
| 50 – 79 | ⚠ RISKY | Review failures before production |
| 0 – 49 | ✗ DO NOT INTEGRATE | Something fundamental is broken |

---

## Quick Start

**Requires:** Node.js 20+

```bash
npm install -g @vouqis/cli
```

```bash
# Audit any MCP server
vouqis audit https://your-mcp-server.com

# Protected server (requires auth)
vouqis audit https://your-server.com -H "Authorization: Bearer TOKEN"

# CI/CD gate — exit code 1 if score drops below threshold
vouqis audit https://your-server.com --fail-below 80

# Generate a shareable URL (opt-in)
vouqis audit https://your-server.com --report

# Score only — no dashboard report
vouqis score https://your-server.com
```

**By default the CLI is fully local.** Every run produces a terminal report and a `vouqis-report.json`. Pass `--report` to also upload results and get a shareable URL at `vouqis.tech/report/<id>` — no login required.

---

## Works With

Vouqis connects over JSON-RPC exactly the way an AI agent does. If you have a URL, you can audit it.

**MCP transports:** Streamable HTTP (spec 2025-03-26), SSE fallback (2024-11-05)

**CI systems:** GitHub Actions, GitLab CI, CircleCI, Bitbucket Pipelines, any terminal

**Agent frameworks:** Works against any server built with the MCP SDK, regardless of framework

---

## CI/CD Integration

Gate every deployment on server reliability. The pipeline breaks when a server degrades — before users notice.

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

`VOUQIS_API_KEY` is a Pro feature. Free users can run `--fail-below` locally; CI gate persistence requires Pro.

---

## Dashboard

Browse audit history, track score trends, and replay past tool calls at [vouqis.tech](https://www.vouqis.tech). Every report URL is public and shareable — useful for vendor conversations:

> *"Your server scored 92 but failed mjr-02 — it accepted a malformed request silently. Fix this before we integrate: vouqis.tech/report/abc123"*

---

## Pricing

| | Free | Pro | Team |
|:---|:---:|:---:|:---:|
| Price | $0 | $9/mo | $99/mo |
| All 10 probes | ✓ | ✓ | ✓ |
| Shareable report URLs | ✓ | ✓ | ✓ |
| Report retention | 30 days | 90 days | 90 days |
| API key for CI/CD | — | ✓ | ✓ |
| `--fail-below` CI gate | — | ✓ | ✓ |
| Team seats | — | — | 5 |

[Subscribe at vouqis.tech/pro →](https://www.vouqis.tech/pro)

---

## Privacy

Vouqis is local-first. Here is exactly what leaves your machine on each command:

| What | When | Where |
|:---|:---|:---|
| JSON-RPC probe requests | Every run | Your MCP server only |
| Audit results (score, probe data) | Only with `--report` or `VOUQIS_API_KEY` | `vouqis.tech/api/reports` |

No data is sent to Supabase or any third party. The CLI has zero telemetry. When you pass `--report`, your server URL and probe results go to the Vouqis API to generate a shareable link — nothing else.

---

## Contributing

```bash
git clone https://github.com/Sasisundar2211/Vouqis.git
cd Vouqis && npm install

# Run tests
cd packages/cli && npx vitest run

# Typecheck
npx tsc --noEmit
```

[Open an issue](https://github.com/Sasisundar2211/Vouqis/issues) · [Submit a PR](https://github.com/Sasisundar2211/Vouqis/pulls)

---

## License

MIT © [Vouqis](https://github.com/Sasisundar2211)
