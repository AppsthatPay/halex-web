"""The self-building cycle as a single honest pass.

A scheduler (cron, run by the main agent) invokes this once per cycle.
One pass does, in order:

  1. scan      gap_scanner over the module tree + backlog
  2. build     take the TOP synthesizable gap (a gap whose suggested_spec
               is a full synthesis spec) and run the synthesizer,
               including its mutation check
  3. seal      every synthesis attempt — success, failure, or
               mutation-reject — is appended to the seal chain
  4. register  a passed module whose spec declares capabilities is
               registered in the expert registry (real pool expansion)
  5. forage    index the configured local mirrors into the seal chain
  6. report    write a dated Markdown + JSON cycle report listing exactly
               what was scanned, found, built, sealed, and proposed

What a pass NEVER does: integrate a synthesized module into the main
suite. Passed modules land in <work-dir>/proposals/<name>/ with their
generated tests and results, awaiting the confirmation gate. That is
the honest form of "recursive self-improvement": the system proposes,
the gate disposes.

--dry-run performs scan + forage only (forage still appends index
envelopes to the chain; scan is read-only apart from executing tests).
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from . import forager, gap_scanner, seal, synthesizer
from .expert_registry import ExpertRegistry

DEFAULT_PROVENANCE = "ZINIUM-SEED-ALLEN"


def _is_synthesizable(gap):
    spec = gap.get("suggested_spec")
    return (
        isinstance(spec, dict)
        and isinstance(spec.get("name"), str)
        and isinstance(spec.get("operations"), list)
        and bool(spec.get("operations"))
    )


def run_cycle(modules_root, backlog_dir=None, mirrors=None, work_dir=None,
              evidence_config=None, dry_run=False,
              provenance=DEFAULT_PROVENANCE):
    work_dir = (Path(work_dir).resolve() if work_dir
                else Path.cwd() / "selfbuild-work")
    modules_root = Path(modules_root).resolve()
    if backlog_dir:
        backlog_dir = Path(backlog_dir).resolve()
    mirrors = [str(Path(m).resolve()) for m in (mirrors or [])] or None
    proposals_dir = work_dir / "proposals"
    reports_dir = work_dir / "reports"
    seal_log = work_dir / "seal-log.jsonl"
    registry_path = work_dir / "expert-registry.json"
    for d in (proposals_dir, reports_dir):
        d.mkdir(parents=True, exist_ok=True)

    started = datetime.now(timezone.utc)
    stamp = started.strftime("%Y%m%d-%H%M%S")

    # 1. scan ---------------------------------------------------------------
    gaps = gap_scanner.scan(modules_root, backlog_dir=backlog_dir,
                            evidence_config=evidence_config)

    # 2-4. build / seal / register ------------------------------------------
    synthesis = None
    registration = None
    seal_entry = None
    if not dry_run:
        candidate = next((g for g in gaps if _is_synthesizable(g)), None)
        if candidate is not None:
            spec = candidate["suggested_spec"]
            target_dir = proposals_dir / spec["name"]
            synthesis = synthesizer.synthesize(spec, target_dir)
            synthesis_record = {
                "gap_kind": candidate["kind"],
                "gap_target": candidate["target"],
                "status": synthesis["status"],
                "spec": spec,
                "module_path": synthesis.get("module_path"),
                "test_path": synthesis.get("test_path"),
                "reason": synthesis.get("reason"),
            }
            seal_entry = seal.append_entry(
                seal_log,
                {"event": "synthesis_attempt", **synthesis_record},
                provenance,
            )
            synthesis = {**synthesis_record,
                         "readme_path": synthesis.get("readme_path"),
                         "mutated_operation": synthesis.get("mutated_operation"),
                         "seal_entry_hash": seal_entry["entry_hash"]}
            if synthesis["status"] == "SYNTHESIZED":
                caps = spec.get("capabilities") or (
                    [spec["capability"]] if spec.get("capability") else [])
                if caps:
                    registry = ExpertRegistry(registry_path)
                    registration = registry.register(
                        spec["name"], synthesis["module_path"], caps)

    # 5. forage ---------------------------------------------------------------
    forage_result = {"indexed": 0, "skipped_duplicates": 0, "missing": []}
    if mirrors:
        forage_result = forager.forage(mirrors, seal_log, provenance=provenance)
        forage_result = {k: forage_result[k] for k in
                         ("indexed", "skipped_duplicates", "missing")}

    chain_ok, chain_errors, chain_count = seal.verify_chain(seal_log)

    # 6. report ---------------------------------------------------------------
    report = {
        "cycle_started": started.isoformat(),
        "dry_run": dry_run,
        "modules_root": str(modules_root),
        "backlog_dir": str(backlog_dir) if backlog_dir else None,
        "mirrors": [str(m) for m in (mirrors or [])],
        "gaps_found": gaps,
        "gap_count": len(gaps),
        "synthesis": synthesis,
        "registration": ({k: registration[k] for k in ("status", "reason")
                          if k in registration} if registration else None),
        "forage": forage_result,
        "seal_chain": {"entries": chain_count, "verified": chain_ok,
                       "errors": chain_errors, "log": str(seal_log)},
        "proposals_dir": str(proposals_dir),
        "note": "Synthesized modules are PROPOSALS in the proposals dir. "
                "Integration into the main suite happens only through the "
                "confirmation gate, never by this cycle.",
    }

    json_path = reports_dir / f"cycle-{stamp}.json"
    md_path = reports_dir / f"cycle-{stamp}.md"
    json_path.write_text(json.dumps(report, indent=2, sort_keys=True),
                         encoding="utf-8")
    md_path.write_text(_render_markdown(report), encoding="utf-8")
    report["report_json"] = str(json_path)
    report["report_markdown"] = str(md_path)
    return report


def _render_markdown(report):
    lines = [
        f"# HALEX-AI self-build cycle — {report['cycle_started']}",
        "",
        f"- Dry run: {report['dry_run']}",
        f"- Modules root: `{report['modules_root']}`",
        f"- Backlog dir: `{report['backlog_dir']}`",
        f"- Gaps found: {report['gap_count']}",
        "",
        "## Gaps",
        "",
    ]
    if report["gaps_found"]:
        for g in report["gaps_found"]:
            lines.append(f"- [{g['severity']}] {g['kind']} — {g['target']}: {g['evidence']}")
    else:
        lines.append("- none")
    lines += ["", "## Synthesis", ""]
    syn = report["synthesis"]
    if syn:
        lines.append(f"- Gap: {syn['gap_kind']} / {syn['gap_target']}")
        lines.append(f"- Status: {syn['status']}")
        lines.append(f"- Module (proposal): `{syn['module_path']}`")
        lines.append(f"- Tests: `{syn['test_path']}`")
        if syn.get("reason"):
            lines.append(f"- Reason: {syn['reason']}")
        lines.append(f"- Sealed as chain entry: {syn['seal_entry_hash']}")
    elif report["dry_run"]:
        lines.append("- skipped (dry run)")
    else:
        lines.append("- no synthesizable gap in this pass")
    lines += ["", "## Expert registration", ""]
    reg = report["registration"]
    lines.append(f"- {reg}" if reg else "- none")
    lines += ["", "## Forage", "",
              f"- New items indexed: {report['forage']['indexed']}",
              f"- Duplicates skipped: {report['forage']['skipped_duplicates']}",
              f"- Missing mirrors: {report['forage']['missing']}",
              "", "## Seal chain", "",
              f"- Entries: {report['seal_chain']['entries']}",
              f"- Verified: {report['seal_chain']['verified']}",
              "", report["note"], ""]
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Run one HALEX-AI self-build cycle pass.")
    parser.add_argument("--modules-root", required=True)
    parser.add_argument("--backlog-dir", default=None)
    parser.add_argument("--work-dir", default=None)
    parser.add_argument("--mirrors", nargs="*", default=[])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--provenance", default=DEFAULT_PROVENANCE)
    args = parser.parse_args(argv)
    report = run_cycle(
        modules_root=args.modules_root,
        backlog_dir=args.backlog_dir,
        mirrors=args.mirrors,
        work_dir=args.work_dir,
        dry_run=args.dry_run,
        provenance=args.provenance,
    )
    print(json.dumps({"gap_count": report["gap_count"],
                      "synthesis_status": (report["synthesis"] or {}).get("status"),
                      "forage_indexed": report["forage"]["indexed"],
                      "report_markdown": report["report_markdown"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
