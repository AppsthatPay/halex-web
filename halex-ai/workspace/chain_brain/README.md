# Chain-Brain (HALEX-AI ZINIUM Chain expansion)

A memory system, NOT a crypto blockchain. No coin, token, wallet,
consensus, miner, payment, network call, subprocess, or key-handling
code anywhere in this package. Python standard library only.

## What it is

Jeffrey's Chain-Brain: a system of up to 1000 chains (Chain-01 to
Chain-1000), each holding up to 100,000,000 addresses, covered by
one or several workspace agencies per chain, categorized and
interconnected. That is the DESIGN CEILING. What exists and is
tested here is small: a handful of chains, agencies, and records,
with real counts reported by the tests, never a billion-scale
number the tests did not compute.

## Modules

1. `chain_registry.py` -- register/list chains, capacity, space metrics.
2. `space_manager.py` -- byte budgets, caller-supplied TB budget,
   EXPANSION_REFUSED over budget. Budgets, not physical disk.
3. `agency_manager.py` -- contiguous address ranges, overlap refusal,
   removal refused while records are assigned.
4. `memory_store.py` -- text records by chain + agency + category,
   sensitive material refused and stored nowhere.
5. `shard_protocol.py` -- shard map (linkage, not replicated copies),
   routing by category, cross-shard lookup.
6. `division.py` -- divide to a caller-named party/allotment only,
   with lineage and count reconciliation.
7. `interconnect.py` -- exact cross-chain lookup by id or category.
8. `conversational_engine.py` -- Allen-built. Reads a conversation
   message, routes by keyword overlap to stored records, and answers
   in flowing human dialog with a follow-up ("What else about X
   interests you? What else would you like to know?"). Stores
   NOTHING from the conversation. Keyword overlap is routing, not
   understanding, and a miss says so honestly.
9. `ml_deployment_manager.py` -- OLS linear regression on numbers
   (real slope, intercept, mean squared error) and TEXT deployment
   manifests. No ML framework, no cloud API, no provisioning.
10. `browser_bridge.py` + `extension/` -- a localhost-only JSON
    bridge (stdlib http.server, 127.0.0.1 only, POST /api/chain-brain
    only) and a browser extension (manifest, background worker,
    builder UI, inline styles only, no remote scripts). The bridge
    writes text artifacts, queries memory, and answers conversation
    questions through the conversational engine (storing nothing
    from the message). It never executes content, never signs,
    never moves funds, and has no authentication -- local process
    only, by design, never a public address.
11. Builder connection -- `halex_ai_selfbuild/chain_brain_adapter.py`
    lets the builder write records and models onto a JSON snapshot
    under the gate, and `draft_knowledge_from_conversation` turns a
    matched conversation topic into a knowledge DRAFT for gate
    review (the message text itself is never written anywhere).
    This is how the live builder is not idle: it learns topics from
    conversation and writes directories and commits on GitHub through
    the existing self-build loop, gated, never auto-chained.

## Provenance

Modules 1-7 and 9 arrived as text from Gemini (ZINIUM-SEED-GEMINI
on accepted parts). Module 8 is Allen-built. Gemini's cover claim
("17 tests, all OK" / "21 tests, all OK") was NOT taken as verified.
Allen transcribed the code, gate-fixed it (below), and re-ran the
suite independently.

## Gate fixes (Allen, 2026-10-30)

- Division `reconcile_counts` returned `reconciliation_valid: True`
  unconditionally. It now COMPUTES validity (child records must
  equal the moved records, stayed + moved must equal the parent
  total, no duplicate assignments). A probe reconciling against
  the wrong agency now correctly returns False.
- Agency ranges were written into `addresses_used`. Now
  `addresses_reserved` = range sizes, `addresses_used` = records
  actually assigned.
- `verify_coverage` COVERAGE_VERIFIED means no overlaps, NOT full
  coverage of the 100M space. A separate
  `covers_entire_address_space` flag says which is true.
- The bare 64-hex refusal refused plain document hashes. Only
  key-labelled material is refused now; a labelled key is still
  caught by its label pattern.
- Division is logical reassignment: a moved record keeps its parent
  `chain_id` (lineage) and gains a `shard_id`. Parent-chain lookup
  still sees it; agency + shard lookup show the division.
- ML training stored records under hardcoded categories that did
  not match the agency, so the store refused while training still
  claimed TRAINED_MODEL_STORED. Training now stores under the
  agency's category and checks the result; a failed store reports
  TRAINED_NOT_STORED. Constant-x data (undefined OLS slope) is
  refused instead of inventing slope 0.0. Duplicate model ids are
  refused. Blueprints are text manifests, not live deployments.

## Tests

```
cd chain_brain/tests && python3 run_tests.py
```

31 tests pass (17 original Gemini tests + conversational + ML +
browser-bridge tests + Allen gate probes). Run output and the worked example
(3 chains, 1,000,000 bytes to Chain-01, agencies 0-999 and
1000-1999, rec-01/rec-02, rec-02 divided to Allotment-Partner,
reconciliation valid by computation, cross-chain lookup finds
rec-02 on ag-02 with shard id, conversational match on wine
pairing, OLS model slope 2.0 / MSE 0.0, AWS blueprint generated)
were re-run by Allen on 2026-10-30, not copied from Gemini's claim.

## Wiring

- HALEX-AI ZINIUM Chain: a lesson block recording this expansion
  (see the local ZINIUM ledger, family halex_ai, kind
  chain_brain_expansion_20261030). The in-page ZINIUM chain
  (zinium-chain.js) is a separate browser demo chain; this Python
  package is the memory engine behind it, not a replacement for it.
- Autonomous builder: `halex_ai_selfbuild/chain_brain_adapter.py`
  lets the builder write records and train models onto a JSON
  snapshot of a chain-brain, under the same gate (sensitive
  refusal, store-result checks, seal). The builder proposes; the
  gate disposes. The self-build cycle itself was NOT changed to
  auto-run this adapter, and the SuperAllen gate is NOT lifted.
- SERVICE+ note: SERVICE+ is assimilated as stripped intelligence
  only, never displayed, never branded, and SERVICE+ itself stays
  as is. No SERVICE+ record is in this package.
