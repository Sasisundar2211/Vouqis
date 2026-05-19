# VOUQIS — Product Requirements Document
### Version 1.0 | May 2026 | Confidential

---

> *"Every MCP server that ships without a trust score is a bet your customers will never notice the crash."*

---

## TABLE OF CONTENTS

1. [The One-Liner](#1-the-one-liner)
2. [The Problem — Brutally Honest](#2-the-problem)
3. [What Vouqis Is](#3-what-vouqis-is)
4. [Market Evidence — Real Numbers](#4-market-evidence)
5. [Target Users & Customers](#5-target-users--customers)
6. [Core User Loop](#6-core-user-loop)
7. [Competitive Analysis](#7-competitive-analysis)
8. [Moat & Defensibility](#8-moat--defensibility)
9. [Tech Stack & Architecture](#9-tech-stack--architecture)
10. [How It Works in Real Time](#10-how-it-works-in-real-time)
11. [MVP Scope](#11-mvp-scope)
12. [Business Model](#12-business-model)
13. [Go-To-Market Strategy](#13-go-to-market-strategy)
14. [Timeline](#14-timeline)
15. [YC & Investor Q&A](#15-yc--investor-qa)
16. [FOMO Signal](#16-fomo-signal)
17. [Naming, Domain & Brand](#17-naming-domain--brand)
18. [Logo Specification](#18-logo-specification)
19. [Industry, Category & Classification](#19-industry-category--classification)
20. [Strengths & Weaknesses — No Sugar-Coating](#20-strengths--weaknesses)
21. [The Statement to the World](#21-the-statement-to-the-world)

---

## 1. THE ONE-LINER

**Vouqis scores any MCP server for reliability before your AI agent trusts it.**

Longer version for investors:
> Vouqis is the trust layer for the MCP ecosystem — a CLI + dashboard that probes any MCP server with five deterministic tests and returns a 0–100 reliability score, a shareable report URL, and CI/CD gate integration, so engineering teams know whether a tool server will hold up in production before a single user hits it.

---

## 2. THE PROBLEM — BRUTALLY HONEST

### What Actually Happens in Production Today

Your AI agent calls an MCP server. The server responds. The agent says "done." You ship it. Three days later a customer's task silently produces nothing, and your agent reported success.

This is not an edge case. It is the default state.

A 2026 stress test of 100 MCP servers across 12,000 trials found:
- **Median server passes only 71% of tasks**
- **Five chained tools at 71% reliability each succeed only 18% end-to-end**
- **GitHub stars have zero correlation with pass rate** — the most-starred server ranked 41st by reliability
- **P95 latency: 1,840ms. P99: 6,200ms** — far beyond the 500ms threshold users notice

The failure modes are not random. They cluster:
| Failure Type | Frequency |
|---|---|
| Schema mismatch (response doesn't match contract) | 38% |
| Timeouts | 24% |
| Auth/quota errors | 19% |
| Upstream API failures | 12% |
| MCP protocol violations | 7% |

*Source: Digital Applied — 100 MCP Servers Stress-Tested (2026)*

### The Production Incident Record

These are not hypotheticals. These are documented, named failures from 2025–2026:

| Incident | Impact | Root Cause |
|---|---|---|
| Asana MCP data leak (May–Jun 2025) | Customer data exposed across MCP instances for 2 weeks | Cross-tenant data isolation failure |
| Smithery path traversal (Jun 2025) | 3,243 hosted servers exposed; thousands of API keys leaked | MCP hosting infrastructure flaw |
| CVE-2025-6514 | Critical CVSS 9.6 RCE in mcp-remote npm (150M+ downloads affected) | OS command injection in OAuth discovery |
| CVE-2025-53110 / 53109 | Filesystem MCP sandbox escapes via path/symlink bypass | Path validation failure |
| Anthropic MCP RCE (Jan 2026) | Design vulnerability enabling arbitrary code execution | Supply chain attack surface |

*Sources: SC Media, The Hacker News, Data Science Dojo, NVD*

### Why Nobody Fixed This Yet

Current tools don't touch the running server. Every existing "MCP trust" tool — MCPSkills, MCP Scorecard, mcp-trust-radar — does static analysis of GitHub metadata. They check: how many stars does this repo have? When was the last commit? Does it have a license?

None of them fire a real request at the server and ask: *does it actually work?*

The MCP Inspector (Anthropic's official debugging tool) is interactive and manual — one call at a time, no scoring, no CI integration, no history. It is a debugger. It is not an auditor.

Vouqis is the auditor.

---

## 3. WHAT VOUQIS IS

### The Product

A CLI tool and dashboard that:

1. Connects to any MCP server via JSON-RPC (no SDK installation on the server required)
2. Discovers the server's available tools
3. Fires **5 deterministic probe types × 2 probes each = 10 total probes**
4. Measures every response time
5. Computes a weighted **Trust Score (0–100)**
6. Returns a verdict: **APPROVED / RISKY / DO NOT INTEGRATE**
7. Writes a local JSON report and a shareable URL at `vouqis.vercel.app/report/<id>`
8. Exits with code 1 in CI if score falls below your threshold (`--fail-below 80`)

### The Five Probes

| Probe ID | What It Tests | Pass Condition |
|---|---|---|
| `mal-01/02` | Malformed JSON-RPC rejection | Server returns 4xx, not 2xx with garbage |
| `mis-01/02` | Missing required parameter handling | Server returns structured error, not silent null |
| `tmo-01/02` | Latency under target (<500ms P50) | Response arrives within threshold |
| `sch-01/02` | Schema compliance | Response matches declared output shape |
| `nul-01/02` | Non-empty response | Server returns actual content, not `[]` or `null` |

### The Trust Score Algorithm

```
Trust Score = (Pass Rate × 0.50) + (Latency Score × 0.30) + (Error Diversity Score × 0.20)
```

| Signal | Weight | Rationale |
|---|---|---|
| Pass rate | 50% | Fraction of probes answered correctly |
| P50 latency | 30% | Median response time — real user experience |
| Error taxonomy | 20% | Failures across many modes = systemic fragility |

The 20% error diversity weight is non-obvious and important: a server that fails 4 times in one mode is probably one bug. A server that fails 4 times across 4 modes is architecturally broken. The score punishes breadth of failure more than depth.

### The Verdicts

| Score | Verdict | Meaning |
|---|---|---|
| 80–100 | APPROVED | Ship it |
| 50–79 | RISKY | Review before production |
| 0–49 | DO NOT INTEGRATE | Something fundamental is broken |

---

## 4. MARKET EVIDENCE — REAL NUMBERS

### The MCP Ecosystem Is Growing at Unprecedented Speed

| Metric | Value | Source |
|---|---|---|
| MCP servers in registries (mid-2026) | 9,400–21,164 | Smithery, mcp.so, automationswitch |
| MCP SDK cumulative downloads | 97 million | Digital Applied, March 2026 |
| YoY server growth | 7.8× | Q1 2025: ~1,200 → Q2 2026: ~9,400 |
| Enterprise teams with MCP in production | 78% | Zuplo MCP Report 2026 |
| Fortune 500 companies using MCP | 28% (Q1 2025) | Digital Applied |
| GitHub repos tagged `mcp-server` | 7,800 | GitHub search |
| Developers actively building with MCP | 100,000+ | Composio's stated user base as proxy |

*"Growing faster than any developer tool standard since Docker."* — Zuplo MCP Report

### The Demand Signal Is Quantified

- **38% of MCP builders say security/reliability concerns are actively blocking adoption** — Zuplo
- **24% of developers run MCP servers with no authentication** — Zuplo
- **Median server reliability: 71%** — Digital Applied stress test
- **Only 5% of enterprise generative AI systems reach production** — Gartner via Arize
- **Gartner predicts 40%+ of agentic AI projects will be canceled by 2027** — primarily due to reliability failures

These numbers are Vouqis' core sales pitch: the unreliability is documented, quantified, and universal.

### The AI Agent Market That Depends on This

| Market | 2025 Size | 2030–2033 Projection | CAGR |
|---|---|---|---|
| AI Agents | $7.63B | $182.97B | 49.6% |
| AI Developer Tools | $4.5B | $10B | ~17% |
| AI Code Tools | $7.65B | $9.46B (2026) | 23.7% |

*Sources: Grand View Research, Virtue Market Research, Digital Applied*

### VC Market Signal

- AI agent startups raised **$3.8B in 2024** — 3× the prior year
- **~50% of YC batches are now AI agent companies** — Winter 2025: 58/163; Spring 2025: 67/144
- YC explicitly has "Requests for Startups" in agent infrastructure
- **Braintrust**: $80M Series B at $800M valuation (February 2026)
- **Composio**: $29M raised, Lightspeed-led Series A
- **Arize**: $131M total, $70M Series C

The LLM observability space is commanding unicorn valuations. Vouqis is one layer below that stack — the MCP protocol layer — and that layer has zero well-funded incumbents focused on active behavioral testing.

---

## 5. TARGET USERS & CUSTOMERS

### Primary User (Who Runs the CLI)

**Backend / AI engineer at a company shipping an AI agent product**

- Integrates 3–10 MCP servers into their agent stack
- Cannot afford random tool failures reaching users
- Already runs linters, tests, and type checkers in CI — Vouqis is the natural next step
- Pain: discovered failures in production after a user complained
- Job-to-be-done: know whether an MCP server is reliable *before* integrating it

**Demographics:**
- 3–10 years experience
- Works in TypeScript or Python
- Uses GitHub Actions, Vercel, or similar CI
- Already in the AI tooling ecosystem (uses Cursor, Claude, Windsurf)
- Reads Hacker News, follows AI agent Twitter

### Secondary User (Who Watches the Dashboard)

**Engineering manager / tech lead** who needs a status view across all MCP integrations their team depends on. Not running the CLI — reading the dashboard after their team runs it.

### Exact Customers (Who Pays)

**Tier 1 — B2B SaaS companies building AI-native products**
- Examples: companies building AI coding assistants, AI customer support, AI scheduling, AI research tools
- They ship agents to thousands of end users — an unreliable MCP server is a customer-facing bug
- Budget: $50–200/month is trivial vs. engineer time debugging silent failures
- Buying trigger: first production incident from MCP failure

**Tier 2 — Enterprise engineering teams adopting AI agents**
- 28% of Fortune 500 companies have MCP in production already
- Compliance, reliability SLAs, and audit requirements make Vouqis a natural procurement purchase
- Budget: $500–2,000/month
- Buying trigger: security or compliance review of AI agent stack

**Tier 3 — MCP server publishers**
- Companies and developers who publish MCP servers to Smithery, mcp.so, or their own registry
- Use Vouqis score as a quality signal to publish and attract integrations
- Similar to npm audit score for package publishers
- Budget: free tier sufficient for publishing use case; pays for monitoring

### Exact Non-Customers (Who Won't Pay)

- **Hobbyist MCP builders**: Build one server for personal use, never have a reliability concern
- **Enterprise teams already captured by LangSmith/Braintrust**: Have existing observability budget allocated; adding Vouqis requires a new purchase order — friction is too high without a champion
- **Teams in pure LLM land (no MCP)**: Not relevant yet. This will change as MCP adoption grows

---

## 6. CORE USER LOOP

```
DISCOVER → AUDIT → DECIDE → MONITOR → PUBLISH
    ↑                                       |
    └───────────────────────────────────────┘
```

### 1. DISCOVER
Developer finds or builds an MCP server. Sees it on Smithery, mcp.so, or a vendor's docs.

### 2. AUDIT
```bash
vouqis audit https://mcp.example.com
```
One command. 10–30 seconds. Returns score, verdict, failure breakdown.

### 3. DECIDE
- Score ≥80: integrate
- Score 50–79: review failures, ask vendor to fix, re-audit
- Score <50: find alternative or fix the server yourself

### 4. MONITOR (Pro)
CI gate: `vouqis audit <url> --fail-below 80` in GitHub Actions.
Pipeline breaks if the server degrades. Team gets alerted before users do.

### 5. PUBLISH (Pro)
MCP server publishers embed their Vouqis score badge in README and Smithery listing.
Score becomes a trust signal for prospective integrators.
Creates a self-reinforcing loop: publishers want high scores → they fix servers → ecosystem improves.

---

## 7. COMPETITIVE ANALYSIS

### Overview Map

```
                    ACTIVE PROBE TESTING
                           │
                    HIGH   │   VOUQIS ← YOU ARE HERE
                           │
   STATIC         ─────────┼─────────   ACTIVE
   ANALYSIS               │
                    LOW    │   MCPSkills, MCP Scorecard,
                           │   mcp-trust-radar
                           │
                    ───────────────────────────────
                    LLM OBSERVABILITY / TRACING
                    (LangSmith, LangFuse, Helicone,
                     Arize, Braintrust)
                    
                    INTEGRATION BROKERS
                    (Composio, Klavis, Truto, Pipedream)
```

### Competitor-by-Competitor Breakdown

---

#### COMPOSIO
**What they do**: Integration broker. 1,000+ pre-built tool integrations exposed as hosted MCP servers. They own the servers and guarantee their uptime.

**Funding**: $29M | Lightspeed Series A (2025)
**GitHub stars**: 27,500
**Users**: 100,000 developers, $1M+ ARR

**Their reliability claim**: They monitor uptime of *their own* servers. They do not test *your* servers or third-party servers.

**Can they replace Vouqis?** No. If you're using a third-party MCP server (not hosted by Composio), Composio has no visibility into its reliability. Their business model depends on you using *their* integrations — auditing your own or third-party servers is competitive to their model, not complementary.

**Risk level to Vouqis**: Medium. Their distribution (100K developers) is a threat if they add a free audit tool as a top-of-funnel play.

| Feature | Composio | Vouqis |
|---|---|---|
| Tests third-party MCP servers | ✗ | ✓ |
| Active probe testing | ✗ | ✓ |
| Trust score (0–100) | ✗ | ✓ |
| CI/CD gate | ✗ | ✓ |
| Requires their own hosted servers | ✓ | ✗ |

---

#### LANGSMITH
**What they do**: LLM observability. Traces every LLM call, stores prompt versions, evaluates outputs, runs CI testing on AI pipelines.

**Funding**: $125M valuation (LangChain)
**Pricing**: Free → $39/seat/month

**Their MCP involvement**: They have an MCP server that exposes LangSmith data to AI assistants. They do not test external MCP servers.

**Can they replace Vouqis?** No. LangSmith operates at the LLM call layer. Vouqis operates at the MCP protocol layer. They see different things.

**LangSmith sees**: What the LLM was asked, what it returned, how long the inference took.
**Vouqis sees**: Whether the MCP server your agent calls is protocol-compliant and reliable.

**Risk level to Vouqis**: Low. LangSmith's business is LLM tracing. Adding active MCP endpoint testing would require a significant product pivot and compete with their own MCP server (which exposes LangSmith data).

| Feature | LangSmith | Vouqis |
|---|---|---|
| Tests MCP servers | ✗ | ✓ |
| Works without instrumentation | ✗ (requires SDK) | ✓ |
| Pre-integration audit | ✗ | ✓ |
| LLM call tracing | ✓ | ✗ |

---

#### SMITHERY
**What they do**: MCP server registry and distribution platform. Think npm for MCP servers. Hosts and deploys servers on-demand.

**Funding**: Seed, South Park Commons (undisclosed)
**Server count**: 6,000–7,300+ listed

**Notable**: Smithery had a path traversal vulnerability in June 2025 that exposed 3,243 hosted MCP deployments and thousands of API keys. The incident lasted until discovered by security researchers. Smithery had no active reliability or security monitoring on its hosted servers.

**Can they replace Vouqis?** No. They are a registry. But they are the most natural integration partner: a "Vouqis Score" badge on every Smithery listing (like npm's weekly downloads) would validate the server market and give Vouqis distribution to 100K developers overnight.

**Risk level to Vouqis**: Medium as a potential acquirer or feature competitor if they add scoring. Low as a current competitor.

| Feature | Smithery | Vouqis |
|---|---|---|
| Server discovery/registry | ✓ | ✗ |
| Active probe testing | ✗ | ✓ |
| Reliability scoring | ✗ | ✓ |
| CI/CD integration | ✗ | ✓ |

---

#### PIPEDREAM
**What they do**: Developer automation platform. Workflow orchestration, API integrations. Added MCP support as a feature.

**Status**: Acquired by Workday (November 2025). Now enterprise workflow infrastructure.

**Can they replace Vouqis?** No. Pipedream is Workday's integration layer. It is not in the MCP testing business. Post-acquisition, it is focused on enterprise workflow, not developer tooling.

**Risk level to Vouqis**: None. Workday doesn't build developer CLI tools.

---

#### KLAVIS AI
**What they do**: Open-source MCP infrastructure. Hosted MCP servers for 100+ tools, handles OAuth auth, pre-built clients.

**Funding**: $500K seed | YC X25 (2025)
**Pricing**: Free tier + ~$79/month paid

**Can they replace Vouqis?** No. Same pattern as Composio: they build and host MCP servers. They do not audit arbitrary third-party servers. Their users are exactly Vouqis' users — developers integrating MCP servers who need to know if they work.

**Risk level to Vouqis**: Low. Klavis is pre-revenue and has 50 employees equivalent resource constraints. A natural partner, not a competitor.

---

#### MCPEVALS.IO
**What they do**: LLM-based evaluation framework for MCP tools. You define test cases → GPT-4 scores the results → five-dimension ratings. GitHub Action and Node.js package.

**Funding**: None. Bootstrapped.
**Traction**: Minimal (no significant GitHub stars found)

**This is the closest functional competitor.** Unlike all others above, mcpevals.io actually tests MCP server *outputs* — not just static code.

**Why Vouqis wins:**

| Dimension | mcpevals.io | Vouqis |
|---|---|---|
| Test authoring | Required — you write test cases | None — zero setup |
| Scoring method | LLM inference (GPT-4, costs money per run) | Deterministic probes (no LLM cost) |
| Speed | Minutes per evaluation (LLM inference) | 10–30 seconds |
| Protocol coverage | Output quality only | Protocol compliance + output + latency |
| Third-party server audit | Requires test case writing per server | Point CLI at any URL |
| CI/CD gate | Via GitHub Action, complex setup | `--fail-below 80` flag |
| Dashboard | None | Shared at vouqis.vercel.app |

mcpevals.io answers "did my server return a *good* answer?" Vouqis answers "does my server *work* at all?" These are different questions. Both are valid. Vouqis is the first gate, mcpevals.io is a second, deeper gate.

**Risk level to Vouqis**: Low currently. Risk rises if they add deterministic protocol probes and CI tooling. Watch this one.

---

#### LANGFUSE
**What they do**: Open-source LLM engineering platform. Tracing, metrics, evaluations, prompt management.

**Status**: Acquired by ClickHouse (January 2026). ClickHouse raised $400M at $15B valuation.
**GitHub stars**: 21,000+ | 26M SDK installs/month | 19 of Fortune 50 customers

**Can they replace Vouqis?** No. LangFuse traces LLM application calls. It does not probe MCP server endpoints. The acquisition by ClickHouse means their roadmap is now data infrastructure, not new protocol testing capabilities.

**Risk level to Vouqis**: None. Different layer, now owned by a database company.

---

#### BRAINTRUST
**What they do**: AI observability and evaluation. Tracing, output scoring, prompt experiments, datasets.

**Funding**: $80M Series B | $800M valuation | ICONIQ, a16z, Greylock (February 2026)
**Pricing**: $0 starter → $249/month pro

**Can they replace Vouqis?** No. Braintrust evaluates LLM *output quality*. Premium enterprise tool for teams who already have working agents and need to evaluate their output quality systematically. Vouqis is for developers evaluating whether the tool *server* works at all.

**Different buyer**: Braintrust buyer is a data scientist or ML engineer managing model quality. Vouqis buyer is a backend/AI engineer integrating tool servers.

**Risk level to Vouqis**: Low functionally. High as a template for fundraising and positioning — they raised $80M in this space, which validates the broader category.

---

#### HELICONE
**What they do**: Open-source LLM observability and AI gateway. Proxies all LLM calls, logs them, calculates costs.

**Funding**: ~$1.5–2M | YC W23 (2023)
**GitHub stars**: 5,600+

**Can they replace Vouqis?** No. Helicone intercepts OpenAI/Anthropic SDK calls. It has nothing to do with MCP server endpoint testing.

**Risk level to Vouqis**: None.

---

#### ARIZE PHOENIX
**What they do**: Open-source AI observability. Traces agent execution via OpenTelemetry, runs LLM evaluations.

**Funding**: $131M total | $70M Series C (February 2025) | Microsoft M12, Datadog, PagerDuty
**GitHub stars**: 9,100+

**Can they replace Vouqis?** No currently. Arize traces agent runs post-integration. However: Arize is well-capitalized, has engineering depth, and works at the AI agent infrastructure layer. If MCP testing becomes a clearly demanded feature, Arize could build it.

**Risk level to Vouqis**: High as a potential competitive entrant (funding + team), Low as a current competitor (different product).

---

#### MCP MANAGER
**What they do**: Enterprise MCP gateway. RBAC/ABAC controls, PII detection, runtime guardrails, security monitoring for enterprise MCP deployments.

**Funding**: None found. Bootstrapped.
**GitHub stars**: ~2 (minimal traction)

**Can they replace Vouqis?** No. MCP Manager is infrastructure governance for enterprise deployments. Vouqis is a pre-integration audit tool. MCP Manager runs continuously inside an organization; Vouqis is a one-command test run from the CLI.

**Risk level to Vouqis**: None. No resources to compete.

---

#### TOOLRADAR
**What they actually are**: Two different products confused by the name. Neither tests MCP server protocol compliance. One is a software discovery database exposed as an MCP server; the other is AI tool pricing monitoring.

**Risk level to Vouqis**: None. Not a competitor.

---

#### TRUTO
**What they do**: Unified API platform for SaaS integrations exposed as MCP servers. Flat per-integration pricing model.

**Funding**: None. Self-funded.

**Can they replace Vouqis?** No. Truto builds MCP servers. Vouqis tests them. Their users are Vouqis' target customers.

**Risk level to Vouqis**: None. Natural partner.

---

### COMPETITIVE SUMMARY TABLE

| Competitor | Tests MCP Servers | Active Probes | CI/CD Gate | Trust Score | Funding |
|---|---|---|---|---|---|
| **Vouqis** | ✓ | ✓ | ✓ | ✓ | — |
| Composio | ✗ | ✗ | ✗ | ✗ | $29M |
| LangSmith | ✗ | ✗ | partial | ✗ | $125M valuation |
| Smithery | ✗ | ✗ | ✗ | ✗ | Seed |
| Pipedream | ✗ | ✗ | ✗ | ✗ | Acquired |
| Klavis | ✗ | ✗ | ✗ | ✗ | $500K |
| mcpevals.io | partial (LLM eval) | ✗ | partial | ✗ | $0 |
| LangFuse | ✗ | ✗ | ✗ | ✗ | Acquired |
| Braintrust | ✗ | ✗ | ✗ | ✗ | $80M |
| Helicone | ✗ | ✗ | ✗ | ✗ | $2M |
| Arize Phoenix | ✗ | ✗ | ✗ | ✗ | $131M |
| MCP Manager | ✗ | ✗ | ✗ | ✗ | $0 |
| ToolRadar | ✗ | ✗ | ✗ | ✗ | $0 |
| Truto | ✗ | ✗ | ✗ | ✗ | $0 |

**Vouqis is the only product with all four capabilities.** No funded competitor has them.

---

## 8. MOAT & DEFENSIBILITY

### Moat 1: Data Network Effect

Every `vouqis audit` run generates structured probe result data — latency distributions, failure modes, schema compliance — for a specific server URL. As runs accumulate:

- Vouqis builds the largest dataset of MCP server behavioral profiles in existence
- Historical trends reveal server degradation before users notice
- Aggregate failure mode data reveals MCP ecosystem-wide patterns (e.g., "78% of servers fail schema validation at >50ms latency")
- This data is defensible — competitors cannot retroactively collect it

### Moat 2: Developer Muscle Memory

`vouqis audit <url>` is one command. Once a developer runs it three times, it becomes habit. Developer tools with simple, memorable commands and fast feedback loops create strong habit loops. The comparison: `npm audit` is now expected on every Node project. Vouqis' goal is to become expected on every MCP integration.

### Moat 3: CI Integration Lock-In

Once `vouqis audit --fail-below 80` is in a GitHub Actions workflow, removing it requires an active decision. Inertia keeps it there. As teams build reliability SLAs around the score threshold, the switching cost grows.

### Moat 4: Registry Integration

A partnership with Smithery or mcp.so to display Vouqis scores natively on every listing creates distribution that no competitor can replicate without the same partnership. First-mover here matters.

### Moat 5: Ecosystem Trust Signal

If Vouqis scores become the de facto trust signal for MCP servers — the way SSL padlocks became the trust signal for websites — the brand becomes definitional. "What's your Vouqis score?" becomes the question enterprise buyers ask MCP server vendors.

### What Could Break the Moat

**Honest assessment:**

1. **Arize or Braintrust adds `vouqis audit` as a feature**: Well-funded teams could build the five probes in a sprint. Distribution risk is real.
2. **Anthropic adds trust scoring to the official MCP protocol spec**: If the protocol itself mandates compliance testing, a reference implementation by Anthropic would be hard to compete with.
3. **Composio builds a "third-party server audit" feature**: They have the developer distribution to make it stick fast.

**The counter:** Speed, focus, and data advantage. Vouqis can ship features these companies cannot prioritize. The data moat compounds daily. The goal is to be so embedded in workflows and registries by the time a funded competitor decides to copy it that the copy feels derivative.

---

## 9. TECH STACK & ARCHITECTURE

### Current Stack

| Layer | Technology | Rationale |
|---|---|---|
| CLI | Node.js + TypeScript + oclif | npm distribution, TypeScript safety, oclif ergonomics |
| MCP Client | @modelcontextprotocol/sdk | Official SDK for JSON-RPC session management |
| CLI Output | chalk + ora | Terminal UX with color and spinners |
| Bundle | tsup | Fast ESM bundle for distribution |
| Dashboard | Next.js 16 (App Router) + TypeScript | SSR + static generation for performance |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, themeable, fast to build |
| Database | Supabase (PostgreSQL) | Realtime, Row-Level Security, auth-ready |
| Auth (planned) | Supabase Auth | Integrated with existing DB layer |
| Payments | Polar.sh | Developer-first billing, webhook-native |
| Email | Resend | Transactional email, developer-friendly API |
| Deployment | Vercel | Zero-config CI/CD, preview URLs |
| CI | GitHub Actions | Standard developer CI target |
| Package registry | npm (@vouqis/cli) | Universal distribution |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPER'S MACHINE                   │
│                                                          │
│  $ vouqis audit https://mcp.example.com                 │
│         │                                                │
│   ┌─────▼──────┐                                         │
│   │  CLI Core  │ ── discovers tools via JSON-RPC ──────▶ │──┐
│   │  (oclif)   │ ◀─ tool list ───────────────────────── │  │
│   └─────┬──────┘                                         │  │
│         │ fires 10 deterministic probes                  │  │
│         │──── malformed-jsonrpc ──────────────────────▶  │  │
│         │──── missing-params ─────────────────────────▶  │  │  MCP SERVER
│         │──── latency-measure ────────────────────────▶  │  │  (any URL)
│         │──── schema-validate ────────────────────────▶  │  │
│         │──── null-response ──────────────────────────▶  │  │
│         │◀── responses ──────────────────────────────── │  │
│   ┌─────▼──────┐                                         │  │
│   │  Scoring   │ computes Trust Score                    │  │
│   │  Engine    │ (pass rate 50% + latency 30% +          │  │
│   └─────┬──────┘  error diversity 20%)                   │  │
│         │                                                │  │
│   ┌─────▼──────┐                                         │  │
│   │   Output   │ → terminal (color + score bar)          │  │
│   │   Layer    │ → ./vouqis-report.json                  │  │
│   └─────┬──────┘ → POST /api/reports (dashboard)         │  │
│         │                                                │  │
└─────────┼────────────────────────────────────────────────┘  │
          │                                                    │
          ▼                                                    │
┌─────────────────────────────┐                               │
│     VOUQIS DASHBOARD        │◀──────────────────────────────┘
│    (Next.js on Vercel)      │
│                             │
│  /evals    → all audit runs │
│  /report/:id → shareable    │
│  /traces   → live traces    │
│  /pro      → subscribe      │
│                             │
│  Supabase (PostgreSQL)      │
│  ├── eval_results           │
│  ├── audit_reports          │
│  ├── traces                 │
│  └── subscriptions          │
└─────────────────────────────┘
```

### Data Model (Core Tables)

```sql
-- Every audit run
eval_results (
  id uuid PRIMARY KEY,
  server_url text,
  trust_score integer,       -- 0–100
  pass_count integer,
  fail_count integer,
  latency_p50 integer,       -- ms
  top_failures jsonb,        -- { "timeout": 2, "null-response": 1 }
  probe_results jsonb,       -- full detail per probe
  created_at timestamptz
)

-- Shareable reports
audit_reports (
  id uuid PRIMARY KEY,
  server_url text,
  trust_score integer,
  verdict text,              -- APPROVED / RISKY / DO NOT INTEGRATE
  expires_at timestamptz,    -- 30 days (free) / 90 days (pro)
  probe_results jsonb,
  created_at timestamptz
)

-- Pro subscriptions
subscriptions (
  id uuid PRIMARY KEY,
  email text,
  api_key text UNIQUE,       -- 64-char hex, used in X-Vouqis-Api-Key header
  polar_subscription_id text,
  status text,               -- active / canceled / past_due
  plan text                  -- free / pro
)
```

---

## 10. HOW IT WORKS IN REAL TIME

### Scenario: Developer integrates a new MCP server

**Time: 09:00** — Developer finds `mcp-github-server` on Smithery.

**09:01** — Runs:
```bash
vouqis audit https://mcp.github-server.example.com
```

**09:01:03** — CLI connects via JSON-RPC, discovers 5 tools.

**09:01:15** — 10 probes complete. Output:

```
VOUQIS ── audit ── https://mcp.github-server.example.com
──────────────────────────────────────────────────────
  ✓ Connected — found 5 tools
  Running 10 reliability tests against https://mcp.github-server.example.com

  [████████████████████████] 10 / 10
  ✓ 7   ✗ 3

──────────────────────────────────────────────────────
  Vouqis Trust Score Report
──────────────────────────────────────────────────────
  Server          https://mcp.github-server.example.com
  Score           72 / 100  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱
  Tests passed    7 of 10  (70%)
  Response time   340ms  typical · target <500ms

  What failed:
  ✗ Did not reject invalid requests · 2 times (tool: list_repos, 180ms)
  ✗ Returned empty or null results · 1 time (tool: get_file, 890ms)

──────────────────────────────────────────────────────
  report written → ./vouqis-report.json
  view traces:     https://vouqis.vercel.app

  ⚠ RISKY — some tests failed, review before going to production
```

**09:01:15** — Results simultaneously:
1. Printed to terminal
2. Written to `./vouqis-report.json`
3. POSTed to `https://vouqis.vercel.app/api/reports`
4. Stored in Supabase `eval_results` and `audit_reports` tables
5. Shareable URL generated: `https://vouqis.vercel.app/report/abc123`

**09:02** — Developer sends the report URL to the MCP server vendor: *"Your server scored 72. Two malformed-request failures and one null response. Fix these before we integrate."*

**09:15** — Vendor patches the server.

**09:16** — Developer runs `vouqis audit` again. Score: 91. APPROVED. Integration proceeds.

### CI Workflow (Production Gate)

```yaml
# .github/workflows/mcp-health.yml
- name: Audit MCP Servers
  run: |
    vouqis audit ${{ env.GITHUB_MCP_URL }} --fail-below 80
    vouqis audit ${{ env.SLACK_MCP_URL }} --fail-below 80
    vouqis audit ${{ env.CALENDAR_MCP_URL }} --fail-below 70
```

Pipeline fails → PR blocked → engineer investigates → fixes or finds alternative → pipeline passes → deploy.

---

## 11. MVP SCOPE

### Shipped (v0.1 — May 2026)

- [x] CLI: `vouqis audit <url>` with full 10-probe harness
- [x] CLI: `vouqis score <url>` (legacy, no shareable report)
- [x] Trust score algorithm (50/30/20 weights)
- [x] Verdict: APPROVED / RISKY / DO NOT INTEGRATE
- [x] `--fail-below` CI flag
- [x] `--json-path` JSON report output
- [x] Plain-English failure descriptions in terminal
- [x] Dashboard at vouqis.vercel.app
- [x] Shareable report URLs
- [x] Supabase storage for all runs
- [x] Pro subscription via Polar.sh
- [x] Welcome email on Pro signup (Resend)

### v0.2 — Next 30 Days

- [ ] User authentication (Supabase Auth) — every user sees only their own runs
- [ ] API key rotation endpoint
- [ ] `POST /api/reports` accepts Pro API key for 90-day retention
- [ ] Dashboard: filter by server URL, date, score range
- [ ] Webhook handlers for `subscription.past_due` and `order.refunded`
- [ ] Supabase RLS policies for full data isolation

### v0.3 — 60 Days

- [ ] Smithery integration: display Vouqis score badge on server listings
- [ ] Continuous monitoring: cron-based re-audit on schedule
- [ ] Slack/Discord alert on score degradation
- [ ] `vouqis monitor <url> --interval 1h --alert-below 70` command
- [ ] Badge embed: `![Vouqis Score](https://vouqis.vercel.app/badge/<server-url>)`

### v1.0 — 90 Days

- [ ] Team accounts (multiple members, shared dashboard)
- [ ] API access (run audits programmatically via REST)
- [ ] Historical trend charts (is this server getting better or worse over time?)
- [ ] Custom probe weights (enterprise: weight latency heavier for real-time use cases)
- [ ] Server comparison: run against two URLs and diff the scores

---

## 12. BUSINESS MODEL

### Pricing Tiers

| Tier | Price | What You Get |
|---|---|---|
| **Free** | $0 | Unlimited CLI runs, 30-day report retention, community dashboard |
| **Pro** | $29/month | 90-day report retention, API access, continuous monitoring (coming), priority support |
| **Team** | $99/month (planned) | 5 seats, shared dashboard, team report history |
| **Enterprise** | Custom | SSO, on-prem, SLA, custom probe weights, dedicated support |

### Unit Economics (Modeled)

| Metric | Estimate |
|---|---|
| MCP developers today | ~100,000 |
| Conversion rate (free → paid) | 3% (conservative for dev tools) |
| Paying customers at 3% | 3,000 |
| Average revenue at $29/month | $87,000 MRR = $1.04M ARR |
| Target within 12 months | $50,000 MRR ($600K ARR) |

This is achievable with no sales team — pure PLG (product-led growth) via CLI adoption.

### PLG Flywheel

```
Developer installs CLI (free)
    │
    ▼
Runs vouqis audit on MCP server
    │
    ▼
Sees score in terminal + shareable URL
    │
    ▼
Sends URL to vendor / teammate
    │
    ▼
Vendor/teammate clicks URL → visits dashboard
    │
    ▼
New developer discovers Vouqis
    │
    ▼
Installs CLI → cycle repeats
```

The shareable report URL is the viral loop. Every audit creates a link that brings a new user to the dashboard.

---

## 13. GO-TO-MARKET STRATEGY

### Phase 1: Developer Seeding (Month 1–2)

**Goal**: 1,000 CLI installs. Get Vouqis into the hands of every developer building MCP-backed agents.

**Tactics**:

1. **Hacker News Launch Post**: "Show HN: I built a trust scorer for MCP servers after our agent silently failed for 3 days." Honesty-first, no hype. Attach real test results against 5 known MCP servers with their scores. This is the kind of post HN rewards.

2. **Smithery Publisher Outreach**: Email the top 100 MCP server publishers on Smithery. "Run `vouqis audit` on your server and share your score." Gamify quality improvement. Servers with scores above 90 get a "Vouqis Certified" badge.

3. **GitHub README Drop**: `vouqis audit` result against the MCP servers in the top 50 most-starred MCP repos. Open issues or PRs showing the score. This creates organic discovery.

4. **AI Engineering Subreddits**: r/MachineLearning, r/LocalLLaMA, r/AIEngineering. Post "We stress-tested 50 MCP servers. Here are the scores." Share the data, not the product.

5. **Twitter/X**: Target AI agent developers. Post thread: "Most MCP servers fail ~30% of tool calls silently. Here's what we found after running 10,000 probes."

### Phase 2: Community & Registry Integration (Month 3–4)

1. **Smithery partnership**: Propose Vouqis scores natively on Smithery listings. Smithery benefits (safer marketplace), Vouqis gets distribution to every Smithery developer.

2. **mcp.so integration**: Same approach. Score badge on every server listing.

3. **Discord/Slack communities**: MCP Discord, AI agent builder Slacks. Be genuinely helpful, answer reliability questions, share scores.

4. **Open source CI recipe**: GitHub Actions starter workflow using `vouqis audit`. Publish it as a template. Make it one-click.

### Phase 3: Enterprise (Month 5–12)

1. **Security angle**: Pitch to enterprise security teams alongside the Smithery incident data and CVE record. "66% of MCP servers have security findings. Know before you integrate."

2. **Compliance angle**: "Your AI agent stack audit trail, ready for your security review."

3. **Partnership with Composio, Klavis**: Position Vouqis as the independent testing layer for their hosted servers. "Composio guarantees their servers. Vouqis scores them independently."

### What Not To Do

- Do not spend money on ads before organic traction is proven
- Do not hire sales before $50K MRR
- Do not build enterprise features before 100 paying customers
- Do not rebrand or rename until product-market fit is confirmed

---

## 14. TIMELINE

```
MAY 2026 (NOW)
├── v0.1 shipped: CLI + dashboard + Pro subscription
├── CI passes, Vercel deployed at vouqis.vercel.app
└── Polar in test mode (pending production verification)

JUNE 2026
├── Polar production mode enabled → real payments live
├── User authentication + data isolation (Supabase Auth)
├── API key management (rotation, revocation)
├── HN launch post
└── Smithery publisher outreach begins

JULY 2026
├── Smithery score badge integration (negotiation + build)
├── Continuous monitoring feature (cron re-audits)
├── Slack/Discord alert integration
├── Badge embed URL
└── Target: 500 CLI installs, 50 registered users, 10 paying

AUGUST 2026
├── Team accounts
├── Historical trend charts
├── mcp.so integration
└── Target: 1,500 CLI installs, 150 registered users, 30 paying

SEPTEMBER 2026
├── API access (REST) for programmatic audits
├── Enterprise pilot (2–3 companies)
├── Custom probe weight configuration
└── Target: 3,000 CLI installs, 300 users, $5K MRR

DECEMBER 2026
├── Full team plan launched
├── Enterprise SLA offering
└── Target: $30K MRR, Series A discussion if warranted
```

---

## 15. YC & INVESTOR Q&A

### For YC

**Q: What does Vouqis do?**
Vouqis scores any MCP server for reliability before your AI agent trusts it. One command, 30 seconds, 0–100 trust score. No instrumentation required on the server being tested.

**Q: Why now?**
The MCP ecosystem grew 7.8× in one year to 9,400+ servers. 78% of enterprise AI teams have MCP-backed agents in production. The median server passes only 71% of tasks. The infrastructure exploded before anyone built quality control for it. This is the infrastructure gap that always follows a fast-growing developer ecosystem.

**Q: Why you?**
The founder built the product, shipped it, deployed it, and acquired the first users before applying. The problem was discovered through real frustration — integrating MCP servers that failed silently. The solution was built from that frustration. The codebase is running in production.

**Q: What's the market size?**
TAM: $7.63B AI agent market growing at 49.6% CAGR. SAM: 100,000 MCP developers × $29/month × 3% conversion = $1M ARR on day one with existing ecosystem, scaling as MCP adoption grows. At 10× ecosystem growth (plausible in 3 years): $10M ARR minimum.

**Q: Who are the competitors?**
Static analyzers (MCPSkills, MCP Scorecard) that examine GitHub metadata without touching the live server. LLM observability platforms (LangSmith, LangFuse, Braintrust, Arize) that operate at the LLM call layer, not the MCP protocol layer. mcpevals.io does LLM-based output evaluation — requires test case authoring and LLM inference costs. Nobody does deterministic active probe testing of a running MCP endpoint. That's the gap.

**Q: What's the business model?**
Free CLI forever. Pro ($29/month) for 90-day retention, API access, monitoring. Team ($99/month). Enterprise (custom). PLG: every audit creates a shareable URL that brings new users to the dashboard. The viral loop is built into the product.

**Q: What's the biggest risk?**
Arize, LangSmith, or Composio building this as a feature. Mitigation: speed (ship faster than funded teams prioritize a new feature), data (our probe result history compounds daily), registry integration (Smithery + mcp.so distribution is a moat no competitor has today).

**Q: What do users say?**
"I would have caught our production incident in 10 seconds with this." — The failure that motivated building Vouqis.

**Q: What's the 3-year vision?**
Every MCP server in every registry has a Vouqis score. Enterprise security teams require Vouqis scores in their AI agent procurement process. The trust score becomes definitional — the way SSL padlocks became definitional for web security. Vouqis is the immune system of the AI agent ecosystem.

### For Other Investors

**Q: Is this a real market or a feature?**
Real market. The reasons: (1) dedicated tool vs. side feature — nobody wants their observability platform to also be their protocol tester; (2) data moat — 10 million probes is worth more than one big company's 10,000; (3) registry integration creates distribution that isn't available to platforms; (4) the CI workflow lock-in creates retention that a side feature cannot match.

**Q: What are the unit economics?**
CLI distribution is free (npm install). Server costs are negligible (Supabase + Vercel handle 1M audit results for <$100/month). Gross margins approach 90%+ at scale. The marginal cost of one more `vouqis audit` run is ~$0.001 in infrastructure.

**Q: Why would a company pay instead of just using the free tier?**
Retention (90 days vs. 30), API access for automation, monitoring/alerting (catches regressions before customers do), team sharing, compliance audit trail. The free tier proves value. The Pro tier saves engineering time.

---

## 16. FOMO SIGNAL

### Why The Window Is Short

The MCP ecosystem is in its Docker-in-2014 moment. The protocol is 18 months old. The tooling ecosystem is forming right now. The companies that built the first Docker quality tools (Docker Hub, Docker Compose, Docker Scout) captured the market before the ecosystem matured.

**The window to become the trust standard for MCP servers is approximately 12–18 months.**

After that:
- Registries will have chosen their scoring partners
- Well-funded platforms (Arize, LangSmith) will have had time to build competing features
- The protocol will have more official tooling from Anthropic/OpenAI
- The "trust layer for MCP" category will have a named leader

**The documented incidents are accelerating the urgency:**
- The Smithery breach (June 2025): every MCP builder who read that news is now worried about the servers in their stack
- CVE-2025-6514 (150M+ downloads affected): enterprise security teams are now asking "how do we vet MCP servers?"
- Gartner's prediction that 40%+ of agentic AI projects will be cancelled: reliability is now a boardroom concern

**38% of MCP builders say security concerns are actively blocking adoption.** Vouqis is the answer to the question they are actively asking.

The FOMO is real: every month without a trust standard, another major incident builds the case for Vouqis. Every month with a trust standard, Vouqis is the standard.

---

## 17. NAMING, DOMAIN & BRAND

### Current Name: Vouqis

**Honest Assessment**: The name is invented and has no semantic meaning. This is both a weakness (requires explanation) and a strength (fully ownable, no category bias).

- Phonetics: "VOO-kiss" — short, distinctive, memorable
- Google search: currently clean (no competing brands)
- Trademark: likely available (invented word)

**Domain situation**: `vouqis.dev` created (DNS pending verification). `vouqis.vercel.app` is live production URL.

### Alternative Name Suggestions

If the name is reconsidered pre-launch:

| Name | Rationale | Domain |
|---|---|---|
| **Trustprobe** | Descriptive: trust + probe | trustprobe.dev |
| **MCPTest** | Direct: category-defining, SEO | mcptest.io |
| **Probekit** | Tool-first: probing toolkit | probekit.dev |
| **Vet** | Short: "vet the server" | vet.run (premium) |
| **Auditron** | Technical feel, audit-native | auditron.dev |
| **Signalcheck** | Metaphorical: checking signals | signalcheck.io |

**Recommendation**: Keep Vouqis. The invented name is fully ownable and the product is already in production under this name. Renaming now costs distribution. Invest in making the name mean something, not in finding a name that already means something.

### Brand Voice

- Honest. Not hype.
- Technically precise. Not hand-wavy.
- Slightly alarming (because the problem is alarming). Not fear-mongering.
- Peer-to-peer. Engineers talking to engineers.

---

## 18. LOGO SPECIFICATION

### Design Direction

The Vouqis logo should communicate: **measurement, trust, signal clarity.**

**Primary mark**: A square or circle containing a stylized score bar or waveform — evoking the terminal output's `▰▰▰▰▰▱▱▱▱▱` score visualization. The mark is the score. The score is the product.

**Concept A — Score Bar Mark**:
```
  ┌──────────────────┐
  │  ▰▰▰▰▰▰▰▱▱▱▱▱▱  │   VOUQIS
  └──────────────────┘
```
A horizontal score bar inside a minimal frame. Black on white. No gradient. No 3D. Flat.

**Concept B — Checkmark + Meter**:
```
  ┌──┐
  │ ✓│  VOUQIS
  └──┘  trust score for MCP
```
A check mark inside a minimal square, but the check is drawn as a signal strength bar (4 vertical bars increasing in height, like a WiFi icon rotated). Communicates: "signal strength of your MCP server's trust."

**Concept C — Monogram**:
```
   V
  / \     VOUQIS
 /___\
```
A "V" rendered as a score chart — the V shape implies a dip-and-recovery or a downward probe that reveals the score. Minimal wordmark.

**Spec for designer**:
- Colors: `#60a5fa` (blue, current brand) + `#4ade80` (green, approval) + `#f87171` (red, failure)
- Background: `#0d1117` (dark terminal) and `#ffffff` (light dashboard)
- Weight: geometric sans-serif (Inter, Geist Mono, or JetBrains Mono for the monogram)
- No gradients. No shadows. Flat SVG. Must work at 16×16 favicon.
- The wordmark should be set in Geist Mono (matching the dashboard's current font)

---

## 19. INDUSTRY, CATEGORY & CLASSIFICATION

| Dimension | Classification |
|---|---|
| **Industry** | AI Developer Tools / AI Infrastructure |
| **Category** | MCP Server Reliability Testing & Observability |
| **Sub-category** | Protocol Compliance Testing, AI Agent Quality Gates |
| **Business model** | B2B SaaS (PLG) |
| **Target motion** | Bottom-up / Product-Led Growth |
| **Billing** | Individual ($29/month) → Team ($99/month) → Enterprise (custom) |
| **Is it B2B or D2C?** | B2B. The buyer is an engineer or engineering manager at a company. There is no consumer angle. |
| **Comparable companies** | Snyk (security for npm), DataDog (observability), Checkmarx (code security), npm audit |
| **Stage** | Pre-seed, live product, early revenue |

**The clearest comparable**: Snyk.

Snyk made security scanning frictionless for developers — `snyk test` in CI. It became the default security layer for npm ecosystems. Vouqis is doing the same for the MCP ecosystem: `vouqis audit` in CI. Same PLG motion. Same category-defining ambition. Snyk raised $530M and reached a $8.5B valuation.

---

## 20. STRENGTHS & WEAKNESSES — NO SUGAR-COATING

### Strengths

1. **No funded competitor in the active probe testing space.** This is the most important fact. The gap is real and verified across 13 competitors.

2. **One-command simplicity.** `vouqis audit <url>` requires zero server-side changes. The product works on any MCP server, anywhere. This is rare — most testing tools require you to instrument the thing being tested.

3. **Live product with real architecture.** Not a landing page. Not a pitch deck. A deployed Next.js app, a published npm CLI, working Supabase integration, Polar payments, Resend email. This is built.

4. **The data is accumulating.** Every audit run adds to a dataset no competitor can retroactively collect.

5. **The problem is worsening.** MCP adoption is accelerating. The ecosystem grew 7.8× last year. More servers = more unreliable servers = more demand for Vouqis.

### Weaknesses — Being Brutal

1. **No authentication/user isolation yet.** The dashboard currently shows all users' data to everyone. This is not acceptable for a B2B product and must be fixed before any enterprise sales conversation. This is a known gap with a clear fix (Supabase Auth), but it is currently broken.

2. **Polar is in test mode.** Real payments are blocked until Polar verifies the account for production. This means there is currently zero revenue. Every "Pro" subscriber is getting the feature for free. This is a business blocker, not a technical one.

3. **10 probes is thin.** The current probe harness covers five failure modes with two probes each. Real-world MCP server failures are more complex: auth flows, stateful tool calls, streaming responses, long-running operations, concurrent request handling. The scoring methodology will need to evolve or it will be gameable.

4. **No user auth means no moat from user data.** Until users can see only their own data, there is no reason for a company to share their internal server URLs with Vouqis. They're feeding a public board. This limits enterprise adoption.

5. **Branding is invisible.** Nobody knows what Vouqis means or does from the name alone. Every acquisition channel requires explanation of the category. Snyk is the same (invented word) but Snyk had $2M in seed to spend on awareness. Vouqis has a bootstrap budget. Organic distribution through CLI virality and registry integration is the only path that doesn't require marketing spend.

6. **The window is 12–18 months.** After that, the opportunity is either captured or gone. Arize or LangSmith adding MCP probe testing would be a serious threat. Speed is the only answer.

7. **Registry partnerships are unconfirmed.** The Smithery integration, which is the single most valuable distribution play, is a hypothesis. Smithery may not want to partner. The "moat" from registry integration doesn't exist until the partnership is signed.

---

## 21. THE STATEMENT TO THE WORLD

---

**The AI agent ecosystem is running on trust it has never earned.**

We are building the most consequential software since the web. AI agents with access to tools, databases, APIs, and systems that can take real actions in the real world. These agents are already in production. Millions of them. Processing customer requests. Managing schedules. Moving data. Executing code.

And the tools they use — the MCP servers, the bridges between AI reasoning and real-world action — have been audited by almost no one.

Not maliciously. Just fast. The ecosystem exploded in eighteen months. 21,000 servers. 97 million SDK downloads. 78% of enterprise AI teams with MCP-backed agents in production. The speed was necessary — the technology was too powerful to slow down.

But speed without quality control is how you get the Asana data breach. The Smithery key exposure. The 3,243 servers vulnerable to path traversal. The CVSS 9.6 RCE in a package with 150 million downloads.

The median MCP server passes only 71% of tool calls. Five chained tools at 71% reliability each succeed 18% of the time. Your AI agent is working correctly. The tool layer is not.

The question is not whether this will cause production failures at scale. It is happening now. The question is whether the industry builds infrastructure to catch it before the crashes become customer-visible and trust-destroying.

**We are that infrastructure.**

Vouqis is not a dashboard. It is not an observability platform. It is not a static analyzer. It is an active auditor — a tool that fires real requests at real servers and tells you the truth about whether they work, with a number you can act on in 30 seconds.

`vouqis audit <url>` is the missing step between "I found an MCP server" and "I trust it with my users."

We are at the point in AI's development where the choice of what to build next carries unusual weight. The tools that become standards now will shape how AI agents are built, evaluated, and trusted for the next decade.

MCP is the operating system of the AI agent era. Vouqis is the quality layer that operating system needs to be trusted with production workloads.

The AI industry does not need more tools that trace what already happened. It needs something that prevents what should never happen.

**That is Vouqis. And the world needs it now.**

---

*Document prepared: May 2026*
*Version: 1.0*
*Status: Living document — update on each major product or market milestone*

---

### SOURCES

| Claim | Source |
|---|---|
| Composio $29M raised | [PR Newswire](https://www.prnewswire.com/news-releases/composio-raises-29m-to-solve-ais-learning-problem-302510684.html) |
| LangChain $125M valuation | [CheckThat](https://checkthat.ai/brands/langchain/pricing) |
| Smithery path traversal (3,243 servers) | [SC Media](https://www.scworld.com/news/smithery-ai-fixes-path-traversal-flaw-that-exposed-3000-mcp-servers) |
| Smithery hosting attack details | [GitGuardian](https://blog.gitguardian.com/breaking-mcp-server-hosting/) |
| Workday acquires Pipedream | [SiliconAngle](https://siliconangle.com/2025/11/19/workday-acquire-pipedream-extend-ai-agent-integrations-across-enterprise-apps/) |
| Klavis AI YC X25 | [YCombinator](https://www.ycombinator.com/companies/klavis-ai) |
| ClickHouse acquires LangFuse | [ClickHouse Blog](https://clickhouse.com/blog/clickhouse-raises-400-million-series-d-acquires-langfuse-launches-postgres) |
| Braintrust $80M Series B | [SiliconAngle](https://siliconangle.com/2026/02/17/braintrust-lands-80m-series-b-funding-round-become-observability-layer-ai/) |
| Arize $70M Series C | [Arize Blog](https://arize.com/blog/arize-ai-raises-70m-series-c-to-build-the-gold-standard-for-ai-evaluation-observability/) |
| MCP adoption statistics 2026 | [Digital Applied](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol) |
| 100 MCP servers stress test | [Digital Applied](https://www.digitalapplied.com/blog/mcp-server-reliability-100-server-stress-test-study) |
| mcp.so 21,164 servers | [mcp.so](https://mcp.so/) |
| Zuplo MCP Report (38% blocked) | [Zuplo](https://zuplo.com/mcp-report) |
| MCP SDK 97M downloads | [Digital Applied](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol) |
| CVE-2025-6514 (CVSS 9.6) | [NVD / Hacker News](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html) |
| AI agents $7.63B market | [Grand View Research](https://www.grandviewresearch.com/industry-analysis/ai-agents-market-report) |
| YC 50% AI agents | [PitchBook](https://pitchbook.com/news/articles/y-combinator-is-going-all-in-on-ai-agents-making-up-nearly-50-of-latest-batch) |
| Gartner 40% agentic AI cancellation | [Arize Blog](https://arize.com/blog/common-ai-agent-failures/) |
| AI agent failures in production | [Arize](https://arize.com/blog/common-ai-agent-failures/), [Temporal](https://temporal.io/blog/ai-reliability-is-a-decade-old-problem) |
| Asana MCP data leak | [Data Science Dojo](https://datasciencedojo.com/blog/mcp-security-risks-and-challenges/) |
| AgentSeal 66% security findings | [SC Media / AgentSeal research] |
| AI Science of Reliability (arxiv) | [arxiv 2602.16666](https://arxiv.org/html/2602.16666v1) |
| Real faults in MCP software | [arxiv 2603.05637](https://arxiv.org/html/2603.05637v1) |
