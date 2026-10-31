import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from test_chain_registry import TestChainRegistry
from test_space_manager import TestSpaceManager
from test_agency_manager import TestAgencyManager
from test_memory_store import TestMemoryStore
from test_shard_protocol import TestShardProtocol
from test_division import TestDivision
from test_interconnect import TestInterconnect
from test_conversational_engine import TestConversationalEngine
from test_ml_deployment_manager import TestMLDeploymentManager
from test_browser_bridge import TestBrowserBridge

if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestChainRegistry))
    suite.addTests(loader.loadTestsFromTestCase(TestSpaceManager))
    suite.addTests(loader.loadTestsFromTestCase(TestAgencyManager))
    suite.addTests(loader.loadTestsFromTestCase(TestMemoryStore))
    suite.addTests(loader.loadTestsFromTestCase(TestShardProtocol))
    suite.addTests(loader.loadTestsFromTestCase(TestDivision))
    suite.addTests(loader.loadTestsFromTestCase(TestInterconnect))
    suite.addTests(loader.loadTestsFromTestCase(TestConversationalEngine))
    suite.addTests(loader.loadTestsFromTestCase(TestMLDeploymentManager))
    suite.addTests(loader.loadTestsFromTestCase(TestBrowserBridge))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)
    else:
        sys.exit(0)
