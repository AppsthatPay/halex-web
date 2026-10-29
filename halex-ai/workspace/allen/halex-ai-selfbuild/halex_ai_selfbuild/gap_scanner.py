"""REAL dynamic gap detection.

Reads actual inputs:
  (a) a module inventory: .py files under a root directory and their
      corresponding test files,
  (b) test results: test files are actually executed in a subprocess,
  (c) a quarantine/backlog directory of .md / .json records.

Detected conditions (nothing is hardcoded by name):
  UNTESTED_MODULE   a module with no test file anywhere under the root
  FAILING_TEST      a module whose test file exits non-zero when run
  OPEN_BACKLOG      a backlog record marked open
  UNVERIFIED_CLAIM  a module containing claim words (EXECUTED, VERIFIED,
                    DISPATCHED, FORAGED, SYNTHESIZED) with no filesystem or
                    log evidence configured for that module (or configured
                    evidence paths that do not exist / are empty)

Output: a ranked list of gap dicts:
  {kind, target, evidence, severity, suggested_spec}
sorted by severity descending, then target.

``suggested_spec`` is a synthesis spec dict ONLY when the gap itself carries
one (a backlog record with a "spec" object). Other gaps carry an action dict
such as {"action": "write_tests", ...}, which the synthesizer will refuse:
that refusal is by design, so a scanner can never smuggle arbitrary work
into the builder.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

CLAIM_WORDS = ["EXECUTED", "VERIFIED", "DISPATCHED", "FORAGED", "SYNTHESIZED"]

SEVERITY = {
    "FAILING_TEST": 90,
    "UNVERIFIED_CLAIM": 80,
    "OPEN_BACKLOG": 60,
    "UNTESTED_MODULE": 50,
}


def find_modules(root):
    root = Path(root)
    modules = []
    if not root.exists():
        return modules
    for path in sorted(root.rglob("*.py")):
        if "__pycache__" in path.parts:
            continue
        name = path.name
        if name == "__init__.py" or name.startswith("test_") or name.endswith("_test.py"):
            continue
        modules.append(path)
    return modules


def find_test_for_module(root, module_path):
    stem = module_path.stem
    candidates = [f"test_{stem}.py", f"{stem}_test.py"]
    root = Path(root)
    for cand in candidates:
        for hit in sorted(root.rglob(cand)):
            if "__pycache__" not in hit.parts:
                return hit
    return None


def run_test_file(test_path, cwd, timeout=60):
    """Run a test file as a script. Returns (passed, combined_output)."""
    try:
        proc = subprocess.run(
            [sys.executable, str(test_path)],
            capture_output=True,
            text=True,
            cwd=str(cwd),
            timeout=timeout,
        )
        return proc.returncode == 0, (proc.stdout + proc.stderr)
    except subprocess.TimeoutExpired as exc:
        return False, f"TIMEOUT after {timeout}s: {exc}"
    except OSError as exc:
        return False, f"OSERROR: {exc}"


def _claim_evidence_ok(evidence_config, stem):
    """evidence_config: {module_stem: [path, ...]} — evidence counts only if
    at least one configured path exists and is non-empty."""
    if not evidence_config:
        return False
    paths = evidence_config.get(stem)
    if not paths:
        return False
    for raw in paths:
        p = Path(raw)
        if p.is_file() and p.stat().st_size > 0:
            return True
        if p.is_dir() and any(p.iterdir()):
            return True
    return False


def _scan_backlog(backlog_dir):
    gaps = []
    if not backlog_dir:
        return gaps
    bdir = Path(backlog_dir).resolve()
    if not bdir.exists():
        return gaps
    for path in sorted(bdir.rglob("*")):
        if not path.is_file() or "__pycache__" in path.parts:
            continue
        if path.suffix == ".json":
            try:
                record = json.loads(path.read_text(encoding="utf-8"))
            except (ValueError, OSError):
                continue
            if not isinstance(record, dict):
                continue
            status = str(record.get("status", record.get("state", ""))).lower()
            if status != "open":
                continue
            target = str(record.get("target") or record.get("name") or path.stem)
            spec = record.get("spec") if isinstance(record.get("spec"), dict) else None
            gaps.append({
                "kind": "OPEN_BACKLOG",
                "target": target,
                "evidence": f"backlog record {path} has status=open",
                "severity": SEVERITY["OPEN_BACKLOG"],
                "suggested_spec": spec,
            })
        elif path.suffix in (".md", ".txt"):
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            if re.search(r"status\s*:\s*open", text, flags=re.IGNORECASE):
                heading = next(
                    (ln.strip("# ").strip() for ln in text.splitlines() if ln.startswith("#")),
                    path.stem,
                )
                gaps.append({
                    "kind": "OPEN_BACKLOG",
                    "target": heading or path.stem,
                    "evidence": f"backlog record {path} contains 'status: open'",
                    "severity": SEVERITY["OPEN_BACKLOG"],
                    "suggested_spec": None,
                })
    return gaps


def scan(root, backlog_dir=None, evidence_config=None, run_tests=True, timeout=60):
    """Scan ``root`` (and optional backlog dir) and return a ranked GapReport
    (a plain list of gap dicts, highest severity first)."""
    # Resolve to absolute paths: test files are executed with cwd=root, so
    # a relative test path would resolve against the wrong directory.
    root = Path(root).resolve()
    gaps = []
    # Claim words appear as tokens inside SNAKE_CASE status strings
    # (e.g. MEDIA_OPERATION_DISPATCHED), where "_" is a word character and
    # \b would never match. Token boundaries here are "not an uppercase
    # letter", so underscores and other punctuation act as separators.
    claim_re = re.compile(r"(?<![A-Z])(" + "|".join(CLAIM_WORDS) + r")(?![A-Z])")

    for module in find_modules(root):
        stem = module.stem
        test_path = find_test_for_module(root, module)

        if test_path is None:
            gaps.append({
                "kind": "UNTESTED_MODULE",
                "target": stem,
                "evidence": f"module {module} has no test_{stem}.py / {stem}_test.py under {root}",
                "severity": SEVERITY["UNTESTED_MODULE"],
                "suggested_spec": {"action": "write_tests", "module": stem},
            })
        elif run_tests:
            passed, output = run_test_file(test_path, cwd=root, timeout=timeout)
            if not passed:
                tail = "\n".join(output.strip().splitlines()[-5:])
                gaps.append({
                    "kind": "FAILING_TEST",
                    "target": stem,
                    "evidence": f"test file {test_path} exited non-zero. Tail: {tail}",
                    "severity": SEVERITY["FAILING_TEST"],
                    "suggested_spec": {"action": "fix_failing_test", "module": stem,
                                       "test_file": str(test_path)},
                })

        try:
            text = module.read_text(encoding="utf-8", errors="replace")
        except OSError:
            text = ""
        found_claims = sorted(set(claim_re.findall(text)))
        if found_claims and not _claim_evidence_ok(evidence_config, stem):
            first_line = ""
            for line in text.splitlines():
                if claim_re.search(line):
                    first_line = line.strip()
                    break
            gaps.append({
                "kind": "UNVERIFIED_CLAIM",
                "target": stem,
                "evidence": (
                    f"module {module} contains claim word(s) {found_claims} "
                    f"(first: {first_line!r}) and no existing evidence path is "
                    f"configured for '{stem}'"
                ),
                "severity": SEVERITY["UNVERIFIED_CLAIM"],
                "suggested_spec": {"action": "verify_claim", "module": stem,
                                   "claims": found_claims},
            })

    gaps.extend(_scan_backlog(backlog_dir))
    gaps.sort(key=lambda g: (-g["severity"], g["kind"], g["target"]))
    return gaps
