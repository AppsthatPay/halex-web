# Proposal: ERC-1400 admin-dashboard patterns (erc1400-dashboard, GATED) + STO glue-layer backend and role-aware web client (sto-backend-api, sto-web-client, NOT gated) — 2026-11-21

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-21):
- OnDemandWorld/erc1400-dashboard — MIT License,
  Copyright (c) 2022 Mauricio Siu (LICENSE file SHA
  f534c47bd62e96d9763c1d47f359f934d729f80c). README
  read in full (file SHA
  c3b6c2639b364d0ccaee5829f8710d2299baba59, 629
  lines). Repo: 0 stars, 0 forks, 0 open issues,
  created 2025-12-30, updated 2025-12-31,
  TypeScript, default branch main, not archived.
  Next.js 13.4 admin and ops dashboard for ERC-1400
  security tokens: token monitoring, transfers,
  partition management, document handling, and
  role-based administrative controls (controllers,
  allowlists, validators), integrated with the same
  on-chain contracts as the rest of the ODW stack.
  Architecture: services layer (erc1400Services.ts
  for contract interactions, walletServices.ts for
  wallet utilities and error handling), Zustand
  stores for theme and wallet state in config/,
  modular type-safe components, ApexCharts. Env-var
  discipline: chain ID, RPC URL, and the token
  contract address are required; WalletConnect
  project ID and testnet flag are optional. The
  README states the stack is a reference
  implementation, not for production, and names its
  own migration direction: Quorum to Hyperledger
  Besu, ERC-1400 to ERC-3643 and/or ERC-1155. The
  ODW announcement (odw.ai, 2024-01-16, updated
  2025-12-30) describes the same four-repo stack.
- OnDemandWorld/sto-backend-api — LICENSE NOT
  GATED. The README ends with a "License: ISC"
  line, but no LICENSE or LICENSE.md file exists at
  the repository root (both 404). The ISC claim is
  therefore unverified, and nothing from this repo
  is gated. README read in full (file SHA
  5b7853d466a551d7e3254f6b56b932fd0c8795da, 927
  lines). Repo: 0 stars, 0 forks, 0 open issues,
  created 2025-12-30, updated 2025-12-31,
  TypeScript, default branch main, not archived.
  TypeScript/Express REST backend, the glue layer
  between off-chain systems (databases, email, KYC
  providers) and the on-chain ERC-1400 contracts:
  user registration/authentication/password reset,
  wallet linking by signature verification, dual
  databases (MongoDB for documents, SQL via
  PostgreSQL/MySQL for relational data), TSOA
  auto-generated routes and Swagger docs, Inversify
  dependency injection, JWT sessions, Winston
  logging, Mocha/Chai/Supertest/Sinon tests. Layer
  shape: controllers, services, repositories,
  databases. Wallet endpoints: GET /api/wallet/
  message, POST /api/wallet/login (signature),
  POST /api/wallet/verify (link, JWT required).
