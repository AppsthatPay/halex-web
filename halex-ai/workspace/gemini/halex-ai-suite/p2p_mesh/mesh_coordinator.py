"""
Module: Multi-Agent Collaborative Mesh & Peer-to-Peer Task Distribution Subsystem (P2P-TDS)
Author: HALEX-AI Core Architecture (Collaborating with Allen)
Seed Marker: ZINIUM-SEED-GEMINI
Description: Manages peer node registration and in-memory subtask assignment records
             across the HALEX-AI mesh network. There is no signing and no transport:
             an assignment is a local record only, nothing is sent anywhere.
"""

from typing import Dict, Any, List

class PeerMeshCoordinator:
    """Coordinates peer-to-peer node connections and distributed task delegation."""

    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"
        self.registered_peers: Dict[str, Dict[str, Any]] = {}

    def register_peer_node(self, peer_id: str, capabilities: List[str]) -> Dict[str, Any]:
        """Registers an active peer node into the collaboration mesh."""
        if not peer_id or not capabilities:
            return {"error": "Error: Peer ID and capability list are required.", "seed_marker": self.seed_marker}

        self.registered_peers[peer_id] = {
            "capabilities": capabilities,
            "status": "ACTIVE",
            "provenance_seal": self.seed_marker
        }

        return {
            "registration_status": "PEER_REGISTERED_SUCCESSFULLY",
            "peer_id": peer_id,
            "total_active_peers": len(self.registered_peers),
            "seed_marker": self.seed_marker
        }

    def distribute_subtask(self, task_id: str, required_capability: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Delegates a subtask to an eligible peer node possessing the required capability."""
        eligible_peers = [
            pid for pid, data in self.registered_peers.items()
            if required_capability in data["capabilities"] and data["status"] == "ACTIVE"
        ]

        if not eligible_peers:
            return {
                "error": f"Error: No active peer found with required capability '{required_capability}'.",
                "seed_marker": self.seed_marker
            }

        assigned_peer = eligible_peers[0]  # Select first eligible peer

        return {
            "task_distribution_status": "SUBTASK_ASSIGNED",
            "task_id": task_id,
            "assigned_peer": assigned_peer,
            "payload": payload,
            "seed_marker": self.seed_marker
        }
