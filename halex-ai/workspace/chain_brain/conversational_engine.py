"""Module 8: Conversational Engine (conversational_engine.py).

Allen-built for Jeffrey's 2026-10-30 conversation order. When a
conversation is started in the UI, the software reads the message,
uses its keywords to route to chain-brain records that line up
with the conversation, and pieces those records into flowing,
human-sounding dialog -- not a robotic dump.

Honest limits, stated plainly:
- Routing is KEYWORD token overlap (plus an exact category match),
  not understanding. It does not know what the user means, only
  which stored words line up with the words they used.
- The engine STORES NOTHING from the conversation. It never writes
  the user's question, or any part of it, into the chain. A caller
  that wants a log may record only category + record id, never
  raw question text. That keeps the in-page chain knowledge-only.
- On a miss it says so honestly and names the categories that do
  exist, instead of inventing an answer.
- Every answer ends with a follow-up in Jeffrey's words: asking
  what else about the topic interests the user, and what else
  they would like to know.
"""

import re
from typing import Dict, Any, List

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
    "what", "which", "who", "whom", "whose", "when", "where", "why",
    "how", "tell", "me", "about", "please", "can", "you", "i", "we",
    "of", "on", "in", "to", "for", "and", "or", "with", "that", "this",
    "know", "something", "anything", "more",
}


def _tokens(text: str) -> List[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return [w for w in words if w not in STOPWORDS]


class ConversationalEngine:
    def __init__(self, memory_store):
        self.memory_store = memory_store

    def available_categories(self) -> List[str]:
        cats = sorted({r["category"] for r in self.memory_store.records.values()})
        return cats

    def respond(self, text: str) -> Dict[str, Any]:
        """Read one user message and answer from chain-brain records.

        Returns status MATCH with a humanized answer + follow-up, or
        status MISS with an honest no-record answer + follow-up.
        Nothing is stored.
        """
        question_tokens = set(_tokens(text))
        best = None
        best_score = 0
        for rec in self.memory_store.records.values():
            content_tokens = set(_tokens(rec["content"]))
            category_tokens = set(_tokens(rec["category"]))
            overlap = question_tokens & content_tokens
            score = len(overlap)
            if question_tokens & category_tokens:
                score += 2
            if score > best_score:
                best_score = score
                best = rec
        if best is None or best_score <= 0:
            cats = self.available_categories()
            cat_line = (" I do have records on: " + ", ".join(cats) + "."
                        if cats else "")
            follow_up = "What else interests you?"
            answer = (
                "Good question, and I want to be straight with you: "
                "I don't have a record on that in this chain-brain yet, "
                "so I won't guess at one." + cat_line +
                " " + follow_up
            )
            return {
                "status": "MISS",
                "answer": answer,
                "follow_up": follow_up,
                "available_categories": cats,
            }
        category = best["category"]
        follow_up = f"What else about {category} interests you? What else would you like to know?"
        answer = (
            f"Good question. Here's what I have on {category}: "
            f"{best['content']} "
            f"That comes from the {category} records in this chain-brain, "
            f"so it's something stored here, not something I made up on the spot. "
            + follow_up
        )
        return {
            "status": "MATCH",
            "answer": answer,
            "follow_up": follow_up,
            "record_id": best["id"],
            "category": category,
            "chain_id": best["chain_id"],
            "agency_id": best["agency_id"],
        }
