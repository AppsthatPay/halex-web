# TradeX-Apex1

**APEX¹: the unified signal feed.** TradeX-Apex1 is a crypto trade-system engine —
it detects new tokens, measures signal sources, paper-trades strategies, watches
proven wallets, and checks every mirrored token on merit. It is the engine room.
The app is the display.

## What this is

TradeX-Apex1 takes the chaos of new token launches (Solana pump.fun, EVM chains)
and turns it into a single normalized signal feed. Everything it does defaults to
**paper**: simulated fills against real market data, real ledgers, measured win
rates. Live execution exists in exactly one module and ships **disarmed** — the
builder arms it with their own keys and wallets, deliberately, behind multiple
gates.

It runs on an **always-on machine** (a server, a home box, any machine that stays
up). The phone app never runs it and never executes trades — it reads the feeds
this system publishes. See `docs/HALEX_HOOK.md`.

## Who it's for

A competent builder — human or AI — who wants to reconstruct a working
signal-measurement and paper-trading system from scratch, with their own keys,
their own wallets, and their own decisions about what goes live. You are expected
to be comfortable with Python, SQLite, cron, and public blockchain APIs.

## What's inside

| Path | What it is |
|---|---|
| `AI_BUILD_PROMPT.md` | The embedded prompt: a direct instruction set an AI agent can execute to assemble the whole system |
| `README.md` | This file |
| `.env.example` | Secrets template — placeholder names only, never values |
| `docs/ARCHITECTURE.md` | System schematic, the three-machine model, design laws |
| `docs/DATA_FLOWS.md` | The five end-to-end flows, inputs → transforms → outputs |
| `docs/API_CATALOG.md` | Every third-party API: what it does, which module uses it, how to get your own key |
| `docs/SECRETS.md` | "Secrets as notes": what each credential is, where it goes, what breaks without it |
| `docs/PAPER_VS_LIVE.md` | The arming doctrine: paper-by-default, fail-closed, the live-trigger rule |
| `docs/STANDALONE.md` | Run it on your own machine: requirements, layout, cron, healthy output |
| `docs/HALEX_HOOK.md` | How TradeX-Apex1 plugs into the HALEX app as its feed engine |
| `docs/MODULES.md` | Per-module reference: purpose, inputs, outputs, schedule |
| `examples/minimal_merit_check.py` | Working paper-only merit checker (DexScreener, no keys) — a teaching example |
| `examples/signal_schema.json` | The normalized signal handshake schema with a realistic example |

## 10-minute quickstart

1. **Read `AI_BUILD_PROMPT.md`.** If you are an AI agent, that file is your
   orders. If you are human, it's the build checklist.
2. **Skim `docs/ARCHITECTURE.md`** for the map, then **`docs/DATA_FLOWS.md`**
   for how data moves.
3. **Copy `.env.example` to `.env`** and fill in your own keys (see
   `docs/SECRETS.md` and `docs/API_CATALOG.md` for how to get each one).
4. **Start with the paper loop**: detection feeds → signal loop → paper traders.
   Leave every live gate OFF until a strategy has a *measured* ≥65% win rate over
   ≥30 closed paper trades.
5. **Run `examples/minimal_merit_check.py`** to see the merit-check pattern in
   miniature: `python3 examples/minimal_merit_check.py <solana-mint>`.
6. **Verify before you claim**: nothing is "working" until you see it in the
   ledger and the wallet. Paper profits are paper.

## Design laws (non-negotiable)

1. **Paper-by-default.** Every module simulates. Nothing touches real money
   unless explicitly armed through the multi-gate arming process.
2. **Fail-closed.** If a check can't run, the trade doesn't happen. If data is
   missing, the signal isn't taken. Absence of evidence is a "no".
3. **Verify-before-claim.** A transaction hash is not a confirmation. A token is
   not "bought" until its balance is verified in the wallet. A win rate is not a
   number until it's measured over closed trades.
4. **Measured, never promised.** Win rates come from ledgers, not from hope.
5. **Keep everything separate.** Each trader gets its own bankroll, wallet,
   state, and ledger. Never mix.
6. **No secrets in the repo.** Keys live on the machine, never in code.

## License note

This is the operator's proprietary system design. The package ships with no
keys, no wallets, no live funds, and no trading history. The builder supplies
their own API keys and wallets and is responsible for their own funds and their
own compliance. Paper first, always.
