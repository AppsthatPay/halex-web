# plugin-pack-guide — staging draft (PENDING, not gated, not live)

- **Queue entry:** `queue/plugin-pack-guide.json` — priority 65, kind knowledge, helper lane H9 Pack Maker.
- **Gate (verbatim):** "PENDING: gates when the guide + template build one real pack that passes the harness."
- **Status: pending — NOT promoted.** This guide, template, and demo pack are staging records. Nothing here is wired into a live page, and no pack is live until Allen verifies and pushes it.

## The guide (contributor task, in order)

1. **Pick one real gap.** A pack starts from a recorded miss or a recorded intake need, never from an invented topic list.
2. **Copy the template** (`plugin-pack-template.json`). Fill every field; leave nothing blank. An unverified field is written `NOT READ`, never guessed.
3. **One entry per record.** Each entry carries: `id`, `title`, `summary`, `provenance` (source actually read, with what it supports), and `images` (`NOT READ` unless a license page was actually read).
4. **Authorship label intact.** Every pack carries `authorship` stating it is a HALEX-AI staging draft until verified.
5. **Run the harness** (`plugin-pack-guide-harness.py`). It must exit 0 before the pack is offered for review. A failing pack is fixed or dropped, never offered with failures hidden.
6. **Offer, never self-promote.** The pack goes to Allen's review as a staging draft. The contributor does not wire it into a page, a manifest, or a live pack.

## Template

`plugin-pack-template.json` — fields: `id`, `name`, `version`, `status`, `authorship`, `provenance`, `entries[]` (each: `id`, `title`, `summary`, `provenance`, `images`).

## Demonstration (this run)

The guide + template built one real pack: `plugin-pack-guide-demo-pack.json` — a one-entry staging pack derived from the real blue jay record already on file in staging (`fauna-intake-birds-blue-jay.json`, BioKIDS account read 2026-11-01). No field was invented for the demo: the blue jay record's `subspecies` and `images` are both `NOT READ` in the source record, and the demo pack preserves both as `NOT READ` rather than filling them.

## Harness

`plugin-pack-guide-harness.py`, exit 0 required. Checks: template fields complete; demo pack conforms to the template; every entry has provenance naming a source actually read; `NOT READ` fields preserved, not filled; authorship label present; pack status is a staging draft, never "live".
