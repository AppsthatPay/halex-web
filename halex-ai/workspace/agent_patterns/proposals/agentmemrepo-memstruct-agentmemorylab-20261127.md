# Proposal: Git-repo memory + shared-structure memory tree + bitemporal evidence memory (AgentMemoryRepo/agentmemoryrepo, GATED; ederevx/agent-mem-struct, GATED; agent-memory-lab/agent-memory, GATED) — 2026-11-27

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read, 2026-11-27):
- AgentMemoryRepo/agentmemoryrepo — MIT License,
  Copyright (c) 2026 AgentMemoryRepo (LICENSE file SHA
  fda0f24843b81c519d0736b252e29ebc925eafdc).
  README read in full (file SHA
  9f5788b32d9e99792b3b976ad226f51619b56948,
  12,284 chars). Repo: 881 stars, 51 forks,
  created 2026-10-04, updated 2026-11-27T00:48:16Z
  (today — active), default branch main, not
  archived. A specification, originally developed
  by Cognition and released as an open standard,
  for keeping an agent's durable memory in a
  separate Git repository: memory lives in its own
  repo, never in the spec repo.
- ederevx/agent-mem-struct — MIT License,
  Copyright (c) 2026 Edrick Sinsuan (LICENSE file
  SHA 0282576c7b3b8ec41cd96110d1a18b2c455160b1).
  README read in full (file SHA
  b58803adb42afee3db841faa5946f67af619e432,
  6,558 chars). Repo: 1 star, 0 forks, created
  2026-08-18, updated 2026-11-23T23:46:43Z,
  language Python, default branch main, not
  archived. A shared structural specification for
  a cross-agent persistent memory tree: several
  AI coding agents keep separate private memory
  while sharing one common-memory subtree.
- agent-memory-lab/agent-memory — Apache License
  Version 2.0 (LICENSE file SHA
  5ba0d6c16d961e316af8b722295e10b95892920f).
  README read in full (file SHA
  a7e957606af0149eebc6ddf04d8e374b5ef87e08,
  30,198 chars). Repo activity metadata not
  retrieved this run (repository search by name
  returns hundreds of unrelated hits; the repo
  itself is confirmed present by direct file
  reads). The README self-labels the package
  Alpha, v0.1.2, Python 3.13+. A traceable,
  correctable memory runtime: current facts,
  evidence, and a history of what changed, with
  source, time, and permission attached through
  every correction, combination, retrieval, and
  erasure.

## Patterns adopted (restated in our own words only; no code adopted)

### 1. Memory as a separate Git repository (AgentMemoryRepo/agentmemoryrepo)
- One short MEMORY.md index is the entry point every session loads; it holds
  only what every session needs plus links to everything else. Memory entries
  are one-line bullets with open metadata keys at the end, e.g. a source link
  to the session where the fact was learned and the date it was saved.
- Cross-links between files use a wiki-style double-bracket form; paths start
  at the memory root. One fact lives in one place and is linked to from
  elsewhere; links are updated when files move.
- The session loop is fixed: clone the latest memory, grep for what the task
  needs or follow links, update entries as the agent learns, push after every
  edit. Git flags conflicting edits; the second writer reads both versions
  before writing one.
- Dreaming: a dedicated periodic pass that spots patterns across sessions and
  saves them as new entries, merges duplicates, removes outdated entries, and
  resolves contradictions by checking sources. Dreaming is a scheduled pass,
  not part of the live session loop.
- Composability: a session can load several memory repos at once, each keeping
  its own ownership, permissions, and history, so sessions combine them in any
  mix; a new participant's repo is cloned only if they choose to share it, and
  the agent writes each memory to the right owner's repo, asking when the
  destination is unclear. A swarm works the same way: one folder per swarm
  with a goal-and-rules note, a findings file, a questions file, one notes
  file per agent, and one shared benchmark script every agent measures with
  so numbers compare.

### 2. Shared-structure memory tree with a mechanical gate (ederevx/agent-mem-struct)
- Four protocol documents with distinct roles: mandatory operational rules,
  the current canonical tree/model, ordered procedures for upgrading older
  trees, and a changelog of historical context and rationale. Rules are
  consolidated where possible; rationale and examples live outside the
  routine checklist.
- The shared root is declared as a literal absolute path in the agent's root
  memory index, together with the applied structure version. The declaration
  is the only shared-root locator: no alias, no copy, no fallback directory,
  no silently substituted path, no tilde or environment-variable expansion.
  A stale version means the migration procedure runs first.
- A write gate that separates assertion from enforcement: the writer must
  acknowledge it audited the change against every governing convention, and
  the acknowledgement is an assertion, not evidence — the hook checks nothing
  about the audit itself. What the hook does enforce is mechanical: the
  mutation is recorded as a write-free plan before writing (every file's
  bytes, every move/rename/removal), the governing documents must still read
  as they did when the plan was recorded, a shared write is pushed only when
  its commit holds exactly the planned paths and bytes, and the commit
  message must pass a mechanical lint. A mutation that changes nothing needs
  no acknowledgement.
