# EVIDENCE.md

Distilled evidence from engineer interviews and observation sessions. Not interview notes. Not transcripts. The answer to: *what did we observe, independently, and what does it mean?*

Updated after each Validation Gate. Read by `/grill-with-docs` before any PRD is written.

---

## Validation Gate Status

| Hypothesis | Status | Confirmations | Disconfirmations | Exit Condition |
|---|---|---|---|---|
| H0 | Unknown | 0 | 0 | 3 independent confirmations |
| H1 | Unknown | 0 | 0 | 3 independent confirmations |
| H2 | Unknown | 0 | 0 | 3 independent confirmations |

**Gate: CLOSED.** No evidence collected yet. Do not proceed to PRD.

---

## H0 — Gateway Compatibility

> Production MCP deployments are compatible with a gateway architecture.

**Status**: Unknown

**Evidence**: None

**Next assumption test**: Audit public MCP deployment patterns. Confirm HTTP/SSE transport is standard, not stdio-only, in at least 3 independent production environments.

---

## H1 — Pain Severity

> Runtime reliability is painful enough to justify a dedicated gateway.

**Status**: Unknown

**Evidence**: None

**Next assumption test**: Five production engineering interviews. Observe real debugging sessions. Look for: time lost to silent failures, workarounds already in place, frustration with the current state.

---

## H2 — Receipt Effectiveness

> Failure Receipts reduce TFCA (Time to First Confident Action).

**Status**: Unknown

**Evidence**: None

**Next assumption test**: Three independent debugging sessions with receipt output visible. Measure TFCA and Action Accuracy. Record whether the receipt shortened the path to the correct next debugging step.

---

## Session Log

*(Populated after each interview. One entry per session.)*

| # | Date | Scenario | TFCA | Accuracy | Confidence | Hypothesis | Verdict |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

---

## Emerging Patterns

*(Populated when the same behavior appears independently across sessions.)*

None yet.

---

## Missing Artifacts

*(What did engineers reach for that Vouqis doesn't provide?)*

None observed yet.

---

## Kill Signals

*(Counter-observations strong enough to invalidate an assumption.)*

None recorded.

---

*This document is the input to the next `/grill-with-docs` session. Do not write a PRD until the gate opens.*
