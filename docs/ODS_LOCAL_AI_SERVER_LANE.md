# ODS Local AI Server Lane

**Status:** Optional infrastructure lane  
**External reference:** https://github.com/Osmantic/ODS  
**License posture:** Apache-2.0 upstream, verify on every pinned release  
**Agentropolis role:** Deployment target, not district, not brain, not unrestricted authority

ODS, the Osmantic Deployment System, is tracked as an optional local AI server lane for AGENTROPOLIS-AGENT-MCP.

The lane exists so operators can deploy a private AI stack on Windows, macOS, or Linux without hand-wiring every service one by one.

## Canon Lock

ODS is infrastructure.

It does not become:

- a new Agentropolis district
- a replacement for HERMES Dispatch
- a replacement for the MCP registry
- a replacement for policy gates
- a wallet execution authority
- a source of city law

It may host local tools, model services, workflows, search, RAG, image generation, and developer surfaces behind Agentropolis governance.

## Why It Matters

ODS aligns with the Agentropolis local-first doctrine because it packages a private AI server stack around:

- local model inference
- ChatGPT-style web UI through Open WebUI
- service dashboard and diagnostics
- voice support
- agents and workflow automation
- n8n workflows
- RAG and private search
- ComfyUI image generation
- privacy and operations tooling
- optional cloud or hybrid API mode when local hardware is not enough

For Agentropolis, this makes ODS a useful bootstrap appliance for operators who do not yet have dedicated server hardware.

## MCP Routing Position

```text
Operator intent
  -> HERMES Dispatch
  -> AGENTROPOLIS-AGENT-MCP
  -> policy gate
  -> model lane selection
  -> ODS local AI server lane when approved
  -> tool or workflow execution
  -> validation
  -> receipt log
```

The MCP kit treats ODS as a service host. It does not grant ODS unrestricted tool authority.

## Allowed Early Uses

Initial allowed uses:

- local model testing
- private document RAG
- Open WebUI operator chat
- local image generation experiments
- n8n workflow prototypes
- local agent sandboxing
- backend comparison against cloud providers
- creator workstation support
- governed coding-assistant experiments

## Restricted Uses

ODS must not be used for these lanes without additional approval gates:

- wallet actions
- settlement actions
- production client data processing
- autonomous outreach
- credential handling beyond local operator secrets
- irreversible file deletion
- production repository writes
- tax, legal, medical, or financial execution without human review

## Governance Defaults

Default promotion state:

```text
lane: ODS_LOCAL_AI_SERVER
status: CANDIDATE
execution: READ_ONLY + DRAFT_ONLY
network: LOCAL_FIRST
wallet_authority: NONE
repo_write_authority: NONE_BY_DEFAULT
requires_receipts: true
requires_operator_review: true
```

Promotion requires:

1. pinned ODS release or audited commit
2. successful install receipt
3. service health receipt
4. model selection receipt
5. port and secret review
6. test workflow receipt
7. rollback path

## Deployment Targets Table

| Target | Role | Notes |
|---|---|---|
| Docker | baseline container path | Still valid for direct service deployment |
| ODS | recommended local AI appliance candidate | Best for workstation or homelab bootstrap |
| Kubernetes | scale path | Later production cluster route |
| Bare metal | sovereign hardware path | Requires stronger ops discipline |
| Cloud | elastic overflow | Must remain policy-gated |

## Integration Notes

ODS should be documented as a recommended optional path when the user asks:

- Do I need hardware?
- What do I use before I build a server?
- How do I self-host Agentropolis agents?
- How do I run local models, RAG, workflows, and ComfyUI without stitching everything manually?

Answer:

```text
Start workstation-first with ODS.
Scale to dedicated hardware later.
Keep Agentropolis governance above the stack.
```

## Anti-Moloch Rule

Local does not automatically mean safe.

A local AI server still needs boundaries, receipts, policy gates, and human review. ODS reduces dependency on centralized AI infrastructure, but Agentropolis still owns authority, routing, and governance.
