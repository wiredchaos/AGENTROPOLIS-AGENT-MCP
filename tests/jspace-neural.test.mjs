import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('github-pages/3d/index.html', root), 'utf8');
const js = await readFile(new URL('github-pages/3d/jspace-neural.js', root), 'utf8');
const css = await readFile(new URL('github-pages/3d/jspace-neural.css', root), 'utf8');

test('JSpace Neural Fabric is mounted in the 3D mission-control surface', () => {
  assert.match(html, /JSPACE NEURAL FABRIC · BETA/);
  assert.match(html, /id="neuralCanvas"/);
  assert.match(html, /data-open="neural"/);
  assert.match(html, /jspace-neural\.js/);
  assert.match(html, /jspace-neural\.css/);
});

test('neural fabric prefers the governed record-level projection and remains read-only', () => {
  assert.match(js, /\/api\/jspace\?view=projection/);
  assert.match(js, /\/api\/jspace\?view=manifest/);
  assert.match(js, /DERIVED_READ_ONLY_PROJECTION/);
  assert.doesNotMatch(js, /fetch\([^\n]+method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
  assert.match(html, /no direct memory mutation/i);
  assert.match(html, /Retrieval relevance cannot promote canon/i);
});

test('neural fabric distinguishes live memory projection from architecture fallback', () => {
  assert.match(js, /LIVE MEMORY PROJECTION/);
  assert.match(js, /CANONICAL PREVIEW · LIVE PROJECTION UNAVAILABLE/);
  assert.match(js, /if-none-match/i);
  assert.match(js, /setInterval/);
});

test('neural surface exposes verification, challenge, torque, and provenance semantics', () => {
  for (const token of ['challengeState', 'evidenceState', 'torque', 'provenanceHash', 'sourceRef']) assert.match(js, new RegExp(token));
  assert.match(js, /contradict\|challenge\|conflict/);
  assert.match(css, /\.neural-grid/);
  assert.match(css, /@media/);
});
