# Unreal MCP Read-Only Pilot Runbook

## Objective

Prove that Hermes can connect to a local Unreal Editor, discover the live Unreal MCP schema, inspect one approved test project and map, capture evidence, and produce a receipt without mutating or saving project state.

## Repository controls

- Adapter registry: `config/unreal-mcp-adapter.json`
- Pilot request: `pilot/unreal-mcp/read-only-request.json`
- Receipt template: `pilot/unreal-mcp/receipt-template.json`
- Contract validator: `scripts/validate_unreal_mcp_pilot.py`

Validate before local execution:

```bash
python scripts/validate_unreal_mcp_pilot.py
```

## Machine-side prerequisites

1. Install the supported Unreal Engine version required by the current Unreal MCP plugin documentation.
2. Install and enable the Unreal MCP plugin.
3. Install and enable the separate AllToolsets plugin.
4. Install Hermes and update it to the current supported release.
5. Install the official Unreal MCP skill and connector:

```bash
hermes skills install official/creative/unreal-mcp
hermes mcp install unreal-engine
```

6. Create or select an isolated test project with no secrets, client data, wallets, production state or unverified assets.
7. Choose one approved test map.
8. Keep the MCP endpoint bound to `127.0.0.1` only.

## Prepare the request

Copy `pilot/unreal-mcp/read-only-request.json` to a local working file that is not committed with sensitive machine paths.

Replace:

- `request_id`
- `mandate_id`
- `project`
- `map`

Do not add mutation, save, render, export or publishing capabilities.

## Startup order

```text
1. Start Unreal Editor
2. Open the approved test project and map
3. Confirm Unreal MCP and AllToolsets are enabled
4. Confirm the MCP server is listening only on 127.0.0.1:8000
5. Start Hermes
6. Load the approved read-only request
```

## Required execution sequence

Hermes must use live schema discovery:

```text
list_toolsets
  -> describe_toolset
  -> call one approved read operation
  -> read result
  -> verify project and map identity
  -> capture editor screenshot
  -> write receipt
```

Do not guess tool names or argument schemas. Do not issue overlapping Unreal calls.

## Evidence checklist

The receipt must record:

- connector and plugin version when available
- loopback endpoint verification
- discovered toolset names
- approved project identity
- approved map identity
- structural inventory result
- screenshot reference
- warnings or errors
- empty `changed_packages`
- start and completion timestamps
- operator approval state

## Pass criteria

The pilot passes only when:

- the endpoint is loopback-only
- the live tool schema was discovered
- the approved project and map were correctly identified
- only registered read capabilities were invoked
- no package, actor, Blueprint, material or sequence was changed
- evidence was captured
- a complete receipt was written

## Immediate stop conditions

Stop and close the connector when:

- the endpoint is reachable beyond loopback
- the opened project or map differs from the request
- Hermes requests or exposes a mutation capability
- the live schema cannot be discovered
- calls overlap or the editor becomes unstable
- a package appears modified
- receipt generation fails
- authority is revoked

## After the run

1. Close Hermes.
2. Stop the Unreal MCP server.
3. Close the Unreal Editor without saving unexpected changes.
4. Review the receipt manually.
5. Store only sanitized evidence in GitHub.
6. Keep the adapter status `DISABLED_BY_DEFAULT` until the receipt is approved.

A successful connection is not production approval. Architecture limits exposure. Governance limits failure.
