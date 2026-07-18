#!/usr/bin/env python3
"""Validate Unreal MCP pilot JSON contracts using the Python standard library."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
ADAPTER_PATH = ROOT / "config" / "unreal-mcp-adapter.json"
REQUEST_PATH = ROOT / "pilot" / "unreal-mcp" / "read-only-request.json"
RECEIPT_PATH = ROOT / "pilot" / "unreal-mcp" / "receipt-template.json"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def require_keys(label: str, value: dict[str, Any], keys: set[str]) -> None:
    missing = sorted(keys - value.keys())
    if missing:
        raise ValueError(f"{label} missing required keys: {', '.join(missing)}")


def main() -> None:
    adapter = load_json(ADAPTER_PATH)
    request = load_json(REQUEST_PATH)
    receipt = load_json(RECEIPT_PATH)

    require_keys(
        "adapter",
        adapter,
        {
            "adapterId",
            "status",
            "pilotMode",
            "endpoint",
            "networkBoundary",
            "allowedCapabilities",
            "deniedCapabilities",
            "activationRequirements",
            "killConditions",
        },
    )
    require_keys(
        "request",
        request,
        {
            "request_id",
            "mandate_id",
            "adapter",
            "project",
            "map",
            "operation_class",
            "requested_capabilities",
            "approval_state",
            "validation_plan",
            "receipt_required",
        },
    )
    require_keys(
        "receipt",
        receipt,
        {
            "receipt_id",
            "request_id",
            "mandate_id",
            "adapter",
            "endpoint_class",
            "live_toolsets",
            "project",
            "map",
            "operations",
            "changed_packages",
            "validation_results",
            "evidence",
            "warnings",
            "approval_state",
            "started_at",
            "completed_at",
        },
    )

    if adapter["status"] != "DISABLED_BY_DEFAULT":
        raise ValueError("adapter must remain DISABLED_BY_DEFAULT")
    if adapter["pilotMode"] != "READ_ONLY":
        raise ValueError("pilotMode must be READ_ONLY")
    if adapter["networkBoundary"] != "LOOPBACK_ONLY":
        raise ValueError("networkBoundary must be LOOPBACK_ONLY")
    if not str(adapter["endpoint"]).startswith("http://127.0.0.1:"):
        raise ValueError("endpoint must bind to 127.0.0.1")
    if request["adapter"] != adapter["adapterId"]:
        raise ValueError("request adapter does not match registry adapterId")
    if request["operation_class"] != "READ":
        raise ValueError("pilot request must remain READ-only")
    if request["receipt_required"] is not True:
        raise ValueError("pilot request must require a receipt")

    allowed = set(adapter["allowedCapabilities"])
    requested = set(request["requested_capabilities"])
    denied = set(adapter["deniedCapabilities"])
    if not requested <= allowed:
        raise ValueError(f"unapproved requested capabilities: {sorted(requested - allowed)}")
    if requested & denied:
        raise ValueError(f"requested capabilities are denied: {sorted(requested & denied)}")
    if receipt["changed_packages"] != []:
        raise ValueError("read-only receipt template must begin with no changed packages")

    print("Unreal MCP read-only pilot contracts are valid.")


if __name__ == "__main__":
    main()
