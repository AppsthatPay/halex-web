# Proposal: self-improving agent loops (Hermes closed learning loop + SIA three-agent generations) + RWA factory/monorepo discipline (Ankara Chain) — 2026-11-18

Sources (LICENSEs read verbatim via the GitHub API, 2026-11-18):
- NousResearch/hermes-agent — MIT License, Copyright (c) 2025
  Nous Research — LICENSE read verbatim (file SHA
  75410e73319c72cd3e991a501c5455eb78f38375). README read in
  full (file SHA 830be257308736e48f25ac4f2d097888b3a63a2c,
  17,496 chars). Repo: 264,327 stars, 59,647 forks, 53,637
  open issues (count includes pull requests), created
  2025-07-22, pushed 2026-11-18, Python, default branch
  main, not archived. A self-hosted, self-improving AI
  agent: a closed learning loop — it creates skills from
  experience after complex tasks, improves those skills
  during use, nudges itself to persist knowledge,
  searches its own past conversations (FTS5 session
  search with LLM summarization for cross-session
  recall), and builds a deepening model of the user
  across sessions (Honcho dialectic user modeling).
  Skills live as SKILL.md directories, compatible with
  the agentskills.io open standard. Built-in cron
  scheduler with delivery to any platform; spawns
  isolated subagents for parallel workstreams; six
  terminal backends (local, Docker, SSH, Modal, Daytona,
  Vercel Sandbox) plus plugin backends; gateway process
  for Telegram, Discord, Slack, WhatsApp, Signal, CLI
  with cross-platform conversation continuity and voice
  memo transcription; provider-agnostic model switching
  (Nous Portal, OpenRouter, OpenAI, own endpoint);
  imports settings, memories, and skills from OpenClaw,
  Claude Code, Codex CLI, and Cursor (SOUL.md persona,
  MEMORY.md / USER.md entries, user skills, command
  allowlist, messaging settings). Research-ready:
  batch trajectory generation and trajectory
  compression for training the next generation of
  tool-calling models. README's own claim — "the only
  agent with a built-in learning loop" — is the
  vendor's claim, NOT verified by this run. Secondary
  sources cited a February 2026 release and 242k stars;
  the repo itself was created 2025-07-22 per the GitHub
  API and reads 264,327 stars as of this run — the
  release-date claim is NOT verified by this run.
- hexo-ai/sia — MIT License, Copyright (c) 2025 Hexo —
  LICENSE read verbatim (file SHA
  de67384f2e62fe2b3335ec136c39f5a308a8390b). README read in
  full (file SHA f592224077290981d5cee7237ef3502af17bd8f0,
  13,760 chars). Repo: 2,170 stars, 256 forks, 19 open
  issues, created 2026-03-25, pushed 2026-08-26, Python,
  default branch main, not archived. Official
  implementation of "SIA: Self Improving AI with Harness
  & Weight Updates" (Hebbar et al., 2026, arXiv
  2605.27276): a self-improving loop where a language-
  model agent updates both the harness and the weights
  of a task-specific agent. Three roles: Meta-Agent
  reads the task description and generates an initial
  Target Agent; Target Agent attempts the task and
  records actions and results; Feedback/Improvement
  Agent reviews the Target's performance logs and
  rewrites the Target for the next generation. After
  every generation the orchestrator scores the target
  against held-out ground truth (private data never
  exposed to the agent) and feeds the metrics into the
  next generation's feedback prompt. Runs on the Claude
  Agent SDK or OpenHands (Gemini/OpenAI/Anthropic);
  profiles are JSON files bundling (agent_impl, model,
  provider) for meta/feedback and (model, provider,
  agent_reference) for target; bundled tasks gpqa,
  lawbench, longcot-chess, spaceship-titanic; artifacts
  per generation (target_agent.py, agent_execution.json,
  improvement.md with diff rationale from gen 2+); a
  built-in web dashboard visualizes generations, scores,
  trajectories, and logs. Benchmark figures in the
  README (56.6% LawBench gain, 91.9% runtime reduction
  on GPU kernels, 502% single-cell RNA denoising
  improvement, MLE-Bench #1, LawBench 70.1% Top-1 vs
  45% prior SOTA, 14x Triton kernel speedup) are the
  PAPER's claims, NOT verified by this run. README's
  own security warning: the default `--sandbox none`
  mode runs agent-generated code with host access; use
  `--sandbox docker` (no network) for untrusted tasks
  or models. Last push 2026-08-26 — quieter than
  Hermes; the project reads as paper-driven, not
  product-driven.
