import unittest
from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from conversational_engine import ConversationalEngine


class TestConversationalEngine(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.engine = ConversationalEngine(self.memory_store)
        self.registry.register_chain("Chain-01", "Fauna Chain", "fauna")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "fauna", 0, 999)
        self.memory_store.store_record(
            "rec-mouse", "Chain-01", "ag-01", "fauna",
            "The house mouse is a small rodent that lives close to people.")

    def test_conversational_match(self):
        res = self.engine.respond("What do you know about the house mouse?")
        self.assertEqual(res["status"], "MATCH")
        self.assertIn("house mouse", res["answer"])
        self.assertIn("What else about fauna interests you?", res["answer"])
        self.assertIn("What else would you like to know?", res["answer"])

    def test_conversational_miss(self):
        res = self.engine.respond("Tell me about quantum bananas from Mars")
        self.assertEqual(res["status"], "MISS")
        self.assertIn("don't have a record", res["answer"])
        self.assertIn("fauna", res["answer"])

    def test_conversational_stores_nothing(self):
        before = len(self.memory_store.records)
        self.engine.respond("What do you know about the house mouse?")
        self.assertEqual(len(self.memory_store.records), before)


if __name__ == "__main__":
    unittest.main()
