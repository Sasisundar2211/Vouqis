# Vouqis — Customer Targeting Playbook
### LinkedIn · Instagram · Keywords | May 2026

---

## WHO WE ARE TARGETING

Three buyer personas in priority order:

| # | Persona | Pain | Trigger |
|---|---|---|---|
| 1 | AI / Backend Engineer (3–10 yrs) | Silent MCP failures reach users before the engineer knows | Production incident from a broken tool call |
| 2 | VP Engineering / Engineering Manager at AI-native SaaS | Reliability SLAs, team can't debug silent failures | Security review or first missed SLA |
| 3 | Enterprise AI Integration Consultant (e.g. Paradigm Ventures) | Client trust — agent "worked" but delivered nothing | Client escalation on AI agent failure |

---

## LINKEDIN

### Job Titles — paste directly into People search or Sales Navigator

**Primary buyer — AI / Backend Engineer:**
```
"AI Engineer"
"AI Agent Engineer"
"LLM Engineer"
"AI Platform Engineer"
"AI Infrastructure Engineer"
"AI Integration Engineer"
"Backend Engineer" AND "AI"
"Machine Learning Engineer"
"Full Stack AI Engineer"
"Agentic AI Engineer"
```

**Secondary buyer — Engineering Leadership:**
```
"VP of Engineering" AND "AI"
"Head of Engineering" AND "AI"
"Engineering Manager" AND "AI"
"Director of AI Engineering"
"CTO" AND "AI startup"
"Principal Engineer" AND "AI agents"
"Staff Engineer" AND "AI agents"
```

**Tertiary buyer — Consultants / Integrators:**
```
"AI Integration Consultant"
"AI Solutions Architect"
"Enterprise AI Architect"
"AI Implementation Consultant"
"Digital Transformation Consultant" AND "AI"
"AI Technical Lead" AND "consulting"
"Healthcare AI Consultant"
```

---

### Boolean Strings — paste directly into Sales Navigator

**Primary buyer:**
```
("AI Engineer" OR "LLM Engineer" OR "AI Platform Engineer" OR "AI Agent Engineer" OR "AI Infrastructure Engineer") AND ("MCP" OR "Model Context Protocol" OR "Claude" OR "LangChain" OR "AI agents")
```

**Secondary buyer:**
```
("VP Engineering" OR "Head of Engineering" OR "Engineering Manager" OR "Director of Engineering" OR "CTO") AND ("AI" OR "agentic" OR "machine learning") AND ("SaaS" OR "startup" OR "B2B")
```

**Tertiary buyer:**
```
("AI Consultant" OR "AI Solutions Architect" OR "AI Implementation" OR "Enterprise AI") AND ("enterprise" OR "healthcare" OR "manufacturing" OR "Krista" OR "Claude" OR "UiPath")
```

**Highest-signal single search — companies actively hiring for MCP:**
```
Search job postings containing "MCP" OR "Model Context Protocol" posted in last 30 days.
These teams have active budget and are building in the stack right now.
```

---

### Companies to Target

| Tier | Type | Examples |
|---|---|---|
| 1 | AI-native developer tooling | Cursor, Codeium, Sourcegraph, Mintlify, Zed, Exa.ai, Continue.dev |
| 2 | B2B SaaS shipping AI agents | Intercom (AI), Reclaim.ai, Replit, Retool, Val.town, Forethought |
| 3 | Enterprise AI integration consultants | Boutique AI agencies 5–50 employees, vertical AI firms (healthcare, manufacturing) |
| 4 | Recently funded AI startups (Series A–B last 6 months) | Filter Crunchbase: "agentic" + funded + 10–100 engineers |

---

### Industry Filters

```
Computer Software
Artificial Intelligence
Internet
Information Technology and Services
Computer and Network Security
Hospital and Health Care          ← tertiary buyer
Industrial Automation             ← tertiary buyer
Management Consulting             ← tertiary buyer
```

---

### Skills to Filter By

**High-signal (MCP ecosystem):**
```
Model Context Protocol · MCP · AI Agents · LLM · Large Language Models
Agentic AI · Claude API · OpenAI API · LangChain · LlamaIndex · AutoGen · CrewAI
```

**Infrastructure / reliability crossover:**
```
CI/CD · GitHub Actions · JSON-RPC · API Testing · Reliability Engineering
SRE · TypeScript · Python · Docker
```

**Daily driver signals:**
```
Cursor · Windsurf · Claude Code · Codeium
```

---

### LinkedIn Hashtags

