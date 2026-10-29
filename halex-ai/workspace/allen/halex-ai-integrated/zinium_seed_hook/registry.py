"""Agency registry for the ZINIUM seed hook (Allen-authored).

Seed Marker: ZINIUM-SEED-ALLEN.

The registry is a plain data file (agencies.json, beside this module) so
other agencies can be added without code changes. An agency entry maps an
agency name to its public ZINIUM seed marker and role.

Honesty note: a seed marker is a public provenance label, not a credential.
Registry membership decides which markers the coordinator will accept; it
does not and cannot prove which system actually created an envelope.
"""

import json
import os
from typing import Any, Dict, Optional

DEFAULT_REGISTRY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agencies.json")


def load_registry(path: Optional[str] = None) -> Dict[str, Any]:
    """Load the registry dict from agencies.json (or a caller-supplied path)."""
    with open(path or DEFAULT_REGISTRY_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def get_agency(registry: Dict[str, Any], agency_name: str) -> Optional[Dict[str, Any]]:
    """Return one agency record by name (for example "ALLEN"), or None."""
    return registry.get("agencies", {}).get(agency_name)


def agency_for_seed_marker(registry: Dict[str, Any], seed_marker: str) -> Optional[str]:
    """Return the agency name registered for a seed marker, or None."""
    for name, record in registry.get("agencies", {}).items():
        if record.get("seed_marker") == seed_marker:
            return name
    return None


def is_registered_marker(registry: Dict[str, Any], seed_marker: str) -> bool:
    """True when some active agency is registered under this marker."""
    for record in registry.get("agencies", {}).values():
        if record.get("seed_marker") == seed_marker and record.get("status") == "active":
            return True
    return False
