"""Per-stage tests + additive-only proof for specialist-stages.

Gate: "per-stage tests pass and the orchestrator flow is unchanged
when stages are absent (additive only)."

The task used is a real staging task shape (a knowledge queue item
with evidence strings); no finding is invented — the researcher only
passes through evidence the task already states, and the verifier
only passes findings with a non-empty source.

Usage: python3 specialist-stages-harness.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from specialist_stages import (STAGE_NAMES, builder, compiler, researcher,
                               run_flow, verifier)

PROOF_OUT = HERE / "specialist-stages-proof.json"

TASK = {
    "id": "staging-specialist-demo",
    "kind": "knowledge",
    "notes": "PENDING: demo task for stage tests only",
    "evidence": [
        {"claim": "deer mouse record exists in staging",
         "source": "work/pending-builds/fauna-intake-mammals-deer-mouse.json"},
        {"claim": "mice pack has 6 entries",
         "source": "halex-ai-pack-animals.js (read 2026-11-01)"},
    ],
}


def main():
    checks = []

    def check(name, ok, detail=""):
        checks.append({"name": name, "pass": bool(ok), "detail": detail})

    # Per-stage tests.
    r = researcher(TASK)
    check("researcher: passes through exactly the stated evidence",
          len(r["findings"]) == 2
          and r["findings"][0]["source"].endswith("deer-mouse.json"))
    check("researcher: empty evidence yields empty findings, no invention",
          researcher({**TASK, "evidence": []})["findings"] == [])
    v = verifier({**TASK, "_researcher": r})
    check("verifier: sourced findings verify",
          len(v["results"]) == 2
          and all(x["verified"] for x in v["results"]))
    c = compiler({**TASK, "_verifier": v})
    check("compiler: draft lists both verified findings",
          c["verified_count"] == 2 and c["unverified_count"] == 0
          and "VERIFIED" in c["draft"])
    b = builder({**TASK, "_researcher": r, "_verifier": v, "_compiler": c})
    check("builder: bundle names the task and reports draft present",
          b["bundle"]["task_id"] == TASK["id"]
          and b["bundle"]["draft_present"] is True)
    check("four stages exist, named researcher/verifier/compiler/builder",
          STAGE_NAMES == ("researcher", "verifier", "compiler", "builder"))

    # Additive-only: flow without stages vs flow with all stages.
    baseline = run_flow(TASK, stages=None)
    staged = run_flow(TASK, stages=list(STAGE_NAMES))
    check("flow without stages has no stage_results key",
          "stage_results" not in baseline)
    check("flow with stages adds stage_results only",
          set(staged.keys()) == set(baseline.keys()) | {"stage_results"})
    for field in ("id", "kind", "notes", "steps"):
        check("baseline field %r unchanged when stages present" % field,
              staged[field] == baseline[field])
    check("staged flow ran all four stages",
          list(staged["stage_results"].keys()) == list(STAGE_NAMES))
    check("input task is not mutated by the flow",
          TASK == {"id": "staging-specialist-demo", "kind": "knowledge",
                   "notes": "PENDING: demo task for stage tests only",
                   "evidence": TASK["evidence"]})

    proof = {"checks": checks,
             "passed": sum(1 for c in checks if c["pass"]),
             "failed": sum(1 for c in checks if not c["pass"])}
    PROOF_OUT.write_text(json.dumps(proof, indent=2, sort_keys=True),
                         encoding="utf-8")
    for c in checks:
        print(("PASS " if c["pass"] else "FAIL ") + c["name"]
              + ((" - " + c["detail"]) if c["detail"] else ""))
    print("%d checks pass, %d fail" % (proof["passed"], proof["failed"]))
    return 0 if proof["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
