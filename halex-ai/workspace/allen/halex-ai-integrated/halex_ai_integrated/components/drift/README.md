# Epistemic Drift & Temporal Consistency Monitor (ED-TCM)

## What it does
Tracks changes in foundational knowledge axioms across temporal versions, computing drift ratios and explicitly flagging deprecated or invalidated baseline assumptions.

## How it was tested
Tested via `test_drift_monitor.py` covering stable knowledge nodes, moderate drift transitions, and invalid empty payload inputs.

## What it does NOT do
- Does not automatically delete historical nodes from the append-only ZINIUM ledger.
- Does not resolve semantic equivalence of differently-worded axioms without exact matching.
