import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import synthesizer
from halex_ai_selfbuild.expert_registry import ExpertRegistry


class TestExpertRegistry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.registry = ExpertRegistry(self.base / "registry.json")
        self.text_mod = self.base / "textmod.py"
        self.text_mod.write_text("def count_words(t):\n    return len(t.split())\n")
        self.record_mod = self.base / "recmod.py"
        self.record_mod.write_text("def f(rs):\n    return rs\n")

    def tearDown(self):
        self.tmp.cleanup()

    def _register_both(self):
        r1 = self.registry.register("text_stats", self.text_mod,
                                    ["text statistics", "count words"])
        r2 = self.registry.register("record_tools", self.record_mod,
                                    ["record filtering", "filter records"])
        self.assertEqual(r1["status"], "REGISTERED", r1)
        self.assertEqual(r2["status"], "REGISTERED", r2)

    def test_routing_picks_right_expert(self):
        self._register_both()
        self.assertEqual(self.registry.route("please count words in this text")["name"],
                         "text_stats")
        self.assertEqual(self.registry.route("filter records by key")["name"],
                         "record_tools")
        self.assertIsNone(self.registry.route("quantum chromodynamics lecture"))

    def test_weight_moves_with_measured_outcomes(self):
        self._register_both()
        start = self.registry.get("text_stats")["weight"]
        self.assertEqual(start, 1.0)
        for _ in range(3):
            self.registry.route("count words")
            self.registry.record_outcome("text_stats", True)
        up = self.registry.get("text_stats")["weight"]
        self.assertGreater(up, start)
        for _ in range(6):
            self.registry.route("count words")
            self.registry.record_outcome("text_stats", False)
        down = self.registry.get("text_stats")["weight"]
        self.assertLess(down, up)
        self.assertGreaterEqual(down, 0.5)
        self.assertLessEqual(down, 2.0)

    def test_registration_refused_for_missing_or_broken_module(self):
        missing = self.registry.register("ghost", self.base / "nope.py", ["x"])
        self.assertEqual(missing["status"], "REFUSED")
        broken = self.base / "broken.py"
        broken.write_text("def nope(:\n")
        refused = self.registry.register("broken", broken, ["x"])
        self.assertEqual(refused["status"], "REFUSED")
        self.assertIsNone(self.registry.get("ghost"))
        self.assertIsNone(self.registry.get("broken"))

    def test_synthesized_module_registers_and_routes_end_to_end(self):
        """Genuine pool expansion: synthesize -> register -> route."""
        out = self.base / "gen"
        spec = {"name": "word_counter", "purpose": "Count words",
                "operations": ["count_words", "unique_words"],
                "capabilities": ["word counting", "count words"]}
        result = synthesizer.synthesize(spec, out)
        self.assertEqual(result["status"], "SYNTHESIZED", result)
        reg = self.registry.register("word_counter", result["module_path"],
                                     spec["capabilities"])
        self.assertEqual(reg["status"], "REGISTERED", reg)
        routed = self.registry.route("count words in this sentence please")
        self.assertIsNotNone(routed)
        self.assertEqual(routed["name"], "word_counter")


if __name__ == "__main__":
    unittest.main()
