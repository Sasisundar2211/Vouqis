# Vouqis Verify

Verify every AI change before it reaches production.

Vouqis Verify runs automatically on every pull request that touches your AI code. It executes your existing evaluation suite, generates a deployment review, and comments on the PR so your team can make an informed merge decision.

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

---
Did this report change your merge decision?
✅ Yes, I merged because of it · ⚠️ Yes, I delayed or blocked · ➖ No, confirmed · ❌ No, not useful
```

---

## Quickstart

### 1. Install

```bash
pipx install vouqis-verify
```

### 2. Initialise

```bash
vouqis init
```

This creates a `vouqis.yml` in your current directory.

### 3. Configure

```yaml
# vouqis.yml
eval_command: pytest tests/eval/ -v   # any command — pytest, promptfoo, braintrust, custom script
baseline: main
ai_paths:
  - prompts/
  - src/agents/
  - config/models/
```

### 4. Add the GitHub Action

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

      - name: Verify AI changes
        uses: vouqis/vouqis-verify@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

That's it. Every PR that touches your AI paths now gets a deployment review.

---

## How it works

```
Push commit
  ↓
GitHub Action triggers
  ↓
vouqis verify
  ├── Detects changed AI files (git diff vs baseline)
  ├── Runs your eval_command
  └── Generates deployment review
        ↓
        PR comment posted
        ↓
        Engineer reads recommendation → merges or blocks
```

Vouqis does **not** run your evals for you. It runs the command you already have. This means it works with any evaluation framework: pytest, promptfoo, braintrust, a custom shell script, or nothing at all — just exit 0 or exit 1.

---

## CLI reference

```
vouqis init               Generate a default vouqis.yml
vouqis verify             Run evaluation and generate deployment review
  --config PATH           Config file (default: vouqis.yml)
  --base BRANCH           Base branch to diff against (overrides config)
  --pr INT                PR number (set automatically in GitHub Actions)
  --repo OWNER/REPO       GitHub repository (set automatically in GitHub Actions)
  --token TOKEN           GitHub token (set automatically in GitHub Actions)
  --no-comment            Skip posting the PR comment
vouqis doctor             Validate config and environment
  --config PATH           Config file to validate (default: vouqis.yml)
vouqis --version          Print version and exit
```

---

## Configuration reference

```yaml
# eval_command: shell command to run your evaluations
#   exit 0  → PASS
#   exit 1+ → FAIL
eval_command: pytest tests/eval/ -v

# baseline: branch to compare against for detecting AI file changes
baseline: main

# ai_paths: directories or file prefixes that contain AI-related code
#   Only changes to these paths affect the confidence rating.
#   The eval command runs regardless.
ai_paths:
  - prompts/
  - src/agents/
  - config/models/

# timeout_seconds: kill the eval command if it runs longer than this
timeout_seconds: 300

# feedback_url: link in the PR comment for 👍/👎 feedback
#   Defaults to https://vouqis.tech/verify-feedback
# feedback_url: https://forms.gle/yourform
```

---

## Confidence levels

| Verdict | Confidence | When |
|---|---|---|
| ✅ SAFE TO MERGE | High | Eval passed, no AI files changed |
| ⚠️ MERGE WITH WARNING | Medium | Eval passed, AI files changed |
| ❌ BLOCK MERGE | High | Eval failed |

---

## Local testing

```bash
# Install in dev mode
cd packages/verify
pip install -e ".[dev]"

# Run tests
pytest

# Simulate a verify run (without posting a PR comment)
vouqis verify --no-comment

# Test against a specific base branch
vouqis verify --base develop --no-comment
```

---

## Supported evaluation frameworks

Vouqis Verify runs any shell command. Examples:

```yaml
# pytest
eval_command: pytest tests/eval/ -v

# promptfoo
eval_command: promptfoo eval --config promptfooconfig.yaml

# braintrust
eval_command: braintrust run evals/

# custom script
eval_command: ./scripts/run-evals.sh

# multiple steps
eval_command: pytest tests/unit/ && pytest tests/eval/
```

---

## Feedback

After each PR review, the comment includes 👍 / 👎 links. Click them to tell us whether the recommendation was useful. This is how we validate the product.
