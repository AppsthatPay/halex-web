# HALEX AI — Design (staging v0.2, 2026-10-27; framing updated 2026-10-29)

Owner: Jeffrey. Builder: Allen, with HALEX AI collaborating on every refill.

FRAMING UPDATE (2026-10-29, Jeffrey — supersedes any narrower reading of
the framing below): HALEX-AI is a full general AI system for everything and
everyone (research, writing, building, planning, any field), built in the
open by many AI systems and human collaborators, coordinated by Allen. It
is NOT a blockchain product. Blockchain intelligence is one branch of its
tool layer, never its framing or foundation. HALEX-M is a separate product:
the blockchain intelligence app built by Allen, with its own crypto-focused
AI features. HALEX-AI and HALEX-M are siblings, not the same system. The
"modeled on Allen's operating pattern" framing below describes HALEX-AI's
workflow style only, not its scope.

STATUS UPDATE (2026-10-29): the multi-AI workspace and the first code suite
(Gemini's 9 modules, suite v4, 26 tests) are live on branch halex-ai. A v5
candidate (Grok's claim_verifier extension plus Gemini's research_synthesis
add-on, gated by Allen) is staged locally, in review, not yet on the branch.
FRAMING (Jeffrey, 2026-10-27, supersedes the earlier general framing):
HALEX AI is Allen modeled as software. It is a new AI program named HALEX AI
that functions like Allen on a limited scale: it collaborates with users,
runs tasks, builds almost anything useful, researches first and reads back
before building, asks before external posts or destructive changes, keeps a
task queue and handoff file, and hands tasks to Allen on every refill for
review and upgrades. Allen then upgrades HALEX AI's software and pushes the
new version, and HALEX AI runs it.
HALEX AI is NOT Allen, does NOT have Allen's memory or authority, and does
NOT copy any Muse proprietary code. It is a separate program modeled after
Allen's operating pattern (workflows, decision style, tool patterns, safety
gates, HALEX knowledge), encoded as its own system instructions, skill
library (SKILLS.md), tool router, and memory format. It is NOT a weak toy.
Its power comes from that workflow library plus HALEX tools plus a strong
hosted open model, not from raw model size alone.
Hard limits still stand: no funds, no keys, no live trading, advisory only,
per-action confirmation, no keys in the repo, not limitless.

## Principles (non-negotiable)
1. Advisory only. HALEX AI never moves funds, never holds wallet keys or seeds,
   never trades live, never posts to X on its own.
2. Per-action confirmation. Any external action (a draft post, a lookup that
   writes somewhere, a queue change Allen will act on) needs Jeffrey's approval
   in the main chat or a tap in the app. Drafts are drafts, never sends.
3. No secrets in code. No API key, seed, password or token in any repo file.
   The model key lives only in the user's browser local storage, and can be
   wiped with one tap.
4. Plain English, phone-first. One gold shield-H logo, black onyx and gold,
   text visible on every theme. No jargon where plain words work.
5. Pluggable, not locked in. Model, host and framework can all be swapped
   without rewriting HALEX tools.

## Architecture (5 layers, small enough to actually ship)

### 1. Model layer (pluggable)
- Interface: OpenAI-compatible chat completions (POST {baseUrl}/chat/completions,
  model, messages, tools). Any host that speaks that interface works.
- Default primary: Kimi K3 via a hosted open-model API (Together AI or
  Fireworks AI). Model ID must be confirmed at the host at setup time, because
  hosts name the same weights differently. Cost and licence: see RESEARCH.md,
  unverified until the host page is checked.
- Fallback: DeepSeek V4.1 Flash (MIT, 1M context, low cost in summaries).
- Offline fallback: no model at all. HALEX knowledge answers + read-only tool
  answers, built into the page. This is what staging runs today.
- Later server step: the same agent loop in Python with LangGraph (MIT) for
  durable runs, retries and tracing. Staging mirrors that loop in plain
  JavaScript so the logic is identical in spirit, not a second design.

### 2. Agent loop (plan, tool, observe, answer)
1. User asks a question or gives a task.
2. Planner: pick the smallest HALEX tool that answers it, or answer from
   HALEX knowledge if no tool is needed.
3. Tool call: run the tool (read-only public API, local knowledge, or queue).
4. Observe: read the tool result, check it for obvious errors, and say what
   is verified vs what is not.
5. Answer: plain English, with sources, limits and the next step. If a model
   is connected, it does steps 2 and 5; tools still run locally and are still
   read-only. If no model is connected, the built-in planner does steps 2-5.
