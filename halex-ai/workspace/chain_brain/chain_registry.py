"""Module 1: Chain Registry (chain_registry.py).

Manages up to 1000 chains (Chain-01 through Chain-1000). Maintains
metadata: id, name, category, creation time, status (REGISTERED),
address capacity (100,000,000), addresses used, agencies assigned,
space allotted, space used. Returns NOT_FOUND on miss.

Gate note (Allen, 2026-10-30): this is a transcription of the suite
Gemini returned, with two honesty fixes. (1) ``addresses_used`` now
means records actually assigned, not address space reserved. A new
field ``addresses_reserved`` carries the sum of agency range sizes,
which is what the original code was writing into ``addresses_used``.
Conflating the two overstated use. (2) Nothing here is a crypto
blockchain: no coin, token, wallet, consensus, miner, or payment.
It is a memory registry. Design scale (1000 chains, 100M addresses
per chain) is a ceiling, not a measured population.
"""

import time
from typing import Dict, Any, Optional

MAX_CHAINS = 1000
ADDRESS_CAPACITY = 100_000_000


class ChainRegistry:
    def __init__(self):
        self.chains: Dict[str, Dict[str, Any]] = {}

    def register_chain(self, chain_id: str, name: str, category: str,
                       initial_space_allotment: int = 0) -> Dict[str, Any]:
        if not self._is_valid_chain_id(chain_id):
            return {"status": "ERROR", "reason": "INVALID_CHAIN_ID_FORMAT"}
        if chain_id in self.chains:
            return {"status": "ERROR", "reason": "ALREADY_EXISTS"}
        if len(self.chains) >= MAX_CHAINS:
            return {"status": "ERROR", "reason": "MAX_CHAINS_REACHED"}
        chain_record = {
            "id": chain_id,
            "name": name,
            "category": category,
            "creation_time": time.time(),
            "status": "REGISTERED",
            "address_capacity": ADDRESS_CAPACITY,
            # Records actually assigned (set by AgencyManager).
            "addresses_used": 0,
            # Address space reserved by agency ranges (set by AgencyManager).
            "addresses_reserved": 0,
            "agencies_assigned": [],
            "space_allotted": initial_space_allotment,
            "space_used": 0,
        }
        self.chains[chain_id] = chain_record
        return {"status": "REGISTERED", "chain": chain_record}

    def get_chain(self, chain_id: str) -> Dict[str, Any]:
        if chain_id not in self.chains:
            return {"status": "NOT_FOUND", "chain": None}
        return {"status": "FOUND", "chain": self.chains[chain_id]}

    def list_chains(self) -> list:
        return list(self.chains.keys())

    def update_chain_metrics(self, chain_id: str,
                             addresses_used: Optional[int] = None,
                             addresses_reserved: Optional[int] = None,
                             space_used: Optional[int] = None,
                             space_allotted: Optional[int] = None) -> Dict[str, Any]:
        res = self.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        if addresses_used is not None:
            if addresses_used > chain["address_capacity"]:
                return {"status": "ERROR", "reason": "CAPACITY_EXCEEDED"}
            chain["addresses_used"] = addresses_used
        if addresses_reserved is not None:
            if addresses_reserved > chain["address_capacity"]:
                return {"status": "ERROR", "reason": "CAPACITY_EXCEEDED"}
            chain["addresses_reserved"] = addresses_reserved
        if space_used is not None:
            chain["space_used"] = space_used
        if space_allotted is not None:
            chain["space_allotted"] = space_allotted
        return {"status": "UPDATED", "chain": chain}

    def add_agency_to_chain(self, chain_id: str, agency_id: str) -> Dict[str, Any]:
        res = self.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        if agency_id not in chain["agencies_assigned"]:
            chain["agencies_assigned"].append(agency_id)
        return {"status": "AGENCY_ADDED", "chain": chain}

    def remove_agency_from_chain(self, chain_id: str, agency_id: str) -> Dict[str, Any]:
        res = self.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        if agency_id in chain["agencies_assigned"]:
            chain["agencies_assigned"].remove(agency_id)
            return {"status": "AGENCY_REMOVED", "chain": chain}
        return {"status": "ERROR", "reason": "AGENCY_NOT_FOUND_ON_CHAIN"}

    def _is_valid_chain_id(self, chain_id: str) -> bool:
        if not chain_id.startswith("Chain-"):
            return False
        try:
            num_str = chain_id.split("-")[1]
            num = int(num_str)
            return 1 <= num <= MAX_CHAINS
        except (IndexError, ValueError):
            return False
