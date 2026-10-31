"""Chain 865 registry + Python mirror of the Rust core prototype.

STAGING ONLY. Not pushed, not live, not a crypto system.

Design source: Jeffrey's 2026-10-31 Chain 865 order, recorded in
MEMORY.md. This module models that design as internal software
records, nothing more:

- Chain 865 is an obscured / encrypted chain entry: it communicates
  with the other ZINIUM chains in the model, but its records are
  marked obscured, so they are not rendered as public content.
- A wallet-agency is a processor / agency record held on the chain.
  It holds software objects, not funds. The word "wallet" here is
  Jeffrey's design vocabulary for a software socket / agency, not a
  crypto wallet: there is no address with value, no balance that can
  be spent, and no code in this file that moves value.
- A token is an OPEN software object, divisible from 1.0 down to
  0.0000000001 (10 decimal places).
- A coin is an ENCRYPTED software object with the same breakdown,
  living on obscurity chains behind obscured wallet-agencies.
- A wallet-agency can create tokens that act as memory chips:
  deployed shared memory that helps the chain connect.
- A satoshi fragment is a script fragment / microprocessor record
  inside a coin. A partial-coin transfer donates a compiled
  intelligence fragment from one wallet-agency to another to fill a
  gap; the fragment is recorded on-chain, not sent off-chain.

Integer money rule: all amounts are integer micro-units.
UNITS_PER_WHOLE = 10_000_000_000, matching Jeffrey's 1.0 to
0.0000000001 breakdown. Floats are used ONLY for non-money scores
(execution load, utility score), never for amounts. This fixes the
float-money defect in the original Rust sketch (f64 addresses and
f64 total_value, which are lossy).

Canonical stacking: 1000^5, confirmed by Jeffrey 2026-10-31 ~16:15 EDT
("1000^5"). The prior 1000^4 stacked abacus is the starting cube;
the 1000^5 cube starts in its middle (Brainchain chain 500, center
corner 500,500,500,500,500). The 4D abacus_index below is retained
as a legacy coordinate helper, not as the canonical model.

Key-location record: the design places a decryption-key location at
coin 2,897,876, satoshi range 0.000555-1.00000, wallet-agency 288
holding 270 coins. This module records that LOCATION as design
data only. It contains no key value, invents none, and never treats
the location as a credential. No key value is stored, printed, or
derived anywhere in this module.

Gates that bind this module:
- Split-cell growth only on a recorded need, one daughter per
  request, into an empty slot only.
- Spawned agencies start DRAFT and require gate review before
  activation; unbounded self-replication is refused.
- User message text is never written into any record here.
- No network, no signing, no payment, no minting of a crypto
  asset, no value transfer. The standard library only.
"""

from __future__ import annotations

from dataclasses import dataclass, field

UNITS_PER_WHOLE = 10_000_000_000
MAX_COINS_DESIGN = 889_259_766  # Jeffrey's design count, a target, not a population.
CANONICAL_STACKING = "1000^5"
VARIANT_STACKING = "1000^4"
PRUNE_UTILITY_THRESHOLD = 0.15
MITOSIS_LOAD_THRESHOLD = 0.95

# Key LOCATION as design data only. No key value exists here.
KEY_LOCATION = {
    "coin_number": 2_897_876,
    "satoshi_range": "0.000555-1.00000",
    "satoshi_range_units": (5_550_000, UNITS_PER_WHOLE),
    "wallet_agency_number": 288,
    "wallet_agency_coin_count": 270,
    "note": "LOCATION ONLY - no key value is stored, invented, or derived.",
}


def to_units(whole_str: str) -> int:
    """Convert a decimal string with <=10 places to integer units.

    Raises ValueError on malformed input or more than 10 places.
    """
    if "." in whole_str:
        whole, frac = whole_str.split(".", 1)
        if len(frac) > 10 or not frac.isdigit():
            raise ValueError("at most 10 decimal places")
        frac = frac.ljust(10, "0")
    else:
        whole, frac = whole_str, "0" * 10
    if not whole.isdigit():
        raise ValueError("whole part must be digits")
    return int(whole) * UNITS_PER_WHOLE + int(frac)


def from_units(units: int) -> str:
    """Render integer units back as a decimal string."""
    if units < 0:
        raise ValueError("negative units")
    return f"{units // UNITS_PER_WHOLE}.{units % UNITS_PER_WHOLE:010d}"


@dataclass
class SatoshiFragment:
    """One script fragment / microprocessor record inside a coin."""

    units: int  # integer micro-units, never a float amount
    script_kind: str = "software-script"
    metadata: dict = field(default_factory=dict)

    def __post_init__(self):
        if not isinstance(self.units, int) or self.units < 0:
            raise ValueError("fragment units must be a non-negative int")


@dataclass
class SoftwareObject:
    """Base record for tokens (open) and coins (encrypted)."""

    object_id: str
    kind: str  # "token" or "coin"
    obscured: bool = False
    fragments: list = field(default_factory=list)

    def total_units(self) -> int:
        return sum(f.units for f in self.fragments)

    def add_fragment(self, fragment: SatoshiFragment) -> None:
        if not isinstance(fragment, SatoshiFragment):
            raise ValueError("only SatoshiFragment records can be added")
        self.fragments.append(fragment)


