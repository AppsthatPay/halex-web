"""REAL module synthesis from a gap spec, over a SAFE operation vocabulary.

A spec is a dict:
  {
    "name": "record_filter",                # valid snake_case identifier
    "purpose": "Filter record dicts",       # human-readable purpose
    "operations": ["filter_records", ...],  # ONLY vocabulary operations
    "capabilities": ["record filtering"],   # optional, for expert registry
  }

For a synthesizable spec this generates, in the output directory:
  <name>.py          a working module implementing each operation
  test_<name>.py     unittest file asserting BEHAVIOR (computed outputs on
                     known inputs) — never status strings
  <name>.README.md   the README section for the module

It then RUNS the generated tests in a subprocess, and performs a MUTATION
CHECK: the first operation of the generated module is deliberately corrupted
(replaced by a stub returning a sentinel) in a scratch copy, and the same
tests are run against it. If the tests still pass against the broken module,
the tests were self-certifying and the synthesis is REJECTED
(status MUTATION_REJECTED). This is the exact failure Gemini's Module 24
shipped: stubs whose tests assert their own status strings pass no matter
what the code does. Here, that pattern cannot pass the gate.

Out-of-vocabulary or malformed specs return UNSYNTHESIZABLE with a reason.
No stub is ever produced in place of a refusal.
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

MUTATION_SENTINEL = "__MUTATED_SENTINEL__"

# ---------------------------------------------------------------------------
# Operation vocabulary. Each operation: implementation source + behavioral
# test cases as (expression, expected) pairs, evaluated against the module.
# ---------------------------------------------------------------------------
OPERATIONS = {
    "count_words": {
        "signature": "count_words(text: str) -> int",
        "impl": (
            "def count_words(text):\n"
            "    return len(text.split())\n"
        ),
        "cases": [
            ("count_words('hello world')", 2),
            ("count_words('')", 0),
            ("count_words('one  two   three')", 3),
        ],
    },
    "count_lines": {
        "signature": "count_lines(text: str) -> int",
        "impl": (
            "def count_lines(text):\n"
            "    if text == '':\n"
            "        return 0\n"
            "    return len(text.splitlines())\n"
        ),
        "cases": [
            ("count_lines('a\\nb\\nc')", 3),
            ("count_lines('')", 0),
            ("count_lines('single')", 1),
        ],
    },
    "unique_words": {
        "signature": "unique_words(text: str) -> int",
        "impl": (
            "def unique_words(text):\n"
            "    return len(set(text.lower().split()))\n"
        ),
        "cases": [
            ("unique_words('Cat cat dog')", 2),
            ("unique_words('')", 0),
            ("unique_words('a a a b')", 2),
        ],
    },
    "filter_records": {
        "signature": "filter_records(records: list, key: str, value) -> list",
        "impl": (
            "def filter_records(records, key, value):\n"
            "    return [r for r in records if r.get(key) == value]\n"
        ),
        "cases": [
            ("filter_records([{'k': 'a', 'n': 1}, {'k': 'b', 'n': 2}, {'k': 'a', 'n': 3}], 'k', 'a')",
             [{"k": "a", "n": 1}, {"k": "a", "n": 3}]),
            ("filter_records([], 'k', 'a')", []),
            ("filter_records([{'k': 'x'}], 'k', 'zzz')", []),
        ],
    },
    "count_by": {
        "signature": "count_by(records: list, key: str) -> dict",
        "impl": (
            "def count_by(records, key):\n"
            "    out = {}\n"
            "    for r in records:\n"
            "        v = r.get(key)\n"
            "        out[v] = out.get(v, 0) + 1\n"
            "    return out\n"
        ),
        "cases": [
            ("count_by([{'t': 'x'}, {'t': 'y'}, {'t': 'x'}], 't')", {"x": 2, "y": 1}),
            ("count_by([], 't')", {}),
        ],
    },
    "hash_text": {
        "signature": "hash_text(text: str) -> str  (SHA-256 hex digest)",
        "impl": (
            "def hash_text(text):\n"
            "    return hashlib.sha256(text.encode('utf-8')).hexdigest()\n"
        ),
        "cases": [
            ("hash_text('abc')",
             "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
            ("hash_text('')",
             "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
        ],
    },
    "chain_hashes": {
        "signature": "chain_hashes(items: list) -> str  (iterated SHA-256 chain)",
        "impl": (
            "def chain_hashes(items):\n"
            "    h = 'GENESIS'\n"
            "    for item in items:\n"
            "        h = hashlib.sha256((h + '|' + str(item)).encode('utf-8')).hexdigest()\n"
            "    return h\n"
        ),
        "cases": [
            ("chain_hashes([])", "GENESIS"),
            ("chain_hashes(['a']) == chain_hashes(['a'])", True),
            ("chain_hashes(['a']) == chain_hashes(['b'])", False),
            ("len(chain_hashes(['a', 'b']))", 64),
        ],
    },
    "registry_lookup": {
        "signature": "registry_lookup(registry: dict, key: str, default=None)",
        "impl": (
            "def registry_lookup(registry, key, default=None):\n"
            "    return registry.get(key, default)\n"
        ),
        "cases": [
            ("registry_lookup({'a': 1}, 'a')", 1),
            ("registry_lookup({'a': 1}, 'missing')", None),
            ("registry_lookup({}, 'x', default='dflt')", "dflt"),
        ],
    },
    "clamp_number": {
        "signature": "clamp_number(value, lo, hi)",
        "impl": (
            "def clamp_number(value, lo, hi):\n"
            "    return max(lo, min(hi, value))\n"
        ),
        "cases": [
            ("clamp_number(5, 0, 3)", 3),
            ("clamp_number(-2, 0, 3)", 0),
            ("clamp_number(2, 0, 3)", 2),
        ],
    },
    "average": {
        "signature": "average(numbers: list) -> float",
        "impl": (
            "def average(numbers):\n"
            "    if not numbers:\n"
            "        return 0.0\n"
            "    return sum(numbers) / len(numbers)\n"
        ),
        "cases": [
            ("average([2, 4, 6])", 4.0),
            ("average([])", 0.0),
            ("average([5])", 5.0),
        ],
    },
}

_NAME_RE = re.compile(r"^[a-z][a-z0-9_]*$")


def vocabulary():
    return sorted(OPERATIONS.keys())


def generate_module_source(spec):
    lines = [
        f'"""Generated module: {spec["name"]}',
        "",
        f'Purpose: {spec.get("purpose", "")}',
        "Generated by halex_ai_selfbuild.synthesizer from a gated spec.",
        "Operations: " + ", ".join(spec["operations"]),
        '"""',
        "",
        "import hashlib",
        "",
        "",
    ]
    for op in spec["operations"]:
        lines.append(OPERATIONS[op]["impl"])
        lines.append("")
    return "\n".join(lines)


