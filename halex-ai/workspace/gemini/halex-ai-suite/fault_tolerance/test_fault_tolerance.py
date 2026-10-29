"""
Module: CM-FTSHS Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates exception interception, fallback healing, and circuit breaker tripping.
"""

import unittest
from fault_tolerance import FaultToleranceManager

class TestFaultToleranceManager(unittest.TestCase):
    def setUp(self):
        self.ft = FaultToleranceManager(circuit_breaker_threshold=2)

    def test_successful_execution(self):
        res = self.ft.execute_with_healing("TestMod", lambda: "Nominal", lambda: "Fallback")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertFalse(res["healing_applied"])
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_healing_and_circuit_breaker(self):
        res1 = self.ft.execute_with_healing("FragileMod", lambda: 1 / 0, lambda: "Safe Value")
        self.assertEqual(res1["status"], "HEALED_VIA_FALLBACK")
        self.assertFalse(res1["circuit_breaker_tripped"])

        res2 = self.ft.execute_with_healing("FragileMod", lambda: 1 / 0, lambda: "Safe Value")
        self.assertTrue(res2["circuit_breaker_tripped"])

if __name__ == "__main__":
    unittest.main()
