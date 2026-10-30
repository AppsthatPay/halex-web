# HALEX-AI Self-Build Resources

Vendored third-party resources for the self-building side of HALEX-AI,
grafted 2026-10-29 on Jeffrey's order ("graft it all and credit the
repo"). All sources are by Steph Ango (@kepano) and MIT-licensed; every
directory carries its upstream LICENSE file verbatim and a NOTICE.md
crediting the author. These are resources the loop may USE — tools,
templates, patterns — not engine code; the self-build engine stays
Python stdlib-only. Machine-readable catalog:
`../allen/halex-ai-selfbuild/resources.json`. Graft doctrine: ADD NEVER
REPLACE.

## defuddle — web page to clean Markdown harvester

`defuddle/` — extracts a web page's main content as clean Markdown plus
metadata (title, author, schema.org) for the ZINIUM knowledge pipeline.
JavaScript tool, invoked as a tool (CLI/library), not rewritten into
Python. Source: https://github.com/kepano/defuddle (MIT).

## clipper-templates — per-site extraction templates

`clipper-templates/` — one JSON template per site class defining what
fields to pull when harvesting; the harvester's configuration layer.
Source: https://github.com/kepano/clipper-templates (MIT).

## obsidian-skills — agent skills for a knowledge store

`obsidian-skills/` — Agent Skills (SKILL.md format) teaching agents to
operate a knowledge store through its CLI and open formats; the pattern
source for HALEX-AI's own zinium-skill (`../zinium-skill/SKILL.md`).
Source: https://github.com/kepano/obsidian-skills (MIT).

## flexoki — palette for reading surfaces

`flexoki/` — inky paper-and-ink color palette (css/flexoki.css) for
ZINIUM reading/report surfaces only. The HALEX brand palette (black
onyx, gold, teal) is separate and untouched.
Source: https://github.com/kepano/flexoki (MIT).

## kepano-obsidian layout — bottom-up knowledge organization

Not vendored as files here: the bottom-up structure (raw Clippings
inbox, emergent Categories hubs, index) is applied as the ZINIUM
knowledge-layer layout in local staging at `halex-zenium/knowledge/`
(LAYOUT.md and NOTICE.md there). Structure only; no upstream content
imported. Source: https://github.com/kepano/kepano-obsidian (MIT).
