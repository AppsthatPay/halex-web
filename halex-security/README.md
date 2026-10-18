# HALEX Security

Software security system for the HALEX app — **code, not a prompt**.
Installs with the HALEX app two ways:

- **Server side** (the always-on box / API routes): `pip install .`
- **Android app**: include the `:halex-security` module in `settings.gradle.kts`
  (`./android/halex-security`) — the UXSS/SHELL gates run on-device.

## What's inside

| Module | What it enforces |
|---|---|
| `gates` | **UXSS gate** (script tags, js: URIs, event handlers — protects WebViews/feed cards) and **SHELL gate** (shell/code injection + prompt injection — protects the machine and the AI). `verify(text)` raises or passes. |
| `ai_socket` | The hardwired-software principle as code. AI may **WIRE** (connect APIs, deploy, configure) and **OPERATE** (read, serve). It may **never MODIFY** app code/libraries or **ADMIN** (credentials, lockdowns, releases). Deny-by-default allowlist; denials are audited. |
| `secrets` | Secret values never hit logs (`redact()`); secrets live in 600-perm files loaded via `SecretRef` (holds name+path, never the value; refuses loose permissions). |
| `audit` | Append-only JSONL log of every denial and gate trip. Unwritable log = action refused (fail-closed). |
| `fail_closed` | Generic multi-gate: N arms required before an action runs (e.g. live trade = user override + key file + armed flag). Missing arm = `NotArmed`, audited. |

## Quick start

```python
from halex_security import verify, AiSocketPolicy, Action, ActionClass, TripleGate

verify(feed_card_html)  # raises VerificationError on XSS/prompt injection

policy = AiSocketPolicy()
policy.check(Action(ActionClass.WIRE, "connect_api"))   # ok
policy.check(Action(ActionClass.MODIFY, "edit_code"))   # PolicyDenied

gate = TripleGate("live_trade", ["user_override", "key_file", "armed_flag"])
gate.arm("user_override"); gate.arm("key_file"); gate.arm("armed_flag")
gate.execute(place_order)  # runs only when ALL arms present
```

Android (Kotlin):

```kotlin
Gates.verify(untrustedText)  // throws VerificationException on hit
```

## Tests

```
pytest                    # python: 17 tests
./gradlew :halex-security:test   # android (build on GitHub per house rule)
```

## Rules

1. No bad code, no bad prompts — every untrusted input passes the gates.
2. AI wires and operates; it never modifies the app or its libraries.
3. Secrets never appear in logs, errors, or prompts.
4. Denied actions are audited; the audit log is append-only.
5. Fail closed: missing arm, unwritable log, unknown action = refuse.
