"""
Module: MPDE Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates multi-perspective lens evaluation and dialectic synthesis.
"""

import unittest
from dialectic_engine import DialecticEngine

class TestDialecticEngine(unittest.TestCase):
    def setUp(self):
        self.engine = DialecticEngine()

    def test_supported_proposition(self):
        prop = "Server load increases during peak hours."
        evidence = ["Telemetry shows server load spikes between 12 PM and 2 PM."]
        res = self.engine.evaluate_proposition(prop, evidence)
        self.assertEqual(res["dialectic_conclusion"], "PLAUSIBLE_AND_SUPPORTED")
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_absolute_quantifier_critique(self):
        prop = "Servers never experience downtime."
        evidence = ["System logs show uptime stats."]
        res = self.engine.evaluate_proposition(prop, evidence)
        self.assertTrue(any("Absolute quantifier detected" in entry for entry in res["lenses"]["adversarial_critique"]))

    def test_empty_proposition(self):
        res = self.engine.evaluate_proposition("", [])
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
