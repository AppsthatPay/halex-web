#!/usr/bin/env python3
"""minimal_merit_check.py — TradeX-Apex1 teaching example.

A small, WORKING, paper-only merit checker. Given a Solana token mint it:
  1. Looks the token up on DexScreener (free, no key).
  2. Reads liquidity, 1-hour buy/sell tape, and pair age.
  3. Screens for mayhem-mode programs and impersonation names.
  4. Prints GREEN / AMBER / RED / UNKNOWN with reasons.

Paper-only: it never trades, never signs, never moves funds. It only reads
public market data and reports a verdict. This is the same pattern the
full system's mirror_token_check uses, reduced to one file.

Usage:
    python3 minimal_merit_check.py <solana-mint>
    python3 minimal_merit_check.py 9db8wvB6xj38GdASj2exvNP7CKHfCDwdEgGgVJLTpump

Requires only: pip install requests
"""
import json
import sys
import time

import requests

# --- Gates (same values as the full system) ---------------------------------
MIN_LIQ_USD = 1500.0   # Allen2's liquidity gate: below this, no trade
MIN_H1_BUYS = 3        # fewer than 3 buys in the last hour = no interest
MAX_PAIR_AGE_MIN = 120  # older than 2h = stale signal, not fresh alpha

# Impersonation screen: brand/celebrity names that must not appear in the
# token's name or symbol. Impersonation launches are the dominant scam
# pattern — never trust the ticker; check the metadata.
IMPERSONATION_TOKENS = {
    "coinbase", "binance", "kraken", "tesla", "apple", "google", "amazon",
    "microsoft", "nvidia", "trump", "djt", "musk", "doge", "shib",
    "pepe", "disney", "coca", "nike", "mcdonald", "starbucks",
    "openai", "chatgpt", "sora", "samaltman", "anthropic", "claude",
}


def fetch_pair(mint):
    """Return the most relevant DexScreener pair for a mint, or (None, reason)."""
    url = f"https://api.dexscreener.com/latest/dex/tokens/{mint}"
    data = requests.get(url, timeout=15).json()
    pairs = data.get("pairs") or []
    if not pairs:
        return None, "no DexScreener pair (token too new to be indexed, or dead)"
    # Prefer the pump.fun pair; otherwise take the deepest-liquidity pair.
    pair = next((p for p in pairs if "pump" in str(p.get("dexId", "")).lower()), None)
    if pair is None:
        pair = max(pairs, key=lambda p: (p.get("liquidity") or {}).get("usd", 0) or 0)
    return pair, ""


def check_mint(mint):
    """Run the merit check. Returns (verdict, reasons, facts)."""
    reasons = []
    pair, err = fetch_pair(mint)
    if pair is None:
        # Fail-closed: we cannot evaluate what we cannot see.
        return "UNKNOWN", [err], {"indexed": False}

    blob = json.dumps(pair).lower()
    name = pair.get("baseToken", {}).get("name", "")
    symbol = pair.get("baseToken", {}).get("symbol", "")
    liq = (pair.get("liquidity") or {}).get("usd", 0) or 0
    price = float(pair.get("priceUsd", 0) or 0)
    mcap = pair.get("marketCap", 0) or pair.get("fdv", 0) or 0
    h1 = (pair.get("txns", {}) or {}).get("h1", {}) or {}
    buys = h1.get("buys", 0) or 0
    sells = h1.get("sells", 0) or 0
    vol_h1 = (pair.get("volume", {}) or {}).get("h1", 0) or 0
    created_ms = pair.get("pairCreatedAt", 0) or 0
    age_min = (time.time() * 1000 - created_ms) / 60000 if created_ms else None

    verdict = "GREEN"

    # Hard screens first — any one of these is an immediate RED.
    if "mayhem" in blob:
        verdict = "RED"
        reasons.append("mayhem-mode token (never trade live)")
    text = f"{symbol} {name}".lower()
    for bad in IMPERSONATION_TOKENS:
        if bad in text:
            verdict = "RED"
            reasons.append(f"impersonation suspect: '{bad}' in name/symbol")
            break
    if liq < MIN_LIQ_USD:
        verdict = "RED"
        reasons.append(f"liquidity ${liq:,.0f} < ${MIN_LIQ_USD:,.0f}")
    if buys < MIN_H1_BUYS:
        verdict = "RED"
        reasons.append(f"h1 buys {buys} < {MIN_H1_BUYS}")
    elif buys < sells:
        verdict = "RED"
        reasons.append(f"dump pressure: buys {buys} < sells {sells}")

    # Soft screen: a passing token that is old is stale, not fresh.
    if verdict == "GREEN" and age_min is not None and age_min > MAX_PAIR_AGE_MIN:
        verdict = "AMBER"
        reasons.append(f"pair age {age_min / 60:.1f}h — stale signal")

    if not reasons:
        reasons.append(
            "all gates pass: liquidity ok, buys >= sells, fresh, "
            "no impersonation, no mayhem"
        )

    facts = {
        "indexed": True,
        "name": name,
        "symbol": symbol,
        "price_usd": price,
        "mcap_usd": mcap,
        "liq_usd": liq,
        "h1_buys": buys,
        "h1_sells": sells,
        "h1_vol_usd": vol_h1,
        "pair_age_min": round(age_min, 1) if age_min is not None else None,
        "dex": pair.get("dexId"),
    }
    return verdict, reasons, facts


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <solana-mint>")
        sys.exit(2)
    mint = sys.argv[1].strip()
    try:
        verdict, reasons, facts = check_mint(mint)
    except requests.RequestException as e:
        # Network failure is not a verdict — say so plainly.
        print(f"CHECK {mint[:16]}... UNKNOWN: network error ({e})")
        sys.exit(1)
    label = facts.get("symbol") or facts.get("name") or mint[:16]
    print(f"CHECK {label} ({mint[:16]}...) {verdict}")
    for r in reasons:
        print(f"  - {r}")
    if facts.get("indexed"):
        print(
            f"  price ${facts['price_usd']:.10f} | mcap ${facts['mcap_usd']:,.0f} | "
            f"liq ${facts['liq_usd']:,.0f} | h1 {facts['h1_buys']}b/{facts['h1_sells']}s"
        )


if __name__ == "__main__":
    main()
