import http.client
import json
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from shard_protocol import ShardProtocol
from conversational_engine import ConversationalEngine
from browser_bridge import BrowserBridge, BrowserBridgeServer


class TestBrowserBridge(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.shard_proto = ShardProtocol(self.registry, self.agency_mgr, self.memory_store)
        self.conversation = ConversationalEngine(self.memory_store)
        self.bridge = BrowserBridge(self.registry, self.memory_store, self.shard_proto,
                                    self.agency_mgr, self.conversation)
        # Agency category MUST match the write payload category, or the
        # bridge correctly refuses. The returned test used "autonomous"
        # here and "autonomous_build" in the payload: that combination
        # cannot honestly succeed, so the gate aligns them.
        self.registry.register_chain("Chain-01", "Builder Chain", "autonomous_build")
        self.agency_mgr.create_agency("ag-01", "Chain-01", "autonomous_build", 0, 999)

    def test_bridge_write_artifact(self):
        payload = {
            "action": "write_artifact",
            "record_id": "art-001",
            "chain_id": "Chain-01",
            "agency_id": "ag-01",
            "category": "autonomous_build",
            "content": "Autonomous component generated via browser builder."
        }
        res = self.bridge.handle_extension_request(payload)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["record"]["id"], "art-001")

    def test_bridge_category_mismatch_refused_nothing_stored(self):
        payload = {
            "action": "write_artifact",
            "record_id": "art-bad",
            "chain_id": "Chain-01",
            "agency_id": "ag-01",
            "category": "some_other_category",
            "content": "This must not be stored."
        }
        res = self.bridge.handle_extension_request(payload)
        self.assertEqual(res["status"], "ERROR")
        self.assertEqual(res["reason"], "CATEGORY_MISMATCH_WITH_AGENCY")
        self.assertEqual(self.memory_store.lookup_by_id("art-bad")["status"], "NOT_FOUND")

    def test_bridge_query_memory(self):
        self.memory_store.store_record("art-002", "Chain-01", "ag-01", "autonomous_build", "Test artifact content")
        payload = {"action": "query_memory", "record_id": "art-002"}
        res = self.bridge.handle_extension_request(payload)
        self.assertEqual(res["status"], "ROUTED")
        self.assertEqual(res["record"]["id"], "art-002")

    def test_bridge_ask_chain_brain_stores_nothing(self):
        self.memory_store.store_record("art-003", "Chain-01", "ag-01", "autonomous_build",
                                       "The house mouse is a small rodent that lives close to people.")
        before = len(self.memory_store.records)
        res = self.bridge.handle_extension_request(
            {"action": "ask_chain_brain", "text": "What do you know about the house mouse?"})
        self.assertEqual(res["status"], "MATCH")
        self.assertIn("What else would you like to know?", res["answer"])
        self.assertEqual(len(self.memory_store.records), before)

    def test_localhost_server_round_trip(self):
        server = BrowserBridgeServer(self.bridge, port=0)
        port = server.start()
        try:
            conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
            body = json.dumps({
                "action": "write_artifact", "record_id": "art-http",
                "chain_id": "Chain-01", "agency_id": "ag-01",
                "category": "autonomous_build",
                "content": "Written through the real local HTTP bridge."
            })
            conn.request("POST", "/api/chain-brain", body=body,
                         headers={"Content-Type": "application/json"})
            resp = conn.getresponse()
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "SUCCESS")
            self.assertEqual(data["record"]["id"], "art-http")
            conn.close()
        finally:
            server.stop()


if __name__ == "__main__":
    unittest.main()
