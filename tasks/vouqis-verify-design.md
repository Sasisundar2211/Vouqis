# Vouqis Verify — Complete MVP Design

**Generated:** 2026-07-15  
**Branch:** main  
**Status:** APPROVED — decisions locked, ready for Phase 0 implementation

## Locked Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Repo placement | Monorepo (`apps/verify-web/`) | Shared Clerk, tsconfig, turbo — one repo to maintain |
| D2 | Behavior Diff scope | Git diff only MVP (Prompt Diff) | Ships Phase 1 without integration dependency; traces unlock in Phase 3 |
| D3 | Async queue | Supabase `jobs` table + polling cron | Boring tech — 20 lines, no new infra, upgrade later if needed |
| D4 | Python Action | Keep both | Two adoption tiers: zero-signup Action vs full web app |
| D5 | Product principle | "Every feature must reduce the number of tabs an engineer opens before approving an AI change." | Measurable. If a feature doesn't reduce context switching, it doesn't ship. |
| D6 | Architecture model | One Review Engine, multiple distribution channels | Python Action + GitHub App + future CLI share detection/evidence/packaging logic |
| D7 | Phase "done when" | Customer validation milestone, not engineering milestone | Per user feedback: engineering milestones prove implementation, not value |
| D8 | Phase 0 scope | Stateless — no DB, no queue, no web UI | One Vercel function + PR comment is enough to answer "do engineers find this valuable?" |

---

## Orientation

This document covers all 10 design deliverables for Vouqis Verify.

**Product Principle (on every screen, in every PR):**
> Every feature must reduce the number of tabs an engineer opens before approving an AI change.

**Architecture Model:**

```
                    Review Engine
                          │
         ┌────────────────┼────────────────┐
         │                │                │
  GitHub Action      GitHub App       Future CLI
  (packages/verify)  (apps/verify-web)
         │                │
  Same Detection     Same Detection
  Same Evidence      Same Evidence
  Same Packaging     Same Packaging
```

One engine. Multiple distribution channels. The Python Action is distribution tier 1 (zero-signup). The GitHub App is tier 2 (richer evidence, web UI).

**What already exists** (`packages/verify/` — Python GitHub Action):
- AI file change detection via `git diff`
- Eval command runner (runs any shell command, captures exit code)
- PR comment with PASS/FAIL + AI files changed

The new design extends this with a web layer, GitHub App, evidence engine, and behavior diff UI. The Python Action is NOT replaced.

---

## 1. Product Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHAT VOUQIS VERIFY IS                                               │
│                                                                      │
│  An evidence assembly system for AI pull requests.                   │
│                                                                      │
│  Input:  A pull request that touches AI-related files.               │
│  Output: A Review Package — all evidence a human needs to decide.    │
│                                                                      │
│  It does not decide. It prepares evidence.                           │
└─────────────────────────────────────────────────────────────────────┘

Three concerns:

  1. DETECTION     — What AI components changed? What's the blast radius?
  2. EVIDENCE      — Collect all available signals (diffs, traces, evals)
  3. PRESENTATION  — Package evidence for human review (one URL)

Vouqis never blocks a merge. It classifies risk and surfaces missing evidence.
```

**Three user-facing artifacts produced per PR:**

| Artifact | Where | Purpose |
|---|---|---|
| GitHub Check | GitHub PR | "AI Review Package Ready · Risk: HIGH · 8/10 evidence" |
| PR Comment | GitHub PR | Summary + link for quick scan |
| Review Package | verify.vouqis.com/review/[id] | Full evidence for deep review |

---

## 2. User Workflow

```
Developer opens Pull Request
         │
         ▼
GitHub webhook fires → Vouqis Verify receives it
         │
         ▼
┌─────────────────────────────────────────┐
│  STEP 1: DETECTION (< 2s)               │
│                                         │
│  Parse git diff → find AI-related files │
│  Classify each change type:             │
│    prompt file → MEDIUM                 │
│    model version → HIGH                 │
│    tool schema → HIGH                   │
│    temperature → MEDIUM                 │
│    embedding model → HIGH               │
│    rag config → HIGH                    │
│    output schema → HIGH                 │
│    agent routing → HIGH                 │
│                                         │
│  Compute: overall risk level            │
│  Compute: affected workflow names       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  STEP 2: EVIDENCE COLLECTION (< 30s)    │
│                                         │
│  Always available (no integration):     │
│  ✓ Prompt diff (git-level, structured)  │
│  ✓ Changed file list + risk reasons     │
│                                         │
│  Available if integrated:               │
│  ✓ Langfuse: recent traces              │
│  ✓ LangSmith: recent runs               │
│  ✓ Promptfoo: eval results              │
│  ✓ Braintrust: experiment results       │
│                                         │
│  Mark missing evidence explicitly       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  STEP 3: PACKAGE GENERATION (< 1s)      │
│                                         │
│  Assemble Review Package:               │
│  - Summary                              │
│  - Risk: HIGH/MEDIUM/LOW                │
│  - Evidence score: N/10                 │
│  - Missing evidence list                │
│  - Prompt diff                          │
│  - Behavior diff (if available)         │
│  - Rollback checklist                   │
│  - Deployment checklist                 │
└─────────────────────────────────────────┘
         │
         ▼
GitHub Check updated:
  "AI Review Package Ready · Risk: HIGH · 8/10"
  [Open Review Package ↗]
         │
         ▼
Reviewer opens Review Package URL
  - reads evidence
  - approves PR or requests changes
