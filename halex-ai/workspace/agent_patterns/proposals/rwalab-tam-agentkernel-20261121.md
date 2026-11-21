# Proposal: fused multi-signal recall with temporal fact supersession (Total Agent Memory) + RWA bridge invariants and decimal discipline (rwa-lab-2026, NOT gated) + three-file markdown kernel (agent-kernel, NOT gated) — 2026-11-21

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-21):
- vbcherepanov/total-agent-memory — MIT License,
  Copyright (c) 2025-2026 Claude Total Memory
  Contributors (LICENSE file SHA
  fda74a542e472f0cfbe7e45b5f25e678bb4483dd). README
  read in full (file SHA
  e606d12d2c9a121e86fd13baaf75659322dcf075, 14,307
  bytes). Repo: 76 stars, 19 forks, 0 open issues,
  created 2026-02-16, updated 2026-11-19, Python,
  default branch main, not archived. Version 15.0.0.
  Persistent local memory for AI coding agents over
  MCP: each store is one directory built around a
  SQLite database; recall combines full-text BM25,
  dense embeddings computed locally, fuzzy matching,
  and a knowledge graph, fuses the ranked lists with
  reciprocal rank fusion, and reranks with a local
  cross-encoder that can be switched off
  (MEMORY_CROSS_RERANK=off) — with it off, reruns on
  fresh stores returned the same ranking for every
  question. Facts can carry validity intervals
  (kg_add_fact, kg_at), and a newer value of a
  single-valued fact retires the older one. The
  default profile makes no LLM call on write or
  search, so retrieval can be measured offline. The
  same package can run as a team server: personal,
  department, and company areas are separate stores
  behind one gateway, with roles, authorship, and an
  audit trail. The repo description also lists
  procedural memory, AST codebase ingest, and
  cross-project analogy; the README body read here
  does not detail those three, so they are recorded
  as description-stated, not README-detailed. The
  README's docs list says 79 MCP tools; the repo
  description says 74 — the two counts disagree and
  neither is adopted as fact.
