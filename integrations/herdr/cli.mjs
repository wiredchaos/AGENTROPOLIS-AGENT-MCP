#!/usr/bin/env node
import process from 'node:process';
import { HerdrAdapter, HerdrAdapterError, createJsonlSink } from './adapter.mjs';
import { createWatchtowerJsonlSink } from './watchtower-bridge.mjs';
import { assertManagedHerdrSession, getHerdrSessionContext, verifyManagedHerdrSession } from './session-context.mjs';
import { runHerdrBetaCanary } from './beta-canary.mjs';

const args = process.argv.slice(2);
const command = args.shift() ?? 'detect';
const receiptPath = process.env.AGENTROPOLIS_HERDR_RECEIPTS;
const watchtowerPath = process.env.AGENTROPOLIS_WATCHTOWER_EVENTS;

const adapter = new HerdrAdapter({
  receiptSink: receiptPath ? createJsonlSink(receiptPath) : null,
  watchtowerSink: watchtowerPath ? createWatchtowerJsonlSink(watchtowerPath) : null
});

function flag(name, fallback = null) {
  const index = args.indexOf(`--${name}`);
  if (index < 0) return fallback;
  return args[index + 1] ?? fallback;
}

function hasFlag(name) { return args.includes(`--${name}`); }
function print(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }
function requireManagedContext() { return assertManagedHerdrSession(process.env); }

try {
  let result;
  if (command === 'detect') result = adapter.detect();
  else if (command === 'context') result = getHerdrSessionContext(process.env);
  else if (command === 'verify-context') result = verifyManagedHerdrSession({ runner: adapter.runner, env: process.env });
  else if (command === 'canary') result = runHerdrBetaCanary({ adapter, env: process.env });
  else if (command === 'agents') result = adapter.listAgents();
  else if (command === 'sessions') result = adapter.inspectSessions();
  else if (command === 'panes') result = adapter.listPanes(flag('workspace'));
  else if (command === 'read-agent') result = adapter.readAgent(flag('agent'), { lines: Number(flag('lines', '120')) });
  else if (command === 'read-pane') result = adapter.readPane(flag('pane'), { lines: Number(flag('lines', '120')) });
  else if (command === 'wait-agent') result = adapter.waitAgent(flag('agent'), { timeoutMs: Number(flag('timeout', '120000')), until: flag('until') });
  else if (command === 'prompt-agent') {
    const context = requireManagedContext();
    result = adapter.promptAgent(flag('agent'), flag('prompt', ''), { approved: hasFlag('approved'), timeoutMs: Number(flag('timeout', '120000')), context });
  } else if (command === 'spawn-agent') {
    const context = requireManagedContext();
    result = adapter.spawnAgent({ paneId: flag('pane'), name: flag('name'), kind: flag('kind'), approved: hasFlag('approved'), context });
  } else if (command === 'run-pane') {
    const context = requireManagedContext();
    result = adapter.runPane(flag('pane'), flag('command', ''), { approved: hasFlag('approved'), timeoutMs: Number(flag('timeout', '120000')), context });
  } else if (command === 'wait-pane') result = adapter.waitPane(flag('pane'), { match: flag('match'), regex: flag('regex'), timeoutMs: Number(flag('timeout', '120000')) });
  else throw new HerdrAdapterError('UNKNOWN_COMMAND', `unknown adapter command: ${command}`);
  print(result);
} catch (error) {
  const body = error instanceof HerdrAdapterError
    ? { ok: false, error: { code: error.code, message: error.message, details: error.details } }
    : { ok: false, error: { code: 'UNEXPECTED_ERROR', message: String(error?.message ?? error) } };
  process.stderr.write(`${JSON.stringify(body, null, 2)}\n`);
  process.exitCode = 1;
}
