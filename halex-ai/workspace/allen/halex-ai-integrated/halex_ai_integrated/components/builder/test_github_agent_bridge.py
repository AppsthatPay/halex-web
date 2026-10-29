"""
Module: GitHub Agent Bridge Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates PR payload formatting, branch targeting, and provenance seals.
"""

import unittest
from github_agent_bridge import GitHubAgentBridge

class TestGitHubAgentBridge(unittest.TestCase):
    def setUp(self):
        self.bridge = GitHubAgentBridge()

    def test_pr_packaging(self):
        payload = self.bridge.package_module_for_pr("sample_mod", "print('hello')", "assert True", "# Readme")
        self.assertEqual(payload["target_branch"], "halex-ai")
        self.assertIn("sample_mod.py", payload["files"])
        self.assertEqual(payload["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_empty_module_rejection(self):
        payload = self.bridge.package_module_for_pr("", "", "", "")
        self.assertIn("error", payload)

if __name__ == "__main__":
    unittest.main()
