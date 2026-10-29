"""HALEX-AI orchestrator facade (Allen-authored integration layer).

Seed Marker: ZINIUM-SEED-ALLEN (facade only). Every component it calls is a
gated Gemini contribution carrying ZINIUM-SEED-GEMINI, copied byte-identical
from the gated staging tree. This facade changes none of their semantics.

What this facade does, in order, for one request envelope:
  1. Kernel validation: SystemKernel.create_execution_envelope standardizes
     the request (and rejects an empty query).
  2. Scheduling: ResourceScheduler.schedule_execution picks the branches.
  3. Core reasoning: CoreReasoningEngine.process_request answers strictly
     from the caller-supplied known_context and names its unknowns.
  4. Contract check: SystemKernel.validate_response_contract verifies the
     core result carries the required contract keys and provenance marker.
  5. Dialectic check: DialecticEngine.evaluate_proposition runs the query
     as a proposition against the caller-supplied evidence list.
  6. Meta-reflection: MetaReasoningEvaluator.evaluate_reasoning_chain
     reviews the core reasoning steps and answer. Its meta_confidence is a
     fixed heuristic label (0.95 / 0.80 / 0.65), asserted by rule, not
     measured; see the gated meta_reflection README.
  7. Memory: the exchange is stored as a node in the session-scoped
     EpistemicMemoryGraph (in-memory only; it does not persist past the
     process) and appended as a lesson to the in-memory ZiniumMemoryStore
     (the suite's ZINIUM lessons ledger; also session-scoped).

What this facade does NOT do: it runs no network calls, executes nothing
external, and calls no component that was returned by the gate. It is the
object a future API adapter would wrap; it is not itself a server.

Request envelope (a plain dict):
  {
    "query": str,                 required
    "intent_domain": str,         optional, default "general"
    "known_context": {str: Any},  optional, default {}
    "evidence": [str, ...],       optional, default []
    "source": str,                optional, provenance label for the lesson
    "contributor": str,           optional, provenance label for the lesson
  }
"""

from typing import Any, Dict, List, Optional

# The package __init__ places every component directory on sys.path, which
# is what makes these flat imports work against byte-identical copies.
from system_kernel import SystemKernel
from resource_scheduler import ResourceScheduler
from core_engine import CoreReasoningEngine
from dialectic_engine import DialecticEngine
from meta_evaluator import MetaReasoningEvaluator
from memory_graph import EpistemicMemoryGraph
from zinium_memory import ZiniumMemoryStore

SEED_MARKER = "ZINIUM-SEED-ALLEN"


class HalexAI:
    """One offline pipeline over the gated components. Session-scoped state."""

    def __init__(self):
        self.kernel = SystemKernel()
        self.scheduler = ResourceScheduler()
        self.core = CoreReasoningEngine()
        self.dialectic = DialecticEngine()
        self.meta = MetaReasoningEvaluator()
        self.graph = EpistemicMemoryGraph()
        self.memory = ZiniumMemoryStore()
        self.seed_marker = SEED_MARKER

    def handle(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Run one request envelope through the pipeline. Never raises on
        bad input; failures come back as an honest error result."""
        if not isinstance(request, dict):
            return {"status": "ERROR", "error": "Request envelope must be a dict.",
                    "seed_marker": self.seed_marker}
        query = request.get("query", "")
        domain = request.get("intent_domain", "general")
        known_context = request.get("known_context") or {}
        evidence = request.get("evidence") or []
        source = request.get("source", "integrated-facade")
        contributor = request.get("contributor", "ALLEN")

        stages: List[str] = []

        # 1. Kernel validation.
        envelope = self.kernel.create_execution_envelope(query, domain)
        if "error" in envelope:
            return {"status": "REJECTED_AT_KERNEL", "envelope": envelope,
                    "stages": ["kernel_validation"], "seed_marker": self.seed_marker}
        stages.append("kernel_validation")

        # 2. Scheduling.
        schedule = self.scheduler.schedule_execution(envelope["query"], domain)
        stages.append("scheduling")

        # 3. Core reasoning, grounded in caller-supplied context only.
        core_result = self.core.process_request(envelope["query"], known_context)
        stages.append("core_reasoning")

        # 4. Response contract check.
        contract = self.kernel.validate_response_contract(core_result)
        stages.append("contract_check")

        # 5. Dialectic check against caller-supplied evidence.
        dialectic_result = self.dialectic.evaluate_proposition(envelope["query"], evidence)
        stages.append("dialectic_check")

        # 6. Meta-reflection over the core steps and answer.
        meta_result = self.meta.evaluate_reasoning_chain(
            core_result.get("steps", []), core_result.get("answer", ""))
        stages.append("meta_reflection")

        # 7a. Session memory graph node.
        concept_id = envelope["envelope_id"]
        graph_result = self.graph.add_node(concept_id, {
            "query": envelope["query"],
            "intent_domain": domain,
            "answer": core_result.get("answer", ""),
            "activated_modules": schedule.get("activated_modules", []),
        })
        stages.append("memory_graph_append")

        # 7b. ZINIUM lessons ledger append (ORLI-shaped record).
        lesson_result = self.memory.record_lesson(
            observed=f"Query received in domain '{domain}': {envelope['query']}",
            reported=core_result.get("answer", ""),
            learned=("Dialectic conclusion: %s; meta-reflection critiques: %s"
                     % (dialectic_result.get("dialectic_conclusion", "n/a"),
                        "; ".join(meta_result.get("critiques", [])) or "none")),
            source=source,
            contributor=contributor,
        )
        stages.append("zinium_memory_append")

        return {
            "status": "COMPLETED",
            "envelope": envelope,
            "schedule": schedule,
            "answer": core_result.get("answer", ""),
            "core_result": core_result,
            "contract": contract,
            "dialectic": dialectic_result,
            "meta_reflection": meta_result,
            "memory_graph": graph_result,
            "zinium_memory": lesson_result,
            "stages": stages,
            "execution_note": ("All stages ran locally in this process against "
                               "caller-supplied context and evidence. Nothing "
                               "external was fetched, executed, or sent."),
            "seed_marker": self.seed_marker,
        }


def run_sample() -> Dict[str, Any]:
    """The built-in end-to-end sample used by the CLI demo and the tests."""
    ai = HalexAI()
    return ai.handle({
        "query": "What is the capital of France?",
        "intent_domain": "research",
        "known_context": {"capital of France": "Paris"},
        "evidence": ["The capital of France is Paris, per the supplied context."],
        "source": "integrated-demo",
        "contributor": "ALLEN",
    })
