import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from chain_registry import ChainRegistry
from agency_manager import AgencyManager
from memory_store import MemoryStore
from ml_deployment_manager import MLDeploymentManager


class TestMLDeploymentManager(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()
        self.agency_mgr = AgencyManager(self.registry)
        self.memory_store = MemoryStore(self.registry, self.agency_mgr)
        self.ml_mgr = MLDeploymentManager(self.registry, self.memory_store, self.agency_mgr)
        self.registry.register_chain("Chain-05", "ML Vault", "machine_learning")
        self.agency_mgr.create_agency("ag-ml-01", "Chain-05", "machine_learning", 0, 999)

    def test_train_model_success(self):
        x = [1.0, 2.0, 3.0, 4.0, 5.0]
        y = [2.0, 4.0, 6.0, 8.0, 10.0]
        res = self.ml_mgr.train_model("model-linear-01", "Chain-05", "ag-ml-01", x, y)
        self.assertEqual(res["status"], "TRAINED_MODEL_STORED")
        self.assertAlmostEqual(res["model"]["parameters"]["slope"], 2.0)
        self.assertAlmostEqual(res["model"]["parameters"]["intercept"], 0.0)
        self.assertAlmostEqual(res["model"]["metrics"]["mean_squared_error"], 0.0)
        # Gate probe: the model record really is in the chain now.
        lookup = self.memory_store.lookup_by_id("model-rec-model-linear-01")
        self.assertEqual(lookup["status"], "FOUND")

    def test_generate_deployment_blueprint(self):
        x = [1.0, 2.0, 3.0]
        y = [1.0, 2.0, 3.0]
        self.ml_mgr.train_model("model-test-02", "Chain-05", "ag-ml-01", x, y)
        res = self.ml_mgr.generate_deployment_blueprint("model-test-02", "AWS", "Chain-05", "ag-ml-01")
        self.assertEqual(res["status"], "BLUEPRINT_GENERATED")
        self.assertIn("TARGET_CLOUD: AWS", res["manifest"])
        self.assertIn("READY_FOR_MIGRATION", res["manifest"])

    def test_constant_x_refused_not_fake_slope(self):
        res = self.ml_mgr.train_model("model-flat", "Chain-05", "ag-ml-01",
                                      [3.0, 3.0, 3.0], [1.0, 2.0, 3.0])
        self.assertEqual(res["status"], "ERROR")
        self.assertEqual(res["reason"], "CONSTANT_X_VALUES_SLOPE_UNDEFINED")


if __name__ == "__main__":
    unittest.main()
