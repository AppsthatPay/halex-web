# Proposal: RWA compliance-engine patterns (zeemscript/TrustMint, GATED) + Sui fractional-asset patterns (MystenLabs/asset-tokenization, GATED) + referral-tracking ideas (hirajanwin/reflio, NOT gated) — 2026-11-22

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-22):
- zeemscript/TrustMint — MIT License,
  Copyright (c) 2026 TrustMint contributors
  (LICENSE file SHA
  ae5e52b07f7825c88fdfa1f25c6fa1b99f971d8e).
  README read in full (file SHA
  d7f3c4050a0e261fa60c3e4c4461d10413f4de89).
  Repo: 131 stars, 129 forks, 55 open issues,
  created 2026-10-04, updated 2026-11-06T23:51:20Z
  (connector search, run time), Rust, default
  branch main, not archived. Open-source building
  blocks for tokenized invoices, property shares,
  and carbon credits on Stellar Soroban: a KYC
  registry (authorized verifiers record approval,
  tier, jurisdiction, and optional expiry for a
  Stellar address), a compliance engine (transfer
  policy examples — pause controls, address and
  jurisdiction blocklists, transfer limits,
  holding periods, holder caps), an invoice token
  (issuance, transfer, settlement, redemption),
  a property token (fractional shares with
  cumulative per-share dividend accounting), a
  carbon credit token (issuance, transfer,
  retirement with beneficiary metadata), and a
  separate SEP-41-style RWA reference token with
  KYC and compliance hooks and asset metadata.
  Also a React + Vite dashboard, a TypeScript SDK,
  deployment helpers, Rust contract tests, and
  local Stellar integration tests. The README
  states plainly that TrustMint does not verify
  identities or provide legal compliance, that it
  is not audited and not production-ready, and
  that passing CI is useful feedback, not a
  security audit or production-readiness guarantee.
  The secondary source that surfaced this repo
  named it ABDISTROYER1/TrustMint; the connector
  search found zeemscript/TrustMint as the
  canonical repo, and its README matches the
  secondary description verbatim. The
  ABDISTROYER1 identity was not confirmed here
  (not verified as the same repo, a fork, or a
  mirror) — recorded, not assumed.
- MystenLabs/asset-tokenization — Apache License,
  Version 2.0, January 2004 (LICENSE file SHA
  261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64 — the
  standard Apache 2.0 boilerplate text, so the
  SHA is identical to the OnDemandWorld
  erc1400-contracts LICENSE SHA read 2026-11-18;
  that is the same license text, not a copy
  error). README read in full (file SHA
  f3c8dac2d85de41b932511f1fbf6653d329fc500).
  Repo: 12 stars, 4 forks, 54 commits, created
  2023-09-26, default branch main, not archived,
  current commit 33062f6727c6031c1c72b5877b9014b095c2398f
  (repo page crawl 2026-11-22 08:45 UTC). Sui Move
  reference implementation for representing
  real-world assets (real estate, art, and other
  assets) as digital tokens: fractionalization of
  an asset into a total supply of tokens, general
  (whole-asset) and fractional (per-fraction)
  metadata kept consistent across fractions,
  NFT-vs-FT distinction (NFTs for unique assets
  with extra metadata and a balance of 1; FTs for
  identical assets, mergeable and splittable,
  balance greater than 1), burnability (creators
  may make fractions burnable; burning decreases
  circulating supply while total supply is
  maintained, enabling re-mint of burned fractions
  to retain the predetermined total supply), and
  support for the Sui Kiosk framework. A template
  package publishes each new asset. Posted on the
  Sui Developer Forum 2023-12-12 as available
  under Apache 2.0; the forum text matches the
  repo README.
- hirajanwin/reflio — LICENSE NOT GATED.
  GPL-3.0 license, Copyright (c) 2022-present
  Reflio (McIlroy Limited) (LICENSE file SHA
  f6ce2ab76fc349d4ccb39feb6d050c617b49d816, read
  verbatim via the connector). README read in
  full (file SHA
  35648b9a1fdb64c32974779c14da1bb2965ff335).
  Repo: 16 stars, 88 forks, 0 open issues,
  created 2022-06-21, updated 2026-08-27,
  default branch master, not archived. GPL-3.0
  is not a permissive license under the HALEX
  gate, so nothing from this source is gated.
  Its ideas are restated in our own words only
  below. The README states Reflio is under active
  development, puts digital privacy first, is
  open-source, processes referrals through
  European-owned infrastructure, and is registered
  in the UK; the repo links out to Reflio-com/reflio
  as the license source, so this repo reads as a
  mirror. The 88-forks-to-16-stars ratio is
  unusual — recorded, not a verdict.

