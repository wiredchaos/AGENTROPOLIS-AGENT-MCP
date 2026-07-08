# Pocket TTS Local Voice Integration

Status: candidate tool/provider for AGENTROPOLIS local speech routing.

Pocket TTS belongs in the MCP/backend layer as a provider that agents can call through a neutral voice contract. It should not be treated as a hard dependency until it passes benchmark and license review.

## Why it applies

The reported Pocket TTS profile is useful for agent infrastructure because it is CPU-first, lightweight, stream-capable, and API/CLI accessible. That makes it a practical candidate for local agent narration, NPC dialogue, radio rendering, and offline voice tools.

## MCP role

`AGENTROPOLIS-AGENT-MCP` should expose Pocket TTS as a callable local voice tool once validated.

Suggested tool shape:

```ts
type SpeakInput = {
  text: string;
  persona?: "red-fang" | "bwb-anchor" | "hermes-guide" | "npc" | "generic";
  voiceId?: string;
  stream?: boolean;
  format?: "wav" | "mp3" | "ogg";
};

type SpeakOutput = {
  provider: "pocket-tts";
  audioPath?: string;
  streamUrl?: string;
  latencyMs?: number;
  cached?: boolean;
};
```

## Provider policy

- Local default candidate: Pocket TTS
- Cloud fallback: optional only
- Mock provider: required for tests
- Voice cloning: gated behind explicit consent and documented source audio rights

## Validation checklist

Before enabling this in the MCP tool registry:

- verify package install name and runtime commands
- confirm license and commercial usage terms
- measure cold start and first-chunk latency
- test Windows, macOS, and Linux
- test streaming output
- test short and long text
- document CPU and RAM usage
- confirm failure handling when model files are missing

## Agent safety rule

Agents may generate synthetic narration for fictional personas and product voices. Agents must not clone a real person's voice or imitate a private person without explicit permission.

## Integration status

This document is a routing note. No production provider is locked yet.
