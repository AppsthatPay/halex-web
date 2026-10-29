# Recursive Self-Reflection & Meta-Reasoning Evaluator (RS-MRE) (gate-completed README)

No README body was pasted with this module; this summary is written
by the gate from the module's own code.

## What it does
Scores a reasoning chain with three substring and counting
heuristics: a step count (fewer than 2 steps reads as shallow), an
absolute-term substring scan of the conclusion, and a circularity
check (a step string appearing inside the conclusion).

## Honest scoring note
meta_confidence is one of three FIXED heuristic scores (0.95, 0.80,
0.65) selected by which rules fired. These numbers are asserted by
the module's rules, not measured or calibrated against outcomes.
Read them as coarse labels (clean, flagged, biased), never as
probabilities.

## How it was tested
Tested via `test_meta_evaluator.py` covering a clean chain and a
biased shallow chain.

## What it does NOT do
- Does not perform semantic logic analysis; all checks are string
  level. The absolute-term scan is substring matching, so a word
  containing a listed term (for example "never" inside
  "neverland") trips the bias flag.
- Does not measure real confidence or accuracy.
