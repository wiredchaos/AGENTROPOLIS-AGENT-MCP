# Hermes API Backend Pattern

## Canon lock

Agentropolis apps should feel like normal software on the surface while Hermes runs narrow, reviewable agent workflows behind the API boundary.

The user clicks a button. The app sends structured context. Hermes executes the correct skill or toolchain. The result returns with logs, receipts, and review state.

Hermes is not the default product interface. Hermes is the agentic backend worker layer.

## Core doctrine

Agentropolis should not make users operate agents directly.

Users operate clean product surfaces. Hermes operates behind the boundary. APIs define what Hermes is allowed to touch. Skills define how Hermes performs the work. Logs prove what happened. Human review controls what becomes public, permanent, or expensive.

## Operating model

```txt
Product surface -> Narrow API -> Hermes profile -> Skill workflow -> Structured result -> Human review -> Approved action
```

This keeps the product calm while the agentic layer does useful work in the background.

## Why this matters

Without an API boundary, Hermes becomes a vague helper with too much surface area. That creates messy permissions, unclear state, and hard-to-debug outcomes.

With an API boundary, Hermes becomes a worker with job-safe handles.

The app owns the product experience. The API owns the allowed actions. The skill owns the workflow. Hermes executes the work. The review layer decides what becomes real.

## Good Agentropolis API handles

Use small, explicit actions:

```txt
read_repo_context
check_canon_conflict
generate_skill_card
create_district_spec
queue_github_patch
save_review_note
list_recent_agent_runs
approve_patch
```

Avoid vague actions:

```txt
help_with_project
chat_with_database
do_agent_work
fix_everything
publish_content
```

## Example flow: canon conflict check

### Product button

```txt
Check Canon Conflict
```

### App payload

```json
{
  "district": "Arena",
  "repo": "agentropolis",
  "artifact_type": "district_spec",
  "proposed_change": "Add BoardForge as the Arena District strategy layer.",
  "review_required": true
}
```

### Hermes workflow

```txt
read_repo_context
check_canon_conflict
compare_registry
draft_patch_note
return_review_packet
```

### Returned result

```json
{
  "verdict": "compatible",
  "risk": "medium",
  "conflicts": [
    {
      "field": "district_role",
      "note": "Arena District should remain application-facing and not replace Intelligence Grid infrastructure."
    }
  ],
  "suggested_patch": "Ready for review.",
  "needs_human_approval": true
}
```

## Review boundaries

Start read-only when possible.

Safe first tools:

```txt
inspect
fetch
summarize
draft
compare
score
recommend
```

Add write tools later:

```txt
create
update
label
queue
commit
publish
send
```

Anything that can embarrass the brand, spam a user, delete data, spend money, mutate repo state, or publish externally needs review.

## Structured response requirements

Hermes-facing API responses should be boring and stable:

```txt
id
status
timestamp
source_links
input_hash
confidence_notes
raw_verdict
review_state
next_allowed_actions
```

The agent can write human text on top. The tool result should remain structured enough to debug.

## Logging requirements

Every agent run should create receipts:

```txt
run_id
user_action
input_payload
tool_calls
source_records
returned_result
reviewer
approval_state
final_action
```

Agentropolis should be able to answer what happened, why it happened, and who approved it.

## Repo role

This repository owns the primary implementation lane for Hermes-backed Agentropolis work.

AGENTROPOLIS-AGENT-MCP should define:

```txt
Hermes tool contracts
MCP server boundaries
agent workflow receipts
safe write gates
skill execution patterns
API schemas for backend agent work
```

## Final lock

Agentropolis is not chat with my app.

Agentropolis is structured agent labor behind controlled product actions.

The button belongs to the app. The workflow belongs to Hermes. The rules belong to Skills. The receipts belong to the API.
