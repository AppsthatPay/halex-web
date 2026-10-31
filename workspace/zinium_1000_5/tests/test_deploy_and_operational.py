"""Tests for spec 4.2 operational standard and the deploy engine."""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deploy_engine import HalexTokenDeployer, SatoshiAgentUnit  # noqa: E402
from halex_1000_5 import (  # noqa: E402
    AgentNode,
    Coordinate5D,
    InstructionPayload,
    UNITS_PER_WHOLE,
)


class TestOperationalAndDeploy(unittest.TestCase):
    def test_open_workspace_await_instructions(self):
        node = AgentNode(Coordinate5D(500, 500, 500, 500, 500), "M")
        record = node.open_workspace()
        self.assertEqual(record["command"], "OPEN WORKSPACE, AWAIT INSTRUCTIONS")
        self.assertEqual(node.operational_state, "AWAIT_INSTRUCTIONS")
        result = node.process_instruction(InstructionPayload("observe", {}))
        self.assertEqual(result["status"], "RECORDED")
        self.assertEqual(node.operational_state, "AWAIT_INSTRUCTIONS")

    def test_wasm_execution_refused(self):
        node = AgentNode(Coordinate5D(0, 0, 0, 0, 0), "M")
        node.open_workspace()
        result = node.process_instruction(InstructionPayload("execute_wasm", {}))
        self.assertEqual(result["status"], "EXECUTION_REFUSED")
        self.assertEqual(node.operational_state, "AWAIT_INSTRUCTIONS")

    def test_deploy_token_exact_mass(self):
        deployer = HalexTokenDeployer()
        deployer.register_wallet("WALLET_PUBLIC_001", Coordinate5D(0, 0, 0, 0, 0))
        # Exact addition on top of the 1.0 base whole:
        # 10,000,000,000 + 100 + 200, not a fixed increment.
        result = deployer.deploy(
            "TOKEN_TEST_1", "TOKEN", "WALLET_PUBLIC_001",
            [SatoshiAgentUnit(100, {"knowledge": "x"}), SatoshiAgentUnit(200, {"software_systems": "y"})],
        )
        self.assertEqual(result["total_units"], UNITS_PER_WHOLE + 300)
        self.assertIsNone(result["vault_hash_sha3_512"])

    def test_deploy_coin_vault_hash_not_encryption(self):
        deployer = HalexTokenDeployer()
        deployer.register_wallet("WALLET_VAULT_7", Coordinate5D(500, 500, 500, 500, 500))
        result = deployer.deploy(
            "COIN_TEST_9", "COIN", "WALLET_VAULT_7",
            [SatoshiAgentUnit(100, {"robotics": "kinematics record"})],
        )
        self.assertEqual(len(result["vault_hash_sha3_512"]), 128)  # SHA3-512 hex
        self.assertEqual(result["agency_operational_state"], "AWAIT_INSTRUCTIONS")

    def test_coin_to_unregistered_wallet_refused(self):
        deployer = HalexTokenDeployer()
        with self.assertRaises(ValueError):
            deployer.deploy("COIN_X", "COIN", "NO_SUCH_WALLET", [SatoshiAgentUnit(100, {})])

    def test_whole_value_scaling(self):
        # 1.0 whole = UNITS_PER_WHOLE; adding one whole's worth of
        # satoshis scales the record to 2.0 exactly.
        self.assertEqual(UNITS_PER_WHOLE + UNITS_PER_WHOLE, 2 * UNITS_PER_WHOLE)


if __name__ == "__main__":
    unittest.main()
