import test from 'node:test';
import assert from 'node:assert/strict';
import { DISTRICTS } from '../src/core.js';
import {
  OBSERVATORY_TOOLS,
  OBSERVATORY_VIEWS,
  buildObservatorySnapshot,
  observatoryViewForTool,
  validateObservatoryArguments
} from '../src/observatory.js';

test('registers five bounded read-only observatory tools', () => {
  assert.equal(OBSERVATORY_TOOLS.length, 5);
  for (const tool of OBSERVATORY_TOOLS) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
  }
});

test('exposes the four canonical observatory views', () => {
  assert.deepEqual(OBSERVATORY_VIEWS, ['topology', 'thermodynamics', 'memory_evolution', 'skill_development']);
});

test('marks reference output as non-live when no receipts exist', () => {
  const snapshot = buildObservatorySnapshot('topology', DISTRICTS, { receiptCount: 0, avgDurationMs: 0, toolCalls: [] });
  assert.equal(snapshot.telemetryState, 'canonical-baseline');
  assert.equal(snapshot.liveTelemetry, false);
  assert.equal(snapshot.data.summary.connectedComponents, 1);
});

test('marks receipt-backed output as live observability', () => {
  const runtime = { receiptCount: 18, avgDurationMs: 42.4, lastReceiptAt: '2026-08-06T00:00:00.000Z', toolCalls: [{ tool: 'route_front_desk', count: 18 }] };
  const snapshot = buildObservatorySnapshot('thermodynamics', DISTRICTS, runtime);
  assert.equal(snapshot.telemetryState, 'receipt-backed-observability');
  assert.equal(snapshot.liveTelemetry, true);
  assert.equal(snapshot.data.runtime.receiptCount, 18);
});

test('preserves human-governed capability promotion', () => {
  const snapshot = buildObservatorySnapshot('skill_development', DISTRICTS);
  assert.equal(snapshot.data.summary.selfPromotionAllowed, false);
  assert.match(snapshot.data.doctrine, /Only governed evidence/i);
});

test('maps tool names and rejects unexpected arguments', () => {
  const tool = OBSERVATORY_TOOLS.find((item) => item.name === 'get_agentropolis_observatory_snapshot');
  assert.equal(observatoryViewForTool('get_agentropolis_memory_evolution'), 'memory_evolution');
  assert.equal(validateObservatoryArguments(tool, { view: 'all' }), null);
  assert.match(validateObservatoryArguments(tool, { view: 'unknown' }), /invalid observatory view/);
  assert.match(validateObservatoryArguments(tool, { view: 'all', execute: true }), /unexpected argument/);
});

test('exposes the bounded observation window and truncation flag in snapshots', () => {
  const runtime = {
    receiptCount: 3, avgDurationMs: 12, lastReceiptAt: '2026-08-06T00:00:00.000Z', toolCalls: [],
    observationWindow: { windowHours: 24, maxReceipts: 2, truncated: true }
  };
  const snapshot = buildObservatorySnapshot('topology', DISTRICTS, runtime);
  assert.equal(snapshot.data.runtime.observationWindow.windowHours, 24);
  assert.equal(snapshot.data.runtime.observationWindow.maxReceipts, 2);
  assert.equal(snapshot.data.runtime.observationWindow.truncated, true);
  const empty = buildObservatorySnapshot('topology', DISTRICTS);
  assert.equal(empty.data.runtime.observationWindow.truncated, false);
});
