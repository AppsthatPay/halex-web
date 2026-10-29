"""Tests for the ZINIUM seed hook package. Seed Marker: ZINIUM-SEED-ALLEN.

Covered: agency registry (ALLEN and GEMINI in, unregistered markers out),
seed package generation (real files, hook copied byte for byte), observe
hashing, hash-chain append and recompute verification, tamper detection,
subseed generation and ranking, request/receive matching, the secret
guard, and coordinator ingest with dedupe.
"""

import hashlib
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from zinium_seed_hook import (
    registry,
    generate_seed_package,
    SeedCoordinator,
)
from zinium_seed_hook import zinium_seed_hook as hook


class TestRegistry(unittest.TestCase):
    def test_allen_and_gemini_registered(self):
        data = registry.load_registry()
        self.assertEqual(registry.get_agency(data, "ALLEN")["seed_marker"], "ZINIUM-SEED-ALLEN")
        self.assertEqual(registry.get_agency(data, "GEMINI")["seed_marker"], "ZINIUM-SEED-GEMINI")
        self.assertTrue(registry.is_registered_marker(data, "ZINIUM-SEED-GEMINI"))

    def test_unregistered_marker_not_accepted(self):
        data = registry.load_registry()
        self.assertFalse(registry.is_registered_marker(data, "ZINIUM-SEED-GROK"))
        self.assertIsNone(registry.agency_for_seed_marker(data, "ZINIUM-SEED-GROK"))


class TestHookAndCoordinator(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.pkg = generate_seed_package(os.path.join(self.tmp.name, "seedpkg"), "ALLEN")
        self.manifest = self.pkg["manifest"]
        self.log = os.path.join(self.tmp.name, "seed-log.jsonl")
        data_file = os.path.join(self.tmp.name, "note.txt")
        with open(data_file, "w", encoding="utf-8") as handle:
            handle.write("hello seed")
        self.data_file = data_file

    def test_package_contains_real_hook(self):
        for name in ("zinium-seed.json", "SEED.md", "zinium_seed_hook.py"):
            self.assertTrue(os.path.isfile(os.path.join(self.pkg["path"], name)))
        canonical = os.path.join(os.path.dirname(hook.__file__), "zinium_seed_hook.py")
        with open(canonical, "rb") as a, open(os.path.join(self.pkg["path"], "zinium_seed_hook.py"), "rb") as b:
            self.assertEqual(a.read(), b.read())
        self.assertEqual(self.manifest["seed_id"], "SEED-ALLEN")
        self.assertEqual(self.manifest["generation"], 1)
        self.assertEqual(self.manifest["seed_marker"], "ZINIUM-SEED-ALLEN")

    def test_observe_hashes_and_chain_verifies(self):
        envelope = hook.observe_paths(self.manifest, [self.data_file], base_dir=self.tmp.name)
        record = envelope["observation"]["files"][0]
        self.assertEqual(record["sha256"], hashlib.sha256(b"hello seed").hexdigest())
        hook.append_observation(self.log, envelope)
        result = hook.verify_log(self.log)
        self.assertTrue(result["valid"])
        self.assertEqual(result["blocks_checked"], 1)

    def test_tamper_is_detected_by_recompute(self):
        envelope = hook.observe_paths(self.manifest, [self.data_file], base_dir=self.tmp.name)
        hook.append_observation(self.log, envelope)
        with open(self.log, "r", encoding="utf-8") as handle:
            block = json.loads(handle.read())
        block["envelope"]["observation"]["files"][0]["sha256"] = "0" * 64
        with open(self.log, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(block, sort_keys=True) + "\n")
        result = hook.verify_log(self.log)
        self.assertFalse(result["valid"])
        self.assertEqual(result["first_invalid_seq"], 0)

    def test_subseed_generation_and_ranking(self):
        child = hook.spawn_subseed(self.manifest, 1, "reach a branch")
        self.assertEqual(child["seed_id"], "SEED-ALLEN.1")
        self.assertEqual(child["generation"], 2)
        self.assertEqual(child["parent_seed"], "SEED-ALLEN")
        self.assertEqual(hook.lineage(child["seed_id"]), ["SEED-ALLEN", "SEED-ALLEN.1"])
        self.assertGreater(hook.rank_key(child), hook.rank_key(self.manifest))
        grandchild = hook.spawn_subseed(child, 2)
        self.assertEqual(grandchild["seed_id"], "SEED-ALLEN.1.2")
        self.assertEqual(grandchild["generation"], 3)

    def test_request_and_receive_roundtrip(self):
        request = hook.request_computation(self.manifest, "summarize the note")
        hook.append_observation(self.log, request)
        result_envelope = {
            "kind": "computation_result",
            "in_reply_to": request["envelope_id"],
            "seed_marker": "ZINIUM-SEED-GEMINI",
            "provenance": {"source": "SEED-GEMINI", "host": "testhost", "timestamp": hook.utcnow()},
            "result": {"summary": "a short note"},
        }
        accepted = hook.receive_result(self.manifest, self.log, result_envelope)
        self.assertEqual(accepted["status"], "RESULT_ACCEPTED")
        orphan = dict(result_envelope, in_reply_to="deadbeefdeadbeef")
        rejected = hook.receive_result(self.manifest, self.log, orphan)
        self.assertEqual(rejected["status"], "REJECTED")

    def test_secret_fields_refused(self):
        with self.assertRaises(ValueError):
            hook.request_computation(self.manifest, "task", {"api_key": "nope"})

    def test_coordinator_ingest_dedupe_and_rejections(self):
        coordinator = SeedCoordinator()
        envelope = hook.observe_paths(self.manifest, [self.data_file], base_dir=self.tmp.name)
        block = hook.append_observation(self.log, envelope)
        first = coordinator.ingest_block(block)
        self.assertEqual(first["status"], "INGESTED")
        self.assertEqual(first["agency"], "ALLEN")
        second = coordinator.ingest_block(block)
        self.assertEqual(second["status"], "DUPLICATE_IGNORED")
        self.assertTrue(coordinator.verify_index()["valid"])

        grok_manifest = dict(self.manifest, seed_marker="ZINIUM-SEED-GROK", seed_id="SEED-GROK")
        grok_envelope = hook.observe_paths(grok_manifest, [self.data_file], base_dir=self.tmp.name)
        grok_log = os.path.join(self.tmp.name, "grok-log.jsonl")
        grok_block = hook.append_observation(grok_log, grok_envelope)
        rejected = coordinator.ingest_block(grok_block)
        self.assertEqual(rejected["status"], "REJECTED")
        self.assertIn("not registered", rejected["reason"])

        tampered = json.loads(json.dumps(block))
        tampered["envelope"]["observation"]["file_count"] = 999
        rejected2 = coordinator.ingest_block(tampered)
        self.assertEqual(rejected2["status"], "REJECTED")
        self.assertIn("does not recompute", rejected2["reason"])


if __name__ == "__main__":
    unittest.main()
