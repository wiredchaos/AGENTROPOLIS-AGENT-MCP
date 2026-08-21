import { createAuthorizationReceipt, createOpsEvent, toHermesCityProjection } from './execution-corridor.js';

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const SAFE_ID = /^[a-zA-Z0-9._:-]{1,128}$/;

export const HERMES_DISPATCH_DECISIONS = Object.freeze({
  ACCEPT: 'ACCEPT_DISPATCH',
  DENY: 'DENY_DISPATCH',
});

export function validateHermesDispatchEnvelope(envelope = {}) {
  const errors = [];
  if (!isObject(envelope)) return { valid: false, errors: ['dispatch envelope must be an object'] };
  for (const field of ['dispatch_id', 'district_id', 'app_id', 'hermes_instance_id']) {
    if (!nonEmpty(envelope[field]) || !SAFE_ID.test(envelope[field])) errors.push(`${field} is required and must be a bounded identifier`);
  }
  if (!isObject(envelope.execution_request)) errors.push('execution_request is required');
  if (envelope.authority_decision !== undefined) errors.push('HERMES dispatch may not supply an authority decision');
  if (envelope.authorization_receipt !== undefined) errors.push('HERMES dispatch may not supply an authorization receipt');
  if (envelope.execution_request?.district_id && envelope.execution_request.district_id !== envelope.district_id) errors.push('district identity does not match execution request');
  if (envelope.execution_request?.app_id && envelope.execution_request.app_id !== envelope.app_id) errors.push('app identity does not match execution request');
  if (envelope.identity_attestation !== 'VERIFIED') errors.push('dispatch identity attestation is not verified');
  if (!nonEmpty(envelope.identity_receipt_id) || !SAFE_ID.test(envelope.identity_receipt_id)) errors.push('identity_receipt_id is required');
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export function bindDispatchIdentity(envelope) {
  const request = structuredClone(envelope.execution_request);
  request.district_id = envelope.district_id;
  request.app_id = envelope.app_id;
  request.hermes_dispatch = {
    dispatch_id: envelope.dispatch_id,
    hermes_instance_id: envelope.hermes_instance_id,
    identity_receipt_id: envelope.identity_receipt_id,
  };
  return request;
}

export async function authorizeHermesDispatch(envelope, env = {}, now = new Date()) {
  const validation = validateHermesDispatchEnvelope(envelope);
  if (!validation.valid) {
    return {
      decision: HERMES_DISPATCH_DECISIONS.DENY,
      reasons: validation.errors,
      invocation_performed: false,
      authorization_receipt: null,
      ops_event: null,
      hermes_city: toHermesCityProjection('FAILED', {
        production_id: envelope?.execution_request?.production_id ?? null,
        job_id: envelope?.execution_request?.job_id ?? null,
      }),
    };
  }

  const request = bindDispatchIdentity(envelope);
  const receipt = await createAuthorizationReceipt(request, env, now);
  const allowed = receipt.authority_decision === 'ALLOW_EXECUTION';
  const opsEvent = createOpsEvent(allowed ? 'AUTHORIZED' : 'FAILED', receipt, 1, now);
  const projection = toHermesCityProjection(opsEvent.state, opsEvent);

  return {
    decision: allowed ? HERMES_DISPATCH_DECISIONS.ACCEPT : HERMES_DISPATCH_DECISIONS.DENY,
    reasons: receipt.reasons,
    invocation_performed: false,
    dispatch: {
      dispatch_id: envelope.dispatch_id,
      district_id: envelope.district_id,
      app_id: envelope.app_id,
      hermes_instance_id: envelope.hermes_instance_id,
      identity_receipt_id: envelope.identity_receipt_id,
    },
    authorization_receipt: receipt,
    ops_event: opsEvent,
    hermes_city: projection,
  };
}

export function hermesDispatchAuditRecord(result, now = new Date()) {
  return {
    record_type: 'HERMES_GOVERNED_DISPATCH',
    dispatch_id: result?.dispatch?.dispatch_id ?? null,
    district_id: result?.dispatch?.district_id ?? null,
    app_id: result?.dispatch?.app_id ?? null,
    hermes_instance_id: result?.dispatch?.hermes_instance_id ?? null,
    identity_receipt_id: result?.dispatch?.identity_receipt_id ?? null,
    authorization_receipt_id: result?.authorization_receipt?.receipt_id ?? null,
    authorization_hash: result?.authorization_receipt?.authorization_hash ?? null,
    ops_event_id: result?.ops_event?.event_id ?? null,
    authority_decision: result?.authorization_receipt?.authority_decision ?? 'DENY_EXECUTION',
    invocation_performed: false,
    timestamp: new Date(now).toISOString(),
  };
}
