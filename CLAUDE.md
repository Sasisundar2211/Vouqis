# Vouqis — Claude Project Instructions

## What This Project Is

Vouqis is an AI Agent Reliability Gateway — a CLI proxy that sits between AI agents and MCP servers to validate requests, responses, timeouts, and execution outcomes before failures become customer-visible incidents.

**Stage**: Customer discovery. We are validating the problem, not building for scale.

## Repository Structure

```
vouqis/                          # monorepo root
├── packages/
│   ├── cli/                     # @vouqis/cli — the core product
│   │   └── src/
│   │       ├── commands/        # CLI commands: proxy, logs
│   │       ├── proxy/           # HTTP proxy server, rate limiter, validator, audit logger
│   │       └── analytics.ts     # PostHog anonymous analytics
│   └── vouqis-dashboard/        # vouqis.tech — Next.js 16 marketing site
│       └── src/app/             # App Router pages
├── CLAUDE.md                    # ← this file (committed)
├── CLAUDE.local.md              # local developer overrides (gitignored)
├── .mcp.json                    # MCP server connections (committed)
└── .claude/                     # Claude Code configuration
    ├── settings.json            # shared permissions (committed)
    ├── settings.local.json      # local secrets and overrides (gitignored)
    ├── rules/                   # modular rule files
    ├── commands/                # custom slash commands
    ├── agents/                  # subagent definitions
    └── hooks/                   # event-driven hooks
```

## Tech Stack

| Layer | Technology |
|---|---|
| CLI proxy | Node.js `http`, TypeScript, Vitest |
| Rate limiting | Token bucket (custom) |
| Audit logging | NDJSON to `vouqis-audit.log` |
| Analytics | PostHog (anonymous UUID, opt-out via no `POSTHOG_API_KEY`) |
| Marketing site | Next.js 16.2.6, React 19, Tailwind v4, Geist fonts |
| Deployment | Vercel (`vercel --prod` from `packages/vouqis-dashboard`) |
| CI | GitHub Actions — typecheck, build, `npm audit --audit-level=high`, test |

## Key Commands

```bash
# Development
npm ci                          # install all workspace deps
npm run typecheck               # TypeScript across all packages
npm run build                   # build all packages
npm test                        # run all tests (Vitest)

# CLI package only
cd packages/cli
npm run build                   # tsc → dist/
npm test                        # vitest run

# Dashboard
cd packages/vouqis-dashboard
npm run dev                     # local Next.js dev server
vercel --prod                   # deploy to vouqis.tech
```

## Core Conventions

- **No speculative code.** Every line must trace to an explicit requirement.
- **Tests required** for all proxy logic (validator, rate limiter, audit logger, server).
- **Security headers** (`X-Content-Type-Options`, `Cache-Control: no-store`) on every response path.
- **PostHog analytics** — never send request/response content, full URLs, or PII.
- **Commit style** — conventional commits: `feat(scope):`, `fix(scope):`, `refactor(scope):`.

## Rules, Commands, Agents

See `.claude/rules/` for code style, testing, and API conventions.
See `.claude/commands/` for `/review` and `/fix-issue` slash commands.
See `.claude/agents/` for specialized subagent definitions.
