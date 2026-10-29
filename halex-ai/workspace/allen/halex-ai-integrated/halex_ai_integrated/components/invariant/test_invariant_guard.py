"""
Module: ASS-IG Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates invariant auditing, rule violations, and provenance sealing.
"""

import unittest
from invariant_guard import InvariantGuard

class TestInvariantGuard(unittest.TestCase):
    def setUp(self):
        self.guard = InvariantGuard()

    def test_valid_state_audit(self):
        valid_state = {
            "answer": "Verified output",
            "confidence": 0.95,
            "seed_marker": "ZINIUM-SEED-GEMINI"
        }
        res = self.guard.audit_state(valid_state)
        self.assertTrue(res["audit_passed"])
        self.assertEqual(len(res["failed_invariants"]), 0)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_invalid_confidence_bound(self):
        invalid_state = {
            "answer": "Out of bounds confidence",
            "confidence": 1.5,
            "seed_marker": "ZINIUM-SEED-GEMINI"
        }
        res = self.guard.audit_state(invalid_state)
        self.assertFalse(res["audit_passed"])
        self.assertIn("valid_confidence_bound", res["failed_invariants"])

    def test_missing_provenance_seal(self):
        unsealed_state = {
            "answer": "Missing seed marker",
            "confidence": 0.90,
            "seed_marker": "INVALID_SEED"
        }
        res = self.guard.audit_state(unsealed_state)
        self.assertFalse(res["audit_passed"])
        self.assertIn("provenance_anchored", res["failed_invariants"])

if __name__ == "__main__":
    unittest.main()
