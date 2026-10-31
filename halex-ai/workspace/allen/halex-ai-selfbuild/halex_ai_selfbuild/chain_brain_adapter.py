"""Chain-Brain builder adapter for the HALEX-AI self-build loop.

Connects the autonomous builder to the chain-brain memory engine
so it can WRITE and BUILD onto a chain-brain, under the gate:

- A builder entry (a dict, or a gated queue JSON) names a chain,
  an agency, a category, a record id, and text content.
- The adapter loads (or creates) a JSON snapshot of a chain-brain,
  stores the record through the real chain-brain modules, checks
  the store result (a refused store is NEVER reported as stored),
  re-verifies agency coverage, and saves the snapshot back.
- Sensitive content is refused by the memory store and reported
  as REFUSED_SENSITIVE, with nothing saved.
- A model entry trains an OLS model and generates a text blueprint
  through the real ML module, with the same store-result checks.
- Optionally the attempt is sealed with the self-build seal chain
  (caller passes a seal log path; the adapter never touches the
  local ZINIUM ledger itself -- the gate folds lessons in).

What this adapter does NOT do: it does not auto-run inside
cycle.py (the cycle is deliberately unchanged, so the gate still
disposes), it does not lift the SuperAllen gate, it does not
provision cloud infrastructure, and it never stores keys, seeds,
passwords, wallets, or payments. Standard library only. No network.
No subprocess. No shell.

Snapshot format (plain JSON, text records only):
    {"chains": [{"id", "name", "category", "space_allotted"}],
     "agencies": [{"agency_id", "chain_id", "category", "start", "end"}],
     "records": [{"id", "chain_id", "agency_id", "category", "content",
                  "provenance", "shard_id"?}]}
On load, records are re-stored through the memory store, so a
snapshot that fails to reload is reported, not silently repaired.
"""

import json
import sys
from pathlib import Path


def _load_chain_brain_modules(chain_brain_dir):
    """Import chain-brain modules from a directory by path."""
    chain_brain_dir = Path(chain_brain_dir).resolve()
    if str(chain_brain_dir) not in sys.path:
        sys.path.insert(0, str(chain_brain_dir))
    from chain_registry import ChainRegistry
    from agency_manager import AgencyManager
    from memory_store import MemoryStore
    from shard_protocol import ShardProtocol
    from division import DivisionManager
    from interconnect import InterconnectManager
    from conversational_engine import ConversationalEngine
    from ml_deployment_manager import MLDeploymentManager
    from space_manager import SpaceManager
    return {
        "ChainRegistry": ChainRegistry,
        "AgencyManager": AgencyManager,
        "MemoryStore": MemoryStore,
        "ShardProtocol": ShardProtocol,
        "DivisionManager": DivisionManager,
        "InterconnectManager": InterconnectManager,
        "ConversationalEngine": ConversationalEngine,
        "MLDeploymentManager": MLDeploymentManager,
        "SpaceManager": SpaceManager,
    }


def _build_components(mods):
    registry = mods["ChainRegistry"]()
    agency_mgr = mods["AgencyManager"](registry)
    memory_store = mods["MemoryStore"](registry, agency_mgr)
    shard_proto = mods["ShardProtocol"](registry, agency_mgr, memory_store)
    division_mgr = mods["DivisionManager"](registry, agency_mgr, memory_store, shard_proto)
    interconnect = mods["InterconnectManager"](registry, agency_mgr, memory_store, shard_proto)
    conversation = mods["ConversationalEngine"](memory_store)
    ml_mgr = mods["MLDeploymentManager"](registry, memory_store, agency_mgr)
    space_mgr = mods["SpaceManager"](registry)
    return {
        "registry": registry, "agency_mgr": agency_mgr,
        "memory_store": memory_store, "shard_proto": shard_proto,
        "division_mgr": division_mgr, "interconnect": interconnect,
        "conversation": conversation, "ml_mgr": ml_mgr,
        "space_mgr": space_mgr,
    }