- hgwoops/rwa-lab-2026 — LICENSE NOT GATED. The
  README carries no license section and no LICENSE or
  LICENSE.md file exists at the repository root (both
  404; the connector's tree resolution finds only
  vendored files: lib/openzeppelin-contracts/LICENSE
  and its nested compound / erc4626-tests licenses).
  Nothing from this repo is gated. README read in
  full (file SHA
  d973aacbf7e40078054494a5d55088016af61c8c, 9,487
  bytes). Repo: 0 stars, 22 forks, 0 open issues,
  created 2026-10-04, updated 2026-10-18, Solidity,
  default branch main, not archived. COMP7810 Topic
  in Web3, Lab 2: tokenize a short-dated US Treasury
  bill with Foundry. The asset sits at a custodian;
  what is on-chain is a claim on the asset, not the
  asset. The lab's subject is the bridge — custody,
  attestation, physical redemption, permissioning —
  the four things that have to exist before an
  off-chain asset can become an on-chain token, and
  the four places where such a token breaks. Seven
  contracts: MockUSDC (cash, 6 decimals, test
  faucet), ComplianceRegistry (whitelist guest list,
  COMPLIANCE_ROLE), TBillToken (ERC-20, 18 decimals,
  mint/burn gated, every balance change must pass
  both endpoints' whitelist), TBillVault (subscribe
  prices shares at the attested NAV; attest() is the
  reporter's only way to move it), MockTBillCustodian
  (answers one question: realHoldings()), MockPriceFeed
  (NAV oracle, 8 decimals, 1.00e8 is par),
  RedemptionQueue (T+1: shares in, a queue ticket out,
  cash later). The two invariants students must defend:
  escrow conservation
  (tBill.balanceOf(queue) == queue.pendingShares())
  and settlement solvency
  (usdc.balanceOf(queue) >= queue.totalClaimable()).
  Three decimal scales (18 + 8 − 6); the conversion is
  shares * nav / 1e20. The wiring at the bottom of
  script/Deploy.s.sol is part of the lesson: the vault
  needs MINTER_ROLE; the queue needs MINTER_ROLE and
  must be whitelisted (burning its escrowed shares is a
  balance change); the vault must be told where the
  queue is; the custodian must recognize the vault.
  The challenge exercise (Ex7, FalseNav) asks what
  happens when the reporter lies, and what mechanism
  would have caught it.
- oguzbilgic/agent-kernel — LICENSE NOT GATED. The
  README ends with a "License: MIT" line, but no
  LICENSE file exists at the repository root (404).
  The MIT claim is therefore unverified, and nothing
  from this repo is gated. README read in full (file
  SHA b29cde5ea766e2a5d57f2f728f3fd44a6f6d8bff, 2,295
  bytes). Repo: 338 stars, 39 forks, 0 open issues,
  created 2026-03-23, updated 2026-11-09, default
  branch main, not archived (no language field in the
  search record). Minimal kernel to make any AI coding
  agent stateful: three markdown files and a git repo,
  no framework, no database. AGENTS.md is the generic
  kernel (don't edit); IDENTITY.md is who the agent is
  (agent maintains); KNOWLEDGE.md is the index of
  knowledge files (agent maintains). Two kinds of
  memory: knowledge/ — mutable facts about how things
  are right now, updated when reality changes; notes/
  — append-only daily session logs (decisions, actions,
  open items), never modified after the day ends. Each
  agent is its own repo; same kernel, different
  identity and knowledge. The README also promotes a
  kern-ai runtime (daemon mode, Telegram, Slack, one
  brain across channels) — not read, not gated, not
  adopted.

## Patterns to adopt (restated in our own words only)

- Fused multi-signal recall: rank a recall by
  several independent signals (full-text match, local
  dense similarity, fuzzy match, graph neighbours)
  and fuse the ranked lists (reciprocal rank fusion)
  before a final rerank, instead of trusting any one
  signal. HALEX-AI already keeps curated memory plus
  daily logs plus staged proposals; the pattern to
  adopt is the fusion rule: a recall result must be
  justifiable by more than one signal, and the fusion
  step is recorded with the result so a later run can
  recompute it.
- Rerank off means deterministic: when the optional
  rerank step is disabled, repeated recalls over the
  same store return the same ranking every time.
  HALEX-AI already seals attempts with provenance; the
  pattern to adopt is the determinism rule: any recall
  used for a decision must be reproducible — the same
  query over the same records returns the same order —
  and any step that breaks reproducibility (a
  background model still loading, a non-deterministic
  reranker) is named in the record, never silent.
- Temporal fact supersession: a fact carries a
  validity interval, and a newer value of a
  single-valued fact retires the older one — the old
  value is kept with its interval, not overwritten.
  HALEX-AI already records corrections as boundaries;
  the pattern to adopt is the supersession rule: when
  a fact changes, the old value stays readable with
  its validity window, and the record says which value
  is current and when it changed.
- No-LLM default for retrieval: the default profile
  makes no model call on write or search, so recall
  can be measured offline. HALEX-AI engine code is
  already stdlib-only with zero network/API-key code;
  the pattern to adopt is the measurement rule: a
  recall path must be testable without any external
  service, and any step that needs a model is opt-in
  and labelled as such.
- Separate stores behind one gateway: personal,
  department, and company areas are separate stores
  with roles, authorship, and an audit trail, behind a
  single gateway. HALEX-AI already keeps staging,
  queue, and chain in separate places; the pattern to
  adopt is the separation rule: different trust areas
  live in different stores, and anything crossing a
  boundary carries authorship and an audit entry.
- rwa-lab ideas (NOT gated, restated in our own words
  only): the bridge framing — an on-chain token for an
  off-chain asset is a claim, not the asset, and the
  four planks (custody, attestation, redemption,
  permissioning) are where it breaks; the two
  invariants (escrow conservation: the queue holds
  exactly the pending shares, never loses or invents
  one; settlement solvency: cash on hand is never less
  than total claimable); decimal-scale discipline
  (state the scale of every quantity and the exact
  conversion, never compute 18-decimal to 18-decimal);
  attestation as the single channel by which an
  off-chain number moves an on-chain value, with the
  FalseNav question always asked (what happens when
  the reporter lies, and what mechanism would catch
  it); wiring discipline (every role grant is part of
  the design — a missing grant is a design gap, not a
  deployment detail). No code, no contracts, no
  deployment scripts — the shapes only, and only if a
  LICENSE file ever appears.
- agent-kernel ideas (NOT gated, restated in our own
  words only): the three-file kernel shape — a generic
  kernel file nobody edits, an identity file the agent
  maintains, a knowledge index the agent maintains;
  mutable facts (knowledge/) kept separate from
  append-only session narrative (notes/), with the
  narrative never modified after the day ends; a git
  repo as the memory store, with plain markdown files
  as the source of truth and any index rebuildable
  from them. No code, no runtime, no channel
  integrations — the shapes only, and only if a
  LICENSE file ever appears.

## Verdict

GATED adoption (one repo) + ideas only (two repos).
Total Agent Memory is MIT with the LICENSE read
verbatim (file SHA fda74a54…) and the README read in
full; its patterns are gated and a NOTICE.md entry is
added this run. rwa-lab-2026 and agent-kernel are NOT
gated — both READMEs imply or state MIT, but neither
repo has a LICENSE file at its root, so their ideas
are restated in our own words only and carry no entry,
no code, no adoption claim. No code adopted, no
branding adopted, no vendor figures adopted (see
below). HALEX gate stricter: no TAM Python MCP server,
SQLite/embedding/cross-encoder model code, team
server, Postgres, Docker, dashboard, LLM-provider
wiring, API keys, or install scripts; no rwa-lab
Solidity, Foundry, deploy scripts, or testnet
claims; no agent-kernel runtime, daemon, or Telegram/
Slack channel code; no network / wallet / signing /
payment / API-key code anywhere; no unattended
self-rewriting, no weight training.
CORRECTION (recorded, not hidden): the 2026-11-20
~19:42 run's report listed the "ODW AssetTech ERC-1400
lead" as still open with "the four OnDemandWorld
repos' licenses unread". That is stale: the 2026-11-18
~11:42 run already gated OnDemandWorld/erc1400-
contracts (Apache License 2.0, LICENSE file SHA
261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64, NOTICE.md
line 2166) with its partitioned-token, certificate
validation, token-hold, and DvP patterns. The lead is
therefore narrowed, not open: the contracts repo is
closed as gated; the other three ODW repos
(erc1400-dashboard, sto-backend-api, sto-web-client)
remain unread and stay open. The 2026-11-20 ~19:42
run's "ODW lead still NOT closed" line is superseded
by this correction.

## NOT adopted (claimed, not verified)

- Total Agent Memory's benchmark figures (LongMemEval
  R@5 95.1% on 470 questions, LoCoMo R@5 0.607 on
  1,536 questions, BEAM 1M-token R@5 0.448 on 625
  probes) — vendor-measured on v13.0.0 without the
  cross-encoder; the README itself says the table
  describes retrieval without the cross-encoder and
  not a default install of v15.0.0. The JOSS-review
  measurements (R@5 about 0.745 at about 495 ms
  median with defaults) are a secondary source (the
  review issue was not read here) and the paper is
  under review, not published. "100% local", "74 MCP
  tools" (repo description) vs "79 MCP tools" (README
  docs list) — the counts disagree, neither adopted;
  "9 IDEs", first-start model downloads of about
  330 MB, and the 15–20 minute full-suite time are
  README-described, not run here. Star/fork counts
  (76 / 19) as quality NOT adopted. The PayPal
  donation link and the Zenodo preprint DOI were read,
  not adopted as endorsements.
