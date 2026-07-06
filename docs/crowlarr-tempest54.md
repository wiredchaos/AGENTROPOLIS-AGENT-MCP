# CROWLARR + TEMPEST54

## Status

Canonical integration note for AGENTROPOLIS-AGENT-MCP.

This document locks the safe architecture pattern inspired by two external systems:

- Prowlarr: a single indexer manager that configures many downstream media automation apps.
- T3MP3ST: an autonomous security-operator dashboard for authorized red-team labs and benchmark ranges.

AGENTROPOLIS does not copy the piracy or unrestricted offensive positioning. It keeps the useful architecture pattern and applies it to agents, MCP servers, tools, policies, benchmarks, and defensive security labs.

## Doctrine lock

> CROWLARR indexes the tools. TEMPEST54 deploys the operatives. Evidence Vault preserves the receipts.

## CROWLARR

CROWLARR is the Agentropolis indexer manager.

It is the unified registry for:

- MCP servers
- APIs
- tools
- models
- prompt packs
- agent profiles
- workflow presets
- repo integrations
- benchmark suites
- policy gates
- health checks

Core rule:

> Add it once. Route it everywhere.

CROWLARR prevents the same MCP server, API key, tool definition, model profile, prompt pack, or repo adapter from being manually duplicated across every Agentropolis surface.

## TEMPEST54

TEMPEST54 is the authorized security swarm layer.

It is not positioned as a public hackbot. It is scoped to:

- CTF range automation
- internal code audits
- OWASP training
- smart contract test labs
- repo hardening
- defensive validation
- benchmark arena testing
- compliance-friendly reporting

Core rule:

> Authorized targets only. Written scope first. Evidence always.

TEMPEST54 may model specialist roles, but the AGENTROPOLIS version must keep hard permission boundaries and audit trails.

## AGENT-MCP responsibilities

AGENTROPOLIS-AGENT-MCP is the primary home for this pattern.

It owns:

1. Registry schema for agents, MCP servers, tools, and policies.
2. Tool routing between agents and downstream systems.
3. Permission and scope enforcement before execution.
4. MCP-compatible service discovery.
5. Health checks and usage telemetry.
6. Evidence Vault event emission.
7. Benchmark adapter definitions.

## Service categories

Suggested registry categories:

- `agent`
- `mcp_server`
- `api`
- `model`
- `prompt_pack`
- `workflow`
- `benchmark`
- `repo_adapter`
- `security_lab`
- `policy_gate`
- `evidence_sink`

## Minimal registry object

```json
{
  "id": "tempest54.security_recon",
  "name": "Security Recon",
  "category": "security_lab",
  "scope": "authorized_only",
  "allowed_targets": ["ctf", "owned_repo", "internal_lab"],
  "requires_human_approval": true,
  "evidence_required": true,
  "routes_to": ["HERMES-CITY", "Evidence Vault", "Config Library"],
  "status": "planned"
}
```

## Safety gates

No TEMPEST54 workflow is valid unless it includes:

- target ownership or written permission
- explicit scope
- rate limits
- no persistence on real systems
- no credential harvesting
- no stealth or evasion against third-party systems
- evidence logging
- human approval for high-risk tools
- clean teardown instructions

## Dashboard mapping

| T3MP3ST pattern | AGENTROPOLIS mapping |
| --- | --- |
| Operatives | specialist agents |
| Arsenal | tool registry |
| Evidence Vault | receipts, logs, reports |
| Config Library | prompts, params, policies |
| War Room | HERMES-CITY command surface |
| Benchmarks | OBSIDIVM / CTF / audit ranges |
| Op Admiral | mission coordinator |

## Product language

Use this public positioning:

> TEMPEST54 is an authorized security lab and benchmark swarm for internal hardening, CTF training, and compliance-ready evidence capture.

Avoid public positioning that implies unauthorized hacking, stealth, exploitation of third-party targets, or unrestricted offensive automation.

## Next build steps

1. Define `registry.schema.json` for CROWLARR.
2. Add policy-gated tool categories.
3. Build read-only MCP discovery first.
4. Add Evidence Vault event emission.
5. Add CTF-only TEMPEST54 pilot workflows.
6. Keep exploit tooling behind human approval and documented scope.
