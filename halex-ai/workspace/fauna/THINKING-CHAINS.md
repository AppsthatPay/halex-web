# Thinking chains: the fauna shard model

Written in Jeffrey's terms, with the honest current state attached.
Nothing here claims a capability that does not exist yet.

## The construct, in his words

- **A space is not a token.** A token, in the usual sense, is a unit
  of text or a unit of currency. A space in this construct is a slot
  for compute and memory: a place where one bundle of knowledge can
  live, be worked on, and be connected to other bundles. The fauna
  encyclopedia occupies spaces, not tokens. Token attributions can
  still be used on top of spaces — a label attached to a space or to
  a connection, usable for lookup and accounting in the same fashion
  — but the space itself is the thing that holds the knowledge.
- **A shard is a connection.** A shard is not a file and not a
  record. A shard is one link between two spaces: mouse-space to
  fox-space is a predator shard; monarch-space to milkweed-space is
  a host-plant shard; salmon-space to river-space is a migration
  shard. Each shard carries its own attribution: what the connection
  is, and which source backs it. A space with no shards is a page.
  A space with shards is part of a thinking chain.
- **Inter-threaded chains of knowledge.** A thread is a line of
  questions a visitor can follow: "what eats mice?" runs mouse →
  fox → owl. "Where does it go in winter?" runs monarch → milkweed
  → Mexico → climate. Threads cross spaces, and spaces belong to
  many threads at once. That crossing is the inter-threading: the
  same fox space sits on the predator thread, the tracks thread,
  and the range thread simultaneously, and each thread can pull the
  visitor into the next space.
- **The 1000-space construct.** Jeffrey's design figure is a
  construct of 1000 spaces. The fauna domain is seeded in 100–300
  of those spaces: one space per species cluster at first (rodents,
  canids, songbirds, salmonids, milkweed butterflies), then one
  space per species as intake grows, then spaces for the threads
  themselves (migration, tracks, regions) once species spaces exist.
  Fauna does not need all 1000 spaces; it needs its 100–300, and
  the rest of the construct stays open for other domains.

## What a fauna space holds, concretely

Today, a fauna "space" is one species record in `pack_fauna_v1.json`
plus its conversation hooks. The hooks ARE the thread-ends: each hook
names the thread it belongs to, the example question that enters it,
and the follow-ups that continue it. The shard model maps onto the
pack like this:

| Shard-model term | Pack representation today | What is still missing |
|---|---|---|
| Space | One species record | A runtime that holds spaces in memory and walks them (not built) |
| Shard (connection) | A conversation hook that names a second species or a topic (e.g. fox record's `lookalike` hook naming coyote and dog; mouse record's `predator` follow-ups naming fox) | Explicit shard objects with their own provenance, separate from hooks |
| Thread | A hook `thread` value shared across records (`tracks`, `migrate`, `compare`) | A thread walker that follows a thread across records in a live chat |
| Token attribution | The record `id` and hook `id` (stable labels usable for lookup) | Any accounting use; none exists and none is claimed |

## Capacity: ceiling vs current state, stated plainly

Jeffrey's stated design ceiling is up to 100TB of data per
1000-chain construct, running upward with unlimited possible chains
of 1000 per thinking-chain construct. That is HIS design ceiling,
not current state. Current state, measured:

- 5 species records in one JSON pack, a few tens of kilobytes.
- 0 images verified (image intake not yet run).
- 0 explicit shard objects (hooks only).
- 0 runtime chain-walking (the pack is static data).

The gap between kilobytes and the ceiling is the intake program's
job, and it closes one verified record at a time. Anyone who
describes the current pack as holding 100TB, or as a running
thinking-chain processor, is misdescribing it. The honest sentence
is: the shard model is designed, the seed spaces are built, the
processor is not.

## Growth path (gated, in order)

1. Intake fills species spaces by group (queue entries exist for
   mammals, birds, fish, insects, reptiles/amphibians).
2. Once two records share a thread, the thread becomes walkable in
   the chat layer: the visitor's follow-up resolves against the
   next record instead of falling back to generic text.
3. Explicit shard objects are added only when a thread is proven
   walkable in tests: a shard without a passing walk test is a
   label, not a connection, and is marked as such.
4. Regional spaces (one per region, e.g. Murphy NC / southern
   Appalachians) come after species spaces, because a region space
   is only honest once the species that live there are recorded.
5. Image spaces come last in each group pass: an image is attached
   only after its license page is read (see DESIGN.md image rule).

## What the model refuses

- It refuses to call a list of records a thinking chain. Chains
  require connections; connections require tests.
- It refuses to treat token attributions as currency, payment, or
  value. Attributions here are labels for lookup, nothing more.
- It refuses to claim the 100TB ceiling as current capacity, or
  "unlimited chains" as a running feature. Both are design figures
  for a construct that is, today, five records and a schema.
