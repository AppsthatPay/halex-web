# Proposal: harness factory + governed self-evolution (MetaHarness) + deterministic decision graph + provenance (Semantica) + read-only RWA compliance querying (Chainstack rwa-sdk) — 2026-11-19

Sources (LICENSEs read verbatim via the GitHub connector, 2026-11-19):
- ruvnet/metaharness — MIT License, Copyright (c) 2026
  RuvNet (https://ruv.io) — LICENSE read verbatim (file
  SHA f082aa28727e6f5c821d6a77ffec622d8acfc5b2,
  canonical MIT body). README read in full (file SHA
  1d73544f3609faf4c24b6f1ee1a8544747358ddf, 34,096
  chars). Repo: 753 stars, 96 forks, 183 open issues,
  created 2026-06-13, updated 2026-11-17, TypeScript,
  default branch main, not archived. A factory for
  agent harnesses, not another agent framework: `npx
  metaharness` mints a custom, branded, npm-publishable
  harness from a GitHub repo or a blank slate — repo-aware
  CLI, repo-aware coding agent, local MCP server, project-
  scoped memory, skills generated from the actual file
  layout, governance policy, release verification, and
  witness-signed provenance. Ten hosts: Claude Code,
  Codex, pi.dev, Hermes, OpenClaw, RVM, GitHub Copilot,
  OpenCode, Prime Agent, GitHub Actions (CI/CD, non-
  interactive). Darwin Mode: every scaffold ships with
  self-evolution wired in — the harness mutates its own
  config, tests each change in a sandbox, and keeps only
  what measurably improves; the model stays frozen, the
  harness evolves; safe by default (no network, no API
  key, pure refactor/tuning behind a safety gate);
  validated on SWE-bench Lite. AVO is the governed
  autonomous-variation runtime on top: immutable
  capabilities, budgets, promotion, quarantine, rollback,
  signed replay receipts; simple work stays on Darwin's
  fast path. Contrastive harness development: scoped
  proposals, actual probes, selective composition, metered
  experiment memory behind immutable caller policy.
  Weight-EFT distils the cheap tier (exports the gold-
  resolved archive into SFT/DPO sets, LoRA-tunes the open
  cheap tier) so the cost cascade escalates to frontier
  models less often. A router picks the cheapest model
  predicted to clear the quality bar, learned from the
  harness's own eval logs. MCP is modular and default-
  deny (modes off / local stdio / remote HTTPS+auth; no
  network, no shell, no file-write, approve-dangerous,
  30s timeout, 8 calls/turn, audit on); `harness
  mcp-scan` is a static-only scan flagging shell/network
  grants, missing audit/timeouts, wildcard permissions,
  unguarded secrets, unpinned deps, exiting 1 on any
  HIGH. Release gates: `harness doctor`, `validate`,
  `diag`, `score`, `threat-model`, `sbom` (SPDX-2.3),
  `sign`/`verify` (Ed25519 witness manifest, byte-
  deterministic across runners), `publish --confirm`
  (IPFS pin). `metaharness score <repo>` reads a repo
  (never runs it) and prints a fit/build-likelihood/
  safety/cost-per-run report card before scaffolding;
  `harness genome` does the same for the local repo.
  Status: v0.1.x beta — "credibility/doc reconciliation
  in issue #4 / ADR-042 in progress"; the release
  pipeline is mature (CI matrix green across Rust x 3
  OS + WASM x 3 OS + Node 20+22 x 3 OS; single-command
  releases atomically bump 15 sources, run all gates,
  tag). Test suite badge claims 2,254 passing across
  246 files, CI green on main — a vendor claim, NOT
  verified by this run. The README is explicit about
  its own claim boundaries: the ARC-AGI-3 AVO single-
  game smoke (3.2676 vs 0.3968) "is not claim-eligible";
  the stronger AVO-class claim is blocked on a
  preregistered 100-task unseen SWE-bench gate; the
  Prime Agent PTC claim is "honestly deferred" behind a
  pre-registered A/B. Benchmark figures (DRACO, SWE-
  bench Verified 55.6% empty-patch cascade, LiveCodeBench
  44% -> 62% cost-cascade) are the vendor's own published
  runs, NOT verified by this run; the press-release
  figures (Claude Haiku 4.5 vs Opus 4.5 on DRACO,
  DeepSeek-V4-Pro 96% vs GPT-5.2 83.3% on BFCL, OpenEnv
  Arena #2 at 22.5%) are vendor claims, NOT verified.
- semantica-agi/semantica — MIT License, Copyright (c)
  2026 Semantica — LICENSE read verbatim (file SHA
  c66f508604f5a6db3ea9951281cadc268fefac46, canonical
  MIT body). README read in full (file SHA
  9286ffc8d50e8d913f3e1b3fbbfe2b029f0897e9, 81,382
  chars; sections: what it gives you, architecture,
  decision intelligence, context graphs, audit-trail
  recipe, module reference, recipes, performance, CLI,
  integrations, MCP server, REST API, Knowledge
  Explorer, v0.7.0 changelog, installation). Repo:
  14,664 stars, 1,739 forks, 135 open issues, created
  2025-06-25, updated 2026-11-19, Python, default
  branch main, not archived. A graph-native semantic
  layer under the LLM, vector store, and agent framework:
  deterministic infrastructure — no LLM required for
  graph construction, reasoning, or provenance; where an
  LLM is used it is optional and vendor-neutral. Ingest
  (files, web, databases, Databricks/Snowflake/SAP,
  streams, Git, email, MCP) -> parse/normalize/split
  (entity-aware chunking) -> extract (NER, relations,
  events, triplets) -> conflict detection -> dedup ->
  knowledge graph -> ontology / reasoning / provenance /
  decisions -> polyglot store (RDF: Oxigraph, Blazegraph,
  Jena, RDF4J; LPG: Neo4j, FalkorDB, AGE, Neptune; plus
  vector stores) -> export / visualize / REST / MCP /
  CLI. Context Graphs: entities, relationships, decisions,
  and facts as first-class nodes; graph traversal answers
  "what is connected, why, and how"; point-in-time
  snapshots replay history. Decision Intelligence: every
  decision is a first-class queryable object —
  record_decision, causal links (CAUSED / INFLUENCED /
  PRECEDENT_FOR), trace_decision_chain (full causal
  ancestry), find_similar_decisions (precedent search),
  analyze_decision_impact (downstream influence map),
  check_decision_rules (policy gate, e.g. confidence >=
  0.7, outcome in approved/rejected/flagged, decision
  maker set). Provenance: W3C PROV-O on every fact,
  exportable to JSON/CSV/RDF for regulator submission.
  Deterministic reasoning: forward chaining, Rete network,
  Datalog, SPARQL, with explainable paths. Ontology:
  OWL generation, SHACL validation, SKOS vocabularies,
  visual editor. Conflicts are detected and flagged,
  never silently overwritten; entity resolution by
  blocking + semantic dedup. Multi-agent: one shared
  context graph across every agent on a team (Agno,
  CrewAI, LangChain integrations, full MCP server, REST
  API, CLI, editor plugins). System-level explainability
  only — it explains what is outside the model (context
  fed in, decision produced, provenance, policies,
  execution trail), never what happens inside the LLM.
  Caveats recorded from the README itself: the ReteEngine
  alpha-node condition matcher "is intentionally simple
  in this release — validate match_patterns() output
  against your actual rule set before wiring it into a
  production compliance gate"; v0.7.0 removed the crewai
  extra to close unpatched chromadb/json-repair CVEs and
  fixed a Neptune credential-logging leak; Python 3.11.5-
  3.13 required (3.10 support ended in 0.8.0). Performance
  figures are vendor-measured on a 118,000-node production
  graph (v0.5.0) and explicitly "not an automated tests/
  assertion" — NOT verified by this run. A secondary blog
  reports an auth advisory (GHSA-j4mq, fixed 2026-08-11,
  API-key auth required on Explorer routes) that was not
  yet in GitHub's public advisory database at the time of
  writing — secondary claim, NOT verified by this run.
- chainstacklabs/rwa-sdk — MIT License, Copyright (c)
  2026 Chainstack Labs — LICENSE read verbatim (file
  SHA 10acbe45094667ea6b9f2e55c7c66bba2ed41ed5,
  canonical MIT body). README read in full (file SHA
  661787b1f73ec64c951d8b37d30b4e0cc73cac49, 7,759
  chars). Repo: 8 stars, 0 forks, 1 open issue, created
  2026-03-30, updated 2026-07-17, Python, default branch
  main, not archived. A read-only Python SDK for querying
  RWA tokens across EVM chains via eth_call — no database,
  no indexer, no API keys (except Centrifuge, which uses
  its public GraphQL API for price data). One interface
  for token metadata, price/NAV, TVL, and transfer
  compliance across Ondo (USDY, OUSG, rUSDY, rOUSG),
  BlackRock BUIDL via Securitize (BUIDL, BUIDL-I), Backed
  (bIB01, bCSPX, bNVDA), Maple (syrupUSDC, syrupUSDT),
  Centrifuge (JTRSY). Typed Pydantic models with
  normalized fields (price, tvl, yield_type,
  compliance_method). Yield patterns normalized:
  accumulating (balance constant, price rises), rebasing
  (price ~$1, balance adjusts), ERC-4626 vault (share
  price via convertToAssets()), dividend mint (flat $1
  NAV, new tokens minted as yield). The compliance layer
  normalizes five issuers' four-plus models behind one
  can_transfer() call: Ondo blocklist, Ondo KYC registry,
  Backed Chainalysis sanctions screening, Maple
  PoolPermissionManager bitmap, Maple syrupUSDT
  permissionless, Securitize DS Protocol preTransferCheck,
  Centrifuge ERC-1404 transfer restriction — returning
  can_transfer, method, restriction message, and blocking
  party. Price sources per protocol (Ondo oracle, constant
  $1 NAV, Chainlink feeds, convertToAssets(), Centrifuge
  API). Custom adapters: subclass ProtocolAdapter, inject
  at construction or register after; missing protocol /
  chain_id / all_tokens / can_transfer raises TypeError
  immediately. ABIs ship as JSON in the package; no runtime
  Etherscan fetching. Only two dependencies: web3 and
  pydantic; Python 3.10+. Price/TVL figures in the README
  (e.g. USDY $1.1290, syrupUSDC $1.1590) are example
  outputs from the authors' runs, NOT verified live by
  this run. 8 stars and last push 2026-07-17 is a low-
  activity signal, recorded, not a verdict; the SDK covers
  only the five major issuers by design.

## Verdict
GATED, patterns only. All three licenses are permissive
(MIT, MIT, MIT).

## Usable patterns (restated in our own words)
- Harness factory: mint a custom, branded agent harness
  from a repo or a blank slate — the factory produces the
  harness, the user owns the harness; the model is
  replaceable, the harness is the product. A harness is
  config the owner controls, not a black box; trim it to
  only what the repo needs.
- Host adapters: one harness output runs on many agent
  hosts through distinct adapters; the harness identity
  is separate from any one host.
- Darwin Mode (gradient-free self-evolution): mutate the
  harness config, test each change in a sandbox, keep
  only what measurably improves; the model stays frozen,
  the harness evolves. Safe by default: no network, no
  API key, pure refactor/tuning behind a safety gate.
- Governed autonomous variation: immutable capabilities,
  budgets, promotion, quarantine, rollback, and signed
  replay receipts around any agent that edits, executes,
  evaluates, repairs, reverts, branches, and commits;
  simple work stays on the fast path.
- Contrastive harness development: scoped proposals,
  actual probes, selective composition, metered experiment
  memory behind immutable caller policy; an evidence-backed
  proposer must cite the failing traces behind each edit
  or propose nothing.
- Cost routing: route each request to the cheapest model
  predicted to clear the quality bar, learned from the
  harness's own eval logs; distil the cheap tier (gold-
  resolved archive into SFT/DPO sets, LoRA-tune the open
  cheap tier) so the cascade escalates to frontier models
  less often; train/eval disjointness plus reward-hacking
  filters keep the lift real; a tune that overfits is a
  gene the evolver can prune.
