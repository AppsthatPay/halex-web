"""
Module: RS-MRE Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates meta-reasoning evaluation, bias detection, and confidence scoring.
"""

import unittest
from meta_evaluator import MetaReasoningEvaluator

class TestMetaReasoningEvaluator(unittest.TestCase):
    def setUp(self):
        self.evaluator = MetaReasoningEvaluator()

    def test_sound_reasoning_evaluation(self):
        steps = ["Parsed input semantics", "Cross-referenced local knowledge base", "Synthesized grounded output"]
        conclusion = "The output is consistent with verified context."
        res = self.evaluator.evaluate_reasoning_chain(steps, conclusion)
        self.assertEqual(res["evaluation_status"], "META_REFLECTION_COMPLETE")
        self.assertGreaterEqual(res["meta_confidence"], 0.85)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_bias_and_quantifier_detection(self):
        steps = ["Quick scan"]
        conclusion = "This is definitely and undeniably true forever."
        res = self.evaluator.evaluate_reasoning_chain(steps, conclusion)
        self.assertTrue(res["bias_flagged"])
        self.assertLess(res["meta_confidence"], 0.80)
        self.assertTrue(len(res["critiques"]) > 0)

if __name__ == "__main__":
    unittest.main()
