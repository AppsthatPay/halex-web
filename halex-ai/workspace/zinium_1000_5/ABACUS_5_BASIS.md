# Abacus 1000^5 — AI-sourced software basis, STAGING ONLY

This file is the basis list for the chain system abacus 1000^5.
"AI-sourced" here means: the code in this folder, written by
Allen (the AI assistant) from Jeffrey's orders and pasted
sketches, gate-checked and corrected. It does not mean code
sourced from another AI system, and it does not mean a trained
model.

## Basis modules (all stdlib, all record-only)

- `halex_1000_5.py` — 5D engine. Integer micro-units
  (1.0 = 10,000,000,000), gated mitosis (load 0.95 + recorded
  need + empty slot + DRAFT daughter), pruning (utility < 0.15),
  Spec 4.2 record form (OPEN WORKSPACE, AWAIT INSTRUCTIONS,
  dynamic execution REFUSED, local sync counter only).
- `genesis.py` — Block 1. 32 first-cube agencies, each axis
  500 or 501, Brainchain chain 500, center (500,500,500,500,500).
- `deploy_engine.py` — TOKEN (open record) / COIN (sealed
  SHA3-512 hash reference, a hash is not encryption). Satoshi
  units are integer records with text manifests, never executed.
- `cross_chain.py` — Split-cell sharing as a COPY, exact
  integer match, source retained, origin coordinate preserved.
- `obscurity.py` — Sealed records, SHA3-512 integrity hash
  only, no key material, no plaintext returned, single-use
  burn, reuse refused. Chain 865 is the obscurity chain.
- `brainchain_runner.py` — Block 2 wiring: unified wallets,
  deploy + share + burn + instruction pass, hash-chained.
- `first_chain_population.py` — Block 3: TOKEN_FIRST_CHAIN,
  five technologies, share to all 32 agencies, toy linear
  transform record, mitosis gate probe (sandbox only).
- `think_token.py` — Block 4: token "think", dispersion to
  all 32 agencies, dialog records, agencies remain DRAFT.
- `brainchain_qa.py` — Record Q&A. Answers only from ledger /
  agencies / run reports. Honest MISS otherwise. Questions
  are processed in memory only, never written to the ledger.
- `chain_engine.py` — Engine entrypoint: `status` (read-only),
  `cycle` (one bounded pass, then exit), `ask` (record Q&A).

## Explicitly NOT in the basis

- No Wasm runtime, no dynamic code execution, no bytecode
  execution of any kind.
- No trained neural model, no transformer, no convolution
  engine, no GPU inference, no server cluster replacement.
- No network, no signing, no funds, no crypto mint, no keys,
  no credentials, no user message text written into records.
- No live public chain, no gh-pages deployment by this file.
  Pushing and live wiring are separate, explicit orders.

## How a user talks to it (staging)

  python3 chain_engine.py status
  python3 chain_engine.py ask "What is token think?"
  python3 chain_engine.py cycle

The answer comes from cube records, for the first time in
this system, because blocks 1-4 now exist to answer from.
Before blocks 1-4, there were no cube records to answer from,
so any answer would have been invented. That is the honest
meaning of "for the first time" here.
