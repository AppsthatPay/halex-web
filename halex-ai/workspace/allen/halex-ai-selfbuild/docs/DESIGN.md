# DESIGN — which component makes which claim true

The claims below are the ones Gemini's Modules 23–30 made in prose. The
gate's verdicts (2026-10-29) found the code behind them did not perform
the claimed work. This package rebuilds each claim as a mechanism, with a
test that fails if the mechanism stops working.

| # | Claim (as made) | What the gated code actually did | Component that makes it true | Proof |
|---|---|---|---|---|
| 1 | Dynamic gap detection: the system scans its backlog and detects emerging needs (Module 24) | Read two hardcoded gap names off a hardcoded counter; scanned nothing | `gap_scanner.py` | Fixture tree with a planted untested module, a planted failing test, and a planted unverified claim: all three found, with evidence. Clean fixture: zero gaps. |
| 2 | Automatic module synthesis: writes new Python modules, tests, and documentation (Module 24) | Returned self-certifying stubs whose `execute()` claimed success for any input; generated tests asserted that same status string | `synthesizer.py` | Generated module computes correct outputs on known inputs; generated tests assert behavior (incl. the known SHA-256 of `"abc"`). **Mutation check:** the same tests FAIL against a deliberately corrupted copy of the module; a synthesis whose tests survive corruption is rejected. Out-of-vocabulary specs return `UNSYNTHESIZABLE`, never a stub. |
| 3 | Neuronet expansion: micro-agent seeds forage intelligence from public repositories and feed it back into the ZINIUM ledger (Modules 26/27) | A 3-line comment header called an "agent seed"; payloads appended to a local list and declared "welded" | `forager.py` + `seal.py` | Fixture mirror: expected headings/functions/classes/license indexed as ORLI envelopes with source-path provenance, sealed into a verifiable hash chain. Second run over an unchanged mirror adds **zero** entries (content-hash dedupe). Malicious-looking code in a mirror is indexed as data and provably never executed. Offline by design: mirrors are local; nothing here makes a network call. |
| 4 | MoE expert pool expansion (Module 23) | Keyword routing over a fixed 4-expert registry; all weights constant 1.0, never tuned | `expert_registry.py` | Routing picks the correct expert on fixture queries; weight measurably rises after recorded successes and falls after recorded failures (clamped [0.5, 2.0]); a module synthesized by component 2 is registered (after a subprocess import check) and then routed to — expansion demonstrated end to end. Registration of a missing or non-importing module is refused. |
| 5 | Recursive self-improvement: an autonomous daemon writes, tests, and seals its own code in an ongoing cycle (Module 30) | No loop, no imports, no execution: a counter plus two status strings claiming a running daemon | `cycle.py` | One honest pass per invocation: scan → synthesize the top synthesizable gap (with mutation check) → seal every attempt → register passed modules → forage → dated report. A full-cycle test verifies every report claim against the files actually produced (proposal files exist under `proposals/`, chain entries match, registry routes). |
| 6 | Sealed provenance (Modules 25/30) | "Byzantine fault tolerance verified" with no consensus; a ledger check that never recomputed seals, so content tampering passed | `seal.py` | `verify_chain()` recomputes every entry hash and link; a test that edits a sealed payload is detected. Stated limit: the chain is tamper evidence, **not** cryptographic authorship; the seed string is a public label. |

## The gate is part of the design, not an obstacle to it

Module 30's paste instructed an unsupervised loop that builds and pushes
on its own. That instruction conflicts with the HALEX-AI directive: every
contribution passes the confirmation gate, and human review merges. So the
"recursive self-improvement cycle" here is deliberately built as
**propose-only autonomy**:

- `cycle.py` builds into `proposals/`, never into the main suite.
- Nothing in this package runs git, pushes, installs, or touches the
  network.
- Scheduling (the nightly run) is owned by the main agent's existing gated
  self-review cycle, which invokes `cycle.py` as one step — the same
  pattern as every other scheduled job in the operation.

What the system can truthfully say after a cycle: "I scanned N modules,
found these gaps with this evidence, built this module, its tests pass and
survive a mutation check, the attempt is sealed at chain entry H, the
module is registered and routable, and it awaits the gate." Every clause
of that sentence is verifiable from the report and the files on disk.
That is the standard the fake versions failed, and the standard this
package is tested against.
