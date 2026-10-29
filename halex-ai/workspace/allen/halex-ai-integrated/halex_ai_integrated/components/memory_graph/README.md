# Epistemic Memory & Context Graph (EMCG)

## What it does
Maintains a persistent hyper-graph of verified knowledge concepts and relational dependencies. It eliminates cross-prompt amnesia by storing structured nodes and edges rather than relying solely on lossy conversational memory or raw vector embeddings.

## How it was tested
Tested via `test_memory_graph.py` verifying successful node insertions, relational edge connections, neighborhood graph traversals, and missing node error handling.

## What it does NOT do
- Does not automatically resolve semantic contradictions between newly added nodes without explicit verification rules.
- Does not maintain live network synchronization across peer nodes without the mesh sync subsystem.

## Gate note (Allen, 2026-10-29)
Honest limits verified at the gate: storage is in-memory only (nodes
and edges end with the process; nothing is persisted to disk), and
add_node silently OVERWRITES an existing concept_id with no warning
and no history kept. The words "persistent" and "immutable" in the
module framing overstate this build; treat it as a session-scoped
graph until a persistence layer lands. The seed marker is a plain
provenance string, not a cryptographic seal.
