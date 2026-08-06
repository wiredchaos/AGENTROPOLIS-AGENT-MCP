import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExtendedManifest,
  classifyMcpIntercept,
  summarizeReceiptRows
} from '../src/observatory-index.js';

test('intercepts only valid Observatory and manifest MCP requests', () => {
  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }), { kind: 'tools-list' });

  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: 'get_agentropolis_topology', arguments: {} }
  }), { kind: 'tools-call' });

  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'get_cloudflare_deployment_manifest', arguments: {} }
  }), { kind: 'tools-call' });

  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '1.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'get_agentropolis_topology', arguments: {} }
  }), { kind: 'invalid' });

  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: 'get_agentropolis_topology', arguments: {} }
  }), { kind: 'notification' });

  assert.deepEqual(classifyMcpIntercept({
    jsonrpc: '2.0',
    id: 5,
    method: 'ping'
  }), { kind: 'delegate' });
});

test('returns one consistent ten-tool manifest across discovery paths', () => {
  const manifest = buildExtendedManifest({
    SERVICE_VERSION: '1.0.0',
    ENVIRONMENT: 'test',
    MCP_AUTH_MODE: 'public-read'
  });

  assert.equal(manifest.tools.length, 10);
  assert.equal(manifest.endpoints.observatory, '/api/observatory');
  assert.equal(manifest.observatory.authority, 'READ_ONLY');
  assert.ok(manifest.tools.some((tool) => tool.name === 'get_agentropolis_observatory_snapshot'));
  assert.ok(manifest.tools.some((tool) => tool.name === 'get_cloudflare_deployment_manifest'));
});

test('bounds receipt aggregation and marks truncated samples', () => {
  const rows = [
    { tool_name: 'route_front_desk', duration_ms: 10, created_at: '2026-08-06T02:00:00.000Z' },
    { tool_name: 'route_front_desk', duration_ms: 30, created_at: '2026-08-06T01:00:00.000Z' },
    { tool_name: 'get_agentropolis_topology', duration_ms: 50, created_at: '2026-08-06T00:00:00.000Z' }
  ];

  const runtime = summarizeReceiptRows(rows, {
    maxReceipts: 2,
    windowHours: 24,
    since: '2026-08-05T02:00:00.000Z'
  });

  assert.equal(runtime.receiptCount, 2);
  assert.equal(runtime.receiptCountIsLowerBound, true);
  assert.equal(runtime.avgDurationMs, 20);
  assert.equal(runtime.lastReceiptAt, '2026-08-06T02:00:00.000Z');
  assert.equal(runtime.toolCalls.length, 1);
  assert.equal(runtime.toolCalls[0].count, 2);
  assert.equal(runtime.observationWindow.truncated, true);
  assert.equal(runtime.observationWindow.maxReceipts, 2);
});
