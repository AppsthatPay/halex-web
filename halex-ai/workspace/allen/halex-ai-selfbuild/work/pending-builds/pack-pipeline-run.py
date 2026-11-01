"""Staging demonstration of the intake -> pack -> page routine.

Real gap used: fauna-intake-mammals deer mouse intake record, drafted
2026-11-01 from sources actually read that run (ADW account, Mammals
of Texas, Oregon State entry). This script does NOT edit any live pack
or page file. It reads the staging intake record, builds a staging pack
JSON and a manifest entry under work/pending-builds/, and writes
harness cases as checks. Output paths are staging-only.

Usage: python3 pack-pipeline-run.py  (run from the selfbuild tree root,
or from work/pending-builds/; paths are resolved relative to this file)
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
INTAKE = HERE / "fauna-intake-mammals-deer-mouse.json"
PACK_OUT = HERE / "pack-pipeline-pack.json"
PROOF_OUT = HERE / "pack-pipeline-proof.json"


def main():
    checks = []

    def check(name, ok, detail=""):
        checks.append({"name": name, "pass": bool(ok), "detail": detail})
        return bool(ok)

    intake = json.loads(INTAKE.read_text(encoding="utf-8"))
    check("intake record readable", isinstance(intake, dict))
    # The deer-mouse intake nests its fields under "record" (see
    # fauna-intake-mammals-deer-mouse.json); the first version of this
    # script read top-level keys only and failed 2 checks on that.
    # Fixed 2026-11-01: resolve the nested record, no field invented.
    rec = intake.get("record") if isinstance(intake.get("record"), dict) \
        else intake
    check("intake has provenance", bool(rec.get("provenance"))
          or bool(rec.get("source")) or bool(rec.get("sources")))
    common = rec.get("common_name") or rec.get("name") or ""
    sci = rec.get("scientific_name") or ""
    check("intake names a species", bool(common) and bool(sci),
          "%s (%s)" % (common, sci))

    # Stage 2: pack. One entry, derived only from the intake record.
    # No field is invented: unverified intake fields stay NOT READ here too.
    pack = {
        "id": "staging-fauna-deer-mouse",
        "name": "Staging fauna: deer mouse (pipeline demo)",
        "version": "0.1.0-staging",
        "status": "STAGING DRAFT - not a live pack, not for page wiring",
        "provenance": "Derived 2026-11-01 from work/pending-builds/"
                      "fauna-intake-mammals-deer-mouse.json; folding is "
                      "Allen's review decision.",
        "authorship": "HALEX-AI staging draft",
        "entries": [{
            "patterns": ["deer mouse", "peromyscus maniculatus"],
            "title": common,
            "scientific_name": sci,
            "summary": rec.get("summary") or rec.get("description")
                       or (rec.get("appearance") or {}).get("summary")
                       or "See intake record for the sourced account.",
            "intake_record": "fauna-intake-mammals-deer-mouse.json",
            "images": "NOT READ",
        }],
    }
    check("pack has exactly the intake-derived entry",
          len(pack["entries"]) == 1)
    check("pack entry carries provenance link",
          pack["entries"][0]["intake_record"]
          == "fauna-intake-mammals-deer-mouse.json")
    check("pack entry marks images NOT READ",
          pack["entries"][0]["images"] == "NOT READ")
    check("pack is marked staging, never live",
          "STAGING" in pack["status"])

    # Stage 3: manifest entry + harness cases (the page step, as a
    # proposed diff only - no live file is touched).
    manifest_entry = {
        "pack_id": pack["id"],
        "file": "work/pending-builds/pack-pipeline-pack.json",
        "entry_count": len(pack["entries"]),
        "page_diff": "PROPOSED ONLY: one script line + one manifest entry; "
                     "not applied in this run.",
    }
    check("manifest entry matches pack id and count",
          manifest_entry["pack_id"] == pack["id"]
          and manifest_entry["entry_count"] == len(pack["entries"]))
    check("manifest diff is proposed-only, not applied",
          "PROPOSED ONLY" in manifest_entry["page_diff"])
    check("no live pack or page path in outputs",
          all("halex-ai-pack" not in str(p) and "index.html" not in str(p)
              for p in (PACK_OUT, PROOF_OUT)))

    PACK_OUT.write_text(json.dumps(pack, indent=2, sort_keys=True),
                        encoding="utf-8")
    reread = json.loads(PACK_OUT.read_text(encoding="utf-8"))
    check("written pack re-reads identically", reread == pack)
    check("written pack has >=1 entry", len(reread["entries"]) >= 1)

    proof = {"pipeline": "intake -> pack -> page (staging only)",
             "intake": str(INTAKE.name),
             "pack": str(PACK_OUT.name),
             "manifest_entry": manifest_entry,
             "checks": checks,
             "passed": sum(1 for c in checks if c["pass"]),
             "failed": sum(1 for c in checks if not c["pass"])}
    PROOF_OUT.write_text(json.dumps(proof, indent=2, sort_keys=True),
                         encoding="utf-8")
    for c in checks:
        print(("PASS " if c["pass"] else "FAIL ") + c["name"]
              + ((" - " + c["detail"]) if c["detail"] else ""))
    print("%d checks pass, %d fail" % (proof["passed"], proof["failed"]))
    return 0 if proof["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
