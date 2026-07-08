# Architecture

Vouqis Verify is a CLI tool that runs inside GitHub Actions. There is no server, no database, and no cloud component.

## Flow

```
Pull Request opened / updated
        ↓
GitHub Action triggers
        ↓
vouqis verify
        ├── Load vouqis.yml
        ├── git diff --name-only origin/main...HEAD
        │       → filter by ai_paths → changed_files[]
        ├── subprocess.run(eval_command, timeout=timeout_seconds)
        │       → EvalResult(passed, exit_code, stdout, stderr, duration_ms)
        ├── Build report
        │       → verdict (SAFE / WARNING / BLOCK)
        │       → why[]
        │       → what_changed (per ai_path counts)
        └── Post PR comment via GitHub REST API
```

## Module Map

```
packages/verify/
└── vouqis_verify/
    ├── cli.py          # Typer app: init, verify, doctor commands
    ├── config/
    │   └── schema.py   # Pydantic Config model, load_config, write_default_config
    ├── core/
    │   ├── diff.py     # git diff → changed AI files
    │   └── runner.py   # subprocess eval execution → EvalResult
    ├── report/
    │   └── render.py   # verdict logic, Report dataclass, markdown/terminal output
    └── github/
        └── pr.py       # GitHub REST API: post PR comment
```

## Decision Engine

No AI. Rules only:

```
eval failed          → BLOCK MERGE    (confidence: High)
eval passed
  + ai_paths changed → MERGE WITH WARNING (confidence: Medium)
  + no ai changes    → SAFE TO MERGE  (confidence: High)
```

Every verdict cites the rule that produced it in the "Why" section of the PR comment.

## What Vouqis Does Not Do

- No eval framework — runs your existing command
- No score parsing — exit code is the only signal
- No baseline storage — no delta metrics yet (v0.1)
- No cloud — runs entirely in GitHub Actions
- No database — stateless per-run
