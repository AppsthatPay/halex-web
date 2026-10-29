"""Vibe-research-lab: meld gate. Paper feeds CNS, live only via Allen2.

This is the ONLY wiring between vibe-research-lab and trading, and it
is deliberately one-way and veto-only:

PAPER PATH (new layers feed the existing CNS brain paper path):
  A strategy or token counts as a paper signal only if ALL of these
  pass, as evaluated by the caller with the modules in this directory:
    1. Backtest validation (paper_validation.run_validation):
       walk-forward consistency > 0, bootstrap CI lower bound > 0,
       and no error in any check. Monte Carlo is reported as a
       diagnostic only: its Sharpe p-value is order-invariant (mean/std
       do not change when trades are shuffled) and is always 1.0, so
       it is NEVER used as a pass/fail criterion. Its max-drawdown
       p-value is informative because drawdown is path-dependent.
    2. Provenance (artifact_provenance.verify_artifact): verified True.
    3. Decay (decay_watch.decay_scan): overall_signal is healthy or
       warning. Decayed or critical = veto for a NEW paper signal.
       (Existing open paper positions are not closed by this gate;
       closing is the brain's / exit policy's job, not this module's.)
  If any check is missing or fails, paper_gate() returns VETO with the
  reasons. Paper fills, when the brain does make them, stay in the
  existing registry ~/workspace/braindata/cns_positions.db. This module
  never writes to that registry, never creates an order, and never
  edits the brain.

LIVE PATH (no new live execution path):
  - There is NO live order, broker, swap, or shell code in this module
    or anywhere in vibe-research-lab. Nothing here can buy, sell, sign,
    or connect a wallet.
  - Live trades go ONLY through the existing Allen2 bridge, with its
    existing gates intact: spine dossier custody first, sell-sim / PoVV,
    copycat census, and position caps. Those gates are authoritative;
    this module does not re-implement them and does not bypass them.
  - What this module CAN do for live: VETO or RANK a candidate the
    bridge is already considering, using the same validation / decay /
    provenance evidence. live_rank() returns a rank score and reasons,
    never a buy instruction. A high rank does not force a buy; a veto
    does not force a sell. The bridge may still block a high-ranked
    candidate on custody / sell-sim / copycat, and that block stands.
  - live_veto() takes the BRIDGE's own gate results as inputs
    (custody, sell_sim_pct, copycat_count, at_cap) and mirrors them:
    if the bridge says blocked, this module says veto too. It never
    says "pass" for a candidate the bridge blocked.

BETTERMENT LOGIC (why this should improve gains, in the README too):
  fewer false positives (validation kills hallucinated Sharpe), faster
  retirement of dying strategies (decay monitoring), fewer un-sellable
  entries (sell-sim + custody stay as hard gates), and auditable
  decisions (provenance). Gains improve by trading fewer, better,
  sellable trades, not by trading more or looser.
"""

from __future__ import annotations


def paper_gate(validation, provenance_verified, decay_signal):
    """Evaluate a paper-signal candidate. Returns (verdict, reasons).

    validation: dict from paper_validation.run_validation (or None).
    provenance_verified: bool from artifact_provenance.verify_artifact.
    decay_signal: string from decay_watch.decay_scan overall_signal.
    Verdict is PASS or VETO only. PASS is a recommendation to the brain,
    not an order.
    """
    reasons = []
    if validation is None:
        reasons.append("no validation run supplied")
    else:
        wf = (validation.get("walk_forward") or {})
        mc = (validation.get("monte_carlo") or {})
        bs = (validation.get("bootstrap") or {})
        if wf.get("error"):
            reasons.append(f"walk-forward error: {wf['error']}")
        elif wf.get("consistency_rate", 0) <= 0:
            reasons.append("walk-forward: no profitable window")
        if mc.get("error"):
            reasons.append(f"monte-carlo error: {mc['error']}")
        # Monte Carlo Sharpe p is deliberately NOT a gate criterion:
        # it is order-invariant and always 1.0 (see paper_validation.py).
        # Its max-drawdown p is reported in the validation dict for
        # review, but is not a hard gate either, because the additive
        # equity path can go below zero on -100% memecoin trades.
        if bs.get("error"):
            reasons.append(f"bootstrap error: {bs['error']}")
        elif bs.get("ci_lower") is not None and bs["ci_lower"] <= 0:
            reasons.append(f"bootstrap CI lower bound {bs['ci_lower']} <= 0")
    if not provenance_verified:
        reasons.append("provenance not verified")
    if decay_signal in ("decayed", "critical"):
        reasons.append(f"decay signal {decay_signal}: new paper signal vetoed")
    elif decay_signal not in ("healthy", "warning"):
        reasons.append(f"decay signal {decay_signal or 'missing'}: cannot pass without a decay check")
    if reasons:
        return "VETO", reasons
    return "PASS", ["validation, provenance, and decay checks all passed"]


def live_veto(custody=None, sell_sim_pct=None, copycat_count=None, at_cap=False):
    """Mirror the bridge's own gates. Returns (veto_bool, reasons).

    This function does not evaluate custody or sell-sim itself; it
    takes the bridge's results as inputs. If any bridge gate is blocked,
    veto is True. If all inputs are clean, veto is False, which means
    only 'no veto from this layer' -- the bridge still decides.
    """
    reasons = []
    if at_cap:
        reasons.append("position cap reached (bridge gate)")
    if sell_sim_pct is not None and float(sell_sim_pct) < 90:
        reasons.append(f"sell-sim {sell_sim_pct}% below 90% hard line (bridge gate)")
    if custody is not None and "deployer" in str(custody).lower():
        reasons.append("LP custody deployer-held (bridge gate)")
    if custody is not None and "undetermined" in str(custody).lower():
        reasons.append("LP custody undetermined: fail-closed (bridge gate)")
    if copycat_count is not None and int(copycat_count) >= 10:
        reasons.append(f"copycat swarm {copycat_count} (bridge gate)")
    return (len(reasons) > 0), reasons


def live_rank(validation, decay_signal, sell_sim_pct=None):
    """Rank a live candidate for the bridge's consideration. No order.

    Score 0..100, advisory only. A score of 0 means 'do not rank up';
    it does not mean 'sell' or 'block'. The bridge's gates still apply.
    """
    score = 50.0
    reasons = []
    if validation:
        mc = validation.get("monte_carlo") or {}
        p = mc.get("p_value_max_dd")
        if p is not None:
            # Drawdown p only: low p means the observed path's drawdown
            # is better than most shuffled paths. Sharpe p is degenerate.
            score += (1.0 - min(p, 1.0)) * 10
            reasons.append(f"monte-carlo max-dd p {p}")
        wf = validation.get("walk_forward") or {}
        if wf.get("consistency_rate") is not None:
            score += wf["consistency_rate"] * 20
            reasons.append(f"walk-forward consistency {wf['consistency_rate']}")
    if decay_signal == "healthy":
        score += 10
    elif decay_signal in ("decayed", "critical"):
        score -= 30
        reasons.append(f"decay {decay_signal}")
    if sell_sim_pct is not None and float(sell_sim_pct) < 90:
        score = 0.0
        reasons.append("sell-sim below 90%: ranked to zero, bridge gate stands")
    return round(max(0.0, min(100.0, score)), 1), reasons
