"""Gate-fixed Module 44 MM-CCSI. No image/video generation, no codec
suite, no fidelity percentage. What is real: zlib compression of bytes
with a computed ratio, and writing a text asset to disk."""
import hashlib, zlib, os
def ingest_bytes(name, data):
    comp = zlib.compress(data)
    return {"name": name, "size": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "compressed_size": len(comp), "ratio": (len(data)/len(comp)) if comp else None,
            "viewed": False, "generated": False}
def create_text_asset(path, text):
    data = text.encode()
    with open(path, "wb") as f: f.write(data)
    return {"path": path, "size": len(data), "sha256": hashlib.sha256(data).hexdigest(), "created": True}
def view_text(path):
    if not os.path.exists(path): return {"status": "NOT_FOUND"}
    with open(path, encoding="utf-8", errors="strict") as f: txt = f.read()
    return {"status": "VIEWED_TEXT", "preview": txt[:200], "size": len(txt)}
