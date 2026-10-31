"""Module 4: Memory Store (memory_store.py).

Store a record through chain + agency + category. Record: id,
chain_id, agency_id, category, content (text only), provenance,
created_time. Lookup by id, by chain, by category, and by agency.
Miss returns NOT_FOUND with empty result. Reject sensitive content
(keys, seed phrases, passwords) with REFUSED_SENSITIVE and store
nothing.

Gate note (Allen, 2026-10-30): the original code refused ANY
64-hex string, including a plain SHA-256 hash of public text.
That is a false positive: a document hash is not a key. This
version refuses only key-labelled material (private key, seed
phrase, bip39, password, secret key, bearer token). A bare 64-hex
string is no longer refused on its own; if it is labelled as a
key, the label pattern catches it. Space over-allotment is flagged
on the STORED return instead of silently exceeding the budget.
"""

import time
import re
from typing import Dict, Any, List, Optional

SENSITIVE_PATTERNS = [
    re.compile(r"private[_\s-]?key", re.IGNORECASE),
    re.compile(r"seed[_\s-]?phrase", re.IGNORECASE),
    re.compile(r"bip39", re.IGNORECASE),
    re.compile(r"password", re.IGNORECASE),
    re.compile(r"secret[_\s-]?key", re.IGNORECASE),
    re.compile(r"bearer\s+[a-zA-Z0-9_\-\.]+", re.IGNORECASE),
    # Deliberately NO bare 64-hex pattern: a hash is not a key.
]


class MemoryStore:
    def __init__(self, registry, agency_manager):
        self.registry = registry
        self.agency_manager = agency_manager
        self.records: Dict[str, Dict[str, Any]] = {}

    def _is_sensitive(self, content: str) -> bool:
        for pattern in SENSITIVE_PATTERNS:
            if pattern.search(content):
                return True
        return False

    def store_record(self, record_id: str, chain_id: str, agency_id: str,
                     category: str, content: str,
                     provenance: str = "internal-audit") -> Dict[str, Any]:
        if self._is_sensitive(content) or self._is_sensitive(record_id) or self._is_sensitive(category):
            return {"status": "REFUSED_SENSITIVE",
                    "reason": "Content contains prohibited sensitive data (keys, seed phrases, or passwords)."}
        if record_id in self.records:
            return {"status": "ERROR", "reason": "RECORD_ALREADY_EXISTS"}
        chain_res = self.registry.get_chain(chain_id)
        if chain_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "CHAIN_NOT_FOUND"}
        agency_res = self.agency_manager.get_agency(agency_id)
        if agency_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
        agency = agency_res["agency"]
        if agency["chain_id"] != chain_id:
            return {"status": "ERROR", "reason": "AGENCY_DOES_NOT_BELONG_TO_CHAIN"}
        if agency["category"] != category:
            return {"status": "ERROR", "reason": "CATEGORY_MISMATCH_WITH_AGENCY"}
        record = {
            "id": record_id,
            "chain_id": chain_id,
            "agency_id": agency_id,
            "category": category,
            "content": content,
            "provenance": provenance,
            "created_time": time.time(),
        }
        self.records[record_id] = record
        self.agency_manager.assign_record_to_agency(agency_id, record_id)
        current_space_used = chain_res["chain"]["space_used"]
        content_bytes = len(content.encode('utf-8'))
        new_used = current_space_used + content_bytes
        self.registry.update_chain_metrics(chain_id, space_used=new_used)
        result = {"status": "STORED", "record": record}
        allotted = chain_res["chain"]["space_allotted"]
        if allotted > 0 and new_used > allotted:
            result["space_warning"] = "USAGE_EXCEEDS_ALLOTMENT"
        return result

    def lookup_by_id(self, record_id: str) -> Dict[str, Any]:
        if record_id not in self.records:
            return {"status": "NOT_FOUND", "record": None}
        return {"status": "FOUND", "record": self.records[record_id]}

    def lookup_by_chain(self, chain_id: str) -> Dict[str, Any]:
        matched = [r for r in self.records.values() if r["chain_id"] == chain_id]
        if not matched:
            return {"status": "NOT_FOUND", "records": []}
        return {"status": "FOUND", "records": matched}

    def lookup_by_agency(self, agency_id: str) -> Dict[str, Any]:
        matched = [r for r in self.records.values() if r["agency_id"] == agency_id]
        if not matched:
            return {"status": "NOT_FOUND", "records": []}
        return {"status": "FOUND", "records": matched}

    def lookup_by_category(self, category: str) -> Dict[str, Any]:
        matched = [r for r in self.records.values() if r["category"] == category]
        if not matched:
            return {"status": "NOT_FOUND", "records": []}
        return {"status": "FOUND", "records": matched}
