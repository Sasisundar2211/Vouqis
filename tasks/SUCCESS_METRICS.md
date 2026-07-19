# Vouqis Verify — Success Metrics

**Generated:** 2026-07-15

---

## Core Assumption

AI engineers will repeatedly use an automatically generated AI Change Review Package
before merging AI-related pull requests — because it reduces the number of tools they
need to open.

If this assumption is wrong, the roadmap changes. Everything else is secondary.

---

## Failure Criteria

Pause or pivot if any of these is true after 10 external Review Packages generated:

- Engineers ignore the Review Package (open rate < 30%)
- They still open Langfuse / LangSmith for every review (feedback: "What tool did you still open?" returns non-None > 80% of the time)
- The package never influences a merge decision (feedback: "changed my review?" returns "No change" or "Not useful" > 70%)
- The workflow adds friction (engineers uninstall the GitHub App within 7 days)

One failure signal is noise. Two or more is a pattern. Three means stop and reassess.

---

## Metrics by Phase

### Phase 0 — Does anyone find this useful?

| Metric | Target | How to measure |
|---|---|---|
| External installs | ≥ 1 | GitHub App install count |
| AI PRs detected | ≥ 1 | Webhook logs |
| Review Packages generated | ≥ 1 | PR comment posted |
| Feedback link clicked | ≥ 1 | GET /api/feedback logs |
| "I'd use this again" response | ≥ 1 | Feedback response = "changed" or "blocked" |

**Go/no-go:** If 0 external installs after reaching 10 outreach contacts, the distribution
model (GitHub App install) has too much friction. Consider shipping the Python Action
to more channels first.

---

### Phase 1 — Do engineers open the package?

| Metric | Target | How to measure |
|---|---|---|
| External PRs tracked | ≥ 5 | review_packages table rows |
| Review Package open rate | ≥ 50% | /review/[token] page visits |
| Time spent on package | > 30s | (manual interview, not instrumented yet) |
| Feedback responses | ≥ 3 | /api/feedback logs |

---

### Phase 2 — Does the package replace manual inspection?

| Metric | Target | How to measure |
|---|---|---|
| "What tool did you still open?" → GitHub only / None | ≥ 40% | Feedback logs |
| Feedback: "Changed my review" | ≥ 30% of responses | Feedback logs |
| Reviewer time saved (self-reported) | "Yes" on interview | Manual interview |

---

### Phase 3 — Does the package replace observability tools?

| Metric | Target | How to measure |
|---|---|---|
| Integrations connected | ≥ 2 orgs | integrations table |
| "What tool did you still open?" → None | ≥ 60% | Feedback logs |
| "I didn't need Langfuse" (interview) | ≥ 1 person | Manual interview |
| Behavior Diff opened per package | > 0 views | UI analytics |

---

### Phase 4 — Is this a habit?

| Metric | Target | How to measure |
|---|---|---|
| Design partners | ≥ 2 | Direct relationship |
| Weekly active repositories | ≥ 2 for 3 consecutive weeks | PR webhook events |
| Teams requesting features | ≥ 1 inbound request | Email / GitHub issues |
| Repeat usage (same repo, 3+ PRs) | ≥ 2 repos | review_packages query |

---

## Validation Indicators (qualitative)

These are the phrases that confirm the core assumption. Collect them in interviews.

**Strong signal (assumption confirmed):**
- "I'd use this again"
- "This saved me time"
- "I didn't need to open Langfuse"
- "This changed my merge decision"
- "I blocked the PR because of this"
- "I found something I would have missed"

**Weak signal (product works, assumption unclear):**
- "It's interesting"
- "I can see the value"
- "This would be useful for bigger teams"

**Falsification signal (assumption wrong):**
- "I still opened Langfuse anyway"
- "The PR comment is too long"
- "I just look at the diff in GitHub"
- "I trust my engineers — I don't need another review step"
- "We already have a process for this"

---

## Feedback Collection

Every Review Package PR comment includes two feedback questions:

**Question 1: Did this package change your review decision?**
- ✅ Yes, I merged because of it
- ⚠️ Yes, I delayed or blocked
- ➖ No change to my decision
- ❌ Not useful

**Question 2: What tool did you still open?**
- Langfuse
- LangSmith
- Promptfoo
- GitHub only (no external tools)
- None (Vouqis was sufficient)
- Other

Feedback clicks → `GET /api/feedback?r={response}&tool={tool}&pr={pr_id}`  
Logged to: Google Sheet (same pipeline as `api/design-partner`)

Review this data after every 5 packages. Don't wait for statistical significance.
At this stage, one person saying "I didn't need Langfuse" is worth more than
a 95% confidence interval.

---

## Behavior Funnel (per Review Package)

These four events tell you whether the package is becoming part of the workflow.
Track them per-PR once Phase 1 adds persistence.

```
Review Package Generated
         │
         ▼  (drop-off = package not surfaced, or PR has no AI changes)
Review Package Opened      ← target: > 50%
         │
         ▼  (drop-off = content not useful, or time-consuming)
Feedback Link Clicked      ← target: > 25% of opens
         │
         ├─→ Merged (no blocks)
         └─→ Requested Changes (package influenced outcome)
```

| Event | Phase 0 tracking | Phase 1+ tracking |
|---|---|---|
| Generated | Webhook log: comment posted | `review_packages` table |
| Opened | N/A (no web URL yet) | `/review/[token]` page visits |
| Feedback clicked | GET /api/feedback hit | feedback table row |
| Merged | N/A | PR state change webhook |
| Requested changes | N/A | PR review event webhook |

If "Generated" → "Feedback clicked" is below 10% after 20 packages, the comment is being ignored. That's a product failure, not a metrics failure.

---

## What Success Is NOT

- GitHub App installs with no feedback responses
- High evidence scores with no reviewer opens
- Positive feedback from the founder's own PRs
- "This is a great product" from someone who hasn't used it on a real PR
