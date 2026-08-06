'use strict';

const basePreview = preview;
preview = function derivedPreview(view) {
  const snapshot = basePreview(view);
  const data = snapshot.data || snapshot;

  if (view === 'topology') {
    const nodes = data.nodes || [];
    const edges = data.edges || [];
    data.summary = {
      ...(data.summary || {}),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      districtCount: nodes.filter((node) => node.type === 'district').length,
      connectedComponents: nodes.length ? 1 : 0,
      averageDegree: nodes.length ? Number(((edges.length * 2) / nodes.length).toFixed(2)) : 0
    };
  } else if (view === 'thermodynamics') {
    const rows = data.perDistrict || [];
    data.summary = {
      energyIn: averagePreview(rows, 'energyIn'),
      valueOut: averagePreview(rows, 'valueOut'),
      coordinationFriction: averagePreview(rows, 'friction'),
      entropyRate: averagePreview(rows, 'entropyRate', 2),
      drift: averagePreview(rows, 'drift'),
      stabilityIndex: averagePreview(rows, 'stability')
    };
  } else if (view === 'memory_evolution') {
    const layers = data.layers || [];
    const clusters = data.clusters || [];
    const totalMemories = layers.reduce((sum, layer) => sum + Number(layer.count || 0), 0);
    data.summary = {
      totalMemories,
      averageConfidence: averagePreview(clusters, 'confidence', 2),
      provenanceCoverage: averagePreview(clusters, 'provenanceCoverage'),
      contradictions: clusters.reduce((sum, item) => sum + Number(item.contradictions || 0), 0),
      archived: Math.round(totalMemories * 0.09)
    };
  } else if (view === 'skill_development') {
    const rows = data.perDistrict || [];
    data.summary = {
      trackedCapabilities: rows.length * 14,
      verifiedCapabilities: rows.reduce((sum, item) => sum + Math.round(Number(item.verifiedCompetence || 0) / 10), 0),
      averageReadiness: averagePreview(rows, 'readiness'),
      approvalState: 'human-governed',
      selfPromotionAllowed: false
    };
  }

  return snapshot;
};

function averagePreview(rows, key, precision = 0) {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
  return Number((total / rows.length).toFixed(precision));
}

obsData = preview(obsView);
updateObservatory('CANONICAL PREVIEW · NOT LIVE TELEMETRY');

let observatoryRequestVersion = 0;
let observatoryAbortController = null;

function cancelObservatorySync() {
  observatoryRequestVersion += 1;
  if (observatoryAbortController) observatoryAbortController.abort();
  observatoryAbortController = null;
}

for (const button of obsTabs) {
  const previousHandler = button.onclick;
  button.onclick = (event) => {
    cancelObservatorySync();
    previousHandler?.call(button, event);
    obsData = preview(obsView);
    updateObservatory('CANONICAL PREVIEW · CONNECT HERMES MCP FOR RECEIPT-BACKED DATA');
  };
}

syncObservatory = async function guardedObservatorySync() {
  const base = normalize(document.querySelector('#baseUrl').value);
  if (!base) {
    obsStatus.className = 'readout offline';
    obsStatus.textContent = 'ENTER A VALID HERMES WORKER URL IN HERMES DOCK FIRST.';
    return;
  }

  cancelObservatorySync();
  const requestVersion = observatoryRequestVersion;
  const requestedView = obsView;
  const requestedTool = VIEW_TOOL[requestedView];
  const controller = new AbortController();
  observatoryAbortController = controller;

  obsStatus.className = 'readout checking';
  obsStatus.textContent = `CALLING MCP TOOL · ${requestedTool}`;
  obsSync.disabled = true;

  try {
    const response = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-protocol-version': '2025-06-18'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `obs-${Date.now()}`,
        method: 'tools/call',
        params: { name: requestedTool, arguments: {} }
      }),
      signal: controller.signal
    });

    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw Error(payload.error?.message || `HTTP ${response.status}`);
    }

    if (requestVersion !== observatoryRequestVersion || requestedView !== obsView) return;

    const nextData = payload.result?.structuredContent?.observatory
      || JSON.parse(payload.result?.content?.[0]?.text || '{}').observatory;
    if (!nextData?.data) throw Error('MCP response did not include observatory data');

    obsData = nextData;
    obsMode = obsData.liveTelemetry ? 'receipt-backed' : 'baseline';
    const receipt = payload.result?._meta?.receiptId || obsData.receipt?.id || 'unavailable';
    updateObservatory(
      `${obsData.liveTelemetry ? 'LIVE RECEIPT-BACKED' : 'CANONICAL BASELINE'} · RECEIPT ${receipt}`,
      'online'
    );
  } catch (error) {
    if (error?.name === 'AbortError' || requestVersion !== observatoryRequestVersion || requestedView !== obsView) return;
    obsData = preview(requestedView);
    obsMode = 'preview';
    updateObservatory(`MCP UNREACHABLE · ${error.message} · SHOWING SAFE PREVIEW`, 'offline');
  } finally {
    if (requestVersion === observatoryRequestVersion) {
      observatoryAbortController = null;
      obsSync.disabled = false;
    }
  }
};

obsSync.onclick = syncObservatory;
