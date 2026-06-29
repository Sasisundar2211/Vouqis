# Vouqis Context

This document defines the architectural vocabulary and invariants of Vouqis.

If code and this document disagree, either the code is wrong or this document must be intentionally updated in the same pull request.

---

## Product

Vouqis is a runtime reliability gateway for Model Context Protocol (MCP).

It sits between AI agents and MCP servers. Every request and response passes through the gateway before reaching the other side.

The gateway validates protocol correctness, detects runtime failures, classifies failures, and emits structured reliability events before failures propagate into user-visible behavior.

Vouqis is not an observability platform.
Vouqis is not an MCP server.
Vouqis is not an audit product.

Its responsibility is runtime reliability.

---

## Layer Model

```
Transport
    ↓
Protocol
    ↓
Reliability
```

Dependencies always flow downward. A lower layer never imports a higher layer.

### Transport Layer

Responsible for moving bytes.

Examples: HTTP, SSE, stdio, WebSocket (future)

Transport knows nothing about reliability policy. It forwards protocol messages.

### Protocol Layer

Responsible for understanding protocol specifications.

Examples: JSON-RPC, MCP

Owns: protocol constants, message types, protocol validators, protocol-specific utilities.

Protocol answers: **"What does the specification require?"**

Protocol never decides policy.

### Reliability Layer

Responsible for Vouqis behavior.

Examples: failure classification, retry decisions, policy engine, structured reliability events, gateway decisions.

Reliability answers: **"What should Vouqis do?"**

Reliability depends on Protocol. Protocol never depends on Reliability.

---

## Architectural Rule

Before creating a module, ask one question:

> **Does this describe the protocol, or how Vouqis handles the protocol?**

If it describes the specification → it belongs in `protocol/`.
If it describes Vouqis behavior → it belongs in `reliability/` or `gateway/`.

---

## Commit Philosophy

Each architectural commit has one reason to exist.

Prefer many small commits over one large refactor. Behavior changes and structural changes must not be mixed.

Create a directory only when at least one concrete responsibility belongs there. Empty directories are not architecture — they are speculation.

---

## Product Principles

- Runtime-first.
- Outside-in validation.
- Deterministic behavior.
- Explicit failure classification.
- Zero silent failures.
- Evidence before abstraction.
- One source of truth per concern.
- No speculative architecture.
