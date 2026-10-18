"""AI socket policy — the hardwired-software principle, as code.

The app and its libraries are HARDWIRED: fixed, immutable. An AI connected
through the socket may WIRE (connect APIs, deploy, configure) and OPERATE
(read, query, serve the user) — it may NEVER modify, add to, or destroy the
app or its libraries, and never touch security admin.

Electrician, not architect. Firmware model.

    policy = AiSocketPolicy()
    policy.check(Action(ActionClass.WIRE, "connect_api", {"api": "codex"}))  # ok
    policy.check(Action(ActionClass.MODIFY, "edit_code"))  # raises PolicyDenied
"""
from dataclasses import dataclass, field
from enum import Enum, auto


class ActionClass(Enum):
    WIRE = auto()     # connect APIs, deploy, configure — allowed
    OPERATE = auto()  # read, query, serve user, run approved flows — allowed
    MODIFY = auto()   # edit/add/delete app code or libraries — DENIED
    ADMIN = auto()    # rotate credentials, lift lockdowns, approve releases,
                      # weaken security — DENIED


@dataclass(frozen=True)
class Action:
    cls: ActionClass
    name: str
    detail: dict = field(default_factory=dict)


class PolicyDenied(Exception):
    def __init__(self, action, reason):
        self.action = action
        super().__init__(f"AI socket denied {action.cls.name}:{action.name} — {reason}")


# Explicit allowlist. Anything not listed here is denied (fail-closed).
_ALLOWED = {
    # WIRE — the electrician's work
    "connect_api", "disconnect_api", "deploy", "configure", "publish_feed",
    # OPERATE — serving the user
    "read", "query", "serve", "sign_request", "notify",
}


class AiSocketPolicy:
    """Enforces read-and-run. Construct once, share everywhere."""

    def __init__(self, audit=None):
        self.audit = audit

    def check(self, action: Action) -> bool:
        if action.cls in (ActionClass.MODIFY, ActionClass.ADMIN):
            reason = ("hardwired software: AI may wire and operate, "
                      "never modify or administer")
            self._log(action, False, reason)
            raise PolicyDenied(action, reason)
        if action.name not in _ALLOWED:
            reason = f"action '{action.name}' not on the AI socket allowlist"
            self._log(action, False, reason)
            raise PolicyDenied(action, reason)
        self._log(action, True, "allowed")
        return True

    def _log(self, action, allowed, reason):
        if self.audit is not None:
            self.audit.record(
                "ai_socket",
                {"action": f"{action.cls.name}:{action.name}",
                 "allowed": allowed, "reason": reason,
                 "detail": action.detail})
