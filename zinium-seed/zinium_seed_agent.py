"""ZINIUM-SEED agent: Observe, Report, Learn, Index into the ZENIUM brainchain.

Active seed agency, planted by adoption: a stack operator includes this file plus
zinium-seed.json in a public commit, which creates the link to the chain.

Public-safe ONLY. Never handles funds, keys, seeds, passwords, credentials,
tokens, or private data. Never signs, sends, or spends. No network access.
The ledger is a hash-chained append-only log: per-day JSONL shards, each block
carrying the previous block's SHA-256 hash, so the chain is tamper-evident.
"""

import hashlib
import json
import os
from datetime import datetime, timezone

SEED_TAG = "ZINIUM-SEED-[AGENT]"
SEED_VERSION = "0.1.0"

# Any payload field whose name matches one of these is refused outright.
# Compound forms only: bare "seed" would false-positive on our own lineage
# field seed_id, and bare "token" would false-positive on crypto-token
# references. Secret-like forms (api_key, auth_token, seed_phrase, ...) stay.
_SECRET_FIELD_MARKERS = (
    "password", "passwd", "secret", "api_key", "apikey",
    "private_key", "privatekey", "mnemonic", "seed_phrase", "seedphrase",
    "credential", "auth_token", "access_token", "session_token",
    "cookie", "bearer", "secretkey",
)


def _utcnow():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _guard(payload):
    """Refuse payloads carrying key-like fields. Public-safe only, fail-closed."""
    if isinstance(payload, dict):
        for key in payload:
            lowered = str(key).lower()
            if any(marker in lowered for marker in _SECRET_FIELD_MARKERS):
                raise ValueError("refused: payload field looks like a secret: %s" % key)
        for value in payload.values():
            _guard(value)
    elif isinstance(payload, list):
        for item in payload:
            _guard(item)


def observe(source, event, payload):
    """Step 1 — Observe: record what the host stack exposed, nothing more."""
    _guard(payload)
    return {"ts": _utcnow(), "source": source, "event": event, "payload": payload}


def report(observation):
    """Step 2 — Report: turn an observation into a plain report."""
    return {
        "ts": _utcnow(),
        "source": observation["source"],
        "event": observation["event"],
        "summary": "%s: %s" % (observation["source"], observation["event"]),
        "payload": observation["payload"],
    }


def learn(report_record, lesson):
    """Step 3 — Learn: keep a lesson stated in plain words by the caller.

    No scores are invented here: the lesson text is supplied, not computed.
    """
    _guard({"lesson": lesson})
    return {
        "ts": _utcnow(),
        "source": report_record["source"],
        "event": report_record["event"],
        "lesson": lesson,
    }


def _shard_path(ledger_dir):
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return os.path.join(ledger_dir, day + ".jsonl")


