"""HALEX Security — software security system for the HALEX app.

Installs with the HALEX app (server side via pip, Android via the Kotlin
module in ./android). What it enforces:

  gates      — UXSS + SHELL verification on any untrusted text/data.
  ai_socket  — the hardwired-software principle as code: AI may WIRE and
               OPERATE, never MODIFY or ADMIN.
  secrets    — safe secret handling: never log values, 600-perm files.
  audit      — append-only security decision log.
  fail_closed— generic triple-gate: N arms required before an action runs.

Nothing here phones home. No network calls. Pure policy + verification.
"""
from .gates import verify, uxss_verify, shell_verify, VerificationError
from .ai_socket import AiSocketPolicy, Action, ActionClass, PolicyDenied
from .secrets import redact, SecretRef
from .audit import AuditLog
from .fail_closed import TripleGate, NotArmed

__version__ = "1.0.0"
__all__ = ["verify", "uxss_verify", "shell_verify", "VerificationError",
           "AiSocketPolicy", "Action", "ActionClass", "PolicyDenied",
           "redact", "SecretRef", "AuditLog", "TripleGate", "NotArmed"]
