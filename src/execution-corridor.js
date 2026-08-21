import {
  authorizeExecution,
  BUDGET_CLASSES,
  EXECUTION_DECISIONS,
  RISK_CLASSES,
  validateExecutionRequest,
} from './execution-governor.js';

export const EXECUTION_MODES = Object.freeze(['AUTHORIZATION_ONLY', 'DRY_RUN', 'CANARY', 'LIVE']);
export const OPS_STATES = Object.freeze(['AUTHORIZED', 'QUEUED', 'STARTING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT', 'CANCELLED', 'RECOVERING', 'DEAD_LETTERED']);
export const HERMES_CITY_STATES = Object.freeze(['idle', 'authorization_pending', 'working', 'executing', 'blocked', 'recovering', 'complete']);

const SECRET_KEYS = /(^|_)(api_?key|secret|private_?key|seed|seed_?phrase|password|token|credential)s?$/i;
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function executionMode(env = {}) {
  const mode = env.EXECUTION_MODE;
  return EXECUTION_MODES.includes(mode) ? mode : 'AUTHORIZATION_ONLY';
}

export function containsSecretMaterial(value) {
  if (Array.isArray(value)) return value.some(containsSecretMaterial);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => SECRET_KEYS.test(key) || containsSecretMaterial(child));
}

function corridorEnabled(env) {
  return env.EXECUTION_CORRIDOR_ENABLED === 'true';
}

function requiredApprovals(request) {
  if (request.risk_class === 'CRITICAL') return Array.isArray(request.required_human_approvals) && request.required_human_approvals.length >= 2;
  if (request.risk_class === 'HIGH') return Array.isArray(request.required_human_approvals) && request.required_human_approvals.length >= 1;
  return true;
}

function validateCanary(request, env) {
  const reasons = [];
  if (executionMode(env) !== 'CANARY') return reasons;
  if (!nonEmpty(env.CANARY_PROVIDER_ID) || !nonEmpty(env.CANARY_RUNTIME_ID)) reasons.push('CANARY provider/runtime allowlist is not configured');
  if (request.provider_id !== env.CANARY_PROVIDER_ID || request.runtime_id !== env.CANARY_RUNTIME_ID) reasons.push('provider/runtime is outside the CANARY allowlist');
  const maxJobs = Number(env.CANARY_MAX_JOBS);
  if (!Number.isInteger(maxJobs) || maxJobs <= 0) reasons.push('CANARY_MAX_JOBS is not configured');
  if (Number.isInteger(Number(request.canary_job_count)) && Number(request.canary_job_count) >= maxJobs) reasons.push('CANARY_MAX_JOBS limit has been reached');
  if (env.CANARY_BUDGET_CLASS && request.budget_class !== env.CANARY_BUDGET_CLASS) reasons.push('budget class is outside the CANARY limit');
  return reasons;
}

export async function createAuthorizationReceipt(request, env = {}, now = new Date()) {
  const validation = validateExecutionRequest(request);
  const reasons = [...validation.errors];
  if (!corridorEnabled(env)) reasons.push('execution corridor is disabled');
  if (executionMode(env) === 'LIVE' && env.LIVE_EXECUTION_ENABLED !== 'true') reasons.push('LIVE execution is disabled');
  if (!requiredApprovals(request)) reasons.push('required human approvals are incomplete');
  if (containsSecretMaterial(request)) reasons.push('request contains raw secret material');
  if (request?.capability_handle?.scope !== request?.capability) reasons.push('capability handle scope does not match capability');
  if (!request?.adapter_registered) reasons.push('adapter is not registered for this authorization request');
  reasons.push(...validateCanary(request, env));

  const governed = await authorizeExecution(request, env.AUTHORIZATION_POLICY || {});
  reasons.push(...governed.reasons);
  const uniqueReasons = [...new Set(reasons)];
  const decision = uniqueReasons.length === 0 ? EXECUTION_DECISIONS.ALLOW :
    uniqueReasons.some((reason) => reason.includes('approval') || reason.includes('REVIEW'))
      ? EXECUTION_DECISIONS.REVIEW : EXECUTION_DECISIONS.DENY;
  const issuedAt = new Date(now).toISOString();
  const lifetime = Math.min(positive(env.AUTHORIZATION_TTL_SECONDS, 300), 3600);
  const expiresAt = new Date(new Date(now).getTime() + lifetime * 1000).toISOString();
  const evidence = {
    '54t': request.attestations?.['54t'] ?? 'UNVERIFIED',
    provider: request.attestations?.provider ?? 'UNVERIFIED',
    adapter: request.attestations?.adapter ?? 'UNVERIFIED',
    egress: request.attestations?.egress ?? 'UNVERIFIED',
  };
  const safeReceipt = {
    receipt_id: `auth_${crypto.randomUUID()}`,
    request_id: request.request_id,
    production_id: request.production_id,
    job_id: request.job_id,
    provider_id: request.provider_id,
    runtime_id: request.runtime_id,
    adapter_id: request.adapter_id,
    capability: request.capability,
    capability_handle_id: request.capability_handle?.handle_id ?? null,
    authority_decision: decision,
    policy_profile: request.policy_profile ?? env.POLICY_PROFILE ?? 'NORMAL_CREATOR',
    risk_class: request.risk_class,
    budget_class: request.budget_class,
    attestation_summary: evidence,
    input_hash: await sha256(stable({ ...request, capability_handle: { handle_id: request.capability_handle?.handle_id, scope: request.capability_handle?.scope } })),
    issued_at: issuedAt,
    expires_at: expiresAt,
    revoked_at: null,
    status: decision === EXECUTION_DECISIONS.ALLOW ? 'ACTIVE' : 'DENIED',
    mode: executionMode(env),
    reasons: uniqueReasons,
    invocation_performed: false,
  };
  safeReceipt.authorization_hash = await sha256(stable(safeReceipt));
  return safeReceipt;
}

