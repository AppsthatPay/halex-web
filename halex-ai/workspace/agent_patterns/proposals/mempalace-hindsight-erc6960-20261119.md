# Proposal: verbatim-first local memory (MemPalace) + learn-not-just-recall memory (Hindsight) + dual-layer token classification (ERC-6960) — 2026-11-19

Sources (LICENSEs read verbatim via the GitHub connector, EIP read in full, 2026-11-19):
- MemPalace/mempalace — MIT License, Copyright (c) 2026
  MemPalace Contributors (LICENSE file SHA
  bb10c6d6fb7eacdc850335b286a0a555235b50c0). README read in
  full (file SHA
  1bb53bc6a294ac6599dc5791556cda09d210bcb4, 17,397 chars).
  Repo: 60,629 stars, 7,674 forks, 833 open issues, created
  2026-04-05, updated 2026-11-19, Python, default branch
  develop, not archived. Local-first AI memory: conversation
  history stored as verbatim text and retrieved with semantic
  search — it does not summarize, extract, or paraphrase. The
  index is structured — people and projects become *wings*,
  topics become *rooms*, original content lives in *drawers*
  — so searches can be scoped rather than run against a flat
  corpus. The retrieval layer is pluggable (interface in
  `mempalace/backends/base.py`): ChromaDB default, plus
  sqlite_exact, rust_exact, milvus, qdrant, pgvector, each
  opt-in. Nothing leaves the machine unless the user opts in.
  Temporal entity-relationship knowledge graph with validity
  windows (add, query, invalidate, timeline) backed by local
  SQLite. 47 MCP tools covering palace reads/writes,
  knowledge-graph operations, cross-wing navigation, drawer
  management, agent diaries, and agent coordination
  (logstream events + artifact handoffs). Auto-save hooks for
  Claude Code, Codex CLI, and Cursor IDE save periodically
  and before context compression; a per-message `sweep`
  stores one verbatim drawer per user/assistant message,
  idempotent and resume-safe. Three skills: `mempalace`
  (guided install/operations), `mempalace-recall`
  (search-before-answer recall), `mempalace-task` (logstream
  delegation). Weekly stable-release checks are disabled by
  default, contact only PyPI when enabled, never install
  automatically. Benchmarks (all numbers claimed
  reproducible from the repo with commands in
  `benchmarks/BENCHMARKS.md`, per-question result files
  committed): LongMemEval retrieval recall R@5 96.6% raw
  (semantic search, no heuristics, no LLM), 98.4% hybrid v4
  held-out 450q (tuned on 50 dev), >=99% hybrid v4 + LLM
  rerank (full 500); LoCoMo R@10 60.3% session / 88.9%
  hybrid v5; ConvoMem average recall 92.9%; MemBench R@5
  80.3%. The README explicitly refuses a side-by-side
  comparison against Mem0, Mastra, Hindsight, Supermemory, or
  Zep, because those projects publish different metrics on
  different splits. Impostor warning: the only official
  sources are this GitHub repository, the PyPI package, and
  mempalaceofficial.com; any other domain (including `.tech`,
  `.net`, or other `.com` variants) is an impostor and may
  distribute malware — details in `docs/HISTORY.md`.
- vectorize-io/hindsight — MIT License, Copyright (c) 2025
  Vectorize AI, Inc. (LICENSE file SHA
  8dce7b4d4c2632990bdf8b4101694ea19ba6ad46). README read in
  full (file SHA
  69144c3929dff45d5b85036a87cbd3e77179c53e, 26,392 chars).
  Repo: 62,042 stars, 7,393 forks, 228 open issues, created
  2025-10-30, updated 2026-11-20, Python, default branch
  main, not archived. Agent memory built to make agents
  learn, not just remember. Three operations: retain (store;
  an LLM extracts facts, temporal data, entities, and
  relationships, normalized into canonical entities, time
  series, and search indexes), recall (four retrieval
  strategies in parallel — semantic, BM25 keyword, graph,
  temporal — merged by reciprocal rank fusion and a
  cross-encoder reranker), reflect (deep analysis forming new
  connections and understanding, e.g. project risks, why some
  outreach worked, gaps in documentation). Memory types:
  world facts, experiences, observations, mental models.
  Observations: retained facts consolidated in the background
  into deduplicated beliefs, each keeping supporting evidence
  with exact quotes and a proof count, refined rather than
  overwritten when new evidence arrives. Mental models: a
  standing answer to a question about a bank, written once
  and rewritten in the background as the bank learns more;
  reading one is a database read, no retrieval, no LLM call.
  Pages: mental models with the mechanics hidden — living
  documents a bank writes about itself, organized like a
  wiki, projectable onto disk as ordinary markdown. Decision
  models answer the small judgments inside recall,
  consolidation, reflect, and pages with typed answers
  instead of text to parse: hs-decide-1-flash 0.8B (Apache
  2.0), hs-rerank-1 114M (MIT), hs-embed-1 112M (MIT), open
  weights on Hugging Face. Memory banks: isolated stores, one
  per user/agent/project, no cross-bank leakage; banks carry
  background context and disposition traits (skepticism,
  literalism, empathy) shaping how reflect reasons. Memory
  Defense: opt-in per-bank policy scanning every retain for
  secrets and PII against 45 patterns, redacting the match or
  blocking the item before storage. Multilingual by default:
  facts stay in their original language, entities keep native
  script. 60+ integrations (coding agents, frameworks,
  no-code tools, apps) mostly needing no code changes; an LLM
  wrapper (2 lines) recalls before and retains after every
  call. Storage: PostgreSQL + pgvector or Oracle AI Database;
  Prometheus monitoring; admin CLI for migrations, bank
  repair, stuck operations; webhooks for lifecycle events.
  Managed Hindsight Cloud offered as the hosted option
  (usage-based, 99.9% uptime SLA). Paper: arXiv 2512.12818.
