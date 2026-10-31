import unittest
from chain_registry import ChainRegistry


class TestChainRegistry(unittest.TestCase):
    def setUp(self):
        self.registry = ChainRegistry()

    def test_register_chain_success(self):
        res = self.registry.register_chain("Chain-01", "Test Chain", "culinary")
        self.assertEqual(res["status"], "REGISTERED")
        self.assertEqual(res["chain"]["id"], "Chain-01")
        self.assertEqual(res["chain"]["status"], "REGISTERED")

    def test_register_chain_invalid_id(self):
        res = self.registry.register_chain("Invalid-01", "Bad ID", "test")
        self.assertEqual(res["status"], "ERROR")

    def test_get_chain_not_found(self):
        res = self.registry.get_chain("Chain-999")
        self.assertEqual(res["status"], "NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
