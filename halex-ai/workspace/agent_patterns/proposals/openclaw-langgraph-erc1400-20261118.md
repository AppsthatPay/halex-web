# Proposal: gateway + channel-adapter personal agent (OpenClaw) + graph-orchestrated stateful agents (LangGraph) + partitioned security-token reference discipline (ODW ERC-1400) — 2026-11-18

Sources (LICENSEs read verbatim via the GitHub API / raw file fetch, 2026-11-18):
- openclaw/openclaw — MIT License, Copyright (c) 2026
  OpenClaw Foundation — LICENSE read verbatim (file SHA
  ed064819ab537575d0cad902f7e5af4a3488b1d0, canonical MIT
  body). README read in full (file SHA
  d4a9d8094ad39c2b54ce8a643e4ce499bbd650f2, 113,287 chars;
  substantive sections lines 1–140, remainder is a
  contributor-avatar table). Repo: 394,740 stars, 82,922
  forks, 8,375 open issues, created 2025-11-24, pushed
  2026-11-18, TypeScript, default branch main, not
  archived. A self-hosted personal AI agent: one local
  Gateway process is the control plane for sessions,
  tools, events, and channel connections; the Control
  UI, CLI, and TUI are thin clients onto it. Channels
  bring the assistant to WhatsApp, Telegram, Slack,
  Discord, Google Chat, Signal, iMessage, and 20+ more
  (29 channels per the project's own site/docs); one
  Gateway runs as a personal claw on a laptop or a
  shared multiplayer claw — configuration is the only
  difference. Models and agent harnesses (Claude,
  Codex, local models) are plugins, swappable without
  changing anything else. Tools, skills, and plugins
  extend the assistant; new capabilities belong in
  plugins built on the plugin SDK and shared through
  ClawHub, a public skill registry with automated scans
  and moderation. Companion apps and nodes add voice,
  Canvas, camera, screen, and device-local actions.
  Onboarding is a wizard that verifies model access,
  creates the workspace, and configures the Gateway.
  Security posture stated in the README: treat inbound
  messages as untrusted input; DM-capable channels pair
  unknown senders by default and a pairing is approved
  by code; tools run on the host for the main session
  unless sandboxing is configured; the architecture case
  is "trusted gateway, untrusted execution, policy
  enforced by code." Telemetry: by default the software
  phones home for nothing but a daily version check;
  anonymous feature statistics are opt-in; one flag
  (`update.checkOnStart: false`) disables both.
  Governance: stewarded by the OpenClaw Foundation, an
  independent 501(c)(3); no paid tier, hosted service,
  or token; donors (including OpenAI, Amazon, Red Hat)
  own or direct nothing. State, memory, and credentials
  live on the operator's own hardware. The project was
  formerly ClawdBot / Moltbot, built for "Molty, a
  space lobster AI assistant." Star counts, the
  "most-starred project in its category" line, the
  February 2026 creator-joins-OpenAI move, and the
  CVE-2026-25253 remote-code-execution report (a
  secondary source: unvalidated WebSocket origin
  headers letting a malicious webpage reach a running
  agent) are secondary-source or vendor claims, NOT
  verified by this run. GitHub's license summary shows
  NOASSERTION for this repo; the LICENSE file itself is
  plain MIT and governs (a secondary source attributes
  the NOASSERTION to a third-party-notices line — no
  such line is in the file fetched by this run).
- langchain-ai/langgraph — MIT License, Copyright (c)
  2024 LangChain, Inc. — LICENSE read verbatim (file
  SHA fc0602feecdd6748623c852ab534e1ca612673c7,
  canonical MIT body). README read in full (file SHA
  97c31e9cb4d8fe56be8d768ce3eb5e22400e897e, 6,395 chars).
  Repo: 45,116 stars, 7,786 forks, 477 open issues,
  created 2023-08-09, updated 2026-11-18, Python,
  default branch main, not archived. A low-level
  orchestration framework for building stateful agents:
  a workflow is a graph — nodes are steps that do work,
  edges are control flow, a shared state schema carries
  information between steps. Durable execution: agents
  persist through failures and resume from exactly
  where they left off; a checkpoint is saved after every
  step. Human-in-the-loop interrupts: a human can
  inspect and modify agent state at any point during
  execution (approve / edit / reject, then resume).
  Memory: short-term working memory for ongoing
  reasoning plus long-term persistent memory across
  sessions, backed by a checkpointer. Multi-agent
  patterns: agents as tools (a manager calls
  specialists) and handoffs (a triage agent passes the
  conversation to a specialist); supervisor,
  peer-to-peer, and hierarchical wirings are all graph
  wirings. The framework does not prescribe prompts or
  agent architecture and does not require LangChain — a
  node can call any model SDK. Stable 1.0 release 22
  October 2025; core API at 1.x since. Ecosystem:
  Deep Agents (higher-level package for planning,
  subagents, filesystem use, built on LangGraph),
  LangSmith (evals / observability, commercial),
  LangSmith Deployment (commercial hosting for
  long-running stateful workflows). A JS/TS equivalent
  exists (langgraphjs). Acknowledgements: inspired by
  Pregel and Apache Beam; public interface draws on
  NetworkX. The README's "trusted by Klarna, Replit,
  Elastic" line and the secondary-source PyPI download
  figures (tens of millions/month) and release-version
  claims are vendor/secondary claims, NOT verified by
  this run.
- OnDemandWorld/erc1400-contracts — Apache License 2.0
  — LICENSE read verbatim (file SHA
  261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64, full Apache
  2.0 text with appendix). README read in full (file
  SHA ff164634f9daad5b9a4c0bb766bbdc0addcb75c3, 14,410
  chars). Repo: 0 stars, 0 forks, 0 open issues,
  created 2025-12-30, updated 2025-12-31, JavaScript
  (Truffle), default branch main, not archived. A
  Solidity implementation of the ERC-1400 security
  token standard, the on-chain core of the ODW
  ASSETTECH legacy STO/RWA reference stack (four
  repos: this one plus a Next.js dashboard, a
  TypeScript/Express backend API, and a Next.js web
  client). ERC-1400 extends ERC20 with: partitioned
  tokens (partial fungibility — fungible within a
  partition, non-fungible across; use cases asset
  classes, lock-up periods, corporate actions);
  certificate-based transfer validation (off-chain
  signed certificates, nonce-based against replay and
  salt-based for one-time use); token holds (tokens stay
  in the holder's wallet but are locked, preserving the
  investor registry; HTLC support; enables
  delivery-vs-payment without registry loss); document
  management binding legal documents to tokens
  (IERC1643); operator management (global and
  partition-specific); controller operations (force
  transfers and redemptions for compliance); sender /
  recipient hooks; DvP swaps (atomic token swaps,
  multi-standard ETH / ERC20 / ERC721 / ERC1400, price
  oracle integration); validator / checker split (a
  transfer-validation extension plus a view-only
  checker); batch issuance and fund-issuer tools;
  ERC1820-based migration support. The repo is explicit
  that it is a REFERENCE implementation, "not intended
  for production use": production today should migrate
  Quorum -> Hyperledger Besu and ERC-1400 -> ERC-3643
  and/or ERC-1155, and contracts should be audited
  before production use. The README's own security
  note flags known considerations in certificate
  validation. 0 stars / 0 forks is a days-old-visibility
  signal, not a quality verdict; the stack is dated
  (2024-era Quorum, Ropsten references in deployment
  docs).

## Verdict
GATED, patterns only. All three licenses are permissive
(MIT, MIT, Apache 2.0).

## Usable patterns (restated in our own words)
- Gateway as local control plane: one long-running local
  process owns sessions, tools, events, and channel
  connections; the UI, CLI, and TUI are thin clients
  onto it. State, memory, and credentials live on the
  operator's own hardware.
- Channel adapters: the assistant meets users in the
  chat apps they already use; one gateway, many
  channels; personal vs shared is a configuration
  difference, not a second system.
- Skills and plugins as swappable extensions: new
  capabilities belong in plugins on a plugin SDK,
  shared through a public registry with automated scans
  and moderation on reports.
- Model-provider plugins: models and agent harnesses
  are swappable without changing anything else; a node
  can call any model SDK.
- Inbound messages are untrusted input: DM-capable
  channels pair unknown senders by default; pairing is
  approved by an explicit code, never silently.
- Trusted gateway, untrusted execution: policy enforced
  by code; tools run on the host for the main session
  only unless sandboxing is configured — sandboxing is
  a configuration decision, recorded, never assumed.
- Telemetry discipline: by default nothing leaves the
  machine but a daily version check; anonymous feature
  statistics are opt-in; one flag disables both.
- Onboarding wizard: verify model access, create the
  workspace, configure the gateway — in that order,
  before first use.
- Graph orchestration for stateful agents: nodes do
  work, edges are control flow, a shared state schema
  carries information; the framework is low-level and
  model-agnostic.
- Durable execution: a checkpoint after every step, so
  a run resumes from exactly where it left off after a
  failure; long-running by design.
- Human-in-the-loop interrupts: a human can inspect
  and modify state at any point, then approve, edit, or
  reject and resume — the checkpoint is the resume
  point.
- Short-term plus long-term memory: working memory for
  the ongoing run, persistent memory across sessions,
  both behind a checkpointer.
- Multi-agent wirings as graph patterns: agents as
  tools (manager calls specialists) vs handoffs
  (triage passes the conversation to a specialist);
  supervisor, peer-to-peer, hierarchical.
- Partitioned tokens: partial fungibility — fungible
  within a partition, non-fungible across — for asset
  classes, lock-up periods, and corporate actions.
- Certificate-based transfer validation: off-chain
  signed certificates with nonce-based replay
  prevention and salt-based one-time use.
- Token holds: lock tokens while they stay in the
  holder's wallet, preserving the investor registry;
  hash-time-locked holds enable delivery-vs-payment
  without registry loss.
- Controller and operator discipline: global and
  partition-specific operators; controllers can force
  transfers and redemptions for compliance — a
  compliance role, never a trading role.
- Document binding: legal documents bound to the
  token itself, not kept in a side file.
- DvP discipline: atomic swaps across standards with a
  price-oracle input; validator and checker split
  (validation extension plus view-only checker).
- Migration discipline for legacy stacks: name the
  successor (chain client and token standard) in the
  open, and mark reference code as reference — never
  as production-ready.

## NOT adopted / excluded by the HALEX gate
- No code: no OpenClaw TypeScript/Node gateway,
  channel integrations, plugin SDK, or ClawHub code; no
  LangGraph Python/JS orchestration code, no
  checkpointer, no Postgres store, no LangSmith, no
  Deep Agents code; no Solidity contracts, no
  Truffle/Hardhat deploy code, no ERC-1400/1820
  implementation, no backend API, no dashboard, no web
  client.
- No network/wallet/signing/payment/API-key code
  anywhere in the HALEX-AI engine; no model-provider
  wiring, no API-key collection, no install scripts
  (no curl-piped-to-shell), no mnemonic or Infura-key
  handling, no mainnet deployment of any kind.
- No telemetry/version-check code in HALEX-AI; the
  telemetry discipline is a design note only.
- No benchmark, download, or star-count claims as fact:
  OpenClaw's star count and "most-starred" line, the
  CVE-2026-25253 report, the creator-joins-OpenAI move,
  and the foundation/donor statements are secondary or
  vendor claims, NOT verified by this run; LangGraph's
  "trusted by" company list and PyPI download figures
  are vendor/secondary claims, NOT verified; the
  erc1400 repo's 0 stars is visibility, not a verdict.
- No RWA contract, settlement, custody, or DvP
  execution code of any kind; no token/NFT factory
  code; no oracle or vault code; no Quorum/Besu/Ropsten
  deployment claim.
- No third-party branding (no lobster, no "EXFOLIATE",
  no Molty lore, no LangChain/LangGraph marks, no ODW
  marks). No star counts as quality.

## What would be built (later, by the builder)
- A gateway-shaped control-plane discipline for
  HALEX-AI's own builder: one local owner of sessions,
  tools, events, and channel connections, with thin
  clients — in HALEX-AI's own vocabulary, stdlib-only.
- A graph-orchestration vocabulary for the self-build
  loop: nodes, edges, shared state schema, checkpoint
  after every step, human-in-the-loop interrupt points
  — as a knowledge entry, patterns only.
- A partitioned-token / certificate / hold / DvP
  vocabulary for the RWA checklist (patterns only),
  alongside the Ankara factory discipline and the OTAS
  conformance-first DvP discipline already staged.
- A channel-adapter pattern for HALEX-AI's own
  surfaces (one assistant, many chat apps) as a design
  note, never as copied channel code.
