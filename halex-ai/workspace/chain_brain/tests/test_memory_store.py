import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore


class TestMemoryStore(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.registry.register_chain("Chain-01", "Culinary Chain", "culinary")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "culinary", 0, 999)

    def test_store_and_lookup_record(self):
        res = self.memory_store.store_record("rec-01", "Chain-01", "ag-01", "culinary", "Appalachian Wine Dinner Menu")
        self.assertEqual(res["status"], "STORED")
        lookup = self.memory_store.lookup_by_id("rec-01")
        self.assertEqual(lookup["status"], "FOUND")
        self.assertEqual(lookup["record"]["content"], "Appalachian Wine Dinner Menu")

    def test_sensitive_content_refused(self):
        res = self.memory_store.store_record("rec-sec", "Chain-01", "ag-01", "culinary", "private_key: 0x123456789abcdef")
        self.assertEqual(res["status"], "REFUSED_SENSITIVE")

    def test_bare_hash_not_refused_as_key(self):
        # Gate probe: a plain SHA-256 hash of public text is not a key.
        import hashlib
        digest = hashlib.sha256(b"Appalachian Wine Dinner Menu").hexdigest()
        res = self.memory_store.store_record("rec-hash", "Chain-01", "ag-01", "culinary", f"document hash {digest}")
        self.assertEqual(res["status"], "STORED")


if __name__ == "__main__":
    unittest.main()
