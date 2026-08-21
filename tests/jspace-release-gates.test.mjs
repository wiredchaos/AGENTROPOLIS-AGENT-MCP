import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const projection = await readFile(new URL('src/jspace-projection.js', root), 'utf8');
const wrapper = await readFile(new URL('src/jspace-index.js', root), 'utf8');
const ui = await readFile(new URL('github-pages/3d/jspace-neural.js', root), 'utf8');
const deploy = await readFile(new URL('.github/workflows/cloudflare-deploy.yml', root), 'utf8');

test('release gate preserves projection-only authority', () => {
  assert.match(projection, /DERIVED_READ_ONLY_PROJECTION/);
  assert.doesNotMatch(projection, /LOCKED_CANON|ACTIVE_CANON/);
  assert.match(wrapper, /ALLOW_DERIVED_CACHE_WRITE/);
  assert.match(wrapper, /READ_ONLY_PUBLIC_SURFACE/);
});

test('release gate excludes sensitive retrieval scope and secret-like fields', () => {
  assert.match(projection, /SECURITY_ONLY/);
  assert.match(projection, /secret-like fields are not allowed/i);
  assert.match(projection, /MAX_NODES\s*=\s*500/);
  assert.match(projection, /MAX_EDGES\s*=\s*1500/);
});

test('browser remains mutation-free and uses conditional refresh', () => {
  assert.doesNotMatch(ui, /method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
  assert.match(ui, /if-none-match/i);
  assert.match(ui, /30000/);
});

test('production deploy is credential-gated and verifies live endpoints', () => {
  for (const token of ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','Apply D1 migrations','Deploy Worker','Verify public health']) {
    assert.match(deploy, new RegExp(token));
  }
  assert.match(deploy, /\/api\/jspace\?view=projection/);
});

test('production ops exposes operator-only rollback and revision history', () => {
  assert.match(wrapper, /\/api\/jspace\/projection\/history/);
  assert.match(wrapper, /\/api\/jspace\/projection\/activate/);
  assert.match(wrapper, /authorizeOperator/);
  assert.match(wrapper, /ALLOW_DERIVED_CACHE_POINTER_WRITE/);
  assert.match(projection, /activateProjectionRevision/);
  assert.match(projection, /listProjectionRevisions/);
  assert.doesNotMatch(projection, /DELETE FROM jspace_projection_snapshots/i);
});

test('public projection reports freshness without promoting truth or canon', () => {
  assert.match(wrapper, /JSPACE_PROJECTION_MAX_AGE_SECONDS/);
  assert.match(wrapper, /STALE_DERIVED_PROJECTION/);
  assert.match(projection, /STALE_UNKNOWN_AGE/);
  assert.match(projection, /FRESH_PROJECTION/);
  assert.doesNotMatch(wrapper, /ALLOW_CANON|PROMOTE_CANON/);
});
