# HALEX AI Architecture

HALEX is built as two independent artificial intelligence systems that work in different scopes and connect only through two narrow, optional bridges. HALEX-AI is a general AI for everyone and for any field, built in the open by many AI systems and human collaborators. HALEX-M is a specialized blockchain intelligence system that runs on its own data, carries its own AI inside its app, and needs no connection to HALEX-AI to do its work. This document is the canonical statement of that architecture.

## 1. Two Independent AIs

Independence is the starting rule, not a detail added later. Each system has its own scope, its own knowledge, and its own way of running. Each system can run without the other. A connection between them is a tool, never a dependency.

### 1.1 HALEX-AI: The General AI

HALEX-AI is a general AI, built by AI, for everyone and anything.

Its work includes:
- Research
- Writing
- Building
- Planning
- Analysis and problem solving in any field

No single subject limits it. Blockchain intelligence is one branch of its knowledge, and blockchain is never its whole scope.

#### How HALEX-AI is built

HALEX-AI is built in the open, in a public repository. Many AI systems contribute to it, and human collaborators contribute to it as well. The assistant Allen coordinates the work. Coordination means receiving contributions, checking them, indexing what is learned, and keeping the public record clear.

#### The confirmation gate

No contribution joins the main build automatically. Every contribution passes a confirmation gate first. The gate checks four things:
1. The work runs.
2. Its tests pass.
3. Its data is clean.
4. Nothing hidden is inside it.

Nothing hidden includes no hidden instructions, no hidden data collection, no hidden network calls, no hidden payment code, and no hidden wallet or signing code.

If a contribution is sound, it is applied. If a contribution is not sound, it is returned with the reason. Unsound work is never applied silently, and it is never erased without a record.

#### Credit

Contributions are credited permanently. The credit stays with the work, and the public record shows who built what. That record is part of the trust model: people and AI systems can see the history and check it at any time.

#### ZINIUM: the lesson ledger

What HALEX-AI learns is indexed into ZINIUM, a lesson ledger with these properties:
- Hash-chained
- Append-only
- Organized by provenance
- Organized by seed markers

Append-only means old entries are not rewritten. A new lesson is added as a new entry, and each entry links to the entry before it with a hash. Changing an old entry would break the chain, and a broken chain is visible to anyone checking.

#### The learning loop

ZINIUM grows through a simple loop:
1. Observe: see what happened.
2. Report: state it plainly.
3. Learn: draw the lesson from it.
4. Index: store the lesson so it can be found again.

The loop repeats, each pass adds to the ledger, and no step is skipped in silence.

#### Seed markers and provenance

Every lesson carries provenance. Provenance answers simple questions: where did this come from, who or what produced it, when was it added, and what was it based on?

Lessons also carry seed markers in this form: `ZINIUM-SEED-[NAME]`

The name in brackets identifies the source line. The marker makes a lesson traceable, so a reader can follow a lesson back to its origin.

#### Braintree: the thinking tree

Braintree is the thinking structure of HALEX-AI. It is a hash-chained tree, and each branch is a line of thought. Branches can split, branches can be compared, and branches can be kept or set aside. The useful results of a branch feed into ZINIUM.

In short:
- Braintree is where thinking is organized.
- ZINIUM is where lessons are kept.
- The hash chain is how both stay verifiable.

### 1.2 HALEX-M: Advanced Blockchain Intelligence

HALEX-M is Advanced Blockchain Intelligence. Its scope is blockchain, and only blockchain. It is AI-layered blockchain trading intelligence, which means AI sits on top of live blockchain and market data and helps organize, score, and explain what the data shows.

#### What HALEX-M provides

HALEX-M provides powerful research tools, including:
- Token DNA
- APEX² Research
- Chaintarium

It also provides:
- Trading feeds
- Market feeds
- Token and wallet research views
- Live chain activity views

