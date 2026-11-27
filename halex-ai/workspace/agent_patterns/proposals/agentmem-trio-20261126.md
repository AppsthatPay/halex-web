# Proposal: Trust-governed memory + tiered stdlib-mode memory + hook-captured memory discipline (Thezenmonster/agentmem, GATED; oxgeneral/agentmem, GATED; rohitg00/agentmemory, GATED as patterns from its Apache-2.0 code only) — 2026-11-26

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read, 2026-11-26):
- Thezenmonster/agentmem — MIT License,
  Copyright (c) 2026 Michael Onyek (LICENSE file SHA
  f3cb02f4ef9075d7bb50846160213538118d7835).
  README read in full (file SHA
  c59bd0a778d98841b4df6968fbc0edde06ed14a9,
  11,340 chars). Repo: 6 stars, 0 forks,
  0 open issues, created 2026-03-21, updated
  2026-10-08 (quiet about seven weeks at read
  time), language Python, default branch
  main, not archived. A governed memory
  store for long-lived coding agents: the
  pitch is that most memory tools solve
  storage, this one solves trust — every
  memory carries a lifecycle status and
  recall ranks by trustworthiness, not just
  relevance.
- oxgeneral/agentmem — MIT License,
  Copyright (c) 2025 agentmem contributors
  (LICENSE file SHA
  82b69aa67a4b675da9b00feea134768c058061ae).
  README read in full (file SHA
  7d2b61e47aefede3c91e7c2c72d7013fa1e43485,
  12,145 chars). Repo: 10 stars, 1 fork,
  0 open issues, created 2026-02-20, updated
  2026-11-24T21:21:51Z (two days before the
  read — active), language Python, default
  branch main, not archived. A lightweight
  persistent memory for AI agents in one
  SQLite file: hybrid keyword + semantic
  search, five memory tiers, namespaces,
  temporal versioning, and four operational
  modes that degrade from a full vector
  setup down to a pure-stdlib zero-dependency
  mode.
- rohitg00/agentmemory — Apache License
  Version 2.0 for the project's own code
  (LICENSE file SHA
  cb13c72881997c8ad1662ec42c1484cc15859147,
  10,764 chars). README 96,116 chars (file
  SHA be25d9645f1b38c68ff27fd0d69b091a4b91b75f):
  the introduction, install overview,
  memory-pipeline, four-tier consolidation,
  what-gets-captured, key-capabilities, and
  search sections were read in full; the
  complete heading list and every
  license-mention line were scanned; the
  remaining bulk (per-agent wiring blocks
  and configuration reference) was NOT read
  line by line, so nothing from that bulk is
  adopted as verified. Repo: 30,610 stars,
  2,729 forks, 476 open issues, created
  2026-02-25, updated 2026-11-26T21:21:50Z
  (today — very active), language
  TypeScript, default branch main, not
  archived. A persistent memory server for
  coding agents: hooks capture session and
  tool events, recall works keyless over
  keywords, semantic search is added only
  when an embedding provider is configured.
  LICENSE CAVEAT, READ AND RECORDED: the
  project's own code is Apache-2.0, but the
  runtime it downloads and starts by default
  (the iii engine, iii-hq/iii) is under the
  Elastic License 2.0, which forbids offering
  it to others as a hosted service. That
  engine, its download, and anything that
  depends on it are EXCLUDED outright — the
  gate below covers only patterns from the
  Apache-2.0 side, restated in our own
  words.

## Thezenmonster/agentmem — usable patterns (restated in our own words)

- Trust-governed lifecycle: every memory carries a status that tracks how
  much it should be trusted — a new observation starts as an unconfirmed
  hypothesis, becomes active by default, and is promoted to validated only
  by explicit confirmation; memories that stop being true are deprecated,
  and memories replaced by a newer one are superseded and point at their
  replacement. Recall ranks by trust, not just by text match.
- Composite recall scoring: candidates from full-text search are scored on
  several axes — text relevance, trust status, provenance, recency,
  frequency, and confidence — and packed greedily into a token budget.
  Deprecated and superseded memories are excluded from recall entirely,
  never merely down-ranked.
- Conflict detection: the store can find memories that contradict each
  other on a shared topic and report the pair, so a stale rule and its
  replacement do not both reach the agent silently.
