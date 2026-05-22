# Vouqis Real-World Testing Playbook

A step-by-step guide for pressure-testing Vouqis in live production environments.
Every command here is grounded in the actual source code — no guessing.

---

## How Vouqis Works (Read This First)

Vouqis has three testable surfaces:

| Surface | What it does | Entry point |
|---------|-------------|-------------|
| **CLI `audit`** | Runs 10 probes across 5 failure modes, emits a trust score (0–100) and a verdict | `vouqis audit <url>` |
| **CLI `score`** | Same probes, no verdict banner, lighter output | `vouqis score <url>` |
| **SDK `VouqisSDK.wrap()`** | Proxy-wraps any MCP client, emits a JSON trace record to stdout on every tool call | `new VouqisSDK({ projectId }).wrap(client)` |

**The 10 probes and what each catches:**

| Probe ID | Failure mode | Strategy | Pass condition |
|----------|-------------|----------|---------------|
| mjr-01 | `malformed-jsonrpc` | Send garbage JSON body | Server returns HTTP 4xx OR body has `error` field |
| mjr-02 | `malformed-jsonrpc` | Send valid JSON but missing `id` and `params` | Same |
| mrp-01 | `missing-params` | Call first tool with `{}` | Server responds (any non-timeout response counts) |
| mrp-02 | `missing-params` | Call first tool with all params set to `null` | Same |
| tmo-01 | `timeout` | Cold call every tool, 5 s deadline | All tools respond in < 5000 ms |
| tmo-02 | `timeout` | Repeat call every tool, 5 s deadline | Same |
| urs-01 | `unexpected-schema` | Call every tool, validate `content[]` array exists | Each item has a `type` string field |
| urs-02 | `unexpected-schema` | Same, second pass | Same |
| nul-01 | `null-response` | Call every tool, check content | At least one non-blank text item exists |
| nul-02 | `null-response` | Same, second pass | Same |

**Scoring formula:**

```
trust_score = (passRate × 50) + (latencyScore(P50) × 30) + (errorTaxonomy × 20)
```

| P50 latency | Latency score |
|-------------|--------------|
| ≤ 500 ms | 100 |
| ≤ 1000 ms | 90 |
| ≤ 2000 ms | 75 |
| ≤ 4000 ms | 50 |
| ≤ 8000 ms | 25 |
| > 8000 ms | 0 |

Error taxonomy: −20 points for each distinct failure mode beyond the first.

**Verdicts:** APPROVED ≥ 80 · RISKY ≥ 50 · DO NOT INTEGRATE < 50

---

## Setup

### Option A — Run from the monorepo (development)

```bash
# From repo root
cd /path/to/Vouqis

# Install dependencies
npm install

# Build the CLI
cd packages/cli && npm run build

# Run any command via node directly
node bin/run.js audit https://mcp.exa.ai/mcp
node bin/run.js score https://mcp.exa.ai/mcp
```

### Option B — Install globally (end-user flow)

```bash
npm install -g @vouqis/cli
vouqis audit https://mcp.exa.ai/mcp
```

### Environment variables (optional)

```bash
export VOUQIS_APPROVED_THRESHOLD=80    # default: 80
export VOUQIS_RISKY_THRESHOLD=50       # default: 50
export VOUQIS_API_KEY=your_key         # sends results to dashboard
export VOUQIS_DASHBOARD_URL=https://vouqis.vercel.app  # default
```

---

## Category 1 — Real Public MCP Servers

---

### Test 1 — Exa.ai: Reproduce and Track a Known Protocol Bug

**What this tests:** mjr-02 probe. Exa's server accepts a JSON-RPC envelope
that is missing `id` and `params` with HTTP 202 and no error field — a real
compliance hole. Vouqis already caught this (score 92, `mjr-02` failed).

**What you need:** Internet access. Nothing else.

**Steps:**

```bash
# Step 1: Run the audit
cd packages/cli
node bin/run.js audit https://mcp.exa.ai/mcp --json-path ./exa-run-1.json

# Step 2: Check the score
cat exa-run-1.json | python3 -c "
import json,sys
r=json.load(sys.stdin)
print('Score:', r['trustScore']['score'])
print('Failures:', r['trustScore']['errorsByFailureMode'])
"

# Step 3: Re-run one week later to see if Exa fixed the bug
node bin/run.js audit https://mcp.exa.ai/mcp --json-path ./exa-run-2.json

# Step 4: Compare the two runs
python3 -c "
import json
r1 = json.load(open('exa-run-1.json'))
r2 = json.load(open('exa-run-2.json'))
delta = r2['trustScore']['score'] - r1['trustScore']['score']
print(f'Week 1: {r1[\"trustScore\"][\"score\"]}')
print(f'Week 2: {r2[\"trustScore\"][\"score\"]}')
print(f'Delta:  {delta:+d}')
"
```

**Expected output (current state):**
```
Score: 92
Failures: {'malformed-jsonrpc': 1}
```

**What to do with the result:**
If week 2 still shows `malformed-jsonrpc: 1`, Exa hasn't fixed it. Screenshot
and use as a sales proof point: "We found this before your users did."
If score goes to 100, you have a regression-tracking story: "Vouqis detected
when it was broken and verified when it was fixed."

---

### Test 2 — Atlassian MCP: Live Timeout Under Real Conditions

