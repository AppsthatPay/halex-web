# retrieval-tuning — staging draft (PENDING, not gated, not live)

- **Queue entry:** `queue/retrieval-tuning.json` — priority 75, kind
  knowledge, helper lane H3 Verifier.
- **Gate (verbatim):** "PENDING: gates when every tuning change ships
  with a before/after harness case on a real question."
- **Tuning change (staging only, no live file touched):** ranked token
  overlap over pack-pattern tokens, plus a declared synonym map
  (chew/chewing -> gnaw, wires/wire -> wiring, night/active at night
  -> nocturnal) and a related-entries pass that appends the next
  entries of the winning pack when the top score is weak (score <= 2),
  so a weak query surfaces walkable neighbours instead of the generic
  fallback. Synonyms are staging tuning constants, stated in the
  harness, not facts about mice. The corpus is the 6 real entries of
  the staged animals-mice pack (`halex-ai-pack-animals.js`, read
  2026-11-01), reduced to titles and pattern lists — the only fields
  the ranker uses. No entry is invented.
- **Before/after harness cases, both on real questions:**
  - Q1 "tell me about mice" (the gap-mice-20261030 missed question):
    before = real entry "The house mouse"; after = same top entry plus
    related neighbours ("House mouse vs its cousins",
    "Pet mouse care basics"). Tuning does not change the top answer.
  - Q2 "why do mice chew on wires" (a weak paraphrase with no exact
    pattern-phrase match): before = GENERIC FALLBACK; after =
    "How mice live: senses and habits" plus a neighbour, not a repeat.
    This is the tuning case: synonym mapping (chew -> gnaw,
    wires -> wiring) plus token overlap rescues a real question the
    exact-match baseline drops.
- **Harness:** `retrieval-tuning-harness.py`, exit 0, **11 checks pass,
  0 fail** (run 2026-11-01; proof in `retrieval-tuning-proof.json`).
  The harness was inherited from the prior interrupted run
  (~11:47 EST, no draft or proof entry left behind); it ran green
  unchanged this run and is completed by this draft.
- **Gate status:** the gate's condition is met in staging — every
  tuning change here ships with before/after cases on real questions —
  but the entry stays PENDING. The tuning is not applied to any live
  page or pack; applying it is Allen's review decision. This draft is
  not a live change and not a lesson.
- **Files:** `retrieval-tuning-harness.py` (inherited, unchanged),
  `retrieval-tuning-proof.json` (new, from this run),
  this draft.
- **Blocker, plainly:** none in staging; live application awaits
  Allen's review under the SuperAllen gate, which is NOT lifted.
