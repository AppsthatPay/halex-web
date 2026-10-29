"""Vibe-research-lab: multi-agent debate report format.

Vibe source: agent/src/swarm/presets/crypto_trading_desk.yaml
  (funding/basis analyst, liquidation/microstructure analyst,
   on-chain/flow analyst, risk manager) and agent/src/swarm/presets.py
  (preset structure: named roles, each with a task, evidence, and limits).

Adaptation, and what was deliberately NOT copied:
  - No swarm runtime, no LLM agents, no bash/read_file/write_file tool
    lists, no market-data calls. This is a DETERMINISTIC report template.
    It takes evidence supplied by the caller (from our own dossier,
    sell-sim, copycat census, and DexScreener checks) and lays it out
    as bull / bear / risk-officer sections. A field with no evidence is
    rendered as "unknown", never invented.
  - Roles are renamed to fit our system: Bull (why this could work),
    Bear (why it could fail), Risk Officer (exit reality: can we sell,
    who holds the LP, what is the cap). The Risk Officer section is
    advisory; the bridge's own custody / sell-sim / copycat gates remain
    authoritative and are never overridden by this report.
  - Output feeds BCIA / CNS deliberation as a LAYER, never as a decision
    override. There is no buy, sell, size, or execution field anywhere
    in this module. A report that says "bull case strong" is not an
    order, and a report that says "risk officer veto" is a recommendation
    the brain may weigh, not a bridge bypass.
"""

from __future__ import annotations


def _v(value):
    return "unknown" if value is None or value == "" else str(value)


def debate_report(candidate, evidence):
    """Build a bull / bear / risk-officer debate report.

    candidate: dict with at least symbol, chain, mint (any may be None).
    evidence: dict, any of: liquidity_usd, tape_buys_24h, tape_sells_24h,
      sell_sim_pct, lp_custody, copycat_count, metadata_present,
      deployer_note, paper_win_rate, notes. Missing keys stay unknown.
    """
    e = evidence or {}
    bull_points = []
    bear_points = []
    if e.get("liquidity_usd"):
        bull_points.append(f"Liquidity reported: ${e['liquidity_usd']}.")
    if e.get("tape_buys_24h"):
        bull_points.append(f"Buy-side tape: {e['tape_buys_24h']} buys in 24h.")
    if e.get("paper_win_rate") is not None:
        bull_points.append(f"Paper history win rate (recorded): {e['paper_win_rate']}.")
    if not bull_points:
        bull_points.append("No bull evidence supplied.")
    if e.get("tape_sells_24h") == 0:
        bear_points.append("Tape shows 0 sells in 24h: the exit door has not been observed working.")
    if e.get("sell_sim_pct") is not None and float(e["sell_sim_pct"]) < 90:
        bear_points.append(
            f"Sell simulation returns only {e['sell_sim_pct']}% of expected: "
            "below the 90% live hard line."
        )
    if e.get("copycat_count"):
        bear_points.append(f"Copycat census: {e['copycat_count']} same-name contracts found.")
    if e.get("metadata_present") is False:
        bear_points.append("No website, socials, or description found.")
    if not bear_points:
        bear_points.append("No bear evidence supplied.")
    risk = []
    risk.append(f"LP custody: {_v(e.get('lp_custody'))}.")
    risk.append(f"Sell-sim: {_v(e.get('sell_sim_pct'))} (percent of expected out).")
    risk.append(f"Copycat count: {_v(e.get('copycat_count'))}.")
    risk.append(f"Deployer note: {_v(e.get('deployer_note'))}.")
    risk.append(
        "Risk-officer stance: ADVISORY ONLY. This report does not approve, "
        "size, or execute a trade. Live execution, if any, goes only through "
        "the existing Allen2 bridge with its own custody, sell-sim / PoVV, "
        "copycat, and position-cap gates intact."
    )
    return {
        "project": "vibe-research-lab",
        "candidate": {
            "symbol": _v(candidate.get("symbol")) if candidate else "unknown",
            "chain": _v(candidate.get("chain")) if candidate else "unknown",
            "mint": _v(candidate.get("mint")) if candidate else "unknown",
        },
        "bull": bull_points,
        "bear": bear_points,
        "risk_officer": risk,
        "decision": "NO DECISION MADE BY THIS MODULE. For BCIA/CNS deliberation only.",
        "notes": _v(e.get("notes")),
    }


def render_markdown(report):
    lines = [
        f"# Debate report: {report['candidate']['symbol']} "
        f"({report['candidate']['chain']})",
        f"Mint: {report['candidate']['mint']}",
        "",
        "## Bull",
        "",
    ]
    lines += [f"- {p}" for p in report["bull"]]
    lines += ["", "## Bear", ""]
    lines += [f"- {p}" for p in report["bear"]]
    lines += ["", "## Risk Officer", ""]
    lines += [f"- {p}" for p in report["risk_officer"]]
    lines += ["", f"Decision: {report['decision']}", f"Notes: {report['notes']}", ""]
    return "\n".join(lines)
