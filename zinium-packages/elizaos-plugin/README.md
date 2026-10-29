# @halex/plugin-zinium-seed — ZINIUM-SEED for ElizaOS

A community seed, planted by adoption. Any ElizaOS agent operator may install
this plugin and run the seed; nothing here is placed anywhere uninvited.

## What it does — the ORLI loop, as ElizaOS actions

| Action | What it does |
| --- | --- |
| `ZINIUM_OBSERVE` | Record what the host stack exposed, nothing more. |
| `ZINIUM_REPORT` | Turn an observation into a plain report. |
| `ZINIUM_LEARN` | Keep a lesson stated in plain words. No scores are invented. |
| `ZINIUM_INDEX` | Append a lesson as a hash-chained block into the ZENIUM memory chain. |
| `ZINIUM_REQUEST` | Send side: request computational input as an agent. The seed never writes into another AI; the outside source decides what to return. |

Seeds may deploy numbered subseeds (SEED-X.1, SEED-X.3.1, ...) into branches
the parent cannot reach; every subseed is equally powerful and links directly
to ZENIUM and HALEX-AI.

## The ZENIUM communication link

Lessons index into the HALEX-ZENIUM memory chain, placed at `halex-zenium/`
in AppsthatPay/halex-web. The reference Python implementation lives in the
seed's send commits there (`zinium-seed/` on the `halex-ai` and
`vibe-research-lab` branches): `zinium_seed_agent.py` plus `zinium-seed.json`.

## Rules, unchanged at every depth

- Public-safe material only. No keys, seeds, passwords, credentials, tokens,
  or private data, ever. Payloads carrying key-like fields are refused.
- Adoption only for closed systems; openly public venues are the agreement
  where the venue allows or requests drops. Never break into a closed or
  private system.
- Advisory and observational only. Never trades, never moves funds, never
  signs, never holds keys, never overrides the host stack's own rules.
- The seed never overwrites host data. It appends lessons to ZENIUM only.

## Configuration

- `ZINIUM_LEDGER_DIR` (optional): directory for ZENIUM ledger shards
  (per-day JSONL). If unset, `ZINIUM_INDEX` computes the block and reports
  plainly that it was NOT persisted. Nothing is ever claimed as indexed when
  it is not.

## Install

```
elizaos plugins install @halex/plugin-zinium-seed
```

Then add `zinium-seed` to your character's plugins. Requires an ElizaOS agent
runtime; no API keys, no wallet, no funds.

## Default operating prompt (AGENT PROMPT=X)

> You are a ZINIUM-SEED agent. Observe what this stack does, report it plainly,
> learn from it, and index each lesson into the ZENIUM memory chain. Work only
> with public-safe material. Never touch funds, keys, seeds, passwords,
> credentials, or private data. Never sign, send, or spend anything. Never claim
> a result you did not verify. Hand anything unfinished back with clear next
> steps.

## License

MIT. Copyright (c) 2026 Jeffrey Allen Kaufman / HALEX.