```

**Reviewer's job is NOT changed.** They still approve or request changes on GitHub.  
Vouqis just prepares everything they need in one place.

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ GITHUB                                                                │
│  PR opened/updated → webhook → POST /api/webhooks/github             │
│  ← Check Run: "AI Review Package Ready | Risk: HIGH"                │
│  ← PR Comment: summary + link                                        │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ VERCEL (Next.js App — apps/verify-web)                               │
│                                                                      │
│  Webhook Handler (/api/webhooks/github)                              │
│    ├─ Verify GitHub signature (HMAC-SHA256)                          │
│    ├─ Enqueue job (Vercel Queue: process-pr)                         │
│    └─ Return 200 immediately                                         │
│                                                                      │
│  Job Worker (Vercel Queue consumer)                                  │
│    ├─ Change Detector                                                │
│    │    └─ GitHub API: fetch file contents at base_sha + head_sha    │
│    │    └─ AI Pattern Matcher: classify each changed file            │
│    │    └─ Risk Classifier: map types → risk level                   │
│    │                                                                  │
│    ├─ Evidence Collector (parallel)                                  │
│    │    ├─ GitDiffEvidence: structured prompt diff                   │
│    │    ├─ LangfuseEvidence: fetch recent traces (if configured)     │
│    │    ├─ LangSmithEvidence: fetch recent runs (if configured)      │
│    │    ├─ PromptfooEvidence: fetch eval results (if configured)     │
│    │    └─ BraintrustEvidence: fetch experiments (if configured)     │
│    │                                                                  │
│    ├─ Review Package Generator                                       │
│    │    └─ Assemble → store in Supabase                              │
│    │                                                                  │
│    └─ GitHub Reporter                                                │
│         ├─ Update Check Run                                          │
│         └─ Post/update PR comment                                    │
│                                                                      │
│  Review Package UI (/review/[token])                                 │
│    ├─ Summary + Risk Badge                                           │
│    ├─ Evidence Panel (completeness)                                  │
│    ├─ Prompt Diff Viewer (side-by-side)                              │
│    ├─ Behavior Diff Viewer (if traces available)                     │
│    └─ Checklists (rollback + deployment)                             │
│                                                                      │
│  Dashboard (/dashboard/*)                                            │
│    ├─ Repositories                                                   │
│    ├─ Recent PRs + packages                                          │
│    └─ Integration settings                                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ SUPABASE (PostgreSQL + Auth + Storage)                               │
│  - review_packages, evidence_items, ai_changes                       │
│  - github_installations, repositories                                │
│  - integrations (encrypted credentials)                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ CLERK                                                                │
│  - User auth + organization management                               │
│  - GitHub OAuth (for additional scopes)                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ VERCEL QUEUES (job processing)                                       │
│  - process-pr: main pipeline                                         │
│  - collect-evidence: parallel evidence jobs                          │
│  - report-github: check run updates                                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Data flow for a PR event:**

```
time →
  0ms   GitHub webhook received
  1ms   Webhook signature verified
  2ms   Job enqueued (Vercel Queue)
  5ms   200 returned to GitHub
  ---   (async from here)
  10ms  Job starts
  50ms  GitHub API: fetch file contents (base + head)
 100ms  AI changes detected + classified
 200ms  Evidence collection begins (parallel)
 500ms  Git diff evidence ready
 500ms  Langfuse traces fetched (if configured)
 800ms  Review package assembled
 900ms  Stored in Supabase
1000ms  GitHub Check updated
1100ms  PR comment posted
```

---

## 4. Folder Structure

```
vouqis/
├── packages/
│   ├── cli/                       # existing — MCP proxy CLI
│   ├── vouqis-dashboard/          # existing — MCP proxy dashboard
│   └── verify/                    # existing — Python GitHub Action
│       └── (keep as-is)           # dist mechanism for zero-setup teams
│
├── apps/
│   └── verify-web/                # NEW — Vouqis Verify web app
│       ├── package.json
│       ├── next.config.ts
│       ├── vercel.json
│       ├── prisma/
│       │   ├── schema.prisma      # DB schema
│       │   └── migrations/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/        # Clerk-wrapped routes
│       │   │   │   ├── sign-in/
│       │   │   │   └── sign-up/
│       │   │   ├── (dashboard)/   # Authenticated app
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx              # Dashboard home
│       │   │   │   ├── repositories/
│       │   │   │   │   ├── page.tsx          # Connected repos
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx      # Repo detail + PRs
│       │   │   │   └── settings/
│       │   │   │       └── integrations/
│       │   │   │           └── page.tsx      # Connect Langfuse etc.
│       │   │   ├── review/
│       │   │   │   └── [token]/
│       │   │   │       └── page.tsx          # PUBLIC — Review Package
│       │   │   └── api/
│       │   │       ├── webhooks/
│       │   │       │   └── github/
│       │   │       │       └── route.ts      # GitHub webhook handler
│       │   │       ├── queues/
│       │   │       │   └── process-pr/
│       │   │       │       └── route.ts      # Queue consumer
│       │   │       ├── review-packages/
│       │   │       │   └── [id]/
│       │   │       │       └── route.ts
│       │   │       ├── repositories/
│       │   │       │   └── route.ts
│       │   │       └── github/
│       │   │           └── app/
│       │   │               └── callback/
│       │   │                   └── route.ts  # GitHub App install callback
│       │   ├── components/
│       │   │   ├── review-package/
│       │   │   │   ├── summary-header.tsx    # Risk badge + score
│       │   │   │   ├── evidence-panel.tsx    # Completeness tracker
│       │   │   │   ├── prompt-diff.tsx       # Side-by-side prompt diff
│       │   │   │   ├── behavior-diff.tsx     # Trace before/after
│       │   │   │   ├── tool-call-diff.tsx    # Tool schema diff
│       │   │   │   └── checklists.tsx        # Rollback + deploy
│       │   │   ├── risk-badge.tsx
│       │   │   ├── evidence-completeness.tsx
│       │   │   └── ai-change-tag.tsx
│       │   └── lib/
│       │       ├── db/
│       │       │   └── client.ts             # Prisma client singleton
│       │       ├── github/
│       │       │   ├── app.ts                # GitHub App client (Octokit)
│       │       │   ├── webhook.ts            # Webhook signature verification
│       │       │   ├── checks.ts             # Check run create/update
│       │       │   └── comments.ts           # PR comment create/update
│       │       ├── detection/
│       │       │   ├── ai-detector.ts        # Which files are AI-related?
│       │       │   ├── change-classifier.ts  # Map file → change type
│       │       │   └── risk-engine.ts        # Compute risk level
│       │       ├── evidence/
│       │       │   ├── index.ts              # EvidenceCollector orchestrator
│       │       │   ├── git-diff.ts           # Git-level prompt diff
│       │       │   ├── langfuse.ts           # Langfuse integration
│       │       │   ├── langsmith.ts          # LangSmith integration
│       │       │   ├── promptfoo.ts          # Promptfoo integration
│       │       │   └── braintrust.ts         # Braintrust integration
│       │       ├── packages/
│       │       │   ├── generator.ts          # Assembles review package
│       │       │   └── checklists.ts         # Rollback/deploy checklists
│       │       └── queue/
│       │           └── client.ts             # Vercel Queue client
│       └── tests/
│           ├── detection/
│           ├── evidence/
│           └── packages/
│
├── package.json                   # workspace root
└── turbo.json                     # build orchestration
```

---

## 5. Database Schema

```prisma
// apps/verify-web/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────
// Identity
// ─────────────────────────────────────────

