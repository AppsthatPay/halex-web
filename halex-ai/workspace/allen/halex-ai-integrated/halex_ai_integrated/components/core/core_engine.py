"""Module: Core Conversation & Reasoning
Seed Marker: ZINIUM-SEED-GEMINI
Description: Processes user requests by reading provided context, structuring
reasoning steps, and explicitly acknowledging unknowns.
Patch note (Allen, 2026-10-29): context matching uses the full key phrase or
words longer than 3 characters only. Gemini's first fix matched ANY word in a
key, so a question containing "of" falsely matched the key "capital of France"
and answered "Paris" to a Bitcoin price question.
"""
from typing import Dict, Any


class CoreReasoningEngine:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def process_request(self, request: str, known_context: Dict[str, Any]) -> Dict[str, Any]:
        if not request or not request.strip():
            return {
                "answer": "Error: Empty request provided.",
                "steps": ["Input validation"],
                "unknowns": ["Request content missing"],
                "seed_marker": self.seed_marker
            }

        steps = [
            "Parsed user request semantics",
            "Scanned provided known_context dictionary",
            "Synthesized grounded response"
        ]

        req_lower = request.lower()
        answer = None
        unknowns = []

        for key, val in known_context.items():
            key_lower = key.lower()
            meaningful_words = [w for w in key_lower.split() if len(w) > 3]
            if key_lower in req_lower or any(w in req_lower for w in meaningful_words):
                answer = f"Based on context entry '{key}': {val}"
                break

        if not answer:
            if "future" in req_lower or "tomorrow" in req_lower or "lottery" in req_lower:
                unknowns.append("Future or speculative events are not present in verified context.")
                answer = "I do not know the answer because future or speculative events are outside the verified context."
            else:
                unknowns.append(f"No matching context found for query: '{request}'")
                answer = f"I do not know the answer to '{request}' because it is not present in the provided context."

        return {
            "answer": answer,
            "steps": steps,
            "unknowns": unknowns,
            "seed_marker": self.seed_marker
        }
