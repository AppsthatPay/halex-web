
import sys, os, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "chain_04_mapping_mesh"))
from mapping_engine import Chain04MappingOrchestrator, lookup_place, straight_line_km
class T(unittest.TestCase):
    def test_counts(self):
        o = Chain04MappingOrchestrator(); s = o.summary()
        self.assertEqual((s["total_mapping_agencies"], s["total_spatial_agents"]), (12, 36))
        self.assertIsNone(s["map_vault"])
    def test_lookup_and_distance(self):
        self.assertEqual(lookup_place("Murphy NC")["status"], "FOUND_APPROXIMATE")
        self.assertEqual(lookup_place("Nowhere XYZ")["status"], "NOT_FOUND")
        d = straight_line_km("Murphy NC", "Port Charlotte FL")
        self.assertEqual(d["status"], "STRAIGHT_LINE_ONLY_NOT_A_ROUTE")
        self.assertTrue(900 < d["km"] < 1100)
    def test_no_provider(self):
        o = Chain04MappingOrchestrator()
        self.assertEqual(o.mapping_agencies[0].execute("Murphy NC")["status"], "NOT_EXECUTED")
if __name__ == "__main__": unittest.main()
