"""
Module: Epistemic Drift & Temporal Consistency Monitor (ED-TCM)
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Evaluates temporal consistency of knowledge nodes across version epochs
             to detect epistemic drift and flag invalidated baseline axioms.
"""

from typing import Dict, Any, List

class EpistemicDriftMonitor:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def assess_temporal_drift(self, concept_id: str, baseline_axioms: List[str], current_axioms: List[str]) -> Dict[str, Any]:
        """
        Compares baseline historical axioms against current version axioms to calculate drift.
        """
        if not concept_id or not baseline_axioms or not current_axioms:
            return {
                "error": "Error: Concept ID and non-empty axiom lists are required.",
                "seed_marker": self.seed_marker
            }

        baseline_set = set(baseline_axioms)
        current_set = set(current_axioms)

        retained_axioms = list(baseline_set.intersection(current_set))
        deprecated_axioms = list(baseline_set - current_set)
        introduced_axioms = list(current_set - baseline_set)

        total_baseline = len(baseline_set)
        drift_ratio = len(deprecated_axioms) / total_baseline if total_baseline > 0 else 0.0

        drift_status = "STABLE"
        if drift_ratio > 0.5:
            drift_status = "CRITICAL_DRIFT_DETECTED"
        elif drift_ratio > 0.0:
            drift_status = "MODERATE_DRIFT_OBSERVED"

        return {
            "concept_id": concept_id,
            "drift_status": drift_status,
            "drift_ratio": round(drift_ratio, 2),
            "retained_axioms": retained_axioms,
            "deprecated_axioms": deprecated_axioms,
            "introduced_axioms": introduced_axioms,
            "seed_marker": self.seed_marker
        }
