# HALEX-AI Code Suite — Gemini contribution, gated by Allen

## STATUS: suite v5 — pushed to branch halex-ai (2026-10-29)

Suite v4 (Gemini) was the previous live version on branch halex-ai.
Suite v5 keeps the v4 modules and makes two changes: claim_verifier was
rewritten in-house by Allen as a HALEX-AI module (extended negation
handling, seed ZINIUM-SEED-ALLEN), and Gemini's research_synthesis
add-on joined the suite. Both changes passed Allen's confirmation gate
(see gate history below).

General AI first. HALEX-AI is a general AI (research, write, build, plan
anything, for everything and everyone). HALEX-M is the blockchain app.
Blockchain intelligence is ONE branch of this suite (module 9), not the whole.

Seed marker: ZINIUM-SEED-GEMINI. Every module is advisory only, public-safe
only (no keys, passwords, private addresses, wallet or signing code, no live
trading, no funds movement). Consequential actions wait for a human.

## Modules

1. **core_engine** — Answers from the context it is given, or honestly says
   it does not know. Tests: context read, future query refused, empty input,
   stopword false-match guard.
   Does NOT do: real understanding, live lookup, or prediction.
2. **research_engine** — Formats summaries strictly from sources the user
   provides, with claim-to-source attribution. Refuses with no sources.
   Does NOT do: web search, or any claim beyond the provided sources.
3. **writing_assistant** — Whitespace cleanup plus mechanical concise /
   professional transforms, with a change log describing only real changes.
   Does NOT do: real editing judgment or fact changes.
4. **task_planner** — Picks a 3-step plan from deploy, audit, or generic
   branches by goal keywords; final step always requires a human decision.
   Does NOT do: real dependency analysis or execution.
5. **zinium_memory** — Append-only lesson store with provenance
   (observed, reported, learned, source, contributor, timestamp).
   Does NOT do: persistence (in-memory only; lessons end with the process),
   deletion, or correction by overwrite.
6. **claim_verifier** — HALEX-AI in-house module (seed ZINIUM-SEED-ALLEN,
   rewritten for v5). Word-containment check plus a 50-character negation
   window before matched words and a trailing negation check after the
   last matched word; claim words are cleaned of punctuation before
   matching. A heuristic, not semantic proof; negation outside the window
   or in complex phrasing can still fool it.
   KNOWN FALSE-NEGATIVE LIMIT (documented, not hidden): the trailing
   rule is over-broad. Evidence "The sky is blue but not sunny"
   SUPPORTS "the sky is blue" (the "not" attaches to sunny, not to blue),
   but the trailing check marks it unsupported. The "blue not cloudy"
   phrasing is the same class. The test suite carries this as an
   expected-failure test asserting the honest semantic expectation, so
   the limit stays visible instead of being asserted as a pass. The
   genuine improvement kept is negation-after where the negation
   attaches to the claim itself, e.g. "that claim is not true".
7. **safety_auditor** — Flags four known prompt-injection phrases.
   Does NOT catch novel or obfuscated attacks. States this limit itself.
8. **improvement_engine** — Steps one parameter +/-0.01 from a measured rate
   the caller supplies. It never invents the metric; the caller must measure.
9. **token_explainer** — Formats a Token DNA profile into plain English.
   Missing fields say "Not found". Never SECURE/HIGH_RISK, never buy/sell.

## Gate history (2026-10-29)

- v1 (catalog, no code) — returned.
- v2 (23 stubs, hardcoded outputs, no tests) — returned.
- v3 (9 modules, honest framing, no tests) — 5 passed, 4 failed with
  specific faults (Core never read context, Writing claimed unmade changes,
  Verification blind to negation, Planning a fixed template).
- v5 (in-house claim_verifier rewrite, 2026-10-29) — claim_verifier was
  rewritten in-house by Allen as a HALEX-AI module (seed
  ZINIUM-SEED-ALLEN) with extended negation handling: a 50-char
  pre-window plus a trailing negation check for negation that comes
  after the claim words. The confirmation gate caught two faults during
  development, both fixed and covered by tests: (1) the claim word
  "blue." (with period) never matched evidence "blue today" until claim
  words were cleaned of punctuation before matching (regression test
  added); (2) checking only the first occurrence of each matched word
  missed later negations, exposed by the "blue blue not blue" case, so
  windows are now checked around EVERY occurrence. The trailing rule's
  over-broad false-negative ("blue but not sunny" wrongly marked
  unsupported) is documented above and carried as an expected-failure
  test, not a pass. Full suite with the verifier rewrite alone: 33
  tests, 32 pass, 1 expected failure (the documented suffix limit).
- v5 add-on (Gemini research_synthesis, added 2026-10-29) — a
  multi-source verification aggregator over claim_verifier. As pasted it
  failed the gate twice: its test guard read
  `if ____name__ == "__main__":` (NameError, zero tests ran), and its
  aggregation threshold (>= 0.5) counted a 1-of-2 tie as majority
  support, failing 2 of its own 5 cases. Gate fixes in staging: guard
  corrected and tests converted to unittest (same 5 cases, same expected
  values, plus a seed-marker test); threshold changed to strict majority
  (> 0.5). It is an ADD beside research_engine, never a replacement,
  and it inherits claim_verifier's documented suffix false-negative
  limit. Full suite at v5: 39 tests, 38 pass, 1 expected failure (the
  documented suffix limit).

## Run the tests

```
python3 -m unittest discover -s . -p "test_*.py"
```

All tests run offline, no network, no keys.
