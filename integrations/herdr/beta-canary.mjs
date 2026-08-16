import { HerdrAdapterError } from './adapter.mjs';
import { verifyManagedHerdrSession } from './session-context.mjs';

function flattenObjects(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  out.push(value);
  if (Array.isArray(value)) {
    for (const item of value) flattenObjects(item, out);
  } else {
    for (const item of Object.values(value)) flattenObjects(item, out);
  }
  return out;
}

function findRestoreIdentity(data, kindPattern) {
  for (const node of flattenObjects(data)) {
    const label = [node.kind, node.type, node.name, node.agent, node.command].filter(Boolean).join(' ').toLowerCase();
    if (!kindPattern.test(label)) continue;
    const sessionId = node.session_id ?? node.sessionId ?? node.resume_id ?? node.resumeId ?? node.resumable_session_id ?? null;
    if (typeof sessionId === 'string' && sessionId.length > 0) {
      return { detected: true, session_identity_present: true };
    }
    return { detected: true, session_identity_present: false };
  }
  return { detected: false, session_identity_present: false };
}

export function assessRestoreReadiness(agentData) {
  return {
    hermes: findRestoreIdentity(agentData, /hermes/),
    codex: findRestoreIdentity(agentData, /codex/)
  };
}

export function runHerdrBetaCanary({ adapter, env = process.env } = {}) {
  if (!adapter) throw new TypeError('adapter is required');
  const detected = adapter.detect();
  if (!detected.available) throw new HerdrAdapterError('HERDR_NOT_AVAILABLE', 'HERDR is not available for the local beta canary');

  const sessionContext = verifyManagedHerdrSession({ runner: adapter.runner, env });
  const agents = adapter.listAgents();
  const sessions = adapter.inspectSessions();
  const restoreReadiness = assessRestoreReadiness(agents.data);

  return {
    schema: 'agentropolis.herdr.beta_canary.v1',
    passed: true,
    runtime: 'herdr',
    managed_session: {
      complete: sessionContext.complete,
      runtime_match: sessionContext.runtime_match,
      workspace_id: sessionContext.workspace_id,
      tab_id: sessionContext.tab_id,
      pane_id: sessionContext.pane_id,
      context_fingerprint: sessionContext.context_fingerprint,
      socket_exposed: false
    },
    telemetry: {
      receipts_emitted: Boolean(agents.receipt && sessions.receipt),
      correctness_inference: false,
      verification_state: 'runtime_smoke_only'
    },
    restore_readiness: restoreReadiness,
    restore_verification_note: 'Session identity presence is a readiness signal only. Actual restart/resume verification must be exercised locally under operator control.',
    public_mcp_authority_changed: false
  };
}
