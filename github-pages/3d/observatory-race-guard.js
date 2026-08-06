'use strict';

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
