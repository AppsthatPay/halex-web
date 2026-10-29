# RUSTY Launchpad — token mint tab

The RUSTY-branded, tabbed token mint page. Part of the HALEX build.

## Files

- `mint.html` — the mint tab UI (self-contained, no build step). Six tabs:
  1. **Token** — chain selector (Solana, ETH, BNB, Base, Ink, Unichain,
     HyperEVM, Sei, XRP, Sui, Bitcoin Runes), name, ticker, supply, decimals.
  2. **Metadata** — description, logo, website, X/Telegram/Discord (UXSS-gated).
  3. **Owner** — Founding Minter handle + verification level
     (self-declared vs wallet-signature verified; `owner-verified`, never
     "official").
  4. **Page Design** — prompt box + style presets. Design input arrives via
     the AI socket as structured choices, never raw code; the page program
     stays hardwired and UXSS-verified.
  5. **Liquidity** — fair-launch bonding curve / seeded pool / mint-only.
  6. **Review & Deploy** — summary, per-chain fee estimate, deploy
     (paper mode until phone signing is wired).
- `assets/red-wolf-emblem.png` — the RUSTY red wolf mascot emblem
  (source file; the PNG is base64-embedded in `mint.html` so the page is
  fully self-contained — no missing-asset risk when shared).

## Serving

HALEX does not use Vercel (the Vercel route was closed on 2026-10-25).
Public hosting is GitHub Pages from branch `gh-pages`. The served copy
lives at `public/launchpad/mint.html` in this repo. `launchpad/mint.html`
is the same file kept beside this README as the source of truth.

## Wiring (when the native/app tab lands)

- Fill the form → RUSTY prepares the chain transaction → phone wallet signs
  on-device → chain mints → md token page generated → published to the
  Launch Feed API (`GET /api/v1/launches`) and the APEX¹ mint-feed card.
- Fee estimates in the UI are estimates only; confirmed on-chain at deploy.

## R&D

Internal HALEX workspace references (not in this repo):
- `~/workspace/braindata/research-incoming/rusty-mint-system-rnd-20261018.md` — adapter matrix + metadata schema.
- `~/workspace/braindata/research-incoming/rusty-mint-deepdive-20261018.md` — mint functions, fees, honest ability assessment.
