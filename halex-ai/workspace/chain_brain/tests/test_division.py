import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from shard_protocol import ShardProtocol
from division import DivisionManager


class TestDivision(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.shard_proto = ShardProtocol(self.registry, self.agency_mgr, self.memory_store)
        self.division_mgr = DivisionManager(self.registry, self.agency_mgr, self.memory_store, self.shard_proto)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        self.memory_store.store_record("rec-01", "Chain-01", "ag-01", "culinary", "Soup recipe")
        self.memory_store.store_record("rec-02", "Chain-01", "ag-01", "culinary", "Salad recipe")

    def test_divide_chain(self):
        self.agency_mgr.create_agency("ag-child", "Chain-01", "culinary", 1000, 1999)
        res = self.division_mgr.divide_chain("Chain-01", "shard-child", "Allotment-Partner", "ag-child", (1000, 1999), ["rec-02"])
        self.assertEqual(res["status"], "DIVIDED")
        recon = self.division_mgr.reconcile_counts("Chain-01", "ag-child")
        self.assertEqual(recon["status"], "RECONCILED")
        self.assertTrue(recon["reconciliation_valid"])

    def test_reconcile_detects_wrong_child(self):
        # Gate probe: validity is COMPUTED, not hardcoded True.
        # Reconciling against an agency that received nothing must fail.
        self.agency_mgr.create_agency("ag-child", "Chain-01", "culinary", 1000, 1999)
        self.agency_mgr.create_agency("ag-other", "Chain-01", "culinary", 2000, 2999)
        self.division_mgr.divide_chain("Chain-01", "shard-child", "Allotment-Partner", "ag-child", (1000, 1999), ["rec-02"])
        recon = self.division_mgr.reconcile_counts("Chain-01", "ag-other")
        self.assertFalse(recon["reconciliation_valid"])


if __name__ == "__main__":
    unittest.main()
