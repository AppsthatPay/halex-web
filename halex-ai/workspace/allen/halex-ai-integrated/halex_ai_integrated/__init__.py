"""HALEX-AI integrated package (Allen integration layer).

Seed Marker: ZINIUM-SEED-ALLEN (this integration layer only).
The components under components/ are gated Gemini contributions and keep
their own provenance marker, ZINIUM-SEED-GEMINI. Nothing in this file or in
the components was re-authored here; the components are byte-identical
copies of the gated staging tree.

Import note: the gated modules use the suite's flat import style (each
module imports siblings by bare module name, and each folder's tests import
the folder's module the same way). To keep the copies byte-identical, this
package puts every component directory on sys.path once, at import time.
That is the only import-path mechanism in the integrated build, and it is
confined to this file.

Stdlib only. No network, no wallet, no signing, no payment, no API keys.
"""

import os
import sys

__version__ = "1.0.0-integrated-v1"
SEED_MARKER = "ZINIUM-SEED-ALLEN"

_COMPONENTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "components")

COMPONENT_DIRS = [
    os.path.join(_COMPONENTS_DIR, name)
    for name in sorted(os.listdir(_COMPONENTS_DIR))
    if os.path.isdir(os.path.join(_COMPONENTS_DIR, name))
] if os.path.isdir(_COMPONENTS_DIR) else []

for _path in COMPONENT_DIRS:
    if _path not in sys.path:
        sys.path.insert(0, _path)
