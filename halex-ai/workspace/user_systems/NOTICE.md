# NOTICE — pattern sources for user_systems/

No code was copied from any project below. Patterns were restated in
HALEX-AI's own words; the registry code in `affiliate_links.py` is
original, stdlib-only, and tested (10/10).

- OpenManus — FoundationAgents/OpenManus — MIT License.
  Verified 2026-10-30: repo page shows MIT, 58,827 stars, active.
  Pattern used: single agent + tool layer + multi-agent flow mode.
- Internet of Agents (IoA) — OpenBMB/IoA — Apache License 2.0.
  Verified 2026-10-30: repo page shows Apache-2.0, 838 stars.
  Pattern used: nested team formation, heterogeneous agents, async work.
- Weferral — WeferralHq/weferral — MIT License.
  Verified 2026-10-30: repo page shows MIT, 290 stars; README states
  "not production ready yet, still a work in progress" and secondary
  coverage notes ~4 years without updates. Pattern used ONLY: affiliate
  portal + commission shapes + tracker concept. No code, no stack.
- Google Harness² — Apache 2.0 (per secondary report 2026-10-30, not
  independently license-verified this run). Doctrine used: improve the
  harness, not the weights; carry evidence-backed lessons forward.
- Evolve Protocol, Acontext, pskoett/self-improving-agent — via
  secondary reports only this run; licenses NOT independently verified.
  Method used: experience accumulation + per-user learning from real
  feedback. No code adopted. Next intake runs verify licenses directly
  before any closer adoption.
- DualMint (RWA platform) — research subject only. No code, no
  endorsement, no investment advice, no yield claims repeated as fact.
  Pattern used: RWA evaluation checklist (operator, utilisation,
  custody, legal terms, liquidity terms) in
  `proposals/rwa_evaluation_checklist.md`.

Credit is kept here per source. If any license above proves different
on re-check, the pattern's status drops to ideas-only until resolved.
- Evolve Protocol — armorbreak001/evolve-protocol — MIT No Attribution
  (MIT-0).
  Verified 2026-10-31: LICENSE file read verbatim (MIT-0 text);
  GitHub metadata shows NOASSERTION, the file governs. Repo: created
  2026-04-12, 2 commits, 0 stars, not archived; prose only (SKILL.md +
  references/), no executable code. Patterns used, restated in our own
  words: decision log, error-pattern library, state snapshot, three-tier
  safety vocabulary, after-5 review habit. Vendor success metrics NOT
  adopted (claimed only).
- Microsoft AutoGen — microsoft/autogen — code MIT / docs CC-BY-4.0
  (split license, per the repo README's Legal Notices: code under MIT
  via LICENSE-CODE, documentation under CC-BY-4.0 via LICENSE).
  Verified 2026-10-31: repo is ARCHIVED and no longer maintained by
  Microsoft (README banner; successor named as Microsoft Agent
  Framework). 61,644 stars, 3,784 commits. Pattern used ONLY:
  orchestrator + specialist agents (already the standing verdict from
  run 1, now license-verified and corrected: run 1 recorded the license
  as secondary-report only). No code copied; archived status means no
  new adoption beyond the pattern.
- NousResearch Hermes Agent — NousResearch/hermes-agent — MIT License.
  Verified 2026-10-31: LICENSE file read verbatim via the GitHub
  connector (SHA 75410e73319c72cd3e991a501c5455eb78f38375),
  Copyright (c) 2025 Nous Research. Repo: created 2025-07-22,
  60,878 commits, 259,102 stars, not archived. Patterns used,
  restated in our own words, with HALEX's stricter draft-only gate:
  skill-candidate capture after complex/error-recovered/corrected
  tasks, patch-preferred refinement, curator lifecycle as gate-gated
  review prompts (never unattended pruning), progressive disclosure,
  memory/skills separation. No code copied; no gateway, portal,
  install, or model-switching material adopted; no unattended
  creation/editing/pruning; no weight-training self-evolution.
- Composio — ComposioHQ/composio — MIT License.
  Verified 2026-10-31: LICENSE file read verbatim via the GitHub
  connector (SHA 61479ac154a8e5b534361973fdfa0cce3775de9d),
  Copyright (c) 2025 Sampark Inc. Repo: created 2024-02-23,
  6,005 commits, 30,843 stars, not archived. Pattern noted only
  this run (no proposal staged yet): per-user session-scoped tool
  surface with runtime-discovered meta tools. HALEX-AI translation
  is allowlist descriptors only — no network, API-key, or
  third-party execution adopted. Queue entry stays PENDING until
  a proposal maps it.
- AssetGate — jevinjojo/AssetGate — LICENSE NOT VERIFIED.
  README claims "MIT License — see LICENSE" and carries an MIT
  badge, but the repo root listing contains NO LICENSE file and
  a connector fetch of LICENSE failed (file does not exist at
  root). Repo: created 2026-09-25, 64 commits, 0 stars, not
  archived; README itself states the platform is NOT audited and
  NOT production-ready, with simulated KYC. Status: IDEAS ONLY
  (two-gate transfer model: identity gate + modular compliance
  gate, as a possible RWA-checklist criterion). No code, no
  endorsement, no deployment or token claims adopted, until a
  LICENSE file is actually found and read.
- Agent Orchestrator — OrchestratorInc/agent-orchestrator (LICENSE fetched
  via the Untrivial-ai/agent-orchestrator path) — Apache License 2.0.
  Verified 2026-10-31: LICENSE read verbatim via the GitHub connector
  (SHA 0963902dbd478bcf554d8d16ece3887338520535); README read.
  Repo: created 2026-02-13, 13,967 stars, 1,899 forks, not archived.
  Owner naming has moved (ComposioHQ / Untrivial-ai in secondary
  roundups, OrchestratorInc in live search) — recorded as naming flux.
  Patterns used, restated in our own words, with HALEX's stricter gate:
  one task = one agent + branch + worktree; failures routed back to the
  owning worker; human returns only when needed. No code copied; no
  branding, no agent-count or productivity claims adopted.
- ThinkRail — JetBrains/thinkrail — Apache License 2.0.
  Verified 2026-10-31: LICENSE read verbatim via the GitHub connector
  (SHA 9a239244ba179fe6ae7bb21c07d5df894ee6f5b5); README read.
  Repo: created 2026-07-08, 6,813 stars, 375 forks, not archived;
  JetBrains incubator project. Patterns used, restated in our own
  words: isolated git-worktree workspaces, settled shelf for finished
  or dormant workspaces, SPEC.md graph beside the code as ground
  truth, per-step commit/review, failing checks handed back to the
  agent. No code copied; no roadmap promises adopted.
- RefRef — amicalhq/refref — LICENSE READ, NOT PERMISSIVE: GNU AGPL
  version 3 (SHA 29ebfa545f5580919a4e884d7014d7a3eb2df762).
  README read (SHA db39996b12b89c6e4199ecc5d2512653fd43506e).
  Repo: created 2025-02-23, 241 stars, 60 forks, not archived; README
  itself warns the project is still in alpha — expect bugs and
  breaking changes. Status: IDEAS ONLY (sandbox/live project pairing
  with per-environment API keys, first-party-cookie click capture +
  backend signup attribution, merchant-owned customer IDs, rules-driven
  rewards). No code copied or adapted under the gate; no endorsement;
  no payout or delivery claims adopted.
- azena self-improving-loop — azena-ai/self-improving-loop — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA a63f5d3f5062a8d233bd12c4d0d55304b6245a07), Copyright (c) 2026
  azena (Kayra Labs GmbH i. G.). Repo: created 2026-06-23, 3 commits,
  0 stars, not archived. Patterns used, restated in our own words:
  versioned genome strategy file the loop reads and rewrites, one
  lever per tick, gate ordered typecheck/build/artifact-verification,
  failing gate returns to pick another lever (never "commit anyway").
  HALEX gate STRICTER: no human-out-of-the-loop operation; drafts to
  gate review only. "Battle-tested in production" claim NOT adopted.
  No code copied.
- metaswarm — dsifry/metaswarm — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA 7f60beacf2c73f1336d6294bf334576a841dae58), Copyright (c) 2026
  Dave Sifry. Repo: created 2026-02-02, 427 stars, 55 forks, not
  archived, updated 2026-10-30 (secondary listings stale at June 2026
  / ~370 stars — live repo governs). Patterns used, restated in our
  own words: IMPLEMENT → VALIDATE → ADVERSARIAL REVIEW → COMMIT per
  work unit, orchestrator never trusts subagent self-reports, review
  gate with a bounded iteration cap before human escalation, disk-
  persisted plans surviving compaction. No PR automation, no
  unattended merging adopted. Efficacy claims ("100% test coverage",
  "hundreds of PRs") NOT adopted. No code copied; no branding.
- Chainstack rwa-sdk — chainstacklabs/rwa-sdk — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA 10acbe45094667ea6b9f2e55c7c66bba2ed41ed5), Copyright (c) 2026
  Chainstack Labs. Repo: created 2026-03-30, 16 commits, 8 stars,
  not archived. Pattern used, restated in our own words: normalized
  adapter interface (protocol, chain_id, all_tokens, can_transfer)
  plus a yield-pattern and compliance-model taxonomy, as an RWA
  research CHECKLIST only. No SDK code, no RPC, no web3/pydantic
  dependency adopted (HALEX engine stays stdlib-only, zero network);
  no sample price/TVL figures adopted as fact; no token endorsement.
- OpenManus — FoundationAgents/OpenManus — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA db2216e1a5bfd392213f57a257930e9b2dcca684), Copyright (c) 2025
  manna_and_poem. Repo: created 2025-03-06, 58,851 stars, 10,219 forks,
  not archived, updated 2026-11-01. Patterns used, restated in our own
  words: single-agent plan/tool/observe loop, three execution modes
  with the multi-agent flow labelled unstable by its own README.
  Benchmark and production-ready claims NOT adopted. No code copied;
  no branding.
- Ruflo — ruvnet/ruflo — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA 5c4718198a4156beacc780980077043a98b0dd6a), Copyright (c)
  2024-2026 ruvnet. Repo: created 2025-06-02, 80,544 stars, 9,447 forks,
  not archived, updated 2026-11-02T00:37:14Z. Patterns used, restated
  in our own words: harness-around-the-model framing, permission
  levels with ask-first default, router picking agent type and model
  tier, persistent memory, console overview/cost/swarm/events.
  HALEX gate STRICTER: no unattended swarms, no daemons, no
  auto-approval, no MCP/browser execution. Download-badge figures
  NOT adopted (README itself calls the badge illustrative); cost
  claims NOT adopted. No code copied; no branding.
- CrewAI — crewAIInc/crewAI — MIT License.
  Verified 2026-11-01: LICENSE read verbatim via the GitHub connector
  (SHA a6ee25527ec07201e4373fcbf89f128f304a6f2e), Copyright (c) 2025
  crewAI, Inc. Repo: created 2023-10-27, 60,394 stars, 8,997 forks, not
  archived, updated 2026-11-02T00:21:43Z. Patterns used, restated in
  our own words: role-based Crews plus event-driven Flows, sequential
  vs hierarchical (manager-coordinated) processes, agent cards with
  role/goal/backstory/tools/memory/guardrails, human-in-the-loop
  support. Certification and "production standard" claims NOT
  adopted; commercial AMP control plane NOT adopted. No code copied;
  no branding.
- DeepSeek dsh-superagent-prototype — deepseek-ai/dsh-superagent-prototype
  — MIT License.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA df5ef0e6d9cf2989975742db0a13ad15050ee89b), Copyright (c)
  2026 DeepSeek Harness Team. Repo: created 2026-10-31T09:32:46Z,
  1 commit, 10,365 stars, 1,060 forks, not archived, current commit
  6337fc823ce20251c8de8085948165c81aaa701e. Patterns used, restated
  in our own words: triage before work (act only when asked or when
  a written team rule allows it), one-repo work items answered in
  the original conversation, speak-only-when-needed, numbered docs
  in dependency order. README's own framing governs: research
  prototype for reference only, not an official product, not
  production-ready, not identical to the design article. Benchmark
  and product claims NOT adopted. HALEX gate STRICTER: no
  unattended workers, no always-on listeners, no unapproved
  command execution. No code copied; no branding.
- OKF Agent Memory — okf-memory/okf-agent-memory — MIT License.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA e789485f3da41fd23cf6e77c897d6031a3055449), Copyright (c)
  2026 sknr and the OKF Memory Contributors. Repo: created
  2026-09-05T21:26:04Z, 236 commits, 848 stars, 68 forks, 22 releases,
  not archived, default branch develop. Patterns used, restated in
  our own words: git-native Markdown knowledge bundles with YAML
  frontmatter, search-before-write, provenance + trust tiers +
  lifecycle metadata, project > vendor > user > system scope
  shadowing, dual push/pull memory split. Performance figures
  (sub-300us search, token-reduction percentages) NOT adopted —
  the project's own benchmarks, not independently reproduced.
  Registry/hub/sync network machinery excluded by the HALEX gate.
  No code copied; no branding.
- Superpowers — obra/superpowers — MIT License.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA abf0390320aa14406af7a520b9b0739fdda9bf08), Copyright (c)
  2025 Jesse Vincent. Patterns used, restated in our own words:
  spec-first workflow (ask what is really being built, show the
  spec in short readable chunks, agree the design, then small
  tasks each reviewed against the spec), composable skills with
  bootstrap instructions, transcript-evidence diagnosing step.
  Star counts and "hours of autonomous work" framing NOT adopted.
  HALEX gate STRICTER: no unattended operation, no auto-approval.
  No code copied; no branding, no skill files copied.
- Memsearch — zilliztech/memsearch — MIT License.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA add14e92cb4c3f819617e38931d5edf248b3a970), Copyright (c)
  2025 Zilliz Inc. Repo: created 2026-02-09T02:29:16Z, 2,816 stars,
  278 forks, 262 open issues, not archived, updated
  2026-11-02T14:47:00Z. Patterns used, restated in our own words:
  persistent memory as readable Markdown records, plain-text
  files a human can read, edit, and version-control. NOT adopted:
  Milvus/vector backing, embeddings, hybrid search, remote
  reranking API, and the secondary press framing that the system
  ditches vector databases (contradicted by the repo's own
  description, which names Markdown and Milvus). No code copied;
  no branding.
- Source-of-truth — ngocquang/source-of-truth — MIT License.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA ba9e9c5b533476d6b246c3bfec7b7eba19dd70d7), Copyright (c)
  2026 QuangDN. Repo: created 2026-06-23T02:48:22Z, 41 stars,
  6 forks, 0 open issues, not archived, updated 2026-10-14T08:14:46Z.
  Patterns used, restated in our own words: living docs/ catalog
  of what exists, why, and what rules apply; catalog-before-code
  (read before writing, sync after shipping); gate chain
  constitution → mission → roadmap → specs → code; catalog as
  complement to a working methodology, built from stated intent,
  never guessed. Secondary no-server/no-network/no-telemetry claim
  NOT adopted (unverified from the README excerpt read). No code
  copied; no skill files copied; no branding.
- Cap-evolve — skillberry-ai/cap-evolve — Apache License 2.0.
  Verified 2026-11-02: LICENSE read verbatim via the GitHub connector
  (SHA 841571bc98019517f3584150a1b4d011cc02deb5), Copyright 2026
  cap-evolve contributors. Repo: created 2026-06-15T07:46:31Z,
  67 stars, 18 forks, 139 open issues, not archived, updated
  2026-11-02T12:27:41Z; README badges: beta (0.x), Python 3.10+,
  0 runtime dependencies (stdlib). Patterns used, restated in our
  own words: learn from failed evaluation traces; keep a candidate
  only when it beats a held-out split by more than noise (gain >
  k × standard error); sealed test split scored exactly once;
  per-task break/fix feedback; every candidate a reviewable diff.
  Demo/benchmark figures NOT adopted (site not read). MCP/tool-
  surface/network machinery and unattended optimization excluded
  by the HALEX gate. No code copied; no branding.
- Session-analytics — shihchengwei-lab/session-analytics — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA 9b7a724e1df4b652a864fa03ee06c23c62cc0191), Copyright (c) 2026
  Shih Cheng-Wei. Patterns used, restated in our own words: weekly
  review with a capped, re-derived rules block (retire after 2 clean
  weeks); re-validate rules after a model switch; harness fixes beat
  prose rules; validator gate before any shown diff, write only after
  approval. Log-reading scripts NOT ported; 29-test claim NOT verified.
  No code copied; no branding.
- AgentKthx — VTSTech/AgentKthx — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA 846afc677746f6e89ecad9c672394a16f9407aa3), Copyright (c) 2026
  Nigel Todman. Self-described Alpha. Pattern used, restated in our
  own words: manifest-declared plugin system with lifecycle hooks.
  Provider/backend, network, and API-key machinery excluded by the
  HALEX gate. No code copied; no branding.
- X-operator — kkone1238899/x-operator — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA 7e3eec997b5033c4317bfe771f4e411b35d0c590), Copyright (c) 2026
  "muse-skills contributors" (as written in the file). Patterns used,
  restated in our own words: daily LESSON/EVIDENCE/ACTION review log;
  merge lessons seen ≥2 times into standing rules every 7th review;
  rubric scoring with a queue threshold; draft gates (checklist →
  critic → human-voice pass) as human-reviewed discipline only.
  Unattended publishing/operation explicitly excluded by the HALEX
  gate. No code copied; no branding.
- GBrain — garrytan/gbrain — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA 35029511144443297cad2d26e4bac17d0e352f93), Copyright (c) 2026
  Garry Tan. Repo: created 2026-04-05T14:40:56Z, 31,497 stars, 4,696
  forks, 521 open issues, not archived, updated 2026-11-04T00:43:44Z.
  Patterns used, restated in our own words: explicit facts stored
  with their sources; corrections and withdrawal as dated entries,
  never silent edits; keyword-first retrieval with richer search as
  an optional addition only. Hosted operation, vector/semantic
  machinery, and MCP/network code excluded by the HALEX gate.
  No code copied; no branding.
- SIA — hexo-ai/sia — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA de67384f2e62fe2b3335ec136c39f5a308a8390b), Copyright (c) 2025
  Hexo. Patterns used, restated in our own words: three distinct
  roles — builder, worker-with-log, reviewer-of-the-log — kept
  separate so no role grades its own draft. Weight/adapter training
  and unattended rewriting explicitly excluded by the HALEX gate;
  paper benchmark gains NOT adopted. No code copied; no branding.
- Agent Memory — Masikomoore/agent-memory — MIT License.
  Verified 2026-11-03: LICENSE read verbatim via the GitHub connector
  (SHA d2b35c248c6ad5056eca945fc452090652b37768), Copyright (c) 2026
  Masikomoore and Agent Memory contributors (THIRD_PARTY_NOTICES.md
  noted for adapted components). Secondary search metadata showed
  NOASSERTION; the LICENSE file itself governs and is MIT.
  Patterns used, restated in our own words: memory belongs to the
  user, not to one vendor/IDE/model; keep your own copy of history.
  LanceDB/embeddings storage and MCP/REST machinery excluded by the
  HALEX gate. No code copied; no branding.
