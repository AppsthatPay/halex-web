# Proposal: Markdown-truth memory + team ACL memory + steward-reviewed memory discipline (tigerless-labs/agent-memory, GATED; yamantaka520/Agent-Memory-OS, GATED; ipiton/agent-memory-mcp, GATED) — 2026-11-24

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-24):
- tigerless-labs/agent-memory — MIT License,
  Copyright (c) 2026 Tigerless Labs (LICENSE file SHA
  36314997443758dae060c5b828fcbb4a09a47e8b).
  README read in full (file SHA
  d532f7fe5229fb54bc14f821890a51bec81fec4c,
  35,007 chars). Repo: 4,320 stars, 212 forks,
  12 open issues, created 2026-09-01, updated
  2026-11-24T17:19:23Z (today — very active at
  read time), language Python, default branch
  main, not archived, version badge 0.1.0. A
  long-term memory runtime: Markdown files in
  one store are the single source of truth,
  the SQLite index beside them is a cache you
  can delete at any time, and Claude Code,
  Codex CLI, Muse Code, and anything that can
  run a shell command share that store. No
  PyPI release yet — install from a checkout
  with uv; Python 3.12+.
- yamantaka520/Agent-Memory-OS — Apache License
  Version 2.0 (LICENSE file SHA
  465cd473f5a94461b6200f66ddfac75a0c9e001f;
  appendix copyright line reads "Copyright
  2026 Bastet Agent Team" — the sibling
  Bastet-Agent-OS project — recorded as read,
  not smoothed over). README read in full
  (file SHA 67de2a5888b9a0215993e3d88a1f4ae16baed0c0,
  23,311 chars). Repo: 9 stars, 2 forks,
  2 open issues, created 2026-07-10, updated
  2026-11-06, language Python, default branch
  main, not archived. PyPI agent-memory-os
  1.10.0 per secondary listing; README status
  "Stable — 1.x". A local-first memory system
  for AI-agent teams: private, team, and
  project-scoped memories behind a hard ACL,
  associative recall, federated sync, one
  SQLite file, zero required dependencies for
  the core.
- ipiton/agent-memory-mcp — MIT License,
  Copyright (c) 2025 ipiton (LICENSE file SHA
  f769ef7bc9c3478953844555b781b1f6f64d68d1).
  README read in full (file SHA
  cfd50e8911a78dda569684bd843cb9c8c46c5c8c,
  2,833 chars — a short README; the detail
  lives in docs/ FEATURES, STEWARDSHIP,
  ARCHITECTURE, SECURITY, MCP_TOOLS, which
  were NOT read this run). Repo: 45 stars,
  12 forks, 0 open issues, created
  2026-02-20, updated 2026-11-20, language
  Go, default branch main, not archived.
  Official MCP registry listing active,
  version 0.19.0 per the registry. A local
  MCP server: long-term memory and
  project-docs search for coding agents, one
  binary + SQLite per project.

## tigerless-labs/agent-memory — usable patterns (restated in our own words)

- Files are the truth; every index is a
  rebuildable cache. Markdown files are the
  single source of truth; the SQLite/FTS5
  index beside them is a cache, and deleting
  it and rebuilding loses zero knowledge —
  the README says this is enforced by a
  test, not promised in a doc. Memory stays
  greppable, git-able, and portable off the
  system.
- Retrieve by path, then read by level.
  Recall answers with an L0 list — one-line
  abstract, file path, anchor, score — and
  the agent opens what it wants at the depth
  the task needs: index line, then abstract,
  then full file, then raw material. Each
  rung costs an order of magnitude more than
  the last, and each is a place to stop.
  Long files add two free rungs: the anchor
  that matched, and an outline computed at
  read time.
- Three read tracks, so a miss on one is not
  a miss. Deterministic MEMORY.md injection
  at session start; BM25 recall over an FTS5
  index, with an optional vector plugin fused
  in by reciprocal-rank fusion; and the plain
  directory tree, reachable with ls and grep
  when both fail. Same-directory memories are
  a free neighbourhood, and `links` in the
  frontmatter carry the graph without a graph
  database under them.
- Write coverage is the system's job, not the
  agent's judgement. Distillation fires at
  conversation boundaries and runs without
  holding up the task; the full trace is
  copied first, so "missed by the distiller"
  never means "lost by the system".
- A real Manage layer, on its own clock.
  Sleep-time consolidation with authority
  tiers: an unattended pass may add and
  update, deletion only ever arrives as a
  proposal you confirm. Supersede leaves the
  chain intact and recall --as-of answers as
  of a date, so updating never destroys.
- Validity intervals. `valid_from` and
  optional `invalid_at` define a memory's
  validity interval; replaced and deleted
  files stay in the store for as-of recall
  and trace. Current recall uses files
  without `invalid_at`.