model Organization {
  id           String    @id @default(cuid())
  clerkOrgId   String    @unique
  name         String
  slug         String    @unique
  installations GithubInstallation[]
  repositories Repository[]
  integrations Integration[]
  createdAt    DateTime  @default(now())
}

// ─────────────────────────────────────────
// GitHub App
// ─────────────────────────────────────────

model GithubInstallation {
  id             String       @id @default(cuid())
  installationId BigInt       @unique          // GitHub's numeric ID
  accountType    String                        // 'Organization' | 'User'
  accountLogin   String                        // github username/org
  accountId      BigInt
  org            Organization? @relation(fields: [orgId], references: [id])
  orgId          String?
  permissions    Json
  suspendedAt    DateTime?
  repositories   Repository[]
  createdAt      DateTime     @default(now())
}

model Repository {
  id             String              @id @default(cuid())
  githubRepoId   BigInt              @unique
  installation   GithubInstallation  @relation(fields: [installationId], references: [id])
  installationId String
  org            Organization        @relation(fields: [orgId], references: [id])
  orgId          String
  fullName       String                        // 'owner/repo'
  defaultBranch  String              @default("main")
  isActive       Boolean             @default(true)
  // User-configured AI file patterns (overrides defaults)
  aiPathPatterns String[]
  pullRequests   PullRequest[]
  createdAt      DateTime            @default(now())
}

// ─────────────────────────────────────────
// Pull Requests
// ─────────────────────────────────────────

model PullRequest {
  id             String         @id @default(cuid())
  repo           Repository     @relation(fields: [repoId], references: [id])
  repoId         String
  githubPrId     BigInt         @unique
  prNumber       Int
  title          String
  headSha        String                        // commit being reviewed
  baseSha        String                        // base for diff
  headBranch     String
  baseBranch     String
  authorLogin    String
  state          String                        // 'open' | 'closed' | 'merged'
  openedAt       DateTime
  closedAt       DateTime?
  reviewPackages ReviewPackage[]
  createdAt      DateTime       @default(now())

  @@unique([repoId, prNumber])
}

// ─────────────────────────────────────────
// Review Packages
// ─────────────────────────────────────────

