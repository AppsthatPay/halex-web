"""Module 10: Browser Bridge & Extension Protocol Handler (browser_bridge.py).

Python standard library only.
- Exposes standard JSON request handlers for browser extensions and
  autonomous builders.
- Validates and writes generated artifacts directly into Chain-Brain
  memory stores and shard maps.

Gate note (Allen, 2026-10-30): THREE fixes to the returned code,
plus one missing piece built for real.
(1) The returned bridge had NO http.server code at all, despite the
description claiming a local server on port 8000. The extension
would have fetched to nothing. This version implements a real
localhost-only server (``BrowserBridgeServer``, stdlib http.server,
bound to 127.0.0.1 only, POST /api/chain-brain only, 64 KB body cap,
JSON only). It is NOT a public API and must never be bound to a
public address: there is no authentication, by design, because the
trust boundary is "a process on this same machine". Anyone local
can write through it, which is why it stays local-only and staging.
(2) Category mismatch, same pattern as Module 9: the returned test
agency was category "autonomous" while the write payload was
"autonomous_build", so the memory store would refuse the write
while the bridge was expected to report SUCCESS. This version is
STRICT: a payload category that differs from the agency's category
returns ERROR CATEGORY_MISMATCH_WITH_AGENCY and stores nothing.
No silent rewrite, no success claim. The test agency category is
"autonomous_build" to match the payload, honestly.
(3) Provenance ("browser-extension-builder") is a LABEL, not
authentication. A record's provenance proves nothing about who
sent it. The bridge never executes content: an artifact is a TEXT
record, never code to run. No eval, no exec, no subprocess.
(4) The extension files were fixed alongside: no remote Tailwind
CDN script (inline styles only), the UI no longer claims success
when the bridge returned an error, and the button text says what
it really does (writes a text artifact record).
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Dict, Any

MAX_BODY_BYTES = 64 * 1024


class BrowserBridge:
    def __init__(self, registry, memory_store, shard_protocol, agency_manager,
                 conversation_engine=None):
        self.registry = registry
        self.memory_store = memory_store
        self.shard_protocol = shard_protocol
        self.agency_manager = agency_manager
        # Optional: a ConversationalEngine over the same memory store.
        # Asking it stores NOTHING; it only answers from stored records.
        self.conversation_engine = conversation_engine

    def handle_extension_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(payload, dict):
            return {"status": "ERROR", "reason": "PAYLOAD_MUST_BE_OBJECT"}
        action = payload.get("action")

        if action == "write_artifact":
            record_id = payload.get("record_id")
            chain_id = payload.get("chain_id")
            agency_id = payload.get("agency_id")
            category = payload.get("category", "autonomous_build")
            content = payload.get("content")
            provenance = payload.get("provenance", "browser-extension-builder")
            if not all([record_id, chain_id, agency_id, content]):
                return {"status": "ERROR", "reason": "MISSING_REQUIRED_FIELDS"}
            if not all(isinstance(v, str) for v in (record_id, chain_id, agency_id, content)):
                return {"status": "ERROR", "reason": "INVALID_FIELD_TYPE"}
            # Strict category rule: the record category must equal the
            # agency's category, or nothing is stored.
            agency_res = self.agency_manager.get_agency(agency_id)
            if agency_res["status"] == "NOT_FOUND":
                return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
            if agency_res["agency"]["category"] != category:
                return {"status": "ERROR", "reason": "CATEGORY_MISMATCH_WITH_AGENCY",
                        "agency_category": agency_res["agency"]["category"],
                        "payload_category": category}
            store_res = self.memory_store.store_record(
                record_id, chain_id, agency_id, category, content, provenance)
            if store_res["status"] == "STORED":
                return {
                    "status": "SUCCESS",
                    "action": "write_artifact",
                    "record": store_res["record"],
                }
            elif store_res["status"] == "REFUSED_SENSITIVE":
                return {"status": "REFUSED_SENSITIVE", "reason": store_res["reason"]}
            else:
                return {"status": "ERROR",
                        "reason": store_res.get("reason", "UNKNOWN_STORAGE_ERROR")}

        elif action == "ask_chain_brain":
            # Learn from the conversation: keyword-route the message to
            # stored records, answer in human dialog with a follow-up.
            # The message itself is NEVER stored, by engine design.
            text = payload.get("text")
            if not text or not isinstance(text, str):
                return {"status": "ERROR", "reason": "MISSING_TEXT"}
            if self.conversation_engine is None:
                return {"status": "ERROR", "reason": "CONVERSATION_ENGINE_NOT_WIRED"}
            return self.conversation_engine.respond(text)

        elif action == "query_memory":
            query_id = payload.get("record_id")
            if not query_id:
                return {"status": "ERROR", "reason": "MISSING_RECORD_ID"}
            lookup = self.shard_protocol.lookup_across_shards(query_id)
            return lookup

        else:
            return {"status": "ERROR", "reason": "UNKNOWN_ACTION"}


def make_handler(bridge):
    """Build a request handler bound to one bridge instance."""
    class ChainBrainHandler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *args):  # keep the local server quiet
            pass

        def _send_json(self, code, obj):
            body = json.dumps(obj).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self):
            if self.path != "/api/chain-brain":
                self._send_json(404, {"status": "ERROR", "reason": "NOT_FOUND"})
                return
            try:
                length = int(self.headers.get("Content-Length", 0))
            except ValueError:
                self._send_json(400, {"status": "ERROR", "reason": "INVALID_CONTENT_LENGTH"})
                return
            if length <= 0 or length > MAX_BODY_BYTES:
                self._send_json(413, {"status": "ERROR", "reason": "BODY_TOO_LARGE_OR_EMPTY"})
                return
            try:
                raw = self.rfile.read(length)
                payload = json.loads(raw.decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                self._send_json(400, {"status": "ERROR", "reason": "INVALID_JSON"})
                return
            result = bridge.handle_extension_request(payload)
            self._send_json(200, result)

        def do_GET(self):
            self._send_json(404, {"status": "ERROR", "reason": "NOT_FOUND"})

    return ChainBrainHandler


class BrowserBridgeServer:
    """Localhost-only bridge server. Never bind this to a public address.

    ``start(port=0)`` binds 127.0.0.1 and returns the actual port
    (port 0 = an ephemeral port, used by the tests). Call ``stop()``
    to shut it down. No authentication exists on this server: local
    process only, by design.
    """

    def __init__(self, bridge, host="127.0.0.1", port=8000):
        if host != "127.0.0.1":
            raise ValueError("BrowserBridgeServer binds localhost only")
        self._server = ThreadingHTTPServer((host, port), make_handler(bridge))
        self._server.daemon_threads = True

    @property
    def port(self):
        return self._server.server_address[1]

    def start(self):
        import threading
        thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        thread.start()
        return self.port

    def stop(self):
        self._server.shutdown()
        self._server.server_close()
