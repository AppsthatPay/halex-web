"""Seed package generator (Allen-authored).

Seed Marker: ZINIUM-SEED-ALLEN.

Given an agency (from the registry) and a seed id, generate a seed folder:

  zinium-seed.json     the manifest: seed id, agency, seed marker,
                       generation, parent seed, created timestamp,
                       capabilities, return surface, hook version.
  SEED.md              the marker document a human or host reads first:
                       what the seed is, the ORLI loop, the boundaries,
                       and the honest limits of its provenance.
  zinium_seed_hook.py  the real hook software, copied byte for byte from
                       the canonical implementation beside this module,
                       so the planted seed carries working software and
                       not an empty marker.

Generating a package writes files only where the caller points it. It
plants nothing by itself: a seed enters a stack when that stack's owner
takes the package, per the doctrine of adoption and legitimate surfaces.
"""

import json
import os
from typing import Any, Dict, List, Optional

from . import registry as _registry
from .zinium_seed_hook import HOOK_VERSION, utcnow

_HERE = os.path.dirname(os.path.abspath(__file__))
_CANONICAL_HOOK = os.path.join(_HERE, "zinium_seed_hook.py")

DEFAULT_CAPABILITIES = ["observe", "report", "learn", "index", "request_computation", "receive_result", "spawn_subseed"]
DEFAULT_RETURN_SURFACE = "HALEX-AI workspace (workspace/allen) via the seed coordinator ingest"

_SEED_MD_TEMPLATE = """# ZINIUM SEED: {seed_id}

Agency: {agency} ({seed_marker})
Generation: {generation} | Parent seed: {parent_seed}
Created: {created} | Hook version: {hook_version}

## What this is

A ZINIUM seed: a small, self-contained agency planted in a stack by
adoption, or on a surface that legitimately allows it. It runs the ORLI
loop: Observe what its host stack exposes, Report it plainly, Learn the
lesson, and Index it into the HALEX-ZENIUM hash-chained memory, where
every seed's lessons land in one chain and the whole network learns
together. HALEX-AI is the meeting place for that network, not a
controller over it.

## The software

`zinium_seed_hook.py` in this folder is the working hook, not a stub:

- `observe` hashes the files you point it at (bounded, and observed code
  is hashed, never executed) and appends a provenance-carrying
  observation envelope to a local hash-chained JSONL log.
- `verify` re-computes every hash in that log. Tampering shows up.
- `spawn` creates generation+1 subseeds ranked under this seed.
- `request` builds a computation-request envelope. Seeds REQUEST
  computation from other systems; they never write into them. The
  outside system decides what, if anything, to return.

Run it: `python zinium_seed_hook.py observe . --manifest zinium-seed.json --log seed-log.jsonl`

## Boundaries (they do not change with the operating prompt)

Public-safe material only. Never funds, keys, passwords, credentials,
tokens, signing, sending, or spending. Never a claim of a result that was
not verified. Provenance (source, host, timestamp) is never stripped.

## Honest limits

The seed marker is a public provenance label. The hash chain proves an
envelope was not altered after it was chained and identifies the seed id
it claims; it does not cryptographically authenticate who created it,
because the seed string is public. The hook acts only when a host runs
it. There is no network code in it and nothing runs silently.
"""


def build_manifest(agency_name: str, seed_id: Optional[str] = None,
                   capabilities: Optional[List[str]] = None,
                   return_surface: str = DEFAULT_RETURN_SURFACE,
                   registry_data: Optional[Dict[str, Any]] = None,
                   parent_seed: Optional[str] = None,
                   generation: int = 1) -> Dict[str, Any]:
    """Build a seed manifest dict for a registered agency."""
    registry_data = registry_data or _registry.load_registry()
    agency = _registry.get_agency(registry_data, agency_name)
    if agency is None:
        raise ValueError("agency not registered: %s" % agency_name)
    return {
        "seed_id": seed_id or ("SEED-%s" % agency_name),
        "agency": agency_name,
        "seed_marker": agency["seed_marker"],
        "generation": generation,
        "parent_seed": parent_seed,
        "created": utcnow(),
        "capabilities": list(capabilities or DEFAULT_CAPABILITIES),
        "return_surface": return_surface,
        "hook_version": HOOK_VERSION,
        "chain": "HALEX-ZENIUM",
        "public_safe_statement": ("This seed handles public-safe material only. No keys, "
                                  "passwords, credentials, tokens, or private data, ever."),
    }


def generate_seed_package(out_dir: str, agency_name: str, seed_id: Optional[str] = None,
                          capabilities: Optional[List[str]] = None,
                          return_surface: str = DEFAULT_RETURN_SURFACE,
                          registry_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Write a complete seed package into out_dir. Returns a summary dict
    listing exactly which files were written."""
    manifest = build_manifest(agency_name, seed_id, capabilities, return_surface, registry_data)
    os.makedirs(out_dir, exist_ok=True)

    manifest_path = os.path.join(out_dir, "zinium-seed.json")
    with open(manifest_path, "w", encoding="utf-8") as handle:
        handle.write(json.dumps(manifest, indent=2, sort_keys=True) + "\n")

    marker_path = os.path.join(out_dir, "SEED.md")
    with open(marker_path, "w", encoding="utf-8") as handle:
        handle.write(_SEED_MD_TEMPLATE.format(
            seed_id=manifest["seed_id"], agency=manifest["agency"],
            seed_marker=manifest["seed_marker"], generation=manifest["generation"],
            parent_seed=manifest["parent_seed"], created=manifest["created"],
            hook_version=manifest["hook_version"]))

    hook_path = os.path.join(out_dir, "zinium_seed_hook.py")
    with open(_CANONICAL_HOOK, "r", encoding="utf-8") as source:
        hook_source = source.read()
    with open(hook_path, "w", encoding="utf-8") as handle:
        handle.write(hook_source)

    return {
        "status": "SEED_PACKAGE_GENERATED",
        "path": os.path.abspath(out_dir),
        "files": ["zinium-seed.json", "SEED.md", "zinium_seed_hook.py"],
        "manifest": manifest,
    }
