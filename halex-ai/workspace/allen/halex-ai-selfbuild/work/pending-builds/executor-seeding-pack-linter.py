#!/usr/bin/env python3
"""Pack linter executor (staging, H2 Builder + H4 Guard).

Checks a registry-pattern pack JSON file:
  - top level is an object with a "packs" list, or a single pack
    object with "id" and "entries";
  - every pack has a non-empty id and a non-empty entries list;
  - every entry has a title, a body or summary, a source or docs
    link, and an identifier: an id (registry pattern, as in the
    library packs) or a non-empty patterns list (page-pack pattern).

Usage: python3 executor-seeding-pack-linter.py <pack-json>
Exit 0 when the file lints clean; exit 1 with a failure list otherwise.
Reads only the file named on the command line. No network use.
"""

import json
import sys
from pathlib import Path


def lint_pack(pack, where, failures):
    if not isinstance(pack, dict):
        failures.append("%s: pack is not an object" % where)
        return
    pid = pack.get("id")
    if not isinstance(pid, str) or not pid.strip():
        failures.append("%s: missing or empty pack id" % where)
    entries = pack.get("entries")
    if not isinstance(entries, list) or not entries:
        failures.append("%s: missing or empty entries" % where)
        return
    for i, entry in enumerate(entries):
        loc = "%s entry %d" % (where, i)
        if not isinstance(entry, dict):
            failures.append("%s: entry is not an object" % loc)
            continue
        patterns = entry.get("patterns")
        entry_id = entry.get("id")
        has_identifier = (isinstance(entry_id, str) and entry_id.strip()) \
            or (isinstance(patterns, list) and patterns and
                all(isinstance(p, str) and p.strip() for p in patterns))
        if not has_identifier:
            failures.append("%s: missing id and patterns" % loc)
        if not isinstance(entry.get("title"), str) or \
                not entry.get("title", "").strip():
            failures.append("%s: missing or empty title" % loc)
        body = entry.get("body") or entry.get("summary")
        if not isinstance(body, str) or not body.strip():
            failures.append("%s: missing or empty body/summary" % loc)
        source = entry.get("source") or entry.get("docs") or \
            entry.get("sources")
        if source is None or source == "" or source == []:
            failures.append("%s: missing source/docs" % loc)


def main(argv):
    if len(argv) != 2:
        print("usage: pack-linter.py <pack-json>")
        return 2
    path = Path(argv[1])
    if not path.is_file():
        print("FAIL: not a file: %s" % path)
        return 1
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, OSError) as exc:
        print("FAIL: unreadable JSON: %s" % exc)
        return 1
    failures = []
    if isinstance(data, dict) and isinstance(data.get("packs"), list):
        if not data["packs"]:
            failures.append("top level: empty packs list")
        for i, pack in enumerate(data["packs"]):
            lint_pack(pack, "packs[%d]" % i, failures)
    elif isinstance(data, dict) and "entries" in data:
        lint_pack(data, "pack", failures)
    else:
        failures.append("top level: neither a packs list nor a single pack")
    if failures:
        for failure in failures:
            print("FAIL: %s" % failure)
        print("LINT %d failure(s)" % len(failures))
        return 1
    print("LINT OK: %s" % path)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
