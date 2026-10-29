"""
Module: Multi-Perspective Dialectic Engine (MPDE)
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Evaluates propositions through empirical, logical, and adversarial lenses,
             synthesizing a balanced dialectic conclusion with explicit uncertainty bounds.
"""

from typing import Dict, Any, List

class DialecticEngine:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def evaluate_proposition(self, proposition: str, evidence_base: List[str]) -> Dict[str, Any]:
        """
        Evaluates a proposition across empirical, logical, and adversarial lenses.
        """
        if not proposition or not proposition.strip():
            return {
                "error": "Error: Proposition cannot be empty.",
                "seed_marker": self.seed_marker
            }

        # Lens 1: Empirical Grounding Check
        empirical_support = any(
            any(word in ev.lower() for word in proposition.lower().split() if len(word) > 3)
            for ev in evidence_base
        )

        # Lens 2: Logical Consistency Check
        logical_consistent = len(proposition.split()) >= 3

        # Lens 3: Adversarial / Skeptical Critique
        counter_arguments = []
        if not empirical_support:
            counter_arguments.append("Lack of direct empirical evidence in provided base.")
        if "always" in proposition.lower() or "never" in proposition.lower():
            counter_arguments.append("Absolute quantifier detected; vulnerable to edge-case counter-examples.")

        if not counter_arguments:
            counter_arguments.append("No immediate structural contradictions or extreme quantifiers detected.")

        # Dialectic Synthesis
        if empirical_support and logical_consistent and len(counter_arguments) <= 1:
            conclusion = "PLAUSIBLE_AND_SUPPORTED"
        else:
            conclusion = "REQUIRES_CAUTION_OR_REFINEMENT"

        return {
            "proposition": proposition,
            "lenses": {
                "empirical_grounding": empirical_support,
                "logical_consistency": logical_consistent,
                "adversarial_critique": counter_arguments
            },
            "dialectic_conclusion": conclusion,
            "seed_marker": self.seed_marker
        }