export async function persistAuthorizationReceipt(db, receipt) {
  if (!db) throw new Error('D1 binding unavailable');
  await db.prepare(`INSERT INTO execution_authorizations
    (receipt_id,request_id,production_id,job_id,provider_id,runtime_id,adapter_id,capability,capability_handle_id,
     authority_decision,policy_profile,risk_class,budget_class,attestation_summary,input_hash,authorization_hash,
     issued_at,expires_at,revoked_at,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(receipt.receipt_id, receipt.request_id, receipt.production_id, receipt.job_id, receipt.provider_id,
      receipt.runtime_id, receipt.adapter_id, receipt.capability, receipt.capability_handle_id,
      receipt.authority_decision, receipt.policy_profile, receipt.risk_class, receipt.budget_class,
      JSON.stringify(receipt.attestation_summary), receipt.input_hash, receipt.authorization_hash,
      receipt.issued_at, receipt.expires_at, receipt.revoked_at, receipt.status).run();
  return { receipt_id: receipt.receipt_id, persisted: true };
}

export async function revokeAuthorizationReceipt(db, receiptId, revokedAt = new Date()) {
  if (!nonEmpty(receiptId)) throw new TypeError('receipt_id is required');
  if (!db) throw new Error('D1 binding unavailable');
  const result = await db.prepare("UPDATE execution_authorizations SET revoked_at=?, status='REVOKED' WHERE receipt_id=? AND status='ACTIVE'")
    .bind(new Date(revokedAt).toISOString(), receiptId).run();
  return { receipt_id: receiptId, revoked: Number(result?.meta?.changes ?? result?.changes ?? 0) > 0 };
}

function sameScope(receipt, request) {
  return receipt.job_id === request.job_id && receipt.provider_id === request.provider_id &&
    receipt.runtime_id === request.runtime_id && receipt.capability === request.capability &&
    receipt.production_id === request.production_id && receipt.capability_handle_id === request.capability_handle?.handle_id;
}

export function validateAuthorizationReceipt(receipt, request, env = {}, now = new Date()) {
  const reasons = [];
  if (!isObject(receipt)) reasons.push('authorization receipt is missing');
  if (!sameScope(receipt || {}, request || {})) reasons.push('authorization receipt scope does not match request');
  if (receipt?.authority_decision !== EXECUTION_DECISIONS.ALLOW) reasons.push('authorization receipt does not allow execution');
  if (receipt?.status !== 'ACTIVE') reasons.push('authorization receipt is not active');
  if (receipt?.revoked_at) reasons.push('authorization receipt is revoked');
  if (!receipt?.expires_at || new Date(receipt.expires_at).getTime() <= new Date(now).getTime()) reasons.push('authorization receipt is expired');
  if (executionMode(env) === 'AUTHORIZATION_ONLY') reasons.push('execution mode permits authorization only');
  if (!['DRY_RUN', 'CANARY'].includes(executionMode(env))) reasons.push('execution mode does not permit dry-run invocation');
  if (!request?.adapter_registered) reasons.push('adapter is not registered');
  if (request?.capability_handle?.scope !== request?.capability) reasons.push('capability handle scope does not match capability');
  if (request?.attestations?.['54t'] !== 'VERIFIED' || request?.attestations?.provider !== 'VERIFIED' ||
      request?.attestations?.adapter !== 'VERIFIED' || request?.attestations?.egress !== 'VERIFIED') {
    reasons.push('required execution evidence is no longer valid');
  }
  return { valid: reasons.length === 0, reasons };
}

export async function dryRunInvocation(receipt, request, env = {}, now = new Date()) {
  const validation = validateAuthorizationReceipt(receipt, request, env, now);
  return {
    decision: validation.valid ? EXECUTION_DECISIONS.ALLOW : EXECUTION_DECISIONS.DENY,
    invocation_performed: false,
    reasons: validation.reasons,
    receipt_id: receipt?.receipt_id ?? null,
  };
}

export function createOpsEvent(state, receipt, attempt = 1, now = new Date()) {
  if (!OPS_STATES.includes(state)) throw new TypeError('Invalid OPS lifecycle state');
  return {
    event_id: `ops_${crypto.randomUUID()}`,
    authorization_receipt_id: receipt?.receipt_id ?? null,
    production_id: receipt?.production_id ?? null,
    job_id: receipt?.job_id ?? null,
    runtime_id: receipt?.runtime_id ?? null,
    state,
    attempt,
    timestamp: new Date(now).toISOString(),
  };
}

export function toHermesCityProjection(state, details = {}) {
  const map = {
    AUTHORIZED: 'authorization_pending', QUEUED: 'working', STARTING: 'executing', RUNNING: 'executing',
    SUCCEEDED: 'complete', FAILED: 'blocked', TIMED_OUT: 'blocked', CANCELLED: 'blocked',
    RECOVERING: 'recovering', DEAD_LETTERED: 'blocked',
  };
  return {
    state: map[state] ?? 'idle',
    production_id: details.production_id ?? null,
    job_id: details.job_id ?? null,
    runtime_id: details.runtime_id ?? null,
    authorization_receipt_id: details.authorization_receipt_id ?? null,
    attempt: Number.isInteger(details.attempt) ? details.attempt : 0,
    timestamp: details.timestamp ?? new Date().toISOString(),
    authority: 'PROJECTION_ONLY',
  };
}

function positive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

export { BUDGET_CLASSES, RISK_CLASSES };
