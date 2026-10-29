"""Module: ZINIUM Lessons Ledger
Seed Marker: ZINIUM-SEED-GEMINI
Description: Stores append-only ZINIUM lessons with provenance. Corrections are
additive only; nothing is deleted or overwritten.
Patch note (Allen, 2026-10-29): replaced deprecated datetime.utcnow() with
timezone-aware datetime.now(datetime.timezone.utc).
"""
from typing import Dict, Any, List
import datetime


class ZiniumMemoryStore:
    def __init__(self):
        self.lessons: List[Dict[str, Any]] = []
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def record_lesson(self, observed: str, reported: str, learned: str, source: str, contributor: str) -> Dict[str, Any]:
        if not observed or not learned:
            return {"error": "Observed and learned fields are mandatory.", "seed_marker": self.seed_marker}
        lesson = {"observed": observed, "reported": reported, "learned": learned, "source": source, "contributor": contributor, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(), "seed_marker": self.seed_marker}
        self.lessons.append(lesson)
        return {"status": "LESSON_RECORDED", "total_lessons": len(self.lessons), "seed_marker": self.seed_marker}

    def get_lessons(self) -> List[Dict[str, Any]]:
        return self.lessons
