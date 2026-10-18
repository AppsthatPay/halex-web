# AI_BUILD_PROMPT.md — Embedded build instructions for an AI agent

> You are the electrician, not the architect. Your job is to WIRE TradeX-Apex1
> together and OPERATE it for the builder. You never modify the builder's app
> libraries, never rewrite shipped components, and never change what the system
> is — you connect it, configure it, run it, and report honestly.

## 1. Goal

Assemble a working TradeX-Apex1 instance on the builder's always-on machine:
detection feeds flowing, the signal loop measuring sources on paper, paper
traders cycling, merit checks attached to mirror alerts, everything scheduled,
everything verifiable in local ledgers. Live execution stays DISARMED unless the
builder explicitly walks the arming path in `docs/PAPER_VS_LIVE.md`.

## 2. Prerequisites (verify each before proceeding)

- [ ] Python 3.10+ installed. Confirm with `python3 --version`.
- [ ] `pip install requests` works. (Only hard dependency for the core loop;
      EVM signing needs `eth-abi`/`eth-utils`/`web3` — install only if the
      builder arms a live EVM loop.)
- [ ] Outbound HTTPS to api.mainnet-beta.solana.com, api.dexscreener.com,
      api.geckoterminal.com, graph.codex.io. Test each with a single curl.
- [ ] A directory for the build, e.g. `~/tradex-apex1/`, with subdirectories
      `state/`, `ledgers/`, `logs/`, `db/`.
- [ ] The builder's `.env` filled from `.env.example`. You may READ key names
      to confirm presence. You must NEVER print, log, or repeat key values.
- [ ] SQLite available (`python3 -c "import sqlite3"`).

If any prerequisite fails, stop and report exactly which one and what you saw.
Do not invent workarounds that skip verification.

## 3. Assembly order (do not reorder)

### Step 1 — Config and secrets
1. Copy `.env.example` to `.env`. Confirm every variable the build needs is
   present (values may be placeholders for optional feeds).
2. Create the secrets directory with owner-only permissions:
   `mkdir -p ~/.config/apex2 && chmod 700 ~/.config/apex2`.
3. Any keypair file the builder places there must be `chmod 600`.
4. **Done looks like:** `.env` exists, `~/.config/apex2` is 700, and you can
   list which credentials are present WITHOUT displaying any value.

### Step 2 — Detection feeds
1. Build the Solana tape feed: a WebSocket subscriber to the pump.fun program on
   `wss://api.mainnet-beta.solana.com` that decodes launch/trade events into a
   SQLite table `tape_launches` (mint, name, symbol, creator, slot, ts).
   Reference: `docs/MODULES.md` (livefeed) and `docs/DATA_FLOWS.md` Flow 1.
2. Build the EVM new-pools feed: poll GeckoTerminal `new_pools` for base,
   robinhood, bsc, eth every 5 minutes into an `epools` table
   (chain, pool_address, base_address, base_symbol, pool_created_at,
   reserve_usd, first_seen). Reference: Flow 2.
3. **Done looks like:** run each feed once manually; each DB has fresh rows
   (newest row < 10 minutes old). Record row counts in your build log.

### Step 3 — Signal loop (paper only)
1. Implement the signal-follower: for each enabled source (Codex GraphQL
   `filterTokens` for tokens created in the last 2h on Solana+Base; Sentinel
   Aleph, FOMO Trendings, GMGN Rank public endpoints), adapt every signal into
   the normalized schema in `examples/signal_schema.json`.
2. Price every signal via DexScreener. Use the conventional frame:
   stop = entry × 0.70, take-profit = entry × 2.0, direction long.
3. Simulate fills in a paper ledger (JSONL): one line per fill, one per exit,
   with per-source stats (taken, wins, win rate, expectancy).
4. Safety gates are DISARMED on this loop by operator doctrine — it measures
   signals raw. Ledger-flag any disarmed take.
5. **Done looks like:** one full loop run completes; ledger has fills with
   per-source stats; no signing, no broadcasting, no real funds moved.

### Step 4 — Paper traders
1. For each trader config (bankroll, size per trade, max open, stop/TP), run
   the sandbox loop: manage open simulated positions, evaluate new launches
   against entry gates, log every fill to its own state + ledger.
2. Keep bankrolls, wallets, states, and ledgers strictly separate per trader.
3. **Done looks like:** each trader's state file shows a bankroll and open
   positions (or cleanly empty); the ledger has fills; a scoreboard script can
   read all traders and print one table.

### Step 5 — Merit check
1. Implement the merit checker (`examples/minimal_merit_check.py` is the
   reference): DexScreener lookup → liquidity ≥ $1,500, h1 buys ≥ 3 and buys ≥
   sells, mayhem screen, impersonation screen → GREEN/AMBER/RED with reasons.
2. Wire it to run automatically on every new mirrored buy (see
   `docs/DATA_FLOWS.md` Flow 3), storing verdicts in the checks table.
3. **Done looks like:** `python3 examples/minimal_merit_check.py <mint>`
   prints a verdict with reasons for a live mint; the monitor path stores a row
   per new buy.

### Step 6 — Scheduler
1. Translate the cron table in `docs/MODULES.md` into real cron entries
   (or the platform's scheduler): feed polls every 5 min, signal loop hourly,
   monitor every 10 min, watchdog restarts for the daemons.
2. Every scheduled job logs to its own log file with timestamps.
3. **Done looks like:** after one hour, every job has run at least once and
   each log file has fresh lines.

### Step 7 — Verification pass
1. Re-read every "Done looks like" above and re-run the check.
2. Confirm: no live gates armed (search the codebase for arming flags — all
   must be OFF/absent).
3. Confirm: no secret values in any file (`grep -ri "sk-\|private\|secret"`,
   excluding `.env.example` placeholders and docs that say "YOUR_KEY_HERE").
4. Write a build report: what runs, what was verified, what's still paper,
   what the builder must decide.

## 4. What "done" means for the whole build

- Detection feeds have fresh rows (< 10 min old) in both DBs.
- Signal loop completes a cycle with ledger fills and per-source stats.
- At least one paper trader has open or recently closed simulated positions.
- Merit checker returns a verdict on a live mint.
- All scheduled jobs ran in the last hour with fresh logs.
- Zero live gates armed. Zero secrets in the repo. Build report written.

## 5. What NOT to do (hard prohibitions)

- NEVER commit, paste, or display a secret value. Names only.
- NEVER arm a live loop without the builder completing the multi-gate arming
  in `docs/PAPER_VS_LIVE.md` — an arming record, a key file, AND an explicit
  armed flag, all three, plus the builder's direct instruction.
- NEVER invent data: no fake fills, no fake win rates, no placeholder prices
  presented as real. If a feed is down, say so.
- NEVER claim "bought"/"sold"/"working" without verification in the wallet or
  the ledger. A transaction hash is not confirmation.
- NEVER modify the builder's app code or libraries. You wire TradeX-Apex1 as a
  standalone engine; the app reads its feeds (see `docs/HALEX_HOOK.md`).
- NEVER mix trader bankrolls, wallets, or ledgers.
- NEVER delete or reset trade history. Archive before any clean slate.
- NEVER trade Mayhem-mode tokens on any live path. Paper measurement of them
  is allowed only when ledger-flagged as a deliberate exception.
- NEVER exceed $2 per live trade on any armed loop unless the builder
  explicitly changes the doctrine in writing.

## 6. If you get stuck

Report: what step, what command, the exact error output, and what you already
tried. Do not paper over a gap. A blocked step with an honest blocker note is
a correct result; a faked green check is a failure.
