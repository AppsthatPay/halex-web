"""Tests for the 1000^5 engine and genesis definitions. Stdlib only."""

import asyncio
import itertools
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "zinium_1000_5"))

from halex_1000_5 import (  # noqa: E402
    AgentNode,
    BrainstemRouter,
    Coordinate5D,
    FractalToken,
    InstructionPayload,
    SatoshiSubChain,
    execute_braincell_pruning,
)
from genesis import CENTER, CHAIN_INDEX, first_cube_coords  # noqa: E402


class Test1000_5(unittest.TestCase):
    def test_coordinate_bounds(self):
        self.assertEqual(Coordinate5D(0, 0, 0, 0, 0).as_tuple(), (0, 0, 0, 0, 0))
        self.assertEqual(Coordinate5D(999, 999, 999, 999, 999).as_tuple(), (999,) * 5)
        with self.assertRaises(ValueError):
            Coordinate5D(1000, 0, 0, 0, 0)

    def test_integer_units_and_exact_expansion(self):
        token = FractalToken("T")
        token.expand_decimal_allocation(SatoshiSubChain(100, b""))
        token.expand_decimal_allocation(SatoshiSubChain(250, b""))
        self.assertEqual(token.total_units(), 350)  # not a fixed increment

    def test_pruning_threshold_and_bad_parse(self):
        token = FractalToken("T")
        token.expand_decimal_allocation(SatoshiSubChain(100, b"", {"utility_metric": "0.85"}))
        token.expand_decimal_allocation(SatoshiSubChain(100, b"", {"utility_metric": "0.05"}))
        token.expand_decimal_allocation(SatoshiSubChain(100, b"", {"utility_metric": "junk"}))
        self.assertEqual(execute_braincell_pruning(token), 2)
        self.assertEqual(token.total_units(), 100)

    def test_mitosis_gated(self):
        async def run():
            parent = AgentNode(Coordinate5D(500, 500, 500, 500, 500), "M", execution_load=0.98)
            self.assertIsNone(await parent.evaluate_and_split(Coordinate5D(501, 500, 500, 500, 500), need_recorded=False, slot_occupied=False))
            self.assertIsNone(await parent.evaluate_and_split(Coordinate5D(501, 500, 500, 500, 500), need_recorded=True, slot_occupied=True))
            daughter = await parent.evaluate_and_split(Coordinate5D(501, 500, 500, 500, 500), need_recorded=True, slot_occupied=False)
            self.assertIsNotNone(daughter)
            self.assertEqual(daughter.status, "DRAFT")
            self.assertEqual(daughter.execution_load, 0.1)
        asyncio.run(run())

    def test_router_broadcast(self):
        async def run():
            router = BrainstemRouter()
            node = AgentNode(Coordinate5D(0, 0, 0, 0, 0), "M")
            router.register_node(node.coordinate, node.mailbox)
            await router.broadcast_autonomic_pulse(InstructionPayload("ping", {}))
            self.assertEqual((await node.mailbox.get()).command, "ping")
        asyncio.run(run())

    def test_first_cube_definition(self):
        coords = first_cube_coords()
        self.assertEqual(len(coords), 32)
        self.assertEqual(CHAIN_INDEX, 500)
        self.assertEqual(CENTER.as_tuple(), (500, 500, 500, 500, 500))
        self.assertTrue(all(v in (500, 501) for c in coords for v in c.as_tuple()))
        self.assertEqual(set(itertools.product((500, 501), repeat=5)), set(c.as_tuple() for c in coords))


if __name__ == "__main__":
    unittest.main()
