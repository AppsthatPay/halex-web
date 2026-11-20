# Proposal: execution traces as gradients (Trace/OptoPrime) + content-addressed DAG session history with test-gated patch selection (agent-merge) + provider-agnostic orchestration (OmniNode) — 2026-11-20

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-20):
- microsoft/Trace — MIT License, Copyright (c) Microsoft
  Corporation (LICENSE file SHA
  9e841e7a26e4eb057b24511e7b92d42b257a80e5). README read in
  full (file SHA
  3935e9e372647218f8aac49e0cce304d183805cf, 22,492 chars).
  Repo: 765 stars, 64 forks, 6 open issues, created
  2024-06-14, updated 2026-11-19, Python, default branch
  main, not archived. End-to-end generative optimization
  for AI agents (NeurIPS 2024 paper arXiv:2406.16218,
  "Trace is the Next AutoDiff"). Two primitives, `node`
  and `bundle`, wrap Python objects and functions into a
  computation graph; `trainable=True` marks exactly which
  nodes an optimizer may change. Execution traces
  propagate as minimal subgraphs to interchangeable
  optimizers (OPRO, TextGrad, OptoPrime) — the same trace
  abstraction feeds each. OptoPrime formats the trace and
  feedback as a code-debugging report and asks an LLM to
  change the trainable parts. Worked examples: a strange
  sort function corrected by test feedback, a sales agent
  learning a greeting from right/wrong feedback, a
  Battleship agent learning shot placement. PyPI
  `trace-opt`, Python >= 3.9, LiteLLM backend by default
  (AutoGen v0.2 as an alternative), LLM API keys required.
  The README states plainly that the library is a beta,
  for research purposes only, that system performance may
  vary, and that decisions leveraging outputs should be
  made with human oversight, not based solely on system
  outputs. It also records the large-graph caveat:
  OptoPrime represents the entire computation graph in
  context and may struggle with graphs of more than
  hundreds of operations; TextGrad has no context-length
  issue but is slower.
- GuanZhengPM/agent-merge — MIT License, Copyright (c)
  2026 The agent-merge authors (LICENSE file SHA
  cc37cbc4b2d2fbbde01122a3dcc06b9ec63b7cbc). README read in
  full (file SHA
  7176a8601634a30e0219e91801147f624cf05d11, 10,374 chars,
  bilingual Chinese/English). Repo: 2 stars, 0 forks, 0
  open issues, created 2026-08-24, updated 2026-10-11,
  TypeScript, default branch main, not archived.
  Multi-agent coding orchestration with Git-style version
  control for agent sessions. Session history is a
  content-addressed directed acyclic graph of immutable
  events (message, tool call, tool result, annotation),
  each addressed by the SHA-256 hash of its content and
  deduplicated across branches and sessions; steps group
  events and reference parent steps; branches are named
  pointers to steps; context materialization is a pure
  function of DAG traversal, so any historical fork point
  can be exactly reconstructed and re-prompted. `agent-merge
  run` provisions one temporary Git worktree per worker
  from the same base commit, runs acceptance tests
  independently in each, admits only test-passing patches
  to the candidate pool (default judge: smallest passing
  patch), feeds failures back for an automated repair
  round, and applies the winner with a provenance audit
  report. Merge strategies: `conclusions` (annotations
  only, the recommended default), `interleave` (all events
  by timestamp), `pickTailStrategy(i)` (one winning branch
  in full), `championStrategy(i)` (winner in full plus
  experience annotations from rejected branches). A
  `bisect` operation locates the step that introduced a
  fault without reading hundreds of log lines. Zero
  external runtime dependencies; Node.js 20.19+ (23.6+ to
  run source directly). Integrations: an Agent Skills
  adapter and a DeepSeek harness plugin.
