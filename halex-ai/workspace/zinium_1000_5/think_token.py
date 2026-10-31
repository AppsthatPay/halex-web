"""Token 'think' dispersion — STAGING ONLY, stdlib only.

Jeffrey's order 2026-10-31 ~18:26 EDT, in plain terms:
  create the first active AI agencies in the chain dialogs,
  a fully autonomously constructed AI agency chain cube,
  add the first token called "think" and place it in the chain,
  dispersed to all chains as instruction to the entire cubed
  agentified chains and its systems.

What this file does, honestly, and what it does not claim:

- Token "think": one open token record, identifier exactly
  "think", deployed to the center agency wallet. Its single
  satoshi unit is a 100-unit integer record with a text
  instruction manifest: "Learn the chain system; write and
  use the software system." That mandate text is already the
  agencies' mandate record; no user message text is copied
  into any record, by the standing gate.
- Dispersion: a COPY of that unit is shared, by exact integer
  units through cross_chain.py, to each of the other 31
  first-cube agencies. Source retained, origin coordinate
  preserved. "To all chains" here means to all 32 first-cube
  agencies that actually exist — not to all 1000^5 address
  slots, which are a design space, not a population.
- Chain dialogs: each agency writes one dialog record to
  workspace/interactions.jsonl in this pass: it received the
  think instruction, recorded it, and returned to
  AWAIT_INSTRUCTIONS. A dialog record is a log entry, not a
  conversation with a live model.
- "Active" and "autonomously constructed": stated plainly.
  Agencies in this staging build remain DRAFT until gate
  review; they do not self-activate, and they were constructed
  by the genesis + runner code Allen ran, not autonomously by
  themselves. What is active in this pass is the instruction
  pass itself: every agency processes the think instruction
  as a record, once, and returns to awaiting. That is the
  honest form of "active" here.
- This pass appends block N+1 to ledger.jsonl, hash-chained,
  and a report to runs/run-block-<N+1>.json. One bounded
  pass, then it exits. No loop, no daemon, no Wasm execution,
  no trained model, no crypto asset, no value, no keys.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brainchain_runner import wallet_id_for  # noqa: E402
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
    UNITS_PER_WHOLE,
)

HERE = os.path.dirname(os.path.abspath(__file__))
BRAINCHAIN_CHAIN = 500
CENTER = (500, 500, 500, 500, 500)
MANDATE = "Learn the chain system; write and use the software system."


def _hash_block(previous_hash, payload):
    return hashlib.sha256(
        (previous_hash + json.dumps(payload, sort_keys=True)).encode()
    ).hexdigest()


def _payload_without_hashes(block):
    return {k: v for k, v in block.items() if k not in ("previous_hash", "hash")}


def run_think(base_dir):
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
    if _hash_block(last_block["previous_hash"], _payload_without_hashes(last_block)) != last_block["hash"]:
        raise ValueError("last ledger block hash does not verify; refusing to extend")

    with open(agencies_path) as f:
        genesis_agencies = json.load(f)
    if len(genesis_agencies) != 32:
        raise ValueError(f"expected 32 genesis agencies, found {len(genesis_agencies)}")
    coords = [tuple(a["coordinate"]) for a in genesis_agencies]
    if CENTER not in coords:
        raise ValueError("center agency missing from genesis agencies")

    center_id = wallet_id_for(CENTER)
    deployer = HalexTokenDeployer()
    for coord in coords:
        deployer.register_wallet(wallet_id_for(coord), Coordinate5D(*coord))
    deploy_result = deployer.deploy(
        "think", "TOKEN", center_id,
        [DeployUnit(100, {"knowledge": MANDATE})],
    )
    if deploy_result["total_units"] != UNITS_PER_WHOLE + 100:
        raise RuntimeError("think token total units mismatch")

    source_wallet = TransparentWallet(
        center_id, BRAINCHAIN_CHAIN,
        "First-cube center agency: holds the source think instruction",
        Coordinate5D(*CENTER),
    )
    source_token = CrossChainToken("think", BRAINCHAIN_CHAIN, center_id)
    source_token.add_satoshi(CrossChainUnit(
        100, "knowledge", MANDATE, BRAINCHAIN_CHAIN,
        {"instruction": "think", "technology": "knowledge"},
    ))
    source_wallet.acquire_token(source_token)

    dispersion = [{
        "wallet_id": center_id,
        "coordinate": list(CENTER),
        "share_status": "SOURCE_HOLDS_ORIGINAL",
        "local_token_units": len(source_token.satoshi_units),
    }]
    for coord in coords:
        if coord == CENTER:
            continue
        wallet_id = wallet_id_for(coord)
        target_wallet = TransparentWallet(
            wallet_id, BRAINCHAIN_CHAIN,
            "First-cube agency: think instruction record",
            Coordinate5D(*coord),
        )
        local_token = CrossChainToken("think_local", BRAINCHAIN_CHAIN, wallet_id)
        local_token.add_satoshi(CrossChainUnit(
            100, "knowledge", "Local think instruction record.",
            BRAINCHAIN_CHAIN, {"instruction": "think"},
        ))
        target_wallet.acquire_token(local_token)
        ok = target_wallet.request_split_cell_transfer(
            "think_local", 100, source_wallet, "think"
        )
        if not ok:
            raise RuntimeError(f"think dispersion failed for {wallet_id}: {target_wallet.last_transfer}")
        dispersion.append({
            "wallet_id": wallet_id,
            "coordinate": list(coord),
            "share_status": target_wallet.last_transfer["status"],
            "share_from_coordinate": target_wallet.last_transfer["from_coordinate"],
            "share_to_coordinate": target_wallet.last_transfer["to_coordinate"],
            "local_token_units": len(local_token.satoshi_units),
        })

    instructed = 0
    dialog_entries = []
    for agency_record in genesis_agencies:
        coord = tuple(agency_record["coordinate"])
        node = AgentNode(
            coordinate=Coordinate5D(*coord),
            teleological_mandate=MANDATE,
            execution_load=float(agency_record.get("execution_load", 0.1)),
        )
        node.open_workspace()
        result = node.process_instruction(
            InstructionPayload(command="think:instruction", data={})
        )
        if result["status"] == "RECORDED":
            instructed += 1
            dialog_entries.append({
                "block": next_block_number,
                "kind": "agency-dialog",
                "coordinate": list(coord),
                "instruction": "think",
                "entry": "Received think instruction, recorded, returned to AWAIT_INSTRUCTIONS.",
                "operational_state": "AWAIT_INSTRUCTIONS",
                "agency_status": "DRAFT (gate review pending, not self-activated)",
            })

    payload = {
        "block": next_block_number,
        "system": "ZINIUM 1000^5",
        "brainchain_chain": BRAINCHAIN_CHAIN,
        "kind": "think-token-dispersion",
        "token_created": deploy_result,
        "token_identifier": "think",
        "agencies_dispersed": len(dispersion),
        "dispersion": dispersion,
        "source_retained_units": len(source_token.satoshi_units),
        "agencies_instructed": instructed,
        "agencies_awaiting_instructions": instructed,
        "agency_status_after_pass": "DRAFT (gate review pending, not self-activated)",
        "operational_state_after_pass": "AWAIT_INSTRUCTIONS",
        "note": "One bounded pass. Dialog records are log entries, not live model conversation.",
    }
    block_hash = _hash_block(previous_hash, payload)
    block = {"previous_hash": previous_hash, "hash": block_hash, **payload}

    with open(ledger_path, "a") as f:
        f.write(json.dumps(block, sort_keys=True) + "\n")
    with open(os.path.join(workspace_dir, "interactions.jsonl"), "a") as f:
        f.write(json.dumps({
            "block": next_block_number, "kind": "think-token-dispersion",
            "token": "think", "agencies_dispersed": len(dispersion),
        }, sort_keys=True) + "\n")
        for entry in dialog_entries:
            f.write(json.dumps(entry, sort_keys=True) + "\n")

    os.makedirs(runs_dir, exist_ok=True)
    report_path = os.path.join(runs_dir, f"run-block-{next_block_number}.json")
    with open(report_path, "w") as f:
        json.dump(block, f, indent=2, sort_keys=True)

    return {
        "block": next_block_number,
        "hash": block_hash,
        "previous_hash": previous_hash,
        "token_total_units": deploy_result["total_units"],
        "agencies_dispersed": len(dispersion),
        "source_retained_units": len(source_token.satoshi_units),
        "agencies_instructed": instructed,
        "dialog_entries": len(dialog_entries),
        "report_path": report_path,
    }


def main():
    report = run_think(HERE)
    print(f"think token block: {report['block']}")
    print(f"block hash: {report['hash']}")
    print(f"token 'think' total units: {report['token_total_units']}")
    print(f"agencies dispersed: {report['agencies_dispersed']}/32, source retained: {report['source_retained_units']} unit")
    print(f"agencies instructed / dialog entries: {report['agencies_instructed']}/{report['dialog_entries']}")
    print(f"report: {report['report_path']}")
    print("one bounded pass complete: agencies back to AWAIT_INSTRUCTIONS, process exits.")


if __name__ == "__main__":
    main()
