"""Integration test: the orchestrator facade end to end, offline.

Seed Marker: ZINIUM-SEED-ALLEN (test). The components under test are the
gated Gemini modules, exercised here through Allen's facade only.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from halex_ai_integrated.orchestrator import HalexAI, run_sample


class TestOrchestratorEndToEnd(unittest.TestCase):
    def test_sample_request_completes_all_stages(self):
        result = run_sample()
        self.assertEqual(result["status"], "COMPLETED")
        self.assertEqual(result["stages"], [
            "kernel_validation", "scheduling", "core_reasoning", "contract_check",
            "dialectic_check", "meta_reflection", "memory_graph_append",
            "zinium_memory_append",
        ])
        self.assertIn("Paris", result["answer"])
        self.assertTrue(result["contract"]["contract_valid"])
        self.assertEqual(result["envelope"]["execution_mode"], "ADVISORY_ONLY")
        self.assertIn("core", result["schedule"]["activated_modules"])
        self.assertIn("research", result["schedule"]["activated_modules"])
        self.assertEqual(result["zinium_memory"]["total_lessons"], 1)
        self.assertEqual(result["memory_graph"]["status"], "NODE_STORED")

    def test_empty_query_rejected_at_kernel(self):
        result = HalexAI().handle({"query": "  ", "intent_domain": "general"})
        self.assertEqual(result["status"], "REJECTED_AT_KERNEL")
        self.assertIn("error", result["envelope"])

    def test_unknown_question_names_its_unknowns(self):
        ai = HalexAI()
        result = ai.handle({"query": "What is the price of Bitcoin tomorrow?",
                            "intent_domain": "general", "known_context": {}})
        self.assertEqual(result["status"], "COMPLETED")
        self.assertTrue(result["core_result"]["unknowns"])
        self.assertIn("do not know", result["answer"].lower())


if __name__ == "__main__":
    unittest.main()
