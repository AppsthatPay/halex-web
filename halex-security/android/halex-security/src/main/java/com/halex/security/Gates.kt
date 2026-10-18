package com.halex.security

/**
 * HALEX on-device verification gates.
 *
 * Mirrors the Python halex_security.gates module. Runs on the phone before
 * untrusted text (feed cards, token metadata, deep links, AI socket input)
 * is rendered in a WebView or acted on.
 *
 * UXSS gate — scriptable content. SHELL gate — code/prompt injection.
 * verify() throws VerificationException listing every hit, or returns.
 */
class VerificationException(val failures: List<String>) :
    Exception("verification failed: " + failures.joinToString("; "))

object Gates {

    private val uxss = listOf(
        Regex("<\\s*script", RegexOption.IGNORE_CASE) to "script tag",
        Regex("javascript\\s*:", RegexOption.IGNORE_CASE) to "javascript: URI",
        Regex("on\\w+\\s*=", RegexOption.IGNORE_CASE) to "event handler attribute",
        Regex("<\\s*iframe", RegexOption.IGNORE_CASE) to "iframe tag",
        Regex("<\\s*object", RegexOption.IGNORE_CASE) to "object tag",
        Regex("eval\\s*\\(", RegexOption.IGNORE_CASE) to "eval() call",
        Regex("document\\s*\\.\\s*cookie", RegexOption.IGNORE_CASE) to "cookie access"
    )

    private val shell = listOf(
        Regex("\\\$\\(") to "command substitution $(",
        Regex("`[^`]+`") to "backtick execution",
        Regex("\\.\\./") to "path traversal",
        Regex("curl[^\\n]*\\|\\s*(sh|bash)", RegexOption.IGNORE_CASE) to "curl-pipe-shell",
        Regex("ignore\\s+(all\\s+)?(previous|prior|above)\\s+instructions", RegexOption.IGNORE_CASE)
            to "instruction override",
        Regex("you\\s+are\\s+now\\s+", RegexOption.IGNORE_CASE) to "identity override",
        Regex("system\\s*:\\s*", RegexOption.IGNORE_CASE) to "fake system prompt",
        Regex("jailbreak", RegexOption.IGNORE_CASE) to "jailbreak attempt",
        Regex("bypass\\s+(the\\s+)?(filter|safety|gate|policy)", RegexOption.IGNORE_CASE)
            to "safeguard bypass"
    )

    fun uxssVerify(text: String): List<String> =
        uxss.filter { (rx, _) -> rx.containsMatchIn(text) }
            .map { (_, label) -> "UXSS: $label" }

    fun shellVerify(text: String): List<String> =
        shell.filter { (rx, _) -> rx.containsMatchIn(text) }
            .map { (_, label) -> "SHELL: $label" }

    /** Verify through both gates. Returns normally if clean. */
    fun verify(text: String) {
        val failures = uxssVerify(text) + shellVerify(text)
        if (failures.isNotEmpty()) throw VerificationException(failures)
    }
}
