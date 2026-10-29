"""Module: Research Synthesis add-on (multi-source verification aggregator)
Seed Marker: ZINIUM-SEED-GEMINI
Contributor: Gemini (pasted 2026-10-29), gated and patched by Allen.
Description: Aggregates ClaimVerifier results across multiple plain-text
sources for one claim and reports whether a strict majority of the sources
support it. This is an ADD-ON: it does not replace research_engine.py
(ResearchSynthesisEngine, which formats summaries from titled dict sources).

Gate patches applied in staging (v5 add-on):
- Aggregation threshold changed from >= 0.5 to > 0.5. As pasted, a 1-of-2
  tie counted as "supported by the majority", which failed the module's own
  "mixed support" and "negation after" test cases. A tie is not a majority.
- The companion test file's run guard was corrected (see
  test_research_synthesis.py header).

Known limit, stated honestly: this aggregator inherits ClaimVerifier's
documented over-broad suffix false-negative. A source like "The sky is blue
not cloudy" is counted as NOT supporting "the sky is blue" because the
verifier's suffix rule treats the trailing "not" as negating the claim,
when semantically it attaches to "cloudy". The aggregator's counts are only
as good as the verifier's per-source verdicts. See the suite README,
module 6.
"""
from typing import Dict, List, Any

from claim_verifier import ClaimVerifier


class ResearchSynthesizer:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def synthesize(self, claim: str, sources: List[str]) -> Dict[str, Any]:
        if not claim or not sources:
            return {
                "claim": claim,
                "synthesis": "Insufficient sources provided.",
                "supported_sources": [],
                "verification_summary": {"overall_supported": False, "total_sources": 0},
                "seed_marker": self.seed_marker
            }

        verifier = ClaimVerifier()

        supported_count = 0
        supported_sources = []

        for source in sources:
            if not source.strip():
                continue
            result = verifier.verify_claim(claim, source)
            if result["supported"]:
                supported_count += 1
                supported_sources.append(source)

        total_sources = len([s for s in sources if s.strip()])
        # Gate patch: strict majority. A tie (e.g. 1 of 2) is NOT a majority.
        overall_supported = supported_count > 0 and total_sources > 0 and (supported_count / total_sources > 0.5)

        synthesis = (
            f"Synthesis based on {total_sources} sources. "
            f"{supported_count} sources support the claim, "
            f"{total_sources - supported_count} do not."
        )

        if overall_supported:
            synthesis += " Overall: The claim is supported by the majority of sources."
        else:
            synthesis += " Overall: The claim is not supported by the majority of sources."

        return {
            "claim": claim,
            "synthesis": synthesis,
            "supported_sources": supported_sources,
            "verification_summary": {
                "overall_supported": overall_supported,
                "supported_count": supported_count,
                "total_sources": total_sources
            },
            "seed_marker": self.seed_marker
        }
