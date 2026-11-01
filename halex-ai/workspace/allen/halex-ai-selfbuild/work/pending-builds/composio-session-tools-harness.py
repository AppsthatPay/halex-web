"""Harness for composio_mapping.py (staging only). Exit 0 only if all checks pass."""
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from composio_mapping import MAPPINGS, VENDOR_CLAIMS, validate_mappings

checks = []


def check(name, cond):
    checks.append((name, bool(cond)))


check("three mappings present", len(MAPPINGS) == 3)
check("all mappings validate", validate_mappings(MAPPINGS) is True)
check("session mapping is descriptor-only",
      MAPPINGS[0]["execution"] == "descriptor-only")
check("runtime discovery mapping is descriptor-only",
      MAPPINGS[1]["execution"] == "descriptor-only")
check("vendor execution maps to none, never executed",
      MAPPINGS[2]["execution"] == "none" and "does not execute" in MAPPINGS[2]["halex_equivalent"])
check("no mapping mentions an API key",
      all("api key" not in (r["vendor_concept"] + r["halex_equivalent"]).lower() for r in MAPPINGS))
check("vendor toolkit count kept as claim only",
      VENDOR_CLAIMS[0]["status"] == "claim, not adopted as fact")

try:
    validate_mappings([{"vendor_concept": "x", "halex_equivalent": "y", "execution": "network"}])
    check("network execution refused", False)
except ValueError:
    check("network execution refused", True)

try:
    validate_mappings([])
    check("empty mapping refused", False)
except ValueError:
    check("empty mapping refused", True)

fails = [n for n, ok in checks if not ok]
print("composio-session-tools: %d checks pass, %d fail" % (len(checks) - len(fails), len(fails)))
for n in fails:
    print("FAIL:", n)
with open(__file__.rsplit("/", 1)[0] + "/composio-session-tools-proof.json", "w") as f:
    json.dump({"checks": [{"name": n, "pass": ok} for n, ok in checks],
               "passed": len(checks) - len(fails), "failed": len(fails)}, f, indent=2)
sys.exit(1 if fails else 0)
