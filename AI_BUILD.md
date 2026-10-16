# HALEX — AI Build Guide

*Read this first. Everything an AI agent needs to build, deploy, and run
HALEX from this repo alone. Last verified 2026-10-16.*

## What HALEX is

HALEX web layer: dashboards, feed APIs, app surfaces. Next.js 14, React 18,
deployed on Vercel.

**Architecture law: Vercel is display-only. It never executes trades.**

Three parts, three machines:

```
always-on machine ──publish──▶ Vercel Blob ──/api/feeds/*──▶ HALEX app (Vercel)
       │                                                              ▲
       └── trading loops (supervised, off-Vercel)                      └── phone AiWallet signs txs on-device
```

- **Always-on machine**: runs the trading loops and the nervous system,
  generates finished feed JSON, publishes to Vercel Blob (via
  `scripts/publish-feeds.mjs`) or POSTs to `/api/publish` (via
  `publish-feeds.sh`).
- **Vercel**: serves cached feed JSON through `/api/feeds/[name]`, renders
  dashboards. If a feed is missing or stale, API routes return 503 and the
  app falls back to its shadow copy. Cutover is per-surface, gradual.
- **Phone (AiWallet)**: signs transactions on-device. Tap-to-execution never
  touches Vercel.

## Repo layout

| Path | What it is |
|------|------------|
| `app/page.tsx`, `app/layout.tsx` | Dashboard UI |
| `app/api/feeds/[name]/route.ts` | Serves cached feed JSON from Blob (auth-gated) |
| `app/api/health/route.ts` | Health check (no auth) |
| `source/publish/route.ts` | **Not wired by default.** Copy to `app/api/publish/route.ts` to enable the publish endpoint |
| `lib/feeds.ts` | Feed-reading logic |
| `middleware.ts` | Auth gate: `Authorization: Bearer <HALEX_API_TOKEN>`, fails closed (no token configured = no access) |
| `scripts/publish-feeds.mjs` | Publishes feed JSON direct to Vercel Blob (`npm run publish-feeds`) |
| `publish-feeds.sh` | Cron-friendly publisher: builds feed JSON from local SQLite DBs, POSTs to `/api/publish`. Template — set `HALEX_API_TOKEN` env |
| `tests/push-contracts.test.mjs` | Contract tests: chunk sizes, ASCII, sha256 manifest, verdict/enum contracts (`npm test`) |
| `public/docs/braindata-braintree-software.md` | The trading nervous system's master record (the brain behind the feeds) |
| `.env.example` | Required env vars (values never committed) |

## Prerequisites

- Node >= 18.17 (Vercel builds on 24.x), npm
- A Vercel account with a project connected to this repo
- Two secrets — **generate fresh, never commit**:
  - `HALEX_API_TOKEN` — `openssl rand -hex 32`
  - `BLOB_READ_WRITE_TOKEN` — from the Vercel Blob store dashboard

## Build and deploy

```bash
npm install
npm test        # contract tests must pass
npm run build   # must succeed with no type errors
```

Then: import the repo in Vercel, set `HALEX_API_TOKEN` and
`BLOB_READ_WRITE_TOKEN` as environment variables, deploy.
Every push to `main` auto-deploys (once the Vercel↔GitHub integration is
connected).

## Feed publishing (always-on machine)

Two supported paths — pick one:

```bash
# A. Direct to Blob (needs BLOB_READ_WRITE_TOKEN)
BLOB_READ_WRITE_TOKEN=... npm run publish-feeds

# B. HTTP to /api/publish (needs HALEX_API_TOKEN; endpoint must be deployed)
HALEX_API_TOKEN=... bash publish-feeds.sh   # every 15 min via cron
```

Feeds: `launches`, `oasis`, `market-index`, `enrichment`.
Optional overrides for the shell publisher:
`PUBLISH_ENDPOINT`, `EVM_DB`, `MARKET_INDEX_DB`.

## Enabling `/api/publish`

```bash
mkdir -p app/api/publish
cp source/publish/route.ts app/api/publish/route.ts
```

Auth: `Authorization: Bearer <HALEX_API_TOKEN>`.
Body: `{ "feed": "launches", "data": {...} }`.
Writes to `feeds/<feed>.json` in Blob. Only the four valid feed names
are accepted.

## Secrets policy (hard rules)

- **Never commit**: `HALEX_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`, wallet keys,
  seed phrases, any `*token*.txt`. `.gitignore` covers `.env` and token files.
- An AI rebuilding this system generates **fresh** tokens and sets them as
  Vercel env vars + machine env. It never reuses tokens found elsewhere.
- The local `publish-feeds.sh` on the operator's machine carries a live token
  by design (cron has no vault); the repo copy is the sanitized template.

## The brain behind the app

The trading nervous system — BCIA head, CIA1..n supervisors, hot-swappable
trader skills, Thompson-sampling router, drift detection — does **not** run
on Vercel and is **not** in this repo. Its master record ships here as
`public/docs/braindata-braintree-software.md` (also live at
`/docs/braindata-braintree-software.md` once deployed). Vercel only ever
displays what the brain publishes as feeds.

## Verification checklist

- [ ] `npm test` passes
- [ ] `npm run build` succeeds, zero type errors
- [ ] `GET /api/health` → 200
- [ ] `GET /api/feeds/launches` → 401 without token
- [ ] `GET /api/feeds/launches` with token → 200 (or 503 pre-publish — expected)
- [ ] Publisher run posts `{ok:true}` for all four feeds
- [ ] Push to `main` triggers a Vercel deployment automatically
