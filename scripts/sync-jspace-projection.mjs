import { readFile } from 'node:fs/promises';
import { buildJspaceProjection } from '../src/wikivault-jspace-adapter.js';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));
const endpoint = String(args.endpoint || process.env.JSPACE_BASE_URL || '').replace(/\/+$/, '');
const token = process.env.MCP_API_TOKEN || '';
if (!endpoint) throw new Error('Set --endpoint=https://... or JSPACE_BASE_URL.');
if (!token) throw new Error('MCP_API_TOKEN is required and is never printed.');
if (!args.evidence) throw new Error('--evidence=path/to/evidence.jsonl is required.');

const evidence = await readJsonl(String(args.evidence));
const relationships = args.relationships ? await readJsonl(String(args.relationships)) : [];
const conflicts = args.conflicts ? await readJsonl(String(args.conflicts)) : [];
const projection = buildJspaceProjection({
  evidence,
  relationships,
  conflicts,
  source: String(args.source || 'wikivault-export'),
  sourceRevision: String(args.revision || '')
});

const response = await fetch(`${endpoint}/api/jspace/projection/sync`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' },
  body: JSON.stringify(projection)
});
const body = await response.json().catch(() => ({}));
if (!response.ok) throw new Error(`JSpace sync failed (${response.status}): ${body?.error?.code || 'UNKNOWN'}`);
console.log(JSON.stringify({ accepted: body.accepted, revision: body.revision, nodeCount: body.nodeCount, edgeCount: body.edgeCount, receiptPersisted: body.receipt?.persisted === true }, null, 2));

async function readJsonl(path) {
  const text = await readFile(path, 'utf8');
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, i) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSONL at ${path}:${i + 1}`); }
  });
}
