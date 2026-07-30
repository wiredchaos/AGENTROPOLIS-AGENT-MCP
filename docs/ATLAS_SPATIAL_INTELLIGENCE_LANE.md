# ATLAS Spatial Intelligence Lane

AGENTROPOLIS-AGENT-MCP publishes AGENTROPOLIS-ATLAS as the governed spatial capability lane for agents that need maps, geocoding, nearby-feature discovery, routing, and spatial evidence without depending on Google Maps.

## Canonical ownership

- `wiredchaos/AGENTROPOLIS-ATLAS` is the source authority for the MCP server, typed schemas, provider adapters, spatial policy, and ATG receipts.
- AGENTROPOLIS-AGENT-MCP exposes the lane in the registry and routes only authorized requests.
- MCP-Ranger provides provider discovery and approval evidence.
- AGENTROPOLIS-DEPLOY provisions runtime infrastructure.

Do not copy the ATLAS server into this repository.

## Tool registry

| Tool | Authority | Risk | Receipt required |
|---|---|---:|---|
| `atlas_geocode` | read-only | medium | yes |
| `atlas_reverse` | read-only | medium | yes |
| `atlas_nearby` | read-only, bounded | medium | yes |
| `atlas_route` | read-only, bounded | medium | yes |
| `atlas_receipt` | validate-only | low | n/a |

## Routing sequence

```text
agent request
  -> classify spatial intent
  -> authenticate principal
  -> validate mandate
  -> resolve authority geometry
  -> select approved ATLAS deployment
  -> execute bounded tool
  -> validate result and attribution
  -> attach ATG spatial receipt
  -> return to agent
```

## Registry entry

```json
{
  "id": "agentropolis-atlas",
  "type": "mcp_server",
  "source_repository": "wiredchaos/AGENTROPOLIS-ATLAS",
  "authority": "read_only",
  "transport": ["stdio", "authenticated_internal_http"],
  "tools": [
    "atlas_geocode",
    "atlas_reverse",
    "atlas_nearby",
    "atlas_route",
    "atlas_receipt"
  ],
  "requires": [
    "trusted_principal",
    "authority_geometry",
    "approved_provider_lane",
    "attribution",
    "spatial_receipt"
  ],
  "forbids": [
    "caller_asserted_identity",
    "silent_provider_fallback",
    "autonomous_osm_editing",
    "route_as_dispatch_authority"
  ]
}
```

## Policy locks

- A location result does not prove identity or ownership.
- A route does not authorize entry, dispatch, purchase, surveillance, or physical action.
- Precise personal coordinates must be minimized and classified.
- Public OSM infrastructure is not an unlimited production backend.
- Every user-visible map must preserve required attribution.
- Provider failures must fail closed or return a transparent degraded state.

## Consumer lanes

Initial consumers:

- 54Travel for traveler-facing maps and route planning;
- AGENTROPOLIS-GTM for bounded public local-market discovery;
- Mission Control for map visualization of authorized operations;
- NEXUS PUBLICA for civic and infrastructure intelligence.
