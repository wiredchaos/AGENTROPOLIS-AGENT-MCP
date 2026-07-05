# Local Frontier Model Lane

## Purpose

Add an optional model route for users who have the hardware to run frontier-class open-weight models locally, plus a BYOK cloud equivalent for builders who want the same open-source/open-weight lane without owning the hardware.

This is a power-user route, not the default user path.

## Canon

```text
HERMES routes.
MCP exposes tools.
Local frontier models are optional brains.
Cloud equivalents must be BYOK and provider-swappable.
```

## Hardware-qualified local route

Allowed when the operator has realistic hardware capacity.

Eligible environments:

- high-memory GPU workstation
- multi-GPU inference node
- unified-memory machine with enough RAM/VRAM
- Blackwell/NVFP4-ready system
- local lab or studio server

Guardrail: do not describe this as normal consumer hardware. Call it **hardware-qualified local inference**.

## BYOK cloud equivalent route

Allowed when local hardware is not available.

Requirements:

- user supplies the API key
- no repo-stored credentials
- OpenAI-compatible endpoint preferred
- open-source/open-weight compatible model preferred
- provider abstraction required
- logs and outputs follow the same receipt policy as other MCP model calls

The cloud equivalent is not a vendor lock. It is a rented compute lane.

## Candidate models and endpoints

- `nvidia/GLM-5.2-NVFP4`
- GLM-5.2 compatible inference endpoints
- Nemotron/NVFP4 review models
- open-weight coding models
- open-weight research/planning models

## Routing use cases

Use for:

- long-context repository analysis
- private planning
- coding-agent infrastructure work
- policy review before elevated tool calls
- document-heavy synthesis
- autonomous agent council review

Avoid for:

- small extraction tasks
- basic chat
- public demo defaults
- cheap summaries

## MCP config shape

```env
LOCAL_FRONTIER_ENABLED=false
LOCAL_FRONTIER_PROVIDER=local|byok_cloud
LOCAL_FRONTIER_BASE_URL=
LOCAL_FRONTIER_MODEL=nvidia/GLM-5.2-NVFP4
LOCAL_FRONTIER_API_KEY=
LOCAL_FRONTIER_MAX_CONTEXT=1000000
LOCAL_FRONTIER_HARDWARE_QUALIFIED=false
```

## Decision rule

```text
if task.requires_long_context or task.requires_private_reasoning or task.requires_council_review:
  if LOCAL_FRONTIER_ENABLED and LOCAL_FRONTIER_HARDWARE_QUALIFIED:
    route to local frontier model
  else if BYOK cloud endpoint is configured:
    route to BYOK cloud equivalent
  else:
    route to normal research/council lane
```

## AGENTROPOLIS position

This lane strengthens sovereignty without making heavy models mandatory. Builders with serious hardware can use it. Everyone else can use BYOK cloud equivalents or the standard model council lanes.