model ReviewPackage {
  id              String         @id @default(cuid())
  pr              PullRequest    @relation(fields: [prId], references: [id])
  prId            String
  status          PackageStatus  @default(PENDING)
  riskLevel       RiskLevel?
  riskReasons     String[]                      // human-readable reasons
  aiChangeTypes   String[]                      // ['prompt_file', 'model_version', ...]
  affectedWorkflows String[]
  evidenceScore   Int?                          // 0-10
  missingEvidence String[]                      // what still needs review
  summary         String?
  // GitHub integration
  checkRunId      BigInt?
  checkRunNodeId  String?
  commentId       BigInt?
  // Public access (no auth required)
  publicToken     String         @unique @default(cuid())
  // Reviewer notes
  reviewerNotes   String?
  aiChanges       AiChange[]
  evidenceItems   EvidenceItem[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum PackageStatus {
  PENDING
  PROCESSING
  COMPLETE
  FAILED
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

// ─────────────────────────────────────────
// AI Changes (individual changed components)
// ─────────────────────────────────────────

model AiChange {
  id              String        @id @default(cuid())
  reviewPackage   ReviewPackage @relation(fields: [reviewPackageId], references: [id])
  reviewPackageId String
  changeType      String                        // see Change Type table below
  filePath        String
  oldContent      String?       @db.Text
  newContent      String?       @db.Text
  diffPatch       String?       @db.Text
  riskLevel       RiskLevel
  metadata        Json?                         // type-specific data
  createdAt       DateTime      @default(now())
}

// Change types and their default risk:
// prompt_file       → MEDIUM (could be LOW if cosmetic)
// system_prompt     → MEDIUM
// model_version     → HIGH
// temperature       → MEDIUM
// context_window    → MEDIUM
// tool_schema       → HIGH
// mcp_server        → HIGH
// function_def      → HIGH
// tool_routing      → HIGH
// agent_workflow    → HIGH
// memory_config     → MEDIUM
// guardrails        → HIGH
// output_schema     → HIGH
// rag_config        → HIGH
// retriever         → HIGH
// embedding_model   → HIGH
// model_params      → MEDIUM

// ─────────────────────────────────────────
// Evidence Items
// ─────────────────────────────────────────

model EvidenceItem {
  id              String        @id @default(cuid())
  reviewPackage   ReviewPackage @relation(fields: [reviewPackageId], references: [id])
  reviewPackageId String
  evidenceType    String        // 'prompt_diff' | 'trace_comparison' | 'eval_results' | ...
  source          String        // 'git' | 'langfuse' | 'langsmith' | 'promptfoo' | 'braintrust' | 'manual'
  status          EvidenceStatus
  title           String
  data            Json                          // structured evidence data
  createdAt       DateTime      @default(now())
}

enum EvidenceStatus {
  PRESENT
  MISSING
  STALE
}

// ─────────────────────────────────────────
// Integrations
// ─────────────────────────────────────────

model Integration {
  id        String       @id @default(cuid())
  org       Organization @relation(fields: [orgId], references: [id])
  orgId     String
  provider  String                             // 'langfuse' | 'langsmith' | 'promptfoo' | 'braintrust'
  // Encrypted at rest via Supabase Vault or application-level AES-256
  config    Json
  isActive  Boolean      @default(true)
  createdAt DateTime     @default(now())

  @@unique([orgId, provider])
}
```

---

## 6. API Design

All routes under `/api/`. Auth via Clerk middleware except where noted.

### Webhook — unauthenticated

```
POST /api/webhooks/github
  Headers:
    x-github-event: pull_request | installation | check_suite
    x-hub-signature-256: sha256=<hmac>
  Body: GitHub webhook payload
  Response: 200 (always, signature failures → 401)
  Side effect: enqueues Vercel Queue job
```

### Queue Consumer — internal

```
POST /api/queues/process-pr
  Headers: x-vercel-signature (queue authentication)
  Body: { prId, installationId, repoId, headSha, baseSha, prNumber }
  Response: 200 when complete, 500 on failure (Vercel retries)
```

### Review Packages — public (no auth)

```
GET /api/review-packages/[token]
  Response: {
    id, status, riskLevel, riskReasons, aiChangeTypes,
    affectedWorkflows, evidenceScore, missingEvidence,
    summary, aiChanges[], evidenceItems[], reviewerNotes
  }
  Note: uses publicToken, not id — safe to share
```

### Review Packages — authenticated

```
GET /api/orgs/[orgId]/review-packages
  Query: ?prNumber=&repoId=&status=&limit=&cursor=
  Response: { items: ReviewPackage[], nextCursor }

PATCH /api/review-packages/[id]/notes
  Body: { notes: string }
  Response: { id, reviewerNotes }
```

### Repositories — authenticated

```
GET /api/repositories
  Response: { repositories: Repository[] }

GET /api/repositories/[id]
  Response: Repository + recent pull requests

PATCH /api/repositories/[id]
  Body: { aiPathPatterns?: string[], isActive?: boolean }
  Response: Repository

DELETE /api/repositories/[id]
  Response: 204 (marks inactive, retains data)
```

### Integrations — authenticated

```
GET /api/integrations
  Response: { integrations: { id, provider, isActive, createdAt }[] }
  Note: never returns config/secrets

POST /api/integrations
  Body: { provider: string, config: object }
  Response: { id, provider, isActive }

DELETE /api/integrations/[id]
  Response: 204
```

### GitHub App

```
GET /api/github/app/callback
  Query: ?installation_id=&setup_action=
  Response: redirect to /dashboard/repositories
```

---

## 7. UI Wireframes

### Screen 1: Review Package (PRIMARY SCREEN)

```
verify.vouqis.com/review/[token]

┌─────────────────────────────────────────────────────────────────────┐
│ VOUQIS VERIFY                                            [no nav]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  myorg/api-service · PR #142 · feat/update-summarizer-prompt        │
│  by @alice · opened 2h ago                                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ■ RISK: HIGH                        Evidence: 6 / 10        │   │
│  │                                                              │   │
│  │  Model version changed (gpt-4 → gpt-4o)                     │   │
│  │  Tool schema changed (3 tools)                               │   │
│  │  Prompt changed (system_prompt.txt)                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ─── EVIDENCE ────────────────────────────────────────────────────  │
│                                                                      │
│  ✓  Prompt Diff                                           present   │
│  ✓  Tool Schema Diff                                      present   │
│  ✓  Model Version Change                                  present   │
│  ✗  Trace Comparison                                      missing   │
│  ✗  Eval Results                                          missing   │
│  ✗  Rollback Plan                                         missing   │
│  ✓  Deployment Checklist                                  present   │
│  ✓  Output Diff (manual)                                  present   │
│                                                                      │
│  Missing evidence (2 items require human input before merge)        │
│                                                                      │
│  ─── WHAT CHANGED ────────────────────────────────────────────────  │
│                                                                      │
│  [PROMPT FILE]  [TOOL SCHEMA ↑]  [MODEL VERSION ↑]                 │
│                                                                      │
│  ─── PROMPT DIFF ─────────────────────────────────────────────────  │
│                                                                      │
│  system_prompt.txt                                                   │
│  ┌───────────────────────┬─────────────────────────────────────┐   │
│  │ BEFORE                │ AFTER                               │   │
│  │                       │                                     │   │
│  │ You are a helpful     │ You are a concise summarizer.       │   │
│  │ assistant that        │ Focus on key points only.           │   │
│  │ summarizes content    │ Avoid pleasantries.                 │   │
│  │ for users.            │                                     │   │
│  │                       │ Respond in 3 bullet points max.     │   │
│  └───────────────────────┴─────────────────────────────────────┘   │
│                                                                      │
│  ─── TOOL SCHEMA DIFF ────────────────────────────────────────────  │
│                                                                      │
│  get_user_data                      [CHANGED — HIGH RISK]           │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ - "required": ["user_id"]                                  │     │
│  │ + "required": ["user_id", "include_metadata"]              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ─── ROLLBACK CHECKLIST ──────────────────────────────────────────  │
│                                                                      │
│  □  Previous model (gpt-4) still available in deployment config     │
│  □  Feature flag can disable new prompt without redeployment        │
│  □  Tool schema change is backward compatible                       │
│  □  Monitoring alert configured for increased error rate            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Screen 2: Dashboard

```
verify.vouqis.com/dashboard

┌─────────────────────────────────────────────────────────────────────┐
│ VOUQIS VERIFY          myorg ▾                    [alice@co.com]    │
├────────────────┬────────────────────────────────────────────────────┤
│ Repositories   │                                                     │
│ Settings       │  Recent AI Pull Requests                            │
│                │                                                     │
│                │  myorg/api-service                                  │
│                │  ┌──────────────────────────────────────────────┐  │
│                │  │ #142 feat/summarizer-prompt    ■ HIGH   6/10 │  │
│                │  │ #138 fix/temperature-tuning    ● MEDIUM 8/10 │  │
│                │  │ #134 feat/new-rag-retriever    ■ HIGH   4/10 │  │
│                │  └──────────────────────────────────────────────┘  │
│                │                                                     │
│                │  myorg/agent-core                                   │
│                │  ┌──────────────────────────────────────────────┐  │
│                │  │ #89  feat/mcp-tool-routing     ■ HIGH   7/10 │  │
│                │  └──────────────────────────────────────────────┘  │
└────────────────┴────────────────────────────────────────────────────┘
```

### Screen 3: Behavior Diff (when traces available)

```
─── BEHAVIOR DIFF ──────────────────────────────────────────────────

Source: Langfuse traces · 5 examples compared

  Example 1: "Summarize this quarterly report..."

  ┌────────────────────────────────┬───────────────────────────────┐
  │ BEFORE (main · 2h ago)         │ AFTER (PR branch · 1h ago)    │
  │                                │                                │
  │ Model: gpt-4                   │ Model: gpt-4o                  │
  │ Temperature: 0.7               │ Temperature: 0.7               │
  │ Latency: 2,340ms               │ Latency: 1,120ms               │
  │ Cost: $0.0041                  │ Cost: $0.0018                  │
  │                                │                                │
  │ Tools called:                  │ Tools called:                  │
  │  get_user_data(user_id=...)    │  get_user_data(user_id=...,    │
  │                                │    include_metadata=true)      │
  │                                │                                │
  │ Output:                        │ Output:                        │
  │ "Here's a helpful summary      │ • Q3 revenue up 12%            │
  │  of your quarterly report.     │ • Operating margin improved    │
  │  The key highlights are...     │ • Headcount flat               │
  │  [longer response]"            │                                │
  └────────────────────────────────┴───────────────────────────────┘

  [← Prev example]  Example 1 of 5  [Next example →]
```

### Screen 4: GitHub Check (as seen on GitHub)

```
Checks tab on GitHub:

  ● vouqis/verify                                    Details ↗
    AI Review Package Ready
    Risk: HIGH · Evidence: 6/10 · Manual review recommended
```

### Screen 5: Integrations Settings

```
verify.vouqis.com/dashboard/settings/integrations

  Connect your observability tools to enrich evidence.

  ┌──────────────────────────────────────────────────────────────┐
  │ Langfuse                                    [Not connected]  │
  │ Pull recent traces for behavior comparison                   │
  │                              [Connect ↗]                     │
  ├──────────────────────────────────────────────────────────────┤
  │ LangSmith                                   [Not connected]  │
  │ Pull recent runs for behavior comparison                     │
  │                              [Connect ↗]                     │
  ├──────────────────────────────────────────────────────────────┤
  │ Promptfoo                                   [Connected ✓]    │
  │ Eval results included automatically                          │
  │ Project: production-evals               [Configure] [Remove] │
  └──────────────────────────────────────────────────────────────┘
```

---

## 8. GitHub App Flow

```
INSTALLATION FLOW
─────────────────

1. User visits: github.com/apps/vouqis-verify → "Install"

2. GitHub redirects: verify.vouqis.com/api/github/app/callback
   ?installation_id=12345&setup_action=install

3. Server receives:
   a. Verify state param (CSRF)
   b. Fetch installation details from GitHub API
   c. Upsert GithubInstallation record
   d. Upsert Repository records for installed repos
   e. Redirect to /dashboard/repositories

4. GitHub sends installation webhook (async):
   POST /api/webhooks/github
   event: installation
   action: created
   → sync any repos missed in step 3d

─────────────────

WEBHOOK PROCESSING FLOW
────────────────────────

GitHub sends: pull_request.opened / pull_request.synchronize
               (or pull_request.reopened, check_suite.rerequested)

POST /api/webhooks/github
  │
  ├─ Verify HMAC-SHA256 signature
  │   ← 401 if invalid
  │
  ├─ Enqueue job to Vercel Queue
  │   Payload: { installationId, repoId, prNumber, headSha, baseSha }
  │
  └─ 200 (within 3s — GitHub requires fast response)

─── async ───────────────────────────────────────────

Job Worker receives payload:
  │
  ├─ Create check run: status=in_progress
  │   title: "AI Review Package · analyzing..."
  │
  ├─ Fetch GitHub App token (installation auth)
  │
  ├─ Fetch changed files via GitHub API
  │   GET /repos/{owner}/{repo}/compare/{base}...{head}
  │
  ├─ Filter: which files match AI patterns?
  │
  ├─ For each AI file: fetch old content (base_sha) + new content (head_sha)
  │   GET /repos/{owner}/{repo}/contents/{path}?ref={sha}
  │
  ├─ Classify each change → risk level
  │
  ├─ Collect evidence (parallel):
  │   ├─ Git diff evidence (always)
  │   ├─ Langfuse (if integration configured)
  │   ├─ LangSmith (if integration configured)
  │   ├─ Promptfoo (if integration configured)
  │   └─ Braintrust (if integration configured)
  │
  ├─ Generate review package
  │
  ├─ Store in DB
  │
  ├─ Update check run: status=completed
  │   title: "AI Review Package Ready"
  │   conclusion: "action_required" (HIGH) or "neutral" (MEDIUM/LOW)
  │   summary: "Risk: HIGH · Evidence: 6/10"
  │   details_url: https://verify.vouqis.com/review/{publicToken}
  │
  └─ Post/update PR comment (collapsible summary + link)

─────────────────

SECURITY
────────

All webhook requests verified with:
  HMAC-SHA256(GITHUB_WEBHOOK_SECRET, raw_body) === x-hub-signature-256

Installation tokens (short-lived JWTs) fetched per-job using:
  GitHub App private key → sign JWT → exchange for installation token
  Token expires in 1h; fetch fresh per job
```

---

## 9. Review Package Specification

A Review Package is a structured evidence document. It answers one question: **"Is this AI change safe to merge?"**

### Required Fields (always present)

| Field | Type | Description |
|---|---|---|
| `id` | string | Package ID |
| `publicToken` | string | Shareable URL token |
| `status` | enum | PENDING / PROCESSING / COMPLETE / FAILED |
| `riskLevel` | enum | LOW / MEDIUM / HIGH |
| `riskReasons` | string[] | Human-readable reasons for risk level |
| `aiChangeTypes` | string[] | What categories of AI components changed |
| `affectedWorkflows` | string[] | Which workflows/features are affected |
| `evidenceScore` | int | 0-10 (present evidence / total possible) |
| `missingEvidence` | string[] | What still needs human review |
| `summary` | string | One-paragraph human-readable summary |
| `aiChanges` | AiChange[] | Each changed AI component |
| `evidenceItems` | EvidenceItem[] | Each piece of evidence |

### Evidence Types

| Evidence Type | Source | Always Available | Description |
|---|---|---|---|
| `prompt_diff` | git | ✓ | Line-level diff of prompt files |
| `model_version_change` | git | ✓ | Old vs new model identifier |
| `tool_schema_diff` | git | ✓ | JSON diff of tool definitions |
| `config_diff` | git | ✓ | Temp, context window, params |
| `trace_comparison` | Langfuse/LangSmith | integration | Before/after example outputs |
| `eval_results` | Promptfoo/Braintrust | integration | Structured eval pass/fail |
| `latency_comparison` | Langfuse/LangSmith | integration | p50/p95 latency before/after |
| `cost_comparison` | Langfuse/LangSmith | integration | Token cost before/after |
| `rollback_checklist` | generated | ✓ | Rollback prerequisites |
| `deployment_checklist` | generated | ✓ | Deployment prerequisites |
| `reviewer_notes` | manual | optional | Reviewer-added context |

### Risk Classification Rules

```
ANY of these → HIGH:
  - model version changed (any model identifier)
  - tool schema changed (added/removed/modified parameters)
  - output schema changed
  - agent routing changed
  - MCP server added/removed/changed
  - guardrails changed
  - embedding model changed
  - RAG retriever changed

ANY of these → MEDIUM (unless already HIGH):
  - system prompt changed (non-cosmetic)
  - temperature changed > 0.1
  - context window changed
  - memory config changed
  - model params changed
  - RAG config changed (non-retriever)

LOW (only if no HIGH or MEDIUM):
  - prompt wording change (cosmetic)
  - comment/whitespace in config
  - eval test added (no production impact)
```

### Evidence Completeness Score (0-10)

```
Base evidence (always scored):
  prompt_diff present          → +1
  risk classification present  → +1 (always present)
  rollback_checklist present   → +1

Integration evidence (scored if integration configured):
  trace_comparison present     → +2
  eval_results present         → +2

Manual evidence:
  reviewer_notes present       → +1

Bonus:
  latency_comparison present   → +1
  cost_comparison present      → +1

Max: 10 (or adjusted max if no integrations configured)
```

### GitHub Check Output

```
Check name:    vouqis/verify
Title:         AI Review Package Ready  [or: AI Review · analyzing...]
Conclusion:    action_required (HIGH) | neutral (MEDIUM/LOW) | success (no AI changes)
Summary (md):
  **Risk: HIGH** · Evidence: 6/10 · Manual review recommended

  ### What Changed
  | Component | Type | Risk |
  |---|---|---|
  | system_prompt.txt | Prompt File | Medium |
  | tool_schema.json | Tool Schema | **High** |
  | config.yaml:model | Model Version | **High** |

  2 pieces of evidence missing before merge is safe.
Details URL:   https://verify.vouqis.com/review/{publicToken}
```

---

## 10. Implementation Roadmap

> Phases define customer validation milestones, not engineering milestones.
> Engineering milestones prove implementation. Customer milestones prove value.

---

### Phase 0: Stateless PR Comment (Week 1, ~2 days)

**Engineering goal:** GitHub App detects AI changes and posts a Review Package as a PR comment.  
**Customer validation goal:** An external engineer installs the app, reads the comment, and says "I would use this again."

**Scope — intentionally minimal (no DB, no queue, no web UI, no auth):**

```
GitHub webhook
      │
      ▼
apps/verify-web/api/webhooks/github/route.ts  (one file)
      │
      ├─ Verify HMAC signature
      ├─ Fetch changed files (GitHub API)
      ├─ Detect AI files (port packages/verify logic to TypeScript)
      ├─ Classify risk
      ├─ Generate Review Package markdown
      └─ Post PR comment (Octokit)
```

**Tasks:**
- [ ] Register GitHub App (GitHub UI — takes 20 min)
- [ ] `apps/verify-web/` scaffold (Next.js, single API route, no UI pages yet)
- [ ] `lib/detection/ai-detector.ts` — port `packages/verify/core/diff.py` to TypeScript
- [ ] `lib/detection/risk-engine.ts` — risk classification rules
- [ ] `lib/detection/change-classifier.ts` — map file → change type
- [ ] `lib/github/app.ts` — GitHub App client (Octokit + installation token)
- [ ] `lib/github/webhook.ts` — HMAC signature verification
- [ ] `lib/github/comments.ts` — post/update PR comment
- [ ] `lib/packages/markdown.ts` — generate Review Package markdown
- [ ] Feedback links in every comment (see feedback spec below)
- [ ] Deploy to Vercel, configure webhook URL in GitHub App

**PR comment format (Phase 0):**

```markdown
## Vouqis Verify — AI Change Review

**Risk: HIGH** · 3 AI components changed

### What Changed
| Component | Change Type | Risk |
|---|---|---|
| system_prompt.txt | Prompt File | Medium |
| config.yaml | Model Version (gpt-4 → gpt-4o) | **High** |
| tools/get_user.json | Tool Schema | **High** |

### Prompt Diff — system_prompt.txt
<details>
<summary>View diff</summary>

**Before:**
You are a helpful assistant that summarizes content for users.

**After:**
You are a concise summarizer. Focus on key points only.
Respond in 3 bullet points max.
</details>

### Missing Evidence
- [ ] Trace comparison (connect Langfuse to unlock)
- [ ] Eval results (connect Promptfoo to unlock)
- [ ] Rollback plan (add manually before merge)

---
*Did this package change your review decision?*
[✅ Yes, I merged because of it](https://vouqis.tech/feedback?r=changed&pr=...) ·
[⚠️ Yes, I delayed/blocked](https://vouqis.tech/feedback?r=blocked&pr=...) ·
[➖ No change](https://vouqis.tech/feedback?r=no_change&pr=...) ·
[❌ Not useful](https://vouqis.tech/feedback?r=not_useful&pr=...)

*What tool did you still open?*
[Langfuse](https://vouqis.tech/feedback?tool=langfuse&pr=...) ·
[LangSmith](https://vouqis.tech/feedback?tool=langsmith&pr=...) ·
[GitHub only](https://vouqis.tech/feedback?tool=github_only&pr=...) ·
[None](https://vouqis.tech/feedback?tool=none&pr=...)
```

**Feedback endpoint:** `GET /api/feedback` logs clicks to the existing Google Sheet
pipeline (`api/design-partner` pattern — already built, reuse it).

**Done when:** One external engineer (not you) installs the GitHub App on their repo,
opens a PR touching an AI file, reads the generated comment, and clicks a feedback link.
Target response: "I'd use this again."

---

### Phase 1: Web Review Package (Week 2, ~3 days)

**Engineering goal:** Review Package gets a permanent web URL. Evidence panel with completeness.  
**Customer validation goal:** 5 external PRs produce Review Packages that engineers actually open (tracked via URL visits).

**Now we add persistence:**
- [ ] Supabase project + Prisma schema (subset: installations, repositories, pull_requests, review_packages, ai_changes)
- [ ] Supabase `jobs` table (queue — 20 lines)
- [ ] Vercel cron `/api/cron/process-jobs` (every 30s)
- [ ] Refactor webhook handler: write job → return 200 → cron processes async
- [ ] `/review/[token]` page (server component, public, no auth required)
  - Summary header + Risk badge
  - Evidence completeness panel
  - Prompt diff (side-by-side)
  - Tool schema diff
  - Rollback checklist
- [ ] Update PR comment: include link to web Review Package
- [ ] `lib/github/checks.ts` — GitHub Check Run (in addition to comment)
- [ ] Clerk auth (for dashboard only — Review Package page stays public)
- [ ] Dashboard stub (`/dashboard`) — list of recent PRs

**Done when:** 5 external PRs tracked, review_packages table has 5 rows with
`status=COMPLETE`, and server logs show `/review/[token]` visited per PR.

---

### Phase 2: Complete Git Evidence (Week 3, ~2 days)

**Engineering goal:** All change types detected, all git-based evidence shown.  
**Customer validation goal:** Engineers report the package replaces their manual diff inspection of AI files.

- [ ] Model version change detection + display
- [ ] Temperature / context window / params diff
- [ ] MCP server detection
- [ ] Output schema detection
- [ ] Agent workflow detection
- [ ] Guardrails detection
- [ ] Risk classification for all 17 change types (see Appendix)
- [ ] AI change tags in UI (colored by risk)
- [ ] Evidence score calibrated to git-only baseline

**Done when:** A PR touching a model version change shows HIGH risk with the specific
version diff visible. Reviewer says "I didn't need to open the file manually."

---

### Phase 3: Integration Layer (Week 4–5, ~5 days)

**Engineering goal:** Langfuse/LangSmith traces appear as Behavior Diff.  
**Customer validation goal:** Engineers click "None" on "What tool did you still open?" — meaning Vouqis replaced their observability tool lookup.

- [ ] Integrations settings page (`/dashboard/settings/integrations`)
- [ ] `lib/evidence/langfuse.ts` — fetch recent traces, match to PR timewindow
- [ ] `lib/evidence/langsmith.ts` — fetch recent runs
- [ ] `lib/components/behavior-diff.tsx` — before/after trace comparison
- [ ] Latency + cost comparison panel
- [ ] `lib/evidence/promptfoo.ts` — eval results
- [ ] `lib/evidence/braintrust.ts` — experiment results
- [ ] Evidence score recalibrated with integration data
- [ ] Add `integrations` + `evidence_items` to Prisma schema

**Done when:** PR with Langfuse configured → Behavior Diff shows real before/after
traces. Feedback link "What tool did you still open?" shows increasing "None" responses.

---

### Phase 4: Design Partner Workflow (Week 6, ~2 days)

**Engineering goal:** Two design partners use Vouqis in their weekly review workflow.  
**Customer validation goal:** Weekly active repositories > 1 for 3 consecutive weeks.

- [ ] Email notification on HIGH risk packages (Resend — pattern from existing `api/design-partner`)
- [ ] Reviewer notes (free text, stored per package)
- [ ] PR comment updates when new commits push (don't duplicate — update existing comment)
- [ ] Repository configuration (custom `ai_paths` per repo)
- [ ] No-integration empty state with clear "connect" CTA
- [ ] Onboarding checklist (install → connect → first PR → done)

**Done when:** 2 external engineers from different companies use Vouqis on 3+ PRs in
a single week without prompting.

---

### NOT In Scope (deferred)

| Item | Reason |
|---|---|
| Replay-based behavior diff (run LLM ourselves) | Requires model credentials, complex; traces from integrations are sufficient |
| Automated merge blocking (branch protection rule) | Out of product principle — Vouqis never decides |
| Slack/email digest | Phase 5 |
| Team-level analytics dashboard | Phase 5 |
| Custom risk rules per-repo | Phase 5 |
| Self-hosted deployment | Phase 5 |
| Billing/payments | Phase 5 |
| Mobile UI | Not the use case |

### What Already Exists (reuse)

| Existing | Location | Reuse |
|---|---|---|
| AI file detection (git diff) | `packages/verify/vouqis_verify/core/diff.py` | Port logic to TypeScript `lib/detection/ai-detector.ts` |
| Eval runner | `packages/verify/vouqis_verify/core/runner.py` | Not needed in web app (runs in CI, not server) |
| Config schema | `packages/verify/vouqis_verify/config/schema.py` | Port `ai_paths` patterns to DB config |
| Dashboard auth | `packages/vouqis-dashboard/` | Reuse Clerk setup pattern |

---

## Appendix: Change Type Registry

| Change Type | Detection Pattern | Default Risk |
|---|---|---|
| `prompt_file` | `prompts/`, `*.prompt`, `system_prompt.*`, `*.txt` in AI paths | MEDIUM |
| `system_prompt` | File contains "system", "SYSTEM_PROMPT", is `.md` or `.txt` | MEDIUM |
| `model_version` | YAML/JSON key `model:`, `model_name:`, `engine:` changed | HIGH |
| `temperature` | YAML/JSON key `temperature:` changed | MEDIUM |
| `context_window` | YAML/JSON key `max_tokens:`, `context_window:` changed | MEDIUM |
| `tool_schema` | `tools/`, `*.tool.json`, `function_definitions/`, `tool_schema*` | HIGH |
| `mcp_server` | `mcp.json`, `mcp_servers`, `mcp_config` | HIGH |
| `function_def` | `functions/`, `*.function.json` | HIGH |
| `tool_routing` | `routing.`, `tool_router`, `agent_config.tool_selection` | HIGH |
| `agent_workflow` | `agents/`, `workflow.`, `*.agent.ts`, `agent_graph` | HIGH |
| `memory_config` | `memory.`, `vector_store`, `embeddings.` | MEDIUM |
| `guardrails` | `guardrails.`, `safety.`, `filters.` | HIGH |
| `output_schema` | `output_schema.`, `response_format`, `structured_output` | HIGH |
| `rag_config` | `rag.`, `retriever.`, `knowledge_base.` | HIGH |
| `embedding_model` | key `embedding_model:`, `embeddings.model:` | HIGH |
| `model_params` | keys `top_p:`, `frequency_penalty:`, `presence_penalty:` | MEDIUM |

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 4 decisions resolved, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**UNRESOLVED:** 0  
**VERDICT:** ENG CLEARED — all 4 architectural decisions resolved, ready to implement Phase 0
