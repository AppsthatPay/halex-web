# HALEX-AI Self-Build Backlog

Backlog records for the halex_ai_selfbuild gap scanner live here.
Each record is a `.md` or `.json` file. A record whose status is
`open` is a gap the scanner reports (kind `OPEN_BACKLOG`); a record
may carry a synthesis spec (`name`, `purpose`, `operations`, and
optionally `capabilities`) that the cycle can attempt to build.

The autonomous GitHub loop passes this directory to the cycle as
`--backlog-dir`. Closing a record after the gate integrates a
proposal is a gate-side action; the cycle never closes records
itself.
