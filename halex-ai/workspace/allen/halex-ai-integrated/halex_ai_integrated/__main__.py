"""CLI demo for the HALEX-AI integrated build.

Usage:
  python -m halex_ai_integrated demo
  python -m halex_ai_integrated handle --query "What is the capital of France?" \
      --domain research --context-key "capital of France" --context-value "Paris"

Runs fully offline against caller-supplied context. Prints the result
object as JSON. Seed Marker: ZINIUM-SEED-ALLEN (integration layer).
"""

import argparse
import json
import sys

from .orchestrator import HalexAI, run_sample


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="halex_ai_integrated")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("demo", help="Run the built-in end-to-end sample request.")
    handle = sub.add_parser("handle", help="Run one request envelope.")
    handle.add_argument("--query", required=True)
    handle.add_argument("--domain", default="general")
    handle.add_argument("--context-key", default=None)
    handle.add_argument("--context-value", default=None)
    handle.add_argument("--evidence", action="append", default=[])
    args = parser.parse_args(argv)

    if args.command == "demo":
        result = run_sample()
    else:
        known_context = {}
        if args.context_key is not None:
            known_context[args.context_key] = args.context_value
        result = HalexAI().handle({
            "query": args.query,
            "intent_domain": args.domain,
            "known_context": known_context,
            "evidence": args.evidence,
            "source": "integrated-cli",
            "contributor": "ALLEN",
        })
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result.get("status") == "COMPLETED" else 1


if __name__ == "__main__":
    sys.exit(main())
