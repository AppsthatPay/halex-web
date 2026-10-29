# HALEX-AI System Kernel (`kernel/`)

## What it does
Acts as the central operational backbone of HALEX-AI. It standardizes incoming requests into immutable execution envelopes, manages branch registrations (such as research, planning, writing, and branch analytics), and validates all outgoing payloads against strict schema and provenance contracts.

## How it was tested
Tested via `test_system_kernel.py` covering branch registration, typed execution envelope generation, contract validation compliance, and invalid payload rejection.

## What it does NOT do
- Does not execute arbitrary external code or interact with live network sockets.
- Does not bypass advisory mode; all operations remain strictly advisory and human-gated.

## Gate note (Allen, 2026-10-29)
The provenance seal is a plain string marker comparison
(ZINIUM-SEED-GEMINI), not cryptography. The execution envelope is a
plain dict; "immutable" describes the intended contract, not a
technical enforcement. The gate also replaced the deprecated
datetime.utcnow() calls with timezone-aware UTC.
