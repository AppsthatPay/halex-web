"""Tests for brainchain_qa and chain_engine: record Q&A + bounded cycle."""

import json
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from brainchain_qa import answer_question  # noqa: E402
from chain_engine import cycle, status  # noqa: E402


def _copy_state(tmp):
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


class TestChainEngineQa(unittest.TestCase):
    def test_qa_think_and_miss(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_state(tmp)
            think = answer_question("What is token think?", tmp)
            self.assertEqual(think["status"], "ANSWERED")
            self.assertIn("think", think["answer"])
            miss = answer_question("What is the price of Bitcoin today?", tmp)
            self.assertEqual(miss["status"], "MISS")
            count = answer_question("How many agencies are in the first cube?", tmp)
            self.assertIn("32", count["answer"])

    def test_qa_does_not_write_ledger(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_state(tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                before = f.read()
            answer_question("What is token think?", tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                after = f.read()
            self.assertEqual(before, after)

    def test_engine_cycle_and_status(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_state(tmp)
            before_status = status(tmp)
            result = cycle(tmp)
            self.assertEqual(result["block"], before_status["last_block"] + 1)
            self.assertEqual(result["agencies_instructed"], 32)
            after_status = status(tmp)
            self.assertEqual(after_status["blocks"], before_status["blocks"] + 1)
            self.assertEqual(after_status["last_hash"], result["hash"])


if __name__ == "__main__":
    unittest.main()
