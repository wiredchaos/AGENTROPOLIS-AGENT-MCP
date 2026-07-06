# Hermes Assigned Agents Doctrine

Hermes Skills are not standalone bots. In Agentropolis they become assigned operating manuals for named agents.

```text
Skill -> Role Contract -> Assigned Agent -> Trigger/Route -> Guardrails -> Logs
```

## Core Lock

Skills are tools. Agents are accountable operators. Sessions are state. Profiles are identities. Gateways are channels. Cron and webhooks are non-touch triggers. Guardrails are the leash.

## Why This Exists

Agentropolis needs non-touch infrastructure without uncontrolled autonomy. Hermes Skills provide reusable instructions. Hermes sessions provide runnable state. Agentropolis agents provide assignment, accountability, boundaries, and reporting.

The system should be autonomous enough to inspect, draft, branch, and report. It should remain approval-gated for merge, delete, spend, publish, deploy, secret rotation, or any irreversible action.

## Assigned Agent Model

```yaml
agent:
  name: Repo Steward
  tier: infrastructure
  owns:
    - repository documentation
    - branch-based updates
    - pull request preparation
    - changelog drafts
  loads:
    - github-pr-workflow
    - docs-sync
    - canon-registry-update
    - test-driven-development
  allowed:
    - inspect repositories
    - create branches
    - edit documentation
    - open pull requests
    - produce task reports
  approval_required:
    - merge pull requests
    - delete files
    - change secrets
    - publish releases
    - deploy infrastructure
```

## Infrastructure Agents

| Agent | Role | Default Autonomy | Approval Gate |
| --- | --- | --- | --- |
| Session Steward | compress, resume, archive, prune old ended sessions | run housekeeping reports | delete active state |
| Repo Steward | docs sync, README updates, changelog patches | branch and draft PRs | merge or destructive edits |
| Skill Steward | convert workflows into Hermes/CHAOS Skills | draft or stage skill changes | install/delete skills globally |
| Memory Steward | extract canon and update registries | propose canon deltas | overwrite locked canon |
| Ops Steward | cron, webhooks, health checks | inspect and report | deploy/restart services |
| Security Steward | secrets, permissions, guardrails | audit and flag | rotate keys or alter permissions |
| Dispatch Steward | route work to correct agent bundle | classify and assign | override security blocks |

## Non-Touch Trigger Sources

Agents may be invoked by:

- cron schedules
- GitHub issues or labels
- pull request events
- Discord, Slack, Telegram, or CLI commands
- file watchers
- dashboard/API calls
- session resume events

Every trigger must create a logged session with source metadata, loaded skill bundle, requested action, output summary, and approval status.

## Guardrail Doctrine

```text
Autonomous to inspect.
Autonomous to draft.
Autonomous to branch.
Autonomous to report.
Approval-gated to merge, delete, spend, deploy, or publish.
```

## Hermes Skill Bundle Pattern

```bash
hermes bundles create agentropolis-repo-steward \
  --skill github-pr-workflow \
  --skill docs-sync \
  --skill canon-registry-update \
  --skill changelog-writer \
  -d "Agentropolis repository stewardship with approval gates"
```

## Recommended Workspace Shape

```text
~/.hermes/
├─ skills/
│  └─ agentropolis/
│     ├─ canon-registry-update/
│     ├─ repo-docs-sync/
│     ├─ district-router/
│     ├─ github-pr-steward/
│     └─ session-maintenance/
├─ skill-bundles/
│  ├─ repo-steward.yaml
│  ├─ skill-steward.yaml
│  ├─ memory-steward.yaml
│  ├─ ops-steward.yaml
│  └─ security-steward.yaml
├─ guardrails.yaml
└─ routing.yaml
```

## MCP Fit

AGENTROPOLIS-AGENT-MCP should treat assigned agents as routed tool users, not free-roaming personas. MCP servers expose tools. Agent contracts decide who can call which tools, under which trigger, with what approval level.

## Execution Rule

No assigned agent may silently perform irreversible infrastructure actions. Non-touch does not mean no-control. Non-touch means the system can prepare, route, document, and stage work without manual prompting while preserving human approval at the danger line.
