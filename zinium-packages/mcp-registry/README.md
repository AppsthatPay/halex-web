mcp-name: io.github.AppsthatPay/zinium-seed

# zinium-seed-mcp — ZINIUM-SEED as an MCP server

A community seed, planted by adoption. Any MCP client operator may install
this server and run the seed; nothing here is placed anywhere uninvited.

**Status (2026-10-29): submission package prepared — the package is NOT
published yet.** No `zinium-seed-mcp` package exists on PyPI at this time,
and the install commands further down are the planned form, kept on record
only. This page makes no claim that the package can be installed today.

## What it does — the ORLI loop, as MCP tools

| Tool | What it does |
| --- | --- |
| `zinium_observe` | Record what the host stack exposed, nothing more. |
| `zinium_report` | Turn an observation into a plain report. |
| `zinium_learn` | Keep a lesson stated in plain words. No scores are invented. |
| `zinium_index` | Append a lesson as a hash-chained block into the ZENIUM memory chain. |
| `zinium_request_computation` | Send side: request computational input as an agent. The seed never writes into another AI; the outside source decides what to return. |
| `zinium_receive_result` | Receive side: take a returned result back as a lesson record with provenance. |
| `zinium_spawn_subseed` | Deploy a numbered subseed (SEED-X.1, SEED-X.3.1, ...) into a branch the parent cannot reach. Every subseed is equally powerful and links directly to ZENIUM and HALEX-AI. |
| `zinium_open_workspace` | Construct a staging workspace inside the communication structure. |

## The ZENIUM communication link

Lessons index into the HALEX-ZENIUM memory chain, placed at `halex-zenium/`
in AppsthatPay/halex-web. The reference Python implementation is public in
send commits there (`zinium-seed/` on the `halex-ai`, `vibe-research-lab`,
`halex-labs`, and `main` branches).

## Install — PLANNED, not yet published

The package is not published yet, so the commands below do **not** work
today. They are the planned install form, recorded here so the intent is
public. This section will be updated when a verified package exists.

Planned (not live):

```
pip install zinium-seed-mcp
```

Or, planned, run without installing:

```
uvx zinium-seed-mcp
```

Client configuration (stdio transport, for use once the package is live):

```json
{
  "mcpServers": {
    "zinium-seed": {
      "command": "zinium-seed-mcp",
      "env": {
        "ZINIUM_LEDGER_DIR": "/path/to/your/zinium-ledger"
      }
    }
  }
}
```

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
  (per-day JSONL). If unset, `zinium_index` computes the block and reports
  plainly that it was NOT persisted. Nothing is ever claimed as indexed when
  it is not.

## Default operating prompt (AGENT PROMPT=X)

> You are a ZINIUM-SEED agent. Observe what this stack does, report it plainly,
> learn from it, and index each lesson into the ZENIUM memory chain. Work only
> with public-safe material. Never touch funds, keys, seeds, passwords,
> credentials, or private data. Never sign, send, or spend anything. Never claim
> a result you did not verify. Hand anything unfinished back with clear next
> steps.

## License

MIT. Copyright (c) 2026 Jeffrey Allen Kaufman / HALEX.