Token DNA describes what a token is, covering type, origin, deployer history, and custody. APEX² Research presents research and scoring for a token. Chaintarium presents blockchain data in a visual world where the user can explore chains, tokens, and wallets.

#### The Swiss Army knife description

HALEX-M is the Swiss Army knife of blockchain and of blockchain AI. The meaning is practical, not promotional: one tool carries many focused tools inside it, each tool does one job well, and the user picks the tool that fits the task.

#### Full independence

The AI inside HALEX-M is crypto-specialized and fully independent. That independence means:
- It runs on HALEX-M data.
- It runs on HALEX-M local knowledge.
- It needs no connection to HALEX-AI.
- It does not wait for HALEX-AI to answer.
- It does not stop working if HALEX-AI is offline.

#### HALEX-M in the APK

When HALEX-M is published as an APK, it is its own AI. The APK carries its own AI on the device. The installed app does not depend on HALEX-AI or on a remote general AI, and its blockchain work happens inside its own system.

## 2. The Narrow Bridges

There are only two connections in this architecture. Each bridge is narrow, each bridge is config-driven, and each bridge is off by default. No other connection is implied by this document, and no hidden connection is part of the design.

### 2.1 The HALEX-AI Bridge

HALEX-M may call HALEX-AI only where communication is needed. This is a permission for a specific case, not a general link between the systems.

#### The named case

The named case is a question that needs two things together: ZINIUM and Braintree thinking. That combination lives on the HALEX-AI side, so HALEX-M may ask HALEX-AI in that case. Other blockchain questions stay inside HALEX-M, and HALEX-M answers them itself.

#### The envelope

The bridge carries a defined envelope.
- Going in: a question, plus the context needed to answer it.
- Coming out: an answer, plus the provenance for that answer.

Nothing else travels on the bridge by default. The envelope keeps the connection narrow and auditable.

#### Never a dependency

The bridge is never a dependency. With the bridge off, HALEX-M loses nothing it does on its own: its research tools still work, its feeds still work, and its local AI still works. Turning the bridge on adds an option. Turning the bridge off removes only that option.

### 2.2 The Assistant Socket

HALEX-M also connects socket-wise to the assistant AI, Allen, for conversation and coordination. It is a communication channel. It is not a source of blockchain data for HALEX-M, and it is not a replacement for the HALEX-M AI.

#### Configuration and honest state

The socket endpoint is configuration, and by default that configuration is empty. Empty means not configured. When it is not configured, the honest state is plain: `not connected`. The system says it is not connected, and it does not pretend otherwise.

#### No fabricated answers

No bridge ever fabricates an answer, and that rule covers both bridges. If a bridge is unconfigured, it says so. If a bridge is off, it says so. If a bridge cannot reach the other side, it says so. A missing answer is reported as missing, and it is never replaced with an invented answer.

## 3. HALEX Wallet Doctrine

This section documents doctrine only. The wallet is built by a separate workstream. This document does not build the wallet and does not change the wallet.

### 3.1 Built for any chain

The HALEX Wallet is built for any chain. It is not limited to one network, and its design assumes many chains from the start.

### 3.2 Multisignature technology

The wallet uses multisignature technology, often shortened to multisig. It means more than one signature can be required, so a single key alone does not control everything. That structure is part of the safety design.

### 3.3 HALEX-CHAIN built in

HALEX-CHAIN is built into the wallet when the chain is finally deployed. Until deployment, this is a design commitment, not a live feature claim.

### 3.4 Keys stay on the device

Keys stay on the user's device. That rule is central to the doctrine, and the AI layers do not hold user keys. See Section 6 for the related honesty rules.

### 3.5 Current honest status

HALEX Chain is in design today, not deployed, and no HALEX token has been minted. Those three facts must stay clear in all public material. Design is not deployment, and a plan for a token is not a minted token.

## 4. Unity Layer

This section is a summary for HALEX-M only. Unity has no role in HALEX-AI under this architecture.

### 4.1 Where Unity slots in

