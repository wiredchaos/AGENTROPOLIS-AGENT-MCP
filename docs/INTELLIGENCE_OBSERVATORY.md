# AGENTROPOLIS Intelligence Observatory

The Intelligence Observatory embeds topology, thermodynamics, memory evolution, and skill development inside the existing **Agentropolis 3D HERMES MCP surface**.

It is not a separate microsite. The GitHub Pages city at `github-pages/3d/` renders the Observatory as a selectable city structure and calls the deployed Cloudflare Worker through the same governed Streamable HTTP MCP endpoint.

## Views

| View | MCP tool | Purpose |
| --- | --- | --- |
| Topology | `get_agentropolis_topology` | City nodes, infrastructure, districts, governed edges, and connectivity indicators. |
| Thermodynamics | `get_agentropolis_thermodynamics` | Energy-in, compute load, value-out, coordination friction, entropy, drift, and stability indicators. |
| Memory Evolution | `get_agentropolis_memory_evolution` | Memory layers, provenance coverage, confidence, contradiction counts, and promotion flow. |
| Skill Development | `get_agentropolis_skill_development` | Capability gates, sandbox and council progression, verified competence, and citizenship readiness. |
| Combined Snapshot | `get_agentropolis_observatory_snapshot` | One selected view or the complete Observatory payload. |

Every Observatory tool is read-only, idempotent, non-destructive, and bound by the public MCP authority ceiling.

## Data states

The UI distinguishes two states and must not blur them:

### Canonical baseline

Displayed before a Worker connection exists or when the receipt ledger is empty. It is a deterministic reference model derived from the canonical district registry. It is useful for layout, schema development, demonstrations, and integration testing, but it is **not live telemetry**.

### Receipt-backed observability

Displayed only when the Worker returns D1 execution-receipt aggregates. Operational values include receipt count, average tool duration, last receipt time, and bounded tool-call aggregates. The response sets:

```json
{
  "telemetryState": "receipt-backed-observability",
  "liveTelemetry": true
}
```

The Observatory does not expose chain-of-thought, private model state, raw secrets, bearer tokens, or hidden prompts. It visualizes canonical architecture and governed operational receipts.

## Browser flow

```text
Agentropolis 3D Observatory drawer
  -> POST /mcp
  -> tools/call
  -> Observatory read-only tool
  -> canonical district model + D1 receipt aggregates
  -> new execution receipt
  -> structuredContent response
  -> canvas visualization + receipt ID
```

The 3D drawer keeps a clearly labeled local preview if the Worker is unreachable. It never silently presents preview data as production data.

## REST inspection

The same governed snapshot is available for browser inspection:

```text
GET /api/observatory?view=all
GET /api/observatory?view=topology
GET /api/observatory?view=thermodynamics
GET /api/observatory?view=memory_evolution
GET /api/observatory?view=skill_development
```

The REST route is rate limited, origin guarded, read-only, and receipt producing.

## HERMES connection

The existing HERMES Dock generates the configuration for the Worker:

```json
{
  "mcpServers": {
    "agentropolis-grid": {
      "url": "https://YOUR-WORKER.workers.dev/mcp",
      "transport": "streamable-http"
    }
  }
}
```

After entering the Worker URL, open **Observatory** and select **Sync through MCP**. Each successful synchronization returns a receipt ID in the status bar and structured response panel.

## Security invariants

- Public Observatory tools remain `READ_ONLY`.
- No self-promotion, permission mutation, publishing, wallet action, payment, or destructive action is registered.
- Receipt aggregates never include raw request bodies, bearer tokens, or private keys.
- “Live” is only shown for receipt-backed data.
- Capability progression remains human governed.
- The GitHub Pages origin must be explicitly allowlisted by the Worker.
