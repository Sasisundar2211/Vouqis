# Configuration Reference

Vouqis Verify is configured via a single `vouqis.yml` file in your repository root.

## Full Reference

```yaml
# Optional: display name shown in PR comment header
project_name: My AI App

# Command to run your evaluations
# Any command that exits 0 = pass, exits non-zero = fail
eval_command: pytest tests/eval/ -v

# Branch to compare against for detecting AI file changes
baseline: main

# Paths that contain AI-related files
# Changes to these paths affect the verdict (SAFE vs WARNING)
# The eval command runs regardless of whether these changed
ai_paths:
  - prompts/
  - src/agents/
  - config/models/

# Kill the eval command if it exceeds this many seconds
timeout_seconds: 300

# Optional: URL appended with ?decision=merged|blocked|confirmed|not-useful
# Defaults to https://vouqis.tech/verify-feedback
# feedback_url: https://forms.gle/yourform
```

## Minimal Config

```yaml
eval_command: pytest tests/eval/ -v
baseline: main
ai_paths:
  - prompts/
```

## Verdict Logic

| Condition | Verdict |
|---|---|
| Eval failed (exit non-zero) | ❌ BLOCK MERGE |
| Eval passed + AI files changed | ⚠️ MERGE WITH WARNING |
| Eval passed + no AI files changed | ✅ SAFE TO MERGE |

Verdicts are deterministic. No AI is used to generate them.

## Supported Eval Commands

Any shell command works:

```yaml
# pytest
eval_command: pytest tests/eval/ -v

# promptfoo
eval_command: promptfoo eval --config promptfooconfig.yaml

# braintrust
eval_command: braintrust run evals/

# langsmith
eval_command: python evals/run.py

# custom script
eval_command: ./scripts/run-evals.sh

# multiple steps
eval_command: pytest tests/unit/ && pytest tests/eval/
```
