# Modules — TradeX-Apex1 reference

Condensed per-module reference. Path, purpose, inputs/outputs, schedule.
Grouped by subsystem. All paths are the reference layout; the builder maps
them onto their own `BASE_DIR` (see `docs/STANDALONE.md`).

## Detection

| Module | Purpose | Inputs | Outputs | Schedule |
|---|---|---|---|---|
| `livefeed` | Solana pump.fun program WS subscriber; decodes launch/trade events | Solana WS (keyless) | `radar.db`: `tape_launches`, `tape_trades` | daemon + 30m watchdog |
| `evm/feed_poll` | GeckoTerminal `new_pools` for base/robinhood/bsc/eth/hyperevm/unichain | GeckoTerminal API | `evm.db`: `epools` | 5m |
| `evm/ediscovery` | Chain discovery logic for feed_poll | — | — | via feed_poll |
| `evm/edb`, `evm/econfig` | DB access + path resolution (single explicit `EVM_DB_PATH`) | — | — | — |
| `evm/epaper` | EVM paper engine (`evaluate_candidate`) | `evm.db` | paper positions/portfolio | — |

## Signal measurement

| Module | Purpose | Inputs | Outputs | Schedule |
|---|---|---|---|---|
| `signal-follower` | Paper loop over 4 external sources; takes signals raw, measures WR/expectancy/drawdown | Sentinel Aleph, FOMO Trendings, GMGN Rank, Codex; DexScreener pricing | `signal-follower-state.json`, `signal-follower-ledger.jsonl` | hourly |
| `trader-report` | Unified scoreboard across all paper traders + live | all state/ledger files | stdout table | manual |

## Mirror-wallet intel

| Module | Purpose | Inputs | Outputs | Schedule |
|---|---|---|---|---|
| `mwts_monitor` | Poll watched Solana wallets; log BUY/SELL + funding; merit-check each new BUY | `config.json` watch list, Solana RPC | `mirror.db`: `mirror_trades`, `funding_events`, `poll_state` | 10m |
| `mwts_ws_watcher` | Real-time `logsSubscribe` on watched wallets (~1–2s buy detection) | Solana WS | `mirror_trades`; triggers executor on fresh BUY | daemon + 10m watchdog |
| `mwts_executor` | TEST01 live mirror: coordination signal (2+ verified wallets, same mint, 30 min); **disarmed** | `mirror.db`, mirror state | position state, executor log | 5m (live path disarmed) |
| `mirror_token_check` | Paper-only merit check → GREEN/AMBER/RED | mint args / recent buys | `mirror.db`: `mirror_token_checks` | on new buy + standalone |

## Paper traders

| Module | Purpose | Bankroll / size | Signals | Schedule |
|---|---|---|---|---|
| `allen3` | Solana paper trader, Codex-only | 0.10 SOL / 0.01, max 5 open, −30%/+100%, 2h max age | Codex Solana | manual/cron |
| `allen4` | Clone of allen3, independent state/ledger | same | Codex Solana | manual/cron |
| `allen5` | EVM/Base paper trader, Codex-only | 0.00062 ETH / 0.000062, max 5 open | Codex Base | manual/cron |
| `codex-wallet` | Codex-system paper trader | 0.10 SOL / 0.01, max 5 open | Codex Solana | manual/cron |
| `test01-codex` | TEST01 paper clone (mirrors real dust bankroll) | 0.0049 SOL / 0.0005, max 5 open | Codex Solana | manual/cron |
| `test01_allen2` | Allen2's WLR punch-ladder on Solana launches, VIRTUAL only | virtual SOL | `newact.db` detections | 5m |
| `test01-newapi` | Discovery → Mayhem filter (fail-closed) → GoPlus/RugCheck advisory | virtual | `newact.db` detections | — |
| `allen2-sandbox` | Base paper loop on `epools` | virtual ETH | `epools` | 15m |
| `scalp-fleet` | Solana scalp paper trader | virtual SOL | tape | — |

Each trader: own `state.json` + `ledger.jsonl`, own bankroll, never shared.

## Live execution

| Module | Purpose | Status |
|---|---|---|
| `allenx_live_bridge` | Base live trader: entry gates, $2 max/trade, profit ladder, $200 earnings sweep | Reference: armed. **Ships disarmed.** |
| `allen2_live_bridge` | Mirrors Allen2 paper signals to real EVM wallet | Disarmed |
| `test01-newapi/live_exec` | Solana execution plumbing: quote → build → simulate → triple-gated execute → verify | Disarmed |
| `live_trigger` | Tripwire: writes arming record on ≥65% WR / ≥30 closed paper trades | Opt-in, 30m |
| `trade-portal` | Fail-closed Base swap executor (7-step: validate → quote → sanity → build → simulate → execute → verify) | `execute` disarmed |
| `livewallet/jup` | Solana Jupiter quote/build/submit plumbing | key-gated |
| `livewallet/test01_watcher` | Read-only TEST01 wallet watch | 15m, read-only |

## Orchestration

| Module | Purpose |
|---|---|
| `nervous/main` | Demo: 3 paper traders on synthetic firehose, 240 ticks |
| `nervous/bcia` | Head orchestrator: registry, hot-swap approvals; never trades |
| `nervous/cia` | Per-trader supervisor: W/L, WR, PF tracking; decay flags |
| `nervous/bus` | In-process event bus |
| `nervous/feed` | Synthetic market firehose (real-feed adapter: documented next step) |
| `nervous/ledger` | SQLite ledger of bus events |
| `nervous/trader` | Paper trader with hot-swappable skill pointer (swaps only when flat) |
| `nervous/reformer` | Drafts skill-reformulation proposals; never applies |
| `nervous/drift` | Win-rate drift detector |
| `nervous/bandit` | Thompson-sampling skill router |

Status: v1 built + verified on synthetic feed, paper-only. Real-feed adapter
is a documented next step, not yet implemented.

## Scheduler (reference intervals)

`evm-feed-poll` 5m · `allenx-live-bridge` 2m · `allen2-sandbox` 15m ·
`allen2-feed-clanker` 10m · `allen2-feed-flaunch` 10m · `mwts-monitor` 10m ·
`mwts-ws-watchdog` 10m · `test01-allen2-clone` 5m · `test01-live-trigger`
30m (opt-in) · `untouchables-monitor` 1h · `trade-picker` 1h ·
`solana-tape-watchdog` 30m · `muse-balance-watchdog` 15m (ops, non-trading) ·
`halex-feed-publish` 15m (publishes the JSON in `docs/HALEX_HOOK.md`).
