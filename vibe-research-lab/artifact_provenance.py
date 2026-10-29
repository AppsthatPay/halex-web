"""Vibe-research-lab: versioned research artifact provenance, adapted from Vibe-Trading.

Vibe sources:
  agent/backtest/run_card.py -- write_run_card, _json_hash, _file_hash,
    _metric_citations (a metric is cited only where the saved output agrees)
  agent/src/skills/strategy-dev-manager -- sdm_register / sdm_status:
    an artifact carries its bench history and its status lifecycle.

Adaptation:
  - No backtest engine, no run_dir. An artifact here is a CLAIM about a
    paper history: e.g. "allen2-base momentum, Sharpe X over Y trades".
  - Every artifact records: data source (exact DB path + query fingerprint),
    date range (first/last exit_ts actually used), benchmark (what it was
    compared against, or "none"), code version (sha256 of the module file
    that produced the number), and the metric values themselves.
  - The sha256 lets a later reader verify that the number came from the
    stated inputs. If the inputs changed, the hash will not match and the
    artifact is reported as UNVERIFIED, not silently updated.
  - This is a NEW log format (JSONL, one artifact per line, in this
    directory's test_output/ or a caller-supplied path). It does NOT replace
    or rewrite any existing brain, bridge, or daily log.

A claimed Sharpe with no artifact record is, for our purposes, unproven.
An artifact record does not authorise a trade.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def sha256_json(value):
    payload = json.dumps(value, sort_keys=True, default=str,
                         separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def utc_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def make_artifact(name, data_source, query, first_exit_ts, last_exit_ts,
                  benchmark, code_path, metrics, notes=""):
    """Build one artifact dict. `code_path` is hashed, never executed."""
    code_hash = None
    if code_path:
        try:
            code_hash = sha256_file(str(code_path))
        except OSError:
            code_hash = None
    content = {
        "name": name,
        "data_source": str(data_source),
        "query": query,
        "first_exit_ts": first_exit_ts,
        "last_exit_ts": last_exit_ts,
        "benchmark": benchmark,
        "code_path": str(code_path) if code_path else None,
        "code_sha256": code_hash,
        "metrics": metrics,
        "notes": notes,
    }
    content["provenance_sha256"] = sha256_json(content)
    content["created_utc"] = utc_now()
    content["version"] = 1
    return content


def append_artifact(artifact, log_path):
    """Append one artifact to a JSONL log. Creates parent dirs."""
    log_path = Path(log_path)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(artifact, sort_keys=True, default=str) + "\n")
    return str(log_path)


def load_artifacts(log_path):
    artifacts = []
    path = Path(log_path)
    if not path.exists():
        return artifacts
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                artifacts.append(json.loads(line))
    return artifacts


def verify_artifact(artifact):
    """Recompute the provenance hash and report verified / unverified.

    A hash mismatch means the recorded content was edited after creation,
    or the record is not the one that produced the claim. It does not
    prove the underlying strategy is good, only that the record is intact.
    """
    stored = artifact.get("provenance_sha256")
    check = {k: v for k, v in artifact.items()
             if k not in ("provenance_sha256", "created_utc", "version")}
    recomputed = sha256_json(check)
    return {
        "name": artifact.get("name"),
        "stored_sha256": stored,
        "recomputed_sha256": recomputed,
        "verified": stored == recomputed,
        "code_sha256": artifact.get("code_sha256"),
    }


def render_markdown(artifact):
    """A short, human-readable card for one artifact."""
    metrics = artifact.get("metrics") or {}
    lines = [
        f"# Research artifact: {artifact.get('name')}",
        "",
        f"- Created: {artifact.get('created_utc')}",
        f"- Data source: {artifact.get('data_source')}",
        f"- Date range (exit_ts): {artifact.get('first_exit_ts')} to {artifact.get('last_exit_ts')}",
        f"- Benchmark: {artifact.get('benchmark')}",
        f"- Code: {artifact.get('code_path')} (sha256 {artifact.get('code_sha256')})",
        f"- Provenance sha256: {artifact.get('provenance_sha256')}",
        f"- Verified (hash recomputed): {verify_artifact(artifact)['verified']}",
        "",
        "## Metrics",
        "",
    ]
    for key, value in metrics.items():
        lines.append(f"- {key}: {value}")
    if artifact.get("notes"):
        lines += ["", f"Notes: {artifact['notes']}"]
    lines += ["", "Advisory only. This card does not authorise a trade."]
    return "\n".join(lines) + "\n"
