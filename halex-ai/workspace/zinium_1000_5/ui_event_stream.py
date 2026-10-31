"""UI event stream — STAGING ONLY, stdlib only.

Honest equivalent of the pasted AG-UI / UI streamer code, with
its defects removed. Read the header before using it, because
the pasted code's claims do not match its code:

PASTED CODE, GATE RETURNED (not run as-is):
- Intake writes the user's prompt text into a record:
  "Session [XYZ_99812] received prompt: '<prompt>'". That
  breaks the standing gate that user message text is never
  written into chain records. This file never stores the
  question text in any packet, log, or ledger entry.
- "Reasoning" is max(0, val*w) + 0.01 per element, not
  semantic language understanding, not spatial reasoning,
  not a neural model. This file does not call that reasoning.
  Its reasoning steps are real lookups: agencies.json (32),
  ledger blocks (5), topic match, source block.
- "Output synthesis" is just a final tensor print. There is
  no response text synthesis, no confidence score, no value
  mass update, and no burn in the pasted code, despite the
  PDF summary claiming all three. This file claims none of
  those, and its output is the record answer + its source.
- "AG-UI event stream protocol" is just print() to stdout
  with sleep(0.1). There is no bi-directional protocol, no
  session persistence (event_stream is an in-memory list),
  no cryptographic signature, no session hash. This file
  is likewise in-memory only, and it says so.
- Assistants dict keyed by chain_id only would overwrite a
  second assistant on the same chain. This file does not
  use that registry at all; it reads the first-cube agencies.
- Chains 0, 999, 1276, 3471 in the paste are invented /
  example IDs, not Brainchain 500 and not first-cube
  coordinates (500/501). This file uses only Brainchain 500
  and first-cube coordinates.

WHAT THIS FILE DOES:
  ask_with_events(question) -> {"events": [...], "answer": {...}}
  Events, in order, all in memory, none written to the ledger:
    1. INTAKE — "Intake received. Question held in memory only,
       not stored, not sent, not written to any chain record."
       No question text, no prompt string, no session id.
    2. REASONING — one event per real lookup step:
       "Checked agencies.json", "Checked ledger blocks",
       "Matched topic / no topic matched".
    3. OUTPUT — "Answer from <source>" with the record answer,
       or "MISS" with the topic list. No burn, no mass update,
       no confidence score is claimed.

  python3 ui_event_stream.py "What is token think?"
  prints the three phases to stdout, in order, then exits.
  No loop, no daemon, no network, no keys.
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brainchain_qa import answer_question  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))


def ask_with_events(question, base_dir=HERE):
    events = []
    events.append({
        "phase": "INTAKE",
        "source": "UI-Gateway (browser / CLI memory only)",
        "chain_id": 500,
        "message": "Intake received. Question held in memory only, not stored, not sent, not written to any chain record.",
    })
    # Real lookup steps, counted from the actual records.
    try:
        with open(os.path.join(base_dir, "agencies.json")) as f:
            agencies = json.load(f)
        agency_count = len(agencies)
    except Exception:
        agency_count = 0
    try:
        with open(os.path.join(base_dir, "ledger.jsonl")) as f:
            blocks = [json.loads(line) for line in f if line.strip()]
        block_count = len(blocks)
    except Exception:
        block_count = 0
    events.append({
        "phase": "REASONING",
        "source": "Cube record lookup",
        "chain_id": 500,
        "message": f"Checked agencies.json ({agency_count} agencies) and ledger.jsonl ({block_count} blocks).",
    })
    answer = answer_question(question, base_dir)
    if answer["status"] == "ANSWERED":
        events.append({
            "phase": "REASONING",
            "source": "Cube record lookup",
            "chain_id": 500,
            "message": f"Matched a cube record topic. Source: {answer['source']}.",
        })
        events.append({
            "phase": "OUTPUT",
            "source": answer["source"],
            "chain_id": 500,
            "message": answer["answer"],
        })
    else:
        events.append({
            "phase": "REASONING",
            "source": "Cube record lookup",
            "chain_id": 500,
            "message": "No cube record topic matched.",
        })
        events.append({
            "phase": "OUTPUT",
            "source": "none",
            "chain_id": 500,
            "message": answer["answer"],
        })
    return {"events": events, "answer": answer}


def main(argv):
    question = " ".join(argv) if argv else ""
    if not question:
        print("Usage: python3 ui_event_stream.py \"<question>\"")
        return 0
    result = ask_with_events(question)
    for event in result["events"]:
        print(f"[{event['phase']}] Chain {event['chain_id']} | {event['source']}: {event['message']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