| Hashtag | Followers | Strategy |
|---|---|---|
| `#ModelContextProtocol` | ~5K | Own this now — zero competition, exact buyer |
| `#MCP` | ~12K | Niche, high signal |
| `#AIAgents` | ~180K | Best reach-to-relevance ratio |
| `#AgenticAI` | ~35K | Growing fast |
| `#AIEngineering` | ~95K | Core audience |
| `#AIInfrastructure` | ~28K | Reliability-minded engineers |
| `#CICD` | ~210K | DevOps/reliability crossover |
| `#ClaudeAI` | ~45K | Anthropic ecosystem |
| `#CursorAI` | ~22K | Active builder community |
| `#APITesting` | ~18K | Quality gate buyers |
| `#LLM` | ~320K | Broader, use as last tag |

**Best tag stack per post:** `#AIAgents #ModelContextProtocol #AIEngineering #CursorAI #CICD`

---

### LinkedIn Groups to Join and Post In

Post original analysis (not promotional) — group trust multiplies reply rate 3–5×.

```
AI & Machine Learning Professionals            1.8M members
Artificial Intelligence, ML, Deep Learning     950K members
Software Engineering & Development             2M+ members
DevOps, CI/CD, and Cloud Engineering
LLM & AI Practitioners Network
API Developers
Python Developers Network
Enterprise AI Adoption
AI in Healthcare                               ← tertiary buyer
Digital Transformation Executives             ← tertiary buyer
```

---

## INSTAGRAM

Instagram is awareness and credibility — not direct conversion. Engineers find tools here, then install them later.

### Hashtags by Tier

**Own these now (under 2K posts, zero competition):**
```
#modelcontextprotocol      < 2K posts
#mcpserver                 < 1K posts
#mcpdeveloper              < 500 posts
#aireliability             ~ 2K posts
```

**Micro (10K–100K) — best ROI:**
```
#aiagents                  ~ 85K
#llmops                    ~ 32K
#agenticai                 ~ 12K
#aiagentbuilder            ~ 6K
#cursorai                  ~ 18K
#claudeai                  ~ 24K
#aiproductbuilder          ~ 15K
#aiinfrastructure          ~ 28K
```

**Macro (100K–1M) — reach layer:**
```
#AItools                   ~ 850K
#devtools                  ~ 420K
#buildingwithai            ~ 165K
#llm                       ~ 310K
#pythondeveloper           ~ 380K
#typescript                ~ 195K
```

**Mega (use 1–2 max):**
```
#artificialintelligence    ~ 28M
#coding                    ~ 25M
```

**Best post stack:** 2 mega + 3 macro + 4 micro + 3–4 niche. The niche tags are where actual MCP developers find you.

---

### Content That Stops AI Engineers Scrolling

1. **Trust Score benchmarks** — "We ran Vouqis against 5 popular MCP servers. Here are the scores." Real data, terminal output, tag the maintainers. This is the highest-performing content type.

2. **Silent failure proof** — screenshot or terminal clip showing a server returning HTTP 200 on a malformed request. One-line caption: "Your uptime dashboard shows green. This server just accepted garbage."

3. **CI/CD YAML clips** — `vouqis audit $MCP_URL --fail-below 80` in a GitHub Actions workflow. Engineers screenshot this and install within 48 hours.

4. **"I tested your tool's MCP server"** — run Vouqis against Notion MCP, Linear MCP, Slack MCP. Post scores. Tag the companies. Controversy generates reach from exactly your ICP.

5. **MCP ecosystem news commentary** — when Anthropic ships a spec update, post "which servers pass the new spec?" before anyone else. Own the reliability angle on every MCP news cycle.

---

### Account Types to Engage Before Outreach

Meaningful comments for 2–3 weeks before any DM.

- Accounts posting Cursor/Claude integration walkthroughs
- "Ship in public" accounts from AI startups with 5–50 engineers
- "AI tools this week" aggregator accounts (50K–500K followers, all ICP)
- Indie hackers building AI tools
- Ex-FAANG going builder-mode ("prev: Google/Meta" in bio = budget + technical depth)

**Avoid:** generic "AI motivation" accounts, prompt tip accounts without code depth. Their audience skews consumer, not builder.

---

### ICP Bio Keywords on Instagram

Search these in bios when prospecting:

```
"building with AI"          "AI engineer"              "building AI agents"
"LLM developer"             "Cursor user"              "vibe coding"
"shipped X with Claude"     "AI infra"                 "building in public"
"agentic AI"                "TypeScript"               "AI startup"
"developer tools"           "AI agent builder"
```

---

## UNIVERSAL KEYWORDS

### Pain-Point Language — exact words your ICP uses

