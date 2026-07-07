# Entertainment District MCP Bridge

## Status

**Online target:** `agenticstudio-pbx`  
**District:** Entertainment District  
**Backend entrypoint:** `server/index.js` in `wiredchaos/agenticstudio-pbx`  
**Default local port:** `8787`

## Role inside AGENTROPOLIS-AGENT-MCP

AGENTROPOLIS-AGENT-MCP is the agent/tool bridge. The Entertainment District backend exposes the first clean HTTP contract for studio, media, show, and creator-service metadata.

This repo should treat `agenticstudio-pbx` as an MCP-ready district service.

## Canonical backend routes

```txt
GET /api/health
GET /api/district
GET /api/district/services
GET /api/ecosystem/repos
```

## MCP handoff target

```txt
Service: agenticstudio-backend
District: entertainment-district
Application: agenticstudio-pbx
Bridge type: HTTP now, MCP adapter next
```

## Recommended MCP tools

Future MCP server/tool names should stay narrow and predictable:

```txt
entertainment.health.check
entertainment.district.read
entertainment.services.list
entertainment.repos.list
entertainment.creator.dispatch
entertainment.asset.register
entertainment.show.register
entertainment.publish.queue
```

## Tool boundary

The MCP layer should not become the media database. It should act as the agent gateway that reads from, writes to, or dispatches tasks into the Entertainment District backend.

## Repo relationships

| Repo | Role |
|---|---|
| `wiredchaos/HERMES-CITY` | City runtime and district shell |
| `wiredchaos/AGENTROPOLIS-AGENT-MCP` | Agent/tool bridge and MCP handoff layer |
| `wiredchaos/AGENTROPOLIS-CREATOR` | Creator workflow and media production layer |
| `wiredchaos/agenticstudio-pbx` | Entertainment District backend/application surface |

## Next MCP work

- Create an MCP adapter for the backend health and district metadata routes.
- Add tool contracts for studio registry, asset registry, show registry, and publishing queue.
- Keep destructive actions gated behind explicit user confirmation.

## Canon lock

Entertainment District owns the production data. AGENTROPOLIS-AGENT-MCP owns tool access, agent routing, and safe handoff.
