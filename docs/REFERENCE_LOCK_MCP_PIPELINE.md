# Reference Lock MCP Pipeline

## Purpose

This document defines how AGENTROPOLIS-AGENT-MCP should treat reference-locked character, prop, environment, and shot packs produced by AGENTROPOLIS-CREATOR.

The MCP kit does not generate canon by itself.

It exposes controlled lanes for tools to read, validate, route, and log reference-lock packages.

```text
Creator package
  -> MCP intake
  -> schema validation
  -> risk classification
  -> tool authority check
  -> generation or review action
  -> output validation
  -> receipt log
```

## Package Types

| Package Type | Description |
| --- | --- |
| `character_sheet` | Locked identity, costume, face, expression, movement, voice profile |
| `prop_sheet` | Locked object scale, material, state, held views, impact states |
| `environment_sheet` | Locked district layout, lighting, weather, camera zones, staging rules |
| `shot_prompt_pack` | Locked prompt, shot list, camera behavior, audio rules, text rules |
| `continuity_report` | Drift findings, pass/fail status, remediation notes |
| `handoff_manifest` | Approved downstream targets and package permissions |

## Minimum Package Manifest

```json
{
  "package_id": "construction-district-reference-lock-demo",
  "package_type": "shot_prompt_pack",
  "source_repo": "wiredchaos/AGENTROPOLIS-CREATOR",
  "district": "Construction District",
  "status": "candidate",
  "version": "0.1.0",
  "created_by": "AGENTROPOLIS-CREATOR",
  "approved_by": null,
  "references": {
    "characters": [
      "construction_foreman_agent",
      "chaos_builder_agent"
    ],
    "props": [
      "prototype_model_pack",
      "blueprint_tube"
    ],
    "environment": "construction_district_intersection"
  },
  "rights": {
    "license_review": "required",
    "provenance_review": "required",
    "external_brand_check": "required"
  },
  "risk": {
    "wallet_capable": false,
    "financial_action": false,
    "public_release_candidate": true,
    "requires_human_review": true
  },
  "handoff_targets": [
    "agentropolis",
    "HERMES-CITY"
  ]
}
```

## MCP Tool Lane Pattern

Reference-lock packages should move through the standard model council and MCP control pattern.

```text
MCP request
  -> classify package type
  -> score risk
  -> select model lane
  -> check tool authority
  -> execute read/generate/validate action
  -> validate output
  -> log receipt
```

## Suggested Tool Interfaces

### `reference_lock.validate_manifest`

Validates required manifest fields.

Input:

```json
{
  "manifest_path": "references/packages/construction-district-reference-lock-demo/manifest.json"
}
```

Output:

```json
{
  "ok": true,
  "missing_fields": [],
  "warnings": [],
  "receipt_id": "ref-lock-validate-0001"
}
```

### `reference_lock.check_continuity`

Checks whether generated outputs match the locked references.

Input:

```json
{
  "package_id": "construction-district-reference-lock-demo",
  "checks": [
    "character_face_lock",
    "costume_lock",
    "prop_lock",
    "environment_lock",
    "weather_lock",
    "staging_lock",
    "text_absence",
    "brand_bleed"
  ]
}
```

Output:

```json
{
  "ok": false,
  "failures": [
    {
      "check": "staging_lock",
      "finding": "character crossed into no-go middle street zone",
      "severity": "major"
    }
  ],
  "receipt_id": "ref-lock-continuity-0002"
}
```

### `reference_lock.create_handoff_manifest`

Creates a handoff manifest for downstream repos after review.

Input:

```json
{
  "package_id": "construction-district-reference-lock-demo",
  "source_repo": "wiredchaos/AGENTROPOLIS-CREATOR",
  "target_repo": "wiredchaos/agentropolis",
  "status": "approved_candidate",
  "reviewer": "human_operator"
}
```

Output:

```json
{
  "ok": true,
  "handoff_manifest_id": "handoff-construction-district-0001",
  "receipt_id": "ref-lock-handoff-0003"
}
```

## Continuity Checks

A reference-lock validation run should check:

- same character face across panels and clips
- same costume and silhouette
- same prop scale and material
- same environment placement
- same weather intensity
- same camera rules
- same staging zones
- no subtitles when forbidden
- no accidental external brand usage
- metadata sidecar exists
- provenance and license review are present
- downstream target is authorized

## Risk Policy

Reference-lock packages are usually low financial risk, but they can become reputational, rights, or governance risks.

Treat these as elevated review conditions:

- public release candidate
- human likeness ambiguity
- external brand presence
- unclear source rights
- voice clone usage
- child-like characters
- violent impact scene
- private project lore
- wallet-capable downstream workflow

## Anti-Moloch Rule

The MCP lane must not treat fast generation as successful execution.

A tool output that breaks reference identity, staging, rights, or provenance fails, even if it looks visually impressive.

Receipt quality matters more than speed.
