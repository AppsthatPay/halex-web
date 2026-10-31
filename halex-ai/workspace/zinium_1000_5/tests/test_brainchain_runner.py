"""Tests for brainchain_runner: one bounded pass, wired end to end."""

import json
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from brainchain_runner import run_pass  # noqa: E402
from halex_1000_5 import UNITS_PER_WHOLE  # noqa: E402


def _copy_genesis(tmp):
    src = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in ("ledger.jsonl", "agencies.json"):
        shutil.copy(os.path.join(src, name), os.path.join(tmp, name))
    ws_src = os.path.join(src, "workspace")
    ws_dst = os.path.join(tmp, "workspace")
    os.makedirs(ws_dst, exist_ok=True)
    shutil.copy(
        os.path.join(ws_src, "interactions.jsonl"),
        os.path.join(ws_dst, "interactions.jsonl"),
    )
    return tmp


class TestBrainchainRunner(unittest.TestCase):
    def test_one_pass_wires_deploy_share_burn(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_genesis(tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                before = [json.loads(line) for line in f if line.strip()]
            report = run_pass(tmp)
            # Relative, not absolute: the copy may already be past block 2.
            self.assertEqual(report["block"], before[-1]["block"] + 1)
            self.assertEqual(report["agencies_instructed"], 32)
            self.assertEqual(report["deploy_token_total_units"], UNITS_PER_WHOLE + 100)
            self.assertEqual(report["deploy_coin_total_units"], UNITS_PER_WHOLE + 100)
            self.assertEqual(len(report["deploy_coin_vault_hash"]), 128)
            share = report["cross_chain_share"]
            self.assertEqual(share["status"], "CROSS-CHAIN SYNC SUCCESS")
            self.assertEqual(share["from_coordinate"], [500, 500, 500, 500, 500])
            self.assertEqual(share["to_coordinate"], [500, 500, 500, 500, 501])
            self.assertEqual(share["local_token_total_units"], UNITS_PER_WHOLE + 200)
            self.assertEqual(report["obscurity_burn"]["status"], "SINGLE-USE BURN VERIFIED")
            self.assertTrue(report["obscurity_reuse_refused"])
            self.assertEqual(report["expansions"], 0)
            self.assertEqual(report["pruned"], 1)
            # Ledger chained, genesis block untouched as first line.
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                blocks = [json.loads(line) for line in f if line.strip()]
            self.assertEqual(len(blocks), len(before) + 1)
            self.assertEqual(blocks[0]["block"], 1)
            self.assertEqual(blocks[-1]["previous_hash"], before[-1]["hash"])
            self.assertEqual(blocks[-1]["hash"], report["hash"])
            self.assertTrue(os.path.exists(report["report_path"]))

    def test_second_pass_is_next_block_not_a_loop(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_genesis(tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                before = [json.loads(line) for line in f if line.strip()]
            first = run_pass(tmp)
            second = run_pass(tmp)
            self.assertEqual(first["block"], before[-1]["block"] + 1)
            self.assertEqual(second["block"], first["block"] + 1)
            self.assertEqual(second["previous_hash"], first["hash"])

    def test_missing_genesis_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(FileNotFoundError):
                run_pass(tmp)


if __name__ == "__main__":
    unittest.main()
