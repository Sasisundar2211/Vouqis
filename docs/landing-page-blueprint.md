# Vouqis — Landing Page Blueprint

**Version:** 1.0  
**Last Updated:** 2026-06-17  
**Reference:** https://www.vouqis.tech  
**Audience:** Developer / AI builder handoff document

---

## Design System Reference

| Token | Value |
|---|---|
| Background | `#0a0a0a` (near-black) |
| Foreground | `#f5f5f5` |
| Muted | `#6b7280` |
| Incident / Alert | `oklch(0.72 0.18 28)` — amber-red |
| Border | `rgba(255,255,255,0.08)` |
| Font: Display | Geist (variable) |
| Font: Mono | Geist Mono |
| Max content width | `1024px` |
| Section padding | `80px 0` |
| Mobile breakpoint | `640px` |

**Tone:** Precise. Minimal. Technical. No hype. Write like a staff engineer explaining a real problem to another engineer.

**Reading level:** Clear prose. Short sentences. Active voice. No marketing fluff.

---

## PAGE STRUCTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│  NAV (fixed, top)                                   │
├─────────────────────────────────────────────────────┤
│  HERO — 2-column: headline + terminal panel         │
├─────────────────────────────────────────────────────┤
│  TRUST STRIP — 3 metric cells                       │
├─────────────────────────────────────────────────────┤
│  PROBLEM — the silent failure chain                 │
├─────────────────────────────────────────────────────┤
│  FAILURE EXAMPLE — code panel + reality check       │
├─────────────────────────────────────────────────────┤
│  HOW IT WORKS — vertical flow diagram               │
├─────────────────────────────────────────────────────┤
│  CAPABILITIES — 2×3 grid                           │
├─────────────────────────────────────────────────────┤
│  WHO IT'S FOR — list + qualifier                    │
├─────────────────────────────────────────────────────┤
│  FAILURE REPORTS — documented failure patterns      │
├─────────────────────────────────────────────────────┤
│  CREDIBILITY — founder stats                        │
├─────────────────────────────────────────────────────┤
│  PRICING — 3 tiers                                  │
├─────────────────────────────────────────────────────┤
│  FAQ — 6 questions                                  │
├─────────────────────────────────────────────────────┤
│  FINAL CTA — dual CTA block                         │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
```

---

## SECTION 0: NAVIGATION (Fixed)

**Layout:** Full-width sticky bar. `height: 56px`. Background: `bg/80` with `backdrop-blur`. Bottom border: `1px solid border/50`.

**Left:** Logo wordmark — `Vouqis` in `14px` semi-bold.

**Right:**
- `Quickstart` → `/proxy` (hidden on mobile)
- `GitHub` → github.com/Sasisundar2211/Vouqis (new tab)

**Mobile:** Logo left. GitHub icon right only.

**A/B test:** Test adding "Book a Call" as a ghost button in nav vs. text link.

---

## SECTION 1: HERO

### Layout

Two-column grid on desktop. Single column stack on mobile.  
Left column: text and CTAs. Right column: live terminal trace panel.  
`padding-top: 160px` desktop, `120px` mobile. `padding-bottom: 100px`.

```
┌─────────────────────────────────────────────────────┐
│ ┌──────────────────────┐  ┌──────────────────────┐  │
│ │                      │  │  ┌──────────────────┐ │  │
│ │  H1 Headline         │  │  │ ● ● ●            │ │  │
│ │                      │  │  │ agent-session    │ │  │
│ │  Subheadline         │  │  ├──────────────────┤ │  │
│ │                      │  │  │ 1  09:14:22 ...  │ │  │
│ │  [Get Early Access]  │  │  │ 2  09:14:23 ...  │ │  │
│ │  Book a Call →       │  │  │ 3  ...           │ │  │
│ │                      │  │  │ ────────────────  │ │  │
│ └──────────────────────┘  │  │ "ticket never    │ │  │
│                            │  │  created."       │ │  │
│                            │  └──────────────────┘ │  │
│                            └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Copy

**H1 (large display text, ~52px, tight tracking):**
```
Catch MCP failures
before your users do.
```
*Typeset "before your users do." at 40% opacity — visual de-emphasis to create contrast.*

