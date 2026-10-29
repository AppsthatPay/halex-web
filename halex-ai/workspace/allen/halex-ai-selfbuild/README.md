# halex_ai_selfbuild — HALEX-AI's real self-building machinery

Built 2026-10-29 (ZINIUM-SEED-ALLEN) after the confirmation gate proved that
Gemini's Module 24 (AR-SCSE) and Module 30 (ASERD) did not do what their
descriptions claimed: the gap list was hardcoded, the synthesized modules
were self-certifying stubs, and the "daemon" was a counter. This package is
the honest version of the same five claims. Every component genuinely works,
and the test suite contains the tests that would have caught the fakes.

Python standard library only. No network calls anywhere in the code.
No wallet, payment, or signing code anywhere.

## Components

### gap_scanner.py — dynamic gap detection
Reads a real module inventory (`.py` files under a root, and their test
files), actually executes the test files in subprocesses, and reads a
quarantine/backlog directory of `.md` / `.json` records. It detects:

- `UNTESTED_MODULE` — a module with no test file
- `FAILING_TEST` — a test file that exits non-zero when run
- `OPEN_BACKLOG` — a backlog record marked `status: open`
- `UNVERIFIED_CLAIM` — a module containing claim words (EXECUTED, VERIFIED,
  DISPATCHED, FORAGED, SYNTHESIZED) with no existing evidence file or log
  configured for it

Output is a ranked list of gap dicts (`kind, target, evidence, severity,
suggested_spec`). No gap is ever hardcoded by name: the scanner finds what
is actually in the tree. A gap carries a synthesis spec only when the
backlog record itself carries one; other gaps carry an action dict the
synthesizer refuses, so scanning alone can never smuggle work into the
builder.

### synthesizer.py — module synthesis with mutation-checked tests
Given a spec (`name`, `purpose`, `operations`, optional `capabilities`),
where every operation comes from a small safe vocabulary (text stats,
record filtering/counting, hash chaining, registry lookup, clamping,
averaging), it generates a working module, a test file, and a README
section. Generated tests assert **behavior** — computed outputs on known
inputs, including the known SHA-256 of `"abc"` — never status strings.

The generated tests are then run in a subprocess, and a **mutation check**
runs them again against a deliberately corrupted copy of the module (the
first operation shadowed by a sentinel-returning stub). If the tests pass
against the broken module, they were self-certifying and the synthesis is
rejected (`MUTATION_REJECTED`). Out-of-vocabulary specs return
`UNSYNTHESIZABLE` with a reason. No stub is ever produced in place of a
refusal.

### seal.py — hash-chained sealing
An append-only JSONL log in the ZINIUM style: each entry carries
`prev_hash`, `entry_hash` (SHA-256 over the canonical entry content),
timestamp, provenance, and payload. `verify_chain()` recomputes every hash
and link and detects tampering, deletion, and reordering.

**Plain statement of limits:** the chain proves an entry was not altered
after chaining. It is NOT cryptographic authorship. The provenance string
(e.g. `ZINIUM-SEED-ALLEN`) is a public label that anyone can write; it is
not a signature and proves nothing about who wrote the entry.

### expert_registry.py — expandable MoE pool
A JSON registry of experts (`name, module_path, capabilities, weight,
routed_count, success_count`). The router scores experts by keyword-token
overlap between the query and their capability phrases, weighted by their
current weight, and picks the best eligible expert. Weights learn only from
**measured outcomes**: `record_outcome` moves the weight halfway toward a
target derived from the observed success rate, clamped to [0.5, 2.0].

Registration is validated: the module file must exist and import cleanly in
a subprocess, or registration is refused and the registry is unchanged.
Registering a freshly synthesized module and routing a query to it is the
genuine form of "expert pool expansion," and the test suite demonstrates it
end to end.

### forager.py — offline foraging over local mirrors
Walks **local mirror directories** of public repositories (kept current by
an operator-side process; this module never reaches out to any network),
extracts indexable items — Markdown headings, Python function/class names
via `ast.parse`, license file presence — and appends ORLI envelopes
(Observe / Report / Learn / Index, with source path, host label, and
timestamp provenance) to the seal chain. Dedupe is by content hash against
the existing chain: re-running over an unchanged mirror adds zero entries.
Code from a mirror is **never executed and never imported**; `ast.parse`
only. A mirror file full of malicious-looking code strings is indexed as
data, and a test proves the payload never runs.

### cycle.py — one honest pass
`scan → synthesize (top synthesizable gap) → seal → register → forage →
report`. Every synthesis attempt — success, failure, mutation-reject — is
sealed. A passed module whose spec declares capabilities is registered as
an expert. A dated Markdown + JSON report lists exactly what was scanned,
found, built, sealed, and proposed.

**The cycle never integrates anything into the main suite.** Passed modules
land in `<work-dir>/proposals/<name>/` with their tests and results,
awaiting the confirmation gate. The system proposes; the gate disposes.
`--dry-run` performs scan + forage only.

## What this package does NOT do

- No network access of any kind, in any component.
- No self-integration past the gate: nothing here modifies the main suite,
  any other package, or itself.
- No authorship proof: the seal chain is tamper evidence, not identity.
- No general code generation: synthesis is limited to the safe operation
  vocabulary, by design, and refuses everything else honestly.
- No daemon: `cycle.py` is a single pass. Scheduling is external (below).

## How the nightly cycle invokes it

From this directory (adjust paths to the trees being watched):

```
cd ~/workspace/halex-public-data/halex-ai/workspace/allen/halex-ai-selfbuild
python3 -m halex_ai_selfbuild.cycle \
  --modules-root ~/workspace/halex-public-data/halex-ai/workspace/gemini/halex-ai-suite \
  --backlog-dir  <quarantine/backlog directory> \
  --work-dir     ~/workspace/halex-public-data/halex-ai/workspace/allen/halex-ai-selfbuild/work \
  --mirrors      ~/workspace/research/vibe-trading
```

Or import it: `from halex_ai_selfbuild.cycle import run_cycle`.

## Tests

```
cd ~/workspace/halex-public-data/halex-ai/workspace/allen/halex-ai-selfbuild
python3 -m unittest discover -s tests -v
```

See `docs/DESIGN.md` for the claim-by-claim mapping from the original
Module 24 / 30 descriptions to the components that make each claim true.
