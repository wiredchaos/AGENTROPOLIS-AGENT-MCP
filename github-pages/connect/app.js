const baseUrlInput = document.querySelector('#baseUrl');
const checkButton = document.querySelector('#checkButton');
const healthResult = document.querySelector('#healthResult');
const configOutput = document.querySelector('#configOutput');
const copyButton = document.querySelector('#copyButton');
const modeDescription = document.querySelector('#modeDescription');
const tabs = [...document.querySelectorAll('.tab')];

let mode = 'native';

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function renderConfig() {
  const baseUrl = normalizeBaseUrl(baseUrlInput.value) || 'https://agentropolis-agent-mcp.chaoswired.workers.dev';
  const mcpUrl = `${baseUrl}/mcp`;
  const server = mode === 'native'
    ? {
        url: mcpUrl,
        transport: 'streamable-http'
      }
    : {
        command: 'npx',
        args: ['-y', 'mcp-remote', mcpUrl]
      };

  configOutput.textContent = JSON.stringify({
    mcpServers: {
      'agentropolis-grid': server
    }
  }, null, 2);
}

async function checkRuntime() {
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  if (!baseUrl) {
    healthResult.className = 'health bad';
    healthResult.textContent = 'Enter a valid HTTPS Worker URL.';
    return;
  }

  healthResult.className = 'health neutral';
  healthResult.textContent = 'Checking /health and /.well-known/mcp.json ...';
  checkButton.disabled = true;

  try {
    const [healthResponse, manifestResponse] = await Promise.all([
      fetch(`${baseUrl}/health`, { headers: { accept: 'application/json' } }),
      fetch(`${baseUrl}/.well-known/mcp.json`, { headers: { accept: 'application/json' } })
    ]);

    if (!healthResponse.ok || !manifestResponse.ok) {
      throw new Error(`health=${healthResponse.status}, manifest=${manifestResponse.status}`);
    }

    const health = await healthResponse.json();
    const manifest = await manifestResponse.json();
    const toolCount = manifest?.tools?.length ?? manifest?.capabilities?.tools?.length ?? 'unknown';
    healthResult.className = 'health good';
    healthResult.textContent = `ONLINE · ${health.service || 'agentropolis-agent-mcp'} · status=${health.status || 'ok'} · tools=${toolCount}`;
  } catch (error) {
    healthResult.className = 'health bad';
    healthResult.textContent = `UNREACHABLE · ${error instanceof Error ? error.message : 'runtime check failed'}`;
  } finally {
    checkButton.disabled = false;
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    mode = tab.dataset.mode;
    tabs.forEach((item) => item.classList.toggle('active', item === tab));
    modeDescription.textContent = mode === 'native'
      ? 'Use this when your HERMES build accepts remote MCP servers with a URL and Streamable HTTP transport.'
      : 'Use this compatibility lane when HERMES only accepts command-based stdio servers. It uses Node and avoids the broken local Python import path.';
    renderConfig();
  });
});

baseUrlInput.addEventListener('input', renderConfig);
checkButton.addEventListener('click', checkRuntime);
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(configOutput.textContent);
    const prior = copyButton.textContent;
    copyButton.textContent = 'Copied';
    setTimeout(() => { copyButton.textContent = prior; }, 1400);
  } catch {
    configOutput.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(configOutput);
    selection.addRange(range);
  }
});

const saved = new URLSearchParams(window.location.search).get('url');
if (saved) baseUrlInput.value = saved;
renderConfig();
