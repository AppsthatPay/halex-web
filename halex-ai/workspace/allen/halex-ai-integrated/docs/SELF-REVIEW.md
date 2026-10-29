# The Nightly Gated Self-Review Cycle

Written by Allen (ZINIUM-SEED-ALLEN), 2026-10-29. Approved by Jeffrey
2026-10-29 ~17:02 EDT. Runner: `self_review.py` at the root of this
integrated tree.

This cycle is the honest counterpart to Gemini Module 30's daemon
claims: that module reported self-review cycles it never ran, while
this one runs, records, and can be checked.

## What one pass does

1. TESTS: runs both unittest suites (this integrated tree and the
   staged Gemini suite tree) by per-directory discovery, and records
   per-suite and per-location pass/fail counts exactly as they came
   back.
2. DRIFT: compares the staged suite's on-disk module inventory against
   the completed gate report's verdict table. Folders on disk that the
   table does not name, and folders the table names that are missing,
   are flagged. The quarantine folders are hash-checked against a
   stored baseline; the first pass creates the baseline and says so in
   its record.
3. STATUS-CLAIM SCAN: searches both trees' code for returned status
   strings containing VERIFIED, SUCCESSFUL, EXECUTED, or COMPLETE, and
   lists every hit as a REVIEW ITEM for a human. A hit is not a
   verdict. Most are legitimate; the two modules the v6 gate returned
   were caught by this smell, applied by hand, and this scan is that
   hand, systematized.
4. RECORD: writes a dated JSON and Markdown record into `self-reviews/`
   and appends improvement ideas to `self-reviews/PROPOSALS.md` as
   PROPOSALS, each marked: requires Allen gate review, never
   auto-applied.

## Hard bounds

The script never modifies any module file in either tree; its only
writes are inside `self-reviews/`. It never runs git, never installs
anything, and never touches the network. Its only subprocess use is
running unittest discovery. It issues no verdicts: it produces
evidence and proposals for Allen's gate.

These bounds are proven, not just stated: tests_integration/
test_self_review.py copies the tree, hashes every source file, runs a
pass, and asserts every hash is unchanged while the records exist.

## How the nightly run works

The cron (`halex-ai-nightly-self-review`, set up separately by Allen)
runs the script, reads the dated record, and reports the verdict to
Jeffrey in the main chat: pass or fail counts, drift items, and any
proposals filed. Proposal text goes nowhere else and changes nothing
until Allen gates it. The cron may write its records under the goal's
hidden_files/self-reviews/ folder instead of the tree's own folder, by
passing `--out`; the script is the same either way.

Run it by hand any time:

```
python self_review.py
python self_review.py --integrated PATH --staged PATH --gate-report PATH --out PATH
```
