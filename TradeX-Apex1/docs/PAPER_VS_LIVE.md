# Paper vs live — the arming doctrine

## The default: paper

Everything in TradeX-Apex1 simulates. Paper traders take signals against real
market data, fill at real prices with slippage and gas overlaid, and write
every fill to a ledger. Paper losses are paper. Paper profits are paper. The
only thing paper produces is **measurement**: win rate, expectancy, drawdown,
per source, per trader, from closed trades.

## The proving bar (the live trigger)

A system earns the right to be considered for live funds when — and only
when — it has a **measured ≥65% win rate over ≥30 closed paper trades**.
Per-source for the signal follower. Measured from the ledger, never promised,
never projected, never backtest-only.

Even then, flipping the switch is the builder's explicit decision, not an
automatic one — unless the builder configures the tripwire (see below) and
accepts what it does.

## The triple-gate arming pattern

No live path arms on a single flag. Every live-capable module follows the
same pattern — all gates must be present, or the module stays paper:

1. **Arming record** — a file stating what is being armed, when, and under
   whose instruction (e.g. `test01-newapi-arming.json`).
2. **Key file** — the actual keypair at its 600-permission path. No key file,
   no signing, no exceptions.
3. **Armed flag** — an explicit flag file (e.g. `LIVE_ARMED`, or an `ARMED`
   file in the bridge directory).

Missing any one gate = the module runs paper or not at all. This is
fail-closed by construction: there is no code path that trades live "by
accident".

The trade-portal executor adds a fourth gate for one-shot executions:
`dry_run=False` + key file + `confirm_live=True`, all three, per invocation.

## Per-module live status

| Module | Status | Notes |
|---|---|---|
| signal-follower | Paper only | No live path exists. Never will without a redesign. |
| allen3 / allen4 / allen5 | Paper only | No live path exists. |
| codex-wallet / test01-codex | Paper only | No live path exists. |
| test01_allen2 (Allen2-clone) | Paper only | The live path is absent from the module, not merely disabled. |
| test01_newapi (paper side) | Paper only | Live path lives in `live_exec`, separate module. |
| allen2_sandbox | Paper only | No live path exists. |
| scalp-fleet | Paper only | No live path exists. |
| nervous/ | Paper only | Synthetic-feed demo. No live path exists. |
| test01-newapi `live_exec` | Live-capable, **disarmed** | Triple gate + sell-proof record. Arm only after a proven sell round-trip: buy → sell → proceeds verified in the wallet. |
| `mwts_executor` (TEST01 mirror) | Live-capable, **disarmed** | Coordination formula: 2+ verified wallets, same mint, 30 min. |
| `allen2_live_bridge` | Live-capable, **disarmed** | Mirrors Allen2 paper signals to a real EVM wallet. |
| trade-portal `execute` | Live-capable, **disarmed** | 7-step fail-closed flow; live never run in the reference build. |
| `allenx_live_bridge` | **Armed live (reference)** | The single armed loop in the reference deployment: Base, max $2/trade. Ships DISARMED in this package. |

## Live doctrines (apply to any armed loop)

- **$2 max per trade.** Position sizing stays tiny until measurement says otherwise.
- **Never report bought/sold until verified in the wallet.** A transaction hash
  is not a confirmation. The 7-step flow's verify step (receipt status AND
  wallet balance deltas) is the minimum bar.
- **Selling is where systems break.** Buying is easy; exits fail on bad routes,
  thin pools, and MEV. If sells are unreliable, buys are donations. Prove the
  sell path with a small round-trip before arming anything.
- **Gas-bleed breaker:** 3 failed sells = no more attempts on that position.
- **Never trade Mayhem-mode tokens live.** The fail-closed filter stays on for
  every live path. (Paper measurement of Mayhem is allowed only as a
  ledger-flagged deliberate exception.)
- **Pre-buy sell simulation:** simulate the exit before entering. If the exit
  can't be simulated, don't enter.
- **Scale only after measured wins.** The $2 cap lifts only on ledger evidence.

## The tripwire (optional)

A tripwire job can watch the paper ledgers and write the arming record + flag
automatically when the proving bar is met (≥65% / ≥30 closed). In the
reference build this exists for the TEST01 seat and runs every 30 minutes.

The tripwire is **opt-in**. If the builder enables it, they accept that the
system will arm itself on measurement — and they must still supply the key
file (gate 2), which no automation can create. Without the builder's key,
the tripwire arms nothing.