- Deterministic per-file semantic logs; same-name attachment directories for
  materially significant files or scripts; a structure-first leaf model.
  Protected root documents are refreshed on reinstall but never overwrite a
  foreign or user-edited document; that conflict is resolved explicitly.
  A shell-free structure lister keeps the shared-structure read reachable
  even when a host gates shell execution.

### 3. Bitemporal evidence memory with bounded delivery (agent-memory-lab/agent-memory)
- Three layers with separate authority: source evidence (captured content,
  source identity, revisions, processing requests), atomic memory (what can
  be used, with evidence, conditions, and time), and derived views (facets,
  scenarios, persona) built from the layers below. A summary's position in
  the structure never increases the authority of its evidence.
- Two clocks on every fact: when the fact applies and what the system knew
  at a given point, so a correction keeps the earlier history and a read can
  ask for the state as of a past time.
- Admission states: accepted, pending, or contested. A user self-report stays
  pending until a trusted authority verifies it; missing completion stays
  unknown; conflicting owners stay contested; no risk match means only a
  complete empty result inside the known authorized scope.
- Bounded delivery: the host receives a memory bundle within item, character,
  and token estimates it configures, with citations. The host supplies
  identity and permissions; retrieval and derived reads enforce their
  supported scope and the current erasure guards.
- Erasure that survives restore: an authoritative deletion log is replayed
  over an isolated old database copy, keeping unrelated sources while
  preventing erased content from returning; deletion sync reaches
  participating outboxes before new delivery.
- Idempotency: rerunning the same input with the same key returns the same
  source event; changing the input requires a new key. The basic loop runs
  locally with zero third-party runtime dependencies, no model key, no vector
  database, and no background service; extraction, integrations, and workers
  are opt-in.

## What this would build (HALEX-AI, patterns only)
- A memory-index discipline: one short index file per store, one-line entries
  with source and added-date metadata, cross-links, and a clone-grep-update-
  push session loop with push-after-every-edit — the git-repo shape from (1),
  applied to HALEX-AI's existing local lesson/plugin-pack stores, without any
  remote, plugin install, or host-specific wiring.
- A shared-structure rule set for multi-agent memory: governing documents
  with distinct roles (rules, canonical tree, migration, changelog), a
  declared shared root with no fallback, and a mechanical write gate that
  records a write-free plan before writing and refuses a push whose commit
  does not match the plan exactly — the acknowledgement-as-assertion split
  from (2), kept as a human-readable discipline, not a hook.
- An evidence discipline for HALEX-AI memory entries: two clocks (applies-
  when, known-when), admission states (accepted/pending/contested) with
  self-reports staying pending, bounded bundles with citations, and an
  erasure log replayed over restored copies so erased entries cannot return
  — the bitemporal shape from (3), in stdlib-only form.
- What it would NOT build: no plugin/skill installer, no hooks against live
  sessions, no MCP/HTTP server, no PostgreSQL/vector store, no LangGraph
  adapter, no local-model inference, no container image, no unattended
  dreaming/sleep/consolidation pass, no auto-push without a gate.

## NOT adopted
- Any code from any of the three repos (no skill, hook, installer, bridge,
  lister, runtime, MCP server, or container); no install commands or code
  snippets reproduced in this proposal.
- AgentMemoryRepo: the worked examples' numbers as general results (the
  autocomplete keep-rate move, the checkout latency move), the Devin/Claude
  skill-install flows, any star/fork count as quality.
- agent-mem-struct: host-specific wiring (Pi/Codex/Claude installers and
  bridges), the "1 star" count as quality, the XERJ corpus-hub listing as
  an endorsement.
- agent-memory-lab: the "3,931 passed" test figure, the v7.x validation
  records and per-stage counts as cumulative passes, the local-model smoke
  results (Qwen generations over synthetic facts), any production-quality or
  cost acceptance (open per the README itself), any star/fork count as
  quality. The Alpha v0.1.2 label is recorded, not smoothed over.
- Secondary-source claims used only to find the repos, never as verified
  facts: the Agent Memory Atlas pages for Mem-Forever, TeamAgentMemory, and
  Agents Remember; the rywalker.com summary of AgentMemoryRepo; the XERJ
  hub listing for agent-mem-struct.

## Gate notes
- LICENSEs read verbatim via the GitHub connector (MIT ×2, Apache-2.0 ×1);
  per-source NOTICE + credit added with this run.
- One web search result this run was flagged by execution-risk checks; no
  install, download, run, or write action was taken from any search result
  — research was read-only through the GitHub connector, and this proposal
  restates patterns in our own words with no commands or code reproduced.
  Mem-Forever was NOT deep-dived this run (secondary MIT claim only) and
  stays an open lead.
- No X read this run (X STOP status conflicts in memory — see the intake
  report); intake never posts to X in any case.
- HALEX gate: stdlib-only engine, zero network/wallet/signing/payment/
  API-key code; patterns only.
