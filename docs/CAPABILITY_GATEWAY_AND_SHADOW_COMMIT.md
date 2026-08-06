# Capability Gateway and Shadow Commit

AGENTROPOLIS-AGENT-MCP is the governed capability membrane between isolated civic applications and external resources.

## Default rule

Agents and applications receive no ambient connector access. Every resource introduction must identify the account, resource, scope, permitted actions, duration, budget, and approval class.

## Capability namespace

```text
civic.app.build
civic.app.preview
civic.app.request_capability
civic.app.simulate_action
civic.app.submit_approval_bundle
civic.app.revalidate_action
civic.app.commit_action
civic.app.read_receipt
```

## Execution classes

- Observe: bounded reads only
- Analyze: local transformation and scoring
- Draft: produces proposed content or mutations
- Simulate: changes shadow state only
- Commit: performs an approved external mutation

Commit is never implied by any lower class.

## Shadow Commit contract

A simulated response must be labeled simulated, carry the predicted resource version, and remain isolated from the real service. Before commit, the gateway must recheck identity, capability validity, external resource version, policy, budget, and approval. A mismatch returns the action to HERMES for review.

## Receipt requirements

Receipts record capability ID, resource reference, requested action, simulation hash, approval identity, revalidation result, commit result, timestamps, policy decision, drift result, and rollback status. Secrets and raw bearer tokens are prohibited.