import { createHash } from 'node:crypto';
import { HerdrAdapterError, redactSecrets } from './adapter.mjs';

const SAFE_ID = /^[A-Za-z0-9:_-]{1,128}$/;

function extractPaneId(value) {
  const seen = new Set();
  const visit = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return null;
    seen.add(node);
    for (const key of ['pane_id', 'paneId', 'id']) {
      if (typeof node[key] === 'string' && SAFE_ID.test(node[key])) return node[key];
    }
    for (const child of Object.values(node)) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  return visit(value);
}

function parseRunnerOutput(result) {
  const text = String(result?.stdout ?? result?.stderr ?? '').trim();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { text: redactSecrets(text) }; }
}

export function getHerdrSessionContext(env = process.env) {
  const managed = env.HERDR_ENV === '1';
  const workspaceId = env.HERDR_WORKSPACE_ID ?? null;
  const tabId = env.HERDR_TAB_ID ?? null;
  const paneId = env.HERDR_PANE_ID ?? null;
  const complete = managed && [workspaceId, tabId, paneId].every((value) => typeof value === 'string' && SAFE_ID.test(value));
  const fingerprint = complete
    ? createHash('sha256').update(`${workspaceId}\u0000${tabId}\u0000${paneId}`).digest('hex')
    : null;
  return {
    managed,
    complete,
    workspace_id: complete ? workspaceId : null,
    tab_id: complete ? tabId : null,
    pane_id: complete ? paneId : null,
    context_fingerprint: fingerprint,
    socket_exposed: false
  };
}

export function assertManagedHerdrSession(env = process.env) {
  const context = getHerdrSessionContext(env);
  if (!context.managed) {
    throw new HerdrAdapterError('HERDR_SESSION_REQUIRED', 'HERDR control is allowed only from a HERDR-managed pane');
  }
  if (!context.complete) {
    throw new HerdrAdapterError('HERDR_CONTEXT_INCOMPLETE', 'HERDR managed-session identifiers are incomplete or malformed');
  }
  return context;
}

export function verifyManagedHerdrSession({ runner, env = process.env } = {}) {
  if (typeof runner !== 'function') throw new TypeError('runner is required');
  const context = assertManagedHerdrSession(env);
  const observed = parseRunnerOutput(runner(['pane', 'current', '--current'], { timeoutMs: 5000 }));
  const observedPaneId = extractPaneId(observed);
  if (!observedPaneId) {
    throw new HerdrAdapterError('HERDR_CONTEXT_UNVERIFIED', 'HERDR did not return a current pane identifier');
  }
  if (observedPaneId !== context.pane_id) {
    throw new HerdrAdapterError('HERDR_CONTEXT_MISMATCH', 'HERDR runtime pane does not match the calling managed-session context', {
      expected_pane_id: context.pane_id,
      observed_pane_id: observedPaneId
    });
  }
  return {
    ...context,
    runtime_match: true,
    verification_state: 'runtime_matched'
  };
}
