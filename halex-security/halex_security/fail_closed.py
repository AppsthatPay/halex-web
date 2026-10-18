"""Fail-closed multi-gate.

Some actions need N independent arms before they run (e.g. live trading
needs: user override + key file present + armed flag). If ANY arm is
missing, the action refuses — no partial arming, no silent skips.

    gate = TripleGate("live_trade", ["user_override", "key_file", "armed_flag"])
    gate.arm("user_override")
    gate.execute(do_trade)  # raises NotArmed — 2 arms missing
"""
from .audit import AuditLog


class NotArmed(Exception):
    pass


class TripleGate:
    def __init__(self, name, arms, audit: AuditLog | None = None):
        if len(set(arms)) < 2:
            raise ValueError("need at least 2 distinct arms")
        self.name = name
        self.required = set(arms)
        self.armed = set()
        self.audit = audit

    def arm(self, arm):
        if arm not in self.required:
            raise ValueError(f"unknown arm '{arm}' for gate '{self.name}'")
        self.armed.add(arm)

    def disarm(self, arm=None):
        if arm is None:
            self.armed.clear()
        else:
            self.armed.discard(arm)

    def is_armed(self):
        return self.required <= self.armed

    def missing(self):
        return sorted(self.required - self.armed)

    def execute(self, fn, *args, **kwargs):
        if not self.is_armed():
            missing = self.missing()
            if self.audit:
                self.audit.record("gate_denied",
                                  {"gate": self.name, "missing": missing})
            raise NotArmed(
                f"gate '{self.name}' missing arms: {', '.join(missing)}")
        return fn(*args, **kwargs)
