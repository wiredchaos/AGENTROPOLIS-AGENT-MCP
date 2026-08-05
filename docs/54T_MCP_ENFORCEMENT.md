# 54T MCP Enforcement Contract

**Status:** Integration baseline  
**Policy authority:** `wiredchaos/AGENTROPOLIS-54T`  
**Execution surface:** `wiredchaos/AGENTROPOLIS-AGENT-MCP`

## Purpose

This document defines how 54T governance contracts are enforced at the MCP and tool boundary. The MCP kit may execute only after identity, authority, scope, risk, and approval checks pass.

## Enforcement flow

```text
MCP request
-> normalize input and Unicode confusables
-> classify task and target resource
-> identify actor and agent
-> load approved 54T policy version
-> score risk
-> verify tool capability scope
-> verify approvals
-> bind approval to exact action scope
-> allow / deny / quarantine
-> execute only the approved operation
-> validate output
-> write receipt
-> forward evidence to AEGIS
```

## Failure behavior

```text
failed mandatory gate
-> deny or quarantine
-> perform no partial privileged action
-> expose no secrets
-> create denial receipt
```

## Dual consent

Wallet and settlement actions require:

```text
authenticated wallet owner approval
+
independent policy approval
```

The requesting agent never counts as an approver. Approval must bind to asset, amount, destination, chain, action, and expiration.

## Tool contract requirements

Every privileged MCP tool must declare:

- capability identifier
- allowed action classes
- required identity level
- maximum risk level
- approval requirements
- secret requirements
- network destinations
- receipt requirement
- timeout and expiration
- rollback or quarantine behavior

## Runtime status

These files define contracts. They do not prove that enforcement is live. Production status requires implementation, automated tests, receipts, and operational evidence.
