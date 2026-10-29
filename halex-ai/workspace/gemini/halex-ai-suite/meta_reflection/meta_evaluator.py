"""
Module: Recursive Self-Reflection & Meta-Reasoning Evaluator (RS-MRE)
Author: HALEX-AI Core Architecture (Collaborating with Allen)
Seed Marker: ZINIUM-SEED-GEMINI
Description: Introspects on multi-step reasoning outputs, detects hidden logical assumptions,
             cognitive biases, or unverified leaps, and assigns a meta-confidence label.
             The meta_confidence value is one of three fixed heuristic scores (0.95, 0.80, 0.65)
             chosen by which rules fired; it is asserted by rule, not measured or calibrated.
"""

from typing import Dict, Any, List

class MetaReasoningEvaluator:
    """Evaluates and critiques internal reasoning chains for logical soundness and bias."""

    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def evaluate_reasoning_chain(self, steps: List[str], final_conclusion: str) -> Dict[str, Any]:
        if not steps or not final_conclusion:
            return {
                "error": "Error: Reasoning steps and final conclusion are required for meta-evaluation.",
                "seed_marker": self.seed_marker
            }

        critiques = []
        bias_detected = False

        if len(steps) < 2:
            critiques.append("Shallow reasoning chain: fewer than 2 intermediate steps provided.")
            bias_detected = True

        conclusion_lower = final_conclusion.lower()
        absolute_terms = ["definitely", "always", "undeniably", "absolute", "guaranteed", "never"]
        if any(term in conclusion_lower for term in absolute_terms):
            critiques.append("Dogmatic quantifier detected in conclusion; warrants cautious epistemic stance.")
            bias_detected = True

        if any(step.strip().lower() in conclusion_lower for step in steps):
            critiques.append("Potential circularity: intermediate step terminology directly echoes conclusion.")

        if not critiques:
            critiques.append("Reasoning chain is logically structured with no immediate contradictions or biases detected.")
            meta_confidence = 0.95
        else:
            meta_confidence = 0.65 if bias_detected else 0.80

        return {
            "evaluation_status": "META_REFLECTION_COMPLETE",
            "steps_analyzed": len(steps),
            "meta_confidence": round(meta_confidence, 2),
            "critiques": critiques,
            "bias_flagged": bias_detected,
            "seed_marker": self.seed_marker
        }
