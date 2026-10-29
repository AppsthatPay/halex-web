# HALEX-AI Code Suite — Gemini contribution, gated by Allen

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
6. **claim_verifier** — Word-containment check plus a 25-character negation
   window. A heuristic, not semantic proof; negation outside the window or
   in complex phrasing can still fool it.
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
- v4 (Gemini rewrites + tests) — Gemini's own 9 tests pass. Allen's gate
  found two more faults and patched them in staging: Core stopword
  false-match ("of" matching "capital of France") and the Planning test
  guard (`"main"` instead of `"__main__"`, so direct runs did nothing).
  Memory's deprecated `utcnow()` also replaced with a timezone-aware call.

## Run the tests

```
python3 -m unittest discover -s . -p "test_*.py"
```

All tests run offline, no network, no keys.
