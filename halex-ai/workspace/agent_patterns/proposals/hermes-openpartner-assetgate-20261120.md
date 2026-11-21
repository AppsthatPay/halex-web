# Proposal: closed learning loop with self-authored skills (Hermes Agent) + event-sourced partner attribution with re-derivable models (OpenPartner) + two-gate RWA transfer ideas (AssetGate, NOT gated) — 2026-11-20

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-20):
- NousResearch/hermes-agent — MIT License, Copyright (c)
  2025 Nous Research (LICENSE file SHA
  75410e73319c72cd3e991a501c5455eb78f38375). README read
  in full (file SHA
  830be257308736e48f25ac4f2d097888b3a63a2c, 17,384 chars).
  Repo: 264,990 stars, 59,877 forks, 54,154 open issues,
  created 2025-07-22, updated 2026-11-21, Python, default
  branch main, not archived. A self-hosted, self-improving
  AI agent: a closed learning loop that creates a skill
  document after a complex task (five or more tool calls),
  improves that skill during later use when a better
  approach is found, nudges itself to persist knowledge
  between tasks, searches its own past conversations with
  full-text search (FTS5) plus model summarization, and
  builds a deepening model of the user across sessions
  with a dialectic user-modelling approach (Honcho).
  Skills follow the agentskills.io open standard, so they
  are portable Markdown files, not hidden state. Memory
  is three-layer: persistent notes files (MEMORY.md and
  USER.md, always loaded), session search, and the skills
  library as procedural memory. A built-in cron scheduler
  delivers natural-language automations to any platform.
  Subagents can be spawned for parallel workstreams; six
  terminal backends (local, Docker, SSH, Modal, Daytona,
  Vercel Sandbox). Any model provider (Nous Portal,
  OpenRouter, OpenAI, own endpoint). Installs via a shell
  one-liner; the README documents a Windows Defender
  false positive on the bundled `uv.exe` binary with a
  GitHub-attestation verification procedure.
- getcoherence/openpartner — MIT License, Copyright (c)
  2026 OpenPartner contributors (LICENSE file SHA
  c0c287a435777b8c395e3d7891763096a7af236f). README read in
  full (file SHA
  67919668c1e94ba84cb5abf9080a2ea21035ac90, 9,081 chars).
  Repo: 15 stars, 11 forks, 9 open issues, created
  2026-04-23, updated 2026-11-19, TypeScript, default
  branch main, not archived. Open-source partner
  attribution and payouts, self-hosted, v1. Tracks
  click → signup → revenue (not just clicks) with
  first-party cookie plus server-side identity stitching,
  multi-session and delayed conversions (60-day default,
  configurable), cross-device stitching to logged-in
  identity. Event-sourced by design: raw data is
  immutable, attribution is a derived view, so
  attribution models can change without re-collecting
  history. Four attribution models — last_click,
  first_click, linear, position — selectable per campaign
  and re-derivable from the raw tables. Commission accrual
  with a review queue (approve / reverse), two-tier
  commissions (a partner earns a share of what partners
  they recruit earn, via a recruit link), Stripe Connect
  payouts with idempotent transfers, click-velocity limits
  with an admin fraud-review queue that replays skipped
  attributions on unflag, outbound webhooks with
  HMAC-SHA256 signing and per-event redelivery, scoped API
  keys, an OpenAPI 3.1 spec generated from the API's own
  validators (with a test that fails when a route drifts
  from the spec), a headless in-app referral guide and
  sample, and one-click export (CSV + JSON + SQL) that
  round-trips back into a self-hosted instance. A
  creator-discovery / two-sided network layer lives in a
  separate private repo and is NOT in this repo.
- jevinjojo/AssetGate — LICENSE NOT GATED. The README
  carries an MIT badge and a "MIT License — see LICENSE"
  section, but no LICENSE file exists at the repository
  root (LICENSE and LICENSE.md both 404; code search
  finds only vendored forge-std LICENSE-APACHE /
  LICENSE-MIT files inside
  packages/contracts/lib/forge-std). The badge claim is
  therefore unverified, and nothing from this repo is
  gated. README read in full (file SHA
  f91e5a9f1f10f036e1fd8c9a4d2b32d6f150e640). Repo: 0 stars,
  0 forks, 0 open issues, created 2026-09-25, updated
  2026-10-20, Solidity, default branch main, not
  archived. Permissioned RWA security-token platform on
  the ERC-3643 (T-REX) standard with ONCHAINID: a
  two-gate transfer model (Gate 1 identity registry
  checks signed claims on the receiver's ONCHAINID; Gate
  2 modular compliance runs pluggable rule modules such
  as MaxHolderCount, BalanceCap, CountryRestrict, and the
  transfer reverts natively if either gate fails),
  corporate controls (freeze, partial freeze, pause,
  burn, forced transfer recovery), Merkle-tree dividend
  distribution with pull-payment claims, an indexer and
  cap-table API, and issuer/investor dashboards. The
  README itself states the platform is not audited, not
  production-ready, and not legal or financial advice,
  and that its KYC is simulated (the deployer acts as the
  trusted claim issuer). Deployed on BOT Chain Mainnet
  (chain ID 677) per the README; those deployment claims
  were not verified here.

