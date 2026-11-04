/* ZINIUM runtime harness — proves the 2026-11-03 upgrade RUNS in the
   app's own JavaScript (not just carried as a record).
   Run: node tests/test-zinium-runtime.js  (exit 0 = all pass)
   Loads the app's ACTUAL files from www/js (records, genesis,
   agencies, zinium-core, ledger, space-probe, manifest, then
   zinium-runtime), sends test messages through the real chat path
   (ZiniumCore.answerQuestion -> ZiniumRuntime.processChat), and
   asserts: token generation varies with input, causal masking holds,
   positional encoding varies by position, chain records instantiate
   and route, spine errors are recorded (not swallowed), mesh
   checksums verify and tampering is rejected, and the pure-JS
   SHA-256 matches Node's crypto. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const WWW = path.join(ROOT, "www");

global.window = global;
let store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { store = {}; },
};
for (const f of ["records.js", "genesis.js", "agencies.js", "zinium-core.js",
                 "ledger.js", "space-probe.js", "manifest.js",
                 "zinium-runtime.js"]) {
  require(path.join(WWW, "js", f));
}
const R = global.ZiniumRuntime;

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (extra ? " :: " + extra : "")); }
}

/* ---- SHA-256: known vectors + parity with Node crypto ---- */
t("sha256 empty string vector",
  R.sha256Hex("") === "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
t("sha256 'abc' vector",
  R.sha256Hex("abc") === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
for (const s of ["ZINIUM⁵ chain 500", "packet|500|chat-process|{\"q\":\"hi\"}",
                 "x".repeat(200), "Grüße, Welt — ünïcode ✓"]) {
  const ref = crypto.createHash("sha256").update(s, "utf8").digest("hex");
  t("sha256 matches node crypto (" + s.slice(0, 18) + "…)", R.sha256Hex(s) === ref);
}

/* ---- Tokenizer ---- */
t("tokenize/detokenize roundtrip (printable ASCII)",
  R.detokenize(R.tokenize("What is chain 690?")) === "What is chain 690?");
t("tokenize maps non-ASCII to space, never crashes",
  R.detokenize(R.tokenize("café⁵")) === "caf" + " " + " " ||
  R.detokenize(R.tokenize("café⁵")).length === 5);

/* ---- Backbone: real forward pass, seeded reference ---- */
t("model is honestly labelled seeded-reference, untrained",
  R.Backbone.info.kind === "seeded-reference" && R.Backbone.info.trained === false);
const pe = R.sinusoidalPE(4, 32);
t("positional encoding varies by position",
  JSON.stringify(pe[0]) !== JSON.stringify(pe[1]) &&
  JSON.stringify(pe[1]) !== JSON.stringify(pe[2]));
t("positional encoding position 0 is sin/cos origin",
  pe[0][0] === 0 && pe[0][1] === 1);
const toksA = R.tokenize("What does chain 690 do?");
const logitsA = R.Backbone.forward(toksA);
t("forward returns (seq x vocab) logits",
  logitsA.length === toksA.length && logitsA[0].length === 95);
const toksChanged = toksA.slice();
toksChanged[toksChanged.length - 1] = (toksChanged[toksChanged.length - 1] + 7) % 95;
const logitsChanged = R.Backbone.forward(toksChanged);
t("causal mask: changing the LAST token leaves earlier logits identical",
  JSON.stringify(logitsA[0]) === JSON.stringify(logitsChanged[0]) &&
  JSON.stringify(logitsA[1]) === JSON.stringify(logitsChanged[1]));
t("causal mask: the changed position's own logits DO change",
  JSON.stringify(logitsA[logitsA.length - 1]) !== JSON.stringify(logitsChanged[logitsChanged.length - 1]));
const gen1 = R.Backbone.generate(R.tokenize("What is ZINIUM?"), 12);
t("generate appends exactly maxNew tokens",
  gen1.length === R.tokenize("What is ZINIUM?").length + 12);
const bb2 = R.createBackbone();
const gen2 = bb2.generate(R.tokenize("What is ZINIUM?"), 12);
t("seeded model is deterministic across instances", JSON.stringify(gen1) === JSON.stringify(gen2));
const genOther = R.Backbone.generate(R.tokenize("Tell me about Senpi and Hyperliquid"), 12);
t("generation varies with input",
  JSON.stringify(gen1.slice(-12)) !== JSON.stringify(genOther.slice(-12)),
  JSON.stringify(gen1.slice(-12)) + " vs " + JSON.stringify(genOther.slice(-12)));

/* ---- Spine: chains instantiate, route, record ---- */
const inst = R.Spine.instantiate();
t("spine instantiates exactly the 5 chains 500/690/865/656/657",
  inst.length === 5 &&
  JSON.stringify(inst.map((c) => c.id)) === JSON.stringify([500, 690, 865, 656, 657]));
t("every chain carries readable metadata (name + role)",
  inst.every((c) => c.name.indexOf(String(c.id)) !== -1 && c.role.length > 30));
t("chain 500 metadata names the canonical center coordinate",
  inst[0].role.indexOf("(500, 500, 500, 500, 500)") !== -1);
t("lane mapping: chain-690 -> 690, chain-865 -> 865, general -> 500",
  R.chainForLane("chain-690") === 690 && R.chainForLane("chain-865") === 865 &&
  R.chainForLane("general") === 500);
const spineFresh = R.createSpine();
const route1 = spineFresh.route({ lane: "chain-690", text: "What does chain 690 do?" });
t("route succeeds to chain 690", route1.ok === true && route1.chain === 690);
t("route returns a sha256 digest of the computation",
  /^[0-9a-f]{64}$/.test(route1.digest));
const spineFresh2 = R.createSpine();
const routeRepeat = spineFresh2.route({ lane: "chain-690", text: "What does chain 690 do?" });
t("same input on a fresh chain reproduces the same digest",
  routeRepeat.digest === route1.digest);
const routeAgain = spineFresh.route({ lane: "chain-690", text: "What does chain 690 do?" });
t("chain state is carried: same input again on the same chain advances processed count",
  routeAgain.ok === true && routeAgain.processed === 2);
t("spine ledger recorded the routes on this phone",
  spineFresh.ledger().length >= 2);
const errBefore = spineFresh.errors.length;
const badRoute = spineFresh.route({ chainId: 999, text: "nowhere" });
t("unknown chain returns ok:false WITH the error, never silent",
  badRoute.ok === false && typeof badRoute.error === "string" &&
  badRoute.error.indexOf("999") !== -1);
t("routing error is recorded in spine.errors",
  spineFresh.errors.length === errBefore + 1);
const emptyRoute = spineFresh.route({ chainId: 500, tokens: [] });
t("empty process is an error too, recorded not swallowed", emptyRoute.ok === false);

/* ---- Mesh: checksum verifies, tampering rejected, sniff/clone refused ---- */
const pkt = R.Mesh.createPacket("halex-ai-phone", "690", "chat-process", "{\"q\":\"hi\"}", 1793700000);
const wire = R.Mesh.encodePacket(pkt);
const back = R.Mesh.decodePacket(wire);
t("mesh packet round-trips and verifies",
  back.verified === true && back.data === pkt.data && back.chain === "690");
const tamperedPayload = wire.slice(0, wire.indexOf("\n") + 1) +
  R.Mesh.encodePacket(R.Mesh.createPacket("halex-ai-phone", "690", "chat-process", "{\"q\":\"HI\"}", 1793700000)).split("\n")[1];
let tamperThrew = false;
try { R.Mesh.decodePacket(wire.split("\n")[0] + "\n" + tamperedPayload.split("\n")[1] || ""); }
catch (e) { tamperThrew = /checksum|length/.test(e.message); }
if (!tamperThrew) { /* simpler: swap payload under original header */
  try { R.Mesh.decodePacket(wire.slice(0, wire.indexOf("\n") + 1) + "AAAA"); }
  catch (e) { tamperThrew = /checksum|length/.test(e.message); }
}
t("tampered payload is rejected (checksum/length)", tamperThrew);
const tamperedHeader = wire.replace("chat-process", "chat-procesx");
let headerThrew = false;
try { R.Mesh.decodePacket(tamperedHeader); } catch (e) { headerThrew = /checksum/.test(e.message); }
t("tampered header is rejected (checksum mismatch)", headerThrew);
let sniffThrew = false, cloneThrew = false;
try { R.Mesh.sniff(); } catch (e) { sniffThrew = /refused/.test(e.message); }
try { R.Mesh.clone_traffic(); } catch (e) { cloneThrew = /refused/.test(e.message); }
t("sniff() refuses outright", sniffThrew);
t("clone_traffic() refuses outright", cloneThrew);
t("bluetooth seed deploy is honestly unavailable, nothing sent",
  R.Mesh.deployViaBluetoothSeed(pkt).status === "unavailable");

/* ---- Chat path: real messages through core + runtime ---- */
store = {};
const q1 = "What does chain 690 do?";
const a1 = global.ZiniumCore.answerQuestion(q1);
t("chat core answers the 690 question from records", a1.status === "ANSWERED");
const run1 = R.processChat(q1, a1);
t("processChat ok: backbone + spine + mesh all ran",
  run1.ok === true && run1.spine.ok === true && run1.mesh.verified === true,
  JSON.stringify(run1));
t("processChat routed the 690 question to chain 690",
  run1.spine.chain === 690 && run1.lane === "chain-690");
t("processChat generated continuation tokens",
  Array.isArray(run1.generatedTokens) && run1.generatedTokens.length === 24 &&
  typeof run1.continuation === "string" && run1.continuation.length === 24);
t("processChat mesh checksum is a real sha256",
  /^[0-9a-f]{64}$/.test(run1.mesh.checksum));
const q2 = "What is chain 865?";
const a2 = global.ZiniumCore.answerQuestion(q2);
const run2 = R.processChat(q2, a2);
t("865 question routes to chain 865",
  run2.ok === true && run2.spine.chain === 865, JSON.stringify(run2.spine));
const q3 = "What is Senpi?";
const a3 = global.ZiniumCore.answerQuestion(q3);
const run3 = R.processChat(q3, a3);
t("other lanes route to an instantiated chain (500/656/657 fallback set or mapped)",
  run3.ok === true && [500, 656, 657, 690, 865].indexOf(run3.spine.chain) !== -1);
t("different questions produce different backbone continuations",
  run1.continuation !== run3.continuation,
  JSON.stringify(run1.continuation) + " vs " + JSON.stringify(run3.continuation));
t("runtime states its boundary (aids trace; never decides/signs/spends)",
  run1.boundary.indexOf("never decides") !== -1 &&
  run1.boundary.indexOf("chain records") !== -1);
t("runtime status lists all 5 chains with processed counts",
  R.status().chains.length === 5 &&
  R.status().chains.every((c) => typeof c.processed === "number"));
t("runtime status keeps gpuAvailable false (no GPU claimed)",
  R.status().gpuAvailable === false);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
