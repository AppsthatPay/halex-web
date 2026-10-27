# NOTICE — Vibe-research-lab

Vibe-research-lab is our internal project name for the additions in this
directory. It is NOT the upstream project, and it does not rename or
rebrand the upstream repo.

Upstream source (kept as-is, untouched, at ~/workspace/research/vibe-trading):
- HKUDS Vibe-Trading, https://github.com/HKUDS/Vibe-Trading
- Copyright 2026 Vibe-Trading Contributors
- Licence: MIT (see the upstream LICENSE file in that clone)

What was borrowed, in pattern and in adapted code logic:
- Backtest validation ideas (Monte Carlo permutation, bootstrap Sharpe CI,
  walk-forward) from agent/backtest/validation.py
- Run-card provenance hashing from agent/backtest/run_card.py
- Strategy decay lifecycle and thresholds from
  agent/src/skills/strategy-dev-manager (SKILL.md Phase 5 and
  references/decay_thresholds.md)
- Multi-agent desk role structure from agent/src/swarm/presets/crypto_trading_desk.yaml
- Factor registry pattern from agent/src/factors/registry.py

What was NOT copied:
- No live order, broker, swap, or execution code
- No shell-execution tooling, no CLI, no MCP server, no hosted service
- No API key handling, no wallet code
- No equity / China / Argentina / GTJA factor formulas, no 478-alpha dump
- No upstream branding, logos, or prose from the upstream README

All new code in this directory is an adaptation, written for Base/Solana
paper memecoin histories, with the differences documented per file in
README.md. The upstream MIT licence notice is preserved here as required
for substantial portions: the above copyright notice and this permission
notice are included in this NOTICE file.
