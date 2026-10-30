"""Gate-fixed Module 48 AAPE-300100. General agents execute only via a
caller-supplied handler. Developer agents compile Python for real with
py_compile; other languages return COMPILER_NOT_AVAILABLE, never a
fake 1024 KB binary."""
import py_compile, tempfile, os
class GeneralAgent:
    def __init__(self, agent_id, agency_id): self.agent_id=agent_id; self.agency_id=agency_id
    def execute(self, task, handler=None):
        if handler is None: return {"agent_id": self.agent_id, "status": "NOT_EXECUTED", "task": task}
        return {"agent_id": self.agent_id, "status": "COMPLETED", "result": handler(task)}
class DevAgent:
    def __init__(self, dev_id, agency_id, language): self.dev_id=dev_id; self.agency_id=agency_id; self.language=language
    def write_and_compile(self, module_name, code):
        if self.language != "Python":
            return {"developer_id": self.dev_id, "language": self.language, "compilation_status": "COMPILER_NOT_AVAILABLE", "compiled": False, "binary_size_kb": None}
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, module_name + ".py")
            with open(p, "w") as f: f.write(code)
            try: py_compile.compile(p, doraise=True)
            except Exception as e: return {"developer_id": self.dev_id, "language": "Python", "compilation_status": "FAILED", "compiled": False, "error": str(e)}
            return {"developer_id": self.dev_id, "language": "Python", "compilation_status": "SUCCESS", "compiled": True, "size_bytes": len(code.encode())}
class Orchestrator:
    def __init__(self):
        self.general = [GeneralAgent(f"GEN-AGENT-{i}-A", f"GEN-AGENCY-{i:03d}") for i in range(1, 151)] + [GeneralAgent(f"GEN-AGENT-{i}-B", f"GEN-AGENCY-{i:03d}") for i in range(1, 151)]
        langs = ["Rust", "Python", "C++", "Solidity", "Go"]
        self.devs = []
        for j in range(1, 51):
            self.devs.append(DevAgent(f"DEV-AGENT-{j}-1", f"DEV-AGENCY-{j:03d}", langs[(j-1)%5]))
            self.devs.append(DevAgent(f"DEV-AGENT-{j}-2", f"DEV-AGENCY-{j:03d}", langs[j%5]))
    def counts(self): return {"general_agents": len(self.general), "dev_agents": len(self.devs)}
