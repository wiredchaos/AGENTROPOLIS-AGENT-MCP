import test from "node:test";
import assert from "node:assert/strict";
import {
  assertPiExecutionPreconditions,
  loadPiRuntimeConfig,
  resolvePiMode
} from "../src/runtime/pi-runtime-adapter.js";

test("Pi adapter defaults to advisory read-only tools", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config);
  assert.equal(config.status, "DISABLED_BY_DEFAULT");
  assert.equal(config.cloudflareWorkerExecutionAllowed, false);
  assert.equal(mode.name, "ADVISORY");
  assert.equal(mode.mutationsAllowed, false);
  assert.deepEqual(mode.tools, ["read", "grep", "find", "ls"]);
});

test("Pi execute mode requires verified sandbox and approval", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "EXECUTE");
  const base = {
    workerApproved: true,
    workspaceRoot: "/workspace/repo",
    workspaceIdentityVerified: true,
    credentialHandleResolved: true,
    effectiveCapabilitiesAttested: true,
    receiptDestinationConfigured: true,
    egressPolicyLoaded: true,
    mutationApproved: true,
    rawSecretsPresent: false
  };
  assert.throws(() => assertPiExecutionPreconditions({ config, mode, context: base }), /verified sandbox/);
  assert.equal(assertPiExecutionPreconditions({ config, mode, context: { ...base, sandboxVerified: true } }), true);
});

test("Pi mutation modes fail closed without approval", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "DRAFT");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: {
      workerApproved: true,
      workspaceRoot: "/workspace/repo",
      workspaceIdentityVerified: true,
      credentialHandleResolved: true,
      effectiveCapabilitiesAttested: true,
      receiptDestinationConfigured: true,
      egressPolicyLoaded: true,
      mutationApproved: false,
      rawSecretsPresent: false
    }
  }), /explicit policy or operator approval/);
});

test("Pi runtime rejects raw secrets", async () => {
  const config = await loadPiRuntimeConfig();
  const mode = resolvePiMode(config, "ADVISORY");
  assert.throws(() => assertPiExecutionPreconditions({
    config,
    mode,
    context: {
      workerApproved: true,
      workspaceRoot: "/workspace/repo",
      workspaceIdentityVerified: true,
      credentialHandleResolved: true,
      effectiveCapabilitiesAttested: true,
      receiptDestinationConfigured: true,
      egressPolicyLoaded: true,
      rawSecretsPresent: true
    }
  }), /Raw secrets/);
});
