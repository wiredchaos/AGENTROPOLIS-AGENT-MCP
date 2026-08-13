import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const ROOT = new URL('../', import.meta.url);
const MANIFEST_URL = new URL('mind-vault/sources/manifest.json', ROOT);
const ALIASES_URL = new URL('mind-vault/aliases.json', ROOT);
const OUT_DIR = new URL('mind-vault/data/', ROOT);

const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'));
const aliases = JSON.parse(await readFile(ALIASES_URL, 'utf8'));

const USER_AGENT = 'AGENTROPOLIS-WikiVault/1.0 (+https://github.com/wiredchaos/AGENTROPOLIS-AGENT-MCP)';
const TIMEOUT_MS = 25000;

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

function aliasName(name) {
  return aliases[name] || aliases[name.toLowerCase()] || name;
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
    { transport: 'jina-reader', url: `https://r.jina.ai/${originUrl}` }
  ];
  const errors = [];
  for (const attempt of attempts) {
    try {
      const result = await fetchText(attempt.url);
      return { ...result, transport: attempt.transport, requestedUrl: attempt.url };
    } catch (error) {
      errors.push(`${attempt.transport}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`all fetch transports failed for ${originUrl}: ${errors.join('; ')}`);
}

function parseHmolpediaHtml(html) {
  const rows = [];
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((m) => cleanHtml(m[1]));
    if (cells.length < 3) continue;
    const rankMatch = cells[0].match(/^\s*(\d{1,4})\.?\s*$/);
    if (!rankMatch) continue;
    const position = Number(rankMatch[1]);
    const personCell = cells[2] || '';
    const firstLine = personCell.split('\n').map((v) => v.trim()).find(Boolean) || personCell;
    const name = cleanName(firstLine);
    if (!name || !/[A-Za-zÀ-ÿ]/.test(name)) continue;
    rows.push({ position, name });
  }
  return rows;
}

function parseHmolpediaMarkdown(text) {
  const rows = [];
  const patterns = [
    /(?:^|\n)\s*(\d{1,4})\.\s*\n?\s*\|\s*[^|\n]+\|\s*([^|\n]+)/g,
    /(?:^|\n)\s*\|?\s*(\d{1,4})\.\s*\|\s*[^|\n]+\|\s*([^|\n]+)/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const position = Number(match[1]);
      const name = cleanName(match[2]);
      if (!name || !/[A-Za-zÀ-ÿ]/.test(name)) continue;
      rows.push({ position, name });
    }
  }
  return rows;
}

function parseHmolpedia(text) {
  const rows = /<tr\b/i.test(text) ? parseHmolpediaHtml(text) : parseHmolpediaMarkdown(text);
  const seen = new Set();
  return rows.filter((row) => {
    const key = `${row.position}:${row.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

function parseEdinformaticsHtml(html) {
  const lower = html.toLowerCase();
  const start = lower.indexOf('the following are in random order');
  const end = lower.indexOf('what were the 100 greatest inventions');
  const segment = html.slice(start >= 0 ? start : 0, end > start ? end : html.length);
  const names = [];
  for (const match of segment.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const name = cleanName(cleanHtml(match[1]));
    if (name && name.length <= 100) names.push(name);
  }
  return names;
}

function parseEdinformaticsMarkdown(text) {
  const lower = text.toLowerCase();
  const start = lower.indexOf('the following are in random order');
  const end = lower.indexOf('what were the 100 greatest inventions');
  const segment = text.slice(start >= 0 ? start : 0, end > start ? end : text.length);
  const names = [];
  for (const match of segment.matchAll(/\[[^\]]*?([A-Za-zÀ-ÿ][^\]]+?)\]\([^\)]+\)/g)) {
    const name = cleanName(match[1]);
    if (name && name.length <= 100) names.push(name);
  }
  return names;
}

function parseEdinformatics(text) {
  const names = /<a\b/i.test(text) ? parseEdinformaticsHtml(text) : parseEdinformaticsMarkdown(text);
  return [...new Set(names.map(cleanName).filter(Boolean))];
}

function buildIdentityMap(sourceRows) {
  const byId = new Map();
  const review = [];
  for (const row of sourceRows) {
    const canonicalName = aliasName(cleanName(row.name));
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
    if (row.name !== canonicalName && !record.aliases.includes(row.name)) record.aliases.push(row.name);
    record.sources.push({
      source_id: row.sourceId,
      source_url: row.sourceUrl,
      ...(Number.isInteger(row.position) ? { source_position: row.position } : {}),
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
    if (source.id === 'hmolpedia-reference-corpus') {
      const parsed = parseHmolpedia(fetched.text);
      const positions = parsed.map((r) => r.position);
      const maxPosition = positions.length ? Math.max(...positions) : 0;
      const uniquePositions = new Set(positions).size;
      diagnostics.push({
        source_id: source.id,
        transport: fetched.transport,
        parsed_rows: parsed.length,
        unique_positions: uniquePositions,
        max_position: maxPosition,
        content_hash: contentHash,
        status: parsed.length >= 1000 && maxPosition >= 1200 ? 'PASS' : 'INCOMPLETE'
      });
      for (const item of parsed) rows.push({ ...item, sourceId: source.id, sourceUrl: source.origin_url, observedAt, transport: fetched.transport, contentHash });
    } else if (source.id === 'edinformatics-great-thinkers') {
      const parsed = parseEdinformatics(fetched.text);
      diagnostics.push({
        source_id: source.id,
        transport: fetched.transport,
        parsed_rows: parsed.length,
        content_hash: contentHash,
        status: parsed.length >= 40 ? 'PASS' : 'INCOMPLETE'
      });
      for (const name of parsed) rows.push({ name, sourceId: source.id, sourceUrl: source.origin_url, observedAt, transport: fetched.transport, contentHash });
    }
  }

  const { records, review } = buildIdentityMap(rows);
  const failures = diagnostics.filter((d) => d.status !== 'PASS');

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(new URL('minds.jsonl', OUT_DIR), records.map((r) => JSON.stringify(r)).join('\n') + '\n');
  await writeFile(new URL('review.jsonl', OUT_DIR), review.map((r) => JSON.stringify(r)).join('\n') + (review.length ? '\n' : ''));
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
