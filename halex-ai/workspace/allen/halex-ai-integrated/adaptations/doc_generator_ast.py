"""ADAPTATION, NOT THE GATED MODULE: real AST-based API manifest extraction.

Adapted by Allen (ZINIUM-SEED-ALLEN) from the rewrite spec in the gate
report for Gemini Module 18 (DOC-GEN), which was RETURNED because its
compile_api_manifest never opened a file and stamped VERIFIED_AND_SEALED
on modules that do not exist. This adaptation does the opposite:

  * extract_api_manifest(path) really opens and parses the file with
    the ast module, and extracts the module docstring, classes, methods,
    and functions that are actually there. A missing or unparseable
    file returns an error result, never a manifest.
  * A module is marked verified ONLY by verify_module(..., run_tests=True):
    the file must have been read and parsed AND its test file must have
    been actually run (subprocess, timeout, restricted to files inside
    the integrated tree) with the outcome recorded. Without the explicit
    opt-in, the status stays EXTRACTED_NOT_VERIFIED, because extraction
    alone verifies nothing.

Stdlib only. The test-running opt-in executes unittest on a test file
the caller names inside this tree; it never runs arbitrary commands.
"""

import ast
import os
import re
import subprocess
import sys
from typing import Any, Dict, Optional

SEED_MARKER = "ZINIUM-SEED-ALLEN"
_TREE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _signature(node) -> str:
    try:
        return ast.unparse(node.args)
    except Exception:
        return "..."


def _describe_function(node) -> Dict[str, Any]:
    return {
        "name": node.name,
        "signature": _signature(node),
        "docstring": ast.get_docstring(node) or "",
        "line": node.lineno,
    }


def extract_api_manifest(module_path: str) -> Dict[str, Any]:
    """Parse a real file and extract its API surface. Errors are returned
    as error results; nothing is stamped or sealed here."""
    if not os.path.isfile(module_path):
        return {"status": "ERROR_FILE_NOT_FOUND", "module_path": module_path,
                "seed_marker": SEED_MARKER}
    try:
        with open(module_path, "r", encoding="utf-8") as handle:
            source = handle.read()
        tree = ast.parse(source, filename=module_path)
    except (OSError, SyntaxError) as exc:
        return {"status": "ERROR_PARSE_FAILED", "module_path": module_path,
                "error": str(exc), "seed_marker": SEED_MARKER}

    classes = []
    functions = []
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            methods = [_describe_function(item) for item in node.body
                       if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef))]
            classes.append({"name": node.name, "docstring": ast.get_docstring(node) or "",
                            "methods": methods, "line": node.lineno})
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(_describe_function(node))

    return {
        "status": "EXTRACTED_FROM_FILE",
        "module": os.path.splitext(os.path.basename(module_path))[0],
        "module_path": module_path,
        "docstring": ast.get_docstring(tree) or "",
        "classes": classes,
        "functions": functions,
        "seed_marker": SEED_MARKER,
    }


def _inside_tree(path: str) -> bool:
    return os.path.commonpath([os.path.abspath(path), _TREE_ROOT]) == _TREE_ROOT


def verify_module(module_path: str, test_path: Optional[str] = None,
                  run_tests: bool = False, timeout_seconds: int = 60) -> Dict[str, Any]:
    """The only path to a verified mark, and it is explicit opt-in.

    Verified here means exactly two things, both recorded: the module
    file was read and parsed, and its named test file was run under
    unittest with the recorded outcome. Test files outside the
    integrated tree are refused.
    """
    manifest = extract_api_manifest(module_path)
    if manifest["status"] != "EXTRACTED_FROM_FILE":
        return {"status": manifest["status"], "manifest": manifest,
                "tests_run": False, "seed_marker": SEED_MARKER}
    result: Dict[str, Any] = {"status": "EXTRACTED_NOT_VERIFIED", "manifest": manifest,
                              "tests_run": False, "seed_marker": SEED_MARKER}
    if not run_tests:
        result["note"] = "run_tests not requested; extraction alone verifies nothing."
        return result
    if not test_path or not os.path.isfile(test_path):
        result["note"] = "run_tests requested but no existing test file was named."
        return result
    if not _inside_tree(test_path):
        result["status"] = "ERROR_TEST_PATH_OUTSIDE_TREE"
        result["note"] = "Test execution is restricted to files inside the integrated tree."
        return result
    test_dir = os.path.dirname(os.path.abspath(test_path))
    test_module = os.path.splitext(os.path.basename(test_path))[0]
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", test_module],
            cwd=test_dir, capture_output=True, text=True, timeout=timeout_seconds)
        output = (proc.stderr or "") + (proc.stdout or "")
    except subprocess.TimeoutExpired:
        result["status"] = "TESTS_RUN_TIMED_OUT"
        result["tests_run"] = True
        return result
    match = re.search(r"Ran (\d+) test", output)
    result["tests_run"] = True
    result["test_outcome"] = {
        "test_file": test_path,
        "tests_count": int(match.group(1)) if match else 0,
        "returncode": proc.returncode,
        "passed": proc.returncode == 0 and "\nOK" in output,
    }
    result["status"] = ("VERIFIED_FILE_READ_AND_TESTS_PASSED" if result["test_outcome"]["passed"]
                        else "TESTS_RUN_AND_FAILED")
    return result
