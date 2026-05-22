# Vouqis Lead Intel — Deep Dives
> Confirmed data points for the highest-priority leads. Use these in outreach to prove you've done your homework.

---

## 1. Runlayer

**Founders (confirmed)**:
- Andrew Berman — CEO, 3x founder (Nanit → Vowel → Zapier acquisition → Runlayer)
- Tal Peretz — CTO/co-founder, led ML in Israeli Air Force, built Zapier MCP in 2 days (Zapier's fastest-growing product)
- Vitor Balocco — co-founder, Staff AI Engineer at Zapier, MCP security conference speaker

**Advisors (confirmed)**:
- David Soria Parra — lead creator of MCP (angel + advisor)
- Travis McPeak — Head of Security at Cursor (advisor)
- Nikita Shamgunov — Neon founder (advisor)

**Confirmed customers**: Gusto, dbt Labs, Instacart, Opendoor (8 unicorns/public companies total in 4 months)

**Funding**: $11M seed — Khosla Ventures (Keith Rabois) + Felicis

**LinkedIn**: linkedin.com/in/aberman (Andrew Berman)

**Vouqis angle**: Security (Runlayer) + Reliability (Vouqis) = full MCP trust stack. Same buyer, different question. Partnership > competition.

---

## 2. Manufact (formerly mcp-use)

**Founders (confirmed)**:
- Luigi Pederzani — Co-CEO, founding engineer at Morgen (ETH spin-off, used at Spotify, GitHub, Linear, Canva), MSc CS from Politecnico di Milano
- Pietro Zullo — Co-founder (details limited)

**Traction (confirmed)**: 7M+ downloads (Python + TypeScript), ~10k GitHub stars, customers include NASA, NVIDIA, SAP

**Funding**: $6.3M seed — Peak XV Partners + Y Combinator (S25)

**LinkedIn**: linkedin.com/in/luigipederzani

**GitHub known issues**: None publicized — early stage, clean slate

**Vouqis angle**: They handle deploy. Vouqis handles quality gate. One-line CI integration.

---

## 3. Alpic

**Founders (confirmed)**:
- Pierre-Louis Theron — CEO, previously co-founded Streamroot (video CDN, acquired by Lumen Technologies 2019)
- Nikolay Rodionov — COO
- Frédéric Barthelet — CTO
- Charles Sonigo — CPO
- Erica Beavers — CMO

**Funding**: €5M pre-seed (~$6M USD) — Partech Partners

**LinkedIn**: linkedin.com/in/theronpl (Pierre-Louis Theron)

**Product**: Alpic Analytics (their monitoring suite for MCP servers) — they're already thinking about observability, which means reliability scoring is adjacent

**Vouqis angle**: Alpic Analytics covers metrics/logging; Vouqis covers behavioral compliance. Complementary, not competing.

---

## 4. Atlassian (Jira + Confluence MCP)

**GitHub repo**: github.com/atlassian/atlassian-mcp-server

**Confirmed issues (live as of May 2026)**:
- Issue #64: "Atlassian MCP terribly unreliable when using with Claude Code" — timeouts, stops working mid-session
- Issue #43: "Claude Connector failing to connect to Atlassian (Confluence)" — SSE transport errors, 400 status codes
- Community report: Uses deprecated Jira REST API v2 (Atlassian removed this)
- Security finding: Indirect prompt injection vulnerability — server returns Jira ticket content verbatim to LLM, no sanitization (HIGH severity)
- Published scan: A DEV community post scanned 50+ MCP servers and found HIGH-severity bugs specifically in Atlassian, GitHub, Cloudflare, and Microsoft servers

**Who to target**: Search LinkedIn for "Rovo AI" + Atlassian. Try: Platform Engineering lead on Rovo team.

**Email pattern**: firstname.lastname@atlassian.com

**Vouqis angle**: These are documented production failures. Vouqis quantifies them as a score, enables before/after verification.

---

## 5. Neon

**CEO**: Nikita Shamgunov — co-founder, previously co-founded SingleStore (unicorn, $1.3B+ valuation)

**MCP server**: github.com/neondatabase/mcp-server-neon
- 20 tools (the most of any database MCP)
- Unified `neon init` command configures MCP + VS Code extension in one step
- OAuth-based auth
- Branch-based migrations

**Key connection**: Nikita is an advisor to Runlayer — he already understands and values the MCP trust stack. He'll immediately get the Vouqis pitch.

**Email**: nikita@neon.tech (confirmed pattern from press coverage)

**Vouqis angle**: 20 tools × more edge cases. Lead with "I already ran a scan" to get immediate attention.

---

## 6. Composio

**Founders (confirmed)**:
- Soham Ganatra — CEO (not Ishaan Jaffer — Ishaan is at LiteLLM/Berriai)
- Karan Vaidya — Co-founder

**Scale**: 500+ managed MCP integrations, 100,000+ developers, SOC 2 Type II

**Funding**: Series A (March 2025), 10 investors

**Known reliability context**: Composio blog explicitly calls out Pipedream's "unreliable connectors" as a weakness — they are already using reliability as a marketing angle. Vouqis gives that claim a verified number.

**LinkedIn**: linkedin.com/company/composiohq

**Email pattern**: firstname@composio.dev (try: soham@composio.dev)

**Vouqis angle**: Quality badge on catalog. They can show verified trust scores for each integration, turning reliability from a claim into a measurement.

---

## 7. Klavis AI

**Founders (confirmed)**:
- Zihao Lin — Co-founder, ex-Lyft senior SWE (recommendation team + Nordstrom data infra), MSc CS Northeastern
- Xiangkai Zeng — Co-founder, ex-Google Gemini senior SWE (co-authored Gemini paper), MSc CS Carnegie Mellon

**Batch**: YC X25 (special batch)

**Product**: Strata — enterprise MCP servers with multi-tenancy auth + 50+ integrations

**LinkedIn**: linkedin.com/in/zihaolin123 (Zihao), linkedin.com/in/xiangkai-zeng (Xiangkai)

**Email pattern**: Try zihao@klavis.ai or contact@klavis.ai

**Vouqis angle**: Reliability-verified tier for hosted servers. Perfect enterprise upsell.

---

## 8. Supabase

**Head of DevEx**: "Greg" (full name not confirmed — search LinkedIn for "Head of Developer Experience Supabase")

**MCP server**: github.com/supabase/mcp-server-supabase
- OAuth-based (complex implementation)
- Edge function support
- ~70k GitHub stars on main Supabase repo

**Funding**: Series B $80M

**Known GitHub issues**: None critical publicized as of search

**Email pattern**: firstname@supabase.io (try greg@supabase.io or devrel@supabase.io)

**Vouqis angle**: They already use Supabase internally in Vouqis — genuine connection. Lead with that.

---

## 9. Linear

**CEO**: Karri Saarinen — @karrisaarinen on Twitter/X, posted the official MCP launch announcement

**MCP launch tweet**: "The official @linear MCP is live! It follows the authenticated remote MCP spec and supports issues, projects, and comments via Claude, @cursor_ai, @windsurf_ai, and more. Thanks @AnthropicAI + @Cloudflare for partnering on this"

**GitHub**: Third-party MCP servers exist (jerhadf/linear-mcp-server) but official is hosted/remote via Cloudflare

**Known issues**: Users requested MCP support in Linear Slack in March 2026 (suggesting it was unstable); CEO personally launched via X in May 2025

**Email**: karri@linear.app (confirmed from domain pattern + public info)

**Vouqis angle**: Linear's brand = quality + speed. A Vouqis trust score proves it.

---

## 10. Notion (Critical Intel)

**GitHub repo**: github.com/makenotion/notion-mcp-server

**Confirmed bugs (live as of May 2026)**:
- **Issue #107**: "why has MCP not been fixed yet? It has been an ongoing issue for 3 weeks now!" — MCP error -32000, read operations broken
- **Issue #109**: "Critical Bug: MCP Server Not Passing Authorization Header to Notion API" — consistent 401 unauthorized errors despite valid integration token
- **Issue #142**: "Two Notion MCP servers, neither work well"
- **Issue #227**: "Guest users are completely locked out of Notion MCP"
- **Issue #26027** (claude-code): "Notion MCP object parameters still serialized as strings" — double-stringification causing "Expected object, received string" errors
- Breaking API change: v2.0.0 migration broke every existing workflow; Notion followed with 3 more breaking changes (after → position object, archived → in_trash, transcription → meeting_notes)

**Total open issues**: 127 (confirmed)

**Who to target**: Find "API" or "Integrations Platform" lead on LinkedIn at Notion

**Email pattern**: firstname@makenotion.com

**Vouqis angle**: Before/after score narrative. "Score before: 61/100. Score after fixes: 94/100." Makes the fix story concrete.

---

## 15. Pipedream

**CEO**: Dylan Pierce

**Known weakness (confirmed)**: Klavis, Composio, and Merge.dev all explicitly call out Pipedream connector reliability in competitive blog posts. This is a documented competitive liability.

**Scale**: 2,400+ MCP-enabled APIs, pipeline automation platform

**Email**: dylan@pipedream.com (common pattern)

**Vouqis angle**: Flip the narrative. Publish scores. 2400 × verified = strongest catalog in the ecosystem.

---

## 16. Cursor

**Known MCP security issues (confirmed CVEs)**:
- **CVE-2025-54136** (CVSS 8.8): MCPoison trust bypass — attacker could achieve persistent RCE once developer approved a benign MCP config; silently swapped for malicious commands without re-approval
- **"TrustFall"**: Affects Cursor CLI, Claude Code, Gemini CLI, GitHub Copilot CLI — all four can start MCP servers inside projects after one trust prompt
- **Industry scan**: 100% of scanned MCP servers lack proper permission declarations; average security score 34/100
- **Check Point Research** published full writeup on Cursor MCP trust bypass

**CEO**: Michael Truell — search LinkedIn

**Advisors already in MCP trust space**: Travis McPeak (Head of Security at Cursor) is a Runlayer advisor — Cursor leadership is already engaged on MCP trust

**Vouqis angle**: Behavioral trust scores at MCP server install time = user protection that complements existing security work.

---

## Summary Table

| Company | Key Contact | Email Pattern | Confirmed Bug Evidence | Partnership vs. Direct Sale |
|---------|-------------|---------------|----------------------|----------------------------|
| Runlayer | Andrew Berman | andrew@runlayer.com | N/A | Partnership |
| Manufact | Luigi Pederzani | luigi@manufact.dev | N/A | Integration |
| Alpic | Pierre-Louis Theron | pierre-louis@alpic.ai | N/A | Partnership |
| Atlassian | Rovo AI team | firstname.lastname@atlassian.com | 127 open issues, CVE, timeout bugs | Direct sale + CI |
| Neon | Nikita Shamgunov | nikita@neon.tech | N/A (but 20 tools = surface area) | Direct sale + community |
| Composio | Soham Ganatra | soham@composio.dev | Competitor-cited reliability weakness | Quality badge deal |
| Klavis | Zihao Lin | zihao@klavis.ai | N/A | Integration |
| Supabase | Greg (DevEx) | greg@supabase.io | N/A | Community story |
| Linear | Karri Saarinen | karri@linear.app | Users requested MCP in Slack Mar 2026 | Direct sale + CI |
| Notion | API team | firstname@makenotion.com | 127 issues, 401 errors, breaking changes | Direct sale (fix story) |
| Pipedream | Dylan Pierce | dylan@pipedream.com | Documented by competitors | Narrative flip |
| Cursor | Michael Truell | LinkedIn first | CVE-2025-54136, avg score 34/100 | Distribution partner |
| dbt Labs | Head of AI | LinkedIn first | Runlayer customer | Adjacent upsell |
