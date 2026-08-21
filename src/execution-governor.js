const FORBIDDEN_SECRET_KEYS = /(^|_)(api_?key|secret|private_?key|seed|seed_?phrase|password|token|credential)s?$/i;

export const EXECUTION_DECISIONS = Object.freeze({
  ALLOW: 'ALLOW_EXECUTION',
  DENY: 'DENY_EXECUTION',
  REVIEW: 'REVIEW_REQUIRED',
});

export const RISK_CLASSES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const BUDGET_CLASSES = Object.freeze(['FREE', 'LOW', 'STANDARD', 'PREMIUM', 'UNBOUNDED_WITH_APPROVAL']);

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

function containsForbiddenSecret(value, path = '') {
  if (Array.isArray(value)) return value.some((item, index) => containsForbiddenSecret(item, `${path}[${index}]`));
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => FORBIDDEN_SECRET_KEYS.test(key) || containsForbiddenSecret(child, path ? `${path}.${key}` : key));
}

function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCapabilityHandle(handle) {
  const errors = [];
  if (!isObject(handle)) return { valid: false, errors: ['capability_handle must be an object'] };
  if (!nonEmpty(handle.handle_id)) errors.push('capability_handle.handle_id is required');
  if (!nonEmpty(handle.scope)) errors.push('capability_handle.scope is required');
  if (!nonEmpty(handle.subject)) errors.push('capability_handle.subject is required');
  if (!nonEmpty(handle.issuer)) errors.push('capability_handle.issuer is required');
  if (handle.sealed !== true) errors.push('capability_handle must be sealed');
  if (containsForbiddenSecret(handle)) errors.push('capability_handle must not contain raw secrets');
  return { valid: errors.length === 0, errors };
}

export function validateExecutionRequest(request) {
  const errors = [];
  if (!isObject(request)) return { valid: false, errors: ['request must be an object'] };
  for (const field of ['request_id', 'production_id', 'job_id', 'provider_id', 'runtime_id', 'adapter_id', 'capability']) {
    if (!nonEmpty(request[field])) errors.push(`${field} is required`);
  }
  if (!RISK_CLASSES.includes(request.risk_class)) errors.push('risk_class is invalid');
  if (!BUDGET_CLASSES.includes(request.budget_class)) errors.push('budget_class is invalid');
  if (!isObject(request.attestations)) errors.push('attestations are required');
  if (!isObject(request.provenance)) errors.push('provenance is required');
  if (containsForbiddenSecret(request)) errors.push('execution request must not contain raw secrets');
  const handle = validateCapabilityHandle(request.capability_handle);
  if (!handle.valid) errors.push(...handle.errors);
  return { valid: errors.length === 0, errors };
}

export async function authorizeExecution(request, policy = {}) {
  const validation = validateExecutionRequest(request);
  const reasons = [...validation.errors];

  const attest = request?.attestations || {};
  if (attest['54t'] !== 'VERIFIED') reasons.push('54-T attestation is missing or unverified');
  if (attest.adapter !== 'VERIFIED') reasons.push('adapter attestation is missing or unverified');
  if (attest.egress !== 'VERIFIED') reasons.push('egress attestation is missing or unverified');
  if (attest.provider !== 'VERIFIED') reasons.push('provider attestation is missing or unverified');

  if (policy.allowed_capabilities && !policy.allowed_capabilities.includes(request?.capability)) reasons.push('capability is not allowed by policy');
  if (policy.allowed_providers && !policy.allowed_providers.includes(request?.provider_id)) reasons.push('provider is not allowed by policy');
  if (policy.allowed_runtimes && !policy.allowed_runtimes.includes(request?.runtime_id)) reasons.push('runtime is not allowed by policy');
  if (policy.allowed_budget_classes && !policy.allowed_budget_classes.includes(request?.budget_class)) reasons.push('budget class is not allowed by policy');

  const humanRequired = policy.require_human_approval === true || ['HIGH', 'CRITICAL'].includes(request?.risk_class);
  if (humanRequired && request?.human_approval?.state !== 'APPROVED') reasons.push('human approval is required');
  if (request?.risk_class === 'CRITICAL' && policy.require_dual_control !== false) {
    const approvals = Array.isArray(request?.human_approval?.approvers) ? new Set(request.human_approval.approvers.filter(nonEmpty)) : new Set();
    if (approvals.size < 2) reasons.push('critical execution requires dual control');
  }

  const decision = reasons.length === 0 ? EXECUTION_DECISIONS.ALLOW : EXECUTION_DECISIONS.DENY;
  const receiptPayload = {
    receipt_version: '1.0.0-beta',
    decision,
    request_id: request?.request_id ?? null,
    production_id: request?.production_id ?? null,
    job_id: request?.job_id ?? null,
    provider_id: request?.provider_id ?? null,
    runtime_id: request?.runtime_id ?? null,
    adapter_id: request?.adapter_id ?? null,
    capability: request?.capability ?? null,
    capability_handle_id: request?.capability_handle?.handle_id ?? null,
    risk_class: request?.risk_class ?? null,
    budget_class: request?.budget_class ?? null,
    attestations: request?.attestations ?? {},
    reasons,
    provenance: request?.provenance ?? {},
    invocation_performed: false,
  };
  const receipt_hash = await sha256(stable(receiptPayload));
  return { ...receiptPayload, receipt_hash };
}