**Subheadline (15px, 60% opacity, max 38 characters wide):**
```
Route MCP traffic through Vouqis and detect null
responses, schema violations, timeouts, and
silent failures in real time.
```

**Primary CTA Button:**
- Text: `Get Early Access`
- Style: Filled. Background: `foreground`. Text: `background`. Height: `40px`. Padding: `0 20px`. Radius: `6px`.
- Behavior: Smooth scroll to `#early-access` section.
- Animation: Subtle pulse on a 4s loop to draw the eye. Pause on hover.

**Secondary CTA (text link):**
- Text: `Book a Discovery Call →`
- Style: `14px`, muted color, hover to foreground.
- Link: `https://calendly.com/sasisundar2211` (new tab)

### Hero Terminal Panel (Right Column)

**Container:** Rounded `8px` border. Dark card background. Subtle box shadow: `0 16px 48px -8px rgba(0,0,0,0.5)`.

**Chrome bar:** 36px height. Three traffic-light dots (red, amber, green). Label: `agent-session · vouqis/trace` in mono 10px at 45% opacity.

**Content:** Monospace font, 11px, line-height 1.85. Four rows animate in sequentially on load (stagger 300ms each, fade + slide up).

```
1  09:14:22  [agent]     →  createTicket("Deploy blocked")
2  09:14:23  [jira]      ←  HTTP 200  {"id":"TKT-8821","status":"created"}
3  09:14:23  [agent]        result.success === true
            ─────────────── 33 min 48 sec ───────────────
4  09:47:11  [customer]     "The ticket was never created."
             ▋
```

Row 4 is the punchline. Style `[customer]` text in the incident/amber color. The horizontal rule between row 3 and 4 is labeled with the elapsed time — make this amber/red to signal cost.

The blinking cursor `▋` animates at 1.2s interval.

**A/B test:** Try a version with Vouqis intercept shown between rows 3 and 4:
```
3.5  09:14:23  [vouqis]     ✗ result is null — blocked
```

---

## SECTION 2: TRUST STRIP

**Layout:** Three equal cells. Horizontal dividers between cells on desktop. Horizontal stack collapses to vertical on mobile.  
`border-top: 1px solid border/50`

```
┌──────────────────┬──────────────────┬──────────────────┐
│  ● Agent reported│  ● Action        │  ● Time to       │
│    success: true │    completed:    │    discovery:    │
│                  │    false         │    33 min 48 sec │
└──────────────────┴──────────────────┴──────────────────┘
```

**Cell 1:**
- Dot color: Green `oklch(0.65 0.17 145)`
- Label (mono caps, 10px): `Agent reported`
- Value (mono, 22px, 75% opacity): `success: true`

**Cell 2:**
- Dot color: Amber `var(--incident)`
- Label: `Action completed`
- Value (amber): `false`

**Cell 3:**
- Dot color: Red `oklch(0.55 0.22 25)`
- Label: `Time to discovery`
- Value (red): `33 min 48 sec`

*These three cells tell the entire problem in one row. The contrast between "success: true" (green) and "33 min 48 sec" (red) is the hook.*

---

## SECTION 3: THE PROBLEM

**Layout:** Single column. Max width `52ch`. Left aligned.

**Eyebrow (mono, 11px, 40% opacity, letter-spacing 0.08em, uppercase):**
```
The Problem
```

**Statement (28px–32px semi-bold, tight tracking, two-line):**
```
Tool call succeeds.
User outcome fails.
```
*"User outcome fails." renders at 40% opacity — same visual language as the hero.*

**Body (14px, muted):**
```
The agent reports success.
Your customer reports the bug.

Most MCP failures aren't crashes.
They're silent failures.
```

**Visual Element:**  
Side-by-side or stacked small block showing:
- Left panel: monospace code block — `MCP response`
  ```json
  {
    "success": true,
    "result": null
  }
  ```
- Right side: two rows
  - **Agent:** "Invoice created."
  - **Reality (in amber):** No invoice exists.

---

## SECTION 4: CONCRETE FAILURE EXAMPLE

**Layout:** 2-column on desktop. Code panel left. Outcome breakdown right. Max width `672px`.

