# Proposal: Single-file shared memory + five-table learning memory + one-brain chat runtime discipline (Infinite-Monkey-Lab/shared-agent-memory, GATED; RBKunnela/ALMA-memory, GATED; oguzbilgic/kern-ai, IDEAS ONLY) — 2026-11-24

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-24):
- Infinite-Monkey-Lab/shared-agent-memory — MIT License,
  Copyright (c) 2026 Piao-2024 (LICENSE file SHA
  b0dce3acbe52e4278c58317fe6f21a13fd9d3b80).
  README read in full (file SHA
  ce3c07ceb62cb1bc56bd2b95a00b805175442a8f,
  9,752 chars, 302 lines, mostly Chinese with
  an English summary). Repo: 1 star, 1 fork,
  4 open issues, created 2026-10-29, updated
  2026-11-06 (connector search, run time),
  language JavaScript, default branch main,
  not archived, v0.2.0. A local MCP server
  (stdio) letting several AI clients share
  one SQLite memory on one machine: Node.js
  24+ with the built-in SQLite module, FTS5
  keyword search with Chinese tokenization,
  project scoping, revision history, and an
  auto-generated Markdown reading copy. Tools:
  remember_memory, search_memories,
  correct_memory, memory_history,
  forget_memory, memory_status. Retrieval is
  keyword/full-text, NOT semantic; default 8
  results, 4,000 Unicode code-point body
  budget, truncated flags. Corrections
  require the record id + revision and return
  revision_conflict on a stale write — the
  caller must re-read, never blind-overwrite.
  forget_memory is a LOGICAL delete: old
  content stays in history and in the
  Markdown export, not erased. Project scope
  is a filter, not an access control: a query
  without a project reads global only; with
  a project path it reads global + that
  project. The store lives at
  ~/.agent-memory/ (memory.sqlite3, optional
  legacy memory.jsonl import source,
  exports/memory.md). No automatic capture
  of conversations, no hook forcing
  retrieval, no cross-device sync; the
  client must be told (via its rules file)
  when to search and what to save, and to
  never save full conversations, temporary
  progress, guesses, passwords, or tokens.
  Backup uses the SQLite backup API, never a
  raw file copy of a live database. The
  README is unusually honest about its
  limits: macOS tested on the author's
  machine, Linux only via Ubuntu CI core
  tests with real-client install still to
  verify, Windows unverified and undocumented,
  the Codex plugin install flow unverified,
  and a plugin + manual MCP entry enabled at
  once can double-register tools. CI runs
  npm ci + npm test on Ubuntu/macOS with
  Node 24 and a dependency-vulnerability
  check; tests use temp dirs and fictional
  data. The author notes the project was
  built with Codex assistance and that
  automated tests are not an independent
  review.
