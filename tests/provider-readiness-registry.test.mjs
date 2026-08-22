import test from 'node:test';
import assert from 'node:assert/strict';
import { listProviderReadiness, openArtProviderReadiness } from '../src/provider-readiness-registry.js';

test('OpenArt remains pending and non-invoking without verified runtime evidence', () => {
  const readiness = openArtProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' });
  assert.equal(readiness.provider_id, 'openart-mcp');
  assert.equal(readiness.runtime_id, null);
  assert.equal(readiness.eligible, false);
  assert.equal(readiness.registry_state, 'PENDING_EVIDENCE');
  assert.equal(readiness.authority, 'READINESS_ONLY');
  assert.equal(readiness.invocation_performed, false);
});

test('provider registry is read-only and reports provider invocation disabled', () => {
  const registry = listProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' });
  assert.equal(registry.authority, 'READ_ONLY_PROVIDER_REGISTRY');
  assert.equal(registry.execution_mode, 'DRY_RUN');
  assert.equal(registry.provider_invocation, 'DISABLED');
  assert.equal(registry.providers.length, 1);
});