**Code panel (left):**  
Bordered card, `background: rgba(255,255,255,0.02)`.  
Label in chrome bar: `MCP response`.  
Content: preformatted JSON block.

```json
{
  "success": true,
  "result": null
}
```

**Outcome breakdown (right):**  
Two stacked items separated by a horizontal rule.

- Row 1:
  - Label (mono caps 10px, 40%): `Agent`
  - Value (14px, 70%): "Invoice created."

- Divider: `1px solid border/40`

- Row 2:
  - Label (mono caps 10px, 40%): `Reality`
  - Value (14px, amber, semi-bold): No invoice exists.

---

## SECTION 5: HOW IT WORKS

**Layout:** Vertical flow diagram. Max width `224px`. Left-aligned within section.

**Eyebrow:** `How It Works`

**Flow nodes (6 items with connector arrows between each):**

```
┌─────────────────┐
│     Agent       │  ← standard border, muted text
└────────┬────────┘
         ↓
┌─────────────────┐
│    Vouqis       │  ← highlighted: foreground/20 border, brighter text, bg fill
└────────┬────────┘
         ↓
┌─────────────────┐
│   MCP Server    │  ← standard
└────────┬────────┘
         ↓
┌─────────────────┐
│Response Validate│  ← slightly brighter
└────────┬────────┘
         ↓
┌─────────────────┐
│ Trust Decision  │  ← slightly brighter
└────────┬────────┘
         ↓
┌─────────────────┐
│     User        │  ← standard
└─────────────────┘
```

Vouqis node is visually distinct — the "interceptor" in the chain. All text is monospace font.

---

## SECTION 6: CAPABILITIES

**Layout:** 2×3 grid on desktop. 1×6 stack on mobile.  
`border-top`, `border-bottom` on section.

**Section eyebrow:** omit — let the grid speak.

**6 capability blocks (icon-optional, text-first):**

| Title | Description |
|---|---|
| **Detect** | Catch null results, schema mismatches, and HTTP 200 errors that hide real failures |
| **Classify** | Tag every failure by type before it propagates — null_result, schema_violation, timeout, parse_error |
| **Block** | Halt calls that violate defined contracts before they reach your agent |
| **Retry** | Re-attempt only idempotent methods within a safe retry policy |
| **Trust Score** | Per-server reliability tracked over time — know which MCP servers you can depend on |
| **Audit Log** | Structured NDJSON record of every interaction. Query by failure type, time range, or server |

**Visual treatment:** Each block has a `14px` semi-bold title in `foreground/80` and a `12px` description in muted. No icons required — text-only grid reads cleanly at this density.

---

## SECTION 7: WHO THIS IS FOR

**Layout:** Single column. Max `480px`.

**Eyebrow:** `Built For`

**List (4 items with checkmark prefix):**
```
✓  Teams running production AI agents
✓  Founding engineers
✓  AI infrastructure teams
✓  Developers managing MCP integrations
```

**Qualifier line (mono, 11px, 40% opacity):**
```
Not for hobby projects.
```
*This line is intentional. It signals that the product is for serious production use and implicitly elevates the target customer.*

---

## SECTION 8: FAILURE REPORTS

**Layout:** Two-column on desktop: index column (128px fixed) + content column.  
Rows separated by `border-bottom: 1px solid border/40`.

**Section Headline:**
```
Failure Reports We're Collecting
```

**Subtext (14px, muted, max 52ch):**
```
Documented MCP failure patterns. Real failure modes, not marketing
scenarios. Send us one you've encountered.
```
Link `"Send us one you've encountered."` → `mailto:sasisundhar2211@gmail.com`

**Four failure cards (enumerate as INC-001 through INC-004):**

---

**INC-001 — Response Parse Failure**  
*Description:* MCP server returns HTTP 200 with an error object in the result field. Agent reads the status code, not the payload. Silent failure propagates downstream.  
*Vector:*
```
tools/call → createTicket → HTTP 200 {"error":"quota_exceeded"} → agent: success
```

---

**INC-002 — Retry Masking**  
*Description:* Agent retries on timeout and logs each attempt independently. Upstream service deduplicates. Agent emits success×6 with no trace of the original failure or retry count.  
*Vector:*
```
sendEmail → TIMEOUT → retry×6 → HTTP 200 (dedup) → logged: success
```

