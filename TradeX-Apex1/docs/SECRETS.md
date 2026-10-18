# Secrets — TradeX-Apex1

**"Secrets as notes."** This package ships zero secret values. What it ships is
this document: for every credential the system can use, what it is, which
module needs it, where it lives on the machine, what breaks without it, and how
the builder generates their own. The operator's keys never ship and never
appear here.

## Handling rules

- Secrets live on the machine, never in the repo. Not in code, not in logs,
  not in chat, not in issues.
- Key files: `chmod 600`. Their directory: `chmod 700`.
- Template: copy `.env.example` to `.env` and fill in YOUR values. Never
  commit the filled-in file.
- If a module needs a secret that isn't present, it must fail closed with a
  clear message — never fall back to a shared, default, or empty credential.

## Credential inventory

### Codex API key
- **What:** the builder's personal Codex API key (blockchain data API).
- **Needed by:** signal-follower, allen3, allen4, allen5, codex-wallet,
  test01-codex. Without it, Codex-fed signals simply don't flow; the other
  three signal sources keep working.
- **Convention:** stored at `~/.config/apex2/codex-api-key.txt`, 600, or as
  `CODEX_API_KEY` in `.env`.
- **How to get:** create an account at the Codex dashboard (docs.codex.io),
  complete the one-time $1 activation, create an API key. Auth is the raw key
  in the `Authorization` header (no "Bearer" prefix).

### Solana keypair — TEST01 seat
- **What:** a Solana keypair the builder controls, used only if they arm the
  TEST01 live paths.
- **Needed by:** `mwts_executor`, `test01-newapi/live_exec` — both ship
  disarmed and stay inert without it.
- **Convention:** `~/.config/apex2/test01-wallet.json`, 600.
- **How to get:** `solana-keygen new -o ~/.config/apex2/test01-wallet.json`.
  Fund it yourself, start tiny. The system never funds wallets.

### EVM key — AllenX live seat
- **What:** an EVM keypair the builder controls, for the single armed live
  loop (Base).
- **Needed by:** `allenx_live_bridge` — ships DISARMED; inert without it.
- **Convention:** `~/.config/apex2/allenx-wallet.json`, 600.
- **How to get:** generate a fresh EVM keypair, store with 600 permissions.
  AllenX trades max $2 per trade — fund accordingly and no more.

### EVM key — Allen2 live seat
- **What:** an EVM keypair for the Allen2 live bridge.
- **Needed by:** `allen2_live_bridge` — ships DISARMED. Leave unset until you
  deliberately arm it.
- **Convention:** `~/.config/apex2/evm-wallet.json`, 600.

### Earnings sweep target
- **What:** the builder's own EVM address. 75% of realized AllenX earnings
  sweep here once realized earnings reach $200.
- **Convention:** `SWEEP_TARGET_EVM_ADDRESS` in `.env`.
- **How to get:** it's your address. Must be one you control.

### Arming records and flags (not secrets, but builder-created)
- `test01-newapi-arming.json`, the `test01-newapi-LIVE_ARMED` flag file, and
  `ARMED` files in bridge directories are created by the arming process
  itself. They are local state, never committed, never shared.

### RPC overrides (optional)
- `SOLANA_RPC_URL`, `BASE_RPC_URL` in `.env`. Defaults are the free public
  endpoints. Override only if you run your own node or a paid RPC.

### Optional future feeds (not required for the core build)
- `HELIUS_API_KEY` — Solana webhooks / enhanced RPC (signup at helius.dev).
- `BIRDEYE_API_KEY` — Solana market data, free 30k CU/month tier (birdeye.so).
- `ALTFINS_API_KEY` — altFINS signals (free signup).

## What breaks without what

| Missing | Effect |
|---|---|
| Codex key | No Codex signals; other sources continue |
| Solana keypair | TEST01 live paths stay inert (paper unaffected) |
| AllenX EVM key | AllenX bridge cannot arm (paper unaffected) |
| Sweep address | Sweep step fails closed; trades continue, no sweep |
| All keys | Full paper system still runs — detection, signals, paper traders, merit checks. Paper needs zero secrets. |
