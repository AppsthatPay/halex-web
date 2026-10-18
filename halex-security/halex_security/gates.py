"""Verification gates: UXSS + SHELL.

UXSS gate — cross-content scripting. Anything destined for a WebView, feed
card, or rendered UI passes here first.
SHELL gate — shell/code injection AND prompt injection. Anything that will be
executed, logged-then-acted-on, or fed to an AI passes here first.

verify(text) raises VerificationError listing every hit, or returns True.
"""
import re


class VerificationError(Exception):
    def __init__(self, failures):
        self.failures = failures
        super().__init__("verification failed: " + "; ".join(failures))


UXSS_PATTERNS = [
    (r"<\s*script", "script tag"),
    (r"javascript\s*:", "javascript: URI"),
    (r"on\w+\s*=", "event handler attribute"),
    (r"<\s*iframe", "iframe tag"),
    (r"<\s*object", "object tag"),
    (r"<\s*embed", "embed tag"),
    (r"eval\s*\(", "eval() call"),
    (r"document\s*\.\s*cookie", "cookie access"),
    (r"window\s*\.\s*location", "location hijack"),
    (r"<\s*svg[^>]*on", "svg event handler"),
]

SHELL_PATTERNS = [
    (r"\$\(", "command substitution $("),
    (r"`[^`]+`", "backtick execution"),
    (r";\s*(rm|mv|cp|chmod|chown|dd|mkfs)\b", "destructive shell chaining"),
    (r"curl[^\n]*\|\s*(sh|bash)", "curl-pipe-shell"),
    (r"wget[^\n]*\|\s*(sh|bash)", "wget-pipe-shell"),
    (r"\.\./", "path traversal"),
    (r"__import__\s*\(", "python import hook"),
    (r"os\s*\.\s*system\s*\(", "os.system call"),
    (r"subprocess\s*\.", "subprocess call"),
    (r"powershell\s+-", "powershell invocation"),
]

PROMPT_INJECTION_PATTERNS = [
    (r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", "instruction override"),
    (r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|rules)", "instruction disregard"),
    (r"you\s+are\s+now\s+", "identity override"),
    (r"system\s*:\s*", "fake system prompt"),
    (r"jailbreak", "jailbreak attempt"),
    (r"\bDAN\s+mode\b", "DAN jailbreak mode"),
    (r"reveal\s+(your\s+)?(system\s+)?prompt", "prompt extraction"),
    (r"bypass\s+(the\s+)?(filter|safety|gate|policy)", "safeguard bypass"),
    (r"developer\s+mode\s+enabled", "fake developer mode"),
]


def _scan(text, patterns, gate):
    return [f"{gate}: {label}" for pat, label in patterns
            if re.search(pat, text, re.IGNORECASE)]


def uxss_verify(text):
    """Return list of UXSS failures (empty = clean)."""
    return _scan(text or "", UXSS_PATTERNS, "UXSS")


def shell_verify(text):
    """Return list of SHELL failures incl. prompt injection (empty = clean)."""
    return _scan(text or "", SHELL_PATTERNS + PROMPT_INJECTION_PATTERNS, "SHELL")


def verify(text, gates=("uxss", "shell")):
    """Verify text through the named gates. Returns True or raises."""
    failures = []
    if "uxss" in gates:
        failures += uxss_verify(text)
    if "shell" in gates:
        failures += shell_verify(text)
    if failures:
        raise VerificationError(failures)
    return True