- Scope — microsoft/scope — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA 96a394c43c3f1b72e8edf4397e39f162c3007166), Copyright (c)
  Microsoft Corporation. Patterns used, restated in our own words:
  reusable success criteria defined before a run; every result
  inspectable with its evidence attached; runs followable live.
  Research-preview status noted; external documentation site NOT
  read, so no documentation claim adopted. Portal/CLI, Docker, and
  Kubernetes machinery excluded by the HALEX gate. No code copied;
  no branding.
- TeamAI — Tencent/teamai-cli — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA 935ff4be4df46d76c5ee4b8b06d8fb7bb55be3b9), Copyright (C) 2026
  Tencent. Patterns used, restated in our own words: team AI assets
  managed in a git repository; changes reach the shared set only by
  a reviewed merge onto a protected default branch; sessions start
  from the last reviewed state. Vendor test figures (6.1% / 76% on
  13 internal tasks, per secondary reporting, no published method)
  NOT adopted. MCP/provider machinery and automatic sync of
  unreviewed assets excluded by the HALEX gate. No code copied;
  no branding.
- Job-search harness — saikumaresh/job-search-harness — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA 70fa8dd31fbfbf94806fa3aa6c56b9531cdc9e6b), Copyright (c) 2026
  Sai Kumaresh. Repo very new (created 2026-11-02, 0 stars).
  Patterns used, restated in our own words: six-layer harness
  (context, tools/limits, fixed output shape, read-only verifier,
  memory, automation); no quote, no score on a fixed scale; verifier
  reads files not reasoning and rechecks maths; calibration only
  after human approval with its effect shown; nothing sent without
  a yes. Author's score anecdote and setup-time claim NOT adopted.
  Gmail-connector and scheduled unattended operation excluded by
  the HALEX gate. No code copied; no branding.
- ai-memory — akitaonrails/ai-memory — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA 746f96818c095e6653ea158d0626d6d435127d37), Copyright (c) 2026
  Fabio Akita. Patterns used, restated in our own words: git-backed
  plain-markdown memory with a rebuildable index; claimed-once typed
  handoffs; bounded startup brief; sanitization at a privacy boundary
  before storage. Server/multi-user/transcript-capture machinery and
  benchmark figures excluded by the HALEX gate. No code copied;
  no branding.
- deep-memory — kevintsai1202/deep-memory — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA 63f58668404c8563d07effd1ce2e5f108c5c20b8), Copyright (c) 2026
  Kevin Tsai. Patterns used, restated in our own words: hot/cold
  tiered storage with review-gated promotion; ask-first capture of a
  successful approach; keyword fingerprinting and topic-switch
  detection; restore that fills missing files only and never silently
  overwrites. ChromaDB/vector/reranker/cloud-reranker machinery and
  all speed/token-saving claims excluded by the HALEX gate. No code
  copied; no branding.
- tokenlane — talocode/tokenlane — MIT License.
  Verified 2026-11-04: LICENSE read verbatim via the GitHub connector
  (SHA b6e80f9ab83adb9d4990390677745ef62e90ad05), Copyright (c) 2026
  Talocode. Patterns used, restated in our own words: plan/hold/
  transfer/registry/receipt workflow where a failed check returns the
  error and the record never pretends an issuance happened; holds
  refuse the supply cap, transfers refuse a short balance. Hosted
  API, credit pricing, market projections, and any issuance/contract/
  title/custody/payment machinery excluded by the HALEX gate. No code
  copied; no branding.
- aeroloop — udirobert/aeroloop — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 06e82de1e4f9215bbfbe23bb516ba8f64829a158), Copyright (c) 2026
  udirobert. Patterns used, restated in our own words: holdout-gated
  self-improvement (tune on one split, judge only on a chronological
  holdout never seen in tuning); rejected strategies preserved as
  versioned vN-rejected ghosts, never silently overwritten; honest
  degradation reporting (model_used / params_source naming which path
  ran). FastAPI/server, network fetchers, model endpoints, and the
  24.1% MAE improvement figure (synthetic demo dataset) excluded by
  the HALEX gate. No code copied; no branding.
- gbase — garyqlin/gbase — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 482bfa7f57350011727a454170090faf19887113), Copyright (c) 2026
  Gary Lin (Lin Qian). Patterns used, restated in our own words:
  multi-armed review (builder / auditor / judge); pre-change
  snapshot with a bounded auto-pruning rollback registry; experience
  distilled into structured patterns, not raw logs. Unattended
  self-rewrite, scheduler daemon, API-key/provider code, and the
  "in production / 100 RSI cycles" claims excluded by the HALEX gate.
  No code copied; no branding.
- numok — dfg-ar/numok — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 7ee19828971e27a01c3fd7648ceee759d8fe9335), Copyright (c) 2025
  dfgonzalez. Pattern used, restated in our own words: affiliate
  ledger with pending/paid states and holds on refund events —
  commissions held with evidence attached until released, entries
  never edited, only reversed with a note. Stripe/payment/wallet
  machinery and the tracking SDK excluded by the HALEX gate; affiliate
  links stay user-supplied only. No code copied; no branding.
- agent-self-edit — deghosal-2026/agent-self-edit — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 9e3675e0060cc1092623c8d19d5924600faa3104), Copyright (c) 2026
  Debashish Ghosal. Patterns used, restated in our own words: a
  deterministic seven-check promotion gate (sample floor, effect size,
  confidence p < 0.05, frozen sections, edit-distance limit, drift
  detection, Oracle Drift Guard) that promotes only statistically-proven
  winners from A/B tests on a held-out set; near-miss as a first-class
  archived outcome; a versioned prompt registry with SHA-256 integrity
  and rollback. Unattended self-rewrite, model/provider/API-key code,
  and the author's test/coverage figures (807 tests, 94.86% coverage,
  0% false-positive rate) excluded by the HALEX gate — figures not run
  by us, not adopted as fact. No code copied; no branding.
- swarm-orchestrator — moonrunnerkc/swarm-orchestrator — ISC License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA bf69d71eac98320d112bb9837d2c817a3113b811), Copyright (c) 2026,
  moonrunnerkc. Patterns used, restated in our own words: every edit
  through one chokepoint under a lexical path policy, landing on a
  hash-chained ledger outside the workspace; a standalone verifier
  measuring the candidate in a closed-network container from a pinned
  image; requirement verdicts (satisfied / failed / unverified /
  blocked) with the evidence that decided them; a run complete only
  when every required obligation is satisfied and the evidence matches
  the delivered patch. In-toto/DSSE attestation is a concept reference
  only — no signing/key code ported; model probing, Ollama, and
  cloud-model machinery excluded by the HALEX gate. No code copied;
  no branding.
- halo-record — bkuan001/halo-record — Apache License 2.0.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 894f2efb3fa9130317241275ea96b4ed2819b516), Copyright 2026 Brian
  Kuan. Patterns used, restated in our own words: hash-chained Runtime
  Records — RFC 8785 canonicalization, SHA-256, prev_hash linkage,
  genesis prev_hash 64 zeros, verifier recomputes every hash and link
  with no secret; raw arguments stored as hash plus a masked summary
  (capped), with a hash-only mode; external checkpoints (record count
  plus head/root fingerprints) as the load-bearing proof against
  removal; a LIMITS file stating what the evidence cannot prove.
  Hosted-witness service and any hosted model excluded by the HALEX
  gate; engine code stays stdlib-only, zero network. No code copied;
  no branding.
- llm-council — karpathy/llm-council — NO LICENSE FILE (verified
  2026-11-05: no LICENSE or LICENSE.md at repo root; root listing
  read via the GitHub connector). IDEAS ONLY, no code copied, no
  branding. Patterns restated in our own words: independent answers
  from several models, anonymized peer ranking on accuracy and
  insight, one designated Chairman compiling the final answer;
  "99% vibe coded" Saturday hack, author will not support it.
  OpenRouter / API-key / network machinery excluded by the HALEX
  gate; engine code stays stdlib-only, zero network. Star count
  (26,261, verified live) is popularity, not quality; no efficacy
  claim adopted.
- ReviewBench — review-bench/ReviewBench — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 53be16002bd0976419b159a7b34bde80d9eaf6ec), Copyright (c) 2026
  review-bench. Patterns used, restated in our own words: a
  human-reviewed golden set of findings as ground truth for judging
  agent outputs; severity and category taxonomy (Correctness,
  Reliability, Security, Maintainability, Testing, Documentation,
  Performance, API architecture, Accessibility); an agent contract
  and a local offline test set with a judging CLI before any public
  claim; repository mirrors so verdicts survive upstream deletion.
  Leaderboard scores are vendor-run and maintainer-gated — NOT
  adopted. The LLM judge (Claude Sonnet 5) is never the sole decider
  in HALEX-AI; deterministic checks run first. No code copied; no
  branding.
- MemoryAgentBench — HUST-AI-HYZ/MemoryAgentBench — MIT License.
  Verified 2026-11-05: LICENSE read verbatim via the GitHub connector
  (SHA 8c00085921d0d8e099218007478e3af4546edf00), Copyright (c) 2026
  Yuanzhe Hu. Patterns used, restated in our own words: four memory
  competencies as a consolidation checklist — accurate retrieval,
  test-time learning, long-range understanding, conflict resolution;
  "inject once, query multiple times" efficiency; conflict
  resolution by newest-verified-wins with the superseded record kept
  and the reason recorded, never silently overwritten. Model scores
  and ICLR acceptance are not efficacy evidence and are NOT adopted.
  HippoRAG / cognee / letta machinery excluded by the HALEX gate —
  no vector store, no embeddings, memory stays Markdown plus hash
  chain. No code copied; no branding.
- Hermes Agent — NousResearch/hermes-agent — MIT License.
  Verified 2026-11-06: LICENSE read verbatim via the GitHub connector
  (SHA 75410e73319c72cd3e991a501c5455eb78f38375), Copyright (c) 2025
  Nous Research. Patterns used, restated in our own words: a closed
  learning loop that distills a completed, verified task into a plain-
  Markdown skill file (agentskills.io-compatible format) and refines
  that skill on reuse, keeping superseded wording in a dated history
  note, never silently overwritten; three-layer memory (session
  context, persistent full-text-searchable store, drift-adjusting user
  model) kept as Markdown plus hash chain in HALEX-AI; full-text
  session search with provenance on every result. The "40% faster"
  benchmark claim, star counts, funding news, and all provider /
  network / messaging-gateway / backend machinery are NOT adopted —
  the HALEX gate excludes network, provider, and API-key code, and
  unattended automations contradict ask-before-posting. No code
  copied; no branding.
- RefRef — refrefhq/refref — GNU AGPL-3.0. Verified 2026-11-06:
  LICENSE read verbatim via the GitHub connector (SHA
  29ebfa545f5580919a4e884d7014d7a3eb2df762). IDEAS ONLY — AGPL-3.0 is
  outside the HALEX permissive set. Pattern noted, in our own words:
  a referrer-facing self-service shape (own tracking link, own
  balance, payout request; backend reports referred payments). No
  code copied; no payment or tracking machinery adopted.
- Raider — valeriansaliou/raider — NO LICENSE file at repo root;
  Cargo.toml declares `license = "MPL-2.0"`. Verified 2026-11-06 via
  the GitHub connector. IDEAS ONLY — MPL-2.0 is outside the HALEX
  permissive set, and a secondary page's MIT claim is contradicted by
  the repo's own manifest. Pattern noted, in our own words: the same
  self-service affiliate shape (tracking-code generation, balance
  review, payout request, payment-reporting API). No code copied; the
  Rust 1.51-era stack is stale and is not ported.
- Spec Kit — github/spec-kit — MIT License, Copyright GitHub, Inc.
  Verified 2026-11-06: LICENSE read verbatim via the GitHub
  connector (SHA 28a50fa22639e32febe14e4ffc7a732b0ba8c90a). Patterns
  used, restated in our own words: spec-driven development
  (constitution, then specify → plan → tasks → implement → converge
  until `Converged`); bug fixing with a `verified` / `partial` /
  `failed` verdict; idea assessment with a `go` / `needs-clarification`
  / `kill` decision; composable process primitives and an artifact
  inventory naming which layer supplies each command or template.
  Activity verified live: 148,123 stars / 13,303 forks, updated
  2026-11-06T16:53:53Z. No code copied; no CLI, provider, agent
  integration, catalog, or network machinery adopted; no efficacy
  claim adopted.
- Pairmark — Hemanshu-Upadhyay/pairmark — MIT License, Copyright
  (c) 2026 Hemanshu Upadhyay. Verified 2026-11-06: LICENSE read
  verbatim via the GitHub connector (SHA
  b9aea205e0c06276ffdd38e2ee3124bd51e52a94) and README read in full.
  Patterns used, restated in our own words: isolated-worktree races
  with an identical brief and tool-run checks; ordered verdict rules
  (checks outrank opinions, check-configuration tampering flagged,
  split judges = tie with dissent printed, never averaged); review
  inputs treated as untrusted data. Activity verified live: 0 stars,
  created and last updated 2026-09-02, ~2 months quiet. No code
  copied; no CLI-spawning or provider machinery adopted; the author's
  single-race judge scores (8.6 vs 8.0) are NOT adopted; the
  full-auto CLI modes are explicitly excluded.
- Anchor SDK — hrithikkoduri/anchor-ai-sdk — MIT License, Copyright
  (c) 2026 Anchor contributors. Verified 2026-11-06: LICENSE read
  verbatim via the GitHub connector (SHA
  54e9058525bba490e107406d26983402c8c4fe23) and README read in full.
  Patterns used, restated in our own words: a requirement ledger
  (add commitment, change status, link evidence with a required claim,
  verify) with phase transitions naming unmet requirements and finish
  blocked by any open requirement; a judge as an explicit seam with
  per-requirement `cleared | insufficient | unproven` verdicts;
  write-ahead operation journal with reconcile-never-replay and a
  `recovery_required` outcome for unknowable results; per-child
  budgets with wrap-up nudge and hard cap. Activity verified live:
  2 stars / 1 fork, created 2026-10-19, updated 2026-10-30, early
  alpha 0.8.12. No code copied; no provider, API-key, sandbox, MCP,
  or network machinery adopted; no benchmark figures adopted (the
  v0.1.7 table is a selected sample by the README's own disclosure,
  and v0.1.8 has no complete round).
- Harness² — google-research/harness2 — Apache License 2.0. Verified
  2026-11-06: LICENSE read verbatim via the GitHub connector (repo
  commit SHA 6868817518876de8fd170c6a8354daca273b6191) and README read
  in full. Patterns used, restated in our own words: recursive
  harness improvement with a contrastive Propose–Probe–Compose step
  and no ground-truth feedback; two-level recursion (task-level
  refinement + harnessing-level improvement harness carrying
  evidence-supported lessons forward); eight editable harness
  components mounted as files; parallel vs sequential recursion.
  Activity verified live: 22,942 stars / 2,295 forks, created
  2026-10-06, updated 2026-11-07T00:20:07Z, not archived. No code
  copied; no provider, network, API-key, executor, or benchmark
  machinery adopted; no benchmark gain adopted (11.5 / 4.5 / 11.8
  are vendor-run paper figures); not a Google product, per the
  repo's own disclaimer.
- PowerContext — oceanbase/powercontext — Apache License 2.0.
  Verified 2026-11-06: LICENSE read verbatim via the GitHub
  connector (repo commit SHA
  9a424e77d5c5f04ae0147a9278570edc5927d50d) and README read in full
  (23,561 chars). Patterns used, restated in our own words:
  revisioned context artifacts addressed FAMILY/ARTIFACT_ID@REVISION
  with exact-reference snapshots; memory lifecycle
  (active/forgotten/merged/retired) with restorable forgetting;
  a four-step handoff loop (Work Contract → Prepared Handoff →
  Acknowledgement → Task Outcome); an Experience review inbox with
  terminal approve/reject and expected_version writes; skill
  export-on-purpose (approval never installs or executes); bounded
  recall under a byte budget, recalled content labelled history not
  instruction authority. Activity verified live: 1,510 stars / 601
  forks, created 2025-11-10, updated 2026-11-06T19:55:26Z, not
  archived. No code copied; no server, MCP, HTTP, provider, or
  model-extraction machinery adopted; no benchmark figure adopted
  (LoCoMo 90.78% / SWE-bench token savings are vendor-run, and the
  README itself says the LoCoMo Plus run artifacts are not public).
- EverOS — EverMind-AI/EverOS — Apache License 2.0, Copyright 2025
  EverMind AI. Verified 2026-11-06: LICENSE read verbatim via the
  GitHub connector (repo commit SHA
  80ef766b690dd02eb6caa4e9f78bad4a9f0c1ee9) and README read in full
  (28,258 chars). Patterns used, restated in our own words:
  Markdown as the single source of truth for memory, synced to
  local indexes; separate user (episodes/profile) and agent
  (cases/skills) tracks; orthogonal retrieval by user/agent/app/
  project/session; offline reflection merging episode clusters into
  profiles and skills between sessions; a source-backed Markdown
  Knowledge Wiki. Activity verified live: 13,842 stars / 965 forks,
  created 2025-10-28, updated 2026-11-06T23:56:48Z, not archived.
  No code copied; no LanceDB/vector/embeddings store, no server,
  no provider/API-key or multimodal machinery adopted; no accuracy
  figure adopted (HyperMem 92.73% LoCoMo is a secondary claim, not
  read by us).
- Raven — EverMind-AI/Raven — Apache License 2.0. Verified
  2026-11-07: LICENSE read verbatim via the GitHub connector (file
  SHA 33068551c97e6ca2cce7c1e85ee63d97de1e9e1a; repo commit SHA
  8448cc6280923a7b20525af259a3b6d465844c42) and README read in full
  (28,784 chars, 448 lines). Patterns used, restated in our own
  words: host-agent DAG orchestration with built-in specialist
  agents; the agent loop split into four decoupled strategy seats
  (Memory / Planning / Capability / Action) rewritten one at a time
  by a separate Curator tool; an Evolver that develops agents from
  outside rather than running inside them; nothing installed before
  verification, failed checks sent back, reference answers stripped
  from review signals; third-party agents over ACP/CLI/OpenAI-
  compatible APIs; multi-agent trajectory observability. Activity
  verified live: 6,082 stars / 239 forks, created 2026-05-21,
  updated 2026-11-07T08:37:10Z, not archived; pre-alpha. No code
  copied; no unattended workflow automation, no third-party agent
  orchestration, no provider/network/API-key code, no install-script
  machinery adopted; no SOTA claim, benchmark chart, showcase claim,
  or "outperforms Claude Code" figure adopted.
