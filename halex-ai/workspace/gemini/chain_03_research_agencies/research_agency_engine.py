"""Gate-fixed Module 50 C03-SORA.

What was removed:
- No social media harvesting, no "deep web" access, no OSINT scraping.
  This code has no network code at all, and never touches X, Facebook,
  or any site behind a login. That is a standing HALEX-AI bound.
- No research is claimed without a source. An agent returns
  NOT_EXECUTED unless the caller supplies a provider callable that
  returns real records for the topic.
- No cross-chain pull is claimed unless a real local lookup ran.
  Default sources are the local Chain 01 index, the local knowledge
  database, and the local Chain 02 summary - all in this tree.
"""
import os, sys
HERE = os.path.dirname(os.path.dirname(__file__))
for d in ["chain_01_codebase", "knowledge_database_code", "chain_02_agency_mesh"]:
    p = os.path.join(HERE, d)
    if p not in sys.path: sys.path.insert(0, p)

DOMAINS = [
    "Cryptocurrency & Tokenomics Intelligence", "Global News & Media Sentiment",
    "Open Source Software Ecosystems", "Artificial Intelligence & LLM Benchmarks",
    "Regulatory & Legislative Tracking", "Consumer Culinary & Hospitality Trends",
    "Space Propulsion & Aerospace Research", "Decentralized Infrastructure & Mesh Networks",
    "Botanical & Agricultural Cultivation Science", "Cybersecurity & Threat Intelligence",
]
SPECIALTIES = ["Social Sentiment & Trend Extraction", "Deep Web & OSINT Intelligence", "Cross-Chain Data Aggregation"]
# Note: the second specialty name is retained only as a submitted label.
# The code does NOT perform deep-web or OSINT access of any kind.

class ResearchAgent:
    def __init__(self, agent_id, agency_id, specialty):
        self.agent_id = agent_id; self.agency_id = agency_id; self.specialty = specialty
    def execute(self, topic, provider=None):
        if provider is None:
            return {"agent_id": self.agent_id, "status": "NOT_EXECUTED", "topic": topic, "records": []}
        records = provider(topic, self.specialty)
        return {"agent_id": self.agent_id, "status": "EXECUTED_WITH_SOURCE" if records else "NO_RECORDS",
                "topic": topic, "records": records}

class ResearchAgencyUnit:
    def __init__(self, agency_id, domain):
        self.agency_id = agency_id; self.domain = domain
        self.agents = [ResearchAgent(f"{agency_id}-AG{i+1}", agency_id, s) for i, s in enumerate(SPECIALTIES)]
    def execute(self, topic, provider=None):
        results = [a.execute(topic, provider) for a in self.agents]
        return {"agency_id": self.agency_id, "domain": self.domain, "team_size": len(self.agents),
                "agent_results": results,
                "status": "COMPLETE_WITH_SOURCE" if provider else "NOT_EXECUTED"}

def _default_source(source, topic):
    try:
        if source.lower() in ("chain-01", "chain 01", "chain01"):
            from chain_01_engine import query as q; return q(topic)
        if source.lower() in ("master knowledge database", "knowledge database", "database"):
            from database_engine import query as q; return q(topic)
        if source.lower() in ("chain-02", "chain 02", "chain02"):
            from chain_02_engine import Chain02Mesh; return Chain02Mesh().summary()
    except Exception as e:
        return {"status": "SOURCE_ERROR", "error": str(e)}
    return {"status": "UNKNOWN_SOURCE", "source": source}

class Chain03ResearchOrchestrator:
    def __init__(self):
        self.research_agencies = [ResearchAgencyUnit(f"RES-AGENCY-{i:03d}", d) for i, d in enumerate(DOMAINS, 1)]
    def summary(self):
        return {"total_research_agencies": len(self.research_agencies),
                "agents_per_agency": 3,
                "total_research_agents": sum(len(a.agents) for a in self.research_agencies)}
    def cross_chain_pull_and_research(self, source, topic, provider=None):
        pulled = _default_source(source, topic) if provider is None else provider(topic, source)
        ok = isinstance(pulled, dict) and pulled.get("status") not in ("UNKNOWN_SOURCE", "SOURCE_ERROR", None) or (isinstance(pulled, dict) and pulled.get("found"))
        # A pull counts only if it returned a real lookup result, not a template.
        return {"source": source, "topic": topic, "pulled": pulled,
                "status": "PULLED" if pulled and pulled.get("status") in ("FOUND",) or pulled.get("found") or "total_agents" in pulled else "NOT_PULLED",
                "mesh_summary": self.summary()}
