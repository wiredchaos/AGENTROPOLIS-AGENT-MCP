# Audio Creator + Gaming MCP Contract

**Role:** Expose governed audio tools to agents without granting direct shell, filesystem, or unrestricted model access.

## Canonical tools

```text
audio.stem.split
audio.asset.inspect
audio.game.package
voice.transcribe
voice.translate
voice.gateway.session.create
voice.gateway.session.close
```

## Tool boundaries

### `audio.stem.split`

Runs the pinned Stem Studio adapter against an approved local source.

Required arguments:

```json
{
  "source_asset_id": "asset_...",
  "output_collection_id": "collection_...",
  "quality": "fast",
  "polish_dialogue": false,
  "multitrack_video": true,
  "rights_assertion_id": "rights_..."
}
```

Returns job and receipt identifiers, never arbitrary host paths.

### `audio.game.package`

Converts approved stems into a staging package for Gaming.

Required arguments:

```json
{
  "stem_manifest_id": "manifest_...",
  "target_profile": "webaudio",
  "operations": ["normalize", "loop-analysis", "event-map"],
  "rights_assertion_id": "rights_..."
}
```

### Voice tools

Voice tools route through Voice Gateway. A transcript or separated dialogue stem is not authenticated speech and cannot independently authorize consequential actions.

## Policy

- resolve asset IDs through the approved registry
- deny raw command strings and arbitrary executable paths
- deny source media without rights assertions
- keep credentials outside model-visible arguments
- use least-privilege district scopes
- require step-up approval for publication, external contact, deletion, or payments
- emit a receipt for every accepted, denied, failed, or cancelled job

## Error contract

```json
{
  "ok": false,
  "code": "RIGHTS_ASSERTION_REQUIRED",
  "message": "The source asset is not approved for processing.",
  "receipt_id": "receipt_..."
}
```

## Repository relationships

```text
agentropolis                  -> canonical architecture and policy
AGENTROPOLIS-CREATOR          -> STEM SPLITTER workflow
AGENTROPOLIS-GAMING-DISTRICT  -> GAME AUDIO FORGE workflow
AGENTROPOLIS-AGENT-MCP        -> agent-facing tool surface
AGENTROPOLIS-DEPLOY           -> runtime profiles and verification
ASBE                          -> build coordination and asset contracts
AGENTROPOLIS-GTM              -> product packaging and market language
```
