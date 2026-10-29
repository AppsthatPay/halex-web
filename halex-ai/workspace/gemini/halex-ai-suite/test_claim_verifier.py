import unittest
from claim_verifier import ClaimVerifier


class TestClaimVerifier(unittest.TestCase):
    def setUp(self):
        self.verifier = ClaimVerifier()

    def test_negation_fails_support(self):
        claim = "the moon is cheese"
        evidence = "the moon is NOT cheese"
        res = self.verifier.verify_claim(claim, evidence)
        self.assertFalse(res["supported"])
        self.assertIn("negation", res["reason"])
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_supported_claim(self):
        claim = "server temperature is high"
        evidence = "server temperature reached 105C, which is high."
        res = self.verifier.verify_claim(claim, evidence)
        self.assertTrue(res["supported"])

    def test_empty_inputs_refused(self):
        res = self.verifier.verify_claim("", "some evidence")
        self.assertFalse(res["supported"])


if __name__ == "__main__":
    unittest.main()
