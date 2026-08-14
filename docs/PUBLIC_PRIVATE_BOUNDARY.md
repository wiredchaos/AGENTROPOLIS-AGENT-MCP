# AGENTROPOLIS Public / Private Boundary

Status: Canonical public interface doctrine

## Core rule

**Public interface. Private Intelligence Grid. Governed execution.**

AGENTROPOLIS deliberately separates interoperability from implementation.

The public repositories expose only the contracts, schemas, SDK surfaces, read-only capability discovery, safe integration guidance, and other artifacts intentionally designated for external use. Public availability of a capability definition never grants execution authority.

## Public surfaces

### HERMES CITY

HERMES CITY is a public-facing civic, coordination, discovery, demonstration, and signal surface.

### AGENTROPOLIS Agent Kit / Agent MCP

The Agent Kit is the public integration membrane for developers, agents, and compatible runtimes. It may expose:

- public-safe MCP contracts
- SDK and adapter interfaces
- interoperability schemas
- capability discovery
- read-only architecture manifests
- public standards and protocol specifications
- examples that do not disclose proprietary implementation logic

## Private-by-default surfaces

Unless explicitly designated public, AGENTROPOLIS implementation assets remain private. This includes, without limitation:

- Intelligence Grid runtime internals
- orchestration, swarm, dispatch, and routing implementation
- proprietary memory and retrieval implementation
- business formation and jurisdiction execution logic
- provider-selection and provider-routing logic
- treasury and financial execution systems
- banking, card, ACH, wire, and settlement adapters
- Base, Solana, XRPL, XMR, and other production settlement adapters
- wallet custody, signing, signer policy, and key-management implementation
- risk, fraud, compliance, sanctions, and private scoring systems
- Utility Grid pricing, metering, billing, allocation, and settlement implementation
- production accounting and reconciliation logic
- private registries, datasets, benchmarks, and operational intelligence
- production deployment topology where disclosure would expand attack surface
- secrets, credentials, keys, tokens, tax identifiers, banking identifiers, and private configuration

## Authority boundary

The public Agent Kit describes what a compatible capability looks like. Private AGENTROPOLIS infrastructure decides whether a capability may execute.

```text
HERMES CITY / external clients
        |
        v
AGENTROPOLIS AGENT KIT
public contracts + schemas + read-only discovery
        |
        v
authenticated capability boundary
        |
        v
AGENTROPOLIS PRIVATE INTELLIGENCE GRID
runtime + policy + orchestration + private adapters
        |
        v
governed execution
        |
        v
receipt + audit + revocation
```

## Security invariants

- Public code must never contain raw production credentials or private keys.
- Agents receive scoped capability handles rather than unrestricted secrets.
- Public schemas do not imply public execution authority.
- High-impact and regulated actions remain behind authenticated policy gates and human approval where required.
- Private implementation details are not copied into public examples merely to make an integration easier to understand.
- Provider adapters may have public interface contracts while their production configuration, selection logic, credentials, and operational routing remain private.
- New AGENTROPOLIS work defaults to private unless a public-release decision is explicit.

## Repository decision test

Before adding an artifact to a public repository, ask:

1. Is this required for interoperability, installation, integration, verification, or a deliberately public standard?
2. Can it be published without disclosing proprietary execution logic, privileged operational data, sensitive provider configuration, or meaningful attack-surface detail?
3. Does publication preserve the rule that authority remains inside the private Intelligence Grid?

If any answer is no, the artifact belongs in private AGENTROPOLIS infrastructure.

## Commercial doctrine

AGENTROPOLIS should be easy to integrate with without being easy to clone.

The public layer explains the socket. The private layer owns the engine.
