# Deploy Configuration

## Vercel Project

| Field | Value |
|---|---|
| Project name | `vouqis` |
| Org | `sasisundar2211s-projects` |
| Production domain | `vouqis.tech`, `www.vouqis.tech` |
| Root directory | `packages/vouqis-dashboard` |
| Framework | Next.js |
| Node version | 24.x |

## Deploy Command

```bash
cd packages/vouqis-dashboard
vercel --prod
```

## Git Integration

Not connected. All deploys are manual via `vercel --prod`.
Pushing to `main` does NOT trigger a Vercel build.

## Environment Variables

Set via Vercel dashboard or `vercel env`. Not stored in this repo.

Required for dashboard (currently unused — static site):
- None at present. Add here when API routes are introduced.
