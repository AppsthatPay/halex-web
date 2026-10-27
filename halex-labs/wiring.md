# HALEX LABS Wiring

## The rule, in one line

LABS skills veto or rank. The CNS brain and the Allen2 bridge decide.
No LABS skill ever places, sizes for execution, signs, or sends a trade.

## Paper path

```
Feed candidate (Solana / Base)
  -> Token DNA / dossier (custody, copycat, metadata, tape)
  -> LABS edge scan (score 0-100, see skills/clodds-edge-scan.md)
  -> LABS risk gate (see skills/clodds-risk-gate.md)
  -> Vibe-research-lab paper validation / provenance / decay
  -> CNS brain paper decision
  -> Paper registry (cns_positions.db, brain-owned)
```

A paper signal is counted only if it passes the LABS checks and the
existing brain gates. A LABS veto is recorded with its reasons, not
silently dropped.

## Live path (Allen2 bridge only)

```
Paper open / candidate
  -> LABS rank / veto (advisory)
  -> Allen2 bridge gates, in order, all authoritative:
     1. Custody: spine dossier first, fresh and high coverage,
        deployer-held = hard block, burned/locked_long = pass
     2. Sell-sim / PoVV: 90% or better of expected out, else hard block
     3. Copycat census: swarm = hard block
     4. Position cap: max positions, no duplicate buys
     5. Paper-open trust and manual-buy protocol where applicable
  -> Live execution ONLY by the bridge, at $1-$2 tier size
```

If any bridge gate blocks, the trade does not happen, whatever LABS
ranked it. If LABS vetoes, the bridge does not override that veto
with a forced buy. A manual override, if Jeffrey ever orders one, is
his explicit main-chat order, surfaced with the full dossier verdict
first, never a LABS skill decision.

## HALEX-M wiring

- Skills tab, staging only: a HALEX LABS skill card, plain English,
  with inputs, outputs, and limits. It does not execute, it explains.
- APEX² Research: LABS edge score, risk gate result, and decay state
  can be shown as research fields, labelled as LABS, with their sources.

## HALEX-AI wiring

- SKILLS.md workflow entries, advisory only. HALEX-AI explains a LABS
  score, never acts on it to trade.
- Task queue: a LABS finding that needs Allen goes in the queue,
  never auto-executes.

## What is deliberately not wired

- No Clodds prediction-market, perp, x402, Bittensor, or wallet code.
- No GMGN / Oracle3 / onchain-dex-cli / web3-agent-kit execution code.
- No Claude, Anthropic, or other model execution path from any source.
- No direct DEX swap, Jupiter, Raydium, Orca, or Meteora execution
  from any source. Those stay as data and gate concepts only.