- Hilbras/OmniNode — MIT License, Copyright (c) 2026
  Hilbras (LICENSE file SHA
  047cf7cf78d6ac18150f357e45af91da2f63d92e). README read in
  full (file SHA
  2c0c58520761210eeb98ec21fa73f86a37a8919a, 11,259 chars).
  Repo: 2 stars, 0 forks, 0 open issues, created
  2026-10-04, updated 2026-10-21, TypeScript, default
  branch main, not archived. Provider-agnostic multi-AI
  orchestration platform (v2.0.3 stable, v2.0.4-alpha.1
  prerelease): coordinates CLI agents, AI providers,
  persistent memory, roles, reports, and planning into
  one execution system. Core architectural rule: the
  engine runs with zero Hilbras dependencies; OmniHilbras
  and Remembera are optional providers. Capabilities as
  documented: provider abstraction with a single contract
  and normalized error kinds; CLI agents in stdin / arg /
  protocol modes with an agent registry; roles and tasks
  with lifecycle and retry; pipelines as DAG scheduling
  with fan-out research, conditions, and retries;
  multi-AI reports with aggregation and conflict
  detection that preserves both positions; a planner with
  a model-backed path and a heuristic fallback; memory
  with a formal contract, categories, budgeted retrieval,
  and a `required` policy; persistence with atomic writes,
  corruption quarantine, and schema migration; an audit
  log with correlated events; security hardening including
  inline-secret refusal and a `security audit` command;
  CI on Node 20/22/24. Installable as `@hilbras/omninode`
  on npm or via Docker.

## Patterns to adopt (restated in our own words only)

- Execution trace as gradient: record a workflow's
  execution trace — the intermediate results and how they
  produced the output — as a minimal subgraph, and let
  feedback (a score, a natural-language critique, a test
  failure, a compiler error) flow back to the parts
  explicitly marked trainable. HALEX-AI already seals a
  provenance chain per change; the pattern to adopt is
  the trace discipline: every proposed change carries the
  trace that produced it (what was tried, what the
  feedback was, what changed), the trainable surface is
  declared in advance, and everything else is fixed.
- Interchangeable optimizers behind one trace: OPRO,
  TextGrad, and OptoPrime all consume the same trace
  abstraction. HALEX-AI adopts the shape, not the code:
  a review step that can be driven by different
  evaluation instructions (a strict checker, a critique
  in words, a test run) without changing what is being
  reviewed — and the choice of evaluator is recorded
  with the result.
- Trainable surface declared, not assumed: only nodes
  marked trainable may change. In HALEX-AI terms: a
  proposal names exactly which files, prompts, or
  parameters it may touch; anything outside that surface
  is out of scope for the change, and a change that
  touches more is rejected, not widened.
- Large-graph caveat as a design bound: an optimizer
  that holds the whole graph in context breaks past
  hundreds of operations. HALEX-AI already bounds its
  proposals; the pattern to adopt is the explicit bound
  (a review pass covers a bounded slice of the system,
  never the whole tree at once) and the fallback to a
  slower, narrower evaluator when the slice is large.
- Content-addressed DAG session history: model agent
  work as immutable events addressed by content hash,
  grouped into steps that form a DAG, with named branch
  pointers — never a flat disposable log. HALEX-AI
  already hash-chains its seal log and lesson chain; the
  pattern to adopt is the event-level shape: each builder
  attempt is an immutable event with a content hash,
  branches (competing approaches) stay addressable, and
  context for any later decision is materialized by
  traversal from a named point, not by re-reading a whole
  transcript.
- Test-gated patch selection with repair rounds: only
  patches that pass the acceptance tests are eligible;
  the default judge prefers the smallest passing patch;
  a round where everything fails feeds the errors back
  for a repair round instead of picking a loser. HALEX-AI
  already gates promotion on tests; the pattern to adopt
  is the selection rule (smallest passing change wins)
  and the repair-round discipline (a failed round returns
  feedback, never a forced merge).
- Keep the losers' lessons: the `champion` merge keeps
  the winning branch in full plus the experience
  annotations of rejected branches; `conclusions` keeps
  only annotations. HALEX-AI already quarantines failures
  with reasons; the pattern to adopt is the merge rule:
  when competing approaches are tried, the annotations
  (what was learned, what failed, why) survive into the
  record even when the code does not.
