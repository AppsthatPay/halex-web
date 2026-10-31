"""Tests for first_chain_population: token, share, run, mitosis gate."""

import json
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from first_chain_population import (  # noqa: E402
    TECHNOLOGIES,
    _apply_toy_transform,
    run_population,
)
from halex_1000_5 import UNITS_PER_WHOLE  # noqa: E402


def _copy_genesis(tmp):
    src = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in ("ledger.jsonl", "agencies.json"):
        shutil.copy(os.path.join(src, name), os.path.join(tmp, name))
    ws_dst = os.path.join(tmp, "workspace")
    os.makedirs(ws_dst, exist_ok=True)
    shutil.copy(
        os.path.join(src, "workspace", "interactions.jsonl"),
        os.path.join(ws_dst, "interactions.jsonl"),
    )
    return tmp


class TestFirstChainPopulation(unittest.TestCase):
    def test_population_and_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_genesis(tmp)
            # tmp ledger is at block 2 (real staging copy); next is 3.
            before = [json.loads(l) for l in open(os.path.join(tmp, "ledger.jsonl"))]
            report = run_population(tmp)
            self.assertEqual(report["block"], before[-1]["block"] + 1)
            self.assertEqual(report["agencies_populated"], 32)
            self.assertEqual(report["source_retained_units"], 5)
            self.assertEqual(report["token_total_units"], UNITS_PER_WHOLE + 500)
            self.assertEqual(report["agencies_instructed"], 32)
            # 5 center units + 31 neighbours x 2 units = 67 transforms.
            self.assertEqual(report["transforms_applied"], 67)
            self.assertEqual(len(report["output_vector"]), 4)
            self.assertNotEqual(report["output_vector"], report["input_vector"])
            self.assertEqual(report["mitosis"]["real_first_cube_expansions"], 0)
            self.assertTrue(report["mitosis"]["sandbox_probe_saturated_spawned_draft"])
            self.assertFalse(report["mitosis"]["sandbox_probe_low_load_spawned"])
            # Ledger chained, agencies file untouched in count.
            blocks = [json.loads(l) for l in open(os.path.join(tmp, "ledger.jsonl"))]
            self.assertEqual(blocks[-1]["hash"], report["hash"])
            self.assertEqual(blocks[-1]["previous_hash"], before[-1]["hash"])
            self.assertEqual(len(json.load(open(os.path.join(tmp, "agencies.json")))), 32)
            # Population table: 1 source + 31 shares, all with coordinates.
            pop = blocks[-1]["population"]
            self.assertEqual(len(pop), 32)
            shares = [p for p in pop if p["share_status"] == "CROSS-CHAIN SYNC SUCCESS"]
            self.assertEqual(len(shares), 31)
            self.assertTrue(all(p["local_token_units"] >= 1 for p in pop))

    def test_toy_transform_single_step(self):
        # Manual check: [0.5, -0.2, 0.8, 1.2] with knowledge weights.
        out = _apply_toy_transform([0.5, -0.2, 0.8, 1.2], [0.85, 1.12, 0.94, 1.05])
        self.assertAlmostEqual(out[0], 0.5 * 0.85 + 0.01)
        self.assertAlmostEqual(out[1], -0.2 * 1.12 + 0.01)
        self.assertEqual(len(TECHNOLOGIES), 5)

    def test_missing_genesis_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(FileNotFoundError):
                run_population(tmp)


if __name__ == "__main__":
    unittest.main()