---

**INC-003 — State Drift (Multi-Agent)**  
*Description:* Agent B reads shared state before Agent A finishes writing. Both log completion. The merge step processes a stale snapshot. Workflow corrupts silently at step 3.  
*Vector:*
```
agent-A: writeState() → success | agent-B: readState(t−2s) → process(stale) → success
```

---

**INC-004 — Null Result Propagation**  
*Description:* Tool returns `{"result": null}`. Agent passes null to the next step. Failure surfaces eight steps later as a TypeError with no reference to the original null.  
*Vector:*
```
fetchUser → {"result":null} → generateReport(null) → TypeError: cannot read "id" of null
```

---

**Vector display:** Styled as a monospace code block with a faint `VECTOR` label prefix in caps at 30% opacity. Horizontally scrollable on overflow.

---

## SECTION 9: CREDIBILITY

**Layout:** Body text above. 4-column stat grid below.

**Body (14px, muted):**
```
Built after observing repeated MCP reliability failures across production agent systems.
```

**Stat grid (4 items):**

| Value | Label |
|---|---|
| `100+` | Protocol tests |
| `113` | Passing tests |
| `Open` | Source |
| `Founder` | Led support |

**Stat style:** Value in mono 24px semi-bold at 80% opacity. Label in mono 11px caps at 50% opacity with letter-spacing.

---

## SECTION 10: PRICING

**Layout:** Three-column card grid on desktop. Single column on mobile.  
`border-top: 1px solid border/50`

**Section Headline (24px semi-bold):**
```
Start free. Scale when it matters.
```

---

### Tier 1 — MCP Reliability Audit

**Badge:** `Free`  
**Price:** `$0`  
**Tagline:** Run a point-in-time reliability check on any MCP server.

**What you get:**
- Trust Score (0–100)
- Failure report with classified issues
- Response time analysis
- JSON export

**CLI command (code block):**
```bash
vouqis audit <your-mcp-server-url>
```

**CTA Button:** `Run a Free Audit` → `/proxy` (quickstart page)

---

### Tier 2 — Vouqis Cloud *(Coming soon)*

**Badge:** `Early Access`  
**Price:** `$49–$299 / month`  
**Tagline:** Runtime reliability protection for production MCP traffic.

**What you get:**
- Proxy-based request + response validation
- Real-time failure classification
- Team dashboard with per-server trust scores
- Failure alerts via email or Slack
- 90-day audit log retention

**CTA Button:** `Join Early Access` → Scroll to `#early-access`

**Note:** "Pricing finalised with design partners." — set expectations honestly.

---

### Tier 3 — Enterprise *(Contact us)*

**Badge:** `Custom`  
**Price:** `Contact for pricing`  
**Tagline:** Private deployment with compliance and dedicated support.

**What you get:**
- On-premises or VPC deployment
- Custom schema registry
- SLA and dedicated support
- SSO and audit compliance
- Failure intelligence across fleet

**CTA Button:** `Talk to the Founder →` → `mailto:sasisundhar2211@gmail.com`

---

**Pricing design notes:**
- Cards use `border: 1px solid border/60`, `background: rgba(255,255,255,0.02)`, `border-radius: 8px`
- Cloud tier card gets a slightly brighter border or subtle highlight to indicate recommended
- No checkmark lists — use clean bulleted text at 14px

---

## SECTION 11: FAQ

**Layout:** Accordion or static expanded list. Max width `640px`. Single column.

**Section Headline:**
```
Common questions
```

---

**Q1: What exactly is Vouqis?**

Vouqis is a proxy gateway that sits between your AI agent and your MCP server. Every tool call routes through Vouqis, which validates the request, forwards it upstream, validates the response, and classifies any failure before it reaches your agent. You get structured failure data and a trust score per server — without changing your agent code.

---

**Q2: Do I have to change my agent to use it?**

No. You point your agent at `127.0.0.1:4444` (or the Vouqis Cloud endpoint) instead of your MCP server directly. The proxy is transparent — your agent never knows it exists. Install takes under 60 seconds:

```bash
npm install -g @vouqis/cli
vouqis proxy --upstream https://your-mcp-server.example.com
```

---

**Q3: What failure types does Vouqis detect?**

