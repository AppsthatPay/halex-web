import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from shard_protocol import ShardProtocol
from interconnect import InterconnectManager


class TestInterconnect(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.shard_proto = ShardProtocol(self.registry, self.agency_mgr, self.memory_store)
        self.interconnect = InterconnectManager(self.registry, self.agency_mgr, self.memory_store, self.shard_proto)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)
        self.memory_store.store_record("rec-01", "Chain-01", "ag-01", "culinary", "Appalachian Stew")

    def test_cross_chain_lookup_by_id(self):
        res = self.interconnect.cross_chain_lookup("record_id", "rec-01")
        self.assertEqual(res["status"], "FOUND")
        self.assertEqual(len(res["matches"]), 1)

    def test_cross_chain_lookup_by_category(self):
        res = self.interconnect.cross_chain_lookup("category", "culinary")
        self.assertEqual(res["status"], "FOUND")

    def test_cross_chain_lookup_miss(self):
        res = self.interconnect.cross_chain_lookup("record_id", "nonexistent")
        self.assertEqual(res["status"], "NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