- Staleness detection and health scoring: a periodic check reports an
  overall trust-health score plus counts of conflicts, stale entries, and
  validated entries — a single number that says whether the memory system
  itself is trustworthy.
- Provenance on every memory: each record carries where it came from and
  a hash of that source, so a changed source can be detected; sync is
  provenance-aware, and a previously superseded item can be resurrected
  when its source says so again.
- Typed memories: a small fixed vocabulary of types covering real agent
  workflows — settings, bugs and their fixes, decisions and rules,
  procedures and pipelines, background context, user corrections, and
  current session state.
- Project scoping: one store, partitioned per project, so a bug recorded
  for one project never leaks into another project's recall.
- Canonical markdown: the durable form is human-readable text files, so
  the memory is inspectable and diffable without tooling.
- Session save and load: the current work state (what is being done,
  where it stopped, what blocks it) is itself a typed memory, so a
  session can resume instead of restarting.
- Agent instruction file: a short document teaching the agent the session
  protocol, the trust hierarchy, and when to search versus when to add —
  the memory system ships its own usage discipline, not just storage.

## oxgeneral/agentmem — usable patterns (restated in our own words)

- Five memory tiers by purpose: core facts, learned facts, episodic
  records of what happened, working state that auto-expires, and
  procedural rules — the behavioral rules are formatted for direct use
  as system-prompt material.
- Graceful degradation by mode: the same store runs in four modes, from
  a full vector setup down to a pure-stdlib zero-dependency mode that
  needs nothing beyond the language itself. The zero-dependency mode is
  the architecturally interesting one for HALEX: the engine rule is
  stdlib-only, so a memory design that works with no dependencies at all
  is the only shape that can ever live inside the engine — everything
  heavier stays a pattern, never code.
- Hybrid search with adaptive ranking: keyword full-text search fused
  with semantic search, the fusion weight adapting to the query, plus a
  recency boost with configurable decay.
- Namespaces: one file, many isolated memories — per user, per agent —
  so recall in one namespace never sees another's records.
- Temporal versioning: when a fact changes, the old version is kept and
  linked to its replacement, and the full evolution chain of a fact can
  be traced — "server costs X" becoming "server costs Y" is a history,
  not an overwrite.
- Entity extraction by pattern: mentions, URLs, network addresses, env
  var names, and money amounts are pulled out of stored text, and
  related memories can be found by asking for everything that mentions
  the same entity.
- Conversation extraction: facts, decisions, and to-dos are pulled out
  of chat history automatically and filed into the right tiers, instead
  of requiring the agent to file them by hand.
- Importance scoring: memories are scored automatically by tier,
  length, specificity, and structure, so the store can rank what matters
  without a human triaging every entry.
- Consolidation: near-duplicate memories are found and merged, so the
  store does not accumulate five copies of the same fact.
- Save-state before compression: working state is explicitly saved
  before a context window is compressed, so the resume point survives
  the compression.
- One-file storage with write-ahead logging: a single database file,
  concurrent reads, thread-safe writes, nothing else to run.

## rohitg00/agentmemory — usable patterns (restated in our own words; Apache-2.0 side only)

- Hook-driven capture: session and tool lifecycle events are recorded
  as they happen — session start and end, prompt submission, tool use
  success and failure, compaction, sub-agent lifecycle — each event
  getting a stable ID, a durable inbox, and offline spooling when the
  store is temporarily unavailable, so nothing is lost to a hiccup.
- Privacy filter at capture: secrets and API keys are stripped before
  storage, and user-marked private content is excluded — the filter
  runs at the door, not as a cleanup pass later.
- Keyless recall: keyword search works with no provider and no API key;
  semantic search is added only when an embedding provider is
  configured, and a local on-device embedding option exists so semantic
  recall never has to leave the machine.
- Four-tier consolidation modeled on how human memory is described to
  work: raw observations (working), compressed session summaries
  (episodic), extracted facts and patterns (semantic), workflows and
  decision patterns (procedural). Memories decay over time, frequently
  accessed ones strengthen, stale ones evict.
- Triple-stream retrieval: keyword search, vector search, and
  knowledge-graph traversal fused by reciprocal-rank fusion, with
  results diversified across sessions; superseded versions are excluded
  from every recall path while the version chain keeps their history.
