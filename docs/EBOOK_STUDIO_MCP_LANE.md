# Ebook Studio MCP Lane

## Status

Ebook Studio is currently a Creator District publishing template.

AGENTROPOLIS-AGENT-MCP tracks the future callable-tool boundary only. The current version is static browser HTML and does not require MCP execution.

```text
human creator
  -> opens ebook-studio-template.html
  -> edits brand, palette, videos, chapters
  -> exports standalone HTML
  -> hosts or sends artifact
```

## Current MCP Requirement

None.

The present template is intentionally backend-free:

- no API key
- no database
- no login
- no wallet connection
- no agent execution
- no MCP server dependency

## Future Tool Boundary

If Ebook Studio becomes callable from an agent or HERMES workflow, MCP should expose only narrow, governed actions.

Candidate capabilities:

```text
create_ebook_project
validate_ebook_config
render_ebook_preview
export_ebook_html
package_ebook_assets
log_ebook_receipt
```

## Guardrails

MCP must not silently publish, overwrite, or send client-facing ebooks without confirmation.

Required checks for future automation:

- rights-cleared source material
- no private client data in public export
- no embedded tracking scripts unless disclosed
- no wallet or credential collection
- export receipt generated
- human review before publishing

## Recommended Request Flow

```text
MCP request
  -> classify as creator publishing task
  -> validate source rights and privacy boundary
  -> assemble ebook config
  -> render preview or export candidate
  -> require human approval for publish/send
  -> log receipt
```

## Agentropolis Fit

Ebook Studio should be treated as a creator artifact generator, not an autonomous publishing authority.

```text
AGENTROPOLIS-CREATOR owns the template.
HERMES-CITY explains the public-safe pattern.
AGENTROPOLIS-AGENT-MCP gates any future executable workflow.
```

## Naming Lock

Use `Ebook Studio` for the product lane.

Do not merge it with AuthorMind Audiobook Studio. The relationship is adjacent, not identical:

```text
AuthorMind
  -> manuscript and media publishing workflow

Ebook Studio
  -> interactive ebook builder and HTML export surface
```
