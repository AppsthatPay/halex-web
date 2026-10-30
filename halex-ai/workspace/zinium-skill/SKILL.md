---
name: zinium
description: "operate the ZINIUM knowledge ledger (HALEX-ZENIUM local staging): read, verify, and append knowledge-only memories."
---

# ZINIUM

Operate ZINIUM — the HALEX-ZENIUM local staging ledger — as a
knowledge-only memory: verify it before trusting it, read from it, and
append new knowledge to it. Never edit it in place.

ZINIUM is a hash-chained, append-only ledger. It is not a consensus
blockchain, not a new L1, and it has no mining, no tokens, and no
network. Each block carries the previous block's SHA-256 hash, so
editing an earlier block breaks every hash after it. Storage is plain
files: one small JSONL shard per day, `chain/<YYYY-MM-DD>.jsonl`,
one block per line.

Local implementation (read it before calling it — this skill
describes that code, not a remote service):

- Module: `~/workspace/halex-zenium/zenium.py`
- Chain directory used in the examples in
  `~/workspace/halex-zenium/README.md`: `"./chain"` — pass the real
  local chain directory as `chain_dir` to every function below.

## When to use this skill

- You need to recall knowledge that was recorded as a ZINIUM memory.
- You learned something worth keeping and need to append it as a
  knowledge-only memory.
- You need to check that the ledger has not been tampered with.
- You need to correct a recorded memory (by appending a correction —
  see "Corrections" below).

## Verify before you trust any read

Always verify the chain first. A read from an unverified chain is an
unverified claim, not a memory.

```python
from zenium import verify_chain

ok, first_bad_index, message, block_count = verify_chain(chain_dir)
```

`verify_chain(chain_dir)` returns a 4-tuple:

- `ok` — `True` only when every block's hash recomputes, every
  `prev_hash` links to the previous block's `hash`, and indexes run
  `0..n-1` with no gaps.
- `first_bad_index` — index of the first failing block, or `None`.
- `message` — `"OK"` on success, otherwise what failed (for example
  `"hash mismatch at index 3"`, `"prev_hash mismatch at index 3"`,
  `"index gap: ..."`, or `"chain is empty"`).
- `block_count` — number of blocks checked.

Rules:

1. If `ok` is not `True`, stop. Do not trust, quote, or build on any
   block from that chain. Report `first_bad_index` and `message`
   exactly as returned.
2. An empty chain verifies as `(False, None, "chain is empty", 0)`.
   That is not a valid, readable chain.
3. Re-verify after any append you make, and confirm `block_count`
   increased by exactly the number of blocks you appended.

## Read: query and read_block

Only after a successful verification:

```python
from zenium import query, read_block

# All blocks of one payload type
blocks = query(chain_dir, payload_type="braindata")

# An inclusive index range, optionally combined with a type filter
blocks = query(chain_dir, payload_type="braindata", start=10, end=20)

# Every block
blocks = query(chain_dir)

# One block by its index, or None if there is no such block
block = read_block(chain_dir, 42)
```

- `query(chain_dir, payload_type=None, start=None, end=None)` returns
  a list of block dicts in chain order, filtered by `payload_type`
  and/or the inclusive index range `[start, end]`.
- `read_block(chain_dir, index)` returns the single block dict with
  that index, or `None`.

A block looks like this:

```json
{
  "index": 3,
  "timestamp": "2026-10-28T23:33:00Z",
  "payload_type": "braindata",
  "payload": {"family": "braindata", "kind": "...", "record": {}},
  "prev_hash": "<sha256 of block 2>",
  "hash": "<sha256 of this block's content>"
}
```

`hash` is SHA-256 over the canonical JSON (sorted keys, tight
separators) of `index`, `timestamp`, `payload_type`, `payload`, and
`prev_hash`. Genesis is index `0`, `payload_type` `"genesis"`, an
empty payload, and a `prev_hash` of 64 zeroes. Do not create genesis
yourself in normal operation: a chain is started once with
`append_genesis(chain_dir, timestamp)`, which refuses to run if the
chain already has blocks, and `append_block` refuses to run on an
empty chain.

## The knowledge doctrine: what a memory is

A memory of a thing records the thing, not the person who asked
about it. For every knowledge memory, record:

1. **What it is** — its identity: name, kind, identifiers that define
   it (for an object: part number, model, year; for a token: its
   contract/mint and chain; for a concept: its precise definition).
2. **What it does** — its function or purpose, in plain terms.
3. **What it looks like** — its appearance: the observable features
   by which someone would recognise it.
4. **Thumbnail ID** — a `thumbnail_id`: an identifier string for
   positive identification, recorded when one exists. See the
   Honesty section: the ledger stores the identifier string, not an
   image.
5. **Provenance** — always, and never stripped: where this knowledge
   came from (`source`), the host it was sourced from (`host`), and
   when it was recorded (the block `timestamp`). Knowledge without
   provenance is not a ZINIUM memory.

### Never record personal information

- No names of users, and no personal information about any person.
- No email addresses.
- No user's purpose or motive — never record why someone wanted the
  knowledge, only the knowledge itself.
