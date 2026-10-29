"""ADAPTATION, NOT THE GATED MODULE: caller-supplied knowledge intake.

Adapted by Allen (ZINIUM-SEED-ALLEN) from Gemini Module 27 (AGKF-EWS),
which is still under gate with a split presumptive verdict. Its intake
half was real: content handed to it by a caller was bounded and stored.
Its daily sweep function was a pure fabrication: it contacted nothing
and stamped every source SWEEP_COMPLETED.

This adaptation keeps the intake and removes the sweep:
  * ingest_caller_payload(source_url, raw_content) bounds and records
    content a caller supplies. It fetches nothing; the suite is offline
    by standing rule, so fetching is not a missing feature, it is out
    of scope unless Jeffrey orders a fetcher design separately.
  * sweep_plan() exists only to answer the question honestly: it
    returns NOT_EXECUTED, lists the sources a future gated fetcher
    might consider, and states why nothing ran.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List

SEED_MARKER = "ZINIUM-SEED-ALLEN"
SOURCE_CREDIT = "Adapted from Gemini Module 27 (AGKF-EWS), ZINIUM-SEED-GEMINI, under gate at adaptation time."
MAX_CONTENT_CHARS = 10000

# Data only. Nothing in this file contacts any of these; they are the
# source list the original module registered, kept as a plan input.
CANDIDATE_SOURCES: List[str] = [
    "https://api.github.com/explore",
    "https://arxiv.org/api/query?search_query=cat:cs.AI",
    "https://huggingface.co/api/models",
]


class ForagerIntake:
    """Bounded, caller-supplied content intake. Session-scoped."""

    def __init__(self):
        self.seed_marker = SEED_MARKER
        self.cache: List[Dict[str, Any]] = []

    def ingest_caller_payload(self, source_url: str, raw_content: str) -> Dict[str, Any]:
        """Record content the CALLER supplies. Nothing is fetched."""
        if not source_url or not raw_content:
            return {"error": "Error: Source URL and raw content required.",
                    "seed_marker": self.seed_marker}
        bounded = raw_content.strip()[:MAX_CONTENT_CHARS]
        record = {
            "source_url": source_url,
            "content_snippet": bounded[:200] + "...",
            "content_chars_recorded": len(bounded),
            "truncated": len(raw_content.strip()) > MAX_CONTENT_CHARS,
            "ingested_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "provenance_seal": self.seed_marker,
        }
        self.cache.append(record)
        return {
            "status": "INTAKE_RECORDED_CALLER_SUPPLIED",
            "source_url": source_url,
            "total_intake_items": len(self.cache),
            "note": "The content was supplied by the caller. Nothing was fetched from the source URL.",
            "seed_marker": self.seed_marker,
        }


def sweep_plan() -> Dict[str, Any]:
    """Answer the sweep question honestly: no sweep exists or ran."""
    return {
        "status": "NOT_EXECUTED",
        "sources_considered": list(CANDIDATE_SOURCES),
        "reason": ("This adaptation contains no network code and no sweep was "
                   "performed. A real external sweep is a separate design that "
                   "requires Jeffrey's explicit order, with rate limits and "
                   "source terms considered first."),
        "seed_marker": SEED_MARKER,
        "source_credit": SOURCE_CREDIT,
    }
