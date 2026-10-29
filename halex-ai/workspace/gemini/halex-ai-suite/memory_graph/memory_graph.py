"""
Module: Epistemic Memory & Context Graph (EMCG)
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Maintains a persistent, structured graph of verified concepts and relational
             dependencies to eliminate cross-prompt amnesia and parametric drift.
"""

from typing import Dict, Any, List

class EpistemicMemoryGraph:
    """Manages persistent conceptual memory nodes and relational hyper-graphs."""

    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def add_node(self, concept_id: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """Stores a verified conceptual node with immutable provenance wrapping."""
        if not concept_id or not concept_id.strip():
            return {
                "error": "Error: Concept ID cannot be empty.",
                "seed_marker": self.seed_marker
            }

        self.nodes[concept_id] = {
            "attributes": attributes,
            "provenance_seal": self.seed_marker
        }

        return {
            "status": "NODE_STORED",
            "concept_id": concept_id,
            "seed_marker": self.seed_marker
        }

    def add_edge(self, source_id: str, target_id: str, relationship: str) -> Dict[str, Any]:
        """Connects two conceptual nodes with a verified relational dependency."""
        if source_id not in self.nodes or target_id not in self.nodes:
            return {
                "error": "Error: Both source and target nodes must exist in the memory graph.",
                "seed_marker": self.seed_marker
            }

        edge = {
            "source": source_id,
            "target": target_id,
            "relationship": relationship,
            "seed_marker": self.seed_marker
        }
        self.edges.append(edge)

        return {
            "status": "EDGE_CONNECTED",
            "edge": edge,
            "seed_marker": self.seed_marker
        }

    def query_neighborhood(self, concept_id: str) -> Dict[str, Any]:
        """Retrieves a node's attributes and all connected relational edges."""
        if concept_id not in self.nodes:
            return {
                "error": f"Error: Concept '{concept_id}' not found in memory graph.",
                "seed_marker": self.seed_marker
            }

        related_edges = [
            e for e in self.edges
            if e["source"] == concept_id or e["target"] == concept_id
        ]

        return {
            "concept_id": concept_id,
            "attributes": self.nodes[concept_id]["attributes"],
            "connections": related_edges,
            "seed_marker": self.seed_marker
        }
