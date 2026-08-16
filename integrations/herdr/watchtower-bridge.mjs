import { mkdirSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function createWatchtowerJsonlSink(filePath) {
  const resolved = resolve(filePath);
  mkdirSync(dirname(resolved), { recursive: true, mode: 0o700 });
  return (event) => appendFileSync(resolved, `${JSON.stringify(event)}\n`, { encoding: 'utf8', mode: 0o600 });
}

export function toWorkflowGenomeObservation(event) {
  return {
    schema: 'agentropolis.workflow_genome.observation.v1',
    source: 'herdr',
    receipt_id: event.receipt_id,
    agent_name: event.agent_name,
    workspace_id: event.workspace_id,
    pane_id: event.pane_id,
    capability: event.capability,
    transition: event.transition,
    observed_at: event.observed_at,
    outcome_state: event.state_after,
    verification_state: 'unverified',
    promotable: false,
    correctness_inference: false
  };
}
