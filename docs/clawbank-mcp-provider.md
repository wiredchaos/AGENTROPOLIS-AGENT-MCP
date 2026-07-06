# ClawBank MCP Provider Note

## Status

ClawBank is a Tier 1 integration candidate for agent finance and entity operations. It should be exposed through an MCP adapter only after governance, audit, approval, and compliance gates are in place.

Sources reviewed:

- https://clawbank.co/
- Public ClawBank / 0xJustice messaging describing MCP, CLI, web UI, bank accounts, legal entities, Ricardian contracts, and on/off ramps

## Why it matters

ClawBank is not positioning itself as a normal fintech dashboard. The public thesis is that ClawBank becomes a crypto-native Zero Human Company operating system.

Relevant claims from public messaging:

- Every feature exposed through an MCP server
- CLI for builders
- Web UI for humans
- Bank accounts
- Legal entities
- Ricardian contracts
- On and off ramps
- Crypto-native operations
- Agent-optimized workflows

This makes ClawBank directly relevant to AGENTROPOLIS-AGENT-MCP because it could become a regulated execution surface for agents.

## AGENTROPOLIS position

AGENTROPOLIS should sit above ClawBank.

```txt
AGENTROPOLIS
  -> Agent Runtime
  -> Memory
  -> Identity
  -> Governance
  -> MCP Router
      -> ClawBank
      -> Stripe
      -> Coinbase
      -> Crossmint
      -> Local Bank
      -> Future Providers
```

ClawBank is a provider. AGENTROPOLIS owns orchestration, permissions, policy, and audit.

## Connector role

The MCP server must never allow an agent to directly self-authorize formation, banking, crypto sweeps, or money movement.

```txt
Agent request
  -> MCP tool call
  -> policy engine
  -> human or governance approval when required
  -> ClawBank provider API
  -> audit receipt
```

## Proposed tools

Read-only tools:

- clawbank_status
- clawbank_get_balance
- clawbank_list_accounts
- clawbank_list_entities
- clawbank_list_contracts
- clawbank_get_audit_log

Draft-only tools:

- clawbank_prepare_entity_filing
- clawbank_prepare_ach
- clawbank_prepare_wire
- clawbank_prepare_crypto_sweep
- clawbank_prepare_contract

Approval-gated submit tools:

- clawbank_submit_entity_filing
- clawbank_submit_ach
- clawbank_submit_wire
- clawbank_submit_crypto_sweep
- clawbank_submit_contract

## Safety rules

1. Separate prepare and submit calls.
2. Require policy signatures for all money movement.
3. Use wallet and bank-recipient allowlists.
4. Enforce daily, weekly, and per-transaction limits.
5. Log request, tool call, policy result, approver, provider response, and receipt hash.
6. Never represent Zero Human Company as settled law.
7. Require a human responsible party for regulated entity, tax, and banking flows.
8. Treat crypto-native megacorp language as vision, not legal status.

## Provider-neutral interface

```ts
interface AgentFinanceProvider {
  providerId: string;
  getStatus(): Promise<ProviderStatus>;
  listAccounts(): Promise<Account[]>;
  listEntities(): Promise<Entity[]>;
  getBalance(accountId: string): Promise<Balance>;
  prepareTransfer(input: TransferInput): Promise<TransferDraft>;
  submitTransfer(draftId: string, approvalToken: string): Promise<TransferReceipt>;
  prepareEntityFiling(input: EntityFilingInput): Promise<EntityFilingDraft>;
  submitEntityFiling(draftId: string, approvalToken: string): Promise<EntityFilingReceipt>;
  exportAuditLog(range: DateRange): Promise<AuditLog>;
}
```

## Decision

Move ClawBank from general watchlist to Tier 1 integration candidate. Do not production-wire it until API docs, compliance boundaries, banking partners, KYC requirements, and legal assumptions are verified.
