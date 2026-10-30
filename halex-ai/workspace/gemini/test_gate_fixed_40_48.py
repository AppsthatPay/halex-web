
import sys, os, unittest, tempfile
ROOT = os.path.dirname(__file__)
for d in ["synaptic_mesh","evolution_mesh","encyclopedia_multilingual_kit","knowledge_database_code","media_creation_codec_suite","quantum_security_consensus","chain_01_codebase","chain_02_agency_mesh","agent_programming_mesh"]:
    sys.path.insert(0, os.path.join(ROOT, d))
from synaptic_engine import SynapticMesh
from evolution_engine import EvolutionMesh
from encyclopedia_engine import query as enc_q, translate as enc_t
from database_engine import query as db_q, translate as db_t
from media_engine import ingest_bytes, create_text_asset, view_text
from security_engine import HashChain
from chain_01_engine import query as c01
from chain_02_engine import Chain02Mesh
from agent_program_engine import Orchestrator, DevAgent

class T(unittest.TestCase):
    def test40(self):
        m = SynapticMesh(); self.assertIsNone(m.plasticity("x"))
        m.record("x", True); m.record("x", False)
        self.assertEqual(m.plasticity("x"), 0.5)
        self.assertFalse(m.synthesize("abc")["mutated"])
        self.assertTrue(m.synthesize("abc", lambda s: s+"!")["mutated"])
    def test41(self):
        e = EvolutionMesh(); self.assertEqual(e.generation, 0)
        self.assertEqual(e.step(["a"], {})["status"], "NOT_COMPLETED")
        self.assertEqual(e.step(["a"], {"a": "done"})["generation"], 1)
        self.assertEqual(e.decompose("goal", [])["status"], "INVALID")
    def test42(self):
        self.assertEqual(enc_q("python")["status"], "FOUND")
        self.assertEqual(enc_q("gibberishxyz")["status"], "NOT_FOUND")
        self.assertEqual(enc_t("software", "fr")["translation"], "logiciel")
        self.assertEqual(enc_t("gibberishxyz", "fr")["status"], "NOT_TRANSLATED")
    def test43(self):
        self.assertEqual(db_q("python programming")["status"], "FOUND")
        self.assertEqual(db_q("quantum banana")["status"], "NOT_FOUND")
        self.assertEqual(db_t("software", "zz")["status"], "NOT_TRANSLATED")
    def test44(self):
        r = ingest_bytes("a.txt", b"hello "*100)
        self.assertLess(r["compressed_size"], r["size"]); self.assertFalse(r["generated"])
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "t.txt"); a = create_text_asset(p, "hello world")
            self.assertTrue(a["created"]); self.assertEqual(view_text(p)["status"], "VIEWED_TEXT")
    def test45(self):
        h = HashChain(); a = h.append("p1", "m"); b = h.append("p2", "m")
        self.assertEqual(b["prev_hash"], a["hash"]); self.assertTrue(h.verify())
        h.records[0]["payload"] = "tampered"; self.assertFalse(h.verify())
    def test46(self):
        q = c01("rust"); self.assertTrue(q["found"]); self.assertEqual(q["access_status"], "INDEX_ONLY")
        self.assertFalse(c01("gibberishxyz")["found"])
        self.assertEqual(len(c01("").get("matched_languages", {})), 14)  # duplicate Rust removed
    def test47(self):
        m = Chain02Mesh(); s = m.summary()
        self.assertEqual((s["general_agencies"], s["general_agents"], s["dev_agencies"], s["dev_agents"]), (150, 300, 50, 100))
        d = m.dispatch("x"); self.assertEqual(d["not_executed"], 200)
        d2 = m.dispatch("x", lambda t: "ok"); self.assertEqual(d2["executed"], 200)
    def test48(self):
        o = Orchestrator(); self.assertEqual(o.counts(), {"general_agents": 300, "dev_agents": 100})
        py = DevAgent("D1", "A", "Python"); self.assertTrue(py.write_and_compile("m", "x = 1\n")["compiled"])
        self.assertFalse(py.write_and_compile("m", "x = \n")["compiled"])
        rs = DevAgent("D2", "A", "Rust"); self.assertEqual(rs.write_and_compile("m", "fn main(){}")["compilation_status"], "COMPILER_NOT_AVAILABLE")
if __name__ == "__main__": unittest.main()
