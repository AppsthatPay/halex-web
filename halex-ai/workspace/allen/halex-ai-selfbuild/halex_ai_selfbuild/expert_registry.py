"""REAL expandable Mixture-of-Experts pool.

A JSON registry of experts:
  {name, module_path, capabilities: [keyword phrases], weight,
   routed_count, success_count}

Router: score = keyword-token overlap between the query and an expert's
capability phrases, multiplied by the expert's current weight. The best
eligible (score > 0) expert wins.

Weights learn from MEASURED outcomes only: after outcomes are recorded,
weight moves halfway toward a target derived from the observed success
rate (rate 0 -> 0.5, rate 1 -> 2.0), clamped to [0.5, 2.0]. No outcome,
no movement; nothing here "tunes" itself on claims.

Registration is validated: the module file must exist and import cleanly
in a subprocess, otherwise registration is REFUSED and the registry is
left unchanged.
"""

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

MIN_WEIGHT = 0.5
MAX_WEIGHT = 2.0


def _tokens(text):
    return set("".join(ch if ch.isalnum() else " " for ch in str(text).lower()).split())


class ExpertRegistry:
    def __init__(self, registry_path):
        self.path = Path(registry_path).resolve()
        self.data = self._load()

    def _load(self):
        if self.path.exists():
            try:
                data = json.loads(self.path.read_text(encoding="utf-8"))
                if isinstance(data, dict) and isinstance(data.get("experts"), list):
                    return data
            except ValueError:
                pass
        return {"experts": []}

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=2, sort_keys=True),
                             encoding="utf-8")

    def experts(self):
        return list(self.data["experts"])

    def get(self, name):
        for expert in self.data["experts"]:
            if expert["name"] == name:
                return expert
        return None

    # -- registration ------------------------------------------------------
    @staticmethod
    def _imports_cleanly(module_path):
        code = (
            "import importlib.util, sys\n"
            "spec = importlib.util.spec_from_file_location('_candidate', sys.argv[1])\n"
            "mod = importlib.util.module_from_spec(spec)\n"
            "spec.loader.exec_module(mod)\n"
        )
        try:
            proc = subprocess.run([sys.executable, "-c", code, str(module_path)],
                                  capture_output=True, text=True, timeout=60)
            return proc.returncode == 0, proc.stdout + proc.stderr
        except (subprocess.TimeoutExpired, OSError) as exc:
            return False, str(exc)

    def register(self, name, module_path, capabilities):
        module_path = Path(module_path).resolve()
        if self.get(name) is not None:
            return {"status": "REFUSED", "reason": f"expert {name!r} already registered"}
        if not module_path.is_file():
            return {"status": "REFUSED",
                    "reason": f"module file does not exist: {module_path}"}
        ok, output = self._imports_cleanly(module_path)
        if not ok:
            return {"status": "REFUSED",
                    "reason": f"module does not import cleanly: {output.strip()[-400:]}"}
        expert = {
            "name": name,
            "module_path": str(module_path),
            "capabilities": list(capabilities or []),
            "weight": 1.0,
            "routed_count": 0,
            "success_count": 0,
        }
        self.data["experts"].append(expert)
        self.save()
        return {"status": "REGISTERED", "expert": expert}

    # -- routing -----------------------------------------------------------
    @staticmethod
    def score(expert, query):
        q = _tokens(query)
        overlap = 0
        for phrase in expert.get("capabilities", []):
            overlap += len(_tokens(phrase) & q)
        return overlap * float(expert.get("weight", 1.0)), overlap

    def route(self, query):
        """Return the best eligible expert dict, or None. Increments the
        winner's routed_count and persists."""
        best, best_score = None, 0.0
        for expert in self.data["experts"]:
            score, overlap = self.score(expert, query)
            if overlap > 0 and score > best_score:
                best, best_score = expert, score
        if best is None:
            return None
        best["routed_count"] = int(best.get("routed_count", 0)) + 1
        self.save()
        return best

    # -- outcomes ----------------------------------------------------------
    def record_outcome(self, name, success):
        expert = self.get(name)
        if expert is None:
            return {"status": "UNKNOWN_EXPERT", "name": name}
        if success:
            expert["success_count"] = int(expert.get("success_count", 0)) + 1
        routed = int(expert.get("routed_count", 0))
        if routed > 0:
            rate = int(expert.get("success_count", 0)) / routed
            target = MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * rate
            old = float(expert.get("weight", 1.0))
            new = old + 0.5 * (target - old)
            expert["weight"] = max(MIN_WEIGHT, min(MAX_WEIGHT, new))
        self.save()
        return {"status": "RECORDED", "expert": expert}
