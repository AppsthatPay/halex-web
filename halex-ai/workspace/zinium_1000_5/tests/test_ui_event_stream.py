"""Tests for ui_event_stream: phases, no prompt persistence, no ledger write."""

import json
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ui_event_stream import ask_with_events  # noqa: E402


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


class TestUiEventStream(unittest.TestCase):
    def test_phases_and_no_prompt_in_events(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_state(tmp)
            secret = "SECRET_PROMPT_XYZ_123"
            result = ask_with_events(secret + " What is token think?", tmp)
            phases = [e["phase"] for e in result["events"]]
            self.assertEqual(phases[0], "INTAKE")
            self.assertIn("REASONING", phases)
            self.assertEqual(phases[-1], "OUTPUT")
            self.assertEqual(result["answer"]["status"], "ANSWERED")
            # Prompt text must appear in NO event message.
            joined = " ".join(e["message"] for e in result["events"])
            self.assertNotIn(secret, joined)
            # Ledger untouched.
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                before = f.read()
            ask_with_events("What is token think?", tmp)
            with open(os.path.join(tmp, "ledger.jsonl")) as f:
                after = f.read()
            self.assertEqual(before, after)

    def test_miss_still_has_three_phases(self):
        with tempfile.TemporaryDirectory() as tmp:
            _copy_state(tmp)
            result = ask_with_events("What is the weather today?", tmp)
            self.assertEqual(result["answer"]["status"], "MISS")
            self.assertEqual([e["phase"] for e in result["events"]][0], "INTAKE")
            self.assertEqual([e["phase"] for e in result["events"]][-1], "OUTPUT")


if __name__ == "__main__":
    unittest.main()
