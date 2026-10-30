#!/usr/bin/env python3
"""Schema validation for the HALEX-AI fauna encyclopedia seed pack.

Stdlib only. Run: python3 tests/test_fauna_pack.py
Gate: every record must satisfy the schema in fauna/DESIGN.md, every
factual field must be a non-empty string or exactly NOT READ, every
record must carry provenance and conversation hooks, and no record may
claim images it does not have or present the pack as finished.
"""
import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
PACK_PATH = os.path.join(HERE, "..", "pack_fauna_v1.json")

REQUIRED_FIELDS = [
    "id", "common_name", "scientific_name", "group", "taxonomy",
    "appearance", "tracks_sign", "range", "habitat", "subspecies",
    "behavior", "diet", "reproduction", "conservation_status",
    "conservation_note", "conversation_hooks", "images", "provenance",
]
TAXONOMY_RANKS = [
    "kingdom", "phylum", "class", "order", "family", "genus", "species",
]
GROUPS = {"mammal", "bird", "fish", "insect", "reptile", "amphibian"}
NOT_READ = "NOT READ"
# Phrases that would misrepresent a growing intake pack as finished.
BANNED_PHRASES = ["all species", "complete encyclopedia", "every known species"]


def load_pack():
    with open(PACK_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def is_fact(value):
    """A fact field is either a real non-empty string or NOT READ."""
    return isinstance(value, str) and (value == NOT_READ or value.strip() != "")


class TestFaunaPack(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = load_pack()
        cls.records = cls.pack["records"]
        cls.by_id = {r["id"]: r for r in cls.records}

    def test_pack_shape(self):
        self.assertEqual(self.pack["pack_id"], "fauna-v1")
        self.assertIsInstance(self.records, list)
        self.assertGreaterEqual(len(self.records), 5)

    def test_group_coverage(self):
        groups = {r["group"] for r in self.records}
        for needed in ("mammal", "bird", "fish", "insect"):
            self.assertIn(needed, groups)

    def test_unique_ids_and_names(self):
        ids = [r["id"] for r in self.records]
        self.assertEqual(len(ids), len(set(ids)))
        names = [r["scientific_name"] for r in self.records]
        self.assertEqual(len(names), len(set(names)))

    def test_required_fields_present(self):
        for rec in self.records:
            for field in REQUIRED_FIELDS:
                self.assertIn(field, rec, f"{rec.get('id')}: missing {field}")

    def test_group_values_valid(self):
        for rec in self.records:
            self.assertIn(rec["group"], GROUPS)

    def test_taxonomy_ranks(self):
        for rec in self.records:
            tax = rec["taxonomy"]
            for rank in TAXONOMY_RANKS:
                self.assertIn(rank, tax)
                self.assertTrue(is_fact(tax[rank]),
                                f"{rec['id']}: taxonomy.{rank} empty")

    def test_fact_fields(self):
        for rec in self.records:
            for field in ("tracks_sign", "habitat", "behavior", "diet",
                          "reproduction", "conservation_status",
                          "conservation_note"):
                self.assertTrue(is_fact(rec[field]),
                                f"{rec['id']}: {field} empty")
            app = rec["appearance"]
            self.assertTrue(is_fact(app["summary"]))
            self.assertTrue(is_fact(app["size"]))
            self.assertTrue(is_fact(app["weight"]))

    def test_range_shape(self):
        for rec in self.records:
            regions = rec["range"]["regions"]
            self.assertIsInstance(regions, list)
            self.assertGreaterEqual(len(regions), 1)
            for region in regions:
                self.assertTrue(is_fact(region))

    def test_subspecies_shape(self):
        for rec in self.records:
            sub = rec["subspecies"]
            self.assertIn(sub["status"], ("listed", NOT_READ))
            self.assertIsInstance(sub["names"], list)
            if sub["status"] == "listed":
                self.assertGreaterEqual(len(sub["names"]), 1)
            self.assertTrue(is_fact(sub["note"]))

    def test_conversation_hooks(self):
        for rec in self.records:
            hooks = rec["conversation_hooks"]
            self.assertGreaterEqual(len(hooks), 3,
                                    f"{rec['id']}: fewer than 3 hooks")
            hook_ids = [h["id"] for h in hooks]
            self.assertEqual(len(hook_ids), len(set(hook_ids)))
            for hook in hooks:
                self.assertTrue(is_fact(hook["thread"]))
                self.assertTrue(is_fact(hook["prompt"]))
                self.assertIsInstance(hook["follow_ups"], list)
                self.assertGreaterEqual(len(hook["follow_ups"]), 2)

    def test_provenance(self):
        for rec in self.records:
            prov = rec["provenance"]
            self.assertGreaterEqual(len(prov), 1)
            for entry in prov:
                self.assertTrue(is_fact(entry["source"]))
                self.assertTrue(entry["url"].startswith("http"),
                                f"{rec['id']}: provenance url not http(s)")
                self.assertTrue(is_fact(entry["accessed"]))
                self.assertTrue(is_fact(entry["supports"]))

    def test_images_never_claimed(self):
        for rec in self.records:
            self.assertEqual(rec["images"]["status"], NOT_READ)
            self.assertEqual(rec["images"]["files"], [])

    def test_no_finished_encyclopedia_claims(self):
        text = json.dumps(self.pack).lower()
        for phrase in BANNED_PHRASES:
            self.assertNotIn(phrase, text, f"banned phrase: {phrase}")
        self.assertNotIn("complete", self.pack.get("status", "").lower())

    def test_no_forbidden_code_markers(self):
        # The pack is data, not code: it must not smuggle network,
        # wallet, signing, or payment constructs.
        text = json.dumps(self.pack)
        for marker in ("private_key", "seed phrase", "wallet_key",
                       "socket", "subprocess", "os.system", "eval("):
            self.assertNotIn(marker, text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
