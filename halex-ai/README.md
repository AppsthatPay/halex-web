# HALEX AI

Allen modeled as software, on a limited scale. Not Allen, not a copy of any proprietary assistant. Advisory only.

## What it does
- Collaborates, researches first and reads back before building
- Explains Token DNA in plain English
- Looks up tokens via DexScreener, with missing data shown as missing, never invented
- Brand Guard check against the canonical HALEX list
- Drafts posts in human language, drafts only, never sends
- Queues tasks for Allen to review on every refill, downloadable as JSON
- Builds pages, docs, reports and scripts as downloadable starters

## What it does NOT do
- Does not move funds, hold or share wallet keys, trade live, post to X, or be limitless
- Does not have Allen's memory or authority
- No keys in the repo. A model API key, if you add one, lives only in your browser local storage

## How to use
Open the page, ask a question, or try: explain Token DNA, lookup token 0x..., brand guard halexrtrade.online, build a page about HALEX Chain, show workflows.
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
MIT, see LICENSE. This applies to HALEX AI, HALEX-M, HALEX Wallet, and HALEX Chain deployments in this project. Upstream Vibe-Trading patterns used in Vibe-research-lab are attributed separately in that project's NOTICE.md.
