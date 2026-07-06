# T3MP3ST Authorized Red Team MCP Lane

## Canon lock

T3MP3ST is treated as an optional authorized security testing lane for Agentropolis.

It is not the brain.
It is not root authority.
It is not a permission bypass.
It is a governed offensive security harness that can be routed through MCP when scope, ownership, and authorization are verified.

## Verified repository

```text
Repository: d-ufrik/T3MP3ST
URL: https://github.com/d-ufrik/T3MP3ST
Visibility: public
Default branch: main
License stated in README: AGPL-3.0
Role: multi-agent offensive-security framework
```

Fork-specific signal from `d-ufrik/T3MP3ST`:

- local OpenAI-compatible inference through a `custom` provider
- NVIDIA NIM provider support
- live provider `/models` discovery instead of hardcoded model lists
- routing fix so selected provider actually drives missions, Admiral, and chat
- active backbone visibility showing `provider · model`
- docs for local models, routing fix, and deployment

## Placement

```text
AGENTROPOLIS-AGENT-MCP
  -> governed MCP routing membrane
  -> security tool lanes
  -> authorized red team workflows
  -> validation
  -> receipt logs
```

T3MP3ST belongs in the security tool lane beside source audit, dependency audit, static analysis, cyber range, and remediation agents.

## Allowed uses

- Authorized penetration testing
- Internal app and API security review
- Source code audit on repositories the operator controls
- CTFs, wargames, and challenge ranges
- Vulnerability reproduction inside a legal lab
- Security report generation
- Patch recommendation and validation

## Blocked uses

- Unauthorized targets
- Credential theft
- Real-world persistence
- Real-world exfiltration
- Covert C2
- Rate-limit abuse
- Targeting third-party infrastructure without written permission
- Any workflow that cannot produce a scope receipt

## MCP execution pattern

```text
Operator intent
  -> HERMES Dispatch
  -> classify as security task
  -> require authorization scope
  -> MCP Registry checks T3MP3ST lane availability
  -> Policy Gate approves or denies
  -> Scope Contract creates target allowlist
  -> T3MP3ST runs only inside approved boundaries
  -> findings verified by tool output
  -> Patch Agent proposes fix
  -> Validation reruns checks
  -> Receipt log records evidence
```

## Required scope contract

Every T3MP3ST run must have:

- target owner
- written authorization or internal ownership proof
- target allowlist
- test window
- excluded assets
- allowed techniques
- forbidden techniques
- data handling rule
- report destination
- stop condition

No scope contract, no run.

## Human approval gates

Human approval is required before any lane involving:

- exploit execution against live services
- destructive testing
- password attack tooling
- post-exploitation frameworks
- lateral movement simulation
- persistence simulation
- production traffic volume above normal user behavior

## Agent roles

```text
Security Dispatcher
  -> classifies request and risk

Scope Verifier
  -> confirms ownership and target boundaries

T3MP3ST Operator
  -> performs approved testing inside the harness

Patch Agent
  -> creates remediation candidate

Blue Team Reviewer
  -> validates impact and fix

Receipt Scribe
  -> logs evidence, scope, tool output, and final decision
```

## Reporting format

Each finding should return:

```text
finding_id:
severity:
affected_asset:
evidence_summary:
reproduction_scope:
impact:
recommended_fix:
validation_status:
receipt_id:
```

Do not store secrets, tokens, private keys, client data, or raw sensitive payloads in reports.

## Integration status

Status: verified repository, governed build candidate.

The repository exists and is public. Do not mark the lane production-live inside Agentropolis until the install path, sandbox strategy, allowed tool list, MCP wrapper, legal authorization workflow, and receipt logging are implemented in Agentropolis-controlled code.

## License note

The repository README states AGPL-3.0. Preserve upstream license obligations if code is copied, modified, hosted, wrapped, or offered as a network service.

## Doctrine

Security agents need a leash.
Red team lanes need receipts.
Autonomy stops where authorization stops.
