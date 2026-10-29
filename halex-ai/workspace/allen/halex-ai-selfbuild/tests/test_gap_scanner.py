import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import gap_scanner

PASSING_TEST = '''
import unittest


class TestOk(unittest.TestCase):
    def test_ok(self):
        self.assertEqual(1 + 1, 2)


if __name__ == "__main__":
    unittest.main()
'''

FAILING_TEST = '''
import unittest


class TestBad(unittest.TestCase):
    def test_bad(self):
        self.assertEqual(1 + 1, 3)


if __name__ == "__main__":
    unittest.main()
'''


def build_fixture(root: Path, clean=False):
    (root / "alpha.py").write_text('"""Alpha module."""\n\n\ndef a():\n    return 1\n')
    (root / "test_alpha.py").write_text(PASSING_TEST)
    if clean:
        return
    # planted untested module
    (root / "lonely.py").write_text('"""No tests exist for me."""\n')
    # planted failing test
    (root / "broken.py").write_text('"""Broken module."""\n')
    (root / "test_broken.py").write_text(FAILING_TEST)
    # planted unverified claim: status string, no evidence configured
    (root / "claimy.py").write_text(
        '"""Claimy module."""\n\n\n'
        'def run():\n'
        '    return "MEDIA_OPERATION_DISPATCHED"\n'
    )
    (root / "test_claimy.py").write_text(PASSING_TEST)


class TestGapScanner(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.tmp.cleanup()

    def test_finds_all_three_planted_gaps(self):
        build_fixture(self.root)
        gaps = gap_scanner.scan(self.root)
        by_kind_target = {(g["kind"], g["target"]) for g in gaps}
        self.assertIn(("UNTESTED_MODULE", "lonely"), by_kind_target)
        self.assertIn(("FAILING_TEST", "broken"), by_kind_target)
        self.assertIn(("UNVERIFIED_CLAIM", "claimy"), by_kind_target)
        # evidence must be substantive, not empty strings
        for gap in gaps:
            self.assertTrue(gap["evidence"])
            self.assertIn("severity", gap)
            self.assertIn("suggested_spec", gap)
        # ranked: failing test outranks untested module
        kinds = [g["kind"] for g in gaps]
        self.assertLess(kinds.index("FAILING_TEST"), kinds.index("UNTESTED_MODULE"))

    def test_clean_fixture_yields_zero_gaps(self):
        build_fixture(self.root, clean=True)
        gaps = gap_scanner.scan(self.root)
        self.assertEqual(gaps, [])

    def test_claim_with_real_evidence_is_not_flagged(self):
        build_fixture(self.root, clean=True)
        (self.root / "claimy.py").write_text('"""Status: JOB EXECUTED daily."""\n')
        (self.root / "test_claimy.py").write_text(PASSING_TEST)
        evidence_log = Path(self.tmp.name) / "evidence.log"
        evidence_log.write_text("2026-10-29 job ran\n")
        gaps = gap_scanner.scan(
            self.root, evidence_config={"claimy": [str(evidence_log)]})
        self.assertEqual([g for g in gaps if g["kind"] == "UNVERIFIED_CLAIM"], [])
        # and without evidence it IS flagged
        gaps2 = gap_scanner.scan(self.root)
        self.assertIn(("UNVERIFIED_CLAIM", "claimy"),
                      {(g["kind"], g["target"]) for g in gaps2})

    def test_open_backlog_json_and_md(self):
        build_fixture(self.root, clean=True)
        backlog = Path(self.tmp.name) / "backlog"
        backlog.mkdir()
        spec = {"name": "word_counter", "purpose": "count words",
                "operations": ["count_words"], "capabilities": ["word counting"]}
        (backlog / "gap1.json").write_text(json.dumps(
            {"status": "open", "target": "word_counter", "spec": spec}))
        (backlog / "closed.json").write_text(json.dumps({"status": "closed"}))
        (backlog / "note.md").write_text("# Do a thing\n\nstatus: open\n")
        gaps = gap_scanner.scan(self.root, backlog_dir=backlog)
        open_gaps = [g for g in gaps if g["kind"] == "OPEN_BACKLOG"]
        self.assertEqual(len(open_gaps), 2)
        json_gap = next(g for g in open_gaps if g["target"] == "word_counter")
        self.assertEqual(json_gap["suggested_spec"], spec)


if __name__ == "__main__":
    unittest.main()
