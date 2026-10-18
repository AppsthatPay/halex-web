# HALEX hook — how TradeX-Apex1 plugs into the app

## The relationship

TradeX-Apex1 is APEX¹: the unified signal feed. The HALEX app is the display.
The engine publishes **finished feed JSON**; the app reads it and shows it.
That is the entire integration. There is no deeper coupling, by design.

```
TradeX-Apex1 (always-on box)          HALEX app (Vercel + phone)
────────────────────────────          ─────────────────────────
detection → signals → verdicts
        │
        ▼
 finished feed JSON ──────read-only──────▶ API routes serve the feed
 (launches, signals,                        │
  paper stats, verdicts)                     ▼
                                      token blocks, charts,
                                      watchlists, research
```

This mirrors the halex-web feed model: the always-on box runs the loops and
publishes finished JSON; the web layer serves it to the app. Vercel is
display-only. It never executes trades.

## What the engine publishes

A publisher job (every 15 minutes in the reference build) writes finished,
immutable JSON documents — one per feed:

| Feed | Contents |
|---|---|
| `launches` | Fresh token launches with name, symbol, mint, chain, age, liquidity |
| `signals` | Normalized signals (the handshake schema) with per-source stats |
| `verdicts` | Merit-check verdicts (GREEN/AMBER/RED + reasons) on mirrored buys |
| `paper` | Paper-trader scoreboard: bankroll, open positions, closed-trade win rates |
| `market-index` | Aggregate market snapshot (optional) |

Each document is self-contained and timestamped. Consumers never query the
engine's live databases.

## What the app needs

- **Endpoints:** read-only routes serving the published JSON, e.g.
  `GET /api/feeds/[name]`.
- **Auth:** a bearer token (`Authorization: Bearer <FEED_TOKEN>`) that the
  builder generates. The route fails closed — no token, no data.
- **Freshness handling:** if a feed document is missing or older than its
  expected interval, the route returns 503 and the app shows the last good
  cached copy with a visible "stale" marker. Never silently serve old data
  as fresh.

## What the app must never do

- **Never execute trades.** No buy/sell buttons wired to anything but the
  phone wallet's own signing flow.
- **Never hold keys.** Transaction signing happens on-device (Machine 3).
  Keys never leave the phone.
- **Never call the engine's databases.** It reads published JSON only.
- **Never auto-act on a signal.** A signal in the feed is information. Any
  trade is the user's deliberate action in their own wallet.

## The AI-socket wiring contract

When an AI assembles or operates this hookup, the contract is:

1. **Wire:** connect the publisher output to the feed routes; configure the
   bearer token; verify each route returns fresh JSON.
2. **Operate:** keep the publisher running; alert if a feed goes stale.
3. **Never modify:** the app's hardwired libraries and the engine's shipped
   modules are read-only to the AI. Electrician, not architect.

Concretely, "done" for the hookup means: every feed route returns 200 with
a document newer than its publish interval, an unauthenticated request
returns 401/403, and a stopped publisher produces a visible stale state in
the app — not silent old data.
