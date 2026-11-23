# Proposal: Low-noise learning cache + bounded modify-verify-decide loop + evaluator-driven ecosystem discipline (YiShu5/claude-skills self-improving-agent, GATED; LeoStehlik/autoresearch-loop, GATED; Git-on-my-level/self-improving-agent-ecosystem, GATED) — 2026-11-23

Sources (LICENSEs read verbatim via the GitHub connector, READMEs/SKILL.md read in full, 2026-11-23):
- YiShu5/claude-skills — MIT License, Copyright
  (c) 2026 YiShu5 (LICENSE file SHA
  a76c9dbd87bc2eb4ee50a37f141800deb5cd8fa5).
  Skill file skills/self-improving-agent/SKILL.md
  read in full (file SHA
  ee7bc72bff7ea97c536a37327747985ce66f9055,
  4,676 chars, 133 lines). Root README is the
  repo catalog (3,478 chars, 106 lines, 12
  skills listed, mostly Chinese); only the
  self-improving-agent skill was deep-dived —
  the other 11 skills were not read and are
  NOT gated. Repo: 114 stars, 0 forks, 3 open
  issues, created 2026-03-16, updated
  2026-11-20 (connector search, run time),
  Python, default branch master, not archived.
  Low-noise self-improvement: a `.learnings/`
  write-first cache layer (LEARNINGS.md,
  ERRORS.md, FEATURE_REQUESTS.md) where every
  observation lands first; nothing reaches
  the main system files (SOUL.md, MEMORY.md,
  AGENTS.md, TOOLS.md) without human review.
  Promotion to a system file only when ALL of
  repeated (same insight in 2+ separate
  sessions), verified, user-approved, and
  relevant long-term; SOUL.md changes need
  explicit human review every time. Errors
  and learnings stay in separate logs with
  separate formats (learning: type, context,
  learning, confidence, promote flag; error:
  command/tool, error, root cause, resolution,
  recurrence). "Silence is better than noise"
  — if unsure whether something is worth
  logging, don't log it; prefer updating an
  existing entry over a duplicate; prune stale
  entries on review; no cross-session
  broadcasting of raw learnings, only
  distilled verified content promoted.
- LeoStehlik/autoresearch-loop — MIT License,
  Copyright (c) 2026 Leo Stehlik (LICENSE file
  SHA 48fc6a0350ec226aa6a09ab887ba7e42484ad09d).
  README read in full (file SHA
  533097cd90903ce36c581d260e0ccc2155e71c49,
  4,110 chars, 146 lines). Repo: 1 star, 0
  forks, 0 open issues, created 2026-03-30,
  updated 2026-05-24 (connector search, run
  time), default branch master, not archived.
  Bounded modify-verify-decide loop for a
  measurable goal: one atomic change at a time,
  verified, kept or discarded, repeated only
  within an approved run contract (goal,
  metric, baseline, target, verify command,
  guard command, edit scope and forbidden
  paths, rollback strategy, foreground or
  explicitly approved background mode,
  iteration cap, external-research policy,
  private-data boundary). Verify (did the
  metric improve?) is separate from Guard (did
  anything else break?). Version-control
  snapshots or commits so failures discard
  cleanly. Escalation ladder: REFINE after 3
  consecutive discards, PIVOT after 5, ask
  before external research after 2 PIVOTs
  without improvement, soft blocker — stop and
  report to a human — after 3 PIVOTs; one kept
  iteration resets all counters. Lessons
  extracted after kept iterations and pivots;
  instructions re-read every 10 iterations to
  prevent context drift. The loop must stop
  instead of improvising when the metric cannot
  be measured, scope is unclear, guard files
  need changing, rollback is unsafe, or
  external research would expose private
  material. Foreground review is the default;
  background or unattended operation requires
  explicit approval, fixed scope, rollback
  strategy, and iteration cap.
- Git-on-my-level/self-improving-agent-ecosystem
  — MIT License, Copyright (c) 2026 David
  Zhang (LICENSE file SHA
  c92e086f821a15b25a063f684faf3e75b3f67f56).
  README read in full (file SHA
  af152ee0458e5c0d9e896ea00dbb6db1b707a9c7,
  6,892 chars, 159 lines). Repo: 64 stars, 2
  forks, 0 open issues, created 2026-08-31,
  updated 2026-11-12 (connector search, run
  time), Python, default branch main, not
  archived. Evaluator-driven self-improvement
  reference kit, explicitly not an
  out-of-the-box autonomous agent: three loop
  archetypes sharing the same planes —
  optimize (rank candidates against a scalar
  objective behind a hard correctness gate),
  maintain (drain a work queue through triage,
  candidate, review, publish, merge, outcome
  check, under a WIP limit and a maximum item
  age), observe-to-propose (sensors turn
  telemetry, traces, transcripts, and human
  decisions into proposals, never code). Four
  deliberately separate planes: experiment
  kernel (disposable worktrees, hard scoring,
  verification hooks, accepted-only lineage,
  append-only ledger, stagnation handling),
  workload control plane (sensors, evaluators,
  promotion, deployment, outcome checks,
  rollback), authority and distribution
  (reviewed policy and portable skills; no
  prompt silently grants deployment or
  credential authority), external observation
  (another process or host checks loop
  freshness, lineage gaps, observer blindness,
  delivery health). Correctness and quality
  scored separately; candidates isolated from
  canonical state; a would-be winner is
  adversarially verified; every attempt keeps
  exact evidence and lineage; promotion follows
  external Git and deployment truth; post-deploy
  outcomes close the loop; silence is
  classified, never assumed healthy; progress
  is measured, not liveness — every loop
  declares how long it may go without a
  meaningful transition, and something outside
  it alerts; human decisions are labelled
  evidence; autonomy is earned per class of
  action; authority, budgets, rollback, and
  human gates are explicit. Scaffolds carry a
  MISSION.md (outcome, acceptance evidence,
  authority, non-goals, stop conditions)
  before automation; generated commands fail
  closed until real sensors/adapters are
  configured. Validation helpers use only the
  Python standard library. Non-goals: a
  universal objective function, a fleet-wide
  write agent, an excuse to give an LLM
  production credentials, a replacement for
  domain tests / incident response / human
  approval, a claim that worktree isolation is
  a security sandbox.

