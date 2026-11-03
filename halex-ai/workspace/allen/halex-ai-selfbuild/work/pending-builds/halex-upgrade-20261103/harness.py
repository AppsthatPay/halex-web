"""Harness for halex-upgrade-20261103. Run: python3 harness.py. Exit 0 = all pass."""
import json
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from zinium_neural_backbone import (
    ZiniumChainLearningEngine, ZiniumMultiHeadAttention, ZiniumNeuralBackbone,
    ZiniumTransformerBlock, sinusoidal_positional_encoding)
from zinium_mesh import (AgenticZiniumPacket, ZiniumMeshTransceiver,
                         deploy_via_bluetooth_seed, deploy_via_wifi_relay,
                         process_token_pass_learning)
from zinium_spine import DataCenterProcessorShard, ZiniumSequencer500, ZiniumSpineFabric
from zinium_gpu_dispatch import dispatch, host_report

PASSED = 0
FAILED = []


def check(name, cond):
    global PASSED
    if cond:
        PASSED += 1
        print(f"PASS {name}")
    else:
        FAILED.append(name)
        print(f"FAIL {name}")


# --- backbone ---
attn = ZiniumMultiHeadAttention(d_model=16, n_heads=4, seed=0)
x = np.random.default_rng(1).normal(size=(5, 16))
out = attn.forward(x)
check("attn shape", out.shape == (5, 16))
check("attn finite", bool(np.all(np.isfinite(out))))

pe1 = sinusoidal_positional_encoding(8, 16)
pe2 = sinusoidal_positional_encoding(8, 16)
check("pos-enc deterministic", np.allclose(pe1, pe2))
check("pos-enc varies by position", not np.allclose(pe1[0], pe1[1]))
check("pos-enc shape", pe1.shape == (8, 16))

block = ZiniumTransformerBlock(d_model=16, n_heads=4, d_ff=32, seed=0)
check("block shape", block.forward(x).shape == (5, 16))

bb = ZiniumNeuralBackbone(vocab_size=32, d_model=16, n_heads=4, n_layers=1,
                           d_ff=32, max_len=64, seed=0)
logits = bb.forward([1, 2, 3, 4])
check("backbone logits shape", logits.shape == (4, 32))
logits_b = bb.forward([1, 2, 9, 9])
check("causal mask blocks future tokens",
      np.allclose(logits[0], logits_b[0]) and np.allclose(logits[1], logits_b[1])
      and not np.allclose(logits[2], logits_b[2]))
gen = bb.generate([1, 2], max_new=4)
check("generate length + vocab range", len(gen) == 6 and all(0 <= t < 32 for t in gen))
tmp = "/tmp/halex-upgrade-bb.json"
bb.save(tmp)
bb2 = ZiniumNeuralBackbone.load(tmp, n_heads=4, d_ff=32, seed=0)
check("save/load round-trip logits equal",
      np.allclose(bb.forward([1, 2, 3]), bb2.forward([1, 2, 3])))

eng = ZiniumChainLearningEngine(bb, lr=0.05)
res = eng.train_step([1, 2, 3, 4, 5])
check("train step returns finite losses",
      math.isfinite(res["loss_before"]) and math.isfinite(res["loss_after"]))
check("train step accepted + buffer grows",
      res["accepted"] is True and res["buffer_size"] == 1 and res["steps"] == 1)
orig_w = bb.w_head.copy()
bb.w_head = bb.w_head + 5.0
reverted = eng._check_drift((orig_w, bb.b_head.copy()), 0.1, 10.0)
check("drift guard reverts on loss spike", reverted and np.allclose(bb.w_head, orig_w))
last = None
for i in range(7):
    last = eng.train_step([1, 2, 3])
check("replay fires every 8th step", eng.steps == 8 and last["replayed"] is True)

