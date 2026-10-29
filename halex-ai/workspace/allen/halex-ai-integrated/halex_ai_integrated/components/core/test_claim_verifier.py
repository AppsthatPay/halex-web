import unittest
from claim_verifier import ClaimVerifier


class TestClaimVerifier(unittest.TestCase):
    def setUp(self):
        self.verifier = ClaimVerifier()

    def test_supports_positive_punctuation_regression(self):
        # Regression test. An earlier form of this check failed this case:
        # the claim word "blue." (with period) never matched evidence
        # "blue today", giving support_ratio 0.0. Cleaning punctuation
        # from claim words before matching fixes it.
        claim = "The sky is blue."
        evidence = "The sky is definitely blue today."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertTrue(res["supported"])
        self.assertEqual(res["support_ratio"], 1.0)

    def test_negation_before(self):
        # Original v4 case, kept.
        claim = "the moon is cheese"
        evidence = "the moon is NOT cheese"
        res = self.verifier.verify_claim(claim, evidence)
        self.assertFalse(res["supported"])
        self.assertIn("negation", res["reason"])

    def test_negation_after_genuine(self):
        # Negation AFTER the claim words, where the negation attaches to
        # the claim itself ("that claim is not true"), is caught by the
        # trailing scan.
        claim = "the report is accurate"
        evidence = "the report is accurate, but that claim is not true"
        res = self.verifier.verify_claim(claim, evidence)
        self.assertFalse(res["supported"])
        self.assertIn("negation", res["reason"])

    def test_no_support(self):
        claim = "The sky is blue."
        evidence = "The sky is green."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertFalse(res["supported"])

    def test_supported_claim(self):
        # Original v4 case, kept.
        claim = "server temperature is high"
        evidence = "server temperature reached 105C, which is high."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertTrue(res["supported"])

    def test_empty_claim(self):
        res = self.verifier.verify_claim("", "some evidence")
        self.assertFalse(res["supported"])

    def test_empty_evidence(self):
        res = self.verifier.verify_claim("The sky is blue.", "")
        self.assertFalse(res["supported"])

    def test_multiple_matches_negation(self):
        # Requires the check to scan EVERY occurrence: with punctuation
        # cleaned, the first "blue" carries no negation, but the later
        # "not blue" does.
        claim = "The sky is blue."
        evidence = "The sky is blue blue not blue."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertFalse(res["supported"])
        self.assertIn("negation", res["reason"])

    def test_seed_marker_allen(self):
        # Provenance: claim_verifier is a HALEX-AI in-house module.
        claim = "The sky is blue."
        evidence = "The sky is definitely blue today."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-ALLEN")
        self.assertEqual(self.verifier.seed_marker, "ZINIUM-SEED-ALLEN")

    @unittest.expectedFailure
    def test_suffix_negation_overbroad_known_limit(self):
        # KNOWN FALSE-NEGATIVE LIMIT, documented in the README, not a pass.
        # Evidence "The sky is blue but not sunny" SUPPORTS "the sky is
        # blue": the "not" attaches to sunny, not to blue. The trailing
        # scan marks it unsupported anyway. This test asserts the honest
        # semantic expectation and is marked expectedFailure until the
        # rule is narrowed. The "blue not cloudy" case is the same class
        # and is therefore NOT asserted as a passing negation case.
        claim = "The sky is blue."
        evidence = "The sky is blue but not sunny."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertTrue(res["supported"])


if __name__ == "__main__":
    unittest.main()
