"""Append-only audit log for security decisions.

Every denied AI-socket action, every quarantined proposal, every gate trip
lands here. The log is append-only: no edits, no deletes. If the log can't
be written, the action that wanted logging is refused (fail-closed).
"""
import json
import os
import time


class AuditLog:
    def __init__(self, path):
        self.path = os.path.expanduser(path)
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)

    def record(self, kind, detail):
        entry = {"ts": time.time(), "kind": kind, "detail": detail}
        try:
            with open(self.path, "a") as f:
                f.write(json.dumps(entry) + "\n")
        except OSError as e:
            raise RuntimeError(f"audit log unwritable — refusing action: {e}")

    def read(self, kind=None, limit=100):
        out = []
        if not os.path.isfile(self.path):
            return out
        with open(self.path) as f:
            for line in f:
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if kind is None or e.get("kind") == kind:
                    out.append(e)
        return out[-limit:]
