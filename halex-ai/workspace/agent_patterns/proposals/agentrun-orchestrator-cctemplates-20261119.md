# Proposal: self-improving agent platform (AgentRun) + parallel fleet orchestration (Agent Orchestrator) + community skills registry with PR validation (Claude Code Templates) — 2026-11-19

Sources (LICENSEs read verbatim via the GitHub connector, 2026-11-19):
- Parcha-ai/agentrun — Apache License 2.0 (LICENSE file SHA
  d645695673349e3947e8e5ae42332d0ac3164cd7, canonical Apache
  2.0 body; no copyright line in the file itself; README
  license section: "Apache-2.0. Copyright 2026 Parcha Labs,
  Inc. Built by Grep.ai"). README read in full (file SHA
  328ca31bdbd064c514e74db418dd1f4587e4fc43, 37,949 chars).
  Repo: 1,227 stars, 98 forks, 49 open issues, created
  2026-09-23, updated 2026-11-19, JavaScript, default
  branch main, not archived. An open-source platform that
  adds self-improvement, durable execution, and a control
  plane on top of existing agent harnesses (pi, Claude Code,
  Codex, OpenCode) instead of replacing them. Learning: after
  each run the agent keeps what will help next time — a note,
  a skill, or a workflow — in its own git folder, and every
  run starts from that folder's `main`. Two learned things:
  corrections (a grade's words, or a message sent after a
  run's first answer, become one line of `corrections.md`,
  given whole to every later run under `# Learned`) and
  learned workflows (after 20 completed runs by default, one
  run's end compiles the job into a workflow draft; code
  checks the draft and dry-runs it with no model asked and
  no tool run, then it is replayed once on those runs' inputs
  and serves only when it answers enough of them alone and
  agrees with the agent's answers). Learning guards: caps
  (2048 bytes corrections.md, 16384 draft workflow.json,
  1024 draft README — a write over a cap is refused whole,
  never cut); a secret or a secret's shape in a correction or
  draft refuses it; a held draft gets one revision, shown the
  inputs it disagreed on, held again it stops, and nothing
  compiles again until a person acts. Durable execution: every
  agent, revision, run, and step lives in one store (SQLite by
  default, Postgres via URL); stop the server mid-run and the
  run carries on; with several runners, another runner picks
  up a dead runner's runs once its 30-second lease runs out; a
  finished step is never run again; a write a crash cut off
  mid-call is marked interrupted rather than retried, so a
  person can check it. Control plane: per-tool approvals
  (allowed / ask-first / denied; a server deny holds over an
  agent's "never ask"), spend caps (a run pauses at its cap
  instead of failing and tells you the least it needs to go
  on; an unpriceable cost reads "unknown", never $0),
  questions (an agent stops and asks, the run waits), one
  console (Mission Control: what needs you, what failed,
  what's running, what it cost, by day, by harness, by tool).
  Typed workflows: tool calls, model steps, and fast typed
  decisions (yes/no, pick one, a score, each with its
  confidence) with an agent fallback when a case is unclear;
  a step can ask a fast typed question, see how sure the
  answer is, and pick a route against a threshold (README
  example: approve 0.61 below a 0.75 bar goes to review).
  Workflows run as an agent's revision under the agent's tool
  permissions and a cap, can be paused/resumed, and every
  decision is readable with its reason. Templates: five
  ready-made agents (code-review, KYB due diligence,
  market-monitor, inbound-lead, release-notes), each one
  folder (instructions, skills, rules, eval cases); a
  template's eval cases run as real runs on a throwaway server
  and are graded. Triggers start capped runs on their own:
  schedules, signed webhooks, GitHub PR events, Composio
  events. Computers: one setting per agent (none, sandbox,
  desktop, phone, browser), each with its own providers; an
  agent gets the tools for that kind and nothing else.
  Security: every saved secret sealed under one key
  (AGENTRUN_SEAL_KEY); secrets write-only, shown only as set
  or missing; a run gets only the keys its own model and tools
  need, and nothing a run learns can keep a secret it was
  handed; the API token cannot write a secret or approve a
  tool call. Anonymous usage counting is on by default and
  off with AGENTRUN_TELEMETRY=0 or DO_NOT_TRACK=1. Status:
  released 12 November 2026 (Show HN); Grep.ai in the Fall
  2026 Y Combinator batch (secondary report).
- OrchestratorInc/agent-orchestrator — Apache License 2.0
  (LICENSE file SHA
  0963902dbd478bcf554d8d16ece3887338520535; appendix line
  "Copyright 2026 Untrivial"). README read in full (file SHA
  3630865a27acb6f93b188972c69563910f4fb55d, 19,648 chars).
  Repo: 14,923 stars, 2,057 forks, 1,042 open issues, created
  2026-02-13, updated 2026-11-19, TypeScript, default branch
  main, not archived. A local desktop workspace for running a
  fleet of coding agents while keeping branches, reviews, and
  CI failures manageable. One task gets one agent, one branch,
  and one git worktree; code stays on the machine. The
  orchestrator (main agent) plans the work, starts a worker
  per piece in its own worktree, and comes back only when
  something needs a person. Sessions sort into Kanban lanes
  from the agent, its PR, CI, and reviews, so whatever needs a
  person is on top. Feedback routing: failed checks, review
  comments, and merge conflicts go back to the worker that
  owns the branch until the PR is approved; a reviewer agent
  can read every PR before a person does. 35+ worker agent
  harnesses via plugins (Claude Code, Codex, Cursor,
  opencode, Aider, Copilot, Grok, Kimi, Pi, Amp, Auggie,
  Droid, Crush, Cline, Goose, Qwen, Continue, Devin, Kiro,
  Kilo Code, Vibe, Muse, Agy, Autohand, Kimchi, Prime Agent,
  OMP, fx, Unreal Agent, MiMo Code, Gemini CLI, DeepSeek,
  OpenCode 2, Codewhale, Command Code, OpenHands — worker,
  chat, and reviewer support differ by agent). Each worker
  also gets a browser to preview and test its app. Mobile
  companion (iPhone/Android, paired by QR): push alerts when
  an agent has a question or needs approval, reply in chat,
  approve, open the agent's terminal, start a worker, review
  PRs. Cloud agents: "Clone to the cloud" runs workers in
  hosted workspaces so tasks keep going with the laptop
  closed. Telemetry: limited usage and reliability telemetry
  (installation ID and GitHub username; never code, prompts,
  conversations, or credentials), off in Settings > General >
  Privacy. Install: desktop app (macOS/Windows/Linux),
  self-updating, no CLI required. CORRECTION RECORDED: the
  repo moved from composiohq/agent-orchestrator to
  OrchestratorInc/agent-orchestrator; secondary sources
  still cite the old org and an "8,700 stars" figure from
  February 2026 — both stale. The current canonical repo is
  OrchestratorInc/agent-orchestrator at 14,923 stars.
- davila7/claude-code-templates — MIT License, Copyright (c)
  2025 Daniel (San) Ávila (LICENSE file SHA
  b92d7062bc207a15cf2fee3d04280fec730c8440). README read in
  full (file SHA
  2b9090dff4eaa7b785dbb133960246fee90cce33, 12,660 chars).
  Repo: 34,002 stars, 4,051 forks, 546 open issues, created
  2025-07-04, updated 2026-11-19, Python, default branch
  main, not archived. An open catalog of components for
  Claude Code, installable with one command: 1,980+
  components at aitmpl.com — 918 skills, 422 agents, 288
  commands, 119 MCPs, 80 settings, 63 hooks, 50 mods, 18
  loops, 14 templates, 11 sandboxes, 1 plugin (live counts in
  dashboard/public/counts.json). The CLI writes each file to
  the right place and merges existing configuration instead of
  overwriting it; every component page shows its exact
  install command. Validation gate: every pull request is
  checked by Claude Code's plugin validator and scanned by
  NVIDIA SkillSpector — a validation pipeline pattern, not a
  safety guarantee (a secondary review notes neither tool
  guarantees safety or quality). Attribution table: catalog
  components keep their original licenses (MIT, Apache 2.0,
  CC0 1.0 sources listed, incl. anthropics/skills,
  obra/superpowers, wshobson/agents, K-Dense-AI scientific
  skills). Local tools: `--analytics` (real-time session
  monitoring, localhost:3333), `--chats` (conversation
  browser, localhost:9876), `--health-check` (diagnose the
  Claude Code install); the two dashboards listen on
  127.0.0.1 only because they serve conversation history.
  Loops: autonomous workflows with a goal, an interval, and a
  stop condition (docs sweep, build-test-fix, adversarial
  review). Sponsors on the README include Swiftproxy (with a
  10%-off code), Z.AI, and Bright Data; supporters include
  NVIDIA Inception, Claude for Open Source, Vercel OSS, Neon
  — sponsorships recorded, not endorsements. Component counts
  are self-reported by the maintainers and not independently
  verified.

## What would be built (patterns only, restated in our own words)

- Self-improvement loop with a check-before-keep gate: an
  agent keeps corrections (human words, whole-file, capped,
  secret-shape refusal) and learned workflows (compiled only
  after N completed runs, code-checked, dry-run without model
  or tools, replayed once against the original inputs, serves
  only on agreement; one revision for a held draft, then it
  stops until a person acts). The HALEX-AI version keeps the
  AgentRun shape — git-backed learning folder, one branch,
  caps that refuse whole instead of cutting — and the HALEX
  gate on top: no unattended engine self-modification, no
  network/wallet/signing/payment/API-key code, learned
  artifacts are proposals until the builder's tests, mutation
  check, forbidden-construct scan, and seal all pass.
- Durable run store with lease takeover: one store for agents,
  revisions, runs, and steps; a finished step never re-runs;
  a crash-interrupted write is marked interrupted, never
  silently retried; a dead runner's runs are picked up after
  a short lease expires. This is the shape HALEX-AI's
  self-build cycle already approximates with its seal log;
  the pattern to adopt is the interrupted-not-retried marking
  and the lease, not the SQLite/Postgres store itself.
- Typed workflow with confidence-scored decisions: steps that
  ask a fast typed question, read the confidence, and route
  against a threshold (approve below bar goes to review);
  every decision readable with its reason; pause/resume;
  agent fallback for unclear cases. HALEX-AI's builder queue
  entries already carry a spec vocabulary; a confidence-scored
  decision step is a candidate vocabulary extension, gated
  the same way.
- Control-plane discipline: per-tool allow/ask/deny with a
  server-level deny that holds over an agent's "never ask";
  spend caps that pause instead of failing and state the
  least needed to continue; unpriceable costs read "unknown",
  never $0; one console for what needs a person, what failed,
  what's running, what it cost.
- Fleet orchestration with worktree isolation: one task, one
  agent, one branch, one git worktree; a planning orchestrator
  that splits work and returns only when a person is needed;
  feedback (CI failures, review comments, merge conflicts)
  routed back to the worker that owns the branch until the PR
  is approved; a reviewer agent reads every PR before a
  person does; sessions sorted into lanes by status so what
  needs a person is on top. Complements the staged
  worktree-isolation specs (2026-10-31) with the
  feedback-routing and lane-sorting halves.
- Harness-agnostic agent layer: approvals, caps, computers,
  triggers, and learning work the same on every harness; a
  capabilities probe reports which harnesses a server runs.
  HALEX-AI already treats harnesses as interchangeable; the
  pattern to keep is "one control plane, many harnesses",
  never a per-harness special case in engine code.
- Skills registry with a PR validation pipeline: a catalog of
  small installable components (skills, agents, commands,
  hooks, MCPs, settings, mods, loops) with per-component
  install commands, live counts, and every pull request run
  through a validator plus a security scanner before merge —
  with the explicit caveat that validation is not a safety or
  quality guarantee. HALEX-AI's Skills Lab direction (Home /
  Markets / Oasis reorg, pending Jeffrey's builder green
  light) can borrow the catalog shape and the
  validate-then-scan gate; component counts and sponsor
  claims stay the maintainers', not ours.
- Local-only dashboards bound to loopback: session analytics
  and conversation browsers listen on 127.0.0.1 only because
  they serve history; remote access only over an SSH forward.
  A standing HALEX-AI rule in miniature — history never
  leaves the machine by default.

## Verdict

GATED, patterns only. All three licenses read verbatim
(Apache 2.0 + Apache 2.0 + MIT); all three READMEs read in
full. No code adopted, no branding adopted, no vendor
figures adopted (see below). HALEX gate stricter: no
AgentRun TypeScript/Node server, runner, harness adapters,
MCP servers, Docker/Helm/Railway/Render deploy, Composio
key wiring, or ChatGPT-plan sign-in flow; no
Agent-Orchestrator desktop app, daemon, mobile app, cloud
agents, or telemetry code; no claude-code-templates CLI,
component files, or install scripts; no network / wallet /
signing / payment / API-key code anywhere.

## NOT adopted (claimed, not verified)

- AgentRun case-study figures: code-review bill $180 -> $6,451
  a month, 18 cents a review, 1.6x the real bugs Greptile
  caught on 30 unseen PRs; merchant classification $0.89 ->
  $0.12 a merchant, 7x cheaper; "use fewer tokens with every
  run"; deploy walk times (46 seconds Railway, 85 seconds
  Render); hosting prices ($5 Railway Hobby, $25 Render
  instance, €5.49 Hetzner, $6 DigitalOcean) as current fact;
  Grep.ai Y Combinator Fall 2026 batch (secondary report).
  The README itself marks its learning screenshot "demo data
  from the console's recorded fixtures".
- Agent-Orchestrator "8,700 stars" and composiohq org (both
  stale; canonical repo is OrchestratorInc at 14,923 stars as
  read 2026-11-19); any "meta-harness agent IDE" positioning
  as fact; mobile-app store listings as verified.
- Claude Code Templates component counts (918 skills, 422
  agents, 1,980+ total) as independently verified — the
  maintainers self-report them; "33,000 stars" news figure
  (secondary; API reads 34,002); sponsor discount codes and
  sponsor/supporter logos as endorsements; the PR validation
  pipeline (plugin validator + NVIDIA SkillSpector) as a
  safety guarantee — the secondary review itself says it is
  not one.
- Star counts as quality, for all three.

## Open leads

- Aboudjem/ERC-6960 (MIT per secondary report, dual-layer
  token standard, draft; real-estate fractional-ownership
  example) — LICENSE unread, low priority, RWA lane.
- agentskills/agentskills spec repo itself (Apache 2.0 code,
  CC-BY-4.0 docs) — the agentskills.io-compatible skill shape
  was already staged 2026-11-16; the spec repo is a
  follow-up, not a new lead.