## Patterns to adopt (restated in our own words only)

- Closed learning loop with self-authored skills: after
  a complex task, distill what was done — procedure,
  failure points, verification steps — into a durable
  skill document; the next time a similar task appears,
  load the skill before starting instead of reasoning
  from scratch; when execution discovers a better
  approach than the skill describes, update the skill
  during use. HALEX-AI already stages proposals and
  seals attempts; the pattern to adopt is the loop
  discipline: a completed piece of work produces a
  reusable skill record, a skill is refined on reuse,
  and the refinement is itself recorded with provenance.
  No unattended self-rewriting: a skill update is a
  proposal that passes the same gate as any other change.
- Three-layer memory: persistent notes (always loaded,
  small), session search (full-text over past work plus
  summarization for recall), and a skills library
  (procedural memory). HALEX-AI already keeps a curated
  memory plus daily logs plus staged proposals; the
  pattern to adopt is the layering rule: each layer has
  a stated job and a stated size, and recall goes through
  the cheapest layer that can answer before reaching for
  the next one.
- Periodic nudges to persist knowledge: after a session
  where a correction or preference appears, the agent
  proactively saves it rather than waiting to be asked.
  HALEX-AI already logs each intake run; the pattern to
  adopt is the nudge rule: a correction observed in a run
  is written to the durable record in that same run, not
  left in a transcript.
- Portable skills as files: skills are structured
  documents in an open format, portable between systems,
  not hidden state. HALEX-AI proposals are already plain
  files; the pattern to adopt is the portability test: a
  skill must be readable and usable by a different agent
  from the file alone, with no hidden context.
- Dialectic user modelling: build the model of the user
  from the tension between what they say and what they
  do, revisiting it as evidence accumulates. HALEX-AI
  already records Jeffrey's corrections as boundaries;
  the pattern to adopt is the modelling rule: a stated
  preference and an observed correction are both kept,
  and when they disagree the disagreement is recorded,
  not smoothed over.
- Event-sourced attribution: raw events are immutable;
  attribution is a derived view that can be recomputed
  when the model changes. HALEX-AI already seals an
  append-only chain; the pattern to adopt is the
  derivation rule: any derived number (a count, a rate,
  a verdict) must be recomputable from the raw records
  it cites, and changing the derivation never rewrites
  the raw records.
- Attribution models as a per-campaign choice: last
  click, first click, linear, and position-based models
  are selectable per campaign and re-derivable from the
  same raw tables. HALEX-AI already records verified vs
  claimed separately; the pattern to adopt is the model
  rule: when credit is assigned (a referral, a source, a
  contributor), the assignment rule is named, the
  alternatives are computable from the same raw events,
  and the chosen rule is recorded with the result.
- Identity stitching with late binding: a click is
  stitched to an identity when the identity becomes
  known, and backlog attribution is applied retroactively
  to events that arrived before the identity did.
  HALEX-AI already links intake runs to their sources;
  the pattern to adopt is the stitching rule: an event
  recorded without its source is not discarded — when
  the source is later established, the link is made and
  the linkage itself is recorded.
- Two-tier commissions with a review queue: a referrer
  earns a share of what referrers they recruited earn,
  and every commission passes a human review queue
  (approve / reverse) before payout. HALEX-AI already
  gates promotion on tests and seals; the pattern to
  adopt is the review rule: any accrual of credit or
  reward sits in a reviewable queue with a named
  approver, and a reversal is a first-class operation,
  not an edit to history.
- Spec generated from validators, with a drift test: the
  API surface is described by a spec generated from the
  API's own request validators, and a test fails when a
  route or its auth drifts from the spec. HALEX-AI
  already seals its queue entries; the pattern to adopt
  is the drift rule: a declared interface (a queue entry
  format, a proposal format) has a checker that fails
  when the implementation drifts from the declaration.
- Export as round-trippable data: partners, programs,
  attribution, and the commission/payout ledger export as
  CSV + JSON + SQL and re-import cleanly. HALEX-AI
  already keeps its state in plain files; the pattern to
  adopt is the export rule: any state worth keeping must
  be exportable in a form that can be re-imported
  without the original system.
- AssetGate ideas (NOT gated, restated in our own words
  only): the two-gate transfer shape — an identity gate
  and a rule gate, both checked before an action is
  allowed, with the action reverting natively if either
  fails; modular compliance rules as small pluggable
  checks (a cap on distinct holders, a balance cap, a
  jurisdiction restriction) executed atomically with the
  action; Merkle-tree distribution with pull-payment
  claims (compute the distribution off-chain, prove the
  claim on-chain); corporate controls as named, audited
  operations (freeze, forced transfer) rather than
  silent overrides. No code, no contracts, no identity
  system, no wallet or signing code — the shapes only,
  and only if a LICENSE file ever appears.

