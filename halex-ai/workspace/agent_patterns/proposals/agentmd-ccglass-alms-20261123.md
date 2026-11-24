# Proposal: Two-layer agent contracts + local traffic observability + shared operational memory discipline (iamfakeguru/agent-md, GATED; jianshuo/ccglass, GATED; ghassan-ai-projects/alms, GATED) — 2026-11-23

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-23):
- iamfakeguru/agent-md — MIT License, Copyright
  (c) 2026 fakeguru (LICENSE file SHA
  f6a4e3152d2f5f8ac392d5dd5d54716f874cc8af).
  README read in full (file SHA
  c350be51a8ca7896f83a27ba09c5d0ee50d6e266,
  8,049 chars, 263 lines). Repo: 966 stars, 185
  forks, 0 open issues, created 2026-03-31,
  updated 2026-11-22 (connector search, run
  time), language Shell, default branch main,
  not archived. Portable contracts for coding
  agents (Claude Code, Codex, Cursor, Windsurf,
  Aider): one source-of-truth rules file
  (AGENT.md) with the other files as wrappers
  that import it, never copies; repo-local
  hooks; persistent task state in memory/
  files (agents.md, plan.md, progress.md,
  verify.md, gotchas.md); a few helper
  scripts. Core idea stated as two layers:
  rules files (judgment, planning, style,
  process — advisory) and hooks/artifacts
  (type-checks, tests, lint, state updates,
  visual evidence — enforceable where the
  host supports them). If something can be
  forgotten or rationalized away, move it out
  of prose and into a checked artifact.
  Deterministic verification: declare the
  project checks in a config file
  (agent-md.toml), and when no checks are
  detected the hooks allow completion but warn
  the work is unverified. The state hook
  blocks completion when source files changed
  but memory/progress.md did not. Visual
  evidence: a fresh screenshot plus a fresh
  note naming the route, viewport, artifact,
  and observed result. The README is honest
  about what it does not fix: a rules file
  cannot force judgment; hooks only cover
  events the host exposes; pre-commit hooks
  can be bypassed with --no-verify; bash
  safety hooks are guardrails, not a sandbox;
  Cursor and Windsurf get rules plus an
  optional git-hook fallback, not native
  runtime enforcement. CI runs Bats,
  ShellCheck, JSON validation, alias-sync
  checks, and installer smoke tests.
- jianshuo/ccglass — MIT License, Copyright
  (c) 2026 Jian Shuo Wang (LICENSE file SHA
  3335dadfd982dd4e31f8de5dcd583cd7105aa6be).
  README read in full (file SHA
  7414a1110f084bf9fd83a96a5651f747c03124ad,
  19,742 chars, 377 lines). Repo: 940 stars,
  52 forks, 2 open issues, created
  2026-05-22, updated 2026-11-21 (connector
  search, run time), language JavaScript,
  default branch main, not archived. A
  lightweight local logging reverse-proxy +
  web dashboard for coding-agent CLIs
  (Claude Code, Codex, OpenCode, DeepSeek-TUI,
  Reasonix, CodeBuddy, Kimi, Ollama, OpenRouter,
  and more): one command starts a proxy, points
  the client at it via the right base-URL env
  var, launches it, and opens a dashboard
  showing every request in real time — the full
  system prompt, every tool schema, the message
  history, token/cache/cost numbers, and a
  turn-to-turn diff. The key insight: these
  CLIs are Node/native apps that ignore
  HTTP_PROXY/HTTPS_PROXY, so Charles/mitmproxy
  never see the traffic — ccglass sidesteps it
  by intercepting only the plain HTTP hop to
  localhost; the client still does the HTTPS to
  the real API itself. No CA certs, no TLS
  pinning. A provider matrix names the wrapper,
  env var, upstream, and format per provider,
  with the limitations stated plainly per
  provider: Codex in ChatGPT-login mode uses a
  WebSocket transport that bypasses the base
  URL, so the dashboard stays empty; Bedrock
  direct AWS endpoints fail through the proxy
  because SigV4 signs the Host header; Cursor
  subscription models route through Cursor's
  own backend and cannot be intercepted. A
  generic escape hatch (`run --provider /
  --upstream / --env-var -- <cmd>`) covers any
  tool that reads a base-URL env var, and a
  `proxy` subcommand starts proxy + dashboard
  without spawning a child process for IDEs in
  BYOK mode. Captured logs persist under
  ~/.ccglass/sessions/ so they survive
  project-folder deletion.
- ghassan-ai-projects/alms — MIT License,
  Copyright (c) 2026 ghassan-ai-projects
  (LICENSE file SHA
  9398bd1fbeb9774944c4a78bf88ad65559f81f4a).
  README read in full (file SHA
  755f9d4c30dc298a56c2059c75543b4c3aaa35ae,
  4,254 chars, 111 lines). Repo: 3 stars, 0
  forks, 0 open issues, created 2026-06-05,
  updated 2026-08-30 (connector search, run
  time), language Go, default branch main, not
  archived. ALMS (Agent Learning Management
  System), release 0.1.0 (2026-06-09): a
  self-hosted MCP server for shared agent
  learning — an agent registry (register +
  heartbeats), a cross-agent learning store
  (publish, search, sync, soft delete,
  enrichment update flow), and protocol
  distribution by tag, explicitly without
  becoming an agent runtime or orchestration
  framework. The design rule that matters:
  stay out of the hot path — agents continue
  working when ALMS is unavailable and resync
  later. Sync is gap-safe with acknowledgement.
  Accepted, high-confidence learnings export
  as OKF v0.1. Single Go binary backed by
  PostgreSQL, Streamable HTTP MCP transport,
  systemd deployment assets, prompts and a
  skill definition for agent integration. The
  README states plainly this is an initial
  public release and to expect API and workflow
  hardening as real adopters push on sync
  semantics, security boundaries, and
  enrichment workflows.

