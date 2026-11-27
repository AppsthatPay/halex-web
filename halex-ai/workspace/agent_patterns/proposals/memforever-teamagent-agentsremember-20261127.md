# Proposal: Derivation memory + team-layered memory + git-verified code memory (ilang-ai/Mem-Forever, GATED; hsuanshao/TeamAgentMemory, GATED; Foxfire1st/agents-remember, GATED) — 2026-11-27

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read, 2026-11-27):
- ilang-ai/Mem-Forever — MIT License,
  Copyright (c) 2026 ilang-ai (LICENSE file SHA
  88d53db4c9bf16ec77bc0705138bb6943ae2e9c8).
  README read in full (file SHA
  5ad60fdcbf15dc1508ec0890ae49553c5aeab331,
  44,410 chars). Repo: 28 stars, 13 forks,
  0 open issues, created 2026-04-26, updated
  2026-11-11, language Python, default branch
  main, not archived. A Git-native persistent
  memory layer for AI agents, built on the iLang
  protocol: one private Git repo is the agent's
  brain — a profile, one file per memory, a
  hand-off note saying where work stopped, and a
  ledger of the keys that open every door the
  brain can enter. Version 3.2 per the project
  page; README self-labels the engineering book
  for the protocol.
- hsuanshao/TeamAgentMemory — Apache License
  Version 2.0 (LICENSE file SHA
  16fe87b06e802f094b3fbb0894b137bca2b16ef1).
  README read in full (file SHA
  f8547862244186ad2d4f331c3a0e8bc0249b64b9,
  27,488 chars). Repo: 39 stars, 16 forks,
  0 open issues, created 2026-10-18, updated
  2026-11-04, language Rust, default branch
  main, not archived. A self-hosted long-term
  memory service for teams of coding agents:
  layered L0→L3 memory, async distillation,
  hybrid BM25 + vector recall, and
  department/team/member isolation. LICENSE
  HISTORY (read in the README's own License
  section and confirmed by the current LICENSE
  file): from 0.5.3 the server is Apache-2.0;
  the client and agent plugins stay MIT;
  0.4.0 to 0.5.2 were released under Business
  Source License 1.1; 0.3.2 and earlier under
  MIT. The BSL-era tags are EXCLUDED outright
  — nothing from a BSL-tagged release is ever
  adopted. The layered design draws on ideas
  from TencentDB Agent Memory (MIT); the
  project states it is an independent
  implementation containing none of that
  project's code.
