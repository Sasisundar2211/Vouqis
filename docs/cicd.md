# Vouqis CI/CD Guide

This guide covers two things:

1. **Using Vouqis as a CI/CD gate** — block deploys when an MCP server is unreliable
2. **Contributing to Vouqis** — how this monorepo is tested, built, and deployed

---

## Part 1 — Vouqis as a CI/CD Gate

### How it works

`vouqis audit <url>` runs 10 reliability probes against your MCP server and exits with code `1` if the trust score falls below your threshold. Drop it into any pipeline to gate on MCP health the same way you'd gate on unit tests.

```
vouqis audit https://your-mcp-server.example.com --fail-below 80
```

| Exit code | Meaning |
|:---|:---|
| `0` | Trust score ≥ threshold — safe to deploy |
| `1` | Trust score < threshold — deploy blocked |

### Quickstart

Install the CLI globally or run it with `npx`:

```bash
# Install once
npm install -g @vouqis/cli

# Or run without installing
npx @vouqis/cli audit https://your-mcp-server.example.com
```

---

### GitHub Actions

#### Minimal gate — block PRs below score 80

```yaml
# .github/workflows/mcp-audit.yml
name: MCP Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Audit MCP server
        run: npx @vouqis/cli audit ${{ vars.MCP_SERVER_URL }} --fail-below 80
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

Set `MCP_SERVER_URL` as a repository variable and `VOUQIS_API_KEY` as a secret (Pro plan).

#### Full pipeline — audit, upload report, comment on PR

```yaml
name: MCP Reliability Check

on:
  pull_request:

permissions:
  pull-requests: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Vouqis audit
        id: audit
        run: |
          OUTPUT=$(npx @vouqis/cli audit ${{ vars.MCP_SERVER_URL }} \
            --fail-below 80 \
            --json-path ./vouqis-report.json 2>&1) || FAILED=1
          echo "output<<EOF" >> $GITHUB_OUTPUT
          echo "$OUTPUT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          exit ${FAILED:-0}
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}

      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '### Vouqis MCP Audit\n```\n${{ steps.audit.outputs.output }}\n```'
            })

      - name: Upload report artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vouqis-report
          path: vouqis-report.json
```

#### Scheduled audit — catch regressions between deploys

```yaml
name: Nightly MCP Health

on:
  schedule:
    - cron: '0 6 * * *'   # 06:00 UTC daily
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Audit production MCP server
        run: npx @vouqis/cli audit ${{ vars.MCP_SERVER_URL }} --fail-below 70
        env:
          VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

---

### GitLab CI

```yaml
# .gitlab-ci.yml
mcp-audit:
  image: node:22-slim
  stage: test
  script:
    - npx @vouqis/cli audit $MCP_SERVER_URL --fail-below 80
  variables:
    VOUQIS_API_KEY: $VOUQIS_API_KEY
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
```

---

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  mcp-audit:
    docker:
      - image: cimg/node:22.0
    steps:
      - run:
          name: Audit MCP server
          command: npx @vouqis/cli audit $MCP_SERVER_URL --fail-below 80
          environment:
            VOUQIS_API_KEY: $VOUQIS_API_KEY

workflows:
  audit:
    jobs:
      - mcp-audit
```

---

### Custom HTTP headers

If your MCP server requires authentication, pass headers with `-H`:

```bash
vouqis audit https://your-mcp-server.example.com \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "X-Tenant-ID: acme" \
  --fail-below 80
```

In GitHub Actions:

```yaml
- name: Audit authenticated MCP server
  run: |
    npx @vouqis/cli audit ${{ vars.MCP_SERVER_URL }} \
      -H "Authorization: Bearer ${{ secrets.MCP_TOKEN }}" \
      --fail-below 80
  env:
    VOUQIS_API_KEY: ${{ secrets.VOUQIS_API_KEY }}
```

---

### Environment variables reference

| Variable | Required | Description |
|:---|:---|:---|
| `VOUQIS_API_KEY` | Pro only | Unlocks CI gate (`--fail-below`), 90-day report history, and dashboard upload |
| `VOUQIS_DASHBOARD_URL` | No | Override dashboard URL (default: `https://vouqis.tech`) |
| `VOUQIS_APPROVED_THRESHOLD` | No | Score at/above which verdict is APPROVED (default: `80`) |
| `VOUQIS_RISKY_THRESHOLD` | No | Score at/above which verdict is RISKY (default: `50`) |

#### Setting secrets in GitHub

```
GitHub repo → Settings → Secrets and variables → Actions

Secrets:    VOUQIS_API_KEY, MCP_TOKEN
Variables:  MCP_SERVER_URL
```

---

### Trust score thresholds guide

| Score | Verdict | Suggested action |
|:---|:---|:---|
| 80–100 | APPROVED | Safe to deploy |
| 50–79 | RISKY | Review failures, consider blocking |
| 0–49 | DO NOT INTEGRATE | Block deploy, fix server |

Use `--fail-below 80` for strict production gates. Use `--fail-below 60` for staging where some tolerance is acceptable.

---

## Part 2 — Contributing to Vouqis

### Monorepo layout

```
vouqis/
├── packages/
│   ├── cli/              # @vouqis/cli — the audit command
│   ├── sdk/              # @vouqis/sdk — trace capture for MCP servers
│   └── vouqis-dashboard/ # Next.js app deployed to vouqis.tech
├── vercel.json           # Vercel build config (points at dashboard)
└── .github/workflows/
    └── ci.yml            # GitHub Actions — typecheck, build, test
```

### Local development

**Prerequisites:** Node 20+, npm

```bash
# Install all workspace dependencies
npm install

# Run all typechecks
npm run typecheck

# Build all packages
npm run build

# Run all tests
npm test
```

**Dashboard only:**

```bash
cd packages/vouqis-dashboard
cp .env.example .env.local   # fill in Supabase + Polar keys
npm run dev                  # http://localhost:3000
```

**CLI only:**

```bash
cd packages/cli
npm run build
node bin/run.js audit https://your-mcp-server.example.com
```

---

### GitHub Actions CI

The CI workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

| Step | What it checks |
|:---|:---|
| `typecheck` | TypeScript across all three packages |
| `build` | Dashboard Next.js build + CLI tsup build |
| `test` | Vitest suites across all packages |

**CI uses placeholder env vars for the build step** — no real Supabase credentials needed for CI to pass.

All three checks must pass before merging to `main`.

---

### Vercel deployment

The dashboard auto-deploys to `vouqis.tech` when `main` is updated.

```
push to main
    └── GitHub Actions CI (typecheck + build + test)
    └── Vercel (build + deploy)  ← runs in parallel, independent
```

**Vercel config** (`vercel.json` at repo root):

```json
{
  "buildCommand": "cd packages/vouqis-dashboard && npm run build",
  "outputDirectory": "packages/vouqis-dashboard/.next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

Production environment variables are managed in the Vercel project dashboard — never committed to the repo.

---

### Publishing the CLI to npm

The CLI is published manually when ready:

```bash
cd packages/cli

# Bump version in package.json first, then:
npm run build
npm publish --access public
```

The `prepack` script (`npm run build`) runs automatically before publish to ensure `dist/` is up to date.

---

### Branch and PR workflow

```
feature branch
    └── open PR
        └── CI must pass (typecheck + build + test)
        └── code review
    └── merge to main
        └── Vercel auto-deploys dashboard
        └── CLI published manually when version bumps
```

Direct pushes to `main` are restricted — changes go through PRs. The CI gate is required to merge.
