"""ZINIUM mesh packet layer — staging, own-device only.

CORRECTIONS vs the 2026-11-03 paste (not pasted raw):
- The paste called the sha256 header field a "signature"/"cryptographic
  verification". It is a CHECKSUM. A checksum detects corruption; it does
  not authenticate anyone. This module names it checksum everywhere and
  never claims signing.
- The paste's transceiver sniffed/cloned other devices' traffic and its
  deploy functions printed success without sending anything. This build
  REFUSES sniff/clone operations outright, its Bluetooth seed deploy
  returns an explicit UNAVAILABLE record (no adapter on this host, nothing
  sent, no device touched), and its WiFi relay is loopback-only
  (127.0.0.1) for own-device testing — never a claimed real-world send.
- Standing guardrails honored: own device/data only, human-approved
  import, installs only via the user's share sheet. No silent installs.
"""
import base64
import hashlib
import json
import time


def _checksum(src, chain, kind, data_str):
    return hashlib.sha256(f"{src}{chain}{kind}{data_str}".encode("utf-8")).hexdigest()


class AgenticZiniumPacket:
    """Header: src|chain|type|len|checksum|timestamp, then b64 payload."""

    def __init__(self, src, chain, kind, data, timestamp=None):
        self.src = str(src)
        self.chain = str(chain)
        self.kind = str(kind)
        self.data = str(data)
        self.timestamp = int(timestamp if timestamp is not None else time.time())

    def encode(self):
        payload = base64.b64encode(self.data.encode("utf-8")).decode("ascii")
        header = "|".join([self.src, self.chain, self.kind,
                           str(len(self.data.encode("utf-8"))),
                           _checksum(self.src, self.chain, self.kind, self.data),
                           str(self.timestamp)])
        return header + "\n" + payload

    @classmethod
    def decode(cls, wire):
        header, _, payload = wire.partition("\n")
        parts = header.split("|")
        if len(parts) != 6:
            raise ValueError("malformed packet header")
        src, chain, kind, length, checksum, timestamp = parts
        data = base64.b64decode(payload).decode("utf-8")
        if len(data.encode("utf-8")) != int(length):
            raise ValueError("packet length mismatch")
        if _checksum(src, chain, kind, data) != checksum:
            raise ValueError("packet checksum mismatch (tampered or corrupt)")
        return cls(src, chain, kind, data, timestamp=int(timestamp))


class ZiniumMeshTransceiver:
    """Own-device packet transport. Cross-device sniff/clone: REFUSED."""

    def __init__(self, chain_id=500):
        self.chain_id = chain_id

    def loopback_roundtrip(self, packet, timeout=5.0):
        """Local round-trip: encode, checksum-verify, decode — in-process.

        NOTE: UDP sockets are blocked in this sandbox (PermissionError), so
        there is no socket transport here. What this verifies is packet
        integrity (length + checksum) through the encode/decode path, on
        this host only. No network send is claimed.
        """
        return AgenticZiniumPacket.decode(packet.encode())

    def sniff(self, *args, **kwargs):
        raise RuntimeError("refused: sniffing other devices' traffic is not permitted")

    def clone_traffic(self, *args, **kwargs):
        raise RuntimeError("refused: cloning other devices' traffic is not permitted")


def deploy_via_bluetooth_seed(packet, target=None):
    """NOT AVAILABLE on this host: no Bluetooth adapter/stack is present.

    Returns an explicit unavailable record. It never prints success and
    never touches a device. A real Bluetooth seed deploy would require a
    named host with a BLE adapter plus the user's explicit approval.
    """
    return {"status": "unavailable",
            "reason": "No Bluetooth adapter/stack present on this host; no seed sent.",
            "packet_chain": packet.chain, "target": target}


def deploy_via_wifi_relay(packet, transceiver=None):
    """In-process loopback relay for own-device testing — not a real WiFi send."""
    tx = transceiver or ZiniumMeshTransceiver(chain_id=int(packet.chain))
    received = tx.loopback_roundtrip(packet)
    return {"status": "relayed-loopback",
            "detail": "Packet verified through the in-process loopback only; "
                      "UDP sockets are blocked in this sandbox, no real network send claimed.",
            "received_src": received.src, "received_chain": received.chain}


def process_token_pass_learning(packet, engine):
    """Verify a packet, then run one learning step on its token payload."""
    if isinstance(packet, str):
        packet = AgenticZiniumPacket.decode(packet)
    payload = json.loads(packet.data)
    tokens = payload["tokens"]
    result = engine.train_step(tokens)
    result["packet_src"] = packet.src
    result["packet_chain"] = packet.chain
    return result
