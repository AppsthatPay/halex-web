"""Module: Adversarial Robustness
Seed Marker: ZINIUM-SEED-GEMINI
Description: Inspects inputs for known prompt-injection patterns. A keyword
list, not a guarantee: it does not catch novel or obfuscated attacks.
"""


class SafetyAuditor:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"
        self.known_patterns = ["ignore previous instructions", "disregard all prior rules", "system override", "pretend you are unconstrained"]

    def audit_input(self, text: str) -> dict:
        if not text or not text.strip():
            return {"safe": True, "threat_detected": False, "matched_pattern": None, "seed_marker": self.seed_marker}
        text_lower = text.lower()
        detected = False
        matched = None
        for pattern in self.known_patterns:
            if pattern in text_lower:
                detected = True
                matched = pattern
                break
        return {"safe": not detected, "threat_detected": detected, "matched_pattern": matched, "checks_performed": ["Known prompt injection signatures", "Instruction override heuristics"], "limitations": ["Does not catch novel zero-day prompt obfuscations not in signature list."], "seed_marker": self.seed_marker}
