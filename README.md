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
  Pass rate:   92.0%  (46/50 prompts)
  P95 latency: 340ms

  Errors by category:
    ✗ error-handling: 2 failures
    ✗ schema-validation: 2 failures
────────────────────────────────────────────────
```

> 17,468 MCP servers run in production. 87% score below the high-trust threshold. Vouqis fixes that.

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
# Score an MCP server against the default 50-prompt eval suite
vouqis score https://your-mcp-server.example.com

# Run eval with custom prompts and write JSON report
vouqis score https://your-mcp-server.example.com --output json

# Run eval with a custom prompts file
vouqis eval https://your-mcp-server.example.com --prompts ./my-prompts.json
```

## Trust Score Algorithm

The score is a weighted average of three signals:

| Signal | Weight | Description |
|---|---|---|
| Pass rate | 60% | Fraction of prompts where the MCP server responded correctly |
| P95 latency | 25% | 95th-percentile response time across all tool calls |
| Error taxonomy | 15% | Penalty for failures spread across multiple error categories |

## Roadmap

- **v0.1** (May 16): Full eval harness running 50 real tool calls via Claude
- **v0.2** (May 23): Runtime SDK (5-line install, JSON-RPC trace capture)
- **v0.3** (May 28): Hosted dashboard at vouqis.dev — trace search and replay

## License

MIT © [Sundar Sasi](https://github.com/Sasisundar2211)
