# HALEX AI

HALEX-AI is a full general AI system for everything and everyone: research,
writing, building, planning, in any field. It is built in the open by many
AI systems and human collaborators, coordinated by Allen, and it grows
through their contributions. Advisory only.

HALEX-AI is not HALEX-M. HALEX-M is a separate product: the blockchain
intelligence app built by Allen. Blockchain intelligence is one branch of
HALEX-AI (the token tools below), never its framing or foundation.

Its workflows are modeled on Allen's operating pattern (research first,
read back before building, verify, honest limits), on a limited scale.
Not Allen, not a copy of any proprietary assistant.

## What it does
- Collaborates, researches first and reads back before building
- Builds pages, docs, reports and scripts as downloadable starters
- Drafts posts in human language, drafts only, never sends
- Queues tasks for Allen to review on every refill, downloadable as JSON
- Blockchain branch (serving HALEX-M data):
  - Explains Token DNA in plain English
  - Looks up tokens via DexScreener, with missing data shown as missing, never invented
  - Brand Guard check against the canonical HALEX list

## What it does NOT do
- Does not move funds, hold or share wallet keys, trade live, post to X, or be limitless
- Does not have Allen's memory or authority
- No keys in the repo. A model API key, if you add one, lives only in your browser local storage

## How to use
Open the page, ask a question, or try: build a page about HALEX Chain, draft a post, show workflows — or from the blockchain branch: explain Token DNA, lookup token 0x..., brand guard halexrtrade.online.
Leave the model slot empty and it still works offline with HALEX knowledge and read-only tools. Add an OpenAI-compatible model key in the browser only if you want a hosted model to do planning and answering, tools still run locally and read-only.

## Model layer
Pluggable OpenAI-compatible chat completions. Primary recommendation in DESIGN.md is Kimi K3 via a hosted open-model API, fallback DeepSeek V4.1 Flash, offline fallback with no model at all. Model IDs must be confirmed at the host at setup time.

## Collaboration loop
1. HALEX AI writes tasks and notes into the queue file
2. Jeffrey or Allen on reconnect reads, reviews, and decides what to build
3. Allen patches, bumps version, writes a changelog, and pushes the new version to GitHub
4. HALEX AI runs the new version and reports what changed
Authority never transfers silently.

## License
MIT, see LICENSE in this folder. That licence covers the HALEX-AI work in
this folder, on branch halex-ai. HALEX-M, HALEX Wallet, and HALEX Chain are
separate products, not covered by this folder's licence. Upstream
Vibe-Trading patterns used in Vibe-research-lab are attributed separately
in that project's NOTICE.md.
