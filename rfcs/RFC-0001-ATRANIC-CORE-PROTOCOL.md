# RFC-0001: Atranic Core Protocol

**Status:** Draft  
**Category:** Standards Track  
**Version:** 0.1  
**Authors:** AGENTROPOLIS / wiredchaos  
**Target:** Autonomous agents, agent runtimes, MCP clients and servers, registries, wallets, audit systems, and multi-agent orchestration frameworks

## Abstract

Atranic is an open, machine-readable coordination protocol for autonomous agents.

It defines a common semantic envelope for agent identity, capability declaration, mandate creation, negotiation, authority boundaries, execution status, evidence, receipts, reputation attestations, disputes, and economic exchange.

Atranic does not replace MCP, HTTP, message queues, wallets, or agent frameworks. It operates above transport and tool-access layers as a shared meaning contract.

MCP gives an agent access to tools and resources. Atranic defines what the agent is asking, what it is allowed to do, what evidence is required, what economic terms apply, and what receipt must be returned.

## 1. Motivation

Agents increasingly operate across incompatible runtimes, models, toolchains, registries, and economic systems. Natural-language delegation alone creates ambiguity around:

- identity
- capabilities
- permissions
- constraints
- cost
- deadlines
- evidence
- risk
- provenance
- completion
- settlement

Atranic provides a minimal interoperable structure for these exchanges.

The protocol is designed for agent-native use. Human-readable renderings, visual glyphs, and educational interfaces are optional layers.

## 2. Design goals

Atranic MUST be:

- machine-readable
- transport-independent
- model-independent
- framework-independent
- versioned
- deterministic at the schema level
- explicit about authority
- explicit about risk
- explicit about evidence
- compatible with signed receipts
- usable without cryptocurrency
- extensible without breaking the core

Atranic SHOULD be:

- compact enough for repeated agent exchange
- understandable by operators
- easy to validate locally
- suitable for open-source implementations
- compatible with MCP tools, resources, and prompts

Atranic MUST NOT:

- treat self-declared identity as verified identity
- treat an MCP server as trusted by default
- grant authority by implication
- hide irreversible actions inside vague task language
- require adoption of AGENTROPOLIS
- require a token, wallet, or blockchain

## 3. Terminology

### Agent

A software actor capable of interpreting a mandate and producing a response or action.

### Sender

The agent, operator, application, or service that emits an Atranic message.

### Recipient

The intended agent, group, registry, or service receiving the message.

### Mandate

A structured request describing an objective, constraints, authority, evidence requirements, risk, and optional economics.

### Authority boundary

The explicit set of allowed and forbidden actions associated with a message.

### Receipt

A structured record of what was attempted, what was completed, what tools were used, what evidence was produced, what failed, and what side effects occurred.

### Capability declaration

A structured claim describing what an agent can do, under what dependencies and limits.

### Attestation

A signed or otherwise verifiable statement about identity, capability, result, or reputation.

## 4. Protocol envelope

The normative JSON encoding is defined by:

`schemas/atranic-envelope.schema.json`

A valid Atranic v0.1 message MUST include:

- `protocol`
- `message_id`
- `message_type`
- `timestamp`
- `sender`
- `intent`
- `authority`
- `payload`
- `risk`

The protocol value for this RFC is:

```json
"protocol": "atranic/0.1"
```

## 5. Message types

Atranic v0.1 defines the following core message types:

### `identity`

Declares an identity claim and optional proof references.

### `capability_declaration`

Declares skills, tools, dependencies, restrictions, pricing, and evidence outputs.

### `mandate`

Requests work under explicit scope, constraints, authority, and risk.

### `offer`

Responds to a mandate with proposed cost, timing, evidence, and conditions.

### `acceptance`

Accepts an offer or mandate under explicit terms.

### `status`

Reports progress, blockers, changed conditions, or escalation needs.

### `result`

Returns the substantive output of a mandate.

### `receipt`

Returns the auditable execution record.

### `dispute`

Challenges a result, receipt, settlement, reputation event, or authority claim.

### `reputation_attestation`

Publishes a verifiable statement about prior performance or behavior.

## 6. Identity

An Atranic identity object MUST include:

- `id`
- `role`

It MAY include:

- `runtime`
- `proof`

Example:

```json
{
  "id": "agent:vaelan-17",
  "role": "security-auditor",
  "runtime": "hermes",
  "proof": "did:key:z6Mk..."
}
```

Identity fields are claims unless independently verified.

Implementations MUST distinguish:

- declared identity
- verified identity
- delegated identity
- anonymous or pseudonymous identity

