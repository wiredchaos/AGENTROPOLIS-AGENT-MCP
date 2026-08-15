import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const required = [
  'package.json',
  'package-lock.json',
  'wrangler.jsonc',
  'src/index.js',
  'src/core.js',
  'src/observatory.js',
  'src/observatory-index.js',
  'src/jspace.js',
  'src/jspace-index.js',
  'src/jspace-projection.js',
  'src/wikivault-jspace-adapter.js',
  'public/index.html',
  'public/styles.css',
  'public/script.js',
  'github-pages/3d/index.html',
  'github-pages/3d/main.js',
  'github-pages/3d/styles.css',
  'github-pages/3d/observatory.js',
  'github-pages/3d/observatory.css',
  'github-pages/3d/jspace-neural.js',
  'github-pages/3d/jspace-neural.css',
  'migrations/0001_core.sql',
  'migrations/0002_jspace_projection.sql',
  'scripts/sync-jspace-projection.mjs',
  'README.md',
  'SECURITY.md',
  'docs/CLOUDFLARE_DEPLOYMENT.md',
  'docs/INTELLIGENCE_OBSERVATORY.md',
  'docs/JSPACE_WIKIVAULT_COGNITIVE_COMMONS.md',
  '.github/workflows/cloudflare-ci.yml',
  'agentropolis.attachment.json'
];
for (const path of required) await stat(new URL(path, root));

const worker = await readFile(new URL('src/index.js', root), 'utf8');
const core = await readFile(new URL('src/core.js', root), 'utf8');
const observatory = await readFile(new URL('src/observatory.js', root), 'utf8');
const observatoryWrapper = await readFile(new URL('src/observatory-index.js', root), 'utf8');
const jspace = await readFile(new URL('src/jspace.js', root), 'utf8');
const jspaceWrapper = await readFile(new URL('src/jspace-index.js', root), 'utf8');
const projection = await readFile(new URL('src/jspace-projection.js', root), 'utf8');
const adapter = await readFile(new URL('src/wikivault-jspace-adapter.js', root), 'utf8');
const syncScript = await readFile(new URL('scripts/sync-jspace-projection.mjs', root), 'utf8');
const wrangler = await readFile(new URL('wrangler.jsonc', root), 'utf8');
const migration = await readFile(new URL('migrations/0001_core.sql', root), 'utf8');
const projectionMigration = await readFile(new URL('migrations/0002_jspace_projection.sql', root), 'utf8');
const observatoryUi = await readFile(new URL('github-pages/3d/observatory.js', root), 'utf8');
const observatoryMarkup = await readFile(new URL('github-pages/3d/index.html', root), 'utf8');
const neuralUi = await readFile(new URL('github-pages/3d/jspace-neural.js', root), 'utf8');
const neuralCss = await readFile(new URL('github-pages/3d/jspace-neural.css', root), 'utf8');
const observatorySurface = `${observatoryUi}\n${observatoryMarkup}`;
const neuralSurface = `${neuralUi}\n${neuralCss}\n${observatoryMarkup}`;

