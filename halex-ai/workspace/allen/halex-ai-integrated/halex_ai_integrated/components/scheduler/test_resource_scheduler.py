"""
Module: MRA-ES Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates intent classification and dynamic module routing.
"""

import unittest
from resource_scheduler import ResourceScheduler

class TestResourceScheduler(unittest.TestCase):
    def setUp(self):
        self.scheduler = ResourceScheduler()

    def test_research_routing(self):
        res = self.scheduler.schedule_execution("Synthesize these documents", "research")
        self.assertIn("research", res["activated_modules"])
        self.assertIn("core", res["activated_modules"])
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_blockchain_routing(self):
        res = self.scheduler.schedule_execution("Explain this Token DNA profile", "blockchain")
        self.assertIn("blockchain", res["activated_modules"])

    def test_empty_query_rejection(self):
        res = self.scheduler.schedule_execution("", "general")
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