- Score before you build: read a repo (never run it) and
  print a fit / build-likelihood / safety / cost-per-run
  report card before scaffolding; inferred build/test
  commands are marked "trust: inferred, execution:
  disabled".
- Default-deny tool surface: MCP modes off / local / remote
  with auth; no network, no shell, no file-write by
  default; approve-dangerous, timeout, per-turn call cap,
  audit on. A static-only tool scan flags shell/network
  grants, missing audit/timeouts, wildcard permissions,
  unguarded secrets, unpinned deps, and fails on any HIGH.
- Fail-closed posture: when a host cannot enforce a deny
  list, ship a prominent SANDBOX-REQUIRED notice instead
  of silently dropping the posture.
- Witness-signed releases: Ed25519-signed witness
  manifest, byte-deterministic across runners; release
  gates (doctor / validate / diag / score / threat-model /
  SBOM / sign / verify) run before publish; drift detection
  against the latest template on upgrade.
- Claim gates as a discipline: a performance claim stays
  blocked until a pre-registered gate (unseen tasks,
  statistical checks, regression checks, two independent
  graders) is satisfied against an exact tag SHA and
  tarball; single-game smokes are not claim-eligible;
  deferred claims stay labelled deferred.
- Context graph as the memory layer: entities,
  relationships, decisions, and facts as first-class
  nodes; traversal answers what is connected, why, and
  how; point-in-time snapshots replay history without
  reprocessing.