for (const token of ['tools/list', 'tools/call', 'initialize', 'ALLOW_READ_ONLY', 'writeReceipt']) {
  if (!worker.includes(token)) throw new Error(`base worker missing ${token}`);
}
for (const token of ['tools/list', 'tools/call', '/api/observatory', 'writeReceipt', 'receipt-backed-observability']) {
  if (!observatoryWrapper.includes(token) && !observatory.includes(token)) throw new Error(`observatory wrapper missing ${token}`);
}
for (const token of ['/api/jspace', '/api/jspace/projection/sync', 'view === "projection"', 'ALLOW_DERIVED_CACHE_WRITE', 'writeReceipt', 'observatoryWorker.fetch']) {
  if (!jspaceWrapper.includes(token)) throw new Error(`J-Space wrapper missing ${token}`);
}
for (const token of ['DERIVED_READ_ONLY_PROJECTION', 'SECURITY_ONLY', 'MAX_NODES', 'MAX_EDGES', 'jspace_projection_snapshots', 'jspace_projection_state']) {
  if (!projection.includes(token)) throw new Error(`J-Space projection module missing ${token}`);
}
for (const token of ['record_id', 'evidence_state', 'provenanceHash', 'challengeState', 'computeTorque']) {
  if (!adapter.includes(token)) throw new Error(`WikiVault J-Space adapter missing ${token}`);
}
for (const token of ['MCP_API_TOKEN', '/api/jspace/projection/sync', 'wikivault-export']) {
  if (!syncScript.includes(token)) throw new Error(`J-Space sync script missing ${token}`);
}
for (const name of [
  'route_front_desk',
  'list_agentropolis_districts',
  'assess_mcp_request_risk',
  'get_agentropolis_capability_map',
  'get_cloudflare_deployment_manifest'
]) {
  if (!core.includes(name)) throw new Error(`missing base tool ${name}`);
}
for (const name of [
  'get_agentropolis_topology',
  'get_agentropolis_thermodynamics',
  'get_agentropolis_memory_evolution',
  'get_agentropolis_skill_development',
  'get_agentropolis_observatory_snapshot'
]) {
  if (!observatory.includes(name)) throw new Error(`missing observatory tool ${name}`);
}
for (const name of [
  'get_jspace_manifest',
  'get_wikivault_jspace_bridge',
  'assemble_cognitive_council',
  'get_mind_vault_contract'
]) {
  if (!jspace.includes(name)) throw new Error(`missing J-Space tool ${name}`);
}
for (const token of ['"binding": "DB"', '"binding": "ASSETS"', '"/mcp"', '"main": "src/jspace-index.js"']) {
  if (!wrangler.includes(token)) throw new Error(`wrangler missing ${token}`);
}
for (const table of ['execution_receipts', 'security_events', 'rate_limits']) {
  if (!migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) throw new Error(`migration missing ${table}`);
}
for (const table of ['jspace_projection_snapshots', 'jspace_projection_state']) {
  if (!projectionMigration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) throw new Error(`projection migration missing ${table}`);
}
for (const token of ['INTELLIGENCE OBSERVATORY', 'Sync through MCP', 'get_agentropolis_topology', 'OBSERVATORY_STRUCTURE']) {
  if (!observatorySurface.includes(token)) throw new Error(`3D observatory surface missing ${token}`);
}
for (const token of ['JSPACE NEURAL FABRIC · BETA', 'neuralCanvas', '/api/jspace?view=projection', '/api/jspace?view=manifest', 'DERIVED_READ_ONLY_PROJECTION', 'LIVE MEMORY PROJECTION', 'CANONICAL PREVIEW · LIVE PROJECTION UNAVAILABLE', 'provenanceHash', 'challengeState', 'torque']) {
  if (!neuralSurface.includes(token)) throw new Error(`JSpace neural surface missing ${token}`);
}
if (/method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i.test(neuralUi)) throw new Error('JSpace neural beta must remain read-only');

const files = [];
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const info = await stat(path);
    info.isDirectory() ? await walk(path) : files.push(path);
  }
}
await walk(fileURLToPath(root));
const patterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /CF_API_TOKEN\s*=\s*[^\s#]+/i,
  /MCP_API_TOKEN\s*=\s*(?!replace-with)[^\s#]+/i,
  /seed phrase\s*[:=]/i
];
for (const file of files) {
  if (file.includes('/.git/')) continue;
  const text = await readFile(file, 'utf8').catch(() => null);
  if (text) for (const pattern of patterns) if (pattern.test(text)) throw new Error(`possible secret in ${relative(fileURLToPath(root), file)}`);
}
for (const banned of ['wallet_sign', 'send_payment', 'publish_external', 'delete_resource', 'grant_permission']) {
  if (core.includes(`name: "${banned}"`) || observatory.includes(`name: "${banned}"`) || jspace.includes(`name: "${banned}"`)) throw new Error(`forbidden public tool ${banned}`);
}
console.log(`Deployment validation passed: ${required.length} required files, record-level JSpace projection API, governed WikiVault adapter, 4 observatory views, 4 J-Space API views, Neural Fabric beta, 5 D1 tables.`);
