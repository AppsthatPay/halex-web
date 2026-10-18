# Architecture — TradeX-Apex1

## The three-machine model

TradeX-Apex1 is the **engine room**. It runs on one always-on machine and does
everything that touches markets. Nothing else in the system executes trades.

```
┌──────────────────────────────────────────────────────────────┐
│  MACHINE 1 — Always-on engine box (this system)              │
│                                                              │
│  Detection feeds ──▶ Signal loop ──▶ Paper traders ──▶ Ledgers│
│        │                    │                                │
│        ▼                    ▼                                │
│  Mirror-wallet intel ──▶ Merit check ──▶ (armed live loop)    │
│                                                              │
│  Publishes: finished feed JSON (launches, signals, verdicts) │
└──────────────────────────┬───────────────────────────────────┘
                           │  feed JSON (read-only)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  MACHINE 2 — Vercel / web app (display-only)                 │
│                                                              │
│  Serves the feed to the app. NEVER executes trades.          │
│  NEVER holds keys. NEVER signs.                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  MACHINE 3 — Phone (wallet)                                  │
│                                                              │
│  Signs transactions on-device. Keys never leave the phone.   │
└──────────────────────────────────────────────────────────────┘
```

The law: **the display layer reads; the engine executes; the phone signs.**
No machine does another machine's job.

## Component diagram (inside the engine box)

```
                    ┌──────────────┐
                    │ Solana WS    │  pump.fun launches/trades
                    │ livefeed     │──────────┐
                    └──────────────┘          │
                    ┌──────────────┐          ▼
                    │ GeckoTerminal│    ┌─────────────┐
                    │ feed_poll    │───▶│  SQLite DBs │  radar.db / newact.db
                    │ (EVM pools)  │    │  evm.db     │  pumpfuntop2.db
                    └──────────────┘    └──────┬──────┘
                    ┌──────────────┐           │
                    │ MWTS monitor │──mirror_trades
                    │ + ws watcher │           │
                    └──────────────┘           ▼
                                         ┌─────────────┐
                    ┌──────────────┐      │ Signal loop │◀── Codex / Sentinel /
                    │ Merit check  │◀─────│ (paper)     │    FOMO / GMGN
                    │ GREEN/AMBER  │      └──────┬──────┘
                    │ /RED         │             │ normalized signals
                    └──────────────┘             ▼
                                         ┌─────────────┐
                                         │Paper traders│── state + ledgers
                                         │ (per-trader │   (separate bankrolls)
                                         │  sandbox)   │
                                         └──────┬──────┘
                                                │ tripwire: ≥65% WR / 30 trades
                                                ▼
                                         ┌─────────────┐
                                         │ Live bridge │  ARMED only by explicit
                                         │ (1 loop)    │  multi-gate arming
                                         └─────────────┘
```

## Component table

| Subsystem | Role | Key inputs | Key outputs |
|---|---|---|---|
| Detection (Solana) | Captures pump.fun launches and tape in real time | Solana WS | `tape_launches`, `tape_trades` tables |
| Detection (EVM) | Polls new pools on Base/Robinhood/BSC/ETH | GeckoTerminal API | `epools` table |
| Signal loop | Takes outside signals raw, measures them on paper | 4 signal sources + DexScreener pricing | Paper ledger, per-source stats |
| Mirror-wallet intel | Polls/subscribes to proven wallets' activity | Solana RPC/WS, watch list | `mirror_trades`, `funding_events` |
| Merit check | GREEN/AMBER/RED verdict on each mirrored buy | DexScreener | `mirror_token_checks` |
| Paper traders | Independent sandboxes proving strategies | Feeds + signals | Per-trader state + ledger |
| Live bridge | The single armed live loop (Base) | `epools` | `bridge-state.json`, on-chain trades |
| Orchestration | Supervises paper traders, detects decay | Bus events | W/L/WR/PF per trader |

Full per-module reference: `docs/MODULES.md`. Data movement detail: `docs/DATA_FLOWS.md`.

## Design laws

1. **Paper-first.** Every strategy proves itself in simulation before it is
   allowed near real funds. The proving bar is ≥65% measured win rate over ≥30
   closed paper trades. Measured, never promised.
2. **Fail-closed.** A missing check is a "no". A failed screen blocks the
   trade. The system prefers doing nothing over doing something unverified.
3. **Verify-before-claim.** Nothing is "bought", "sold", or "working" until it
   is verified in the wallet or the ledger. Transaction hashes are not
   confirmations; prices are not fills.
4. **Keep everything separate.** Each trader has its own bankroll, wallet,
   state file, and ledger. Losses in one can never silently eat another.
5. **Sources earn their place.** External signals are taken raw on the paper
   loop and judged by measured win rate, expectancy, and drawdown. "We trust,
   we analyze, we judge."
6. **No secrets in the repo.** Keys live on the machine at 600 permissions,
   never in code, logs, or chat.

## The AI-socket principle

An AI working with this system — whether assembling it from this package or
operating it day to day — is the **electrician, not the architect**. It wires
components together (APIs, feeds, scheduler, the app hook), configures them,
and operates them to serve the builder. It never modifies the hardwired
application libraries, never rewrites shipped components to change what the
system is, and never invents data to fill a gap. Read the wiring, run the
wiring, report honestly.
