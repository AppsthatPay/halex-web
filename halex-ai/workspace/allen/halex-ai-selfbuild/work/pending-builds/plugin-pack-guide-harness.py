"""Harness for plugin-pack-guide (staging only). Exit 0 only if all checks pass."""
import json
import sys

BASE = __file__.rsplit("/", 1)[0]
checks = []


def check(name, cond):
    checks.append((name, bool(cond)))


with open(BASE + "/plugin-pack-template.json") as f:
    template = json.load(f)
with open(BASE + "/plugin-pack-guide-demo-pack.json") as f:
    pack = json.load(f)
with open(BASE + "/fauna-intake-birds-blue-jay.json") as f:
    source = json.load(f)

check("template has all required fields",
      all(k in template for k in ("id", "name", "version", "status", "authorship", "provenance", "entries")))
check("template entry has all required fields",
      all(k in template["entries"][0] for k in ("id", "title", "summary", "provenance", "images")))
check("demo pack conforms to template fields",
      all(k in pack for k in template if k != "entries") and "entries" in pack)
check("demo pack has at least one real entry", len(pack["entries"]) >= 1)
entry = pack["entries"][0]
check("demo entry id matches source record id", entry["id"] == source["record"]["id"])
check("demo entry summary matches source appearance summary",
      entry["summary"] == source["record"]["appearance"]["summary"])
check("demo entry provenance names the source actually read",
      "BioKIDS" in entry["provenance"] and "Cyanocitta_cristata" in entry["provenance"])
check("demo pack preserves images NOT READ from source",
      entry["images"] == "NOT READ" and source["record"]["images"]["status"] == "NOT READ")
check("demo pack preserves subspecies NOT READ from source",
      entry["subspecies"] == "NOT READ" and source["record"]["subspecies"]["status"] == "NOT READ")
check("demo pack authorship label intact", "staging draft" in pack["authorship"].lower())
check("demo pack status is staging, never live",
      "STAGING DRAFT" in pack["status"] and "live pack" not in pack["status"].lower().replace("not a live pack", ""))

fails = [n for n, ok in checks if not ok]
print("plugin-pack-guide: %d checks pass, %d fail" % (len(checks) - len(fails), len(fails)))
for n in fails:
    print("FAIL:", n)
with open(BASE + "/plugin-pack-guide-proof.json", "w") as f:
    json.dump({"checks": [{"name": n, "pass": ok} for n, ok in checks],
               "passed": len(checks) - len(fails), "failed": len(fails)}, f, indent=2)
sys.exit(1 if fails else 0)
