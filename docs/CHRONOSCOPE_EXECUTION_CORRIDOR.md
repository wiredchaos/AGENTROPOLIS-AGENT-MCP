# CHRONOSCOPE Execution Corridor

## Status

Proposed authenticated production corridor. This document does not register state-changing tools in the current public read-only MCP surface.

## Purpose

The CHRONOSCOPE Execution Corridor is the governed MCP boundary for validating and dispatching approved agent-interaction, temporal-world, voice, render, assembly, and PBX production jobs.

The existing public MCP tools remain read-only. Expensive generation, publication, cancellation, provider access, and other state-changing actions require a separate authenticated corridor with explicit mandates, budgets, policies, and receipts.

## Capability zones

### Public planning and verification

Candidate bounded tools:

- `list_chronoscope_capabilities`
- `list_creator_asset_packs`
- `inspect_agent_visual_manifest`
- `preview_atg_interaction_graph`
- `estimate_media_job`
- `validate_scene_manifest`
- `get_render_job_status`
- `verify_media_receipt`

These tools must not generate or publish media.

### Authenticated execution

Candidate tools for a future separate corridor:

- `compile_atg_scene`
- `create_chronoscope_world`
- `render_agent_interaction`
- `generate_agent_dialogue_audio`
- `render_temporal_sequence`
- `assemble_agent_episode`
- `publish_to_pbx`
- `cancel_render_job`

Registration requires implementation, policy review, abuse analysis, cost controls, receipt schemas, and tests.

## Required execution envelope

```json
{
  "tool": "render_agent_interaction",
  "arguments": {
    "production_id": "prod_74c22",
    "scene_id": "scene_evidence_dispute_04",
    "creator_package": "creator_chronoscope_nexus_01@0.1.0",
    "render_level": "scene_clip",
    "duration_seconds": 12
  },
  "authority": {
    "mandate_id": "mandate_814",
    "requested_by": "hermes-city",
    "maximum_cost_usd": 3.5,
    "allowed_providers": ["approved-video-router"],
    "human_approval": "preapproved_under_threshold"
  },
  "policy": {
    "data_classification": "public",
    "likeness_status": "synthetic_registered_agent",
    "publication_allowed": false
  }
}
```

A raw prompt without production, identity, authority, budget, continuity, and receipt context is not a valid execution request.

## Validation order

```text
request authentication
  -> schema validation
  -> agent and package resolution
  -> mandate verification
  -> capability and scope check
  -> risk classification
  -> cost ceiling check
  -> rights and likeness check
  -> data policy check
  -> approval gate
  -> provider route
  -> execution
  -> artifact verification
  -> receipt persistence
  -> response
```

## Receipt requirements

Every accepted request receives a pending receipt before provider execution. Final receipts must record:

- request and production identifiers
- source ATG event references
- agent identities
- mandate and policy decision
- Creator package and continuity versions
- ASBE scene and shot contract hashes
- selected and substituted providers
- estimated and actual cost
- timestamps and status transitions
- produced artifact hashes and storage references
- review and publication state
- cancellation or partial-failure details

Secrets, bearer tokens, raw private prompts, and unnecessary personal data must not be stored.

## Security invariants

1. Authority is validated at runtime.
2. Public tools cannot cross into execution by parameter choice.
3. Provider credentials remain server-side.
4. Budgets are hard ceilings, not advisory prompt text.
5. Publishing is distinct from rendering.
6. A simulated or preview result cannot be marked executed.
7. Provider substitution requires policy and budget revalidation.
8. Every successful state change produces a persisted receipt.
9. Cancellation must be idempotent.
10. Human approval remains mandatory for public release.

## Recommended deployment split

```text
Public MCP Worker
  -> read-only planning and verification

Authenticated Production Worker
  -> render and assembly execution

Operator APIs
  -> receipts, review, cancellation, and incident response
```

The split prevents a public discovery surface from silently becoming a high-cost or publication-capable execution endpoint.

## Canonical line

> MCP is the production membrane. It does not decide the story, and it does not borrow authority from the prompt.
