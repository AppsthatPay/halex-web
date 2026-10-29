"""Hash-chained sealing, ZINIUM-style.

Append-only JSONL log. Each entry carries:
  seq, timestamp, provenance, payload, prev_hash, entry_hash
where entry_hash = SHA-256 over the canonical JSON of the other fields.

What this proves: an entry was not altered after it was chained (any edit
breaks its hash and every later link). What it does NOT prove: cryptographic
authorship. The provenance string (e.g. "ZINIUM-SEED-ALLEN") is a public
label, not a signature; anyone can write that string.
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

GENESIS_HASH = "GENESIS"


def _canonical(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def compute_entry_hash(seq, timestamp, provenance, payload, prev_hash) -> str:
    body = {
        "seq": seq,
        "timestamp": timestamp,
        "provenance": provenance,
        "payload": payload,
        "prev_hash": prev_hash,
    }
    return hashlib.sha256(_canonical(body).encode("utf-8")).hexdigest()


def read_entries(log_path):
    p = Path(log_path)
    if not p.exists():
        return []
    entries = []
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            entries.append(json.loads(line))
    return entries


def append_entry(log_path, payload, provenance, timestamp=None):
    """Append one entry to the chain and return the full entry dict."""
    p = Path(log_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    entries = read_entries(p)
    seq = len(entries)
    prev_hash = entries[-1]["entry_hash"] if entries else GENESIS_HASH
    ts = timestamp or datetime.now(timezone.utc).isoformat()
    entry_hash = compute_entry_hash(seq, ts, provenance, payload, prev_hash)
    entry = {
        "seq": seq,
        "timestamp": ts,
        "provenance": provenance,
        "payload": payload,
        "prev_hash": prev_hash,
        "entry_hash": entry_hash,
    }
    with p.open("a", encoding="utf-8") as fh:
        fh.write(_canonical(entry) + "\n")
    return entry


def verify_chain(log_path):
    """Recompute every hash and every link.

    Returns (ok: bool, errors: list[str], count: int).
    Detects payload edits, hash edits, entry deletion/reordering (via
    seq + prev_hash linkage).
    """
    entries = read_entries(log_path)
    errors = []
    prev_hash = GENESIS_HASH
    for i, entry in enumerate(entries):
        if entry.get("seq") != i:
            errors.append(f"entry {i}: seq is {entry.get('seq')!r}, expected {i}")
        if entry.get("prev_hash") != prev_hash:
            errors.append(f"entry {i}: prev_hash does not match previous entry_hash")
        expected = compute_entry_hash(
            entry.get("seq"),
            entry.get("timestamp"),
            entry.get("provenance"),
            entry.get("payload"),
            entry.get("prev_hash"),
        )
        if entry.get("entry_hash") != expected:
            errors.append(f"entry {i}: entry_hash mismatch (content altered after chaining)")
        prev_hash = entry.get("entry_hash")
    return (len(errors) == 0, errors, len(entries))
