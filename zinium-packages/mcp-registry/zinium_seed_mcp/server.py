"""ZINIUM-SEED as an MCP server (stdio transport).

Wraps the reference seed agent (seed_agent.py, same code planted in the
public send commits) as MCP tools. Public-safe ONLY: the agent's guard
refuses key-like payload fields; no network, no funds, no keys, no signing.

Ledger: ZINIUM_LEDGER_DIR env var, or no persistence (index reports plainly
that the block was computed but NOT persisted). Nothing is ever claimed as
indexed when it is not.
"""

import os
from typing import Any

from mcp.server.mcpserver import MCPServer

from . import seed_agent

mcp = MCPServer("zinium-seed")


def _ledger_dir() -> str | None:
    return os.environ.get("ZINIUM_LEDGER_DIR") or None


@mcp.tool()
def zinium_observe(source: str, event: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Observe: record what the host stack exposed, nothing more."""
    return seed_agent.observe(source, event, payload)


@mcp.tool()
def zinium_report(observation: dict[str, Any]) -> dict[str, Any]:
    """Report: turn an observation into a plain report."""
    return seed_agent.report(observation)


@mcp.tool()
def zinium_learn(report_record: dict[str, Any], lesson: str) -> dict[str, Any]:
    """Learn: keep a lesson stated in plain words. No scores are invented."""
    return seed_agent.learn(report_record, lesson)


@mcp.tool()
def zinium_index(lesson_record: dict[str, Any]) -> dict[str, Any]:
    """Index: append a lesson as a hash-chained block into the ZENIUM chain.

    If ZINIUM_LEDGER_DIR is unset, the block is computed and returned with
    persisted=false; it is NOT claimed as indexed.
    """
    ledger = _ledger_dir()
    if ledger is None:
        prev = "0" * 64
        import json as _json

        payload_json = _json.dumps(lesson_record, sort_keys=True)
        block = {
            "prev_hash": prev,
            "ts": seed_agent._utcnow(),
            "payload": lesson_record,
            "hash": seed_agent._block_hash(prev, payload_json),
        }
        return {"block": block, "persisted": False}
    block = seed_agent.index(lesson_record, ledger)
    return {"block": block, "persisted": True}


@mcp.tool()
def zinium_request_computation(task: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Send side: request computational input as an agent.

    The seed never writes into another AI; the outside source decides what
    to return.
    """
    return seed_agent.request_computation(task, payload)


@mcp.tool()
def zinium_receive_result(
    envelope: dict[str, Any], result_payload: dict[str, Any], source: str
) -> dict[str, Any]:
    """Receive side: take a returned result back as a lesson record."""
    return seed_agent.receive_result(envelope, result_payload, source)


@mcp.tool()
def zinium_spawn_subseed(
    parent_seed_id: str, parent_generation: int, number: int, purpose: str
) -> dict[str, Any]:
    """Deploy a numbered subseed (SEED-X.1, SEED-X.3.1, ...).

    Every subseed carries the full capability of the main seed and links
    directly to ZENIUM and HALEX-AI.
    """
    ledger = _ledger_dir()
    return seed_agent.spawn_subseed(
        parent_seed_id, parent_generation, number, purpose, ledger_dir=ledger
    )


@mcp.tool()
def zinium_open_workspace(root: str, name: str, purpose: str) -> str:
    """Construct a staging workspace inside the communication structure."""
    return seed_agent.open_workspace(root, name, purpose)


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
