"""Vibe-research-lab: paper-strategy validation, adapted from HKUDS Vibe-Trading.

Vibe source: agent/backtest/validation.py
  monte_carlo_test, bootstrap_sharpe_ci, walk_forward_analysis, run_validation
  (numpy/pandas + TradeRecord in the original).

Adaptation for our system, and why it differs:
  - Stdlib only (no numpy/pandas), so it runs under any python3 here.
  - Input is OUR paper registry, read-only: closed positions from
    ~/workspace/braindata/cns_positions.db, table `positions`, state='closed',
    pnl_pct not null, ordered by exit_ts. No live data, no broker, no orders.
  - Vibe annualises Sharpe with bars_per_year (252 for daily bars). Paper
    memecoin trades here are intraday and irregular, so the default here is
    TRADE-LEVEL Sharpe (mean / std of per-trade returns, no sqrt scaling).
    Pass bars_per_year explicitly only if you can justify a bar convention,
    and the output records which convention was used.
  - Fees/slippage: `fee_pct` and `slippage_pct` are an EXTRA sensitivity
    haircut applied on top of the recorded pnl for the test run only. They
    do NOT rewrite the registry and are reported separately, so a result
    with a haircut is never confused with the recorded win rate.
  - Point-in-time rule: only closed positions are used, windows are
    sequential and non-overlapping, and no window ever sees a later trade.
    A metric that cannot be computed (too few trades, zero variance) is
    returned as null with a reason, never as a plausible 0.0 -- the same
    discipline Vibe's own changelog states for undefined ratios.

This module scores a history. It does NOT change any existing win-rate
calculation, does NOT place or approve a trade, and does NOT override
any CNS, BCIA, or bridge gate.
"""

from __future__ import annotations

import math
import random
import sqlite3
from pathlib import Path

DEFAULT_DB = Path.home() / "workspace" / "braindata" / "cns_positions.db"


def load_paper_trades(db_path=DEFAULT_DB, chain=None, skill=None, limit=None):
    """Read closed paper positions, read-only. Returns a list of dicts.

    Each dict: symbol, chain, skill, thesis, pnl (fraction, pnl_pct/100),
    pnl_pct, entry_ts, exit_ts. Ordered by exit_ts ascending (chronological).
    """
    uri = f"file:{db_path}?mode=ro"
    con = sqlite3.connect(uri, uri=True)
    try:
        sql = (
            "SELECT symbol, chain, skill, thesis, pnl_pct, entry_ts, exit_ts "
            "FROM positions WHERE state='closed' AND pnl_pct IS NOT NULL "
            "AND exit_ts IS NOT NULL"
        )
        params = []
        if chain:
            sql += " AND chain=?"
            params.append(chain)
        if skill:
            sql += " AND skill=?"
            params.append(skill)
        sql += " ORDER BY exit_ts ASC"
        if limit:
            sql += " LIMIT ?"
            params.append(int(limit))
        rows = con.execute(sql, params).fetchall()
    finally:
        con.close()
    trades = []
    for symbol, chain_v, skill_v, thesis, pnl_pct, entry_ts, exit_ts in rows:
        trades.append({
            "symbol": symbol, "chain": chain_v, "skill": skill_v,
            "thesis": thesis, "pnl_pct": float(pnl_pct),
            "pnl": float(pnl_pct) / 100.0,
            "entry_ts": entry_ts, "exit_ts": exit_ts,
        })
    return trades


def apply_haircut(pnls, fee_pct=0.0, slippage_pct=0.0):
    """Return pnls with an extra fee+slippage haircut, as fractions."""
    hair = (float(fee_pct) + float(slippage_pct)) / 100.0
    if hair == 0.0:
        return list(pnls)
    return [p - hair for p in pnls]


def _mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


def _std(xs):
    if len(xs) < 2:
        return 0.0
    m = _mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / len(xs))