- ERC-6960: Dual Layer Token (EIP, Draft) — copyright and
  related rights waived via CC0; interface code carries
  SPDX-License-Identifier: CC0-1.0. Authors: Adam Boudjemaa
  (first author, @aboudjem), Mohamad Hammoud, Nawar Hisso,
  Khawla Hassan, Mohammad Zakeri Rad, Ashish Sood. Created
  2023-04-30. EIP page read in full
  (https://eips.ethereum.org/EIPS/eip-6960, crawled
  2026-11-20 00:47 UTC). A token with a two-level
  classification system: `mainId` identifies an asset
  category, `subId` identifies a class or variation within
  it; balances record amounts of each pair, so a share class
  can contain many fungible units. Combines ERC-20, ERC-721,
  and ERC-1155 capabilities with the classification layer;
  designed for tokenizing and enabling fractional ownership
  of Real World Assets (invoices, company stocks, digital
  collectibles, real estate). Interfaces: `IDLT` (events
  Transfer, TransferBatch, Approval, ApprovalForAll, URI;
  safeTransferFrom, approve, subBalanceOf, balanceOfBatch,
  allowance, setApprovalForAll, isApprovedForAll) and
  `IDLTReceiver` (onDLTReceived, onDLTBatchReceived). The
  classification is limited to two levels by design — a
  sub-asset cannot have children of its own. SubIds can be
  shared across mainIds or mixed per mainId. Reference
  implementation: `DLT.sol` (core contract with dual-layer
  balance tracking, approval management, safe transfers with
  receiver callbacks, batch operations) plus `IDLT.sol` and
  `IDLTReceiver.sol`; balances stored in a nested mapping
  `mapping(uint256 mainId => mapping(address =>
  mapping(uint256 subId => uint256)))` for O(1) lookups.
  Test suite described: minting with specific mainId/subId
  pairs, batch balance queries, safeTransferFrom between
  EOAs and to receiver contracts, rejection of transfers to
  non-receiver contracts, approval flows including
  `type(uint256).max` infinite approval, batch transfers,
  burning, zero-address validation. Security
  considerations: allowance race condition (same as ERC-20;
  implementers SHOULD provide increase/decreaseAllowance or
  check-set via zero), receiver callback reentrancy
  (checks-effects-interactions, hooks must not introduce
  external calls), batch operation gas limits (callers MUST
  bound array lengths), integer overflow in balance
  aggregation (track main balances separately). CORRECTION
  RECORDED: the prior run's open lead said "Aboudjem/ERC-6960
  (MIT per secondary report)" — that is wrong. No standalone
  Aboudjem/ERC-6960 repository exists (GitHub repository
  search returned 0 results); the EIP text and interface are
  CC0, and the reference implementation lives in the
  ethereum/EIPs repository assets. A direct connector fetch
  of `assets/eip-6960/DLT.sol` from ethereum/EIPs returned
  empty (path unresolved); the EIP page itself was read in
  full instead. The author's own FAQ states ERC-6960 "is
  still a Draft in an open pull request (#1614). It is not
  merged into the ERCs repository, so treat it as work in
  progress."

## What would be built (patterns only, restated in our own words)

- Verbatim-first memory with scoped namespaces: store exact
  text, never summarize, extract, or paraphrase on write;
  organize the index into scopes (people/projects as wings,
  topics as rooms, original content as drawers) so searches
  run against a scope, not a flat corpus. HALEX-AI already
  keeps hash-chained records; the pattern to adopt is the
  verbatim discipline plus scoped retrieval, not the
  ChromaDB/embedding stack.
- Pluggable retrieval backend contract: one backend
  interface with swappable substrates, a local default, every
  non-default backend opt-in. The HALEX-AI version is
  stdlib-only and local-only; the pattern is the contract
  shape, never the vendor backends.
- Temporal knowledge graph with validity windows: facts
  carry validity; invalidation is explicit and queryable;
  timelines are first-class. Complements the staged
  decision-graph provenance patterns (Semantica, 2026-11-19
  ~03:42 run) with the validity-window half.
- Learn-not-just-recall memory: the retain / recall / reflect
  triad. Retain normalizes into canonical entities and time
  series; recall runs several strategies in parallel and
  merges by rank fusion plus reranking; reflect forms new
  connections and answers questions that need deep thinking
  rather than lookup. HALEX-AI's self-build loop already
  reflects on its own work; the pattern to adopt is the
  triad as named operations with distinct contracts.
- Observations with evidence and proof counts: consolidated
  beliefs that keep exact quotes as evidence, carry a proof
  count, and are refined rather than overwritten when new
  evidence arrives — new information strengthens, weakens,
  or extends a belief instead of silently replacing it. This
  is the HALEX-AI lesson/chain discipline stated as a memory
  rule: never silently overwrite, always keep the evidence.
- Mental models as standing answers: define a question once;
  the answer is written, stored, and rewritten in the
  background as the store learns more; reading one costs no
  retrieval and no model call. Pages are the same idea as
  living documents, projectable onto disk as ordinary
  markdown. Candidate shape for HALEX-AI's builder briefs
  and skill records: a standing answer per subsystem, kept
  current by the loop.
- Decision models as typed judgments: the small judgments
  inside recall, consolidation, reflect, and pages answered
  with typed answers instead of text to parse, so far fewer
  calls reach a model at all. HALEX-AI's queue-entry
  vocabulary is the same idea in miniature — a fixed set of
  typed operations, structurally enforced.
- Memory defense on write: scan every retain for secrets and
  PII against a pattern list and redact or block before
  storage. HALEX-AI already refuses secrets in the chain;
  the pattern to adopt is the scan-on-retain placement and
  the redact-or-block choice, per store.
- Dual-layer token classification (mainId/subId): one asset
  category subdivided into classes/variations, each holding
  many fungible units; two levels only, no deeper nesting;
  shared or mixed subId sets per mainId. As a HALEX-AI
  pattern this is a classification scheme for RWA asset
  records (asset class, then share class), not a contract:
  no Solidity, no DLT.sol, no settlement or custody code.
  The EIP's security notes travel with it as design
  discipline — allowance race, receiver-callback reentrancy,
  batch gas bounds, overflow in aggregation — all stated as
  checks a design must answer, never as copied code.
- Canonical-source discipline: publish the short list of
  official sources and treat everything else as untrusted.
  MemPalace's impostor warning is the model: a named
  canonical list, a public corrections history, and no
  silent trust in lookalike domains.

## Verdict

GATED, patterns only. MemPalace MIT and Hindsight MIT
LICENSEs read verbatim; both READMEs read in full; the
ERC-6960 EIP read in full under CC0. No code adopted, no
branding adopted, no vendor figures adopted (see below).
HALEX gate stricter: no MemPalace Python package, ChromaDB
or other backends, MCP server, embedding models, Docker
image, or PyPI install; no Hindsight Python/TypeScript/Go
clients, server, LLM wiring, API keys, or hosted Cloud; no
ERC-6960 Solidity contracts, DLT.sol, or settlement/custody
code; no network / wallet / signing / payment / API-key code
anywhere.

## NOT adopted (claimed, not verified)

- MemPalace "best-benchmarked open-source AI memory system"
  (vendor tagline); LongMemEval R@5 96.6% raw / 98.4%
  hybrid held-out / >=99% reranked, LoCoMo 60.3% / 88.9%,
  ConvoMem 92.9%, MemBench 80.3% (vendor-published, README
  says reproducible from the repo — not independently
  reproduced here); "zero API calls" for the raw path as
  tested fact; star counts as quality.
- Hindsight "most accurate agent memory system ever tested"
  and "state-of-the-art performance on LongMemEval" (vendor
  claims); benchmark chart figures and the live benchmark
  site as verified; "independently reproduced by research
  collaborators at the Virginia Tech Sanghani Center and
  The Washington Post" (the README's claim, not verified
  here); "used in production at Fortune 500 enterprises"
  (vendor claim); Hindsight Models launch claims (open
  weights, hosted inference) as verified; star counts as
  quality.
- ERC-6960 as a Final or merged standard (it is Draft; the
  author says it is still in open PR #1614, not merged into
  the ERCs repository); any production deployment or
  adoption claim; the secondary "MIT" license claim for a
  standalone repo (corrected above — no such repo, EIP is
  CC0); the reference implementation DLT.sol as read (the
  direct fetch failed; only the EIP's description of it was
  read).
- Star counts as quality, for all three.

## Open leads

- TokenF (@tokenf/contracts, MIT per npm listing — on-chain
  RWA tokenization framework with pluggable custom
  compliance modules, KYC/AML checks, early stage, breaking
  changes foreseen) — LICENSE unread, RWA lane.
- projectmem (MIT, typed memory events + deterministic
  pre-commit gate warning before repeating a failed
  approach) — LICENSE unread, memory lane; small (766 stars
  per secondary, August 2026), fits the HALEX self-build
  gate discipline.
- DSPy / TextGrad / Trace (MIT, prompt and graph
  optimization, install-ready per secondary roundup) —
  LICENSEs unread, self-improvement lane; DSPy is the most
  active of the set per secondary report.
