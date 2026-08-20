import { readFile } from 'node:fs/promises';

const report = {
  schema: 'agentropolis.jspace.beta-readiness.v1',
  generatedAt: new Date().toISOString(),
  gates: {},
  overall: 'NO_GO'
};

const required = async (path, tokens=[]) => {
  try {
    const text = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    return tokens.every((token) => text.includes(token));
  } catch { return false; }
};

report.gates.SOURCE_GREEN = await required('src/jspace-projection.js', ['DERIVED_READ_ONLY_PROJECTION','SECURITY_ONLY']) &&
  await required('src/jspace-index.js', ['/api/jspace/projection/sync','ALLOW_DERIVED_CACHE_WRITE']);
report.gates.UI_BETA_GREEN = await required('github-pages/3d/jspace-neural.js', ['view=projection','if-none-match','LIVE · MEMORY OBJECT PROJECTION']);
report.gates.DEPLOY_CORRIDOR_PRESENT = await required('.github/workflows/cloudflare-deploy.yml', ['CLOUDFLARE_API_TOKEN','Apply D1 migrations','Deploy Worker','Verify public health']);
report.gates.RUNBOOK_PRESENT = await required('docs/JSPACE_PRODUCTION_BETA_RUNBOOK.md', ['PRODUCTION_BETA_GREEN','NO-GO']);

// Runtime/data gates are intentionally not inferred from source presence.
report.gates.WORKER_BETA_GREEN = false;
report.gates.DATA_BETA_GREEN = false;
report.blockers = [
  'WORKER_BETA_GREEN requires an observed successful production deploy and endpoint verification.',
  'DATA_BETA_GREEN requires a validated WikiVault projection sync and matching read-back revision.'
];

const sourceReady = ['SOURCE_GREEN','UI_BETA_GREEN','DEPLOY_CORRIDOR_PRESENT','RUNBOOK_PRESENT'].every((k)=>report.gates[k]);
report.releaseClass = sourceReady ? 'SOURCE_AND_UI_BETA_READY' : 'SOURCE_NOT_READY';
report.overall = Object.values(report.gates).every(Boolean) ? 'GO' : 'NO_GO';
console.log(JSON.stringify(report, null, 2));
if (!sourceReady) process.exitCode = 1;
