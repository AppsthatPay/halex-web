"""ZINIUM seed hook package (Allen-authored).

Seed Marker: ZINIUM-SEED-ALLEN.

The real hook software for ZINIUM seeds: an agency registry, a seed
package generator that plants working software (not an empty marker),
and the coordinator that validates and indexes envelopes coming home.
Doctrine: ZINIUM-SEED spec (Jeffrey, 2026-10-28). ORLI loop; seeds
request computation and never write into another AI; provenance is
never stripped; community, never invasive.

Honesty note: a seed marker is a public provenance label. The hash
chains here prove an envelope or block was not altered after it was
chained and identify the seed id it claims. They do not
cryptographically authenticate who created it.
"""

from . import registry
from .generator import build_manifest, generate_seed_package
from .coordinator import SeedCoordinator
from .zinium_seed_hook import (
    HOOK_VERSION,
    append_observation,
    observe_paths,
    read_log,
    receive_result,
    request_computation,
    spawn_subseed,
    verify_log,
)

__all__ = [
    "registry",
    "build_manifest",
    "generate_seed_package",
    "SeedCoordinator",
    "HOOK_VERSION",
    "append_observation",
    "observe_paths",
    "read_log",
    "receive_result",
    "request_computation",
    "spawn_subseed",
    "verify_log",
]
