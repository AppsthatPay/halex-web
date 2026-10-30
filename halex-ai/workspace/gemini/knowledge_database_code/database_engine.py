"""Gate-fixed Module 43 FUE-12L-DB. Five stored records and a small
stored lexicon. The matcher requires a real overlap, not any single word.
Unknown topics and terms return NOT_FOUND / NOT_TRANSLATED."""
RECORDS = [
    {"topic": "python programming", "summary": "Python is a high-level interpreted language."},
    {"topic": "blockchain basics", "summary": "A blockchain links blocks by cryptographic hashes."},
    {"topic": "rust systems", "summary": "Rust focuses on memory safety without a garbage collector."},
    {"topic": "operating systems", "summary": "An operating system manages hardware and processes."},
    {"topic": "cryptography hashes", "summary": "A hash function maps input to a fixed-size digest."},
]
LEXICON = {
    "intelligence": {"es": "inteligencia", "fr": "intelligence", "de": "Intelligenz"},
    "software": {"es": "software", "fr": "logiciel", "de": "Software"},
    "blockchain": {"es": "cadena de bloques", "fr": "cha\u00eene de blocs", "de": "Blockchain"},
}
def query(topic):
    q = set(topic.lower().split())
    best = None; best_score = 0
    for r in RECORDS:
        t = set(r["topic"].split())
        score = len(q & t)
        if score > best_score: best, best_score = r, score
    if best and (best_score >= 2 or best["topic"] in topic.lower() or topic.lower() in best["topic"]):
        return {"status": "FOUND", "record": best}
    return {"status": "NOT_FOUND", "record": None}
def translate(term, language):
    t = LEXICON.get(term.lower(), {}).get(language.lower())
    return {"status": "TRANSLATED", "translation": t} if t else {"status": "NOT_TRANSLATED", "translation": None}
