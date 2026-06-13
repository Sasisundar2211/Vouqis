# Testing Rules

Applies to: `packages/cli/src/**/*.test.ts`

## Framework

Vitest. Run with `npm test` from the repo root or `cd packages/cli && npm test`.

## Coverage Requirements

All proxy logic must have tests:
- `validator.ts` — every validation rule, happy path + each rejection
- `ratelimit.ts` — consume under limit, consume at limit, refill behavior
- `audit.ts` — log entry shape, file write, close
- `server.ts` — OPTIONS, GET SSE, POST blocked, POST allowed, rate limited, retry on timeout

Dashboard has no tests. Do not add a test framework to it.

## Test Structure

```ts
describe('module name', () => {
  describe('function name', () => {
    it('does X when Y', () => { ... })
    it('blocks when Z', () => { ... })
  })
})
```

- One `describe` per source file, one nested `describe` per function/behavior.
- `it()` descriptions: active voice, concrete condition. Not "should work".

## Mocking

- Use `vi.fn()` for mocks. Type them as `ReturnType<typeof makeX>` not with `as SomeClass`.
- Cast to the real type only at the call site: `createProxyServer(config, logger as unknown as AuditLogger)`.
- Never mock the module under test.

## Assertions

- Prefer `expect(x).toBe(y)` for primitives, `toEqual` for objects.
- Use `toHaveBeenCalledWith` to assert mock call arguments exactly.
- One logical assertion per `it()` block where possible.

## What Not To Test

- Third-party library internals (PostHog, Node `http` core behavior).
- Types — TypeScript already checks them.
- Trivial getters or one-liner pure functions with no branching.
