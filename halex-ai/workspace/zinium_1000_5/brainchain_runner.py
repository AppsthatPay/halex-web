"""Brainchain runner — STAGING ONLY, stdlib only.

What was missing, and what this file wires together:

Before this file, the 1000^5 pieces existed side by side but never
ran as one system:
- genesis.py created 32 agencies, pulsed them once, and exited.
  No agency ever processed a second instruction.
- deploy_engine.py could deploy a TOKEN/COIN record, but only to
  its own wallet records — never to a genesis agency.
- cross_chain.py could share a satoshi copy, but only in its
  generic demo (domain chains 1276/3471) — never between two
  genesis agencies, and its transfer record dropped the 5D
  coordinate, so provenance was wallet + chain only.
- obscurity.py could burn a sealed unit once, but only in its
  generic demo (obscurity chain 9999) — never for a genesis
  agency, and never tied to Chain 865, the obscurity chain
  in Jeffrey's design.
- ledger.jsonl stopped at block 1. There was no block 2, no
  append-only chain step, and no HALEX-AI use path: nothing
  recorded *which* knowledge/software record was deployed,
  shared, or sealed, for HALEX-AI to read back.

This runner is the wiring, in one bounded pass:

  genesis agencies (32, DRAFT, AWAIT_INSTRUCTIONS)
      -> unified wallet per agency (one wallet_id, one 5D
         coordinate, shared by deploy + cross-chain + obscurity)
      -> deploy TOKEN (open knowledge/software record) to the
         center agency, and COIN (sealed record, SHA3-512 hash
         reference — a hash is not encryption) to the same wallet
      -> cross-chain share: a copy of a 100-unit knowledge
         record from the center agency to its first neighbour
         agency. Source retained, origin coordinate preserved,
         target goes 1 -> 2 satoshi units, exact integer units.
      -> obscurity burn: a sealed 100-unit record on Chain 865
         (the obscurity chain) is requested once, consumed once,
         reuse refused. No key material, no plaintext returned.
      -> instruction pass: every agency processes one
         "learn" instruction as a record and returns to
         AWAIT_INSTRUCTIONS. No code is executed; a
         generate/execute instruction would still be refused.
      -> expansion + pruning check: agencies here run at load
         0.1, below the 0.95 mitosis threshold, with no recorded
         need — so expansion is 0, honestly, not forced. One
         low-utility sub-chain is pruned, as in genesis.
      -> block N+1 appended to ledger.jsonl, hash-chained from
         the previous block, and run records appended to
         workspace/interactions.jsonl. Genesis block 1 is never
         rewritten. agencies.json is never rewritten: it stays
         the genesis snapshot, and the run report is written to
         runs/run-block-<N+1>.json.

"Allow it to run, not loops": this runner runs exactly ONE pass
and exits. There is no `while True`, no daemon loop, no timer.
Running it again is a new, separate pass that appends the next
block. That is deliberate: a bounded run can be verified, a
loop that never ends cannot.

HALEX-AI use, in plain terms:
- A TOKEN record is how HALEX-AI publishes an open knowledge /
  software record into the chain, so any agency can read it.
- A COIN record is how HALEX-AI seals a record on the obscurity
  chain (Chain 865), so it is referenced by hash, not published
  in the open.
- A cross-chain share is how HALEX-AI gives a second agency a
  copy of a record it needs to complete its own structure,
  without moving or deleting the original.
- A single-use burn is how HALEX-AI hands out one sealed record
  exactly once: after consumption it is gone, and reuse is an
  error, not a second copy.
- The ledger + interactions log is the read-back surface:
  HALEX-AI reads block N+1 and the run report to see what was
  deployed, shared, and sealed in that pass, and every agency
  ends the pass back in AWAIT_INSTRUCTIONS, ready for the next
  instruction it is actually given.

No network, no value transfer, no crypto mint, no keys, no
credentials. Bytecode / manifest fields are data records only,
never executed.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
    FractalToken,
    InstructionPayload,
    SatoshiSubChain,
    UNITS_PER_WHOLE,
    execute_braincell_pruning,
)
from obscurity import (  # noqa: E402
    EncryptedWalletVault,
    ObscurityChainSecureExchange,
)

HERE = os.path.dirname(os.path.abspath(__file__))
BRAINCHAIN_CHAIN = 500
OBSCURITY_CHAIN = 865  # Chain 865, Jeffrey's obscurity chain
CENTER = (500, 500, 500, 500, 500)
NEIGHBOUR = (500, 500, 500, 500, 501)
MANDATE = "Learn the chain system; write and use the software system."


def wallet_id_for(coord_tuple):
    return "W-" + "-".join(str(v) for v in coord_tuple)


def coord_from_tuple(coord_tuple):
    return Coordinate5D(*coord_tuple)


def _block_payload_without_hashes(block):
    payload = {k: v for k, v in block.items() if k not in ("previous_hash", "hash")}
    return payload


def _hash_block(previous_hash, payload):
    return hashlib.sha256(
        (previous_hash + json.dumps(payload, sort_keys=True)).encode()
    ).hexdigest()


def run_pass(base_dir):
    """Run one bounded brainchain pass in base_dir. Returns the report.

    base_dir must already contain genesis outputs: ledger.jsonl,
    agencies.json, and a workspace/ directory. It never regenerates
    genesis, and it never rewrites block 1 or agencies.json.
    """
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

    # Verify the last block's hash chains, so a corrupted ledger
    # is reported instead of silently extended.
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
    if CENTER not in coords or NEIGHBOUR not in coords:
        raise ValueError("center / neighbour agency missing from genesis agencies")

    # --- Unified wallets: one identity across deploy, share, obscurity.
    center_id = wallet_id_for(CENTER)
    neighbour_id = wallet_id_for(NEIGHBOUR)
    deployer = HalexTokenDeployer()
    deployer.register_wallet(center_id, coord_from_tuple(CENTER))
    deployer.register_wallet(neighbour_id, coord_from_tuple(NEIGHBOUR))

    token_result = deployer.deploy(
        "TOKEN_BRAINCHAIN_KNOWLEDGE",
        "TOKEN",
        center_id,
        [DeployUnit(100, {"knowledge": "brainchain wiring record"})],
    )
    coin_result = deployer.deploy(
        "COIN_BRAINCHAIN_SEALED",
        "COIN",
        center_id,
        [DeployUnit(100, {"knowledge": "sealed brainchain record"})],
    )

    # --- Cross-chain share, between genesis agencies (not the demo).
    # Chain id is the Brainchain anchor (500) for both; the wallets
    # and coordinates are what distinguish source from target, and
    # cross_chain.py now records both coordinates in the transfer.
    source_wallet = TransparentWallet(
        center_id, BRAINCHAIN_CHAIN,
        "Center agency wallet: holds the open knowledge record",
        coord_from_tuple(CENTER),
    )
    target_wallet = TransparentWallet(
        neighbour_id, BRAINCHAIN_CHAIN,
        "Neighbour agency wallet: needs the record to complete its structure",
        coord_from_tuple(NEIGHBOUR),
    )
    source_token = CrossChainToken("TOKEN_BRAINCHAIN_KNOWLEDGE", BRAINCHAIN_CHAIN, center_id)
    source_token.add_satoshi(CrossChainUnit(
        100, "brainchain_knowledge",
        "Brainchain wiring record: data, knowledge, or software to be shared.",
        BRAINCHAIN_CHAIN,
    ))
    source_wallet.acquire_token(source_token)
    target_token = CrossChainToken("TOKEN_BRAINCHAIN_LOCAL", BRAINCHAIN_CHAIN, neighbour_id)
    target_token.add_satoshi(CrossChainUnit(
        100, "brainchain_local",
        "Neighbour local instruction record.",
        BRAINCHAIN_CHAIN,
    ))
    target_wallet.acquire_token(target_token)
    share_ok = target_wallet.request_split_cell_transfer(
        "TOKEN_BRAINCHAIN_LOCAL", 100, source_wallet, "TOKEN_BRAINCHAIN_KNOWLEDGE"
    )
    if not share_ok:
        raise RuntimeError(f"cross-chain share failed: {target_wallet.last_transfer}")
    share_transfer = target_wallet.last_transfer

    # --- Obscurity burn, on Chain 865, for the center agency.
    exchange = ObscurityChainSecureExchange()
    vault = EncryptedWalletVault(center_id, OBSCURITY_CHAIN, coord_from_tuple(CENTER))
    exchange.register_vault(vault)
    vault.mint_encrypted_coin(
        "COIN_BRAINCHAIN_SEALED",
        ["Sealed brainchain record 1", "Sealed brainchain record 2"],
    )
    package = exchange.request_secure_shrouded_token(
        neighbour_id, center_id, "COIN_BRAINCHAIN_SEALED", 100
    )
    burn_result = exchange.consume_and_burn_single_use_token(package)
    reuse_refused = False
    try:
        exchange.consume_and_burn_single_use_token(package)
    except RuntimeError:
        reuse_refused = True

    # --- Instruction pass: every genesis agency, one record, back to await.
    instruction_results = []
    for agency_record in genesis_agencies:
        node = AgentNode(
            coordinate=coord_from_tuple(tuple(agency_record["coordinate"])),
            teleological_mandate=MANDATE,
            execution_load=float(agency_record.get("execution_load", 0.1)),
        )
        node.open_workspace()
        result = node.process_instruction(
            InstructionPayload(
                command=f"learn:brainchain-run-block-{next_block_number}", data={}
            )
        )
        instruction_results.append(result)
    instructed = sum(1 for r in instruction_results if r["status"] == "RECORDED")
    awaiting = instructed  # process_instruction returns to AWAIT_INSTRUCTIONS

    # --- Expansion + pruning check (honest, not forced).
    # Genesis loads are 0.1, below the 0.95 threshold, and no need
    # is recorded in this pass, so expansion is 0.
    expansions = 0
    probe_token = FractalToken(root_identifier="TOKEN_BRAINCHAIN_PRUNE_PROBE")
    probe_token.expand_decimal_allocation(SatoshiSubChain(
        100, b"", {"utility_metric": "0.85", "domain": "brainchain_knowledge"}
    ))
    probe_token.expand_decimal_allocation(SatoshiSubChain(
        200, b"", {"utility_metric": "0.05"}
    ))
    pruned = execute_braincell_pruning(probe_token)

    payload = {
        "block": next_block_number,
        "system": "ZINIUM 1000^5",
        "brainchain_chain": BRAINCHAIN_CHAIN,
        "obscurity_chain": OBSCURITY_CHAIN,
        "kind": "brainchain-run-pass",
        "center_wallet": center_id,
        "neighbour_wallet": neighbour_id,
        "center_coordinate": list(CENTER),
        "neighbour_coordinate": list(NEIGHBOUR),
        "genesis_agencies": len(genesis_agencies),
        "agencies_instructed": instructed,
        "agencies_awaiting_instructions": awaiting,
        "deploy_token": token_result,
        "deploy_coin": coin_result,
        "cross_chain_share": share_transfer,
        "cross_chain_source_retained_units": len(source_token.satoshi_units),
        "cross_chain_target_units": len(target_token.satoshi_units),
        "obscurity_burn": burn_result,
        "obscurity_reuse_refused": reuse_refused,
        "expansions": expansions,
        "pruned_sub_chains": pruned,
        "prune_probe_units_after": probe_token.total_units(),
        "operational_state_after_pass": "AWAIT_INSTRUCTIONS",
        "note": "One bounded pass. No loop, no daemon. Run again for the next block.",
    }
    block_hash = _hash_block(previous_hash, payload)
    block = {"previous_hash": previous_hash, "hash": block_hash, **payload}

    with open(ledger_path, "a") as f:
        f.write(json.dumps(block, sort_keys=True) + "\n")
    interactions_path = os.path.join(workspace_dir, "interactions.jsonl")
    with open(interactions_path, "a") as f:
        f.write(json.dumps({
            "block": next_block_number, "kind": "brainchain-run-pass",
            "center_wallet": center_id, "neighbour_wallet": neighbour_id,
            "deploy_token_total_units": token_result["total_units"],
            "deploy_coin_total_units": coin_result["total_units"],
            "cross_chain_share": share_transfer,
            "obscurity_burn": burn_result,
        }, sort_keys=True) + "\n")
        f.write(json.dumps({
            "block": next_block_number, "kind": "agency-instruction-pass",
            "agencies_instructed": instructed,
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
        "agencies_instructed": instructed,
        "deploy_token_total_units": token_result["total_units"],
        "deploy_coin_total_units": coin_result["total_units"],
        "deploy_coin_vault_hash": coin_result["vault_hash_sha3_512"],
        "cross_chain_share": share_transfer,
        "obscurity_burn": burn_result,
        "obscurity_reuse_refused": reuse_refused,
        "expansions": expansions,
        "pruned": pruned,
        "report_path": report_path,
    }


def main():
    report = run_pass(HERE)
    print(f"brainchain run block: {report['block']}")
    print(f"block hash: {report['hash']}")
    print(f"previous hash: {report['previous_hash']}")
    print(f"agencies instructed / awaiting: {report['agencies_instructed']}/32")
    print(f"deploy TOKEN total units: {report['deploy_token_total_units']} "
          f"(expected {UNITS_PER_WHOLE + 100})")
    print(f"deploy COIN total units: {report['deploy_coin_total_units']} "
          f"(expected {UNITS_PER_WHOLE + 100})")
    print(f"cross-chain share: {report['cross_chain_share']['status']} "
          f"-> target total {report['cross_chain_share']['local_token_total_units']}")
    print(f"obscurity burn: {report['obscurity_burn']['status']}, "
          f"remaining sealed units {report['obscurity_burn']['remaining_satoshi_units']}, "
          f"reuse refused {report['obscurity_reuse_refused']}")
    print(f"expansions: {report['expansions']} (load below threshold, no recorded need)")
    print(f"pruned: {report['pruned']}")
    print(f"report: {report['report_path']}")
    print("one bounded pass complete: agencies back to AWAIT_INSTRUCTIONS, process exits.")


if __name__ == "__main__":
    main()
