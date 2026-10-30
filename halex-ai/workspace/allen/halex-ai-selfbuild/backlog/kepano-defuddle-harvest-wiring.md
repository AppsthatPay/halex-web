# Wire defuddle into the knowledge-harvest path

status: open

## What
Connect the vendored defuddle tool (workspace/resources/defuddle/) to the
ZINIUM knowledge pipeline: when the harvester is given a URL, defuddle
extracts the page's main content as clean Markdown plus metadata (title,
author, schema.org), and the result lands in the ZINIUM knowledge layer's
raw inbox (halex-zenium knowledge/clippings/) with provenance (source URL,
host, timestamp) attached, ready for promotion into a knowledge entry.

## Which resource
kepano/defuddle (MIT, © Steph Ango), vendored at
workspace/resources/defuddle/ — a JavaScript tool, invoked as a tool
(CLI/library), never rewritten into Python, never imported by the
stdlib-only engine.

## Acceptance test idea
Given one fixed local HTML fixture page, the harvest step produces a
Markdown file in the clippings inbox whose body matches the fixture's main
content (boilerplate stripped) and whose provenance header carries the
source, host, and timestamp; a second run over the same page adds no
duplicate (content-hash dedupe, the forager's rule).
