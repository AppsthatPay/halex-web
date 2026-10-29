import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from halex_ai_selfbuild import synthesizer


class TestSynthesizer(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name) / "out"

    def tearDown(self):
        self.tmp.cleanup()

    def test_synthesizes_working_module(self):
        spec = {"name": "record_filter", "purpose": "Filter record dicts",
                "operations": ["filter_records", "count_by"],
                "capabilities": ["record filtering"]}
        result = synthesizer.synthesize(spec, self.out)
        self.assertEqual(result["status"], "SYNTHESIZED", result)
        self.assertTrue(Path(result["module_path"]).is_file())
        self.assertTrue(Path(result["test_path"]).is_file())
        self.assertTrue(Path(result["readme_path"]).is_file())
        # independently import the generated module and check behavior
        sys.path.insert(0, str(self.out))
        try:
            import record_filter
            got = record_filter.filter_records(
                [{"k": "a"}, {"k": "b"}, {"k": "a"}], "k", "a")
            self.assertEqual(got, [{"k": "a"}, {"k": "a"}])
            self.assertEqual(record_filter.count_by(
                [{"t": "x"}, {"t": "x"}], "t"), {"x": 2})
        finally:
            sys.path.pop(0)
            sys.modules.pop("record_filter", None)

    def test_mutation_actually_breaks_generated_tests(self):
        """The anti-Module-24 proof: corrupting the generated module makes
        its generated tests FAIL. If this test ever fails, the synthesizer
        is producing self-certifying tests."""
        spec = {"name": "text_stats", "purpose": "Text statistics",
                "operations": ["count_words", "count_lines"]}
        result = synthesizer.synthesize(spec, self.out)
        self.assertEqual(result["status"], "SYNTHESIZED", result)
        self.assertEqual(result["mutated_operation"], "count_words")
        # reproduce the mutation by hand and run the tests against it
        module_src = Path(result["module_path"]).read_text(encoding="utf-8")
        mutated = synthesizer._mutated_source(module_src, "count_words")
        mut_dir = Path(self.tmp.name) / "mut"
        mut_dir.mkdir()
        (mut_dir / "text_stats.py").write_text(mutated, encoding="utf-8")
        (mut_dir / "test_text_stats.py").write_text(
            Path(result["test_path"]).read_text(encoding="utf-8"),
            encoding="utf-8")
        proc = subprocess.run([sys.executable, str(mut_dir / "test_text_stats.py")],
                              capture_output=True, text=True, cwd=str(mut_dir))
        self.assertNotEqual(proc.returncode, 0,
                            "tests passed against a corrupted module: "
                            "they are self-certifying")
        # and the unmutated tests genuinely pass
        proc2 = subprocess.run([sys.executable, result["test_path"]],
                               capture_output=True, text=True, cwd=str(self.out))
        self.assertEqual(proc2.returncode, 0, proc2.stdout + proc2.stderr)

    def test_generated_tests_assert_behavior_not_status_strings(self):
        spec = {"name": "hasher", "purpose": "Hash text",
                "operations": ["hash_text"]}
        result = synthesizer.synthesize(spec, self.out)
        self.assertEqual(result["status"], "SYNTHESIZED", result)
        test_src = Path(result["test_path"]).read_text(encoding="utf-8")
        self.assertIn("ba7816bf8f01cfea", test_src)  # known SHA-256 of 'abc'
        for word in ("SUCCESS", "VERIFIED", "EXECUTED", "DISPATCHED"):
            self.assertNotIn(word, test_src)

    def test_out_of_vocabulary_is_honest_refusal(self):
        spec = {"name": "moon_lander", "purpose": "Land on the moon",
                "operations": ["teleport_to_moon"]}
        result = synthesizer.synthesize(spec, self.out)
        self.assertEqual(result["status"], "UNSYNTHESIZABLE")
        self.assertIn("teleport_to_moon", result["reason"])
        # no stub module was produced
        self.assertFalse((self.out / "moon_lander.py").exists())

    def test_invalid_name_refused(self):
        result = synthesizer.synthesize(
            {"name": "Not A Module!", "operations": ["count_words"]}, self.out)
        self.assertEqual(result["status"], "UNSYNTHESIZABLE")


if __name__ == "__main__":
    unittest.main()