## Verdict

RE-VERIFIED, no new adoption. Hermes Agent and OpenPartner
were BOTH already covered in NOTICE.md before this run:
- Hermes Agent: intake run 2026-11-18 ~03:42 EST, same
  LICENSE file SHA (75410e73…) and same README file SHA
  (830be257…), same patterns (closed learning loop, skills,
  FTS5 session search, Honcho dialectic modelling,
  agentskills.io, cron, subagents). This run re-read the
  README in full (17,384 chars vs 17,496 on 11-18 — a
  small README revision) and found no new patterns.
- OpenPartner: intake run 2026-11-17 ~19:42 EST, same
  LICENSE file SHA (c0c287a4…) and same README file SHA
  (67919668…), same patterns — and the 11-17 entry is
  more complete than this run's notes (it also records
  the first-run install wizard, admin personas with
  magic-link sign-in, last-active-admin guard, two-step
  sign-in with recovery codes, product-scoped commission
  rules, and the same-transaction audit log). This run
  re-read the README in full (9,081 chars) and found no
  new patterns.
Per the standing rule (already-covered repos are noted,
not duplicated), NO new NOTICE.md entry was added for
either repo this run; NOTICE.md stays at 2212 lines.
AssetGate NOT gated: its MIT badge is unverified (no
LICENSE file in the repo), so its ideas are restated in
our own words only and carry no entry, no code, no
adoption claim. No code adopted, no branding adopted, no
vendor figures adopted (see below). HALEX gate stricter:
no Hermes Python runtime, TUI, gateway, MCP server,
terminal backends, or API-key/provider code; no
OpenPartner TypeScript/Express/Stripe Connect/Postgres
code, hosted tiers, or creator-network code; no AssetGate
Solidity, T-REX, ONCHAINID, indexer, or dashboard code;
no network / wallet / signing / payment / API-key code
anywhere; no unattended self-rewriting, no weight
training, no automatic adoption of a skill or optimizer
output; no self-reported audit, deployment, or release
claim treated as verified.
LESSON (process): check NOTICE.md for the repo name
BEFORE a deep-dive. Identical LICENSE/README SHAs mean
re-verification, not new adoption — record the re-check
with the earlier entry cited, and do not duplicate the
NOTICE entry. This run's deep-dives should have been
caught by that check; the two repos were picked from
web search without the NOTICE grep.

## NOT adopted (claimed, not verified)

- Hermes Agent's "only agent with a built-in learning
  loop" claim and "best personal AI agent for power
  users" verdicts (secondary review sites' words, not
  verified here); the star count (264,990) and fork count
  (59,877) as quality — recorded, not a verdict; the
  "64,000 stars by v0.9.0" and "$5 VPS" figures from
  secondary articles (not checked against the repo);
  the learning loop's effectiveness (skill created after
  one task becoming measurably better on the second run
  is a testable proposition the project states, not a
  result reproduced here); the Honcho dialectic modelling
  and FTS5 session search as working behavior (README-
  described, not run here); the Windows Defender false
  positive explanation (the project's own account, with
  a verification procedure that was not executed here).
- OpenPartner's attribution and payout behavior (no test
  run performed here — the click router, identity
  stitching, attribution models, Stripe Connect payouts,
  and fraud queue are README-described capabilities, not
  verified behavior); the hosted-tier prices ($29/mo +
  3%, $49/mo + 1.5%, 3% revshare) as current (read from
  the README, not checked against the live site); "the
  open alternative to Dub Partners, Rewardful, and
  Impact" as a comparison (the project's framing); the
  repo is seven months old with 15 stars and 11 forks —
  recorded, not a verdict; star counts as quality.
- AssetGate's deployment claims (BOT Chain Mainnet
  deployment, verified contracts, live dashboard, live
  API) — not verified here; the "institutional-grade"
  framing (the project's own words, contradicted in part
  by its own not-audited / not-production-ready
  disclaimer); the simulated KYC flow as a compliance
  model (the README says the deployer acts as the
  trusted claim issuer — a demo shortcut, not a
  compliance design); the MIT badge (unverified — no
  LICENSE file); 0 stars, 0 forks — recorded, not a
  verdict.
- TokenF lead: still NOT closed — repo identity
  unconfirmed (GitHub search returned 1,136 results with
  no TokenF RWA repo among top hits; direct reads of
  tokenf/contracts, TokenF/contracts, tokenf/tokenf,
  TokenF/TokenF all 404; npm page carries no repository
  link). MIT claim is npm-only; no LICENSE file read.
  Stays an open lead, ideas only, no entry.
- ODW AssetTech ERC-1400 lead: still NOT closed — the
  four OnDemandWorld repos' licenses were not read this
  run; the announcement itself says ERC-3643 is now the
  dominant standard and the code is a legacy reference,
  not production-ready. Stays an open lead.
- hgwoops/rwa-lab-2026 lead: still NOT closed — license
  not read. Stays an open lead.
