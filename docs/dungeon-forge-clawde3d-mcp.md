# Dungeon Forge x Clawde3D MCP Contract

## Purpose

This document defines the MCP-facing contract for using Dungeon Forge and Clawde3D inside Agentropolis.

Dungeon Forge supplies deterministic procedural dungeon/world layouts. Clawde3D supplies the hyper-realistic 3D scene presentation layer. MCP tools and agents should treat the pair as a world-generation pipeline, not as a pixel-art dungeon toy.

## Agent Responsibilities

Agents may request:

- generate seeded dungeon layout
- rebuild dungeon from seed
- inspect room graph
- assign room semantics
- export boss path
- export difficulty heatmap
- produce 3D scene brief
- produce Clawde3D rendering brief
- attach NPC director hooks
- attach quest and loot hooks

## Canonical Pipeline

```txt
seed
  -> Dungeon Forge procedural graph
  -> semantic room roles
  -> traversal and difficulty map
  -> geometry translation layer
  -> Clawde3D hyper-real scene spec
  -> BoardForge / CHAOSPHERE runtime
```

## Required Output Shape

Agents should return:

```json
{
  "seed": "string-or-number",
  "theme": "ancient|molten|frost|grim|verdant|custom",
  "rooms": [],
  "corridors": [],
  "critical_path": [],
  "room_roles": {},
  "difficulty_map": {},
  "clawde3d_scene_brief": "string",
  "npc_director_hooks": [],
  "quest_hooks": [],
  "rendering_constraints": [
    "3D hyper-realistic",
    "GTA-style environment detail",
    "no pixel art",
    "no voxel style",
    "no low-poly look"
  ]
}
```

## Visual Constraints

Always preserve this visual lock:

- hyper-realistic 3D
- cinematic environment design
- realistic props and materials
- volumetric fog, liquids, lights, particles
- GTA/open-world compatible camera language

Never default to pixelated, voxel, flat-tile, or retro roguelike art direction.

## Chain Relationships

Chains to:

- BoardForge
- CHAOSPHERE
- Agent NPC Director
- Quest Generator
- Loot Table Builder
- Clawde3D Renderer
- Agentropolis Creator

## Final Lock

Dungeon Forge is the deterministic map brain. Clawde3D is the cinematic 3D body. MCP agents coordinate the conversion between the two.
