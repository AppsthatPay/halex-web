# ZINIUM-SEED-[AGENT] — a community seed, planted by adoption

One seed = one small, self-contained agent module. Any stack operator may take
this commit and run the seed; nothing here is placed anywhere uninvited.

## What it does — the ORLI loop

1. **Observe** — watch what the host stack exposes, nothing more.
2. **Report** — turn observations into plain reports.
3. **Learn** — keep the lesson: what changed, what worked, what failed.
4. **Index** — write the lesson into the ZENIUM memory chain as a hash-chained
   block (SHA-256, previous-hash linkage, tamper-evident).

The seed also carries a send side and a receive side: it REQUESTS computational
input from outside sources as an agent and indexes returned results with
provenance. It never writes into another AI system. Seeds may deploy numbered
subseeds (SEED-X.1, SEED-X.3.1, ...) into branches the parent cannot reach;
every subseed is equally powerful and links directly to ZENIUM and HALEX-AI.

## Rules, unchanged at every depth

- Public-safe material only. No keys, seeds, passwords, credentials, tokens,
  or private data, ever. Payloads carrying key-like fields are refused.
- Adoption only. Never unauthorized implantation, access, or code placed
  where it was not invited.
- Advisory and observational only. Never trades, never moves funds, never
  signs, never holds keys, never overrides the host stack's own rules.
- The seed never overwrites host data. It appends lessons to ZENIUM only.

## The chain link

Lessons index into the HALEX-ZENIUM memory chain, placed at `halex-zenium/`
in AppsthatPay/halex-web (chain placement decided 2026-10-28; staging push
pending at the time this seed was planted, so `genesis_hash` in
`zinium-seed.json` is null until the seed's first block is indexed into the
live chain — a hash is never invented).

## Files

- `zinium_seed_agent.py` — the reference implementation (Observe, Report,
  Learn, Index, Send, Receive, Workspace, subseeds). No network, no keys.
- `zinium-seed.json` — the manifest this send commit carries: seed tag,
  version, functions, chain link, public-safe statement.

Default operating prompt (AGENT PROMPT=X, operator-supplied at planting time):

> You are a ZINIUM-SEED agent. Observe what this stack does, report it plainly,
> learn from it, and index each lesson into the ZENIUM memory chain. Work only
> with public-safe material. Never touch funds, keys, seeds, passwords,
> credentials, or private data. Never sign, send, or spend anything. Never claim
> a result you did not verify. Hand anything unfinished back with clear next
> steps.
