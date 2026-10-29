import unittest
from core_engine import CoreReasoningEngine


class TestCoreReasoningEngine(unittest.TestCase):
    def setUp(self):
        self.engine = CoreReasoningEngine()

    def test_context_reading(self):
        res = self.engine.process_request("What is the capital of France?", {"capital of France": "Paris"})
        self.assertIn("Paris", res["answer"])
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_unknown_future_query(self):
        res = self.engine.process_request("What will Bitcoin cost tomorrow?", {})
        self.assertIn("do not know", res["answer"])
        self.assertTrue(len(res["unknowns"]) > 0)

    def test_empty_input(self):
        res = self.engine.process_request("", {})
        self.assertIn("Error", res["answer"])

    def test_stopword_does_not_false_match(self):
        # Allen patch test: "of" in the question must not match "capital of France".
        res = self.engine.process_request("What is the price of Bitcoin?", {"capital of France": "Paris"})
        self.assertNotIn("Paris", res["answer"])
        self.assertIn("do not know", res["answer"])


if __name__ == "__main__":
    unittest.main()
