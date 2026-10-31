import unittest
from chain_registry import ChainRegistry
from space_manager import SpaceManager


class TestSpaceManager(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.space_mgr = SpaceManager(self.registry)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")

    def test_allot_space(self):
        res = self.space_mgr.allot_space("Chain-01", 1000000)
        self.assertEqual(res["status"], "SPACE_ALLOTTED")
        report = self.space_mgr.report_space("Chain-01")
        self.assertEqual(report["space_allotted_bytes"], 1000000)

    def test_expand_space_within_budget(self):
        self.space_mgr.allot_space("Chain-01", 1000)
        res = self.space_mgr.expand_space("Chain-01", 500, max_tb_budget=1.0)
        self.assertEqual(res["status"], "EXPANDED")
        self.assertEqual(res["space_allotted"], 1500)

    def test_expand_space_refused_over_budget(self):
        self.space_mgr.allot_space("Chain-01", 1000)
        res = self.space_mgr.expand_space("Chain-01", 2000000, max_tb_budget=0.000001)
        self.assertEqual(res["status"], "EXPANSION_REFUSED")


if __name__ == "__main__":
    unittest.main()
