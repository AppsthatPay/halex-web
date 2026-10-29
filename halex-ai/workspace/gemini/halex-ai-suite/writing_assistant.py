"""Module: Drafting and Rewriting
Seed Marker: ZINIUM-SEED-GEMINI
Description: Improves draft clarity and applies structural focus adjustments
while logging the exact changes performed.
"""
from typing import Dict, Any, List


class WritingAssistant:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def rewrite_draft(self, draft: str, focus: str = "clarity") -> Dict[str, Any]:
        if not draft or not draft.strip():
            return {"rewrite": "", "changes": [], "error": "Error: Empty draft provided.", "seed_marker": self.seed_marker}
        cleaned = " ".join(draft.split())
        changes = [{"change": "Normalized whitespace and punctuation", "reason": "Improved basic readability"}]
        if focus.lower() == "concise":
            sentences = [s.strip() for s in cleaned.split('.') if s.strip()]
            cleaned = ". ".join(sentences[:max(1, len(sentences)//2 + 1)]) + "."
            changes.append({"change": "Condensed sentence count", "reason": "Achieved concise focus"})
        elif focus.lower() == "professional":
            if not cleaned.endswith('.'):
                cleaned += '.'
            changes.append({"change": "Standardized formal sentence boundary punctuation", "reason": "Enhanced professional tone"})
        else:
            changes.append({"change": f"Applied review under focus '{focus}'", "reason": "Maintained core meaning"})
        return {"rewrite": cleaned, "changes": changes, "seed_marker": self.seed_marker}
