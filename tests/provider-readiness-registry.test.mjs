import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listProviderReadiness,
  openArtProviderReadiness,
  comfyUIProviderReadiness,
  blenderUtilityReadiness,
  ffmpegUtilityReadiness,
} from '../src/provider-readiness-registry.js';

test('all external MCP lanes remain pending and non-invoking without evidence', () => {
  for (const readiness of [
    openArtProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' }),
    comfyUIProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' }),
    blenderUtilityReadiness({ EXECUTION_MODE: 'DRY_RUN' }),
    ffmpegUtilityReadiness({ EXECUTION_MODE: 'DRY_RUN' }),
  ]) {
    assert.equal(readiness.runtime_id, null);
    assert.equal(readiness.eligible, false);
    assert.equal(readiness.registry_state, 'PENDING_EVIDENCE');
    assert.equal(readiness.authority, 'READINESS_ONLY');
    assert.equal(readiness.invocation_performed, false);
  }
});

test('provider registry is read-only and preserves provider/utility distinction', () => {
  const registry = listProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' });
  assert.equal(registry.authority, 'READ_ONLY_PROVIDER_REGISTRY');
  assert.equal(registry.execution_mode, 'DRY_RUN');
  assert.equal(registry.provider_invocation, 'DISABLED');
  assert.equal(registry.providers.length, 4);
  assert.equal(registry.providers.filter((entry) => entry.kind === 'GENERATION_PROVIDER').length, 2);
  assert.equal(registry.providers.filter((entry) => entry.kind === 'UTILITY_RUNTIME').length, 2);
});
