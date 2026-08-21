const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const ACTIVE = new Set(['RESERVED', 'STARTING', 'RUNNING']);

export function canaryReadiness(env = {}) {
  const reasons = [];
  const maxJobs = Number(env.CANARY_MAX_JOBS);
  const maxCost = Number(env.CANARY_MAX_COST_MICRO_USD);

  if (!nonEmpty(env.CANARY_PROVIDER_ID)) reasons.push('CANARY_PROVIDER_ID is not configured');
  if (!nonEmpty(env.CANARY_RUNTIME_ID)) reasons.push('CANARY_RUNTIME_ID is not configured');
  if (!Number.isInteger(maxJobs) || maxJobs !== 1) reasons.push('CANARY_MAX_JOBS must equal 1 for beta');
  if (!Number.isInteger(maxCost) || maxCost <= 0) reasons.push('CANARY_MAX_COST_MICRO_USD must be a positive integer');
  if (env.CANARY_BUDGET_CLASS !== 'LOW' && env.CANARY_BUDGET_CLASS !== 'FREE') reasons.push('CANARY_BUDGET_CLASS must be FREE or LOW');
  if (env.OPS_SUPERVISION_ENABLED !== 'true') reasons.push('OPS supervision must be enabled');
  if (env.EXECUTION_CORRIDOR_ENABLED !== 'true') reasons.push('execution corridor must be enabled');

  return {
    ready: reasons.length === 0,
    armed: env.EXECUTION_MODE === 'CANARY' && env.CANARY_EXECUTION_ENABLED === 'true',
    provider_id: nonEmpty(env.CANARY_PROVIDER_ID) ? env.CANARY_PROVIDER_ID : null,
    runtime_id: nonEmpty(env.CANARY_RUNTIME_ID) ? env.CANARY_RUNTIME_ID : null,
    max_jobs: Number.isInteger(maxJobs) ? maxJobs : 0,
    max_cost_micro_usd: Number.isInteger(maxCost) ? maxCost : 0,
    budget_class: env.CANARY_BUDGET_CLASS || null,
    reasons,
    authority: 'READINESS_ONLY',
  };
}

export function validateCanaryAdmissionRequest(request = {}, receipt = {}, env = {}) {
  const readiness = canaryReadiness(env);
  const reasons = [...readiness.reasons];

  if (!readiness.armed) reasons.push('CANARY execution is not armed');
  if (request.provider_id !== env.CANARY_PROVIDER_ID) reasons.push('provider is outside CANARY allowlist');
  if (request.runtime_id !== env.CANARY_RUNTIME_ID) reasons.push('runtime is outside CANARY allowlist');
  if (request.budget_class !== env.CANARY_BUDGET_CLASS) reasons.push('budget class is outside CANARY envelope');
  if (request.risk_class !== 'LOW') reasons.push('CANARY beta accepts LOW risk only');
  if (receipt.authority_decision !== 'ALLOW_EXECUTION' || receipt.status !== 'ACTIVE') reasons.push('active authorization receipt is required');
  if (receipt.receipt_id !== request.authorization_receipt_id && request.authorization_receipt_id) reasons.push('authorization receipt does not match request');
  if (request.human_canary_approval !== true) reasons.push('explicit human CANARY approval is required');
  if (!Number.isInteger(Number(request.estimated_cost_micro_usd)) || Number(request.estimated_cost_micro_usd) < 0) reasons.push('estimated canary cost is required');
  if (Number(request.estimated_cost_micro_usd) > Number(env.CANARY_MAX_COST_MICRO_USD)) reasons.push('estimated canary cost exceeds budget envelope');

  return { valid: reasons.length === 0, reasons, readiness };
}

export async function reserveCanaryAdmission(db, request, receipt, env = {}, now = new Date()) {
  const validation = validateCanaryAdmissionRequest(request, receipt, env);
  if (!validation.valid) return { admitted: false, reasons: validation.reasons, admission: null };
  if (!db) return { admitted: false, reasons: ['D1 binding unavailable'], admission: null };

  const maxJobs = Number(env.CANARY_MAX_JOBS);
  const existing = await db.prepare(`SELECT admission_id,status FROM execution_canary_admissions
    WHERE status IN ('RESERVED','STARTING','RUNNING') ORDER BY reserved_at ASC`).all();
  const active = (existing?.results || []).filter((row) => ACTIVE.has(row.status));
  if (active.length >= maxJobs) return { admitted: false, reasons: ['authoritative CANARY job limit has been reached'], admission: null };

  const slot = active.length + 1;
  const admission = {
    admission_id: `canary_${crypto.randomUUID()}`,
    slot,
    authorization_receipt_id: receipt.receipt_id,
    production_id: receipt.production_id,
    job_id: receipt.job_id,
    provider_id: receipt.provider_id,
    runtime_id: receipt.runtime_id,
    capability: receipt.capability,
    budget_class: receipt.budget_class,
    status: 'RESERVED',
    reserved_at: new Date(now).toISOString(),
    released_at: null,
  };

  try {
    await db.prepare(`INSERT INTO execution_canary_admissions
      (admission_id,slot,authorization_receipt_id,production_id,job_id,provider_id,runtime_id,capability,budget_class,status,reserved_at,released_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(
        admission.admission_id,
        admission.slot,
        admission.authorization_receipt_id,
        admission.production_id,
        admission.job_id,
        admission.provider_id,
        admission.runtime_id,
        admission.capability,
        admission.budget_class,
        admission.status,
        admission.reserved_at,
        admission.released_at,
      ).run();
    return { admitted: true, reasons: [], admission };
  } catch {
    return { admitted: false, reasons: ['authoritative CANARY slot reservation failed'], admission: null };
  }
}

export async function releaseCanaryAdmission(db, admissionId, terminalStatus, now = new Date()) {
  if (!db) throw new Error('D1 binding unavailable');
  if (!['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'CANCELLED', 'RELEASED'].includes(terminalStatus)) {
    throw new TypeError('invalid CANARY terminal status');
  }
  const result = await db.prepare(`UPDATE execution_canary_admissions
    SET status=?, released_at=? WHERE admission_id=? AND status IN ('RESERVED','STARTING','RUNNING')`)
    .bind(terminalStatus, new Date(now).toISOString(), admissionId).run();
  return { admission_id: admissionId, released: Number(result?.meta?.changes ?? result?.changes ?? 0) > 0, status: terminalStatus };
}
