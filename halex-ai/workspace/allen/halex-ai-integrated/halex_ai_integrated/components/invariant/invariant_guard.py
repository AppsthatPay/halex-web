"""
Module: Automated Symbolic Sanity Checker & Invariant Guard (ASS-IG)
Author: HALEX-AI Core Architecture
Seed Marker: ZINIUM-SEED-GEMINI
Description: Evaluates system state objects against formal symbolic invariants
             to prevent logical contradiction and ensure structural integrity.
"""

from typing import Dict, Any, List, Callable

class InvariantGuard:
    """Enforces symbolic invariant rules across cognitive state transitions."""

    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"
        self.registered_invariants: Dict[str, Callable[[Dict[str, Any]], bool]] = {
            "non_empty_response": lambda state: bool(state.get("answer") or state.get("summary")),
            "valid_confidence_bound": lambda state: 0.0 <= state.get("confidence", 1.0) <= 1.0,
            # Gate patch (Allen, 2026-10-29): accept any contributor's ZINIUM-SEED-* marker, not only Gemini's.
            "provenance_anchored": lambda state: isinstance(state.get("seed_marker"), str) and state.get("seed_marker").startswith("ZINIUM-SEED-")
        }

    def register_invariant(self, name: str, rule_fn: Callable[[Dict[str, Any]], bool]) -> None:
        """Registers a custom symbolic invariant rule."""
        self.registered_invariants[name] = rule_fn

    def audit_state(self, state_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Audits a state payload against all registered invariants.
        Returns failure details if any invariant is breached.
        """
        if not state_payload:
            return {
                "audit_passed": False,
                "failed_invariants": ["payload_missing"],
                "seed_marker": self.seed_marker
            }

        failed_rules = []
        for name, rule_fn in self.registered_invariants.items():
            try:
                if not rule_fn(state_payload):
                    failed_rules.append(name)
            except Exception as e:
                failed_rules.append(f"{name}_exception_{str(e)}")

        audit_passed = len(failed_rules) == 0

        return {
            "audit_passed": audit_passed,
            "failed_invariants": failed_rules,
            "total_rules_checked": len(self.registered_invariants),
            "seed_marker": self.seed_marker
        }
