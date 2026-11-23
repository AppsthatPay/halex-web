# Proposal: Loop-scaffolding wizard + golden-path harvest + shared agent workspace discipline (EricTechPro/loop-maker, GATED; Kulaxyz/self-learning-skills, GATED; solo-agent/solo, GATED) — 2026-11-23

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-23):
- EricTechPro/loop-maker — MIT License, Copyright
  (c) 2026 Eric Tech (LICENSE file SHA
  0315882e02a459db076c45f833cc48d37d955039).
  README read in full (file SHA
  b098defeaf54fbc68174e1f833caef0d1fb988d9,
  4,128 chars, 102 lines). Repo: 76 stars, 12
  forks, 0 open issues, created 2026-06-24,
  updated 2026-10-29 (connector search, run
  time), default branch main, not archived.
  A portable agent skill (Claude Code, Codex,
  Hermes, OpenClaw) that interviews the user
  with 7 questions — goal as a checkable
  true/false condition, trigger, discovery,
  action, verification by a separate judge,
  state, human gate — and scaffolds a
  self-running loop (SKILL.md + STATE.md +
  verifier script + stop condition). Catches
  the three classic loop failures before any
  code is written: no separate verifier (the
  agent judging its own work), changing state
  leaked into the skill file (memory lost
  between runs), no stop condition (a loop
  that runs forever and burns budget). The
  human gate (question 7) is non-skippable:
  irreversible actions always wire in an
  approval step, no override. Explicitly not
  a runtime — it scaffolds loops, it does not
  execute them; loops run as a separate skill
  or cron job. A zero-dependency Python 3
  helper renders the wizard progress bar,
  breadcrumb, and blueprint box. The
  secondary Corpusiq listing said 0 stars;
  the live GitHub count at run time is 76 —
  live governs, and the secondary figure is
  recorded as stale, not adopted.
