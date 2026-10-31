"""Tests for the chain-brain builder adapter.

The adapter must never claim a stored record the memory store
refused, must refuse sensitive content with nothing saved, and
must round-trip a snapshot (save, reload, record still there).
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild.chain_brain_adapter import (
    build_onto_chain_brain, draft_knowledge_from_conversation)

CHAIN_BRAIN_DIR = Path(__file__).resolve().parents[3] / "chain_brain"

CHAIN = {"id": "Chain-01", "name": "Test Chain", "category": "culinary"}
AGENCY = {"agency_id": "ag-01", "category": "culinary", "start": 0, "end": 999}


class TestChainBrainAdapter(unittest.TestCase):
    def test_build_record_and_reload(self):
        with tempfile.TemporaryDirectory() as td:
            snap = Path(td) / "snap.json"
            entry = {"kind": "record", "chain": CHAIN, "agency": AGENCY,
                     "record_id": "rec-01", "category": "culinary",
                     "content": "Appalachian Stew Recipe",
                     "provenance": "ZINIUM-SEED-ALLEN"}
            res = build_onto_chain_brain(CHAIN_BRAIN_DIR, snap, entry)
            self.assertEqual(res["status"], "BUILT")
            self.assertTrue(snap.exists())
            data = json.loads(snap.read_text())
            self.assertEqual(len(data["records"]), 1)
            # Build a second record onto the same snapshot: reload works.
            entry2 = dict(entry, record_id="rec-02", content="Wine Pairing Guide")
            res2 = build_onto_chain_brain(CHAIN_BRAIN_DIR, snap, entry2)
            self.assertEqual(res2["status"], "BUILT")
            self.assertEqual(res2["records_total"], 2)

    def test_sensitive_refused_nothing_saved(self):
        with tempfile.TemporaryDirectory() as td:
            snap = Path(td) / "snap.json"
            entry = {"kind": "record", "chain": CHAIN, "agency": AGENCY,
                     "record_id": "rec-sec", "category": "culinary",
                     "content": "private_key: 0x123456789abcdef"}
            res = build_onto_chain_brain(CHAIN_BRAIN_DIR, snap, entry)
            self.assertEqual(res["status"], "REFUSED_SENSITIVE")
            self.assertFalse(snap.exists())

    def test_build_model_and_blueprint(self):
        with tempfile.TemporaryDirectory() as td:
            snap = Path(td) / "snap.json"
            entry = {"kind": "model", "chain": {"id": "Chain-05", "name": "ML Vault",
                                                "category": "machine_learning"},
                     "agency": {"agency_id": "ag-ml-01", "category": "machine_learning",
                                "start": 0, "end": 999},
                     "model_id": "model-linear-01",
                     "x": [1.0, 2.0, 3.0], "y": [2.0, 4.0, 6.0],
                     "blueprint_cloud": "AWS"}
            res = build_onto_chain_brain(CHAIN_BRAIN_DIR, snap, entry)
            self.assertEqual(res["status"], "BUILT")
            self.assertAlmostEqual(res["model"]["parameters"]["slope"], 2.0)
            self.assertIn("blueprint-", res["blueprint_id"])


    def test_learn_from_conversation_drafts_knowledge_not_message(self):
        with tempfile.TemporaryDirectory() as td:
            snap = Path(td) / "snap.json"
            build_onto_chain_brain(CHAIN_BRAIN_DIR, snap, {
                "kind": "record", "chain": CHAIN, "agency": AGENCY,
                "record_id": "rec-01", "category": "culinary",
                "content": "Appalachian Stew Recipe",
                "provenance": "ZINIUM-SEED-ALLEN"})
            drafts = Path(td) / "drafts"
            res = draft_knowledge_from_conversation(
                CHAIN_BRAIN_DIR, snap,
                "What do you know about Appalachian stew?", drafts)
            self.assertEqual(res["status"], "MATCH")
            self.assertIsNotNone(res["draft_path"])
            draft_text = Path(res["draft_path"]).read_text()
            self.assertIn("Appalachian Stew Recipe", draft_text)
            self.assertNotIn("What do you know", draft_text)


if __name__ == "__main__":
    unittest.main()
