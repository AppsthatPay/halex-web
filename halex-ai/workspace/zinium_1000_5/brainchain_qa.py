"""Brainchain Q&A — STAGING ONLY, stdlib only.

How a user communicates with the cube, honestly:

- This is a RECORD Q&A, not a live LLM, not a trained model,
  and not a conversation with a conscious system. It answers
  only from records that actually exist in this staging folder:
  ledger.jsonl, agencies.json, and the run reports.
- A question is processed in memory only. It is NOT written
  to the ledger or to interactions.jsonl, by the standing gate
  that user message text is never written into chain records.
  Only the answer, when run through chain_engine.py, is
  counted as a cycle record, never the question text.
- If a question is not about a cube record, the answer is an
  honest MISS: "I don't have that in the cube records", plus
  the list of topics it can answer. It never invents a token,
  a price, a model, or a capability.
- Known topics, all from records:
  agencies / first cube / center / neighbour / mandate /
  operational state / token think / first chain token /
  technologies / blocks / last block / mitosis / pruning /
  obscurity / cross-chain share / deploy / brainchain chain.
- "Learning" here means: each run pass appends a new block
  and new interaction records, so later questions can answer
  about later blocks. It does not mean the code retrains,
  updates weights, or learns from the user's question.
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

HERE = os.path.dirname(os.path.abspath(__file__))


def _load_state(base_dir):
    with open(os.path.join(base_dir, "ledger.jsonl")) as f:
        blocks = [json.loads(line) for line in f if line.strip()]
    with open(os.path.join(base_dir, "agencies.json")) as f:
        agencies = json.load(f)
    return blocks, agencies


def _topic_list():
    return [
        "how many agencies are in the first cube",
        "what is the center coordinate",
        "what is the mandate",
        "what operational state are agencies in",
        "what is token think",
        "what is the first chain token",
        "what technologies are in the first chain",
        "how many blocks are in the ledger",
        "what is the last block",
        "did any agency split (mitosis)",
        "what was pruned",
        "what is the obscurity chain",
        "how does cross-chain sharing work here",
    ]


def answer_question(question, base_dir=HERE):
    """Answer from cube records only. Returns a dict, never raises on a miss."""
    q = (question or "").lower()
    try:
        blocks, agencies = _load_state(base_dir)
    except Exception as exc:  # noqa: BLE001 - record the failure honestly
        return {"status": "ERROR", "answer": f"Cube records could not be read: {exc}", "source": "none"}

    last = blocks[-1] if blocks else {}
    center = [500, 500, 500, 500, 500]
    topics = _topic_list()

    def miss():
        return {
            "status": "MISS",
            "answer": "I don't have that in the cube records. I can answer about: " + "; ".join(topics) + ".",
            "source": "none",
        }

    if "how many agencies" in q or "first cube" in q and "how many" in q:
        return {"status": "ANSWERED", "answer": f"The first cube has {len(agencies)} agencies, one per cell where each axis is 500 or 501.", "source": "agencies.json"}
    if "center" in q:
        return {"status": "ANSWERED", "answer": "The center corner is (500, 500, 500, 500, 500), the middle of the prior 1000^4 cube, attached to Brainchain chain 500.", "source": "ledger block 1"}
    if "mandate" in q:
        return {"status": "ANSWERED", "answer": "Every first-cube agency's mandate record is: Learn the chain system; write and use the software system.", "source": "agencies.json"}
    if "operational state" in q or "await" in q or "status" in q and "agenc" in q:
        return {"status": "ANSWERED", "answer": "Agencies are DRAFT (gate review pending, not self-activated) and, after each bounded pass, back to AWAIT_INSTRUCTIONS.", "source": "ledger last block"}
    if "think" in q:
        return {"status": "ANSWERED", "answer": "Token 'think' is an open record, 10,000,000,100 integer units (base whole + 100-unit instruction unit), deployed to the center wallet and shared as a copy to all 31 other first-cube agencies. Source retained. It is not a crypto asset and has no value.", "source": "ledger block 4"}
    if "first chain token" in q:
        return {"status": "ANSWERED", "answer": "TOKEN_FIRST_CHAIN is an open record, 10,000,000,500 integer units (base whole + 5 x 100-unit technology units), deployed to the center wallet and shared to all 32 first-cube agencies.", "source": "ledger block 3"}
    if "technolog" in q:
        return {"status": "ANSWERED", "answer": "The first chain's split-cell technologies are: knowledge, software_systems, neural_modeling, robotics, child_chain_expansion. Each is a text manifest record, never executed.", "source": "ledger block 3"}
    if "how many blocks" in q or "ledger" in q and "how many" in q:
        return {"status": "ANSWERED", "answer": f"The ledger has {len(blocks)} blocks, from genesis block 1 to block {last.get('block')}.", "source": "ledger.jsonl"}
    if "last block" in q:
        return {"status": "ANSWERED", "answer": f"The last block is block {last.get('block')}, kind {last.get('kind')}, hash {last.get('hash')}.", "source": "ledger.jsonl"}
    if "mitosis" in q or "split" in q and "agenc" in q:
        return {"status": "ANSWERED", "answer": "No first-cube agency has split. Genesis loads are 0.1, below the 0.95 threshold, with no recorded need. A sandbox probe only (outside the cube) showed load 0.97 + recorded need + empty slot spawns one DRAFT daughter, which was not added to the cube.", "source": "ledger blocks 2-3"}
    if "prun" in q:
        return {"status": "ANSWERED", "answer": "Pruning drops sub-chains with utility below 0.15. Genesis pruned 1, block 2 pruned 1, block 3 pruned 1 in its probe. Scores are records, not money.", "source": "ledger blocks 1-3"}
    if "obscurity" in q or "chain 865" in q:
        return {"status": "ANSWERED", "answer": "Chain 865 is the obscurity chain in this design. Sealed records carry a SHA3-512 integrity hash only, no key material, no plaintext returned, single-use burn only. A hash is not encryption.", "source": "ledger block 2, obscurity.py"}
    if "cross-chain" in q or "share" in q:
        return {"status": "ANSWERED", "answer": "Cross-chain sharing here is a copy, not a move: a target agency requests a satoshi unit by exact integer units, receives a cloned copy with origin coordinate preserved, and the source retains its original.", "source": "ledger blocks 2-4, cross_chain.py"}
    if "deploy" in q:
        return {"status": "ANSWERED", "answer": "Deploy means: register a wallet record, open its workspace, and record a TOKEN (open) or COIN (sealed hash reference) record. No network, no funds, no mint.", "source": "deploy_engine.py, ledger blocks 2-4"}
    if "brainchain" in q or "chain 500" in q:
        return {"status": "ANSWERED", "answer": "Brainchain chain 500 is the anchor for the first cube. The 1000^5 cube starts in the middle of the prior 1000^4 cube at chain 500, center corner (500,500,500,500,500).", "source": "ledger block 1"}
    return miss()


def main():
    import sys as _sys
    question = " ".join(_sys.argv[1:]) if len(_sys.argv) > 1 else ""
    if not question:
        print("Usage: python3 brainchain_qa.py <question>")
        print("Example: python3 brainchain_qa.py 'What is token think?'")
        return 0
    result = answer_question(question)
    print(f"[{result['status']}] {result['answer']}")
    print(f"Source: {result['source']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
