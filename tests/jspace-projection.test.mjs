import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProjectionInput, validateProjectionInput } from '../src/jspace-projection.js';

const sample = {
  source: 'wikivault-export',
  sourceRevision: 'commit:abc123',
  nodes: [
    { id: 'mem:1', type: 'evidence', title: 'Verified source', evidenceState: 'VERIFIED', confidence: 0.92, torque: 0.8, scope: 'DEFAULT', provenanceHash: 'sha256:aaa' },
    { id: 'mem:2', type: 'claim', title: 'Contested claim', evidenceState: 'OBSERVED', confidence: 0.55, torque: 0.6, challengeState: 'contra-open', scope: 'REVIEW' },
    { id: 'sec:1', type: 'evidence', title: 'Security record', evidenceState: 'VERIFIED', scope: 'SECURITY_ONLY' }
  ],
  edges: [
    { id: 'e:1', from: 'mem:1', to: 'mem:2', relation: 'contradicts', weight: 0.8 },
    { id: 'e:2', from: 'sec:1', to: 'mem:1', relation: 'supports', weight: 0.4 }
  ]
};

test('projection validates bounded memory objects and relations', () => {
  assert.equal(validateProjectionInput(sample), null);
  const projection = normalizeProjectionInput(sample);
  assert.equal(projection.authority, 'DERIVED_READ_ONLY_PROJECTION');
  assert.equal(projection.nodes.length, 2);
  assert.equal(projection.edges.length, 1);
  assert.equal(projection.stats.verified, 1);
  assert.equal(projection.stats.challenged, 1);
  assert.equal(projection.nodes.find(n => n.id === 'mem:1').torque, 0.8);
});

test('SECURITY_ONLY nodes and their orphaned edges never enter the public projection', () => {
  const projection = normalizeProjectionInput(sample);
  assert.ok(!projection.nodes.some(n => n.scope === 'SECURITY_ONLY'));
  assert.ok(!projection.edges.some(e => e.from === 'sec:1' || e.to === 'sec:1'));
});

test('projection rejects secret-like fields and invalid relation references', () => {
  assert.match(validateProjectionInput({ nodes: [{ id: 'x', title: 'x', apiToken: 'nope' }], edges: [] }), /secret-like/i);
  assert.match(validateProjectionInput({ nodes: [{ id: 'x', title: 'x' }], edges: [{ id: 'bad', from: 'x', to: 'missing' }] }), /unknown nodes/i);
});

test('projection enforces confidence and torque bounds', () => {
  assert.match(validateProjectionInput({ nodes: [{ id: 'x', title: 'x', confidence: 2 }], edges: [] }), /confidence/i);
  assert.match(validateProjectionInput({ nodes: [{ id: 'x', title: 'x', torque: -0.1 }], edges: [] }), /torque/i);
});
