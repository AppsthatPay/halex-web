"""REAL foraging over LOCAL MIRRORS of public repositories.

Offline by design: an operator-side process keeps local mirrors current;
this module never reaches out to any network. It walks the mirror
directories it is given, extracts indexable items, and appends ORLI
envelopes (Observe / Report / Learn / Index) to the seal chain.

Indexable items:
  - Markdown/text headings (lines starting with '#')
  - Python function and class names, extracted with ast.parse ONLY.
    Code from a mirror is never executed, never imported.
  - License file presence (LICENSE* files)

Dedupe is by content hash checked against the existing seal chain, so
re-running over an unchanged mirror adds zero entries.
"""

import ast
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from . import seal

SKIP_DIRS = {"__pycache__", ".git", ".hg", ".svn", "node_modules"}
MAX_FILE_BYTES = 1_000_000
TEXT_SUFFIXES = {".md", ".rst", ".txt"}


def _item_hash(item):
    canonical = json.dumps(item, sort_keys=True, separators=(",", ":"),
                           ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def extract_items(mirror_root):
    """Yield item dicts from one mirror directory. Pure reads + ast.parse."""
    root = Path(mirror_root)
    items = []
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if not path.is_file():
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                continue
        except OSError:
            continue
        rel = str(path.relative_to(root))

        if path.name.upper().startswith("LICENSE"):
            items.append({"kind": "license", "content": path.name,
                          "source_rel": rel})
            continue

        if path.suffix == ".py":
            try:
                tree = ast.parse(path.read_text(encoding="utf-8", errors="replace"))
            except (SyntaxError, ValueError):
                continue
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    items.append({"kind": "function", "content": node.name,
                                  "source_rel": rel})
                elif isinstance(node, ast.ClassDef):
                    items.append({"kind": "class", "content": node.name,
                                  "source_rel": rel})
        elif path.suffix in TEXT_SUFFIXES:
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for line in text.splitlines():
                stripped = line.strip()
                if stripped.startswith("#"):
                    heading = stripped.lstrip("#").strip()
                    if heading:
                        items.append({"kind": "heading", "content": heading,
                                      "source_rel": rel})
    return items


def _existing_hashes(log_path):
    hashes = set()
    for entry in seal.read_entries(log_path):
        payload = entry.get("payload") or {}
        item_hash = payload.get("item_hash")
        if item_hash:
            hashes.add(item_hash)
    return hashes


def forage(mirror_paths, seal_log_path, provenance="ZINIUM-SEED-ALLEN",
           host_label="local-mirror"):
    """Index new items from each mirror into the seal chain.

    Returns {indexed, skipped_duplicates, missing, items} where items are
    the ORLI envelopes appended this run.
    """
    seal_log_path = Path(seal_log_path).resolve()
    seen = _existing_hashes(seal_log_path)
    result = {"indexed": 0, "skipped_duplicates": 0, "missing": [], "items": []}

    for mirror in mirror_paths or []:
        root = Path(mirror).resolve()
        if not root.is_dir():
            result["missing"].append(str(mirror))
            continue
        for item in extract_items(root):
            full_item = dict(item)
            full_item["source_path"] = str(root / item["source_rel"])
            digest = _item_hash(full_item)
            if digest in seen:
                result["skipped_duplicates"] += 1
                continue
            seen.add(digest)
            envelope = {
                "observe": f"file {full_item['source_path']} in mirror {root}",
                "report": f"{item['kind']}: {item['content']}",
                "learn": f"mirror {root} contains a {item['kind']} "
                         f"named {item['content']!r}",
                "index": digest,
            }
            payload = {
                "event": "forage_index",
                "orli": envelope,
                "item": full_item,
                "item_hash": digest,
                "provenance_detail": {
                    "source_path": full_item["source_path"],
                    "mirror": str(root),
                    "host": host_label,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            }
            entry = seal.append_entry(seal_log_path, payload, provenance)
            result["indexed"] += 1
            result["items"].append({"orli": envelope, "item": full_item,
                                    "entry_hash": entry["entry_hash"]})
    return result
