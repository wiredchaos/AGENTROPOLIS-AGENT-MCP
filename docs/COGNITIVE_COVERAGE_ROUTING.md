# Cognitive Coverage Routing Contract

## Purpose

This contract maps ATG cognitive coverage requirements to governed MCP capabilities. It does not create eight personality agents and does not allow a reasoning classification to grant tool authority.

## Routing sequence

```text
ATG transaction
  -> read authorization class
  -> read required cognitive functions
  -> inspect completed assessments and evidence
  -> route missing functions to eligible read or analysis capabilities
  -> resolve material conflicts
  -> run authority and policy gate
  -> expose approved execution capability
  -> validate result
  -> emit receipt
```

## Capability metadata

Every capability that can satisfy cognitive coverage should declare:

```json
{
  "name": "staging-health-check",
  "cognitive_functions": ["SE_REALITY"],
  "capability_class": "OBSERVE",
  "risk_level": "LOW",
  "requires_authority": false,
  "inputs": ["service_id", "environment"],
  "produces": ["runtime_evidence"],
  "may_execute": false
}
```

Execution tools remain separate:

```json
{
  "name": "cloudflare-staging-deploy",
  "cognitive_functions": ["TE_EXECUTION"],
  "capability_class": "EXECUTE",
  "risk_level": "MEDIUM",
  "requires_authority": true,
  "requires_evidence": [
    "architecture_validation",
    "test_results",
    "runtime_health"
  ],
  "produces": ["execution_receipt"]
}
```

## Function-to-capability examples

| Function | Typical capability lanes |
|---|---|
| `NI_FORESIGHT` | dependency graph analysis, trajectory modeling, architecture impact review |
| `NE_SCENARIOS` | alternative generation, failure-mode exploration, option search |
| `TI_CONSISTENCY` | schema validation, static analysis, invariant checking |
| `TE_EXECUTION` | deployment planning, workflow construction, bounded mutation tools |
| `FI_INTEGRITY` | mandate comparison, prohibited-action detection, principal preference validation |
| `FE_IMPACT` | stakeholder mapping, accessibility review, community impact analysis |
| `SI_PRECEDENT` | Git history, incident archive, audit ledger, prior rollback search |
| `SE_REALITY` | health checks, live probes, tests, telemetry, current-state inspection |

## Eligibility formula

```text
capability exists
+ identity permits discovery
+ mandate includes purpose
+ policy permits invocation
+ risk profile accepts lane
+ required inputs are present
= capability eligible
```

For mutation or execution:

```text
eligible capability
+ cognitive coverage complete
+ required evidence complete
+ authority scope includes exact action
+ no unresolved material conflict
= invocation allowed
```

## Conflict handling

A material conflict must be represented explicitly rather than silently averaged away.

Example:

```text
TE_EXECUTION: deploy checks passed
SI_PRECEDENT: same dependency caused prior capability leakage
```

Permitted resolutions include:

- request additional evidence;
- add a canary step;
- narrow the mandate;
- require permission diffing;
- escalate to human review;
- abort.

## Fail-closed rules

The router must not:

- mark coverage complete from an unsupported model assertion;
- substitute one function for another without policy approval;
- let an execution tool generate the evidence that authorizes itself;
- weaken the authorization class because a preferred capability is unavailable;
- treat model confidence as authority;
- execute while a required assessment is missing or materially contradicted.

## Receipt fragment

```json
{
  "cognitive_routing_receipt": {
    "required_functions": ["TI_CONSISTENCY", "TE_EXECUTION", "SI_PRECEDENT", "SE_REALITY"],
    "routes": [
      {"function": "SI_PRECEDENT", "capability": "deployment-history-search"},
      {"function": "SE_REALITY", "capability": "staging-health-check"}
    ],
    "evidence_refs": ["audit://deploy/previous", "obs://staging/health/8421"],
    "conflicts": [],
    "coverage_status": "COMPLETE",
    "execution_eligible": true
  }
}
```

## Canon lock

MCP exposes and routes capabilities. ATG defines the transaction. AEGIS and runtime policy determine permission. AGENTROPOLIS-OPS supervises what actually happens. The human or constitutionally delegated authority remains the final authorizer for consequential action.
