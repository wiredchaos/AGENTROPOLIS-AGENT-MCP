import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const CONTRACT = JSON.parse(readFileSync(new URL('./runtime-capabilities.json', import.meta.url), 'utf8'));
const CAPABILITIES = new Map(CONTRACT.capabilities.map((entry) => [entry.name, entry]));
const DENIED = new Set(CONTRACT.denied_by_default);
const STATES = new Set(CONTRACT.telemetry.states);
const MAX_LINES = 500;
const MAX_TIMEOUT_MS = 300000;
const MAX_STRING_BYTES = 32768;
const SAFE_HANDLE = /^[A-Za-z0-9:_-]{1,128}$/;

const SECRET_PATTERNS = [
  [/Authorization:\s*Bearer\s+[^\s"']+/gi, 'Authorization: Bearer [REDACTED]'],
  [/\b(sk-(?:ant|live)-[A-Za-z0-9_-]{8,}|sk_live_[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{8,}|gho_[A-Za-z0-9]{8,}|AKIA[A-Z0-9]{12,})\b/g, '[REDACTED_TOKEN]'],
  [/\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|STRIPE_SECRET_KEY|DATABASE_URL|AWS_SECRET_ACCESS_KEY)\s*=\s*[^\s]+/gi, '$1=[REDACTED]'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]']
];

const DANGEROUS_PANE_COMMANDS = [
  /(^|\s)sudo(\s|$)/i,
  /rm\s+-[a-z]*r[a-z]*f|rm\s+-[a-z]*f[a-z]*r/i,
  /git\s+push/i,
  /npm\s+publish/i,
  /(?:curl|wget)[^|\n]*\|\s*(?:sh|bash)/i,
  /(?:cat|grep|sed|awk|head|tail)\b[^\n]*(?:\.env|credentials\.json|id_rsa|\.ssh\/|\.aws\/)/i,
  /(?:^|\s)(?:printenv|env)(?:\s|$)/i
];

export class HerdrAdapterError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'HerdrAdapterError';
    this.code = code;
    this.details = details;
  }
}

export function redactSecrets(input) {
  let text = String(input ?? '');
  for (const [pattern, replacement] of SECRET_PATTERNS) text = text.replace(pattern, replacement);
  return text;
}

export function normalizeState(value) {
  const state = String(value ?? '').toLowerCase();
  return STATES.has(state) ? state : 'unknown';
}

export function createJsonlSink(filePath) {
  const resolved = resolve(filePath);
  mkdirSync(dirname(resolved), { recursive: true, mode: 0o700 });
  return (record) => appendFileSync(resolved, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
}

function digest(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function validateHandle(value, label) {
  if (!SAFE_HANDLE.test(String(value ?? ''))) throw new HerdrAdapterError('INVALID_HANDLE', `${label} is not a valid HERDR handle`);
  return String(value);
}

function boundedInteger(value, fallback, max) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) throw new HerdrAdapterError('INVALID_BOUND', `value must be an integer from 1 to ${max}`);
  return parsed;
}

