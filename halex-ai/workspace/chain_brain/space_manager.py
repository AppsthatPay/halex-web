"""Module 2: Space Equivalents and Scaling (space_manager.py).

Tracks storage budgets for chains in bytes (allotted vs used).
Supports expansion up to a caller-supplied TB budget. Returns
EXPANSION_REFUSED if expansion exceeds budget. Reports space honestly.

Gate note (Allen, 2026-10-30): byte arithmetic is real, but no
physical terabytes are provisioned here. ``record_space_usage``
enforces the allotment for explicit usage reports; ``memory_store``
increments ``space_used`` independently and flags (does not hide)
an over-allotment rather than refusing a store on a chain whose
allotment is 0 (unallotted). TB figures are budgets, not disk.
"""

from typing import Dict, Any

BYTES_PER_TB = 1_000_000_000_000  # 1 Terabyte = 10^12 bytes


class SpaceManager:
    def __init__(self, registry):
        self.registry = registry

    def allot_space(self, chain_id: str, bytes_amount: int) -> Dict[str, Any]:
        if bytes_amount < 0:
            return {"status": "ERROR", "reason": "NEGATIVE_SPACE"}
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        up_res = self.registry.update_chain_metrics(chain_id, space_allotted=bytes_amount)
        if up_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        return {"status": "SPACE_ALLOTTED", "chain_id": chain_id, "space_allotted": bytes_amount}

    def expand_space(self, chain_id: str, additional_bytes: int, max_tb_budget: float) -> Dict[str, Any]:
        if additional_bytes < 0:
            return {"status": "ERROR", "reason": "NEGATIVE_EXPANSION"}
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        current_allotted = chain["space_allotted"]
        new_allotted = current_allotted + additional_bytes
        max_budget_bytes = int(max_tb_budget * BYTES_PER_TB)
        if new_allotted > max_budget_bytes:
            return {
                "status": "EXPANSION_REFUSED",
                "reason": f"Requested expansion ({new_allotted} bytes) exceeds caller-supplied TB budget ({max_budget_bytes} bytes).",
                "chain_id": chain_id,
                "current_allotted": current_allotted,
                "max_budget": max_budget_bytes,
            }
        up_res = self.registry.update_chain_metrics(chain_id, space_allotted=new_allotted)
        if up_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        return {
            "status": "EXPANDED",
            "chain_id": chain_id,
            "space_allotted": new_allotted,
            "additional_bytes": additional_bytes,
        }

    def record_space_usage(self, chain_id: str, bytes_used: int) -> Dict[str, Any]:
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        if bytes_used > chain["space_allotted"]:
            return {"status": "ERROR", "reason": "USAGE_EXCEEDS_ALLOTMENT"}
        self.registry.update_chain_metrics(chain_id, space_used=bytes_used)
        return {"status": "USAGE_RECORDED", "chain_id": chain_id, "space_used": bytes_used}

    def report_space(self, chain_id: str) -> Dict[str, Any]:
        res = self.registry.get_chain(chain_id)
        if res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND"}
        chain = res["chain"]
        allotted = chain["space_allotted"]
        used = chain["space_used"]
        remaining = allotted - used
        pct_used = (used / allotted * 100.0) if allotted > 0 else 0.0
        return {
            "status": "REPORTED",
            "chain_id": chain_id,
            "space_allotted_bytes": allotted,
            "space_used_bytes": used,
            "space_remaining_bytes": remaining,
            "percentage_used": round(pct_used, 4),
        }