## Patterns to adopt (restated in our own words only)

- Verifier-recorded approval registry (TrustMint,
  GATED): eligibility is a record an authorized
  verifier writes (approval, tier, jurisdiction,
  optional expiry per address) — and the record
  is explicitly a record of a decision, not proof
  that the off-chain process behind it was
  adequate. The pattern to adopt is the
  record-not-proof rule: an on-chain approval
  attests that a named verifier decided, never
  that the decision was correct; the off-chain
  process stays the deploying project's
  responsibility, stated in the open.
- Policy engine separate from the asset
  (TrustMint, GATED): transfer policy lives in
  its own module — pause, blocklists, transfer
  limits, holding periods, holder caps — and the
  asset contract calls it during the relevant
  operation. The pattern to adopt is the
  check-at-the-seam rule: the asset knows what
  it is, the engine knows whether it may move,
  and the call between them is explicit, so a
  policy change never requires an asset rewrite.
- Policy-check flow as a readable path
  (TrustMint, GATED): holder/app -> asset
  contract -> (KYC registry check, policy
  evaluation) -> state change, with the exact
  checks depending on the contract and the
  method. The pattern to adopt is the
  named-checks rule: every gate a transfer must
  pass is named in the flow, in order, so the
  rule set can be read without reading the
  execution path — the same declared-rule
  discipline as TokenF's check/hook
  configuration, applied to a different chain.
- One template per asset class (TrustMint,
  GATED): invoice (issuance, transfer,
  settlement, redemption), property shares
  (cumulative per-share dividend accounting),
  carbon credits (issuance, transfer,
  retirement with beneficiary metadata). The
  pattern to adopt is the class-template rule:
  each asset class gets its own small template
  carrying only that class's lifecycle, instead
  of one generic token with every lifecycle
  bolted on.
- Consistent whole-asset and per-fraction
  metadata (MystenLabs asset-tokenization,
  GATED): an asset has general metadata and
  fractional metadata, and the two stay
  consistent across all fractions. The pattern
  to adopt is the one-truth rule: the whole
  asset's description is declared once and every
  fraction inherits it, so no fraction can drift
  from the asset it represents.
- NFT-vs-FT distinction by shape (MystenLabs
  asset-tokenization, GATED): unique assets are
  NFTs (extra metadata, balance of 1);
  identical assets are FTs (no extra metadata,
  mergeable and splittable, balance greater than
  1). The pattern to adopt is the shape rule:
  uniqueness is a property of the asset's shape,
  chosen at creation, not a flag toggled later.
- Burnable fractions with total-supply
  preservation (MystenLabs asset-tokenization,
  GATED): a creator may make fractions burnable;
  burning removes them from circulation while
  total supply is maintained, so burned fractions
  can be re-minted to retain the predetermined
  total. The pattern to adopt is the
  supply-preserving burn rule: a burn changes
  circulation, never the declared total — the
  total is a promise, the circulation is a
  state.
- Template package per new asset (MystenLabs
  asset-tokenization, GATED): the core package
  publishes once; each new asset publishes from
  a template package (manually, or automatically
  through a publish function). The pattern to
  adopt is the core-once-template-per-asset
  rule: shared logic ships once, per-asset
  differences live in small template instances.
- Placeholder-data discipline (TrustMint,
  GATED): the deployment helper's asset metadata
  is placeholder data, and the README says to
  review and replace it before every deployment,
  including testnet — and that Vite variables are
  bundled into the browser app, so private keys,
  secrets, and identity documents never go in
  them. The pattern to adopt is the
  replace-before-every-deploy rule: example data
  is never silently deployable, and secrets never
  ride in client-bundled configuration.
