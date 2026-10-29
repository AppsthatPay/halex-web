"""Tests for the Allen adaptations. Seed Marker: ZINIUM-SEED-ALLEN.

These tests assert honesty properties, not just shapes: extraction reads
a real file, verification requires tests to actually run, hooks claim
NOT_IMPLEMENTED, scaffolds raise, sweeps do not execute.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import doc_generator_ast
import scaffolding
import ui_layout
from economic_simulation import SimulatedComputeBudgetLedger
from forager_intake import ForagerIntake, sweep_plan

TREE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KERNEL_PATH = os.path.join(TREE_ROOT, "halex_ai_integrated", "components", "kernel", "system_kernel.py")
KERNEL_TEST = os.path.join(TREE_ROOT, "halex_ai_integrated", "components", "kernel", "test_system_kernel.py")


class TestDocGeneratorAst(unittest.TestCase):
    def test_extracts_real_api(self):
        manifest = doc_generator_ast.extract_api_manifest(KERNEL_PATH)
        self.assertEqual(manifest["status"], "EXTRACTED_FROM_FILE")
        class_names = [c["name"] for c in manifest["classes"]]
        self.assertIn("SystemKernel", class_names)
        methods = [m["name"] for c in manifest["classes"] for m in c["methods"]]
        self.assertIn("create_execution_envelope", methods)

    def test_missing_file_is_an_error_not_a_manifest(self):
        manifest = doc_generator_ast.extract_api_manifest("/nonexistent/does_not_exist_xyz.py")
        self.assertEqual(manifest["status"], "ERROR_FILE_NOT_FOUND")
        self.assertNotIn("classes", manifest)

    def test_no_verified_mark_without_test_run(self):
        result = doc_generator_ast.verify_module(KERNEL_PATH, KERNEL_TEST, run_tests=False)
        self.assertEqual(result["status"], "EXTRACTED_NOT_VERIFIED")
        self.assertFalse(result["tests_run"])

    def test_verified_mark_only_after_tests_actually_run(self):
        result = doc_generator_ast.verify_module(KERNEL_PATH, KERNEL_TEST, run_tests=True)
        self.assertTrue(result["tests_run"])
        self.assertEqual(result["status"], "VERIFIED_FILE_READ_AND_TESTS_PASSED")
        self.assertEqual(result["test_outcome"]["tests_count"], 4)

    def test_test_path_outside_tree_refused(self):
        result = doc_generator_ast.verify_module(KERNEL_PATH, "/etc/hostname", run_tests=True)
        self.assertEqual(result["status"], "ERROR_TEST_PATH_OUTSIDE_TREE")


class TestUiLayout(unittest.TestCase):
    def test_layout_has_four_panes(self):
        layout = ui_layout.initialize_workspace_layout()
        self.assertEqual(layout["status"], "LAYOUT_DEFINED")
        self.assertEqual(len(layout["panes"]), 4)

    def test_hooks_claim_nothing(self):
        media = ui_layout.invoke_media_hook("video", "trim", "local://x.mp4")
        self.assertEqual(media["status"], "NOT_IMPLEMENTED")
        public = ui_layout.query_public_ai_hooks("q", "some_source")
        self.assertEqual(public["status"], "NOT_IMPLEMENTED")


class TestScaffolding(unittest.TestCase):
    def test_roadmap_labelled_static(self):
        gaps = scaffolding.detect_gaps()
        self.assertEqual(gaps["status"], "STATIC_ROADMAP_NOT_A_SCAN")
        self.assertEqual(len(gaps["gaps"]), 2)

    def test_generated_scaffold_raises_not_implemented(self):
        result = scaffolding.scaffold_module("demo_module", "Demo spec.")
        self.assertEqual(result["status"], "SCAFFOLD_GENERATED_NOT_IMPLEMENTED")
        namespace = {}
        exec(result["files_generated"]["demo_module.py"], namespace)
        instance = namespace["DemoModule"]()
        with self.assertRaises(NotImplementedError):
            instance.execute({})


class TestForagerIntake(unittest.TestCase):
    def test_intake_records_caller_supplied_content(self):
        intake = ForagerIntake()
        res = intake.ingest_caller_payload("https://example.org/paper", "x" * 50)
        self.assertEqual(res["status"], "INTAKE_RECORDED_CALLER_SUPPLIED")
        self.assertEqual(res["total_intake_items"], 1)

    def test_sweep_is_not_executed(self):
        plan = sweep_plan()
        self.assertEqual(plan["status"], "NOT_EXECUTED")


class TestEconomicSimulation(unittest.TestCase):
    def test_simulated_allocation_arithmetic(self):
        ledger = SimulatedComputeBudgetLedger()
        res = ledger.allocate_simulated("SEED-ALPHA", 150.0)
        self.assertEqual(res["allocation_status"], "SIMULATED_BUDGET_GRANTED")
        self.assertTrue(res["simulation_only"])
        self.assertEqual(res["remaining_fictional_balance"], 850.0)

    def test_overdraft_rejected(self):
        ledger = SimulatedComputeBudgetLedger()
        res = ledger.allocate_simulated("SEED-BETA", 99999.0)
        self.assertIn("error", res)

    def test_fee_is_a_labelled_static_estimate(self):
        ledger = SimulatedComputeBudgetLedger()
        res = ledger.estimate_fee_static("Solana", 1024)
        self.assertEqual(res["estimation_status"], "FEE_ESTIMATED_STATIC_HEURISTIC")
        self.assertGreater(res["estimated_fee"], 0)


if __name__ == "__main__":
    unittest.main()
