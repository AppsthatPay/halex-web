# Proposal: Shared-memory server discipline (jeonjw85/Kenfold, GATED) + exact referral-ledger patterns (moonetix/referral-engine, GATED) + disclosure-to-code RWA audit patterns (Wyllgner/TokenAudita, GATED) — 2026-11-22

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-22):
- jeonjw85/Kenfold — MIT License, Copyright
  (c) 2026 Jeongwan Jeon (LICENSE file SHA
  9e2279e488932a080f5cd668560cf8283000ab74).
  README read in full (file SHA
  21c0b4f9e171b7c9f87b52a76f5f73a8ae888a0c,
  41,351 chars, 459 lines). Repo: 71 stars,
  2 forks, 1 open issue, created 2026-09-27,
  updated 2026-11-19 (connector search, run
  time), Go, default branch main, not
  archived. Self-hosted memory server shared
  across Claude Code, Codex, OpenCode, ChatGPT
  and local models over MCP: typed memories
  (semantic, episodic, project, preference,
  codebase, temporary) each with its own
  lifecycle; provenance recorded from the
  agent's API key, not the client's claim;
  no silent overwrites — a replacement
  supersedes and the old memory is kept as
  history; handoff/resume between agents;
  memory served as data, never as
  instructions; preferences proposed, never
  served, until a human approves them.
  Session hooks load memory at session start
  and write an extractive session summary at
  session end; extraction proposes durable
  memories with their source quote and
  similar existing memories shown, and a
  rejected proposal is never made again.
  Consolidation proposes retiring duplicates
  and contradictions and digesting old
  sessions, judged twice with the pair in
  both orders, applied only by a human.
  Code references are anchored to committed
  symbols (tree-sitter) and marked stale when
  the symbol changes or is removed; a changed
  file alone does not make a memory stale.
  Recall fuses full-text and vector rankings
  (reciprocal rank fusion), adds graph-linked
  neighbours, reranks with a cross-encoder
  when configured, and prefers recent
  sessions and memories whose code still
  exists; every stage degrades independently.
  Writes containing credentials are rejected
  by a pattern-based secret filter. Export /
  import archives carry memories with
  history, provenance and links, never API
  keys or embeddings. Status: Phase 5
  features implemented; public benchmark
  validation incomplete (README's own words).
- moonetix/referral-engine — MIT License,
  Copyright (c) 2026 Moonetix (LICENSE file
  SHA 40bb7ae9ae06cf12fe2b9eb3381367c05df92de6).
  README read in full (file SHA
  0fe349eee1f7445286c3ec821213787dd30d28bc,
  36,734 chars). Repo: 5 stars, 0 forks, 0
  open issues, created 2026-11-11, updated
  2026-11-12 (connector search; latest commit
  32e4c3a9, 2026-11-20), PHP (JS + PHP
  implementations), default branch main, not
  archived. Referral codes, attribution with
  fraud checks, commission plans and an
  append-only commission ledger, same
  behaviour in JavaScript and PHP, zero
  dependencies, one shared test-vector spec
  (153 cases, 16 ledger scenarios). Codes
  from an unambiguous 29-symbol alphabet with
  an optional check character (29 prime, so a
  weighted sum modulo 29 catches every single
  wrong character and every swap of two
  neighbours); normalisation accepts case,
  spaces and hyphens. Attribution: window,
  first/last touch, typed-code grace period,
  guard checks (self-referral, same device,
  same IP, same payout destination) with
  block/review actions; candidates tried in
  model order, blocked candidates skipped,
  review reasons listed per referrer. One
  referrer per referee, forever; a different
  referrer throws, a loop throws.
  Commission only from the referee's own
  confirmed earnings, paid on top, rounded
  down once; flat / percentage / tiered plans
  with duration and per-earning, per-referee
  and per-referrer caps. Ledger is
  append-only: every change an entry keyed by
  an idempotency key, accruals keyed by
  earning ID, clawbacks measured against the
  commission actually accrued (never more),
  in-hold accruals cancelled outright,
  released commission clawed back to the
  balance floor with the remainder reported
  as uncollected, payouts refused above the
  available balance. Fraud signals scored
  with readable reasons (shared devices,
  networks and payout destinations, bursts,
  earn-then-vanish, reversal rate, rings)
  for a review queue, never an automatic ban;
  multi-level commissions off by default and
  requiring an explicit regulatory-risk
  acknowledgement, with a pyramid-scheme
  warning citing the EU Unfair Commercial
  Practices Directive and US FTC guidance.
  The README's pitfalls section is the
  usable core: never pay on sign-up, never
  accrue on credited-instead-of-confirmed
  earnings, never recompute commission at
  reversal time, never change the referrer
  later, never treat a shared IP as proof,
  never show referees' activity to referrers.
- Wyllgner/TokenAudita — MIT License,
  Copyright (c) 2026 Wyllgner Amorim
  (LICENSE file SHA
  98197cfa243f880489cfc5281eb04d24607b19fe).
  README read in full (file SHA
  e16c53d300815309011fdfe0953b22353c8a7962,
  6,065 chars). Repo: 0 stars, 0 forks, 0
  open issues, created 2026-07-17, updated
  2026-08-11 (connector search, run time),
  Python, default branch main, not archived.
  Disclosure-to-code consistency checker for
  ERC-3643 (T-REX) tokenized real-world
  assets: takes an offering document and a
  token address and returns a rule-by-rule
  verdict on whether each promised rule is
  actually enforced on-chain. Three verdicts
  — CONFORME, DIVERGENTE, and deliberately
  NÃO VERIFICÁVEL (abstaining is safer than
  a false green). Core architectural
  commitment: the LLM never decides. The
  model only extracts the rule checklist
  from the document and explains findings in
  Portuguese; the verdict always comes from
  deterministic rules reading on-chain state
  (identityRegistry() for KYC/whitelist,
  paused() for pause, getModules() +
  IModule.name() for lock-up, jurisdiction
  and transfer limits), and after the
  explanation call the verdict fields are
  overwritten with the deterministic values,
  so a disagreeing model is ignored. Labeled
  evaluation set of 15 cases over four
  Sepolia contracts, including four trap
  cases whose expected extraction is empty
  (measuring how often the model invents a
  rule from lexical similarity); CI runs the
  offline suite on every push, network tests
  are local-only.

## Verdicts

- Kenfold: GATED — patterns adopted, NOTICE.md entry added.
- moonetix/referral-engine: GATED — patterns adopted, NOTICE.md entry added.
- Wyllgner/TokenAudita: GATED — patterns adopted, NOTICE.md entry added.
- adarshthakur/context-os: NOT gated — repo 404 on the connector
  (PyPI page still links github.com/adarshthakur/context-os,
  but the repo does not resolve). No LICENSE read, no
  patterns, no entry. Lead open until a repo is identified
  and its LICENSE read. The PyPI "MIT License" line is a
  package-metadata claim, not a license read.
- AssetGate: already deep-dived 2026-11-20 (not gated, no
  LICENSE file) — not re-dived. MemPalace, mem0,
  OpenPromoter: already gated — not re-dived. Weferral:
  known-stale pattern source. PromoterKit: repo still
  unidentified (marketing-page MIT claim only). ViralPayouts:
  repo still 404 (fourth confirmation).

## What is usable (patterns restated in our own words only)

- Kenfold: typed memory with per-type lifecycles; provenance
  from the credential, not the claim; supersede-never-overwrite
  with history kept; proposed-until-approved preferences;
  session-start load / session-end extractive summary;
  duplicate/contradiction consolidation judged twice in both
  orders, human-applied; commit-anchored code-reference
  staleness (a changed file alone is not stale); fused
  retrieval (full-text + vector, reciprocal rank fusion,
  graph neighbours, optional reranker) with independent
  stage degradation; secret-filter on write; export/import
  archives that exclude keys and embeddings.
- referral-engine: unambiguous-alphabet codes with a
  prime-modulus check character; attribution window +
  first/last touch + typed-code grace; guard checks with
  block vs review; one referrer per referee, forever;
  commission only on confirmed earnings, rounded down
  once; append-only ledger with idempotency keys and
  clawbacks measured against accrued commission; hold
  periods at least as long as the reward hold; fraud
  signals as a scored review queue, never an auto-ban;
  multi-level off by default with explicit regulatory
  acknowledgement; the pitfalls list as design rules.
- TokenAudita: the disclosure-to-code gap as a named
  verification problem; three verdicts with a deliberate
  abstain (NÃO VERIFICÁVEL) instead of a false green;
  LLM-at-the-boundaries only (extract + explain), verdict
  from deterministic rules, verdict fields overwritten
  after any model call; trap cases in the evaluation set
  that measure invented rules; on-chain sources of truth
  per promised rule (identity registry, paused, modules
  by name).

## What is NOT adopted

- Any code (no Kenfold Go server / Postgres / pgvector /
  MCP / OAuth code; no referral-engine JS/PHP library,
  stores or schemas; no TokenAudita Python/FastAPI/on-chain
  reader/LLM code), no network/wallet/signing/payment/
  API-key code anywhere.
- Kenfold benchmark or measurement figures as fact
  (LoCoMo partial 1,402/1,540, recall@5 0.90 to 0.96 on
  the internal 110-memory / 67-query set — the README
  itself says the set shows the pipeline works as
  intended, not how it compares; public benchmark
  validation incomplete by the README's own status line),
  the "one memory for all your AI agents" tagline, any
  star count as quality. Kenfold is 71 stars and two
  months old — recorded, not a verdict.
- referral-engine "153 test vectors" as a HALEX-AI test
  result (their suite, not run here), the collision
  probability table as a general guarantee, Moonetix
  offerwall / network claims, the moonetix.com/register
  link (an affiliate-network signup — not used, not
  relabelled), any star count as quality. The repo is 5
  stars and eleven days old — recorded, not a verdict.
- TokenAudita evaluation figures as fact (extraction
  precision/recall/F1, trap false-positive counts,
  LLM-only baseline 93.3%, US$0.000385 per extraction —
  small exploratory set, authors' own words: "indications
  rather than performance estimates"), the BrWeb3 2026
  submission as acceptance, any star count as quality.
  The repo is 0 stars and quiet since 2026-08-11 —
  recorded, not a verdict.
- ContextOS / PyPI claims, PromoterKit marketing-page
  claims, ViralPayouts page claims: nothing adopted.

## Queue

- Entry `kenfold-referralengine-tokenaudita-20261122`,
  kind knowledge, GATED at creation (MIT x3, priority
  80). Drains into a work/queue-lessons/ draft for gate
  review; the loop never appends to the ZINIUM chain.
