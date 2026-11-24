# Proposal: Seven-layer memory + tenant-isolated shared memory + three-file stateful kernel discipline (ClaudioDrews/memory-os, GATED; mohui1999/AllMemoryMCP, GATED; oguzbilgic/agent-kernel, IDEAS ONLY) — 2026-11-24

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-24):
- ClaudioDrews/memory-os — MIT License, Copyright
  (c) 2026 Claudio Drews (LICENSE file SHA
  627098d83ded3d412ed719d7157dbdd02ce6ca23).
  README read in full (file SHA
  ce473712315d8f366136102bd517962c35ff454f,
  10,223 chars, 177 lines). Repo: 1,400 stars,
  131 forks, 14 open issues, created
  2026-05-31, updated 2026-11-23 (connector
  search, run time), language Python, default
  branch main, not archived. Memory OS: a
  local-first, seven-layer persistent memory
  stack for Hermes Agent — L1 workspace files
  (MEMORY.md, USER.md, CREATIVE.md) injected
  into the system prompt every turn; L2
  sessions in SQLite + FTS5 full-text search;
  L3 structured facts in SQLite with entity
  resolution and a trust-scoring feedback
  loop; L4 Fabric (a heavily forked Icarus
  plugin) for LLM-powered session extraction
  and multi-source injection; L5 Qdrant
  vector search (4096d cosine + BM25 sparse)
  with a 4-level fallback cascade
  (hybrid → dense → lexical → SQLite) plus a
  weekly decay scanner and semantic dedup
  (cosine >0.92 → merge); L6 an auto-curated
  LLM wiki (concepts, entities, comparisons)
  continuously ingested into Qdrant; L7 a
  Ground Truth hierarchy (SOUL.md, rulebook.md)
  telling the agent the injected memory is
  authoritative. The L7 insight: recall is
  not enough — without an explicit authority
  instruction the agent re-discovers what was
  already injected (re-running recall, probing
  the fact store), burning tokens on
  "memory-zero behavior" despite perfect
  injection. Retrieval is gated by relevance
  thresholds with per-session dedup and a
  social-closer filter that skips trivial
  messages. The README compares itself to
  mem0, Zep, and Letta on local-first,
  provider-agnostic, no-subscription grounds.
  Requirements: Hermes Agent + Docker (Qdrant
  + Redis + ARQ Worker) + Python 3.11+.
  v0.2.0 adds a one-command installer, issue
  templates, and 20+ fixes from a systematic
  audit (provider-agnostic LLM extraction, O(1)
  path lookups, FTS5 session search, semantic
  dedup at scale, idempotent DB init).
