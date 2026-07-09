# LTX World Model MCP Lane

## Role

LTX is tracked as an optional model/tool lane behind AGENTROPOLIS-AGENT-MCP governance.

The MCP kit may route approved world simulation, cinematic previs, media diff, and physical-environment reasoning requests toward LTX-compatible tools or APIs when the request passes policy, rights, risk, and logging checks.

## Canon Boundary

LTX does not replace:

- HERMES Dispatch
- MCP registry
- policy gates
- Model Council routing
- receipts
- rights checks
- Agentropolis canon
- human review for sensitive output

## Routing Pattern

```text
MCP request
  -> classify task
  -> detect world-model intent
  -> score risk
  -> check rights and reference status
  -> select model lane
  -> route to LTX lane if approved
  -> validate output
  -> log receipt
```

## Candidate Capabilities

```text
compile_world_model_contract
validate_scene_references
route_world_simulation_request
triage_world_model_output
log_world_model_receipt
```

## Required Inputs

- task intent
- scene or world contract
- reference asset rights status
- privacy classification
- target output type
- model lane approval status
- validation checklist

## Output Contract

```json
{
  "lane": "ltx_world_model",
  "status": "draft | approved | blocked | needs_review",
  "risk_level": "low | medium | high",
  "rights_status": "owned | licensed | public_safe | unclear | blocked",
  "artifact_type": "simulation_preview | cinematic_previs | media_diff | scene_contract",
  "receipt_required": true
}
```

## Restrictions

Block or escalate requests involving:

- rights-unclear private references
- sensitive personal data
- wallet, settlement, or financial execution
- claims that require validated physics or engineering certification
- autonomous real-world action without separate authority

## Canon Lock

World-model tools are powerful adapters.

MCP remains the membrane.
