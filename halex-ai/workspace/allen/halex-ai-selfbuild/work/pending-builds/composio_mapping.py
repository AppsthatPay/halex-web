"""Composio session-tool pattern mapped onto HALEX-AI (staging proposal data).

Each mapping is an allowlist DESCRIPTOR only. Nothing here performs
network access, holds an API key, or executes a third-party tool.
Where the vendor pattern would execute, the HALEX-AI equivalent is
explicitly 'none': HALEX-AI answers from records that exist, or an
honest MISS. Vendor figures are claims, never adopted facts.

Mapping rows: (vendor concept, HALEX-AI equivalent, execution).
Execution must be exactly 'descriptor-only' or 'none'.
"""

MAPPINGS = [
    {"vendor_concept": "one session per user",
     "halex_equivalent": "one session record per user: session id + allowlist "
                          "descriptor list, stored as a staging record",
     "execution": "descriptor-only"},
    {"vendor_concept": "tools discovered at runtime via meta-tool",
     "halex_equivalent": "runtime descriptor lookup: at session start, the "
                          "session record lists only allowlisted descriptors "
                          "that exist on disk; no new capability is fetched",
     "execution": "descriptor-only"},
    {"vendor_concept": "tool execution through the vendor platform",
     "halex_equivalent": "none: HALEX-AI does not execute third-party tools. "
                          "A question is answered from records that exist, "
                          "or an honest MISS is returned",
     "execution": "none"},
]

VENDOR_CLAIMS = [
    {"claim": "1000+ toolkits", "status": "claim, not adopted as fact"},
]

FORBIDDEN_FIELDS = ("api_key", "network", "third_party_exec",
                    "execute", "http", "url")


def validate_mappings(mappings):
    """Validate a mapping list. Raises ValueError on any violation."""
    if not mappings:
        raise ValueError("mapping list is empty")
    for row in mappings:
        if set(row) != {"vendor_concept", "halex_equivalent", "execution"}:
            raise ValueError("mapping row has wrong fields: %r" % (row,))
        if row["execution"] not in ("descriptor-only", "none"):
            raise ValueError("execution must be descriptor-only or none: %r"
                             % (row["execution"],))
        blob = (row["vendor_concept"] + " " + row["halex_equivalent"]).lower()
        for field in FORBIDDEN_FIELDS:
            if field in blob and field != "execute":
                raise ValueError("forbidden field in mapping: %s" % field)
        if "api key" in blob or "api_key" in blob:
            raise ValueError("mapping must not involve an API key")
    return True
