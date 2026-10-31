"""Tests for think_token: dispersion to all 32 agencies, dialog records."""

import json
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from halex_1000_5 import UNITS_PER_WHOLE  # noqa: E402
from think_token import run_think  # noqa: E402


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


class TestThinkToken(unittest.TestCase):
    def test_think_dispersion(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_genesis(tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                before = [json.loads(line) for line in f if line.strip()]
            report = run_think(tmp)
            self.assertEqual(report["block"], before[-1]["block"] + 1)
            self.assertEqual(report["token_total_units"], UNITS_PER_WHOLE + 100)
            self.assertEqual(report["agencies_dispersed"], 32)
            self.assertEqual(report["source_retained_units"], 1)
            self.assertEqual(report["agencies_instructed"], 32)
            self.assertEqual(report["dialog_entries"], 32)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                blocks = [json.loads(line) for line in f if line.strip()]
            self.assertEqual(blocks[-1]["hash"], report["hash"])
            self.assertEqual(blocks[-1]["previous_hash"], before[-1]["hash"])
            self.assertEqual(blocks[-1]["token_identifier"], "think")
            self.assertEqual(len(blocks[-1]["dispersion"]), 32)
            self.assertEqual(len(json.load(open(os.path.join(tmp, "agencies.json")))), 32)

    def test_missing_genesis_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(FileNotFoundError):
                run_think(tmp)


if __name__ == "__main__":
    unittest.main()
