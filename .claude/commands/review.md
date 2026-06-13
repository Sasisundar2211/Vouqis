# /review

Run a structured code review of the current branch diff.

## Steps

1. Get the diff: `git diff main...HEAD`
2. Check each changed file against `.claude/rules/`:
   - `code-style.md` — naming, imports, comments, formatting
   - `testing.md` — test coverage for any new proxy logic
   - `api-conventions.md` — security headers, JSON-RPC error codes, analytics hygiene
3. Run: `npm run typecheck && npm test`
4. Report findings grouped by severity: **blocking** / **advisory**

## Output Format

```
## Review: <branch name>

### Blocking
- [ ] file.ts:42 — <issue>

### Advisory
- [ ] file.ts:17 — <suggestion>

### Passing
- TypeScript: clean
- Tests: N passed
- Security headers: present on all response paths
- Analytics: no PII in event properties
```

Only raise blocking issues for things that would fail CI or introduce a security regression.
