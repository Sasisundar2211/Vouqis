# Vouqis

Score any MCP server before your team integrates it. No SDK installation required. Just a URL.

Vouqis scores, monitors, and replays Model Context Protocol (MCP) server interactions so your AI agents stop failing in production. Vouqis probes MCP servers directly using five deterministic test types: malformed JSON-RPC requests, missing required parameters, latency measurement, schema validation, and null response detection. No instrumentation required on the server. Point it at any URL.

```bash
npm install -g @vouqis/cli
vouqis audit https://your-mcp-server-url
```

```
Vouqis Trust Score Report
────────────────────────────────────────────────
  Server:      https://your-mcp-server.example.com
  Score:       87 / 100  ████████████████░░░░
  Pass rate:   92.0%  (9/10 probes passed)
  P50 latency: 340ms

  Errors by category:
    ✗ error-handling: 2 failures
    ✗ schema-validation: 2 failures
────────────────────────────────────────────────
```

> MCP servers fail silently. Your AI agent reports success while the tool call returns null. Vouqis finds that before your customers do.

## Installation

```bash
npm install -g @vouqis/cli
vouqis audit https://your-mcp-server-url
```

Node.js 20 or later required.

## Example Output

```
✔ Connected — 5 tools found
✔ All 10 probes complete

Vouqis Trust Score Report
────────────────────────────────────────────────────
  Server:      http://127.0.0.1:3001/mcp
  Score:       54 / 100  ███████████░░░░░░░░░
  Pass rate:   60.0%  (6/10 prompts)
  P50 latency: 5004ms

  Top failures:
    ✗ [tmo-01] slow_add → slow_add: Probe timed out after 5000ms [slow-timeout/slow_add]
    ✗ [tmo-02] slow_add → slow_add: Probe timed out after 5000ms [slow-timeout/slow_add]
    ✗ [nul-01] broken_schema → broken_schema: returned null or empty content — {"content":[]}

  Failures by mode:
    ✗ timeout: 2 failures
    ✗ null-response: 2 failures
────────────────────────────────────────────────────

JSON report written → ./vouqis-report.json
```

## Dashboard

Every score run is automatically recorded at:

```
https://vouqis.vercel.app/
```

No configuration required — results appear in the dashboard the moment the eval completes.

## Usage

```bash
# Audit an MCP server and get a verdict: APPROVED, RISKY, or DO NOT INTEGRATE
vouqis audit https://your-mcp-server.example.com

# Audit and fail CI if trust score drops below 80
vouqis audit https://your-mcp-server.example.com --fail-below 80

# Score only (no shareable report URL generated)
vouqis score https://your-mcp-server.example.com

# Write detailed results to a JSON file
vouqis audit https://your-mcp-server.example.com --json-path ./results.json
```

## Trust Score Algorithm

The score is a weighted average of three signals:

| Signal | Weight | Description |
|---|---|---|
| Pass rate | 50% | Fraction of prompts where the MCP server responded correctly |
| P50 latency | 30% | Median response time across all tool calls |
| Error taxonomy | 20% | Penalty for failures spread across multiple error categories |

## Roadmap

- **v0.1** (May 16): Full eval harness running 10 probes (2 per failure mode) via Claude
- **v0.2** (May 23): Runtime SDK (5-line install, JSON-RPC trace capture)
- **v0.3** (May 28): Hosted dashboard at vouqis.dev — trace search and replay

## License

MIT © [Sasi Sundar](https://github.com/Sasisundar2211)
