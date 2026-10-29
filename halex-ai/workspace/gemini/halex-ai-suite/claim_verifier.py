"""Module: Honest Claim Verification
Seed Marker: ZINIUM-SEED-GEMINI
Description: Verifies whether evidence supports a claim using word containment
plus a negation window check. This is a heuristic, not semantic proof.
"""
from typing import Dict, Any


class ClaimVerifier:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def verify_claim(self, claim: str, evidence: str) -> Dict[str, Any]:
        if not claim or not evidence:
            return {"claim": claim, "supported": False, "reason": "Claim and evidence must both be non-empty.", "seed_marker": self.seed_marker}
        claim_lower = claim.lower()
        evidence_lower = evidence.lower()
        negation_terms = ["not", "no", "never", "none", "neither"]
        claim_words = [w for w in claim_lower.split() if len(w) > 3]
        if not claim_words:
            claim_words = claim_lower.split()
        matched_words = [w for w in claim_words if w in evidence_lower]
        support_ratio = len(matched_words) / len(claim_words) if claim_words else 0.0
        negated = False
        for word in matched_words:
            idx = evidence_lower.find(word)
            if idx != -1:
                window = evidence_lower[max(0, idx-25):idx]
                if any(neg in window for neg in negation_terms):
                    negated = True
                    break
        supported = (support_ratio >= 0.5) and not negated
        reason = "Evidence substantiates the claim."
        if negated:
            reason = "Evidence contains negation regarding the claim terms (e.g., 'not'), invalidating support."
        elif not supported:
            reason = "Evidence does not sufficiently substantiate the claim."
        return {"claim": claim, "supported": supported, "support_ratio": round(support_ratio, 2), "reason": reason, "seed_marker": self.seed_marker}