def sharpe_trade_level(pnls, bars_per_year=1):
    """Trade-level Sharpe: mean/std, scaled by sqrt(bars_per_year) if given.

    Returns None when std is 0 or there are too few observations.
    """
    if len(pnls) < 2:
        return None
    sd = _std(pnls)
    if sd == 0.0:
        return None
    return (_mean(pnls) / sd) * math.sqrt(float(bars_per_year))


def max_drawdown(pnls, initial_capital=1.0):
    """Max drawdown of the additive equity path 1.0 + cumsum(pnls)."""
    equity = initial_capital
    peak = equity
    worst = 0.0
    for p in pnls:
        equity += p * initial_capital
        peak = max(peak, equity)
        if peak > 0:
            worst = min(worst, (equity - peak) / peak)
    return worst


def base_metrics(pnls):
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p <= 0]
    gross_win = sum(wins)
    gross_loss = -sum(losses)
    return {
        "n_trades": len(pnls),
        "win_rate": round(len(wins) / len(pnls), 4) if pnls else None,
        "wins": len(wins),
        "losses": len(losses),
        "total_return": round(sum(pnls), 4),
        "mean_pnl_pct": round(_mean(pnls) * 100, 4) if pnls else None,
        "sharpe_trade_level": (
            round(sharpe_trade_level(pnls), 4)
            if sharpe_trade_level(pnls) is not None else None
        ),
        "max_drawdown": round(max_drawdown(pnls), 4) if pnls else None,
        "profit_factor": (
            round(gross_win / gross_loss, 4) if gross_loss > 0 else None
        ),
    }


def monte_carlo_test(pnls, n_simulations=1000, seed=42, bars_per_year=1):
    """Permutation test, after Vibe monte_carlo_test.

    Null: the observed Sharpe / max-drawdown is no better than a random
    ordering of the same trades. Returns p-values, not a verdict.

    KNOWN LIMIT, FOUND IN TESTING (2026-10-27): Sharpe is mean/std of
    the same trade set, so it is invariant to permutation. Simulated
    Sharpe mean, p5, and p95 will all equal the observed Sharpe, and
    p_value_sharpe will always be 1.0. Do NOT use p_value_sharpe as a
    pass/fail criterion. The informative Monte Carlo output here is
    p_value_max_dd, because drawdown IS path-dependent. See meld_gate.py.
    """
    if len(pnls) < 3:
        return {"error": "need at least 3 trades", "p_value_sharpe": 1.0}
    if n_simulations < 1:
        return {"error": "n_simulations must be >= 1", "p_value_sharpe": 1.0}
    actual_sharpe = sharpe_trade_level(pnls, bars_per_year)
    actual_dd = max_drawdown(pnls)
    rng = random.Random(seed)
    sharpe_ge = 0
    dd_ge = 0
    sim_sharpes = []
    for _ in range(n_simulations):
        shuffled = list(pnls)
        rng.shuffle(shuffled)
        s = sharpe_trade_level(shuffled, bars_per_year)
        if s is None:
            continue
        sim_sharpes.append(s)
        if actual_sharpe is not None and s >= actual_sharpe:
            sharpe_ge += 1
        if max_drawdown(shuffled) >= actual_dd:
            dd_ge += 1
    n = len(sim_sharpes) or 1
    sim_sharpes.sort()
    def pct(q):
        return round(sim_sharpes[min(n - 1, int(q * n))], 4)
    return {
        "actual_sharpe": round(actual_sharpe, 4) if actual_sharpe is not None else None,
        "actual_max_dd": round(actual_dd, 4),
        "p_value_sharpe": round(sharpe_ge / n, 4),
        "p_value_max_dd": round(dd_ge / n, 4),
        "simulated_sharpe_mean": round(_mean(sim_sharpes), 4),
        "simulated_sharpe_p5": pct(0.05),
        "simulated_sharpe_p95": pct(0.95),
        "n_simulations": n_simulations,
        "n_trades": len(pnls),
        "seed": seed,
    }


