import unittest
from research_engine import ResearchSynthesisEngine


class TestResearchSynthesisEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ResearchSynthesisEngine()

    def test_uses_only_provided_sources(self):
        res = self.engine.synthesize("capitals", [{"title": "A", "content": "Paris is the capital of France."}])
        self.assertIn("Paris", res["summary"])
        self.assertEqual(len(res["attributions"]), 1)

    def test_empty_sources_refused(self):
        res = self.engine.synthesize("anything", [])
        self.assertIn("Refused", res["summary"])

    def test_empty_content_skipped(self):
        res = self.engine.synthesize("t", [{"title": "A", "content": "   "}])
        self.assertEqual(res["summary"], "No valid source content found.")


if __name__ == "__main__":
    unittest.main()
