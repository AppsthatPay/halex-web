"""
Module: EMCG Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates node storage, edge connections, neighborhood queries, and error handling.
"""

import unittest
from memory_graph import EpistemicMemoryGraph

class TestEpistemicMemoryGraph(unittest.TestCase):
    def setUp(self):
        self.graph = EpistemicMemoryGraph()

    def test_node_storage(self):
        res = self.graph.add_node("ZINIUM", {"type": "Cryptographic Ledger"})
        self.assertEqual(res["status"], "NODE_STORED")
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_edge_connection_and_query(self):
        self.graph.add_node("HALEX", {"type": "Cognitive Architecture"})
        self.graph.add_node("ZINIUM", {"type": "Ledger"})

        edge_res = self.graph.add_edge("HALEX", "ZINIUM", "anchored_by")
        self.assertEqual(edge_res["status"], "EDGE_CONNECTED")

        neighborhood = self.graph.query_neighborhood("HALEX")
        self.assertEqual(neighborhood["concept_id"], "HALEX")
        self.assertEqual(len(neighborhood["connections"]), 1)
        self.assertEqual(neighborhood["connections"][0]["relationship"], "anchored_by")

    def test_missing_node_query(self):
        res = self.graph.query_neighborhood("NONEXISTENT")
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
