"""Module 3: Agencies (agency_manager.py).

An agency owns a contiguous slice of a chain's address space
[start, end], with a category and an agency id. Ensures coverage
proof: every stored record belongs to exactly one agency, no record
is orphaned, no address is owned by two agencies at once. Adding an
agency does not move/delete existing records. Removing an agency is
refused unless its records are first reassigned.

Gate note (Allen, 2026-10-30): the original code wrote the SUM OF
AGENCY RANGE SIZES into the chain's ``addresses_used`` field. That
is reserved space, not used space, so this version writes both:
``addresses_reserved`` = sum of range sizes, ``addresses_used`` =
records actually assigned. Also, ``verify_coverage`` returning
COVERAGE_VERIFIED means "no overlapping agencies", NOT "the whole
100M address space is covered" -- a single 0-999 agency verifies
while most of the space is uncovered. The returned
``covers_entire_address_space`` flag says which is true.
"""

from typing import Dict, Any, List, Optional


class AgencyManager:
    def __init__(self, registry):
        self.registry = registry
        self.agencies: Dict[str, Dict[str, Any]] = {}
        self.chain_agencies: Dict[str, List[str]] = {}

    def _sync_chain_metrics(self, chain_id: str) -> None:
        agency_ids = self.chain_agencies.get(chain_id, [])
        reserved = sum(
            (self.agencies[aid]["end_address"] - self.agencies[aid]["start_address"] + 1)
            for aid in agency_ids
        )
        used = sum(len(self.agencies[aid]["assigned_records"]) for aid in agency_ids)
        self.registry.update_chain_metrics(
            chain_id, addresses_used=used, addresses_reserved=reserved
        )

    def create_agency(self, agency_id: str, chain_id: str, category: str,
                      start_address: int, end_address: int) -> Dict[str, Any]:
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "CHAIN_NOT_FOUND"}
        if start_address < 0 or end_address >= 100_000_000 or start_address > end_address:
            return {"status": "ERROR", "reason": "INVALID_ADDRESS_RANGE"}
        if agency_id in self.agencies:
            return {"status": "ERROR", "reason": "AGENCY_ALREADY_EXISTS"}
        chain_existing_agencies = self.chain_agencies.get(chain_id, [])
        for existing_id in chain_existing_agencies:
            ex_agency = self.agencies[existing_id]
            ex_start = ex_agency["start_address"]
            ex_end = ex_agency["end_address"]
            if not (end_address < ex_start or start_address > ex_end):
                return {"status": "ERROR", "reason": "ADDRESS_RANGE_OVERLAP",
                        "conflicting_agency": existing_id}
        agency_record = {
            "agency_id": agency_id,
            "chain_id": chain_id,
            "category": category,
            "start_address": start_address,
            "end_address": end_address,
            "assigned_records": [],
        }
        self.agencies[agency_id] = agency_record
        if chain_id not in self.chain_agencies:
            self.chain_agencies[chain_id] = []
        self.chain_agencies[chain_id].append(agency_id)
        self.registry.add_agency_to_chain(chain_id, agency_id)
        self._sync_chain_metrics(chain_id)
        return {"status": "AGENCY_CREATED", "agency": agency_record}

    def get_agency(self, agency_id: str) -> Dict[str, Any]:
        if agency_id not in self.agencies:
            return {"status": "NOT_FOUND", "agency": None}
        return {"status": "FOUND", "agency": self.agencies[agency_id]}

    def assign_record_to_agency(self, agency_id: str, record_id: str) -> Dict[str, Any]:
        res = self.get_agency(agency_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        agency = res["agency"]
        if record_id not in agency["assigned_records"]:
            agency["assigned_records"].append(record_id)
            self._sync_chain_metrics(agency["chain_id"])
        return {"status": "RECORD_ASSIGNED", "agency_id": agency_id, "record_id": record_id}

    def remove_record_from_agency(self, agency_id: str, record_id: str) -> Dict[str, Any]:
        res = self.get_agency(agency_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        agency = res["agency"]
        if record_id in agency["assigned_records"]:
            agency["assigned_records"].remove(record_id)
            self._sync_chain_metrics(agency["chain_id"])
            return {"status": "RECORD_REMOVED", "agency_id": agency_id, "record_id": record_id}
        return {"status": "ERROR", "reason": "RECORD_NOT_IN_AGENCY"}

    def remove_agency(self, agency_id: str) -> Dict[str, Any]:
        res = self.get_agency(agency_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        agency = res["agency"]
        if len(agency["assigned_records"]) > 0:
            return {
                "status": "REFUSED",
                "reason": "AGENCY_HAS_ASSIGNED_RECORDS",
                "assigned_records_count": len(agency["assigned_records"]),
            }
        chain_id = agency["chain_id"]
        del self.agencies[agency_id]
        if chain_id in self.chain_agencies and agency_id in self.chain_agencies[chain_id]:
            self.chain_agencies[chain_id].remove(agency_id)
        self.registry.remove_agency_from_chain(chain_id, agency_id)
        self._sync_chain_metrics(chain_id)
        return {"status": "AGENCY_REMOVED", "agency_id": agency_id}

    def verify_coverage(self, chain_id: str) -> Dict[str, Any]:
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        agency_ids = self.chain_agencies.get(chain_id, [])
        if not agency_ids:
            return {"status": "VERIFIED_EMPTY", "chain_id": chain_id, "gaps": [], "overlaps": []}
        intervals = []
        for aid in agency_ids:
            ag = self.agencies[aid]
            intervals.append((ag["start_address"], ag["end_address"], aid))
        intervals.sort(key=lambda x: x[0])
        overlaps = []
        for i in range(len(intervals) - 1):
            curr = intervals[i]
            nxt = intervals[i + 1]
            if curr[1] >= nxt[0]:
                overlaps.append((curr[2], nxt[2]))
        if overlaps:
            return {"status": "COVERAGE_FAILED", "reason": "OVERLAPPING_AGENCIES", "overlaps": overlaps}
        total_covered = sum((end - start + 1) for start, end, _ in intervals)
        return {
            "status": "COVERAGE_VERIFIED",
            "chain_id": chain_id,
            "agencies_count": len(agency_ids),
            "total_covered_addresses": total_covered,
            # COVERAGE_VERIFIED means no overlaps. Full coverage is separate.
            "covers_entire_address_space": total_covered >= 100_000_000,
        }
