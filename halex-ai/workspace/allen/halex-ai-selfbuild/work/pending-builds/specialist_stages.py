"""Staging specialist stages for the build orchestrator (H3 Verifier lane).

Four stages, as real deterministic functions over a staging task dict.
They are NOT running agents, NOT a live feature, and NOT wired into
the engine: the engine's cycle (halex_ai_selfbuild/cycle.py) is
untouched. The harness proves the gate's second half — the
orchestrator flow is unchanged when stages are absent — by running
the same staging flow with stages=None and with all four stages and
comparing the baseline fields.

A staging task is a plain dict: {"id", "kind", "notes", "evidence"}.
Each stage returns a dict and never mutates its input.

  researcher(task): collects the task's stated evidence items into a
      finding list; a task with no evidence yields an honest empty
      finding list, never an invented finding.
  verifier(task): checks each finding against the task's gate notes:
      a finding passes only if its source string is non-empty.
  compiler(task): renders the verified findings into a staging draft
      text (title + one line per finding). Unverified findings are
      listed under an "UNVERIFIED" section, never promoted.
  builder(task): assembles the stage outputs into a staging bundle
      dict naming the draft text and the per-stage results.

run_flow(task, stages=None): the staging orchestrator flow. Baseline
fields (id, kind, notes, steps) are identical whether stages are
absent or present; stages only ADD a "stage_results" key. That is
the additive-only property the gate asks for.
"""
import copy

STAGE_NAMES = ("researcher", "verifier", "compiler", "builder")


def researcher(task):
    findings = []
    for item in task.get("evidence", []) or []:
        if isinstance(item, dict) and item.get("source"):
            findings.append({"claim": item.get("claim", ""),
                             "source": item["source"]})
    return {"stage": "researcher", "findings": findings}


def verifier(task):
    prior = task.get("_researcher") or {}
    results = []
    for f in prior.get("findings", []):
        results.append({"claim": f["claim"],
                        "verified": bool(f.get("source"))})
    return {"stage": "verifier", "results": results}


def compiler(task):
    verified = [r for r in (task.get("_verifier") or {}).get("results", [])
                if r["verified"]]
    unverified = [r for r in (task.get("_verifier") or {}).get("results", [])
                  if not r["verified"]]
    lines = ["# Staging draft for %s" % task.get("id", "untitled")]
    for r in verified:
        lines.append("- VERIFIED: %s" % r["claim"])
    if unverified:
        lines.append("## UNVERIFIED (never promoted)")
        for r in unverified:
            lines.append("- UNVERIFIED: %s" % r["claim"])
    return {"stage": "compiler", "draft": "\n".join(lines) + "\n",
            "verified_count": len(verified),
            "unverified_count": len(unverified)}


def builder(task):
    return {"stage": "builder",
            "bundle": {"task_id": task.get("id"),
                       "draft_present": bool((task.get("_compiler") or {})
                                             .get("draft")),
                       "stages_run": [s for s in STAGE_NAMES
                                      if ("_" + s) in task]}}


_STAGES = {"researcher": researcher, "verifier": verifier,
           "compiler": compiler, "builder": builder}


def run_flow(task, stages=None):
    """Staging orchestrator flow. Baseline fields never change."""
    work = copy.deepcopy(task)
    steps = ["scan", "report"]
    out = {"id": work.get("id"), "kind": work.get("kind"),
           "notes": work.get("notes"), "steps": steps}
    if stages:
        stage_results = {}
        for name in stages:
            fn = _STAGES[name]
            result = fn(work)
            work["_" + name] = result
            stage_results[name] = result
        out["stage_results"] = stage_results
    return out
