"""Chain engine — STAGING ONLY, stdlib only.

"Start the chain engine" means, in this staging build:
  run one bounded engine cycle, then exit. There is no daemon,
  no loop, no timer, no server. Each invocation is one cycle
  that appends one block, and the process exits.

Commands:
  python3 chain_engine.py status
      Print ledger blocks, agencies, last block hash, and
      operational state. No writes.
  python3 chain_engine.py cycle
      One engine cycle: every first-cube agency processes one
      "engine-cycle" instruction as a record and returns to
      AWAIT_INSTRUCTIONS, then block N+1 is appended,
      hash-chained. No token is created, no share is repeated,
      no agency is activated, no expansion is forced.
  python3 chain_engine.py ask "<question>"
      Answer from cube records only, via brainchain_qa.py.
      The question text is NOT written to the ledger.

AI-sourced software basis for the chain system abacus 1000^5:
  the basis is the code in this folder, all stdlib, all
  record-only: halex_1000_5.py (5D engine, integer units,
  gated mitosis, pruning), genesis.py (block 1), deploy_engine.py
  (TOKEN/COIN records), cross_chain.py (copy sharing with
  coordinate provenance), obscurity.py (sealed hash + single-use
  burn, no keys, no plaintext), brainchain_runner.py (block 2
  wiring), first_chain_population.py (block 3, token +
  technologies + toy transform record), think_token.py (block 4,
  token "think" dispersion + dialog records), brainchain_qa.py
  (record Q&A, honest MISS), and this file (engine cycle).
  See ABACUS_5_BASIS.md in this folder for the full list and
  for what is explicitly NOT in the basis: no Wasm runtime,
  no trained model, no network, no signing, no funds, no keys.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brainchain_qa import answer_question  # noqa: E402
from halex_1000_5 import (  # noqa: E402
    AgentNode,
    Coordinate5D,
    InstructionPayload,
)

HERE = os.path.dirname(os.path.abspath(__file__))
MANDATE = "Learn the chain system; write and use the software system."


def _hash_block(previous_hash, payload):
    return hashlib.sha256(
        (previous_hash + json.dumps(payload, sort_keys=True)).encode()
    ).hexdigest()


def _payload_without_hashes(block):
    return {k: v for k, v in block.items() if k not in ("previous_hash", "hash")}


def status(base_dir=HERE):
    with open(os.path.join(base_dir, "ledger.jsonl")) as f:
        blocks = [json.loads(line) for line in f if line.strip()]
    with open(os.path.join(base_dir, "agencies.json")) as f:
        agencies = json.load(f)
    last = blocks[-1]
    return {
        "blocks": len(blocks),
        "last_block": last["block"],
        "last_kind": last.get("kind"),
        "last_hash": last["hash"],
        "agencies": len(agencies),
        "operational_state": "AWAIT_INSTRUCTIONS",
        "agency_status": "DRAFT (gate review pending)",
    }


def cycle(base_dir=HERE):
    ledger_path = os.path.join(base_dir, "ledger.jsonl")
    agencies_path = os.path.join(base_dir, "agencies.json")
    workspace_dir = os.path.join(base_dir, "workspace")
    runs_dir = os.path.join(base_dir, "runs")
    with open(ledger_path) as f:
        blocks = [json.loads(line) for line in f if line.strip()]
    if not blocks:
        raise ValueError("ledger is empty")
    last = blocks[-1]
    previous_hash = last["hash"]
    next_block = int(last["block"]) + 1
    if _hash_block(last["previous_hash"], _payload_without_hashes(last)) != last["hash"]:
        raise ValueError("last ledger block hash does not verify; refusing to extend")
    with open(agencies_path) as f:
        agencies = json.load(f)
    instructed = 0
    for record in agencies:
        node = AgentNode(
            coordinate=Coordinate5D(*tuple(record["coordinate"])),
            teleological_mandate=MANDATE,
            execution_load=float(record.get("execution_load", 0.1)),
        )
        node.open_workspace()
        result = node.process_instruction(
            InstructionPayload(command=f"engine-cycle-block-{next_block}", data={})
        )
        if result["status"] == "RECORDED":
            instructed += 1
    payload = {
        "block": next_block,
        "system": "ZINIUM 1000^5",
        "kind": "chain-engine-cycle",
        "agencies_instructed": instructed,
        "agencies_awaiting_instructions": instructed,
        "operational_state_after_pass": "AWAIT_INSTRUCTIONS",
        "note": "One bounded engine cycle. No loop, no daemon.",
    }
    block_hash = _hash_block(previous_hash, payload)
    block = {"previous_hash": previous_hash, "hash": block_hash, **payload}
    with open(ledger_path, "a") as f:
        f.write(json.dumps(block, sort_keys=True) + "\n")
    with open(os.path.join(workspace_dir, "interactions.jsonl"), "a") as f:
        f.write(json.dumps({
            "block": next_block, "kind": "chain-engine-cycle",
            "agencies_instructed": instructed,
            "operational_state": "AWAIT_INSTRUCTIONS",
        }, sort_keys=True) + "\n")
    os.makedirs(runs_dir, exist_ok=True)
    report_path = os.path.join(runs_dir, f"run-block-{next_block}.json")
    with open(report_path, "w") as f:
        json.dump(block, f, indent=2, sort_keys=True)
    return {"block": next_block, "hash": block_hash, "agencies_instructed": instructed, "report_path": report_path}


def main(argv):
    if not argv or argv[0] == "status":
        s = status()
        print(f"blocks: {s['blocks']}, last block {s['last_block']} ({s['last_kind']})")
        print(f"last hash: {s['last_hash']}")
        print(f"agencies: {s['agencies']}, status {s['agency_status']}, state {s['operational_state']}")
        return 0
    if argv[0] == "cycle":
        r = cycle()
        print(f"chain engine cycle block: {r['block']}")
        print(f"block hash: {r['hash']}")
        print(f"agencies instructed / awaiting: {r['agencies_instructed']}/32")
        print(f"report: {r['report_path']}")
        print("one bounded cycle complete: process exits.")
        return 0
    if argv[0] == "ask":
        question = " ".join(argv[1:])
        if not question:
            print("Usage: python3 chain_engine.py ask \"<question>\"")
            return 0
        result = answer_question(question)
        print(f"[{result['status']}] {result['answer']}")
        print(f"Source: {result['source']}")
        return 0
    print("Usage: python3 chain_engine.py [status|cycle|ask \"<question>\"]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
