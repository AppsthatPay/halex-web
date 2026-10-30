
import sys, os, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "chain_03_research_agencies"))
from research_agency_engine import Chain03ResearchOrchestrator
class T(unittest.TestCase):
    def test_counts(self):
        o = Chain03ResearchOrchestrator(); s = o.summary()
        self.assertEqual((s["total_research_agencies"], s["total_research_agents"]), (10, 30))
    def test_no_provider_no_research(self):
        o = Chain03ResearchOrchestrator()
        r = o.research_agencies[0].execute("python")
        self.assertEqual(r["status"], "NOT_EXECUTED")
    def test_with_provider(self):
        o = Chain03ResearchOrchestrator()
        r = o.research_agencies[0].execute("python", provider=lambda t, s: [{"t": t}])
        self.assertEqual(r["status"], "COMPLETE_WITH_SOURCE")
    def test_cross_chain_real(self):
        o = Chain03ResearchOrchestrator()
        self.assertEqual(o.cross_chain_pull_and_research("chain-01", "rust")["status"], "PULLED")
        self.assertEqual(o.cross_chain_pull_and_research("unknown-chain", "x")["status"], "NOT_PULLED")
if __name__ == "__main__": unittest.main()
