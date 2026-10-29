# Cross-Module Fault Tolerance & Self-Healing Subsystem (CM-FTSHS) (gate-written README)

## What it does
Runs a primary callable and, if it raises, returns the fallback
callable's result instead, counting consecutive failures per module
and reporting when the count reaches the circuit breaker threshold.

## How it was tested
Tested via `test_fault_tolerance.py` covering successful execution
and fallback plus circuit breaker reporting after repeated failures.

## What it does NOT do (honest limits, gate-noted)
- The circuit breaker REPORTS tripped but does not block a later
  execution: the primary is attempted again on every call.
- If the fallback itself raises, that exception propagates uncaught;
  it is not wrapped or healed.
- "Self-healing" overstates the behavior: this is fallback
  substitution, not repair of the failing module.
- State is in-memory only; failure counts end with the process.
