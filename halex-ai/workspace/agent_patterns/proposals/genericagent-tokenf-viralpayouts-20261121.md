# Proposal: Self-evolving skill-tree agent patterns (lsdefine/GenericAgent, GATED) + RWA tokenization framework patterns (dl-tokenf/contracts, GATED) + affiliate attribution (viralpayouts/viralpayouts, NOT gated) — 2026-11-21

Sources (LICENSEs read verbatim via the GitHub connector, READMEs read in full, 2026-11-21):
- lsdefine/GenericAgent — MIT License,
  Copyright (c) 2025 lsdefine (LICENSE file SHA
  641d051c0d0e8745e8792048ad0ee627b71d6527). README
  read in full (file SHA
  7ebf1223f69b8393e33c2b6d0741f67074667a58,
  English + Chinese sections). Repo: 14,441 stars,
  1,674 forks, created 2026-01-16, updated
  2026-11-22T00:01:44Z (connector search, run time),
  Python, default branch main, not archived.
  A minimal, self-evolving autonomous agent
  framework: ~3K lines of seed code, 9 atomic tools
  (code_run, file_read, file_write, file_patch,
  web_scan, web_execute_js, ask_user,
  update_working_checkpoint, start_long_term_update)
  plus a ~100-line agent loop, granting an LLM
  system-level control of a local computer
  (browser, terminal, filesystem, keyboard/mouse,
  screen vision, mobile via ADB). Design
  philosophy: don't preload skills, evolve them —
  every solved task crystallizes its execution path
  into a reusable Skill, forming a personal skill
  tree. Layered memory: L0 meta rules, L1 insight
  index, L2 global facts, L3 task skills/SOPs, L4
  session archive; only L0 and L1 load by default,
  the rest on demand. Capability extension via
  code_run (install packages, write scripts, call
  APIs at runtime, crystallize into tools). Modes
  in the roadmap: Morphling (project-level skill
  absorption — extract goal + tests from an
  external repo, then per component decide call,
  rewrite, or discard), Goal Hive (multi-worker
  cooperative goals), Conductor (sub-agent
  orchestration), Goal mode (time-budgeted loops).
  Frontends: TUI, Streamlit web UI, Telegram /
  Discord / Lark / WeChat / QQ / Feishu / WeCom /
  DingTalk IM bots. Requires Python 3.11 or 3.12
  (not 3.14). Technical report on arXiv
  (2604.17091). The README states DintalClaw is
  the sole authorized commercial partner and that
  only GitHub + gaagent.ai are official channels.
- dl-tokenf/contracts — MIT License, Copyright (c)
  2025 Distributed Lab (LICENSE.md file SHA
  5c70f39b330b21f57c1b3897dfdd873327acc383). README
  read in full (file SHA
  5d59e1eed90f02a87254c02bbb4b81377cf7e5af). Repo: 77
  stars, 20 forks, 80 commits, created
  2024-02-13, default branch master, not archived,
  current commit 7de2d0419215311ee6cc8f5723eef401754d657c
  (repo page crawl 2026-11-22 00:46 UTC). npm
  package @tokenf/contracts 0.4.1, published
  2024-03-26, updated 2025-11-12 (npm page).
  On-chain framework for permissioned ERC-20- and
  ERC-721-compatible RWA assets on EVM networks:
  custom rules for KYC/AML and regulatory
  compliance checks; ERC-2535 Diamond as the
  extensible/upgradeable core; pluggable custom
  compliance modules; rich check/hook/behavior
  configuration. Built with Solarity and
  OpenZeppelin. States itself a from-scratch
  ERC-3643 alternative (not a copy), not a
  fullstack framework, not a launchpad, no ERC-1155
  support yet. States it is at an early stage and
  many breaking changes are foreseen.
