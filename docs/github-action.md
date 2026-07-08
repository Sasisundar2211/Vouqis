# GitHub Action

Vouqis Verify runs as a composite GitHub Action.

## Setup

### 1. Add `vouqis.yml` to your repo root

```bash
vouqis init
# then edit vouqis.yml
```

### 2. Create the workflow file

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
      pull-requests: write   # required to post the PR comment

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0     # required for git diff against baseline

      - uses: vouqis/vouqis-verify@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `github-token` | ✅ | — | Token for posting the PR comment |
| `config-path` | ❌ | `vouqis.yml` | Path to config file |
| `python-version` | ❌ | `3.12` | Python version to use |

## Environment Variables

When running outside the Action (e.g. local testing), set these manually:

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub token |
| `PR_NUMBER` | Pull request number |
| `GITHUB_REPOSITORY` | `owner/repo` format |

## Local Testing

```bash
# Validate config and environment
vouqis doctor

# Run without posting a PR comment
vouqis verify --no-comment

# Override baseline branch
vouqis verify --base develop --no-comment
```

## Required Permissions

The workflow needs `pull-requests: write` to post the PR comment. The `GITHUB_TOKEN` with this permission is automatically available in GitHub Actions — no extra secrets needed.
