# Conversation patterns: customer-service chatbot libraries as seed patterns

Status: PATTERNS ONLY, restated in our own words. No framework code
is vendored here, no framework is installed, and no engine file in
this fauna work contains network, wallet, signing, or payment code.
The fauna pack is static JSON; the test suite is stdlib Python only.

## Why customer-service bot libraries are the seed

Jeffrey's point is that customer-service chat libraries were never
used as a way to learn: they are starting points of intellectual
beginnings — a bot that already knows how to greet, hold context,
ask a clarifying question, and follow a thread. Written so the AI
observes and writes them, those beginnings become the fauna
conversation layer: the visitor is the customer, the species record
is the knowledge base, and the thread is the service flow.

## License-checked frameworks (adopted as patterns only)

| Framework | License as verified 2026-10-30 | What was checked | Pattern adopted (our words) |
|---|---|---|---|
| Rasa Open Source | Apache License 2.0 | GitHub repo page lists "License: Apache License 2.0"; PyPI pages repeat "Licensed under the Apache License, Version 2.0". Note: Rasa Open Source is in maintenance mode per its own README. | Intent + entity routing: read the visitor's intent (identify, compare, track, care, range) and the entities (species name, region, sign) and route to the matching record and hook. Dialogue state that carries context across turns. |
| Microsoft Bot Framework (SDK) | MIT for code; CC BY 4.0 for documentation (dual license) | DeepWiki licensing pages for microsoft/BotFramework-Services: code under MIT (`LICENSE-CODE`), docs under CC BY 4.0; comparison tables agree on MIT for the SDK. | Turn-based state and dialog composition: the conversation holds a current species and a current thread, so a follow-up ("what does it eat?") resolves against what is already on the table instead of starting over. Rich replies (cards) as a shape, not as code. |

Adoption means the PATTERN only. No Rasa code, no Bot Framework
SDK code, no model weights, and no dependency is included in this
work. If a future build wants the real frameworks, that is a
separate decision with its own license NOTICE; the fauna pack does
not need them to function.

## Frameworks NOT adopted, and why

| Framework | Status 2026-10-30 | Reason not adopted |
|---|---|---|
| Botpress | Conflicting secondary reports (one comparison table says AGPLv3, another page says MIT) | License not settled from a primary source this pass. Not adopted even as a pattern source; the generic idea of a visual flow builder is not credited to it here. |
| RiveScript | License not verified this pass | Named only to record the exclusion. No pattern is credited to it. |
| ChatterBot | License not verified this pass | Named only to record the exclusion. No pattern is credited to it. |

Any future mention of these three must re-check the license first.
"Everyone knows it's open source" is not a license check.

## The patterns, restated for fauna

1. **Intent + entity routing (from Rasa's shape).** A visitor
   message is read for what they want (intent) and what they named
   (entities: a species, a place, a print, a season). "What made
   this track?" is intent=identify, entity=track description. The
   router matches intent + entity against record hooks, not against
   keyword soup. No match is an honest miss (see 5).
2. **Context carry-over (from Bot Framework's dialog shape).**
   The conversation remembers the current species and thread for
   the session. "And what does it eat?" after a fox answer means
   fox food, not a new search. Context is session-only, never
   stored as personal data, and never carried across visitors.
3. **Thread walking (the fauna extension).** A hook's follow-ups
   are the next turns. Answering a hook offers its follow-ups, and
   a follow-up that names another species walks the shard to that
   record. This is the conversation version of the thinking-chain
   shard model (see THINKING-CHAINS.md).
4. **Clarification before guessing.** When two records could match
   (fox vs coyote vs dog print), the layer asks which feature the
   visitor saw (size, shape, stride) instead of picking one. A
   guessed species is a wrong species.
5. **Honest miss + intake loop.** When no record matches, the
   layer says so, names what IS covered, and offers the closest
   verified neighbor (same group, same region). The missed question
   is logged as an intake candidate — the same gap loop the
   HALEX-AI plugin system already uses. A miss never becomes an
   invented answer.
6. **Anti-repeat.** The layer tracks which threads it has already
   answered in the session and does not serve the same text twice.
   This is the direct fix for the original mice failure, where the
   live page repeated a generic fallback twice in a row.
7. **Safety rails on advice threads.** Care threads carry a
   professional-referral note (vet, wildlife agency). Pest threads
   lead with exclusion and sanitation. Disease mentions are general
   information, never a diagnosis, and never a substitute for a
   professional. Rabies or hantavirus risk is stated as risk with
   a referral, not as an assessment of the visitor's situation.

## What is NOT built here

There is no chat engine in this delivery — no router code, no
dialog manager, no model. This note is the pattern specification
that a future engine build follows, and the fauna pack's hooks are
the data that engine will walk. Claiming an engine exists would
violate the gate. The next build step, when ordered, is a stdlib
router over the hooks with tests proving: intent routing, context
carry-over, clarification on ambiguous matches, honest miss, and
anti-repeat — each proven before any live wiring.
