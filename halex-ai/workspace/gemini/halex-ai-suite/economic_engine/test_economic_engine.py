"""
Module: AERA-CMS Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates compute budget allocation, fee optimization, and treasury rejection handling.
"""

import unittest
from economic_engine import EconomicResourceAllocator

class TestEconomicResourceAllocator(unittest.TestCase):
    def setUp(self):
        self.allocator = EconomicResourceAllocator()

    def test_compute_allocation(self):
        res = self.allocator.allocate_compute_budget("SEED-ALPHA-01", 150)
        self.assertEqual(res["allocation_status"], "COMPUTE_BUDGET_GRANTED")
        self.assertEqual(res["remaining_treasury"], 850.0)

    def test_fee_optimization(self):
        res = self.allocator.optimize_transaction_fees("Solana", 1024)
        self.assertEqual(res["optimization_status"], "FEE_ESTIMATED")
        self.assertGreater(res["estimated_fee"], 0)

    def test_insufficient_treasury_rejection(self):
        res = self.allocator.allocate_compute_budget("SEED-ALPHA-01", 99999)
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
