"""Safe secret handling.

Rules:
- Secret VALUES never appear in logs, errors, or prompts — use redact().
- Secrets live in files with 600 permissions, loaded via SecretRef.
- A SecretRef carries the NAME and PATH, never the value. The value is only
  materialized at the exact call site that needs it, and never stored.
"""
import os
import re

# Heuristic patterns for accidental secret leakage in log text.
_REDACT_PATTERNS = [
    (re.compile(r"(api[_-]?key\s*[:=]\s*)(['\"]?)[A-Za-z0-9_\-]{8,}\2", re.I), r"\1[REDACTED]"),
    (re.compile(r"(secret\s*[:=]\s*)(['\"]?)[A-Za-z0-9_\-]{8,}\2", re.I), r"\1[REDACTED]"),
    (re.compile(r"(bearer\s+)[A-Za-z0-9_\-\.]{8,}", re.I), r"\1[REDACTED]"),
    (re.compile(r"(password\s*[:=]\s*)(['\"]?)[^'\"\s]{4,}\2", re.I), r"\1[REDACTED]"),
    (re.compile(r"\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b"), "[REDACTED_ADDRESS]"),
]


def redact(text):
    """Return text with probable secret values redacted. For logs only —
    redaction is a safety net, not a license to log secrets."""
    out = text or ""
    for pat, repl in _REDACT_PATTERNS:
        out = pat.sub(repl, out)
    return out


class SecretRef:
    """A reference to a secret file. Holds name + path, never the value."""

    def __init__(self, name, path):
        self.name = name
        self.path = os.path.expanduser(path)

    def exists(self):
        return os.path.isfile(self.path)

    def load(self):
        """Materialize the value at the call site. Caller must not log it."""
        if not self.exists():
            raise FileNotFoundError(f"secret '{self.name}' not found")
        st = os.stat(self.path)
        if st.st_mode & 0o077:
            raise PermissionError(
                f"secret '{self.name}' has loose permissions "
                f"({oct(st.st_mode & 0o777)}); require 600")
        with open(self.path) as f:
            return f.read().strip()

    def __repr__(self):
        return f"SecretRef({self.name!r}, path={self.path!r})"  # value never shown
