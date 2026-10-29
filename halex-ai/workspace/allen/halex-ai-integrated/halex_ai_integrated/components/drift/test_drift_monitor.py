"""
Module: ED-TCM Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates temporal consistency checks, axiom deprecation, and drift classification.
"""

import unittest
from drift_monitor import EpistemicDriftMonitor

class TestEpistemicDriftMonitor(unittest.TestCase):
    def setUp(self):
        self.monitor = EpistemicDriftMonitor()

    def test_stable_axioms(self):
        base = ["Axiom 1", "Axiom 2"]
        curr = ["Axiom 1", "Axiom 2"]
        res = self.monitor.assess_temporal_drift("CONCEPT-01", base, curr)
        self.assertEqual(res["drift_status"], "STABLE")
        self.assertEqual(res["drift_ratio"], 0.0)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_moderate_drift(self):
        base = ["Axiom 1", "Axiom 2", "Axiom 3"]
        curr = ["Axiom 1", "Axiom 3", "Axiom 4"]
        res = self.monitor.assess_temporal_drift("CONCEPT-02", base, curr)
        self.assertEqual(res["drift_status"], "MODERATE_DRIFT_OBSERVED")
        self.assertIn("Axiom 2", res["deprecated_axioms"])

    def test_empty_input(self):
        res = self.monitor.assess_temporal_drift("", [], [])
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