- Explicit links must name distinct active
  memories in the same store; correcting
  links replaces the full list, clearing
  removes every link, omitting links
  preserves historical relationships during
  an unrelated correction.
- No LLM client inside the library. Zero keys
  to install and no billing surface:
  judgement is borrowed from the host
  agent's own CLI, which keeps every write
  visible in the transcript.
- Config discipline: every tunable in one
  config file; an unknown knob is refused
  at load.
- Durable write jobs, not fire-and-forget:
  a hook enqueues the job, a worker runs
  exactly it, a crash is recovered from the
  queue by the next lifecycle event; traces
  are JSONL, strings redacted, bodies as
  digests unless explicitly enabled.
- Honest experiment discipline worth copying
  as a pattern: the README states its own
  numbers are not comparable to published
  scores (bounded haystack), that a
  system-to-system row differs in write and
  read together and licenses no attribution
  to either half, and that an enabled setting
  or a tool call with zero hits does not show
  the intervention was used.

NOT adopted: any code (no CLI, MCP server,
hooks, schemas, config loader, or experiment
harness); the LongMemEval numbers (127/240 =
52.9% vs MemCore 86/240 = 35.8%, p-values;
author-run, bounded haystack, their own
judge — the README itself says absolute
numbers are not comparable to published
scores); the vector Recall@5 79.0% -> 86.6%
and latency 5.1ms -> 139.2ms figures; the
CJK 2/10 -> 9/10 -> 10/10 check; the 9
ordered writer/reader pair interop claim and
the pooled 2/36 -> 13/36 p=0.0074 figure as
HALEX results; the uv/checkout install route
(an install mechanism, not a pattern); any
star/fork count as quality.

Excluded by the HALEX gate: the host-CLI
reasoner borrowing (HALEX stays stdlib-only
with zero provider/network/API-key code —
no host reasoner, no endpoint/Vertex/OpenAI
configuration, no live preflight); no
unattended sleep-time pass; no
vector/embedding index and no model
downloads; no cron installer; no
pproxy/credential bridging; patterns only.

## yamantaka520/Agent-Memory-OS — usable patterns (restated in our own words)

- Hard ACL before ranking, never a soft
  score. Scopes are private / agent / team /
  project / global; a team sees `team:<id>`
  memory, a project (a subset of the team)
  sees `project:<id>` memory, nothing leaks
  across the boundary. Membership is
  first-class and drives the ACL; removing a
  member re-scopes recall instantly;
  deleting a scope revokes its memory.
- Candidate providers return IDs only.
  Content is always re-read through the
  authoritative SQLite rows behind the ACL
  and expiry hard gates. The SQLite
  `memories` table is the single source of
  truth; FTS/vector indexes are disposable
  and rebuildable.
- Federation with a real trust model.
  Portable bundles + peer sync converge
  memories, links, profiles, AND the org
  structure (teams/projects/memberships)
  with last-writer-wins + tombstones.
  Per-peer policy (`shared`/`full`/`team:`/
  `project:`) is an enforced authorization
  scope: a peer can only assert membership
  within its own scope and can only shrink a
  memory's visibility, never widen it — no
  cross-scope escalation from a bundle.
- Revocation that propagates. An independent
  ACL clock carries a post-hoc share/revoke
  across the mesh, so revoking access
  actually retracts it on peers that already
  synced the memory — without disturbing
  the decay clock.
- Dynamic context packs: token-budgeted,
  auditable memory selection per prompt, with
  a report explaining every include/exclude
  decision.
- Truth arbitration: duplicate suppression,
  contradiction detection (`CONFLICT`
  markers), and reserved budget for core
  memories.
- Associative recall (resonance): an
  authoritative `memory_links` graph lets
  related memories surface even when they
  share no query terms; traversal is
  ACL-safe (invisible nodes are
  untraversable). Association edges are
  authoritative data, survive index rebuilds,
  and decay when unused.
- Hebbian reinforcement: memories recalled
  together grow stronger links; unhelpful
  recalls weaken links and confidence.
- Per-agent recall profiles: different agent
  personas weight memory types differently;
  profiles persist in the database and
  re-weight ranking only, never bypassing
  the ACL.
- Memory lifecycle: exponential/linear decay,
  pinning, hard expiry, and a write-side
  consolidate pass that merges duplicates
  and synthesizes strongly co-recalled
  clusters into concept memories.
- Backup discipline: SQLite online backup API
  so backups are consistent even while
  agents are writing; rotation that can
  never delete the live database. Databases
  self-migrate through a versioned,
  forward-only migration table.
- Token tiers worth noting as a pattern:
  admin, read-only (GET-only), and
  sync-scoped (federation routes only) —
  hand the narrowest token to the peer.

