# LocateAnything MCP Vision Lane

Status: candidate

Repo role: governed MCP routing and tool membrane.

## Purpose

NVIDIA LocateAnything-3B is tracked as an optional visual grounding provider for Agentropolis tools, BoardForge Arena District, Creator QA, public accessibility flows, and scene understanding.

The MCP kit should treat it as a replaceable provider behind policy gates.

```text
client request
  -> classify vision task
  -> check policy and storage rules
  -> call provider adapter
  -> normalize result
  -> validate against caller permissions
  -> log receipt
```

## Hard boundaries

This lane must not:

- create wallet connections
- verify ownership by itself
- execute gameplay moves
- approve marketplace actions
- expose private City OS prompts
- store user images in repo
- bundle NVIDIA weights without license review

Vision output is advisory until the consuming app validates it.

For BoardForge, game legality still belongs to the game engine.

## Candidate tools

### `locate_object`

Find one or more requested targets in an image.

```json
{
  "image_ref": "string",
  "query": "gold crown",
  "coordinate_space": "normalized",
  "max_results": 10
}
```

### `ground_text`

Ground a natural-language visual instruction to one or more regions.

```json
{
  "image_ref": "string",
  "instruction": "find the white king on the board",
  "coordinate_space": "normalized"
}
```

### `detect_objects`

Return likely objects without a specific target query.

```json
{
  "image_ref": "string",
  "domain_hint": "boardforge_chess",
  "coordinate_space": "normalized"
}
```

### `extract_visual_features`

Return embeddings or feature descriptors for indexing, search, or QA.

```json
{
  "image_ref": "string",
  "feature_scope": "scene|object|ui|asset"
}
```

### `inspect_scene_layout`

Inspect UI or world screenshots for overlap, missing targets, or visual QA issues.

```json
{
  "image_ref": "string",
  "expected_targets": ["BF shield", "gold crown", "PFP battle banner"],
  "minimum_confidence": 0.75
}
```

## Normalized response

```json
{
  "request_id": "uuid",
  "tool": "locate_object",
  "provider": "nvidia-locateanything-3b",
  "status": "ok",
  "results": [
    {
      "label": "gold crown",
      "box": [0.12, 0.09, 0.21, 0.18],
      "score": 0.88,
      "coordinate_space": "normalized"
    }
  ],
  "warnings": [],
  "requires_user_confirmation": true,
  "receipt": {
    "policy_gate": "vision_grounding_candidate",
    "stored_image": false,
    "model_weights_bundled": false
  }
}
```

## BoardForge routing

```text
BoardForge screenshot or camera frame
  -> locate_object or ground_text
  -> coordinates returned
  -> BoardForge engine validates legal state or action
  -> user confirms if needed
```

Examples:

- locate the white king
- find every pawn
- find the move confirmation button
- locate the PFP battle banner
- map a physical chessboard to candidate board state

## Creator routing

```text
Creator render
  -> inspect_scene_layout
  -> compare against theme manifest
  -> emit QA warnings or repair prompt
```

Examples:

- locate all required theme props
- detect missing crown, paw, or banner
- flag UI overlap
- generate visual QA report

## Public HERMES routing

```text
HERMES public prompt
  -> explain where something is
  -> never execute private action directly
```

## Provider adapter contract

Provider adapters should expose:

```text
provider_id
model_id
license_id
supports_boxes
supports_points
supports_feature_vectors
max_image_size
storage_policy
commercial_status
```

Recommended default:

```json
{
  "provider_id": "nvidia",
  "model_id": "LocateAnything-3B",
  "license_id": "nvidia-license",
  "supports_boxes": true,
  "supports_points": true,
  "supports_feature_vectors": true,
  "storage_policy": "no_repo_storage",
  "commercial_status": "pending_review"
}
```

## License caution

The referenced Hugging Face screenshot shows `nvidia-license`.

Until reviewed, the MCP kit may define the adapter and tool schemas, but should not bundle weights or make the provider mandatory.

## Decision

Approved as a governed candidate MCP vision lane.

Core lock:

```text
LocateAnything-3B = optional visual grounding provider
MCP = policy gate, adapter, normalization, receipt
BoardForge and Creator = consuming apps
Agentropolis = final governance authority
```