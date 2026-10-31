"""Regenerate the cube snapshot for the HALEX-AI app — STAGING ONLY.

Why this file exists: the cube page (halex-ai/cube.html) runs
in a browser and cannot run Python, so it answers from a
snapshot, not from the live ledger. After every new ledger
block, this script must be run, or the page will answer from
stale records. That staleness is the main way HALEX-AI fails
to "run correctly" as a record system, and this script is the
fix for it: one command, deterministic, no network, no keys.

Usage, from this folder:
  python3 regenerate_cube_state.py

It reads ledger.jsonl + agencies.json here, and writes:
  - ../../zinium-cube-state.json (the snapshot file)
  - ../../cube.html (inline snapshot + state line only;
    no other part of the page is touched)

It never writes to the ledger, never invents a block, and
never changes the page's script order. Re-run the page's
node --check and the zinium test suite after using it.
"""

from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(os.path.dirname(HERE))
# HERE = .../workspace/zinium_1000_5, APP_DIR = .../halex-ai


def main():
    with open(os.path.join(HERE, "ledger.jsonl")) as f:
        blocks = [json.loads(line) for line in f if line.strip()]
    with open(os.path.join(HERE, "agencies.json")) as f:
        agencies = json.load(f)
    last = blocks[-1]
    state = {
        "system": "ZINIUM 1000^5",
        "status": "STAGING ONLY, not live, not a crypto system",
        "brainchain_chain": 500,
        "center": [500, 500, 500, 500, 500],
        "agencies_count": len(agencies),
        "agency_status": "DRAFT (gate review pending)",
        "operational_state": "AWAIT_INSTRUCTIONS",
        "blocks": len(blocks),
        "last_block": last["block"],
        "last_kind": last.get("kind"),
        "last_hash": last["hash"],
        "block_hashes": [b["hash"] for b in blocks],
        "tokens": {
            "think": {"total_units": 10000000100, "block": 4},
            "TOKEN_FIRST_CHAIN": {"total_units": 10000000500, "block": 3},
        },
        "technologies": ["knowledge", "software_systems", "neural_modeling", "robotics", "child_chain_expansion"],
        "mandate": "Learn the chain system; write and use the software system.",
        "qa_note": "Record Q&A only. Answers come from these records. No live LLM, no trained model, no Wasm execution, no keys, no funds.",
        "qa_topics": ["how many agencies", "center coordinate", "mandate", "operational state", "token think", "first chain token", "technologies", "blocks", "last block", "mitosis", "pruning", "obscurity", "cross-chain sharing"],
    }
    state_path = os.path.join(APP_DIR, "zinium-cube-state.json")
    with open(state_path, "w") as f:
        json.dump(state, f, indent=2)
    cube_path = os.path.join(APP_DIR, "cube.html")
    with open(cube_path) as f:
        html = f.read()
    # Replace the inline JSON block between the cube-state script tags.
    inline = json.dumps(state, separators=(",", ":"))
    html_new, n1 = re.subn(
        r'(<script id="cube-state" type="application/json">\n).*?(\n</script>)',
        lambda m: m.group(1) + inline + m.group(2),
        html, flags=re.DOTALL,
    )
    state_line = (
        f"Blocks: {len(blocks)} | Last: block {last['block']} ({last.get('kind')}) "
        f"| Agencies: {len(agencies)} | State: AWAIT_INSTRUCTIONS | Center: (500,500,500,500,500)"
    )
    html_new, n2 = re.subn(
        r'document\.getElementById\("state"\)\.textContent = "[^"]*";',
        f'document.getElementById("state").textContent = "{state_line}";',
        html_new,
    )
    # Also update the reasoning line that hard-codes block counts.
    html_new = html_new.replace(
        "ledger.jsonl (5 blocks)", f"ledger.jsonl ({len(blocks)} blocks)"
    )
    if n1 != 1 or n2 != 1:
        raise RuntimeError(f"cube.html replacement failed: inline={n1}, state_line={n2}")
    with open(cube_path, "w") as f:
        f.write(html_new)
    print(f"blocks: {len(blocks)}, last block {last['block']} ({last.get('kind')})")
    print(f"state: {state_path}")
    print(f"page: {cube_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