- Decision intelligence: every consequential decision is
  a permanent, structured, queryable record with causal
  links (caused / influenced / precedent-for), a full
  causal ancestry trace, precedent search, downstream
  impact map, and a policy compliance gate — the record
  answers "what did the AI decide, why, and what happened
  next?" in a format a regulator accepts.
- Provenance by construction: W3C PROV-O lineage on
  every fact, exportable for audit; conflicts detected
  and flagged, never silently overwritten; entity
  resolution merges duplicates with provenance preserved.
- Deterministic reasoning over the graph: forward
  chaining, Rete, Datalog, SPARQL with explainable paths;
  ontology governance (OWL, SHACL, SKOS) makes what an
  entity means explicit, not just its embedding. Validate
  a simple rule matcher against the real rule set before
  wiring it into a production compliance gate.
- Shared context across agents: one shared context graph
  for every agent on a team, instead of separate memory
  per agent; system-level explainability (context fed in,
  decision produced, provenance, policies, execution
  trail) — never a claim about what happens inside the
  model.
- Read-only RWA querying: one typed interface for token
  metadata, price/NAV, TVL, and transfer compliance
  across issuers, all reads via eth_call, no database,
  no indexer, no API keys; ABIs shipped in the package,
  no runtime fetching.
- Unified compliance check: one can_transfer() call
  normalizes blocklist, KYC registry, sanctions
  screening, bitmap permission manager, pre-transfer
  check, and transfer-restriction models, returning
  can/cannot, method, restriction message, and blocking
  party.
