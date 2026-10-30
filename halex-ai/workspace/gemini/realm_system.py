"""HALEX-AI realm: a working system grafting gate-fixed Modules 40-49.

This is the graft point, not a new brain. It wires the existing engines
together and runs one real end-to-end cycle. Every step reports what it
actually did; nothing here claims a seal, a quantum effect, a remote
implant, or a sent message.
"""
import os, sys, tempfile, json
HERE = os.path.dirname(__file__)
for d in ["synaptic_mesh","evolution_mesh","encyclopedia_multilingual_kit","knowledge_database_code",
          "media_creation_codec_suite","quantum_security_consensus","chain_01_codebase",
          "chain_02_agency_mesh","agent_programming_mesh","chain_03_remote_infrastructure","chain_03_research_agencies","chain_04_mapping_mesh","halex_pure_ai_core"]:
    sys.path.insert(0, os.path.join(HERE, d))
from synaptic_engine import SynapticMesh
from evolution_engine import EvolutionMesh
from encyclopedia_engine import query as enc_q
from database_engine import query as db_q
from media_engine import ingest_bytes, create_text_asset
from security_engine import HashChain
from chain_01_engine import query as c01
from chain_02_engine import Chain02Mesh
from chain_02_agency_mesh.server_space import ServerSpaceRegistry
from agent_program_engine import Orchestrator, DevAgent
from chain_03_engine import Chain03Orchestrator
from research_agency_engine import Chain03ResearchOrchestrator
from mapping_engine import Chain04MappingOrchestrator, straight_line_km
from halex_core_engine import telemetry as core_telemetry

def run_cycle():
    out = {}
    out["encyclopedia_python"] = enc_q("python")["status"]
    out["encyclopedia_unknown"] = enc_q("gibberishxyz")["status"]
    out["database_python"] = db_q("python programming")["status"]
    m = SynapticMesh(); m.record("node1", True); m.record("node1", False)
    out["synaptic_plasticity"] = m.plasticity("node1")
    e = EvolutionMesh(); out["evolution_generation"] = e.step(["a"], {"a": "done"})["generation"]
    r = ingest_bytes("demo.txt", b"hello realm " * 50)
    out["media_compressed_smaller"] = r["compressed_size"] < r["size"]
    h = HashChain(); h.append("lesson1", "GEMINI"); h.append("lesson2", "GEMINI")
    out["hash_chain_verify"] = h.verify()
    out["chain01_rust"] = c01("rust")["access_status"]
    mesh = Chain02Mesh(); out["chain02_summary"] = mesh.summary()
    out["chain02_dispatch_no_handler_not_executed"] = mesh.dispatch("demo")["not_executed"]
    out["chain02_dispatch_with_handler_executed"] = mesh.dispatch("demo", lambda t: "ok")["executed"]
    orch = Orchestrator(); out["agent_counts"] = orch.counts()
    py = DevAgent("D1", "A", "Python")
    out["python_compile"] = py.write_and_compile("demo", "x = 1\n")["compiled"]
    out["rust_compile"] = DevAgent("D2", "A", "Rust").write_and_compile("demo", "fn main(){}")["compilation_status"]
    # Server space: starts empty, so communication is refused until allowed
    reg = ServerSpaceRegistry()
    out["server_space_default_allowed_count"] = len(reg.spaces)
    out["server_communicate_before_allowed"] = reg.communicate("free-space", "hello")["status"]
    with tempfile.TemporaryDirectory() as d:
        reg.register_allowed("free-space", "https://example-allowed-space.invalid")
        out["server_attach"] = reg.attach_workspace("free-space", d, "GEN-AGENCY-001")["status"]
        out["server_communicate_after_allowed"] = reg.communicate("free-space", "hello from HALEX-AI")["status"]
        c03 = Chain03Orchestrator(d)
        out["chain03_remote_agents_registered"] = len(c03.remote_agents)
        out["chain03_remote_deploy_refused"] = c03.adoption_cycle("someone-else", "Linux", "x", opt_in=True)["deploy"]["status"]
    res = Chain03ResearchOrchestrator(); out["research_summary"] = res.summary()
    out["research_no_provider"] = res.research_agencies[0].execute("python")["status"]
    out["research_cross_chain_chain01"] = res.cross_chain_pull_and_research("chain-01", "rust")["status"]
    m4 = Chain04MappingOrchestrator(); out["mapping_summary"] = m4.summary()
    out["mapping_distance_murphy_portcharlotte"] = straight_line_km("Murphy NC", "Port Charlotte FL")
    out["core_status"] = core_telemetry()["status"]
    return out

if __name__ == "__main__":
    print(json.dumps(run_cycle(), indent=2, sort_keys=True))
