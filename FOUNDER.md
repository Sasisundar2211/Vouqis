# FOUNDER.md

How Vouqis makes decisions.

This document has one job. It is not a vision statement, roadmap, or technical reference. It answers the question every team member and investor should be able to ask: *why did you build this and not that?*

It is the constitution of the company, not a description of the current product. Code changes. Architecture may be refactored. This document should remain remarkably stable, because it describes the decision process, not the current implementation.

---

## Operating Principle

**Build certainty before building software. Build software before building platforms. Build platforms only after repeated evidence proves they are needed.**

---

## The Prime Rule

**Never solve tomorrow's workflow before observing today's workflow.**

This rule explains every feature that does not exist yet: no dashboard, no cloud, no replay, no storage, no AI, no scoring. It is the first filter applied before any other framework.

---

## Decision Framework

Every proposed change is classified before it is evaluated. Classification determines the evidence bar.

| Decision Type | Primary User | Evidence Required | Reversible? | Example |
|---|---|---|---|---|
| Research Instrument | Founder | Founder judgment | Yes — delete when done | Interview prototype, assumption tests |
| Architecture | Engineers (indirectly) | First principles | Yes | Protocol layer, reliability layer, failure classifier |
| Reversible UX / Diagnostics | Engineer | First principles + founder judgment | Yes | Failure Receipt, INSPECT_NEXT guidance |
| Product Capability | Engineer | 3 independent confirmations | Usually | (none yet) |
| Workflow Feature | Engineer | Repeated observation of the same manual step | Increasingly | Replay |
| Platform Feature | Organization | Strong cross-company evidence + rollback plan defined | No | Cloud, storage, dashboards, public API |

**If you cannot classify a proposed feature, it belongs on the Anti-Roadmap until you can.**

Research Instruments are the only category exempt from evidence requirements — they exist to generate evidence. They have no users other than the founder, no stability guarantees, and no backwards compatibility. Deleting a Research Instrument after it has answered its question is a healthy outcome, not a failure. Never promote a Research Instrument to a Product Capability without going through the full assumption-test pipeline first.

The reversibility test: can this be removed in one commit with zero user migration cost? If yes, it is architectural. If teams build workflows around it, it is not.

---

## Operating Loop

The complete product cycle. Every pass through the loop produces either evidence or a kill signal — never just elapsed time.

```
Problem
  ↓
/grill-with-docs        sharpen the idea against the codebase
  ↓
Prototype               answer questions that can't be settled in conversation
  ↓
══════════════════════════════════
VALIDATION GATE
  Exit condition: 3 independent confirmations
  Kill condition: 1 strong disconfirmation (unvalidated features only)
══════════════════════════════════
  │                     │
  ▼                     ▼
Validated           Invalidated
  │                     │
  ▼                     ▼
EVIDENCE.md         Revise prototype
  ↓                 or kill assumption
/grill-with-docs
  ↓
/to-prd
  ↓
/to-issues
  ↓
/implement (fresh session per issue)
  ↓
Release
  ↓
Observation         → feeds back into the next Problem
```

**EVIDENCE.md is the bridge artifact.** It lives between the Validation Gate and the next `/grill-with-docs`. It is not a PRD, not interview notes, and not a transcript. It is the distilled answer to: *what did we observe, independently, and what does it mean?* Every `/grill-with-docs` after the first takes EVIDENCE.md as input so that design discussions are grounded in observation, not belief.

---

## Decision Pipeline

Ideas do not go directly to evidence. Assumptions are cheaper to invalidate than products.

```
Idea
  ↓  What assumption must be true for this to matter?
Assumption
  ↓  What is the cheapest way to prove or disprove it?
Assumption Test
  ↓  Has the assumption been confirmed independently 3 times?
Evidence
  ↓
Roadmap
```

Most ideas should die at the assumption test stage. That is the goal, not a failure.

### Assumption Test Examples

