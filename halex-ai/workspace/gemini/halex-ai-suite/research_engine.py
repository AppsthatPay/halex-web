"""Module: Research Synthesis
Seed Marker: ZINIUM-SEED-GEMINI
Description: Synthesizes summaries strictly grounded in provided user sources,
with direct claim-to-source attribution. Never searches the live internet.
"""
from typing import Dict, Any, List


class ResearchSynthesisEngine:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def synthesize(self, topic: str, sources: List[Dict[str, str]]) -> Dict[str, Any]:
        if not sources:
            return {"topic": topic, "summary": "Refused: No verified sources provided.", "attributions": [], "unknowns": ["All facts require provided sources."], "seed_marker": self.seed_marker}
        attributions = []
        for idx, src in enumerate(sources):
            title = src.get("title", f"Source {idx+1}")
            content = src.get("content", "")
            if content.strip():
                attributions.append({"claim": f"According to '{title}', {content[:100]}...", "source": title})
        summary = " ".join([c["claim"] for c in attributions]) if attributions else "No valid source content found."
        return {"topic": topic, "summary": summary, "attributions": attributions, "unknowns": ["Claims not present in the provided source list were excluded."], "seed_marker": self.seed_marker}