- Bisect the fault, don't read the log: a deterministic
  bisection over steps locates the step that introduced
  a fault, given a good step and a bad step and a probe.
  HALEX-AI already records per-attempt seal entries; the
  pattern to adopt is the probe discipline: when a
  regression appears, narrow by halving the attempt
  history with a repeatable check, not by re-reading
  everything.
- Provider-agnostic orchestration: providers sit behind
  one contract with normalized errors; the core engine
  has zero vendor dependencies. HALEX-AI engine code is
  already stdlib-only with zero network code; the pattern
  to adopt is the contract shape: any external capability
  (a model, a store, a tool) is reached through a narrow
  interface with declared error kinds, and the engine
  never imports a vendor.
- Report aggregation that preserves conflict: when
  multiple agents report, agreements are recorded and
  conflicts keep both positions, with confidence. HALEX-AI
  already records verified vs claimed separately; the
  pattern to adopt is the conflict rule: a disagreement
  between sources is preserved as a disagreement, never
  resolved by picking the louder one.
- Persistence discipline: atomic writes, corruption
  quarantine, and never destroying a store file written
  by a newer version. HALEX-AI already seals its chain;
  the pattern to adopt is the write rule: a state file is
  replaced atomically, a corrupt file is quarantined
  (never silently repaired or deleted), and a newer
  format is never downgraded by an older writer.
- Inline-secret refusal: a secret written inline in
  configuration is refused rather than accepted.
  HALEX-AI already keeps keys out of its engine; the
  pattern to adopt is the refusal: any staged material
  containing a key, token, or secret is rejected at the
  gate, not redacted after the fact.

## Verdict

GATED, patterns only. Trace MIT, agent-merge MIT, and
OmniNode MIT LICENSEs read verbatim; all three READMEs
read in full. No code adopted, no branding adopted, no
vendor figures adopted (see below). HALEX gate stricter:
no Trace Python library, LiteLLM/AutoGen backend, or
API-key code; no agent-merge TypeScript package, CLI,
worktree orchestration, or DeepSeek harness code; no
OmniNode TypeScript/Node package, CLI, provider adapters,
or Docker runtime; no provider / network / wallet /
signing / payment / API-key code anywhere; no
unattended self-rewriting, no weight training, no
automatic adoption of an optimizer's output; no
self-reported audit or release claim treated as
verified.

## NOT adopted (claimed, not verified)

- Trace's "2-3x faster than TextGrad" OptoPrime speed
  claim (the authors' own comparison, run 2024-10-30
  against the pip-installed TextGrad repo); the 1.3x
  mapper-code speedup under 10 minutes (a separate
  Nvidia/Stanford/Visa/Intel paper applying Trace, not
  re-verified here); the paper's evaluation results on
  numerical optimization, traffic control, BigBench-Hard,
  and MetaWorld (authors' results, not reproduced here);
  "fully functional implementation" as production-ready
  (the README itself calls the library a beta for
  research purposes only); any star count as quality.
- agent-merge's effectiveness claims: no test run of the
  package was performed here, so the worktree
  orchestration, repair rounds, merge strategies, and
  bisect are README-described capabilities, not verified
  behavior; the npm package was not installed or run;
  "smallest passing patch" as the right selection rule
  is a design choice, not a proven optimum; the repo is
  six weeks old with 2 stars and no forks — recorded,
  not a verdict; star counts as quality.
- OmniNode's self-reported release claims: "all 24
  roadmap phases shipped", "full audit — architecture,
  security, reliability, protocol, performance: PASS",
  and "fixes every confirmed critical and high finding"
  are the maintainer's own statements in the README and
  the cited audit document, which was not read or
  verified here; npm download counts were not checked;
  the repo is six weeks old with 2 stars and no forks —
  recorded, not a verdict; star counts as quality.
- TokenF (@tokenf/contracts) lead: still NOT closed —
  repo identity unconfirmed (GitHub search returned
  1,136 results with no TokenF RWA repo among top hits;
  direct reads of tokenf/contracts, TokenF/contracts,
  tokenf/tokenf, TokenF/TokenF all 404; npm page carries
  no repository link). MIT claim is npm-only; no LICENSE
  file read. Stays an open lead, ideas only, no entry.
