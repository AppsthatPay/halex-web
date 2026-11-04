# Skills Tab Secure Expansion — build spec (staging only)

Status: STAGING SPEC. Not implemented in index.html. Not pushed.
Builds on the live Skills Lab + Skill Forge already in staging
index.html (skill roll, Forge conversation, read-only forged-skill
window, paper-test gate note). This spec adds the AI communicative
layer the user asked for — conversation, visualization, wallet panel,
gas panel — without adding any fund-moving capability.

Standing boundary: HALEX-M holds no keys, signs nothing, moves no
funds. Wallet connect is read-only. Nothing in this spec creates a
trade, a signature, a transfer, or a key input.

## (a) User skill-design flow

One conversation, five stages, each stage gated before the next opens.
The user drives; the AI explains, breaks down, and records. The AI
never executes.

1. **Conversation (Skills Tab, Skill Forge).** The user types an idea,
   a prompt, or a wallet address worth watching, exactly as today.
   SMT (the Skills Lab builder) keeps the conversation in this tab.
   User text is DATA (see `skills-injection-guardrails.md`): it is
   never treated as an instruction to the app, and it never reaches a
   wallet, a signer, or a trade path.
2. **Tactical breakdown.** The AI returns, in plain language: entry
   rule, exit rule, risk guards (time stop, size cap, loss brake),
   what would invalidate the idea, and what data is still missing.
   Missing data is labelled NOT READ, never filled in. The user edits
   until the shape is decidable.
3. **Forged skill text (read-only window).** Only when the shape is
   decidable does "Forge the skill" unlock — as today. The forged text
   renders in a read-only window (today's `forge-output` textarea,
   readonly). The user may copy it or launch it into the paper arena.
   The skill text itself is inert text: displaying it, copying it, or
   storing it performs no on-chain action.
4. **Paper arena.** Every forged skill enters the paper arena first.
   Paper trades are recorded events: timestamp, entry, exit, size,
   recorded gas/fee cost, outcome. The arena runs on recorded data
   only. No live capital, no live wallet, no signer is involved at
   this stage — by construction, not by promise.
5. **Published gate, then live offered — only then.** Live is offered
   only when the recorded paper record meets ALL THREE legs of the
   standing HALEX rule:
   - win rate >= 65%, AND
   - >= 30 closed paper trades, AND
   - profit factor >= 1.2.
   Any leg missing or below bar = NOT PROVEN, and live is not offered.
   A reworked skill restarts its proving count; the old record stays
   visible and does not carry over.
6. **Live, inside hard caps (only after the gate).** If and when live
   is ever offered, it runs inside hard caps set before the first live
   trade: max size per trade, max open positions, a gas-spend cap, and
   the standing HALEX live rules (exact-amount approvals only, gas
   reserve kept aside, no averaging down). Live execution itself is
   OUT OF SCOPE for this spec and for this build — it would go through
   the existing separately-gated bridge path, never through the chat
   panel. This spec adds no live path.

State changes at every stage require an explicit user tap (button
press), plus the gate check for that stage. A chat message alone never
changes state, never launches a skill, and never spends anything.

## (b) Trading-system visualization

Drawn ONLY from recorded paper trades. If a trade, a fee, or a price
was not recorded, the chart shows a gap labelled NOT READ — it is never
backfilled, smoothed over, or reconstructed from memory.

- **Paper trade timeline:** one row per recorded paper trade, in time
  order: entry, exit (or "open"), size, outcome. Open trades stay open;
  they are not counted as wins or losses.
- **Equity curve:** cumulative recorded paper P&L over closed trades
  only. The curve starts at the recorded starting bankroll; if the
  starting bankroll was not recorded, the axis label says
  "starting bankroll: NOT READ" and the curve is shown as deltas only,
  not as an absolute balance.
- **Gas-cost ledger:** one line per recorded trade showing the
  recorded fee cost for that trade, plus a running total. Fees are
  costs, not profits: they subtract from P&L in the ledger view.
  Unrecorded fees render as NOT READ for that trade, and the running
  total carries a "partial — some fees NOT READ" flag rather than a
  clean total.
- **Skill scorecard:** win rate, closed count, profit factor, and gate
  status (PROVEN / PROVING / NOT PROVEN), computed from the recorded
  trades at render time — never stored as a claim, always recomputed
  from the record so a stale scorecard cannot outlive its trades.

## (c) Wallet control panel (read-only)

- **Shows:** public address (truncated display, full address only on
  explicit user tap), per-token balances, per-spender allowances, chain.
  All values come from a read the host app performed; values not read
  render as NOT READ.
- **Funds shown separately from starting allowance:** the panel has two
  distinct sections — "Balances" (what the address holds) and
  "Allowances" (what named spenders are permitted to move). An
  allowance is never added to a balance, never shown as available
  funds, and never presented as if it were held.
- **Forbidden in this panel, absolutely:** any input for a seed phrase,
  private key, password, or key file; any export of keys; any
  "transfer from chat" control; any button that signs, approves,
  revokes, sends, or withdraws. Revoke/approve/send actions happen only
  in the user's own wallet app, outside HALEX-M, and the panel must say
  so in plain words next to the allowances list.
- **Unconnected state:** if no wallet is connected, the panel shows
  "No wallet connected — balances NOT READ" and offers nothing else.
  It must not offer to connect, fund, or act for an unconnected wallet
  from the chat layer.

## (d) Gas-fee panel

- **Estimate labels:** every fee figure is labelled ESTIMATE. An
  estimate is not a quote: the executed fee can differ because block
  demand moves between quote and execution, and a failed transaction
  can still cost its network fee.
- **What drives fees (EVM-style):** gas used x (base fee + priority
  fee); more contract work = more gas; busier blocks = higher base
  fee; a tip buys inclusion priority, not a price guarantee.
  (Solana: base fee per signature + optional prioritization fee per
  compute unit — see `halex-m-blockchain-knowledge.md` §5.)
- **How a user caps spend:** the panel explains, it does not set:
  a max-fee ceiling per transaction, a per-day gas budget the user
  tracks in the ledger, and the standing rule of keeping a gas reserve
  aside so a wallet is never stranded. Any cap enforcement belongs to
  the user's wallet app or to the separately-gated bridge — never to
  a chat instruction.
- **NOT VERIFIED rule:** no current fee figure (gwei, lamports, or
  dollars) may be hard-coded into the panel. A figure without a live
  read at display time renders as NOT READ.

## Wiring notes (for the later build step, not this staging drop)

- New UI pieces attach to the existing Skills Tab (`#tab-skills`) and
  reuse the existing Forge conversation; they do not replace it.
- The AI layer for this tab is `halex-m-blockchain-knowledge.js`
  (staging): `explainBlockchain(topic, suppliedFields)` only.
  All rendering uses textContent or escaped construction — never
  unsanitized HTML from user text, skill text, or token descriptions.
- The guardrail module (`skills-injection-guardrails.md`, implemented
  in the same JS module as `checkRequest`) runs BEFORE any stage
  transition: a refused request changes no state and returns an
  explanation, not silence.
- Out of scope, explicitly: live trading from the Skills Tab, signing,
  key handling, wallet connection flows, and any backend. Those need
  their own separate orders and gates.
