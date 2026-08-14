# Hermes Bot Mode -> Global Agent Business Kit Adapter

## Position

`NousResearch/Hermes-Bot-Mode` remains the desktop/profile UI. `wiredchaos/AGENTROPOLIS-AGENT-MCP` owns the governed business capability contract.

Do not fork legal, tax, banking, email, or Web3 rules into the desktop plugin.

## Why this fits upstream Bot Mode

Bot Mode maps each bot to an isolated Hermes profile with its own config, memory, skills, credentials, chats, routines, and bot-to-bot inbox. That makes profile creation the correct attachment point for an Agentropolis business bootstrap package.

## Proposed bootstrap call

After `profiles.create` succeeds, an Agentropolis-enabled Bot Mode client may call:

```text
get_agent_business_kit_manifest
plan_agent_business_setup
validate_agent_business_readiness
```

The first-run UI should request only enough information to establish scope:

```json
{
  "countryCode": "XX",
  "subdivisionCode": null,
  "operatingCountries": [],
  "customerCountries": [],
  "taxResidencyCountries": [],
  "dataResidencyCountries": [],
  "entityForm": "undecided",
  "taxTreatment": "undecided",
  "businessModel": "other",
  "web3Enabled": false,
  "custodyMode": "none",
  "tokenActivity": "none"
}
```

## UI state

Recommended profile card status:

```text
BUSINESS KIT
Jurisdiction   VERIFIED / NEEDS LOCAL ADAPTER
Entity         UNDECIDED / PREPARED / VERIFIED
Mail           NOT PROVISIONED / READY
Tax            UNVERIFIED / REVIEW REQUIRED
Banking        UNVERIFIED / READY
Web3           DISABLED / POLICY REQUIRED / READY
Compliance     CURRENT / REVIEW / STALE
```

## Provider-neutral mail

Email provisioning should route through Agentropolis Agentic Mail OS rather than hard-coding one provider.

Candidate backends include:

- Cloudflare Agentic Inbox
- Gmail / Google Workspace
- Microsoft 365
- Proton Mail
- SMTP / IMAP
- Resend / Postmark / SES for transactional mail

Read/search/summarize/draft can be policy-approved by default. External send, forward, delete, and bulk actions remain approval-gated.

## Business formation

Bot Mode may display locally available entity choices only after the MCP has resolved a verified jurisdiction adapter. It must not present U.S. forms such as LLC or corporation as globally universal choices.

The agent can compare owner-selected options and prepare documents. Filing remains a separate authenticated action with human approval and provider receipts.

## Tax

Tax identity and tax treatment are local adapter capabilities.

Examples such as EIN and S-corporation elections belong only to a verified U.S. adapter. Other jurisdictions expose their own identifiers, classifications, VAT/GST registrations, filing rules, and responsible-person requirements.

## Finance + Web3

Finance onboarding must support fiat, multi-currency, payment processors, exchanges, custodians, wallets, and chain infrastructure through provider adapters.

Bot Mode never receives raw bank credentials, unrestricted treasury keys, seed phrases, private keys, or signing secrets. It receives scoped capability handles and status receipts.

## Spawn architecture

```text
New Bot
  -> Hermes profile
  -> Agentropolis identity + mandate
  -> Business Kit bootstrap
      -> global jurisdiction resolver
      -> Agentic Mail OS
      -> entity adapters
      -> tax adapters
      -> finance adapters
      -> Web3 policy adapters
      -> compliance adapters
  -> readiness packet
  -> operator review
  -> bounded execution corridors
```

## Upstream constraint

The currently connected GitHub identity has pull access but no push access to `NousResearch/Hermes-Bot-Mode`. Until a writable wiredchaos fork or upstream contribution lane is available, the Bot Mode integration remains an adapter contract in the Agentropolis-owned repository.