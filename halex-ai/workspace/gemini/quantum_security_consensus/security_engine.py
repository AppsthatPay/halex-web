"""Gate-fixed Module 45 QS-ILC. This is a SHA3-512 hash chain ONLY.
It is not a signature (no key), not post-quantum, not zero-knowledge,
and not a consensus protocol. The previous hash is actually linked."""
import hashlib
class HashChain:
    def __init__(self): self.records = []
    def append(self, payload, marker):
        prev = self.records[-1]["hash"] if self.records else "GENESIS"
        h = hashlib.sha3_512(f"{prev}:{payload}:{marker}".encode()).hexdigest()
        rec = {"index": len(self.records), "prev_hash": prev, "payload": payload, "marker": marker, "hash": h}
        self.records.append(rec); return rec
    def verify(self):
        prev = "GENESIS"
        for r in self.records:
            if r["prev_hash"] != prev: return False
            if r["hash"] != hashlib.sha3_512(f"{prev}:{r['payload']}:{r['marker']}".encode()).hexdigest(): return False
            prev = r["hash"]
        return True
