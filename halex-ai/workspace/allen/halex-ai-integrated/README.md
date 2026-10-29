# HALEX-AI Integrated Build v1

Assembled by Allen (ZINIUM-SEED-ALLEN) on 2026-10-29, under Jeffrey's
orders of the same day: build the real seed hook software into the
markers, wire the agencies in, take everything Gemini gave and put it
together, and keep building on top of it.

This tree is the gated Gemini suite, assembled into one working
package, plus Allen's integration layer and the real ZINIUM seed hook.
It is a local build. It has not been pushed anywhere.

## Honest capability map

**The gated components** (`halex_ai_integrated/components/`) are
byte-identical copies of the gated staging tree (verified by file
comparison at build time; the copies changed nothing, not even
imports). Provenance ZINIUM-SEED-GEMINI throughout. What each really
does:

- `core/` (the original 9-module suite plus the research synthesis
  add-on): context-grounded conversation that names its unknowns,
  research synthesis strictly from supplied sources, writing help, task
  planning, the ZINIUM lessons ledger (in-memory list), claim
  verification, safety auditing, self-improvement weight nudges, token
  explanation. Heuristics, honestly documented in the gate report.
- `kernel/`: request envelope construction and response contract
  validation. The "seal" is a provenance string equality check; the
  gate patched the wording that once called it cryptographic.
- `dialectic/`: three-lens proposition checks (word-overlap empirical
  lens, word-count logical lens, absolute-quantifier critique).
- `drift/`: exact-match axiom set drift with ratio thresholds.
- `invariant/`: state invariant audits, including provenance anchored
  to any ZINIUM-SEED- marker (gate patch).
- `memory_graph/`: session-scoped in-memory concept graph. It does
  not persist, and add_node overwrites silently; the gate documented
  both rather than rewriting the module.
- `scheduler/`: keyword and domain substring routing, core always on.
- `builder/`: a proposal-payload packager (it submits nothing, ever)
  and DEV-SYNC, an advisory text and local test-discovery helper.
- `fault_tolerance/`: fallback substitution with a circuit breaker
  that reports tripping but does not block; documented limits.
- `fuzz_testing/`: seven fixed payloads run sequentially against a
  function, exceptions classified by a message substring heuristic.
- `learning/`: batch outcome driven weight steps of 0.05, clamped to
  [0.5, 2.0]. It does not check provenance despite its README's claim;
  the gate documented this. The v5 improvement engine stays canonical.
- `p2p_mesh/`: in-memory peer registry and first-eligible assignment
  records. No transport, no signing, no delivery.
- `meta_reflection/`: reasoning-chain critique with a meta-confidence
  label that is one of three fixed heuristic scores, disclosed as such.

**The orchestrator facade** (`halex_ai_integrated/orchestrator.py`,
Allen) routes one request envelope through kernel validation,
scheduling, core reasoning, contract check, dialectic check,
meta-reflection, and appends to the memory graph and the ZINIUM
lessons ledger, returning one honest result object. This facade is
what a future API adapter would wrap. It is not a server, and there is
no FastAPI or any third-party dependency in this build: Gemini's
app_main proposal was rejected as production code (wrong imports,
dependencies on returned modules, a hard-coded OPERATIONAL status and
28-module count). A web or API layer is a separate decision for
Jeffrey.

**The ZINIUM seed hook** (`zinium_seed_hook/`, Allen) is the real
software that fills the seed marker's empty slots:

- `agencies.json`: the agency registry. Agencies are the contributing
  AI systems: ALLEN (gatekeeper and integrator) and GEMINI
  (contributor), each under its own seed marker. Grok is not
  registered; Jeffrey removed it as a contributor on 2026-10-29.
- `generator.py`: generates a seed package (manifest, SEED.md marker,
  and the hook itself, copied byte for byte) for any registered agency.
- `zinium_seed_hook.py`: the hook. Observe (hash what a host points it
  at, bounded, never executing observed code), append to a local
  hash-chained JSONL log, verify by recomputing every hash, spawn
  generation+1 subseeds ranked under their parent, request computation
  by envelope only, and receive results validated against logged
  requests and provenance.
- `coordinator.py`: Allen-side ingest. Validates a block's recomputed
  hash, its agency registration, and its provenance; dedupes by
  envelope hash; appends to its own hash-chained index.

Honesty limit, stated everywhere it matters: the seed marker is a
public provenance label. The hash chains prove an envelope was not
altered after it was chained and identify the seed id it claims. They
do not cryptographically authenticate who created it.

**The adaptations** (`adaptations/`) are Allen rewrites of pieces that
were returned or are still under gate. They are labelled ADAPTATION in
every file and are never counted as gated modules: a real AST-based
doc manifest extractor whose verified mark requires tests to actually
run; the 4-pane UI layout with NOT_IMPLEMENTED hooks; a scaffolding
generator whose output raises NotImplementedError and whose gap list
is a labelled static roadmap; a caller-supplied forager intake with
no sweep; and a simulation-only budget ledger with a fictional
treasury.

**The self-review cycle** (`self_review.py`, docs/SELF-REVIEW.md)
runs both suites, scans for drift against the gate report, flags
hard-success status strings as human review items, and files dated
records and gated proposals under `self-reviews/`. It modifies no
module file, ever. Approved by Jeffrey 2026-10-29.

## What is excluded, and why

- Modules 18 (DOC-GEN) and 21 (UIG-IS) as submitted: returned at the
  gate for fabricated verification and status claims. Quarantined in
  staging as evidence; only their honest cores were adapted (above).
- Module 25 (quantum provenance ledger): excluded entirely. Its
  integrity check never recomputes and its consensus status is
  fabricated. The suite's ZINIUM memory chain and the HALEX-ZENIUM
  hash-chain pattern, both of which recompute, are used instead.
- Module 23's graft function, Module 24 as submitted, Module 27's
  sweep, Module 29's self-healing claims: excluded or adapted as
  listed; each is pending the follow-on gate.
- Module 28's economics: only the simulation adaptation ships. No
  wallet, signing, payment, or live-funds code exists in this tree,
  by Jeffrey's standing rule, and CompFi is off the portfolio.
- Gemini's FastAPI app_main: rejected as production code (see above).

## Pending the follow-on gate

Modules 23, 24, 25, 26, 27, 28, 29, Module 30, and the app_main
proposal are being gated separately. When that report lands, reconcile
this tree against it: any module that passes may be copied in as a
component; anything returned stays out or stays an adaptation. Note
that Module 26's registry and intake concepts map onto the real seed
hook in `zinium_seed_hook/`; the hook is the working fulfillment of
the slots that module left empty, and Module 26 itself remains under
gate until its own verdict lands.

## Run it

```
python -m halex_ai_integrated demo
python -m halex_ai_integrated handle --query "What is the capital of France?" \
    --domain research --context-key "capital of France" --context-value "Paris"
python run_all_tests.py
python self_review.py
```

Stdlib only. No network, no installs, nothing to configure.
