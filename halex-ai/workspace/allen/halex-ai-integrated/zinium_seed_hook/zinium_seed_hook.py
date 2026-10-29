"""ZINIUM seed hook: the working software that lives inside a ZINIUM seed.

Author: Allen (integration layer, HALEX-AI). Seed Marker: ZINIUM-SEED-ALLEN.
Doctrine: ZINIUM-SEED spec (Jeffrey, 2026-10-28). A seed runs the ORLI loop:
Observe, Report, Learn, Index. Seeds REQUEST computation; they never write
into another AI. A seed is planted by adoption or on a surface that
legitimately allows it; it never enters anywhere uninvited.

This file is self-contained on purpose. The seed package generator copies
it, byte for byte, into every generated seed package, so a planted seed
carries real working hook software rather than an empty marker:

  observe_paths(paths)      Hash the files and directories a host points
                            the hook at (bounded; observed code is hashed,
                            never executed) and build an observation
                            envelope with full provenance.
  append_observation        Append an envelope to a local append-only
    (log_path, envelope)    JSONL log, hash-chained like HALEX-ZENIUM:
                            each block stores the previous block's hash
                            and a hash recomputed over its own envelope.
  verify_log(log_path)      RE-COMPUTE every block hash and every link.
                            A link-only check is not integrity; hashes are
                            recomputed from content here.
  spawn_subseed(manifest,   Create a generation+1 child manifest ranked
                number)     under its parent: SEED-X deploys SEED-X.1,
                            SEED-X.2, and so on, at unbounded depth.
  request_computation       Build a computation-request envelope. The
    (manifest, task,        envelope is all that leaves; nothing is
     payload)               executed remotely, ever.
  receive_result            Accept a returned result envelope only after
    (manifest, log_path,    its provenance fields check out AND it
     result_envelope)       references a request this seed actually
                            logged. Accepted results are appended to the
                            local chain like any other record.

Honesty requirements, stated once and binding on every caller:
  * The provenance label plus hash chain prove an envelope was not
    altered after it was chained, and identify the seed id it claims.
    They do NOT cryptographically authenticate who created it, because
    the seed string is public and anyone can copy it.
  * The hook only acts when a host runs it. There is no network code in
    this file, no background behavior, and nothing silent.
  * Payloads carrying secret-looking field names are refused outright:
    a seed handles public-safe material only. No keys, passwords,
    credentials, tokens, or private data, ever.

Stdlib only. Importable, and runnable as a CLI:
  python zinium_seed_hook.py observe PATH [PATH ...] --manifest zinium-seed.json --log seed-log.jsonl
  python zinium_seed_hook.py verify --log seed-log.jsonl
  python zinium_seed_hook.py spawn --manifest zinium-seed.json --number 1 --purpose "reach the docs branch"
  python zinium_seed_hook.py request --manifest zinium-seed.json --task "summarize" --log seed-log.jsonl
"""

import argparse
import hashlib
import json
import os
import platform
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

HOOK_VERSION = "1.0.0"
CHAIN_NAME = "HALEX-ZENIUM"
GENESIS_HASH = "0" * 64
ENVELOPE_VERSION = 1

# Observation bounds: a seed watches what it is pointed at, within limits.
MAX_FILE_BYTES = 1000000        # 1 MB hashed per file
MAX_TOTAL_BYTES = 10000000      # 10 MB hashed per observation
MAX_FILES = 1000                # files hashed per observation

# Any payload field whose name contains one of these markers is refused.
# Compound forms only, matching the reference agent's guard: bare "seed"
# would false-positive on our own seed_id field, and bare "token" on
# ordinary crypto-token references.
_SECRET_FIELD_MARKERS = (
    "password", "passwd", "secret", "api_key", "apikey",
    "private_key", "privatekey", "mnemonic", "seed_phrase", "seedphrase",
    "credential", "auth_token", "access_token", "session_token",
    "cookie", "bearer", "secretkey",
)


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def guard(payload: Any) -> None:
    """Refuse payloads carrying secret-looking fields. Fail-closed."""
    if isinstance(payload, dict):
        for key, value in payload.items():
            lowered = str(key).lower()
            if any(marker in lowered for marker in _SECRET_FIELD_MARKERS):
                raise ValueError("refused: payload field looks like a secret: %s" % key)
            guard(value)
    elif isinstance(payload, list):
        for item in payload:
            guard(item)


