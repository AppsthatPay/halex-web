
import sys, os, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "halex_pure_ai_core"))
from halex_core_engine import telemetry
class T(unittest.TestCase):
    def test_telemetry_honest(self):
        t = telemetry()
        self.assertEqual(t["status"], "REGISTERED_ONLY_NOT_OPERATIONAL")
        self.assertEqual(t["threads"]["thread_02_agents"]["total_agents"], 400)
        self.assertEqual(t["threads"]["thread_03_remote"]["implant_status"], "NOT_DEPLOYED")
        self.assertIsNone(t["threads"]["thread_04_mapping"]["map_vault"])
if __name__ == "__main__": unittest.main()