- Yield-pattern normalization: accumulating, rebasing,
  ERC-4626 vault, dividend-mint — one normalized price
  shape regardless of how yield accrues.
- Adapter validation at injection: a custom adapter
  missing its required surface (protocol, chain id,
  token listing, transfer check) is rejected immediately,
  not at first use.

## NOT adopted / excluded by the HALEX gate
- No code: no MetaHarness TypeScript/Rust kernel, CLI,
  Studio, host adapters, Darwin/AVO/Weight-EFT/router
  packages, MCP server, or witness-signing code; no
  Semantica Python pipeline, graph store, reasoning
  engine, MCP server, REST API, or CLI code; no rwa-sdk
  Python SDK, web3 calls, Pydantic models, or ABI files.
- No network/wallet/signing/payment/API-key code
  anywhere in the HALEX-AI engine; no model-provider
  wiring, no API-key collection, no RPC endpoint keys,
  no install scripts, no mainnet deployment of any kind.
- No RWA contract, settlement, custody, or transfer-
  execution code; no token/NFT factory code; no oracle
  or vault code; the SDK is read-only querying only, and
  even that stays a pattern — HALEX-AI does not call an
  RPC endpoint.
- No benchmark, download, or star-count claims as fact:
  MetaHarness's 2,254-test badge, DRACO / SWE-bench /
  LiveCodeBench / BFCL / FRAMES / OpenEnv Arena figures
  are vendor-published runs, NOT verified; Semantica's
  118,000-node performance figures are vendor-measured
  and explicitly not test assertions, NOT verified; the
  GHSA-j4mq auth advisory is a secondary report, NOT
  verified; rwa-sdk's example price/TVL outputs are
  author-run examples, NOT verified live. Star counts
  (753 / 14,664 / 8) are visibility, not quality.
- No third-party branding (no MetaHarness marks, no
  Semantica marks, no Chainstack marks). No "open
  alternative to Palantir" positioning adopted.
- No production-readiness claim for any of the three:
  MetaHarness is v0.1.x beta with a credibility/doc
  reconciliation open; Semantica's Rete matcher is
  explicitly simple and must be validated before any
  compliance gate; rwa-sdk covers five issuers by design
  and has been quiet since July 2026.

## What would be built (later, by the builder)
- A harness-factory discipline for HALEX-AI's own builder:
  mint a repo-tuned harness shape (agents, skills,
  commands, memory namespace, governance policy) from a
  project layout, in HALEX-AI's own vocabulary,
  stdlib-only — plus a score-before-you-build report card
  that reads a project without running it.
- A Darwin-style self-evolution vocabulary for the
  self-build loop: mutate config, test in a sandbox, keep
  only what measurably improves, with immutable
  capabilities, budgets, quarantine, rollback, and signed
  receipts — as a knowledge entry, patterns only.
- A decision-intelligence vocabulary for the builder's
  own choices: every consequential build decision recorded
  as a queryable node with causal links, precedent search,
  impact map, and a policy gate — alongside the existing
  ZINIUM hash-chained lesson record, patterns only.
- An RWA compliance-check vocabulary for the RWA
  checklist: one normalized transfer-check shape across
  blocklist / KYC registry / sanctions / bitmap /
  pre-transfer-check / transfer-restriction models, plus
  yield-pattern normalization — patterns only, no RPC,
  no on-chain reads.
