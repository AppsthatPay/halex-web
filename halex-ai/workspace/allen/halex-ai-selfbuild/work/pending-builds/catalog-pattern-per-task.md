# catalog-pattern-per-task — staging draft (PENDING, not gated, not live)

- **Queue entry:** `queue/catalog-pattern-per-task.json` — priority
  70, kind knowledge, helper lane H10 Archivist.
- **Gate (verbatim):** "PENDING: gates when one intake report shows patterns cited as patterns, never as running agents."
- **What was built (staging only):** `catalog_pattern.py` — a
  small deterministic module over a staging research task dict
  (`id`, `topic`, `question`) plus a list of consulted catalog
  patterns (each: catalog id, name, category), returning a plain
  dict report field:
  - every cited pattern carries the label "pattern, not a
    running agent";
  - a pattern entry with no catalog id (missing or blank) is
    refused with ValueError and is never cited — no partial
    field is produced;
  - a cited pattern is described only by catalog id, name,
    category, and that label, never as carrying out work,
    making choices, or producing effects;
  - output is plain data (dict), with no outside calls, no
    dynamic code, and no file access, and inputs are never
    mutated.
  - Nothing here is wired into the engine: no engine file,
    queue entry, or pack file was edited. The module is a
    staging demonstration of the report field, not an engine
    change.
- **Harness:** `catalog-pattern-per-task-harness.py`, exit 0,
  **9 checks pass, 0 fail** (run 2026-11-01; proof in
  `catalog-pattern-per-task-proof.json`). Checks cover: a
  pattern cited with the label; a pattern without a catalog id
  refused (missing and blank cases); multiple patterns listed
  in order with the label on each; rendered output free of
  agent-action phrasing; an empty pattern list yielding an
  empty report field with no invented patterns; inputs
  unmutated; output plain data.
- **Gate evidence:** `catalog-pattern-intake-report.md`, produced
  by running the module over the real research task
  `composio-session-tools-20261031` (session-scoped
  tool-surface pattern). It cites exactly one catalog pattern,
  verified from files read: GitHub MCP Server
  (`github-mcp-server-12135521`, MCP Servers), from
  `workspace/resources/agent-catalog/mcp-servers.json` and named
  as the H7 guide for composio-session-tools in
  `work/helpers/HELPER_SYSTEM.md`. No second pattern is cited:
  the queue file names no other catalog pattern with a
  verifiable catalog id drawn on by this task, and the queue
  entry's own id is a queue id, not a catalog id, so it is
  used as the task id only.
- **Gate status:** the gate's condition is met in staging — one
  intake report shows a pattern cited as a pattern — but the
  entry stays PENDING. Wiring catalog-pattern consultation into
  agency research tasks is Allen's review decision, and the
  pattern must never be described as a running agent. This
  draft is not a live change and not a lesson.
- **Files:** `catalog_pattern.py` (new),
  `catalog-pattern-per-task-harness.py` (new),
  `catalog-pattern-per-task-proof.json` (new),
  `catalog-pattern-intake-report.md` (new), this draft.
- **Blocker, plainly:** engine wiring awaits Allen's review
  under the SuperAllen gate, which is NOT lifted.
