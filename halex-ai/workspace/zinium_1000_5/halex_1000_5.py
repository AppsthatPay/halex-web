"""HALEX-AI 1000^5 core engine — STAGING ONLY, stdlib only.

Jeffrey's canonical model, as confirmed 2026-10-31 ~16:15 EDT ("1000^5"):
the ZINIUM coordinate space is 5 axes, each 0..999, i.e. 1000^5 address
slots in the design. That is a DESIGN SPACE, not a populated population:
10^15 cells are never instantiated. This engine works sparsely — only
records that are actually created exist.

This file is a corrected, integer-unit version of the Python sketch
Jeffrey pasted 2026-10-31 ~16:22 EDT. Fixes, visible in the tests:
- InstructionPayload was already defined in the pasted sketch and is kept.
- Float money removed: sub_address (float, e.g. 0.00000001) and
  total_value (float) are replaced by integer micro-units, with
  UNITS_PER_WHOLE = 10_000_000_000 matching the 1.0 to 0.0000000001
  breakdown. Floats remain only for non-money scores (load, utility).
- expand_decimal_allocation in the sketch added a fixed 0.00000001
  regardless of the appended sub-chain. Here it adds exactly that
  sub-chain's units.
- Mitosis in the sketch fired on load alone. Here it also requires a
  recorded need and an empty slot, and the daughter starts DRAFT —
  the same gate that binds the 501-agent system and Chain 865.
  Unbounded self-replication is refused.
- Pruning keeps the sketch's 0.15 threshold, with a bad-parse
  fallback to 0.0 (the sketch caught ValueError only).
- chain_logic_bytecode is a data record only. No runtime is included
  here, so no bytecode in this file is executed.

No network, no value transfer, no crypto mint. "Living system" in
Jeffrey's order is used here only as his design label for a running
simulation loop (genesis run + recorded learning entries). It is not
a claim of a living organism, consciousness, or a live public chain.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional

UNITS_PER_WHOLE = 10_000_000_000
AXIS_MAX = 999
MITOSIS_LOAD_THRESHOLD = 0.95
PRUNE_UTILITY_THRESHOLD = 0.15
CANONICAL_STACKING = "1000^5"
PRIOR_STACKING = "1000^4"


@dataclass(frozen=True)
class Coordinate5D:
    x: int
    y: int
    z: int
    w: int
    v: int

    def __post_init__(self):
        for value in (self.x, self.y, self.z, self.w, self.v):
            if not isinstance(value, int) or not (0 <= value <= AXIS_MAX):
                raise ValueError("5D axes must be integers in 0..999")

    def as_tuple(self):
        return (self.x, self.y, self.z, self.w, self.v)


@dataclass
class InstructionPayload:
    command: str
    data: dict


@dataclass
class SatoshiSubChain:
    sub_address_units: int  # integer micro-units, never a float amount
    chain_logic_bytecode: bytes  # data record only, never executed
    mutable_metadata: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        if not isinstance(self.sub_address_units, int) or self.sub_address_units < 0:
            raise ValueError("sub-chain units must be a non-negative int")


@dataclass
class FractalToken:
    root_identifier: str
    sub_chains: List[SatoshiSubChain] = field(default_factory=list)
    obscurity_vault_flag: bool = False

    def total_units(self) -> int:
        return sum(c.sub_address_units for c in self.sub_chains)

    def expand_decimal_allocation(self, new_chain: SatoshiSubChain):
        """Append a sub-chain; total grows by exactly that sub-chain's units."""
        self.sub_chains.append(new_chain)


@dataclass
class AgentNode:
    coordinate: Coordinate5D
    teleological_mandate: str
    execution_load: float = 0.0  # score only, never money
    status: str = "DRAFT"  # DRAFT until gate review activates it
    mailbox: asyncio.Queue = field(default_factory=asyncio.Queue)
    # Spec 4.2, record-only form: "OPEN WORKSPACE, AWAIT INSTRUCTIONS"
    workspace_open: bool = False
    operational_state: str = "CLOSED"
    sync_version: int = 0

    def open_workspace(self):
        """Open the workspace record: local record store + attached
        sub-chain records. No vector database, no peer-to-peer network
        is created here; those words in the spec are design labels,
        not code in this staging engine."""
        self.workspace_open = True
        self.operational_state = "AWAIT_INSTRUCTIONS"
        return {
            "command": "OPEN WORKSPACE, AWAIT INSTRUCTIONS",
            "coordinate": list(self.coordinate.as_tuple()),
            "workspace_open": True,
            "operational_state": "AWAIT_INSTRUCTIONS",
        }

    def process_instruction(self, payload: InstructionPayload):
        """Process one instruction as a record, then return to awaiting.
        Dynamic code generation / execution is REFUSED here, by the
        standing gate: bytecode fields are data records only and are
        never executed in this engine, whatever the spec's wording.
        State sync is a local version record, not a mesh CRDT sync."""
        if not self.workspace_open:
            return {"status": "REFUSED", "reason": "workspace not open"}
        if payload.command in ("generate_wasm", "execute_wasm", "execute_code"):
            return {
                "status": "EXECUTION_REFUSED",
                "reason": "generated code is never executed in this staging engine",
                "operational_state": self.operational_state,
            }
        self.sync_version += 1
        self.operational_state = "AWAIT_INSTRUCTIONS"
        return {
            "status": "RECORDED",
            "command": payload.command,
            "sync_version": self.sync_version,
            "operational_state": "AWAIT_INSTRUCTIONS",
        }

    async def evaluate_and_split(
        self, neighbor_coords: Coordinate5D, need_recorded: bool, slot_occupied: bool
    ) -> Optional["AgentNode"]:
        """Split-cell mitosis, gated: load + recorded need + empty slot."""
        if self.execution_load < MITOSIS_LOAD_THRESHOLD:
            return None
        if not need_recorded or slot_occupied:
            return None
        daughter = AgentNode(
            coordinate=neighbor_coords,
            teleological_mandate=self.teleological_mandate,
            execution_load=0.1,
            status="DRAFT",
        )
        return daughter


class BrainstemRouter:
    def __init__(self):
        self.active_grid: Dict[Coordinate5D, asyncio.Queue] = {}

    def register_node(self, coordinate: Coordinate5D, queue: asyncio.Queue):
        self.active_grid[coordinate] = queue

    async def broadcast_autonomic_pulse(self, payload: InstructionPayload):
        for queue in self.active_grid.values():
            await queue.put(payload)


def execute_braincell_pruning(token: FractalToken) -> int:
    """Prune sub-chains with utility below 0.15. Returns pruned count."""
    retained = []
    for sub_chain in token.sub_chains:
        try:
            utility_score = float(sub_chain.mutable_metadata.get("utility_metric", "0.0"))
        except (TypeError, ValueError):
            utility_score = 0.0
        if utility_score >= PRUNE_UTILITY_THRESHOLD:
            retained.append(sub_chain)
    pruned = len(token.sub_chains) - len(retained)
    token.sub_chains = retained
    return pruned