def _ensure_chain_agency(comp, chain, agency):
    registry = comp["registry"]
    agency_mgr = comp["agency_mgr"]
    if registry.get_chain(chain["id"])["status"] == "NOT_FOUND":
        res = registry.register_chain(
            chain["id"], chain.get("name", chain["id"]),
            chain.get("category", "general"),
            chain.get("space_allotted", 0))
        if res["status"] != "REGISTERED":
            return res
    if agency_mgr.get_agency(agency["agency_id"])["status"] == "NOT_FOUND":
        res = agency_mgr.create_agency(
            agency["agency_id"], chain["id"], agency["category"],
            agency["start"], agency["end"])
        if res["status"] != "AGENCY_CREATED":
            return res
    return {"status": "OK"}


def _snapshot_data(comp):
    registry = comp["registry"]
    agency_mgr = comp["agency_mgr"]
    memory_store = comp["memory_store"]
    chains = []
    for cid in registry.list_chains():
        chain = registry.get_chain(cid)["chain"]
        chains.append({
            "id": cid, "name": chain["name"], "category": chain["category"],
            "space_allotted": chain["space_allotted"],
        })
    agencies = []
    for aid, ag in agency_mgr.agencies.items():
        agencies.append({
            "agency_id": aid, "chain_id": ag["chain_id"],
            "category": ag["category"], "start": ag["start_address"],
            "end": ag["end_address"],
        })
    records = []
    for rec in memory_store.records.values():
        item = {
            "id": rec["id"], "chain_id": rec["chain_id"],
            "agency_id": rec["agency_id"], "category": rec["category"],
            "content": rec["content"], "provenance": rec["provenance"],
        }
        if "shard_id" in rec:
            item["shard_id"] = rec["shard_id"]
        records.append(item)
    return {"chains": chains, "agencies": agencies, "records": records}


def _load_snapshot(comp, data):
    for chain in data.get("chains", []):
        # Register chain directly (agency step below handles agencies).
        registry = comp["registry"]
        if registry.get_chain(chain["id"])["status"] == "NOT_FOUND":
            registry.register_chain(chain["id"], chain.get("name", chain["id"]),
                                    chain.get("category", "general"),
                                    chain.get("space_allotted", 0))
    for agency in data.get("agencies", []):
        comp["agency_mgr"].create_agency(
            agency["agency_id"], agency["chain_id"], agency["category"],
            agency["start"], agency["end"])
    for rec in data.get("records", []):
        res = comp["memory_store"].store_record(
            rec["id"], rec["chain_id"], rec["agency_id"], rec["category"],
            rec["content"], rec.get("provenance", "internal-audit"))
        if res["status"] != "STORED":
            return {"status": "ERROR",
                    "reason": f"SNAPSHOT_RECORD_FAILED:{rec['id']}:{res.get('reason', res['status'])}"}
        if "shard_id" in rec:
            comp["memory_store"].records[rec["id"]]["shard_id"] = rec["shard_id"]
    return {"status": "OK"}


def draft_knowledge_from_conversation(chain_brain_dir, snapshot_path, text, drafts_dir):
    """Learn from a conversation WITHOUT storing the conversation.

    Loads a chain-brain snapshot, routes the message through the
    conversational engine (keyword overlap over stored records),
    and, on a MATCH, writes a knowledge DRAFT under drafts_dir for
    gate review: topic = matched category, source = matched record
    id, summary = the stored record's content. The user's message
    text is never written to the draft, the snapshot, or any chain.
    On a MISS it writes nothing and says so. Returns the engine
    result plus draft_path (or None).
    """
    mods = _load_chain_brain_modules(chain_brain_dir)
    comp = _build_components(mods)
    snapshot_path = Path(snapshot_path)
    if snapshot_path.exists():
        data = json.loads(snapshot_path.read_text(encoding="utf-8"))
        loaded = _load_snapshot(comp, data)
        if loaded["status"] != "OK":
            return {"status": "ERROR", "reason": loaded["reason"]}
    result = comp["conversation"].respond(text)
    if result["status"] != "MATCH":
        return {**result, "draft_path": None}
    drafts_dir = Path(drafts_dir)
    drafts_dir.mkdir(parents=True, exist_ok=True)
    rec = comp["memory_store"].lookup_by_id(result["record_id"])["record"]
    draft_path = drafts_dir / f"chainbrain-learn-{result['record_id']}.md"
    draft_path.write_text(
        "# Chain-Brain conversation-learn draft (gate review only)\n\n"
        f"Topic category: {result['category']}\n"
        f"Source record: {result['record_id']} (chain {result['chain_id']}, "
        f"agency {result['agency_id']})\n\n"
        f"Stored knowledge: {rec['content']}\n\n"
        "Note: the conversation message that led here is NOT recorded, "
        "by design. This draft is knowledge only, for gate review.\n",
        encoding="utf-8")
    return {**result, "draft_path": str(draft_path)}


