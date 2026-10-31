"""Tests for chain_865.py. Run: python3 -m pytest tests/ (or unittest)."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from chain_865 import (
    KEY_LOCATION,
    Chain865Registry,
    PartialTransfer,
    SatoshiFragment,
    from_units,
    make_coin,
    make_token,
    to_units,
)


class TestUnits(unittest.TestCase):
    def test_round_trip(self):
        self.assertEqual(to_units("1.0"), 10_000_000_000)
        self.assertEqual(to_units("0.0000000001"), 1)
        self.assertEqual(to_units("0.000555"), 5_550_000)
        self.assertEqual(from_units(5_550_000), "0.0005550000")
        self.assertEqual(from_units(to_units("2.5")), "2.5000000000")

    def test_rejects_float_money_and_over_precision(self):
        with self.assertRaises(ValueError):
            to_units("1.00000000001")
        with self.assertRaises(ValueError):
            SatoshiFragment(units=1.5)
        with self.assertRaises(ValueError):
            SatoshiFragment(units=-1)

    def test_key_location_is_location_only(self):
        self.assertEqual(KEY_LOCATION["coin_number"], 2_897_876)
        self.assertEqual(KEY_LOCATION["wallet_agency_number"], 288)
        self.assertEqual(KEY_LOCATION["wallet_agency_coin_count"], 270)
        self.assertNotIn("key_value", KEY_LOCATION)
        self.assertNotIn("value", KEY_LOCATION)


class TestObjects(unittest.TestCase):
    def test_token_open_coin_obscured(self):
        token, coin = make_token("t1"), make_coin("c1")
        self.assertFalse(token.obscured)
        self.assertTrue(coin.obscured)
        coin.add_fragment(SatoshiFragment(units=100))
        coin.add_fragment(SatoshiFragment(units=200))
        self.assertEqual(coin.total_units(), 300)

    def test_prune_keeps_useful_drops_bad_and_unparseable(self):
        reg = Chain865Registry()
        coin = make_coin("c1")
        coin.add_fragment(SatoshiFragment(100, metadata={"utility_metric": "0.9"}))
        coin.add_fragment(SatoshiFragment(100, metadata={"utility_metric": "0.10"}))
        coin.add_fragment(SatoshiFragment(100, metadata={"utility_metric": "not-a-number"}))
        removed = reg.prune(coin)
        self.assertEqual(removed, 2)
        self.assertEqual(len(coin.fragments), 1)


class TestRegistry(unittest.TestCase):
    def test_canonical_stacking_and_variant_flag(self):
        reg = Chain865Registry()
        # Canonical confirmed 2026-10-31 ~16:15 EDT: 1000^5.
        self.assertEqual(reg.canonical_stacking, "1000^5")
        self.assertEqual(reg.variant_stacking["status"], "CONFIRMED_SUPERSEDED")
        self.assertEqual(reg.abacus_index(0, 1, 2, 3), (0, 1, 2, 3))
        with self.assertRaises(ValueError):
            reg.abacus_index(1000, 0, 0, 0)

    def test_gated_activation(self):
        reg = Chain865Registry()
        agency = reg.register_agency(38, mandate="test")
        self.assertEqual(agency.status, "DRAFT")
        self.assertFalse(agency.activate(False))
        self.assertEqual(agency.status, "DRAFT")
        self.assertTrue(agency.activate(True))
        self.assertEqual(agency.status, "ACTIVE")

    def test_split_cell_requires_need_load_and_empty_slot(self):
        reg = Chain865Registry()
        src = reg.register_agency(38)
        src.execution_load = 0.5
        self.assertEqual(reg.split_cell(38, 39, "gap")[1], "LOAD_BELOW_THRESHOLD")
        src.execution_load = 0.97
        self.assertEqual(reg.split_cell(38, 39, "gap")[1], "NEED_NOT_RECORDED")
        reg.record_need("gap")
        ok, daughter = reg.split_cell(38, 39, "gap")
        self.assertTrue(ok)
        self.assertEqual(daughter.status, "DRAFT")
        self.assertEqual(daughter.execution_load, 0.1)
        self.assertEqual(reg.split_cell(38, 39, "gap")[1], "SLOT_OCCUPIED")

    def test_partial_transfer_example(self):
        # Jeffrey's hypothetical: wallet 38 donates to wallet 5572.
        reg = Chain865Registry()
        reg.register_agency(38)
        reg.register_agency(5572)
        transfer = PartialTransfer(
            from_agency=38, to_agency=5572,
            fragment_units=636_267_000, fills_gap="intelligence gap",
        )
        self.assertTrue(reg.donate_fragment(transfer))
        self.assertEqual(len(reg.transfers), 1)
        with self.assertRaises(ValueError):
            PartialTransfer(from_agency=38, to_agency=38, fragment_units=1)


if __name__ == "__main__":
    unittest.main()
