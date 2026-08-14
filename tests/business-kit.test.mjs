import test from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_KIT_TOOLS,
  businessKitManifest,
  globalJurisdictionAdapterContract,
  planBusinessSetup,
  validateBusinessReadiness,
  validateBusinessKitArguments
} from "../src/business-kit.js";

test("business kit is explicitly global and provider neutral", () => {
  const manifest = businessKitManifest();
  assert.equal(manifest.scope, "GLOBAL_WEB3_AND_TRADITIONAL_BUSINESS");
  assert.equal(manifest.architectureRule, "Global core, local adapters, provider-neutral execution.");
  assert.equal(manifest.authority.publicMcp, "READ_ONLY_PLANNING");
  assert.ok(manifest.verticalSpine.includes("jurisdiction_resolution"));
  assert.ok(manifest.verticalSpine.includes("web3_wallet_treasury_and_token_controls"));
});

test("US-only concepts are not universal requirements", () => {
  const manifest = businessKitManifest();
  assert.deepEqual(manifest.examplesOfLocalOnlyConcepts.US, ["EIN", "S corporation election"]);
  assert.match(manifest.examplesOfLocalOnlyConcepts.rule, /never appear as universal/i);
});

test("jurisdiction adapter contract fails safe when local verification is unavailable", () => {
  const contract = globalJurisdictionAdapterContract();
  assert.equal(contract.principle, "Global core, local adapters.");
  assert.match(contract.fallback, /REQUIRE_LOCAL_VERIFICATION/);
  assert.ok(contract.requiredAdapterMethods.includes("resolve_web3_and_virtual_asset_constraints"));
  assert.ok(contract.requiredAdapterMethods.includes("resolve_data_residency_and_privacy_requirements"));
});

test("cross-border planning expands jurisdiction review", () => {
  const plan = planBusinessSetup({
    countryCode: "SG",
    operatingCountries: ["SG", "AE"],
    customerCountries: ["GB", "DE"],
    taxResidencyCountries: ["SG"],
    dataResidencyCountries: ["DE"],
    entityForm: "private_limited_company",
    taxTreatment: "undecided",
    web3Enabled: true,
    custodyMode: "third_party_custody",
    tokenActivity: "payments"
  });
  assert.deepEqual(plan.countriesInScope.sort(), ["AE", "DE", "GB", "SG"]);
  assert.equal(plan.status, "REQUIRES_LOCAL_ADAPTER_VALIDATION");
  assert.ok(plan.steps.some((s) => s.id === "cross_border_exposure" && s.status === "required"));
  assert.ok(plan.steps.some((s) => s.id === "web3_activity_classification" && s.risk === "critical"));
});

test("web3 readiness requires classified custody and sanctions controls", () => {
  const result = validateBusinessReadiness({
    countryCode: "CH",
    entityForm: "company_limited_by_shares",
    taxTreatment: "default",
    web3Enabled: true,
    custodyMode: "undecided",
    tokenActivity: "treasury",
    humanOwnerOrResponsiblePartyConfirmed: true,
    hasEntity: true,
    hasTaxIdentity: true,
    hasBanking: true,
    sanctionsScreeningConfigured: false,
    kybKycProviderConfigured: false
  });
  assert.equal(result.status, "INCOMPLETE");
  assert.ok(result.findings.some((f) => f.code === "WEB3_CUSTODY_UNDECIDED"));
  assert.ok(result.findings.some((f) => f.code === "SANCTIONS_CONTROL_REQUIRED"));
});

test("tool argument validation accepts global country arrays", () => {
  const tool = BUSINESS_KIT_TOOLS.find((t) => t.name === "plan_agent_business_setup");
  assert.equal(validateBusinessKitArguments(tool, { countryCode: "CA", operatingCountries: ["CA", "US"] }), null);
  assert.match(validateBusinessKitArguments(tool, { countryCode: "USA" }), /two-letter country code/);
});
