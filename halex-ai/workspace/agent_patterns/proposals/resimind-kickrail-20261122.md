# Proposal: Verified-memory agent patterns (1105216375-alt/ResiMind, GATED) + Stripe-affiliate attribution ideas (Railhq/Kickrail, NOT gated) — 2026-11-22

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-22):
- 1105216375-alt/ResiMind — MIT License,
  Copyright (c) 2026 1105216375-alt and ResiMind
  contributors (LICENSE file SHA
  df15b7ac2ac1fc2ed293e300fc59535979be9429).
  README read in full (file SHA
  b5b0cba999b6df9024cce2196d6e32cbfc27b60b,
  42,311 chars, 522 lines). Repo: 293 stars,
  2 forks, created 2026-10-08, updated
  2026-11-20T14:38:39Z (connector search, run
  time), Python, default branch main, not
  archived. Neuro-symbolic agent architecture:
  a model, rules, or symbolic tools propose a
  step; independent domain verifiers decide what
  becomes a fact; failed checks return residual
  feedback to the next attempt; completed
  derivations can yield candidate rules that
  face independent admission into a persistent
  knowledge library, are re-verified on reload,
  and are re-checked on every new application.
  Core is Python 3.10+ with no runtime
  dependencies; MCP is optional (Python 3.11+).
  Status experimental (v0.16.0). The README
  states plainly that domain verifiers and
  residual builders are trusted application
  code whose correctness determines what
  "solved" means, that evidence labels do not
  authenticate real-world inputs, and that
  digests catch result mix-ups, not malicious
  plugins. The secondary source that surfaced
  this repo (the Agent Memory Atlas, neoneye)
  names the same canonical repo and its
  description matches the README read here.
- Railhq/Kickrail — GNU Affero General Public
  License Version 3 (LICENSE file SHA
  fe6b9036ba1818c79c15f802a586a9711ece2b97).
  README read in full (file SHA
  196a559dc964651d0c5e98d9657542d04be4f9e9,
  6,328 chars). Repo: 0 stars, 0 forks,
  created 2026-10-18, updated 2026-11-12
  (connector search, run time), Python,
  default branch main, not archived.
  Open-source affiliate and referral tracking
  for SaaS products that bill through Stripe:
  multi-tenant, one affiliate login across
  merchants; Next.js web front as UI plus a
  server-side proxy, FastAPI backend holding
  all business logic behind an internal token,
  MongoDB. The README states plainly that its
  tests use fake Stripe clients and signed
  webhooks and that the system is not yet
  verified against real Stripe. AGPL-3.0 is
  NOT permissive under the HALEX gate, so
  Kickrail is ideas only, restated in our own
  words, no NOTICE.md entry.
- PromoterKit (ZTABS) — NO repo found: GitHub
  repository search for "promoterkit" returned
  no matching repo (one unrelated design repo).
  The "open source (MIT)" claim exists only on
  a marketing page (ztabsnew.vercel.app) and
  was NOT verified against any LICENSE file.
  No patterns, no entry; lead stays open until
  a repo is identified and its LICENSE read.
- ViralPayouts — repo STILL 404: connector
  get_file_contents for viralpayouts/
  viralpayouts README returns 404 (third
  independent confirmation, after the
  2026-11-21 run's two-route 404). No LICENSE
  read, no gating; the AGPL attribution engine
  stays ideas-only even if the repo reappears.

## Patterns adopted (ResiMind, GATED — restated in our own words only)

- Verifier before commit: a proposal is checked
  by independent domain code before any state
  change, and the verifier creates the facts
  that may be committed. A model cannot grant
  itself verification with a confidence score
  or a "verified" field.
- Residual feedback: a rejection preserves
  state and returns its reason to the proposer;
  the set of outstanding goals, unknowns, and
  hard constraints is rebuilt from committed
  facts after every commit, so unfinished work
  stays visible until a domain adapter
  discharges it.
- Verified memory with an admission gate: a
  completed derivation yields a candidate rule;
  admission is decided by the registered domain
  verifier, never by the proposer. A stored
  rule is re-verified on reload and re-checked
  on every new application; reuse still needs
  the current task's checks.
- Distrust the stored verdict: admission
  discards everything a candidate says about
  itself, and loading discards the stored
  verdict and asks the current verifier again.
- Revocation by statement digest: a rule's id
  is a digest of its statement, so a revoked
  rule cannot be learned back; revocation is
  terminal and records a reason.
- Persistence split, recorded not smoothed:
  durable memory with save, reload, and revoke
  lives on the Python API; the MCP server keeps
  one library per process, lost on restart,
  with no save and no revoke. Never assume the
  MCP path persists.
- Local-first routes: when local rules or tools
  suffice, supported routes run with zero model
  calls; cost-aware selection compares bounded
  previews of verified rules before requesting
  a model, and every selected step still needs
  independent verification.
- Bounded budgets: attempt and stall budgets
  bound the loop. Step budgets cannot interrupt
  a blocked callback — callers must enforce
  model and tool timeouts and resource limits;
  the model wrappers bound response tokens and
  API attempts, which is not a total-cost cap
  or a hard deadline for the full run.
- Scope honesty: each domain adapter has a
  bounded scope; "solved" means the declared
  obligations are complete, not that a feasible
  solution exists or an engineering limit is
  satisfied. Missing evidence keeps the task
  open — no completed recommendation is
  produced, and a request outside the
  configured window goes to human review
  rather than inventing a policy exception.
- Evidence before claims: registered tools
  collect typed inputs before the loop runs.

## Ideas only (Kickrail, NOT gated — restated in our own words only)

- Server-reported signup as the reliable
  attribution path: the merchant reports the
  signup from its server with the referral
  reference, email, user id, Stripe customer
  id, and IP; the browser script is a fallback,
  never the source of truth.
- Idempotent commissions: one commission per
  invoice or one-off Checkout session, by the
  affiliate's campaign (percent or flat, paid
  once, for N months, or forever).