- Recall hygiene: saving a near-duplicate produces an advisory match
  against the existing memory; per-agent scoping threads through save
  and recall in shared or isolated mode; every observation and memory
  carries an immutable origin channel (user, agent, tool, import, or
  shared) stamped at capture, save, and import.
- Auto-forgetting with opt-outs: expiry by lifetime, contradiction
  detection, and importance-based eviction — each with a way to turn
  it off, so nothing is silently deleted by default behavior the user
  never chose.
- Token-budgeted context injection: at session start the store loads a
  project profile and injects only what fits a token budget, and the
  injection itself is opt-in per integration.
- Citation provenance: any memory can be traced back to the source
  observations it came from; memory state can be snapshotted, rolled
  back, and diffed like versioned data.
- Session-end summarization: when a session ends, new observations are
  incrementally summarized and knowledge-graph extraction runs only if
  explicitly enabled.
- Bridge discipline for existing memory files: when exporting to a
  memory file, the export creates the file only when it is absent —
  existing files are never overwritten, identical content reports
  unchanged, and differing content errors instead of clobbering.
- Self-healing posture: a circuit breaker, a provider fallback chain,
  and health monitoring; a vector index survives a crash because
  pending writes are logged and replayed on the next start.

## NOT adopted (all three)

- Any code: no Python package, no MCP server, no hooks, no HTTP/REST
  server, no CLI, no installer, no embedding or vector machinery, no
  model downloads, no runtime downloads.
- Thezenmonster: the comparison table against other memory tools as
  fact, and the "battle-tested" figures (production Shorts count,
  memory count, conflict-count reduction) — author-run on their own
  work, unverified, recorded not adopted.
- oxgeneral: the test counts ("206 unit tests", "107 quality tests"),
  the latency figures (sub-millisecond queries, cold-start times,
  inserts per second, bytes per memory), the comparison table against
  other stores, the "production-ready" label, and the auto-translate
  accuracy figure — all author claims, none independently verified.
- rohitg00: the "#1 persistent memory ... based on real-world
  benchmarks" tagline, the "5,000+ tests" figure, the "54 MCP tools"
  count as a quality signal, any benchmark or recall figure, and any
  star/fork count as quality (30,610 stars recorded, not a verdict).
  The iii engine (Elastic License 2.0) and everything that downloads,
  starts, or depends on it are excluded outright; the default install
  path that fetches that runtime is not adopted in any form.
- Any star/fork count as quality, for any of the three repos.

## HALEX gate (stricter than the sources)

- Patterns only, restated in our own words. No code adopted from any
  of the three repos.
- No MCP server, no hooks, no HTTP/REST server, no CLI, no installer,
  no embedding provider, no vector index, no model or runtime download,
  no LLM provider or API-key code, no auto-compression, no viewer, no
  federation or sync, no unattended consolidation or sleep-time pass.
- The stdlib-only zero-dependency mode (oxgeneral) is the only shape
  compatible with the HALEX-AI engine rule; everything else stays a
  design pattern for the staged packs, never engine code.
- No network / wallet / signing / payment / API-key code anywhere in
  what is built from this proposal.
- No investment advice, no yield promises, no token endorsements, no
  benchmark or efficacy figures adopted as HALEX results.

## What would be built (future, gated)

- A trust-status field on staged memory records (hypothesis / active /
  validated / deprecated / superseded) with recall that excludes
  deprecated and superseded rows, per the Thezenmonster discipline.
- A tier split for staged packs (core / learned / episodic / working /
  procedural) with working-state expiry, per the oxgeneral discipline.
- A capture-time privacy rule (secrets stripped at the door) and a
  write-time origin stamp, per the rohitg00 discipline — as design
  rules for the intake/builder pipeline, not as code that runs against
  live sessions.
- A health-check summary for a staged memory pack (counts by status,
  conflicts, stale entries) that a human reviews before promotion —
  never an automatic promotion.

## Verdict

GATED — patterns adopted, NOTICE.md entries added. All three leads
from the 2026-11-24 ~11:42 EST run are now CLOSED (LICENSEs read
verbatim). rohitg00 closes as patterns-only from its Apache-2.0 code,
with the Elastic-2.0 engine explicitly excluded.
