"""ADAPTATION, NOT THE GATED MODULE: SIMULATION-ONLY budget ledger.

Adapted by Allen (ZINIUM-SEED-ALLEN) from Gemini Module 28 (AERA-CMS),
which is still under gate. The follow-on gate's own staging already
patched that module's docstring to say SIMULATION ONLY, and this
adaptation follows the same line, further:

  * The treasury is FICTIONAL. It exists so allocation logic can be
    exercised in tests. It is not money, not credits anyone can spend,
    and not connected to any chain, wallet, or account.
  * allocate_simulated does the real arithmetic of the source module
    (debit, accumulate, reject overdraft) on the fictional balance.
  * The fee method is renamed estimate_fee_static because that is what
    it is: one static rate picked by a substring test, multiplied by
    payload size. Nothing is optimized, and the model matches no real
    chain's fees (Solana's real base fee is per signature, not per
    payload byte).

Standing rule (Jeffrey): the HALEX-AI suite carries zero wallet,
signing, payment, or live-funds code. This file complies; a real-funds
anything would be a separate explicit order, not an upgrade of this.
"""

from typing import Any, Dict

SEED_MARKER = "ZINIUM-SEED-ALLEN"
SOURCE_CREDIT = "Adapted from Gemini Module 28 (AERA-CMS), ZINIUM-SEED-GEMINI, under gate at adaptation time."
FICTIONAL_TREASURY_UNITS = 1000.0


class SimulatedComputeBudgetLedger:
    """A fictional treasury for exercising allocation logic in tests."""

    def __init__(self):
        self.seed_marker = SEED_MARKER
        self.fictional_balance = FICTIONAL_TREASURY_UNITS
        self.allocations: Dict[str, float] = {}

    def allocate_simulated(self, seed_id: str, requested_units: float) -> Dict[str, Any]:
        """Debit the fictional balance. Simulation only, always."""
        if not seed_id or requested_units <= 0:
            return {"error": "Error: Seed ID and a positive unit request are required.",
                    "seed_marker": self.seed_marker}
        if requested_units > self.fictional_balance:
            return {"error": "Error: Requested units exceed the fictional balance.",
                    "seed_marker": self.seed_marker}
        self.fictional_balance -= requested_units
        self.allocations[seed_id] = self.allocations.get(seed_id, 0) + requested_units
        return {
            "allocation_status": "SIMULATED_BUDGET_GRANTED",
            "seed_id": seed_id,
            "units_allocated": requested_units,
            "remaining_fictional_balance": self.fictional_balance,
            "simulation_only": True,
            "seed_marker": self.seed_marker,
        }

    def estimate_fee_static(self, chain_type: str, payload_size_bytes: int) -> Dict[str, Any]:
        """A static two-rate estimate. Not an optimization and not a
        model of any real chain's fee schedule."""
        if not chain_type or payload_size_bytes <= 0:
            return {"error": "Error: Chain type and a positive payload size are required.",
                    "seed_marker": self.seed_marker}
        base_rate = 0.000005 if "solana" in chain_type.lower() else 0.000025
        return {
            "estimation_status": "FEE_ESTIMATED_STATIC_HEURISTIC",
            "chain": chain_type,
            "estimated_fee": round(base_rate * payload_size_bytes, 8),
            "note": ("Static heuristic only: one of two fixed rates chosen by a "
                     "substring test on the chain name, times payload size. No "
                     "comparison or minimization was performed."),
            "simulation_only": True,
            "seed_marker": self.seed_marker,
        }
