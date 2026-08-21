import {
  dryRunInvocation,
  loadAuthorizationReceipt,
  toHermesCityProjection,
} from './execution-corridor.js';
import { opsSupervisionEnabled, recordOpsEvent } from './ops-supervisor.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const DRY_RUN_STATES = Object.freeze({ ACCEPTED: 'DRY_RUN_ACCEPTED', DENIED: 'DRY_RUN_DENIED' });

export function validateDryRunEnvelope(envelope = {}) {
  const errors = [];
  if (!isObject(envelope)) return { valid: false, errors: ['dry-run envelope must be an object'] };
  if (!isObject(envelope.execution_request)) errors.push('execution_request is required');
  if (!isObject(envelope.authorization_receipt)) errors.push('authorization_receipt is required');
  if (isObject(envelope.authorization_receipt) && typeof envelope.authorization_receipt.receipt_id !== 'string') {
    errors.push('authorization_receipt.receipt_id is required');
  }
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
    simulated_steps: [
      'resolve_authoritative_authorization_receipt',
      'validate_authorization_receipt',
      'recheck_54t_provider_adapter_egress_evidence',
      'confirm_capability_scope',
      'confirm_runtime_and_budget_boundary',
      'confirm_authorized_input_hash',
      'emit_non_invoking_dry_run_receipt',
    ],
    provider_invocation: 'DISABLED',
  };
}

function denied(request, reasons, now = new Date(), receipt = null) {
  return {
    state: DRY_RUN_STATES.DENIED,
    reasons,
    authorization_receipt_id: receipt?.receipt_id ?? null,
    authorization_hash: receipt?.authorization_hash ?? null,
    invocation_performed: false,
    simulation: null,
    ops_event: null,
    hermes_city: toHermesCityProjection('FAILED', {
      production_id: request?.production_id ?? null,
      job_id: request?.job_id ?? null,
      runtime_id: request?.runtime_id ?? null,
      authorization_receipt_id: receipt?.receipt_id ?? null,
      timestamp: new Date(now).toISOString(),
    }),
  };
}

export async function executeGovernedDryRun(envelope, env = {}, now = new Date()) {
  const validation = validateDryRunEnvelope(envelope);
  const request = envelope?.execution_request ?? {};
  if (!validation.valid) return denied(request, validation.errors, now);

  if (!env.DB) return denied(request, ['authoritative authorization store is unavailable'], now);

  let receipt;
  try {
    receipt = await loadAuthorizationReceipt(env.DB, envelope.authorization_receipt.receipt_id);
  } catch {
    return denied(request, ['authoritative authorization lookup failed'], now);
  }
  if (!receipt) return denied(request, ['authoritative authorization receipt was not found'], now);

  const invocation = await dryRunInvocation(receipt, request, env, now);
  const allowed = invocation.decision === 'ALLOW_EXECUTION';
  const baseResult = {
    state: allowed ? DRY_RUN_STATES.ACCEPTED : DRY_RUN_STATES.DENIED,
    reasons: invocation.reasons,
    authorization_receipt_id: receipt.receipt_id,
    authorization_hash: receipt.authorization_hash ?? null,
    invocation_performed: false,
    simulation: allowed ? simulationPlan(request) : null,
    ops_event: null,
    hermes_city: toHermesCityProjection(allowed ? 'QUEUED' : 'FAILED', {
      production_id: request.production_id ?? null,
      job_id: request.job_id ?? null,
      runtime_id: request.runtime_id ?? null,
      authorization_receipt_id: receipt.receipt_id,
      timestamp: new Date(now).toISOString(),
    }),
  };

  if (!opsSupervisionEnabled(env)) return baseResult;

  try {
    const supervised = await recordOpsEvent(env.DB, allowed ? 'QUEUED' : 'FAILED', receipt, 1, now);
    return {
      ...baseResult,
      ops_event: supervised.event,
      hermes_city: supervised.projection,
    };
  } catch {
    return denied(request, [...invocation.reasons, 'OPS supervision persistence failed'], now, receipt);
  }
}

export function createDryRunReceipt(result, now = new Date()) {
  return {
    receipt_type: 'GOVERNED_DRY_RUN',
    authorization_receipt_id: result?.authorization_receipt_id ?? null,
    authorization_hash: result?.authorization_hash ?? null,
    state: result?.state ?? DRY_RUN_STATES.DENIED,
    provider_invocation: 'DISABLED',
    invocation_performed: false,
    simulation: result?.simulation ?? null,
    ops_event_id: result?.ops_event?.event_id ?? null,
    reasons: Array.isArray(result?.reasons) ? result.reasons : [],
    timestamp: new Date(now).toISOString(),
  };
}
