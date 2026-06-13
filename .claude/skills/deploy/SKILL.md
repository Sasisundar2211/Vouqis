# Deploy Skill

Deploys the Vouqis dashboard (vouqis.tech) to Vercel production.

## When to Use

Invoke this skill when the user says "deploy", "ship to production", or "push to vouqis.tech".

## Steps

1. Verify the working directory is clean or changes are committed:
   ```bash
   git status --short packages/vouqis-dashboard/
   ```

2. Run a local build check:
   ```bash
   cd packages/vouqis-dashboard && npm run build
   ```

3. If build passes, deploy:
   ```bash
   cd packages/vouqis-dashboard && vercel --prod
   ```

4. Confirm the alias: look for `Aliased: https://www.vouqis.tech` in the output.

5. Verify the deploy with a content spot-check:
   ```bash
   curl -sL https://vouqis.tech | grep -o 'Prevent Silent\|Customer Discovery'
   ```

## Notes

- The Vercel project is `sasisundar2211s-projects/vouqis`.
- The `.vercel/` link lives at `packages/vouqis-dashboard/.vercel/`.
- Git push to `main` does NOT auto-trigger Vercel — always deploy manually with `vercel --prod`.
- See `deploy-config.md` for project IDs and environment details.