- viralpayouts/viralpayouts — LICENSE NOT GATED.
  The repo as named does not resolve: GitHub
  connector get_file_contents returns 404, and a
  direct page fetch also returns 404. The public
  page (viralpayouts.com/open-source) describes
  open packages — tracking (MIT), attribution
  engine (AGPL-3.0), MCP server (MIT) — but those
  are secondary claims, and no LICENSE file was
  read from any repository. Nothing from this
  source is gated. Its ideas are restated in our
  own words only below, and only if a readable
  repo ever appears.

## Patterns to adopt (restated in our own words only)

- Skill crystallization (GenericAgent, GATED):
  when a task is solved, record the execution path
  that worked as a reusable skill, indexed for
  recall, so the next similar task replays the
  recorded path instead of re-deriving it. The
  pattern to adopt is the crystallize rule: a
  completed task leaves behind a named, indexed,
  replayable record — never just a log line. HALEX-AI
  already keeps a builder queue and a ZINIUM chain;
  the pattern to adopt is the recall half: skills
  are fetched by task similarity before new work
  starts, and a skill that fails on replay is
  revised, not silently re-run.
- Layered memory with on-demand loading
  (GenericAgent, GATED): stable rules and a small
  index load always; facts, skills, and session
  archives load only when the task needs them. The
  pattern to adopt is the load-on-demand rule: the
  working set stays small by default and grows only
  on a recorded need — the same discipline as the
  ZINIUM mitosis gate (growth on recorded need,
  never speculative).
- Minimal atomic toolset (GenericAgent, GATED):
  nine small tools plus one escape hatch
  (code_run) instead of dozens of specialized
  tools. The pattern to adopt is the small-surface
  rule: a few general operations composed freely
  beat many narrow ones, and the escape hatch is
  explicitly named and bounded, never hidden.
  HALEX gate stricter: no code_run-style arbitrary
  execution, no browser/keyboard/mouse control, no
  ADB, no IM-bot frontends, no API-key handling —
  the toolset shape only, never the execution
  capability.
- Morphling absorption triage (GenericAgent,
  GATED): when taking in an external repo, extract
  its goal and its tests first, then decide per
  component — call it, rewrite it, or discard it.
  The pattern to adopt is the triage rule: intake
  never copies a whole repo; each component gets
  one of three verdicts, recorded with the reason.
  This is the intake gate restated as a procedure.
- Goal mode time budgets (GenericAgent, GATED):
  a self-driven loop runs against a stated time
  budget ("keep optimizing X for N hours") and does
  not deliver early. The pattern to adopt is the
  budget rule: long-running improvement work
  carries an explicit budget and a no-early-delivery
  rule, so a run ends by budget, not by impatience.
- Diamond-core extensibility (TokenF, GATED): one
  upgradeable core with pluggable compliance
  modules, so new rules attach without touching
  the core. The pattern to adopt is the plug rule:
  behavior varies at the edge (modules), the core
  stays fixed; a new rule is a new module, never a
  core edit. HALEX gate stricter: no Solidity,
  no Diamond proxy, no on-chain code of any kind —
  the module-boundary shape only.
- Compliance as check/hook configuration
  (TokenF, GATED): rules are declared as
  checks and hooks with rich configuration, not
  buried in transfer logic. The pattern to adopt is
  the declared-rule rule: every gate a transaction
  must pass is named, ordered, and configurable in
  one place, so the rule set can be read without
  reading the execution path.
- Early-stage honesty (TokenF, GATED): the README
  states plainly that the framework is early-stage
  and breaking changes are foreseen, and names
  what it is not. The pattern to adopt is the
  scope-card rule: a subsystem carries its own
  "is / is not / not yet" card, updated when the
  scope changes, so no one adopts it for a job it
  disclaims.
- viralpayouts ideas (NOT gated, restated in our
  own words only): publish the rules that decide
  who earns and how much, so no one has to trust
  the counter; split the system so the parts that
  decide money are separable from the parts that
  move money; keep attribution order, two-tier
  overrides, rate rules, sub-IDs, coupons, and
  postbacks as written rules, not as code-only
  behavior. No code, no tracking script, no
  attribution engine, no MCP server — the shapes
  only, and only if a readable repo with a LICENSE
  file ever appears. Note the AGPL-3.0 attribution
  engine in the page's own description is NOT a
  permissive license for this program even if the
  repo reappears; AGPL parts stay ideas-only.

