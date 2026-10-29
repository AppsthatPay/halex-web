"""Seed coordinator ingest (Allen side).

Seed Marker: ZINIUM-SEED-ALLEN.

The coordinator is where envelopes come home. A host running a seed
produces hash-chained blocks with the hook; the coordinator accepts a
block only after all of these checks pass:

  1. The block's envelope_hash RE-COMPUTES from its prev_hash and its
     envelope content. A block whose content was altered after chaining
     fails here. (Link-only checking is not integrity; see Module 25's
     gate lesson.)
  2. The envelope's seed marker belongs to an ACTIVE agency in the
     registry. Envelopes from unregistered markers are rejected, never
     silently dropped.
  3. The envelope carries a seed id and full provenance.

Accepted blocks are appended to the coordinator's own hash-chained
index, deduplicated by envelope hash: the same block ingested twice is
recorded once and reported as a duplicate.

Honesty requirement: acceptance proves the block was not altered after
it was chained and that it claims a registered seed id. It does NOT
cryptographically authenticate who created it, because seed strings are
public. The coordinator indexes claims with provenance; it does not
certify their truth.

No network code. The coordinator reads what it is handed, nothing more.
"""

import json
import os
from typing import Any, Dict, List, Optional

from . import registry as _registry
from .zinium_seed_hook import GENESIS_HASH, canonical_json, envelope_hash

import hashlib


def _coordinator_hash(prev_hash: str, block: Dict[str, Any]) -> str:
    return hashlib.sha256((prev_hash + canonical_json(block)).encode("utf-8")).hexdigest()


class SeedCoordinator:
    """Validates and indexes incoming seed blocks. Session or file backed."""

    def __init__(self, registry_data: Optional[Dict[str, Any]] = None,
                 index_path: Optional[str] = None):
        self.registry = registry_data or _registry.load_registry()
        self.index_path = index_path
        self.records: List[Dict[str, Any]] = []
        self._seen_hashes = set()
        if index_path and os.path.isfile(index_path):
            with open(index_path, "r", encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if line:
                        record = json.loads(line)
                        self.records.append(record)
                        self._seen_hashes.add(record["block"]["envelope_hash"])

    def ingest_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Validate one chained block and index it. Returns a status dict;
        rejections name the failed check and index nothing."""
        if not isinstance(block, dict) or "envelope" not in block or "envelope_hash" not in block:
            return {"status": "REJECTED", "reason": "not a chained block (envelope/envelope_hash missing)"}
        envelope = block["envelope"]
        prev_hash = block.get("prev_hash", GENESIS_HASH)
        if block["envelope_hash"] != envelope_hash(prev_hash, envelope):
            return {"status": "REJECTED", "reason": "envelope hash does not recompute (content altered after chaining)"}
        marker = envelope.get("seed_marker", "")
        if not _registry.is_registered_marker(self.registry, marker):
            return {"status": "REJECTED", "reason": "seed marker not registered to an active agency: %s" % marker}
        if not envelope.get("seed_id"):
            return {"status": "REJECTED", "reason": "envelope carries no seed_id"}
        provenance = envelope.get("provenance") or {}
        missing = [k for k in ("source", "host", "timestamp") if not provenance.get(k)]
        if missing:
            return {"status": "REJECTED", "reason": "provenance incomplete: %s" % ", ".join(missing)}
        if block["envelope_hash"] in self._seen_hashes:
            return {"status": "DUPLICATE_IGNORED", "envelope_hash": block["envelope_hash"]}

        prev_coordinator = self.records[-1]["coordinator_hash"] if self.records else GENESIS_HASH
        record = {
            "coordinator_seq": len(self.records),
            "coordinator_prev_hash": prev_coordinator,
            "block": block,
            "coordinator_hash": _coordinator_hash(prev_coordinator, block),
        }
        self.records.append(record)
        self._seen_hashes.add(block["envelope_hash"])
        if self.index_path:
            directory = os.path.dirname(os.path.abspath(self.index_path))
            os.makedirs(directory, exist_ok=True)
            with open(self.index_path, "a", encoding="utf-8") as handle:
                handle.write(json.dumps(record, sort_keys=True) + "\n")
        return {"status": "INGESTED", "coordinator_seq": record["coordinator_seq"],
                "envelope_hash": block["envelope_hash"],
                "agency": _registry.agency_for_seed_marker(self.registry, marker)}

    def verify_index(self) -> Dict[str, Any]:
        """Recompute the coordinator chain and every ingested block hash."""
        prev_hash = GENESIS_HASH
        for index, record in enumerate(self.records):
            if record.get("coordinator_prev_hash") != prev_hash:
                return {"valid": False, "records_checked": index, "reason": "coordinator link broken"}
            if record.get("coordinator_hash") != _coordinator_hash(prev_hash, record["block"]):
                return {"valid": False, "records_checked": index, "reason": "coordinator hash mismatch"}
            block = record["block"]
            if block["envelope_hash"] != envelope_hash(block.get("prev_hash", GENESIS_HASH), block["envelope"]):
                return {"valid": False, "records_checked": index, "reason": "ingested block hash mismatch"}
            prev_hash = record["coordinator_hash"]
        return {"valid": True, "records_checked": len(self.records)}