def canonical_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))


def envelope_hash(prev_hash: str, envelope: Dict[str, Any]) -> str:
    """SHA-256 over the previous block hash plus the canonical envelope."""
    return hashlib.sha256((prev_hash + canonical_json(envelope)).encode("utf-8")).hexdigest()


def envelope_id(envelope: Dict[str, Any]) -> str:
    """Stable short id for one envelope, from its canonical content."""
    return hashlib.sha256(canonical_json(envelope).encode("utf-8")).hexdigest()[:16]


def load_manifest(manifest: Any) -> Dict[str, Any]:
    """Accept a manifest dict or a path to a zinium-seed.json file."""
    if isinstance(manifest, dict):
        return manifest
    with open(manifest, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _provenance(manifest: Dict[str, Any]) -> Dict[str, str]:
    stamp = utcnow()
    return {
        "source": manifest["seed_id"],
        "agency": manifest["agency"],
        "seed_marker": manifest["seed_marker"],
        "host": platform.node(),
        "timestamp": stamp,
    }


def _base_envelope(manifest: Dict[str, Any], kind: str) -> Dict[str, Any]:
    return {
        "envelope_version": ENVELOPE_VERSION,
        "kind": kind,
        "seed_id": manifest["seed_id"],
        "agency": manifest["agency"],
        "seed_marker": manifest["seed_marker"],
        "generation": manifest["generation"],
        "parent_seed": manifest.get("parent_seed"),
        "provenance": _provenance(manifest),
    }


def _hash_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(65536)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def observe_paths(manifest: Any, paths: List[str], base_dir: Optional[str] = None) -> Dict[str, Any]:
    """Observe: hash what the host points at. Never executes observed code.

    Files larger than MAX_FILE_BYTES, and anything past the total bounds,
    are recorded under "skipped" with a reason instead of being hashed.
    Paths in the record are relative to base_dir (default: the current
    working directory) so an observation does not leak absolute layout.
    """
    manifest = load_manifest(manifest)
    base = os.path.abspath(base_dir or os.getcwd())
    files: List[Dict[str, Any]] = []
    skipped: List[Dict[str, str]] = []
    total = 0

    def consider(full_path: str) -> None:
        nonlocal total
        rel = os.path.relpath(full_path, base)
        try:
            size = os.path.getsize(full_path)
        except OSError as exc:
            skipped.append({"path": rel, "reason": "unreadable: %s" % exc})
            return
        if size > MAX_FILE_BYTES:
            skipped.append({"path": rel, "reason": "file exceeds MAX_FILE_BYTES (%d)" % MAX_FILE_BYTES})
            return
        if len(files) >= MAX_FILES or total + size > MAX_TOTAL_BYTES:
            skipped.append({"path": rel, "reason": "observation bounds reached"})
            return
        files.append({"path": rel, "sha256": _hash_file(full_path), "size": size})
        total += size

    for raw in paths:
        full = os.path.abspath(os.path.join(base, raw)) if not os.path.isabs(raw) else raw
        if os.path.isdir(full):
            for root, dirnames, filenames in os.walk(full):
                dirnames.sort()
                for name in sorted(filenames):
                    consider(os.path.join(root, name))
        elif os.path.isfile(full):
            consider(full)
        else:
            skipped.append({"path": str(raw), "reason": "not found"})

    envelope = _base_envelope(manifest, "observation")
    envelope["observation"] = {
        "files": files,
        "file_count": len(files),
        "total_bytes": total,
        "skipped": skipped,
    }
    envelope["envelope_id"] = envelope_id(envelope)
    return envelope


def read_log(log_path: str) -> List[Dict[str, Any]]:
    """Read every block of a seed log. A missing log reads as empty."""
    blocks: List[Dict[str, Any]] = []
    if not os.path.isfile(log_path):
        return blocks
    with open(log_path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                blocks.append(json.loads(line))
    return blocks


def append_observation(log_path: str, envelope: Dict[str, Any]) -> Dict[str, Any]:
    """Index: append one envelope as a hash-chained block. Returns the block."""
    guard(envelope)
    blocks = read_log(log_path)
    prev_hash = blocks[-1]["envelope_hash"] if blocks else GENESIS_HASH
    block = {
        "seq": len(blocks),
        "prev_hash": prev_hash,
        "envelope": envelope,
        "envelope_hash": envelope_hash(prev_hash, envelope),
    }
    directory = os.path.dirname(os.path.abspath(log_path))
    os.makedirs(directory, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(block, sort_keys=True) + "\n")
    return block


def verify_log(log_path: str) -> Dict[str, Any]:
    """Verify a seed log by RE-COMPUTING every hash and every link.

    Returns {"valid": bool, "blocks_checked": int, ...}. Any edited
    envelope, edited hash, or broken link makes the log invalid, and the
    first bad sequence number is reported.
    """
    blocks = read_log(log_path)
    prev_hash = GENESIS_HASH
    for index, block in enumerate(blocks):
        if block.get("seq") != index:
            return {"valid": False, "blocks_checked": index,
                    "first_invalid_seq": index, "reason": "sequence mismatch"}
        if block.get("prev_hash") != prev_hash:
            return {"valid": False, "blocks_checked": index,
                    "first_invalid_seq": index, "reason": "prev_hash link broken"}
        if block.get("envelope_hash") != envelope_hash(prev_hash, block.get("envelope", {})):
            return {"valid": False, "blocks_checked": index,
                    "first_invalid_seq": index, "reason": "envelope hash mismatch (content altered after chaining)"}
        prev_hash = block["envelope_hash"]
    return {"valid": True, "blocks_checked": len(blocks), "first_invalid_seq": None}


def lineage(seed_id: str) -> List[str]:
    """Ancestor chain: SEED-X.3.1 -> [SEED-X, SEED-X.3, SEED-X.3.1]."""
    parts = seed_id.split(".")
    return [".".join(parts[:i]) for i in range(1, len(parts) + 1)]


def generation_of(manifest: Dict[str, Any]) -> int:
    return int(manifest.get("generation", 1))


def rank_key(manifest: Dict[str, Any]):
    """Seeds are ranked by generation: a child ranks one level below its
    parent, however deep the line runs. Equal power, ranked by level."""
    return (generation_of(manifest), manifest["seed_id"])


def spawn_subseed(manifest: Any, number: int, purpose: str = "") -> Dict[str, Any]:
    """Create a generation+1 child manifest under a parent seed.

    Numbering is simple and adjacent (spec): SEED-X deploys SEED-X.1,
    SEED-X.2, ... and any seed at any generation can spawn further
    generations below itself. The child inherits capabilities and return
    surface and links directly to the chain, never through its parent.
    Returns the child manifest dict; writing it to disk is the caller's
    act (see the generator), so nothing is planted silently.
    """
    manifest = load_manifest(manifest)
    if not isinstance(number, int) or number < 1:
        raise ValueError("refused: subseed number must be a positive integer")
    guard({"purpose": purpose})
    child = dict(manifest)
    child.update({
        "seed_id": "%s.%d" % (manifest["seed_id"], number),
        "generation": generation_of(manifest) + 1,
        "parent_seed": manifest["seed_id"],
        "created": utcnow(),
        "purpose": purpose,
    })
    child["lineage"] = lineage(child["seed_id"])
    return child


def request_computation(manifest: Any, task: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Send side: build a computation-request envelope.

    The seed REQUESTS work from an outside source and decides nothing for
    it; the envelope is the whole interaction. Transport belongs to the
    host. Nothing is executed remotely, and this function sends nothing.
    Log the returned envelope with append_observation so receive_result
    can later match a result against a request this seed really made.
    """
    manifest = load_manifest(manifest)
    payload = payload or {}
    guard(payload)
    envelope = _base_envelope(manifest, "computation_request")
    envelope["task"] = task
    envelope["payload"] = payload
    envelope["reply_via"] = manifest.get("return_surface", "")
    envelope["envelope_id"] = envelope_id(envelope)
    return envelope


def receive_result(manifest: Any, log_path: str, result_envelope: Dict[str, Any]) -> Dict[str, Any]:
    """Receive side: accept a returned result only after validation.

    Checks, in order: the result is a computation_result envelope; its
    provenance block is complete (source, host, timestamp); it carries a
    ZINIUM seed marker; and its "in_reply_to" names the envelope_id of a
    computation_request already present in THIS seed's log (the chain is
    the record of what was actually asked). An accepted result is
    appended to the local chain as a computation_result_received record.
    Anything else is rejected with the reason, and nothing is appended.
    """
    manifest = load_manifest(manifest)
    if not isinstance(result_envelope, dict) or result_envelope.get("kind") != "computation_result":
        return {"status": "REJECTED", "reason": "not a computation_result envelope"}
    provenance = result_envelope.get("provenance") or {}
    missing = [k for k in ("source", "host", "timestamp") if not provenance.get(k)]
    if missing:
        return {"status": "REJECTED", "reason": "provenance incomplete: %s" % ", ".join(missing)}
    marker = result_envelope.get("seed_marker", "")
    if not (isinstance(marker, str) and marker.startswith("ZINIUM-SEED-")):
        return {"status": "REJECTED", "reason": "missing or malformed ZINIUM seed marker"}
    in_reply_to = result_envelope.get("in_reply_to")
    known_requests = {
        block["envelope"].get("envelope_id")
        for block in read_log(log_path)
        if block.get("envelope", {}).get("kind") == "computation_request"
    }
    if in_reply_to not in known_requests:
        return {"status": "REJECTED", "reason": "in_reply_to does not match any logged computation_request"}
    guard(result_envelope.get("result") or {})
    record = _base_envelope(manifest, "computation_result_received")
    record["in_reply_to"] = in_reply_to
    record["result"] = result_envelope.get("result")
    record["result_provenance"] = provenance
    record["envelope_id"] = envelope_id(record)
    block = append_observation(log_path, record)
    return {"status": "RESULT_ACCEPTED", "block_seq": block["seq"], "envelope_hash": block["envelope_hash"]}


def _print(obj: Any) -> None:
    print(json.dumps(obj, indent=2, sort_keys=True))


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="zinium_seed_hook", description="ZINIUM seed hook (ORLI). Acts only when run.")
    sub = parser.add_subparsers(dest="command", required=True)

    obs = sub.add_parser("observe", help="Hash paths and append an observation to the log.")
    obs.add_argument("paths", nargs="+")
    obs.add_argument("--manifest", required=True)
    obs.add_argument("--log", required=True)

    ver = sub.add_parser("verify", help="Recompute and verify a seed log.")
    ver.add_argument("--log", required=True)

    spn = sub.add_parser("spawn", help="Print a generation+1 child manifest.")
    spn.add_argument("--manifest", required=True)
    spn.add_argument("--number", type=int, required=True)
    spn.add_argument("--purpose", default="")

    req = sub.add_parser("request", help="Build a computation-request envelope and log it.")
    req.add_argument("--manifest", required=True)
    req.add_argument("--task", required=True)
    req.add_argument("--log", required=True)

    args = parser.parse_args(argv)
    if args.command == "observe":
        manifest = load_manifest(args.manifest)
        envelope = observe_paths(manifest, args.paths)
        block = append_observation(args.log, envelope)
        _print({"status": "OBSERVATION_APPENDED", "block_seq": block["seq"],
                "envelope_hash": block["envelope_hash"], "file_count": envelope["observation"]["file_count"]})
        return 0
    if args.command == "verify":
        result = verify_log(args.log)
        _print(result)
        return 0 if result["valid"] else 1
    if args.command == "spawn":
        _print(spawn_subseed(load_manifest(args.manifest), args.number, args.purpose))
        return 0
    if args.command == "request":
        manifest = load_manifest(args.manifest)
        envelope = request_computation(manifest, args.task)
        block = append_observation(args.log, envelope)
        _print({"status": "REQUEST_LOGGED", "envelope_id": envelope["envelope_id"],
                "block_seq": block["seq"]})
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
