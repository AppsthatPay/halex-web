# Unity Layering in HALEX-M

Plain English notes on how a Unity layer would slot into HALEX-M at native build time.

## Status today

No Unity build exists today. This document describes a planned layer, not a shipped feature. Prior research and development estimated a native Unity track at roughly 11 to 14 weeks. Unity WebGL on mobile was disqualified because mobile WebGL support and build size did not meet the bar. The web build ships without Unity and loses nothing it claims today.

## What Unity would handle

Unity would handle rendering and simulation acceleration only:

- Chaintarium 3D scenes: planets for chains, towers for tokens, and square buildings for wallets, with the lighting, bloom, and movement that a game engine does well.
- Chart rendering: fast, smooth drawing of token charts and live feed visuals.
- Parallel what-if simulation: running many model scenarios side by side so research views can compare outcomes quickly.

## What stays in the app layer

Everything that thinks stays outside Unity:

- AI logic, including the HALEX-M AI panel and its local knowledge base.
- Research tools, including APEX2 Research and the Token DNA scorecard.
- Data: market feeds, wallet reads, search, and the Cosmos Tracker.
- Settings, accounts, and all user-facing text and controls.

The app layer sends Unity a scene description and reads back interaction events, such as a tapped planet or tower. Unity does not decide what the data means.

## What never enters Unity

Wallet signing and keys never enter Unity. No seed phrase, no private key, and no signing call is passed to the Unity layer, ever. Wallet connect in HALEX-M stays read-only in the app layer: it shares the public address only, and nothing is signed or sent.

## How the layers connect

At native build time, Unity runs as a rendering and simulation layer inside the native shell, next to the app layer. The app layer owns the data and the logic. Unity owns the pixels and the simulation speed. If the Unity layer is absent, as it is in the web build, the app layer renders with its normal web tools and every research, feed, and wallet feature still works as claimed today.

## Order of work if the native track starts

1. Prove the Chaintarium scene in Unity against the current web scene, using the same labelled model values.
2. Move chart rendering over, keeping the app layer as the source of the numbers.
3. Add parallel what-if simulation for research views.
4. Re-audit the boundary before release: no keys, no signing, and no AI logic inside Unity.