- rwa-lab-2026's "7 passed; 0 failed" test claim (not
  run here — no Foundry run was performed); the
  Sepolia deployment tier and Etherscan verification
  claims (bonus homework, not verified); the lab's
  pedagogical framing (the four planks, the bridge
  metaphor) as a verified RWA design — it is a
  teaching lab, and its own README says the asset
  sits at a custodian and the chain cannot verify the
  off-chain asset. 0 stars / 22 forks — recorded, not
  a verdict. The gh-proxy.com mirror fallback in the
  install script was read, not adopted or run.
- agent-kernel's "easiest way to create an AI agent"
  framing and "works with any AI coding agent" claim
  (README-described, not tested here); the kern-ai
  runtime claims (daemon mode, Telegram, Slack, one
  brain across channels) — not read, not gated, not
  adopted; the MIT line in the README (unverified —
  no LICENSE file). 338 stars / 39 forks as quality
  NOT adopted.
- TokenF lead: still NOT closed — repo identity
  unconfirmed (GitHub search returned 1,136 results
  with no TokenF RWA repo among top hits; direct
  reads of tokenf/contracts, TokenF/contracts,
  tokenf/tokenf, TokenF/TokenF all 404; npm page
  carries no repository link). MIT claim is npm-only;
  no LICENSE file read. Stays an open lead, ideas
  only, no entry.
- ODW AssetTech lead: NARROWED (see Correction
  above) — erc1400-contracts closed as gated since
  2026-11-18; erc1400-dashboard, sto-backend-api,
  sto-web-client licenses still unread, stay open.
- dualmint-addendum stays pending;
  zinium5-web-fallback-lane stays pending (module
  entry, spec null — counted invalid by the drainer,
  skipped, pre-existing).