# --- mesh ---
pkt = AgenticZiniumPacket("node-a", 500, "token-pass", json.dumps({"tokens": [1, 2, 3]}))
wire = pkt.encode()
check("packet header has checksum field", "|".join(wire.split("\n")[0].split("|")[:5]).count("|") == 4)
dec = AgenticZiniumPacket.decode(wire)
check("packet round-trip", dec.src == "node-a" and dec.chain == "500"
      and dec.data == pkt.data)
tampered = wire[:-2] + ("AA" if wire[-2:] != "AA" else "BB")
try:
    AgenticZiniumPacket.decode(tampered)
    check("packet tamper detected", False)
except Exception:
    check("packet tamper detected", True)
tx = ZiniumMeshTransceiver(chain_id=500)
rt = tx.loopback_roundtrip(pkt)
check("loopback round-trip", rt.data == pkt.data and rt.src == "node-a")
for fname in ("sniff", "clone_traffic"):
    try:
        getattr(tx, fname)()
        check(f"{fname} refused", False)
    except RuntimeError as e:
        check(f"{fname} refused", "refused" in str(e))
bt = deploy_via_bluetooth_seed(pkt)
check("bluetooth seed unavailable, never success",
      bt["status"] == "unavailable" and "no seed sent" in bt["reason"].lower())
wf = deploy_via_wifi_relay(pkt)
check("wifi relay loopback-only", wf["status"] == "relayed-loopback")
learn = process_token_pass_learning(pkt, eng)
check("token-pass learning step", math.isfinite(learn["loss_before"])
      and learn["packet_chain"] == "500")

# --- spine ---
seq = ZiniumSequencer500()
check("sequencer dimensions", seq.dimensions == [500, 500, 500, 500, 500])
check("sequencer tier = shard % 5", seq.tier(7) == 2 and seq.tier(10) == 0)
check("sequencer checksum deterministic",
      seq.checksum((1, 2, 3, 4, 5)) == seq.checksum((1, 2, 3, 4, 5)))
shard = DataCenterProcessorShard(3)
check("shard placeholder label", shard.compute_kind == "placeholder-scalar")
v = shard.process(10.0)
check("shard placeholder math", abs(v - 10.0) < 1e-9)
v2 = shard.process(0.0)
check("shard multiply by 1.0005", abs(v2 - 10.0 * 1.0005) < 1e-9)
fab = ZiniumSpineFabric(n_shards=1000, workers=8)
entry = fab.route({"target": "local_chain", "shard_id": 5, "value": 2.0})
check("fabric local route is staging-only",
      entry["kind"] == "staging-record-only" and entry["label"].startswith("ZINIUM-LOCAL-"))
dist = fab.route({"target": "distribution", "shard_id": 6, "value": 1.0})
check("fabric distribution route recorded", dist["kind"] == "staging-record-only")
bad = fab.route({"target": "bogus", "shard_id": 1, "value": 0.0})
check("fabric errors recorded, not swallowed",
      "error" in bad and len(fab.errors) >= 1)
fab.shutdown()

# --- gpu dispatch ---
r1 = dispatch("cuda_exp_sin", [0.0, 1.0, 2.0])
exp = np.exp(-np.array([0.0, 1.0, 2.0])) + np.sin([0.0, 1.0, 2.0])
check("cuda kernel math correct", np.allclose(r1["result"], exp))
r2 = dispatch("hip_scale", [10.0])
check("hip kernel math correct", abs(r2["result"][0] - (10.0 * 1.0005 + 0.0005)) < 1e-9)
check("dispatch backend is cpu-reference", r1["backend"] == "cpu-reference"
      and r1["gpu_available"] is False)
try:
    dispatch("nope_kernel", [1.0])
    check("unknown kernel rejected", False)
except ValueError:
    check("unknown kernel rejected", True)
rep = host_report()
check("host report: no GPU claimed",
      rep["backend"] == "cpu-reference" and rep["gpu_available"] is False)

print(f"\n{PASSED} passed, {len(FAILED)} failed")
if FAILED:
    print("FAILED:", FAILED)
    sys.exit(1)
print("ALL GREEN")
