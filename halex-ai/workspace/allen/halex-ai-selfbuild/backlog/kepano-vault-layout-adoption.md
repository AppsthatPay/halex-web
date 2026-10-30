# Adopt the bottom-up vault layout in the ZINIUM knowledge layer

status: open

## What
Grow the knowledge layer created in halex-zenium/knowledge/ (layout
adapted from kepano/kepano-obsidian, MIT): harvested material lands in
clippings/ first, is promoted into entries/ pages written in the ZINIUM
memory shape (what it is, what it does, what it looks like, thumbnail ID,
provenance), and categories/ hub pages are created only when entries
accumulate on a topic — structure emerges bottom-up, no top-down taxonomy
imposed in advance. Keep knowledge/index.md current with every entry.

## Which resource
kepano/kepano-obsidian (MIT, © Steph Ango) — structure only; no upstream
content was imported. Layout doc: halex-zenium/knowledge/LAYOUT.md.

## Acceptance test idea
A checker pass over knowledge/: every file in entries/ appears exactly
once in index.md with a one-line summary; every entry carries a provenance
block; no category hub exists that links to zero entries (no empty
top-down shells).
