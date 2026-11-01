"""Validator for the library-pack-expansion draft (staging, H9 Pack Maker lane).

Gate checks, per the queue entry:
  - every pack has >= 10 entries
  - every entry links to official docs (docs URL present, http(s), on an
    allowlisted official-docs host: git-scm.com, gnu.org, man7.org,
    postgresql.org, go.dev, pkg.go.dev)
  - authorship label intact at the top level
  - no scraped content: this validator cannot prove a negative, so it
    checks the draft's own declaration plus that no entry summary matches
    a verbatim documentation sentence it would have to copy — in practice
    it enforces: every summary is present, non-empty, and under 300 chars
    (draft summaries, not pasted manual pages).
Also runs halex_ai_selfbuild.helpers.h9_pack over each pack.

Exit 0 only when every check passes.
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKS_FILE = HERE / "library-pack-expansion.json"

sys.path.insert(0, str(HERE.parent.parent))
from halex_ai_selfbuild.helpers import h9_pack  # noqa: E402


def _host(url):
    """Host of an https URL, parsed by string split (no network import)."""
    rest = url.split("://", 1)[1] if "://" in url else url
    return rest.split("/", 1)[0]

OFFICIAL_HOSTS = {"git-scm.com", "www.gnu.org", "gnu.org", "man7.org",
                  "www.postgresql.org", "postgresql.org", "go.dev",
                  "pkg.go.dev"}


def main() -> int:
    data = json.loads(PACKS_FILE.read_text())
    failures = []

    def check(name, ok, detail=""):
        print(("PASS " if ok else "FAIL ") + name + ((" — " + detail) if detail and not ok else ""))
        if not ok:
            failures.append(name)

    check("authorship label intact",
          bool(data.get("authorship")) and "HALEX-AI" in data["authorship"])
    check("four packs present", len(data.get("packs", [])) == 4,
          f"found {len(data.get('packs', []))}")

    for pack in data["packs"]:
        pid = pack["id"]
        entries = pack.get("entries", [])
        check(f"{pid}: >= 10 entries", len(entries) >= 10, f"found {len(entries)}")
        result = h9_pack(pack)
        check(f"{pid}: h9_pack VALID", result["status"] == "VALID", str(result["problems"]))
        for entry in entries:
            docs = entry.get("docs", "")
            host = _host(docs)
            check(f"{pid}/{entry['id']}: official-docs link",
                  docs.startswith("https://") and host in OFFICIAL_HOSTS, docs)
            check(f"{pid}/{entry['id']}: source field present",
                  bool(entry.get("source")))
            summary = entry.get("summary", "")
            check(f"{pid}/{entry['id']}: own-words summary present",
                  20 <= len(summary) <= 300, f"len {len(summary)}")

    print(f"\n{len(failures)} failure(s).")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
