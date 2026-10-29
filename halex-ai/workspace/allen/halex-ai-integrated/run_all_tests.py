"""Run every test suite in the integrated tree and print a summary.

Seed Marker: ZINIUM-SEED-ALLEN.

Suites run, each by per-directory unittest discovery (the gated suite's
own invocation style, which its flat imports require):
  * every component directory under halex_ai_integrated/components/
  * adaptations/tests, zinium_seed_hook/tests, tests_integration/

Exit code is 0 only if every location ran clean. A location that runs
zero tests is reported as an error, not silently passed.
"""

import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def locations():
    result = []
    components = os.path.join(ROOT, "halex_ai_integrated", "components")
    for name in sorted(os.listdir(components)):
        path = os.path.join(components, name)
        if os.path.isdir(path):
            result.append(("components/" + name, path))
    for label, rel in (("adaptations", os.path.join("adaptations", "tests")),
                       ("zinium_seed_hook", os.path.join("zinium_seed_hook", "tests")),
                       ("tests_integration", "tests_integration")):
        result.append((label, os.path.join(ROOT, rel)))
    return result


def main() -> int:
    total = 0
    failures = 0
    for label, path in locations():
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", ".", "-p", "test_*.py"],
            cwd=path, capture_output=True, text=True, timeout=600)
        output = (proc.stderr or "") + (proc.stdout or "")
        match = re.search(r"Ran (\d+) test", output)
        count = int(match.group(1)) if match else 0
        ok = proc.returncode == 0 and "\nOK" in output and count > 0
        total += count
        if not ok:
            failures += 1
        print("%-28s %3d tests  %s" % (label, count, "OK" if ok else "FAILED"))
        if not ok:
            print(output[-3000:])
    print("-" * 48)
    print("TOTAL: %d tests, %d location(s) failed" % (total, failures))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
