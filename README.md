# halex-web

HALEX web layer — dashboards, feed APIs, and app surfaces, deployed on Vercel.

## Architecture

**Vercel is display-only. It never executes trades.**

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

Connect this repo to Vercel (import project), set the `HALEX_API_TOKEN` and
`BLOB_READ_WRITE_TOKEN` environment variables, deploy. Every push to `main`
auto-deploys.

## Publishing feeds (always-on machine)

```bash
BLOB_READ_WRITE_TOKEN=... HALEX_FEED_DIR=/path/to/finished/feeds npm run publish-feeds
```

## Auth

All `/api/*` routes except `/api/health` require
`Authorization: Bearer <HALEX_API_TOKEN>`. The middleware fails closed:
no token configured means no access.