- EvoAgentBench — EverMind-AI/EvoAgentBench — MIT License,
  Copyright (c) 2026 EverMind (website root); benchmark/
  subdirectory separately Apache License 2.0. Verified 2026-11-07:
  LICENSE read verbatim via the GitHub connector (file SHA
  0f2569c5db14bc54f794e328d9a49b00cf3c05d2; repo commit SHA
  948a17288782d5120778da16b4cf1cad9305d8b4) and benchmark/LICENSE
  read verbatim (file SHA 24332c9ca658a345633f7f0e1251321e573d46a5);
  README read in full (4,406 chars). Patterns used, restated in our
  own words: ability-transfer self-evolution bench — train on
  training tasks, extract trace-grounded abilities into operational
  units, inject into a fresh agent, measure held-out test gain plus
  turn-cost against a no-prior-knowledge baseline; domain Ability
  Graphs linking tasks with procedural overlap; every test task
  backed by verified training-side ability support. Activity
  verified live: 41 stars / 5 forks, created 2026-04-14, updated
  2026-10-27T07:41:06Z, not archived. No code copied; no LLM judge
  as sole decider, no provider/network code, no leaderboard score or
  model result adopted (secondary 21%→65% / 25%→66% figures and the
  conflicting five-domain/917-task counts NOT adopted; the paper's
  four-domain 528/267 split governs).
- EverMemBench — EverMind-AI/EverMemBench — LICENSE UNVERIFIED:
  no LICENSE file at the repo root (LICENSE and LICENSE.md both fail
  to resolve via the GitHub connector; README states no license).
  IDEAS ONLY — no code, no copied text. README read in full
  (13,984 chars) 2026-11-07. Patterns noted, restated in our own
  words: four-stage memory evaluation pipeline (Add → Search →
  Answer → Evaluate); one adapter per memory system behind a common
  interface, plus a plain-LLM long-context control; unified message
  format with group/speaker attribution; multiple-choice by direct
  comparison, open-ended by LLM judge. Activity verified live: 24
  stars / 2 forks, created 2025-10-29, updated
  2026-11-06T08:42:59Z, not archived. No paper finding or result
  figure adopted.
- SkillCorpus — EverMind-AI/SkillCorpus — Apache License 2.0,
  Copyright 2026 EverMind AI; `match/`, `evaluate/` and
  `lifecycle/` toolkits each separately MIT (per the README
  License section). Verified 2026-11-07: LICENSE read verbatim
  via the GitHub connector (file SHA
  459556a22aedb4d657bb8ea525bad2cfe76b1bba; repo commit SHA
  17d0e19e3ce495c0929d30c34b2c0f39714661f0) and README read in full
  (25,218 chars). Patterns used, restated in our own words:
  license-audited skill curation (every row carries source,
  source_url, license; GREEN whitelist gates export; each skill
  keeps its upstream license); curation decisions keyed on
  content hash; 16-class taxonomy with utility/robustness/safety
  facets; bounded retrieval (at most two skills per turn,
  on-demand preferred); shared skill library across hosts with
  skills kept across turns; per-model skill retirement on the
  unaided level instead of on gain. Activity verified live: 699
  stars / 116 forks, created 2026-08-11, updated
  2026-11-06T17:17:58Z, not archived. No code copied; no hosted
  SkillHub API, no embedding/reranker serving, no remote-script
  bundle installer, no benchmark/pass-rate/MRR figure adopted
  (corpus counts 96,401 / 114,190 / 300,473 disagree as versioned
  snapshots — none adopted as fact).
- EverAlgo — EverMind-AI/EverAlgo — Apache License 2.0. Verified
  2026-11-07: LICENSE read verbatim via the GitHub connector
  (repo commit SHA 7398133c673333abe6043360fd385cedcc04b57d) and
  README read in full (11,638 chars). Patterns used, restated in
  our own words: stateless, persistence-free extraction and
  ranking operators split from the service layer (orchestration,
  storage, routing live upstream); episode boundary detection;
  geometry vs LLM clustering; composable retrieval strategies
  with category-aware retrieval and fusion/rerank tooling;
  Episode / Foresight / AtomicFact / Profile and AgentCase /
  AgentSkill / AgentProfile extraction shapes; KnowledgeExtractor
  pipeline with category classification; offline examples with
  fake LLM clients and no API key; per-distribution independent
  SemVer releases with a two-tier CHANGELOG. Activity verified
  live: 32 stars / 9 forks, created 2026-05-11, updated
  2026-11-06T08:55:30Z, not archived. No code copied; no LLM
  provider client, no network fetch, no Office-conversion temp
  files, no API key, no "fully tested" claim adopted; two
  operators are unimplemented placeholders (WorkspaceMemCell
  Extractor, video parsing) and are not relied on.
- Refferq — Refferq/Refferq — MIT License, Copyright (c) 2025
  Refferq. Verified 2026-11-07: LICENSE read verbatim via the
  GitHub connector (file SHA
  11b3911d4b112e7a28a60ca061f59a2513d4f7d1; repo commit SHA
  25df6596a15cf1e9d26021752137d66c22dd8e34) and README read in full
  (About, Features, Tech Stack, Installation). Patterns used,
  restated in our own words: affiliate registry shape — unique
  referral link + shareable code per affiliate; lead-submission
  review with Pending / Approved / Rejected lifecycle; partner
  groups with custom commission rates; flexible commission rules
  (percentage/fixed) as data; payout scheduling (NET-15/30) as a
  date rule only; affiliate earnings / click / payout-history
  dashboard shape. Activity verified live: 135 stars / 103
  forks, created 2025-10-10, updated 2026-11-05T22:10:46Z, not
  archived. No code copied; no payout execution, no
  payment-provider code (PayPal/Stripe/Wise excluded), no email
  sending, no JWT/secret handling, no "real-time" or "launch in
  minutes" claim adopted.
- HyperMem — EverMind-AI/HyperMem — Apache License 2.0. Verified
  2026-11-07: LICENSE read verbatim via the GitHub connector
  (file SHA 261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64; repo commit
  SHA 15c700908f3ec64d6931f253695e42c679a4c958) and README read in
  full. Patterns used, restated in our own words: three-level
  topic → episode → fact hypergraph with same-level weighted
  hyperedges; coarse-to-fine top-down retrieval (topic, then
  episode, then fact) with reciprocal-rank fusion of lexical and
  dense rankings; hyperedge embedding propagation (attention-
  weighted member sum, node update with lambda 0.5); six-stage
  construction/index/retrieve/respond/evaluate pipeline shape;
  per-experiment artefact directories; single config module with
  environment-variable overrides. Activity verified live: 25
  stars / 4 forks, created 2026-06-02, updated
  2026-11-06T07:49:44Z, not archived. No code copied; no
  OpenRouter API key, no vLLM GPU servers, no embedding or
  reranker models, no LLM-as-judge evaluation; no LoCoMo accuracy
  figure (92.73%) or comparison claim adopted.
- MSA — EverMind-AI/MSA — IDEAS ONLY. No LICENSE file at repo
  root (verified 2026-11-07: LICENSE path read fails; code search
  finds only the README badge claiming MIT — badge-only,
  unverified). README read in full (repo commit SHA
  77fbdfde88e150cd91307fd710067cf06828cfdc). Ideas restated in our
  own words: chunk-mean pooled K/V routing keys with router
  projector cosine-similarity Top-k document selection; document-
  wise RoPE (positions reset per document) with global RoPE offset
  for the query; three-stage inference (offline encode, online
  routing/assembly, sparse generation); Memory Interleave
  (generative retrieval → context expansion → generation, multi-
  round for multi-hop); tiered storage (routing keys resident,
  content fetched on demand). Activity verified live: 3,519 stars
  / 228 forks, created 2025-10-29, updated 2026-11-04T01:24:29Z,
  not archived. No code copied or adapted; no model weights, no
  flash-attn, no GPU training/inference; no 100M-token, <9%
  degradation, RULER, or QA-table claim adopted.
- EverMe — EverMind-AI/EverMe — Apache License 2.0, Copyright
  2026 EverMind AI. Verified 2026-11-07: LICENSE read verbatim
  via the GitHub connector (file SHA
  b27bab2ead0f483d610ae40bcf0e17aca2a36731; repo commit SHA
  89f20a2f1117af590e820269d678a1dbd231549e) and README read in full.
  The license applies only to the source code in the repository,
  not to the hosted EverMe product or service. Patterns used,
  restated in our own words: cross-agent shared memory pool keyed
  to the user, not the workspace; MCP resource shape
  (mem://profile, mem://search) and tool names (mem_save_fact,
  mem_save_turn, mem_context); per-host plugin install writing
  that host's config file with credential files at 0600; a single
  versioned public-contracts document (CLI output, structured
  errors, MCP tools/resources, token redaction); token redaction
  for agent tokens and keys. Activity verified live: 75 stars /
  14 forks, created 2026-05-27, updated 2026-11-06T06:10:10Z, not
  archived. No code copied; no hosted service, no account/billing,
  no auth device flow, no bearer tokens, no MCP server code, no
  npm install or binary download; no cross-device sync claim
  adopted.
- HiGMem — ZeroLoss-Lab/HiGMem — MIT License, Copyright (c) 2026
  ZeroLoss-Lab. Verified 2026-11-08: LICENSE read verbatim via
  the GitHub connector (file SHA
  05a64ccb9ba5be0fee8aca251a7e331a4f387d15; repo commit SHA
  f275072f25323a01a8bff3680edbb34ed97d33be) and README read in
  full. Patterns used, restated in our own words: two-level
  event-turn memory hierarchy (TurnNotes grouped into event
  summaries, optional profile layer); incremental event
  affiliation and update; reasoning-aware retrieval (query
  rewrite into keywords, candidate events/turns, evidence
  filter, answer generation); ablation-flag vocabulary
  (profile, event-title/metadata-only, fact judgment, filter,
  turn-turn links, query rewriting). Activity verified live:
  latest commit 2026-04-22 "Prepare public HiGMem release";
  single-release repo, quiet since April 2026; star/fork counts
  not retrieved this run. No code copied; no OpenAI API key,
  no vLLM/OpenAI-compatible backend, no embedding download,
  no PyTorch/CUDA, no LLM judge as sole decider; no benchmark
  or F1 claim adopted.
- LiCoMemory — EverM0re/LiCoMemory — NO LICENSE FILE at repo
  root (root listing read 2026-11-08). IDEAS ONLY, no code, no
  entry. README read in full (repo commit SHA
  a844d993f77f947f682a0a52ec2825f2950bc0b3). Ideas used, restated
  in our own words: CogniGraph three-layer semantic index
  (session summaries, entity-relation triples, dialogue chunks
  linked by cross-layer hyperlinks); unified rerank weighing
  entity, session, and temporal similarity; real-time
  incremental graph update. No "state-of-the-art" accuracy /
  latency / token claim adopted.
- H-Mem — rutgerswiselab/H-mem — repo NOT FOUND (GitHub API
  404, 2026-11-08; repository search returns 0 items). IDEAS
  ONLY from the paper text, no code, no entry. Ideas used,
  restated in our own words: dual-tree architecture (temporal
  tree + semantic tree over the same FactNodes) with a mode
  controller choosing the serving tree. No J-Score or
  benchmark claim adopted.
- Numok — dfg-ar/numok — MIT License, Copyright (c) 2025
  dfgonzalez. Verified 2026-11-08: LICENSE read verbatim via
  the GitHub connector and readme.md read in full. Patterns
  used, restated in our own words: self-hosted affiliate
  program shape (separate admin and partner tables, referral-
  link tracking, commission ledger keyed to payment events,
  partner groups with custom commission rules as data, payout
  scheduling as a date rule only). No code copied; no Stripe
  secret key, webhook secret, webhook endpoint, or payment
  execution; no PHP/MySQL implementation, no Docker/Composer
  setup; default admin credentials in the source README
  recorded as a security smell, never adopted. No earnings,
  conversion, or payout reliability claim adopted.
- HiMem — jojopdq/HiMem — Apache License 2.0, appendix Copyright
  [2023] [Taranjeet Singh]. Verified 2026-11-08: LICENSE read
  verbatim via the GitHub connector (file SHA
  d20d5102c3cf97ecbee54afd65893de4a11d26fe; repo commit SHA
  0cd4a2500f91a0353178c9e380e491c99a0ad61f) and README read in
  full (2,694 chars). Patterns used, restated in our own words:
  episode/note two-layer memory hierarchy; topic-aware
  event-surprise dual-channel segmentation; hybrid and
  best-effort retrieval; conflict-aware memory updating. No code
  copied; no LLM provider/API-key code, no vector-database
  backend, no Docker setup, no LLM judge as sole decider. No
  LoCoMo F1 or benchmark claim adopted.
- Hy-Memory — Tencent-Hunyuan/Hy-Memory — Apache License 2.0,
  Copyright (C) 2026 Tencent. Verified 2026-11-08: LICENSE read
  verbatim via the GitHub connector (file SHA
  fbcfb3ce24c5eed11aebe84a37f4480bb9834c4e; repo commit SHA
  9737431cf8965124b115f0e26cb0ff1e5cafa323) and README read in
  part (intro, news, system architecture, chat hierarchy L0–L7,
  working/coding pipelines; 17,940 chars total). Patterns used,
  restated in our own words: three-scene router (chat/working/
  coding) behind one add/search entry; L0–L7 layered chat memory
  with intention expiry/demotion; working two-layer fact +
  reusable-experience records with value threshold and
  bidirectional links; coding version-evolution diff chain
  recording coordinates instead of pasted code; metadata filters
  before top-K. No code copied; no model weights (Hy-Memory-30B-
  A3B), no provider/API-key/embedding code, no HTTP MCP
  endpoint, no vector/graph store. No "production-grade" or
  benchmark claim adopted.
- MRAgent — Ji-shuo/MRAgent — NO LICENSE FILE at repo root
  (LICENSE and LICENSE.md both 404 via the GitHub connector,
  2026-11-08). IDEAS ONLY, no code, no entry. README read in
  full (file SHA 0b3424c2e3ef935e64b309be5a7d0ee351afffb5). Ideas
  used, restated in our own words: graph-structured episodic
  memory; rewrite turns into self-contained sentences (pronoun
  resolution, absolute dates, topic tags, person-level facts);
  keyword/topic/personal/temporal/context retrieval-tool
  vocabulary. No "96% fewer tokens" or benchmark claim adopted.
  Live activity 2026-11-08: 257 stars, 28 forks, updated
  2026-11-06.
- LycheeMemory — owoakuma/LycheeMemory — NO LICENSE FILE at repo
  root (LICENSE 404 via the GitHub connector, 2026-11-08).
  IDEAS ONLY, no code, no entry. README not read this run; the
  repo is the canonical one (PyPI: "LycheeMem is now
  LycheeMemory"; LycheeMem/LycheeMem 404s). Ideas recorded from
  secondary sources only, not verified: three complementary
  stores, SQLite FTS5 + LanceDB storage, agent-framework
  plugins, MCP endpoint. Live activity 2026-11-08: 4 stars,
  updated 2026-08-20. No claim adopted.
- RefRef — refrefhq/refref — GNU Affero General Public License
  v3, read verbatim (LICENSE file SHA
  29ebfa545f5580919a4e884d7014d7a3eb2df762). AGPL-3.0 is
  non-permissive for this program: IDEAS ONLY, no code, no
  entry. Affiliate lead CLOSED by this read. Ideas recorded
  from secondary sources only: referral/affiliate/loyalty
  platform shape (referral links, attribution, reward rules as
  data, partner dashboard); alpha-stage warning. No code copied;
  no reward/payout execution, no API-key handling. No earnings,
  conversion, or payout reliability claim adopted.
- TENET (HIEROMEM) — Rishikiran98/HIEROMEM (repo now named TENET)
  — MIT License, Copyright (c) 2026 Sai Rishi Kiran Mannava,
  read verbatim (LICENSE file SHA
  c254c9c747f943982365dace67b517e6dbe36f87; repo HEAD commit SHA
  92d95fed3cb82ce7c3dee8ae223f646d916f65a9, last commit
  2026-10-28, v0.5.0). README read in full (file SHA
  f9ba15b343dbfd41b1ed96ba0cc50f17901b3088). Patterns only,
  restated in our own words: append-only hash-chained event log
  as the only source of truth with external anchors kept off
  the log's host; scope grants (one grant per task: namespaces,
  tools, action budget, expiry); governance gate as a pure
  function, unmatched means DENY, escalations fail closed;
  retrieve-as-data with why-chain audit view; poisoned-memory
  demo; journal + operator reconciliation that never retries
  the effect. Excluded outright: HTTP API surface, bearer
  token, pgvector store, LLM Brain provider code. NOT adopted:
  the 161-test count, any correctness-comparison result, or
  the PyPI "hieromem" description (it disagrees with the repo
  README actually read). No star/fork count claimed.
- EverMind-AI/everos-plugins — Apache License 2.0, read verbatim
  (LICENSE file SHA 2a8dd2346efd52266a7d9bea911bf504bbae8646).
  README read in part (head only, ~5,000 chars; file SHA
  565caae2d695338278f3e39791e1903a8c4735f4). Patterns only,
  restated in our own words: scan-first migration (report
  without editing), pre-flight gate before the first change,
  snapshot first and work on its own branch, stop and ask on
  anything unmigratable, lead the report with what will still
  fail. Excluded outright: cloud SDK / HTTP callers. NOT
  adopted: the per-tool verification table or any migration
  outcome claim. NOTE: the README describes "EverOS Tools" /
  everos-tools and points install steps at
  EverMind-AI/everos-tools, not everos-plugins — repo/readme
  naming mismatch unresolved; no repo-identity claim beyond
  the path read is adopted. No star/fork count claimed.
