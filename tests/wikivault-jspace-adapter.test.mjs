import test from 'node:test';
import assert from 'node:assert/strict';
import { buildJspaceProjection } from '../src/wikivault-jspace-adapter.js';

test('WikiVault evidence becomes provenance-preserving JSpace nodes', () => {
  const projection = buildJspaceProjection({
    source: 'test-vault',
    sourceRevision: 'abc',
    evidence: [{
      record_id: 'ev_1', record_type: 'CLAIM', namespace: 'agentropolis', canon_status: 'ACTIVE_CANON', evidence_state: 'VERIFIED', confidence: 0.9,
      content: 'JSpace remains a derived deliberation surface.',
      provenance: { source: 'wiredchaos/repo', ref: 'main', commit_sha: 'abc', path: 'docs/a.md', line_start: 4, line_end: 8, content_sha256: 'deadbeef', observed_at: '2026-08-15T00:00:00Z' }
    }],
    relationships: [], conflicts: []
  });
  const node = projection.nodes[0];
  assert.equal(node.type, 'canon');
  assert.equal(node.evidenceState, 'VERIFIED');
  assert.equal(node.provenanceHash, 'deadbeef');
  assert.match(node.sourceRef, /docs\/a\.md/);
  assert.ok(node.torque > 0.5);
});

test('open conflicts become challenge state instead of silent resolution', () => {
  const projection = buildJspaceProjection({
    evidence: [{ record_id: 'ev_a', record_type: 'CLAIM', namespace: 'x', canon_status: 'PROVISIONAL', evidence_state: 'OBSERVED', confidence: 0.5, content: 'A', provenance: {} }],
    conflicts: [{ conflict_id: 'conf_1', record_ids: ['ev_a'], classification: 'CONFLICT', status: 'OPEN' }]
  });
  assert.equal(projection.nodes[0].challengeState, 'open');
});
