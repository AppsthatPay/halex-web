"""Tests for cross-chain meta-label & split-cell sharing."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cross_chain import (  # noqa: E402
    HalexHyperCubeMatrix,
    HalexToken,
    SatoshiAgentUnit,
    TransparentWallet,
    demo_generic_exchange,
)
from halex_1000_5 import Coordinate5D, UNITS_PER_WHOLE  # noqa: E402


class TestCrossChain(unittest.TestCase):
    def test_demo_transfer(self):
        success, transfer, count = demo_generic_exchange()
        self.assertTrue(success)
        self.assertEqual(count, 2)  # original example unit + cloned example unit
        self.assertEqual(transfer["origin_chain_id"], 1276)
        self.assertEqual(transfer["local_token_total_units"], UNITS_PER_WHOLE + 200)

    def test_clone_preserves_origin(self):
        unit = SatoshiAgentUnit(100, "example_domain_a", "impulse", 1276)
        cloned = unit.clone_for_cross_chain(3471)
        self.assertEqual(cloned.origin_chain_id, 1276)
        self.assertEqual(cloned.current_chain_id, 3471)
        self.assertEqual(cloned.mutable_metadata["cloned_from_chain"], "1276")
        self.assertEqual(cloned.operational_status, "IMPORTED_ACTIVE")

    def test_exact_unit_match_not_float(self):
        matrix = HalexHyperCubeMatrix()
        src = TransparentWallet("W_SRC", 1276, "example", Coordinate5D(0, 0, 0, 0, 0))
        matrix.register_wallet_to_chain(1276, src)
        token = HalexToken("T_SRC", 1276, "W_SRC")
        token.add_satoshi(SatoshiAgentUnit(100, "example_domain_a", "x", 1276))
        src.acquire_token(token)
        dst = TransparentWallet("W_DST", 3471, "space", Coordinate5D(1, 0, 0, 0, 0))
        matrix.register_wallet_to_chain(3471, dst)
        dst_token = HalexToken("T_DST", 3471, "W_DST")
        dst.acquire_token(dst_token)
        self.assertFalse(dst.request_split_cell_transfer("T_DST", 101, src, "T_SRC"))
        self.assertTrue(dst.request_split_cell_transfer("T_DST", 100, src, "T_SRC"))
        # Source is retained: share is a copy, not a move.
        self.assertEqual(len(token.satoshi_units), 1)

    def test_meta_label_is_label_only(self):
        wallet = TransparentWallet("W_X", 500, "Domain label text", Coordinate5D(500, 500, 500, 500, 500))
        self.assertEqual(wallet.meta_label, "Domain label text")
        self.assertEqual(wallet.portfolio, {})


if __name__ == "__main__":
    unittest.main()
