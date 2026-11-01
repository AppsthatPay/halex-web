"""Executor retirement review pass (staging only).

A periodic review over registered executors: each executor is
checked on three facts - present on file, last run passed, and
scan-clean. All three true means KEEP; any false means RETIRE.
Retirement never deletes anything: the review record keeps every
executor, its verdict, and its reasons, so records stay intact
whether the executor is kept or retired. This module performs no
file writes, no deletions, no runs: it judges the facts it is
given, as plain data.
"""


def review_executors(executors):
    """Review a list of executor dicts.

    Each executor: {"name": non-empty str, "present": bool,
    "run_ok": bool, "scan_clean": bool}. Returns {"verdicts": [...],
    "kept": [...], "retired": [...], "records_intact": True}.
    Verdict entries carry name, verdict, and reasons. Inputs are
    never mutated.
    """
    if not isinstance(executors, list):
        raise ValueError("executors must be a list")
    verdicts = []
    for ex in executors:
        if not isinstance(ex, dict) or not ex.get("name"):
            raise ValueError("each executor needs a non-empty name")
        reasons = []
        if not ex.get("present"):
            reasons.append("not present on file")
        if not ex.get("run_ok"):
            reasons.append("last run did not pass")
        if not ex.get("scan_clean"):
            reasons.append("not scan-clean")
        verdicts.append({
            "name": ex["name"],
            "verdict": "KEEP" if not reasons else "RETIRE",
            "reasons": reasons,
        })
    return {
        "verdicts": verdicts,
        "kept": [v["name"] for v in verdicts if v["verdict"] == "KEEP"],
        "retired": [v["name"] for v in verdicts if v["verdict"] == "RETIRE"],
        "records_intact": True,
    }
