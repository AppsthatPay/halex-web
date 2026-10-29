"""Tests for the ResearchSynthesizer add-on (research_synthesis.py).
Contributor: Gemini (pasted 2026-10-29), converted to unittest by Allen at
the gate so the cases run under the suite's unittest discovery.

Gate history for this file: as pasted, the run guard read
    if ____name__ == "__main__":
which raises NameError on a direct run, so ZERO of its tests executed.
That guard bug, plus the module's >= 0.5 tie threshold (fixed in
research_synthesis.py), were the two faults found at the gate. With both
patches, all 5 original cases pass with their original expected values.

Note on the "negation after" case: its expected False is reached through
ClaimVerifier's documented over-broad suffix rule ("blue not cloudy" is
counted unsupported; semantically the "not" attaches to "cloudy"). The case
is kept with its contributor's expectation, and the inherited limit is
documented in research_synthesis.py and the suite README, not hidden.
"""
import unittest

from research_synthesis import ResearchSynthesizer


class TestResearchSynthesizer(unittest.TestCase):
    def setUp(self):
        self.synthesizer = ResearchSynthesizer()

    def test_multi_source_support(self):
        result = self.synthesizer.synthesize(
            "The sky is blue.",
            ["The sky is blue today.", "Blue is a common color in clear skies."],
        )
        self.assertTrue(result["verification_summary"]["overall_supported"])

    def test_mixed_sources_negation_after(self):
        result = self.synthesizer.synthesize(
            "The sky is blue.",
            ["The sky is blue today.", "The sky is blue not cloudy."],
        )
        self.assertFalse(result["verification_summary"]["overall_supported"])

    def test_no_support(self):
        result = self.synthesizer.synthesize(
            "The sky is blue.",
            ["The sky is green.", "Cloudy skies only."],
        )
        self.assertFalse(result["verification_summary"]["overall_supported"])

    def test_empty_sources(self):
        result = self.synthesizer.synthesize("The sky is blue.", [])
        self.assertFalse(result["verification_summary"]["overall_supported"])

    def test_mixed_support_tie_is_not_majority(self):
        # 1 of 2 is a tie, not a majority. This is the case the as-pasted
        # >= 0.5 threshold failed.
        result = self.synthesizer.synthesize(
            "The sky is blue.",
            ["The sky is blue.", "The sky is green."],
        )
        self.assertFalse(result["verification_summary"]["overall_supported"])
        self.assertEqual(result["verification_summary"]["supported_count"], 1)
        self.assertEqual(result["verification_summary"]["total_sources"], 2)

    def test_seed_marker(self):
        result = self.synthesizer.synthesize("The sky is blue.", ["The sky is blue."])
        self.assertEqual(result["seed_marker"], "ZINIUM-SEED-GEMINI")


if __name__ == "__main__":
    unittest.main()
