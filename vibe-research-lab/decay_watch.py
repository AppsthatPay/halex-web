"""Vibe-research-lab: strategy decay monitoring, adapted from Vibe-Trading SDM.

Vibe sources:
  agent/src/skills/strategy-dev-manager/SKILL.md Phase 5 (MONITOR)
  agent/src/skills/strategy-dev-manager/references/decay_thresholds.md
    State machine: created -> benching -> active -> monitoring -> decayed
    -> disabled, with recovery monitoring -> active on healthy.
    Bands (worst metric wins):
      IC ratio: healthy >0.7, warning 0.5-0.7, decayed 0.3-0.5, critical <0.3
      IR: healthy >1.0, warning 0.5-1.0, decayed 0.1-0.5, critical <0.1
      IC positive ratio: healthy >55%, warning 45-55%, decayed 35-45%,
        critical <35%
      Sharpe (strategy): healthy >1.0, warning 0.5-1.0, decayed 0.0-0.5,
        critical <0.0

Adaptation for paper memecoin strategies, where IC is not available:
  - The "IC ratio" slot is replaced by a WIN-RATE RATIO: rolling win rate
    divided by baseline win rate (first window / first N closes). It is
    labelled as a win-rate ratio, never called IC, because it is not IC.
  - The Sharpe slot uses the trade-level Sharpe from paper_validation.py.
  - The positive-ratio slot uses the rolling win rate itself.
  - Baseline = the first window of closed trades for that strategy key
    (skill + thesis). Rolling = the most recent window.
  - Transitions follow Vibe's counts, with one honest difference noted
    in the README: Vibe's SKILL.md says monitoring -> active on 1 healthy
    reading, while decay_thresholds.md says recovery on IC ratio > 0.7;
    this module uses 2 consecutive healthy readings for recovery, the
    stricter of the two, and says so.
  - Output is a REPORT ONLY. Nothing here disables a strategy, stops a
    bridge, or changes a gate. A "disabled" state in this report means
    "this watcher recommends review for disabling", not that anything
    was disabled.
"""

from __future__ import annotations

from paper_validation import sharpe_trade_level

# Bands: (healthy_min, warning_min, decayed_min) -- below decayed_min = critical
SHARPE_BANDS = (1.0, 0.5, 0.0)
WINRATE_RATIO_BANDS = (0.7, 0.5, 0.3)
WINRATE_BANDS = (0.55, 0.45, 0.35)


def _signal(value, bands):
    """Return healthy/warning/decayed/critical for one metric, or unknown."""
    if value is None:
        return "unknown"
    healthy, warning, decayed = bands
    if value > healthy:
        return "healthy"
    if value >= warning:
        return "warning"
    if value >= decayed:
        return "decayed"
    return "critical"


_ORDER = {"unknown": 0, "healthy": 1, "warning": 2, "decayed": 3, "critical": 4}


def worst_signal(signals):
    """Worst signal wins, as in Vibe's decay evaluation."""
    known = [s for s in signals if s != "unknown"]
    if not known:
        return "unknown"
    return max(known, key=lambda s: _ORDER[s])


def score_window(trades):
    """Score one window of closed trades (chronological list of dicts)."""
    pnls = [t["pnl"] for t in trades]
    if not pnls:
        return {"n_trades": 0, "win_rate": None, "sharpe_trade_level": None}
    wins = sum(1 for p in pnls if p > 0)
    return {
        "n_trades": len(pnls),
        "win_rate": round(wins / len(pnls), 4),
        "sharpe_trade_level": (
            round(sharpe_trade_level(pnls), 4)
            if sharpe_trade_level(pnls) is not None else None
        ),
    }


def decay_scan(baseline_trades, rolling_trades):
    """Compare a rolling window against a baseline window. Returns a dict."""
    base = score_window(baseline_trades)
    roll = score_window(rolling_trades)
    ratio = None
    if base["win_rate"] and base["win_rate"] > 0 and roll["win_rate"] is not None:
        ratio = round(roll["win_rate"] / base["win_rate"], 4)
    signals = [
        _signal(ratio, WINRATE_RATIO_BANDS),
        _signal(roll["sharpe_trade_level"], SHARPE_BANDS),
        _signal(roll["win_rate"], WINRATE_BANDS),
    ]
    return {
        "baseline": base,
        "rolling": roll,
        "win_rate_ratio": ratio,
        "signals": {
            "win_rate_ratio": signals[0],
            "sharpe": signals[1],
            "win_rate": signals[2],
        },
        "overall_signal": worst_signal(signals),
    }


def transition(current_state, signal, consecutive_counts):
    """One step of the state machine. Returns (new_state, new_counts).

    consecutive_counts: dict with keys warning, decayed, critical, healthy.
    Rules (stricter recovery than Vibe's SKILL.md, as documented above):
      active -> monitoring on 1 warning-or-worse reading (then counts build)
      monitoring -> decayed after 2 decayed-or-worse readings
      decayed -> disabled after 3 critical readings
      monitoring -> active after 2 consecutive healthy readings
      disabled stays disabled until a human re-enables it (manual only).
    """
    counts = dict(consecutive_counts)
    for key in ("warning", "decayed", "critical", "healthy"):
        counts.setdefault(key, 0)
    if signal == "healthy":
        counts["healthy"] += 1
        counts["warning"] = counts["decayed"] = counts["critical"] = 0
    elif signal == "warning":
        counts["warning"] += 1
        counts["healthy"] = 0
    elif signal == "decayed":
        counts["decayed"] += 1
        counts["healthy"] = 0
    elif signal == "critical":
        counts["critical"] += 1
        counts["healthy"] = 0
    else:  # unknown: no transition, counts unchanged
        return current_state, counts
    state = current_state
    if state == "disabled":
        state = "disabled"  # manual re-enable only
    elif state == "decayed" and counts["critical"] >= 3:
        state = "disabled"
    elif state == "monitoring" and counts["decayed"] >= 2:
        state = "decayed"
    elif state == "monitoring" and counts["healthy"] >= 2:
        state = "active"
    elif state == "active" and signal in ("warning", "decayed", "critical"):
        state = "monitoring"
    return state, counts


def scan_strategies(trades_by_key, window_size=20):
    """Scan every strategy key. trades_by_key: {key: chronological trades}.

    Each key's baseline is its first `window_size` trades, rolling is its
    last `window_size` trades. Keys with fewer than 2 windows are reported
    as insufficient_data, not scored.
    """
    report = {}
    for key, trades in trades_by_key.items():
        if len(trades) < window_size * 2:
            report[key] = {
                "state_hint": "insufficient_data",
                "n_trades": len(trades),
                "needed": window_size * 2,
                "note": "Not enough closed trades for a baseline + rolling window.",
            }
            continue
        scan = decay_scan(trades[:window_size], trades[-window_size:])
        report[key] = {
            "state_hint": scan["overall_signal"],
            "baseline": scan["baseline"],
            "rolling": scan["rolling"],
            "win_rate_ratio": scan["win_rate_ratio"],
            "signals": scan["signals"],
            "note": "Report only. No strategy was disabled by this scan.",
        }
    return report