- Refund-proportional clawback: refunds and
  disputes reduce or void unpaid commissions in
  proportion to the amount refunded; an
  already-paid commission becomes a negative
  clawback line netted from the affiliate's
  next payout.
- Self-referral flag and hold: a matching
  email, company domain, or sign-in IP flags
  the referral and holds its commissions until
  the merchant approves it.
- Hold period plus minimum: a payout covers
  only commissions past their hold period, for
  affiliates over the minimum.
- Backend never exposed directly: every
  request is refused without an internal token
  except /health; the UI is a server-side proxy
  and the session becomes a bearer token only
  inside the proxy.
- Env-var prefix discipline: settings use a
  project prefix (KR_ in their case) because
  unprefixed names like MONGODB_URI are often
  already exported in a shell for other
  projects.
- First-party referral record: the referral
  reference lives in a first-party cookie on
  the widest domain plus localStorage; creator
  codes are real Stripe promotion codes and
  need no integration.
- No code, no embed script, no FastAPI/MongoDB
  wiring, no Stripe webhook or Connect payout
  code, no payout execution — the shapes only.
  AGPL-3.0 stays ideas-only for this program
  even though the repo is readable.

## Verdict

GATED adoption (one repo) + ideas only (one
source). 1105216375-alt/ResiMind is MIT with
the LICENSE read verbatim (file SHA df15b7ac…)
and the README read in full; its patterns are
gated and a NOTICE.md entry is added this run.
Railhq/Kickrail is AGPL-3.0 with the LICENSE
read verbatim (file SHA fe6b9036…) and the
README read in full; it is NOT gated — AGPL-3.0
is not permissive under the HALEX gate — ideas
only, restated in our own words, no NOTICE.md
entry. PromoterKit has no identified repo and
no LICENSE read — no patterns, no entry.
ViralPayouts is still 404 — no gating.
No code adopted, no branding adopted, no vendor
figures adopted (see below). HALEX gate stricter:
no ResiMind Python/MCP/Lean/DeepSeek/OpenAI/
LangGraph code, no Kickrail code of any kind;
no network / wallet / signing / payment /
API-key code anywhere.

## NOT adopted (claimed, not verified)

- ResiMind's benchmark and measurement figures
  (28/28 algebra-repair statuses, 240/240
  compact-computation tasks, 71.4% fewer
  transfer proposals, 33.1% fewer mean math
  steps, 10/10 transfer tasks, ChinaTravel
  0/12 vs 5/12, 150/150 unified fixtures) are
  the authors' own development measurements on
  published fixtures, recorded here as their
  claims, not verified facts; MiniF2F and
  LeanDojo scores are still pending per the
  README itself. "Zero model calls" is a
  property of the local routes as designed, not
  a measured saving. The THIRD_PARTY_NOTICES.md
  evaluation-material carve-out (ChinaTravel
  data) is atlas-stated, not read here; the
  core library and memory modules are stated
  to carry no such condition.
- The Agent Memory Atlas's framing and
  judgements are secondary; only the repo
  identity, LICENSE, and README read here are
  primary.
- Kickrail's "Rewardful alternative" framing,
  plan-billing and pricing claims, hosted
  service claims, and any Stripe behavior as
  verified fact — the README itself says the
  system is not yet verified against real
  Stripe. Star/fork counts as quality NOT
  adopted (ResiMind 293 stars / 2 forks;
  Kickrail 0 stars / 0 forks — recorded, not
  verdicts). The ResiMind owner name
  (1105216375-alt) is unusual; it is the
  canonical owner per the connector and the
  atlas archive, recorded as read, not smoothed.
- PromoterKit's MIT claim, fraud-detection
  claims, and "open-source affiliate engine"
  framing — marketing-page claims only, no repo
  read, none adopted.
- ViralPayouts page claims (535 platforms,
  "same code as production") — unchanged from
  the 2026-11-21 run, still not adopted.