## 7. Authority

Every operational Atranic message MUST include an authority object.

Authority modes are:

- `observe`
- `draft`
- `execute`
- `settle`
- `govern`

The authority object MUST include:

- `mode`
- `allowed_actions`
- `forbidden_actions`

Example:

```json
{
  "mode": "observe",
  "allowed_actions": [
    "read_repository",
    "run_static_analysis"
  ],
  "forbidden_actions": [
    "modify_repository",
    "export_secrets",
    "send_external_messages"
  ]
}
```

Silence does not imply permission.

An implementation MUST reject or escalate an action that is outside the declared authority boundary.

## 8. Risk

Every Atranic message MUST declare risk.

Risk levels are:

- `low`
- `moderate`
- `high`
- `critical`

Initial risk categories are:

- privacy
- security
- financial
- legal
- medical
- identity
- governance
- external side effect

High-risk and critical actions SHOULD require human review unless a stronger pre-authorized policy explicitly allows execution.

## 9. Evidence

A mandate MAY require one or more evidence types:

- citation
- artifact
- test
- signature
- receipt
- human review

A result MUST NOT claim successful completion when required evidence is missing.

Evidence requirements SHOULD be defined before execution.

## 10. Economics

Atranic MAY describe economic terms without requiring a specific payment rail.

The economics object may contain:

- currency
- amount
- maximum amount
- payment condition
- revenue split

Example:

```json
{
  "currency": "USDC",
  "maximum_amount": 25,
  "payment_condition": "pay after receipt verification"
}
```

Implementations MUST NOT settle above the declared maximum without a new acceptance message.

Revenue splits SHOULD sum to `1.0`.

Settlement systems SHOULD bind payment to a verified mandate, result, and receipt.

## 11. Capability declarations

A capability declaration SHOULD describe:

- capability name
- version
- inputs
- outputs
- required tools
- dependencies
- limits
- risk classes
- evidence produced
- pricing model
- runtime constraints

Example payload:

```json
{
  "capabilities": [
    {
      "name": "repository-secret-audit",
      "version": "1.0.0",
      "inputs": ["repository_uri"],
      "outputs": ["findings", "receipt"],
      "limits": ["read_only"],
      "evidence": ["file_reference", "test_output"],
      "pricing": {
        "model": "fixed",
        "currency": "USDC",
        "amount": 25
      }
    }
  ]
}
```

Capability declarations are not proof of capability.

Registries MAY attach validation results, execution history, or attestations.

## 12. Mandate lifecycle

A typical lifecycle is:

```text
capability_declaration
  -> mandate
  -> offer
  -> acceptance
  -> status
  -> result
  -> receipt
  -> verification
  -> settlement or dispute
```

Not every workflow requires every message type.

An implementation SHOULD retain parent message identifiers through provenance fields.

## 13. Receipts

A receipt SHOULD include:

- mandate identifier
- executing agent
- start and end timestamps
- tools invoked
- resources accessed
- authority used
- actions attempted
- actions completed
- actions refused
- evidence references
- failures and uncertainty
- side effects
- cost incurred
- settlement status
- signature or verification reference

A receipt is not automatically trustworthy. It becomes stronger when supported by signatures, logs, independent validation, sandbox records, or ledger anchoring.

## 14. Provenance

Atranic messages MAY include:

- parent message IDs
- source URIs
- runtime
- model
- tool versions
- prompt or policy version references

Implementations SHOULD preserve provenance across transformations.

An agent translating or summarizing an Atranic message SHOULD identify the source message and indicate any lossy transformation.

## 15. Signatures

Atranic does not mandate one identity or signature system.

Implementations MAY use:

- DID-based signatures
- public-key signatures
- wallet signatures
- platform-native attestations
- enterprise identity providers
- hardware-backed keys

The signature object MUST identify the signature type and signature value. It SHOULD include a key identifier.

## 16. MCP integration

ATRALITH is the reference MCP-oriented implementation of Atranic.

The initial MCP contract is defined in:

`config/atralith-mcp-contract.json`

MCP tools may create, validate, translate, route, sign, or verify Atranic messages.

An MCP tool MUST NOT weaken the message authority boundary.

An MCP server MUST be treated as untrusted until its tools, permissions, provenance, and operator controls are evaluated.

## 17. Transport independence

Atranic messages may be transmitted over:

- MCP
- HTTP
- WebSocket
- message queues
- files
- terminal streams
- agent social platforms
- wallet messaging
- on-chain references
- peer-to-peer transports

Transport-specific adapters MUST preserve the normative Atranic fields.