- memagent — 1476989162/memagent — LICENSE NOT READ: the
  repository URL 404s (GitHub connector 401/404, browser text
  fetch 404, live browser task 2026-11-09 03:45 EST confirmed
  GitHub's 404 page). IDEAS ONLY from the PyPI page text
  (memagent-local 0.3.6, MIT claimed there, never verified
  against a LICENSE file): per-memory forgetting curves,
  runtime self-tuning from recall behaviour, reconsolidation
  on recall. No entry, no code. Repo appears deleted, renamed,
  or private.
- memoryagent-lib — LICENSE NOT READ: no GitHub repository
  found (repository search for "memoryagent-lib" returned 0
  hits, 2026-11-09; PyPI page gives no repo URL in the text
  read, and the PyPI page itself would not load for a direct
  read). IDEAS ONLY from the PyPI search text (MIT claimed
  there, never verified): tiered memory (working, episodic,
  semantic, perceptual), hot/cold storage, archive indexing,
  confidence-based retrieval escalation, optional local vector
  search via sqlite-vec. No entry, no code. Repo identity
  unconfirmed.
- Hermes Agent — NousResearch/hermes-agent — MIT License,
  Copyright (c) 2025 Nous Research. Verified 2026-11-09:
  LICENSE read verbatim via the GitHub connector (file SHA
  75410e73319c72cd3e991a501c5455eb78f38375); README read in
  part (head; file SHA 830be257308736e48f25ac4f2d097888b3a63a2c);
  261,985 stars / 58,334 forks as returned by the GitHub
  repository search at read time; updated 2026-11-09. Patterns
  used ONLY: closed learning loop (skill creation from
  experience, skills self-improve during use, agent-curated
  memory with nudges), FTS5 on-demand session recall, small
  curated persistent profile, skills as plain-text files on
  disk. No code, no provider/API-key code, no install scripts,
  no messaging gateway, no unattended automation. No
  growth/SOTA/benchmark claim adopted.
- TraffoFlex — devflex-pro/traffo-flex — MIT License,
  Copyright (c) 2026 DevFlex. Verified 2026-11-09: LICENSE
  read verbatim via the GitHub connector (file SHA
  ed69df4af529596c70aa720cc0faad0cd2857cd8); README read in
  full (file SHA a783a88a51bd1baf72f0dde96b19ed30a0bedc3f);
  2 stars / 0 forks at read time; updated 2026-10-09. Author
  calls it an MVP: harden, audit and extend before production
  use. Patterns used ONLY: campaign/stream/destination/
  traffic-source/postback-template registry, weighted routing,
  trafficback, postback normalisation + deduplication +
  outbound postback log, traffic/conversion/revenue/cost/
  profit/ROI reports. No code, no server/payment/payout code,
  no install script. TraffoFlex affiliate lead now CLOSED.
- TokenLane — talocode/tokenlane — MIT License, Copyright (c)
  2026 Talocode. Verified 2026-11-09: LICENSE read verbatim
  via the GitHub connector (file SHA
  b6e80f9ab83adb9d4990390677745ef62e90ad05); README read in
  full (file SHA 48eaeed135b76b7d465bb10eeacbfc3fa2024019;
  repo HEAD 3cad09ed7b1548b689fff8c8e484bc432fd5fab1); 0 stars /
  0 forks at read time; v0.1.2, created 2026-10-12. Patterns
  used ONLY: plan/hold/transfer/registry/receipt local
  workflow; failed check returns the error, never pretends
  issuance; per-kind, per-jurisdiction questionnaire (questions,
  not legal answers); representation spec marked spec_only;
  oracle URL stored, never called; receipt id per plan. No
  code, no API-key/bearer auth, no hosted cloud routes, no
  credit pricing, no MCP server. No market-size, pricing, or
  token claim adopted.
- OpenClaw — openclaw/openclaw — MIT License, Copyright (c) 2026
  OpenClaw Foundation. Verified 2026-11-10: LICENSE read verbatim
  via the GitHub connector (file SHA
  ed064819ab537575d0cad902f7e5af4a3488b1d0); README read in full
  in substance (113,230 chars; file SHA
  d4a9d8094ad39c2b54ce8a643e4ce499bbd650f2); 394,268 stars /
  82,854 forks as returned by the GitHub repository search at read
  time; updated 2026-11-10. Patterns used ONLY: gateway as local
  control plane (UI/CLI/TUI as clients of it), skills as plain-text
  instruction directories, plugins packaging channels/providers/
  tools/skills, policy enforced by code (inbound messages
  untrusted, explicit pairing approval), opt-in-only telemetry
  with a single disable flag, foundation stewardship with donors
  owning nothing. No code, no provider/API-key code, no install
  scripts, no messaging gateway, no MCP server. No growth,
  most-starred, or CVE claim adopted (secondary star counts
  disagree; CVE report unverified).
- Chainstack rwa-sdk — chainstacklabs/rwa-sdk — MIT License,
  Copyright (c) 2026 Chainstack Labs. Verified 2026-11-10:
  LICENSE read verbatim via the GitHub connector (file SHA
  10acbe45094667ea6b9f2e55c7c66bba2ed41ed5); README read in full
  (file SHA 661787b1f73ec64c951d8b37d30b4e0cc73cac49); last commit
  2026-05-22 (OpenEden TBILL adapter) — about 5.5 months quiet;
  star/fork counts NOT retrieved (repository search returned no
  match this run). Patterns used ONLY: read-only single-interface
  query shape, typed records with normalised fields and a
  price_source naming the exact read, four yield patterns
  normalised (accumulating / rebasing / ERC-4626 vault /
  dividend mint), seven compliance methods behind one
  can_transfer()-style check, adapter validation at injection
  time, shipped ABIs with no runtime fetching. No code, no live
  querying, no RPC or API-key use. No price/TVL example figures
  adopted as fact; no "90%+ of on-chain RWA value" framing.
- Ankara Chain — ankarachain/ankara-core — MIT License,
  Copyright (c) 2026 Cranebolt Technologies. Verified 2026-11-10:
  LICENSE read verbatim via the GitHub connector (file SHA
  f04a021717d3919b876c3b1006a145cb7139e931); README read in full
  (2,592 chars; file SHA 97963af7b7ede7bcc450aee7774af82a3a9051c1);
  0 stars / 0 forks at read time; created 2026-04-11, updated
  2026-10-05. Patterns used ONLY: six asset-class templates
  behind one Token Factory + Asset Registry + Escrow Manager,
  UUPS-upgradeable template shape, local identity hooks shaped
  for the jurisdiction's real documents, explicit open-core
  boundary (SDK core MIT, dashboard/compliance/audit paid
  tiers), one SDK API across EVM and Stellar backends. No code,
  no contract/SDK/CLI/MCP code, no key or custody handling. No
  "pre-audited" claim adopted (no audit reports read); no
  "go live same day" claim for EVM (deployment is a future item;
  only Stellar testnet is live, July 14, 2026).
- ERC-1400 contracts — OnDemandWorld/erc1400-contracts — Apache
  License 2.0. Verified 2026-11-10: LICENSE read verbatim via
  the GitHub connector (file SHA
  261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64); README read in
  substance (14,111 chars); 0 stars / 0 forks at read time;
  created 2025-12-30, updated 2025-12-31. Patterns used ONLY:
  partitioned-token vocabulary (partial fungibility, movement
  across partitions as a distinct checkable event),
  certificate-based transfer checks (nonce / salt), token holds
  that preserve the investor registry, validator (enforcing)
  vs checker (view-only) split, document binding by reference,
  delivery-vs-payment shape. No Solidity, no contract code, no
  deployment. The README itself says reference-only, not
  production; no "production-quality" claim adopted.
- EverOS MCP server — EverMind-AI/EverOS-MCP — MIT License,
  Copyright (c) 2026 EverMind AI. Verified 2026-11-10: LICENSE
  read verbatim via the GitHub connector (file SHA
  4861362913ceab769096973d9db632f661b142a9); README read in
  substance (14,949 chars); 2 stars / 1 fork at read time;
  created 2026-10-08, updated 2026-11-05. Patterns used ONLY:
  seven-operation memory-tool surface with read-only /
  destructive character marked in the descriptor, background-
  write failure reported on the next result (never silent
  belief), recalled material fenced as data, credential guard
  at the store boundary, two-step freshness (listable before
  searchable), trajectory distillation quality gate (>3
  tool-call rounds). No MCP server code, no Cloud/API-key flow.
  No vendor benchmark numbers adopted; no 13k-star EverOS
  figure attached to this repo.
- Open Agentic Brain and Memory —
  rohithhn/Open-Agentic-Brain-and-Memory — Apache License 2.0.
  Verified 2026-11-10: LICENSE read verbatim via the GitHub
  connector (file SHA
  57bc88a15a0ee8266c259b2667e64608d3f7e292); README read in
  substance (17,686 chars); 0 stars / 0 forks at read time;
  created 2026-10-11, updated 2026-10-18. Patterns used ONLY:
  capture → distill → rank → inject → measure loop with
  human approval of learning drafts (never auto-approved),
  eval-gated changes, managed marker regions for injection,
  dedup by content hash + normalized fingerprint, fixed token
  budget, push (always present) vs pull (only if chosen) as
  different guarantees, honest support matrix (unavailable
  cells as architectural facts, not roadmap). No session
  parsers, no distiller, no embedding model, no reranker, no
  age encryption, no key/keychain handling. No size/eval
  numbers adopted as performance facts.
- Composio — ComposioHQ/composio — MIT License, Copyright (c)
  2025 Sampark Inc. Verified 2026-10-31: LICENSE read verbatim
  (file SHA 61479ac154a8e5b534361973fdfa0cce3775de9d); README
  read in full. Mapping proposal staged 2026-11-10.
  Patterns used ONLY: session-scoped tool surfaces as
  per-user allowlist descriptors, runtime meta-tool discovery
  returning the descriptor only. No network, API-key,
  provider, or third-party execution. Vendor toolkit counts
  NOT adopted.
- yaminidesai/RWA-Tokenization — NO LICENSE file at the repo
  root (connector fetch failed 2026-11-10) — IDEAS ONLY, no
  entry, no code. Canton/DAML 1:1 custody invariant recorded
  as a concept only.
- Supaffi, OpenPromoter, Simple Kuma — all AGPL-3.0; eLitius —
  GPL. Affiliate-tracker leads found 2026-11-10 — IDEAS ONLY,
  no entries, no code. No new permissive affiliate repo this
  run.

- Flash — Natuworkguy/Flash — MIT License, Copyright (c)
  2026-Present Nathan C. Verified 2026-11-11: LICENSE read
  verbatim (file SHA 9be9fb31306d6450f8b8879dd68d34777937d7ad);
  README read in full (27,453 chars). Repo 19 stars / 1 fork,
  updated 2026-11-01, last commit 2026-09-30 (v0.5.12).
  Patterns used ONLY: learned skills as SKILL.md files +
  gated background review (review may only change skills
  the loop wrote, never user-written ones; cadence has an
  off switch); verify-before-done (run the project's own
  checks, discovered from its own config); undo snapshot
  at approval time; precise line edits landing whole or
  not at all; visible plans; autonomous mode opt-in only;
  secret redaction in the terminal-hook log. No shell
  execution, browser control, web UI, phone access, voice,
  or curl|bash install. Onyx model weights excluded
  (gemma4 Apache-2.0 / llama3.1 Community License — MIT
  covers Modelfile and prompt, not weights). "Gets smarter
  every time you use it" / "self-improving" framing NOT
  adopted (file-writing, not weight change); Onyx context
  / hardware claims NOT adopted.
- Memento — shane-farkas/memento-memory — MIT License,
  Copyright (c) 2026 Memento Contributors. Verified
  2026-11-11: LICENSE read verbatim (file SHA
  1c90c32d5cdc18f04ba82668a2fa5959388d2e45); README read in
  full (14,165 chars). Repo 12 stars / 3 forks, created
  2026-04-08, updated 2026-10-20, last commit 2026-08-10.
  Patterns used ONLY: bitemporal facts (valid time vs
  transaction time), supersede-never-delete with audit
  trail, point-in-time recall, tiered entity resolution
  (cheap exact/fuzzy/phonetic before expensive similarity),
  contradiction detection on ingest, multiplicative
  confidence decay, verbatim fallback alongside the graph,
  compositional graph traversal, consolidation (decay /
  dedup / prune), privacy operations (export, audit to
  source, hard delete with receipt). No MCP server,
  provider clients, embedding model, or vector store.
  LongMemEval 90.8% / per-model figures NOT adopted
  (author-run, GPT-4o-judged, harness not run by us).
- MemPalace — MemPalace/mempalace — MIT License, Copyright
  (c) 2026 MemPalace Contributors. Verified 2026-11-11:
  LICENSE read verbatim (file SHA
  bb10c6d6fb7eacdc850335b286a0a555235b50c0); README read in
  full (17,397 chars). Repo 60,515 stars / 7,661 forks /
  808 open issues, updated 2026-11-11, last commit
  2026-11-11 06:03 UTC, default branch develop, v3.12.0.
  Patterns used ONLY: verbatim storage (never summarise /
  extract / paraphrase the record); scoped index
  (wings/rooms/drawers); pluggable backend contract
  exercised across different substrates; layered
  retrieval (raw, hybrid with keyword + temporal boosts,
  optional rerank); honest-benchmark rule (held-out figure
  is the honest one; taught-to-the-test figures labelled,
  never headlined); temporal entity graph with validity
  windows; per-agent wings + diaries discoverable at
  runtime; auto-save hooks + idempotent verbatim sweep;
  wake-up / audit / mine as shapes. No ChromaDB/vector
  backends, MCP server, Docker/server deployment, or
  embedding-model downloads. All benchmark figures NOT
  adopted (author-run; retrieval recall is not end-to-end
  QA accuracy). "Best-benchmarked" framing NOT adopted.
  Star count is a live count only — popularity, not
  quality.
- Prime Agent — PrimeIntellect-ai/prime-agent — MIT License,
  Copyright (c) 2025-2026 Prime Intellect Ltd. (port of the
  Prime Agent TypeScript product, originally Copyright (c)
  2025 Mario Zechner, MIT). Verified 2026-11-11: LICENSE
  read verbatim (file SHA 07f2032a73f12f0333b9d7dd6fd191
  38349cf01b); README read in full (10,824 chars). Repo
  22,664 stars / 2,506 forks / 120 open issues, updated
  2026-11-11, created 2026-05-08. Patterns used ONLY:
  Recursive Language Model (context as variables,
  recursive subagents as function calls inside a
  persistent REPL); Continual Harness (durable prompts /
  memories / skills / subagent specs refined by small
  evidence-backed updates, base prompt immutable,
  snapshots + rollback); skills split (repository skills
  are Markdown instructions that never execute; only
  user-configured skills may be executable); daemon-backed
  reattachable sessions; direct agent-to-agent messaging;
  heartbeats and schedules; persistent goals until
  completed / paused / cleared; bounded autonomous mode
  with turn/token/time budgets and quality gates that
  check only what they verify; automatic compaction with
  a configurable threshold and retained-history reserve.
  No provider login / API-key flow, MCP servers, or
  `curl | sh` installer. ARC-AGI-3 95.5% / human-baseline
  figure and all harness-comparison claims NOT adopted
  (company-reported, self-reported in their own paper;
  benchmark-integrity question open, not settled).
  "Self-improving" framing NOT adopted (harness-state
  refinement, not weight change). Star count is a live
  count only — popularity, not quality.
- WeKnora — Tencent/WeKnora — MIT License, Copyright (C)
  2026 Tencent (third-party components listed in LICENSE:
  Apache-2.0 opencc, MIT anydoc, MIT wails). Verified
  2026-11-11: LICENSE read verbatim (file SHA
  08ad298cc277d43af6caa1df8218fd4d9d86b5bf); README read
  in full (37,762 chars). Repo 37,193 stars / 5,144 forks
  / 943 open issues, updated 2026-11-11, created
  2025-07-22, Go + Vue/TypeScript, v0.9.0 (2026-10-29).
  Patterns used ONLY: three modes over one knowledge
  base (quick RAG Q&A with citations, multi-step ReAct
  agent shown step by step, auto-wiki with knowledge
  graph, editing, revision diff, rollback); cross-session
  long-term memory of user-confirmed facts and
  preferences; retrieval chunks editable, diffed, rolled
  back; folder uploads keep their directory tree;
  conversation steer / fork / rewind; workspace RBAC
  (four roles) with per-workspace audit log; observability
  (agent-step tracing, parsing timeline, task-queue
  dashboard); skill catalog from ClawHub / SkillHub /
  Git / ZIP with session-persistent sandboxes; hybrid
  search + rerank + parent-child chunking + GraphRAG;
  modular swappable pipeline (parsing, vectorization,
  retrieval, inference). No Go server, Docker/Kubernetes/
  Helm, vector database, embedding model, LLM vendor,
  MCP server/services, scoped API key, IM channel, or
  web-search provider. Secondary star figures NOT
  adopted (live count only). No efficacy claim adopted.
- RTK — rtk-ai/rtk — DUAL LICENSE, verified file by
  file: root LICENSE Apache-2.0, Copyright 2026 RTK AI
  Labs (file SHA fb19f9923f93b788a02245f9a27f552aa7acb6ef);
  engine/LICENSE BUSL-1.1 (rtk-engine); proxy/LICENSE
  BUSL-1.1, Licensor RTK AI Labs, Licensed Work rtk-proxy
  (file SHA 0829f2252ae763d3467fe2c3e7528da7eab7bab9).
  README read in full (23,204 chars). Repo 86,222 stars /
  5,523 forks / 1,670 open issues, updated 2026-11-11,
  created 2026-01-22, Rust. Editions: `rtk` (Apache-2.0 +
  BUSL-1.1), `rtk-oss` (Apache-2.0 only: hook core +
  command filters, no engine), `rtk-proxy` (BUSL-1.1
  only). Patterns used ONLY, from the Apache-2.0 OSS
  surface: command-aware output compression (one filter
  per command; failures only + assertion for tests,
  compact git status, grouped matches, essential fields
  only; every filter must cut >=20% to ship); three
  promises (never blocks — filter failure returns raw
  output with exit code unchanged; never worse — never
  prints more than the command did; nothing hidden —
  cut output says where the full version is, bypass runs
  unfiltered); local `gain`-style measurement (per-command
  savings counted locally, daily/history/JSON export)
  with the README's own caveat (bytes/4 estimates:
  percentages reliable, absolutes approximate; an output
  cut is NOT a cost cut); composable one-file pipelines
  with a read-before-install warning. The BUSL-1.1
  engine and proxy daemon are IDEAS ONLY — never adapted,
  never linked, never vendored. No Rust binary, shell-hook
  rewriting, or proxy daemon. Token-saving figures
  (60-90%, 118k->23.9k, best pipeline 20.2%) NOT adopted
  (author benchmarks, not run by us). The secondary MIT
  claim for RTK is wrong (verified Apache-2.0 + BUSL-1.1)
  and is NOT adopted. Star count is a live count only.

## vectorize-io/hindsight (MIT License, Copyright (c) 2025 Vectorize AI, Inc.)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~03:42 EST. LICENSE read verbatim (file SHA
8dce7b4d4c2632990bdf8b4101694ea19ba6ad46); README read in full (26,392 chars;
file SHA 04ade06523a762e63affa7f54e1b5899d87dcca6). Retain/recall/reflect
operations; world facts / experiences / observations / mental models;
observations with evidence, exact quotes and proof count, refined never
overwritten; mental models as standing questions rewritten in the
background; pages as living markdown; decision models as typed judgments;
strictly isolated memory banks with disposition traits; opt-in memory
defence (secret/PII scan, redact or block before storage); parallel
retrieval strategies merged and trimmed to a token budget. NOT adopted:
LongMemEval/LoCoMo figures, "most accurate ever tested", independent
reproduction claim, Fortune 500 usage claim. Excluded by the HALEX gate:
LLM provider/API key, server, Postgres/pgvector, Docker, model weights,
hosted cloud.

## akitaonrails/ai-memory (MIT License, Copyright (c) 2026 Fabio Akita)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~03:42 EST. LICENSE read verbatim (file SHA
746f96818c095e6653ea158d0626d6d435127d37); README read in full (47,344 chars;
file SHA 1af1bfcfeb15890c42941630174323b8a7a981b4). Git-backed markdown wiki
as source of truth, database a rebuildable derived index, no vector store
required; zero-LLM default path; typed handoffs claimed exactly once;
cross-project profile below repo rules; access-weighted decay, cold notes
compact to durable facts, near-dup collapse, contradiction flags, nothing
hard-deleted (git version chain, restore-page); capture sanitised at a
typed privacy boundary; session-end consolidation, bounded brief
injection; directed claim-once agent messaging; purge honesty and audit
log. NOT adopted: ~700/s write ceiling, "20+ harnesses" count. Excluded
by the HALEX gate: Rust server, MCP/HTTP server, SQLite/FTS5 index,
optional LLM/embeddings, bearer/OIDC auth, management console.

