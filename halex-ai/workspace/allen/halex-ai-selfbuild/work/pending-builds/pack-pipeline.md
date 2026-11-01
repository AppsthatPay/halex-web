# pack-pipeline — staging draft (PENDING, not gated, not live)

- **Queue entry:** `queue/pack-pipeline.json` — priority 75, kind knowledge,
  helper lane H9 Pack Maker.
- **Gate (verbatim):** "PENDING: gates when one full pipeline run is
  demonstrated on a real gap."
- **What this draft demonstrates:** one full intake -> pack -> page run,
  in staging only, on a real gap: the fauna-intake-mammals deer mouse
  intake record (`fauna-intake-mammals-deer-mouse.json`, drafted
  2026-11-01 from ADW, Mammals of Texas, and Oregon State sources
  actually read that run).
  - Stage 1 (intake): the staging record is read, not re-asserted.
  - Stage 2 (pack): `pack-pipeline-pack.json` is built from the record
    only — one entry, deer mouse (*Peromyscus maniculatus*), summary
    taken from the record's own appearance summary, images NOT READ,
    status marked STAGING DRAFT.
  - Stage 3 (page): a manifest entry + proposed page diff are recorded
    in `pack-pipeline-proof.json` as PROPOSED ONLY. No live pack file
    and no live page file was touched; the script asserts no live pack
    or page path appears in its outputs.
- **Harness:** `pack-pipeline-run.py`, exit 0, **12 checks pass, 0 fail**
  (run 2026-11-01).
- **Correction made in-run, honestly:** the harness inherited from the
  prior interrupted run read top-level intake keys, but the deer-mouse
  record nests its fields under `record`, so its first run here failed
  2 checks (provenance, species naming) at 10/12. The script was fixed
  to resolve the nested record (no field invented, summary now taken
  from the record's appearance summary); the re-run is green 12/0 and
  the first 10/12 run is superseded, not hidden. The inherited files
  themselves (`pack-pipeline-run.py`, `retrieval-tuning-harness.py`,
  dated 2026-11-01 ~11:47 EST) arrived without drafts or a proof-log
  entry — this draft completes the pack-pipeline half of that
  interrupted work.
- **Gate status:** the staging demonstration exists and passes, but
  the entry stays PENDING. Promotion needs Allen's review: the pack is
  a staging artifact, the page step is a proposal only, and folding
  the deer-mouse record into any live fauna pack is Allen's decision.
  This draft is not a live pack, not a page change, and not a lesson.
- **Files:** `pack-pipeline-run.py` (fixed in-run, see above),
  `pack-pipeline-pack.json` (new), `pack-pipeline-proof.json` (new),
  this draft.
- **Blocker, plainly:** none in staging; the live-page step awaits
  Allen's review and push decision under the SuperAllen gate, which
  is NOT lifted.