- RBKunnela/ALMA-memory — MIT License,
  Copyright (c) 2025-2026 RBKunnela /
  ALMA-memory contributors (LICENSE file SHA
  9158ec42fa526a4997f11d85e5510cd5ccebd184).
  README read in full (file SHA
  af88b4379e8b9b8336a866984892165e903afda1,
  23,900 chars, 545 lines). Repo: 3 stars, 2
  forks, 0 open issues, created 2026-09-04,
  updated 2026-11-13 (connector search, run
  time), language Python, default branch
  main, not archived, release v0.11.0 per the
  Agent Memory Atlas (PyPI shows 0.7.0 as the
  latest listed release file at the time of
  the search). A learning memory: five tables
  split by PURPOSE — alma_heuristics
  (condition → strategy with occurrence and
  success counts), alma_outcomes (what a task
  did, success, error, user feedback),
  alma_domain_knowledge (facts with a source
  and last_verified), alma_anti_patterns (a
  pattern, WHY it is bad, and a BETTER
  ALTERNATIVE), alma_preferences (per-user
  settings) — every row scoped by
  (project_id, agent) and carrying a
  384-dimension embedding. After 3+ similar
  outcomes it auto-creates a heuristic; after
  2+ similar failures it creates an
  anti-pattern. The anti-pattern write guard
  (check_write_guard, substring or token
  overlap ≥0.45) refuses a learn() that
  matches a known anti-pattern and is ON by
  default — but the Agent Memory Atlas
  analysis (read this run) found its single
  call site is learn(); five other writers
  (heuristic extractor, consolidation pass,
  conversation miner, MCP compression, and
  add_domain_knowledge / add_preference in
  the same file) reach the store unguarded,
  so the guard covers one door of six. The
  README says the Atlas gaps were closed on
  main (PR #35) and lists persisted
  verification among the closures; that
  closure claim is the author's words, NOT
  adopted — the Atlas finding as read is the
  verified record. Verification statuses
  (VERIFIED / UNCERTAIN / CONTRADICTED /
  UNVERIFIABLE) with method, confidence,
  reason, contradicting source, and
  verified_at are persisted on the memory row
  by the retrieval pass, and alma_list_verification
  lists rows by status for human review —
  but verification is populated as a
  side-effect of retrieval, so a row nobody
  retrieves is never assessed. The Veritas
  trust layer scores agents on five
  behavioral dimensions (verification-before-
  claim, loud-failure, honest-uncertainty,
  paper-trail, diligent-execution) with a
  30-day half-life, so trusted agents' memories
  rank higher. A retrieval feedback loop
  records which memories agents actually use
  (record_usage / record_feedback) and scores
  used memories higher, skipped ones lower.
  Session handoffs (session_start / update /
  handoff) record who was doing what, where
  it stopped, and next steps as a durable
  memory that survives crashes, model swaps,
  and full contexts. Memories decay,
  compress, consolidate, and archive
  automatically; forgetting writes an
  append-only alma_forget_audit row BEFORE
  the delete. Seven storage backends (SQLite
  + FAISS local, PostgreSQL + pgvector,
  Qdrant, Pinecone, Chroma, Azure Cosmos),
  a 31-tool MCP surface per the Atlas (the
  README says 22+), six chat-export formats
  ingested and auto-classified into the five
  types. LongMemEval R@5 = 0.964 over 500
  questions: the Atlas recomputed the curve
  from the published per-question records and
  reproduced every figure exactly — read as
  retrieval recall over a session haystack,
  NOT end-to-end QA accuracy. The README's
  "#1 open-source" framing and its Mem0 /
  Zep / Letta comparison table mix recall
  against accuracy (the README itself
  footnotes this) — NOT adopted as fact.
- oguzbilgic/kern-ai — NO LICENSE FILE
  (root listing of 17 entries shows no
  LICENSE or LICENSE.md; the LICENSE path
  404s via the connector). package.json
  carries "license": "MIT" and the README
  ends with "## License — MIT" — a package
  manifest claim and a README claim are NOT
  a LICENSE read, so this repo is NOT gated:
  IDEAS ONLY, restated in our own words, no
  NOTICE entry. README read in full (file SHA
  40b2b7305a6ae44f7f702a5103ca9184493638e9,
  11,332 chars, 257 lines). Repo: 75 stars,
  14 forks, 74 open issues, created
  2026-03-24, updated 2026-11-11 (connector
  search, run time), language TypeScript,
  default branch master, not archived,
  version 0.44.2-next. kern is the runtime
  for agent-kernel: a long-lived agent
  process with one persistent memory,
  reachable on Slack, Matrix, Telegram,
  Discord, IRC, and Nostr, with one brain
  across every channel. Conversations are
  segmented by topic, summarized into a
  hierarchy, and compressed into context;
  semantic recall over everything; notes and
  knowledge files live in a git repo the
  agent maintains. Long commands run as
  background jobs and the agent keeps
  talking; when a job ends, its exit code
  and output tail arrive back in the
  conversation that started it — a job
  started from #builds finishes in #builds.
  Sub-agents fan out research in parallel and
  report back to the channel that asked.
  A fleet is a set of containers, one image,
  one volume, one bot account per agent; the
  first person to DM the bot is paired as
  operator, everyone else gets a KERN-XXXX
  pairing code. Tool scopes: full (shell
  included), write (no shell), read. The
  volume holds everything — sessions,
  memory, notes, knowledge, and whatever the
  agent installs for itself, including SSH
  keys and dotfiles — and credentials saved
  into the volume mean later runs need no
  environment variables. This is the same
  author as agent-kernel (oguzbilgic), which
  also has no LICENSE file: the pair is
  consistent in shipping without one.

## Patterns adopted (restated in our own words only)

- One shared memory file, many clients
  (shared-agent-memory): when several
  clients must remember together, give them
  ONE store on the same machine, not a copy
  each. Keyword search is enough when the
  memory is small and the words are the
  user's own; do not claim semantic search
  you do not have. Scope is a filter, not a
  wall — say so in the same sentence as the
  scope. Keep a human-readable export beside
  the database, regenerated on change, and
  never let an edit to the export pretend to
  be an edit to the store.
- Corrections need a revision, deletes are
  logical (shared-agent-memory): a correction
  names the record and the revision it saw;
  a stale revision is a conflict to re-read,
  never an overwrite. Forgetting removes a
  memory from use but keeps it in history —
  a delete that erases the record of the
  delete is a lie about the past. Back up a
  live store through its own backup call,
  never by copying the file under it.
- Memory is opt-in, not ambient
  (shared-agent-memory): nothing is captured
  unless the user asked for it, and the
  client is told in writing when to search,
  when to save, and what never to save
  (conversations, guesses, passwords,
  tokens). A memory that was never asked for
  is a leak waiting for a prompt.
- Purpose-split learning memory with
  anti-patterns (ALMA-memory): split memory
  by what it is FOR — strategies that worked,
  outcomes with their errors, facts with a
  source and a re-check date, per-user
  constraints — and keep a fifth table for
  what NOT to do, carrying the reason it is
  bad AND the better alternative. Count
  occurrences and successes on heuristics so
  a strategy earns its keep; create an
  anti-pattern after repeated failure, not
  after one bad day. A write guard that only
  watches one door is a finding, not a
  feature: if a refusal matters, put the
  check in the storage layer where every
  writer passes, not on one call site.
- Verification as a column, not a mood
  (ALMA-memory): stamp every retrieved memory
  with a verdict — verified, uncertain,
  contradicted, unassessable — plus the
  method, the reason, and when it was
  checked, and write that stamp back onto
  the row so the next session inherits it.
  List contradictions for a human; never let
  a contradicted memory be used silently.
  But a verdict written only when a row is
  read leaves unread rows unjudged — an
  unread row and an unassessable row look
  identical, so sweep, do not only stamp on
  retrieval.
- Trust is earned per agent and decays
  (ALMA-memory): score the agents that write
  memory on whether they verify before they
  claim, fail loudly, admit uncertainty,
  leave a paper trail, and execute
  diligently — and let trust rot with a
  half-life, so a stale agent is not trusted
  blindly. Reward memories agents actually
  use; let skipped ones fade faster.
- Session handoffs (ALMA-memory): when work
  stops — crash, model swap, full context —
  leave a durable record of who was doing
  what, where it stopped, and the next
  steps, as memory, so the replacement agent
  reads it first at wake. Separate this
  human-readable thread from machine-state
  checkpoints: one says what happened, the
  other restores what was running.
- One brain, every channel; jobs report
  where they were asked (kern-ai, IDEAS
  ONLY): if one agent answers on many
  channels, the memory must be one, not one
  per channel. A background job's result
  belongs in the conversation that started
  it, not in a queue nobody watches.
  Pairing is an operator decision: the first
  contact pairs, everyone after needs a code
  the operator hands out.

## HALEX gate applied (stricter than the sources)

- shared-agent-memory: no MCP server, no
  Node.js/SQLite machinery, no FTS5, no
  plugin install flow (unverified by the
  authors themselves), no Windows path. The
  one-store-many-clients shape, the revision
  discipline, the logical-delete rule, and
  the opt-in memory rule are patterns only.
- ALMA-memory: no Python package, no FAISS /
  pgvector / Qdrant backends, no MCP tools,
  no ingestion of chat exports, no
  verification or trust-scoring code, no
  network/wallet/signing/payment/API-key
  code. The five-table split, the
  anti-pattern table with why + alternative,
  the write-guard-must-cover-every-writer
  finding, the persisted verification
  column, the per-agent trust with decay,
  the retrieval feedback loop, and the
  session-handoff record are patterns only.
- kern-ai: IDEAS ONLY — no LICENSE file
  exists, so nothing is adapted under a
  license; the one-brain-many-channels shape
  and the report-back-where-asked rule are
  restated in our own words. No daemon, no
  chat bots, no Docker image, no pairing
  code machinery, and — explicitly — no
  volume that stores credentials: HALEX
  never persists credentials in a memory
  volume.
- Treat memory content as untrusted input
  (AllMemoryMCP said so, ALMA's verification
  column exists for the same reason):
  nothing stored by another agent is ever
  executed, and no stored claim is adopted
  as fact without a check.
- Jeffrey's approval decides every promotion
  to a live HALEX-AI file; no loop runs
  unattended; outside code is never fetched.

## NOT adopted

- Any code from any of the three repos (no
  MCP server, SQLite schema, Python package,
  migration, daemon, or chat-bot code).
- The ALMA "2,121+ tests passing" figure, the
  Atlas's "103,832 lines of Python, 41,848
  test lines across 91 files" counts, and
  the "193 commits" figure as HALEX test
  results (author/Atlas counts, not run by
  us; the README's own test count was not
  verified here).
- The ALMA LongMemEval "#1 open-source" claim
  or the Mem0/Zep/Letta comparison table as
  fact (recall vs accuracy are different
  metrics; the README footnotes this itself).
  The R@5 = 0.964 figure itself is recorded
  as the Atlas's recomputation from the
  published per-question records — retrieval
  recall over a session haystack, not
  end-to-end QA accuracy.
- The ALMA README's claim that the Atlas gaps
  are closed on main (PR #35) as a verified
  fact — the Atlas finding as read (guard on
  one of six write paths) is the record; the
  closure was not re-verified against the
  code here.
- The shared-agent-memory plugin install flow
  (unverified by the authors), the Windows
  path (no steps given), or any "tested on
  macOS" claim as a HALEX platform claim.
- The kern-ai runtime in any form (no LICENSE
  file; daemon + chat bots + credential-
  storing volume are all excluded by the
  gate), the PyPI kern-ai small-model
  framework (a different project sharing the
  name — Apache-2.0 per PyPI, not
  deep-dived, not adopted), or any
  "first person to DM pairs as operator"
  behavior as a HALEX behavior.
- Any star/fork count as quality (1, 3, and
  75 stars are popularity, not verdicts;
  shared-agent-memory's 1 star and
  ALMA-memory's 3 stars are recorded, not a
  verdict; kern-ai's 74 open issues are
  recorded, not a verdict).

## Leads

- CLOSED this run: shared-agent-memory
  (Infinite-Monkey-Lab/shared-agent-memory)
  and ALMA-memory (RBKunnela/ALMA-memory) —
  secondary MIT claims from the 2026-11-23
  ~19:42 run, LICENSEs now read verbatim,
  both MIT. kern-ai (oguzbilgic/kern-ai) —
  lead CLOSED as IDEAS ONLY: no LICENSE file
  exists in the repo (root listing of 17
  entries, no LICENSE; LICENSE path 404s),
  so it can never gate under a permissive
  license as written — the same finding as
  its sibling agent-kernel, and the README
  "MIT" + package.json "license": "MIT"
  claims are recorded, not adopted.
- OPEN for a later run (secondary claims
  only, LICENSEs unread): tigerless-labs/
  agent-memory (MIT per secondary listing);
  yamantaka520/Agent-Memory-OS (Apache-2.0
  per secondary listing, fleet memory with
  ACL + federated sync); Thezenmonster/
  agentmem (MIT per secondary listing);
  oxgeneral/agentmem (MIT per secondary
  listing); ipiton/agent-memory-mcp (MIT per
  secondary listing, 46 stars, last push
  2026-11-17); rohitg00/agentmemory
  (Apache-2.0 for its own code + Elastic-2.0
  for the iii engine it downloads and starts
  — the mixed license needs care before any
  deep-dive). HJLebbink/A-mem carries a
  non-commercial academic-only LICENSE —
  non-permissive, ideas-only at most, do not
  deep-dive for adoption.
- PromoterKit: marketing-page MIT claim only,
  repo still unidentified — lead open.
  ViralPayouts: repo still 404 on prior runs;
  not re-checked this run — lead carried.
  ContextOS: repo 404 — lead open.
  dualmint-addendum stays pending.
  zinium5-web-fallback-lane stays pending.