Vouqis currently detects and classifies:
- **Null result propagation** — `result: null` despite HTTP 200
- **Schema violations** — JSON-RPC 2.0 envelope or tool schema mismatch
- **Timeout failures** — upstream did not respond within SLA
- **Parse errors** — response is not valid JSON
- **Retry masking** — retried requests where original failure is hidden

More failure signatures are added based on design partner incidents.

---

**Q4: Does the proxy add latency?**

Less than 10ms on the happy path at p95. Validation and audit logging are asynchronous — they do not block the response pipeline. Benchmark numbers are available in the repository.

---

**Q5: What data does Vouqis log or store?**

The audit log captures: timestamp, method, upstream hostname, latency, failure classification, and an internal ref ID. It never captures request/response content, full URLs, authentication tokens, or PII. The local proxy writes logs to your machine only. The cloud tier stores logs in your isolated workspace.

---

**Q6: Is this open source?**

The CLI proxy is open source: `github.com/Sasisundar2211/Vouqis`. The cloud dashboard and reliability intelligence are commercial products. You can run the proxy locally indefinitely at no cost.

---

**Q7: We already use LangSmith. Why do we need this?**

LangSmith traces LLM calls — prompts, tokens, agent chains, model outputs. It does not inspect MCP protocol behavior. Vouqis validates at the transport layer: JSON-RPC envelopes, response schemas, null results, timeout handling. They are complementary, not competing.

---

## SECTION 12: EARLY ACCESS CTA

**ID:** `early-access` (anchor target for scroll CTAs above)

**Layout:** Two-column on desktop. Stack on mobile.  
`border-top: 1px solid border/50`

### Left Column — Email Capture

**Headline (20px semi-bold):**
```
Get Early Access
```

**Body (14px, muted):**
```
We'll reach out when Vouqis opens for the next cohort.
No spam. One email when spots open.
```

**Email input + button (inline form on desktop, stacked on mobile):**
- Input placeholder: `you@company.com`
- Input style: Height `40px`, border `border/60`, bg transparent, `border-radius: 6px`, focus ring `foreground/30`
- Button text: `Get Access`
- Button style: Filled. Same as primary CTA.
- Submit behavior: POST to `/api/early-access` → show inline confirmation

**Success state (replace form):**
```
Got it — we'll be in touch.
```

**Error state (replace form):**
```
Something went wrong. Email us directly → [sasisundhar2211@gmail.com]
```

**Risk reversal (12px, mono, below form):**
```
No credit card. No commitment. Cancel any time.
```

---

### Right Column — Discovery Call

**Headline (20px semi-bold):**
```
Have you seen an MCP failure reach a user?
```

**Body (14px, muted):**
```
Tell us what happened. One conversation about a real
failure is worth more than another signup.
```

**CTA (text link):**
```
Share the details →
```
Link → `mailto:sasisundhar2211@gmail.com?subject=MCP failure report`

---

## SECTION 13: CLOSING CTA

**Layout:** Single column. Max width `40ch`.  
`border-top: 1px solid border/50`

**Headline (28px–32px semi-bold, two-line):**
```
MCP servers fail silently.
Vouqis helps you catch failures before users do.
```
*Second line at 40% opacity.*

**Primary CTA Button:**
- Text: `Book a Discovery Call`
- Style: Same as hero CTA. Filled. Pulse animation.
- Link: `https://calendly.com/sasisundar2211`

---

## SECTION 14: FOOTER

**Layout:** Horizontal flex. `border-top: 1px solid border/50`. `padding: 28px 0`.

**Left:**
```
© 2026 Vouqis
```
Mono font, 11px, 50% opacity.

**Right (6-item link list, 11px, 38% opacity on default, 65% on hover):**
- GitHub → `github.com/Sasisundar2211/Vouqis`
- Privacy → `github.com/.../PRIVACY.md`
- `sasisundhar2211@gmail.com`

---

## COPY GUIDELINES

### Voice

- **Precise.** No adjectives that don't add meaning. No "powerful," "seamless," or "best-in-class."
- **Technical.** The reader is an engineer. Use the real terms: JSON-RPC, MCP, HTTP 200, null result. Don't soften them.
- **Honest.** We're in customer discovery. The copy says "early access" not "trusted by thousands." Numbers are real.
- **Respectful.** Don't over-explain. Engineers will get it fast.

