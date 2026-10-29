"""halex_ai_selfbuild — HALEX-AI's real self-building machinery.

Components:
  gap_scanner    real dynamic gap detection over files, tests, backlog
  synthesizer    spec-driven module synthesis with mutation-checked tests
  seal           append-only hash-chained log (tamper evidence, not authorship)
  expert_registry  expandable MoE pool with measured-outcome weights
  forager        offline indexing of local repository mirrors into the chain
  cycle          one honest pass: scan -> synthesize -> seal -> register ->
                 forage -> report. Proposals only; the gate integrates.

Standard library only. No network calls anywhere. No wallet, payment, or
signing code anywhere.
"""

__all__ = [
    "gap_scanner",
    "synthesizer",
    "seal",
    "expert_registry",
    "forager",
    "cycle",
]
