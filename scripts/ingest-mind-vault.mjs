import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const ROOT = new URL('../', import.meta.url);
const MANIFEST_URL = new URL('mind-vault/sources/manifest.json', ROOT);
const ALIASES_URL = new URL('mind-vault/aliases.json', ROOT);
const OUT_DIR = new URL('mind-vault/data/', ROOT);
const USER_AGENT = 'AGENTROPOLIS-WikiVault/1.0 (+https://github.com/wiredchaos/AGENTROPOLIS-AGENT-MCP)';
const TIMEOUT_MS = 25000;

const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
const aliases = JSON.parse(await readFile(ALIASES_URL, 'utf8'));

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function cleanHtml(value) {
  return decodeHtml(String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function cleanName(value) {
  let name = decodeHtml(String(value || ''))
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\^\{[^}]*\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  name = name.replace(/\s*\((?:c\.)?\s*\d[^)]*\)\s*$/i, '').trim();
  name = name.replace(/\s*\(aka\s+[^)]*\)\s*$/i, '').trim();
  return name;
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        'accept': 'text/html,application/xhtml+xml,text/plain,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { text: await response.text(), finalUrl: response.url, status: response.status };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithFallback(originUrl) {
  const attempts = [
    { transport: 'direct', url: originUrl },
    { transport: 'reader-fallback', url: `https://r.jina.ai/${originUrl}` }
  ];
  const errors = [];
  for (const attempt of attempts) {
    try {
      const result = await fetchText(attempt.url);
      return { ...result, transport: attempt.transport };
    } catch (error) {
      errors.push(`${attempt.transport}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`all fetch transports failed for ${originUrl}: ${errors.join('; ')}`);
}

function looksLikePersonName(value) {
  const name = cleanName(value);
  if (!name || name.length < 2 || name.length > 100) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(name)) return false;
  if (/^(person|country|overview|summary|list|maker|date)$/i.test(name)) return false;
  if (/https?:\/\//i.test(name)) return false;
  return true;
}

function parseHistoricalReferenceHtml(html) {
  const names = [];
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((m) => cleanHtml(m[1]));
    if (cells.length < 3) continue;
    const candidate = cleanName(cells[2]);
    if (looksLikePersonName(candidate)) names.push(candidate);
  }
  return names;
}

function parseHistoricalReferenceText(text) {
  const lower = text.toLowerCase();
  const startMarker = 'the following is the full list';
  const start = lower.indexOf(startMarker);
  const discussion = lower.indexOf('## discussion');
  const endMatter = lower.indexOf('## end matter');
  const endCandidates = [discussion, endMatter].filter((value) => value > start);
  const end = endCandidates.length ? Math.min(...endCandidates) : text.length;
  const segment = text.slice(start >= 0 ? start : 0, end);
  const names = [];
  for (const line of segment.split(/\r?\n/)) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map((cell) => cleanName(cell));
    if (cells.length < 3) continue;
    const candidate = cells[2];
    if (looksLikePersonName(candidate)) names.push(candidate);
  }
  return names;
}

function parseHistoricalReference(text) {
  const names = /<tr\b/i.test(text) ? parseHistoricalReferenceHtml(text) : parseHistoricalReferenceText(text);
  return [...new Set(names.map(cleanName).filter(looksLikePersonName))];
}

function parseGreatThinkersHtml(html) {
  const lower = html.toLowerCase();
  const start = lower.indexOf('the following are in random order');
  const end = lower.indexOf('what were the 100 greatest inventions');
  const segment = html.slice(start >= 0 ? start : 0, end > start ? end : html.length);
  const names = [];
  for (const match of segment.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const candidate = cleanName(cleanHtml(match[1]));
    if (looksLikePersonName(candidate)) names.push(candidate);
  }
  return names;
}

function parseGreatThinkersText(text) {
  const lower = text.toLowerCase();
  const start = lower.indexOf('the following are in random order');
  const end = lower.indexOf('what were the 100 greatest inventions');
  const segment = text.slice(start >= 0 ? start : 0, end > start ? end : text.length);
  const names = [];
  for (const match of segment.matchAll(/\[([^\]]+)\]\([^\)]+\)/g)) {
    const candidate = cleanName(match[1]);
    if (looksLikePersonName(candidate)) names.push(candidate);
  }
  return names;
}

function parseGreatThinkers(text) {
  const names = /<a\b/i.test(text) ? parseGreatThinkersHtml(text) : parseGreatThinkersText(text);
  return [...new Set(names.map(cleanName).filter(looksLikePersonName))];
}

function buildIdentityMap(sourceRows) {
  const byId = new Map();
  const review = [];
  for (const row of sourceRows) {
    const rawName = cleanName(row.name);
    const canonicalName = aliases[rawName] || aliases[rawName.toLowerCase()] || rawName;
    const slug = slugify(canonicalName);
    if (!slug) continue;
    const id = `people/${slug}`;
    let record = byId.get(id);
    if (!record) {
      record = {
        id,
        identity: canonicalName,
        aliases: [],
        evidence_state: 'OBSERVED_SOURCE_MEMBERSHIP',
        cognitive_dna_state: 'UNENRICHED',
        sources: []
      };
      byId.set(id, record);
    } else if (record.identity !== canonicalName) {
      review.push({ type: 'IDENTITY_COLLISION', id, existing: record.identity, incoming: canonicalName });
    }
    if (rawName !== canonicalName && !record.aliases.includes(rawName)) record.aliases.push(rawName);
    record.sources.push({
      source_id: row.sourceId,
      source_url: row.sourceUrl,
      observed_at: row.observedAt,
      transport: row.transport,
      content_hash: row.contentHash
    });
  }
  return { records: [...byId.values()].sort((a, b) => a.identity.localeCompare(b.identity)), review };
}

async function main() {
  const observedAt = new Date().toISOString();
  const diagnostics = [];
  const rows = [];

  for (const source of manifest.sources) {
    const fetched = await fetchWithFallback(source.origin_url);
    const contentHash = sha256(fetched.text);
    let parsed = [];
    if (source.id === 'hmolpedia-reference-corpus') parsed = parseHistoricalReference(fetched.text);
    if (source.id === 'edinformatics-great-thinkers') parsed = parseGreatThinkers(fetched.text);

    const minimumObservedNames = source.id === 'hmolpedia-reference-corpus' ? 1000 : 40;
    diagnostics.push({
      source_id: source.id,
      transport: fetched.transport,
      observed_name_count: parsed.length,
      content_hash: contentHash,
      status: parsed.length >= minimumObservedNames ? 'PASS' : 'INCOMPLETE'
    });
    for (const name of parsed) rows.push({ name, sourceId: source.id, sourceUrl: source.origin_url, observedAt, transport: fetched.transport, contentHash });
  }

  const { records, review } = buildIdentityMap(rows);
  const failures = diagnostics.filter((item) => item.status !== 'PASS');

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(new URL('minds.jsonl', OUT_DIR), records.map((record) => JSON.stringify(record)).join('\n') + '\n');
  await writeFile(new URL('review.jsonl', OUT_DIR), review.map((record) => JSON.stringify(record)).join('\n') + (review.length ? '\n' : ''));
  await writeFile(new URL('run-manifest.json', OUT_DIR), JSON.stringify({
    schema_version: '1.0.0',
    observed_at: observedAt,
    population_policy: manifest.population_policy,
    identity_count: records.length,
    source_membership_count: rows.length,
    diagnostics,
    review_count: review.length,
    complete: failures.length === 0
  }, null, 2) + '\n');

  console.log(JSON.stringify({ identities: records.length, memberships: rows.length, diagnostics, review: review.length }, null, 2));
  if (failures.length) {
    console.error('Mind Vault ingestion incomplete; refusing to mark corpus complete.');
    process.exitCode = 2;
  }
}

await main();
