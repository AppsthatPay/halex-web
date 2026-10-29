# HALEX-AI Autonomous Self-Build Loop

Status: installed by Allen on 2026-10-29, on Jeffrey's explicit
order — the self-building software runs inside GitHub, constantly
building itself and learning, autonomously, committing straight
into the `halex-ai` branch (full autonomy was chosen over a
gated-branch design).

## What the loop is

A GitHub Actions workflow, `.github/workflows/halex-ai-selfbuild.yml`
on the `main` branch (scheduled workflows only run from the default
branch), named **HALEX-AI Self-Build Loop**. It triggers every
6 hours (`17 */6 * * *`) and on manual `workflow_dispatch`. Each run:

1. Checks the kill switch (below). If off, exits quietly.
2. Checks out the `halex-ai` branch.
3. Runs the self-build engine's full test suite. It must pass
   before anything else happens.
4. Runs a forbidden-construct scan over the self-build package and
   any newly synthesized files (network, wallet, signing, and
   private-key constructs are refused; the engine is Python
   standard library only).
5. Runs exactly ONE build cycle
   (`python3 -m halex_ai_selfbuild.cycle`): gap scan over the gated
   Gemini suite tree, synthesis of the top synthesizable gap with
   behavioral tests and a mutation check, hash-chain sealing of
   every attempt, foraging over this repository's own `halex-ai`
   tree (the in-GitHub mirror set), and a dated cycle report.
6. Re-runs the full test suites, including any newly synthesized
   module's tests, and verifies the seal chain.

## Kill switch

File: `halex-ai/workspace/allen/halex-ai-selfbuild/SELFBUILD_ENABLED`
on the `halex-ai` branch.

The file currently contains `ENABLED`. **To stop the loop, delete
or rename that file** (or replace its contents — the workflow
checks for the file's existence on the checked-out branch as its
first step). With the file absent, every scheduled run exits 0
quietly and nothing is built or committed. Jeffrey or Allen can
flip it at any time; no other change is needed.

## Green-only commit rule

The loop commits to `halex-ai` **only** when every check passed:
engine tests green before the cycle, forbidden-construct scan
clean, the cycle completed, full suites green after the cycle
(including the synthesized module's own tests and the internal
mutation check), and the seal chain verifies. On any failure the
run fails loudly in Actions and **nothing is pushed** — not even a
quarantine record. Only green cycles land. Commits are authored by
`github-actions[bot]` and the message summarizes the cycle report
(gaps found, synthesized module or none, test result, seal head).

## Audit path

Every cycle attempt — success, failure, or refusal — is sealed
into the engine's append-only hash chain (see
`halex_ai_selfbuild/seal.py`), and every landed change is a normal
git commit on `halex-ai`. Allen's local nightly gated self-review
reads this branch's commit history and the seal chain, verifies
the chain recomputes, and reports drift or unverifiable claims.
The chain proves an entry was not altered after chaining; it is
not cryptographic authorship, and the seed markers are public
provenance labels.

## Bounds

- One synthesis per run; 30-minute workflow timeout; runs never
  overlap (concurrency group `halex-ai-selfbuild`).
- Standard library only. No secrets beyond the workflow's own
  `GITHUB_TOKEN`. No wallet, signing, payment, or network code.
- The loop never touches `gh-pages`, the HALEX-M page, or the
  Gemini suite's gated code, and never pushes the suite's
  `quarantine/` material.
