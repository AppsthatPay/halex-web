import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import seal


class TestSeal(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.log = Path(self.tmp.name) / "chain.jsonl"

    def tearDown(self):
        self.tmp.cleanup()

    def test_append_and_verify(self):
        e1 = seal.append_entry(self.log, {"event": "a"}, "ZINIUM-SEED-ALLEN")
        e2 = seal.append_entry(self.log, {"event": "b"}, "ZINIUM-SEED-GEMINI")
        self.assertEqual(e1["prev_hash"], "GENESIS")
        self.assertEqual(e2["prev_hash"], e1["entry_hash"])
        ok, errors, count = seal.verify_chain(self.log)
        self.assertTrue(ok, errors)
        self.assertEqual(count, 2)

    def test_tamper_detected(self):
        seal.append_entry(self.log, {"event": "original"}, "ZINIUM-SEED-ALLEN")
        seal.append_entry(self.log, {"event": "second"}, "ZINIUM-SEED-ALLEN")
        lines = self.log.read_text(encoding="utf-8").splitlines()
        entry = json.loads(lines[0])
        entry["payload"]["event"] = "forged"
        lines[0] = json.dumps(entry, sort_keys=True)
        self.log.write_text("\n".join(lines) + "\n", encoding="utf-8")
        ok, errors, _ = seal.verify_chain(self.log)
        self.assertFalse(ok)
        self.assertTrue(any("entry_hash mismatch" in e for e in errors))

    def test_empty_log_verifies(self):
        ok, errors, count = seal.verify_chain(self.log)
        self.assertTrue(ok)
        self.assertEqual(count, 0)


if __name__ == "__main__":
    unittest.main()
