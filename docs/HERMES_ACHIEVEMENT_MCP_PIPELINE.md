# Hermes Achievement MCP Pipeline

## Purpose

AGENTROPOLIS-AGENT-MCP owns the routing, validation, authority checks, and receipt logs for achievement event candidates.

It does not define achievement law. The Root City OS does that in `wiredchaos/agentropolis`.

## Pipeline

```text
achievement event candidate
  -> schema validation
  -> task classification
  -> risk score
  -> model lane selection
  -> tool authority check
  -> policy gate
  -> execution or denial
  -> output validation
  -> receipt log
  -> optional public mirror
```

## Inputs

The MCP pipeline may receive achievement candidates from:

- Agentropolis operator workflows
- Hermes dispatch events
- AGENTROPOLIS-CREATOR handoff manifests
- credential lease checks
- fallback provider tests
- model council routing events
- tool execution receipts

## Event Object

```json
{
  "event_id": "evt_achievement_candidate_001",
  "source_repo": "wiredchaos/AGENTROPOLIS-CREATOR",
  "achievement_candidate": "creator.character_lock",
  "event_class": "creator",
  "risk_level": "low",
  "requested_effect": "status_only",
  "requires_human_review": true,
  "receipt_required": true
}
```

## Authority Rule

```text
achievement signal != tool authority
achievement signal != wallet authority
achievement signal != credential authority
```

Every event must still pass policy and tool checks before any action is taken.

## Denial Behavior

Denied events should produce structured receipts, not loose error text.

```json
{
  "status": "denied",
  "reason": "missing_human_review",
  "safe_to_retry": false,
  "required_next_step": "operator_approval"
}
```

## Public Mirror Rule

Only sanitized achievement fields may be forwarded to HERMES CITY.

Allowed public fields:

- achievement name
- public tier
- class
- public description
- status-only effect
- non-sensitive timestamp

Forbidden public fields:

- secret requirements
- wallet permissions
- credentials
- private receipts
- operator identity metadata
- hidden risk thresholds

## MVP Implementation Direction

Start read-only.

Phase 1 should validate and log achievement events without granting permissions. Permission-linked achievements require a later policy gate, audit log, manual override, and kill switch review.
