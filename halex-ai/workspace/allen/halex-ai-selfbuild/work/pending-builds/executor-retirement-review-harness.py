"""Harness for executor_review.py (staging only). Exit 0 only if all checks pass."""
import copy
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from executor_review import review_executors

checks = []


def check(name, cond):
    checks.append((name, bool(cond)))


# Seeded executors from executor-seeding: all three present on file,
# last run proof 8/8 this run, scan evidenced at cycle end.
SEEDED = [
    {"name": "pack-linter", "present": True, "run_ok": True, "scan_clean": True},
    {"name": "queue-validator", "present": True, "run_ok": True, "scan_clean": True},
    {"name": "draft-formatter", "present": True, "run_ok": True, "scan_clean": True},
]

r = review_executors(SEEDED)
check("seeded executors: all KEEP", r["kept"] == [e["name"] for e in SEEDED])
check("seeded executors: none retired", r["retired"] == [])
check("seeded executors: records intact", r["records_intact"] is True)

# Retire paths: each failing fact retires, with its reason, record kept.
cases = [
    ({"name": "gone", "present": False, "run_ok": True, "scan_clean": True},
     "not present on file"),
    ({"name": "broken", "present": True, "run_ok": False, "scan_clean": True},
     "last run did not pass"),
    ({"name": "dirty", "present": True, "run_ok": True, "scan_clean": False},
     "not scan-clean"),
]
for ex, reason in cases:
    rr = review_executors(SEEDED + [ex])
    verdict = [v for v in rr["verdicts"] if v["name"] == ex["name"]][0]
    check("retire %s with reason" % ex["name"],
          verdict["verdict"] == "RETIRE" and reason in verdict["reasons"])
    check("retired %s stays in the record" % ex["name"],
          ex["name"] in [v["name"] for v in rr["verdicts"]]
          and ex["name"] in rr["retired"])
    check("retire %s keeps seeded KEEPs" % ex["name"],
          rr["kept"] == [e["name"] for e in SEEDED])

# Guards: empty name refused; non-list refused; input unmutated.
try:
    review_executors([{"name": "", "present": True, "run_ok": True, "scan_clean": True}])
    check("empty executor name refused", False)
except ValueError:
    check("empty executor name refused", True)
try:
    review_executors("pack-linter")
    check("non-list input refused", False)
except ValueError:
    check("non-list input refused", True)
before = copy.deepcopy(SEEDED)
review_executors(SEEDED)
check("input unmutated", SEEDED == before)

fails = [n for n, ok in checks if not ok]
print("executor-retirement-review: %d checks pass, %d fail" % (len(checks) - len(fails), len(fails)))
for n in fails:
    print("FAIL:", n)
with open(__file__.rsplit("/", 1)[0] + "/executor-retirement-review-proof.json", "w") as f:
    json.dump({"checks": [{"name": n, "pass": ok} for n, ok in checks],
               "passed": len(checks) - len(fails), "failed": len(fails)}, f, indent=2)
sys.exit(1 if fails else 0)
