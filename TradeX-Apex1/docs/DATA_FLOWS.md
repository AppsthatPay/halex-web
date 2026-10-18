# Data flows — TradeX-Apex1

Five end-to-end flows. Each lists numbered steps as
**input → transform → output**, naming the exact tables and files.

## The normalized signal handshake

Every signal source is adapted into this one schema before it enters the
signal loop. See `examples/signal_schema.json`.

```
{ source, market, direction, entry, stop, take_profit,
  signal_time, signal_id }
```

- `source`: which source produced it (codex, sentinel-aleph, fomotrendings, gmgn_rank)
- `market`: chain, e.g. `solana`, `base`
- `direction`: `long` (new-token launches are long-only in practice)
- `entry`: reference price in USD at signal time (0 if too new to price)
- `stop`: conventional frame = entry × 0.70 (−30%)
- `take_profit`: conventional frame = entry × 2.0 (+100%)
- `signal_time`: ISO-8601 emission time
- `signal_id`: `<source>-<address-prefix>-<unix-time>`, unique per signal

---

## Flow 1 — Solana launches → detection → signal loop → paper ledgers

1. **Input:** pump.fun program WebSocket events on Solana mainnet.
   **Transform:** `livefeed` decodes CreateEvent/TradeEvent from Anchor logs.
   **Output:** `radar.db` tables `tape_launches` (mint, name, symbol, creator, slot, ts)
   and `tape_trades`.
2. **Input:** `tape_launches` rows.
   **Transform:** launch-scanner scores detections (relaunch, social, migration).
   **Output:** `newact.db` table `detections`.
3. **Input:** signal sources (Sentinel Aleph, FOMO Trendings, GMGN Rank, Codex
   `filterTokens` for tokens created in the last 2h).
   **Transform:** each adapter normalizes to the handshake schema; DexScreener
   prices every signal.
   **Output:** in-memory normalized signals.
4. **Input:** normalized signals.
   **Transform:** paper loop takes them raw (gates disarmed for measurement),
   simulates fills with the conventional −30%/+100% frame.
   **Output:** `signal-follower-ledger.jsonl` (one line per fill/exit) and
   per-source stats (taken, wins, win rate, expectancy, drawdown).

## Flow 2 — GeckoTerminal new_pools → epools → Allen2 sandbox

1. **Input:** GeckoTerminal `new_pools` endpoint, polled every 5 minutes for
   base, robinhood, bsc, eth, hyperevm, unichain.
   **Transform:** `feed_poll` upserts fresh pools.
   **Output:** `evm.db` table `epools(chain, pool_address, base_address,
   base_symbol, quote_symbol, pool_created_at, reserve_usd, first_seen)`.
2. **Input:** `epools` rows (fresh launches).
   **Transform:** `allen2_sandbox` evaluates candidates against entry gates
   (age, liquidity, tape).
   **Output:** simulated fills with slippage+gas overlay.
3. **Input:** simulated fills.
   **Transform:** position management (punch-ladder exits), ledger append.
   **Output:** `state.json` + `ledger.jsonl` in the trader's own directory.

## Flow 3 — Mirror-wallet intel → merit check → mirror alerts

1. **Input:** watch list of proven Solana wallets (`config.json`).
   **Transform:** `mwts_monitor` (poll every 10 min) parses transaction
   token-balance deltas via Solana RPC; `mwts_ws_watcher` (WebSocket push)
   catches buys within ~1–2 seconds.
   **Output:** `pumpfuntop2.db` tables `mirror_trades(ts, wallet_label, wallet,
   sig, kind, mint, amount_ui)` and `funding_events(ts, from_wallet, to_wallet,
   sol, sig)`.
2. **Input:** each new BUY row.
   **Transform:** `mirror_token_check` runs automatically at detection time:
   DexScreener tape/liquidity, mayhem screen, impersonation screen.
   **Output:** `pumpfuntop2.db` table `mirror_token_checks(ts, mint, verdict,
   reasons, facts)` — verdict GREEN, AMBER, RED, or UNKNOWN with reasons.
3. **Input:** buy + verdict.
   **Transform:** alert assembly — the alert carries the checked verdict, not a
   cold address.
   **Output:** operator decision: mirror it, pass, or wait — on facts.
4. **Live mirror (disarmed by default):** `mwts_executor` watches for the
   coordination signal — 2+ verified wallets buying the same mint within 30
   minutes — before any mirror action. See `docs/PAPER_VS_LIVE.md`.

## Flow 4 — Codex GraphQL → signal sources

1. **Input:** builder's Codex API key (raw key in `Authorization` header, no
   Bearer prefix).
   **Transform:** `filterTokens` query on `https://graph.codex.io/graphql`
   with network IDs Solana=1399811149, Base=8453, ETH=1, BSC=56; filter
   `createdAt >= now − 2h`.
   **Output:** fresh token launches per chain.
2. **Input:** fresh tokens.
   **Transform:** `fetch_codex` / `adapt_codex` normalize to the handshake
   schema; DexScreener prices each.
   **Output:** signals into the paper loop (Flow 1, step 3) and into the
   Codex-fed paper traders (allen3, allen4, allen5, codex-wallet, test01-codex).
3. **Budget note:** the Codex "almost free" plan is 10,000 requests/month at
   5 requests/second on one key. Poll lightly — hourly per consumer is plenty.

## Flow 5 — AllenX live bridge (the single armed live loop)

1. **Input:** `evm.db` `epools` fresh Base launches, every 2 minutes.
   **Transform:** entry gates — age < 2h, liquidity ≥ $1,500, h1 buys ≥ 3,
   buys ≥ sells, thin-tape guard, 20-minute seasoning, pre-buy sell
   simulation, gas-bleed breaker (3 failed sells = no more attempts).
   **Output:** live buy via Base RPC, max $2 per trade, with 20-trade risk
   escalation (#3/#6 ×1.10, #12–15 ×1.30).
2. **Input:** open position.
   **Transform:** profit ladder — TP1 +400% sells half, TP2 +900% sells half,
   runner +1900% with −50% trail, −60% stop-loss, 8-hour time stop.
   **Output:** exits recorded in `bridge-state.json`; realized P&L tracked.
3. **Input:** realized earnings.
   **Transform:** once realized earnings reach $200, sweep 75% to the
   builder's allowlisted EVM address.
   **Output:** on-chain sweep; state updated.

**This is the only loop that ships capable of touching real money, and it
ships DISARMED.** Arming requires the builder's explicit multi-gate process
in `docs/PAPER_VS_LIVE.md`.
