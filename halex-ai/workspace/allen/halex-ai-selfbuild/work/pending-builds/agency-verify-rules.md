# agency-verify-rules — staging draft (PENDING, not gated, not live)

- **Queue entry:** `agency-verify-rules` — priority 65, kind
  knowledge, helper lane H3 Verifier.
- **Gate (verbatim):** "PENDING: gates when agency tests cover 2-source pass, 1-source label, vendor-figure refusal."
- **What was built (staging only):** `verify_rules.py` — one
  deterministic pure function, `corroborate(claim, sources)`, over
  sources given as dicts `{name, independent, kind}` where kind is
  `"independent" | "vendor" | "primary"` (a vendor source offering a
  figure also carries a `figure` field):
  - 2+ distinct-name, independent, non-vendor sources → verdict
    "verified".
  - Exactly 1 such source → verdict "single-source" with label
    "1-source label — not corroborated".
  - 0 such sources → verdict "unverified".
  - ANY vendor-kind source offering a figure → the verdict includes
    "vendor-figure refused", and the figure is never returned as
    fact (the result carries no figure value at all).
  - Two sources with the SAME name do not count as 2 (dedupe by
    name, first occurrence kept); a vendor source alone never
    verifies, even if it claims independence; a non-independent
    source does not count toward corroboration. Inputs are not
    mutated. No network access, no dynamic code, no invented facts:
    all harness claims are plainly fake (e.g. "widget X costs $5"),
    never real-world claims. The module is not wired into the
    engine: `halex_ai_selfbuild/cycle.py` and every other engine
    file are untouched.
- **Harness:** `agency-verify-rules-harness.py`, exit 0, **10 checks
  pass, 0 fail** (run 2026-11-01; proof in
  `agency-verify-rules-proof.json`). Checks cover all three gate
  limbs plus the guards: 2-source pass; 1-source label;
  vendor-figure refusal (verdict wording and figure never returned);
  same-name duplicate does not pass; 0-source unverified; vendor
  source alone never verifies; non-independent source does not
  corroborate; 2-source pass stands alongside a vendor-figure
  refusal; inputs unmutated.
- **Gate status:** all three limbs of the gate's condition are met
  in staging (2-source pass, 1-source label, vendor-figure refusal
  all covered and passing), but the entry stays PENDING. Engine
  wiring is Allen's review decision. This draft is not a live change
  and not a lesson.
- **Files:** `verify_rules.py` (new),
  `agency-verify-rules-harness.py` (new),
  `agency-verify-rules-proof.json` (new), this draft.
- **Blocker, plainly:** none in staging; engine wiring awaits Allen's
  review under the SuperAllen gate, which is NOT lifted.
