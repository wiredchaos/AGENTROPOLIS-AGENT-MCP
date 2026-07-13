# AGENTROPOLIS MCP Commercial Execution Membrane

Tracks: `wiredchaos/AGENTROPOLIS-AGENT-MCP#10`

## Purpose

This document defines how AGENTROPOLIS-AGENT-MCP participates in the commercial operating model without becoming the pricing authority, payment processor, wallet custodian, or authoritative billing ledger.

The City OS owns plans, entitlements, pricing policy, and authoritative commercial state.

MCP owns governed execution checks and receipt-linked usage emission.

## Canonical execution sequence

```text
intent
  -> task classification
  -> difficulty estimate
  -> risk score
  -> authority check
  -> entitlement check
  -> cost estimate request
  -> budget reservation request
  -> human approval when required
  -> execution
  -> validation
  -> execution receipt
  -> usage event
  -> settlement handoff
```

No tool or workflow may skip authority, entitlement, budget, validation, or receipt requirements merely because a provider lane is available.

## Inputs from the City OS

MCP consumes approved references to:

- organization
- active plan
- active entitlements
- mandate
- commercial policy version
- pricing policy version
- budget policy
- allowed district, skill, tool, and environment scope

MCP does not mutate the canonical plan or pricing policy.

## Outputs from MCP

A successful commercial execution may emit:

1. entitlement decision;
2. cost-estimate request and response reference;
3. budget-reservation reference;
4. approval evidence when required;
5. execution receipt;
6. one or more usage events;
7. settlement handoff event;
8. reconciliation signal when state or arithmetic is uncertain.

## Required identity links

Every billable usage event must link to:

- `organizationId`
- `mandateId`
- `agentId`
- `districtId`
- `skillId` or `packageId` when applicable
- `receiptId`
- `pricingPolicyVersion`
- `idempotencyKey`

Provider calls without these references are operationally incomplete and must not silently become billable records.

## Decision outcomes

### ALLOW

Execution is authorized, entitled, in scope, within budget, and approved when required.

### DENY

Execution is blocked before provider invocation. Default billing result: non-billable.

### REQUIRE_APPROVAL

Execution remains pending until valid approval evidence is attached.

### REQUIRE_REESTIMATE

The estimate expired, assumptions changed, or predicted cost exceeds the reserved amount.

### RECONCILIATION_REQUIRED

The execution occurred but commercial state, arithmetic, provider reporting, or receipt linkage is incomplete or contradictory.

## Non-billable defaults

MCP marks an execution non-billable by default when:

- authority fails;
- entitlement fails;
- scope fails;
- approval is missing;
- budget reservation fails;
- execution is a duplicate replay;
- the provider was never invoked;
- AGENTROPOLIS fails before useful work is produced;
- the provider confirms a full refund.

Unavoidable external provider charges remain visible as provider cost and enter reconciliation rather than being hidden.

## Idempotency

The same commercial action must reuse a stable idempotency key across retries.

```text
reservation:{mandateId}:{attemptKey}
usage:{receiptId}:{usageClass}:{sequence}
settlement:{sourceType}:{sourceId}:{direction}
```

A duplicate key returns the prior result or a duplicate decision. It must not create a second reservation, charge, settlement, or payout.

## Estimate and reservation rules

- Estimates are time-limited and reference a versioned pricing policy.
- Reservations must reference a valid estimate.
- Currency must remain consistent from estimate through settlement.
- Execution must stop or request re-estimation when expected cost exceeds policy tolerance.
- Consumed reservation value cannot exceed the reserved amount without a new approved estimate and reservation.

## Receipt-before-charge rule

A billable usage event requires a valid execution receipt.

The receipt must prove at minimum:

- authorized mandate;
- selected agent, skill, tool, and provider lane;
- execution start and completion state;
- validation result;
- provider usage evidence where available;
- final commercial classification.

No receipt means no normal billable posting. The event enters reconciliation.

## Security boundaries

MCP must not receive:

- raw payment credentials;
- unrestricted treasury keys;
- customer bank credentials;
- ecosystem-wide secrets;
- authority to alter retail pricing;
- authority to approve its own high-risk execution.

Sensitive actions continue to require policy gates, least privilege, simulation where applicable, human approval, and receipts.

## Failure handling

MCP must distinguish:

- denied before execution;
- failed before provider invocation;
- provider error with no charge;
- provider error with partial charge;
- successful provider call with invalid output;
- successful validated execution;
- duplicate replay;
- refunded execution;
- uncertain state.

Only validated and policy-approved results become normally billable. Partial or uncertain cases enter reconciliation.

## Phase 1 acceptance test

A sandbox flow passes when MCP can:

1. receive organization, entitlement, and mandate references;
2. return an entitlement decision;
3. obtain a cost estimate;
4. reserve budget idempotently;
5. block an over-budget attempt;
6. execute one low-risk approved task;
7. validate its result;
8. emit a receipt-linked usage event;
9. replay the same request without duplicate charge creation;
10. emit a reconciliation signal for a mismatched provider-cost report.

## Explicit exclusions

This phase does not implement:

- payment collection;
- wallet custody;
- invoice delivery;
- tax calculation;
- automatic publisher payouts;
- real-money gaming or prediction settlement.
