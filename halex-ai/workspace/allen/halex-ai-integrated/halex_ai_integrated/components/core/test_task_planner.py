import unittest
from task_planner import TaskPlanner


class TestTaskPlanner(unittest.TestCase):
    def setUp(self):
        self.planner = TaskPlanner()

    def test_dynamic_audit_plan(self):
        res = self.planner.create_plan("Audit database security")
        self.assertIn("Audit", res["steps"][0]["description"])
        self.assertTrue(res["steps"][2]["requires_human_decision"])
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_deploy_branch_differs_from_audit(self):
        a = self.planner.create_plan("Audit database security")
        d = self.planner.create_plan("Deploy the release")
        self.assertNotEqual(a["steps"][0]["description"], d["steps"][0]["description"])

    def test_empty_goal(self):
        res = self.planner.create_plan("")
        self.assertIn("error", res)


if __name__ == "__main__":
    unittest.main()