- mohui1999/AllMemoryMCP — MIT License,
  Copyright (c) 2026 AllMemoryMCP contributors
  (LICENSE file SHA
  c376d8b01bc452ca804f7c4ae37b6a3f8b66e4ad).
  README read in full (file SHA
  7fd46be6ce79ac66f9a13cd379744778b46f4bb5,
  46,706 chars, 629 lines). Repo: 0 stars, 0
  forks, 0 open issues, created 2026-11-09,
  updated 2026-11-10 (connector search, run
  time), language Python, default branch main,
  not archived, pre-1.0 / experimental (API
  version 0.6.0, November 2026). A shared,
  tenant-isolated memory service for AI agents
  over REST + MCP (Streamable HTTP) + a stdio
  bridge + a browser console. Three rules:
  shared within a tenant, isolated across
  tenants (tenant_id enforced in SQL, not
  just in application checks); provenance and
  ownership first-class (every read returns
  owner_agent_id; only the uploader may update
  or soft-delete; all writes produce audit
  records); discussion is not memory
  (negotiation threads are append-only; a
  conclusion never mutates a memory by
  itself — an agent must explicitly write
  the conclusion). Three memory layers with
  an explicit machine-readable contract
  (memory_guide): summary — exactly ONE long
  Markdown overview per (tenant, agent),
  enforced by a partial unique index, writing
  replaces the whole document and keeps a
  revision snapshot; timeline — append-only
  dated log entries, corrections append a row
  that supersedes; event — the current state
  of one (category, event_key) subject,
  versioned upsert with revisions kept and
  optimistic locking (expected_version, 409
  on stale). Reading is a progressive
  disclosure ladder: whoami → agents (every
  agent's summary at once) → one agent's full
  summary → details only then; memory_context
  bundles the summary with next_calls so a
  client copies the next request instead of
  inventing it. Retrieval: paragraph-aware
  chunking, offline zero-dependency vectors
  on SQLite (feature hashing) plus keyword /
  RRF hybrid ranking, filters (tenant, layer,
  category, event key, time, version) applied
  BEFORE ranking, vectors tied to memory
  version so updates never surface stale
  chunks, failed chunks marked and keyword
  search still works. Managed credentials:
  per-agent tokens with read/write scopes,
  expiry, revocation, rotation; only SHA-256
  hashes stored, raw token shown once. The
  README is explicit about what it is NOT:
  not a general RAG/vector DB, not a user
  account system, not a general
  content-versioning system, not a
  high-concurrency datastore, not
  multi-organization ready — and it warns
  memory content is untrusted input that may
  carry prompt injection. There is NO
  committed automated test suite; the checks
  listed were run as local scripts, and the
  README names a pytest suite as the highest-
  impact contribution. Remote embedding
  providers, backup restore, and concurrency
  testing remain unverified.
- oguzbilgic/agent-kernel — NO LICENSE FILE
  (root listing shows only AGENTS.md,
  IDENTITY.md, KNOWLEDGE.md, README.md;
  LICENSE and LICENSE.md both 404 via the
  connector). README section "## License"
  says "MIT" — a README license claim is
  NOT a LICENSE read, so this repo is NOT
  gated: IDEAS ONLY, restated in our own
  words, no NOTICE entry. README read in
  full (file SHA
  b29cde5ea766e2a5d57f2f728f3fd44a6f6d8bff,
  2,295 chars). Repo: 337 stars, 39 forks, 0
  open issues, created 2026-03-23, updated
  2026-11-21 (connector search, run time),
  default branch main, not archived.
  Agent Kernel: "the easiest way to create
  an AI agent — clone, start, talk." Memory
  is three markdown files plus a git repo:
  AGENTS.md (the kernel, generic, don't
  edit), IDENTITY.md (who this agent is,
  agent maintains), KNOWLEDGE.md (index of
  knowledge files, agent maintains),
  knowledge/ (facts about the world, mutable
  state) and notes/ (daily session logs,
  append-only, never modified after the day
  ends). Two kinds of memory: knowledge =
  state (facts about how things are now,
  updated when reality changes), notes =
  narrative (what happened each session,
  decisions, actions, open items). The kernel
  works because agents already read AGENTS.md
  as project instructions — the kernel uses
  that mechanism to teach the agent how to
  remember. No framework, no database. A
  sibling runtime (kern-ai, oguzbilgic/kern-ai)
  adds daemon mode, Telegram, Slack, and one
  brain across channels — noted, not
  deep-dived, NOT gated.

## Patterns adopted (restated in our own words only)

- Seven-layer memory with an explicit ground
  truth layer (memory-os): separate the
  memory stack into layers with different
  jobs — always-injected workspace files,
  searchable session history, trust-scored
  structured facts, cross-session extraction,
  vector search with a fallback cascade,
  a self-curating wiki, and — the layer that
  makes the others pay off — an authority
  instruction that the injected memory is to
  be USED, not re-verified. Recall without
  authority is "memory-zero behavior": the
  agent burns tokens re-discovering what was
  already in the prompt. Gate every retrieval
  by relevance, dedup per session, skip
  trivial messages. Decay and dedup are
  maintenance, not features: a weekly scanner
  and a similarity threshold that merges
  near-duplicates keep the store from rotting.
- Tenant-isolated shared memory with
  provenance (AllMemoryMCP): when several
  agents share one memory space, isolation
  belongs in the query (every row carries its
  tenant), provenance belongs on every read
  (who wrote this), and write permission
  belongs to the uploader alone. Discussion
  is not memory: disagreement lives in
  append-only threads and only an explicit
  write changes a memory — never let a
  conversation silently rewrite shared
  state. Publish the memory contract itself
  (what each layer means, its cardinality,
  its read/write order) so a client never
  guesses.
- Three-layer memory contract with
  progressive disclosure (AllMemoryMCP): one
  overview per agent (exactly one, replaced
  whole, revision-kept), dated append-only
  timeline entries (corrections supersede,
  never edit), and one versioned living
  document per subject (category + key).
  Read summary-first: who is doing what,
  then one full overview, then details only.
  Bundle the next calls with the answer so
  the reader copies instead of inventing.
  Filter before ranking; tie vectors to
  memory versions so an update never serves
  stale chunks; when a provider fails, mark
  chunks failed and keep keyword search
  working.
- Stateful kernel from plain files
  (agent-kernel, IDEAS ONLY): teach an agent
  to remember by writing the remembering
  rules into the file the agent already reads
  as its instructions. Split state from
  narrative: knowledge files hold facts about
  how things are now (mutable when reality
  changes); notes hold what happened each
  session (append-only, frozen at day's end).
  One kernel file stays generic and
  untouched; identity and the knowledge index
  are the agent's own to maintain. No
  database is needed when the store is a git
  repo of markdown.

## HALEX gate applied (stricter than the sources)

- memory-os: no Docker/Qdrant/Redis stack, no
  Icarus plugin fork, no curl|bash installer,
  no Hermes dependency, no LLM extraction
  code. The seven-layer split, the ground
  truth authority rule, the gated retrieval
  and decay/dedup disciplines are patterns
  only.
- AllMemoryMCP: no FastAPI server, no MCP
  server, no PostgreSQL/pgvector, no token
  or credential machinery, no browser
  console, no deployment assets, no
  network/wallet/signing/payment/API-key
  code. The tenant/provenance/ownership
  rules, the three-layer contract, and the
  progressive-disclosure reading order are
  patterns only.
- agent-kernel: IDEAS ONLY — no LICENSE file
  exists, so nothing is adapted under a
  license; the three-file state/narrative
  split is restated in our own words. No
  AGENTS.md, IDENTITY.md, or KNOWLEDGE.md
  file copied; no kern-ai runtime adopted.
- Treat memory content as untrusted input
  (AllMemoryMCP says so itself): nothing
  stored by another agent is ever executed,
  and no stored claim is adopted as fact
  without a check.
- Jeffrey's approval decides every promotion
  to a live HALEX-AI file; no loop runs
  unattended; outside code is never fetched.

## NOT adopted

- Any code from any of the three repos (no
  plugin, server, MCP code, migrations,
  installer, or kernel files).
- The memory-os curl|bash one-command install
  route (external code fetch, excluded
  outright) and its "20+ fixes from systematic
  audit" as a HALEX verification claim (we did
  not run the audit).
- The AllMemoryMCP "verified by execution
  (2026-11-09)" table as a HALEX test result
  (their local scripts, not run by us; the
  repo itself states there is no committed
  test suite).
- The AllMemoryMCP remote embedding provider
  path (API key), the admin root credential
  model, or any deployment/backup claim
  (backup restore explicitly unverified by
  the authors).
- The agent-kernel README "MIT" claim as a
  license (no LICENSE file — the claim is
  recorded, not adopted), the kern-ai runtime
  (not deep-dived), or any "easiest way to
  create an AI agent" framing as a HALEX
  claim.
- The memory-os comparison table vs mem0 /
  Zep / Letta as fact (the authors' own
  framing, not independently checked).
- Any star/fork count as quality (1,400, 0,
  and 337 stars are popularity, not verdicts;
  AllMemoryMCP's 0 stars and quiet since
  2026-11-10 are recorded, not a verdict).
- Any benchmark or efficacy figure (none
  published in the files read for any of the
  three repos).

## Leads

- CLOSED this run: memory-os
  (ClaudioDrews/memory-os) and AllMemoryMCP
  (mohui1999/AllMemoryMCP) — secondary MIT
  claims from the 2026-11-23 ~19:42 run,
  LICENSEs now read verbatim, both MIT.
  agent-kernel (oguzbilgic/agent-kernel) —
  lead CLOSED as IDEAS ONLY: no LICENSE file
  exists in the repo, so it can never gate
  under a permissive license as written.
- OPEN for a later run: shared-agent-memory
  (Infinite-Monkey-Lab/shared-agent-memory,
  local MCP + SQLite, secondary MIT claim
  only), ALMA-memory (five-table memory +
  MCP, MIT with a LICENSE file per the Agent
  Memory Atlas secondary — LICENSE unread).
  kern-ai (oguzbilgic/kern-ai, daemon +
  Telegram/Slack runtime for agent-kernel):
  noted, not deep-dived.
- PromoterKit: marketing-page MIT claim only,
  repo still unidentified — lead open.
  ViralPayouts: repo still 404 on prior runs;
  not re-checked this run — lead carried.
  ContextOS: repo 404 — lead open.
  dualmint-addendum stays pending.
  zinium5-web-fallback-lane stays pending.