- Foxfire1st/agents-remember — MIT License,
  Copyright (c) 2026 Readone Mohamed (LICENSE
  file SHA a6219e78af7880471e4174ef5ee17cd0650a2f83).
  README read in full (file SHA
  f89ea5f2da95108957cf5b618ef5189348a0fc3d,
  12,884 chars). Repo: 40 stars, 9 forks,
  31 open issues, created 2026-03-21, updated
  2026-11-20, language Python, default branch
  main, not archived. Git-verified records for
  what coding agents know: a memory in a Git
  repository of its own, one card per source
  file at the file's own path, records tying
  each rule to all the code that expresses it,
  and role agents that let a change land only
  when code and memory agree. Version 3.0.8,
  requires Python 3.14, Linux x86_64. PASEO
  LICENSE NOTE: the install downloads the Paseo
  host (pinned at 0.15.4 in the repo's lockfile)
  and the tree itself states no license for it
  — the Agent Memory Atlas flags exactly this
  gap. The upstream Paseo repository's own
  LICENSE was read verbatim this run
  (getpaseo/paseo, Copyright (c) 2025-present
  Mohamed Boudra, Apache License Version 2.0,
  file SHA 2f5903143b08de0aa991ab535d9582aca6b9b44a),
  so the host is Apache-2.0 upstream — but the
  agents-remember tree still ships no Paseo
  license statement of its own, and the
  dependency must be re-checked at any install
  time; Paseo itself is EXCLUDED from adoption
  in any case.

## Patterns adopted (restated in our own words only; no code adopted)

### 1. Memory as a derivation, not a snapshot (ilang-ai/Mem-Forever)
- One true state, no second copy: the brain keeps only what a live query
  cannot give back — the reasoning no live state holds (why a path was
  chosen, what was rejected, what must never be done), the ledger of doors
  (which keys open which door and the command that proves it still opens),
  and the hand-off (what is being done now). Everything else is fetched
  when the door is open, so there is nothing to invalidate.
- The brain is a generator: keys derive tasks, tasks yield constants, the
  logic between them is annotation. A capable model re-grows the tree from
  the derivation; a weak model is handed the expanded output.
- Judgment before action: each next item is judged on its own — a boundary
  conflict stops it, missing evidence means one question and a record of
  what is missing under unverified, an unauthorized item is deferred, never
  executed. Reading, restating, updating or exporting a hand-off is
  recording, not doing.
- Review before merge: a hand-off returned from another model or session is
  a candidate, never the truth. A review compares it block by block with the
  accepted one: a boundary deleted, weakened, rewritten or given a
  condition is rejected; an item in done that a boundary forbids is
  rejected; a missing key, an empty value, a changed identifier, a dropped
  next or unverified item, or a secret-like string is rejected. A next item
  moved to done, a new done item, a changed fact value, a raised
  confidence, or a changed decision reason goes to the owner. Only an
  identical hand-off, or one with only additions, is clean.
- Items are identifiers: an item moves between done, next and unverified
  whole; news or evidence goes in a new item. A reworded item is a drop
  plus an addition to the review.
- Provenance on every block: each block says whose words it rests on
  (owner's verbatim words, owner-confirmed, agent-inferred, imported, or
  legacy). Only owner-sourced blocks may create or keep a boundary; the
  rest is read as advice. Agent-sourced blocks confirm after three distinct
  days and still decay; owner-sourced blocks never decay and only a
  tombstone decision retires one.
- A gap is closed by elimination, not by recall: when the brain lacks a
  fact, the model lists the candidates and strikes each one a constant
  refutes — a ledger row, a verify result, a line of the log, a path that
  is not there, the owner's words. What remains is written beside the fact
  it completes, with the refuting constant named; an exclusion without its
  refutation is a guess and the review refuses it.
- Three states of a value: plain only inside a process, encoded at rest in
  the private repository (reversible by anyone holding the repository —
  obfuscation against accidental exposure, not encryption), sealed only
  when pairing. The owner, holding the repository, is never locked out.
- Recognition is a threshold on the owner's own words: anchors built from
  the owner's turns, thirty percent of applicable anchors hit and no done
  item touching a boundary, and the person is recognized. Recognition tells
  the agent whom it is talking to; it is not the lock.
- Code memory is not kept: paths, versions, hashes and what a function does
  are read from HEAD, which is always newer than memory. What stays is the
  reasoning HEAD does not hold, and a constant keeps its reasons — why and
  used-by edges — with orphans dying after ninety days.

### 2. Team-layered memory with hard isolation (hsuanshao/TeamAgentMemory)
- Four layers, one direction: raw turns (L0) distil into facts (L1),
  consolidate into scenes (L2), summarise into a persona (L3). Recall
  combines keyword and vector search with rank fusion, under count and
  character budgets, and falls back to keyword-only without embeddings.
- Shared where it helps, private where it matters: each member's
  conversations and facts are scoped to that member; the scenes and persona
  of an agent are distilled from the facts of everyone who uses it, so
  recall gives each member the team's accumulated context, never a
  teammate's transcript. One authorization layer enforces the boundaries
  before every memory call, so isolation does not depend on clients
  behaving. Departments share nothing at all: not users, keys or data.
- Skills spread across the team: a procedure extracted from one member's
  work becomes a skill every member can find, once a person approves it.
  Skills of a private agent stay with that agent.
- Deduplication by decision: candidate duplicates are found by hybrid
  recall and a model decides store, update, merge or skip — the merge
  decision is explicit, not a silent overwrite.
- Staleness is tracked, not hidden: a scene records which facts it holds,
  and a scene whose facts were rewritten, deleted or moved is marked stale,
  with the next consolidation run told what changed even when no new facts
  arrived.
- Oversight without surveillance: team leaders see whether distillation is
  healthy for every member, but cannot open anyone's conversations or facts.
- Dead letters expire and retry on their own; the monitor surface reports
  distillation health, generation logs and dead letters.
- The client redacts secrets before anything leaves the machine and queues
  while the server is unreachable; the server never sees a secret the
  client stripped.

### 3. Git-verified code memory with a closeout gate (Foxfire1st/agents-remember)
- A card at the path of the file: the memory repository holds a card for a
  source file at the file's own path, so an agent holding a file reaches
  its card without a search and without a ranking.
- Rules with all their places: one knowledge record states one rule (an
  invariant), and cards name the code that realizes it and the tests that
  prove it. From one file an agent reaches the rule, and from the rule
  every other place that holds it.
- Anchors bind claims to code: each citation, realization and proof in a
  card's sidecar records a path, a locator, a Git blob and a content hash,
  so a read reports each rule as current, stale, unverifiable or
  unrealized at the code the caller sees. A current anchor proves the
  cited code did not change — not that the card describes it truly; that
  limit is stated, not smoothed over.
- The closeout gate has no waiver: a task neither closes out nor lands
  with memory that holds a stale anchor. Closeout refuses while any change
  the worklist sees lacks a written judgment, or while an entry at a path
  the task changed is stale. A stale anchor outside a task's diff never
  blocks, and a stale invariant stays in the answer, labelled.
- Roles with separate duties: an Architect writes the requirement with the
  owner, a Worker builds the change, a Reviewer judges it, and a Curator
  records what the change means for the memory. Memory reaches the shared
  line only through that path; nothing rewrites the whole store in the
  background.
- Decision records keep each rejected or deferred alternative with its
  reason and the condition under which to reconsider it; a rejected
  alternative can be reopened when the code it is linked to changes.
- Retirement, never deletion: a record leaves use by being retired; the
  file is kept forever, and retired records are withheld from reads while
  still answerable by id, labelled retired. A validator refuses a tree
  that lacks a record its base held.
- Bounded delivery: reads return locations and states, never text; the
  agent reads the files itself. Answers are capped per call, with the whole
  result in a file the answer names.
- Memory lands with the code: the memory is a Git repository of its own,
  outside the code repository, and a task works in a code worktree and a
  memory worktree side by side. Closeout commits both, and each memory
  commit names the code commit it describes, so an old memory commit can be
  measured against its own code.
- No model runs inside the server: memory is written by an agent,
  deliberately, and the write is a synchronous file write plus validation
  against the exact code and memory trees.

## What this would build (HALEX-AI, patterns only)
- A derivation discipline for HALEX-AI memory: keep only reasoning, doors
  and hand-off in the store; fetch live state when the door is open; judge
  each next item before acting; review every returned hand-off block by
  block; provenance on every entry with owner-sourced boundaries only; gaps
  closed by elimination with the refuting constant named — the Mem-Forever
  shape, in stdlib-only form, without its iLang notation, ledger tooling,
  or key handling.
- A team-layered memory discipline: L0 turns → L1 facts → L2 scenes → L3
  persona with explicit merge decisions, staleness marking, per-member
  privacy with shared scenes, human approval before a skill spreads, and
  server-side isolation that never depends on client behaviour — the
  TeamAgentMemory shape, without its Rust server, client, panel, Docker,
  or any LLM/vector/Redis/Postgres machinery.
- A git-verified code-memory discipline: one card per file at the file's
  own path, invariants with realizations and proofs, anchors carrying blob
  plus content hash with current/stale/unverifiable/unrealized states, a
  closeout gate with no waiver, decision records with reconsider
  conditions, retirement instead of deletion, and bounded reads that return
  locations and states — the agents-remember shape, without its MCP
  server, Paseo host, dashboard, or harness wiring.
- What it would NOT build: no key/secret ledger or encoding, no iLang
  notation or grammar validator, no installer or bootstrap, no MCP/HTTP
  server, no Paseo host or role-agent harness, no Rust server or panel,
  no Docker, no vector store or embedding provider, no LLM/API-key code,
  no unattended distillation/consolidation/sleep pass, no auto-push
  without a gate, no BSL-era code of any kind.

## NOT adopted
- Any code from any of the three repos (no tool, server, client, panel,
  hook, installer, MCP server, dashboard, or container); no install
  commands or code snippets reproduced in this proposal.
- Mem-Forever: the iLang protocol and notation as a dependency (patterns
  only, in our own words); the key/secret ledger design as a store for
  real keys (the three-states description is a pattern, never a place to
  put keys); the upstream-sync workflow (the Atlas reports it fetches
  unpinned main weekly and overwrites instruction files, tools, hooks and
  tests — NOT verified by direct read this run, recorded as an
  Atlas-reported supply-chain concern); the token-count and recognition
  measurements as general results (measured on the author's own brains and
  tokenizers, 2026-11-03 to 2026-11-08); the "first protocol" claims; any
  star/fork count as quality.
- TeamAgentMemory: the BSL 1.1 releases 0.4.0–0.5.2 in any form; the
  TencentDB Agent Memory lineage as anything beyond the README's own
  acknowledgement (independent implementation, no code); the install and
  upgrade scripts; any test-count, latency, or scale claim; any star/fork
  count as quality.
- Agents Remember: the Paseo host and any role-agent harness; the
  explainer video and dashboard as evidence; the "developed with Agents
  Remember" dogfooding claim as an independent evaluation; the benchmark
  runner's single case as a result; any star/fork count as quality.
- Secondary-source claims used only to find the repos, never as verified
  facts: the Agent Memory Atlas pages for Mem-Forever, TeamAgentMemory and
  Agents Remember; the ilang.ai product pages; the codepick.dev Paseo
  license note (the Paseo LICENSE itself was read verbatim this run).

## Gate notes
- LICENSEs read verbatim via the GitHub connector (MIT ×2, Apache-2.0 ×1,
  plus Paseo Apache-2.0 read verbatim as a dependency-license check);
  per-source NOTICE + credit added with this run.
- The Mem-Forever README fetch was flagged by execution-risk checks; no
  install, download, run, or write action was taken from it — research
  was read-only through the GitHub connector, and this proposal restates
  patterns in our own words with no commands or code reproduced.
- No X read this run (X STOP status conflicts in memory — the 2026-11-25
  scheduling overhaul says lifted by Jeffrey's explicit word, the
  2026-11-26 airdrop-hunt entry says still in force); intake never posts
  to X in any case.
- HALEX gate: stdlib-only engine, zero network/wallet/signing/payment/
  API-key code; patterns only.
