# Hermes Streaming TTS Adoption — Agent MCP

**Status:** Control and integration standard adopted  
**Canonical specification:** https://github.com/wiredchaos/agentropolis/blob/main/docs/HERMES_STREAMING_TTS.md

Agent MCP connects voice sessions to approved capabilities. Streaming TTS changes output transport only; it does not expand tool authority.

Requirements: validate identity, mandate, tool scope, and policy before execution; never speak MCP credentials, private tool arguments, secrets, or hidden reasoning; require step-up approval for consequential actions; preserve interruption, cancellation, text fallback, and whole-file fallback; ensure provider failure cannot mutate authorization state; retain transcripts only under consent and memory policy; record requested tools, executed tools, approvals, latency, fallback, and receipt hash without sensitive payloads.

Default behavior is deny when authority or session state is unresolved.