function sanitizeValue(value, state, depth = 0) {
  if (depth > 10) {
    state.truncated = true;
    return '[TRUNCATED_DEPTH]';
  }
  if (typeof value === 'string') {
    const redacted = redactSecrets(value);
    if (Buffer.byteLength(redacted, 'utf8') <= MAX_STRING_BYTES) return redacted;
    state.truncated = true;
    return `${redacted.slice(0, MAX_STRING_BYTES)}...[TRUNCATED]`;
  }
  if (Array.isArray(value)) return value.slice(0, 1000).map((item) => sanitizeValue(item, state, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (/token|secret|password|credential|private[_-]?key|socket[_-]?path/i.test(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeValue(item, state, depth + 1);
      }
    }
    return out;
  }
  return value;
}

function sanitizePayload(value) {
  const state = { truncated: false };
  return { data: sanitizeValue(value, state), truncated: state.truncated };
}

function parseOutput(result) {
  const stdout = String(result?.stdout ?? '').trim();
  const stderr = String(result?.stderr ?? '').trim();
  const candidate = stdout || stderr;
  if (!candidate) return null;
  try { return JSON.parse(candidate); } catch { return { text: candidate }; }
}

function extractState(value) {
  const seen = new Set();
  const visit = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return null;
    seen.add(node);
    if (typeof node.state === 'string') return normalizeState(node.state);
    for (const child of Object.values(node)) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  return visit(value) ?? 'unknown';
}

export function defaultHerdrRunner(args, { timeoutMs = 30000 } = {}) {
  const timeout = boundedInteger(timeoutMs, 30000, MAX_TIMEOUT_MS);
  const result = spawnSync('herdr', args, {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    timeout,
    maxBuffer: 1024 * 1024,
    env: process.env
  });
  if (result.error) {
    const code = result.error.code === 'ENOENT' ? 'HERDR_NOT_FOUND' : 'HERDR_EXEC_ERROR';
    throw new HerdrAdapterError(code, result.error.message);
  }
  if (result.status !== 0) {
    throw new HerdrAdapterError('HERDR_COMMAND_FAILED', redactSecrets(result.stderr || result.stdout || `herdr exited ${result.status}`), { status: result.status });
  }
  return result;
}

export class HerdrAdapter {
  constructor({ runner = defaultHerdrRunner, now = () => new Date().toISOString(), receiptSink = null, watchtowerSink = null, policy = null } = {}) {
    this.runner = runner;
    this.now = now;
    this.receiptSink = receiptSink;
    this.watchtowerSink = watchtowerSink;
    this.policy = policy;
  }

  get contract() { return CONTRACT; }

  authorize(capability, context = {}) {
    if (DENIED.has(capability)) throw new HerdrAdapterError('CAPABILITY_DENIED', `${capability} is denied by default`);
    const entry = CAPABILITIES.get(capability);
    if (!entry) throw new HerdrAdapterError('UNKNOWN_CAPABILITY', `${capability} is not registered`);
    if (entry.risk === 'execution') {
      const policyDecision = this.policy ? this.policy({ capability, context, entry }) : null;
      const policyAllowed = policyDecision === true || policyDecision?.decision === 'allow';
      if (policyDecision === false || policyDecision?.decision === 'deny') throw new HerdrAdapterError('POLICY_DENIED', `${capability} denied by runtime policy`);
      if (!context.approved && !policyAllowed) throw new HerdrAdapterError('APPROVAL_REQUIRED', `${capability} requires explicit approval or an allowing policy gate`);
    }
    return entry;
  }

  invoke(capability, args, meta = {}) {
    let entry;
    try {
      entry = this.authorize(capability, meta);
      if (capability === 'runtime.pane.run') this.#guardPaneCommand(meta.input ?? '');
    } catch (error) {
      this.#emitReceipt({ capability, entry: CAPABILITIES.get(capability), meta, status: 'denied', error });
      throw error;
    }
    let result;
    try {
      result = this.runner(args, { timeoutMs: meta.timeoutMs ?? 30000 });
    } catch (error) {
      this.#emitReceipt({ capability, entry, meta, status: 'error', error });
      throw error;
    }
    const parsed = parseOutput(result);
    const sanitized = sanitizePayload(parsed);
    let stateAfter = extractState(sanitized.data);
    if (stateAfter === 'unknown' && typeof meta.probeStateAfter === 'function') stateAfter = meta.probeStateAfter();
    const receipt = this.#emitReceipt({ capability, entry, meta, status: 'ok', stateAfter, output: sanitized.data, outputTruncated: sanitized.truncated });
    return { data: sanitized.data, receipt };
  }

  detect() {
    try {
      const result = this.runner(['--help'], { timeoutMs: 5000 });
      return { available: result?.status === 0 || result?.status === undefined, adapter: 'herdr' };
    } catch (error) {
      if (error?.code === 'HERDR_NOT_FOUND') return { available: false, adapter: 'herdr', reason: 'not_found' };
      throw error;
    }
  }

  listAgents() { return this.invoke('runtime.agent.list', ['agent', 'list']); }
  inspectSessions() { return this.invoke('runtime.session.inspect', ['session', 'list']); }

  listPanes(workspaceId) {
    const workspace = validateHandle(workspaceId, 'workspace_id');
    return this.invoke('runtime.pane.list', ['pane', 'list', '--workspace', workspace], { workspace_id: workspace });
  }

  readAgent(agentName, { lines = 120 } = {}) {
    const agent = validateHandle(agentName, 'agent_name');
    const boundedLines = boundedInteger(lines, 120, MAX_LINES);
    return this.invoke('runtime.agent.read', ['agent', 'read', agent, '--source', 'recent-unwrapped', '--lines', String(boundedLines)], { agent_name: agent });
  }

  readPane(paneId, { lines = 120 } = {}) {
    const pane = validateHandle(paneId, 'pane_id');
    const boundedLines = boundedInteger(lines, 120, MAX_LINES);
    return this.invoke('runtime.pane.read', ['pane', 'read', pane, '--source', 'recent-unwrapped', '--lines', String(boundedLines)], { pane_id: pane });
  }

  waitAgent(agentName, { timeoutMs = 120000, until = null } = {}) {
    const agent = validateHandle(agentName, 'agent_name');
    const timeout = boundedInteger(timeoutMs, 120000, MAX_TIMEOUT_MS);
    const args = ['agent', 'wait', agent, '--timeout', String(timeout)];
    if (until) {
      const state = normalizeState(until);
      if (state === 'unknown' && String(until).toLowerCase() !== 'unknown') throw new HerdrAdapterError('INVALID_STATE', 'until must be a registered runtime state');
      args.push('--until', state);
    }
    return this.invoke('runtime.agent.wait', args, { agent_name: agent, timeoutMs: timeout });
  }

  promptAgent(agentName, prompt, { approved = false, timeoutMs = 120000 } = {}) {
    const agent = validateHandle(agentName, 'agent_name');
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20000) throw new HerdrAdapterError('INVALID_PROMPT', 'prompt must contain 1-20000 characters');
    const timeout = boundedInteger(timeoutMs, 120000, MAX_TIMEOUT_MS);
    const stateBefore = this.#probeAgentState(agent);
    return this.invoke('runtime.agent.prompt', ['agent', 'prompt', agent, prompt, '--wait', '--timeout', String(timeout)], {
      agent_name: agent,
      approved,
      timeoutMs: timeout,
      state_before: stateBefore,
      probeStateAfter: () => this.#probeAgentState(agent),
      input: prompt,
      input_digest: digest(redactSecrets(prompt))
    });
  }

  spawnAgent({ paneId, name, kind, approved = false, args = [] }) {
    const pane = validateHandle(paneId, 'pane_id');
    const agent = validateHandle(name, 'agent_name');
    const agentKind = validateHandle(kind, 'agent_kind');
    if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string' || arg.length > 4096)) throw new HerdrAdapterError('INVALID_ARGUMENTS', 'agent args must be bounded strings');
    const command = ['agent', 'start', agent, '--kind', agentKind, '--pane', pane];
    if (args.length) command.push('--', ...args);
    return this.invoke('runtime.agent.spawn', command, { pane_id: pane, agent_name: agent, approved, input_digest: digest(args.join('\u0000')) });
  }

  runPane(paneId, command, { approved = false, timeoutMs = 120000 } = {}) {
    const pane = validateHandle(paneId, 'pane_id');
    if (typeof command !== 'string' || !command.trim() || command.length > 12000) throw new HerdrAdapterError('INVALID_COMMAND', 'command must contain 1-12000 characters');
    const timeout = boundedInteger(timeoutMs, 120000, MAX_TIMEOUT_MS);
    return this.invoke('runtime.pane.run', ['pane', 'run', pane, command], {
      pane_id: pane,
      approved,
      timeoutMs: timeout,
      input: command,
      input_digest: digest(redactSecrets(command))
    });
  }

  waitPane(paneId, { match = null, regex = null, timeoutMs = 120000 } = {}) {
    const pane = validateHandle(paneId, 'pane_id');
    const timeout = boundedInteger(timeoutMs, 120000, MAX_TIMEOUT_MS);
    if ((match && regex) || (!match && !regex)) throw new HerdrAdapterError('INVALID_WAIT', 'provide exactly one of match or regex');
    const value = String(match ?? regex);
    if (!value || value.length > 2048) throw new HerdrAdapterError('INVALID_WAIT', 'wait expression must contain 1-2048 characters');
    const args = ['pane', 'wait-output', pane, match ? '--match' : '--regex', value, '--timeout', String(timeout)];
    return this.invoke('runtime.pane.wait', args, { pane_id: pane, timeoutMs: timeout, input_digest: digest(value) });
  }

  #probeAgentState(agentName) {
    try {
      const parsed = parseOutput(this.runner(['agent', 'get', agentName], { timeoutMs: 5000 }));
      return extractState(sanitizePayload(parsed).data);
    } catch {
      return 'unknown';
    }
  }

  #guardPaneCommand(command) {
    if (DANGEROUS_PANE_COMMANDS.some((pattern) => pattern.test(command))) {
      throw new HerdrAdapterError('COMMAND_BLOCKED', 'pane command matches a deny-by-default safety rule');
    }
  }

  #emitReceipt({ capability, entry, meta, status, stateAfter = 'unknown', output = null, outputTruncated = false, error = null }) {
    const timestamp = this.now();
    const receipt = {
      schema: 'agentropolis.runtime.receipt.v1',
      receipt_id: randomUUID(),
      runtime: 'herdr',
      adapter_version: CONTRACT.version,
      capability,
      risk: entry?.risk ?? 'unknown',
      workspace_id: meta.workspace_id ?? null,
      pane_id: meta.pane_id ?? null,
      agent_name: meta.agent_name ?? null,
      state_before: normalizeState(meta.state_before),
      state_after: normalizeState(stateAfter),
      policy_state: status === 'ok' ? 'allowed' : status === 'denied' ? 'denied' : 'attempted',
      verification_state: 'unverified',
      correctness_inference: false,
      status,
      input_digest: meta.input_digest ?? null,
      output_digest: output == null ? null : digest(JSON.stringify(output)),
      output_truncated: Boolean(outputTruncated),
      error_code: error?.code ?? null,
      timestamp
    };
    this.receiptSink?.(receipt);
    this.watchtowerSink?.({
      schema: 'agentropolis.watchtower.runtime_event.v1',
      event_id: randomUUID(),
      source: 'herdr',
      receipt_id: receipt.receipt_id,
      capability,
      workspace_id: receipt.workspace_id,
      pane_id: receipt.pane_id,
      agent_name: receipt.agent_name,
      state_before: receipt.state_before,
      state_after: receipt.state_after,
      transition: `${receipt.state_before}->${receipt.state_after}`,
      status,
      observed_at: timestamp,
      verification_state: 'unverified',
      correctness_inference: false
    });
    return receipt;
  }
}
