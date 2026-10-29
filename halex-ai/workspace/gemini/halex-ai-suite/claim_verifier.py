"""HALEX-AI claim verification module (in-house).

Seed Marker: ZINIUM-SEED-ALLEN
Written by Allen for the HALEX-AI suite, 2026-10-29.

What this module does
---------------------
Given a claim and a piece of evidence text, it estimates whether the
evidence backs the claim. The method is deliberately simple and fully
offline: it compares the claim's content words against the evidence and
then checks whether a negation word sits close enough to a matched word
to cancel the support. The verdict is a heuristic signal, never a proof
of truth. Callers must treat "supported" as "the wording lines up and no
negation was found nearby", nothing stronger.

How the check runs
------------------
1. Term extraction. The claim is lowercased, split into words, and each
   word is cleaned of surrounding punctuation, so a claim ending in
   "blue." still matches evidence that says "blue today". Words longer
   than three characters carry the check; when a claim has no such word,
   every cleaned word is used instead.
2. Coverage. A claim term counts as covered when it appears anywhere in
   the evidence. The support ratio is covered terms over total terms,
   and a claim needs at least half of its terms covered.
3. Leading negation scan. For every covered term, each of its
   occurrences in the evidence is examined (not just the first one: an
   early clean mention must not hide a later negated one). If a negation
   word appears within the 50 characters before an occurrence, the
   evidence is treated as negating the claim.
4. Trailing negation scan. If the leading scan found nothing, the text
   following the final covered term is checked for a negation word.
   This catches phrasing where the denial comes after the claim itself,
   e.g. evidence ending in "that claim is not true".

Known limits, stated plainly
----------------------------
- The trailing scan is coarse: it fires on ANY negation word after the
  last covered term, even when that word belongs to a different part of
  the sentence. Evidence "The sky is blue but not sunny" plainly
  supports the claim "the sky is blue" (the "not" belongs to "sunny"),
  yet this module reports it unsupported. That false negative is a
  documented property of the heuristic, carried in the test suite as an
  expected failure, and it is the first thing a future revision should
  narrow.
- Matching is substring based, so a term can match inside a longer
  unrelated word. Coverage is a wording signal, not understanding.
"""
import string
from typing import Any, Dict, List

# Words that cancel support when they appear near a covered claim term.
NEGATION_WORDS = ("not", "no", "never", "none", "neither")

# How far before a matched term the leading scan looks for a negation.
LOOKBACK_CHARS = 50


def _claim_terms(claim: str) -> List[str]:
    """Reduce a claim to the words the coverage check runs on."""
    cleaned = []
    for raw in claim.lower().split():
        word = raw.strip(string.punctuation)
        if word:
            cleaned.append(word)
    content = [w for w in cleaned if len(w) > 3]
    return content if content else cleaned


def _negation_leads(text: str, term: str) -> bool:
    """True when a negation word precedes any occurrence of term."""
    pos = text.find(term)
    while pos != -1:
        window = text[max(0, pos - LOOKBACK_CHARS):pos]
        if any(neg in window for neg in NEGATION_WORDS):
            return True
        pos = text.find(term, pos + len(term))
    return False


def _negation_trails(text: str, term: str) -> bool:
    """True when a negation word appears anywhere after term's last use."""
    pos = text.rfind(term)
    if pos == -1:
        return False
    tail = text[pos + len(term):]
    return any(neg in tail for neg in NEGATION_WORDS)


class ClaimVerifier:
    """Checks whether evidence text supports a claim, by wording."""

    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-ALLEN"

    def verify_claim(self, claim: str, evidence: str) -> Dict[str, Any]:
        if not claim or not evidence:
            return {
                "claim": claim,
                "supported": False,
                "reason": "Claim and evidence must both be non-empty.",
                "seed_marker": self.seed_marker,
            }

        evidence_text = evidence.lower()
        terms = _claim_terms(claim)
        covered = [t for t in terms if t in evidence_text]
        ratio = len(covered) / len(terms) if terms else 0.0

        negated = any(_negation_leads(evidence_text, t) for t in covered)
        if not negated and covered:
            negated = _negation_trails(evidence_text, covered[-1])

        supported = ratio >= 0.5 and not negated
        if negated:
            reason = ("Evidence contains negation regarding the claim terms "
                      "(e.g., 'not'), invalidating support.")
        elif supported:
            reason = "Evidence substantiates the claim."
        else:
            reason = "Evidence does not sufficiently substantiate the claim."

        return {
            "claim": claim,
            "supported": supported,
            "support_ratio": round(ratio, 2),
            "reason": reason,
            "seed_marker": self.seed_marker,
        }
