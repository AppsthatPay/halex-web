"""
Module: DEV-SYNC Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates test runner discovery and git workflow generation.
"""

import unittest
from dev_sync_protocol import DevSyncProtocol

class TestDevSyncProtocol(unittest.TestCase):
    def setUp(self):
        self.sync = DevSyncProtocol()

    def test_git_instructions_generation(self):
        instructions = self.sync.generate_git_instructions()
        self.assertTrue(len(instructions) > 0)
        self.assertIn("git push origin halex-ai", instructions[-1])
        self.assertEqual(self.sync.seed_marker, "ZINIUM-SEED-GEMINI")

if __name__ == "__main__":
    unittest.main()
