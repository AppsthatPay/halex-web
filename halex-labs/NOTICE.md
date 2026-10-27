# HALEX LABS NOTICE — Sources, Licenses, Taken, Skipped

HALEX LABS itself: MIT, Copyright (c) 2026 Jeffrey Allen Kaufman / HALEX,
see LICENSE. Every LABS deployment folder ships with LICENSE and this NOTICE.

Rule applied throughout: take only permissively licensed open-source code
(MIT, Apache-2.0, BSD, and similar), adapt it, and credit it here. Do not
take proprietary, closed, or non-permissively licensed code. Do not take
branding, logos, keys, or private material. Do not copy live execution or
wallet code from any source, regardless of license. If a license is unclear,
take only the idea in your own words, not the code, and note it here.

## 1. CloddsBot — TAKEN, adapted, MIT
- Source: https://github.com/alsk1992/CloddsBot
- License: MIT, Copyright (c) 2026 alsk1992, verified from LICENSE in the
  shallow clone 2026-10-27. Stars 3,011, forks 369, updated 2026-10-27,
  language TypeScript, version 1.9.1 in package.json.
- What was taken, as adapted Python patterns in sources/clodds/, not
  copied TypeScript code:
  - Edge scoring 0-100, weights adapted from docs/OPPORTUNITY_FINDER.md:
    edge, liquidity, confidence, execution, with penalties for low
    liquidity, high slippage, and low confidence. For HALEX memecoins,
    edge is tape and liquidity strength, not prediction-market arbitrage.
  - Unified risk checks from docs/RISK_MANAGEMENT.md and src/risk/:
    kill switch, circuit breaker, max order size, exposure limit, daily
    loss / drawdown, VaR/CVaR, volatility regime multipliers
    (low 1.2x, normal 1.0x, high 0.5x, extreme 0.25x / halt), stress
    scenarios (flash crash, liquidity crunch, platform down, correlation
    spike, black swan), Kelly sizing capped, never uncapped.
  - Paper-first discipline from src/agents/handlers/paper-trading.ts:
    simulated balance, positions, and P&L, with paper and live kept
    separate. HALEX paper history is never reset, unlike Clodds' paper
    reset handler, which HALEX explicitly does not adopt.
  - Pre-trade guard pattern from src/agents/handlers/trading-guard.ts
    and src/trading/pre-trade.ts: validate before any action, with
    max order size enforcement. In HALEX this is a veto/rank input to
    the Allen2 bridge, never an execution call.
  - Trade logging with integrity hashing as a concept: every LABS
    decision is logged with its inputs, so it can be audited.
- What was skipped, and why:
  - Prediction markets (Polymarket, Kalshi, Betfair, Smarkets, etc.):
    not HALEX memecoin trading, no mapping to our gates.
  - Perpetual futures up to 200x, Drift, Hyperliquid, Binance/Bybit
    futures: leverage is not in HALEX memecoin scope, and would break
    our risk posture.
  - Agent commerce x402, Bittensor mining, token launches, agent
    marketplace, compute API: unrelated to HALEX trading, intelligence,
    or knowledge needs.
  - Wallet, signing, swap, Jupiter/Raydium/Orca/Meteora execution,
    EVM swap, bridging, and credential handling: live execution and
    key code are excluded by rule, regardless of MIT license.
  - Claude-specific execution, 21 messaging channels, WebChat, and
    Clodds branding/logo/CA: not taken, not copied.
  - GoPlus audits: HALEX uses spine chain-truth dossiers first, not
    GoPlus, so this pattern was not adopted.

## 2. Vibe-research-lab — LINKED, not rebuilt
- Source: our own MIT adaptation of HKUDS Vibe-Trading patterns,
  already built at
  ~/workspace/goals/10-winning-trade-skills/hidden_files/vibe-research-lab/
- License: MIT, with upstream HKUDS Vibe-Trading MIT attribution in
  that project's NOTICE.md.
- Taken by link, not by copy: paper_validation.py, artifact_provenance.py,
  decay_watch.py, debate_report.py, factor_registry.py, meld_gate.py,
  vibe_research_lab_paper_check.py. See sources/vibe-research-lab/README.md
  for the manifest. No file in that directory was overwritten.
- Paper validation result already recorded: 246 closed paper trades,
  win rate 69.11%, profit factor 4.4518, trade-level Sharpe 0.4158,
  bootstrap 95% CI 0.3325 to 0.5107, walk-forward 5 of 5 windows profitable.
  Paper only, not a live promise.

## 3. GMGN skills — RECORDED, MIT, not yet coded
- Source: https://github.com/GMGNAI/gmgn-skills
- License: MIT, verified via GitHub API 2026-10-27. Stars 632, forks 110,
  updated 2026-10-27, language Python.
- Idea recorded for a later LABS pass: GMGN OpenAPI skills for token,
  wallet, and market data on Solana, BSC, and Base. No GMGN code was
  copied in this pass, and no GMGN execution code will be copied in a
  later pass. Data skills only, behind HALEX gates.

## 4. Oracle3 prediction-market agent — RECORDED, Apache-2.0, not yet coded
- Source: https://github.com/YichengYang-Ethan/oracle3-prediction-market-agent
- License: Apache-2.0, verified via GitHub API 2026-10-27. Stars 529,
  forks 64, updated 2026-10-27, language Python.
- Idea recorded: pre-trade risk limits, paper/live separation, 13 MCP
  tools, 600+ tests as a discipline model. No Oracle3 code was copied
  in this pass, and its prediction-market execution is not applicable
  to HALEX memecoins.

## 5. onchain-dex-cli — RECORDED, MIT, not yet coded
- Source: https://github.com/outsmartchad/onchain-dex-cli
- License: MIT, verified via GitHub API 2026-10-27. Stars 581, forks 192,
  updated 2026-10-16, language TypeScript.
- Idea recorded: DEX adapter pattern and landing-processor reliability
  as a concept. No execution, swap, snipe, or launch code was copied.

## 6. web3-agent-kit-solana-trading — RECORDED, MIT, watch only
- Source: https://github.com/teraus111/web3-agent-kit-solana-trading
- License: MIT, verified via GitHub API 2026-10-27. Stars 92, forks 0,
  created 2026-10-13, updated 2026-10-27, language Python.
- Status: watch only. New, small, unproven. No code copied in this pass.

## No other sources
- No proprietary, closed, or unclear-license code was taken.
- No branding, logos, private keys, seeds, or credentials were taken.
- No live execution or wallet code was taken from any source.