def bootstrap_sharpe_ci(pnls, n_bootstrap=1000, confidence=0.95, seed=42,
                        bars_per_year=1):
    """Resample per-trade returns with replacement; Sharpe confidence interval."""
    if len(pnls) < 5:
        return {"error": "need at least 5 return observations"}
    if not (0.0 < confidence < 1.0):
        return {"error": "confidence must be in (0, 1)"}
    observed = sharpe_trade_level(pnls, bars_per_year)
    rng = random.Random(seed)
    boots = []
    for _ in range(n_bootstrap):
        sample = [rng.choice(pnls) for _ in pnls]
        s = sharpe_trade_level(sample, bars_per_year)
        if s is not None:
            boots.append(s)
    boots.sort()
    n = len(boots)
    alpha = (1 - confidence) / 2
    lower = boots[min(n - 1, int(alpha * n))]
    upper = boots[min(n - 1, int((1 - alpha) * n))]
    return {
        "observed_sharpe": round(observed, 4) if observed is not None else None,
        "ci_lower": round(lower, 4),
        "ci_upper": round(upper, 4),
        "median_sharpe": round(boots[n // 2], 4),
        "prob_positive": round(sum(1 for b in boots if b > 0) / n, 4),
        "confidence": confidence,
        "n_bootstrap": n_bootstrap,
        "seed": seed,
    }


def walk_forward_analysis(trades, n_windows=5, bars_per_year=1):
    """Split trades chronologically into non-overlapping windows.

    `trades` must already be in chronological (exit_ts) order, as
    load_paper_trades returns. Each window is scored on its own trades only.
    """
    if len(trades) < n_windows * 2:
        return {"error": f"need at least {n_windows * 2} trades for {n_windows} windows"}
    size = len(trades) // n_windows
    windows = []
    for i in range(n_windows):
        chunk = trades[i * size:] if i == n_windows - 1 else trades[i * size:(i + 1) * size]
        pnls = [t["pnl"] for t in chunk]
        wins = sum(1 for p in pnls if p > 0)
        windows.append({
            "window": i + 1,
            "first_exit_ts": chunk[0]["exit_ts"],
            "last_exit_ts": chunk[-1]["exit_ts"],
            "trades": len(chunk),
            "return": round(sum(pnls), 4),
            "win_rate": round(wins / len(pnls), 4) if pnls else None,
            "sharpe_trade_level": (
                round(sharpe_trade_level(pnls, bars_per_year), 4)
                if sharpe_trade_level(pnls, bars_per_year) is not None else None
            ),
            "max_drawdown": round(max_drawdown(pnls), 4),
        })
    profitable = sum(1 for w in windows if w["return"] > 0)
    return {
        "n_windows": n_windows,
        "windows": windows,
        "profitable_windows": profitable,
        "consistency_rate": round(profitable / n_windows, 4),
        "return_mean": round(_mean([w["return"] for w in windows]), 4),
        "sharpe_mean": round(_mean([w["sharpe_trade_level"] or 0 for w in windows]), 4),
    }


def run_validation(trades, fee_pct=0.0, slippage_pct=0.0, n_simulations=1000,
                   n_bootstrap=1000, n_windows=5, seed=42, bars_per_year=1):
    """Run all three checks on a trade list. Returns one dict.

    This is the report, not a decision: a low Monte Carlo p-value does not
    authorise a trade, and a high one does not block one. Gates stay intact.
    """
    pnls = apply_haircut([t["pnl"] for t in trades], fee_pct, slippage_pct)
    # Walk-forward must use the haircut pnls in chronological order.
    wf_trades = [{**t, "pnl": p} for t, p in zip(trades, pnls)]
    return {
        "sharpe_convention": (
            "trade-level (bars_per_year=%s); no daily-bar annualisation "
            "is claimed for irregular intraday paper trades" % bars_per_year
        ),
        "fee_pct_extra": fee_pct,
        "slippage_pct_extra": slippage_pct,
        "base": base_metrics(pnls),
        "monte_carlo": monte_carlo_test(pnls, n_simulations, seed, bars_per_year),
        "bootstrap": bootstrap_sharpe_ci(pnls, n_bootstrap, 0.95, seed, bars_per_year),
        "walk_forward": walk_forward_analysis(wf_trades, n_windows, bars_per_year),
    }
