# Proposal: typed event memory with a pre-commit judgment gate (projectmem) + declarative self-improving pipelines (DSPy) + textual-gradient optimization (TextGrad) — 2026-11-20

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-20):
- riponcm/projectmem — MIT License, Copyright (c) 2026
  projectmem contributors (LICENSE file SHA
  5fd1813fcf8fe3bdbda8d6bdb3c3ae01247ffb92). README read in
  full (file SHA
  bd93dbb27035005153e361c811ab46348acaee2a, 55,478 chars).
  Repo: 875 stars, 54 forks, 7 open issues, created
  2026-05-09, updated 2026-11-20, Python, default branch
  main, not archived. Local-first coding-agent memory:
  memory lives in a plain `.projectmem/` directory inside
  the repository, append-only `events.jsonl` plus distilled
  files (`summary.md`, `PROJECT_MAP.md`, per-issue files),
  no cloud, no account, no telemetry — the only network
  call it can make is an update check the user turns on.
  Memory is stored as **typed events** — issue, attempt,
  fix, decision, note — each with an explicit outcome
  (worked / failed / partial), instead of free-form
  recollections. Its signature feature is a **deterministic
  pre-commit warning**: a git hook fires before a commit
  that would repeat an approach already recorded as failed
  in this project. `pjm init` installs three git hooks
  (pre-commit warnings, post-commit classification,
  post-merge tracking) and a real-time file watcher.
  Summaries stay bounded: every open issue is shown (newest
  20 in full, older by id), fixed issues capped at the
  newest 10, decisions at the newest 15, each record
  clipped at 300 characters. Memory is never deleted: stale
  entries are flagged and a human decides. A `plan.md`
  intent file is kept separate from memory. One MCP server
  serves every project (17 tools) for Claude Code, Claude
  Desktop, Cursor, Antigravity, and Codex. Cross-project
  memory is inherited when available. Design principles:
  local-first, project-scoped (when the code moves, the
  memory moves), AI-tool-agnostic. Described in the paper
  *PROJECTMEM: A Local-First, Event-Sourced Memory and
  Judgment Layer for AI Coding Agents* (Malo and Qiu,
  University of Utah, arXiv:2606.12329), which frames the
  design as Memory-as-Governance — memory that acts on the
  agent's next action, not merely answers it. The paper
  reports a two-month, 207-event dogfooding study across 10
  real projects; the README's own comparison page states
  plainly that this is dogfooding by the authors, not an
  independent evaluation.
- stanfordnlp/dspy — MIT License, Copyright (c) 2023
  Stanford Future Data Systems (LICENSE file SHA
  be3f5c0e3fc7e6b0e7c9dddd9db313ab15bfa62b). README read in
  full (file SHA
  f92d3311e085fed87af6c724b2d43e2076b57cc6, 5,056 chars).
  The README itself is short: it points at the docs site
  (dspy.ai) for the framework and lists the research papers
  (DSPy ICLR 2024, GEPA Jul 2025, MIPRO Jun 2024, and
  others). DSPy stands for Declarative Self-improving
  Python: instead of hand-written prompts, programs are
  declared as typed signatures and composable modules, and
  optimizers (compilers) tune the prompts and few-shot
  demonstrations — and optionally fine-tune weights — against
  a metric the developer defines. Modules cover simple
  classifiers, RAG pipelines, and ReAct-style agent loops.
  Current integration uses bundled native lm15 engines,
  without a LiteLLM runtime dependency or fallback; a
  migration guide covers breaking changes to provider
  options, custom LMs, text completions, and embeddings.
  Repo metadata (stars/forks) was not retrieved this run:
  the connector's repository search returned only forks
  and wrappers for the query, not the canonical repo, so no
  star count is claimed here.
- zou-group/textgrad — MIT License, Copyright (c) 2024 Zou
  Group (LICENSE file SHA
  4147dd862a0eacad99183070797790e96fc4995e). README read in
  full (file SHA
  d4f7376e464c6aeef114a0f8d12cdea02bf6a548, 19,111 chars).
  TextGrad is an autograd engine for textual gradients:
  natural-language feedback from an LLM plays the role of a
  gradient, flowing backward through a pipeline so each
  variable — prompt, solution, code snippet, molecule —
  gets rewritten to reduce a loss stated in words. The API
  mirrors PyTorch: `Variable` (with a role description and
  `requires_grad`), `TextLoss` (a natural-language loss
  function), `loss.backward()`, and `TGD` (Textual Gradient
  Descent) as the optimizer. A worked example optimizes a
  wrong reasoning answer (1.2 hours to dry 30 shirts) into
  the correct one (still 1 hour) by critiquing the
  proportional-reasoning flaw. Engines are pluggable
  (OpenAI, Anthropic, and a newer experimental LiteLLM
  engine covering Bedrock, Together, Gemini, and more, with
  caching). Published in Nature, March 2025
  (s41586-025-08661-4); paper arXiv:2406.07496. The
  secondary roundup notes the repo has been quiet since
  mid-2025 at version 0.1.8 — treat as stable-but-static,
  not actively developed. Repo metadata (stars/forks) was
  not retrieved this run for the same search-index reason
  as DSPy; no star count is claimed here.

## Patterns (restated in our own words)

- Typed event memory with explicit outcomes: record
  issues, attempts, fixes, decisions, and notes as typed
  records with a worked / failed / partial outcome, in an
  append-only log plus distilled summary files. The
  typed-event shape is what makes the judgment gate
  possible: a failed attempt is a queryable fact, not a
  paragraph to re-read.
