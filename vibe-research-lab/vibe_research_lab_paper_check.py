"""Vibe-research-lab paper-only test runner.

Reads the existing paper registry READ-ONLY, runs validation, provenance,
decay, debate, factor registry, and meld-gate checks, and writes results
only inside this directory's test_output/ folder.

Usage: python3 vibe_research_lab_paper_check.py
Exit 0 means the checks ran and produced a report, not that a strategy
passed. PASS/VETO verdicts are inside the JSON output.

No trades, no wallets, no keys, no live calls, no writes outside
this directory.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import artifact_provenance as prov
import debate_report
import decay_watch
import factor_registry
import meld_gate
import paper_validation as pv


def main():
    out_dir = HERE / "test_output"
    out_dir.mkdir(parents=True, exist_ok=True)

    trades = pv.load_paper_trades()
    # Strategy key = skill + thesis, chronological (load already sorts).
    by_key = {}
    for t in trades:
        by_key.setdefault(f"{t['skill']}|{t['thesis']}", []).append(t)

    validation = pv.run_validation(trades)
    # Provenance: the validation run itself, over the trades actually used.
    artifact = prov.make_artifact(
        name="vibe-research-lab paper validation run",
        data_source=str(pv.DEFAULT_DB),
        query="positions WHERE state='closed' AND pnl_pct IS NOT NULL ORDER BY exit_ts ASC",
        first_exit_ts=trades[0]["exit_ts"] if trades else None,
        last_exit_ts=trades[-1]["exit_ts"] if trades else None,
        benchmark="none (paper history scored against its own shuffled order, not a benchmark index)",
        code_path=HERE / "paper_validation.py",
        metrics=validation["base"],
        notes="Trade-level Sharpe; no daily-bar annualisation claimed. See paper_validation.py.",
    )
    log_path = out_dir / "vibe_research_lab_artifact_log.jsonl"
    # Fresh log per test run, so the test is reproducible and does not
    # append endlessly to an old file.
    log_path.write_text("", encoding="utf-8")
    prov.append_artifact(artifact, log_path)
    verified = prov.verify_artifact(artifact)

    decay_report = decay_watch.scan_strategies(by_key, window_size=20)

    # Debate + factor + meld examples use the most recent closed trade's
    # recorded fields only; custody / sell-sim are NOT in the registry,
    # so they are honestly reported as unknown in this test.
    latest = trades[-1] if trades else {}
    debate = debate_report.debate_report(
        {"symbol": latest.get("symbol"), "chain": latest.get("chain"), "mint": None},
        {"paper_win_rate": validation["base"]["win_rate"], "notes": "Test example; custody/sell-sim not in paper registry, shown as unknown."},
    )
    reg = factor_registry.default_registry()
    factor_health = reg.health()

    # Meld gate: use the overall paper validation + the main paper
    # strategy's decay signal for this test (allen2-base|momentum),
    # not an arbitrary first dict entry. Other strategies are listed
    # in full in the decay report.
    decay_signal = "unknown"
    if "allen2-base|momentum" in decay_report:
        decay_signal = decay_report["allen2-base|momentum"].get("state_hint", "unknown")
    else:
        for v in decay_report.values():
            if isinstance(v, dict) and v.get("state_hint") not in ("insufficient_data",):
                decay_signal = v["state_hint"]
                break
    gate_verdict, gate_reasons = meld_gate.paper_gate(
        validation, verified["verified"], decay_signal)
    veto, veto_reasons = meld_gate.live_veto(
        custody="undetermined (test input, mirrors bridge fail-closed)",
        sell_sim_pct=85, copycat_count=0, at_cap=False)
    rank, rank_reasons = meld_gate.live_rank(validation, decay_signal, sell_sim_pct=85)

    result = {
        "project": "vibe-research-lab",
        "paper_trades_closed": len(trades),
        "validation": validation,
        "provenance": {"artifact": artifact, "verified": verified},
        "decay_report": decay_report,
        "debate_example": debate,
        "factor_registry_health": factor_health,
        "factor_manifest": reg.export_manifest(),
        "meld_paper_gate": {"verdict": gate_verdict, "reasons": gate_reasons},
        "meld_live_example": {
            "veto": veto, "veto_reasons": veto_reasons,
            "rank": rank, "rank_reasons": rank_reasons,
            "note": "Rank/veto only. No live order was created, and none can be created by this module.",
        },
    }
    (out_dir / "paper_check_result.json").write_text(
        json.dumps(result, indent=2, sort_keys=True, default=str), encoding="utf-8")
    (out_dir / "paper_check_artifact.md").write_text(
        prov.render_markdown(artifact), encoding="utf-8")
    print(json.dumps({
        "paper_trades_closed": len(trades),
        "base": validation["base"],
        "monte_carlo_p_sharpe": validation["monte_carlo"].get("p_value_sharpe"),
        "bootstrap_ci": [
            validation["bootstrap"].get("ci_lower"),
            validation["bootstrap"].get("ci_upper"),
        ],
        "walk_forward_consistency": validation["walk_forward"].get("consistency_rate"),
        "provenance_verified": verified["verified"],
        "meld_paper_gate": gate_verdict,
        "meld_live_veto_example": veto,
        "meld_live_rank_example": rank,
    }, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
