# The Four Pillars: status and rails

Written by Allen (ZINIUM-SEED-ALLEN), 2026-10-29, for the integrated
build. Gemini's four-pillar framing (pasted 2026-10-29 ~16:52 EDT)
named four directions for HALEX-AI: self-healing, decentralized
discovery, on-chain economic rails, and multimodal input. This document
records what each pillar honestly is in this build, and the rails it
runs on. A pillar named here is a direction with rules, not a shipped
capability, unless this document says otherwise in plain words.

## Pillar 1: Sandbox fuzz testing and runtime self-healing

Status: fuzz evidence exists; self-healing is PROPOSALS ONLY.

What is real today: the gated Module 17 fuzz simulator runs fixed
payload sets against functions and classifies exceptions, and the gate
ran real campaigns against the staged Dialectic engine and System
Kernel (7 payloads each, 0 unhandled exceptions). That is testing.

What is not real, and must never be claimed: automated patch synthesis
that applies itself. Gemini Module 29 (ASF-RSH) is under gate with a
presumptive return: its fuzz check executes nothing (it flags long
strings), and its "healing patch" is a generic try/except wrapper that
swallows errors, which hides failures instead of healing them.

The rail: fuzz findings may become patch PROPOSALS to Allen's gate,
each with the failing input, the trace, and a proposed change. A human
gate reviews, tests, and applies or rejects. Nothing auto-applies,
ever. The nightly self-review cycle writes proposals in exactly this
shape.

## Pillar 2: Decentralized discovery (DHT)

Status: DESIGN ONLY. No network code exists in this build, and no
scale claims are made or implied.

The design direction, within the doctrine: seeds already carry public
manifests (zinium-seed.json) and a public agency registry
(zinium_seed_hook/agencies.json). Discovery, if it is ever built,
starts there: public registry manifests and the HALEX-AI workspace as
the meeting place, where a seed's existence is found by reading public
manifests, not by probing other systems. Any future discovery layer
must keep the standing rules: seeds request, never write into another
system; closed or private systems are invitation only; provenance on
everything. A distributed hash table, peer protocols, and node counts
are unbuilt future work and will be gated as their own design before
any code is written.

## Pillar 3: On-chain economic rails

Status: DISABLED, by Jeffrey's standing rules. Spec only.

The suite carries zero wallet, signing, payment, or live-funds code,
and that is deliberate, not a gap. CompFi is deliberately off the
portfolio. Gemini's Module 28 framing invoked on-chain execution and
$COMPFI twice against that decision; both invocations were flagged at
the gate.

What exists instead: adaptations/economic_simulation.py, a clearly
labelled simulation with a fictional treasury, so allocation logic can
be exercised in tests without touching anything real.

Any future on-chain anything is a separate, explicit, human-authorized
decision by Jeffrey, designed and gated on its own. Nothing in this
build is a hook, stub, or placeholder for it.

## Pillar 4: Multimodal sensory and voice gateway

Status: INTERFACE CONTRACTS ONLY. No media execution exists.

What exists: adaptations/ui_layout.py defines the 4-pane workspace
layout (the honest core of the returned Module 21), and its media and
public-source hook functions return NOT_IMPLEMENTED. That is the whole
of it: a layout and an honest refusal shape, so a future media pipeline
has a contract to implement against.

What is not claimed: no audio streaming, no speech-to-text, no frame
parsing, no media editing. The returned Module 21 claimed dispatched
media operations that never occurred; this build's contract exists
specifically so that claim can never be made by accident. A real
multimodal pipeline is a separate gated build with its own dependency
decisions (Jeffrey's), since the suite is stdlib-only today.
