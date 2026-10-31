"""Module 5: Sharding Protocol of Memory and Adaption Intelligence (shard_protocol.py).

Sharding divides a chain and maintains interconnection links in the
shard map. Shard map tracks parent chain, child shard IDs, address
ranges, owning agency, owning party/allotment, and interconnection
links back to parent and sibling shards. Adaption intelligence:
routing a new record to the correct chain/agency by category, and
re-routing a lookup across shards through the shard map. Status
strings: ROUTED, NOT_ROUTED, NOT_FOUND. (Never LEARNING, AWARE,
CONSCIOUS). Splits must be reversible in the map.

Gate note (Allen, 2026-10-30): the shard map holds LINKAGE, not
separate record copies. ``lookup_across_shards`` first checks the
memory store, so a record that exists is found there before the
shard scan runs; the shard scan is a fallback path, not a second
copy of the data. That is stated here so the shard map is not
mistaken for replicated storage.
"""

from typing import Dict, Any, List, Optional


class ShardProtocol:
    def __init__(self, registry, agency_manager, memory_store):
        self.registry = registry
        self.agency_manager = agency_manager
        self.memory_store = memory_store
        self.shard_map: Dict[str, Dict[str, Any]] = {}

    def create_shard(self, shard_id: str, parent_chain_id: str, agency_id: str,
                     address_range: tuple, owner_party: str) -> Dict[str, Any]:
        chain_res = self.registry.get_chain(parent_chain_id)
        if chain_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "PARENT_CHAIN_NOT_FOUND"}
        agency_res = self.agency_manager.get_agency(agency_id)
        if agency_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
        if shard_id in self.shard_map:
            return {"status": "ERROR", "reason": "SHARD_ALREADY_EXISTS"}
        shard_record = {
            "shard_id": shard_id,
            "parent_chain_id": parent_chain_id,
            "agency_id": agency_id,
            "address_range": address_range,
            "owner_party": owner_party,
            "links_to_parent": parent_chain_id,
            "sibling_shards": [],
        }
        for sid, shard in self.shard_map.items():
            if shard["parent_chain_id"] == parent_chain_id:
                shard["sibling_shards"].append(shard_id)
                shard_record["sibling_shards"].append(sid)
        self.shard_map[shard_id] = shard_record
        return {"status": "SHARD_CREATED", "shard": shard_record}

    def route_record(self, record_id: str, chain_id: str, agency_id: str,
                     category: str, content: str,
                     provenance: str = "internal-audit") -> Dict[str, Any]:
        agency_res = self.agency_manager.get_agency(agency_id)
        if agency_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
        agency = agency_res["agency"]
        if agency["chain_id"] != chain_id or agency["category"] != category:
            return {"status": "NOT_ROUTED", "reason": "CATEGORY_OR_CHAIN_MISMATCH"}
        store_res = self.memory_store.store_record(record_id, chain_id, agency_id, category, content, provenance)
        if store_res["status"] == "STORED":
            return {"status": "ROUTED", "record_id": record_id, "chain_id": chain_id, "agency_id": agency_id}
        elif store_res["status"] == "REFUSED_SENSITIVE":
            return {"status": "REFUSED_SENSITIVE", "reason": store_res["reason"]}
        else:
            return {"status": "NOT_ROUTED", "reason": store_res.get("reason", "UNKNOWN_ERROR")}

    def lookup_across_shards(self, record_id: str) -> Dict[str, Any]:
        mem_res = self.memory_store.lookup_by_id(record_id)
        if mem_res["status"] == "FOUND":
            return {"status": "ROUTED", "record": mem_res["record"]}
        for shard_id, shard in self.shard_map.items():
            agency_id = shard["agency_id"]
            agency_records = self.memory_store.lookup_by_agency(agency_id)
            if agency_records["status"] == "FOUND":
                for rec in agency_records["records"]:
                    if rec["id"] == record_id:
                        return {"status": "ROUTED", "shard_id": shard_id, "record": rec}
        return {"status": "NOT_FOUND", "record": None}
