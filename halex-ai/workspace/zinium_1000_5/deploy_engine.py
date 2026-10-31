"""HALEX-AI Deploy Token and Coin Engine — STAGING ONLY, stdlib only.

This is Allen's staging implementation of the architectural summary
Jeffrey sent 2026-10-31 ~16:51 EDT. It is NOT the external file
`halex_ai_deploy_engine.py` named in that message: that file was not
found in this workspace's staging tree, so Allen did not read, run,
or verify it. If Jeffrey uploads or pastes it, Allen will gate-check
it the same way before integrating any of it.

Distinctions, as settled by Jeffrey:
- TOKEN: an open, transparent software object, deployed across
  public rods in the 1000^5 grid. A record, never a crypto asset.
- COIN: an encrypted object on obscurity chains, held behind
  encrypted wallet vaults. Here a coin record carries a SHA3-512
  hash reference (hashlib.sha3_512) and the obscurity flag. A hash
  is NOT encryption and is NOT claimed as encryption: real
  encryption of vault contents is a separate, unbuilt step, and
  no vault here holds value, keys, or credentials.

Satoshi-level agentification, record form:
- Every satoshi fraction is a record with an integer unit count
  and an instruction manifest (knowledge, software systems,
  neural modeling, robotics, child chain expansion) stored as
  TEXT. Manifests are never executed, and no robotics, neural
  training, or child chain is actually run by this file.

Dynamic mass scaling, exact:
- A token/coin starts at a whole value in integer units
  (1.0 = 10,000,000,000 units). Each added satoshi unit adds
  exactly its own units, so mass scales 1.0 -> 1.00000001+
  -> 2.0+ only when those units are actually added. This is
  the same exact-addition fix as the 1000^5 engine, not the
  fixed-increment bug in the original sketch.

Grid deployment:
- HalexTokenDeployer registers wallet records (identifiers only,
  no keys, no funds), assigns 5D coordinates, and executes a
  deployment SEQUENCE as records: register -> open workspace
  (spec 4.2) -> deploy -> await instructions. No network.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Dict, List

from halex_1000_5 import (
    AgentNode,
    Coordinate5D,
    FractalToken,
    InstructionPayload,
    SatoshiSubChain,
    UNITS_PER_WHOLE,
)

MANIFEST_KEYS = (
    "knowledge",
    "software_systems",
    "neural_modeling",
    "robotics",
    "child_chain_expansion",
)


@dataclass
class SatoshiAgentUnit:
    units: int  # integer micro-units, e.g. 100 = 0.00000001 whole
    instruction_manifest: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        if not isinstance(self.units, int) or self.units <= 0:
            raise ValueError("satoshi agent unit must be a positive int")
        for key in self.instruction_manifest:
            if key not in MANIFEST_KEYS:
                raise ValueError(f"unknown manifest key: {key}")


@dataclass
class WalletRecord:
    wallet_id: str  # identifier record only, never a key or address with funds
    coordinate: Coordinate5D
    agency: AgentNode = None


class HalexTokenDeployer:
    def __init__(self):
        self.wallets: Dict[str, WalletRecord] = {}
        self.deployed: Dict[str, FractalToken] = {}

    def register_wallet(self, wallet_id: str, coordinate: Coordinate5D) -> WalletRecord:
        if wallet_id in self.wallets:
            raise ValueError("wallet already registered")
        agency = AgentNode(
            coordinate=coordinate,
            teleological_mandate="Learn the chain system; write and use the software system.",
        )
        agency.open_workspace()
        record = WalletRecord(wallet_id=wallet_id, coordinate=coordinate, agency=agency)
        self.wallets[wallet_id] = record
        return record

    def deploy(self, identifier: str, kind: str, wallet_id: str, satoshi_units: List[SatoshiAgentUnit]):
        """Deploy a TOKEN (open) or COIN (obscurity vault) record."""
        if kind not in ("TOKEN", "COIN"):
            raise ValueError("kind must be TOKEN or COIN")
        if identifier in self.deployed:
            raise ValueError("identifier already deployed")
        if wallet_id not in self.wallets:
            raise ValueError("wallet not registered")
        token = FractalToken(
            root_identifier=identifier,
            obscurity_vault_flag=(kind == "COIN"),
        )
        # Base whole value: 1.0, so added satoshis scale it upward
        # 1.0 -> 1.00000001+ -> 2.0+ exactly.
        token.expand_decimal_allocation(
            SatoshiSubChain(
                sub_address_units=UNITS_PER_WHOLE,
                chain_logic_bytecode=b"",
                mutable_metadata={"kind": kind, "manifest": "base_whole"},
            )
        )
        for unit in satoshi_units:
            token.expand_decimal_allocation(
                SatoshiSubChain(
                    sub_address_units=unit.units,
                    chain_logic_bytecode=b"",
                    mutable_metadata={
                        "kind": kind,
                        "manifest": ",".join(sorted(unit.instruction_manifest.keys())),
                    },
                )
            )
        self.deployed[identifier] = token
        # COIN vault reference: SHA3-512 hash of the record, not encryption.
        vault_hash = None
        if kind == "COIN":
            vault_hash = hashlib.sha3_512(
                f"{identifier}:{token.total_units()}".encode()
            ).hexdigest()
        wallet = self.wallets[wallet_id]
        wallet.agency.process_instruction(
            InstructionPayload(command=f"deploy:{kind}:{identifier}", data={})
        )
        return {
            "identifier": identifier,
            "kind": kind,
            "wallet_id": wallet_id,
            "coordinate": list(wallet.coordinate.as_tuple()),
            "total_units": token.total_units(),
            "total_whole": token.total_units() / UNITS_PER_WHOLE,
            "satoshi_units": len(satoshi_units),
            "vault_hash_sha3_512": vault_hash,
            "agency_operational_state": wallet.agency.operational_state,
        }
