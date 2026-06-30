# EVIDENCE.md

Distilled observations from engineer interviews and production sessions. Not interview notes. Not transcripts. The answer to: *what did we observe, independently, and what does it mean?*

**Append-only.** Observations are never edited or removed. Interpretations may be added as evidence accumulates. Failed hypotheses stay in the file — they prevent rebuilding what was already invalidated.

Updated after every session. Read by `/grill-with-docs` before any PRD is written. Do not write a PRD until the gate opens.

---

## Validation Gate

| Hypothesis | Confirmations | Status | Gate |
|---|---|---|---|
| H0 — Gateway compatibility | 0 / 3 | Unknown | Closed |
| H1 — Pain severity | 0 / 3 | Unknown | Closed |
| H2 — Receipt effectiveness | 0 / 3 | Unknown | Closed |

**Overall gate: CLOSED.** Proceed to the next `/grill-with-docs` only when all three hypotheses reach 3 independent confirmations, or when a kill signal invalidates an assumption and forces a pivot.

---

## North Star: Independent Confirmations per Month

The metric that matters during discovery is not installs, stars, or commits. It is: how many independent engineers, in independent companies, using independent MCP implementations, encountered a naturally occurring failure and confirmed the hypothesis without prompting?

Current: **0**

---

## H0 — Gateway Compatibility

> Production MCP deployments are compatible with a gateway architecture.

**Current status**: Unknown — 0 / 3 confirmations

**Assumption under test**: HTTP/SSE transport is standard in production MCP deployments, not stdio-only. A gateway can sit in the path without breaking the existing deployment model.

**Next assumption test**: Audit public MCP deployment patterns across at least 5 production systems. Look for transport layer (HTTP/SSE vs stdio). Confirm with engineers who run MCP in production.

*(No observations yet. First entry will appear here after interview #1 touches H0.)*

---

## H1 — Pain Severity

> Runtime reliability is painful enough to justify a dedicated gateway.

**Current status**: Unknown — 0 / 3 confirmations

**Assumption under test**: Engineers running MCP in production have experienced reliability failures that caused real cost: debugging time, customer impact, loss of confidence in the agent. The pain exists independently of Vouqis.

**Next assumption test**: Five production engineering interviews. Observe real debugging sessions. Do not show the product first — ask about their experience with MCP reliability before introducing Vouqis.

*(No observations yet.)*

---

## H2 — Receipt Effectiveness

> Failure Receipts reduce TFCA (Time to First Confident Action).

**Current status**: Unknown — 0 / 3 confirmations

**Assumption under test**: When an engineer sees a Failure Receipt, it shortens the time between observing a failure and confidently choosing the next debugging step — compared to the baseline of no receipt.

**Next assumption test**: Three independent debugging sessions with receipt output visible. Measure TFCA from failure observation to confident next step. Record Action Accuracy (was the next step correct?).

*(No observations yet.)*

---

## Kill Signals

Observations strong enough to invalidate an assumption. One strong kill signal kills an unvalidated feature; it cannot be overridden by enthusiasm.

*(None recorded.)*

---

## Missing Artifacts

What did engineers reach for that Vouqis does not provide? Observed across sessions.

*(None observed yet.)*

---

## Emerging Patterns

Behaviors observed independently across multiple sessions. A pattern becomes a roadmap input when it reaches Evidence Level 2 (3 independent confirmations).

*(None yet.)*
