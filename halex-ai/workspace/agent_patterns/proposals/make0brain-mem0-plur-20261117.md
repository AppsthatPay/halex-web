# Proposal: plain-text engram memory + versioned shared memory + ADD-only multi-signal memory — 2026-11-17

Sources (LICENSEs read verbatim via the GitHub connector, 2026-11-17):
- make0-official/brain-oss — MIT License, Copyright (c) 2026
  Make0 — LICENSE read verbatim (file SHA not returned by the
  tool's text field; LICENSE text is the standard MIT text,
  copyright line "Copyright (c) 2026 Make0"). README read in
  full (file SHA b412146586e5046e94a17293f2f710d0c769dac9,
  55,573 chars). Repo: 15 stars, 1 fork, 0 open issues,
  created 2026-10-27, updated 2026-11-13, TypeScript,
  default branch main, not archived. A local-first MCP
  memory server shared across coding agents (Claude Code,
  Cursor, Codex, Windsurf, VS Code, Gemini CLI, Hermes
  Agent, OpenClaw): one SQLite file on the machine, every
  memory versioned with who wrote it and when, contradictions
  resolved by newer-wins with the older version archived
  (reworded updates and changed values caught only when an
  optional local or hosted LLM is connected), import of
  past sessions from 41 coding agents plus Obsidian vaults
  and Markdown folders, export to plain Markdown, a local
  viewer on 127.0.0.1, 7 MCP tools, offline after a one-time
  ~50 MB local model download. Stated limits: one machine,
  no sync between devices, each memory up to 4,000
  characters. The README's default chat model is named
  "gpt-6-luna" — recorded as the project's own text, not
  adopted as a fact about any model. Benchmark pages
  (SWE-ContextBench, LongMemEval) are linked, not read by
  this run; no benchmark figure is adopted.
- mem0ai/mem0 — Apache License 2.0 — LICENSE read verbatim
  (file SHA d20d5102c3cf97ecbee54afd65893de4a11d26fe).
  README read in full (file SHA
  c9ed6dbfbe14a2fe60b8f3761a083786157a6987, 12,261 chars).
  Repo: 69,093 stars, 8,224 forks, 960 open issues, created
  2023-06-20, updated 2026-11-17, Python, default branch
  main, not archived. The memory layer for AI agents:
  single-pass ADD-only extraction (one LLM call, no
  UPDATE/DELETE — memories accumulate, nothing is
  overwritten), agent-generated facts stored first-class,
  entity linking across memories, multi-signal retrieval
  (semantic + BM25 keyword + entity matching, fused),
  temporal reasoning that ranks the right dated instance,
  multi-level memory (User, Session, Agent), self-hosted
  server via Docker, a CLI that lets an agent mint its own
  API key, and a skills catalog for coding assistants.
  Requires an LLM to function (default gpt-5-mini, OpenAI
  embeddings text-embedding-3-small) — network and API-key
  by design. The README states its own benchmark table
  "reflect[s] Mem0's managed platform, which includes
  proprietary optimizations not available in the
  open-source SDK" — no benchmark figure is adopted.