- CI as feedback, not audit (TrustMint, GATED):
  the workflows run formatting, lint, contract
  tests, WASM builds, and a local integration
  job, and the README says passing CI is useful
  feedback, not a security audit or a
  production-readiness guarantee. The pattern to
  adopt is the CI-is-not-audit rule: green checks
  are recorded as green checks, never as a
  security verdict.
- Reflio ideas (NOT gated, restated in our own
  words only): consent before the cookie — a
  referral located in the EU confirms consent
  before any tracking cookie is set; track a
  referral across sub-domains, not per sub-domain;
  one central affiliate dashboard that gathers a
  partner's campaigns across different brands;
  keep the tracking embed small (their stated
  sub-13kb discipline) so the tracker is cheap to
  carry; track subscriptions and one-time payments
  through the same referral record. No code, no
  embed script, no dashboard, no Stripe wiring —
  the shapes only. GPL-3.0 stays ideas-only for
  this program even though the repo is readable.

## Verdict

GATED adoption (two repos) + ideas only (one
source). zeemscript/TrustMint is MIT with the
LICENSE read verbatim (file SHA ae5e52b0…) and
the README read in full; its patterns are gated
and a NOTICE.md entry is added this run.
MystenLabs/asset-tokenization is Apache 2.0 with
the LICENSE read verbatim (file SHA 261eeb9e…)
and the README read in full; its patterns are
gated and a NOTICE.md entry is added this run.
hirajanwin/reflio is GPL-3.0 with the LICENSE
read verbatim (file SHA f6ce2ab7…) and the README
read in full; it is NOT gated — GPL-3.0 is not
permissive under the HALEX gate — ideas only,
restated in our own words, no NOTICE.md entry.
No code adopted, no branding adopted, no vendor
figures adopted (see below). HALEX gate stricter:
no TrustMint Soroban/Rust contract, Stellar SDK,
dashboard, or wallet code; no MystenLabs Sui Move,
WASM, or publish-script code; no Reflio code of
any kind; no network / wallet / signing / payment /
API-key code anywhere.

## NOT adopted (claimed, not verified)

- TrustMint's live-preview link (trustmint-x.vercel.app)
  was not opened and no claim about it is adopted.
  The "early-stage starter kit" framing and the
  "not audited, not production-ready" statements
  are the authors' own, recorded as such. Any
  SEP-41 compatibility claim is a roadmap item
  ("verify SEP-41 compatibility"), not a verified
  fact. Star/fork counts as quality NOT adopted
  (131 stars / 129 forks — forks nearly equal
  stars, unusual, recorded not smoothed; 55 open
  issues recorded). The ABDISTROYER1/TrustMint
  name from the secondary source is not adopted
  as the canonical repo identity; zeemscript/
  TrustMint is the repo read here.
- MystenLabs asset-tokenization's docs.sui.io
  guide was not read; no claim from it is
  adopted. The forum post's "comprehensive
  details" framing is the poster's wording, not a
  verified fact. Star/fork counts as quality NOT
  adopted (12 stars / 4 forks, recorded, not a
  verdict). The repo is small and quiet since
  2023 (54 commits, created 2023-09-26) —
  recorded, not a verdict.
- Reflio's pricing claims (free plan, pricing
  from $0/month with a 9% commission fee),
  "European-owned infrastructure", UK registration,
  and GDPR/privacy compliance as verified fact —
  README claims only, none adopted. The "under
  active development" note and the 16-star /
  88-fork counts are recorded, not verdicts.
- Numok (dfg-ar/numok) was already gated
  2026-11-17 and hashgraph/asset-tokenization-studio
  was already gated 2026-11-17 — neither re-dived
  this run; no duplicate entries. GenericAgent and
  Hermes Agent were already gated (2026-11-21 and
  2026-11-20) — the first search this run surfaced
  them again; no re-dive, no duplicate entries.
  AssetGate stays NOT gated (README claims MIT,
  no LICENSE file at root — 2026-11-20).
- ViralPayouts lead stays open in the weak sense:
  repo 404s as named; if it reappears under a new
  name, re-read the LICENSE files before gating
  anything, and the AGPL attribution engine stays
  ideas-only regardless.
- dualmint-addendum stays pending;
  zinium5-web-fallback-lane stays pending (module
  entry, spec null — counted invalid by the
  drainer, skipped, pre-existing).
