"""
Module: AER-ALL Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates active learning batch processing, weight adjustments, and bounding.
"""

import unittest
from active_learner import ActiveLearningEngine

class TestActiveLearningEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ActiveLearningEngine()

    def test_positive_reinforcement(self):
        batch = [{"success": True}, {"success": True}, {"success": True}, {"success": True}]
        res = self.engine.process_learning_batch(batch)
        self.assertEqual(res["learning_status"], "POLICY_REINFORCED_SUCCESSFULLY")
        self.assertGreater(res["adjustment_delta"], 0)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_negative_reinforcement(self):
        batch = [{"success": False}, {"success": False}]
        res = self.engine.process_learning_batch(batch)
        self.assertLess(res["adjustment_delta"], 0)

    def test_empty_batch_rejection(self):
        res = self.engine.process_learning_batch([])
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