| Feature | Encoded Assumption | Cheapest Test |
|---|---|---|
| Persistent evidence | Engineers need historical artifacts | During a session, give them a saved JSON response. Observe whether they reach for it unprompted. |
| Replay | Engineers reproduce requests manually | Watch a debugging session. Do they replay requests themselves? |
| Dashboard | Teams monitor multiple gateways | Ask them to debug three simultaneous failures using today's receipt output. |
| Alerts | Engineers miss failures because they never see them | Observe whether failures are discovered proactively or through customer reports. |
| Cloud | Organizations want centralized management | Ask: "If Vouqis required a cloud account to operate, would you still install it?" |
| Observation mode | Engineers need to trust before accepting intervention | Watch for engineers who want receipt output but disable blocking. |

---

## Evidence Levels

| Level | Definition | Action |
|---|---|---|
| 0 | Founder intuition | Hypothesis only. Do not build. |
| 1 | Observed once | Interesting. Watch for repetition. Do not build. |
| 2 | Observed independently 3 times | Roadmap candidate. Assign assumption test. |
| 3 | Observed repeatedly across companies | Product invariant. Build it. Stop debating. |

**Independence requirements for Level 2+**: different person, different organization, different MCP implementation, naturally occurring failure (not staged), no prior exposure to other interviews.

---

## Kill Rules

A single strong counter-observation can invalidate either the **assumption** or the **implementation** — not both by default. Distinguish them before acting.

| Counter-Observation | Kills |
|---|---|
| "Replay wouldn't help me — I'd rather compare the raw response." | Replay (implementation). The historical evidence assumption may still hold. |
| "I never need to look at historical data." | The historical evidence assumption entirely. |
| "The receipt already tells me enough." | Persistent evidence feature. |
| "I debug everything locally over stdio." | H0 — gateway adoption hypothesis. |

A feature **below** evidence threshold can be stopped by one strong disconfirmation.

A feature **above** evidence threshold (Level 2+) cannot be killed by counter-evidence — the evidence bar can only be raised, not overridden. Build it.

---

## Current Hypotheses

| ID | Hypothesis | Status | Evidence | Next Test |
|---|---|---|---|---|
| H0 | Production MCP deployments are compatible with a gateway architecture. | Unknown | None | Audit public MCP deployment patterns. Desk research + 5 production engineering interviews. |
| H1 | Runtime reliability is painful enough to justify a dedicated gateway. | Unknown | Founder experience only | Five production engineering interviews observing real debugging sessions. |
| H2 | Failure Receipts reduce TFCA. | Unknown | Not yet observed | Observe three independent debugging sessions with receipt output visible. |
| H3–H5 | TBD from interview findings. | — | — | Define after H0–H2 tests complete. |

---

## North Star Metrics

**Primary: TFCA — Time to First Confident Action**

Time from failure observation to the engineer confidently choosing their next debugging step. Ends when the engineer states or implies: "I know what I'm checking next."

**Validation: AA — Action Accuracy**

Was the first confident action the correct debugging direction?

Both metrics must improve together. Reducing TFCA while reducing AA is regression, not progress. Vouqis sells confidence, not speed. False confidence is a product failure.

**How to measure**: observe real debugging sessions. Note the moment confidence is expressed. Track whether the chosen path led to the root cause within that session.

---

## Evidence Debt

Evidence Debt is product complexity added before the underlying assumption has been validated.

Like technical debt, it accumulates interest: maintenance burden, support cost, cognitive overhead, and reduced learning speed. Every unvalidated feature makes it harder to learn what users actually need.

**Goal: Evidence Debt = 0**

**Current state: 0**

Everything shipped to date is either architectural infrastructure (Protocol layer, Reliability layer, Failure classifier) or reversible diagnostics (Failure Receipt, INSPECT_NEXT). No persistent user workflows exist. No irreversible product commitments exist. This is an intentionally healthy starting point for a company entering customer discovery.

---

## Anti-Roadmap

Features that do not qualify for the roadmap today. Each requires an explicit evidence threshold to graduate.

| Feature | Encoded Assumption | Build Only If |
|---|---|---|
| Raw response capture | Engineers need the upstream response artifact to diagnose failures | 3 independent sessions where engineers immediately seek raw upstream output |
| Replay | Engineers reproduce requests manually during debugging | 3 independent sessions where engineers replay the request themselves |
| Dashboard | Teams monitor multiple gateways simultaneously | Teams managing 3+ gateways ask for a unified view |
| Alerts / notifications | Engineers miss failures because they never see the receipt | 3 sessions where failures are discovered through customer reports, not gateway output |
| Cloud / SaaS | Organizations want centralized gateway management | Strong cross-company evidence + rollback plan defined in writing |
| AI recommendations | Deterministic guidance is insufficient for real failures | INSPECT_NEXT guidance fails in 3 independent sessions |
| Observation mode (no blocking) | Engineers need to trust intervention before accepting it | 3 engineers explicitly reject blocking mode but want receipt output |