## garrytan/gbrain (MIT License, Copyright (c) 2026 Garry Tan)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~03:42 EST. LICENSE read verbatim (file SHA
35029511144443297cad2d26e4bac17d0e352f93); README read in full (34,919 chars;
file SHA 76077dd6668ee6f5dead0b1ace33071eba26a965). Explicit facts with
sources, corrections and withdrawal; keyless keyword retrieval first,
semantic/synthesis/enrichment opt-in; cited synthesis with explicit gap
analysis; typed knowledge graph with breadth-first walks, pattern-matched
auto-link, unresolved facts keep provenance; authorable schema packs with
detect-suggest-review and migration source; brain-first lookup; dream-cycle
cron enrichment; skills beside knowledge in an authorised catalog;
markdown repo as truth, database rebuildable, git deletes soft-deletes;
brain vs source axes with grant/visibility filters (author's own caveat:
no universal no-leak guarantee). Memorable procedural memory EXCLUDED
entirely (off by default, sends redacted traces off-machine). NOT adopted:
155,795 pages / 24,589 people / 5,340 companies, BrainBench R@5 figures,
50K-page ceiling, install-time claims. Excluded by the HALEX gate:
Bun/TypeScript, PGLite/Postgres/pgvector, MCP, embedding/reranker
providers, OAuth, hosted gbrain.io, voice/email/calendar connectors,
credential vault/gateway.

## google-research/harness2 (Apache License 2.0, January 2004)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~11:42 EST. LICENSE read verbatim (file SHA
d645695673349e3947e8e5ae42332d0ac3164cd7); README read in full (9,350 chars;
file SHA a5e91206948cd3d5bbed30c2a951923020e780d2). Eight editable harness
components as files (system prompt, guardrails, memory, tool guidance,
subagents, skills, scripts, plugins); two-level recursion — task-level
Propose-Probe-Compose from behavioural contrasts with no ground truth,
harnessing-level improvement harness keeping adopted harnesses plus
evidence-supported lessons; parallel vs sequential recursion under a
bounded budget; results/resume discipline (adopted harness, reflection
notes, evaluation saved together); web-access guard before evaluation;
local demo needs no model credentials. NOT adopted: benchmark gains
(11.5 WorkBuddy / 4.5 JobBench / 11.8 LAB), GLM-5-beats-Gemini
comparison, "most concrete public answer" framing; arXiv paper not read.
Excluded by the HALEX gate: Vertex AI / provider credentials, OpenCode /
Codex executors, Docker, benchmark harnesses, network-unrestricted
executor. Research code, not an officially supported Google product.

## zhayujie/CowAgent (MIT License, Copyright (c) 2022 zhayujie)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~11:42 EST. LICENSE read verbatim (file SHA
fd03f7c24a514e138467c303e3641a49811bc9c9); README read in full (21,066 chars;
file SHA ed206ab9944a85acd18a0a9af961648871972c19). Formerly
chatgpt-on-wechat. Three-tier memory (context → daily → MEMORY.md core)
with nightly Deep Dream distillation into refined long-term entries plus
narrative journal; knowledge base by topic as auto-curated markdown wiki
with cross-references and knowledge-graph view; self-evolution reviewing
conversations to improve skills, follow up unfinished tasks, consolidate
memory/knowledge; tools atomic vs skills as manifest files composing
tools, one-click install from hub/repo URL/conversational authoring;
multi-agent teams with own role/model/skills/knowledge in a shared
conversation; decoupled layers (channels / core / model). NOT adopted:
model list (future model names unverified), "self-evolves" efficacy, cost
claims, v2.2.2 changelog claims; LinkAI hosted option not endorsed.
Excluded by the HALEX gate: terminal / browser / OS-access tools,
scheduler, MCP servers, vector retrieval, hosted cloud, LinkAI,
multi-model provider keys.

## DeusData/codebase-memory-mcp (MIT License, Copyright (c) 2025 DeusData)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~11:42 EST. LICENSE read verbatim (file SHA
0b95352746a97a8cf2d1f3ba568bc7bb5e514d1f); README 119,672 chars (file SHA
8eebe8bd9c882cc33f3ec69e814937b2f801b127) read in substance — head,
Features, MCP Tools, How It Works, Performance, Security, Graph Data Model
read; install / troubleshooting / language-support / architecture detail
scanned by heading, not line-by-line. Persistent local code/doc/infra
knowledge graph (typed nodes and edges: calls, imports, defines, deploys,
mentions, tests, configures, cross-repo call edges); structural questions
from the graph (call paths, dead-code candidates, change impact plus test
impact, snapshot comparison); read-only Cypher-like query subset;
docs-to-code MENTIONS edges only on exact single-definition resolution;
layered search (BM25 with camel/snake-aware tokenizer, structural search,
11-signal combined scoring — combination idea only, no embedding store);
coverage honesty (clean result means no recorded gap, not completeness);
infra tracing Service → workload → image → Dockerfile → program;
release-verification discipline (scans, SLSA 3 provenance, keyless
signatures, published checksums, static-analysis gate). NOT adopted:
performance figures (kernel index time, <1ms Cypher, 10× token / 2.1×
tool-call preprint figures, 3,400 vs 412,000 tokens); language counts
(badges disagree); release pipeline is the project's own description.
Excluded by the HALEX gate: MCP server, native C binary, SQLite/FTS5,
bundled embedding model, installer writing agent configs, CBM Lens,
live infra parsing.

## deepseek-ai/dsh-superagent-prototype (MIT License, Copyright (c) 2026 DeepSeek Harness Team)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~19:42 EST. LICENSE read verbatim (file SHA
df5ef0e6d9cf2989975742db0a13ad15050ee89b); README read in full (file SHA
39e1c4af122f11dd72ac0d2b34b79d6f8ae259ea); docs/000-philosophy.md (SHA
8422db912fdf93a4c7104ebbb07b834544ff4be8) and docs/007-architecture.md (SHA
184ea543da47267f3f81285e38fb5355dcc3bcdd) read. Repo: 22,740 stars, 2,769
forks, 0 open issues, created 2026-10-31, updated 2026-11-13 (today),
TypeScript, not archived. Self-described research prototype, not an official
DeepSeek product, may contain bugs; some designs in its companion article
are stated as not implemented. Attention-budget operation (act only when
asked or when a written rule allows; speak only when a person must act or
can use a result; one concrete question at a time; stop by impact, not
effort; honest reporting — draft marked unfinished, failure as failure);
proactive work starts in record-only mode; few concepts, few settings,
defaults replace settings, behaviour in words is prompt text; status
surface shows only what needs a person; single-writer engine (one
transaction per command, ports enqueue external work, adapters perform
after commit), assessor decides / executor runs, outbox receipt discipline,
pass loop evaluating due effects, startup resumes interrupted assignments.
NOT adopted: star-growth figures and "fastest-growing" framing from
secondary reports; "much of the engineering done by coding agents" is the
project's own statement, unverified; companion design article not read.
Excluded by the HALEX gate: no provider/API-key code, no GitHub/Feishu
listeners, no MCP servers, no browser automation, no shell execution, no
hosted cloud, no mass pull-request or broadcast volume.

## lawcontinue/opensymphony (MIT License, Copyright (c) 2026 T-Mind Family)
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~19:42 EST. LICENSE read verbatim (file SHA
58508f855e266957e79c2df22475680ddfb256d6); README read in full (5,501 chars;
file SHA 68009254ac6d73693b2399f99e9035763690b709). Repo: 1 star, 1 fork, 2
open issues, created 2026-05-30, updated 2026-07-13, Python, not archived.
STALE: no commits in four months, single-star adoption — no maturity claim
of any kind. Soul as declarative identity (identity, thinking framework,
values, veto conditions) compiled into persistent behavioral constraints;
governance onion (voting with timeout/majority, precedent store of past
decisions, defense layer risk classification safe/risky/dangerous,
human-in-the-loop for high-risk operations); three-tier memory shape (L1
in-memory, L2 experience store with search, L3 long-term — L3 as cloud API
EXCLUDED, local storage only); tool workshop admitted only through the
HALEX gate (tests + mutation check + forbidden-construct scan + seal, no
unattended creation); agent pool with priority scheduler and sandbox
resource limits; dynamic skill registry; intent bridge (natural language
to structured form before execution). NOT adopted: test counts (README
badge 377 passing vs a July article's 395 passing with 6 known failures —
figures disagree, no tests run here); "runs on consumer hardware" /
local-LLM claims unverified. Excluded by the HALEX gate: no provider/API-key
code, no SQLite/FTS5, no vector/embeddings store, no model weights, no
hosted cloud, no unattended tool creation.

## FoundationAgents/OpenManus (MIT License, Copyright (c) 2025 manna_and_poem) — LICENSE VERBATIM UPDATE
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-12 ~19:42 EST. This run re-verified OpenManus with
its LICENSE read verbatim (file SHA
db2216e1a5bfd392213f57a257930e9b2dcca684) and README read in full (9,100
chars; file SHA a2b64c9cc810732131e9144202af7c66526f549e), upgrading the
2026-10-30 entry (repo-page license check only, 58,827 stars). Repo now:
58,963 stars, 10,246 forks, 447 open issues, created 2025-03-06, updated
2026-11-12 (today), Python, not archived. Three execution modes over one
base (single agent, tool agent, multi-agent flow — the multi-agent flow is
labelled unstable in its own README, experimental, never the default);
BaseTool class for precise tool control; specialist agents toggled on in
configuration, disabled by default. NOT adopted: "prototype launched within
3 hours"; star figures as quality; Hugging Face demo not endorsed; sponsor
link (PPIO) not adopted and not rendered — affiliate links are
user-supplied only. Excluded by the HALEX gate: no provider/API-key code,
no MCP servers, no browser automation, no shell execution, no Docker /
server, no hosted cloud.

