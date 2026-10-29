"""Integration test: a GENERATED seed package, executed for real.

Seed Marker: ZINIUM-SEED-ALLEN (test).

The generated zinium_seed_hook.py is run as a subprocess inside a temp
directory, exactly as a host stack would run it: observe a file, verify
the chain from the CLI, tamper with the log and watch verification fail.
Then the coordinator ingests the block, dedupes it, and rejects an
unregistered agency. This is the end-to-end evidence that the seed is
working software and not an empty marker.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from zinium_seed_hook import SeedCoordinator, generate_seed_package
from zinium_seed_hook import zinium_seed_hook as hook


class TestGeneratedSeedEndToEnd(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.pkg_dir = os.path.join(self.tmp.name, "planted-seed")
        generate_seed_package(self.pkg_dir, "GEMINI", seed_id="SEED-GEMINI")
        self.data = os.path.join(self.tmp.name, "data.txt")
        with open(self.data, "w", encoding="utf-8") as handle:
            handle.write("host stack output, public-safe")
        self.log = os.path.join(self.tmp.name, "seed-log.jsonl")
        self.hook_py = os.path.join(self.pkg_dir, "zinium_seed_hook.py")
        self.manifest = os.path.join(self.pkg_dir, "zinium-seed.json")

    def _run_cli(self, *args):
        return subprocess.run([sys.executable, self.hook_py, *args],
                              capture_output=True, text=True, timeout=60)

    def test_generated_hook_observe_verify_tamper(self):
        observed = self._run_cli("observe", self.data, "--manifest", self.manifest, "--log", self.log)
        self.assertEqual(observed.returncode, 0, observed.stderr)
        summary = json.loads(observed.stdout)
        self.assertEqual(summary["status"], "OBSERVATION_APPENDED")
        self.assertEqual(summary["file_count"], 1)

        verified = self._run_cli("verify", "--log", self.log)
        self.assertEqual(verified.returncode, 0, verified.stderr)
        self.assertTrue(json.loads(verified.stdout)["valid"])

        with open(self.log, "r", encoding="utf-8") as handle:
            block = json.loads(handle.read())
        block["envelope"]["observation"]["file_count"] = 42
        with open(self.log, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(block, sort_keys=True) + "\n")
        tampered = self._run_cli("verify", "--log", self.log)
        self.assertEqual(tampered.returncode, 1)
        self.assertFalse(json.loads(tampered.stdout)["valid"])

    def test_coordinator_ingest_dedupe_and_unregistered_rejection(self):
        observed = self._run_cli("observe", self.data, "--manifest", self.manifest, "--log", self.log)
        self.assertEqual(observed.returncode, 0, observed.stderr)
        blocks = hook.read_log(self.log)
        coordinator = SeedCoordinator()
        first = coordinator.ingest_block(blocks[0])
        self.assertEqual(first["status"], "INGESTED")
        self.assertEqual(first["agency"], "GEMINI")
        self.assertEqual(coordinator.ingest_block(blocks[0])["status"], "DUPLICATE_IGNORED")

        stranger_dir = os.path.join(self.tmp.name, "stranger-seed")
        generate_seed_package(stranger_dir, "ALLEN", seed_id="SEED-ALLEN")
        with open(os.path.join(stranger_dir, "zinium-seed.json"), "r", encoding="utf-8") as handle:
            stranger_manifest = json.load(handle)
        stranger_manifest["seed_marker"] = "ZINIUM-SEED-UNREGISTERED"
        envelope = hook.observe_paths(stranger_manifest, [self.data], base_dir=self.tmp.name)
        stranger_log = os.path.join(self.tmp.name, "stranger-log.jsonl")
        block = hook.append_observation(stranger_log, envelope)
        rejected = coordinator.ingest_block(block)
        self.assertEqual(rejected["status"], "REJECTED")
        self.assertIn("not registered", rejected["reason"])

    def test_spawned_subseed_outranks_parent_by_generation(self):
        spawned = self._run_cli("spawn", "--manifest", self.manifest, "--number", "3",
                                "--purpose", "docs branch")
        self.assertEqual(spawned.returncode, 0, spawned.stderr)
        child = json.loads(spawned.stdout)
        self.assertEqual(child["seed_id"], "SEED-GEMINI.3")
        self.assertEqual(child["generation"], 2)
        self.assertEqual(child["lineage"], ["SEED-GEMINI", "SEED-GEMINI.3"])


if __name__ == "__main__":
    unittest.main()
