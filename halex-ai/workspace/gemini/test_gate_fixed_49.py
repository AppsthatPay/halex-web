
import sys, os, unittest, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "chain_03_remote_infrastructure"))
from chain_03_engine import OptInPackage, WorkspaceManager, SeedMarkerMesh, Chain03Orchestrator
class T(unittest.TestCase):
    def test_refuses_remote_implant(self):
        p = OptInPackage("someone-else-server", "Linux")
        self.assertEqual(p.deploy("adopt", opt_in=True)["status"], "DEPLOY_REFUSED")
        self.assertEqual(OptInPackage("localhost", "Linux").deploy("x", opt_in=False)["status"], "DEPLOY_REFUSED")
        self.assertEqual(OptInPackage("localhost", "Linux").deploy("x", opt_in=True)["status"], "DEPLOYED_LOCAL_ONLY")
    def test_workspace_is_directory(self):
        with tempfile.TemporaryDirectory() as d:
            w = WorkspaceManager(d); r = w.create_workspace("testws")
            self.assertEqual(r["kind"], "directory"); self.assertTrue(os.path.isdir(r["path"]))
    def test_seed_is_label_not_token(self):
        m = SeedMarkerMesh()
        self.assertEqual(m.embed_token("https://example.com", "SECRET")["status"], "REFUSED_TOKEN_STORAGE")
        self.assertEqual(m.marker_for("hello")["status"], "LABEL_ONLY_NOT_ACCESS")
    def test_orchestrator(self):
        with tempfile.TemporaryDirectory() as d:
            o = Chain03Orchestrator(d); self.assertEqual(len(o.remote_agents), 25)
            self.assertEqual(o.remote_agents[0]["status"], "REGISTERED_NOT_ONLINE")
            r = o.adoption_cycle("someone-else", "Linux", "x", opt_in=True)
            self.assertFalse(r["synchronized"]); self.assertIsNone(r["workspace"])
if __name__ == "__main__": unittest.main()
