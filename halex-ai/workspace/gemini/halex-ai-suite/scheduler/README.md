# Metacognitive Resource Allocation & Execution Scheduler (MRA-ES)

## What it does
Dynamically analyzes user intent and query semantics to route execution paths to the most relevant specialized sub-modules (such as research synthesis, task planning, token explanation, or verification), ensuring optimal compute and epistemic efficiency.

## How it was tested
Tested via `test_resource_scheduler.py` verifying multi-module activation for research tasks, blockchain token queries, and empty query error handling.

## What it does NOT do
- Does not execute parallel asynchronous compute across distributed nodes without the P2P mesh sync layer.
- Does not perform deep semantic intent parsing beyond keyword and domain heuristics.
