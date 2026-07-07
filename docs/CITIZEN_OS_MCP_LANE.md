# Citizen OS MCP Lane

## Status

`governed_lane`

Citizen OS events need a governed MCP lane when records move across apps.

This repo owns the validation and receipt side of the system.

## Supported flows

- citizen record validation
- citizen registry sync
- citizen recruitment event intake
- AGENTtv channel event intake
- gameplay event intake
- Visual Content Engine render request routing
- future game adapter registration

## Flow

1. A universe app emits an event.
2. The local app updates its own UI state.
3. Shared sync requests go through MCP.
4. MCP validates the event shape.
5. MCP checks whether the source may write to the target lane.
6. MCP returns a receipt.
7. Build Hub and Visual Content Engine read the approved state.

## Event families

- citizen_spawned
- citizen_recruited
- citizen_updated
- channel_tuned
- broadcast_started
- broadcast_finished
- decision
- milestone
- cipher
- faction
- match_started
- match_finished
- asset_generated

## Proposed tools

- validate_citizen_record
- sync_citizen_record
- ingest_game_event
- register_game_placeholder
- issue_citizen_receipt
- read_citizen_registry_snapshot
- route_visual_render_event

## Minimum citizen fields

- citizenId
- codename
- nodeOrigin
- clearance
- tier
- tvChannel
- citizenStatus
- spawnedAt

## Receipt fields

- receiptId
- sourceNode
- eventType
- citizenId
- accepted
- policyLane
- timestamp
- notes

## Repo boundaries

AGENTROPOLIS-CREATOR defines the Foundry assets and UI.

AGENTROPOLIS-AGENT-MCP validates shared actions and records receipts.

HERMES-CITY explains the public-safe architecture.
