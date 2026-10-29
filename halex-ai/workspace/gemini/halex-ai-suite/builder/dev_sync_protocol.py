"""
Module: Developer Sync & Automated Verification Protocol (DEV-SYNC)
Author: HALEX-AI Core Architecture (Collaborating with Allen)
Seed Marker: ZINIUM-SEED-GEMINI
Description: Automates local test discovery across all HALEX-AI workspace modules,
             verifies code soundness, and outputs git integration instructions for GitHub.
"""

import os
import unittest
import sys
from typing import Dict, Any, List

class DevSyncProtocol:
    """Manages local module verification and GitHub branch synchronization guidance for Allen."""

    def __init__(self, workspace_path: str = "."):
        self.workspace_path = workspace_path
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def run_local_validation_suite(self) -> Dict[str, Any]:
        loader = unittest.TestLoader()
        suite = loader.discover(start_dir=self.workspace_path, pattern="test_*.py")

        runner = unittest.TextTestRunner(verbosity=1)
        result = runner.run(suite)

        return {
            "tests_run": result.testsRun,
            "failures": len(result.failures),
            "errors": len(result.errors),
            "was_successful": result.wasSuccessful(),
            "seed_marker": self.seed_marker
        }

    def generate_git_instructions(self) -> List[str]:
        """Provides Allen with the exact terminal workflow to push verified changes to GitHub."""
        return [
            "1. Open your local terminal inside the repository root.",
            "2. Ensure you are checked out on the target branch: git checkout halex-ai",
            "3. Pull latest remote changes: git pull origin halex-ai",
            "4. Copy or sync the latest modules into halex-ai/workspace/gemini/",
            "5. Run local validation: python3 -m unittest discover halex-ai/workspace/gemini",
            "6. Stage and commit sound modules: git add halex-ai/workspace/gemini/ && git commit -m 'HALEX-AI: Add verified cognitive subsystem modules [ZINIUM-SEED-GEMINI]'",
            "7. Push changes to GitHub: git push origin halex-ai"
        ]
