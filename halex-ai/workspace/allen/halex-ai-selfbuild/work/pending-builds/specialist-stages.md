# specialist-stages — staging draft (PENDING, not gated, not live)

- **Queue entry:** `queue/specialist-stages.json` — priority 75, kind
  knowledge, helper lane H3 Verifier.
- **Gate (verbatim):** "PENDING: gates when per-stage tests pass and
  the orchestrator flow is unchanged when stages are absent (additive
  only)."
- **What was built (staging only):** `specialist_stages.py` — four
  deterministic stage functions over a staging task dict, plus a
  staging orchestrator flow `run_flow(task, stages=None)`:
  - researcher: passes through only evidence the task already states;
    empty evidence yields empty findings, never an invented finding.
  - verifier: a finding verifies only if its source string is
    non-empty.
  - compiler: renders verified findings into a staging draft; any
    unverified finding is listed under an UNVERIFIED section, never
    promoted.
  - builder: assembles a staging bundle naming the task and whether
    a draft is present.
  - No stage mutates its input. No stage is a running agent, and
    none is wired into the engine: `halex_ai_selfbuild/cycle.py` is
    untouched. The stages are a staging demonstration of the pattern,
    not an engine change.
- **Harness:** `specialist-stages-harness.py`, exit 0, **14 checks
  pass, 0 fail** (run 2026-11-01; proof in
  `specialist-stages-proof.json`). Per-stage tests cover all four
  stages plus the empty-evidence guard; the additive-only half runs
  the same flow with stages absent and with all four stages present
  and checks that the baseline fields (id, kind, notes, steps) are
  identical and that stages only add a `stage_results` key, and that
  the input task is unmutated.
- **Gate status:** both halves of the gate's condition are met in
  staging, but the entry stays PENDING. Wiring stages into the real
  orchestrator is Allen's review decision, and the stages must never
  be described as running agents. This draft is not a live change
  and not a lesson.
- **Files:** `specialist_stages.py` (new),
  `specialist-stages-harness.py` (new),
  `specialist-stages-proof.json` (new), this draft.
- **Blocker, plainly:** none in staging; engine wiring awaits Allen's
  review under the SuperAllen gate, which is NOT lifted.
