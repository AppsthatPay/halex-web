import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import forager, seal

MARKER = Path("/tmp/FORAGER_EXECUTED_MARKER")


class TestForager(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.mirror = self.base / "mirror"
        self.mirror.mkdir()
        (self.mirror / "README.md").write_text(
            "# Fixture Project\n\nSome text.\n\n## Usage Notes\n")
        (self.mirror / "LICENSE").write_text("MIT License\n")
        (self.mirror / "code.py").write_text(
            "def alpha_fn(x):\n    return x\n\n\n"
            "class BetaThing:\n    pass\n")
        self.log = self.base / "chain.jsonl"
        if MARKER.exists():
            MARKER.unlink()

    def tearDown(self):
        self.tmp.cleanup()
        if MARKER.exists():
            MARKER.unlink()

    def test_indexes_expected_items_with_provenance(self):
        result = forager.forage([self.mirror], self.log)
        # 2 headings + 1 license + 1 function + 1 class = 5
        self.assertEqual(result["indexed"], 5, result)
        contents = {(i["item"]["kind"], i["item"]["content"]) for i in result["items"]}
        self.assertIn(("heading", "Fixture Project"), contents)
        self.assertIn(("heading", "Usage Notes"), contents)
        self.assertIn(("license", "LICENSE"), contents)
        self.assertIn(("function", "alpha_fn"), contents)
        self.assertIn(("class", "BetaThing"), contents)
        for item in result["items"]:
            prov = item["item"]["source_path"]
            self.assertIn(str(self.mirror), prov)
            self.assertIn("orli", item)
            for field in ("observe", "report", "learn", "index"):
                self.assertIn(field, item["orli"])
        ok, errors, count = seal.verify_chain(self.log)
        self.assertTrue(ok, errors)
        self.assertEqual(count, 5)

    def test_second_run_dedupes_to_zero(self):
        first = forager.forage([self.mirror], self.log)
        self.assertEqual(first["indexed"], 5)
        second = forager.forage([self.mirror], self.log)
        self.assertEqual(second["indexed"], 0)
        self.assertEqual(second["skipped_duplicates"], 5)
        _, _, count = seal.verify_chain(self.log)
        self.assertEqual(count, 5)

    def test_malicious_looking_code_is_indexed_never_run(self):
        payload = (
            "import pathlib\n"
            f"pathlib.Path({str(MARKER)!r}).write_text('pwned')\n\n"
            "def evil_fn():\n    return 1\n"
        )
        (self.mirror / "evil.py").write_text(payload)
        result = forager.forage([self.mirror], self.log)
        self.assertFalse(MARKER.exists(),
                         "forager EXECUTED code from a mirror")
        contents = {(i["item"]["kind"], i["item"]["content"])
                    for i in result["items"]}
        self.assertIn(("function", "evil_fn"), contents)

    def test_missing_mirror_reported(self):
        result = forager.forage([self.base / "does-not-exist"], self.log)
        self.assertEqual(result["indexed"], 0)
        self.assertEqual(len(result["missing"]), 1)


if __name__ == "__main__":
    unittest.main()
