import unittest
from zinium_memory import ZiniumMemoryStore


class TestZiniumMemoryStore(unittest.TestCase):
    def setUp(self):
        self.store = ZiniumMemoryStore()

    def test_record_and_read_back(self):
        res = self.store.record_lesson("saw X", "reported X", "learned X", "src", "gemini")
        self.assertEqual(res["status"], "LESSON_RECORDED")
        self.assertEqual(res["total_lessons"], 1)
        self.assertEqual(self.store.get_lessons()[0]["contributor"], "gemini")

    def test_missing_fields_rejected(self):
        res = self.store.record_lesson("", "r", "", "s", "g")
        self.assertIn("error", res)
        self.assertEqual(len(self.store.get_lessons()), 0)


if __name__ == "__main__":
    unittest.main()
