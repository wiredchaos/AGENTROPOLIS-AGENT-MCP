# AGENTROPOLIS-AGENT-MCP Hackathon District Contracts

## Core decision

Yes. The Hackathon District applies to AGENTROPOLIS-AGENT-MCP.

This repo should define the contracts that let HERMES/ZERO search, analyze, map builds, generate submissions, and request build augmentations without hardwiring any single provider.

Morph applies as an optional coding-agent infrastructure lane behind MCP. It should stay swappable.

## MCP responsibility

```txt
AGENTROPOLIS-AGENT-MCP
└─ Hackathon District contracts
   ├─ search_hackathons
   ├─ analyze_hackathon
   ├─ map_builds_to_hackathon
   ├─ generate_submission
   ├─ build_augmentation
   ├─ compact_context
   ├─ semantic_repo_search
   ├─ fast_apply_patch
   └─ classify_agent_trace
```

## Contract names from chat prototype

The prototype defined these HERMES tools:

```txt
web_search
analyze_hackathon
map_builds_to_hackathon
generate_submission
build_augmentation
```

MCP should normalize them into provider-agnostic contracts.

## Suggested contract surface

### search_hackathons

Role: discover active hackathons, startup competitions, RFS prompts, sponsor tracks, prizes, and deadlines.

Inputs:

```json
{
  "query": "string",
  "focus": "prizes | deadline | theme | sponsors | requirements"
}
```

Output:

```json
{
  "results": [
    {
      "name": "string",
      "sponsor": "string",
      "deadline": "string",
      "prize": "string",
      "url": "string",
      "requirements": "string"
    }
  ],
  "receipt": "string"
}
```

### analyze_hackathon

Role: score fit against AGENTROPOLIS build inventory.

### map_builds_to_hackathon

Role: map existing builds to sponsor criteria and identify a win angle.

### generate_submission

Role: generate project name, tagline, pitch, problem, solution, demo script, architecture, differentiator, and next steps.

### build_augmentation

Role: generate implementation spec and code changes for the selected build.

### semantic_repo_search

Role: optional Morph-backed code search lane.

### fast_apply_patch

Role: optional Morph-backed partial edit lane.

### compact_context

Role: optional compaction lane for long HERMES/ZERO sessions.

### classify_agent_trace

Role: optional Reflex-style failure classifier for loops, policy failures, and user frustration.

## Morph boundary

Morph-backed tools must remain optional.

Every Morph-backed contract needs a fallback path.

```txt
preferred: Morph lane when configured
fallback: default MCP provider or local tool
required: receipt of provider used
```

## Secret handling

Never commit live keys.

```bash
export ANTHROPIC_API_KEY=replace_with_local_secret
export MORPH_API_KEY=replace_with_local_secret
```

## Current lock

MCP routes the tools. HERMES/ZERO decides the strategy. CREATOR builds the surface. Morph accelerates coding-agent work only when configured.
