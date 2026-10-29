import unittest
from token_explainer import TokenExplainer


class TestTokenExplainer(unittest.TestCase):
    def setUp(self):
        self.explainer = TokenExplainer()

    def test_partial_profile_reports_not_found(self):
        res = self.explainer.explain_token_dna({"Type": "memecoin", "Custody": "LP burned"})
        self.assertIn("memecoin", res["explanation"])
        self.assertIn("Not found", res["explanation"])
        self.assertIn("Advisory only", res["advisory_notice"])

    def test_no_secure_labels(self):
        res = self.explainer.explain_token_dna({"Type": "memecoin", "Custody": "LP burned"})
        self.assertNotIn("SECURE", res["explanation"])
        self.assertNotIn("HIGH_RISK", res["explanation"])

    def test_empty_profile(self):
        res = self.explainer.explain_token_dna({})
        self.assertIn("Not found", res["explanation"])


if __name__ == "__main__":
    unittest.main()
