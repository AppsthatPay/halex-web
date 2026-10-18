# API catalog — TradeX-Apex1

Every third-party API the system touches. For each: what it's for, which
module uses it, what the free tier looks like, and how the builder gets their
own access. **No keys ship with this package — the builder supplies their own.**

## Live and working

| Endpoint | Purpose | Used by | Access |
|---|---|---|---|
| `https://api.mainnet-beta.solana.com` (+ `wss://`) | Solana RPC + WebSocket: wallet polling, transaction parsing, pump.fun tape | livefeed, mwts_monitor, mwts_ws_watcher, livewallet | Free public endpoint, no key. For heavy use, run your own node or a paid RPC. |
| `https://api.jup.ag/swap/v1/quote` | Jupiter swap quotes on Solana | mwts_executor, live_exec | Free, no key. |
| `https://api.dexscreener.com` | Token pricing, tape (buys/sells), liquidity, pair age — the price feed under every paper trader | signal loop, merit check, all paper traders | Free, no key. Rate-limit politely. |
| `https://api.geckoterminal.com` | EVM new-pools feed (base, robinhood, bsc, eth, hyperevm, unichain) | feed_poll | Free, no key. |
| `https://graph.codex.io/graphql` | Codex new-token discovery (Solana/Base/ETH/BSC) | signal loop, allen3/4/5, codex-wallet, test01-codex | Paid: one-time $1 activation, then $0/month "almost free" — 10,000 req/month, 5 rps, 1 key. Sign up at the Codex dashboard (docs.codex.io), pay the activation, create the key. Auth = raw key in the `Authorization` header (no "Bearer"). Poll lightly: hourly per consumer. |
| `https://ribqa.com/api/public/signals/pending` | Sentinel Aleph signals | signal loop | Free public endpoint. |
| `https://fomotrendings.com/api/calls` | FOMO Trendings signals | signal loop | Free public endpoint. |
| `https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/24h` | GMGN rank signals (Solana swaps) | signal loop | Free public endpoint. |
| `https://api.rugcheck.xyz/v1/tokens/{mint}/report` | RugCheck REST second opinion on Solana mints | test01-newapi | Free, keyless. |
| GoPlus (via `goplus_screen`) | EVM advisory mint screens | test01-newapi (EVM side) | Free. Advisory only — never a sole gate. |
| `https://mainnet.base.org` (+ publicnode fallbacks) | Base + multi-chain EVM RPC | allenx_live_bridge, feed_poll | Free public endpoints, no key. |
| `https://api.binance.us`, `https://api.kraken.com`, `https://api.coingecko.com` | Independent reference prices for sanity gates | signal loop, trade-portal | Free public endpoints. |

## Blocked — what doesn't work and the path to unblock

| API | Status | Unblock path |
|---|---|---|
| Botindex (`king-backend.fly.dev`) | Endpoint unreachable from this network; 0 of 50 free requests consumed | Re-test from the builder's network; if reachable, it slots into the signal loop as a fifth source. Free tier: 50 requests. |
| altFINS | API returns 401 — needs a signup key | Free signup at altfins.com, create an API key, add it to your secrets. Then it becomes a signal source. |
| Helius | No key yet | Sign up at helius.dev, retrieve the mainnet key. Enables webhooks + enhanced Solana RPC. |
| Birdeye | No key yet | Free signup at birdeye.so — Standard tier is 30,000 CU/month at 1 rps. Solana market data, security checks, wallet portfolios. |

## Dead / replaced — do not build on these

- **Jupiter v6 / v2 quote endpoints**: dead. Use `api.jup.ag/swap/v1`.
- **Hosted rugcheck-ai**: dead. Use RugCheck REST (`api.rugcheck.xyz`).
- **Alchemy legacy key pattern**: the old key is dead (401s). If you need Alchemy, create a fresh key.
- **1inch API from restricted egress**: unreachable (Cloudflare block) in some environments. Test from yours; have a fallback quoter.

## Rules for adding a new API

1. It must have a free tier or a trivial one-time cost. The doctrine is
   "we can't pay to play" — no subscriptions to run the core system.
2. Wire it as a **new signal source** behind the normalized handshake schema,
   or as an **advisory screen** — never as a sole gate for live money.
3. New sources earn their place by measured win rate on the paper loop, the
   same as the existing four. No exceptions, no hype.
