> Mirrored from the Braintree knowledgebase (`braindata/Braindata-Braintree-Software.md`) — the master record lives there; this copy ships with the HALEX web app and is served at `/docs/braindata-braintree-software.md`.

# Braindata-Braintree Software

*The centralized nervous system. One brain running all traders.*
*Filed 2026-10-16 — Jeffrey's architecture order.*

## What this is
The Braindata-Braintree Software is the trading nervous system: a central
brain (BCIA head) that runs every trader like a CPU runs processes. Skills
are programs loaded from the Braintree knowledgebase. Traders are processes.
CIAs are supervisors. Losing programs get reformulated with winning logic
and hot-swapped without stopping the machine.

This file is the master record. The implementation lives at
`~/workspace/nervous/`. The schematics live at
`~/workspace/goals/10-winning-trade-skills/hidden_files/nervous-system-schematics-v1-20261016.md`.

## The layers

| # | Name | Role |
|---|------|------|
| 1 | APEX² + Oasis firehose | Senses. Every chain piped in, firehose style, user-picked filters (chain, lowcap, bundled, scam, no-liquidity, industry + Braintree tags) |
| 2 | BrainData + Braintree | Memory. The knowledgebases. Every winning skill hangs here categorized. The BrainData portal is the query API. |
| 3 | SMT | Brain stem. Small CPU: routes signals, schedules ticks, keeps time. |
| 4 | BCIA head | Cerebrum. Decides: who runs what skill, when to reformulate, kill conditions, where winners get cloned. |
| 5 | CIA1..n | Supervisors. One per trader: every trade/coin/sell/action tracked, live W/L, decay flags, reformulation proposals from Braintree data. |
| 6 | DRUM + SolHaG | Specialists. DRUM: in-place adjustments, 50-trade monitoring. SolHaG: Solana forensics → Braintree observations. |
| 7 | Traders | Muscles. TEST01, Allen2, AllenX, paper wallets. Skills hot-swap at decision boundaries — never mid-position. |
| 8 | AI layer | Online learning: Thompson-sampling skill router + drift detection. Real adaptation, not thresholds. |

## The loop
Firehose → user filters → SMT → traders run Braintree skills → every action
→ event bus → ledger → CIA supervisors → live W/L → BCIA: keep / reformulate
/ kill / clone winner → hot-swap at next boundary. DRUM + SolHaG →
observations → Braintree → richer skills. Forever.

## Hot-swap (the RAM analogy)
Trader holds a skill *reference* + version. BCIA publishes v(n+1). Trader
picks it up at the next decision boundary (flat, between trades). Open
positions keep the old exit logic — no mid-position surgery. Underperformance
over N trades → automatic rollback. The trader never stops. The system never
stops.

## Skill lifecycle
Forge (from Braintree tags) → paper-validate (100 trades / 60% WR / PF 1.2,
or asymmetry bar) → graduate → CIA supervises → decay → On-The-Fly retool →
hot-swap → or kill and park. Winners keep trading; losers get rebuilt.
Nothing earning gets killed.

## Skills on the Braintree (v1)
- **allen2_wlr** — Allen2's WLR punch-ladder, cloned from the Braintree
  (`tags/allen2-wlr.md`). The reference implementation.
- **snipe_ladder** — Snipe-Ladder v2 (fast-follower snipe + trail exits).
- **wild4v3** — wild4 rebuild (dev gates + regime filter).

## The AI smidgen
- **bandit.py** — Thompson sampling: assigns skills to traders by live
  performance. Learns continuously.
- **drift.py** — watches every trader's W/L for edge fade; triggers
  reformulation review early.
- **reformer.py** — drafts reformulations from Braintree observations +
  performance data, for BCIA approval.

## Status
- 2026-10-16: schematics v1 complete.
- 2026-10-16: v1 implementation in build at `~/workspace/nervous/`
  (paper-only; live traders join via adapters under existing authority).
- Not yet: live attachment, autonomous skill invention (drafts need BCIA
  approval until the loop proves itself).

## Rules that never bend
- Paper first. No live trading by this system alone.
- No mid-position interference. Ever.
- Every action reported, tracked, controlled. No silent trades.
- The Braintree is the single source of skill truth. Skills hang here,
  categorized, versioned.
