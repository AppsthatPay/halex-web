# HALEX-AI Code Suite — Gemini contribution, gated by Allen

## STATUS: suite v5 live; v6 candidate gated, NOT pushed (2026-10-29)

A v6 candidate bundle (System Kernel plus Modules 10 to 17, 19,
20, and 22, the GitHub Builder Bridge, and DEV-SYNC; Modules 18
and 21 returned to quarantine) passed Allen's confirmation gate in
staging on 2026-10-29 and is listed below. A follow-on gate the
same day (Modules 23 to 30 plus an app_main orchestration
proposal) accepted only Module 28, as a labelled simulation, and
returned Modules 23, 24, 25, 26, 27, 29, and 30 to quarantine;
the proposal was rejected as production code and never staged. It has NOT been pushed:
pushes stay per-bundle, gated, and blob-verified via the GitHub
connector. This README is the corrected architecture record for the
suite; contributor summary documents that disagree with the staged
tree and the gate verdicts are not authoritative.

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

## v6 candidate additions (Gemini, gated by Allen 2026-10-29, NOT pushed)

Folders under this suite directory, flat imports, per-folder tests:

- **kernel/** System Kernel: execution envelopes, branch registry,
  response contract check (provenance is a plain string marker, not
  cryptography; envelope is a plain dict). 4 tests.
- **dialectic/** Module 10, Multi-Perspective Dialectic Engine:
  word-overlap empirical lens, word-count logic lens, quantifier
  critique. Heuristics, not truth. 3 tests.
- **drift/** Module 11, Epistemic Drift Monitor: exact-match axiom set
  diff with drift ratio. No semantic matching. 3 tests.
- **invariant/** Module 12, Invariant Guard: state audits (non-empty
  response, confidence bounds, any ZINIUM-SEED-* provenance marker
  after the gate patch). 3 tests.
- **memory_graph/** Module 13, Epistemic Memory Graph: in-memory node
  and edge store, session-scoped only, add_node overwrites silently.
  3 tests.
- **scheduler/** Module 14, Resource Scheduler: keyword and domain
  routing to branch names. Heuristic routing only. 3 tests.
- **builder/** GitHub Builder Bridge: packages a module into a
  proposal payload; no network, no submission, ever. Plus Module 16
  DEV-SYNC: local unittest discovery plus git instruction strings
  (advisory text; the gate push procedure is unchanged). 3 tests.
- **fault_tolerance/** Module 15, Fault Tolerance: fallback
  substitution with failure counts; the breaker reports tripped but
  does not block, and a raising fallback propagates. 2 tests.
- **fuzz_testing/** Module 17, Fuzz Simulator: 7 fixed malformed
  payloads run sequentially; handled versus unhandled is a message
  substring heuristic. 1 test.
- **learning/** Module 20, Active Learning (AER-ALL): batch success
  rate moves all three policy weights by one uniform step of 0.05,
  clamped to [0.5, 2.0]; no provenance check on inputs despite the
  module README's claim. 3 tests.
- **p2p_mesh/** Module 22, Peer Mesh Coordinator (P2P-TDS):
  in-memory peer registry and first-eligible assignment records.
  No transport, no delivery, no signing. 3 tests.
- **meta_reflection/** Module 19, Meta-Reasoning Evaluator
  (RS-MRE): string-level chain heuristics; meta_confidence is one
  of three fixed asserted scores (0.95, 0.80, 0.65), not measured
  confidence. 2 tests.
- **economic_engine/** Module 28, Economic Resource Allocator
  (AERA-CMS): SIMULATION ONLY. A fictional in-memory
  compute-credit treasury with real debit arithmetic (overdrafts
  rejected), plus a static two-rate fee estimate that is a
  made-up model, not any real chain's fees. No real funds,
  wallets, signing, or payments anywhere. 3 tests.

Combined v6 candidate totals: 75 tests (39 existing plus 36 new),
74 pass plus the 1 documented claim_verifier expected failure.
Modules 18 (DOC-GEN) and 21 (UIG-IS) were RETURNED at the first
gate, and Modules 23, 24, 25, 26, 27, 29, and 30 at the follow-on
gate; all sit in quarantine/, not in the suite and not in these
totals.

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

- v6 candidate (Gemini Kernel plus Modules 10 to 17, 19, 20, 22,
  Builder Bridge, DEV-SYNC; gated 2026-10-29, staging only, NOT
  pushed) — contributions staged and tested (33 new tests, all
  passing after patches). Gate patches, each documented in the
  gate report: Kernel utcnow replaced with timezone-aware UTC;
  Kernel "cryptographic provenance seal" error text corrected to
  a plain marker check; stray assignment removed from the Kernel
  test; Dialectic test fixed to assert the quantifier critique
  anywhere in the critique list (as written it asserted position
  0 and failed); Invariant Guard provenance rule widened from
  Gemini's seed only to any ZINIUM-SEED-* contributor marker;
  package-style test imports (Modules 19, 20, 22) converted to
  the suite's flat import style; Module 22 docstring and README
  stripped of "cryptographically signed" and "securely delegates"
  claims (no signing or transport exists); Module 19 docstring
  and README state that meta_confidence is a fixed heuristic
  score, not measured confidence. Modules 18 (DOC-GEN) and 21
  (UIG-IS) RETURNED for fabricated verification and execution
  claims; staged in quarantine/ as evidence, excluded from
  totals. Gemini's accompanying blanket stage-and-push
  instruction was declined; pushes remain per-bundle, gated,
  connector-based, blob-verified.

- v6 candidate follow-on (Gemini Modules 23 to 30 plus the
  app_main orchestration proposal; gated 2026-10-29, staging
  only, NOT pushed): Module 28 (economic allocator) accepted as
  a clearly labelled simulation only: fee status renamed
  FEE_OPTIMIZED_SUCCESSFULLY to FEE_ESTIMATED, monetization and
  self-sustainability claims removed, fee model labelled a
  made-up static heuristic. Modules 23 (grafting that stores
  nothing), 24 (self-certifying code generator), 25 (fabricated
  Byzantine consensus status; integrity check blind to content
  tampering and history rewrites), 26 (telemetry welding that is
  a list append; invasive seed framing against the project's
  community-never-invasive doctrine), 27 (daily sweep that
  contacts nothing), 29 (fuzz that executes nothing; a fixed
  exception-swallowing patch template), and 30 (a daemon that is
  a counter and two status strings) RETURNED to quarantine with
  probe evidence in the gate report addendum. The app_main
  proposal was rejected as production code: a nonexistent kernel
  import, three quarantined components wired as singletons,
  OPERATIONAL and 28-subsystem claims false under gate state,
  and third-party dependencies against the stdlib-only rule.
  Gemini's blanket push instructions in this stream, and its
  instruction to start the Module 30 daemon, were declined.

## Run the tests

```
python3 -m unittest discover -s . -p "test_*.py"
```

All tests run offline, no network, no keys.