### Formatting Rules

- Short paragraphs. Max 3 sentences before a break.
- Bullet points for lists of 3+. Not before.
- Monospace font for all technical references: method names, error codes, CLI commands, JSON.
- Bold for key terms on first use only.
- Never use exclamation marks.
- Never use "easy," "simple," or "just."

### SEO Keywords (include naturally)

- MCP reliability
- Model Context Protocol observability
- MCP gateway
- AI agent reliability
- Silent MCP failures
- MCP proxy
- JSON-RPC validation
- Tool call reliability

---

## TECHNICAL NOTES FOR DEVELOPERS

### Stack

- **Framework:** Next.js 16 App Router (React 19, Tailwind v4, Geist fonts)
- **Deployment:** Vercel
- **Email capture:** POST `/api/early-access` → Resend SDK → `sasisundhar2211@gmail.com`
- **Analytics:** `@vercel/analytics/next` — `<Analytics />` in root layout

### Performance Requirements

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Time to interactive | < 3s on 4G |

### Animation Constraints

- All animations use CSS only — no JS animation libraries
- Animations respect `prefers-reduced-motion` (`@media (prefers-reduced-motion: reduce)`)
- Hero terminal rows: CSS `@keyframes` fade + slide, staggered with `animation-delay`
- CTA pulse: `@keyframes` scale + opacity loop at 4s, pause on hover
- Cursor blink: `@keyframes` opacity 0↔1 at 1.2s interval

### Interactivity

- Only `'use client'` component: `EmailCapture` (form state only)
- All other sections: Server Components (static)
- FAQ: Static expanded — no JS accordion needed at this page count
- Pricing: Static — no toggle needed (no monthly/annual switch)

### Scroll Behavior

- `history.scrollRestoration = 'manual'` set in `<head>` inline script before hydration
- `window.scrollTo(0, 0)` in the same script
- "Get Early Access" CTA: `href="#early-access"` — native smooth scroll

### Accessibility

- `<a href="#main-content">Skip to content</a>` — first element in body, visually hidden, shown on focus
- All interactive elements keyboard-accessible
- Color is never the sole indicator (always paired with label or text)
- Contrast ratios: body text > 4.5:1, muted text > 3:1 against `#0a0a0a` background

---

## A/B TESTING RECOMMENDATIONS

Priority order — test sequentially, not simultaneously:

| Element | Variant A (current) | Variant B (test) | Metric |
|---|---|---|---|
| Hero headline | "Catch MCP failures before your users do." | "Your MCP tool said success. Your user got a bug." | Email signups |
| Primary CTA text | "Get Early Access" | "Run a Free Audit" | CTA clicks |
| Trust strip | 3 status metrics | Social proof: "Used by engineers at [anon companies]" | Scroll depth |
| Hero panel | Failure trace (broken outcome) | Vouqis interception (caught outcome) | Time on page |
| FAQ placement | Before pricing | After pricing | Conversion rate |
| Discovery call CTA | "Book a Discovery Call →" | "Share an MCP failure you've hit →" | Calendly bookings |

---

## FUTURE SECTIONS (Add Post-Validation)

These sections are intentionally excluded from V1 to maintain focus. Add when supporting evidence exists:

1. **Social proof / testimonials** — Add after first 3 design partners provide quotes
2. **Case study** — Add after first documented "failure caught, production incident avoided" story
3. **Press / mentions** — Add after first Hacker News or media coverage
4. **Video demo** — Add after stable product demo is recorded
5. **Trust badges** — Add after SOC 2 or security review completion

---

## WIREFRAME: FULL PAGE SCROLL (TEXT NOTATION)

