# Add-on: research_synthesis (ResearchSynthesizer) — suite v5 add-on

Contributor: Gemini, seed ZINIUM-SEED-GEMINI. Gated and patched by Allen on
2026-10-29 at Jeffrey's direction ("Stage the patched version as a v5 add-on").

What it is: a multi-source aggregator. Given one claim and a list of
plain-text sources, it runs ClaimVerifier per source and reports whether a
strict majority of the sources support the claim, with the supporting
sources listed. It is an add-on beside research_engine.py, not a
replacement: research_engine formats attributed summaries from titled dict
sources; this module counts verifier verdicts over plain-text sources.

Gate results on the as-pasted code:
- Direct run of its test file failed with NameError before any test
  executed: the run guard read `if ____name__ == "__main__":`.
- With only the guard fixed in a temp copy: 3 of 5 cases passed. The 2
  failures ("negation after in one source", "mixed support") shared one
  root cause: the threshold `supported_count / total_sources >= 0.5`
  counted a 1-of-2 tie as supported, contradicting the module's own
  "majority" wording.

Patches applied in staging:
1. Threshold changed to strict majority `> 0.5`.
2. Test file converted to unittest (same 5 cases, same expected values,
   plus a seed-marker test) with the guard corrected, so the suite's
   unittest discovery runs it.
3. ClaimVerifier import moved to module top level; unused typing import
   dropped. No logic change beyond the threshold.

Honest limit: the aggregator inherits ClaimVerifier's documented
over-broad suffix false-negative (see README module 6). "The sky is blue
not cloudy" counts as not supporting "the sky is blue"; semantically the
"not" attaches to "cloudy". Per-source verdicts bound the aggregate.

Standing checks: stdlib imports plus the local claim_verifier module only.
Fully offline. No fees, no network, no wallet, signing, or payment code.
This add-on ships as part of suite v5 on branch halex-ai (pushed
2026-10-29); the gate record also lives in the suite README.