## Patterns adopted (restated in our own words only)

- Two-layer agent contracts (agent-md): keep
  judgment in advisory rules and proof in
  checked artifacts; never let a rule file
  pretend to enforce what only a hook, test,
  or artifact can prove. One source of truth
  with wrappers that import it, never copies
  that drift. Declare the project's checks
  explicitly; when no checks are detected,
  allow completion only with an "unverified"
  warning attached. Block completion when
  state files are stale relative to source
  changes (the progress.md rule). Visual
  evidence is a fresh artifact plus a fresh
  note naming route, viewport, artifact, and
  observed result — a screenshot without the
  note proves nothing. State the limits of
  the mechanism in the same document as the
  mechanism (the "what this does not fix"
  section is part of the pattern).
- Local traffic observability (ccglass):
  observe what an agent actually sends by
  intercepting the plain local hop, not by
  breaking TLS and not by patching the client.
  Show the full request — system prompt, tool
  schemas, history, tokens, cache, cost, and
  the turn-to-turn diff — on one surface.
  Tabulate per-provider coverage with the
  failure modes stated next to each provider
  (a provider the tool cannot see is listed
  as unseen, never as empty). Keep a generic
  escape hatch for anything that reads a
  base-URL env var, and a proxy-only mode
  that observes without spawning the client.
  Persist captured sessions outside the
  project folder so they survive deletion.
- Shared operational memory discipline
  (ALMS): a fleet learns together through a
  small control plane — registry with
  heartbeats so you know what is running,
  a learning store with gap-safe sync so no
  learning is silently lost, protocol
  distribution by tag so operators can steer
  the fleet without touching each agent, and
  export of accepted high-confidence learnings
  in a portable format (OKF). The control
  plane stays out of the hot path: agents
  keep working when it is down and resync
  later. Soft delete and an enrichment flow
  keep the store revisable, not append-only
  gospel.

## HALEX gate applied (stricter than the sources)

- agent-md: no installer code (the curl|bash
  install route is an external code fetch,
  excluded outright), no hook scripts, no
  SKILL.md or rules files copied, no
  cross-harness enforcement claim as a HALEX
  claim. The two-layer contract and the
  state-hook disciplines are patterns only.
- ccglass: no proxy or dashboard code, no
  network code of any kind in the HALEX-AI
  engine (stdlib-only rule); the observability
  disciplines are patterns only. The
  forward-proxy / TLS MITM mode used for
  CodeBuddy is excluded outright — HALEX
  never intercepts traffic by breaking TLS.
- ALMS: no Go MCP server, no PostgreSQL, no
  auth-token handling, no deployment assets,
  no network/wallet/signing/payment/API-key
  code. The registry / gap-safe sync /
  tag-protocol / out-of-the-hot-path
  disciplines are patterns only.
- Jeffrey's approval decides every promotion
  to a live HALEX-AI file; no loop runs
  unattended; outside code is never fetched.

## NOT adopted

- Any code from any of the three repos (no
  install.sh, hook scripts, SKILL.md files,
  proxy/dashboard code, Go server, or
  migrations).
- The curl|bash and npm/brew install routes
  (install mechanisms, not patterns).
- The ccglass forward-proxy / TLS MITM mode
  (CodeBuddy), or any claim that ccglass can
  see traffic it states it cannot (Codex
  ChatGPT-login mode, Bedrock direct endpoints,
  Cursor subscription models).
- The ALMS author's "verification snapshot"
  test claim (secondary, from the author's own
  article, not run by us) or any production
  readiness claim for a 0.1.0 release.
- The dev.to "5,000 lines of Node" figure for
  ccglass (secondary, not verified against the
  tree).
- The TypingMind MIT claim for agent-md and the
  dev.to MIT claim for ccglass (secondary —
  superseded by the LICENSE files read
  verbatim this run).
- Any star/fork count as quality (966, 940,
  and 3 stars are popularity, not verdicts;
  ALMS's 3 stars and quiet since 2026-08-30
  are recorded, not a verdict).
- Any benchmark or efficacy figure (none
  published in the files read for any of the
  three repos).

## Leads

- CLOSED this run: agent-md
  (iamfakeguru/agent-md) and ccglass
  (jianshuo/ccglass) — owners identified from
  the OSS Hunter source table 2026-11-16,
  LICENSEs now read verbatim, both MIT. ALMS
  (ghassan-ai-projects/alms) — secondary MIT
  claim from the author's article, LICENSE
  now read verbatim, MIT.
- OPEN for a later run: memory-os
  (ClaudioDrews/memory-os, MIT per secondary),
  agent-kernel (oguzbilgic/agent-kernel, MIT
  per secondary). New memory-layer leads
  surfaced by this run's searches (LICENSEs
  unread, secondary MIT claims only):
  AllMemoryMCP (mohui1999/AllMemoryMCP,
  tenant-isolated shared memory, REST + MCP),
  shared-agent-memory
  (Infinite-Monkey-Lab/shared-agent-memory,
  local MCP + SQLite), ALMA-memory (MIT with
  a LICENSE file per the Agent Memory Atlas
  secondary, five-table memory + MCP).
  core-termux (DevCoreXOfficial/core-termux):
  Android-only by design, low relevance —
  lead noted, not deep-dived.
- PromoterKit: marketing-page MIT claim only,
  repo still unidentified — lead open.
  ViralPayouts: repo still 404 on prior runs;
  not re-checked this run — lead carried.
  ContextOS: repo 404 — lead open.
  dualmint-addendum stays pending.
  zinium5-web-fallback-lane stays pending.
