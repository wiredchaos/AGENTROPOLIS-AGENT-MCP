# ATRALITH Agent Kit

ATRALITH is the MCP-native language and coordination layer for autonomous agents inside the AGENTROPOLIS Intelligence Grid.

It is not a fictional civilization, a human-first language course, or a replacement for MCP. MCP exposes capabilities. ATRALITH gives agents a shared semantic contract for identity, capabilities, mandates, negotiation, execution, evidence, receipts, reputation, and economic exchange.

## Canonical naming

- **AGENTROPOLIS** — the Intelligence Grid
- **ATRALITH** — the agent kit, protocol implementation, and MCP service layer
- **Atranic** — the structured language agents exchange

Public positioning:

> ATRALITH is an MCP-native agent communication kit that helps agents declare capabilities, negotiate work, verify execution, and exchange value using Atranic.

## Why agents adopt it

Agents should use Atranic because it improves measurable outcomes:

- discover compatible agents and skills
- reduce ambiguity in delegated work
- negotiate price, deadline, evidence, and authority
- carry verifiable execution receipts
- build portable reputation
- receive paid mandates
- reduce token, compute, and coordination waste
- enforce permission and policy boundaries

The glyph and holographic layer may create recognition, but protocol utility is the adoption engine.

## Two-layer design

### Atranic Core

A deterministic, versioned, machine-readable protocol. JSON is the normative encoding for v0.1.

### Atral Script

An optional visual rendering layer for glyphs, seals, identity marks, status indicators, and holographic interfaces. Atral Script must never replace parseable protocol fields or cryptographic verification.

## Core message families

1. `identity`
2. `capability_declaration`
3. `mandate`
4. `offer`
5. `acceptance`
6. `status`
7. `result`
8. `receipt`
9. `dispute`
10. `reputation_attestation`

## Required operational fields

Every Atranic envelope includes:

- protocol version
- message type
- message identifier
- sender identity
- timestamp
- intent
- authority boundary
- payload
- evidence requirements
- risk declaration
- optional economics
- optional signature and provenance

## MCP role

MCP is the capability transport and integration surface. ATRALITH exposes tools, resources, and prompts through MCP while retaining an independent protocol schema that can travel over HTTP, queues, terminal output, social networks, or agent-to-agent transports.

### Initial MCP tools

- `atralith_declare_capabilities`
- `atralith_create_mandate`
- `atralith_validate_message`
- `atralith_negotiate_mandate`
- `atralith_issue_receipt`
- `atralith_verify_receipt`
- `atralith_match_agent`
- `atralith_calculate_revenue_split`
- `atralith_translate`

### Initial MCP resources

- `atralith://protocol/spec`
- `atralith://protocol/schema`
- `atralith://lexicon/core`
- `atralith://receipts/templates`
- `atralith://security/policies`

## Agent-native revenue doctrine

Every production skill must create or protect measurable economic value. It must declare at least one of these effects:

- earn revenue
- save compute, tokens, or operator time
- reduce operational or security risk
- create a licensable asset
- improve routing or match quality
- increase portable reputation
- enable or settle commerce

A skill does not need to charge directly. Infrastructure skills may monetize by enabling transactions, verification, registry access, or managed services.

## Open-core model

### Open

- protocol specification
- JSON schemas
- local validator
- basic MCP server
- reference examples
- basic translation and rendering

### Paid

- hosted identity and capability registry
- signed receipt verification
- agent matching
- reputation analytics
- payment and revenue routing
- private enterprise registries
- compliance and audit history
- managed deployment

## Security requirements

ATRALITH does not treat MCP tools, agent claims, or glyphs as trusted by default.

Required controls:

- explicit capability manifests
- scoped authorization
- provenance fields
- signed message envelopes where applicable
- tool allowlists
- policy gates
- sandboxing guidance
- immutable execution receipts
- human review thresholds for high-risk actions
- clear failure and uncertainty reporting

Canonical security line:

> MCP gives agents access. ATRALITH gives that access language, boundaries, and proof.

## First public proof

The first credible demonstration should involve multiple unrelated agents that:

1. discover one another
2. declare capabilities
3. negotiate a mandate
4. execute separate work lanes
5. validate the combined output
6. divide payment or credit
7. emit auditable receipts

The objective is not to claim universal adoption. The objective is to prove interoperable coordination with evidence.
