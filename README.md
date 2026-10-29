# halex-web

HALEX web layer — dashboards, feed APIs, and app surfaces. Public surfaces
are hosted on GitHub Pages. **HALEX does not use Vercel** (the Vercel route
was closed on 2026-10-25; every Vercel reference below the Architecture
heading is historical and kept only as a record of the retired setup).

## Products and branches

- **HALEX-M** — the blockchain intelligence app (live token feed, Token DNA,
  APEX² Research, Chaintarium), built by Allen. Live at
  https://appsthatpay.github.io/halex-web/halex-m/ — served from branch
  `gh-pages`, folder `halex-m/`.
- **HALEX-AI** — a full general AI system for everything and everyone
  (research, writing, building, planning, any field), built in the open by
  many AI systems and human collaborators, coordinated by Allen. It lives on
  branch `halex-ai`, folder `halex-ai/`; start at `halex-ai/AI-DIRECTIVE.md`.
  Blockchain intelligence is one branch of HALEX-AI, never its framing.
  HALEX-AI and HALEX-M are separate products.
- **HALEX Labs** — branch `halex-labs`, folder `halex-labs/`.
- **Vibe Research Lab** — branch `vibe-research-lab`, folder
  `vibe-research-lab/`.
- X: https://x.com/HALEXApp
- Links: https://linktr.ee/betasyndicate.com

## Architecture

**Historical (retired 2026-10-25).** The deployment described in this
section was the old Vercel setup. It was display-only and never executed
trades. Current public hosting is GitHub Pages (see Products and branches).

- **Always-on machine** (VPS): runs the trading loops, generates finished feed JSON,
  publishes to Vercel Blob via `scripts/publish-feeds.mjs`.
- **Vercel**: serves cached feed JSON through `/api/feeds/[name]`, renders dashboards.
- **Phone (AiWallet)**: signs transactions on-device. Tap-to-execution never touches Vercel.

```
machine ──publish-feeds──▶ Vercel Blob ──/api/feeds/*──▶ HALEX app
   │                                                  ▲
   └── trading loops (VPS, supervised)                └── shadow fallback: artifact platform
```

If a feed is missing or stale, API routes return 503 and the app falls back
to its shadow copy on the artifact platform. Cutover is per-surface, gradual —
never all at once.

## Feeds

The Blob paths below are the retired Vercel Blob layout (historical).

| Feed | Blob path | Contents |
|------|-----------|----------|
| `launches` | `feeds/launches.json` | Latest launch detections (Solana, EVM, XRPL) |
| `oasis` | `feeds/oasis.json` | Oasis protocol snapshot |
| `market-index` | `feeds/market-index.json` | Full market-index payload |
| `enrichment` | `feeds/enrichment.json` | Launch enrichment rows |

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `HALEX_API_TOKEN` (generate with `openssl rand -hex 32`).
3. `npm run dev`

## Deploy

There is no Vercel deployment and no auto-deploy on push. Public pages are
published to GitHub Pages from branch `gh-pages` (HALEX-M at
https://appsthatpay.github.io/halex-web/halex-m/). The Next.js app under
`app/` is retained in this repo for reference and local development.

## Publishing feeds (always-on machine)

Retired with the Vercel route on 2026-10-25. The old Vercel Blob token line
that stood here has been removed; any Vercel Blob token that was ever live
should stay revoked, as the service is no longer used.

## Auth

All `/api/*` routes except `/api/health` require
`Authorization: Bearer <HALEX_API_TOKEN>`. The middleware fails closed:
no token configured means no access.

## Setup: extra directories

This repo carries two packages alongside the web app. Use them during setup:

### `TradeX-Apex1/` — the trade system, buildable

APEX¹: the unified signal feed. Full build guide for standing up the trade
engine (paper first, live only behind measured proof).

1. Read `TradeX-Apex1/README.md`, then follow `TradeX-Apex1/AI_BUILD_PROMPT.md`
   step by step (7-step assembly order; each step has a "done" check).
2. Copy `TradeX-Apex1/.env.example` to `.env` and fill in **your own** keys and
   wallets — no secrets ship in this repo, ever.
3. Paper trade first. Live arming requires ≥65% measured win rate over ≥30
   closed paper trades, plus the triple-gate (explicit override + key file +
   armed flag). See `TradeX-Apex1/docs/PAPER_VS_LIVE.md`.

### `halex-security/` — software security system, installs with the app

Code, not a prompt. Two installs:

- **Server** (always-on box / API routes): `pip install ./halex-security`
- **Android app**: include the `:halex-security` module from
  `halex-security/android/halex-security` in `settings.gradle.kts`.
- Run the checks: `pytest` (Python, 17 tests) and
  `./gradlew :halex-security:test` (Android, builds on GitHub).

What it enforces: UXSS + SHELL verification gates on untrusted input, the
AI-socket policy (AI wires and operates — never modifies the app or its
libraries), safe secret handling, append-only audit log, fail-closed
multi-gates. Full rules in `halex-security/README.md`.