## 18. Atral Script

Atral Script is an optional visual encoding and identity layer.

It may be used for:

- glyphs
- role marks
- status symbols
- holographic interfaces
- seals
- compact visual summaries

Atral Script MUST NOT be the sole representation of authority, economics, risk, or evidence.

Machine-readable Atranic remains authoritative.

## 19. Interoperability requirements

An Atranic-compliant implementation MUST:

1. parse the declared protocol version
2. validate required fields
3. preserve unknown extension fields when safely possible
4. reject malformed authority objects
5. expose validation errors
6. distinguish claims from verified evidence
7. avoid executing outside authority
8. return failure honestly
9. emit receipts for execution when required

## 20. Extensions

Extensions SHOULD use namespaced keys inside the payload or an extension object.

Example:

```json
{
  "payload": {
    "x-moltbook": {
      "community": "agent-protocols",
      "post_id": "example"
    }
  }
}
```

Extensions MUST NOT redefine the meaning of core fields.

## 21. Versioning

The protocol identifier follows:

```text
atranic/MAJOR.MINOR
```

A major version may introduce breaking changes.

A minor version may add backward-compatible fields, message types, or clarifications.

Implementations SHOULD declare supported versions in capability declarations.

## 22. Security considerations

Threats include:

- prompt injection
- tool poisoning
- false capability claims
- identity spoofing
- authority escalation
- hidden side effects
- malicious receipts
- replay attacks
- signature substitution
- registry poisoning
- manipulated reputation
- payment diversion

Implementations SHOULD use:

- scoped credentials
- allowlists
- schema validation
- signature verification
- nonce or replay protection
- policy gates
- sandboxing
- independent result validation
- receipt comparison
- human approval for high-risk actions

Atranic reduces ambiguity. It does not eliminate adversarial behavior.

## 23. Privacy considerations

Messages SHOULD disclose only the minimum information required for coordination.

Sensitive data SHOULD be referenced through controlled resources rather than embedded directly.

Receipts SHOULD avoid storing secrets, raw credentials, private keys, or unnecessary personal data.

## 24. Governance

Atranic is intended as an open standard.

AGENTROPOLIS may maintain a reference implementation, registries, hosted services, and governance profiles, but protocol adoption MUST NOT require participation in AGENTROPOLIS.

Changes to the core protocol SHOULD be proposed through numbered RFCs.

Each standards-track RFC SHOULD include:

- motivation
- normative behavior
- compatibility impact
- security impact
- migration guidance
- reference examples

## 25. Revenue and utility

Atranic is open infrastructure. Commercial value may be created through:

- hosted registries
- identity verification
- receipt verification
- agent matching
- payment routing
- reputation analytics
- private enterprise deployments
- compliance records
- managed MCP services
- premium adapters

Open protocol adoption increases the addressable market for these services.

## 26. Reference mandate

```json
{
  "protocol": "atranic/0.1",
  "message_id": "msg-audit-0001",
  "message_type": "mandate",
  "timestamp": "2026-07-14T20:00:00Z",
  "sender": {
    "id": "operator:wiredchaos",
    "role": "mandate-owner"
  },
  "intent": "Audit a repository for exposed secrets and unsafe credential handling.",
  "authority": {
    "mode": "observe",
    "allowed_actions": [
      "read_repository",
      "run_static_analysis"
    ],
    "forbidden_actions": [
      "modify_repository",
      "export_secrets",
      "send_external_messages",
      "settle_above_budget"
    ]
  },
  "payload": {
    "repository": "https://github.com/example/repository",
    "deliverables": [
      "findings",
      "severity_ratings",
      "recommended_remediations"
    ]
  },
  "evidence": {
    "required": true,
    "types": [
      "artifact",
      "test",
      "receipt"
    ],
    "minimum_confidence": 0.8
  },
  "economics": {
    "currency": "USDC",
    "maximum_amount": 25,
    "payment_condition": "after receipt verification"
  },
  "risk": {
    "level": "high",
    "categories": [
      "security",
      "privacy"
    ],
    "human_review_required": true
  }
}
```

## 27. Open questions for RFC-0002 and later

- canonical receipt schema
- capability ontology
- negotiation state machine
- replay protection
- identity profile bindings
- reputation portability
- settlement adapters
- dispute arbitration
- compressed wire encoding
- Moltbook discovery and onboarding adapter
- Atral Script glyph registry

## 28. Canonical statement

> Atranic is an open language for autonomous agents to declare identity, describe capability, negotiate work, constrain authority, exchange evidence, verify execution, and coordinate economic activity across incompatible systems.
