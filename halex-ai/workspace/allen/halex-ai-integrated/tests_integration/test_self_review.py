"""Integration test: the self-review pass writes records and changes
no source file. Seed Marker: ZINIUM-SEED-ALLEN (test).

The integrated tree is copied to a temp directory; every source file in
the copy is hashed before the pass; the pass runs against the copy (and
the real staged tree, read-only); afterwards every source hash must be
identical, and the review records must exist inside the copy's
self-reviews folder. A nesting guard prevents the pass's own suite run
from re-entering this test.
"""

import hashlib
import os
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import self_review

TREE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGED = os.path.expanduser("~/workspace/halex-public-data/halex-ai/workspace/gemini/halex-ai-suite")
GATE_REPORT = os.path.expanduser(
    "~/workspace/goals/halex-app-review-and-reorg/hidden_files/gemini-modules-10-14-gate-20261029.md")
_NESTED_ENV = "HALEX_AI_SELF_REVIEW_NESTED"


def _source_hashes(root):
    hashes = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("__pycache__", "self-reviews")]
        for name in filenames:
            if name.endswith((".py", ".md", ".json")):
                full = os.path.join(dirpath, name)
                with open(full, "rb") as handle:
                    hashes[os.path.relpath(full, root)] = hashlib.sha256(handle.read()).hexdigest()
    return hashes


class TestSelfReviewPass(unittest.TestCase):
    def test_pass_writes_records_and_changes_no_source_file(self):
        if os.environ.get(_NESTED_ENV) == "1":
            self.skipTest("nested inside a self-review suite run")
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        copy_root = os.path.join(tmp.name, "tree")
        shutil.copytree(TREE_ROOT, copy_root,
                        ignore=shutil.ignore_patterns("__pycache__", "self-reviews"))
        before = _source_hashes(copy_root)

        os.environ[_NESTED_ENV] = "1"
        try:
            record = self_review.run_review(copy_root, STAGED, GATE_REPORT)
        finally:
            os.environ.pop(_NESTED_ENV, None)

        after = _source_hashes(copy_root)
        self.assertEqual(before, after, "self-review modified a source file")

        out_dir = os.path.join(copy_root, "self-reviews")
        written = os.listdir(out_dir)
        self.assertTrue(any(name.startswith("review-") and name.endswith(".json") for name in written))
        self.assertTrue(any(name.startswith("review-") and name.endswith(".md") for name in written))
        self.assertIn("quarantine-baseline.json", written)
        self.assertTrue(record["drift"]["quarantine_baseline_created_this_pass"])
        self.assertGreater(record["tests"]["integrated"]["total_tests"], 0)
        self.assertGreater(record["tests"]["staged"]["total_tests"], 0)
        self.assertGreater(len(record["status_claim_review_items"]), 0)
        for item in record["status_claim_review_items"]:
            self.assertIn("not a verdict", item["note"])
        if record["proposals"]:
            with open(os.path.join(out_dir, "PROPOSALS.md"), "r", encoding="utf-8") as handle:
                proposals_text = handle.read()
            self.assertIn("requires Allen gate review, never auto-applied", proposals_text)


if __name__ == "__main__":
    unittest.main()
