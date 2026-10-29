# Automated Symbolic Sanity Checker & Invariant Guard (ASS-IG)

## What it does
Enforces formal symbolic invariant rules (such as valid confidence bounds, non-empty outputs, and ZINIUM provenance anchoring) across system state transitions to prevent logical anomalies.

## How it was tested
Tested via `test_invariant_guard.py` verifying successful state passes, out-of-bounds confidence rejection, and unsealed provenance detection.

## What it does NOT do
- Does not automatically rewrite or mutate invalid states (reports failure for quarantine).
- Does not evaluate subjective semantic quality outside formal symbolic rules.
