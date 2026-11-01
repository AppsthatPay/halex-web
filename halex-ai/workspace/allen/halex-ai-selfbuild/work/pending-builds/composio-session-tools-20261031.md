# composio-session-tools-20261031 — staging proposal (PENDING, not gated, not live)

- **Queue entry:** `queue/composio-session-tools-20261031.json` — priority 70, kind knowledge, helper lane H1 Researcher.
- **Gate (verbatim):** "PENDING: LICENSE verified verbatim 2026-10-31 (MIT, Copyright (c) 2025 Sampark Inc., SHA 61479ac154a8e5b534361973fdfa0cce3775de9d) and README read in full, but no proposal maps the pattern yet. Gates when a proposal maps per-user session-scoped tool surfaces + runtime meta-tool discovery onto HALEX-AI allowlist descriptors only — no network, API-key, or third-party execution. Vendor counts (1000+ toolkits) are claims, not adopted facts."
- **Status: pending — NOT promoted.** This proposal is a staging record for Allen's review. Nothing here runs, connects, or executes anything.
- **License note, honestly sourced:** the LICENSE verification quoted in the gate note is the queue entry's own 2026-10-31 record, cited here, not re-verified this run. No vendor code is copied into this proposal.

## The proposal: session-scoped tool surfaces as allowlist descriptors only

Mapping table (machine-checked in `composio_mapping.py`):

| Vendor concept | HALEX-AI equivalent | Execution |
|---|---|---|
| One session per user | One session record per user: session id + allowlist descriptor list, stored as a staging record | descriptor-only |
| Tools discovered at runtime via meta-tool | Runtime descriptor lookup: at session start, the session record lists only allowlisted descriptors that exist on disk; no new capability is fetched | descriptor-only |
| Tool execution through the vendor platform | None: HALEX-AI does not execute third-party tools. A question is answered from records that exist, or an honest MISS is returned | none |

## What is deliberately NOT mapped

- No network access. No API key in any form. No third-party execution. No fetched capability. A descriptor that is not on the allowlist is not listed, not fetched, and not used.
- Vendor counts: "1000+ toolkits" is a vendor claim, recorded here as a claim only, never adopted as a HALEX-AI fact.

## Harness

`composio-session-tools-harness.py`, exit 0 required (proof in `composio-session-tools-proof.json`). Checks: three mappings present and valid; session and discovery mappings descriptor-only; vendor execution maps to none with an explicit does-not-execute equivalent; no mapping mentions an API key; the toolkit count stays claim-only; a network-execution mapping is refused; an empty mapping is refused.

## Gate verdict

The proposal this gate asked for now exists in staging and is machine-checked. The entry stays pending: promotion needs Allen's review of this proposal, and no descriptor, session record, or execution path is wired into the engine or any page by this draft.
