import unittest
from writing_assistant import WritingAssistant


class TestWritingAssistant(unittest.TestCase):
    def setUp(self):
        self.assistant = WritingAssistant()

    def test_professional_rewrite(self):
        draft = "system status is nominal"
        res = self.assistant.rewrite_draft(draft, "professional")
        self.assertTrue(res["rewrite"].endswith('.'))
        self.assertEqual(len(res["changes"]), 2)
        self.assertEqual(res["seed_marker"], "ZINIUM-SEED-GEMINI")

    def test_concise_actually_shortens(self):
        draft = "One. Two. Three. Four."
        res = self.assistant.rewrite_draft(draft, "concise")
        self.assertLess(len(res["rewrite"]), len(" ".join(draft.split())))

    def test_empty_input(self):
        res = self.assistant.rewrite_draft("", "clarity")
        self.assertIn("Error", res["error"])


if __name__ == "__main__":
    unittest.main()