## angkutdigital/tandem-crm (MIT License, Copyright (c) 2026 Angkut Digital Enterprise) — PATTERNS ONLY
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-13 ~03:42 EST. LICENSE read verbatim (file SHA
d37fc362fdaf931d025ea436585f7833e048c598); README read in full (file SHA
33ba658c553fb9a3ffad93d57db5304d03a3e539). Repo: 2 stars, 0 forks, 0 open
issues, created 2026-09-25, updated 2026-10-21, TypeScript, not archived.
Very new, tiny adoption — no maturity claim of any kind. Append-only typed
event log as the single source of truth with replay-rebuilt state and
rebuildable projections; event payloads snapshot the decision so later
config edits cannot rewrite history; sequence as the durable ordering key,
business timestamp not a sort key; exact retries ignored, conflicting reuse
of an event/source ID an error, unknown event types fail replay; projection
writer validates + appends + updates in one transaction; held / eligible /
approved / paid kept distinct, release only by a trusted scheduled job on
the system's own clock; payout adapter pattern — the ledger never moves
money, it only records that a payout already happened; dispute categories
untracked / incorrect / declined with auto-approve deadline snapshotted at
open, resolving records the outcome only; vendor-neutral auth and payout
adapters, core with zero provider dependency; lifetime commission — one
line per payment, partial refunds reduce proportionally, clawbacks capped
at paid, house account for deactivated partners; isolation verified by
running seeded data, not by reading policy text. NOT adopted: "two audit
passes by a separate AI reviewer" and the live-Stripe end-to-end
verification (the project's own claims, unverified); any
production-readiness or scale claim — the README itself says pre-1.0, not
proven at scale, no outside users yet. Excluded by the HALEX gate: no
payment code (Stripe payout adapter reference implementation is a
record-only pattern here); no Postgres/SQL migrations, no RLS SQL, no
Next.js admin UI, no Docker/server code.

## Referalli/referalli-python (MIT License, Copyright (c) 2026 Referalli) — PATTERNS ONLY
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-13 ~03:42 EST. LICENSE read verbatim (file SHA
c371fbd33cd80b22aaa76c0a3b61ae3865c099bb); README read in full (6,039
chars). Repo: 0 stars, 0 forks, 0 open issues, created 2026-10-23,
updated 2026-11-05, TypeScript/Python, not archived. A thin typed client
for the vendor's hosted API — the SDK is not the system; only its
discipline patterns are taken. Attribution in three steps (link, associate
referral, validated conversion); idempotency keys on all writes, reused
across retries so a retried write is applied once; retries only for
idempotent requests, exponential backoff with jitter, honoring
Retry-After; webhook verification discipline (constant-time signature
check, timestamp tolerance, secret rotation by secret list, events typed
by topic — description only, no signing code in the HALEX engine);
test/live mode assertion so test code can never write live data; one
error class per error code; API version pinning; cursor pagination with
auto-paging iterator. NOT adopted: "attribution-first" marketing framing;
the hosted API, API keys, and any claim about the service itself; the SDKs
are three weeks old with zero stars. Excluded by the HALEX gate: no
provider/API-key/network code in the engine; the verification and
idempotency shapes are descriptions, not code.

## amicalhq/refref (GNU AGPL-3.0) — IDEAS ONLY
Ideas only, restated in our own words; no code copied, no adaptation.
Source: HALEX-AI intel intake run 2026-11-13 ~03:42 EST. LICENSE read
verbatim (file SHA 29ebfa545f5580919a4e884d7014d7a3eb2df762); README read
in full (file SHA db39996b12b89c6e4199ecc5d2512653fd43506e). Repo: 245
stars, 63 forks, 8 open issues, created 2025-02-23, updated 2026-11-13
(today), TypeScript, not archived. README links the canonical org
refrefhq/refref; the repo read here is the same content. Referral
attribution via a tracking snippet; customizable reward rules; separate
referrer and partner portals; fraud monitoring; manual AND automatic
reward approval kept as separate decisions from manual AND automatic
reward dispersal; engagement analytics; a sandbox testing environment.
Self-described alpha ("expect bugs and breaking changes") — no maturity
claim of any kind. NOT adopted: star figures as quality; any feature
claim beyond the README's own list. Excluded by the HALEX gate: AGPL
code or adaptation, OAuth, email, Docker/server, hosted cloud, MCP.

## OpenZeppelin/stellar-contracts (MIT License, Copyright (c) 2024 OpenZeppelin) — PATTERNS ONLY
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-13 ~11:42 EST. LICENSE read verbatim (file SHA
54523a0d8a9fa6e1af23b241d33bd4bece74fdae); README read in full (7,401
chars, file SHA 34b99e07bf749acb8dda3971565ac262bce52ca7). Repo: 97
stars, 75 forks, 39 open issues, created 2024-12-11, updated
2026-11-09, Rust, not archived. RWA module (ERC-3643) in
packages/tokens/src/rwa/: claim_issuer, claim_topics_and_issuers,
compliance, identity_claims, identity_registry_storage, doc_manager.
Patterns taken: compliance as separate attachable modules (identity
claims, claim topics/issuers, compliance rules, document manager);
identity as claims attested by trusted issuers on topics, checked at
transfer time; signature invalidation by nonce with network and issuer
named in the signed message; transfer rules re-evaluated against
identity state at transfer time; never store personal data in a shared
or on-chain record (opaque identifier + verification status only —
the project's own audit flagged plaintext PII on-chain, fixed in PR
#445); versioned re-audit reports as a first-class artifact. NOT
adopted: "battle-tested" framing (the README itself calls the library
experimental); any production-readiness or scale claim; secondary
news figures ($35T transfers, $32B tokenized, Apex $3.5T, T-REX
Ledger Q4 2026 mainnet); RWA Wizard launch claims. Excluded by the
HALEX gate: no smart-contract code, no Rust/Soroban, no wallet/key/
signing/payment code, no PII in shared records.

## smartcontractkit/cre-templates (MIT License, Copyright (c) 2025 SmartContract) — PATTERNS ONLY
Patterns only, restated in our own words; no code copied. Source: HALEX-AI
intel intake run 2026-11-13 ~11:42 EST. LICENSE read verbatim (file SHA
e47c7df565aeecd4158ed490a22acc974aab1060); template README
(starter-templates/tokenized-asset-servicing/README.md) read in full
(22,803 chars, file SHA c6a1663640f4b9e71e42754bddb08cffe98ece4c). Repo:
45 stars, 51 forks, 10 open issues, created 2025-10-01, updated
2026-11-11, JavaScript, not archived. TokenizedAssetPlatform ERC-1155
contract with register/verify/mint/redeem lifecycle; CRE LogTrigger
captures on-chain events, parses and normalizes them, dispatches via
HTTP Ability to AWS Lambda, persists into DynamoDB; bidirectional via
HTTP trigger writing the UID back on-chain. The docs state: "This is a
demo project — Not production-ready". Patterns taken: lifecycle as
explicit named states with one transition and one event each; the
on-chain record as source of truth with the off-chain table a derived,
rebuildable mirror; event-index discipline (name the exact event when
a transaction emits several); off-chain-assigned UID written back
on-chain as metadata; simulation before broadcast (dry run by default,
explicit flag to execute); dual triggers (event log + HTTP) driving
the same lifecycle. NOT adopted: AWS Lambda/DynamoDB, CRE account/SDK,
Sepolia deployment, any CRE production-readiness claim; the README's
private-key-in-.env step (CRE_ETH_PRIVATE_KEY) is a hard exclusion —
never copied, never adapted. Excluded by the HALEX gate: no provider/
API-key/network code in the engine, no hosted cloud, no private-key
handling, no signing, no payment execution.

## rtavytran/rt-commission-dashboard (Proprietary License, Copyright (c) 2025 RealTimeX Team) — IDEAS ONLY
Ideas only, restated in our own words; no code copied, no adaptation.
Source: HALEX-AI intel intake run 2026-11-13 ~11:42 EST. LICENSE read
verbatim (file SHA 26cfaa158ef932f5bde2b2b6d6b33b842d827bfe); README read
in full (5,934 chars). Repo: 0 stars, 0 forks, 0 open issues, created
2026-01-05, updated 2026-02-03, Python, not archived. CORRECTION: the
PyPI page claims MIT; the repo's own LICENSE file is proprietary
("All rights reserved", no distribute/modify/use without explicit
written permission). The registry claim is wrong; the file governs.
Ideas taken, restated: tier rates rising with monthly volume and
recomputed on every sale so a late-month rank-up reprices the whole
month; pay the upline only the gap between tiers, not a flat
override; split a shared sale between introducer and closer while
crediting volume to one side only; a reduced flat rate for inactive
participants instead of zero; keep transaction types distinct (sale
vs commission vs bonus) so totals never mix. NOT adopted: the PyPI
MIT claim; the default admin login accepting any password
("authentication is simplified for Phase 1") — recorded as an
anti-pattern; the project's own tier percentages and 4% inactive
rate are examples only, not HALEX rates. Excluded by the HALEX gate:
proprietary code or adaptation, any payment execution, any provider/
API-key code.

## mkeremcansev/laravel-commission (MIT License, Copyright (c) Mkeremcansev <mkeremcansev@gmail.com>)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-14 ~03:42 EST. LICENSE.md
read verbatim (file SHA 958da6b8e0494275b9ad983fdce1678f4310b323);
composer.json read (file SHA c30d9ee00c9cabd0d1b96afbc40d1732c1889b30),
declares "license": "MIT"; README read in substance. Repo: 62 stars,
1 fork, 0 open issues, created 2024-09-29, updated 2026-02-22, PHP,
not archived. A commission calculation/logging package, NOT a full
affiliate program: no referral links, no payouts, no money movement.
Ideas taken, restated: commission types as rule data (percentage,
fixed, combined); dynamic basis on original price or post-commission
total; min/max amount bounds and a rounding rule on every rule;
history tracking of every calculation; a declared commissionable
surface (only listed columns are commission inputs); a calculate
call returning total commission, total including previous
commissions, total after commissions, and original amount as
separate fields. NOT adopted: the Pest --min=98 coverage target
(author claim, suite not run); any "powerful/robust" marketing
framing. Excluded by the HALEX gate: no Laravel/PHP code, no
payment execution, no provider/API-key code.

## stanfordnlp/dspy (MIT License, Copyright (c) 2023 Stanford Future Data Systems)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-14 ~03:42 EST. LICENSE
read verbatim (file SHA be3f5c0e3fc7e6b0e7c9dddd9db313ab15bfa62b);
README read in full (5,056 chars). The README is thin and defers
to the docs site (dspy.ai), which was NOT read — docs-site content
is unverified for this entry. Repo: Python, pip-installable,
actively maintained. Ideas taken, restated: signatures as typed
input/output contracts; modules as composable declared steps;
optimizers as scored search over prompt/demonstration variants
against a FIXED verifier/metric; reflective evolution (propose
from failure traces, score the same way); assertions as
computational constraints triggering self-refinement on failure;
"programming, not prompting" — the program is the durable
artifact, the wording is a tunable parameter. NOT adopted: any
benchmark, paper result, or efficacy claim (GEPA "outperforms RL"
is a paper title, not a verified fact); docs-site content;
star counts as quality; "most production-ready" framing from a
secondary roundup. Excluded by the HALEX gate: no provider/API-key/
LM code, no weight optimization, no teleprompter runtime, no
network code in the engine.

## hashgraph/asset-tokenization-studio (Apache License, Version 2.0)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-14 ~03:42 EST. LICENSE
read verbatim (file SHA 261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64);
README read in substance (first ~7,000 of 14,859 chars). Repo: 34
stars, 30 forks, 86 open issues, created 2024-04-15, updated
2026-11-13, TypeScript, not archived. Monorepo: Asset Tokenization
Studio (security tokens) + Mass Payout (batch distributions).
Ideas taken, restated: compliance as attachable modules (identity
registry, compliance rules, freeze controls) composing onto a
token; diamond-pattern upgradeability as a facet-registry shape;
identity/eligibility re-checked at transfer time, not frozen at
mint; mass payout as batch discipline (snapshot at record date,
pro-rata shares, retry path, full audit trail); DDD/hexagonal/CQRS
vocabulary with the engine core free of adapters. NOT adopted:
marketing examples ("pay dividends to 50,000 shareholders in one
click", "launch securities in days"); "pre-audited" framing;
custodian integrations (Dfns, Fireblocks, AWS KMS); any
production-readiness or scale claim. Excluded by the HALEX gate:
no smart-contract code, no custodian or key handling, no wallet/
signing, no payment execution, no hosted cloud.

## hexo-ai/sia (MIT License)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-14 ~11:42 EST. LICENSE
read verbatim (file SHA de67384f2e62fe2b3335ec136c39f5a308a8390b);
README read in full. Repo: 2,169 stars, 256 forks, 19 open issues,
created 2026-03-25, updated 2026-11-14, Python, not archived.
Ideas taken, restated: three-role generational improvement
(Meta writes the first version, Target executes and logs every
step as a trajectory, Feedback reads trajectories + metrics and
writes the next version with a written rationale); harness edits
kept separate from weight edits (HALEX-AI takes the harness lever
only); per-generation evaluation against held-out private data
the agent never sees; fixed-verifier Goodhart caution (both
levers on one fixed verifier risk a fragile joint fixed point —
verifier scores are one signal, never the sole decider); runs as
durable artifacts (per-generation code, execution log,
improvement rationale, results). NOT adopted: benchmark figures
(56.6% LawBench gain, 91.9% runtime reduction, 502% scRNA
improvement, 70.1% vs 45% prior SOTA, 14x TriMul speedup, "#1 on
MLE-Bench"); "first self-improving loop" framing. Excluded by the
HALEX gate: no provider/API-key code, no model weights / LoRA /
training, no H100/Modal, no sandbox Docker execution, no
agent-generated code execution, no web dashboard server, no MCP
servers, no hosted cloud.

## wangguode/zhishu-agent (MIT License)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-14 ~11:42 EST. LICENSE
read verbatim (file SHA 8fdc4de2f661e90867b163f660961c57c3bfa1fb);
README read in substance (first ~11,000 chars). Repo: 1 star, 0
forks, 0 open issues, created 2026-11-06, updated 2026-11-13,
Java, not archived. Ideas taken, restated: self-verification
loop (Reason -> Edit -> Run Tests -> Parse Stderr -> Self-Heal;
"done" without a test run is not a completion); PreToolUse /
PostToolUse hooks (block destructive operations, suspend risky
ones for human approval, mask secrets in output); two-tier
/compact (prune oversized tool outputs, then synthesize a
structured checkpoint summary); 3-tier progressive skills
disclosure (list first, load detail on demand); time-decayed
memory (half-life x importance x lexical overlap — decay applies
to what the builder surfaces, never to the ZINIUM chain itself);
parallel subagent orchestration with mandatory reconciliation.
NOT adopted: "85%+ tokens saved" claim, "production grade"
framing, "zero API keys" quick-start framing; no maturity claim
(repo is 8 days old, 1 star). Excluded by the HALEX gate: no
Java/Spring Boot/Electron/Next.js code, no MCP servers, no
provider/API-key code, no live LLM wiring, no Docker, no hosted
cloud.

## AIArmada/referrals (MIT claimed in composer.json only — IDEAS ONLY)
Ideas only, restated in our own words; no code copied, no code
adapted. Source: HALEX-AI intel intake run 2026-11-14 ~11:42 EST.
composer.json read (file SHA
c8984ae5112503ec49b6e88c3f5385a64ef45629), declares "license":
"MIT". NO LICENSE file exists in the repo (LICENSE and LICENSE.md
both not found via the connector) and no README.md at repo root
was retrievable — the MIT claim is therefore UNVERIFIED as a
license file, so this source is ideas-only under the gate. Repo:
0 stars, 0 forks, 0 open issues, created 2026-10-14, updated
2026-11-04, PHP, not archived. Packagist describes it as
"member-get-member referral programs for Laravel applications"
with suggested fulfilment rails aiarmada/affiliates (cash),
aiarmada/rewards (points), aiarmada/vouchers. Ideas taken,
restated: referral program as a program object (links/codes,
attribution stream, conversion records, commission policy);
fulfilment rails kept separate from attribution (cash, points,
vouchers interchangeable on the same attribution record; the
ledger never moves money itself); operator console shape
(partner CRUD, commission-policy editor, attribution
inspection, payout list as books settled by hand, never
auto-payout). NOT adopted: any code, any star/usage claim (none
exist), any affiliate-link or payout automation. Excluded by the
HALEX gate: no Laravel/PHP code, no payment execution, no
affiliate-link auto-insertion (user-supplied links only, labelled).

## pdazcom/laravel-referrals (MIT License, Copyright (c) 2017 Jefferson Ochoa and contributors)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-15 ~03:42 EST.
LICENSE read verbatim (file SHA
a7fc4f44e4e5d13ec149a922f15a14f3ac8df395); README read in full.
Repo: 31 stars, 13 forks, 0 open issues, created 2017-09-24,
updated 2026-08-15, PHP, not archived. Multi-program referral
system: several programs may attribute the same user; active
referral IDs stored in a cookie as a JSON object {ref_id:
expires_timestamp}, expired links pruned automatically; every
link carries a legacy UUID code plus a human-friendly
referral_code (uppercase alphanumeric, ambiguous characters
0/O/I/1 avoided, uniqueness retried up to 10 times); event-driven
(UserReferred creates relationships, ReferralCase triggers the
program handler); program registry maps program name to handler
class; anti-abuse flags prevent_duplicate_rewards (one payout per
relationship, stamped in a transaction) and prevent_self_referral;
reward hooks opt-in and off by default. Patterns taken, restated:
program as a named object with lifetime; multi-program
attribution with per-program expiry; hand-enterable codes with
the same attribution result as clicked links; one-payout-per-
relationship and self-referral guards as explicit flags. NOT
adopted: any code, any "verified against Laravel 11/12/13" claim
(the project's own claim; its tests were not run by us).
Excluded by the HALEX gate: no Laravel/PHP code, no payment
execution, no affiliate-link auto-insertion (user-supplied links
only, labelled).

## KKKKhazix/agent-autoloop (MIT License, Copyright (c) 2026 数字生命卡兹克)
Patterns only, restated in our own words; no code copied.
Source: HALEX-AI intel intake run 2026-11-15 ~03:42 EST.
LICENSE read verbatim (file SHA
2d848c9f3fed5317d59e0b88cafa289b42a29d2d); README read in full
(269 lines, Chinese-primary). Repo: 5,404 stars, 991 forks, 5
open issues, created 2026-11-03, updated 2026-11-15,
TypeScript, not archived. Self-hosted hub that starts CLI coding
agents from cron, GitHub issues, or HTTP events and asks a human
only on decisions. Patterns taken, restated: suspend-zero-cost
waiting (process exits while awaiting a human, state durable,
exact session resumes, never redone); event sourcing (append-only
log, one-command provenance per round, bad config never stops the
loop — last good config keeps running and the fault is reported);
instruction/data separation (external text as reference files,
never spliced into prompts; only validated identifiers enter a
prompt; event-supplied cwd/agent/access rejected); hop-count
circuit breaker (re-trigger count only grows, past 8 hops the
event is logged only and a human is told); four-direction plugin
system (event sources, agents, channels, delivery); declarative
rules with dry-run validation and per-rule pause/resume/replay.
NOT adopted: any code, any performance figures (the project's own
measurements on its own hardware), "real-world verified" plugin
claims (the README itself says several plugins were verified only
against local simulations), star counts as quality (5,404 stars in
12 days is velocity, not maturity), the install-via-curl-pipe
pattern. Excluded by the HALEX gate: no unattended agent execution
with local permissions, no webhook listeners, no notification
channels, no third-party CLI agents, no install scripts, no
SQLite/FTS5 in the engine, no MCP servers, no hosted cloud.

## karpathy/autoresearch (MIT claimed in README only — IDEAS ONLY)
Ideas only, restated in our own words; no code copied, no code
adapted. Source: HALEX-AI intel intake run 2026-11-15 ~03:42 EST.
README read in full; the README's license section says only
"MIT" and NO LICENSE file exists in the repo (LICENSE and
LICENSE.md both not found via the connector; a code search for
"MIT License" returns only the README line itself) — the MIT claim
is therefore UNVERIFIED as a license file, so this source is
ideas-only under the gate, same rule as AIArmada (2026-11-14).
Repo: 100,065 stars, 13,776 forks, 196 open issues, created
2026-03-06, updated 2026-11-15, Python, not archived. Autonomous
research loop over a single-GPU training setup: the agent modifies
exactly one file (train.py), prepare.py is never modified,
program.md is edited by the human only; fixed 5-minute budget per
experiment; single metric val_bpb (lower is better); keep-or-
discard per experiment. Ideas taken, restated: single-file-to-
modify discipline (the builder touches only the proposal module,
never the evaluator, gate, seal, or instructions); fixed time
budget per attempt and a single pass/fail metric so attempts are
comparable. NOT adopted: any code, any "12 experiments/hour,
~100 overnight" figures (assumes an H100; not verified), the
"10,205th generation" framing (the author's joke), any GPU /
training / PyTorch content. Excluded by the HALEX gate: no model
weights, no training runs, no agent-run training loops.

## solana-foundation/dvp (MIT)
Atomic two-leg settlement shape, pattern only. Source: HALEX-AI
intel intake run 2026-11-15 ~11:42 EST. LICENSE read verbatim
(MIT, Copyright (c) 2026 Solana Foundation, file SHA
e8ab506656f2c2ae16e597b83df3fcb7ba18f3e0); README read in full.
Repo: 8 stars, 8 forks, 10 open issues, created 2026-06-09,
updated 2026-11-06, Rust, not archived. A canonical minimal
on-chain program for atomic delivery-versus-payment swaps on
Solana: two escrow legs funded by plain SPL transfers, one named
settlement authority as the only settler, either party may
reclaim/cancel before settlement, expiry capped at one year,
single-use nonce tombstones, verify-stored-terms-before-funding
(terms are not bound by the PDA address), settle clamps to the
agreed amount and refunds over-deposit. Ideas taken, restated:
the settlement-shape vocabulary for HALEX-AI's RWA knowledge
only. NOT adopted: any program code, any on-chain deployment or
settlement execution, any wallet/signing/custody code, the
"ready for use with real funds" framing (Cantina audit linked,
not read by us; the repo's declare_id is a placeholder the
README says has not been deployed), the Foundation's comparison
figures (2 days vs under one second, $50-500 vs under $0.01),
any settlement volume or named design partner (none on the
public record), any J.P. Morgan adoption (input only, explicitly
not design/endorsement). Excluded by the HALEX gate: no Rust
program code, no live execution, no wallet/signing/payment code.

## pi-infected/tokenade (MIT OR Apache-2.0)
Context-compaction discipline, pattern only. Source: HALEX-AI
intel intake run 2026-11-15 ~11:42 EST. LICENSE-MIT read
verbatim (MIT, Copyright (c) 2026 Paul Irolla, file SHA
b4eda81a4af86f267d394ed33723d72e278b4bd8) and LICENSE-APACHE
read verbatim (Apache-2.0, file SHA
137069b823873b8bcf42979bcf8e9371052d26a2); NO single LICENSE
file exists in the repo (LICENSE / LICENSE.md both not found).
README read in full. Repo: 47 stars, 8 forks, 0 open issues,
created 2026-10-18, updated 2026-11-14, Rust, not archived. A
single local Rust binary between a coding agent and the model:
folds noisy command output to failures/numbers/decisive lines,
returns already-seen content as a short reference or a diff,
looks code up by symbol/skeleton instead of whole-file reads,
every fold carries a hash and the exact bytes are recoverable
on demand, secrets scrubbed from logs/caches/folds. Ideas
taken, restated: a compaction discipline for HALEX-AI's own
builder-loop working notes and cycle reports only. NOT adopted:
any Rust code, any llm-proxy, any model download, any npm/cargo
install step, any MCP wrapping, the "39% cheaper / #1 on THOL"
claim (author's own benchmark, not independently verified).
Excluded by the HALEX gate: no network / provider / API-key
code, no third-party agent wiring, no hosted services.

## Leeroo-AI/kapso (MIT)
Branch-per-experiment lessons with credence + boundary, pattern
only. Source: HALEX-AI intel intake run 2026-11-15 ~11:42 EST.
LICENSE read verbatim (MIT, Copyright (c) 2025 Kapso, file SHA
d31ae979c3631338b84364c8c0561913d7600a3c). README read in full.
Repo: 222 stars, 32 forks, 11 open issues, created 2025-12-07,
updated 2026-11-15, Python, not archived. An engine that runs
a tree of experiments (each hypothesis on its own git branch,
scored), deploys the best solution, and learns from every run
into a bank of lessons, each carrying a body, a boundary on
where it applies, a credence score, and its evidence. Ideas
taken, restated: the experiment + credence-lesson shape for
HALEX-AI's self-build loop (proposals on branches, seal log as
the untouchable evaluator, ZINIUM lesson drafts gain a credence
+ boundary field). NOT adopted: any Python code, any PyPI
package, any Claude Code / Codex CLI dependency, any hosted
lesson bank, any MCP lesson queries, any benchmark claims
(RelBench first, IOAI 536.07, MLE-Bench #1 open-source,
ALE-Bench 1909 Elo — Leeroo's own reports). Excluded by the
HALEX gate: no third-party CLI agents, no network / API-key
code, no hosted cloud.

## garyqlin/gbase (MIT)
Recursive self-improvement guardrail shape, pattern only.
Source: HALEX-AI intel intake run 2026-11-15 ~19:42 EST.
LICENSE read verbatim (MIT, Copyright (c) 2026 Gary Lin (Lin
Qian), file SHA 482bfa7f57350011727a454170090faf19887113).
README read in full. Repo: 115 stars, 3 forks, 1 open issue,
created 2026-05-25, updated 2026-10-13, Python, not archived. A
recursive self-improvement agent framework: Mirror Memory
(long-term memory with active recall, Ebbinghaus forgetting
curve), RSI engine (stability audit, performance evaluation,
rollback decision, automatic recovery), Experience Engine
(distill interactions into structured patterns, not raw logs),
Quality Gates (build/audit/judge pipelines), Lifeline (git
pre-snapshots before code modification). Ideas taken, restated:
Ebbinghaus-style credence decay, build/audit/judge gate shape,
pre-mutation snapshot/rollback, experience distillation. NOT
adopted: any Python code, any LLM/API-key/provider code, any
web-search tool code, any unattended self-modification, any
"100 RSI cycles / 9 failed security evaluation" or "in
production" claims (author's own report, not independently
verified), GBase World metaverse claims. Excluded by the HALEX
gate: no network / provider / API-key code, no third-party
agent wiring.

## mocodainteractive-pixel/agent-sleep (MIT)
Sleep-cycle memory lifecycle, pattern only. Source: HALEX-AI
intel intake run 2026-11-15 ~19:42 EST. LICENSE read verbatim
(MIT, Copyright (c) 2026 Mocoda, file SHA
93fe3cf56379c5bc0480ae76340a2695dca2ae60). README read in full.
Repo: 8 stars, 0 forks, 1 open issue, created 2026-10-29,
updated 2026-11-04, Shell, not archived. Sleep-cycle memory
management for coding agents: consolidate (session end, verify
against raw source), check (daily cron: TTL, pointers,
fixtures, read-only), reconcile (dedupe/prune on contradiction),
prestudy, rebuild, rollback; every write a git commit; charter
pinned outside write scope; plain bash/git/curl. Ideas taken,
restated: the consolidate/check/reconcile/rebuild/rollback
lifecycle for HALEX-AI's intake + builder loop, with the gate
list pinned outside write scope. NOT adopted: any bash scripts,
any install-trigger wiring, any third-party CLI agent adapters,
the arXiv-cited percentages in the README defense table
(secondary citations, not verified by us), "same system our own
agents run every day" (vendor claim). Excluded by the HALEX
gate: no network / API-key code, no cron daemon dependency.

## okf-memory/okf-agent-memory (MIT)
Dual-memory push/pull architecture, pattern only. Source:
HALEX-AI intel intake run 2026-11-15 ~19:42 EST. LICENSE read
verbatim (MIT, Copyright (c) 2026 sknr and the OKF Memory
Contributors, file SHA
e789485f3da41fd23cf6e77c897d6031a3055449). README read in full.
Repo: 865 stars, 72 forks, 2 open issues, created 2026-09-05,
updated 2026-11-15, Go, default branch develop, not archived.
Git-native persistent project memory implementing Google OKF
v0.2: Dual-Memory Agent Architecture (capped 400-token push
codex + zero-token-baseline pull bundle), Agent Action Grammar
micro-syntax, Markdown+YAML with provenance/trust tiers/
lifecycle metadata (status, stale_after), progressive
disclosure, search-before-write, code_refs governance, BM25
search, pure Go zero dependencies, MCP server, validate
--scorecard / --min-score 80 gate. Ideas taken, restated: the
push/pull memory split, search-before-write, stale_after
lifecycle metadata, a quality-floor scorecard before drain.
NOT adopted: any Go code, any MCP server, any hub sync /
registry pull, any vendor bundles, the performance figures
(<300µs search, ~4ms validation, 78–85% token savings —
author's own benchmarks, not independently verified), star
counts as quality. Excluded by the HALEX gate: no network /
wallet / signing / payment / API-key code, no external
database.

## Ciprian-LocalPulse/tokenpropulsion (MIT)
Auditable prompt-compression discipline, pattern only. Source:
HALEX-AI intel intake run 2026-11-16 ~03:42 EST. LICENSE read
verbatim (MIT, Copyright (c) 2026 Ciprian Ștefan Pleșca, file SHA
378b86d5e3c463f35244121f22a4db8936723c6b). README read in full.
Repo: 1 star, 0 forks, 7 open issues, created 2026-10-17,
updated 2026-10-18, Python, default branch main, not archived.
Research alpha, not production ready, no live xAI study. Ideas
taken, restated: explicit task contract before any pack
transform, conservative fallback that never drops instructions
or protected content, restore() round-trip check before a
transform lands, honest token-count labels (provider-exact /
verified-compatible local / heuristic / unspecified), protected
content never deduplicated. NOT adopted: any Python code, any
xAI/REST/tokenizer/embedding integration, the 29.557% synthetic
reduction and 2.450 ms overhead figures (author's own synthetic
dataset, 30 cases, cl100k_base), any Grok billing savings or
output-quality equivalence, star counts as quality. Excluded by
the HALEX gate: no network/wallet/signing/payment/API-key code.

## marcelcluj-bit/GeoDigital-Global-project (MIT)
RWA checklist extension, pattern only. Source: HALEX-AI intel
intake run 2026-11-16 ~03:42 EST. LICENSE read verbatim (MIT,
Copyright (c) 2026 Marcelcluj, file SHA
f5780d7236b999b732f0827b7770f1b0b107b61f). README read in full;
working code behind the modules was NOT audited by this run.
Repo: 1 star, 0 forks, 0 open issues, created 2026-10-20,
updated 2026-10-26, Python, default branch main, not archived.
Release v1.0.0-pioneer. Ideas taken, restated:
per-jurisdiction compliance-template checklist shape (Eurocode 7
/ NP 074, JORC, NI 43-101, EIA, Natura 2000 as named standards,
each marked verified/claimed/untested, never a compliance
verdict); fee and royalty schedules (2% protocol fee, 1%
academic royalty) as data-only registry entries, never
executed. NOT adopted: any smart-contract, Gemini API,
PostGIS/GEE code; the "over 70% faster pre-feasibility" claim;
sovereign settlement, fractional mining rights, or $GEO token
economics as working; any production or compliance status; star
counts as quality. Excluded by the HALEX gate: no
network/wallet/signing/payment/API-key code, no settlement or
custody code.

## linshenkx/prompt-optimizer (AGPL-3.0 — ideas only)
Prompt-asset refine loop, ideas restated in our own words only.
Source: HALEX-AI intel intake run 2026-11-16 ~03:42 EST.
LICENSE read verbatim (AGPL-3.0 only, Copyright (C) 2025
linshenkx, file SHA fd2472b22844ae105ab3448d689433d6217dc7eb).
README read in part (introduction + feature demos). Correction:
a secondary index reported this repo's license as unidentified;
the LICENSE file governs — AGPL-3.0, not permissive for HALEX
purposes. Ideas taken, restated: draft → fixed-case test →
quality-floor evaluation → save-on-pass loop for builder
prompts and skill drafts; reusable prompt templates with
swappable variables; the hard-nosed reviewer shape (an audit
that surfaces weak assumptions and evidence gaps instead of
agreeing). NOT adopted: any code, any MCP server, any Chrome
extension, any Docker/Vercel/Cloudflare deployment, any hosted
service, any star/user/pull/efficacy figure (the secondary
~41.3K star figure is unverified by us). Excluded by the HALEX
gate: no network/wallet/signing/payment/API-key code.

## google-research/harness2 (Apache License 2.0)
Recursive harness improvement patterns, restated in our own
words only. Source: HALEX-AI intel intake run 2026-11-16
~11:42 EST. LICENSE read verbatim (Apache License Version 2.0,
January 2004, file SHA
d645695673349e3947e8e5ae42332d0ac3164cd7). README read in full
(file SHA a5e91206948cd3d5bbed30c2a951923020e780d2). Repo:
24,095 stars, 2,423 forks, created 2026-10-06, updated
2026-11-16. Patterns taken: Propose-Probe-Compose task-level
recursion (propose edits, probe effects on the same task,
compose from behavioral contrasts, no ground truth needed);
harnessing-level recursion (persistent improvement harness
updated with adopted harnesses and evidence-supported lessons);
the eight editable harness components (system prompt,
guardrails, memory, tool guidance, subagents, skills, scripts,
plugins) as a review checklist. NOT adopted: benchmark figures
(11.5 / 4.5 / 11.8 gains; GLM-5 75.7 vs Gemini 3.5 Flash 72.4),
star counts as quality, any code, OpenCode/Codex executors,
Docker/Vertex/API-key setup, benchmark harnesses. Research
code; "not an officially supported Google product". Excluded
by the HALEX gate: no network/wallet/signing/payment/API-key
code, no unattended execution, no Docker, no model weights.

## NousResearch/hermes-agent (MIT License, Copyright (c) 2025 Nous Research)
Closed learning loop patterns, restated in our own words only.
Source: HALEX-AI intel intake run 2026-11-16 ~11:42 EST.
LICENSE read verbatim (MIT License, Copyright (c) 2025 Nous
Research, file SHA 75410e73319c72cd3e991a501c5455eb78f38375).
README read in full (file SHA
830be257308736e48f25ac4f2d097888b3a63a2c). Repo: 263,837 stars,
59,492 forks, created 2025-07-22, updated 2026-11-16.
Patterns taken: agent-curated memory with periodic nudges
(maps to the intake cadence, not unattended execution);
autonomous skill creation after complex tasks, with every
improvement passing the existing gate before it lands; skills
self-improving during use; FTS5 session search shape as a
recall pattern (no FTS5/SQLite in the engine);
agentskills.io-compatible skill record shape (name, purpose,
steps, checks). NOT adopted: "only agent with a built-in
learning loop" claim; the two September 2026 CVE records as
reported by a secondary source (unverified by us); star counts
as quality; any code; the curl-piped install script; terminal
backends (Docker/SSH/Modal/Daytona/Vercel Sandbox);
provider/API-key integration; chat gateways; unattended cron
automations. Excluded by the HALEX gate: no
network/wallet/signing/payment/API-key code, no unattended
agent execution with local permissions, no shell execution.

## MaximeRobeyns/self_improving_coding_agent (MIT License, Copyright (c) 2025 Maxime Robeyns)
Benchmark-archive-improve cycle pattern, restated in our own
words only. Source: HALEX-AI intel intake run 2026-11-16
~11:42 EST. LICENSE read verbatim (MIT License, Copyright (c)
2025 Maxime Robeyns, file SHA
7fa5a08f3ef39cc3f428da46e330e1f542a88c40). README read in full
(file SHA 9ec4c4db2e7969d4bfbe09173aa8c1ad048c37e3). Repo: 423
stars, 71 forks, created 2025-04-11, updated 2026-11-16.
Pattern taken: evaluate on benchmark tasks, archive the
results, work on the codebase, re-benchmark on the same set —
the results archive is the evidence base and run variance is
recorded, not smoothed over. NOT adopted: any benchmark or
improvement figures (none published in the README); any code;
shell execution; Docker; API keys; provider integrations;
SWE-bench; the interactive web visualizer. Excluded by the
HALEX gate: no network/wallet/signing/payment/API-key code, no
shell execution, no Docker, no model weights or training.

## Quillhash/Real-World-Assets-RWA (MIT License, Copyright (c) 2026 QuillAudits)
RWA categorization framework, token-standard picker discipline,
handbook structure (ecosystem landscape, regulations mapping,
system design), audit methodology with fuzz testing, and incident
database as a learning record — patterns restated in our own words
only. Source: HALEX-AI intel intake run 2026-11-16 ~19:42 EST.
LICENSE read verbatim (MIT License, Copyright (c) 2026 QuillAudits,
file SHA ff3dfd8fadf6d719cad4fb959293e81e2d3f7919). README read in
full (file SHA 1e92d4aae1e945696885f3f1b5b586c5ff686093). Repo: 99
stars, 24 forks, created 2024-04-01, updated 2026-11-08. NOT
adopted: the Foundry reference implementation (Solidity), Chainlink
oracle integration, any custody/settlement/redemption code, the
handbook's platform architecture claims as verified fact, any
yield/market-size/adoption figures. Excluded by the HALEX gate: no
network/wallet/signing/payment/API-key code, no smart contracts.

## RefRef — amicalhq/refref (GNU Affero General Public License v3 — IDEAS ONLY)
Sandbox-paired-with-live referral projects, approval and dispersal
as separate gates, fraud monitoring, referrer vs partner portals,
and nudges — ideas restated in our own words only; AGPL-3.0 is
copyleft, not permissive, so no code and no adaptation. Source:
HALEX-AI intel intake run 2026-11-16 ~19:42 EST. LICENSE read
verbatim (AGPL-3.0, file SHA 29ebfa545f5580919a4e884d7014d7a3eb2df762,
identical in refrefhq/refref and amicalhq/refref). README read in
full from refrefhq/refref (file SHA
db39996b12b89c6e4199ecc5d2512653fd43506e). Canonical repo
amicalhq/refref: 247 stars, 65 forks, created 2025-02-23, updated
2026-11-16. README carries an explicit alpha warning ("still in
alpha, expect bugs and breaking changes"). NOT adopted: any code
(Next.js, Postgres, Drizzle, Better Auth, Google OAuth, Resend),
the JS tracking snippet, Docker setup, any hosted-service claims,
the "launch in minutes" pitch. Excluded by the HALEX gate: no
network/wallet/signing/payment/API-key code, no auth code.

## Refferq/Refferq (MIT License, Copyright (c) 2025 Refferq)
Lead status workflow (Pending/Approved/Rejected), commission rules
as data (percentage or fixed, per partner group), payout scheduling
as a named term (NET-15, NET-30), partner groups, and
affiliate-visible earnings breakdown — patterns restated in our own
words only. Source: HALEX-AI intel intake run 2026-11-16 ~19:42
EST. LICENSE read verbatim (MIT License, Copyright (c) 2025
Refferq, file SHA 11b3911d4b112e7a28a60ca061f59a2513d4f7d1). README
read in full (file SHA 40493937ce77e0a05666c5168431a0d02f050705).
Repo: 142 stars, 105 forks, created 2025-10-10, updated
2026-11-15. NOT adopted: any code (Next.js, Prisma, JWT/bcrypt/OTP,
Resend, Tailwind, Recharts), payout execution (PayPal, bank
transfer, Stripe, Wise), email automation, white-label/subdomain
machinery, any revenue/conversion/performance figures. Excluded by
the HALEX gate: no network/wallet/signing/payment/API-key code, no
payment code, no auth code.

## Make0 Brain — make0-official/brain-oss (MIT License, Copyright (c) 2026 Make0)
Local-first shared memory server for coding agents: one SQLite file, versioned memories with writer attribution, newer-wins contradiction resolution, session/Obsidian import, Markdown export — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 Make0). README read in full (file SHA b412146586e5046e94a17293f2f710d0c769dac9). Repo: 15 stars, 1 fork, created 2026-10-27, updated 2026-11-13. NOT adopted: any code (no MCP server, no SQLite store, no model download, no API-key/local-model wiring, no viewer, no session importer), any SWE-ContextBench/LongMemEval figures, the "gpt-6-luna" default model name as a fact. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## mem0 — mem0ai/mem0 (Apache License 2.0)
ADD-only memory extraction, entity linking, multi-signal retrieval (semantic + BM25 + entity), temporal reasoning, multi-level memory (User/Session/Agent) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~03:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA d20d5102c3cf97ecbee54afd65893de4a11d26fe). README read in full (file SHA c9ed6dbfbe14a2fe60b8f3761a083786157a6987). Repo: 69,093 stars, 8,224 forks, created 2023-06-20, updated 2026-11-17. NOT adopted: any code (no Python library, no Docker stack, no LLM/embedding provider integration, no API keys, no hosted platform, no CLI, no agent-signup flow), any LoCoMo/LongMemEval/BEAM benchmark figure (the README itself says they reflect the managed platform with proprietary optimizations not in the OSS SDK). Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## PLUR — plur-ai/plur (Apache License 2.0)
Plain-text YAML engrams with scope/polarity/confidence/provenance, ACT-R activation decay, feedback-trained injection, episodes timeline, outbox for unreachable team stores, counted memory receipt with no dollar/token figures, git-based sync with personal/shared remotes — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~03:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA a060433ccbdef7734d3e7938699e10e8b3eac14e). README read in full (file SHA 76189f67acb6953a78b90874f6be9332a58b4dcd). Repo: 318 stars, 40 forks, 616 open issues, created 2026-03-19, updated 2026-11-16. NOT adopted: any code (no TypeScript engine, no MCP tools, no embedding model download, no git-sync code, no Postgres/pglite tier), any benchmark figure (97.6% R@5, "Haiku + PLUR beats Opus", 60.5% answer accuracy) — the project's own, harness published, not verified by us. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## TencentDB Agent Memory — TencentCloud/TencentDB-Agent-Memory (MIT License, Copyright (C) 2026 Tencent)
Four-layer memory distillation (L0 raw conversation, L1 atoms, L2 scenarios, L3 persona), four memory assets (Chat Memory, Skill, Wiki, CodeGraph), Memory Hub governance (ownership, versions, status, visibility private/team/restricted/agent, Fixed Binding + ACL, global System Admin and team Admin/Member roles), agent loadouts, cold-start save-file import, layered retrieval (L2/L3 bootstrap, BM25 + vector + RRF fallback to L1/L0, capped by item count, character budget, timeout) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~11:42 EST. LICENSE read verbatim (MIT License, Copyright (C) 2026 Tencent, file SHA 86fd8a122221fc402da9fd64724172d08c6bbbd3). README read in full (file SHA 7ec506d69c0008cd97efe4ca125b0bdd25605fc7, 24,139 chars). Repo: 30,967 stars, 3,030 forks, 856 open issues, created 2026-04-07, updated 2026-11-17. NOT adopted: any code (no TypeScript/Node services, no Memory Core/Hub/Proxy servers, no Docker deployment, no SQLite/sqlite-vec store, no LLM provider or API-key wiring, no OpenClaw/Hermes/Claude Code adapters, no npm packages, no hosted backend), the PersonaMem 48% -> 76% benchmark row (single-row, vendor-produced), secondary-report figures (61.38% token reduction, 51.52% pass-rate improvement), any hosted-service claim. CORRECTION: a secondary review claimed no recognised licence (NOASSERTION metadata); the LICENSE file itself is MIT and governs. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Numok — dfg-ar/numok (MIT License, Copyright (c) 2025 dfgonzalez)
Stripe webhook attribution triggers (checkout.session.completed, payment_intent.succeeded, invoice.paid) as the event vocabulary for referral attribution, admin/partner table separation, and default-credential rotation discipline — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~11:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2025 dfgonzalez, file SHA 7ee19828971e27a01c3fd7648ceee759d8fe9335). readme.md read in full (file SHA 5088bf6ba9f5f9d3e285bdc70bda5aac33ee22e0, 4,897 chars). Repo: 60 stars, 17 forks, 2 open issues, created 2025-01-14, updated 2026-11-09. NOT adopted: any code (no PHP/MySQL code, no Stripe keys, webhook secrets, or handlers, no payment execution, no Docker setup, no dashboards), any commission-type list or "launch in minutes" / "unlimited affiliates" claims (secondary sources only; the readme is install/config only), any feature surface beyond the webhook events and admin/partner split. Note: the readme's clone URL names github.com/numok/numok.git while the canonical repo is dfg-ar/numok. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Open Tokenized Asset Standard whitepaper — OpenTokenizedAssetStandard/whitepaper (CC BY 4.0)
Composable token primitives as a convergence layer for post-trade clearing, settlement, and compliance across heterogeneous ledgers; a thin protocol-agnostic interface layer standardizing shared functions at the seams (settlement, identity, compliance, asset metadata) rather than internal representation or a new ledger; primitive/behavior/event model; draft v0.2, open questions drive revisions — framing restated in our own words only, with attribution. Source: HALEX-AI intel intake run 2026-11-17 ~11:42 EST. LICENSE.md read verbatim (CC BY 4.0, file SHA 39bb71fec03e07f01759f77f0f4c09e8c99b07ab). README read in full (file SHA c50a71e8ed6cc41579f9c3d178e4e7c42b86c67a, 3,198 chars). Repo: 6 stars, 3 forks, 1 open issue, created 2026-07-16, updated 2026-10-08. NOT adopted: any whitepaper body text beyond short attributed framing (whitepaper.md, 56,951 chars, not read by this run), any production-readiness or adoption claim (the README calls it a draft for review, subject to change, not legal/regulatory/financial advice), any smart-contract or settlement code (none in this repo). Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code; the standard is cited as a draft, never as a settled fact.

## OpenPartner — getcoherence/openpartner (MIT License, Copyright (c) 2026 OpenPartner contributors)
Event-sourced partner attribution (raw clicks/identities/events immutable, attribution a derived re-derivable view), four attribution models (last-click, first-click, linear, position) per campaign, first-party cookie + server-side identity stitching with late-binding backlog attribution and a configurable conversion window, commission accrual + approve/reverse review queue + idempotent payouts, two-tier recruit commissions, product-scoped commission rules, click velocity limits + fraud-review queue that replays skipped attributions, outbound webhooks with HMAC-SHA256 signing and per-event redelivery, audit log in the same transaction as the change, scoped API keys, OpenAPI spec generated from validators with a drift-failing test, portable JSON + CSV + SQL export that round-trips, first-run install wizard, admin personas with magic-link signin and last-active-admin guard, two-step sign-in with recovery codes — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~19:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 OpenPartner contributors, file SHA c0c287a435777b8c395e3d7891763096a7af236f). README read in full (file SHA 67919668c1e94ba84cb5abf9080a2ea21035ac90). Repo: 14 stars, 11 forks, 9 open issues, created 2026-04-23, updated 2026-11-12. NOT adopted: any code (no TypeScript/Express/Hono/Vite+React/Knex/Postgres, no Docker, no Stripe Connect payout execution, no SMTP/Postmark transport, no SDK npm package), any pricing/fee figure as fact, the hosted Network marketplace (private repo), the "open alternative to Dub/Rewardful/Impact" positioning claim. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Raider — valeriansaliou/raider (Mozilla Public License 2.0)
Self-service affiliate dashboard shape (affiliates generate tracking codes, view balance and statistics, request payouts; operator backend reports referred payments through a token-guarded reporting API with separate track and management tokens), default-secret rotation as an obligation (secret key, track token, management token, password salt must be replaced before use) — patterns restated in our own words only. MPL 2.0 is weak copyleft and NOT in the HALEX permissive list (MIT/Apache/BSD): ideas only, no code adapted. Source: HALEX-AI intel intake run 2026-11-17 ~19:42 EST. LICENSE.md read verbatim (Mozilla Public License 2.0, file SHA 8d80a21064fce4a6f76702740d69567439828dd1). README read in full (file SHA 5506e45e4eab3f903ea6e0dde0864e1707cf6f4d). Repo: 254 stars, 41 forks, 5 open issues, created 2018-01-09, updated 2026-11-09. NOT adopted: any code (no Rust/Rocket/Diesel/MySQL, no Tera templates, no Docker image, no Fixer exchange API-key wiring), the 2021 rustc test note as a current claim, Crisp usage as an endorsement, any payout execution or email automation. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## OTAS Cross-Rail DvP — OpenTokenizedAssetStandard/cross-rail-dvp (Apache License 2.0)
Conformance-first discipline (vectors define conformance: same fixture, same reason code on every rail; one adapter per new rail), reason-code registry (coarse, additive codes, linted for unique names/numbers and additivity), canonical event envelope with finality model and moment declared per event, settlement lifecycle Proposed -> Committed -> Settled | Aborted with per-leg finality, capability manifest distinguishing chain-observed from issuer-declared behaviour, one small verifier per seam plus a reconcile step for any event log — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-17 ~19:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA 16fe87b06e802f094b3fbb0894b137bca2b16ef1). README read in full (file SHA 11b454ad64260b77d70fd1e5b9635efbb0a7a2e6). Repo: 0 stars, 1 fork, 0 open issues, created 2026-10-19, updated 2026-10-26. NOT adopted: any code (no Python verifier tools, no Solidity/Forge contracts, no Sui Move PAS code, no smart-contract or settlement code), the "live on Sepolia x Sui testnet" description as verified, any production-readiness or adoption claim — the repo itself says experimental, unaudited, test networks only. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Hermes Agent — NousResearch/hermes-agent (MIT License, Copyright (c) 2025 Nous Research)
Closed learning loop (execute, evaluate, extract, retrieve): skills created from experience after complex tasks and self-improved during use, agent-curated memory with periodic nudges, FTS5 session search with LLM summarization for cross-session recall, Honcho dialectic user modeling, SKILL.md procedural memory compatible with the agentskills.io open standard, built-in cron scheduler, isolated subagents for parallel workstreams, provider-agnostic model switching, imports from OpenClaw/Claude Code/Codex/Cursor — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2025 Nous Research, file SHA 75410e73319c72cd3e991a501c5455eb78f38375). README read in full (file SHA 830be257308736e48f25ac4f2d097888b3a63a2c, 17,496 chars). Repo: 264,327 stars, 59,647 forks, 53,637 open issues, created 2025-07-22, pushed 2026-11-18. NOT adopted: any code (no Python/Node agent, gateway, cron scheduler, terminal backends, TUI), any LLM provider wiring or API-key collection, the "only agent with a built-in learning loop" claim, the February-2026 release and 242k-star secondary claims. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## SIA — hexo-ai/sia (MIT License, Copyright (c) 2025 Hexo)
Three-agent self-improvement generations (Meta-Agent writes the Target Agent, Target Agent attempts the task and logs everything, Feedback Agent rewrites the Target for the next generation), per-generation scoring against held-out ground truth fed into the next generation's feedback prompt, public/private task split (evaluation data never exposed to the agent), improvement rationale as a per-generation artifact, provider/profile separation (JSON profiles bundle agent implementation + model + provider per role), generation dashboard (code, prompts, plans, scores, trajectories, logs), sandbox-by-default discipline for generated code — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2025 Hexo, file SHA de67384f2e62fe2b3335ec136c39f5a308a8390b). README read in full (file SHA f592224077290981d5cee7237ef3502af17bd8f0, 13,760 chars). Repo: 2,170 stars, 256 forks, 19 open issues, created 2026-03-25, pushed 2026-08-26. NOT adopted: any code (no Python orchestrator, evaluator, or dashboard), any benchmark figure as fact (paper claims only), any weight updates or model training, any execution of agent-generated code. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Ankara Chain — ankarachain/ankara-core (MIT License, Copyright (c) 2026 Cranebolt Technologies)
RWA factory discipline (one factory per asset shape: token, NFT, multi-token, escrow, ramp settlement; plus manual oracle and collateral vault), OpenZeppelin UUPS upgradeable contracts, monorepo with per-package commands (contracts-evm, contracts-stellar, sdk, cli, mcp, web), MCP server as an AI-assisted deployment surface alongside SDK and CLI, contract-address disclosure with deployer and date — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 Cranebolt Technologies, file SHA f04a021717d3919b876c3b1006a145cb7139e931). README read in full (file SHA c1bf1454ba8913f1cdd1b39ed2d3161980a016a4, 2,700 chars). Repo: 0 stars, 0 forks, 1 open issue, created 2026-04-11, pushed 2026-11-12. NOT adopted: any code (no Solidity/Soroban contracts, no TypeScript SDK, no CLI, no MCP server), any smart-contract or settlement code, the Stellar testnet deployment addresses as verified fact, any EVM deployment claim (README says Amoy is a future item). Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## OpenClaw — openclaw/openclaw (MIT License, Copyright (c) 2026 OpenClaw Foundation)
Gateway as local control plane (one long-running local process owns sessions, tools, events, channel connections; UI/CLI/TUI are thin clients), channel adapters (assistant meets users in the chat apps they already use; personal vs shared is a configuration difference), skills/plugins as swappable extensions shared through a public registry with automated scans and moderation, model-provider plugins swappable without changing anything else, inbound messages treated as untrusted input with pairing approved by an explicit code, trusted-gateway/untrusted-execution policy enforced by code, telemetry discipline (nothing leaves the machine but a daily version check by default; anonymous stats opt-in; one flag disables both), onboarding wizard (verify model access, create workspace, configure gateway) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~11:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 OpenClaw Foundation, file SHA ed064819ab537575d0cad902f7e5af4a3488b1d0). README read in full (file SHA d4a9d8094ad39c2b54ce8a643e4ce499bbd650f2, 113,287 chars). Repo: 394,740 stars, 82,922 forks, 8,375 open issues, created 2025-11-24, pushed 2026-11-18. NOT adopted: any code (no TypeScript/Node gateway, no channel integrations, no plugin SDK, no ClawHub registry code, no model-provider wiring, no API-key collection, no install scripts, no telemetry/version-check code), any star-count or "most-starred" claim as quality, the CVE-2026-25253 report (secondary source only, not verified), the creator-joins-OpenAI move and foundation/donor statements as verified fact, any branding (no lobster, no "EXFOLIATE", no Molty lore). Note: GitHub's license summary shows NOASSERTION for this repo; the LICENSE file itself is plain MIT and governs. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## LangGraph — langchain-ai/langgraph (MIT License, Copyright (c) 2024 LangChain, Inc.)
Graph orchestration for stateful agents (nodes do work, edges are control flow, a shared state schema carries information; low-level and model-agnostic), durable execution (checkpoint after every step, resume from exactly where it left off), human-in-the-loop interrupts (inspect and modify state at any point, approve/edit/reject, then resume), short-term plus long-term memory behind a checkpointer, multi-agent wirings as graph patterns (agents as tools vs handoffs; supervisor, peer-to-peer, hierarchical) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~11:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2024 LangChain, Inc., file SHA fc0602feecdd6748623c852ab534e1ca612673c7). README read in full (file SHA 97c31e9cb4d8fe56be8d768ce3eb5e22400e897e, 6,395 chars). Repo: 45,116 stars, 7,786 forks, 477 open issues, created 2023-08-09, updated 2026-11-18. NOT adopted: any code (no Python/JS orchestration code, no checkpointer, no Postgres store, no LangSmith, no Deep Agents code), the "trusted by Klarna, Replit, Elastic" line and PyPI download figures as verified fact, any commercial hosting or eval-platform claim, any branding. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## ODW ERC-1400 Contracts — OnDemandWorld/erc1400-contracts (Apache License 2.0)
Partitioned tokens (partial fungibility: fungible within a partition, non-fungible across; asset classes, lock-up periods, corporate actions), certificate-based transfer validation (off-chain signed certificates, nonce-based replay prevention, salt-based one-time use), token holds (tokens stay in the holder's wallet but locked, preserving the investor registry; HTLC support; DvP without registry loss), document binding to tokens (IERC1643), global and partition-specific operators, controller operations (force transfers/redemptions for compliance), sender/recipient hooks, DvP swaps (atomic, multi-standard, price-oracle input), validator/checker split, batch issuance, ERC1820-based migration, and the migration discipline itself (name the successor chain client and token standard in the open; mark reference code as reference, never production-ready) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-18 ~11:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA 261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64). README read in full (file SHA ff164634f9daad5b9a4c0bb766bbdc0addcb75c3, 14,410 chars). Repo: 0 stars, 0 forks, 0 open issues, created 2025-12-30, updated 2025-12-31. NOT adopted: any code (no Solidity contracts, no Truffle/Hardhat deploy code, no backend API, no dashboard, no web client), any smart-contract, settlement, custody, or DvP execution code, any Quorum/Besu/Ropsten deployment claim, the repo's own "not intended for production use" warning ignored — it stands. The 0-star count is visibility, not a verdict. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## MetaHarness — ruvnet/metaharness (MIT License, Copyright (c) 2026 RuvNet)
Harness factory + governed self-evolution discipline (mint a custom branded agent harness from a repo or blank slate; Darwin Mode mutates harness config, tests in a sandbox, keeps only what measurably improves, model frozen; governed autonomous variation with immutable capabilities, budgets, promotion, quarantine, rollback, signed replay receipts; contrastive development with scoped proposals, actual probes, selective composition, metered experiment memory; cost routing to the cheapest model predicted to clear the quality bar, learned from the harness's own eval logs; cheap-tier distillation via SFT/DPO + LoRA with train/eval disjointness and reward-hacking filters; score-before-you-build report card that reads a repo without running it; default-deny MCP with static-only tool scan failing on any HIGH; fail-closed sandbox posture when a host cannot enforce a deny list; Ed25519 witness-signed releases, byte-deterministic, with doctor/validate/diag/score/threat-model/SBOM gates; claim gates blocking performance claims until pre-registered unseen-task/statistical/regression checks pass against an exact tag SHA and tarball) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 RuvNet, file SHA f082aa28727e6f5c821d6a77ffec622d8acfc5b2). README read in full (file SHA 1d73544f3609faf4c24b6f1ee1a8544747358ddf, 34,096 chars). Repo: 753 stars, 96 forks, 183 open issues, created 2026-06-13, updated 2026-11-17. NOT adopted: any code (no TypeScript/Rust kernel, CLI, Studio, host adapters, Darwin/AVO/Weight-EFT/router packages, MCP server, or witness-signing code), any benchmark figure as fact (2,254-test badge, DRACO / SWE-bench Verified 55.6% / LiveCodeBench 44% -> 62% / BFCL / FRAMES / OpenEnv Arena #2 are vendor-published runs), any production-readiness claim (v0.1.x beta with credibility/doc reconciliation open), any branding. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Semantica — semantica-agi/semantica (MIT License, Copyright (c) 2026 Semantica)
Deterministic decision graph + provenance discipline (context graph as the memory layer: entities, relationships, decisions, facts as first-class nodes, traversal over embeddings, point-in-time snapshots; decision intelligence: every consequential decision a permanent queryable record with causal links, ancestry trace, precedent search, downstream impact map, policy compliance gate; W3C PROV-O provenance on every fact, exportable for audit; conflicts detected and flagged, never silently overwritten; entity resolution with provenance preserved; deterministic reasoning: forward chaining, Rete, Datalog, SPARQL with explainable paths; ontology governance via OWL/SHACL/SKOS; one shared context graph across every agent on a team; system-level explainability only — context fed in, decision produced, provenance, policies, execution trail, never what happens inside the model) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 Semantica, file SHA c66f508604f5a6db3ea9951281cadc268fefac46). README read in full (file SHA 9286ffc8d50e8d913f3e1b3fbbfe2b029f0897e9, 81,382 chars). Repo: 14,664 stars, 1,739 forks, 135 open issues, created 2025-06-25, updated 2026-11-19. NOT adopted: any code (no Python pipeline, graph store, reasoning engine, MCP server, REST API, or CLI), any performance figure as fact (118,000-node figures are vendor-measured, explicitly not test assertions), the GHSA-j4mq auth advisory as verified (secondary report only), any "open alternative to Palantir" positioning, any branding. Caveat kept: the ReteEngine alpha-node matcher is intentionally simple and must be validated against the real rule set before any production compliance gate. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Chainstack rwa-sdk — chainstacklabs/rwa-sdk (MIT License, Copyright (c) 2026 Chainstack Labs)
Read-only RWA compliance querying discipline (one typed interface for token metadata, price/NAV, TVL, and transfer compliance across Ondo, BlackRock BUIDL via Securitize, Backed, Maple, Centrifuge; all reads via eth_call, no database, no indexer, no API keys; ABIs shipped in the package, no runtime fetching; unified can_transfer() normalizing blocklist, KYC registry, sanctions screening, bitmap permission manager, pre-transfer check, and transfer-restriction models, returning can/cannot, method, restriction message, blocking party; yield-pattern normalization: accumulating, rebasing, ERC-4626 vault, dividend-mint; custom adapters validated at injection, rejected immediately on a missing surface) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~03:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2026 Chainstack Labs, file SHA 10acbe45094667ea6b9f2e55c7c66bba2ed41ed5). README read in full (file SHA 661787b1f73ec64c951d8b37d30b4e0cc73cac49, 7,759 chars). Repo: 8 stars, 0 forks, 1 open issue, created 2026-03-30, updated 2026-07-17. NOT adopted: any code (no Python SDK, web3 calls, Pydantic models, or ABI files), any price/TVL figure as verified live (README figures are author-run examples), any RWA contract, settlement, custody, or transfer-execution code. The SDK covers five issuers by design and has been quiet since July 2026 — recorded, not a verdict. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code; HALEX-AI does not call an RPC endpoint.

