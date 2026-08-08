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
  'public/index.html',
  'public/styles.css',
  'public/script.js',
  'github-pages/3d/index.html',
  'github-pages/3d/main.js',
  'github-pages/3d/styles.css',
  'github-pages/3d/observatory.js',
  'github-pages/3d/observatory.css',
  'migrations/0001_core.sql',
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
const wrangler = await readFile(new URL('wrangler.jsonc', root), 'utf8');
const migration = await readFile(new URL('migrations/0001_core.sql', root), 'utf8');
const observatoryUi = await readFile(new URL('github-pages/3d/observatory.js', root), 'utf8');
const observatoryMarkup = await readFile(new URL('github-pages/3d/index.html', root), 'utf8');
const observatorySurface = `${observatoryUi}\n${observatoryMarkup}`;

for (const token of ['tools/list', 'tools/call', 'initialize', 'ALLOW_READ_ONLY', 'writeReceipt']) {
  if (!worker.includes(token)) throw new Error(`base worker missing ${token}`);
}
for (const token of ['tools/list', 'tools/call', '/api/observatory', 'writeReceipt', 'receipt-backed-observability']) {
  if (!observatoryWrapper.includes(token) && !observatory.includes(token)) throw new Error(`observatory wrapper missing ${token}`);
}
for (const token of ['/api/jspace', 'executeJspaceTool', 'ALLOW_READ_ONLY', 'writeReceipt', 'observatoryWorker.fetch']) {
  if (!jspaceWrapper.includes(token)) throw new Error(`J-Space wrapper missing ${token}`);
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
for (const token of ['INTELLIGENCE OBSERVATORY', 'Sync through MCP', 'get_agentropolis_topology', 'OBSERVATORY_STRUCTURE']) {
  if (!observatorySurface.includes(token)) throw new Error(`3D observatory surface missing ${token}`);
}

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
console.log(`Deployment validation passed: ${required.length} required files, 14 read-only MCP tools, 4 observatory views, 3 J-Space API views, 3 D1 tables.`);
