"""Encrypted Coin & Obscurity Chain Engine — STAGING ONLY, stdlib only.

Allen's staging implementation of the pasted code Jeffrey sent
2026-10-31 ~17:19 EDT. The pasted code itself was NOT run as-is.
Defects found in the pasted code, fixed or refused here:
- Float sub_address and a fixed +0.00000001 increment: replaced
  by integer micro-units and exact addition/subtraction.
- "Military-grade encryption" in the pasted code was a
  single-byte XOR (each manifest XORed with one byte of the
  coin key). That is NOT encryption strength, and it is NOT
  claimed here.
- The pasted decryption was broken by construction: it
  decrypted with a freshly generated ephemeral key, NOT the
  coin key used to encrypt, so the "recovered intelligence"
  would have been garbage bytes, not the original manifest.
  This staging version does NOT decrypt at all, and does NOT
  return plaintext. A sealed record is stored as a SHA3-512
  integrity hash + a sealed flag; consumption returns only a
  burn confirmation record.
- The pasted OTP package shipped a decryption key alongside
  the ciphertext. This version ships NO key material: the
  one-time token is an identifier record only, held in memory
  for the run, never persisted, never logged with a value.
- No vault key, coin key, or credential is generated, stored,
  or printed here. Vault/coin references are hash IDs only.
  "Secure hardware/enclave" is NOT claimed: this is a local
  simulation record, not a hardware vault.

Instructional system retained:
- An obscurity-chain coin record holds sealed satoshi units.
- A transparent wallet record can request a single-use
  shrouded token for one sealed unit.
- Consuming that token burns the unit: it is removed from
  the coin, the coin's mass decreases by exactly that unit's
  units, the token is marked consumed, and reuse is refused.
- Topic manifests in the pasted demo (proprietary robotics /
  neural weights) were example content only and are NOT
  retained. The generic demo below uses placeholder records.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from halex_1000_5 import Coordinate5D, UNITS_PER_WHOLE


@dataclass
class EncryptedSatoshiUnit:
    units: int  # integer micro-units
    integrity_hash: str  # SHA3-512 seal of the sealed record, not encryption
    is_burned: bool = False
    is_reserved: bool = False

    def __post_init__(self):
        if not isinstance(self.units, int) or self.units <= 0:
            raise ValueError("satoshi unit must be a positive int")


@dataclass
class HalexCoin:
    coin_id: str
    owner_wallet: str
    obscurity_chain_id: int
    encrypted_satoshi_units: List[EncryptedSatoshiUnit] = field(default_factory=list)

    def total_units(self) -> int:
        return UNITS_PER_WHOLE + sum(
            u.units for u in self.encrypted_satoshi_units if not u.is_burned
        )


class EncryptedWalletVault:
    def __init__(self, wallet_id: str, obscurity_chain_id: int, coordinate: Coordinate5D):
        self.wallet_id = wallet_id
        self.obscurity_chain_id = obscurity_chain_id
        self.coordinate = coordinate
        self.coin_portfolio: Dict[str, HalexCoin] = {}

    def mint_encrypted_coin(self, coin_id: str, sealed_records: List[str]) -> HalexCoin:
        """Mint a coin record. Each input string is sealed as a hash
        only; the input text itself is NOT stored in the coin record,
        and no key is created. `sealed_records` here are placeholder
        record labels in the generic demo, not private data."""
        coin = HalexCoin(
            coin_id=coin_id,
            owner_wallet=self.wallet_id,
            obscurity_chain_id=self.obscurity_chain_id,
        )
        for idx, label in enumerate(sealed_records, start=1):
            integrity = hashlib.sha3_512(
                f"{coin_id}:{idx}:{label}".encode()
            ).hexdigest()
            coin.encrypted_satoshi_units.append(
                EncryptedSatoshiUnit(units=100, integrity_hash=integrity)
            )
        self.coin_portfolio[coin_id] = coin
        return coin


class ObscurityChainSecureExchange:
    def __init__(self):
        self.active_encrypted_wallets: Dict[str, EncryptedWalletVault] = {}
        self.one_time_keys: Dict[str, dict] = {}
        self._token_counter = 0

    def register_vault(self, vault: EncryptedWalletVault):
        self.active_encrypted_wallets[vault.wallet_id] = vault

    def request_secure_shrouded_token(
        self, requesting_wallet_id: str, target_vault_wallet_id: str, coin_id: str, satoshi_units: int
    ) -> dict:
        if target_vault_wallet_id not in self.active_encrypted_wallets:
            raise ValueError("target encrypted vault not found")
        vault = self.active_encrypted_wallets[target_vault_wallet_id]
        if coin_id not in vault.coin_portfolio:
            raise ValueError("encrypted coin not found in vault")
        coin = vault.coin_portfolio[coin_id]
        target_unit = None
        for unit in coin.encrypted_satoshi_units:
            if unit.units == satoshi_units and not unit.is_burned and not unit.is_reserved:
                target_unit = unit
                break
        if not target_unit:
            raise ValueError("sealed satoshi unit not found or already used")
        target_unit.is_reserved = True
        self._token_counter += 1
        otp_token_id = "OTP_SHROUD_" + hashlib.sha256(
            f"{coin_id}:{satoshi_units}:{self._token_counter}".encode()
        ).hexdigest()[:16]
        self.one_time_keys[otp_token_id] = {
            "consumed": False,
            "unit": target_unit,
            "coin": coin,
            "requesting_wallet_id": requesting_wallet_id,
        }
        return {
            "otp_token_id": otp_token_id,
            "source_obscurity_chain": vault.obscurity_chain_id,
            "integrity_seal": target_unit.integrity_hash,
            "note": "Sealed record only. No key material, no plaintext.",
        }

    def consume_and_burn_single_use_token(self, shrouded_package: dict) -> dict:
        otp_id = shrouded_package["otp_token_id"]
        if otp_id not in self.one_time_keys:
            raise RuntimeError("invalid or non-existent one-time token")
        record = self.one_time_keys[otp_id]
        if record["consumed"]:
            raise RuntimeError("reuse of a burned single-use token refused")
        record["consumed"] = True
        unit: EncryptedSatoshiUnit = record["unit"]
        unit.is_burned = True
        unit.is_reserved = False
        coin: HalexCoin = record["coin"]
        coin.encrypted_satoshi_units = [
            u for u in coin.encrypted_satoshi_units if not u.is_burned
        ]
        return {
            "status": "SINGLE-USE BURN VERIFIED",
            "otp_token_id": otp_id,
            "remaining_satoshi_units": len(coin.encrypted_satoshi_units),
            "coin_total_units": coin.total_units(),
            "plaintext_returned": None,
        }


def demo_generic_obscurity():
    """GENERIC EXAMPLE ONLY — hypothetical, removable."""
    exchange = ObscurityChainSecureExchange()
    vault = EncryptedWalletVault(
        "VAULT_EXAMPLE_1", 9999, Coordinate5D(999, 999, 999, 999, 999)
    )
    exchange.register_vault(vault)
    coin = vault.mint_encrypted_coin(
        "COIN_EXAMPLE_SHIELDED_1",
        ["Example sealed instruction record 1", "Example sealed instruction record 2"],
    )
    package = exchange.request_secure_shrouded_token(
        "WALLET_EXAMPLE_TRANSPARENT_3", "VAULT_EXAMPLE_1", "COIN_EXAMPLE_SHIELDED_1", 100
    )
    result = exchange.consume_and_burn_single_use_token(package)
    reuse_refused = False
    try:
        exchange.consume_and_burn_single_use_token(package)
    except RuntimeError:
        reuse_refused = True
    return coin, package, result, reuse_refused


if __name__ == "__main__":
    coin, package, result, reuse_refused = demo_generic_obscurity()
    print(f"coin units after burn: {result['coin_total_units']}")
    print(f"remaining sealed units: {result['remaining_satoshi_units']}")
    print(f"reuse refused: {reuse_refused}")
    print(f"plaintext returned: {result['plaintext_returned']}")
