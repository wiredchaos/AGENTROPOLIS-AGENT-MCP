# Kimi K3 Vision Operator Routing

## Purpose

This document defines how Kimi K3 or another approved vision-capable coding model may operate Blender, Unreal Engine, and the wider Agentropolis construction MCP stack.

The model is an operator lane. It is not the authority layer, not the owner of the world, and not allowed to expand its own permissions.

```text
human mandate
  -> AGENTROPOLIS-CREATOR package
  -> ASBE stage plan
  -> HERMES dispatch
  -> AGENTROPOLIS-AGENT-MCP authority check
  -> approved operator model
  -> approved MCP adapter
  -> evidence
  -> validation
  -> receipt
```

## Canonical Ownership

```text
AGENTROPOLIS-CREATOR
  = owns approved world, district, asset, structure, material, and export contracts

ASBE
  = owns stages, scenes, shots, milestones, queues, and production handoffs

HERMES
  = owns dispatch sequencing

AGENTROPOLIS-AGENT-MCP
  = owns adapter access, write scopes, risk gates, serialization, and receipts

Vision-capable model
  = inspects, proposes, executes approved operations, and reports results
```

## Supported Construction Adapter Families

### Authoring and Runtime

- Blender MCP
- Unreal MCP
- Unity MCP
- Godot MCP
- PlayCanvas / WebXR adapters
- React Three Fiber / Three.js adapters
- SuperSplat / 3DGS adapters
- OpenUSD interchange adapters

### Candidate Generation and Reconstruction

- HY-World 2.0 adapters
- Hunyuan3D adapters
- TRELLIS adapters
- TripoSR adapters
- InstantMesh adapters
- Stable Fast 3D adapters
- Infinigen adapters
- Wave Function Collapse adapters
- MarkovJunior adapters

### Supporting Media and Validation

- ComfyUI-style adapters
- OpenCut-style adapters
- audio and voice adapters
- structural validators
- performance validators
- visual-diff validators
- license and provenance validators
- deployment adapters

## Operator Routing Contract

```json
{
  "request_id": "uuid",
  "mandate_id": "approved-mandate-id",
  "creator_package_id": "approved-package-id",
  "asbe_stage_id": "stage-014",
  "operator_model": "approved-vision-coding-operator",
  "adapter_id": "blender_mcp",
  "project_id": "approved-project-id",
  "scene_or_level": "approved-scene-id",
  "mode": "INSPECT | PROPOSE | EXECUTE | VALIDATE",
  "allowed_actions": [],
  "blocked_actions": [],
  "write_roots": [],
  "protected_scope": [],
  "checkpoint_required": true,
  "evidence_required": true,
  "approval_state": "DRAFT_ONLY | REVIEW_REQUIRED | APPROVED",
  "receipt_required": true
}
```

No tool call should execute without a request contract.

## Authority Modes

### INSPECT

Read-only mode.

Allowed examples:

- list objects or actors
- inspect scene hierarchy
- inspect materials and metadata
- capture viewport or render preview
- read script content
- inspect validation state
- export a report

### PROPOSE

The operator may generate a change plan but may not mutate project state.

Required output:

- observed defect
- conflicting mandate requirement
- affected objects, actors, files, or nodes
- proposed actions
- risk level
- protected scope
- expected evidence
- rollback path

### EXECUTE

The operator may perform only actions listed in `allowed_actions` and only inside approved write roots.

Execution requires:

- checkpoint when risk is medium or high
- serialized editor control
- bounded operation count
- action receipts
- post-operation evidence

### VALIDATE

The operator or a separate inspector may run approved checks and compare results against the mandate and stage contract.

Validation does not grant approval or publishing authority.

## Risk Classes

### Low Risk

- read scene state
- list assets
- inspect metadata
- capture preview
- generate report
- compare before and after evidence

### Medium Risk

- create object or actor in an isolated candidate scope
- modify material parameters
- move a camera
- add lights
- edit non-production scripts
- export a test package
- run a bounded procedural pass

### High Risk

- delete or rename production objects
- overwrite files
- move assets across approved roots
- alter a canonical world
- import external assets
- execute arbitrary shell commands
- change project configuration
- package or publish a production build
- run unbounded generation or repair loops

Medium-risk and high-risk operations require a reversible diff and approval according to policy.

## Serialized Editor Control

Only one assigned operator may hold write authority for a project session at a time.

This applies independently to:

- Blender files
- Unreal projects
- Unity projects
- Godot projects
- browser scene write sessions
- shared interchange packages

Supporting agents may inspect and propose in parallel, but project writes must be serialized.

## Vision-in-the-Loop Sequence

```text
1. Read the approved mandate and current checkpoint.
2. Capture viewport, render, simulation, or playtest evidence.
3. Inspect the evidence and project structure.
4. Record specific defects.
5. Map each defect to an unmet requirement.
6. Name the affected scope.
7. Create a bounded correction proposal.
8. Request or verify execution authority.
9. Save a checkpoint.
10. Execute approved MCP operations.
11. Capture evidence again.
12. Run structural, visual, performance, and provenance validation.
13. Accept, request review, or roll back.
14. Write a receipt.
```

A vague aesthetic phrase does not create broad write authority. The operator must convert it into explicit, reviewable actions.

## Adapter-Specific Boundaries

### Blender MCP

Typical allowed actions:

- create or modify isolated objects
- edit materials
- control Geometry Nodes parameters
- execute approved `bpy` scripts
- move approved cameras and lights
- render previews
- export test GLB, FBX, or USD packages

Typical blocked actions:

- delete production collections
- overwrite approved source files
- execute scripts outside approved roots
- export or publish without validation

### Unreal MCP

Typical allowed actions:

- inspect levels and actors
- place approved actors
- modify approved material instances
- update approved lighting and camera settings
- create or modify approved Level Sequences
- run bounded playtests and preview renders

Typical blocked actions:

- modify unrelated project settings
- alter protected maps or assets
- run arbitrary editor commands outside the contract
- package or publish without approval

### Candidate Producer MCPs

Generation and reconstruction adapters may create candidate packets only.

They may not:

- overwrite canonical assets
- import directly into production scenes
- omit provenance
- approve their own output
- run unbounded batches

## Execution Receipt

```json
{
  "receipt_id": "uuid",
  "request_id": "uuid",
  "operator_model": "approved-vision-coding-operator",
  "adapter_id": "unreal_mcp",
  "mode": "EXECUTE",
  "project_id": "approved-project-id",
  "checkpoint_before": "checkpoint-013",
  "checkpoint_after": "checkpoint-014",
  "actions_requested": [],
  "actions_executed": [],
  "actions_blocked": [],
  "files_changed": [],
  "objects_changed": [],
  "evidence": [],
  "validation_results": [],
  "approval_state": "REVIEW_REQUIRED",
  "rollback": "checkpoint-013"
}
```

## Model-Neutral Rule

The routing contract must not depend on Kimi-specific behavior.

Kimi K3 may be selected when its coding, visual inspection, context handling, latency, cost, and tool-use profile fit the task. Another approved model may be selected by the Model Council without changing adapter permissions, Creator ownership, ASBE contracts, or receipt requirements.

## Canon Lock

```text
Models propose and operate.
MCP grants and limits capability.
Creator owns the construction package.
ASBE coordinates the sequence.
Hermes dispatches the work.
Validators verify the result.
Humans approve consequential change.
Receipts preserve accountability.
```
