"""Gate-fixed Module 41 HAGES-EM. No goal is decomposed by this code
alone: the caller supplies subtasks. Generation counts steps that actually
completed with evidence. No synchronization claim is made."""
class EvolutionMesh:
    def __init__(self):
        self.generation = 0
    def decompose(self, goal, subtasks):
        if not goal or not subtasks or not all(isinstance(s, str) and s for s in subtasks):
            return {"status": "INVALID", "goal": goal, "subtasks": []}
        return {"status": "DECOMPOSED", "goal": goal, "subtasks": list(subtasks)}
    def step(self, subtasks, evidence):
        if not subtasks or not evidence or set(subtasks) - set(evidence):
            return {"status": "NOT_COMPLETED", "generation": self.generation}
        self.generation += 1
        return {"status": "STEP_COMPLETED", "generation": self.generation, "subtasks": list(subtasks)}