## Patterns adopted (restated in our own words only; no code)
- Write-first learning cache with a four-part
  promotion gate (repeated, verified,
  user-approved, long-term relevant) and
  separate error vs learning logs; silence
  preferred over noise; stale entries pruned
  on review; raw learnings never broadcast
  across sessions, only distilled verified
  content promoted.
- Bounded modify-verify-decide loop: one
  atomic change, Verify separated from Guard,
  approved run contract before edits, snapshot
  or commit before each attempt, escalation
  ladder (REFINE / PIVOT / soft blocker),
  lessons after kept iterations and pivots,
  stop-instead-of-improvise conditions.
- Evaluator-driven ecosystem discipline: three
  loop archetypes (optimize / maintain /
  observe-to-propose), four planes with
  authority kept out of prompts, correctness
  gated before quality, candidates isolated
  from canonical state, adversarial
  verification of would-be winners, append-only
  evidence ledger, promotion following Git and
  deployment truth, silence classified never
  assumed healthy, autonomy earned per action
  class, MISSION.md before automation.

## HALEX gate — stricter than the sources
- No unattended or background operation: the
  autoresearch-loop foreground-review default
  is the HALEX rule, and its background mode
  (explicit approval, fixed scope, rollback,
  cap) stays off — HALEX loops run in the
  foreground under the intake/builder gate.
- No auto-promotion anywhere: the YiShu5
  four-part gate is adopted with Jeffrey's
  explicit approval as the deciding part;
  nothing promotes to MEMORY.md, SOUL.md, or
  any live HALEX-AI file without his go-ahead.
- No external code fetch or install: the
  ecosystem repo's AVO-lite installer (fetches
  latest default branch) is excluded outright
  — HALEX never fetches or runs outside code.
- No network code: the ANX receipt publisher
  (loop ledger to Agent Nexus) is excluded.
- No worktree-as-sandbox claim: worktree
  isolation is a separation discipline, not a
  security boundary (the README says so too).
- No deployment or credential authority from
  any loop, skill, or prompt; no model call
  decides a verdict (deterministic rules and
  human gates decide); no provider / API-key /
  wallet / signing / payment code.
- The other 11 skills in YiShu5/claude-skills
  were not read and are NOT gated by this
  proposal.

## NOT adopted
- Any code (no SKILL.md files copied, no
  scripts, no AVO-lite, no installer/scaffold/
  validator scripts, no OpenClaw integration
  file).
- The "battle-tested" repo description and any
  TypingMind listing claim (secondary source,
  not read from the repo).
- The autoresearch-loop "Inspired by Karpathy's
  autoresearch and codex-autoresearch" lineage
  as a HALEX lineage claim (the author's
  statement, recorded as such).
- The ecosystem repo's "reference kit, not a
  ready autonomous agent" framing as a HALEX
  readiness claim (it is the author's own
  framing, recorded as such); the AVO-lite
  upstream link as an endorsement (not opened,
  not fetched).
- Any benchmark, efficacy, or measurement
  figure: none of the three repos publishes
  benchmark figures in the files read here,
  and none is adopted.
- Any star/fork count as quality (114 / 1 / 64
  stars recorded as read at run time only).
- The autoresearch-loop repo is quiet since
  2026-05-24 (~6 months) — recorded, not a
  verdict; the autoresearch-loop repo is 1
  star — recorded, not a verdict.

## Leads checked, not deep-dived this run
- EricTechPro/loop-maker: MIT claimed by a
  secondary Corpusiq page only, 0 stars,
  created 2026-06-24; LICENSE unread — lead
  open for a later run.
- self-learning-skills / solo / agent-md /
  ccglass (OSS Hunter "agent ops stack" article,
  2026-11-16): repo owners not identified in
  the excerpt — leads open; projectmem from
  the same article was already gated
  2026-11-20.
- Weferral: known-stale pattern source.
  Kickrail: AGPL-3.0, ideas only.
  OnDemandWorld erc1400-contracts and
  OpenTokenizedAssetStandard/cross-rail-dvp:
  already gated — not re-dived.
- PromoterKit: marketing-page MIT claim only,
  repo still unidentified — lead open.
  ViralPayouts: repo still 404 on prior runs;
  not re-checked this run — lead carried.
  ContextOS: repo 404 — lead open.
  dualmint-addendum stays pending.
  zinium5-web-fallback-lane stays pending.
