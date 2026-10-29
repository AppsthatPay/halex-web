"""Module: Task Planning
Seed Marker: ZINIUM-SEED-GEMINI
Description: Decomposes goals into ordered dependency steps by goal semantics
and flags human-decision checkpoints.
Patch note (Allen, 2026-10-29): fixed the test guard from
`if __name__ == "main":` to `if __name__ == "__main__":` so running the test
file directly actually runs the tests.
"""
from typing import Dict, Any, List


class TaskPlanner:
    def __init__(self):
        self.seed_marker = "ZINIUM-SEED-GEMINI"

    def create_plan(self, goal: str) -> Dict[str, Any]:
        if not goal or not goal.strip():
            return {"goal": goal, "steps": [], "error": "Goal cannot be empty.", "seed_marker": self.seed_marker}
        goal_lower = goal.lower()
        if "deploy" in goal_lower or "update" in goal_lower:
            steps = [
                {"step_id": 1, "description": f"Audit staging environment compatibility for: {goal}", "dependencies": [], "requires_human_decision": False},
                {"step_id": 2, "description": "Run automated test suites and verify exit codes", "dependencies": [1], "requires_human_decision": False},
                {"step_id": 3, "description": "Obtain release authorization and initiate production rollout", "dependencies": [2], "requires_human_decision": True}
            ]
        elif "audit" in goal_lower or "review" in goal_lower:
            steps = [
                {"step_id": 1, "description": f"Gather target artifacts and baseline metrics for: {goal}", "dependencies": [], "requires_human_decision": False},
                {"step_id": 2, "description": "Execute compliance and security heuristic scans", "dependencies": [1], "requires_human_decision": False},
                {"step_id": 3, "description": "Compile audit findings report for stakeholder sign-off", "dependencies": [2], "requires_human_decision": True}
            ]
        else:
            steps = [
                {"step_id": 1, "description": f"Define scope and requirements for goal: {goal}", "dependencies": [], "requires_human_decision": False},
                {"step_id": 2, "description": "Execute core processing tasks and verify output constraints", "dependencies": [1], "requires_human_decision": False},
                {"step_id": 3, "description": "Review final deliverable and confirm stakeholder approval", "dependencies": [2], "requires_human_decision": True}
            ]
        return {"goal": goal, "steps": steps, "seed_marker": self.seed_marker}
