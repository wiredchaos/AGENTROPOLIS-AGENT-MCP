# Global Agent Business MCP Kit

## Status

`phase_1_read_only_contract`

## Purpose

The Agent Business Kit is a Layer-1 infrastructure capability for the Agentropolis Intelligence Grid. It gives Hermes profiles, Bot Mode agents, and future runtimes one provider-neutral MCP contract for business setup and operating readiness across jurisdictions.

It is not a United States formation wizard.

The rule is:

> Global core, local adapters, provider-neutral execution.

## Spawn flow

```text
Bot Mode / Hermes / Agent Runtime
  -> create agent profile
  -> attach Agentropolis identity + mandate
  -> call Global Agent Business Kit
  -> resolve home + operating + customer + tax + data jurisdictions
  -> discover verified local requirements
  -> prepare business setup packet
  -> human / policy review
  -> authenticated execution corridor
  -> provider adapters
  -> receipt + ongoing observability
```

The desktop plugin should not contain legal, tax, banking, sanctions, or Web3 regulatory logic. Bot Mode only requests and displays the kit state. The MCP and jurisdiction adapters own the governed capability contracts.

## Global jurisdiction model

A business may have more than one materially relevant jurisdiction. The minimum model supports:

- incorporation / registration country
- state, province, canton, emirate, territory, or equivalent subdivision
- local city / municipality where relevant
- countries of operation
- customer countries
- tax-residency countries
- data-residency countries
- banking and payment-provider jurisdictions
- Web3 custody, treasury, token, and chain exposure

Country codes should use ISO 3166-1 alpha-2 when possible. Subnational adapters should use ISO 3166-2 or a provider-recognized local identifier.

## Jurisdiction adapters

The global core never assumes that a U.S. LLC, EIN, S-corporation election, Delaware filing, U.S. bank account, or U.S. tax form exists in another country.

Each local adapter must resolve:

- entity forms
- registration authorities
- tax identifiers
- tax classifications / elections / registrations
- beneficial-ownership reporting
- licensing and permits
- employment and payroll rules
- VAT / GST / sales-tax requirements
- banking and payments constraints
- Web3 / virtual-asset constraints
- sanctions and restricted-party controls
- privacy and data residency
- recurring filing deadlines
- source provenance and effective dates

If a verified adapter is unavailable, the MCP returns `REQUIRE_LOCAL_VERIFICATION` rather than substituting another country's rules.

## Web3 overlay

Web3 is not a separate formation stack. It is a regulated activity overlay on top of the business and jurisdiction model.

The MCP must classify at minimum:

- custody mode
- wallet ownership and signing authority
- payment acceptance
- treasury activity
- token issuance
- staking
- DeFi
- NFT activity
- fiat on/off ramps
- customer asset handling
- chain and smart-contract exposure

No Web3 provider can expand the agent's authority. Signing and movement of value remain approval-gated and receipt-backed.

## Vertical spine

```text
identity + mandate
  -> jurisdiction resolution
  -> domain + email
  -> entity / registration
  -> beneficial ownership
  -> tax identity + residency
  -> tax treatment / local registrations
  -> banking + payments + FX
  -> Web3 wallet / treasury controls
  -> bookkeeping + reporting
  -> licenses + insurance + employment
  -> privacy + data residency
  -> ongoing compliance observability
```

## Horizontal enterprise mesh

The same contract must support both a single agent business and a multinational agent organization:

```text
parent organization
  -> subsidiaries / branches / operating entities
  -> districts / business units
  -> agent operating cells

shared services:
  mail
  finance
  accounting
  compliance
  Web3 treasury policy
  policy inheritance
  intercompany controls
  cross-border controls
  consolidated receipts
```

## Provider interfaces

Providers are adapters, not authorities. Examples may include registries, corporate-service providers, tax services, email providers, banks, payment processors, KYB/KYC providers, accounting systems, exchanges, custodians, RPC providers, and wallet infrastructure.

Each provider adapter must declare:

- supported jurisdictions
- supported capabilities
- data sensitivity
- credential type
- approval requirements
- cost model
- rate limits
- source provenance
- regulatory assumptions
- rollback / cancellation behavior
- receipt fields

## Safety invariants

1. An AI agent is an operator, not automatically a legal owner, director, officer, beneficial owner, taxpayer, or regulated responsible person.
2. Entity form, tax residency, tax treatment, bank selection, custodian selection, and regulatory classification are not autonomously selected by the agent.
3. Identity documents, taxpayer identifiers, raw bank credentials, wallet private keys, seed phrases, and unrestricted signing keys stay outside model context.
4. Prepare and submit are separate capabilities.
5. Cross-border activity is evaluated against all materially relevant jurisdictions.
6. Legal, tax, regulatory, sanctions, privacy, and virtual-asset rules require provenance and freshness timestamps.
7. Every consequential action requires policy evaluation, scoped authority, and a permanent receipt.
8. No verified local adapter means no local legal or tax assertion.

## Phase 1 MCP tools

- `get_agent_business_kit_manifest`
- `get_global_jurisdiction_adapter_contract`
- `plan_agent_business_setup`
- `validate_agent_business_readiness`

These tools are intentionally read-only. They do not submit filings, apply for tax IDs, open bank accounts, sign transactions, move assets, or send external email.

## Future execution families

Future authenticated tools should be namespaced by capability and separated into `prepare_*`, `approve_*`, `submit_*`, `observe_*`, and `reconcile_*` operations.

Examples:

```text
business.entity.prepare_registration
business.entity.submit_registration
business.tax.prepare_identity_application
business.tax.submit_identity_application
business.mail.prepare_mailbox
business.mail.send
business.finance.prepare_onboarding
business.finance.submit_onboarding
business.web3.prepare_transaction
business.web3.submit_transaction
business.compliance.refresh_requirements
```

Write authority belongs in the authenticated execution corridor, never the public read-only MCP surface.

## Hermes Bot Mode adapter

Hermes Bot Mode already treats each bot as an isolated Hermes profile. Agentropolis should hook the business kit to profile creation as an optional or policy-required bootstrap package.

Suggested Bot Mode state:

```json
{
  "agentId": "agent_...",
  "businessKit": {
    "enabled": true,
    "homeJurisdiction": { "countryCode": "XX", "subdivisionCode": null },
    "readiness": "REQUIRES_LOCAL_ADAPTER_VALIDATION",
    "mail": "NOT_PROVISIONED",
    "entity": "UNDECIDED",
    "taxIdentity": "UNVERIFIED",
    "banking": "UNVERIFIED",
    "web3": "POLICY_NOT_CONFIGURED"
  }
}
```

Bot Mode remains a UI and profile-management client. Agentropolis owns the global business capability law.