import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import cycle, seal
from halex_ai_selfbuild.expert_registry import ExpertRegistry

PASSING_TEST = '''
import unittest


class TestOk(unittest.TestCase):
    def test_ok(self):
        self.assertTrue(True)


if __name__ == "__main__":
    unittest.main()
'''

SPEC = {"name": "word_counter", "purpose": "Count words in text",
        "operations": ["count_words", "unique_words"],
        "capabilities": ["word counting", "count words"]}


class TestCycle(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.root = self.base / "tree"
        self.root.mkdir()
        (self.root / "alpha.py").write_text('"""Alpha."""\n')
        (self.root / "test_alpha.py").write_text(PASSING_TEST)
        self.backlog = self.base / "backlog"
        self.backlog.mkdir()
        (self.backlog / "gap.json").write_text(json.dumps(
            {"status": "open", "target": "word_counter", "spec": SPEC}))
        self.mirror = self.base / "mirror"
        self.mirror.mkdir()
        (self.mirror / "README.md").write_text("# Mirror Title\n")
        self.work = self.base / "work"

    def tearDown(self):
        self.tmp.cleanup()

    def test_full_cycle_report_matches_reality(self):
        report = cycle.run_cycle(self.root, backlog_dir=self.backlog,
                                 mirrors=[self.mirror], work_dir=self.work)
        # report claims, each verified against the files actually produced
        self.assertEqual(report["gap_count"], 1)
        self.assertEqual(report["gaps_found"][0]["kind"], "OPEN_BACKLOG")
        syn = report["synthesis"]
        self.assertIsNotNone(syn)
        self.assertEqual(syn["status"], "SYNTHESIZED")
        module_path = Path(syn["module_path"])
        self.assertTrue(module_path.is_file())
        # proposal lands under proposals/, NOT in the scanned tree
        self.assertIn("proposals", str(module_path))
        self.assertFalse((self.root / "word_counter.py").exists())
        self.assertTrue(Path(syn["test_path"]).is_file())
        self.assertEqual(report["registration"]["status"], "REGISTERED")
        self.assertEqual(report["forage"]["indexed"], 1)
        # seal chain: 1 synthesis entry + 1 forage entry, and it verifies
        self.assertEqual(report["seal_chain"]["entries"], 2)
        self.assertTrue(report["seal_chain"]["verified"])
        ok, errors, _ = seal.verify_chain(self.work / "seal-log.jsonl")
        self.assertTrue(ok, errors)
        entries = seal.read_entries(self.work / "seal-log.jsonl")
        events = [e["payload"].get("event") for e in entries]
        self.assertEqual(events, ["synthesis_attempt", "forage_index"])
        # registered expert actually routes
        registry = ExpertRegistry(self.work / "expert-registry.json")
        self.assertEqual(registry.route("count words now")["name"], "word_counter")
        # report files exist and the JSON on disk matches the returned report
        self.assertTrue(Path(report["report_markdown"]).is_file())
        on_disk = json.loads(Path(report["report_json"]).read_text(encoding="utf-8"))
        self.assertEqual(on_disk["synthesis"]["status"], "SYNTHESIZED")
        md = Path(report["report_markdown"]).read_text(encoding="utf-8")
        self.assertIn("word_counter", md)
        self.assertIn("OPEN_BACKLOG", md)

    def test_relative_paths_work(self):
        """Regression: components execute tests in subprocesses with a
        changed cwd, so relative input paths must be resolved first.
        (A relative-path smoke run once produced a phantom FAILING_TEST
        and a phantom TESTS_FAILED for a healthy module.)"""
        old_cwd = os.getcwd()
        os.chdir(self.base)
        try:
            report = cycle.run_cycle("tree", backlog_dir="backlog",
                                     mirrors=["mirror"], work_dir="workrel")
        finally:
            os.chdir(old_cwd)
        self.assertEqual(report["gap_count"], 1)
        self.assertEqual(report["synthesis"]["status"], "SYNTHESIZED")
        self.assertTrue(report["seal_chain"]["verified"])

    def test_dry_run_scans_and_forages_but_builds_nothing(self):
        report = cycle.run_cycle(self.root, backlog_dir=self.backlog,
                                 mirrors=[self.mirror], work_dir=self.work,
                                 dry_run=True)
        self.assertEqual(report["gap_count"], 1)
        self.assertIsNone(report["synthesis"])
        self.assertEqual(report["forage"]["indexed"], 1)
        self.assertFalse((self.work / "proposals" / "word_counter").exists())
        # only the forage entry is sealed
        self.assertEqual(report["seal_chain"]["entries"], 1)


if __name__ == "__main__":
    unittest.main()