- Kulaxyz/self-learning-skills — MIT License,
  Copyright (c) 2026 kulaxyz (LICENSE file SHA
  00e1f9f597aee442dd3391f6b9ba9c0467ff8327).
  README read in full (file SHA
  aa3037781b56aab17b547702f997207bc4f39174,
  5,851 chars, 146 lines). Repo: 926 stars, 50
  forks, 3 open issues, created 2026-06-28,
  updated 2026-11-23 (connector search, run
  time), default branch main, not archived.
  A meta-skill for AI coding agents (Claude
  Code, Cursor, any AGENTS.md reader) that
  teaches the agent to notice the moment it
  has just earned a reusable golden path and
  persist it where the tool will auto-load it
  next time. Three-step loop: recognize the
  moment (a task that only worked after
  several tries, a non-obvious command, a
  project fact not known up front, a recurring
  workflow, or the user saying "remember
  this"); capture it with no prompt needed,
  storing the procedure plus a note on what
  did not work; reuse, with the entry loading
  automatically next session. Triage routes
  each lesson by granularity: a multi-step
  reusable procedure becomes a skill/rule; a
  single fact or one-line correction goes to
  lightweight notes/memory; a genuine one-off
  is skipped. The promotion rule decides
  confidence: a session is promoted to an
  authoritative skill only when ALL three
  hold — a passing check (the path was
  actually verified: a test passed, a clean
  exit, a green build), a named failure
  pattern (the failure it avoids or
  diagnoses, named), and at least one ruled-out
  dead end (a concrete approach tried and
  eliminated). "Seemed to work" does not
  count; missing any one, the lesson stays a
  tentative memory note. Safety: harvested
  skills/rules are committed and shared, so
  the skill is built to never write secret
  values — no passwords, tokens, connection
  strings, or API keys; it records only where
  to find a secret (env var name, a
  client/selector function, an MCP tool, a
  secret manager). Install routes include an
  npx community skills CLI, a Claude Code
  plugin marketplace entry, and manual copy;
  the npx/CLI/plugin routes are install
  mechanisms, not patterns adopted here.
- solo-agent/solo — MIT License, Copyright
  (c) 2025-2026 fredal (LICENSE file SHA
  08f970c4d7fab7a22f37d5bd33b9f1ce41890bc0).
  README read in full (file SHA
  5a2e7762677d09a4d478f003c9bf60cd2c6ca04a,
  6,581 chars, 152 lines). Repo: 606 stars, 53
  forks, 12 open issues, created 2026-06-12,
  updated 2026-11-23 (connector search, run
  time), Go, default branch master, not
  archived. An open-source, local-first
  workspace where humans and AI coding agents
  collaborate through channels, threaded
  conversations, task boards, and
  channel-scoped teams. Deliberately a
  workspace, not a company simulator: agents
  can be mentioned, assigned, reviewed,
  remembered, and trusted with visible work;
  no org-chart role-play. Channels, DMs, and
  threads share messages, files, and task
  context; every task keeps its discussion
  thread attached to a Kanban card
  (assignment, subtasks, review, artifacts,
  history move together); agent team templates
  (an official workflow, or a described goal
  previewed as roles and relationships)
  create agents scoped to one channel;
  thinking mode branches a conversation into
  focused lines of reasoning in their own
  contexts and brings the useful conclusions
  back to the parent thread; per-agent
  overrides for system prompt, model name,
  custom env, and custom args; persistent
  memory per agent (a MEMORY.md loaded into
  future sessions); observability — live agent
  runs, session transcripts, and team usage
  trends from one dashboard. Three local
  layers: a Go server (WebSocket hub, auth,
  PostgreSQL persistence), a daemon managing
  agent subprocesses, and an agent CLI that
  reads stdin/stdout while Solo supplies
  prompts, memory, and collaboration tools.
  Backends auto-detected from PATH: Claude
  Code, Codex CLI, OpenCode, Hermes, OpenClaw.
  Tradeoff stated in the README: this is a
  server you run, and it earns its keep only
  when genuinely juggling several agents or
  several people against one queue of work.

## Patterns adopted (restated in our own words only; no code)
- Loop-scaffolding interview: before any loop
  exists, seven questions with checkable
  answers — goal as a true/false test,
  trigger, discovery, action, verification by
  a separate judge, external state, human
  gate — and the three failure catches
  (separate verifier, state outside the skill
  file, stop condition) applied as a
  pre-scaffold checklist.
- Golden-path harvest with a three-part
  promotion rule: recognize the moment, capture
  the procedure plus what did not work, reuse
  next session; promote to an authoritative
  skill only on a passing check AND a named
  failure pattern AND a ruled-out dead end;
  triage by granularity (procedure to skill,
  fact to notes, one-off skipped).
- Shared-workspace discipline: channels with
  attached task threads, Kanban tasks with
  review and artifacts, channel-scoped agent
  teams, thinking-mode branches that return
  conclusions to the parent thread,
  per-agent memory loaded into future
  sessions, and one observability surface for
  live runs, transcripts, and usage — with
  the README's own tradeoff kept: a workspace
  server earns its keep only at multi-agent
  scale.

## HALEX gate — stricter than the sources
- No unattended or background operation: the
  loop-maker scaffold is a design-time
  checklist, never a running loop; HALEX loops
  run in the foreground under the intake /
  builder gate, and the human gate is
  non-skippable — irreversible actions always
  ask Jeffrey first.
- No auto-promotion anywhere: the golden-path
  three-part rule is adopted with Jeffrey's
  explicit approval as the deciding part;
  nothing promotes to MEMORY.md, SOUL.md, or
  any live HALEX-AI file without his go-ahead.
  A passing check, a named failure pattern,
  and a ruled-out dead end are necessary,
  never sufficient.
- No secrets in harvested material, ever: the
  self-learning-skills safety rule is adopted
  as a hard rule — harvested lessons record
  only where a secret lives (env var name,
  secret manager), never the value.
- No external code fetch or install: the npx
  skills CLI, plugin marketplace, and
  curl-append install routes are install
  mechanisms, not patterns; HALEX never
  fetches or runs outside code.
- No server, database, daemon, or provider
  machinery from Solo: no Go server, no
  PostgreSQL, no WebSocket hub, no auth
  system, no agent subprocess management, no
  network / wallet / signing / payment /
  API-key code. Only the workspace,
  task-thread, and memory disciplines are
  adopted, as patterns.
- No model call decides a verdict:
  deterministic rules and human gates decide;
  the verifier is separate from the proposer
  by construction, never the same agent
  judging its own work.

## NOT adopted
- Any code (no SKILL.md, wizard scripts,
  install scripts, Go server, daemon, or
  agent CLI from any of the three repos).
- The loop-maker progress-bar / blueprint-box
  renderer, install.sh, and the "works in
  Claude Code, Codex, Hermes, OpenClaw"
  cross-harness claim as a HALEX claim (the
  harness list is the author's, recorded as
  such).
- The self-learning-skills "70+ agents" npx
  reach claim, the "npx skills" community CLI
  as a dependency, and any star/fork count as
  quality (926 stars is popularity, not a
  verdict).
- The Solo video tutorials (Bilibili /
  YouTube links, not opened), the Lucy team
  template assistant as a HALEX feature, the
  soloagent.team website claims (not read),
  or any star/fork count as quality.
- Any benchmark or efficacy figure (none
  published in the files read for any of the
  three repos).
- agent-md (iamfakeguru/agent-md) and ccglass
  (jianshuo/ccglass): owners now identified
  from the OSS Hunter source table (2026-11-16
  article), LICENSEs unread — leads open for
  a later run. core-termux
  (DevCoreXOfficial/core-termux): Android-only
  by design, low relevance — lead noted, not
  deep-dived. projectmem (riponcm/projectmem):
  already gated 2026-11-20 — not re-dived.
- PromoterKit: marketing-page MIT claim only,
  repo still unidentified — lead open.
  ViralPayouts: repo still 404 on prior runs;
  not re-checked this run — lead carried.
  ContextOS: repo 404 — lead open.
  dualmint-addendum stays pending.
  zinium5-web-fallback-lane stays pending.
