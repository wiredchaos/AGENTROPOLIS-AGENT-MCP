import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
for (const path of [
  'src/canary-admission.js',
  'tests/canary-admission.test.mjs',
  'migrations/0005_execution_canary_admissions.sql',
]) await stat(new URL(path, root));

const admission = await readFile(new URL('src/canary-admission.js', root), 'utf8');
const wrapper = await readFile(new URL('src/execution-beta-index.js', root), 'utf8');
const migration = await readFile(new URL('migrations/0005_execution_canary_admissions.sql', root), 'utf8');
const wrangler = await readFile(new URL('wrangler.jsonc', root), 'utf8');

for (const token of [
  'CANARY execution is not armed',
  'explicit human CANARY approval is required',
  'authoritative CANARY job limit has been reached',
  'CANARY_MAX_COST_MICRO_USD',
  'execution_canary_admissions',
]) {
  if (!admission.includes(token)) throw new Error(`canary admission gate missing ${token}`);
}
for (const token of ['/api/execution/canary/readiness', 'canaryReadiness', "provider_invocation: 'DISABLED'"]) {
  if (!wrapper.includes(token)) throw new Error(`execution wrapper missing pre-CANARY token ${token}`);
}
if (!migration.includes('CREATE TABLE IF NOT EXISTS execution_canary_admissions')) {
  throw new Error('pre-CANARY migration missing execution_canary_admissions');
}
for (const token of [
  '"EXECUTION_MODE": "DRY_RUN"',
  '"OPS_SUPERVISION_ENABLED": "true"',
  '"CANARY_EXECUTION_ENABLED": "false"',
  '"CANARY_PROVIDER_ID": ""',
  '"CANARY_RUNTIME_ID": ""',
  '"CANARY_MAX_JOBS": "0"',
  '"CANARY_MAX_COST_MICRO_USD": "0"',
]) {
  if (!wrangler.includes(token)) throw new Error(`pre-CANARY config missing safe default ${token}`);
}
if (wrangler.includes('"EXECUTION_MODE": "CANARY"')) throw new Error('CANARY must not be activated by pre-CANARY hardening');
if (wrangler.includes('"CANARY_EXECUTION_ENABLED": "true"')) throw new Error('CANARY execution must remain unarmed');

console.log('Pre-CANARY validation passed: readiness-only endpoint, D1 admission ledger, human approval, cost envelope, authoritative one-job gate, CANARY unarmed.');
