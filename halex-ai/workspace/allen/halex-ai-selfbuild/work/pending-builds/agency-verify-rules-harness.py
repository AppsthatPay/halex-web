"""Harness for agency-verify-rules (H3 Verifier lane, staging only).

Gate: "PENDING: gates when agency tests cover 2-source pass,
1-source label, vendor-figure refusal."

All example claims are plainly fake (e.g. "widget X costs $5") —
never real-world claims. No network access, no dynamic code.

Usage: python3 agency-verify-rules-harness.py
Exit 0 only when every check passes; writes
agency-verify-rules-proof.json beside itself.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from verify_rules import corroborate

PROOF_OUT = HERE / "agency-verify-rules-proof.json"

CLAIM = "widget X costs $5"


def src(name, independent=True, kind="independent", figure=None):
    d = {"name": name, "independent": independent, "kind": kind}
    if figure is not None:
        d["figure"] = figure
    return d


def main():
    checks = []

    def check(name, ok, detail=""):
        checks.append({"name": name, "pass": bool(ok), "detail": detail})

    # 1. 2-source pass.
    r = corroborate(CLAIM, [src("fake-source-a"), src("fake-source-b")])
    check("2-source pass: two independent sources verify",
          r["verdict"] == "verified"
          and r["independent_source_count"] == 2)

    # 2. 1-source label.
    r = corroborate(CLAIM, [src("fake-source-a")])
    check("1-source label: exactly one source is single-source, labelled",
          r["verdict"] == "single-source"
          and r["label"] == "1-source label - not corroborated"
          and r["independent_source_count"] == 1)

    # 3. Vendor-figure refusal.
    r = corroborate(CLAIM, [
        src("fake-source-a"), src("fake-source-b"),
        src("fake-vendor", kind="vendor", figure="$5"),
    ])
    check("vendor-figure refusal: verdict includes vendor-figure refused",
          "vendor-figure refused" in r["verdict"]
          and r["vendor_figure_refused"] is True)

    # 4. Refused figure is never returned as fact.
    r = corroborate(CLAIM, [
        src("fake-source-a"), src("fake-source-b"),
        src("fake-vendor", kind="vendor", figure="$5"),
    ])
    check("vendor-figure refusal: figure is never returned as fact",
          "figure" not in r
          and "$5" not in json.dumps(r, default=str).replace(CLAIM, ""))

    # 5. Same-name duplicate does not pass.
    r = corroborate(CLAIM, [src("fake-source-a"), src("fake-source-a")])
    check("same-name duplicate does not pass as 2 sources",
          r["verdict"] == "single-source"
          and r["independent_source_count"] == 1)

    # 6. 0-source unverified.
    r = corroborate(CLAIM, [])
    check("0-source unverified",
          r["verdict"] == "unverified"
          and r["independent_source_count"] == 0)

    # 7. Vendor source alone never verifies.
    r = corroborate(CLAIM, [
        src("fake-vendor", independent=True, kind="vendor", figure="$5"),
    ])
    check("vendor source alone never verifies",
          r["verdict"].startswith("unverified")
          and r["independent_source_count"] == 0)

    # 8. Non-independent source does not count toward corroboration.
    r = corroborate(CLAIM, [
        src("fake-source-a"), src("fake-source-b", independent=False),
    ])
    check("non-independent second source does not corroborate",
          r["verdict"] == "single-source"
          and r["independent_source_count"] == 1)

    # 9. Vendor figure refusal does not erase a genuine 2-source pass.
    r = corroborate(CLAIM, [
        src("fake-source-a"), src("fake-source-b"),
        src("fake-vendor", kind="vendor", figure="$9"),
    ])
    check("2-source pass stands alongside vendor-figure refusal",
          r["verdict"].startswith("verified")
          and "vendor-figure refused" in r["verdict"])

    # 10. Pure function: inputs are not mutated.
    sources = [src("fake-source-a"), src("fake-source-b")]
    snapshot = json.dumps(sources, sort_keys=True)
    corroborate(CLAIM, sources)
    check("inputs are not mutated",
          json.dumps(sources, sort_keys=True) == snapshot)

    proof = {"checks": checks,
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
