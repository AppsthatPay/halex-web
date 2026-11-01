#!/usr/bin/env python3
"""Sandboxed run proof for the executor-seeding tools (staging).

Runs the three tools as subprocesses with fixed argument lists
(no command shell, no network) and records the outcome:
  1. pack linter on the real library-pack-expansion.json (expect pass)
  2. pack linter on a deliberately broken pack (expect fail: the
     negative control proves the linter detects bad packs)
  3. queue validator over every queue/*.json file (expect pass)
  4. draft formatter on library-pack-wiring.md, formatted twice
     (expect identical output: idempotent, single trailing newline,
     no trailing-whitespace lines)

Writes executor-seeding-proof.json next to this script. The proof
file is the only file this runner creates inside the tree; all
other outputs go to a temporary directory that is removed after.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
QUEUE_DIR = ROOT / "queue"


def run_tool(args, expect):
    proc = subprocess.run(args, capture_output=True, text=True, timeout=60)
    return {
        "command": [Path(a).name if a.endswith(".py") else a for a in args],
        "exit_code": proc.returncode,
        "expected_exit": expect,
        "matched": proc.returncode == expect,
        "stdout_tail": proc.stdout.strip().splitlines()[-3:],
        "stderr_tail": proc.stderr.strip().splitlines()[-3:]
        if proc.stderr.strip() else [],
    }


def main():
    linter = HERE / "executor-seeding-pack-linter.py"
    validator = HERE / "executor-seeding-queue-validator.py"
    formatter = HERE / "executor-seeding-draft-formatter.py"
    results = {}
    results["pack_linter_real_pack"] = run_tool(
        [sys.executable, str(linter),
         str(HERE / "library-pack-expansion.json")], 0)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        broken = tmp / "broken-pack.json"
        broken.write_text(json.dumps({
            "packs": [{"id": "broken",
                       "entries": [{"title": "No patterns here"}]}]
        }), encoding="utf-8")
        results["pack_linter_broken_pack_negative_control"] = run_tool(
            [sys.executable, str(linter), str(broken)], 1)
        results["queue_validator_all"] = run_tool(
            [sys.executable, str(validator), "--all", str(QUEUE_DIR)], 0)
        draft = HERE / "library-pack-wiring.md"
        first = tmp / "formatted-1.md"
        second = tmp / "formatted-2.md"
        run1 = run_tool(
            [sys.executable, str(formatter), str(draft), str(first)], 0)
        run2 = run_tool(
            [sys.executable, str(formatter), str(first), str(second)], 0)
        formatted = first.read_text(encoding="utf-8")
        idempotent = first.read_text(encoding="utf-8") == \
            second.read_text(encoding="utf-8")
        trailing_ws = [i for i, line in
                       enumerate(formatted.splitlines(), 1)
                       if line != line.rstrip()]
        results["draft_formatter_first_pass"] = run1
        results["draft_formatter_second_pass"] = run2
        results["draft_formatter_idempotent"] = idempotent
        results["draft_formatter_trailing_ws_lines"] = trailing_ws
        results["draft_formatter_single_trailing_newline"] = \
            formatted.endswith("\n") and not formatted.endswith("\n\n")
    checks = [
        results["pack_linter_real_pack"]["matched"],
        results["pack_linter_broken_pack_negative_control"]["matched"],
        results["queue_validator_all"]["matched"],
        results["draft_formatter_first_pass"]["matched"],
        results["draft_formatter_second_pass"]["matched"],
        results["draft_formatter_idempotent"],
        results["draft_formatter_trailing_ws_lines"] == [],
        results["draft_formatter_single_trailing_newline"],
    ]
    proof = {
        "executor_seeding": "pack-linter, queue-entry validator, draft-formatter",
        "sandbox": "subprocess argument lists only, no command shell, "
                   "no network, inputs read-only except this proof file",
        "results": results,
        "checks_passed": sum(1 for c in checks if c),
        "checks_total": len(checks),
        "all_passed": all(checks),
    }
    proof_path = HERE / "executor-seeding-proof.json"
    proof_path.write_text(json.dumps(proof, indent=2) + "\n",
                          encoding="utf-8")
    print("PROOF %s: %d/%d checks passed"
          % (proof_path.name, proof["checks_passed"],
             proof["checks_total"]))
    return 0 if proof["all_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
