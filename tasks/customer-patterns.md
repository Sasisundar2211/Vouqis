# customer-patterns.md

> Living document.
>
> This file captures observed customer behavior, not feature ideas.
> Every pattern should come from real conversations, PR reviews, or production usage.
>
> Roadmap decisions should reference this file before adding new features.

Last Updated: 2026-07-17

---

## Core Observation

AI engineers do not struggle to review code.

They struggle to decide whether an AI behavior change is safe to merge.

The review problem is behavioral, not syntactic.

---

## Pattern #1
### Passing evals are not enough.

**Evidence:** Reddit (multiple engineers), Product for Engineers newsletter, customer conversations

Engineers still inspect traces, examples, prompt diff, and production metrics before approving — even when evals pass.

**Product implication:** Vouqis should never present passing evals as sufficient evidence. Instead: show what evals did NOT verify.

Priority: ★★★★★

---

## Pattern #2
### Engineers review evidence, not scores.

**Evidence:** LLMDev Reddit, Product for Engineers, multiple comments

Reviewers open GitHub, Langfuse, LangSmith, Promptfoo, and logs. They compare evidence manually. They rarely trust single scores, single confidence values, or benchmarks.

**Product implication:** Evidence Package > AI Score.

Priority: ★★★★★

---

## Pattern #3
### Prompt changes are deployment changes.

**Evidence:** Reddit, customer interviews, newsletter

Prompt updates are reviewed like production deployments. Reviewers expect rollback, blast radius, affected workflows, and changed behavior — not just text diff.

**Product implication:** Risk classification matters.

Priority: ★★★★★

---

## Pattern #4
### Silent failures are the biggest fear.

**Evidence:** Multiple Reddit incidents, newsletter, customer interviews

Examples: HTTP 200 + wrong document retrieved, Spanish responses, malformed JSON, null output, short audio file, tool succeeds + user fails. The failure is invisible at the code level.

**Product implication:** Verify behavior. Never verify only status.

Priority: ★★★★★

---

## Pattern #5
### Engineers leave GitHub reluctantly.

**Evidence:** Multiple engineers, Reddit, customer interviews

Current workflow: GitHub → Langfuse → Logs → LangSmith → back to GitHub.

**Product implication:** Review Package should answer as many questions as possible inside GitHub.

Priority: ★★★★★

---

## Pattern #6
### Human review still matters.

**Evidence:** Nearly every discussion.

Nobody merges because AI approved. People merge because evidence looks convincing.

**Product implication:** Vouqis augments reviewers. It never replaces reviewers.

Priority: ★★★★★

---

## Pattern #7
### Traces are trusted.

**Evidence:** Repeated mentions.

Engineers inspect: tool calls, retrieved chunks, latency, retries, fallbacks, intermediate outputs.

**Product implication:** Trace comparison is likely Phase 1.

Status: Waiting for customer validation.

---

## Pattern #8
### Behavior diff matters more than text diff.

**Evidence:** Multiple comments, newsletter

Engineers ask "What changed?" not "What prompt changed?"

**Product implication:** Future Review Packages should show: Old behavior → New behavior → Evidence.

Priority: ★★★★☆

---

## Pattern #9
### Engineers distrust averages.

**Evidence:** Multiple Reddit comments.

Average score improved → 5% of users broke. Average latency improved → one workflow regressed.

**Product implication:** Segment evidence. Never show only aggregate metrics.

Priority: ★★★★☆

---

## Pattern #10
### Merge decisions are about risk.

Engineers ask: If this fails, how fast do we know? How fast do we rollback? Who is affected?

**Product implication:** Review Package should eventually include rollout advice, rollback signals, and monitoring suggestions.

Status: Future.

---

## Pattern #11
### Missing evidence drives the roadmap.

Current source: Question 3 — "What evidence did you still need?"

Feature requests do NOT drive roadmap. Repeated missing evidence does.

Rule: Minimum 3 independent companies OR 10 repeated mentions before building.

---

## Hypotheses to Validate

These are hypotheses. Not facts.

| Hypothesis | Metric | Status |
|---|---|---|
| H1: Review Packages reduce review time | merge_latency_minutes | Measuring |
| H2: Review Packages reduce tool switching | q2: "What else did you open?" | Measuring |
| H3: Risk score influences merge decisions | Interview observation | Not started |
| H4: Engineers trust generated examples | Interview observation | Not started |
| H5: GitHub comments are enough | Retention + q2 | Measuring |

---

## Things Customers Have NOT Asked For

Do not build until requested.

- Dashboard
- Billing
- Slack
- Teams
- Analytics
- Org management
- SSO
- Notifications
- AI chat
- Replay
- History

---

## Current Product Principle

Evidence over opinions.
Behavior over syntax.
Workflow over features.
Observation before automation.
Customer behavior decides the roadmap.

---

## Roadmap Rule

No feature enters Phase 1 unless:
- observed repeatedly AND
- solves an existing workflow AND
- appears in multiple independent companies

Otherwise: keep interviewing.
