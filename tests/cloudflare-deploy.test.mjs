import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const workflow = await readFile(new URL('.github/workflows/cloudflare-deploy.yml', root), 'utf8');
const wrangler = await readFile(new URL('wrangler.jsonc', root), 'utf8');
const canary = await readFile(new URL('scripts/verify-jspace-production.mjs', root), 'utf8');

test('production deploy is gated by sealed Cloudflare credentials', () => {
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /Require sealed deployment credentials/);
  assert.doesNotMatch(workflow, /echo.*CLOUDFLARE_API_TOKEN.*\$/i);
});

test('production deploy validates, migrates, deploys, then verifies public JSpace endpoints', () => {
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /d1 migrations apply DB --remote/);
  assert.match(workflow, /wrangler@4\.114\.0 deploy/);
  assert.match(workflow, /\/api\/jspace\?view=projection/);
  assert.match(workflow, /\/api\/jspace\?view=manifest/);
  assert.match(workflow, /npm run jspace:verify-production/);
});

test('semantic production canary verifies authority receipts state etag and freshness', () => {
  for (const token of ['READ_ONLY_PUBLIC_SURFACE','receipt','LIVE_DERIVED_PROJECTION','STALE_DERIVED_PROJECTION','NO_PROJECTION_AVAILABLE','if-none-match','FRESH_PROJECTION']) {
    assert.match(canary, new RegExp(token, 'i'));
  }
  assert.doesNotMatch(canary, /method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
});

test('wrangler advertises the record-level projection beta service version', () => {
  assert.match(wrangler, /1\.2\.0-jspace-projection-beta/);
  assert.match(wrangler, /f21afe5f-2c13-4f6b-b7df-c5e1ae85f449/);
});
