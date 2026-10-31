"""Cross-chain meta-label & split-cell sharing engine — STAGING ONLY.

Allen's staging implementation of the pasted code Jeffrey sent
2026-10-31 ~17:05 EDT. The pasted code itself was NOT run as-is.
Fixes, visible in the tests:
- Float sub_address replaced by integer micro-units. Matching a
  satoshi is now exact integer equality, not a 1e-9 float epsilon.
- add_satoshi in the sketch added a fixed 0.00000001 regardless
  of the unit. Here it adds exactly that unit's units.
- clone_for_cross_chain in the sketch overwrote source_chain_id
  with the target, erasing provenance. Here origin_chain_id is
  preserved, current_chain_id becomes the target, and metadata
  records cloned_from_chain. The source record is retained:
  a split-cell share is a COPY of a manifest record, not a move
  of value, and the local token's mass grows only by the cloned
  unit's exact units.
- TransparentWallet meta_label is kept: a text label explaining
  what the wallet record holds and its domain purpose. It is a
  label, not a capability, and it holds no funds or keys.

Chain IDs in the pasted demo (1276, 3471) are domain-chain
identifiers in that example, NOT ZINIUM chain indices 0..999
and NOT Brainchain chain 500. Do not conflate them: the matrix
here is a registry of domain chains, separate from the 1000^5
coordinate grid.

EXAMPLE NOTE (Jeffrey, 2026-10-31 ~17:09 EDT): the pasted
rocket-science / space-travel example was a single hypothetical
illustration of how chains pass information. It is NOT retained
as content here. What is retained is the instructional system:
how any wallet record can share a copy of a satoshi unit
(data, knowledge, or software record) with another wallet
record that needs it to complete its structure. The generic
demo below is that instruction, with placeholder domains only.
It can be removed without removing the system.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from halex_1000_5 import Coordinate5D, UNITS_PER_WHOLE


@dataclass
class SatoshiAgentUnit:
    units: int  # integer micro-units, e.g. 100 = 0.00000001 whole
    functional_domain: str
    instruction_manifest: str  # text record, never executed
    source_chain_id: int
    mutable_metadata: Dict[str, str] = field(default_factory=dict)
    operational_status: str = "SYNCHRONIZED"
    origin_chain_id: int = 0
    current_chain_id: int = 0

    def __post_init__(self):
        if not isinstance(self.units, int) or self.units <= 0:
            raise ValueError("satoshi unit must be a positive int")
        if self.origin_chain_id == 0:
            self.origin_chain_id = self.source_chain_id
        if self.current_chain_id == 0:
            self.current_chain_id = self.source_chain_id

    def clone_for_cross_chain(self, target_chain_id: int) -> "SatoshiAgentUnit":
        cloned_meta = dict(self.mutable_metadata)
        cloned_meta["cloned_from_chain"] = str(self.source_chain_id)
        return SatoshiAgentUnit(
            units=self.units,
            functional_domain=self.functional_domain,
            instruction_manifest=self.instruction_manifest,
            source_chain_id=self.source_chain_id,
            mutable_metadata=cloned_meta,
            operational_status="IMPORTED_ACTIVE",
            origin_chain_id=self.origin_chain_id,
            current_chain_id=target_chain_id,
        )


@dataclass
class HalexToken:
    token_id: str
    origin_chain_id: int
    issuer_wallet: str
    satoshi_units: List[SatoshiAgentUnit] = field(default_factory=list)

    def __post_init__(self):
        # Base whole value, so mass scales 1.0 upward exactly.
        self._base_units = UNITS_PER_WHOLE

    def total_units(self) -> int:
        return self._base_units + sum(u.units for u in self.satoshi_units)

    def add_satoshi(self, unit: SatoshiAgentUnit):
        self.satoshi_units.append(unit)


class TransparentWallet:
    def __init__(self, wallet_id: str, chain_id: int, meta_label: str, coordinate: Coordinate5D):
        self.wallet_id = wallet_id
        self.chain_id = chain_id
        self.meta_label = meta_label
        self.coordinate = coordinate
        self.portfolio: Dict[str, HalexToken] = {}
        self.last_transfer: Optional[dict] = None

    def acquire_token(self, token: HalexToken):
        self.portfolio[token.token_id] = token

    def request_split_cell_transfer(
        self, target_token_id: str, satoshi_units: int, source_wallet: "TransparentWallet", source_token_id: str
    ) -> bool:
        if source_token_id not in source_wallet.portfolio:
            self.last_transfer = {"status": "ERROR", "reason": "source token not found"}
            return False
        source_token = source_wallet.portfolio[source_token_id]
        target_satoshi = None
        for sat in source_token.satoshi_units:
            if sat.units == satoshi_units:
                target_satoshi = sat
                break
        if not target_satoshi:
            self.last_transfer = {"status": "ERROR", "reason": "satoshi unit not found"}
            return False
        if target_token_id not in self.portfolio:
            self.last_transfer = {"status": "ERROR", "reason": "local target token not found"}
            return False
        cloned_unit = target_satoshi.clone_for_cross_chain(self.chain_id)
        local_token = self.portfolio[target_token_id]
        local_token.add_satoshi(cloned_unit)
        self.last_transfer = {
            "status": "CROSS-CHAIN SYNC SUCCESS",
            "from_wallet": source_wallet.wallet_id,
            "from_chain": source_wallet.chain_id,
            "to_wallet": self.wallet_id,
            "to_chain": self.chain_id,
            "satoshi_units": satoshi_units,
            "origin_chain_id": cloned_unit.origin_chain_id,
            "local_token_total_units": local_token.total_units(),
        }
        return True


class HalexHyperCubeMatrix:
    def __init__(self):
        self.chains: Dict[int, Dict[str, TransparentWallet]] = {}

    def register_wallet_to_chain(self, chain_id: int, wallet: TransparentWallet):
        self.chains.setdefault(chain_id, {})[wallet.wallet_id] = wallet


def demo_generic_exchange():
    """GENERIC EXAMPLE ONLY — hypothetical, removable.
    Instruction: Wallet A holds a knowledge/software record.
    Wallet B needs a copy of that record to complete its own
    structure. B requests the satoshi unit by exact integer
    units; A retains its original; B receives a cloned copy
    with origin preserved. No topic is claimed here — the
    domains below are placeholders, not real systems.
    """
    matrix = HalexHyperCubeMatrix()
    wallet_a = TransparentWallet(
        "W_EXAMPLE_A", 1276,
        "Example wallet A: holds a knowledge/software record (placeholder domain)",
        Coordinate5D(12, 7, 6, 1, 0),
    )
    matrix.register_wallet_to_chain(1276, wallet_a)
    token_a = HalexToken("TOKEN_EXAMPLE_A", 1276, "W_EXAMPLE_A")
    token_a.add_satoshi(SatoshiAgentUnit(
        100, "example_domain_a",
        "Example instruction record: data, knowledge, or software to be shared.",
        1276, {"fidelity": "high", "topic": "example"},
    ))
    wallet_a.acquire_token(token_a)

    wallet_b = TransparentWallet(
        "W_EXAMPLE_B", 3471,
        "Example wallet B: needs the record to complete its structure (placeholder domain)",
        Coordinate5D(34, 7, 1, 3, 0),
    )
    matrix.register_wallet_to_chain(3471, wallet_b)
    token_b = HalexToken("TOKEN_EXAMPLE_B", 3471, "W_EXAMPLE_B")
    token_b.add_satoshi(SatoshiAgentUnit(
        100, "example_domain_b",
        "Example local instruction record.",
        3471, {"fidelity": "high", "topic": "example"},
    ))
    wallet_b.acquire_token(token_b)

    success = wallet_b.request_split_cell_transfer(
        "TOKEN_EXAMPLE_B", 100, wallet_a, "TOKEN_EXAMPLE_A"
    )
    return success, wallet_b.last_transfer, len(token_b.satoshi_units)


if __name__ == "__main__":
    success, transfer, count = demo_generic_exchange()
    print(f"cross-chain transfer success: {success}")
    print(f"transfer: {transfer}")
    print(f"example token satoshi units now: {count}")