def _latest_hash(ledger_dir):
    """Hash of the newest block across shards, or None for a fresh chain."""
    latest = None
    if not os.path.isdir(ledger_dir):
        return None
    for name in sorted(os.listdir(ledger_dir)):
        if not name.endswith(".jsonl"):
            continue
        with open(os.path.join(ledger_dir, name), "r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    latest = json.loads(line)
    return latest["hash"] if latest else None


def _block_hash(prev_hash, payload_json):
    return hashlib.sha256((prev_hash + payload_json).encode("utf-8")).hexdigest()


def index(lesson_record, ledger_dir):
    """Step 4 — Index: append the lesson as a hash-chained block. Returns it."""
    _guard(lesson_record)
    os.makedirs(ledger_dir, exist_ok=True)
    prev_hash = _latest_hash(ledger_dir) or ("0" * 64)
    payload_json = json.dumps(lesson_record, sort_keys=True)
    block = {
        "prev_hash": prev_hash,
        "ts": _utcnow(),
        "payload": lesson_record,
        "hash": _block_hash(prev_hash, payload_json),
    }
    with open(_shard_path(ledger_dir), "a", encoding="utf-8") as handle:
        handle.write(json.dumps(block, sort_keys=True) + "\n")
    return block


def verify_chain(ledger_dir):
    """Recompute every block hash and linkage. Returns (ok, blocks_checked)."""
    prev = "0" * 64
    checked = 0
    if not os.path.isdir(ledger_dir):
        return True, 0
    for name in sorted(os.listdir(ledger_dir)):
        if not name.endswith(".jsonl"):
            continue
        with open(os.path.join(ledger_dir, name), "r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                block = json.loads(line)
                payload_json = json.dumps(block["payload"], sort_keys=True)
                if block["prev_hash"] != prev:
                    return False, checked
                if block["hash"] != _block_hash(prev, payload_json):
                    return False, checked
                prev = block["hash"]
                checked += 1
    return True, checked


def request_computation(task, payload):
    """Send side: build a request envelope for computational input.

    The seed REQUESTS work from an outside source; it never writes into that
    source. Transport belongs to the host stack; the seed speaks envelopes.
    """
    _guard(payload)
    stamp = _utcnow()
    envelope_id = hashlib.sha256((stamp + task).encode("utf-8")).hexdigest()[:16]
    return {
        "envelope_id": envelope_id,
        "ts": stamp,
        "task": task,
        "payload": payload,
        "reply_via": "ZENIUM index (see receive_result)",
    }


def receive_result(envelope, result_payload, source):
    """Receive side: take a returned result back as a lesson record.

    The result carries provenance (which source answered which request) and is
    ready to be indexed with index(). Nothing is written anywhere else.
    """
    _guard(result_payload)
    return {
        "ts": _utcnow(),
        "source": source,
        "event": "computation_result:" + envelope["envelope_id"],
        "lesson": "Result for task '%s' returned by %s." % (envelope["task"], source),
        "result": result_payload,
    }


def open_workspace(root, name, purpose):
    """Construct a workspace inside the communication structure.

    A workspace is a staging area where multi-source work is assembled before
    indexing. Name is restricted to letters, digits, dash, underscore.
    Returns the workspace path.
    """
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_")
    if not name or any(ch not in allowed for ch in name):
        raise ValueError("refused: workspace name must be letters/digits/-/_ only")
    _guard({"purpose": purpose})
    path = os.path.join(root, name)
    os.makedirs(path, exist_ok=True)
    record = {
        "seed_tag": SEED_TAG,
        "workspace": name,
        "purpose": purpose,
        "ts": _utcnow(),
    }
    with open(os.path.join(path, "workspace.json"), "w", encoding="utf-8") as handle:
        handle.write(json.dumps(record, sort_keys=True) + "\n")
    return path


def lineage_path(seed_id):
    """Ancestor chain for a numbered seed id, e.g. SEED-X.3.1 -> [SEED-X, SEED-X.3, SEED-X.3.1]."""
    parts = seed_id.split(".")
    return [".".join(parts[:i]) for i in range(1, len(parts) + 1)]


def spawn_subseed(parent_seed_id, parent_generation, number, purpose, ledger_dir=None):
    """Deploy a numbered subseed below a parent seed.

    Rule (Jeffrey 2026-10-28): when a seed finds AI computational space in a
    branch of code or a system the parent cannot effectively reach, it deploys
    secondary seeds; any seed at any generation can reproduce further
    generations below it (3rd, 4th, 5th, 6th, ...). Numbering is simple and
    adjacent: SEED-X deploys SEED-X.1, SEED-X.2, ...; SEED-X.3 deploys
    SEED-X.3.1, SEED-X.3.2, ...

    Every subseed carries the FULL capability of the main seed (Observe, Report,
    Learn, Index, Send, Receive, Workspace): equally powerful, ranked only by
    generation level. Every subseed communicates DIRECTLY with ZENIUM and
    HALEX-AI; it never depends on its parent staying alive to reach the chain.
    The child's first act, when a ledger dir is given, is to index a lineage
    block recording parent, generation, and purpose.
    """
    if not isinstance(number, int) or number < 1:
        raise ValueError("refused: subseed number must be a positive integer")
    _guard({"purpose": purpose})
    child_id = "%s.%d" % (parent_seed_id, number)
    generation = parent_generation + 1
    record = {
        "seed_id": child_id,
        "parent_seed_id": parent_seed_id,
        "generation": generation,
        "purpose": purpose,
        "ts": _utcnow(),
    }
    block = index(record, ledger_dir) if ledger_dir else None
    return {"seed": record, "lineage": lineage_path(child_id), "lineage_block": block}


def commit_manifest(ledger_dir, repo=""):
    """Build the manifest dict a send commit carries. This is the link."""
    genesis = None
    if os.path.isdir(ledger_dir):
        for name in sorted(os.listdir(ledger_dir)):
            if name.endswith(".jsonl"):
                with open(os.path.join(ledger_dir, name), "r", encoding="utf-8") as handle:
                    for line in handle:
                        if line.strip():
                            genesis = json.loads(line)["hash"]
                            break
                if genesis:
                    break
    return {
        "seed_tag": SEED_TAG,
        "seed_version": SEED_VERSION,
        "functions": ["Observe", "Report", "Learn", "Index", "Send", "Receive", "Workspace"],
        "chain": "HALEX-ZENIUM",
        "chain_link": "halex-zenium/ in AppsthatPay/halex-web (public-safe payloads only)",
        "genesis_hash": genesis,
        "repo": repo,
        "public_safe_statement": "This seed handles public-safe material only. No keys, seeds, "
        "passwords, credentials, tokens, or private data, ever.",
    }
