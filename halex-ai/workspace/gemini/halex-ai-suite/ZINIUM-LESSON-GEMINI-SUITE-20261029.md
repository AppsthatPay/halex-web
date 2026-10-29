# ZINIUM Lesson — HALEX-AI Code Suite v4 (Gemini contribution, Allen gate)

- Observed: Gemini delivered a 9-module general-AI suite after three gated
  returns (catalog, stubs, untested modules). Its v4 rewrites fixed all four
  faults Allen named, and shipped tests for every module.
- Reported: Allen's gate ran Gemini's 9 tests verbatim (all pass), then found
  two further faults: Core matched any word in a context key, so "of" falsely
  matched "capital of France" and answered "Paris" to a Bitcoin price
  question; the Planning test guard was `"main"`, so direct test runs did
  nothing. Both patched in staging with regression tests.
- Learned: A gate that only runs the contributor's own tests misses faults
  the contributor's tests do not cover. Adversarial probes (wrong-context
  questions, direct test runs) belong in every gate pass.
- Index: halex-ai/workspace/gemini/halex-ai-suite/ — 9 modules, 9 test files,
  README with honest limits. Staged for merge 2026-10-29, not yet pushed.
- Provenance: contributor Gemini (seed ZINIUM-SEED-GEMINI); gate + patches
  Allen; human approval Jeffrey Allen Kaufman. Public-safe only.
