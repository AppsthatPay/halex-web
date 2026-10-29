import unittest
from improvement_engine import SelfImprovementEngine


class TestSelfImprovementEngine(unittest.TestCase):
    def setUp(self):
        self.engine = SelfImprovementEngine()

    def test_high_rate_steps_up(self):
        res = self.engine.optimize_parameter("threshold", 0.5, 0.95)
        self.assertEqual(res["after_value"], 0.51)
        self.assertEqual(res["adjustment_delta"], 0.01)

    def test_low_rate_steps_down(self):
        res = self.engine.optimize_parameter("threshold", 0.5, 0.40)
        self.assertEqual(res["after_value"], 0.49)
        self.assertEqual(res["adjustment_delta"], -0.01)


if __name__ == "__main__":
    unittest.main()