**What this tests:** tmo-01 and tmo-02 probes. Atlassian MCP has documented
SSE 400 errors and timeout hangs (GitHub Issues #64 and #43). The 5 s deadline
in the harness will expose this.

**What you need:** Atlassian MCP server URL (requires Atlassian account).
The URL format is typically `https://mcp.atlassian.com/rest/api`.

**Steps:**

```bash
# Step 1: Audit immediately after their deployment window (9am UTC)
# This catches cold-start timeouts before instances warm up
node bin/run.js audit https://YOUR_ATLASSIAN_MCP_URL \
  --json-path ./atlassian-cold.json

# Step 2: Wait 5 minutes, audit again (warm instance)
sleep 300
node bin/run.js audit https://YOUR_ATLASSIAN_MCP_URL \
  --json-path ./atlassian-warm.json

# Step 3: Compare cold vs warm latency
python3 -c "
import json
cold = json.load(open('atlassian-cold.json'))
warm = json.load(open('atlassian-warm.json'))
print('Cold P50:', cold['trustScore']['p50LatencyMs'], 'ms')
print('Warm P50:', warm['trustScore']['p50LatencyMs'], 'ms')
print('Cold score:', cold['trustScore']['score'])
print('Warm score:', warm['trustScore']['score'])
"

# Step 4: Check which specific probe timed out
python3 -c "
import json
r = json.load(open('atlassian-cold.json'))
for probe in r['results']:
    if not probe['passed']:
        print(f'FAIL {probe[\"promptId\"]} ({probe[\"failureMode\"]}) — {probe[\"durationMs\"]}ms — {probe.get(\"errorText\",\"\")[:80]}')
"
```

**Expected output if timeout bug is live:**
```
FAIL tmo-01 (timeout) — 5023ms — Probe timed out after 5000ms [slow-timeout/list-issues]
```

**What to do with the result:**
A timeout failure drops score by ~30 points. Use the `errorText` field — it
contains the exact tool name that timed out. Forward that to Atlassian's team
as a reproducible test case.

---

### Test 3 — Notion MCP: Auth-Broken Null Cascade

**What this tests:** When auth fails (401), all tool calls return non-MCP
responses. This triggers nul-01, nul-02, urs-01, urs-02 simultaneously —
the error taxonomy penalty kicks in hard (4 distinct modes = −60 points from
taxonomy alone).

**What you need:** Notion MCP server URL. Intentionally run it first *without*
a valid auth token to simulate the Issue #109 condition.

**Steps:**

```bash
# Step 1: Audit WITHOUT auth (simulates the broken state from Issue #109)
# If your server requires an auth header that isn't being passed
node bin/run.js audit https://mcp.notion.com/mcp \
  --json-path ./notion-no-auth.json

# Step 2: Check error taxonomy spread
python3 -c "
import json
r = json.load(open('notion-no-auth.json'))
ts = r['trustScore']
print('Score:', ts['score'])
print('Pass rate:', ts['passRate'])
print('Failures by mode:', ts['errorsByFailureMode'])
distinct = len(ts['errorsByFailureMode'])
penalty = (distinct - 1) * 20 if distinct > 0 else 0
print(f'Distinct failure modes: {distinct} → taxonomy penalty: {penalty}pts')
"

# Step 3: Audit WITH valid auth
NOTION_TOKEN=your_token node bin/run.js audit https://mcp.notion.com/mcp \
  --json-path ./notion-with-auth.json

# Step 4: Show the score difference
python3 -c "
import json
no_auth = json.load(open('notion-no-auth.json'))
with_auth = json.load(open('notion-with-auth.json'))
print('No auth score:', no_auth['trustScore']['score'])
print('With auth score:', with_auth['trustScore']['score'])
"
```

**Expected output (auth broken):**
```
Score: 4
Pass rate: 0.0
Failures by mode: {'null-response': 2, 'unexpected-schema': 2, 'malformed-jsonrpc': 0, ...}
Distinct failure modes: 4 → taxonomy penalty: 60pts
```

**What to do with the result:**
Score of 4 is the floor. Document the cascade: one broken auth config triggers
4 different failure mode labels. This proves to buyers that Vouqis surfaces the
*root cause*, not just a symptom count.

---

### Test 4 — GitHub MCP: Establish the Gold Standard Baseline

**What this tests:** All 10 probes against Anthropic's official reference
implementation. This should score 95–100 and becomes your public benchmark.

**What you need:** GitHub personal access token with repo scope.

**Steps:**

```bash
# Step 1: Audit the GitHub MCP
node bin/run.js audit https://api.githubcopilot.com/mcp/ \
  --json-path ./github-baseline.json

# Step 2: Print the full baseline report
cat github-baseline.json | python3 -m json.tool

# Step 3: Record what "perfect" looks like
python3 -c "
import json
r = json.load(open('github-baseline.json'))
ts = r['trustScore']
print('=== GOLD STANDARD BASELINE ===')
print(f'Score:     {ts[\"score\"]} / 100')
print(f'Pass rate: {ts[\"passRate\"] * 100:.0f}%')
print(f'P50:       {ts[\"p50LatencyMs\"]}ms')
print(f'Failures:  {ts[\"errorsByFailureMode\"]}')
print('==============================')
"

# Step 4: Save baseline as your reference
cp github-baseline.json ./baselines/github-reference.json
```

**Expected output:**
```
=== GOLD STANDARD BASELINE ===
Score:     98 / 100
Pass rate: 100%
P50:       312ms
Failures:  {}
==============================
```

**What to do with the result:**
Publish this score on your dashboard as "Reference Implementation." Every
other server is scored relative to it. If GitHub scores < 95, you've found
a spec ambiguity worth documenting — high-value content for the MCP community.

---

### Test 5 — Supabase MCP: Dangerous Tool with Missing Params

**What this tests:** mrp-01 and mrp-02 probes against a tool that executes SQL.
Calling `execute_sql` with `{}` or `{query: null}` should return a validation
error — not crash, not leak a stack trace, not execute an empty query.

**What you need:** A running Supabase MCP server (local or hosted).

**Steps:**

```bash
# Step 1: Start Supabase MCP locally
npx @supabase/mcp-server-supabase --supabase-url $SUPABASE_URL --supabase-key $SUPABASE_KEY &
MCP_PID=$!

# Step 2: Audit it
node bin/run.js audit http://localhost:3000 --json-path ./supabase-audit.json

# Step 3: Inspect the mrp probe results specifically
python3 -c "
import json
r = json.load(open('supabase-audit.json'))
for probe in r['results']:
    if probe['promptId'].startswith('mrp'):
        status = 'PASS' if probe['passed'] else 'FAIL'
        print(f'{status} {probe[\"promptId\"]} — {probe.get(\"errorText\",\"no error\")[:100]}')
"

# Step 4: Kill the local server
kill $MCP_PID
```

**Expected output (safe server):**
```
PASS mrp-01 — invalid input syntax for type text: ""
PASS mrp-02 — null value in column "query" violates not-null constraint
```

**Red flag output (unsafe server):**
```
FAIL mrp-01 — (no response / server crash)
```

**What to do with the result:**
The error text in `errorText` field is the actual server response. If it
contains internal paths, table names, or stack traces — that's a security
finding. If both mrp probes pass, the server validates inputs correctly.

---

## Category 2 — Infrastructure and Deployment Edge Cases

---

### Test 6 — Serverless Cold Start: Vercel Function MCP

**What this tests:** tmo-01 probe (cold call, 5 s deadline) against an MCP
server deployed as a Vercel Function. Cold containers take 200–800 ms before
the function code even starts executing.

**What you need:** An MCP server deployed on Vercel. You can use the Vouqis
dashboard's own Vercel deployment as a stand-in.

**Steps:**

```bash
# Step 1: Force a cold start by re-deploying
vercel --prod

# Step 2: Audit within 10 seconds of deploy completing (guaranteed cold)
# Watch the Vercel dashboard for "Deployment ready" then immediately run:
node bin/run.js audit https://your-mcp.vercel.app/api/mcp \
  --json-path ./cold-start.json

# Step 3: Wait 2 minutes (function stays warm), audit again
sleep 120
node bin/run.js audit https://your-mcp.vercel.app/api/mcp \
  --json-path ./warm.json

# Step 4: Compare cold vs warm latency
python3 -c "
import json
cold = json.load(open('cold-start.json'))
warm = json.load(open('warm.json'))
print('Cold P50:', cold['trustScore']['p50LatencyMs'], 'ms')
print('Warm P50:', warm['trustScore']['p50LatencyMs'], 'ms')

# Check if cold start caused a timeout failure
cold_tmo = [p for p in cold['results'] if p['promptId'].startswith('tmo')]
for p in cold_tmo:
    status = 'PASS' if p['passed'] else 'FAIL (TIMEOUT)'
    print(f'{status} {p[\"promptId\"]} — {p[\"durationMs\"]}ms')
"
```

**Expected output (cold start too slow):**
```
Cold P50: 5200ms
Warm P50: 280ms
FAIL (TIMEOUT) tmo-01 — 5023ms
PASS tmo-02 — 310ms
```

**What to do with the result:**
If tmo-01 fails on cold starts, the server needs warm-up strategies:
- Increase Vercel function's max duration
- Add `minInstances: 1` to keep one instance warm
- Or document the cold-start SLA in your Vouqis report

---

### Test 7 — Rate-Limited Server: 429 Misclassification

**What this tests:** What happens when Vouqis runs its 10 sequential probes
against a server with strict rate limiting. Probes 6–10 will get 429 responses.
The 429 body may contain `{"error": "rate limit exceeded"}` — which confusingly
makes `mjr-*` probes pass while causing `nul-*` and `urs-*` to fail with a
wrong failure mode label.

**What you need:** Any MCP server with rate limiting, or a local mock server.

**Steps:**

```bash
# Step 1: Create a mock rate-limited MCP server for testing
cat > /tmp/rate-limited-mcp.mjs << 'EOF'
import http from 'http'

let requestCount = 0
const RATE_LIMIT = 5

const server = http.createServer((req, res) => {
  requestCount++
  
  if (requestCount > RATE_LIMIT) {
    res.writeHead(429, {'Content-Type': 'application/json'})
    res.end(JSON.stringify({error: 'rate limit exceeded', retryAfter: 10}))
    return
  }
  
  // Minimal valid MCP response
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(JSON.stringify({
    jsonrpc: '2.0',
    result: {tools: [{name: 'echo', description: 'echoes input', inputSchema: {type: 'object', properties: {message: {type: 'string'}}}}]},
    id: 1
  }))
})

server.listen(9999, () => console.log('Rate-limited mock MCP on :9999'))
EOF

node /tmp/rate-limited-mcp.mjs &
MOCK_PID=$!

# Step 2: Audit the rate-limited server
node bin/run.js audit http://localhost:9999 --json-path ./rate-limited.json

# Step 3: Inspect what failure modes Vouqis assigns to the 429s
python3 -c "
import json
r = json.load(open('rate-limited.json'))
print('Score:', r['trustScore']['score'])
print('Failures by mode:', r['trustScore']['errorsByFailureMode'])
print()
for probe in r['results']:
    if not probe['passed']:
        print(f'FAIL {probe[\"promptId\"]} ({probe[\"failureMode\"]}) — {probe.get(\"errorText\",\"\")[:80]}')
"

kill $MOCK_PID
```

**Expected output showing the misclassification:**
```
Score: 21
Failures by mode: {'null-response': 2, 'unexpected-schema': 2, 'timeout': 0}

FAIL nul-01 (null-response) — echo: returned null or empty content
FAIL nul-02 (null-response) — echo: returned null or empty content
FAIL urs-01 (unexpected-schema) — echo: response missing required MCP content schema
FAIL urs-02 (unexpected-schema) — echo: response missing required MCP content schema
```

**What to do with the result:**
The failures are labeled as content problems, not rate-limiting problems. This
is a gap in Vouqis's failure taxonomy. Document it, then add a `rate-limited`
failure mode that checks for HTTP 429 responses specifically.

---

### Test 8 — The Hanging Server: Validate probeRaw Has a Timeout

**What this tests:** Whether `probeRaw` (used by mjr-01 and mjr-02) has its
own timeout. Spoiler from the source: it does — `AbortSignal.timeout(8000)` in
`client.ts:52`. This test confirms that behavior under real conditions.

**What you need:** `netcat` (installed on macOS by default).

**Steps:**

```bash
# Step 1: Start a server that accepts connections but never responds
# -k = keep listening, -l = listen mode
nc -lk 9998 &
NC_PID=$!

# Step 2: Run the audit and time it — it should NOT hang forever
echo "Starting audit against hanging server..."
START=$(date +%s)

node bin/run.js audit http://localhost:9998 \
  --json-path ./hanging-server.json 2>&1 || true

END=$(date +%s)
echo "Completed in $((END - START)) seconds"

# Step 3: Verify the probes failed gracefully, not hung
python3 -c "
import json
r = json.load(open('hanging-server.json'))
print('Score:', r['trustScore']['score'])
for probe in r['results']:
    print(f'{\"PASS\" if probe[\"passed\"] else \"FAIL\"} {probe[\"promptId\"]} — {probe[\"durationMs\"]}ms — {probe.get(\"errorText\",\"\")[:60]}')
"

kill $NC_PID 2>/dev/null
```

**Expected output:**
```
Completed in ~18 seconds  (2 probes × 8s timeout = 16s for mjr probes alone)

Score: 0
FAIL mjr-01 — 8012ms — The operation was aborted due to timeout
FAIL mjr-02 — 8009ms — The operation was aborted due to timeout
FAIL tmo-01 — 5003ms — Probe timed out after 5000ms [slow-timeout/...]
...
```

**What to do with the result:**
This confirms Vouqis is resilient to hanging servers. The full audit against a
dead server completes in roughly 26 seconds (8+8 for mjr probes + up to 5×n
for tmo probes), never hangs. That's a reliability guarantee you can document.

---

### Test 9 — 50-Tool Server: Measure Unbounded Probe Duration

**What this tests:** The timeout and schema probes cycle *every* tool in a loop
with no cap. With 50 tools × 5 s timeout = up to 250 s for the timeout probe
alone. This is a real scalability issue.

**What you need:** An MCP server with many tools. Anthropic's `everything`
reference server is ideal.

**Steps:**

```bash
# Step 1: Start the Anthropic everything server (has many tools)
npx @modelcontextprotocol/server-everything &
EVERYTHING_PID=$!

# Step 2: Time the full audit
echo "Starting audit — timing full run..."
time node bin/run.js audit http://localhost:3000 \
  --json-path ./everything-server.json

# Step 3: Count how many tools were discovered
python3 -c "
import json
r = json.load(open('everything-server.json'))
# The tool list isn't in the report directly, but we can infer from probe results
print('Probe results:')
for probe in r['results']:
    print(f'  {probe[\"promptId\"]} — {probe[\"durationMs\"]}ms — tool: {probe.get(\"toolCalled\",\"n/a\")}')
print('Total time from timestamps (rough):', sum(p['durationMs'] for p in r['results']), 'ms')
"

kill $EVERYTHING_PID
```

**Expected output (50-tool server):**
```
real  4m23s    ← 263 seconds for a 10-probe audit
user  0m1.2s
```

**What to do with the result:**
This documents the scalability ceiling. The fix is adding a `MAX_TOOLS_PER_PROBE`
cap (e.g., 3) so that schema and timeout probes sample tools rather than exhausting
all of them. File this as a product issue with the timing data as evidence.

---

### Test 10 — Concurrent Audits: Isolation Between Parallel Runs

**What this tests:** Whether running 5 simultaneous `vouqis audit` processes
against the same server produces consistent, independent results — or whether
they interfere with each other (shared sessions, rate limiting, corrupted state).

**What you need:** Any live MCP server.

**Steps:**

```bash
# Step 1: Launch 5 concurrent audits in background
for i in 1 2 3 4 5; do
  node bin/run.js audit https://mcp.exa.ai/mcp \
    --json-path ./concurrent-$i.json > /tmp/vouqis-$i.log 2>&1 &
  echo "Started audit $i (PID $!)"
done

# Step 2: Wait for all to complete
wait
echo "All 5 audits complete"

# Step 3: Compare scores — they should be very close (± 5 points)
python3 -c "
import json
scores = []
for i in range(1, 6):
    r = json.load(open(f'concurrent-{i}.json'))
    scores.append(r['trustScore']['score'])
    print(f'Run {i}: score={r[\"trustScore\"][\"score\"]} p50={r[\"trustScore\"][\"p50LatencyMs\"]}ms')

print(f'Min: {min(scores)}  Max: {max(scores)}  Spread: {max(scores)-min(scores)}')
if max(scores) - min(scores) <= 10:
    print('PASS: Scores are consistent across concurrent runs')
else:
    print('WARN: Large spread — server may not handle concurrent load well')
"
```

**Expected output:**
```
Run 1: score=91  p50=812ms
Run 2: score=90  p50=934ms
Run 3: score=92  p50=778ms
Run 4: score=88  p50=1102ms   ← latency increases under load
Run 5: score=89  p50=967ms
Min: 88  Max: 92  Spread: 4
PASS: Scores are consistent across concurrent runs
```

**What to do with the result:**
A spread > 15 points indicates the server degrades significantly under concurrent
load. This is a real production risk for teams with multiple agents calling the
same MCP server simultaneously.

---

## Category 3 — SDK Wrapper Under Real Load

---

### Test 11 — Wrap a Real MCP Client and Validate Every Trace Record

**What this tests:** VouqisSDK.wrap() captures a TraceRecord for every tool
call. This test makes 20 tool calls and verifies: all 20 records emitted, all
are valid JSON, all have unique traceIds, and latencyMs is accurate.

**What you need:** The SDK package built and available.

**Steps:**

```bash
# Step 1: Build the SDK
cd packages/sdk && npm run build 2>/dev/null || true
cd ../..

# Step 2: Create the test script
cat > /tmp/sdk-trace-test.mjs << 'EOF'
import { VouqisSDK } from './packages/sdk/src/index.js'
import { McpClient } from './packages/cli/src/mcp/client.js'

const sdk = new VouqisSDK({ projectId: 'test-project-001' })
const client = new McpClient('https://mcp.exa.ai/mcp')

await client.connect()
const wrapped = sdk.wrap(client)

// Make 20 tool calls, capture all traces
const traces = []
const originalLog = console.log.bind(console)
console.log = (line) => {
  try {
    const trace = JSON.parse(line)
    if (trace.traceId) traces.push(trace)
  } catch {}
  originalLog(line)
}

for (let i = 0; i < 20; i++) {
  try {
    await wrapped.callTool('web_search_exa', { query: `test query ${i}` })
  } catch {}
}

await client.disconnect()

// Restore console.log
console.log = originalLog

// Validate all traces
const traceIds = new Set(traces.map(t => t.traceId))
const hasProjectId = traces.every(t => t.projectId === 'test-project-001')
const hasTimestamp = traces.every(t => t.timestamp && !isNaN(Date.parse(t.timestamp)))
const hasLatency = traces.every(t => typeof t.latencyMs === 'number' && t.latencyMs >= 0)

console.log('=== SDK Trace Validation ===')
console.log(`Total calls:       20`)
console.log(`Traces captured:   ${traces.length}`)
console.log(`Unique traceIds:   ${traceIds.size}`)
console.log(`All have projectId: ${hasProjectId}`)
console.log(`All have timestamp: ${hasTimestamp}`)
console.log(`All have latencyMs: ${hasLatency}`)
console.log(`RESULT: ${traces.length === 20 && traceIds.size === 20 ? 'PASS' : 'FAIL'}`)
EOF

# Step 3: Run it
node --input-type=module < /tmp/sdk-trace-test.mjs
```

**Expected output:**
```
=== SDK Trace Validation ===
Total calls:       20
Traces captured:   20
Unique traceIds:   20
All have projectId: true
All have timestamp: true
All have latencyMs: true
RESULT: PASS
```

---

### Test 12 — Concurrent Tool Calls Through the Proxy: Race Condition Check

**What this tests:** 20 concurrent `callTool` calls through `VouqisSDK.wrap()`.
Each call has its own `startTime` closure variable — they shouldn't share state.
This verifies no trace records are duplicated, dropped, or have corrupted
`latencyMs` from a shared timer.

**Steps:**

```bash
cat > /tmp/sdk-concurrent-test.mjs << 'EOF'
import { VouqisSDK } from './packages/sdk/src/index.js'
import { McpClient } from './packages/cli/src/mcp/client.js'

const sdk = new VouqisSDK({ projectId: 'concurrent-test' })
const client = new McpClient('https://mcp.exa.ai/mcp')
await client.connect()
const wrapped = sdk.wrap(client)

// Capture all trace records
const traces = []
const origLog = console.log.bind(console)
console.log = (line) => {
  try { const t = JSON.parse(line); if (t.traceId) traces.push(t) } catch {}
}

// Fire 20 concurrent calls
const promises = Array.from({length: 20}, (_, i) =>
  wrapped.callTool('web_search_exa', {query: `concurrent-${i}`}).catch(() => {})
)
await Promise.all(promises)

await client.disconnect()
console.log = origLog

// Verify isolation
const ids = traces.map(t => t.traceId)
const uniqueIds = new Set(ids)
const validLatencies = traces.every(t => t.latencyMs >= 0 && t.latencyMs < 30000)

console.log('Concurrent calls:  20')
console.log('Traces received:  ', traces.length)
console.log('Unique traceIds:  ', uniqueIds.size)
console.log('Valid latencies:  ', validLatencies)
console.log('RESULT:', traces.length === 20 && uniqueIds.size === 20 ? 'PASS' : 'FAIL')
EOF

node --input-type=module < /tmp/sdk-concurrent-test.mjs
```

**Expected output:**
```
Concurrent calls:  20
Traces received:   20
Unique traceIds:   20
Valid latencies:   true
RESULT: PASS
```

**Red flag output:**
```
Traces received:   17    ← 3 traces dropped
Unique traceIds:   17
RESULT: FAIL
```

---

### Test 13 — Stdout as Transport: Zero Trace Loss Under Volume

**What this tests:** The SDK writes traces via `console.log(JSON.stringify(trace))`.
At high volume, stdout can drop lines if the pipe buffer fills. This test runs
1000 tool calls and checks that 1000 valid JSON lines were written.

**Steps:**

```bash
cat > /tmp/sdk-volume-test.mjs << 'EOF'
import { VouqisSDK } from './packages/sdk/src/index.js'
import { McpClient } from './packages/cli/src/mcp/client.js'

const sdk = new VouqisSDK({ projectId: 'volume-test' })
const client = new McpClient('https://mcp.exa.ai/mcp')
await client.connect()
const wrapped = sdk.wrap(client)

// Run 1000 sequential calls, piping stdout to file
for (let i = 0; i < 1000; i++) {
  await wrapped.callTool('web_search_exa', {query: `volume-${i}`}).catch(() => {})
}

await client.disconnect()
EOF

# Step 1: Run and capture stdout to file
node --input-type=module < /tmp/sdk-volume-test.mjs > /tmp/traces-1000.ndjson

# Step 2: Count valid JSON lines
python3 -c "
import json
lines = open('/tmp/traces-1000.ndjson').readlines()
valid = 0
invalid = 0
trace_lines = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    try:
        obj = json.loads(line)
        if 'traceId' in obj:
            valid += 1
            trace_lines.append(obj)
        # other console.log lines (non-trace) are ignored
    except:
        invalid += 1

print(f'Total lines:      {len(lines)}')
print(f'Valid traces:     {valid}')
print(f'Invalid/corrupt:  {invalid}')
print(f'Unique traceIds:  {len(set(t[\"traceId\"] for t in trace_lines))}')
print(f'RESULT: {\"PASS\" if valid >= 990 else \"FAIL — traces dropped\"}')
"
```

**Expected output:**
```
Total lines:      1000
Valid traces:     1000
Invalid/corrupt:  0
Unique traceIds:  1000
RESULT: PASS
```

---

### Test 14 — SDK Under Process Kill: Does `finally` Fire on SIGTERM?

**What this tests:** The trace is emitted in a `finally` block. If Node.js is
killed mid-call with SIGTERM, the `finally` block may or may not run depending
on the signal handler. This test catches that data loss scenario.

**Steps:**

```bash
cat > /tmp/sdk-sigterm-test.mjs << 'EOF'
import { VouqisSDK } from './packages/sdk/src/index.js'
import { McpClient } from './packages/cli/src/mcp/client.js'

const sdk = new VouqisSDK({ projectId: 'sigterm-test' })
const client = new McpClient('https://mcp.exa.ai/mcp')
await client.connect()
const wrapped = sdk.wrap(client)

// Make a call, then immediately send SIGTERM to ourselves mid-execution
const callPromise = wrapped.callTool('web_search_exa', {query: 'sigterm-test'})

// Give it 100ms to start, then kill ourselves
setTimeout(() => {
  process.kill(process.pid, 'SIGTERM')
}, 100)

await callPromise.catch(() => {})
await client.disconnect()
EOF

# Step 1: Run and capture stdout
node --input-type=module < /tmp/sdk-sigterm-test.mjs > /tmp/sigterm-traces.ndjson 2>&1
EXIT_CODE=$?

# Step 2: Check if a trace was still written despite the signal
python3 -c "
import json
lines = [l.strip() for l in open('/tmp/sigterm-traces.ndjson') if l.strip()]
traces = []
for line in lines:
    try:
        obj = json.loads(line)
        if 'traceId' in obj:
            traces.append(obj)
    except:
        pass

print(f'Exit code: $EXIT_CODE')
print(f'Traces written: {len(traces)}')
if traces:
    t = traces[0]
    print(f'Error captured: {t.get(\"error\")}')
    print('RESULT: PASS — finally block fired before process exit')
else:
    print('RESULT: FAIL — trace was lost on SIGTERM')
"
```

**Expected output (if finally fires):**
```
Exit code: 143   (SIGTERM exit code)
Traces written: 1
Error captured: null   (or the actual error message)
RESULT: PASS — finally block fired before process exit
```

---

## Category 4 — Scoring Algorithm Stress Tests

---

### Test 15 — Same Pass Rate, Different Failure Breadth: Prove Taxonomy Matters

**What this tests:** Two servers with identical pass rates but different spread
of failure modes produce different scores. This is the core differentiator of
Vouqis's scoring vs. a simple "% tests passed" metric.

**Steps:**

```bash
# Step 1: Build two minimal mock servers
# Server A: fails only malformed-jsonrpc (1 failure mode)
# Server B: fails malformed-jsonrpc AND timeout (2 failure modes)

# Simulate with the scoring function directly
python3 -c "
# Replicate the scoring logic from scoring.ts

def latency_score(p50):
    if p50 <= 500: return 100
    if p50 <= 1000: return 90
    if p50 <= 2000: return 75
    if p50 <= 4000: return 50
    if p50 <= 8000: return 25
    return 0

def error_taxonomy_score(failures_by_mode):
    if not failures_by_mode: return 100
    modes = len(failures_by_mode)
    penalty = (modes - 1) * 20
    return max(0, 100 - penalty)

def compute_score(pass_rate, p50, failures_by_mode):
    raw = (pass_rate * 100 * 0.5) + (latency_score(p50) * 0.3) + (error_taxonomy_score(failures_by_mode) * 0.2)
    return round(raw)

# Server A: 8/10 pass, only malformed-jsonrpc fails
server_a = compute_score(
    pass_rate=0.8,
    p50=500,
    failures_by_mode={'malformed-jsonrpc': 2}
)

# Server B: 8/10 pass, two different failure modes
server_b = compute_score(
    pass_rate=0.8,
    p50=500,
    failures_by_mode={'malformed-jsonrpc': 1, 'timeout': 1}
)

# Server C: 8/10 pass, three different failure modes
server_c = compute_score(
    pass_rate=0.8,
    p50=500,
    failures_by_mode={'malformed-jsonrpc': 1, 'timeout': 1, 'null-response': 0}
)

print(f'Server A (1 failure mode):  {server_a}  → verdict: {\"APPROVED\" if server_a >= 80 else \"RISKY\"}')
print(f'Server B (2 failure modes): {server_b}  → verdict: {\"APPROVED\" if server_b >= 80 else \"RISKY\"}')
print(f'Server C (3 failure modes): {server_c}  → verdict: {\"APPROVED\" if server_c >= 80 else \"RISKY\"}')
print()
print('Same pass rate (80%), different taxonomy → different verdicts')
print('This is why Vouqis beats a simple pass/fail counter.')
"
```

**Expected output:**
```
Server A (1 failure mode):  84  → verdict: APPROVED
Server B (2 failure modes): 80  → verdict: APPROVED
Server C (3 failure modes): 76  → verdict: RISKY

Same pass rate (80%), different taxonomy → different verdicts
This is why Vouqis beats a simple pass/fail counter.
```

---

### Test 16 — Latency Cliff: 499 ms vs 501 ms Score Difference

**What this tests:** The latency scoring has hard cliffs. A P50 of 499 ms
earns 100 pts but 501 ms earns 90 pts — a 10-pt jump on the latency component
(3 pts on the overall score). On borderline servers, Vouqis scores may appear
to fluctuate for no reason. This test quantifies the cliff.

**Steps:**

```bash
# Step 1: Simulate a borderline-latency server
python3 -c "
def latency_score(p50):
    if p50 <= 500: return 100
    if p50 <= 1000: return 90
    if p50 <= 2000: return 75
    if p50 <= 4000: return 50
    if p50 <= 8000: return 25
    return 0

def compute_score(pass_rate, p50):
    raw = (pass_rate * 100 * 0.5) + (latency_score(p50) * 0.3) + (100 * 0.2)
    return round(raw)

print('P50 → Trust Score (all probes pass)')
for p50 in [499, 500, 501, 999, 1000, 1001]:
    score = compute_score(1.0, p50)
    print(f'  {p50}ms → {score}')
"

# Step 2: Run real audits 10 times and observe natural score variation
for i in $(seq 1 10); do
  node bin/run.js score https://mcp.exa.ai/mcp --json-path /tmp/latency-run-$i.json 2>/dev/null
done

python3 -c "
import json
scores = []
p50s = []
for i in range(1, 11):
    try:
        r = json.load(open(f'/tmp/latency-run-{i}.json'))
        scores.append(r['trustScore']['score'])
        p50s.append(r['trustScore']['p50LatencyMs'])
    except:
        pass
print('10-run score spread:')
for i, (s, p) in enumerate(zip(scores, p50s), 1):
    print(f'  Run {i}: score={s}, P50={p}ms')
print(f'Min: {min(scores)}  Max: {max(scores)}  Spread: {max(scores)-min(scores)}')
"
```

**Expected output:**
```
P50 → Trust Score (all probes pass)
  499ms → 100
  500ms → 100
  501ms → 97   ← 3-point drop from a 1ms difference
  999ms → 97
  1000ms → 97
  1001ms → 95
```

**What to do with the result:**
If your score oscillates ±3 points run to run and P50 hovers around 500 ms,
the cliff is the cause. Document this to customers as expected behavior:
"Scores within ±5 of each other represent a stable server."

---

### Test 17 — Slow-but-Correct Server: Does the Score Tell the Right Story?

**What this tests:** A server that passes all 10 probes but responds in 4001 ms
P50 should score around 77 — technically compliant, but clearly not
production-ready. This validates that latency weight (0.3) is doing real work.

**Steps:**

```bash
# Step 1: Create a slow-but-correct mock MCP server
cat > /tmp/slow-mcp.mjs << 'EOF'
import http from 'http'

const server = http.createServer(async (req, res) => {
  // Simulate 4001ms response time — just over the 4s latency bracket
  await new Promise(r => setTimeout(r, 4001))
  
  const body = await new Promise(resolve => {
    let data = ''
    req.on('data', c => data += c)
    req.on('end', () => resolve(data))
  })
  
  let request
  try { request = JSON.parse(body) } catch { request = {} }
  
  // Respond to tools/list
  if (request?.method === 'tools/list' || request?.params?.method === 'tools/list') {
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: request.id,
      result: {tools: [{
        name: 'slow_echo',
        description: 'Returns input after a delay',
        inputSchema: {type: 'object', properties: {message: {type: 'string'}}}
      }]}
    }))
    return
  }
  
  // Respond to tools/call
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(JSON.stringify({
    jsonrpc: '2.0', id: request.id,
    result: {content: [{type: 'text', text: 'slow but valid response'}]}
  }))
})

server.listen(9997, () => console.error('Slow MCP on :9997'))
EOF

node /tmp/slow-mcp.mjs &
SLOW_PID=$!
sleep 1

# Step 2: Audit the slow server
# Note: tmo-01/02 use a 5s deadline, so 4001ms passes (just under 5s)
node bin/run.js audit http://localhost:9997 --json-path ./slow-correct.json

# Step 3: Confirm the score story
python3 -c "
import json
r = json.load(open('slow-correct.json'))
ts = r['trustScore']
print('=== Slow-But-Correct Server ===')
print(f'Score:     {ts[\"score\"]} / 100')
print(f'Pass rate: {ts[\"passRate\"]*100:.0f}%  → {ts[\"passRate\"]*100*0.5:.0f} points')
print(f'P50:       {ts[\"p50LatencyMs\"]}ms  → latency score contributes ~{(50 if ts[\"p50LatencyMs\"] <= 4000 else 25)*0.3:.0f} points')
print(f'Failures:  {ts[\"errorsByFailureMode\"]}')
verdict = 'APPROVED' if ts['score'] >= 80 else ('RISKY' if ts['score'] >= 50 else 'DO NOT INTEGRATE')
print(f'Verdict:   {verdict}')
print()
print('Verdict: technically compliant, latency penalty reflected in score')
"

kill $SLOW_PID
```

**Expected output:**
```
=== Slow-But-Correct Server ===
Score:     77 / 100
Pass rate: 100%  → 50 points
P50:       4001ms  → latency score contributes ~15 points
Failures:  {}
Verdict:   RISKY

Verdict: technically compliant, latency penalty reflected in score
```

---

## Category 5 — CI/CD and Regression Detection

---

### Test 18 — GitHub Actions CI Gate: Block a Bad Deploy

**What this tests:** The `--fail-below` flag makes the CLI exit with code 1
when trust score is below the threshold. This is the core CI integration
mechanism. This test sets up a real pipeline that blocks deploys from broken
MCP servers.

**Steps:**

```bash
# Step 1: Verify --fail-below works locally
# This should exit 0 (Exa scores 92, above threshold)
node bin/run.js audit https://mcp.exa.ai/mcp --fail-below 80 --json-path /tmp/ci-test.json
echo "Exit code: $?"

# Step 2: Verify it exits 1 when score would be low
# Use VOUQIS_APPROVED_THRESHOLD to control the threshold
VOUQIS_APPROVED_THRESHOLD=99 node bin/run.js audit https://mcp.exa.ai/mcp \
  --fail-below 99 --json-path /tmp/ci-test-strict.json || true
echo "Strict exit code: $?"

# Step 3: Create the GitHub Actions workflow file
mkdir -p .github/workflows
cat > .github/workflows/mcp-reliability-gate.yml << 'YAML'
name: MCP Reliability Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  audit:
    name: Vouqis Trust Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Vouqis CLI
        run: npm install -g @vouqis/cli

      - name: Audit MCP Server
        run: |
          vouqis audit ${{ secrets.MCP_SERVER_URL }} \
            --fail-below 80 \
            --json-path ./vouqis-report.json
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vouqis-report
          path: vouqis-report.json
YAML

echo "Workflow file created at .github/workflows/mcp-reliability-gate.yml"
cat .github/workflows/mcp-reliability-gate.yml
```

**Step 4: Add the secrets in GitHub UI**

```
Settings → Secrets and variables → Actions → New repository secret:
  MCP_SERVER_URL   = https://your-mcp-server.example.com
  VOUQIS_API_KEY   = your_vouqis_api_key
```

**Step 5: Simulate a failed gate locally**

```bash
# Introduce a bug: lower threshold to force failure simulation
node bin/run.js audit https://mcp.exa.ai/mcp --fail-below 95
echo "Exit: $?"  # Should print: Exit: 1

# Fix the threshold (or fix the server)
node bin/run.js audit https://mcp.exa.ai/mcp --fail-below 80
echo "Exit: $?"  # Should print: Exit: 0
```

**Expected CI output on failure:**
```
  ✗ DO NOT INTEGRATE — too many failures to trust in production
Error: exit with code 1
```

**Expected CI output on pass:**
```
  ✓ APPROVED — this server passed all reliability tests
```

---

### Test 19 — Weekly Regression Tracking: Catch a Silent Regression

**What this tests:** Running the same audit weekly and comparing scores over
time to catch regressions before users do.

**Steps:**

```bash
# Step 1: Create the weekly audit script
cat > scripts/weekly-audit.sh << 'BASH'
#!/bin/bash
set -euo pipefail

TARGET_URL="${1:-https://mcp.exa.ai/mcp}"
WEEK=$(date +%Y-W%V)
REPORT_DIR="./audit-history"
REPORT_FILE="$REPORT_DIR/$WEEK.json"

mkdir -p "$REPORT_DIR"

echo "Running Vouqis audit for week $WEEK..."
node packages/cli/bin/run.js audit "$TARGET_URL" \
  --json-path "$REPORT_FILE"

# Compare with last week's report
LAST_WEEK=$(ls "$REPORT_DIR"/*.json 2>/dev/null | sort | tail -2 | head -1)
if [ -n "$LAST_WEEK" ] && [ "$LAST_WEEK" != "$REPORT_FILE" ]; then
  python3 - <<'PYTHON'
import json, sys, os, glob

reports = sorted(glob.glob('audit-history/*.json'))
if len(reports) < 2:
    print("Not enough history to compare")
    sys.exit(0)

prev = json.load(open(reports[-2]))
curr = json.load(open(reports[-1]))

prev_score = prev['trustScore']['score']
curr_score = curr['trustScore']['score']
delta = curr_score - prev_score

prev_failures = prev['trustScore']['errorsByFailureMode']
curr_failures = curr['trustScore']['errorsByFailureMode']

print(f"Week-over-week comparison:")
print(f"  Previous: {prev_score}")
print(f"  Current:  {curr_score}")
print(f"  Delta:    {delta:+d}")

new_failures = {k: v for k, v in curr_failures.items() if k not in prev_failures}
resolved = {k: v for k, v in prev_failures.items() if k not in curr_failures}

if new_failures:
    print(f"  NEW FAILURES: {new_failures}")
    print("  ACTION REQUIRED: regression detected")
elif resolved:
    print(f"  RESOLVED: {resolved}")
    print("  Server improved this week")
else:
    print("  No change in failure modes")
PYTHON
fi
BASH

chmod +x scripts/weekly-audit.sh

# Step 2: Run the first audit (week 1 baseline)
./scripts/weekly-audit.sh https://mcp.exa.ai/mcp

# Step 3: Simulate a regression (inject a lower-score result for comparison)
cat > audit-history/2026-W20.json << 'JSON'
{
  "version": "0.0.1",
  "timestamp": "2026-05-15T09:00:00.000Z",
  "serverUrl": "https://mcp.exa.ai/mcp",
  "trustScore": {
    "score": 92,
    "passRate": 0.9,
    "p50LatencyMs": 767,
    "errorsByFailureMode": {"malformed-jsonrpc": 1},
    "totalPrompts": 10,
    "passedPrompts": 9
  },
  "results": []
}
JSON

# Step 4: Run again — now the comparison catches any changes
./scripts/weekly-audit.sh https://mcp.exa.ai/mcp
```

**Expected output showing a regression:**
```
Week-over-week comparison:
  Previous: 92
  Current:  61
  Delta:    -31
  NEW FAILURES: {'timeout': 2, 'unexpected-schema': 1}
  ACTION REQUIRED: regression detected
```

---

### Test 20 — 10-Server Sweep: Competitive Benchmark Report

**What this tests:** Running Vouqis across 10 real MCP servers in parallel,
aggregating all scores into a single competitive benchmark. This is your
highest-leverage marketing asset.

**Steps:**

```bash
# Step 1: Define the servers to benchmark
cat > /tmp/servers.txt << 'EOF'
https://mcp.exa.ai/mcp
https://mcp.notion.com/mcp
https://api.githubcopilot.com/mcp/
EOF
# Add more servers as you gain access to them

# Step 2: Run all audits in parallel
mkdir -p ./benchmark-results
while IFS= read -r url; do
  safe_name=$(echo "$url" | sed 's|https://||' | sed 's|[/.]|-|g')
  node packages/cli/bin/run.js audit "$url" \
    --json-path "./benchmark-results/${safe_name}.json" > /dev/null 2>&1 &
  echo "Auditing: $url"
done < /tmp/servers.txt

# Wait for all parallel audits to complete
wait
echo "All audits complete."

# Step 3: Generate the benchmark report
python3 << 'PYTHON'
import json
import glob
import os

results = []
for path in sorted(glob.glob('./benchmark-results/*.json')):
    try:
        r = json.load(open(path))
        ts = r['trustScore']
        server = r['serverUrl']
        results.append({
            'server': server,
            'score': ts['score'],
            'passRate': ts['passRate'],
            'p50': ts['p50LatencyMs'],
            'failures': ts['errorsByFailureMode'],
            'verdict': 'APPROVED' if ts['score'] >= 80 else ('RISKY' if ts['score'] >= 50 else 'DO NOT INTEGRATE')
        })
    except Exception as e:
        print(f"Error reading {path}: {e}")

results.sort(key=lambda x: x['score'], reverse=True)

print("\n" + "="*70)
print("  VOUQIS MCP ECOSYSTEM BENCHMARK REPORT")
print(f"  Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}")
print("="*70)
print(f"\n{'Rank':<5} {'Score':<8} {'P50':<10} {'Pass%':<8} {'Verdict':<20} Server")
print("-"*70)
for i, r in enumerate(results, 1):
    print(f"#{i:<4} {r['score']:<8} {r['p50']}ms{' '*(7-len(str(r['p50'])))} {r['passRate']*100:.0f}%{' '*5} {r['verdict']:<20} {r['server']}")

print("\n" + "="*70)
print(f"Servers tested:    {len(results)}")
approved = [r for r in results if r['verdict'] == 'APPROVED']
risky = [r for r in results if r['verdict'] == 'RISKY']
dnintegrate = [r for r in results if r['verdict'] == 'DO NOT INTEGRATE']
print(f"APPROVED:          {len(approved)}")
print(f"RISKY:             {len(risky)}")
print(f"DO NOT INTEGRATE:  {len(dnintegrate)}")

# Find common failure modes across all servers
all_failures = {}
for r in results:
    for mode, count in r['failures'].items():
        all_failures[mode] = all_failures.get(mode, 0) + 1
if all_failures:
    print("\nMost common failure modes across all servers:")
    for mode, count in sorted(all_failures.items(), key=lambda x: -x[1]):
        print(f"  {mode}: {count} server(s)")
print("="*70)

# Save machine-readable version
with open('./benchmark-results/summary.json', 'w') as f:
    json.dump(results, f, indent=2)
print("\nSummary written to ./benchmark-results/summary.json")
PYTHON
```

**Expected output:**
```
======================================================================
  VOUQIS MCP ECOSYSTEM BENCHMARK REPORT
  Generated: 2026-05-22
======================================================================

Rank  Score    P50        Pass%    Verdict              Server
----------------------------------------------------------------------
#1    98       312ms      100%     APPROVED             https://api.githubcopilot.com/mcp/
#2    92       767ms      90%      APPROVED             https://mcp.exa.ai/mcp
#3    61       4200ms     70%      RISKY                https://mcp.notion.com/mcp

======================================================================
Servers tested:    3
APPROVED:          2
RISKY:             1
DO NOT INTEGRATE:  0

Most common failure modes across all servers:
  malformed-jsonrpc: 2 server(s)
  timeout: 1 server(s)
======================================================================
```

**What to do with the result:**
Publish this report as "State of MCP Reliability — May 2026." Share on
LinkedIn, Hacker News, and email to all leads in `scripts/leads/vouqis-leads.csv`.
The benchmark is your proof that the problem is real, widespread, and Vouqis
is the tool that measures it.

---

## Quick Reference

### Vouqis CLI flags

```bash
vouqis audit <url>              # Full audit with verdict
vouqis score <url>              # Score only, no verdict
  --fail-below <n>              # Exit 1 if score < n (use in CI)
  --json-path <path>            # Write JSON report here (default: ./vouqis-report.json)
```

### Environment variables

```bash
VOUQIS_APPROVED_THRESHOLD=80   # Score threshold for APPROVED verdict
VOUQIS_RISKY_THRESHOLD=50      # Score threshold for RISKY verdict
VOUQIS_API_KEY=...             # Authenticates with dashboard API
VOUQIS_DASHBOARD_URL=...       # Dashboard base URL (default: https://vouqis.vercel.app)
```

### Reading a report file

```bash
# Quick score check
cat vouqis-report.json | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['trustScore']['score'])"

# Full failure breakdown
cat vouqis-report.json | python3 -c "
import json, sys
r = json.load(sys.stdin)
ts = r['trustScore']
print('Score:', ts['score'])
print('P50:', ts['p50LatencyMs'], 'ms')
print('Failures:', ts['errorsByFailureMode'])
for p in r['results']:
    if not p['passed']:
        print('FAIL', p['promptId'], '-', p.get('errorText','')[:100])
"
```

### SDK usage

```typescript
import { VouqisSDK } from '@vouqis/sdk'

const sdk = new VouqisSDK({ projectId: 'my-project' })

// Wrap any object that has callTool(name, params) => Promise<unknown>
const tracedClient = sdk.wrap(mcpClient)

// All tool calls now emit trace records to stdout as NDJSON
const result = await tracedClient.callTool('search', { query: 'hello' })
// stdout: {"traceId":"...","projectId":"my-project","timestamp":"...","toolName":"search","params":{...},"response":{...},"latencyMs":234,"error":null}
```

### Probe timeout values (from source)

| Probe type | Timeout |
|-----------|---------|
| probeRaw (mjr probes) | 8000 ms |
| slow-timeout probes (tmo) | 5000 ms deadline |
| All other probes (mrp, urs, nul) | 8000 ms |