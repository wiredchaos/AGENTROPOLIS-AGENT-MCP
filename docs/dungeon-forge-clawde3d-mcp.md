# Dungeon Forge x Claw3D MCP Contract

## Core Lock

Agentropolis MCP is 3D-first.

Claw3D is the spatial agent interface. Dungeon Forge is the deterministic procedural layout brain.

## Agent Responsibilities

MCP agents may request and return:

- generate seeded dungeon or city layout
- rebuild space from seed
- inspect room graph
- assign room semantics
- export critical path
- export difficulty map
- produce 3D scene brief
- produce Claw3D scene brief
- attach NPC director hooks
- attach quest and loot hooks
- produce in-world terminal or HUD data

## Required Output Shape

```json
{
  "seed": "string-or-number",
  "theme": "ancient|molten|frost|grim|verdant|custom|city",
  "rooms": [],
  "corridors": [],
  "critical_path": [],
  "room_roles": {},
  "difficulty_map": {},
  "claw3d_scene_brief": "string",
  "npc_director_hooks": [],
  "quest_hooks": [],
  "rendering_constraints": [
    "3D-first",
    "Claw3D spatial interface",
    "no dashboard-first city",
    "no pixel art",
    "no voxel default",
    "no low-poly default"
  ]
}
```

## Interface Rule

Do not reduce agent operations to flat dashboards. Dashboards may exist as in-world terminals, command panels, HUD overlays, wall displays, desk screens, or fallback admin views.

## Pipeline

```txt
seed -> Dungeon Forge graph -> semantic map -> Claw3D scene brief -> Agentropolis 3D runtime
```

## Final Lock

MCP agents coordinate the conversion from deterministic procedural structure into navigable 3D Agentropolis spaces.