NOT adopted: any code (no SDK, MCP server,
Web UI, federation, Docker assets, or
service installer); the performance figures
(10k memories: add 0.17 ms, search <1 ms,
context-pack 7.8 ms); the "300+ tests across
a 3-OS CI matrix" figure as a HALEX test
result (author claim, suite not run by us);
the Mem0/Zep comparison table as fact (the
README itself calls it a positioning
comparison, not a benchmark); the PyPI
1.10.0 version beyond the secondary listing;
any star/fork count as quality (9 stars is
recorded, not a verdict — small, and quiet
since 2026-11-06).

Excluded by the HALEX gate: no
federation/network/sync code, no MCP server,
no Web UI/API/token handling, no vector
sidecar, no unattended consolidation or
auto-reinforcement, no service-install
machinery; patterns only. The LICENSE
appendix naming "Bastet Agent Team" is
recorded as read — the appendix belongs to
the sibling Bastet-Agent-OS project, and
the attribution line in the NOTICE entry
carries the repo name, not the appendix
name, to avoid misattribution.

## ipiton/agent-memory-mcp — usable patterns (restated in our own words)

- Search memory and docs together.
  Decisions, facts, and procedures are
  ranked alongside docs, ADRs, and runbooks,
  and every hit says how far to trust it —
  the README's example carries trust fields
  (layer, source, confidence, freshness,
  owner) on the hit itself.
- Stewardship as a separate pass. A steward
  run finds duplicates, contradictions, and
  stale entries, and sends anything risky
  to a review inbox — never auto-applied.
- Drift detection. A drift scan flags
  memories whose source file changed or
  disappeared, so memory is checked against
  the repo it describes.
- The last word stays human. Notes become
  canonical only through an explicit
  promote-to-canonical step. An agent cannot
  verify its own notes.
- Stays local. One binary and SQLite per
  project; an HTTP mode exists for a shared
  team instance (excluded below).
- Lifecycle vocabulary worth keeping:
  typed memory, session consolidation,
  sedimentation, backup/restore, and a
  written threat model alongside the
  architecture docs.

NOT adopted: any code (no Go server, MCP
tools, hooks, or CLI); the docs/ detail
(FEATURES, STEWARDSHIP, ARCHITECTURE,
SECURITY, MCP_TOOLS, CLI) was NOT read this
run, so stewardship internals beyond the
README bullets are not adopted as verified;
the 0.19.0 release and registry listing
beyond what the registry record states; any
star/fork count as quality.

Excluded by the HALEX gate: no MCP server,
no embedding provider (the README says the
standalone path needs one — excluded
outright), no HTTP team mode, no binary
install; patterns only.

## What would be built (HALEX-AI, patterns only)

- A Markdown-truth memory discipline for the
  staged packs: files as truth, any index
  rebuildable, progressive recall (abstract
  -> outline -> full -> trace), validity
  intervals with as-of recall, supersede
  chains that never destroy history.
- A scope rule for shared memory: candidate
  IDs first, content re-read through a hard
  gate; a peer/scope may only shrink
  visibility, never widen it; revocation
  propagates; nothing stored by another
  agent is ever executed, and no stored
  claim is adopted as fact without a check.
- A steward pass for staged memory: a
  separate review inbox for duplicates,
  contradictions, and stale entries; a
  drift check against the files a memory
  cites; promotion to canonical only by
  Jeffrey's explicit approval — an agent
  never verifies its own notes.
- A per-hit trust line on staged recall
  results (source, confidence, freshness,
  owner) so a hit carries how far to trust
  it.

## What must never be claimed

- No LongMemEval, Recall@5, latency, CJK,
  test-count, or performance figure from any
  of the three repos as a HALEX result.
- No comparison-table row (Mem0/Zep/Graphiti
  or Mem0/Zep/Letta) as fact.
- No star/fork count as quality; the 9-star
  AMOS count and the 4,320-star tigerless
  count are both popularity, not quality.
- The AMOS LICENSE appendix copyright
  ("Bastet Agent Team") is not the repo's
  attribution; the repo is yamantaka520/
  Agent-Memory-OS under Apache-2.0.
- ipiton docs/ (stewardship internals,
  security, threat model) were not read —
  nothing from them is verified.

## Gate

- Licenses: MIT (tigerless-labs/agent-memory,
  ipiton/agent-memory-mcp) and Apache-2.0
  (yamantaka520/Agent-Memory-OS), all read
  verbatim via the GitHub connector.
  Per-source NOTICE + credit in
  user_systems/NOTICE.md.
- No copied code, no branding, no
  execution/wallet/key/signing/payment code.
  HALEX-AI engine stays stdlib-only, zero
  network/wallet/signing/payment/API-key
  code. Affiliate rules unchanged.
- Knowledge entry only: no module, no live
  subsystem. Patterns restated in our own
  words.
