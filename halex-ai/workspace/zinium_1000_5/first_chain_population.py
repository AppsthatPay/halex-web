"""First-chain population + bounded AI run — STAGING ONLY, stdlib only.

Jeffrey's order 2026-10-31 ~18:23 EDT, in plain terms:
  1. Create the token.
  2. Populate the first chain (the 32 first-cube agencies) with
     split-cell technologies, in the agencies and in the
     agentified chains.
  3. Then allow the AI to run the cubed chains.

What this file does, and what it does NOT claim:

CREATE THE TOKEN
- One open token record, TOKEN_FIRST_CHAIN, deployed to the center
  agency wallet (500,500,500,500,500) via deploy_engine.py.
- Its satoshi units are the five split-cell technologies already
  defined in deploy_engine.py's manifest keys, each as an integer
  100-unit record with a text manifest:
    knowledge, software_systems, neural_modeling, robotics,
    child_chain_expansion.
  No Wasm bytecode is created or executed. Manifests are text
  records only, as in every earlier staging file.

POPULATE THE FIRST CHAIN (split-cell sharing, not a move)
- Every other first-cube agency (31 of them) receives a COPY of
  one split-cell unit from the center token, by exact integer
  units, through cross_chain.py. Source retained, origin
  coordinate preserved, target local token goes 1 -> 2 units.
- Each agency gets one unified wallet identity (W-<coordinate>),
  one meta-label naming its technology, and one local token
  record. The population table in the block is the read-back.
- The pasted example's domain chains 4201 / 8812 and its
  "Transformer Self-Attention" / "Spatial Convolution" labels
  are NOT used here: they are example domain IDs and labels
  from the paste, not first-cube coordinates (500/501) and not
  ZINIUM indices, and this staging code has no transformer
  and no convolution engine to label. First-cube meta-labels
  name the technology record they actually hold.

AGENTIFIED CHAINS
- An agency here is an AgentNode: mandate record, workspace
  opened, operational state AWAIT_INSTRUCTIONS, DRAFT until
  gate review. "Agentified" means that record + runner, not a
  live LLM instance, and no agency is activated by this pass.

ALLOW THE AI TO RUN (bounded, one pass, then it exits)
- The run pass is: every agency processes one "learn" instruction
  as a record and returns to AWAIT_INSTRUCTIONS, then a
  deterministic toy transform is applied as a RECORD:
  input vector [0.5, -0.2, 0.8, 1.2] flows through each
  agency's populated units in genesis order, each unit applying
  output[i] = input[i] * weight[i % len(weight)] + 0.01,
  where weight is that technology's EXAMPLE weight record.
- That transform is labelled honestly in the block: it is a toy
  linear scaling record, NOT transformer attention, NOT spatial
  convolution, NOT a trained model, NOT GPU inference, and it
  does NOT replace a server cluster. The weights in this file
  are example numbers, not trained weights, not proprietary
  weights, and they are never shipped as a "shielded" package.
- Mitosis is checked, not forced: genesis agencies run at load
  0.1, below the 0.95 threshold, with no recorded need, so
  NO agency splits in the real first cube. A separate sandbox
  probe (coordinate outside the first cube, never added to
  agencies.json) proves the gate works: load 0.97 + recorded
  need + empty slot -> one DRAFT daughter; load 0.1 -> none.

CHAIN STEP
- This pass appends block N+1 to ledger.jsonl, hash-chained
  from the previous block, and a run report to
  runs/run-block-<N+1>.json. It never rewrites block 1 or
  agencies.json, never loops, never daemons. Run it again for
  the next block.

No network, no value transfer, no crypto mint, no keys, no
credentials. Floats appear only for non-money example weights
and scores, never for amounts: all units are integer micro-units.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brainchain_runner import wallet_id_for  # noqa: E402  (shared naming only)
from cross_chain import (  # noqa: E402
    HalexToken as CrossChainToken,
    SatoshiAgentUnit as CrossChainUnit,
    TransparentWallet,
)
from deploy_engine import (  # noqa: E402
    HalexTokenDeployer,
    SatoshiAgentUnit as DeployUnit,
)
from halex_1000_5 import (  # noqa: E402
    AgentNode,
    Coordinate5D,
    InstructionPayload,
)

HERE = os.path.dirname(os.path.abspath(__file__))
BRAINCHAIN_CHAIN = 500
CENTER = (500, 500, 500, 500, 500)
MANDATE = "Learn the chain system; write and use the software system."
INPUT_VECTOR = [0.5, -0.2, 0.8, 1.2]

# (technology, example weight record, manifest text)
# Weights are EXAMPLE numbers only, not trained, not proprietary.
TECHNOLOGIES = [
    ("knowledge", [0.85, 1.12, 0.94, 1.05],
     "Knowledge record: chain system data to be shared."),
    ("software_systems", [1.02, 0.98, 1.04, 0.99],
     "Software systems record: software to be shared."),
    ("neural_modeling", [0.90, 1.00, 1.10, 0.95],
     "Neural modeling record: example numeric record, not a trained model."),
    ("robotics", [1.05, 0.95, 1.00, 1.02],
     "Robotics record: kinematics record text, not executed."),
    ("child_chain_expansion", [0.98, 1.03, 0.97, 1.01],
     "Child chain expansion record: expansion instruction text, not executed."),
]
TECH_BY_NAME = {name: (weights, manifest) for name, weights, manifest in TECHNOLOGIES}


def _hash_block(previous_hash, payload):
    return hashlib.sha256(
        (previous_hash + json.dumps(payload, sort_keys=True)).encode()
    ).hexdigest()


def _block_payload_without_hashes(block):
    return {k: v for k, v in block.items() if k not in ("previous_hash", "hash")}


def _apply_toy_transform(vector, weights):
    return [
        val * weights[i % len(weights)] + 0.01
        for i, val in enumerate(vector)
    ]


def run_population(base_dir):
    ledger_path = os.path.join(base_dir, "ledger.jsonl")
    agencies_path = os.path.join(base_dir, "agencies.json")
    workspace_dir = os.path.join(base_dir, "workspace")
    runs_dir = os.path.join(base_dir, "runs")
    if not os.path.exists(ledger_path):
        raise FileNotFoundError(f"genesis ledger not found: {ledger_path}")
    if not os.path.exists(agencies_path):
        raise FileNotFoundError(f"genesis agencies not found: {agencies_path}")
    if not os.path.isdir(workspace_dir):
        raise FileNotFoundError(f"genesis workspace not found: {workspace_dir}")

    with open(ledger_path) as f:
        blocks = [json.loads(line) for line in f if line.strip()]
    if not blocks:
        raise ValueError("ledger is empty; genesis block 1 is missing")
    last_block = blocks[-1]
    previous_hash = last_block["hash"]
    next_block_number = int(last_block["block"]) + 1
    recomputed = _hash_block(
        last_block["previous_hash"], _block_payload_without_hashes(last_block)
    )
    if recomputed != last_block["hash"]:
        raise ValueError("last ledger block hash does not verify; refusing to extend")

    with open(agencies_path) as f:
        genesis_agencies = json.load(f)
    if len(genesis_agencies) != 32:
        raise ValueError(f"expected 32 genesis agencies, found {len(genesis_agencies)}")
    coords = [tuple(a["coordinate"]) for a in genesis_agencies]
    if CENTER not in coords:
        raise ValueError("center agency missing from genesis agencies")

    # --- 1. Create the token, deployed to the center wallet.
    center_id = wallet_id_for(CENTER)
    deployer = HalexTokenDeployer()
    for coord in coords:
        deployer.register_wallet(wallet_id_for(coord), Coordinate5D(*coord))
    deploy_result = deployer.deploy(
        "TOKEN_FIRST_CHAIN", "TOKEN", center_id,
        [DeployUnit(100, {name: manifest})
         for name, _weights, manifest in TECHNOLOGIES],
    )

    # --- 2. Populate: center holds the source token; every other
    # agency receives a split-cell copy of one technology unit.
    source_wallet = TransparentWallet(
        center_id, BRAINCHAIN_CHAIN,
        "First-cube center agency: holds the source split-cell technologies",
        Coordinate5D(*CENTER),
    )
    source_token = CrossChainToken("TOKEN_FIRST_CHAIN", BRAINCHAIN_CHAIN, center_id)
    for name, weights, manifest in TECHNOLOGIES:
        source_token.add_satoshi(CrossChainUnit(
            100, name, manifest, BRAINCHAIN_CHAIN,
            {"technology": name, "weight_record": "example, not trained"},
        ))
    source_wallet.acquire_token(source_token)

    population = [{
        "wallet_id": center_id,
        "coordinate": list(CENTER),
        "meta_label": "First-cube center agency: source split-cell technologies",
        "technology": "all (source holds 5 units)",
        "share_status": "SOURCE_HOLDS_ORIGINAL",
        "local_token_units": len(source_token.satoshi_units),
        "local_token_total_units": source_token.total_units(),
    }]
    # Track each agency's populated units for the AI run pass,
    # in genesis order: center first (5 units), then neighbours.
    run_units = [(CENTER, source_token.satoshi_units)]

    for idx, coord in enumerate(coords):
        if coord == CENTER:
            continue
        tech_name, weights, manifest = TECHNOLOGIES[idx % len(TECHNOLOGIES)]
        wallet_id = wallet_id_for(coord)
        target_wallet = TransparentWallet(
            wallet_id, BRAINCHAIN_CHAIN,
            f"First-cube agency: {tech_name} split-cell record",
            Coordinate5D(*coord),
        )
        local_token = CrossChainToken("TOKEN_FIRST_CHAIN_LOCAL", BRAINCHAIN_CHAIN, wallet_id)
        local_token.add_satoshi(CrossChainUnit(
            100, tech_name, f"Local {tech_name} record.",
            BRAINCHAIN_CHAIN, {"technology": tech_name},
        ))
        target_wallet.acquire_token(local_token)
        ok = target_wallet.request_split_cell_transfer(
            "TOKEN_FIRST_CHAIN_LOCAL", 100, source_wallet, "TOKEN_FIRST_CHAIN"
        )
        if not ok:
            raise RuntimeError(f"split-cell share failed for {wallet_id}: {target_wallet.last_transfer}")
        population.append({
            "wallet_id": wallet_id,
            "coordinate": list(coord),
            "meta_label": target_wallet.meta_label,
            "technology": tech_name,
            "share_status": target_wallet.last_transfer["status"],
            "share_from_coordinate": target_wallet.last_transfer["from_coordinate"],
            "share_to_coordinate": target_wallet.last_transfer["to_coordinate"],
            "local_token_units": len(local_token.satoshi_units),
            "local_token_total_units": local_token.total_units(),
        })
        run_units.append((coord, local_token.satoshi_units))

    # Source retained: center token still holds all 5 original units.
    source_retained = len(source_token.satoshi_units)

    # --- 3. AI run pass, bounded: instruction pass + toy transform.
    instructed = 0
    for agency_record in genesis_agencies:
        node = AgentNode(
            coordinate=Coordinate5D(*tuple(agency_record["coordinate"])),
            teleological_mandate=MANDATE,
            execution_load=float(agency_record.get("execution_load", 0.1)),
        )
        node.open_workspace()
        result = node.process_instruction(
            InstructionPayload(command=f"learn:first-chain-run-block-{next_block_number}", data={})
        )
        if result["status"] == "RECORDED":
            instructed += 1

    # Toy transform, in genesis order, through each populated unit.
    # Each unit's weight record is looked up by its technology name.
    current = list(INPUT_VECTOR)
    transforms_applied = 0
    for _coord, units in run_units:
        for unit in units:
            tech = unit.mutable_metadata.get("technology") or unit.functional_domain
            weights, _manifest = TECH_BY_NAME.get(tech, ([1.0], ""))
            current = _apply_toy_transform(current, weights)
            transforms_applied += 1
    output_vector = current

    # Mitosis gate: real cube (load 0.1) -> none; sandbox probe -> DRAFT daughter.
    async def _probe():
        saturated = AgentNode(
            coordinate=Coordinate5D(502, 500, 500, 500, 500),
            teleological_mandate=MANDATE, execution_load=0.97,
        )
        daughter = await saturated.evaluate_and_split(
            Coordinate5D(502, 500, 500, 500, 501),
            need_recorded=True, slot_occupied=False,
        )
        low = AgentNode(
            coordinate=Coordinate5D(500, 500, 500, 500, 500),
            teleological_mandate=MANDATE, execution_load=0.1,
        )
        low_result = await low.evaluate_and_split(
            Coordinate5D(500, 500, 500, 500, 501),
            need_recorded=False, slot_occupied=False,
        )
        return daughter, low_result

    daughter, low_result = asyncio.run(_probe())
    mitosis = {
        "real_first_cube_expansions": 0,
        "real_first_cube_reason": "load 0.1 below 0.95 threshold, no recorded need",
        "sandbox_probe_saturated_spawned_draft": daughter is not None and daughter.status == "DRAFT",
        "sandbox_probe_saturated_coordinate": list(daughter.coordinate.as_tuple()) if daughter else None,
        "sandbox_probe_low_load_spawned": low_result is not None,
        "sandbox_probe_note": "Probe daughter is NOT added to agencies.json or the first cube.",
    }

    payload = {
        "block": next_block_number,
        "system": "ZINIUM 1000^5",
        "brainchain_chain": BRAINCHAIN_CHAIN,
        "kind": "first-chain-population-and-run",
        "token_created": deploy_result,
        "agencies_populated": len(population),
        "population": population,
        "source_retained_units": source_retained,
        "agencies_instructed": instructed,
        "agencies_awaiting_instructions": instructed,
        "ai_run": {
            "kind": "toy linear transform record, NOT transformer / convolution / trained inference",
            "input_vector": INPUT_VECTOR,
            "output_vector": output_vector,
            "output_vector_rounded_4": [round(v, 4) for v in output_vector],
            "transforms_applied": transforms_applied,
            "weights_note": "Example weight records only, not trained, not proprietary.",
        },
        "mitosis": mitosis,
        "operational_state_after_pass": "AWAIT_INSTRUCTIONS",
        "note": "One bounded pass. No loop, no daemon, no Wasm execution, no trained model.",
    }
    block_hash = _hash_block(previous_hash, payload)
    block = {"previous_hash": previous_hash, "hash": block_hash, **payload}

    with open(ledger_path, "a") as f:
        f.write(json.dumps(block, sort_keys=True) + "\n")
    with open(os.path.join(workspace_dir, "interactions.jsonl"), "a") as f:
        f.write(json.dumps({
            "block": next_block_number, "kind": "first-chain-population",
            "token": deploy_result["identifier"],
            "agencies_populated": len(population),
            "source_retained_units": source_retained,
        }, sort_keys=True) + "\n")
        f.write(json.dumps({
            "block": next_block_number, "kind": "ai-run-pass",
            "input_vector": INPUT_VECTOR,
            "output_vector_rounded_4": [round(v, 4) for v in output_vector],
            "transforms_applied": transforms_applied,
            "operational_state": "AWAIT_INSTRUCTIONS",
        }, sort_keys=True) + "\n")

    os.makedirs(runs_dir, exist_ok=True)
    report_path = os.path.join(runs_dir, f"run-block-{next_block_number}.json")
    with open(report_path, "w") as f:
        json.dump(block, f, indent=2, sort_keys=True)

    return {
        "block": next_block_number,
        "hash": block_hash,
        "previous_hash": previous_hash,
        "token_total_units": deploy_result["total_units"],
        "agencies_populated": len(population),
        "source_retained_units": source_retained,
        "agencies_instructed": instructed,
        "transforms_applied": transforms_applied,
        "input_vector": INPUT_VECTOR,
        "output_vector": output_vector,
        "mitosis": mitosis,
        "report_path": report_path,
    }


def main():
    report = run_population(HERE)
    print(f"first-chain population block: {report['block']}")
    print(f"block hash: {report['hash']}")
    print(f"token total units: {report['token_total_units']}")
    print(f"agencies populated: {report['agencies_populated']}/32, source retained: {report['source_retained_units']} units")
    print(f"agencies instructed / awaiting: {report['agencies_instructed']}/32")
    print(f"ai run: input {report['input_vector']} -> output {[round(v, 4) for v in report['output_vector']]} "
          f"({report['transforms_applied']} toy transforms, record only)")
    print(f"mitosis: real cube 0, sandbox DRAFT probe {report['mitosis']['sandbox_probe_saturated_spawned_draft']}")
    print(f"report: {report['report_path']}")
    print("one bounded pass complete: agencies back to AWAIT_INSTRUCTIONS, process exits.")


if __name__ == "__main__":
    main()
