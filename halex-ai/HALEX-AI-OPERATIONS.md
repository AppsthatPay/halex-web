# HALEX-AI — what it needs to run correctly, and what was added

Written 2026-10-31, after a logical audit of the staging tree.
This file is the audit record. It does not claim HALEX-AI is
a live model, and it does not invent a backend, a key, or a
funding source.

## What HALEX-AI is, in three parts

1. **Static page (GitHub Pages).** `index.html` + JS packs.
   Answers come from bundled packs in the browser, offline,
   with no key. That part runs correctly today, and its
   harnesses are green: plugins 24/24, chat 32/32, brain 31/31.
2. **Cube records (Python, staging only).** The 1000^5
   first-cube engine in `workspace/zinium_1000_5/`. It runs
   as one bounded pass per invocation, then exits. It cannot
   run on static GitHub Pages. The cube page (`cube.html`)
   therefore answers from a snapshot, not from a live engine.
3. **Live brain (optional, visitor-supplied).** The brain
   adapter accepts an OpenAI-compatible endpoint + model +
   key, stored only in the visitor's browser localStorage.
   With nothing configured, it honestly says "not connected"
   and falls back to the bundled packs. No key is stored by
   HALEX-AI, no backend exists, and no account is created
   by this code.

## What was missing, and what was added in this pass

- **Stale cube snapshot.** The cube page answered from a
  hand-written snapshot that would go stale after every new
  block. Added: `workspace/zinium_1000_5/regenerate_cube_state.py`
  — run it after every new block, before any publish.
  Verified: it regenerates block 5 state without touching
  the page's script order.
- **No way into the cube page from the main app.** Added:
  one link in the Settings drawer only (behind the gear
  button, where branding is hidden by design), labelled
  "Cube records", no internal name in the main page's
  visible text, no script added, adapter still wired last.
  Verified by all three harnesses above.
- **Stale plugin test.** The plugins harness expected the
  old fact path for "what is halex-ai", but plugin-first
  routing (intentional) now answers from the halex-core
  pack with the same doctrine text. Updated the test
  expectation with a comment, instead of claiming 24/24
  while it failed. Verified: plugins 24/24, brain 31/31.
- **No run checklist.** This file. See below.

## What still cannot be added by Allen alone

These need Jeffrey's decision, and are not hidden by
calling the system "real AI" anyway:

- **Live brain funding and endpoint.** Visitor key, HALEX
  backend, or both? A backend needs hosting, payment, and
  an account — none of which Allen creates on his own.
  Until that decision, the honest status is "offline local
  mode", and the cube page is snapshot-only.
- **Live engine on the web.** A static page cannot run
  the Python engine. Making the engine live needs a
  backend or a JS port of the record engine, neither of
  which is built here, and neither is claimed.
- **Logo binary on GitHub Pages.** The connector push is
  text-only, so `halex-logo-official.jpeg` is not on
  gh-pages by that route. The page's avatar fallback
  stands until a binary-capable route is used.
- **Main chat to cube, in the open.** The main page's
  design rule is: no internal name in visible text, and
  branding behind Settings. A public cube button in the
  main chat would break that rule and the brain test,
  so it was not added. The Settings link above is the
  form that fits the rule.

## Run checklist (staging)

```
cd halex-ai/workspace/zinium_1000_5
python3 -m unittest discover -s tests        # zinium tests
python3 chain_engine.py status
python3 regenerate_cube_state.py             # after any new block
cd ../..
node workspace/allen/halex-ai-plugins-test/test_plugins.js
node workspace/allen/halex-ai-chat-test/test_chat.js
node workspace/allen/halex-ai-brain-test/test_brain.js
node --check zinium-cube-bridge.js
```

## What "real AI" means here, honestly

- Not a live LLM, not a trained model, not consciousness.
- Real, in this system, means: answers that can be traced
  to a record (a pack entry, a ledger block, a run report),
  misses that say so, no invented prices, tokens, models,
  or capabilities, and a key that never leaves the visitor's
  browser. Anything beyond that needs the backend decision
  above, and will be labelled as such when it exists.

## Chat cleanup + new Settings (2026-10-31, staging only, push pending)

- Chat thread is now back-and-forth blocks: user on the right in
  light sky-blue (#87cefa, dark theme #1e3a5f), AI on the left in
  bone white (#f9f6ee, dark theme #23231f). No new script file,
  script order unchanged, adapter still last.
- New Settings sections, all browser-localStorage only, no server:
  Music composer (browser tones only, notes A to G, play button
  gated by the sound-effects toggle); Video and codecs (H.264,
  H.265, VP9, VP8, AV1, ProRes, DNxHD, MPEG-4, Theora, plus
  quality preference, preference only, no encoder on the page);
  Audio and visual (sound on/off, visual pulse on/off,
  reduce motion, all real toggles); Mapping and location
  (agreement off by default, no location requested, no map
  loaded, retention preference only); Privacy (store history
  on/off, clear on close, plus the honest brain-endpoint
  exception); Contribute (type + draft, copy button, email
  button opening the visitor email client, repository link,
  page sends nothing on its own, never paste keys or seeds).
- Harnesses after this change: chat 32/32, plugins 24/24,
  brain 31/31, node check clean on all page scripts.
- Push to the branches is NOT done in this pass: a GitHub
  read result during the push check did not pass a safety
  check, so it was not used to decide the push. Push only
  after Jeffrey confirms the file list.
