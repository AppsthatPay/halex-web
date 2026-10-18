# Standalone — run it on your own machine

TradeX-Apex1 is designed to run on any always-on machine: a VPS, a home
server, a spare laptop that stays up. No special hardware. No paid services
required for the core build.

## Requirements

- **OS:** Linux (any modern distro). macOS works for everything except the
  Solana WebSocket tape at high throughput — test before relying on it.
- **Python:** 3.10+.
- **pip packages:** the core needs only `requests`. Install per need:
  ```
  pip install requests            # core: feeds, signal loop, merit check
  pip install eth-abi eth-utils   # only if you arm an EVM live loop
  pip install web3                # only if you arm an EVM live loop
  ```
  There is deliberately no `requirements.txt` upstream — install what your
  build uses, pin what you ship.
- **SQLite3:** ships with Python (`import sqlite3`). All state is SQLite.
- **Network:** outbound HTTPS to the APIs in `docs/API_CATALOG.md`.

## Directory layout (recommended)

```
~/tradex-apex1/
├── .env                  # your secrets (never committed)
├── db/
│   ├── radar.db          # Solana tape: tape_launches, tape_trades
│   ├── newact.db         # launch detections
│   ├── evm.db            # EVM pools: epools
│   └── mirror.db         # mirror_trades, funding_events, mirror_token_checks
├── state/                # per-trader state.json files (gitignored)
├── ledgers/              # per-trader ledger.jsonl files (gitignored, never deleted)
├── logs/                 # per-job log files
└── src/                  # your modules, one per subsystem
```

Keep code, state, and logs in separate directories. State and ledgers are
never committed. Ledgers are append-only — archive before any clean slate,
never `reset`.

## Config-ifying machine assumptions

The reference build grew on one machine and carries assumptions you must
replace with configuration:

| Assumption | Replace with |
|---|---|
| Hardcoded home paths (`~/workspace/...`, `/home/hatch/...`) | A `BASE_DIR` env var or config file; all paths derived from it |
| Single venv at a fixed path | Your venv, referenced via env var `VENV_PYTHON` |
| File-based cron definitions (markdown job files) | Real cron expressions (below) in the system crontab |
| SQLite `poll_state` watermarks mixed with code dirs | Watermarks live in `db/` |
| `pgrep`-based single-instance guards | A lock file per daemon in `state/` (or your supervisor's) |
| The `evm/evm.db` 0-byte stub confusion | One explicit `EVM_DB_PATH` in config pointing at the real DB |
| No dependency manifest | Your `requirements.txt`, pinned |

## Scheduler setup (real cron expressions)

Translate the job table into your crontab. Start with the core set; add the
rest as you build out:

```
# Detection feeds
*/5 * * * *  $VENV_PYTHON $BASE_DIR/src/evm_feed_poll.py >> $BASE_DIR/logs/feed_poll.log 2>&1
# Signal loop (paper)
0 * * * *    $VENV_PYTHON $BASE_DIR/src/signal_follower.py --once >> $BASE_DIR/logs/signal.log 2>&1
# Mirror monitor + merit checks
*/10 * * * * $VENV_PYTHON $BASE_DIR/src/mwts_monitor.py --once >> $BASE_DIR/logs/monitor.log 2>&1
# Paper traders
*/5 * * * *  $VENV_PYTHON $BASE_DIR/src/paper_trader.py --trader allen3 >> $BASE_DIR/logs/allen3.log 2>&1
# Daemon watchdogs
*/10 * * * * $BASE_DIR/src/watchdog.sh mwts_ws_watcher >> $BASE_DIR/logs/watchdog.log 2>&1
*/30 * * * * $BASE_DIR/src/watchdog.sh livefeed >> $BASE_DIR/logs/watchdog.log 2>&1
# Live tripwire (optional, opt-in)
*/30 * * * * $VENV_PYTHON $BASE_DIR/src/live_trigger.py >> $BASE_DIR/logs/trigger.log 2>&1
```

The two daemons (`livefeed`, `mwts_ws_watcher`) must run continuously. The
watchdog pattern: `pgrep -f <name>` — if no PID, start exactly one instance,
verify a PID exists within 30 seconds, log the restart. Never start a second
instance.

## SQLite state layout

| Database | Tables | Written by |
|---|---|---|
| `radar.db` | `tape_launches`, `tape_trades` | livefeed daemon |
| `newact.db` | `detections` (+ scoring sidecars) | launch scanner |
| `evm.db` | `epools` | feed_poll (5 min) |
| `mirror.db` | `mirror_trades`, `funding_events`, `poll_state`, `mirror_token_checks` | monitor, ws watcher, merit check |
| per-trader | `state.json` + `ledger.jsonl` (files, not DB) | each paper trader |

## Running each piece manually (and what healthy looks like)

| Command | Healthy output |
|---|---|
| `python3 src/evm_feed_poll.py` | exit 0, "N pools upserted"; `epools` newest `first_seen` < 10 min old |
| `python3 src/signal_follower.py --once` | exit 0; ledger has new fills or "no new signals"; per-source stats print |
| `python3 src/mwts_monitor.py --once` | exit 0; per-wallet "N new trade events"; `merit …` lines for any new buys |
| `python3 examples/minimal_merit_check.py <mint>` | `CHECK <mint> VERDICT: <reasons>` |
| `python3 src/paper_trader.py --trader allen3` | exit 0; state bankroll + positions; ledger appended |

## First-hour checklist

1. Both feed DBs have rows newer than 10 minutes.
2. Signal loop completed one cycle with ledger output.
3. One paper trader cycled with state + ledger written.
4. Merit checker returns a verdict on a live mint.
5. Every cron job above has run once with fresh log lines.
6. No live gates armed. No secrets in any file but `.env`.

If all six hold, the standalone build is working. See
`AI_BUILD_PROMPT.md` §7 for the full verification pass.
