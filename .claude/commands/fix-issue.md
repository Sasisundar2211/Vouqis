# /fix-issue

Fix a reported bug or failing test. No hand-holding required.

## Steps

1. Read the error message or test failure output.
2. Find the root cause — do not patch symptoms.
3. Write a failing test that reproduces the issue (if one doesn't exist).
4. Fix the code until the test passes.
5. Run `npm run typecheck && npm test` — both must pass.
6. Summarise: what was broken, what changed, what was verified.

## Rules

- Touch only the files required to fix the issue.
- Do not refactor adjacent code unless it directly caused the bug.
- Do not add error handling for scenarios that can't happen.
- If the fix requires changes to more than 3 files, stop and explain why before proceeding.

## Output

```
## Fix: <issue description>

**Root cause**: <one sentence>
**Changed**: <file:line — what changed>
**Verified**: npm test passed (N tests), typecheck clean
```