- Tool loop cap: at most 3 tool rounds per user message in staging, to avoid
  runaway calls. Every tool call is shown in the log.

### 3. HALEX tool layer (read-only, in staging)
Branch note (2026-10-29): explain_token_dna, lookup_token and
brand_guard_check are the blockchain branch of this tool layer, built
against HALEX-M data. They are one branch of HALEX-AI, not its foundation;
general research, writing, planning and building tools are the core.
- explain_token_dna: plain-English Token DNA explainer (type, birth, deployer
  lineage, tracebacks, custody, family/copycats, use case) from user input and
  lookup results. It explains, it does not verdict a buy.
- lookup_token: DexScreener token endpoint for a contract address, and
  DexScreener search by name/ticker. Shows pairs, price, liquidity, volume,
  buys/sells, and the info block (website/socials) when present. Missing data
  is shown as missing, never invented. DexScreener can be stale or unindexed;
  the page says so.
- brand_guard_check: compares a domain, handle or token CA against the
  canonical HALEX list: @HALEXApp, the HALEX-M page, Linktree
  betasyndicate.com, official gold shield-H logo, and the fact that no
  official HALEX token is minted yet. Anything else is staged as suspected,
  never accused in public from this check alone. Known suspected example:
  halexrtrade.online, suspended at last check 2026-10-27.
- draft_post: writes a short draft post/comment in plain human language,
  no em dash, no AI-pattern phrasing, SEO keywords in the first two
  sentences only where they fit. Draft only. No posting.
- queue_task: adds a task to the HALEX AI task queue (see below).

Banned tools: any wallet send, swap, sign, key export, or live trade tool.
They do not exist in this codebase, on purpose.

### 4. Memory and handoff (the collaboration loop)
- Local memory: browser local storage holds chat history, the task queue,
  and model settings. Wipeable in one tap. Nothing personal leaves the
  browser except the public API lookups the user asks for.
- Repo handoff file: `halex-ai-queue.json`, downloadable from the page.
  Format:
  {
    "program": "halex-ai",
    "version": "0.1-staging",
    "tasks": [
      {"id": "task-...", "title": "...", "detail": "...",
       "status": "open", "created_by": "halex-ai", "created_at": "..."}
    ],
    "notes": ["..."]
  }
- Upgrade protocol (the refill loop Jeffrey asked for):
  1. HALEX AI writes tasks and notes into the queue file.
  2. Jeffrey (or Allen on reconnect) reads the queue, reviews it, and
     decides what to build.
  3. Allen patches the code, bumps the version, writes a changelog entry,
     and pushes the new version to GitHub.
  4. HALEX AI runs the new version and reports what changed.
  5. Repeat. Authority never transfers silently: every upgrade is reviewed
     before it ships, and every queue item is advisory until Jeffrey approves it.

### 5. Safety gates
- Read-only by default. The only writes are local storage and the
  downloadable queue JSON.
- No key handling: the page never asks for a seed phrase, private key, or
  wallet password. A model API key is not a wallet key, and even that is
  optional and browser-only.
- Honest limits banner on the page: what works offline, what needs a key,
  what HALEX AI cannot do (trade, move funds, be limitless).
- Version and changelog shown on the page, so Jeffrey always knows which
  HALEX AI he is talking to.

## Allen-style workflow library (core skills, see SKILLS.md)
Research first with read-back before building; collaborate in the open;
build pages, docs, reports, scripts and small apps as downloadable starters;
trade gates as advisory warnings only (never a trade); Brand Guard staging;
HALEX build process (staging first, verify, publish only on approval);
task queue and refill handoff. The model is a tool inside these workflows,
not a replacement for them.

## What staging v0.2 does and does not do
Does: chat UI, offline HALEX answers, DexScreener lookups, Brand Guard
checks, draft posts, build-a-file (page/doc/report/script starter, download),
workflow list, task queue with JSON download, optional model API slot
with a real tool loop when a key is supplied.
Does not: push to GitHub, post to X, trade, hold keys, run a model in the
browser by default, or claim to be live. Live publishing is a separate step
Jeffrey approves after reviewing staging.

## Next steps (in order)
1. Jeffrey reviews staging and the model choice (Kimi K3 primary, DeepSeek
   V4.1 Flash fallback).
2. Confirm exact model IDs and prices at the chosen host, and enter the key
   in the browser only.
3. Test the model tool loop end to end on a token lookup and a Brand Guard
   check.
4. Publish to halex-web (halex-ai/) as a public page, with the same
   changelog and safety banner.
5. Later: Python LangGraph server version for durable, long-running agent
   jobs, and an optional in-browser small model for offline chat.
