# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `@vouqis/cli` latest | :white_check_mark: |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: [sasisundhar2211@gmail.com](mailto:sasisundhar2211@gmail.com)

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within 48 hours. If the vulnerability is confirmed, we will:
1. Work on a fix immediately
2. Release a patched version
3. Credit you in the release notes (unless you prefer anonymity)

## Scope

This policy covers:
- `@vouqis/cli` npm package
- `vouqis.tech` web dashboard and API
- The Vouqis SDK (`@vouqis/sdk`)

## Known Limitations

- The `postcss` transitive vulnerability (GHSA-qx2v-qp2m-jg93) is present inside `next`'s internal bundled copy. This affects the development/build toolchain only and is not exploitable in the deployed application. It will be resolved when Next.js ships a version with postcss ≥ 8.5.10.