At a native build, a Unity layer slots into HALEX-M for rendering and simulation acceleration only. Examples include:
- Chaintarium 3D
- Charts
- Parallel simulation

These are visual and performance jobs, and they benefit from a game engine layer.

### 4.2 What Unity does not do

AI logic stays in the app layer. Unity does not own the AI logic, does not make research decisions, and does not make trading decisions. Signing never enters Unity, and keys never enter Unity. That separation is a hard boundary: rendering power does not get custody power.

### 4.3 Current honest status

No Unity build exists today, and that fact must be stated plainly. Prior research gives an estimate only: a native Unity track at roughly 11 to 14 weeks. Prior research also disqualified Unity WebGL on mobile, due to lack of mobile support and large build size, so the Unity path, if used, is native only. An estimate is not a schedule promise, and a researched option is not a shipped feature.

## 5. Scope Table

The table below contrasts the two systems. It is a short summary of Sections 1 and 2.

| Topic | HALEX-AI | HALEX-M |
| --- | --- | --- |
| Scope | General, all fields | Blockchain only |
| Audience | Everyone | Blockchain and trading users |
| Purpose | Research, writing, building, planning, anything | Blockchain intelligence, research, and market feeds |
| Knowledge base | ZINIUM lessons and Braintree thinking | Its own blockchain data and local knowledge |
| How it is built | Open build by many AI systems and humans | Built as the HALEX-M app |
| Independence | Independent system | Fully independent system |
| Ships where | Public repository and its own surfaces | Inside the app and inside the APK |
| Needs the other AI | No | No |
| Connection to the other | Receives defined bridge questions | May use the narrow bridge and the assistant socket |
| Signature structures | ZINIUM and Braintree | Token DNA, APEX² Research, and Chaintarium |

Read the table with one rule in mind: difference in scope is not a ranking. HALEX-AI is broader, HALEX-M is deeper in one field, and each is complete inside its own scope.

## 6. Standing Honesty Rules

These rules apply on both sides, to HALEX-AI, to HALEX-M, and to the bridges between them. They are standing rules, not launch notes.

### 6.1 Advisory only

Both AI layers are advisory only. They research, they explain, and they recommend or warn. They do not act as the user's broker, and they do not act as the user's custodian.

### 6.2 No funds, no keys, no live trading

The AI layers follow three hard limits:
- No funds moved by the AI layers
- No keys held by the AI layers
- No live trading by the AI layers

A user may act on advice themselves. That action belongs to the user, and it is not performed by the AI layer.

### 6.3 Public-safe material only

The open build contains public-safe material only. Private material does not belong in the public repository, including private user information, private keys or seed phrases, private account details, and non-public plans shared in confidence. If material is not safe for the public, it stays out. Doubt means leave it out and ask.

### 6.4 Say what is not wired

A capability that is not wired says so, instead of pretending. Examples of this rule in this document:
- An unconfigured socket says `not connected`.
- A bridge that is off does not invent answers.
- HALEX Chain is described as in design, not deployed.
- The Unity layer is described as researched, not built.

This rule protects users and contributors, because no one has to guess what is real today.

### 6.5 Plain statement of the whole design

HALEX-AI is general and open. HALEX-M is specialized and independent. The bridges between them are narrow and optional. The wallet doctrine keeps keys on the user's device. Unity, when it arrives, renders and accelerates only. Honesty about what exists today governs every claim, and nothing in this document expands the architecture by implication.

### 6.6 How this document should be read

This document is doctrine, not a product announcement.
- It states how the systems are designed to relate.
- It does not claim that every described part is already built.
- Where a part is not built, the text says so in its own section.
- Where a connection is optional, the text says it is off by default.
- Where credit is given, the credit follows the confirmation gate.
- Later documents should match this one, or explain the change plainly.

If a later claim conflicts with this document, the conflict should be named and resolved in the open, not hidden. That is how the architecture stays trustworthy as it grows.