- ankarachain/ankara-core — MIT License, Copyright (c)
  2026 Cranebolt Technologies — LICENSE read verbatim
  (file SHA f04a021717d3919b876c3b1006a145cb7139e931).
  README read in full (file SHA
  c1bf1454ba8913f1cdd1b39ed2d3161980a016a4, 2,700 chars).
  Repo: 0 stars, 0 forks, 1 open issue, created
  2026-04-11, pushed 2026-11-12, TypeScript, default
  branch main, not archived. Open-source RWA
  tokenization infrastructure (site: "for African
  markets"; built by PIE Drops Studio). Monorepo:
  contracts-evm (Solidity, Hardhat + OpenZeppelin UUPS
  upgradeable), contracts-stellar (Soroban, live on
  Stellar testnet per the README), sdk (TypeScript,
  @ankarachain/sdk), cli (npx ankara), mcp (MCP server
  for AI-assisted deployment), apps/web (landing page).
  Factory pattern: Token Factory, NFT Factory,
  Multi-Token Factory, Escrow Factory, Ramp Settlement
  Factory, plus Manual Oracle and Collateral Vault —
  Stellar testnet contract addresses listed in the
  README (NOT verified by this run). EVM contracts are
  compiled and tested; deployment to Polygon Amoy is a
  future item, in the README's own words. 0 stars is a
  weeks-old-visibility signal, not a quality verdict.

## Verdict
GATED, patterns only. All three licenses are permissive
(MIT x3).

## Usable patterns (restated in our own words)
- Closed learning loop, four phases: execute, evaluate,
  extract, retrieve — after a task finishes, distill
  the experience into a reusable skill document, store
  the outcome in persistent memory, and adjust the
  approach next time. Skills self-improve during use.
- Skill-as-file procedural memory: one SKILL.md per
  skill, versioned, authored, licensed, in a skills
  directory; an open standard for skill interchange
  (agentskills.io shape).
- Session search with summarization: full-text search
  over past sessions plus LLM summaries for
  cross-session recall, capped by count/chars/timeout.
- Dialectic user modeling: the agent builds a
  deepening model of the user across sessions from
  conversation, not from a static profile.
- Three-agent self-improvement generations: a meta
  agent that writes the worker, a target agent that
  does the task and logs everything, a feedback agent
  that reads the logs and rewrites the worker; score
  each generation against held-out ground truth and
  feed the metrics into the next generation's feedback.
- Public/private task split: the agent sees public
  inputs only; evaluation data stays private and is
  never exposed to the agent; the evaluator is a
  separate contract (submission format + metrics dict).
- Improvement rationale as an artifact: each
  generation after the first carries a written diff
  rationale (what changed and why), so generations are
  auditable without re-running them.
- Provider/profile separation: a provider is an
  endpoint + credentials; a profile bundles (agent
  implementation, model, provider) per role — swap
  models without code changes.
- Generation dashboard: per-generation code, prompts,
  plans, scores (accuracy-across-generations chart,
  per-domain breakdown), trajectories, and logs in one
  view.
- Sandbox-by-default discipline for generated code:
  untrusted generation runs isolated with no network
  access; host-access execution is an explicit,
  warned opt-in, never the quiet default.
- RWA factory discipline: one factory per asset shape
  (token, NFT, multi-token, escrow, ramp settlement)
  plus a manual oracle and a collateral vault; upgradeable
  contracts via a standard proxy pattern (OpenZeppelin
  UUPS); per-package commands in a monorepo with a
  root build/test/compile surface.
- MCP server as a deployment surface: an AI-assisted
  deployment tool alongside the SDK and CLI, not
  instead of them.
- Contract-address disclosure discipline: deployed
  addresses listed with deployer and date — but only
  ever as read, never as verified fact unless checked
  on-chain.

## NOT adopted / excluded by the HALEX gate
- No code: no Hermes Python/Node agent code, no
  gateway, no cron scheduler, no terminal backends, no
  TUI; no SIA Python orchestrator, evaluator, or
  dashboard code; no Ankara Solidity/Soroban contracts,
  no TypeScript SDK, no CLI, no MCP server.
- No network/wallet/signing/payment/API-key code
  anywhere in the HALEX-AI engine; no LLM provider
  wiring, no model switching, no API-key collection.
- No benchmark or star-count claims as fact: SIA's
  paper figures, Hermes's "only agent with a built-in
  learning loop," the 242k-star and February-2026
  secondary claims, and Ankara's Stellar testnet
  deployment addresses are all unverified by this run.
- No weight updates: SIA's harness+weight update loop
  is a pattern for harness improvement only in HALEX-AI
  (stdlib-only, deterministic); no model training, no
  weight mutation, no fine-tuning.
- No sandbox execution in HALEX-AI: the sandbox
  discipline is a design note; HALEX-AI never executes
  agent-generated code.
- No RWA contract or settlement code of any kind; no
  token/NFT/escrow factory code; no oracle or vault
  code; no Amoy or Stellar deployment claim.
- No third-party branding. No star counts as quality
  (Hermes 264k stars is adoption signal, not a quality
  verdict; SIA 2,170 stars over a paper-driven repo;
  Ankara 0 stars is new/quiet, not a verdict).

## What would be built (later, by the builder)
- A closed-learning-loop discipline for HALEX-AI's own
  builder: execute -> evaluate -> extract -> retrieve,
  with per-generation improvement rationale artifacts
  and held-out evaluation data the builder never sees.
- A SKILL.md-shaped procedural memory for HALEX-AI
  skills (versioned, authored, licensed), compatible
  with the open skill standard shape.
- A three-role generation pattern (meta / target /
  feedback) for the self-build loop's gap work, in
  HALEX-AI's own vocabulary, stdlib-only.
- An RWA factory vocabulary (token / NFT / multi-token
  / escrow / ramp settlement / oracle / vault) as a
  knowledge entry for the RWA checklist, patterns only.
