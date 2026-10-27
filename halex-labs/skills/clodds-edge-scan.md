# Skill: Clodds Edge Scan (HALEX LABS)

Plain English: score a candidate token 0-100, and rank candidates, before
any paper or live decision.

Inputs: symbol, chain, mint, liquidity USD, buys/sells in 24h, volume,
confidence 0-1 from dossier/metadata, sell-sim percent from the HALEX gate.
Outputs: score, score parts (tape, liquidity, confidence, execution),
penalties, veto flag, veto reasons.
Limits: advisory only. A score is not a buy. One-way tape (0 sells) and
sell-sim below 90% both veto, regardless of score.
Gates: sell-sim / PoVV 90%+, custody, copycat, and position cap stay
authoritative in the Allen2 bridge. This skill never overrides them.
Source: adapted from CloddsBot opportunity scoring, MIT, see NOTICE.md.
Code: sources/clodds/edge_scan.py