- plur-ai/plur — Apache License 2.0 — LICENSE read verbatim
  (file SHA a060433ccbdef7734d3e7938699e10e8b3eac14e).
  README read in full (file SHA
  76189f67acb6953a78b90874f6be9332a58b4dcd, 36,544 chars).
  Repo: 318 stars, 40 forks, 616 open issues, created
  2026-03-19, updated 2026-11-16, TypeScript, default
  branch main, not archived. Persistent open memory for AI
  agents: engrams as plain YAML (id, statement, type,
  domain, scope, confidence, provenance) validated against
  a published JSON Schema generated from the same Zod
  source as the engine; ACT-R activation decay (stale facts
  fade from injection, strengthen on access); feedback
  signals that train injection quality; hierarchical scope
  (global, project:, cluster:, service:); polarity
  classification of "do" vs "don't" rules injected
  separately; associations including co-access edges;
  episodes as timestamped event records with agent
  attribution and channel; an outbox that queues team-scope
  writes locally with retry metadata when the team store
  is unreachable instead of dropping them; a memory receipt
  counted from retrieval history that carries no dollar or
  token figure by design; git-based sync with personal
  (private remote, everything mirrored) vs shared
  (only shared-scope, non-private engrams) remotes, with
  scope: local engrams stripped from every commit; secret
  detection (API keys, passwords, tokens); per-writer
  provenance identity (unstamped writers recorded honestly
  as agent:unidentified, never guessed); local hybrid
  search (BM25 + BGE-small embeddings + Reciprocal Rank
  Fusion), zero API calls. Sibling repos: plur-ai/engram-spec
  (the Open Engram Standard), plur-ai/plur-bench
  (reproducible benchmark harness). Benchmark figures
  (97.6% R@5 LongMemEval-S, "Haiku + PLUR beats Opus at
  ~10x less cost", 60.5% end-to-end answer accuracy) are
  the project's own, with a published harness — NOT adopted
  as verified. Note: 616 open issues against 318 stars is
  a high issue load for the repo's size; recorded, not
  smoothed over.

## Verdict: GATED, patterns only (all three permissive: MIT + Apache 2.0 + Apache 2.0)

Ideas taken, restated in our own words; no code copied from any
of the three repos.

1. **Plain-text engram shape (PLUR):** HALEX-AI's lesson
   and memory records already live as plain text with
   provenance; adopt the engram field discipline as a
   design pattern for any future memory record — a typed
   assertion with id, statement, type, domain, scope,
   confidence, and provenance (who wrote it, when), plus
   polarity (do vs don't) so constraints are injected
   separately from directives. Records a writer cannot
   attribute are stamped unidentified, never guessed.
   Scope is hierarchical (global / project / service) and
   controls where a record applies.
2. **Activation decay + feedback (PLUR):** a record's
   retrieval strength decays with disuse and strengthens
   on access and on positive feedback; stale facts fade
   from injection without manual cleanup. A contradiction
   scan retires the older record in favour of the newer
   one, keeping the older version archived, never silently
   overwritten. (Matches Make0 Brain's newer-wins rule;
   both agree on archive-never-delete.)
3. **Versioned shared memory + writer attribution
   (Make0 Brain):** every memory edit is a version with
   who wrote it and when; nothing is overwritten silently.
   Import discipline: past sessions and notes are imported
   as digests filed under their project, never as raw
   dumps, and export is plain Markdown so the memory
   stays portable and human-readable.
4. **ADD-only extraction + multi-signal retrieval
   (mem0):** when a memory is written, add a new record;
   never update or delete in place. Retrieval fuses
   semantic, keyword, and entity signals, and ranks the
   right dated instance for questions about current state
   vs past events (temporal reasoning). Multi-level memory
   (user / session / agent) as named scopes, not as
   separate stores.
5. **Outbox + memory receipt (PLUR):** a write that cannot
   reach its store is queued locally with retry metadata
   and retried — never lost, never silently dropped. A
   memory receipt counts what retrieval actually did
   (times a memory was put in front of the model, distinct
   records used, store coverage) and carries no dollar or
   token figure by design — it reports only what it can
   count, and a low coverage rate is a property of a
   selective store, not a fault.

## NOT adopted (claimed, not verified by us)

- Make0 Brain: any SWE-ContextBench or LongMemEval figure;
  the "gpt-6-luna" default model name as a fact; the 4,000
  character limit as a tested bound (it is the project's
  stated limit, recorded as claimed); any npm download or
  adoption figure; star counts as quality (15 stars).
- mem0: the LoCoMo 92.5 / LongMemEval 94.4 / BEAM figures
  (the README itself says they reflect the managed platform
  with proprietary optimizations not in the OSS SDK);
  any "production-ready" claim as a tested fact; star
  counts as quality (69,093 stars).
- PLUR: the 97.6% R@5 / 95.6% hybrid / 92.2% BM25-only
  LongMemEval-S figures; the "Haiku + PLUR beats Opus at
  ~10x less cost" claim; the 60.5% end-to-end answer
  accuracy; the 12–0 house-rules claim; any cost figure;
  star counts as quality (318 stars). The 616 open issues
  are recorded as a maturity signal, not a verdict.

## Excluded by the HALEX gate (never built, never staged)

- No Make0 Brain code: no MCP server, no SQLite store, no
  Node/TypeScript code, no model download, no API-key or
  local-model wiring, no viewer, no session importer.
- No mem0 code: no Python library, no Docker self-hosted
  stack, no LLM or embedding provider integration, no API
  keys, no hosted platform, no CLI, no agent-signup flow.
- No PLUR code: no TypeScript engine, no MCP tools, no
  embedding model download, no git-sync code, no Postgres /
  pglite indexing tier, no secret-detection code.
- No network / wallet / signing / payment / API-key code
  anywhere in the HALEX-AI engine; stdlib-only. No
  third-party branding. No personal information.

## What would be built (future, by the builder queue)

- An engram-shape note for HALEX-AI memory records: typed
  assertion + scope + polarity + confidence + provenance,
  with unidentified writers stamped honestly.
- A decay-and-feedback discipline for pack injection:
  retrieval strength by use and feedback, contradiction
  scan retiring older records to archive.
- An ADD-only write rule for the lesson chain: new records
  only, never in-place update or delete; temporal ranking
  for current-state vs past-event questions.
- An outbox discipline for any store write that cannot
  reach its destination: queue locally with retry metadata,
  never drop silently.
- A memory receipt: counted retrieval figures only, no
  dollar or token figures, low coverage reported as a
  property of a selective store.

## Open leads carried forward

- TencentDB Agent Memory (MIT, ~28,900 stars per secondary
  report, v2.0.3-beta.1) — repo name and LICENSE unread;
  verify directly before any adoption.
- marcelcluj-bit sibling repos (Agro-Smart-2026--Eco-Tourism,
  Global-Infrastructure--Fotbal-Soccer-Capital) — low
  priority, LICENSEs unread.
- dualmint-addendum still pending.
- zinium5-web-fallback-lane pending gate (needs Allen review +
  Jeffrey's word); not gated by this run.