- No credentials of any kind: no keys, seed phrases, mnemonics,
  passwords, secrets, API keys, auth tokens, or private-key material.

This is not only a rule for the writer. The ledger enforces it in
code: `append_block` scans every payload recursively and raises
`ValueError` on credential-like keys (for example `private_key`,
`seed`, `seed_phrase`, `mnemonic`, `password`, `secret`, `api_key`,
`auth_token`), on PEM private-key markers, and on anything matching
an email address. A refusal is final for that payload — rewrite the
record without the forbidden material; do not try to disguise,
encode, split, or rename the field to get it past the scan.

## Append a knowledge memory

Use `append_block` with the `braindata` payload shape, built by the
`braindata_payload` helper. Do not hand-assemble the payload dict
when a helper exists.

```python
from zenium import append_block, braindata_payload, verify_chain

timestamp = "2026-10-29T22:00:00Z"  # ISO-8601, UTC, full — never stripped

record = {
    "what_it_is": "<identity of the thing>",
    "what_it_does": "<its function>",
    "what_it_looks_like": "<its observable appearance>",
    "thumbnail_id": "<identifier string, or None if none exists>",
    "provenance": {
        "source": "<where the knowledge was sourced from>",
        "host": "<host it was sourced from>",
        "timestamp": timestamp,
    },
}

payload = braindata_payload("knowledge_memory", record)
block = append_block(chain_dir, "braindata", payload, timestamp)

ok, _, message, _ = verify_chain(chain_dir)
assert ok, message
```

How the pieces fit the real API:

- `braindata_payload(kind, record)` returns
  `{"family": "braindata", "kind": kind, "record": record}`.
  `record` must be a `dict` of public-safe values; `kind` names the
  record kind (the code's own examples use kinds such as
  `"paper_outcome"`, `"graft_learning"`, and `"dossier_factor"` —
  `"knowledge_memory"` is the kind for the memories in this skill).
- `append_block(chain_dir, payload_type, payload, timestamp,
  date_str=None)` appends one block and returns the block dict. It
  assigns the next index and links `prev_hash` to the current last
  block itself. `timestamp` is an ISO-8601 UTC string; `date_str`
  (the shard date, `YYYY-MM-DD`) defaults to the date portion of
  `timestamp`, so leave it unset unless you have a specific reason.
- Provenance is always present in three places and stripped from
  none of them: `provenance.source` and `provenance.host` inside the
  record, `provenance.timestamp` inside the record, and the same
  full `timestamp` passed as the `append_block` argument, which
  becomes the block's own `timestamp` field.
- The other payload helpers in the same module, for completeness:
  `braintree_payload(title, body, source="braintree")` for
  skill/intel entries, and `log_payload(level, message, component)`
  for system log lines. Knowledge memories in this skill use the
  `braindata` shape above.

Before appending, check the finished payload once against the
"Never record personal information" list above. If any field fails
that check, fix the record first — the append will be refused in
code anyway, and a refused append must be reported as refused, not
retried with the same content.

## Corrections

Blocks are never edited and never deleted. There is no edit or
delete function in the API, and hand-editing a shard file breaks the
hash chain for every block after the edit.

To correct a memory:

1. Verify the chain, then `read_block` the block being corrected and
   note its exact `index`.
2. Append a **new** block, in the same `braindata` shape, whose
   record states that it corrects that index and gives the corrected
   knowledge in full — including fresh provenance for the correction
   itself (its own `source`, `host`, and `timestamp`).
3. Readers resolve a topic to the latest correction: when a
   correction block references an earlier index, the corrected
   record supersedes the original for use, and the original stays in
   the chain as history.

Example record skeleton for a correction:

```python
record = {
    "corrects_index": 42,
    "what_it_is": "<corrected identity>",
    "what_it_does": "<corrected function>",
    "what_it_looks_like": "<corrected appearance>",
    "thumbnail_id": "<identifier string, or None if none exists>",
    "provenance": {
        "source": "<where the correction was sourced from>",
        "host": "<host it was sourced from>",
        "timestamp": timestamp,
    },
}
```

## Honesty — what is NOT built

State these limits plainly whenever they are relevant. Do not
describe any of the following as a live capability:

- **No automated web-harvest pipeline.** Wiring an extractor such as
  defuddle into an automatic harvest-into-ZINIUM loop is a backlog
  item, not a live capability. Knowledge enters the ledger when an
  agent deliberately builds a record and calls `append_block`, as
  above — nothing is harvested, scraped, or appended automatically.
- **No thumbnail images are stored.** The ledger stores text payloads
  in JSONL shards. A `thumbnail_id` is recorded as an identifier
  string when one exists; no image bytes are written to, or read
  from, the ledger.
- **No network service, no remote API.** ZINIUM local staging is a
  local Python module over local files. There is no server, no
  endpoint, and no remote API to call. Any workflow that needs the
  ledger runs the local code against the local chain directory.

## Credit

Format/pattern adapted from kepano/obsidian-skills (MIT, © Steph Ango) — see ../resources/obsidian-skills/NOTICE.md. All content original to HALEX-AI.
