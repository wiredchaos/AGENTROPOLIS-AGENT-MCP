const base = String(process.env.JSPACE_BASE_URL || 'https://agentropolis-agent-mcp.chaoswired.workers.dev').replace(/\/+$/, '');
const report = {
  schema: 'agentropolis.jspace.production-canary.v1',
  endpoint: base,
  generatedAt: new Date().toISOString(),
  checks: {},
  state: 'NO_GO'
};

const getJson = async (path, headers = {}) => {
  const response = await fetch(base + path, { headers: { accept: 'application/json', ...headers } });
  const body = response.status === 304 ? null : await response.json().catch(() => null);
  return { response, body };
};

try {
  const health = await getJson('/health');
  report.checks.health = health.response.ok;
  if (!health.response.ok) throw new Error(`/health returned ${health.response.status}`);

  const manifest = await getJson('/api/jspace?view=manifest');
  report.checks.manifest = manifest.response.ok && manifest.body?.jspace?.authority === 'READ_ONLY';
  if (!report.checks.manifest) throw new Error('JSpace manifest authority check failed');

  const projection = await getJson('/api/jspace?view=projection');
  const authority = projection.response.headers.get('x-agentropolis-authority');
  report.checks.publicAuthority = authority === 'READ_ONLY_PUBLIC_SURFACE';
  report.checks.projectionHttp = projection.response.ok;
  report.projectionState = projection.body?.state || null;
  report.revision = projection.body?.revision || null;
  report.receiptPersisted = projection.body?.receipt?.persisted === true;
  report.checks.receipt = Boolean(projection.body?.receipt?.id);

  if (!report.checks.projectionHttp) throw new Error(`projection returned ${projection.response.status}`);
  if (!report.checks.publicAuthority) throw new Error(`unexpected public authority: ${authority || 'missing'}`);
  if (!report.checks.receipt) throw new Error('projection read receipt missing');

  const allowedStates = new Set(['LIVE_DERIVED_PROJECTION', 'STALE_DERIVED_PROJECTION', 'NO_PROJECTION_AVAILABLE']);
  report.checks.projectionState = allowedStates.has(report.projectionState);
  if (!report.checks.projectionState) throw new Error(`unexpected projection state: ${report.projectionState}`);

  if (report.revision) {
    const etag = projection.response.headers.get('etag');
    report.checks.etagMatchesRevision = etag?.replace(/^W\//, '').replaceAll('"', '') === report.revision;
    if (!report.checks.etagMatchesRevision) throw new Error('projection ETag does not match revision');

    const conditional = await getJson('/api/jspace?view=projection', { 'if-none-match': `"${report.revision}"` });
    report.checks.conditional304 = conditional.response.status === 304;
    if (!report.checks.conditional304) throw new Error(`conditional projection read returned ${conditional.response.status}, expected 304`);
  } else {
    report.checks.etagMatchesRevision = null;
    report.checks.conditional304 = null;
  }

  if (report.projectionState === 'LIVE_DERIVED_PROJECTION') {
    report.checks.freshness = projection.body?.freshness?.stale === false && projection.body?.freshness?.state === 'FRESH_PROJECTION';
    if (!report.checks.freshness) throw new Error('live projection did not report fresh state');
  } else if (report.projectionState === 'STALE_DERIVED_PROJECTION') {
    report.checks.freshness = projection.body?.freshness?.stale === true;
    if (!report.checks.freshness) throw new Error('stale projection did not report stale state');
  } else {
    report.checks.freshness = null;
  }

  report.releaseEvidence = report.projectionState === 'NO_PROJECTION_AVAILABLE'
    ? 'WORKER_BETA_OBSERVED_DATA_NOT_READY'
    : report.projectionState === 'STALE_DERIVED_PROJECTION'
      ? 'WORKER_BETA_OBSERVED_DATA_STALE'
      : 'WORKER_AND_DATA_READ_PATH_OBSERVED';
  report.state = 'GO';
} catch (error) {
  report.error = error instanceof Error ? error.message : 'unknown production canary failure';
  process.exitCode = 1;
}

console.log(JSON.stringify(report, null, 2));
