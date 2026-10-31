"""Tests for the obscurity chain single-use burn engine."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from halex_1000_5 import Coordinate5D, UNITS_PER_WHOLE  # noqa: E402
from obscurity import (  # noqa: E402
    EncryptedWalletVault,
    ObscurityChainSecureExchange,
    demo_generic_obscurity,
)


class TestObscurity(unittest.TestCase):
    def test_demo_burn(self):
        coin, package, result, reuse_refused = demo_generic_obscurity()
        self.assertEqual(result["status"], "SINGLE-USE BURN VERIFIED")
        self.assertEqual(result["remaining_satoshi_units"], 1)
        self.assertEqual(result["coin_total_units"], UNITS_PER_WHOLE + 100)
        self.assertIsNone(result["plaintext_returned"])
        self.assertTrue(reuse_refused)
        self.assertNotIn("ephemeral_key", str(package))
        self.assertNotIn("decryption_key", str(package))

    def test_reuse_refused(self):
        exchange = ObscurityChainSecureExchange()
        vault = EncryptedWalletVault("V1", 9999, Coordinate5D(0, 0, 0, 0, 0))
        exchange.register_vault(vault)
        vault.mint_encrypted_coin("C1", ["Example sealed record"])
        package = exchange.request_secure_shrouded_token("W1", "V1", "C1", 100)
        exchange.consume_and_burn_single_use_token(package)
        with self.assertRaises(RuntimeError):
            exchange.consume_and_burn_single_use_token(package)

    def test_unknown_vault_and_coin_refused(self):
        exchange = ObscurityChainSecureExchange()
        with self.assertRaises(ValueError):
            exchange.request_secure_shrouded_token("W1", "NO_VAULT", "C1", 100)


if __name__ == "__main__":
    unittest.main()