```
[NAV] Vouqis _____________________________________________ Quickstart  GitHub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HERO - 2col]
LEFT:
  Catch MCP failures          ┌──────────────────────────┐
  before your users do.       │ ● ● ●  agent-session     │
                              ├──────────────────────────┤
  Route MCP traffic through   │ 1  09:14:22 [agent]  →   │
  Vouqis and detect null      │    createTicket(...)      │
  responses, schema           │ 2  09:14:23 [jira]   ←   │
  violations, timeouts, and   │    HTTP 200 {...}         │
  silent failures.            │ 3  09:14:23 [agent]       │
                              │    result.success===true  │
  [Get Early Access]          │  ───── 33 min 48 sec ─── │
  Book a Discovery Call →     │ 4  [customer] "ticket     │
                              │    was never created."    │
                              │ ▋                         │
                              └──────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TRUST STRIP - 3col]
● Agent reported   │  ● Action completed  │  ● Time to discovery
  success: true    │    false             │    33 min 48 sec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PROBLEM]
The Problem

Tool call succeeds.
User outcome fails.       ← "fails." at 40% opacity

The agent reports success. Your customer reports the bug.
Most MCP failures aren't crashes. They're silent failures.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FAILURE EXAMPLE - 2col]
┌──────────────────┐   Agent     "Invoice created."
│ MCP response     │   ─────────────────────────────
│ {                │   Reality   No invoice exists.
│   "success":true │             (amber text)
│   "result": null │
│ }                │
└──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HOW IT WORKS]
How It Works

  ┌───────────────┐
  │     Agent     │
  └───────┬───────┘
          ↓
  ┌───────────────┐  ← highlighted
  │    Vouqis     │
  └───────┬───────┘
          ↓
  ┌───────────────┐
  │   MCP Server  │
  └───────┬───────┘
          ↓
  ┌───────────────┐
  │  Response     │
  │  Validation   │
  └───────┬───────┘
          ↓
  ┌───────────────┐
  │ Trust Decision│
  └───────┬───────┘
          ↓
  ┌───────────────┐
  │     User      │
  └───────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CAPABILITIES - 2x3 grid]
Detect          Classify          Block
[desc]          [desc]            [desc]

Retry           Trust Score       Audit Log
[desc]          [desc]            [desc]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[BUILT FOR]
Built For

✓  Teams running production AI agents
✓  Founding engineers
✓  AI infrastructure teams
✓  Developers managing MCP integrations

Not for hobby projects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FAILURE REPORTS]
Failure Reports We're Collecting

INC-001  Response Parse Failure
         [description]
         VECTOR  tools/call → ... → agent: success

INC-002  Retry Masking
         ...

INC-003  State Drift — Multi-Agent
         ...

INC-004  Null Result Propagation
         ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CREDIBILITY - stats grid]
Built after observing repeated MCP reliability failures.

100+          113            Open         Founder
Protocol      Passing        Source       Led support
tests         tests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PRICING - 3 cards]
Start free. Scale when it matters.

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  FREE            │  │  EARLY ACCESS    │  │  ENTERPRISE      │
│                  │  │  ★ recommended   │  │                  │
│  $0              │  │  $49-$299/mo     │  │  Custom          │
│                  │  │                  │  │                  │
│  MCP audit CLI   │  │  Runtime proxy   │  │  Private deploy  │
│  Trust score     │  │  Dashboard       │  │  Compliance      │
│  Failure report  │  │  Alerts          │  │  SLA             │
│  JSON export     │  │  90-day logs     │  │  Custom schema   │
│                  │  │                  │  │                  │
│ [Run Free Audit] │  │ [Join Early Acc] │  │ [Talk to Founder]│
└──────────────────┘  └──────────────────┘  └──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FAQ]
Common questions

Q: What exactly is Vouqis?      A: [...]
Q: Do I need to change code?    A: [...]
Q: What failures does it catch? A: [...]
Q: Does the proxy add latency?  A: [...]
Q: What data does it log?       A: [...]
Q: Is this open source?         A: [...]
Q: We use LangSmith already?    A: [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[EARLY ACCESS CTA - 2col]              id="early-access"

Get Early Access                 Have you seen an MCP failure
We'll reach out when Vouqis      reach a user?
opens for the next cohort.
                                 Tell us what happened.
[you@company.com] [Get Access]
                                 Share the details →
No credit card. No commitment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CLOSING CTA]
MCP servers fail silently.
Vouqis helps you catch failures before users do.  ← 40% opacity

[Book a Discovery Call]  ← pulsing CTA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FOOTER]
© 2026 Vouqis        GitHub  Privacy  sasisundhar2211@gmail.com
```
