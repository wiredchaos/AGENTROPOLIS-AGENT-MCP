import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLOUDFLARE_COMPUTER_STATUS,
  cloudflareComputerManifest,
  selectCloudflareComputerBackend
} from '../src/cloudflare-computer.js';

test('Cloudflare Computer remains experimental and production denied',()=>{
  const m=cloudflareComputerManifest();
  assert.equal(CLOUDFLARE_COMPUTER_STATUS,'EXPERIMENTAL_QUARANTINED');
  assert.equal(m.productionApproved,false);
  assert.equal(m.canonicalMemory,false);
});

test('routes text transforms to worker shell',()=>{
  const r=selectCloudflareComputerBackend({task:'grep and summarize these files'});
  assert.equal(r.backend,'worker-shell');
  assert.equal(r.decision,'PROCEED_TO_CERTIFICATION');
  assert.equal(r.authority,'NO_EXECUTION_AUTHORITY');
});

test('routes structured javascript to javascript isolate',()=>{
  const r=selectCloudflareComputerBackend({task:'run a JavaScript module to transform JSON'});
  assert.equal(r.backend,'worker-javascript');
});

test('routes native workload to container',()=>{
  const r=selectCloudflareComputerBackend({task:'npm install and compile native binary'});
  assert.equal(r.backend,'container');
});

test('browser workload escalates away from Computer',()=>{
  const r=selectCloudflareComputerBackend({task:'use Playwright browser automation'});
  assert.equal(r.decision,'ESCALATE');
  assert.equal(r.backend,null);
});

test('network request requires explicit 54-T review',()=>{
  const r=selectCloudflareComputerBackend({task:'grep files',network:'allow'});
  assert.equal(r.decision,'ESCALATE');
  assert.equal(r.certificationRequired,true);
});