def generate_test_source(spec):
    lines = [
        f'"""Behavioral tests for generated module {spec["name"]}.',
        "Every assertion checks a computed output on a known input.",
        '"""',
        "import sys",
        "import unittest",
        "from pathlib import Path",
        "",
        "sys.path.insert(0, str(Path(__file__).resolve().parent))",
        "",
        f"import {spec['name']} as mod",
        "",
        "",
        f"class Test{spec['name'].title().replace('_', '')}(unittest.TestCase):",
    ]
    idx = 0
    for op in spec["operations"]:
        for expr, expected in OPERATIONS[op]["cases"]:
            idx += 1
            call = expr.replace(op, f"mod.{op}", 1)
            lines.append(f"    def test_{op}_{idx}(self):")
            lines.append(f"        self.assertEqual({call}, {expected!r})")
            lines.append("")
    lines += ["", "if __name__ == '__main__':", "    unittest.main()", ""]
    return "\n".join(lines)


def generate_readme_section(spec):
    ops = "\n".join(
        f"- `{op}` — {OPERATIONS[op]['signature']}" for op in spec["operations"]
    )
    caps = spec.get("capabilities") or []
    cap_line = ("\nCapabilities: " + ", ".join(caps)) if caps else ""
    return (
        f"## {spec['name']}\n\n"
        f"Purpose: {spec.get('purpose', '')}{cap_line}\n\n"
        f"Operations:\n{ops}\n\n"
        f"Tests: `test_{spec['name']}.py` asserts computed outputs on known "
        "inputs and was mutation-checked at synthesis time (a deliberately "
        "corrupted copy of this module fails those tests).\n"
    )


