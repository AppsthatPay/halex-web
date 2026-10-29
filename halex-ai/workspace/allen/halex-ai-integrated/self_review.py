"""HALEX-AI nightly gated self-review cycle (Allen-authored).

Seed Marker: ZINIUM-SEED-ALLEN.

One review pass over two trees: this integrated tree, and the staged
Gemini suite tree. A pass does four things:

  (a) TESTS: runs both unittest suites (per-directory discovery, the
      suite's own invocation style) and records per-suite pass/fail
      counts exactly as they came back.
  (b) DRIFT: compares the staged suite's on-disk module inventory
      against the completed gate report's verdict table. Folders on
      disk that the verdict table does not name, and folders the table
      names that are missing on disk, are flagged as drift items.
      Quarantine folders are checked against a stored hash baseline:
      the first pass creates the baseline and says so; later passes
      report any changed, added, or removed quarantine file.
  (c) STATUS-CLAIM SCAN: searches the code of both trees for returned
      status strings containing hard success or verification words
      (VERIFIED, SUCCESSFUL, EXECUTED, COMPLETE). Every hit is listed
      as a REVIEW ITEM for a human. A hit is not a verdict: most are
      legitimate strings a module returns after doing real work, and
      only a human gate can tell which are not. This scan exists
      because the two modules the gate returned in the v6 bundle were
      caught by exactly this smell, by hand.
  (d) RECORD: writes a dated JSON and Markdown review record into
      self-reviews/ inside this tree, and appends any improvement
      ideas to self-reviews/PROPOSALS.md as PROPOSALS. Every proposal
      is marked: requires Allen gate review, never auto-applied.

HARD BOUNDS, enforced by construction:
  * This script never modifies any module file in either tree. Its
    only writes are inside self-reviews/ (records, proposals, and the
    quarantine baseline).
  * It never runs git, never installs anything, and never touches the
    network. Its only subprocess use is running unittest discovery.
  * It issues no verdicts. It produces evidence and proposals for the
    human gate, which is Allen, reporting to Jeffrey.

Stdlib only. Importable, and runnable as a CLI:
  python self_review.py
  python self_review.py --integrated PATH --staged PATH --gate-report PATH
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

SEED_MARKER = "ZINIUM-SEED-ALLEN"
STATUS_WORDS = ("VERIFIED", "SUCCESSFUL", "EXECUTED", "COMPLETE")
_SKIP_DIRS = {"__pycache__", "self-reviews", ".git"}
_PER_DIR_TIMEOUT = 180

_DEFAULT_STAGED = os.path.expanduser(
    "~/workspace/halex-public-data/halex-ai/workspace/gemini/halex-ai-suite")
_DEFAULT_GATE_REPORT = os.path.expanduser(
    "~/workspace/goals/halex-app-review-and-reorg/hidden_files/gemini-modules-10-14-gate-20261029.md")


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _hash_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(65536)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def tree_hashes(root: str, extensions=(".py", ".md", ".json")) -> Dict[str, str]:
    """Map of relative path to sha256 for every matching file under root,
    excluding caches and the self-reviews output folder."""
    result: Dict[str, str] = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in _SKIP_DIRS)
        for name in sorted(filenames):
            if name.endswith(extensions):
                full = os.path.join(dirpath, name)
                result[os.path.relpath(full, root)] = _hash_file(full)
    return result


def _test_locations(root: str) -> List[str]:
    """Every directory under root that directly contains a test_*.py file."""
    locations = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in _SKIP_DIRS)
        if any(name.startswith("test_") and name.endswith(".py") for name in filenames):
            locations.append(dirpath)
    return sorted(locations)


def run_unittest_suite(root: str) -> Dict[str, Any]:
    """Run unittest discovery per test location under root and total the
    results honestly: tests run, and whether the run was clean."""
    locations = _test_locations(root)
    per_location = []
    total_tests = 0
    all_ok = True
    for location in locations:
        try:
            proc = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "-s", ".", "-p", "test_*.py"],
                cwd=location, capture_output=True, text=True, timeout=_PER_DIR_TIMEOUT)
            output = (proc.stderr or "") + (proc.stdout or "")
        except subprocess.TimeoutExpired:
            per_location.append({"location": os.path.relpath(location, root),
                                 "tests": 0, "ok": False, "note": "timeout"})
            all_ok = False
            continue
        match = re.search(r"Ran (\d+) test", output)
        count = int(match.group(1)) if match else 0
        ok = proc.returncode == 0 and "\nOK" in output
        total_tests += count
        all_ok = all_ok and ok
        per_location.append({"location": os.path.relpath(location, root),
                             "tests": count, "ok": ok})
    return {"root": root, "locations": per_location,
            "total_tests": total_tests, "all_ok": all_ok}


def parse_gate_verdict_folders(gate_report_path: str) -> List[str]:
    """Extract the folder names from the gate report's verdict table
    (rows whose second cell is a folder path ending in /)."""
    folders = []
    with open(gate_report_path, "r", encoding="utf-8") as handle:
        for line in handle:
            if not line.startswith("|"):
                continue
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if len(cells) >= 2 and cells[1].endswith("/") and " " not in cells[1]:
                folders.append(cells[1].rstrip("/"))
    return sorted(set(folders))


def drift_scan(staged_root: str, gate_report_path: str, baseline_path: str) -> Dict[str, Any]:
    """Compare the staged tree against the gate verdict table, and check
    quarantine contents against the stored hash baseline."""
    verdict_folders = parse_gate_verdict_folders(gate_report_path)
    on_disk = sorted(
        name for name in os.listdir(staged_root)
        if os.path.isdir(os.path.join(staged_root, name)) and name != "__pycache__")
    named_top_level = {name.split("/")[0] for name in verdict_folders}
    unexpected = [name for name in on_disk if name not in named_top_level and name != "quarantine"]
    # Verdict-table entries may be nested (for example quarantine/<module>):
    # existence is checked on the full relative path, not the top level.
    missing = [name for name in verdict_folders
               if not os.path.isdir(os.path.join(staged_root, *name.split("/")))]

    quarantine_root = os.path.join(staged_root, "quarantine")
    current = tree_hashes(quarantine_root) if os.path.isdir(quarantine_root) else {}
    current = {os.path.join("quarantine", rel): digest for rel, digest in current.items()}
    baseline_created = False
    changed: List[str] = []
    added: List[str] = []
    removed: List[str] = []
    if os.path.isfile(baseline_path):
        with open(baseline_path, "r", encoding="utf-8") as handle:
            baseline = json.load(handle).get("hashes", {})
        changed = sorted(p for p in current if p in baseline and current[p] != baseline[p])
        added = sorted(p for p in current if p not in baseline)
        removed = sorted(p for p in baseline if p not in current)
    else:
        baseline_created = True
        directory = os.path.dirname(os.path.abspath(baseline_path))
        os.makedirs(directory, exist_ok=True)
        with open(baseline_path, "w", encoding="utf-8") as handle:
            handle.write(json.dumps({"created": utcnow(), "hashes": current},
                                    indent=2, sort_keys=True) + "\n")
    return {
        "verdict_table_folders": verdict_folders,
        "on_disk_folders": on_disk,
        "unexpected_folders": unexpected,
        "missing_folders": missing,
        "quarantine_baseline_created_this_pass": baseline_created,
        "quarantine_changed": changed,
        "quarantine_added": added,
        "quarantine_removed": removed,
    }


_STATUS_RE = re.compile(r"[\"']([^\"']*(?:" + "|".join(STATUS_WORDS) + r")[^\"']*)[\"']")


def status_claim_scan(roots: List[str]) -> List[Dict[str, Any]]:
    """Find quoted status strings containing hard success words. Each hit
    is a REVIEW ITEM for a human, never a verdict."""
    items: List[Dict[str, Any]] = []
    self_path = os.path.abspath(__file__)
    for root in roots:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = sorted(d for d in dirnames if d not in _SKIP_DIRS)
            for name in sorted(filenames):
                if not name.endswith(".py"):
                    continue
                full = os.path.join(dirpath, name)
                if os.path.abspath(full) == self_path:
                    continue
                kind = "test" if name.startswith("test_") else "source"
                with open(full, "r", encoding="utf-8", errors="replace") as handle:
                    for lineno, line in enumerate(handle, start=1):
                        for match in _STATUS_RE.finditer(line):
                            items.append({
                                "tree": os.path.basename(os.path.abspath(root)),
                                "file": os.path.relpath(full, root),
                                "line": lineno,
                                "kind": kind,
                                "text": match.group(1)[:120],
                                "note": "REVIEW ITEM for a human gate, not a verdict",
                            })
    return items


def _proposals_from(record: Dict[str, Any]) -> List[str]:
    proposals = []
    drift = record["drift"]
    for name in drift["unexpected_folders"]:
        proposals.append(
            "Staged folder '%s' is on disk but absent from the completed gate report's "
            "verdict table. Confirm whether the follow-on gate has accepted it, and "
            "update the inventory record either way." % name)
    for name in drift["missing_folders"]:
        proposals.append(
            "Folder '%s' is named in the gate verdict table but missing on disk. "
            "Investigate before any push is prepared." % name)
    for path in drift["quarantine_changed"] + drift["quarantine_added"] + drift["quarantine_removed"]:
        proposals.append(
            "Quarantine file changed since baseline: %s. Quarantine is evidence for "
            "returned modules and should normally be untouched; confirm the change "
            "was an authorized gate act." % path)
    for label in ("integrated", "staged"):
        suite = record["tests"][label]
        if not suite["all_ok"]:
            proposals.append(
                "The %s suite did not run fully clean this pass (%d tests). Read the "
                "per-location results in the review record and triage before the "
                "next build step." % (label, suite["total_tests"]))
    source_hits = [item for item in record["status_claim_review_items"] if item["kind"] == "source"]
    if source_hits:
        proposals.append(
            "The status-claim scan flagged %d source-file status strings containing "
            "hard success words. Spot-check the newest ones against behavior, the "
            "way the gate probed Modules 18 and 21." % len(source_hits))
    return proposals


def run_review(integrated_root: str, staged_root: str, gate_report_path: str,
               out_dir: Optional[str] = None) -> Dict[str, Any]:
    """Run one full review pass and write its records. Returns the record."""
    integrated_root = os.path.abspath(integrated_root)
    out_dir = out_dir or os.path.join(integrated_root, "self-reviews")
    os.makedirs(out_dir, exist_ok=True)
    baseline_path = os.path.join(out_dir, "quarantine-baseline.json")

    record: Dict[str, Any] = {
        "review_version": 1,
        "generated": utcnow(),
        "seed_marker": SEED_MARKER,
        "bounds": ("This pass modified no module file in either tree, ran no git, "
                   "installed nothing, and touched no network. Writes are confined "
                   "to the self-reviews folder."),
        "tests": {
            "integrated": run_unittest_suite(integrated_root),
            "staged": run_unittest_suite(staged_root),
        },
        "drift": drift_scan(staged_root, gate_report_path, baseline_path),
        "status_claim_review_items": status_claim_scan([integrated_root, staged_root]),
    }
    record["proposals"] = _proposals_from(record)

    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    json_path = os.path.join(out_dir, "review-%s.json" % day)
    with open(json_path, "w", encoding="utf-8") as handle:
        handle.write(json.dumps(record, indent=2, sort_keys=True) + "\n")

    md_path = os.path.join(out_dir, "review-%s.md" % day)
    with open(md_path, "w", encoding="utf-8") as handle:
        handle.write(_render_markdown(record))

    if record["proposals"]:
        proposals_path = os.path.join(out_dir, "PROPOSALS.md")
        with open(proposals_path, "a", encoding="utf-8") as handle:
            handle.write("\n## %s\n\n" % day)
            for proposal in record["proposals"]:
                handle.write("- PROPOSAL (requires Allen gate review, never "
                             "auto-applied): %s\n" % proposal)
    record["record_files"] = [json_path, md_path]
    return record


def _render_markdown(record: Dict[str, Any]) -> str:
    lines = ["# HALEX-AI Self-Review Record", "",
             "Generated: %s" % record["generated"], "",
             "Bounds: %s" % record["bounds"], "", "## Tests", ""]
    for label in ("integrated", "staged"):
        suite = record["tests"][label]
        lines.append("- %s tree: %d tests, all_ok=%s" % (label, suite["total_tests"], suite["all_ok"]))
        for loc in suite["locations"]:
            lines.append("  - %s: %d tests, ok=%s%s" % (
                loc["location"], loc["tests"], loc["ok"],
                (" (%s)" % loc["note"]) if loc.get("note") else ""))
    drift = record["drift"]
    lines += ["", "## Drift", "",
              "- Unexpected folders on disk: %s" % (", ".join(drift["unexpected_folders"]) or "none"),
              "- Verdict-table folders missing on disk: %s" % (", ".join(drift["missing_folders"]) or "none"),
              "- Quarantine baseline created this pass: %s" % drift["quarantine_baseline_created_this_pass"],
              "- Quarantine changed: %s" % (", ".join(drift["quarantine_changed"]) or "none"),
              "- Quarantine added: %s" % (", ".join(drift["quarantine_added"]) or "none"),
              "- Quarantine removed: %s" % (", ".join(drift["quarantine_removed"]) or "none"),
              "", "## Status-claim review items", "",
              "%d item(s). Each is a REVIEW ITEM for a human gate, not a verdict." % len(record["status_claim_review_items"]), ""]
    for item in record["status_claim_review_items"]:
        lines.append("- [%s] %s:%d (%s): %s" % (
            item["tree"], item["file"], item["line"], item["kind"], item["text"]))
    lines += ["", "## Proposals", ""]
    if record["proposals"]:
        for proposal in record["proposals"]:
            lines.append("- PROPOSAL (requires Allen gate review, never auto-applied): %s" % proposal)
    else:
        lines.append("- None this pass.")
    lines.append("")
    return "\n".join(lines)


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="self_review", description="HALEX-AI gated self-review pass.")
    parser.add_argument("--integrated", default=os.path.dirname(os.path.abspath(__file__)))
    parser.add_argument("--staged", default=_DEFAULT_STAGED)
    parser.add_argument("--gate-report", default=_DEFAULT_GATE_REPORT)
    parser.add_argument("--out", default=None)
    args = parser.parse_args(argv)
    record = run_review(args.integrated, args.staged, args.gate_report, args.out)
    print(json.dumps({
        "status": "REVIEW_COMPLETE",
        "integrated_tests": record["tests"]["integrated"]["total_tests"],
        "integrated_all_ok": record["tests"]["integrated"]["all_ok"],
        "staged_tests": record["tests"]["staged"]["total_tests"],
        "staged_all_ok": record["tests"]["staged"]["all_ok"],
        "drift_items": (len(record["drift"]["unexpected_folders"]) + len(record["drift"]["missing_folders"])
                        + len(record["drift"]["quarantine_changed"]) + len(record["drift"]["quarantine_added"])
                        + len(record["drift"]["quarantine_removed"])),
        "status_claim_review_items": len(record["status_claim_review_items"]),
        "proposals": len(record["proposals"]),
        "records": record["record_files"],
    }, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