## Verdict

GATED adoption (two repos) + ideas only (one
source). lsdefine/GenericAgent is MIT with the
LICENSE read verbatim (file SHA 641d051c…) and the
README read in full; its patterns are gated and a
NOTICE.md entry is added this run.
dl-tokenf/contracts is MIT with LICENSE.md read
verbatim (file SHA 5c70f39b…) and the README read
in full; its patterns are gated and a NOTICE.md
entry is added this run. CORRECTION — TokenF lead
CLOSED: the repo identity is confirmed
(dl-tokenf/contracts, found via code search for
TokenF.sol), the npm MIT claim is now verified
against a real LICENSE.md file, and the README
matches the npm page. The 2026-11-21 ~11:42 run's
"TokenF lead still NOT closed (repo identity
unconfirmed, MIT claim npm-only, no LICENSE read)"
line is superseded. No TokenF source remains
unread. viralpayouts/viralpayouts is NOT gated —
the repo 404s on two independent routes
(connector + direct page fetch), so no LICENSE
file was read; ideas only, restated in our own
words. No code adopted, no branding adopted, no
vendor figures adopted (see below). HALEX gate
stricter: no GenericAgent Python/TMWebdriver/
Streamlit/Textual/IM-bot/API-key code, no
TokenF Solidity/Diamond/OpenZeppelin code; no
network / wallet / signing / payment / API-key
code anywhere.

## NOT adopted (claimed, not verified)

- GenericAgent's self-bootstrap claim ("the entire
  repository was completed autonomously, the
  author never opened a terminal") — described,
  not verified here; not adopted as fact. The
  "6x less token consumption" and "<30K context
  window" efficiency figures, the benchmark tables
  (SOP-Bench, Lifelong AgentBench, LoCoMo,
  WebCanvas, BrowseComp-ZH), the bot-detection
  pass rates (SannySoft 56/56, bot.incolumitas
  36/36, reCAPTCHA v3 score 0.9), the comparison
  table (OpenClaw ~530,000 lines, Claude Code),
  the "million-scale Skill Library" claim, and the
  roadmap dates as delivery promises — all
  described, none adopted. Secondary star figures
  conflict (14,436 in one listing, 14,409 in
  another, 14,441 from the connector at run time);
  the connector figure is recorded as read, none
  is adopted as quality. The "sole authorized
  commercial partner" (DintalClaw) note is
  recorded as the author's statement, not adopted
  as a HALEX position. The pre-installed SOPs are
  written in Chinese and were not read here.
- TokenF's "built from scratch ERC-3643
  alternative" and "yet another ERC-3643 copy"
  framing — the author's positioning, recorded as
  such, not adopted as a verified ecosystem fact.
  The GitBook documentation was not read; no
  claims from it are adopted. The examples
  directory was not executed; no example claim is
  adopted. Star/fork counts as quality NOT adopted
  (77 stars / 20 forks, recorded, not a verdict).
- ViralPayouts' page claims (535 platforms,
  "same code, same tests as production", "works
  offline, no key") — secondary page text, no repo
  read, none adopted. The per-package license
  split (tracking MIT, attribution AGPL-3.0, MCP
  MIT, specs CC BY 4.0) is the page's claim, not a
  LICENSE file read; even if verified later, the
  AGPL part stays ideas-only for this program.
- OpenPartner (getcoherence/openpartner) was
  already gated 2026-11-17 and Weferral is the
  known-stale pattern source — neither re-dived
  this run; no duplicate entries.
- dualmint-addendum stays pending;
  zinium5-web-fallback-lane stays pending (module
  entry, spec null — counted invalid by the
  drainer, skipped, pre-existing).
