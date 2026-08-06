/* Agentropolis landing — city preview, shared hero video, runtime status. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Config: query → localStorage → public config file → NOT CONFIGURED ── */
  function normalize(value) {
    try {
      var url = new URL(String(value || '').trim().replace(/\/+$/, ''));
      if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return '';
      return url.toString().replace(/\/$/, '');
    } catch (e) { return ''; }
  }

  var params = new URLSearchParams(window.location.search);
  var fromQuery = params.get('mcp') || '';
  var fromStorage = window.localStorage.getItem('agentropolis.mcp.baseUrl') || '';
  var cfg = {
    baseUrl: normalize(fromQuery || fromStorage),
    healthUrl: '',
    manifestUrl: '',
    configUrl: 'landing-config.json'
  };
  if (fromQuery && cfg.baseUrl) window.localStorage.setItem('agentropolis.mcp.baseUrl', cfg.baseUrl);
  cfg.healthUrl = cfg.baseUrl ? cfg.baseUrl + '/health' : '';
  cfg.manifestUrl = cfg.baseUrl ? cfg.baseUrl + '/.well-known/mcp.json' : '';

  /* ── Runtime status widget ── */
  var card = document.getElementById('runtimeCard');
  var led = document.getElementById('runtimeLed');
  var stateEl = document.getElementById('runtimeState');
  var serviceEl = document.getElementById('rtService');
  var versionEl = document.getElementById('rtVersion');
  var toolsEl = document.getElementById('rtTools');
  var lastEl = document.getElementById('rtLast');
  var detailEl = document.getElementById('rtDetail');

  function setState(state, detail) {
    card.dataset.state = state;
    stateEl.textContent = state;
    if (detail) detailEl.textContent = detail;
  }

  async function checkRuntime() {
    if (!cfg.baseUrl) {
      setState('NOT CONFIGURED', 'Set the Worker base URL in landing-config.json or via ?mcp= to enable live checks.');
      return;
    }
    setState('CHECKING', 'Checking /health and /.well-known/mcp.json.');
    try {
      var healthRes = await fetch(cfg.healthUrl, { headers: { accept: 'application/json' } });
      var manifestRes = await fetch(cfg.manifestUrl, { headers: { accept: 'application/json' } });
      if (!healthRes.ok || !manifestRes.ok) {
        setState('OFFLINE', 'health=' + healthRes.status + ', manifest=' + manifestRes.status);
        return;
      }
      var health = await healthRes.json();
      var manifest = await manifestRes.json();
      serviceEl.textContent = String(health.service || manifest.service || 'agentropolis-agent-mcp');
      versionEl.textContent = String(health.version || manifest.schema_version || '—');
      toolsEl.textContent = String((manifest.tools && manifest.tools.length) ||
        (manifest.capabilities && manifest.capabilities.tools && manifest.capabilities.tools.length) || '—');
      lastEl.textContent = new Date().toISOString();
      setState('ONLINE', (health.status || 'ONLINE') + ' — manifest valid, READ_ONLY lane.');
    } catch (error) {
      setState('OFFLINE', error instanceof Error ? error.message : 'MCP check failed.');
    }
  }

  /* ── Shared hero video (same IndexedDB store as the 3D city) ── */
  function loadSharedHero() {
    var video = document.getElementById('heroVideo');
    if (!video) return;
    try {
      var req = indexedDB.open('agentropolis-media', 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('hero-assets'); };
      req.onsuccess = function () {
        var db = req.result;
        var tx = db.transaction('hero-assets', 'readonly');
        var get = tx.objectStore('hero-assets').get('hero-video');
        get.onsuccess = function () {
          var record = get.result;
          if (record && record.blob) {
            video.src = URL.createObjectURL(record.blob);
            video.play().catch(function () { /* autoplay blocked — static city remains */ });
          }
        };
      };
    } catch (e) { /* IndexedDB unavailable — static hero only */ }
  }

  /* ── City preview canvas ── */
  var canvas = document.getElementById('cityPreview');
  var ctx = canvas && canvas.getContext('2d');
  var buildings = [
    { x: 0.42, y: 0.58, w: 0.10, h: 0.26, c: '#00f5d4', s: 'GRID CORE' },
    { x: 0.52, y: 0.64, w: 0.11, h: 0.13, c: '#00bde8', s: 'HERMES' },
    { x: 0.62, y: 0.55, w: 0.09, h: 0.22, c: '#a75cff', s: 'REGISTRY' },
    { x: 0.70, y: 0.62, w: 0.10, h: 0.15, c: '#39ff43', s: 'RELAY' },
    { x: 0.36, y: 0.62, w: 0.10, h: 0.14, c: '#f3cf72', s: 'VAULT' },
    { x: 0.58, y: 0.44, w: 0.14, h: 0.10, c: '#ff2a4f', s: 'RISK' }
  ];
  var traces = [
    { a: [0.42, 0.58], b: [0.52, 0.64], c: '#23e7ff' },
    { a: [0.52, 0.64], b: [0.62, 0.55], c: '#23e7ff' },
    { a: [0.36, 0.62], b: [0.42, 0.58], c: '#ff2b4f' },
    { a: [0.62, 0.55], b: [0.58, 0.44], c: '#ff2b4f' },
    { a: [0.52, 0.64], b: [0.70, 0.62], c: '#23e7ff' }
  ];

  function fit() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx && ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', function () { fit(); drawFrame(0); });

  function drawFrame(t) {
    if (!canvas || !ctx) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    /* motherboard grid */
    ctx.strokeStyle = 'rgba(35,231,255,.05)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (var gy = 0; gy < h; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
    /* traces */
    traces.forEach(function (tr, i) {
      var phase = reduceMotion ? 0 : ((t / 900) + i * 0.25) % 1;
      var ax = tr.a[0] * w, ay = tr.a[1] * h, bx = tr.b[0] * w, by = tr.b[1] * h;
      ctx.strokeStyle = tr.c; ctx.globalAlpha = 0.28; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.globalAlpha = 1;
      var px = ax + (bx - ax) * phase, py = ay + (by - ay) * phase;
      ctx.fillStyle = tr.c;
      ctx.shadowColor = tr.c; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    /* buildings */
    buildings.forEach(function (b) {
      var x = b.x * w, y = b.y * h, bw = b.w * w, bh = b.h * h;
      ctx.fillStyle = 'rgba(6,12,18,.72)';
      ctx.fillRect(x, y - bh, bw, bh);
      ctx.strokeStyle = b.c; ctx.lineWidth = 1.4; ctx.shadowColor = b.c; ctx.shadowBlur = 10;
      ctx.strokeRect(x, y - bh, bw, bh);
      ctx.shadowBlur = 0;
      /* roof LED */
      var pulse = reduceMotion ? 0.7 : (0.55 + 0.45 * Math.sin((t / 500) + b.x * 20));
      ctx.globalAlpha = pulse; ctx.fillStyle = b.c;
      ctx.fillRect(x + 2, y - bh + 2, bw - 4, 2);
      ctx.globalAlpha = 1;
      /* label */
      ctx.fillStyle = 'rgba(238,247,255,.55)';
      ctx.font = '700 10px ui-monospace, monospace';
      ctx.fillText(b.s, x + 2, y - 4);
    });
  }

  function startCity() {
    if (!canvas) return;
    fit();
    if (reduceMotion) { drawFrame(0); return; }
    function loop(t) { drawFrame(t); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  /* ── Boot ── */
  startCity();
  loadSharedHero();
  checkRuntime();
  fetch(cfg.configUrl, { headers: { accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var fileBase = normalize(data && data.baseUrl);
      if (fileBase && fileBase !== cfg.baseUrl) {
        cfg.baseUrl = fileBase;
        cfg.healthUrl = fileBase + '/health';
        cfg.manifestUrl = fileBase + '/.well-known/mcp.json';
        checkRuntime();
      }
    })
    .catch(function () {});
})();
