#!/usr/bin/env python3
"""Queue-entry validator executor (staging, H2 Builder + H4 Guard).

Checks one queue JSON file (or, with --all, every file in a queue
directory) against the queue contract:
  - id is a non-empty string and matches the file stem;
  - priority is an integer in 0..100;
  - kind is "knowledge" or "module";
  - gate_status is "pending", "gated", or "done";
  - notes is a non-empty string.

Usage:
  python3 executor-seeding-queue-validator.py <entry-json>
  python3 executor-seeding-queue-validator.py --all <queue-dir>
Exit 0 when every checked file validates; exit 1 otherwise.
Reads only the named files. No network use.
"""

import json
import sys
from pathlib import Path

KINDS = ("knowledge", "module")
STATUSES = ("pending", "gated", "done")


def validate(path):
    failures = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, OSError) as exc:
        return ["unreadable JSON: %s" % exc]
    if not isinstance(data, dict):
        return ["top level is not an object"]
    entry_id = data.get("id")
    if not isinstance(entry_id, str) or not entry_id.strip():
        failures.append("missing or empty id")
    elif entry_id != path.stem:
        failures.append("id %r does not match file stem %r"
                        % (entry_id, path.stem))
    priority = data.get("priority")
    if not isinstance(priority, int) or isinstance(priority, bool) \
            or not 0 <= priority <= 100:
        failures.append("priority not an integer in 0..100: %r" % (priority,))
    if data.get("kind") not in KINDS:
        failures.append("kind not in %s: %r" % (KINDS, data.get("kind")))
    if data.get("gate_status") not in STATUSES:
        failures.append("gate_status not in %s: %r"
                        % (STATUSES, data.get("gate_status")))
    notes = data.get("notes")
    if not isinstance(notes, str) or not notes.strip():
        failures.append("missing or empty notes")
    return failures


def main(argv):
    if len(argv) == 2:
        targets = [Path(argv[1])]
    elif len(argv) == 3 and argv[1] == "--all":
        queue_dir = Path(argv[2])
        if not queue_dir.is_dir():
            print("FAIL: not a directory: %s" % queue_dir)
            return 1
        targets = sorted(queue_dir.glob("*.json"))
    else:
        print("usage: queue-validator.py <entry-json> | --all <queue-dir>")
        return 2
    total_failures = 0
    for target in targets:
        failures = validate(target)
        if failures:
            total_failures += len(failures)
            for failure in failures:
                print("FAIL: %s: %s" % (target.name, failure))
        else:
            print("OK: %s" % target.name)
    print("VALIDATED %d file(s), %d failure(s)"
          % (len(targets), total_failures))
    return 1 if total_failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
