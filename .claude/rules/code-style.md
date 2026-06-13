# Code Style Rules

Applies to: `packages/**/*.ts`, `packages/**/*.tsx`

## TypeScript

- `strict: true` — no implicit any, no unchecked index access.
- Prefer `const` over `let`. Never `var`.
- Use `type` over `interface` for object shapes unless extending.
- No `as any` casts. Use `as unknown as T` only when unavoidable, at call sites not definition sites.
- Explicit return types on exported functions.

## Naming

- Files: `kebab-case.ts`
- Types/interfaces: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for module-level primitives

## Formatting

- 2-space indentation
- Single quotes for strings
- No semicolons in TSX (dashboard); semicolons enforced in CLI
- Max line length: 100 characters

## Imports

- Node built-ins: `import * as http from 'node:http'` (use `node:` prefix)
- Group: built-ins → external → internal. Separated by blank line.
- No barrel re-exports unless the module surface is intentionally public.

## Comments

- Write no comments by default.
- Only add one when the WHY is non-obvious: hidden constraint, subtle invariant, workaround for a specific bug.
- Never describe WHAT the code does — names do that.

## React / Next.js (dashboard only)

- Server Components by default. Add `'use client'` only where interactivity requires it.
- No `useEffect` for data fetching — use async Server Components or route handlers.
- Tailwind only — no inline `style={}` except for dynamic values that Tailwind can't express.
