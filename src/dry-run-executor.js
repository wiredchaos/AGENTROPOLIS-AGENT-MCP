import { dryRunInvocation, toHermesCityProjection } from './execution-corridor.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const DRY_RUN_STATES = Object.freeze({ ACCEPTED: 'DRY_RUN_ACCEPTED', DENIED: 'DRY_RUN_DENIED' });

export function validateDryRunEnvelope(envelope = {}) {
  const errors = [];
  if (!isObject(envelope)) return { valid: false, errors: ['dry-run envelope must be an object'] };
  if (!isObject(envelope.execution_request)) errors.push('execution_request is required');
  if (!isObject(envelope.authorization_receipt)) errors.push('authorization_receipt is required');
  if (envelope.provider_response !== undefined) errors.push('provider_response is forbidden in dry-run mode');
  if (envelope.live_result !== undefined) errors.push('live_result is forbidden in dry-run mode');
  if (envelope.invocation_performed === true) errors.push('dry-run envelope may not claim provider invocation');
  return { valid: errors.length === 0, errors };
}

function simulationPlan(request = {}) {
  return {
    provider_id: request.provider_id ?? null,
    runtime_id: request.runtime_id ?? null,
    adapter_id: request.adapter_id ?? null,
    capability: request.capability ?? null,
    production_id: request.production_id ?? null,
    job_id: request.job_id ?? null,
    simulated_steps: ['validate_authorization_receipt','recheck_54t_provider_adapter_egress_evidence','confirm_capability_scope','confirm_runtime_and_budget_boundary','emit_non_invoking_dry_run_receipt'],
    provider_invocation: 'DISABLED',
  };
}

export async function executeGovernedDryRun(envelope, env = {}, now = new Date()) {
  const validation = validateDryRunEnvelope(envelope);
  const request = envelope?.execution_request ?? {};
  const receipt = envelope?.authorization_receipt ?? null;
  if (!validation.valid) return { state: DRY_RUN_STATES.DENIED, reasons: validation.errors, invocation_performed: false, simulation: null, hermes_city: toHermesCityProjection('FAILED', { production_id: request.production_id ?? null, job_id: request.job_id ?? null }) };
  const invocation = await dryRunInvocation(receipt, request, env, now);
  const allowed = invocation.decision === 'ALLOW_EXECUTION';
  return {
    state: allowed ? DRY_RUN_STATES.ACCEPTED : DRY_RUN_STATES.DENIED,
    reasons: invocation.reasons,
    authorization_receipt_id: receipt?.receipt_id ?? null,
    authorization_hash: receipt?.authorization_hash ?? null,
    invocation_performed: false,
    simulation: allowed ? simulationPlan(request) : null,
    hermes_city: toHermesCityProjection(allowed ? 'QUEUED' : 'FAILED', { production_id: request.production_id ?? null, job_id: request.job_id ?? null, authorization_receipt_id: receipt?.receipt_id ?? null }),
  };
}

export function createDryRunReceipt(result, now = new Date()) {
  return { receipt_type: 'GOVERNED_DRY_RUN', authorization_receipt_id: result?.authorization_receipt_id ?? null, authorization_hash: result?.authorization_hash ?? null, state: result?.state ?? DRY_RUN_STATES.DENIED, provider_invocation: 'DISABLED', invocation_performed: false, simulation: result?.simulation ?? null, reasons: Array.isArray(result?.reasons) ? result.reasons : [], timestamp: new Date(now).toISOString() };
}
