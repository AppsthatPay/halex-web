"""Module 7: Interconnection and Cross-Chain Lookup (interconnect.py).

Cross-chain lookup: given category or record id, search shard map
and memory store, return every chain/shard that holds a matching
record, with chain id, agency id, and category. If nothing matches,
return empty list with NOT_FOUND. Matching is by stored category/id,
not substring guessing on unrelated chains.

Gate note (Allen, 2026-10-30): matches now carry ``shard_id``
when the record was divided, so a divided record is not reported
as if it still sat only on its parent. Deduplication is kept:
one record is one match even when found by two paths.
"""

from typing import Dict, Any, List


class InterconnectManager:
    def __init__(self, registry, agency_manager, memory_store, shard_protocol):
        self.registry = registry
        self.agency_manager = agency_manager
        self.memory_store = memory_store
        self.shard_protocol = shard_protocol

    def _entry(self, rec):
        entry = {
            "chain_id": rec["chain_id"],
            "agency_id": rec["agency_id"],
            "category": rec["category"],
            "record_id": rec["id"],
        }
        if "shard_id" in rec:
            entry["shard_id"] = rec["shard_id"]
        return entry

    def cross_chain_lookup(self, query_type: str, query_value: str) -> Dict[str, Any]:
        matches = []
        if query_type == "record_id":
            mem_res = self.memory_store.lookup_by_id(query_value)
            if mem_res["status"] == "FOUND":
                matches.append(self._entry(mem_res["record"]))
            shard_res = self.shard_protocol.lookup_across_shards(query_value)
            if shard_res["status"] == "ROUTED" and "record" in shard_res:
                match_entry = self._entry(shard_res["record"])
                if match_entry not in matches:
                    matches.append(match_entry)
        elif query_type == "category":
            mem_res = self.memory_store.lookup_by_category(query_value)
            if mem_res["status"] == "FOUND":
                for rec in mem_res["records"]:
                    matches.append(self._entry(rec))
        else:
            return {"status": "ERROR", "reason": "INVALID_QUERY_TYPE"}
        if not matches:
            return {"status": "NOT_FOUND", "matches": []}
        return {"status": "FOUND", "matches": matches}