**Before any Platform Feature is built, the rollback plan must be written down. If you cannot write it, you do not understand the feature well enough to build it.**

---

## Interview Scorecard

Use this format for every engineering interview.

```
Date:
Engineer:
Company:
MCP implementation:
Failure observed: natural / staged
Prior exposure to Vouqis: yes / no

Observations:
  What did the engineer do first when they encountered the failure?
  Did they reach for logs, raw response, documentation, or another resource?
  At what moment did they express confidence about the next step?
  Was their first confident action correct?

Hypotheses touched:
  H0: confirmed / disconfirmed / neutral
  H1: confirmed / disconfirmed / neutral
  H2: confirmed / disconfirmed / neutral

Assumptions tested:
  [Assumption]: held / failed / unclear

TFCA: [minutes]
Action Accuracy: correct / incorrect

Kill signals (if any):
  [Exact quote] → kills [assumption or implementation]
```

---

## Rollback Protocol

Before any Platform Feature (irreversible) is built, define:

1. What does a user's workflow look like if we remove this feature?
2. What migration path exists for users who depend on it?
3. What is the minimum notice period?
4. Can we commit to that plan for the foreseeable future?

If any of these cannot be answered, the evidence threshold has not been met, regardless of how compelling the idea is.

---

## Document Triggers

Every document has one trigger — the condition that makes updating it correct. Update a document because reality changed, not because you had a new idea.

| Document | Update When |
|---|---|
| `README.md` | The user-facing product changes. |
| `PRODUCT.md` | The ICP, positioning, or messaging changes. |
| `CONTEXT.md` | An architectural invariant changes. |
| `CONTRIBUTING.md` | The engineering standards change. |
| `FOUNDER.md` | The decision framework fails, or a company-building lesson proves it incomplete. |
| `EVIDENCE.md` | Every interview, experiment, or production observation — append only. |

`FOUNDER.md` is not a place for new ideas. It is a record of lessons the framework did not originally contain. If it changes, something surprised you.

---

## Evidence is Append-Only

`EVIDENCE.md` is treated like git history. Observations are never rewritten or removed. Interpretations may be revised as evidence accumulates — but only by appending a new entry, never by editing an old one.

The distinction matters: the interpretation of what an engineer did may change as more sessions accumulate. What the engineer actually did does not.

A hypothesis entry looks like this:

```
## H2 — Receipt Effectiveness

---

2026-07-01  Interview #1
Observation:     Engineer ignored the receipt and opened upstream logs directly.
Interpretation:  Insufficient evidence. Possible: receipt not visible enough, or
                 engineer habit overrides tooling. Needs more sessions.

---

2026-07-03  Interview #2
Observation:     Engineer read "Inspect Next" and immediately checked the schema.
Interpretation:  Supports H2. One independent confirmation.

---

Current Status:  1 / 3 confirmations. Gate: CLOSED.
```

Failed hypotheses stay in the file. They are the most valuable entries — they prevent rebuilding what was already invalidated.

---

## Core Principles

1. **Never solve tomorrow's workflow before observing today's workflow.**
2. Architectural decisions come from first principles. Product decisions come from repeated observation.
3. Irreversible decisions require stronger evidence and a defined rollback protocol.
4. Every feature must reduce TFCA without reducing Action Accuracy. Vouqis sells confidence.
5. The Anti-Roadmap is part of the roadmap. Ideas compete on evidence thresholds, not elegance.
6. **Research tools optimize for learning. Product features optimize for user value. Never confuse the two.** A research instrument that never ships is a success if it accelerated learning. A product feature that never gets used is a failure regardless of how well it was built.
7. **Evidence is append-only. Observations never change; interpretations may accumulate.** A document that allows rewriting observations is a document that allows rewriting history.

---

*Reality has veto power over every decision in this document.*