## AgentRun — Parcha-ai/agentrun (Apache License 2.0, Copyright 2026 Parcha Labs, Inc.)
Self-improvement loop with a check-before-keep gate (corrections kept as human words in a capped whole file, secret-shape refusal; learned workflows compiled only after 20 completed runs, code-checked, dry-run without model or tools, replayed once against the original inputs, serving only on agreement; one revision for a held draft, then it stops until a person acts), durable run store with lease takeover (one store for agents, revisions, runs, steps; a finished step never re-runs; a crash-interrupted write is marked interrupted, never silently retried), typed workflows with confidence-scored decisions routed against a threshold and readable with their reasons, control-plane discipline (per-tool allow/ask/deny with a server deny that holds over "never ask"; spend caps that pause instead of failing and state the least needed to continue; unpriceable costs read "unknown", never $0), harness-agnostic layer (pi, Claude Code, Codex, OpenCode behind one control plane), template agents with eval cases run as real runs, triggers (schedules, signed webhooks, GitHub PR events), per-agent computers (none, sandbox, desktop, phone, browser) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~11:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA d645695673349e3947e8e5ae42332d0ac3164cd7, canonical body; README license section: Copyright 2026 Parcha Labs, Inc., built by Grep.ai). README read in full (file SHA 328ca31bdbd064c514e74db418dd1f4587e4fc43, 37,949 chars). Repo: 1,227 stars, 98 forks, 49 open issues, created 2026-09-23, updated 2026-11-19. NOT adopted: any code (no TypeScript/Node server, runners, harness adapters, MCP servers, Docker/Helm/Railway/Render deploy, Composio key wiring, ChatGPT-plan sign-in), any case-study figure as fact (18 cents a review, 1.6x Greptile bugs, $0.89 -> $0.12 a merchant, 7x cheaper, "use fewer tokens with every run"), any deploy time or hosting price as current fact, the Y Combinator batch as verified (secondary report). Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Agent Orchestrator — OrchestratorInc/agent-orchestrator (Apache License 2.0, Copyright 2026 Untrivial)
Fleet orchestration with worktree isolation (one task, one agent, one branch, one git worktree; a planning orchestrator splits work and returns only when a person is needed; CI failures, review comments, and merge conflicts routed back to the worker that owns the branch until the PR is approved; a reviewer agent reads every PR before a person does; sessions sorted into Kanban lanes by status so what needs a person is on top), 35+ worker agent harnesses via plugins behind one workspace, per-worker browser for preview and testing, mobile companion paired by QR (push alerts, reply, approve, start workers, review PRs), cloud agents for hosted workspaces, limited telemetry (installation ID and GitHub username; never code, prompts, conversations, or credentials), off by a settings flag — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~11:42 EST. LICENSE read verbatim (Apache License 2.0, file SHA 0963902dbd478bcf554d8d16ece3887338520535; appendix "Copyright 2026 Untrivial"). README read in full (file SHA 3630865a27acb6f93b188972c69563910f4fb55d, 19,648 chars). Repo: 14,923 stars, 2,057 forks, 1,042 open issues, created 2026-02-13, updated 2026-11-19. CORRECTION: the repo moved from composiohq/agent-orchestrator to OrchestratorInc/agent-orchestrator; secondary sources citing the old org and "8,700 stars" are stale. NOT adopted: any code (no desktop app, daemon, mobile app, cloud agents, telemetry code), any "meta-harness agent IDE" positioning as fact, any star count as quality. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.

