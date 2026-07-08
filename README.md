# Vouqis Verify

**Verify every AI change before it reaches production.**

Vouqis Verify runs on every pull request that touches your AI code. It executes your existing evaluation suite and posts a deployment recommendation as a PR comment — so your team can answer one question with confidence:

> Is this AI change safe to merge?

---

## Example PR Comment

```
## Vouqis Verify

## What Changed

| | |
|---|---|
| `prompts/` | ✓ 1 file changed |
| `src/agents/` | — no change |
| Evaluation | ✅ PASS |
| Duration | 4,231ms |
| Exit code | `0` |

## Recommendation

⚠️ MERGE WITH WARNING — Confidence: Medium

## Why

• Evaluation command completed successfully.
• AI behavior files changed — human review recommended.
• Existing tests cannot determine behavioral impact.

Changed: `prompts/system.txt`
```

---

## Install

```bash
pip install vouqis-verify
```

## Quickstart

```bash
# 1. Generate config
vouqis init

# 2. Edit vouqis.yml — point eval_command at your eval suite

# 3. Add to GitHub Actions (see below)

# 4. Every PR that touches AI files gets a deployment review
```

## GitHub Action

```yaml
# .github/workflows/vouqis-verify.yml
name: AI Change Verification

on:
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: vouqis/vouqis-verify@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

```yaml
# vouqis.yml
project_name: My AI App               # shown in PR comment header
eval_command: pytest tests/eval/ -v   # any command — exit 0 = pass
baseline: main
ai_paths:
  - prompts/
  - src/agents/
  - config/models/
timeout_seconds: 300
```

Works with any evaluation framework: pytest, promptfoo, braintrust, langsmith, or a custom script.

---

## Verdicts

| Verdict | When |
|---|---|
| ✅ SAFE TO MERGE | Eval passed, no AI files changed |
| ⚠️ MERGE WITH WARNING | Eval passed, AI files changed |
| ❌ BLOCK MERGE | Eval failed |

---

## CLI

```
vouqis init      Generate vouqis.yml
vouqis verify    Run evaluation and post PR comment
vouqis doctor    Validate config and environment
```

---

Full documentation: [`packages/verify/README.md`](packages/verify/README.md)
