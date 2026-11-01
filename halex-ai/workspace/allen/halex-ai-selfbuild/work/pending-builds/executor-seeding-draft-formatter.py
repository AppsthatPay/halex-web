#!/usr/bin/env python3
"""Draft formatter executor (staging, H2 Builder + H4 Guard).

Normalizes a staging draft markdown file, formatting only:
  - strips trailing whitespace from every line;
  - collapses runs of 3+ blank lines to at most 2;
  - ensures the file ends with exactly one newline.

Usage: python3 executor-seeding-draft-formatter.py <in.md> <out.md>
The input file is never modified; output goes only to <out.md>.
Exit 0 on success. No network use.
"""

import sys
from pathlib import Path


def format_text(text):
    lines = [line.rstrip() for line in text.splitlines()]
    out = []
    blanks = 0
    for line in lines:
        if line == "":
            blanks += 1
            if blanks > 2:
                continue
        else:
            blanks = 0
        out.append(line)
    while out and out[-1] == "":
        out.pop()
    return "\n".join(out) + "\n"


def main(argv):
    if len(argv) != 3:
        print("usage: draft-formatter.py <in.md> <out.md>")
        return 2
    src, dst = Path(argv[1]), Path(argv[2])
    if not src.is_file():
        print("FAIL: not a file: %s" % src)
        return 1
    try:
        text = src.read_text(encoding="utf-8")
    except OSError as exc:
        print("FAIL: unreadable: %s" % exc)
        return 1
    dst.write_text(format_text(text), encoding="utf-8")
    print("FORMATTED %s -> %s" % (src.name, dst.name))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
