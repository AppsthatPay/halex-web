"""Gate-fixed Module 49 C03-RISE.

What was REMOVED and why:
- No implant is deployed to any other system. The submitted "Sequim
  implant" claimed remote access to any OS/server; that is unauthorized
  access if the target did not invite it, and Allen will not build it.
  The replacement only prepares a package for a host that explicitly
  opts in, and only on localhost in this staging code.
- No disk partitions are created or mounted. The replacement creates
  an ordinary directory under a caller-supplied base path, and says
  directory, not partition.
- No browser SEED token is embedded anywhere, and no secret token is
  stored. A SEED here is a provenance label only, never access.
- No remote agent is ONLINE_LISTENING. The 25 IDs are a registry,
  nothing more. No network code exists in this file.
- No ZINIUM-SECURE-FS exists. No encryption claim is made.
"""
import hashlib, os

class OptInPackage:
    """Prepares a package manifest. Deployment is refused unless the
    caller explicitly opts in AND the target is localhost."""
    def __init__(self, target_system, target_os):
        self.target_system = target_system; self.target_os = target_os
    def prepare(self, directive):
        return {"target_system": self.target_system, "target_os": self.target_os,
                "directive": directive, "status": "PACKAGE_PREPARED_NOT_DEPLOYED",
                "seed_marker": "ZINIUM-SEED-GEMINI"}
    def deploy(self, directive, opt_in=False):
        if not opt_in or self.target_system != "localhost":
            return {"status": "DEPLOY_REFUSED", "reason": "requires explicit opt-in and localhost target",
                    "target_system": self.target_system}
        return {"status": "DEPLOYED_LOCAL_ONLY", "target_system": "localhost", "directive": directive}

class WorkspaceManager:
    """Creates ordinary directories, not disk partitions."""
    def __init__(self, base):
        self.base = base; self.workspaces = []
    def create_workspace(self, label):
        path = os.path.join(self.base, label)
        os.makedirs(path, exist_ok=True)
        rec = {"label": label, "path": path, "kind": "directory", "status": "CREATED"}
        self.workspaces.append(rec); return rec

class SeedMarkerMesh:
    """Provenance labels only. Secret tokens are never stored."""
    def __init__(self): self.markers = []
    def marker_for(self, content):
        h = hashlib.sha256(content.encode()).hexdigest()[:16]
        rec = {"marker": "ZINIUM-SEED-GEMINI", "content_hash": h, "status": "LABEL_ONLY_NOT_ACCESS"}
        self.markers.append(rec); return rec
    def embed_token(self, origin, token):
        return {"status": "REFUSED_TOKEN_STORAGE", "origin": origin,
                "reason": "a SEED label is provenance, not a credential, and is never embedded as a token"}

class Chain03Orchestrator:
    def __init__(self, base):
        self.workspace_manager = WorkspaceManager(base)
        self.seed_mesh = SeedMarkerMesh()
        self.remote_agents = [{"agent_id": f"REMOTE-AGENT-{i:03d}", "status": "REGISTERED_NOT_ONLINE"} for i in range(1, 26)]
    def adoption_cycle(self, target_system, target_os, directive, opt_in=False):
        pkg = OptInPackage(target_system, target_os)
        deploy = pkg.deploy(directive, opt_in=opt_in)
        ws = self.workspace_manager.create_workspace(f"workspace_{target_system}") if deploy["status"] == "DEPLOYED_LOCAL_ONLY" else None
        return {"deploy": deploy, "workspace": ws, "remote_agents_registered": len(self.remote_agents),
                "seed_marker": "ZINIUM-SEED-GEMINI", "synchronized": False}