def _run_tests(test_path, cwd, timeout=60):
    try:
        proc = subprocess.run(
            [sys.executable, str(test_path)],
            capture_output=True, text=True, cwd=str(cwd), timeout=timeout,
        )
        return proc.returncode == 0, proc.stdout + proc.stderr
    except subprocess.TimeoutExpired as exc:
        return False, f"TIMEOUT after {timeout}s: {exc}"
    except OSError as exc:
        return False, f"OSERROR: {exc}"


def _mutated_source(module_source, first_op):
    """Corrupt one operation: append a shadowing stub that returns a sentinel
    regardless of input. Any behavioral test of that operation must fail."""
    return (
        module_source
        + f"\n\n# --- deliberate mutation for the mutation check ---\n"
        + f"def {first_op}(*args, **kwargs):\n"
        + f"    return {MUTATION_SENTINEL!r}\n"
    )


def synthesize(spec, out_dir, timeout=60):
    """Attempt synthesis. Returns a result dict; never raises for a bad spec.

    status: SYNTHESIZED | UNSYNTHESIZABLE | TESTS_FAILED | MUTATION_REJECTED
    """
    # Absolute path: generated tests run in a subprocess with cwd=out_dir,
    # so a relative test path would not resolve there.
    out_dir = Path(out_dir).resolve()
    if not isinstance(spec, dict):
        return {"status": "UNSYNTHESIZABLE", "reason": "spec is not a dict", "spec": spec}
    name = spec.get("name")
    operations = spec.get("operations")
    if not name or not isinstance(name, str) or not _NAME_RE.match(name):
        return {"status": "UNSYNTHESIZABLE",
                "reason": f"invalid module name: {name!r} (need snake_case identifier)",
                "spec": spec}
    if not operations or not isinstance(operations, list):
        return {"status": "UNSYNTHESIZABLE",
                "reason": "spec has no operations list", "spec": spec}
    unknown = [op for op in operations if op not in OPERATIONS]
    if unknown:
        return {"status": "UNSYNTHESIZABLE",
                "reason": f"operation(s) outside the safe vocabulary: {unknown}; "
                          f"vocabulary is {vocabulary()}",
                "spec": spec}

    out_dir.mkdir(parents=True, exist_ok=True)
    module_path = out_dir / f"{name}.py"
    test_path = out_dir / f"test_{name}.py"
    readme_path = out_dir / f"{name}.README.md"

    module_source = generate_module_source(spec)
    module_path.write_text(module_source, encoding="utf-8")
    test_path.write_text(generate_test_source(spec), encoding="utf-8")
    readme_path.write_text(generate_readme_section(spec), encoding="utf-8")

    passed, output = _run_tests(test_path, cwd=out_dir, timeout=timeout)
    if not passed:
        return {"status": "TESTS_FAILED", "spec": spec,
                "module_path": str(module_path), "test_path": str(test_path),
                "readme_path": str(readme_path), "test_output": output}

    # Mutation check in a scratch sibling directory.
    mut_dir = out_dir / "_mutation_check"
    try:
        if mut_dir.exists():
            shutil.rmtree(mut_dir)
        mut_dir.mkdir(parents=True)
        (mut_dir / f"{name}.py").write_text(
            _mutated_source(module_source, operations[0]), encoding="utf-8")
        (mut_dir / f"test_{name}.py").write_text(
            generate_test_source(spec), encoding="utf-8")
        mut_passed, mut_output = _run_tests(mut_dir / f"test_{name}.py",
                                            cwd=mut_dir, timeout=timeout)
    finally:
        shutil.rmtree(mut_dir, ignore_errors=True)

    if mut_passed:
        return {"status": "MUTATION_REJECTED", "spec": spec,
                "module_path": str(module_path), "test_path": str(test_path),
                "readme_path": str(readme_path), "test_output": output,
                "mutation_output": mut_output,
                "reason": "generated tests PASSED against a deliberately "
                          "corrupted module: they are self-certifying and "
                          "the synthesis is rejected"}

    return {"status": "SYNTHESIZED", "spec": spec,
            "module_path": str(module_path), "test_path": str(test_path),
            "readme_path": str(readme_path), "test_output": output,
            "mutation_output": mut_output,
            "mutated_operation": operations[0]}
