"""
Module: P2P-TDS Test Suite
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Validates peer node registration and capability-based subtask distribution.
"""

import unittest
from mesh_coordinator import PeerMeshCoordinator

class TestPeerMeshCoordinator(unittest.TestCase):
    def setUp(self):
        self.coordinator = PeerMeshCoordinator()

    def test_peer_registration(self):
        res = self.coordinator.register_peer_node("NODE-01", ["research", "verification"])
        self.assertEqual(res["registration_status"], "PEER_REGISTERED_SUCCESSFULLY")
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_subtask_distribution(self):
        self.coordinator.register_peer_node("NODE-02", ["blockchain"])
        res = self.coordinator.distribute_subtask("TASK-99", "blockchain", {"query": "Analyze Token DNA"})
        self.assertEqual(res["task_distribution_status"], "SUBTASK_ASSIGNED")
        self.assertEqual(res["assigned_peer"], "NODE-02")

    def test_missing_capability_rejection(self):
        res = self.coordinator.distribute_subtask("TASK-100", "quantum_compute", {})
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
