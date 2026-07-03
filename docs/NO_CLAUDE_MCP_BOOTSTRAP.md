# No-Claude MCP Bootstrap Lane

AGENTROPOLIS AGENT MCP KIT is the tool and routing lane for Agentropolis. It should not require Claude, Spawn, or any single provider-specific shell.

## Role

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> execute or deny
  -> validate output
  -> log receipt
```

## Windows development baseline

Use WSL Ubuntu for shell scripts, package installs, and local agent infrastructure work.

PowerShell, run as Administrator:

```powershell
wsl --install
```

Inside Ubuntu:

```bash
mkdir -p ~/wiredchaos
cd ~/wiredchaos

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip build-essential ca-certificates gnupg nodejs npm python3 python3-pip

git clone https://github.com/wiredchaos/AGENTROPOLIS-AGENT-MCP.git
cd AGENTROPOLIS-AGENT-MCP
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Provider-agnostic MCP rule

The MCP kit should expose capabilities and authority boundaries, not provider loyalty.

Approved pattern:

```text
HERMES Dispatch
  -> Model Council Routing
  -> MCP Registry
  -> Policy Gate
  -> Tool Lane
  -> Receipt Log
```

Avoid:

```text
Operator
  -> single hardcoded provider
  -> uncontrolled tool execution
```

## Build direction

Next executable layer:

- MCP registry manifest
- tool authority schema
- risk scoring schema
- model lane selector
- audit receipt format
- local static demo for the Command Atrium

No permanent provider lock. No ambient tool authority. No wallet-capable action without policy gate approval.
