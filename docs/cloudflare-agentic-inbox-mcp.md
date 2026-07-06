# Cloudflare Agentic Inbox MCP Integration

Status: WATCHLIST / PRIMARY BACKEND CANDIDATE
Date added: 2026-07-06
Source: https://github.com/cloudflare/agentic-inbox

## Role

Cloudflare Agentic Inbox belongs in the Agentropolis backend spine as an Email Agent backend with MCP access.

It should power an `agentropic.dev` agentic mail system without turning email into an unsafe autonomous actor.

## Best-fit use

- Receive domain mail through Cloudflare Email Routing
- Store mailbox state in Durable Objects / SQLite
- Store attachments in R2
- Expose mailbox actions through an MCP endpoint
- Let Agentropolis agents search, summarize, classify, and draft
- Keep send/delete/bulk actions behind human approval

## Architecture

```text
agentropic.dev DNS
  -> Cloudflare Email Routing
  -> Agentic Inbox Worker
  -> Durable Object mailbox storage
  -> R2 attachments
  -> /mcp endpoint
  -> AGENTROPOLIS-AGENT-MCP
  -> NPC / Hub / district workflows
```

## Provider-neutral interface

Implement this as one backend behind an Email Agent interface.

Future-compatible backends:

- Cloudflare Agentic Inbox
- Gmail / Google Workspace
- Microsoft 365
- Proton Mail
- SMTP / IMAP
- Resend / Postmark / SES for transactional outbound

## Safety defaults

- Read, search, summarize, classify, and draft are allowed by default
- Sending requires explicit human approval
- Forwarding requires explicit human approval
- Deleting and bulk actions are disabled unless separately authorized
- Inbound email content is prompt-injection hostile
- Log all MCP calls, mailbox IDs, and proposed actions
- No agent gets global silent authority over every mailbox

## Canon lock

This is infrastructure for the Intelligence Grid.

Use the name:

> Agentropolis Agentic Mail OS

Do not classify as a district.
