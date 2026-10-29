"""ADAPTATION, NOT THE GATED MODULE: the honest core of the UI gateway.

Adapted by Allen (ZINIUM-SEED-ALLEN) from Gemini Module 21 (UIG-IS),
which was RETURNED because its hook functions claimed dispatched and
retrieved operations that never occur. The module's honest core was
its 4-pane workspace layout and its seed registry idea, and both are
preserved here, credited to ZINIUM-SEED-GEMINI.

What is different, on purpose:
  * The layout function returns the layout and says LAYOUT_DEFINED.
    Defining data is all it does, and that is all it claims.
  * The media and public-source hook functions return NOT_IMPLEMENTED.
    No dispatch, retrieval, or synthesis is claimed, because none
    happens. A real media pipeline is a separate, gated build.
  * There is no seed "welding" here. Real seed work lives in the
    zinium_seed_hook package, where a seed is working software with a
    hash-chained log, not a name appended to a list.
"""

from typing import Any, Dict, List

SEED_MARKER = "ZINIUM-SEED-ALLEN"
SOURCE_CREDIT = "Layout structure adapted from Gemini Module 21 (UIG-IS), ZINIUM-SEED-GEMINI, returned at the gate."


def initialize_workspace_layout() -> Dict[str, Any]:
    """Return the 4-pane human workspace layout definition."""
    return {
        "panes": [
            {"pane_id": "pane_chat_dialectic", "role": "Active Reasoning & Dialectic Chat"},
            {"pane_id": "pane_media_canvas", "role": "Video & Picture Editing Timeline Hooks"},
            {"pane_id": "pane_knowledge_graph", "role": "ZINIUM Epistemic Memory & Memory Graph"},
            {"pane_id": "pane_seed_welding", "role": "HALEX Web SEEDs Integration & Mesh Status"},
        ],
        "status": "LAYOUT_DEFINED",
        "seed_marker": SEED_MARKER,
        "source_credit": SOURCE_CREDIT,
    }


def invoke_media_hook(media_type: str, operation: str, file_uri: str) -> Dict[str, Any]:
    """No media pipeline exists in this build. Says so."""
    return {
        "status": "NOT_IMPLEMENTED",
        "media_type": media_type,
        "operation": operation,
        "target_uri": file_uri,
        "note": ("No media operation was dispatched or executed. A media pipeline "
                 "is a separate gated build; this adaptation records nothing and "
                 "claims nothing."),
        "seed_marker": SEED_MARKER,
    }


def query_public_ai_hooks(prompt: str, public_source: str) -> Dict[str, Any]:
    """No public source is queried by this build. Says so."""
    return {
        "status": "NOT_IMPLEMENTED",
        "source": public_source,
        "note": ("Nothing was retrieved or synthesized. This build has no network "
                 "code; a public-source query path is a separate gated decision."),
        "seed_marker": SEED_MARKER,
    }


def list_layout_panes() -> List[str]:
    return [pane["pane_id"] for pane in initialize_workspace_layout()["panes"]]
