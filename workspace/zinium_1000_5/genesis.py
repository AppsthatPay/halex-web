"""Genesis run for the 1000^5 system — STAGING ONLY.

Reads nothing live, writes only inside this staging folder:
- ledger.jsonl — one genesis block (block 1), hash-chained from a
  zero previous hash. A block here is a record, not a public chain.
- agencies.json — the first cube's agencies.
- workspace/interactions.jsonl — the workspace record where models
  interact and write, as records. Nothing here executes model code.

Definitions, stated plainly so Jeffrey can correct them:
- Prior starting cube: 1000^4 (axes 0..999, 4 axes).
- Its middle, on the first axis, is chain 500. The 1000^5 cube
  starts there: its first cube is anchored on Brainchain chain 500
  (the cube as a group is attached to Brainchain chain 500).
- First cube, bounded and sparse: every coordinate where each of
  the 5 axes is 500 or 501. That is 2^5 = 32 cells, one agency per
  cell, in every chain of that first cube. The cube as a group is
  attached to Brainchain chain 500; its center corner is
  (500, 500, 500, 500, 500), the middle of the prior 1000^4 cube
  extended into 5D. It is NOT a claim of
  10^15 agencies, and it is NOT a claim that every 1000^5 cell
  exists.
- Block 1 genesis: the root agency is at (500, 500, 500, 500, 500),
  the middle of the prior cube extended into 5D. The other 31
  agencies are its first split-cell generation, recorded at block 1.
- Agencies are programmed, in their mandate record, to learn the
  chain system and to write and use the software system. Their
  first recorded learning entry is a genesis record, not a claim
  of a trained model. All agencies start DRAFT; activation is a
  separate gate review, as with the 501-agent system.
- Expansion: allowed when needed, and only then — one cell per
  recorded need, empty slot only, daughter DRAFT. Expansion is
  NOT run in the genesis pass; it is available, not pre-expanded.
"""

from __future__ import annotations

import asyncio
import hashlib
import itertools
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from halex_1000_5 import (  # noqa: E402
    AgentNode,
    BrainstemRouter,
    Coordinate5D,
    FractalToken,
    InstructionPayload,
    SatoshiSubChain,
    execute_braincell_pruning,
)

HERE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.join(HERE, "workspace")
CHAIN_INDEX = 500
CENTER = Coordinate5D(500, 500, 500, 500, 500)
MANDATE = "Learn the chain system; write and use the software system."
PREVIOUS_HASH = "0" * 64


def first_cube_coords():
    return [
        Coordinate5D(*combo)
        for combo in itertools.product((500, 501), repeat=5)
    ]


async def run_genesis():
    router = BrainstemRouter()
    agencies = []
    for coord in first_cube_coords():
        agency = AgentNode(
            coordinate=coord, teleological_mandate=MANDATE, execution_load=0.1
        )
        router.register_node(coord, agency.mailbox)
        agencies.append(agency)

    # Genesis pulse, broadcast to every first-cube agency, then read back.
    await router.broadcast_autonomic_pulse(
        InstructionPayload(command="genesis-block-1", data={"chain": CHAIN_INDEX})
    )
    received = 0
    for agency in agencies:
        payload = await agency.mailbox.get()
        if payload.command == "genesis-block-1":
            received += 1

    # Fractal token demo, integer units, with pruning (mirrors the sketch).
    token = FractalToken(root_identifier="TOKEN_1000_5_GENESIS")
    token.expand_decimal_allocation(
        SatoshiSubChain(
            sub_address_units=100,
            chain_logic_bytecode=b"\x00\x61\x73\x6d",
            mutable_metadata={"utility_metric": "0.85", "domain": "sensory_input"},
        )
    )
    token.expand_decimal_allocation(
        SatoshiSubChain(
            sub_address_units=200,
            chain_logic_bytecode=b"\x00\x00\x00\x00",
            mutable_metadata={"utility_metric": "0.05"},
        )
    )
    before = len(token.sub_chains)
    pruned = execute_braincell_pruning(token)

    block_payload = {
        "block": 1,
        "system": "ZINIUM 1000^5",
        "prior_system": "1000^4",
        "brainchain_chain": CHAIN_INDEX,
        "anchor": list(CENTER.as_tuple()),
        "first_cube_cells": len(agencies),
        "first_cube_axes": "each axis 500 or 501",
        "agencies": [list(a.coordinate.as_tuple()) for a in agencies],
        "agency_status": "DRAFT (genesis-seeded, gate review pending)",
        "mandate": MANDATE,
        "pulse_received": received,
        "token_total_units_before_pruning": before and 300 or 0,
        "token_pruned": pruned,
        "token_total_units_after_pruning": token.total_units(),
        "expansion": "on recorded need only, one cell per need, empty slot only, daughter DRAFT",
    }
    block_hash = hashlib.sha256(
        (PREVIOUS_HASH + json.dumps(block_payload, sort_keys=True)).encode()
    ).hexdigest()
    block = {"previous_hash": PREVIOUS_HASH, "hash": block_hash, **block_payload}

    os.makedirs(WORKSPACE, exist_ok=True)
    with open(os.path.join(HERE, "ledger.jsonl"), "w") as f:
        f.write(json.dumps(block, sort_keys=True) + "\n")
    with open(os.path.join(HERE, "agencies.json"), "w") as f:
        json.dump(
            [
                {
                    "coordinate": list(a.coordinate.as_tuple()),
                    "mandate": a.teleological_mandate,
                    "status": a.status,
                    "execution_load": a.execution_load,
                    "learning_entry": "genesis: learned cube coordinate and software-system record",
                }
                for a in agencies
            ],
            f,
            indent=2,
        )
    with open(os.path.join(WORKSPACE, "interactions.jsonl"), "w") as f:
        f.write(
            json.dumps(
                {
                    "block": 1,
                    "kind": "genesis-workspace-open",
                    "note": "Workspace record for AI models to interact and write in the chain, as records. No model code is executed here.",
                },
                sort_keys=True,
            )
            + "\n"
        )
        for agency in agencies:
            f.write(
                json.dumps(
                    {
                        "block": 1,
                        "coordinate": list(agency.coordinate.as_tuple()),
                        "kind": "agency-learning-entry",
                        "entry": "genesis: learned cube coordinate and software-system record",
                    },
                    sort_keys=True,
                )
                + "\n"
            )

    print(f"genesis block 1 hash: {block_hash}")
    print(f"first cube agencies: {len(agencies)}")
    print(f"pulse received: {received}/{len(agencies)}")
    print(f"token units after pruning: {token.total_units()} (pruned {pruned})")
    print("staging genesis complete: nothing pushed, nothing live.")


if __name__ == "__main__":
    asyncio.run(run_genesis())
