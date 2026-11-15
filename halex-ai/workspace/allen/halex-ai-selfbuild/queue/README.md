# HALEX-AI Self-Build Queue

Intake-fed build items for the loop. One JSON file per entry,
named ``<id>.json``. The loop drains ``gated`` entries in priority
order each cycle, bounded only by its per-run time budget
(``--queue-budget-secs``, default 600). Queue depth is unbounded.

Full format, lifecycle, and safety rules: see the queue spec in
the main agent's hidden files
(``halex-ai-builder-queue-spec.md``) and
``halex_ai_selfbuild/queue.py``.

Seeded entries (2026-10-30):
- ``harvest-record-tools.json`` — GATED module entry (vocabulary
  operations only). The first live drain after push synthesizes
  it into ``work/proposals/``.
- ``tommi-foldin.json`` — PENDING knowledge entry. Promote to
  ``gated`` only after the forwarded Tommi/DualMint reads land
  and the intake gate checklist passes. Never promote on a
  headline or summary alone.
