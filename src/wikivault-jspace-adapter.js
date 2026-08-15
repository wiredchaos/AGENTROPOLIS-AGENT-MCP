const CONFLICT_CLASS = new Set(['CONFLICT','VARIANT','FORK','SUCCESSOR','LIKELY_DUPLICATE']);

export function buildJspaceProjection({ evidence = [], relationships = [], conflicts = [], source = 'wikivault-export', sourceRevision = '' } = {}) {
  const conflictByRecord = new Map();
  for (const conflict of conflicts) {
    if (!CONFLICT_CLASS.has(String(conflict.classification || '').toUpperCase())) continue;
    for (const id of conflict.record_ids || []) {
      const list = conflictByRecord.get(String(id)) || [];
      list.push({ id: conflict.conflict_id || '', classification: conflict.classification || 'CONFLICT', status: conflict.status || 'OPEN' });
      conflictByRecord.set(String(id), list);
    }
  }

  const nodes = evidence.map((record) => {
    const provenance = record.provenance || {};
    const conflictsForRecord = conflictByRecord.get(String(record.record_id)) || [];
    const challengeState = conflictsForRecord.length ? String(conflictsForRecord[0].status || 'open').toLowerCase() : 'none';
    const type = mapType(record.record_type, record.canon_status);
    return {
      id: String(record.record_id || ''),
      type,
      title: titleFor(record),
      summary: String(record.content || ''),
      namespace: String(record.namespace || ''),
      evidenceState: String(record.evidence_state || 'UNVERIFIED').toUpperCase(),
      verificationState: record.evidence_state === 'VERIFIED' ? 'verified' : 'unverified',
      challengeState,
      confidence: finiteUnit(record.confidence),
      torque: computeTorque(record, conflictsForRecord),
      sourceUri: String(provenance.source || ''),
      sourceRef: sourceRef(provenance),
      provenanceHash: String(provenance.content_sha256 || ''),
      updatedAt: String(provenance.observed_at || ''),
      scope: String(record.retrieval_scope || 'DEFAULT').toUpperCase(),
      tags: [String(record.canon_status || 'UNKNOWN'), String(record.record_type || 'CLAIM')].filter(Boolean)
    };
  }).filter((node) => node.id);

  const ids = new Set(nodes.map((node) => node.id));
  const edges = relationships.map((rel) => ({
    id: String(rel.relationship_id || ''),
    from: String(rel.from_id || ''),
    to: String(rel.to_id || ''),
    relation: String(rel.type || 'RELATED_TO').toLowerCase(),
    weight: finiteUnit(rel.confidence) ?? 0.5,
    confidence: finiteUnit(rel.confidence)
  })).filter((edge) => edge.id && ids.has(edge.from) && ids.has(edge.to));

  return {
    source,
    sourceRevision,
    generatedAt: new Date().toISOString(),
    nodes,
    edges
  };
}

function mapType(recordType, canonStatus) {
  const kind = String(recordType || '').toUpperCase();
  const canon = String(canonStatus || '').toUpperCase();
  if (canon === 'LOCKED_CANON' || canon === 'ACTIVE_CANON') return 'canon';
  if (kind.includes('EVIDENCE')) return 'evidence';
  if (kind.includes('ENTITY')) return 'entity';
  if (kind.includes('DECISION')) return 'decision';
  if (kind.includes('TASK')) return 'task';
  if (kind.includes('ARTIFACT')) return 'artifact';
  return 'claim';
}

function titleFor(record) {
  const content = String(record.content || '').replace(/\s+/g, ' ').trim();
  return content.length > 88 ? `${content.slice(0, 85)}...` : content || String(record.record_id || 'Untitled memory object');
}

function sourceRef(p) {
  const bits = [p.source, p.ref, p.commit_sha, p.path].filter(Boolean).map(String);
  if (p.line_start) bits.push(`L${p.line_start}${p.line_end ? `-L${p.line_end}` : ''}`);
  return bits.join(' · ');
}

function computeTorque(record, conflicts) {
  const confidence = finiteUnit(record.confidence) ?? 0.35;
  const evidenceBoost = ({ VERIFIED: 0.25, DEPLOYED: 0.2, OBSERVED: 0.15, IMPLEMENTED: 0.1, PLANNED: 0.04, UNVERIFIED: 0 })[String(record.evidence_state || 'UNVERIFIED').toUpperCase()] ?? 0;
  const conflictBoost = conflicts.length ? 0.14 : 0;
  return Math.max(0.05, Math.min(1, confidence * 0.6 + evidenceBoost + conflictBoost));
}

function finiteUnit(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : null;
}