- Deterministic pre-commit judgment gate: before a change
  is accepted, check the typed-event log for a recorded
  failure matching the change's target (file, approach, or
  error signature) and warn before the repeat happens.
  The check is a lookup, not a model judgment — it fires
  on the record, with the recorded failure cited. HALEX-AI
  already gates promotions on tests; the pattern to adopt
  is the placement (before the commit lands) and the
  citation (the prior failed attempt, quoted).
- Never-delete memory with staleness flags: memory is
  never rewritten or pruned by the system; stale entries
  are flagged and a human decides. HALEX-AI already
  refuses unattended rewriting; the pattern to adopt is
  the flag-and-decide split and the bounded summary (open
  items in full, closed items capped, each record clipped).
- Intent kept separate from memory: a `plan.md`-style
  intent file (what is being attempted now) lives apart
  from the event log (what happened). HALEX-AI already
  separates proposals from the chain; the pattern to adopt
  is the explicit split so intent never masquerades as
  history.
- Project-scoped, plain-file memory: memory lives inside
  the project it describes, as plain files, so it moves
  with the code and is reviewable with ordinary diffs.
  HALEX-AI already stages in plain files; the pattern to
  adopt is the scoping rule (one memory per project, not
  one global store) and the diff-reviewability requirement.
- Signatures over strings: declare a task as a typed
  input/output signature and compose modules, instead of
  hand-writing prompt strings. The optimizer then searches
  prompts and few-shot demonstrations against a defined
  metric. HALEX-AI already writes specs before code; the
  pattern to adopt is the signature-first shape and the
  compile-against-a-metric discipline — a compiled prompt
  is an artifact to version, review, and seal like code,
  never a string edited in place.
- Textual gradients as a review mechanism: critique in
  words flows backward through a pipeline, rewriting each
  variable against a stated loss. As a HALEX-AI pattern
  this is a *review* discipline, not an unattended loop:
  a human-written evaluation instruction, a recorded
  critique, and a proposed rewrite that goes through the
  same gate as any other change. No unattended
  self-rewriting, no weight training, no automatic
  adoption of the optimizer's output.
- Bounded optimization, not recursive self-improvement:
  DSPy and TextGrad optimize text (prompts, examples,
  solutions) against a metric; neither rewrites its own
  model. HALEX-AI adopts the same bound: optimization
  searches a defined space against a defined metric, and
  every kept change passes the promotion gate.

## Verdict

GATED, patterns only. projectmem MIT, DSPy MIT, and
TextGrad MIT LICENSEs read verbatim; all three READMEs
read in full. No code adopted, no branding adopted, no
vendor figures adopted (see below). HALEX gate stricter:
no projectmem Python package, MCP server, git hooks,
file watcher, or dashboard code; no DSPy Python
framework, optimizer, LM integration, or fine-tuning
code; no TextGrad Python framework, engines, or API-key
wiring; no provider / network / wallet / signing /
payment / API-key code anywhere; no unattended
self-rewriting, no weight training, no automatic
adoption of optimized prompts.

## NOT adopted (claimed, not verified)

- projectmem's 207-event dogfooding study as an
  independent evaluation (the authors themselves call it
  dogfooding on their own work, across 10 projects); the
  summary token reduction on a real 238-event project
  (8,974 to 3,458 tokens) as a general result; "We don't
  make AI smarter. We make it experienced." (vendor
  tagline); the comparison-table capability claims against
  claude-mem, agentmemory, mem0, and Letta (a June 2026
  snapshot of design capabilities, not benchmark results);
  star counts as quality.
- DSPy paper results (GSM8K 33 to 82 percent, HotPotQA 32
  to 46 percent with GPT-3.5) as HALEX-AI expectations —
  they are the authors' results on their own programs,
  not read or reproduced here; the secondary "most active
  repo", "39.1K stars", "6 million monthly PyPI downloads"
  figures as verified (not retrieved from the repo this
  run); "the standard library for prompt optimization"
  (secondary framing); any fine-tuning outcome.
- TextGrad's Nature publication as an efficacy guarantee
  (publication is a fact; the results inside were not
  re-verified here); the worked shirt-drying example as a
  general result; "stable" as "actively maintained" (the
  repo is quiet since mid-2025 per the secondary roundup);
  star counts as quality.
- TokenF (@tokenf/contracts, MIT per the npm listing):
  repo identity NOT confirmed this run — GitHub
  repository search for "tokenf" returned 1,136 results
  with no TokenF RWA repo among the top hits, and direct
  reads of tokenf/contracts, TokenF/contracts,
  tokenf/tokenf, and TokenF/TokenF all 404. The npm page
  (crawled 2024-06-29) carries no repository link in its
  text. The MIT claim is npm-only; no LICENSE file was
  read. TokenF stays an open lead, ideas only from the
  npm description (ERC-2535 Diamond core, pluggable
  custom compliance modules, KYC/AML checks, early stage
  with breaking changes foreseen) — no entry, no code.
  The npm description's "reimagined and enhanced ERC-3643
  alternative" and "no limitation for the usage" are the
  vendor's words, not verified here.

## Open leads

- Trace / OptoPrime (MIT per secondary roundup, graph
  optimization) — LICENSE unread, self-improvement lane.
- TokenF (@tokenf/contracts) — repo identity unconfirmed,
  LICENSE unread, RWA lane; the npm scope suggests a
  `tokenf` org but no such repo resolves.
- dualmint-addendum stays pending; zinium5-web-fallback-
  lane stays pending (module entry, spec null — counted
  invalid by the drainer, skipped, pre-existing).
