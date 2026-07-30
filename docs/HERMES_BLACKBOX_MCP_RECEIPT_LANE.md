# Hermes Blackbox MCP Receipt Lane

Hermes Blackbox is registered as an optional evidence adapter behind the Agentropolis MCP capability bus.

## Capability contract

```text
capture_hermes_flight_record(session_ref, redaction=true)
render_hermes_flight_report(record_ref)
verify_hermes_flight_integrity(record_ref)
draft_hermes_completion_receipt(record_ref, goal, claims=[])
```

## Required response envelope

```json
{
  "adapter": "hermes-blackbox",
  "adapter_version": "0.1.0",
  "status": "draft|inconclusive|rejected|verified",
  "record_id": "bb_...",
  "session_id": "...",
  "event_hash": "sha256:...",
  "redactions_count": 0,
  "claims": [],
  "artifacts": [],
  "assurance": {
    "required": true,
    "provider": "AGENTROPOLIS-AEGIS-ASSURANCE",
    "decision_id": null
  }
}
```

## Permission boundary

The adapter may collect, redact, normalize, hash, and transport evidence. It may not grant authority or convert a heuristic claim verdict into a governed completion.

MCP consumers must treat Blackbox v0.1 `prove` output as advisory. A `verified` status may be emitted only after AEGIS supplies a decision identifier based on deterministic evidence.

## Data handling

- Redaction must remain enabled for shareable records.
- Full system prompts must remain excluded by default.
- Absolute local paths must be removed or tokenized before transport.
- Raw unredacted records must remain local and must not enter cross-agent handoffs.
- Receipt consumers must verify the event hash before processing claims.

## High-impact actions

Settlement, deployment, permission, reputation, wallet, governance, and destructive operations require Human Mission Control approval in addition to AEGIS verification.
