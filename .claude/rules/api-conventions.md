# API and Proxy Conventions

Applies to: `packages/cli/src/proxy/**`

## JSON-RPC

Vouqis proxies MCP traffic which uses JSON-RPC 2.0.

- Always propagate `id` from the incoming request into error responses.
- Error code conventions:
  - `-32700` — parse error (invalid JSON or empty body)
  - `-32600` — invalid request (schema violation, missing method)
  - `-32000` — server error (rate limit exceeded, upstream timeout)
  - `-32603` — internal error (unexpected exception)
- Never surface raw exception messages to callers without wrapping in `Gateway: ...`.

## HTTP Transport

- Only POST is valid for JSON-RPC. Return 405 with a JSON-RPC error body for anything else.
- GET is reserved for SSE stream passthrough — do not parse the body.
- OPTIONS returns 204 with explicit CORS headers — never wildcard `Access-Control-Allow-Headers`.

## Security Headers

Every response path must include the `SEC` constant:
```ts
const SEC = {
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const
```

SSE streaming paths override `Cache-Control` to `no-cache` (required for streaming).

## Upstream Forwarding

- Strip `Host` header before forwarding — never leak the gateway's host to the upstream.
- Forward all other headers as-is, joining array values with `, `.
- Set `content-type: application/json` and `accept: application/json, text/event-stream` explicitly.

## Retry Policy

- Retry only on `TimeoutError` and only for idempotent MCP methods: `tools/list`, `tools/call`, `initialize`, `ping`.
- Maximum retry delay: `RETRY_DELAY_MS = 300` ms.
- Emit a `retry` audit event before each retry attempt.

## Analytics

- Never include request/response content, full upstream URLs, authentication tokens, or email addresses in PostHog events.
- Send upstream hostname only (`new URL(upstream.url).hostname`).
- Gate all PostHog calls on `POSTHOG_API_KEY` being set — the SDK disables itself when the key is absent.
