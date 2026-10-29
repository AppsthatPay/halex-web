"""
Module: System Kernel Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates envelope creation, branch registration, and response contract enforcement.
"""

import unittest
from system_kernel import SystemKernel

class TestSystemKernel(unittest.TestCase):
    def setUp(self):
        self.kernel = SystemKernel()

    def test_branch_registration(self):
        self.kernel.register_branch("research")
        self.kernel.register_branch("blockchain")
        self.assertIn("research", self.kernel.registered_branches)
        self.assertIn("blockchain", self.kernel.registered_branches)

    def test_execution_envelope_creation(self):
        envelope = self.kernel.create_execution_envelope("Analyze propulsion thermodynamics", "science")
        self.assertIn("envelope_id", envelope)
        self.assertEqual(envelope["intent_domain"], "science")
        self.assertEqual(envelope["execution_mode"], "ADVISORY_ONLY")
        self.assertEqual(envelope["provenance_seal"], "ZINIUM-SEED-GEMINI")

    def test_response_contract_validation(self):
        valid_payload = {
            "answer": "Thermodynamic analysis complete.",
            "steps": ["Parsed equations", "Verified boundary conditions"],
            "unknowns": ["Initial kinetic turbulence coefficients"],
            "seed_marker": "ZINIUM-SEED-GEMINI"
        }
        validation = self.kernel.validate_response_contract(valid_payload)
        self.assertTrue(validation["contract_valid"])
        self.assertEqual(validation["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_invalid_response_contract(self):
        invalid_payload = {
            "answer": "Incomplete payload"
        }
        validation = self.kernel.validate_response_contract(invalid_payload)
        self.assertFalse(validation["contract_valid"])

if __name__ == "__main__":
    unittest.main()
