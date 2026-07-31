# Security Policy

Report vulnerabilities through GitHub private vulnerability reporting when available. Do not open a public issue containing exploit details, tokens, private endpoints, or user data.

## Invariants

1. Public MCP tools remain `READ_ONLY`.
2. Tools cannot self-grant authority.
3. Wallet, payment, publish, permission, settlement, and destructive actions remain outside this Worker.
4. Operator APIs require the encrypted `MCP_API_TOKEN` secret.
5. Raw bearer tokens and raw tool inputs are not persisted.
6. Every successful callable tool returns a receipt.
7. Browser-originated cross-site requests pass the origin allowlist.
8. Secrets and account-specific credentials are never committed.
