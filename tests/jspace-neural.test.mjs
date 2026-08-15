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

test('neural fabric consumes the existing governed JSpace API and preserves read-only authority', () => {
  assert.match(js, /\/api\/jspace\?view=manifest/);
  assert.match(js, /READ_ONLY/);
  assert.doesNotMatch(js, /fetch\([^\n]+method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
  assert.match(html, /no direct memory mutation/i);
  assert.match(html, /Retrieval relevance cannot promote canon/i);
});

test('neural fabric distinguishes live receipt-backed state from canonical preview', () => {
  assert.match(js, /receipt\?\.id/);
  assert.match(js, /LIVE · RECEIPT-BACKED JSPACE/);
  assert.match(js, /CANONICAL PREVIEW · WORKER UNAVAILABLE/);
});

test('neural surface includes semantic regions and responsive styling', () => {
  for (const region of ['evidence','human_editable','retrieval','ontology','cognition','governance']) assert.match(js, new RegExp(region));
  assert.match(css, /\.neural-grid/);
  assert.match(css, /@media/);
});
