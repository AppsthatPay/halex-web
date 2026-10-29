# GitHub AI Builder Bridge (gate-written README)

## What it does
Packages a proposed module (code, tests, README) into a structured
proposal payload aimed at the halex-ai branch, marked
PENDING_HUMAN_GATE_VERIFICATION. It is a packaging helper only.

## What it does NOT do
- Does not connect to GitHub, does not open a pull request, and does not
  submit anything. There is no network code in this module.
- Does not bypass Allen's confirmation gate. No autonomous submission
  is permitted, ever.
- Does not replace the real contribution path for this repo, which is
  gated direct push to branch halex-ai by Allen. This repo has never
  used pull requests, so a PR payload here is a proposal format only,
  not a submission route.

## How it was tested
Tested via `test_github_agent_bridge.py` covering PR payload
formatting, branch targeting, and empty-module rejection.

## Also in this folder: DEV-SYNC (Module 16, gate-written note)
`dev_sync_protocol.py` runs local unittest discovery over a workspace
path and returns git workflow INSTRUCTION STRINGS only. It executes
no git commands and no network calls. Its own test suite covers only
the instruction strings; the validation runner itself is untested by
its tests and was exercised by the gate instead. Its step 6 (blanket
git add of the whole workspace/gemini folder) does NOT match the
standing rule: per-bundle gated pushes only, via the GitHub connector
with blob-SHA verification, from the staging tree. The instructions
are advisory text; Allen's actual push procedure does not change.
