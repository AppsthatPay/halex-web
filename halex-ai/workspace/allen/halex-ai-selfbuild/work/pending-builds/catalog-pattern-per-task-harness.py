"""Harness for catalog_pattern.py (staging, H10 Archivist lane).

Gate: "PENDING: gates when one intake report shows patterns cited
as patterns, never as running agents."

Checks: a pattern is cited with the required label; a pattern
without a catalog id is refused and never cited; multiple patterns
are listed in order; rendered output contains no agent-action
phrasing; an empty pattern list yields an empty report field with
no invented patterns; inputs are not mutated; output is plain data.

Usage: python3 catalog-pattern-per-task-harness.py
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from catalog_pattern import (PATTERN_LABEL, build_report_field,
                             render_report_field)

PROOF_OUT = HERE / "catalog-pattern-per-task-proof.json"

TASK = {
    "id": "staging-catalog-demo",
    "topic": "Session-scoped tool-surface pattern",
    "question": "How does a session-scoped tool surface map onto allowlist descriptors only?",
}

ONE_PATTERN = {
    "catalog_id": "github-mcp-server-12135521",
    "name": "GitHub MCP Server",
    "category": "MCP Servers",
}

TWO_PATTERNS = [
    ONE_PATTERN,
    {
        "catalog_id": "staging-second-pattern-0001",
        "name": "Staging second pattern",
        "category": "Staging",
    },
]

AGENT_ACTION_PHRASES = [
    "the agent ran",
    "the agent decided",
    "the agent executed",
    "the agent thinks",
    "the agent acts",
    "the pattern ran",
    "the pattern decided",
    "the pattern executed",
]


def main():
    checks = []

    def check(name, ok, detail=""):
        checks.append({"name": name, "pass": bool(ok), "detail": detail})

    field = build_report_field(TASK, [ONE_PATTERN])
    check("pattern cited with label",
          len(field["catalog_patterns_consulted"]) == 1
          and field["catalog_patterns_consulted"][0]["catalog_id"]
          == "github-mcp-server-12135521"
          and field["catalog_patterns_consulted"][0]["citation"]
          == PATTERN_LABEL
          and field["catalog_patterns_consulted"][0]["citation"]
          == "pattern, not a running agent")
    check("pattern count is 1 for one cited pattern",
          field["pattern_count"] == 1)

    refused = False
    try:
        build_report_field(TASK, [{"name": "No id pattern",
                                   "category": "MCP Servers"}])
    except ValueError:
        refused = True
    check("pattern without catalog id refused",
          refused)
    refused_empty = False
    try:
        build_report_field(TASK, [{"catalog_id": "  ",
                                   "name": "Blank id pattern",
                                   "category": "MCP Servers"}])
    except ValueError:
        refused_empty = True
    check("pattern with blank catalog id refused",
          refused_empty)

    multi = build_report_field(TASK, TWO_PATTERNS)
    check("multiple patterns listed in order",
          multi["pattern_count"] == 2
          and [p["catalog_id"] for p in multi["catalog_patterns_consulted"]]
          == ["github-mcp-server-12135521", "staging-second-pattern-0001"]
          and all(p["citation"] == PATTERN_LABEL
                  for p in multi["catalog_patterns_consulted"]))

    rendered = render_report_field(multi)
    lowered = rendered.lower()
    check("rendered output contains no agent-action language",
          all(phrase not in lowered for phrase in AGENT_ACTION_PHRASES))

    empty = build_report_field(TASK, [])
    check("empty pattern list yields an empty report field, never invented patterns",
          empty["catalog_patterns_consulted"] == []
          and empty["pattern_count"] == 0)

    task_copy = dict(TASK)
    patterns_copy = [dict(p) for p in TWO_PATTERNS]
    build_report_field(TASK, TWO_PATTERNS)
    check("inputs are not mutated",
          TASK == task_copy and TWO_PATTERNS == patterns_copy)
    check("output is plain data (dict with list of dicts)",
          isinstance(field, dict)
          and isinstance(field["catalog_patterns_consulted"], list)
          and all(isinstance(p, dict)
                  for p in field["catalog_patterns_consulted"]))

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
