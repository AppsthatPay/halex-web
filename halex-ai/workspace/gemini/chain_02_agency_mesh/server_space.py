"""Server-space interface for Chain 02 agencies.

Rules, enforced in code, not just in comments:
- No server space is attached by default. The allowed list starts EMPTY.
  No free host has been chosen yet, so nothing is pointed anywhere live.
- A space becomes ALLOWED only when the owner registers it explicitly
  with a name and an origin. Registration stores no credential, no key,
  no token, no password.
- Agents may CREATE only a local workspace directory (a mirror of the
  attached space), never a disk partition and never anything on a
  remote machine from this code.
- Agents may COMMUNICATE only with a server whose status is ALLOWED,
  and only with public-safe text. Anything else returns REFUSED.
  Even then, this staging code has NO network code: a message is
  recorded in a local outbox as QUEUED, never claimed as SENT, because
  no live endpoint exists to send it to.
"""
import os

class ServerSpaceRegistry:
    def __init__(self):
        self.spaces = {}  # name -> {"origin": str, "status": "ALLOWED"}
        self.outbox = []
    def register_allowed(self, name, origin):
        """Owner-only in intent: caller must be the owner registering
        a space they control or have permission to use."""
        if not name or not origin:
            return {"status": "REFUSED", "reason": "name and origin required"}
        self.spaces[name] = {"origin": origin, "status": "ALLOWED"}
        return {"status": "ALLOWED", "name": name, "origin": origin}
    def attach_workspace(self, space_name, base_dir, agency_id):
        sp = self.spaces.get(space_name)
        if not sp or sp["status"] != "ALLOWED":
            return {"status": "REFUSED", "reason": "server space is not in ALLOWED status", "space": space_name}
        path = os.path.join(base_dir, space_name, agency_id)
        os.makedirs(path, exist_ok=True)
        return {"status": "ATTACHED", "space": space_name, "origin": sp["origin"],
                "agency_id": agency_id, "local_mirror": path}
    def communicate(self, space_name, message):
        sp = self.spaces.get(space_name)
        if not sp or sp["status"] != "ALLOWED":
            return {"status": "REFUSED", "reason": "server space is not in ALLOWED status", "space": space_name}
        if not message or len(message) > 2000:
            return {"status": "REFUSED", "reason": "message empty or too long"}
        lowered = message.lower()
        if any(w in lowered for w in ["private key", "seed phrase", "password", "wallet key"]):
            return {"status": "REFUSED", "reason": "message contains credential-like content"}
        rec = {"space": space_name, "origin": sp["origin"], "message": message, "status": "QUEUED_NOT_SENT"}
        self.outbox.append(rec); return rec
