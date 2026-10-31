"""Module 6: Division to Parties and Allotments (division.py).

A chain can be divided and a resulting shard can be added to a
different party or space allotment, while staying interconnected
through the shard map. Mandatory rules:
- Only a party/allotment named explicitly by the caller. Never invent a recipient.
- Only public-safe records divided out. Sensitive refused.
- Shard map keeps full lineage: parent, child, recipient, address range, time.
- Count reconciliation: parent count = sum of child counts + records that stayed, no duplicates, no losses.
- No branding movement or display.

Gate note (Allen, 2026-10-30): TWO fixes to the returned code.
(1) The original ``reconcile_counts`` returned
``"reconciliation_valid": True`` unconditionally -- it computed
counts and never validated the equation. That is a fabricated
success, the same pattern Modules 38/43 were returned for. This
version COMPUTES validity: the child agency's records must equal
exactly the moved records still on the parent chain, the stayed
records must be the parent set minus the moved set, and the
parent total must equal stayed + moved, with no duplicates.
(2) Division is a LOGICAL reassignment, not a physical move to a
new chain: a moved record keeps its parent ``chain_id`` (its
lineage) and gains a ``shard_id`` naming the shard it was divided
into. A caller that reads ``lookup_by_chain(parent)`` will still
see moved records; ``lookup_by_agency(child)`` and the shard_id
are what show the division.
"""

import time
from typing import Dict, Any, List


class DivisionManager:
    def __init__(self, registry, agency_manager, memory_store, shard_protocol):
        self.registry = registry
        self.agency_manager = agency_manager
        self.memory_store = memory_store
        self.shard_protocol = shard_protocol
        self.divisions: List[Dict[str, Any]] = []

    def divide_chain(self, parent_chain_id: str, new_shard_id: str,
                     recipient_party: str, agency_id: str, address_range: tuple,
                     record_ids_to_move: List[str]) -> Dict[str, Any]:
        if not recipient_party or not isinstance(recipient_party, str):
            return {"status": "ERROR", "reason": "INVALID_RECIPIENT_PARTY"}
        if not isinstance(address_range, tuple) or len(address_range) != 2:
            return {"status": "ERROR", "reason": "INVALID_ADDRESS_RANGE"}
        parent_res = self.registry.get_chain(parent_chain_id)
        if parent_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "PARENT_CHAIN_NOT_FOUND"}
        agency_res = self.agency_manager.get_agency(agency_id)
        if agency_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
        parent_records_res = self.memory_store.lookup_by_chain(parent_chain_id)
        parent_records = parent_records_res["records"] if parent_records_res["status"] == "FOUND" else []
        parent_record_ids = {r["id"] for r in parent_records}
        moved_records = []
        for rid in record_ids_to_move:
            if rid not in parent_record_ids:
                return {"status": "ERROR", "reason": f"RECORD_NOT_IN_PARENT_CHAIN:{rid}"}
            rec_res = self.memory_store.lookup_by_id(rid)
            if rec_res["status"] == "FOUND":
                rec = rec_res["record"]
                if self.memory_store._is_sensitive(rec["content"]) or self.memory_store._is_sensitive(rec["id"]):
                    return {"status": "REFUSED_SENSITIVE", "reason": f"Cannot divide sensitive record {rid}"}
                moved_records.append(rec)
        shard_res = self.shard_protocol.create_shard(new_shard_id, parent_chain_id, agency_id, address_range, recipient_party)
        if shard_res["status"] != "SHARD_CREATED":
            return {"status": "ERROR", "reason": shard_res.get("reason", "SHARD_CREATION_FAILED")}
        for rec in moved_records:
            old_agency_id = rec["agency_id"]
            self.agency_manager.remove_record_from_agency(old_agency_id, rec["id"])
            rec["agency_id"] = agency_id
            rec["shard_id"] = new_shard_id
            self.agency_manager.assign_record_to_agency(agency_id, rec["id"])
        division_record = {
            "division_id": f"div-{int(time.time())}-{new_shard_id}",
            "parent_chain_id": parent_chain_id,
            "child_shard_id": new_shard_id,
            "recipient_party": recipient_party,
            "address_range": address_range,
            "moved_record_ids": list(record_ids_to_move),
            "timestamp": time.time(),
        }
        self.divisions.append(division_record)
        return {"status": "DIVIDED", "division": division_record}

    def reconcile_counts(self, parent_chain_id: str, child_agency_id: str) -> Dict[str, Any]:
        """Compute reconciliation validity. Never hardcode True.

        parent_ids = all records whose chain_id is the parent chain
        (moved records keep the parent chain_id, see module note).
        moved = union of moved ids in divisions from this parent.
        child_ids = records currently assigned to the child agency.
        stayed = parent_ids minus moved records still on the parent.
        Valid iff child_ids == moved-on-parent, and
        len(parent_ids) == len(stayed) + len(moved-on-parent),
        and the child agency assignment list has no duplicates.
        """
        parent_res = self.memory_store.lookup_by_chain(parent_chain_id)
        parent_records = parent_res["records"] if parent_res["status"] == "FOUND" else []
        child_res = self.memory_store.lookup_by_agency(child_agency_id)
        child_records = child_res["records"] if child_res["status"] == "FOUND" else []
        parent_ids = {r["id"] for r in parent_records}
        child_ids = {r["id"] for r in child_records}
        divs = [d for d in self.divisions if d["parent_chain_id"] == parent_chain_id]
        moved_ids_set = set()
        for d in divs:
            for rid in d["moved_record_ids"]:
                moved_ids_set.add(rid)
        moved_on_parent = moved_ids_set & parent_ids
        stayed_ids = parent_ids - moved_on_parent
        agency_res = self.agency_manager.get_agency(child_agency_id)
        assigned = agency_res["agency"]["assigned_records"] if agency_res["status"] == "FOUND" else []
        no_duplicates = len(assigned) == len(set(assigned))
        valid = (
            child_ids == moved_on_parent
            and len(parent_ids) == len(stayed_ids) + len(moved_on_parent)
            and no_duplicates
        )
        return {
            "status": "RECONCILED",
            "parent_chain_id": parent_chain_id,
            "parent_current_records_count": len(parent_records),
            "child_records_count": len(child_records),
            "moved_records_count": len(moved_ids_set),
            "moved_records_on_parent_count": len(moved_on_parent),
            "stayed_records_count": len(stayed_ids),
            "reconciliation_valid": valid,
        }