## Claude Code Templates — davila7/claude-code-templates (MIT License, Copyright (c) 2025 Daniel (San) Ávila)
Skills registry with a PR validation pipeline (catalog of 1,980+ small installable components — skills, agents, commands, hooks, MCPs, settings, mods, loops, templates, sandboxes, plugins — with per-component install commands and live counts; the CLI merges existing configuration instead of overwriting it; every pull request checked by Claude Code's plugin validator and scanned by NVIDIA SkillSpector, which is a validation pipeline, not a safety or quality guarantee), per-source attribution kept (catalog components keep their original MIT / Apache 2.0 / CC0 licenses), loops as autonomous workflows with a goal, an interval, and a stop condition, local-only dashboards bound to loopback (session analytics and conversation browsers serve history, so they listen on 127.0.0.1 only; remote access only over an SSH forward) — patterns restated in our own words only. Source: HALEX-AI intel intake run 2026-11-19 ~11:42 EST. LICENSE read verbatim (MIT License, Copyright (c) 2025 Daniel (San) Ávila, file SHA b92d7062bc207a15cf2fee3d04280fec730c8440). README read in full (file SHA 2b9090dff4eaa7b785dbb133960246fee90cce33, 12,660 chars). Repo: 34,002 stars, 4,051 forks, 546 open issues, created 2025-07-04, updated 2026-11-19. NOT adopted: any code (no CLI, component files, or install scripts), any component count as independently verified (maintainer self-reported), any sponsor discount code or sponsor/supporter logo as an endorsement, the validation pipeline as a safety guarantee. Excluded by the HALEX gate: no network/wallet/signing/payment/API-key code.
