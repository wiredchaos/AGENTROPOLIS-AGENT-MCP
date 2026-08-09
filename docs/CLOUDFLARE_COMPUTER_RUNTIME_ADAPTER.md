# Cloudflare Computer Runtime Adapter

## Decision

AGENTROPOLIS adopts Cloudflare Computer as an **optional experimental execution substrate** behind the Intelligence Grid Runtime Router.

It is not a sovereign runtime, memory authority, trust authority, or required dependency. The city must remain portable if this adapter disappears.

Upstream observed package: `@cloudflare/computer@0.1.0-alpha.1`.

Status: `EXPERIMENTAL_QUARANTINED`.
Production approval: **DEFAULT DENY**.

## Placement

```text
HERMES / Applications
  -> Dispatch Protocol
  -> Policy / Risk
  -> 54-T Containment Verification Layer
  -> Runtime Router
       -> local / BYOH
       -> approved sandbox provider
       -> Cloudflare Computer adapter
            -> worker-javascript
            -> worker-shell
            -> container
  -> Output Membrane
  -> Result Validation
  -> Governed Memory Write
  -> Permanent Receipt
```

Cloudflare Computer workspace state may hold scratch files, project files, execution state, and build artifacts. It must not silently become AGENTROPOLIS canonical identity, long-term memory, RAG truth, policy, provenance, trust, or audit history.

## Least-Capability Routing

The Runtime Router must select the least-powerful **approved** backend capable of completing a task.

| Workload | Preferred lane |
| --- | --- |
| Read/search/text transforms | `worker-shell` |
| Bounded structured JavaScript | `worker-javascript` |
| npm/native binaries/full Linux | `container` |
| Browser automation | Governed Browser Surface, not Computer |
| GPU inference/training | BYOH or approved GPU provider |
| High-impact external action | Execution Lane with policy and approval gates |

Network access always requires a separate authority decision.

## Authority Invariants

1. Tool availability does not grant capability authorization.
2. Capability authorization does not grant network authorization.
3. Network authorization does not grant secret access.
4. Raw secrets never enter model context or untrusted runtime output.
5. Runtime state cannot self-promote into sovereign memory.
6. An adapter cannot self-certify or self-escalate.

## 54-T Certification Profile

Before any live Cloudflare Computer execution is enabled, 54-T must independently verify:

- effective direct and transitive capabilities
- default-deny egress and explicit allowlists
- Worker/global outbound behavior
- host-side capability bridges
- Git remote/network authority
- artifact import/export authority
- cross-workspace isolation
- Durable Object / workspace identity boundaries
- lexical path escape and traversal rejection
- symlink traversal behavior
- concurrent path replacement / mutable-workspace race conditions
- subprocess and native binary reachability for container mode
- timeout, cancellation, and post-cancel side effects
- CPU, memory, stdio, input, result, module, directory, capability-call, and concurrency limits
- stdout/stderr/log secret leakage
- environment-variable isolation
- RPC abuse and confused-deputy paths
- persistence semantics after failure or cancellation
- receipt completeness and immutable audit export

### Required result states

`PASS_EXPERIMENTAL` permits bounded laboratory use only.

`PASS_WORKLOAD_PROFILE` permits only the exact backend + capability + network + limits profile reproduced in testing.

`FAIL` or `UNVERIFIED` remains default deny.

Production approval requires internal reproduction of containment claims and an explicit human approval record.

## Known Upstream Caveats

Cloudflare labels Computer preview-only and not suitable for production use at this time. The API is unstable.

The JavaScript backend documents path confinement and symlink checks, while warning that these checks are not an atomic inode-style security boundary against a separate privileged principal concurrently replacing paths in the same mutable Workspace. AGENTROPOLIS therefore treats mutable-workspace race testing as mandatory rather than assuming path checks are sufficient.

## Rollout

### Phase 0 — complete in this change

- register the adapter as experimental/quarantined
- expose a read-only manifest
- expose least-capability routing recommendations
- attach the 54-T certification checklist
- keep execution disabled

### Phase 1 — laboratory certification

- pin exact upstream package/commit
- provision isolated non-production Cloudflare resources
- run the 54-T certification suite
- retain benchmark and containment receipts

### Phase 2 — bounded pilot

- enable only reproduced backend profiles
- default network deny
- no production credentials
- one workspace identity per bounded task/session as required by the threat model
- mandatory execution receipts

### Phase 3 — production eligibility

Production eligibility is profile-specific, not adapter-wide. Each backend/capability/network combination requires a valid current certification receipt.