Mirror these in cold email subject lines, post hooks, and GitHub issue comments. When a prospect reads these, the recognition is instant.

```
"MCP server not responding"
"silent tool call failure"
"Claude tool_use returning null"
"MCP tools not showing up in Claude"
"agent works locally breaks in prod"
"testing MCP servers"
"how do I know if my MCP server is working"
"MCP server health check"
"MCP CI integration"
"AI agent flaky in production"
"JSON-RPC error in production"
"MCP server debugging"
"validate MCP server output"
```

---

### Adjacent Tools to Piggyback On

Reference these in content — your ICP searches for them.

**MCP-native (highest signal):**
```
MCP Inspector · Smithery · mcp.so · FastMCP
```

**Agent frameworks:**
```
LangChain · LlamaIndex · AutoGen · CrewAI · Semantic Kernel · Haystack
```

**Daily driver IDEs:**
```
Cursor · Windsurf · Claude Code · Codeium · Continue.dev · GitHub Copilot
```

**Testing / quality (familiar framing):**
```
Postman · Insomnia · Playwright · Vitest · k6
```

**CI/CD:**
```
GitHub Actions · CircleCI · GitLab CI · Buildkite
```

**Content play:** Write "We ran MCP Inspector, then ran Vouqis — here's what Inspector missed." Names the known tool, shows the gap, frames Vouqis instantly.

---

### Conference & Event Keywords

Post content the week before and the week of — your ICP is most active.

```
AI Engineer World's Fair (San Francisco, annual)
AI Engineer Summit
AI Tinkerers (meetup, 60+ cities, highly engaged)
Latent Space Pod live events
#AnthropicDevSummit · #BuildWithClaude
HIMSS (healthcare AI)             ← tertiary buyer
Hannover Messe (manufacturing)    ← tertiary buyer
KubeCon / SREcon                  ← reliability-minded engineers
```

**Tactical play:** In the 48 hours after any AI conference where MCP is mentioned, post "We ran Vouqis against the MCP servers demoed at [event]. Here are the Trust Scores." Ride the hashtag. Gets inbound from the exact people who just saw the demo.

---

## DISTRIBUTION STRATEGY

### The Public Audit Loop — highest-ROI activity in this playbook

Proven by the Reddit win. Do this weekly:

1. Pick a named MCP server from Smithery or mcp.so
2. Run `vouqis audit <url> --report`
3. Post terminal output with the Trust Score
4. Tag the maintainer
5. Every AI engineer who sees it is your ICP — free product discovery

**Weekly target:** 1 public audit post on LinkedIn + 1 on Instagram/X with real terminal output.

---

### Own the MCP Reliability Dataset

Nobody else has audited the ecosystem at scale and published it.

- The 71% median reliability figure (Digital Applied, 100 servers) is already cited and credible
- Turn each public audit into a running dataset: server name, URL, score, date, failure modes
- Publish a quarterly "MCP Reliability Report" — 50+ servers scored, methodology public
- That dataset becomes the citable benchmark. Journalists, researchers, and enterprise security teams will reference it. Vouqis becomes the name they associate with MCP reliability — not the CLI, the dataset.

**Important:** Every metric published must have a source and a query. Never publish a number you can't back up. Senior engineers check.

---

### Numbers Consistency — what to say where

| Claim | Correct phrasing | Source |
|---|---|---|
| Median reliability | "71% of tool calls succeed (median across 100 production servers)" | Digital Applied 2026 stress test |
| Chain failure | "5-tool chain at 71% reliability succeeds only 18% of the time" | Math: 0.71^5 = 0.18 |
| Ecosystem size | "9,400+ MCP servers in registries (mid-2026)" | Smithery + mcp.so |
| Your own audit count | Only cite verified numbers from your Supabase `eval_results` table | Live query |

**Rule:** If you can't point to a source or a SQL query, don't publish the number.

---

## EXECUTION PRIORITY — DO THESE THIS WEEK

1. **Sales Navigator search** — companies that posted a job with "MCP" or "Model Context Protocol" in the last 30 days. Active budget, active build.

2. **One LinkedIn post** — pick a real popular MCP server, run `vouqis audit <url> --report`, post the score with terminal output. Tag the maintainer. More reach than 200 cold emails.

3. **Claim `#modelcontextprotocol` on Instagram** — post there first 10 times with that tag. Zero competition. You become the reference account for the keyword.

4. **Paradigm Ventures follow-up** — Vin is evaluating. Send the marketing PDF + a pilot audit of a Krista MCP endpoint before the follow-up call.

---

*Last updated: May 2026 | Vouqis | hello@vouqis.tech*
