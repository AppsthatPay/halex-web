"""Gate-fixed Module 42 FUE-12L. A small stored encyclopedia, not an
unabridged one. Unknown topics return NOT_FOUND, never a template
definition. Translations exist only where stored."""
ENTRIES = {
    "python": "Python is a high-level, interpreted programming language known for readable syntax.",
    "blockchain": "A blockchain is an append-only ledger of blocks linked by cryptographic hashes.",
    "rust": "Rust is a systems programming language focused on memory safety without a garbage collector.",
}
LEXICON = {
    "intelligence": {"es": "inteligencia", "fr": "intelligence", "de": "Intelligenz"},
    "software": {"es": "software", "fr": "logiciel", "de": "Software"},
    "blockchain": {"es": "cadena de bloques", "fr": "cha\u00eene de blocs", "de": "Blockchain"},
}
def query(topic):
    e = ENTRIES.get(topic.lower().strip())
    return {"status": "FOUND", "topic": topic, "summary": e} if e else {"status": "NOT_FOUND", "topic": topic, "summary": None}
def translate(term, language):
    t = LEXICON.get(term.lower(), {}).get(language.lower())
    return {"status": "TRANSLATED", "term": term, "language": language, "translation": t} if t else {"status": "NOT_TRANSLATED", "term": term, "language": language, "translation": None}
