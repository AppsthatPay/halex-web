# Vibe-research-lab

Research-only additions to the HALEX / CNS trade system, adapted from HKUDS Vibe-Trading patterns under MIT, with attribution in NOTICE.md.

What it does, added not replacing:
- Paper validation: Monte Carlo, bootstrap, and walk-forward checks on paper history, with fees and slippage.
- Research artifact provenance: versioned artifacts showing data, date range, and code that produced a number.
- Strategy decay monitoring: active / monitoring / decayed / disabled lifecycle, report only.
- Multi-agent debate report: bull / bear / risk-officer advisory, no decision, no execution.
- Factor registry mapped to Token DNA fields: custody, sellability, copycat, tape imbalance, metadata presence, paper momentum.
- Meld gate: paper PASS / live rank-veto only. Live trades go only through the existing Allen2 bridge, with custody, sell-sim / PoVV, copycat, and position-cap gates intact.

What it does NOT do:
- No live order, broker, swap, or execution code from Vibe-Trading.
- No shell-execution tooling, no CLI, no MCP server, no hosted service, no API key or wallet code.
- No equity / China / Argentina / GTJA factors, no 478-alpha dump, no upstream branding.

Paper validation run 2026-10-27, 246 closed paper trades: win rate 69.11%, profit factor 4.4518, trade-level Sharpe 0.4158, bootstrap 95% CI 0.3325 to 0.5107, walk-forward 5 of 5 windows profitable. Paper only, not a live promise.

License: MIT, see LICENSE. Upstream attribution: see NOTICE.md.