- OnDemandWorld/sto-web-client — LICENSE NOT
  GATED. The README ends with a "License: MIT"
  line and package.json carries "license": "MIT"
  (file SHA e355c609bd17e4ca896be75e085fb91e93da
  1600), but no LICENSE or LICENSE.md file exists
  at the repository root (both 404). The MIT claim
  is therefore unverified, and nothing from this
  repo is gated. README read in full (file SHA
  9b7b5aa9e36fc86de815a348b0126f6924d5fdec, 828
  lines). Repo: 0 stars, 0 forks, 0 open issues,
  created 2025-12-30, updated 2025-12-31,
  TypeScript, default branch main, not archived.
  Next.js 13.1.2 end-user web client: wallet
  connection via Web3Modal (MetaMask, WalletConnect),
  role-aware views (admin / whitelisted /
  non-whitelisted), token issuance, redemption and
  transfer flows, on-chain document and account
  management. Shape: a single useContractTransaction
  hook carrying loading states for every contract
  call; centralized errorHandler and validation
  utilities; environment-variable validation at
  startup; contract addresses as configuration,
  never hardcoded. Note: strict TypeScript and
  build-time linting are disabled in this repo's
  own config (README says both "should be enabled
  for production") — recorded, not a verdict.

## Patterns to adopt (restated in our own words only)

- Services-layer split (dashboard, GATED): keep
  contract-interaction code in one service module
  and wallet-utility code in another, so a change
  to how a token is read never touches how a wallet
  is handled. HALEX-AI already separates engine
  from vendored tools; the pattern to adopt is the
  split rule: a module that talks to a contract
  never also manages wallet state, and vice versa.
- Partition-aware token operations (dashboard,
  GATED): balances, transfers, partitions,
  documents, and admin functions (controllers,
  allowlists, validators) as one coherent surface,
  not scattered pages. The pattern to adopt is the
  grouping rule: every operation on a token class
  lives beside the other operations on that class,
  with the admin functions visibly separated from
  the user functions.
- Env-var discipline (dashboard, GATED): chain ID,
  RPC URL, and contract address are required and
  named as such; optional values (WalletConnect
  project ID, testnet flag) are labelled optional
  with their defaults. The pattern to adopt is the
  required-vs-optional rule: a configuration value
  is either required (startup fails loudly without
  it) or optional (with a stated default) — never
  silently undefined.
- Migration discipline (dashboard, GATED): when a
  dependency is unmaintained, name the successor
  stack in the record (Quorum to Besu, ERC-1400 to
  ERC-3643/1155) instead of letting the stack drift.
  The pattern to adopt is the succession rule: a
  deprecated dependency carries a named successor
  and a migration note, recorded as a decision, not
  as a hope.
- sto-backend-api ideas (NOT gated, restated in our
  own words only): the glue-layer shape —
  controllers, services, repositories, databases,
  each layer with one job; dual-database discipline
  (document store for documents, relational store
  for relational data, each repository picking the
  store that fits the data shape); docs generated
  from the same decorators as the routes, so the
  API documentation cannot drift from the API;
  dependency injection for testability; wallet login
  as message, signature, verify, link — four
  separate steps, never one opaque call; session
  tokens separate from wallet identity. No code, no
  auth, no signing, no JWT handling — the shapes
  only, and only if a LICENSE file ever appears.
- sto-web-client ideas (NOT gated, restated in our
  own words only): role-aware views as a first-class
  UI split (admin, whitelisted, non-whitelisted see
  different surfaces from the same app, not
  different apps); one unified transaction hook
  carrying loading states for every contract call,
  so every operation reports the same way;
  centralized error logging and formatting plus
  input validation as shared utilities, never
  per-page; startup validation of required
  environment variables; contract addresses as
  configuration, never hardcoded. No code, no
  wallet, no signing — the shapes only, and only if
  a LICENSE file ever appears.

## Verdict

GATED adoption (one repo) + ideas only (two repos).
erc1400-dashboard is MIT with the LICENSE read
verbatim (file SHA f534c47b…) and the README read in
full; its patterns are gated and a NOTICE.md entry is
added this run. sto-backend-api and sto-web-client
are NOT gated — their READMEs claim ISC and MIT
respectively (and sto-web-client's package.json
says MIT), but neither repo has a LICENSE file at
its root, so their ideas are restated in our own
words only and carry no entry, no code, no adoption
claim. No code adopted, no branding adopted, no
vendor figures adopted (see below). HALEX gate
stricter: no dashboard Next.js/Wagmi/RainbowKit/
Ethers/Zustand code, no backend Express/TSOA/
Inversify/JWT/wallet-signature code, no web-client
Next.js/Web3Modal/Wagmi code; no network / wallet /
signing / payment / API-key code anywhere.
CORRECTION — ODW AssetTech lead CLOSED: all four
OnDemandWorld repos are now read. erc1400-contracts
was gated 2026-11-18 (Apache License 2.0, LICENSE
file SHA 261eeb9e…, NOTICE.md line 2166);
erc1400-dashboard is gated this run (MIT, LICENSE
file SHA f534c47b…); sto-backend-api and
sto-web-client are NOT gated (no LICENSE file at
root — README "ISC" and README/package.json "MIT"
claims unverified), ideas only. The 2026-11-21
~03:42 run's "ODW lead NARROWED (dashboard,
sto-backend-api, sto-web-client still unread)" line
is superseded by this closure. No ODW repo remains
unread.

## NOT adopted (claimed, not verified)

- erc1400-dashboard's "production-quality
  architecture" framing from the ODW announcement
  (the repos themselves say reference, not
  production — the announcement's framing is not
  adopted); "enterprise-grade" claims anywhere in
  the stack; any star/fork count as quality (0 stars
  / 0 forks on all three repos this run — recorded,
  not a verdict; the three were published as one
  batch on 2025-12-30); RainbowKit/Wagmi/Ethers/
  Zustand/NextUI version pins as recommendations;
  the Quorum-to-Besu and ERC-1400-to-ERC-3643/1155
  migration advice as verified ecosystem fact (it is
  the authors' stated direction, recorded as such);
  the dashboard's manual-testing checklist as a
  test result (no tests were run here).
- sto-backend-api's "enterprise-grade features" and
  "comprehensive REST interface" claims; JWT secret,
  Mailgun, Auth0, PubNub, and AWS integrations
  (configuration-described, not read, not adopted);
  the test suite (Mocha/Chai/Supertest/Sinon —
  described, not run here); "dual database support"
  as a proven pattern (described, not exercised).
- sto-web-client's "comprehensive user interface"
  completeness claim; Web3Modal/Wagmi/Ethers version
  pins as recommendations; deployment claims
  (Vercel/Docker/traditional — described, not
  exercised); the repo's own disabled strict
  TypeScript and disabled build-time linting as a
  practice to copy (recorded as a gap, not adopted).
- Re-verification, no new adoption: hexo-ai/sia
  (SIA) — the MarkTechPost article of 2026-05-29
  describes the same repo already gated 2026-11-18
  (MIT, LICENSE file SHA de67384f…); no duplicate
  NOTICE entry. NousResearch/hermes-agent — already
  gated 2026-11-18 and re-verified 2026-11-20; the
  secondary star figures conflict (95.6K in one
  April review, 242K in a later guide) and neither
  is adopted. lsdefine/GenericAgent (self-evolving
  skill tree, MIT per a secondary listing) — not
  deep-dived this run; stays a candidate, no claim
  made.
- TokenF lead: still NOT closed — this run's web
  search again returns only the npm page
  (@tokenf/contracts, MIT claim npm-only, no
  repository link) and no GitHub repo identity;
  no LICENSE file read. Stays an open lead, ideas
  only, no entry.
- dualmint-addendum stays pending;
  zinium5-web-fallback-lane stays pending (module
  entry, spec null — counted invalid by the drainer,
  skipped, pre-existing).
