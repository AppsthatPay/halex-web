# Skill: Clodds Risk Gate (HALEX LABS)

Plain English: check a trade against kill switch, circuit breaker, max
order size, exposure, daily loss, volatility regime, VaR/CVaR, stress
scenarios, Kelly capped sizing, sell-sim, and custody.

Inputs: kill switch, circuit tripped, notional, max order, exposure,
max exposure, daily loss, daily loss limit, volatility regime, sell-sim
percent, custody blocked flag, plus a list of past trade P&L percents
for VaR and regime detection.
Outputs: approved true/false, veto reasons, adjusted notional by regime
multiplier (low 1.2x, normal 1.0x, high 0.5x, extreme 0.25x / halt),
VaR, CVaR, Kelly fraction capped at 0.25, stress losses.
Limits: advisory and veto only. Kelly never sizes a live trade by itself.
Stress losses are scenarios, not predictions.
Gates: Allen2 bridge gates stay authoritative. This skill never executes.
Source: adapted from CloddsBot risk engine, MIT, see NOTICE.md.
Code: sources/clodds/risk_gate.py