def make_token(object_id: str) -> SoftwareObject:
    """An open software object (token), not obscured."""
    return SoftwareObject(object_id=object_id, kind="token", obscured=False)


def make_coin(object_id: str) -> SoftwareObject:
    """An encrypted software object (coin) on an obscurity chain."""
    return SoftwareObject(object_id=object_id, kind="coin", obscured=True)


@dataclass
class WalletAgency:
    """A wallet-agency record: a processor / agency on Chain 865."""

    number: int
    status: str = "DRAFT"  # DRAFT until gate review activates it
    objects: list = field(default_factory=list)
    execution_load: float = 0.0  # score only, never money
    mandate: str = ""

    def coin_count(self) -> int:
        return sum(1 for o in self.objects if o.kind == "coin")

    def activate(self, gate_review_passed: bool) -> bool:
        """Gate review is required; a DRAFT never self-activates."""
        if gate_review_passed:
            self.status = "ACTIVE"
            return True
        return False


@dataclass
class PartialTransfer:
    """A partial-coin donation of a compiled fragment between agencies."""

    from_agency: int
    to_agency: int
    fragment_units: int
    fills_gap: str = ""

    def __post_init__(self):
        if self.from_agency == self.to_agency:
            raise ValueError("transfer requires two distinct agencies")
        if not isinstance(self.fragment_units, int) or self.fragment_units <= 0:
            raise ValueError("fragment units must be a positive int")


class Chain865Registry:
    """Registry for Chain 865 records. Staging model only."""

    def __init__(self):
        self.chain_id = "865"
        self.kind = "obscured-encrypted"
        self.canonical_stacking = CANONICAL_STACKING
        self.variant_stacking = {
            "model": VARIANT_STACKING,
            "status": "CONFIRMED_SUPERSEDED",
            "note": "Prior 1000^4 model, superseded by Jeffrey's 2026-10-31 "
            "~16:15 EDT confirmation of 1000^5 as canonical. Retained "
            "as a legacy coordinate record only.",
        }
        self.design_coin_count = MAX_COINS_DESIGN
        self.agencies: dict = {}
        self.recorded_needs: list = []
        self.transfers: list = []

    def register_agency(self, number: int, mandate: str = "") -> WalletAgency:
        if number in self.agencies:
            return self.agencies[number]
        agency = WalletAgency(number=number, mandate=mandate)
        self.agencies[number] = agency
        return agency

    def record_need(self, reason: str) -> None:
        self.recorded_needs.append(reason)

    def split_cell(self, from_number: int, to_number: int, reason: str):
        """Split-cell growth: only on a recorded need, empty slot only.

        Returns (ok, agency-or-reason). A saturated agency (load >=
        0.95) may spawn one daughter; the daughter starts DRAFT.
        """
        if to_number in self.agencies:
            return False, "SLOT_OCCUPIED"
        source = self.agencies.get(from_number)
        if source is None:
            return False, "SOURCE_NOT_FOUND"
        if source.execution_load < MITOSIS_LOAD_THRESHOLD:
            return False, "LOAD_BELOW_THRESHOLD"
        if reason not in self.recorded_needs:
            return False, "NEED_NOT_RECORDED"
        daughter = WalletAgency(
            number=to_number, mandate=source.mandate, execution_load=0.1
        )
        self.agencies[to_number] = daughter
        return True, daughter

    def donate_fragment(self, transfer: PartialTransfer) -> bool:
        """Record a partial-coin fragment donation on-chain.

        Both agencies must exist; the fragment is recorded, not moved
        off-chain. No value, no asset, no network involved.
        """
        if transfer.from_agency not in self.agencies:
            return False
        if transfer.to_agency not in self.agencies:
            return False
        self.transfers.append(transfer)
        return True

    def prune(self, coin: SoftwareObject) -> int:
        """Drop fragments whose utility score is below threshold.

        Returns the number of fragments removed. Scores are read
        defensively: unparseable scores count as 0.0 (the original
        Rust sketch panicked on a bad parse; this does not).
        """
        before = len(coin.fragments)
        kept = []
        for frag in coin.fragments:
            try:
                score = float(frag.metadata.get("utility_metric", "0.0"))
            except (TypeError, ValueError):
                score = 0.0
            if score >= PRUNE_UTILITY_THRESHOLD:
                kept.append(frag)
        coin.fragments = kept
        return before - len(kept)

    def abacus_index(self, chain: int, disk: int, rod: int, slider: int) -> tuple:
        """Legacy 1000^4 stacked-abacus coordinate (4 axes, each <1000).
        Retained for compatibility; canonical stacking is now 1000^5."""
        for value in (chain, disk, rod, slider):
            if not (0 <= value < 1000):
                raise ValueError("abacus axes must be in 0..999")
        return (chain, disk, rod, slider)
