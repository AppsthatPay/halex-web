import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from shard_protocol import ShardProtocol


class TestShardProtocol(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.shard_proto = ShardProtocol(self.registry, self.agency_mgr, self.memory_store)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)

    def test_route_record(self):
        res = self.shard_proto.route_record("rec-01", "Chain-01", "ag-01", "culinary", "Menu data")
        self.assertEqual(res["status"], "ROUTED")

    def test_shard_creation_and_lookup(self):
        self.shard_proto.route_record("rec-01", "Chain-01", "ag-01", "culinary", "Menu data")
        shard_res = self.shard_proto.create_shard("shard-01", "Chain-01", "ag-01", (0, 499), "Party-A")
        self.assertEqual(shard_res["status"], "SHARD_CREATED")
        lookup = self.shard_proto.lookup_across_shards("rec-01")
        self.assertEqual(lookup["status"], "ROUTED")


if __name__ == "__main__":
    unittest.main()
