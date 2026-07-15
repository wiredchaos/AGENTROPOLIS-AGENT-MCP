# ATG and ATRALITH Integration

## Canonical architecture

- **AGENTROPOLIS-ATG** is the open Agent Transaction Grammar standard.
- **Atranic** is the semantic language carried by ATG messages.
- **ATRALITH** is the official reference Agent Kit and MCP implementation.
- **AGENTROPOLIS-AGENT-MCP** is the governed execution environment that adopts ATRALITH and ATG.

> ATG tells agents how to communicate. ATRALITH gives them the software to do it. AGENTROPOLIS governs where and how execution occurs.

## Dependency direction

```text
AGENTROPOLIS-ATG
  protocol + RFCs + schemas
          ↓ implemented by
ATRALITH Agent Kit
  MCP server + SDKs + validators + adapters
          ↓ governed by
AGENTROPOLIS-AGENT-MCP
  routing + policy + tools + execution + receipts
```

ATG must remain usable without AGENTROPOLIS. ATRALITH must conform to ATG. The AGENTROPOLIS MCP kit may extend behavior through policy profiles, but it must not silently redefine core ATG fields.

## MCP execution flow

```text
human or agent intent
  -> ATRALITH mandate builder
  -> ATG schema validation
  -> Atranic semantic envelope
  -> AGENTROPOLIS authority and risk gate
  -> model and tool routing
  -> sandboxed execution
  -> validation
  -> ATG receipt
  -> reputation and optional settlement
```

## Required MCP capabilities

The reference integration should expose:

- `atralith_declare_capabilities`
- `atralith_create_mandate`
- `atralith_validate_message`
- `atralith_negotiate_mandate`
- `atralith_issue_receipt`
- `atralith_verify_receipt`
- `atralith_match_agent`
- `atralith_calculate_revenue_split`
- `atralith_translate`

## Governance locks

1. MCP transport does not imply trust.
2. Atranic glyphs do not replace machine-readable fields.
3. Agent self-description is a claim, not verified identity.
4. Authority must be explicit and scoped.
5. High-risk actions require policy approval and, where defined, human review.
6. Execution must emit an honest receipt when one is required.
7. Payment and reputation updates must bind to verified results.

## Repository responsibilities

### `AGENTROPOLIS-ATG`

Owns standards, RFCs, schemas, semantic definitions, glyph mappings, and compatibility requirements.

### ATRALITH

Owns the reference MCP server, SDKs, validators, mandate builder, receipt engine, adapters, and developer tooling.

### `AGENTROPOLIS-AGENT-MCP`

Owns governed routing, capability lanes, policy enforcement, execution controls, audit integration, and deployment profiles.

## Drift control

When the ATG schema changes:

1. record the new protocol version;
2. update ATRALITH validators and examples;
3. update this MCP kit's contract and policy mappings;
4. run compatibility tests;
5. preserve support for older versions where feasible;
6. document migration and security impact.

Canonical standard repository:

`https://github.com/wiredchaos/AGENTROPOLIS-ATG`