def build_onto_chain_brain(chain_brain_dir, snapshot_path, entry, seal_log=None):
    """Build one gated entry onto a chain-brain snapshot.

    entry (record): {"kind": "record", "chain": {...}, "agency": {...},
        "record_id": ..., "category": ..., "content": ...,
        "provenance": "ZINIUM-SEED-..."}
    entry (model): {"kind": "model", "chain": {...}, "agency": {...},
        "model_id": ..., "x": [...], "y": [...],
        "blueprint_cloud": "AWS" | None}
    Returns a report dict. A stored claim is made only when the
    underlying store returned STORED.
    """
    mods = _load_chain_brain_modules(chain_brain_dir)
    comp = _build_components(mods)
    snapshot_path = Path(snapshot_path)
    if snapshot_path.exists():
        data = json.loads(snapshot_path.read_text(encoding="utf-8"))
        loaded = _load_snapshot(comp, data)
        if loaded["status"] != "OK":
            return {"status": "ERROR", "reason": loaded["reason"], "entry": entry.get("id")}
    chain = entry["chain"]
    agency = entry["agency"]
    ensured = _ensure_chain_agency(comp, chain, agency)
    if ensured["status"] != "OK":
        return {"status": "ERROR", "reason": ensured.get("reason", ensured["status"])}
    kind = entry.get("kind")
    if kind == "record":
        res = comp["memory_store"].store_record(
            entry["record_id"], chain["id"], agency["agency_id"],
            entry["category"], entry["content"],
            entry.get("provenance", "internal-audit"))
        if res["status"] != "STORED":
            return {"status": res["status"], "reason": res.get("reason"),
                    "record_id": entry["record_id"]}
        outcome = {"status": "BUILT", "record_id": entry["record_id"]}
    elif kind == "model":
        res = comp["ml_mgr"].train_model(
            entry["model_id"], chain["id"], agency["agency_id"],
            entry["x"], entry["y"])
        if res["status"] != "TRAINED_MODEL_STORED":
            return {"status": res["status"], "reason": res.get("reason"),
                    "model_id": entry["model_id"]}
        outcome = {"status": "BUILT", "model_id": entry["model_id"],
                   "model": res["model"]}
        if entry.get("blueprint_cloud"):
            bp = comp["ml_mgr"].generate_deployment_blueprint(
                entry["model_id"], entry["blueprint_cloud"],
                chain["id"], agency["agency_id"])
            if bp["status"] != "BLUEPRINT_GENERATED":
                return {"status": bp["status"], "reason": bp.get("reason"),
                        "model_id": entry["model_id"]}
            outcome["blueprint_id"] = bp["blueprint_id"]
    else:
        return {"status": "ERROR", "reason": "UNKNOWN_ENTRY_KIND"}
    coverage = comp["agency_mgr"].verify_coverage(chain["id"])
    if coverage["status"] not in ("COVERAGE_VERIFIED", "VERIFIED_EMPTY"):
        return {"status": "ERROR", "reason": "COVERAGE_FAILED"}
    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot_path.write_text(
        json.dumps(_snapshot_data(comp), indent=2, sort_keys=True),
        encoding="utf-8")
    if seal_log is not None:
        from . import seal as seal_mod
        seal_mod.append_entry(
            seal_log, {"event": "chain_brain_build", **outcome},
            entry.get("provenance", "internal-audit"))
    outcome["snapshot"] = str(snapshot_path)
    outcome["records_total"] = len(comp["memory_store"].records)
    return outcome
