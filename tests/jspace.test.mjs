import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assembleCognitiveCouncil,
  jspaceManifest,
  mindVaultContract,
  wikivaultJspaceBridge
} from '../src/core.js';

test('J-Space remains read-only infrastructure',()=>{
  const manifest=jspaceManifest();
  assert.equal(manifest.authority,'READ_ONLY');
  assert.match(manifest.placement,/Layer 1/i);
  assert.equal(manifest.integrationState.mindVault200PlusRoster,'ROSTER_REHYDRATION_REQUIRED');
});

test('WikiVault bridge preserves canonical storage and conflict visibility',()=>{
  const bridge=wikivaultJspaceBridge();
  assert.match(bridge.canonicalStorage,/WikiVault/i);
  assert.ok(bridge.jspaceRules.some(rule=>/unresolved conflicts/i.test(rule)));
  assert.ok(bridge.retrievalScopes.includes('SECURITY_ONLY'));
});

test('Mind Vault contract requires provenance and forbids impersonation',()=>{
  const contract=mindVaultContract();
  assert.ok(contract.requiredFields.includes('provenance'));
  assert.ok(contract.requiredFields.includes('evidence_state'));
  assert.ok(contract.prohibited.includes('identity impersonation'));
});

test('cognitive council reserves Heretic slot and never grants authority',()=>{
  const council=assembleCognitiveCouncil({problem:'Design a resilient public knowledge system',domains:['systems','governance'],councilSize:7,requireHeretic:true});
  assert.equal(council.authority,'READ_ONLY');
  assert.equal(council.slots.length,7);
  assert.equal(council.slots.at(-1).role,'HERETIC');
  assert.match(council.attentionMarket.rule,/Fame or popularity alone cannot increase selection score/i);
});
