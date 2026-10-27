# HALEX LABS

HALEX LABS is the research bench where outside trading, intelligence, and
knowledge systems get pulled apart, kept only where they are useful, and
wired into HALEX as skills. It is not a trading bot. It is not a replacement
for the CNS brain, the Allen2 bridge, the paper registry, or HALEX-M itself.

## What LABS is, in one sentence

A thoughtful filter: take what is proven, adaptable, and gate-safe from
outside systems, rewrite it for HALEX memecoin trading on Solana and Base,
and throw away everything that trades live on its own, holds keys, or
bypasses a gate.

## The three lanes: Trading, Intelligence, Knowledge

- **Trading:** ranking, sizing, and risk checks that make a paper signal
  cleaner before it ever reaches a live gate. LABS never places a trade.
- **Intelligence:** edge detection, copycat and custody context, tape and
  liquidity reading, and decay watching. LABS explains, it does not decide.
- **Knowledge:** provenance, factor registries, debate reports, and skill
  definitions that HALEX-M and HALEX-AI can load and read in plain English.
  Every number carries its data source, date range, and code version.

## What LABS is not

- Not a live executor. No wallet, no signing, no swap, no order code.
- Not a bypass. A LABS skill can veto or rank a candidate, never force
  a live buy.
- Not a rebrand. Upstream projects keep their names, authors, and
  licenses in NOTICE.md. HALEX LABS is our adaptation layer, not theirs.
- Not a promise. Win rates are measured from paper history, never
  invented, never annualised from irregular intraday trades.

## How a new source gets in

1. Read its license first. Permissive only: MIT, Apache-2.0, BSD, and
   similar. No license, or a non-permissive license, means no code copied,
   only a summary in our own words, marked as not copied.
2. Pull it apart: architecture, scanner, risk, sizing, paper vs live,
   agent loop, and what markets it was built for.
3. Map it to HALEX gates: custody, sell-sim / PoVV 90% or better,
   copycat census, position cap, paper-first proving.
4. Rewrite the applicable pattern for Solana/Base memecoins, in our own
   code, with a source mapping per file.
5. Test it on paper history only, read-only, and record the result.
6. Ship it as a skill: plain English inputs, outputs, limits, and gate
   references. No skill may execute a live trade, move funds, or hold keys.

## How a skill gets out to HALEX-M and HALEX-AI

- HALEX-M staging: a skill card in the skills tab, staging only, never
  pushed live without Jeffrey's approval.
- HALEX-AI: a workflow entry in SKILLS.md, advisory only, never a trade.
- CNS brain paper path: a LABS check runs before a paper signal is
  counted, and its veto is recorded.
- Allen2 bridge live path: LABS output is rank/veto input only. The
  bridge's own custody, sell-sim, copycat, and cap gates stay authoritative.

## First sources in LABS

- CloddsBot, MIT, 3,011 stars, updated 2026-10-27. Taken: edge scoring,
  unified risk checks, Kelly capped sizing, circuit breaker, paper-first
  discipline, trade logging with integrity hashing. Skipped: prediction
  markets, perps up to 200x, agent commerce x402, Bittensor, wallet and
  execution code, Claude-specific execution.
- Vibe-research-lab, our own MIT adaptation of HKUDS Vibe-Trading
  patterns. Linked, not rebuilt: paper validation, provenance, decay,
  debate, factor registry, meld gate.
- GMGN skills, MIT, 632 stars, updated 2026-10-27. Recorded, not yet
  coded: token/wallet/market data skills for Solana, BSC, Base.
- Oracle3, Apache-2.0, 529 stars, updated 2026-10-27. Recorded, not yet
  coded: pre-trade risk limits, paper/live separation, 600+ tests as a
  discipline model.
- onchain-dex-cli, MIT, 581 stars, updated 2026-10-16. Recorded, not yet
  coded: DEX adapter pattern, landing processors as a reliability idea.
- web3-agent-kit-solana-trading, MIT, 92 stars, created 2026-10-13,
  updated 2026-10-27. Recorded, watch only: new, small, unproven.

See NOTICE.md for the full per-source record, and wiring.md for the
exact gate wiring.
