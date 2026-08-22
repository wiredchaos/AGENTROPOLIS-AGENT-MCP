import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listProviderReadiness,
  openArtProviderReadiness,
  openArtVerificationEvidence,
  openArtCanaryEvidence,
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

test('openart verification evidence records verified discovery but stays gated', () => {
  const evidence = openArtVerificationEvidence();
  assert.equal(evidence.provider_id, 'openart-mcp');
  assert.equal(evidence.authentication, 'VERIFIED');
  assert.equal(evidence.oauth.mechanism, 'OAuth 2.1 PKCE');
  assert.equal(evidence.oauth.scope, 'full_access');
  assert.equal(evidence.discovery.tool_manifest, 'VERIFIED');
  assert.equal(evidence.discovery.tool_count, 16);
  assert.equal(
    evidence.discovery.manifest_sha256,
    'dc2a73275cd0c59acf477eb5228ec34a2178580cce8b98cb8ca369239e3d44e5',
  );
  assert.equal(evidence.discovery.read_capability, 'VERIFIED');
  assert.equal(evidence.discovery.machine_readable_schema, 'VERIFIED');
  // Runtime/server ID is UNKNOWN because the server does not expose one — do not fabricate.
  assert.equal(evidence.discovery.runtime_id, null);
  // Write/generative stays CONDITIONAL; invocation stays GATED.
  assert.equal(evidence.capability.write_generative_readiness, 'CONDITIONAL');
  assert.equal(evidence.capability.invocation, 'GATED');
  assert.equal(evidence.capability.destructive_tools, 0);
  // Zero-credit-spend + no-generation findings.
  assert.equal(evidence.cost.credits_spent, 0);
  assert.equal(evidence.cost.generation_invoked, false);
});

test('openart evidence does not flip eligibility — readiness remains pending/conditional', () => {
  const readiness = openArtProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' });
  // Evidence is governance metadata; it must NOT make the provider eligible.
  assert.equal(readiness.eligible, false);
  assert.equal(readiness.registry_state, 'PENDING_EVIDENCE');
  assert.equal(readiness.invocation_performed, false);
  assert.equal(readiness.authority, 'READINESS_ONLY');
});

test('openart canary evidence records one bounded invocation with gate retained', () => {
  const canary = openArtCanaryEvidence();
  assert.equal(canary.canary_execution, 'VERIFIED');
  assert.equal(canary.authorization, 'HUMAN_SINGLE_INVOCATION');
  assert.equal(canary.invocation_count, 1);
  assert.equal(canary.model, 'kling-3-omni');
  assert.equal(canary.mode, 'text2image');
  assert.equal(canary.requested_images, 1);
  assert.equal(canary.returned_assets, 1);
  assert.equal(canary.quoted_credits, 10);
  assert.equal(canary.actual_charged_credits, 10);
  assert.equal(canary.quote_matched_charge, true);
  assert.equal(canary.retries, 0);
  assert.equal(canary.fallback_model, 'NONE');
  assert.equal(canary.provider_switch, 'NONE');
  assert.equal(canary.second_invocation, 'NONE');
  assert.equal(canary.execution_status, 'COMPLETED');
  assert.equal(canary.lane_state_after_canary, 'GATED');
  assert.equal(canary.live, 'UNARMED');
  assert.equal(canary.series_amount_finding, 'seriesAmount=4 inert under resultType=single');
});

test('openart canary evidence does NOT grant standing write authority', () => {
  const canary = openArtCanaryEvidence();
  // Bounded single-job corridor is verified, but the standing gate stays closed.
  assert.equal(canary.write_corridor.bounded_single_job_canary, 'VERIFIED');
  assert.equal(canary.write_corridor.standing_write_authority, 'NOT_GRANTED');
  assert.equal(canary.write_corridor.autonomous_invocation, 'NOT_AUTHORIZED');
  assert.equal(canary.write_corridor.default_gate, 'CLOSED');
  // The readiness registry itself still reports the provider as non-eligible.
  const readiness = openArtProviderReadiness({ EXECUTION_MODE: 'DRY_RUN' });
  assert.equal(readiness.eligible, false);
  assert.equal(readiness.invocation_performed, false);
});
