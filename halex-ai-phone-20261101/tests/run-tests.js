/* HALEX-AI phone package — node test harness.
   Run: node tests/run-tests.js  (exit 0 = all pass)
   Covers: JS/Python routing parity (12 questions), ledger chain links,
   space tiers/decide/allocation-manifest match, cube cap enforcement,
   manifest adoption gates, socket-queue validation, libraries,
   directives contents, download-section rules, asset parity.
   Note: probe()'s navigator.storage path is browser-only and is not
   exercised here; tierFor/capsFor/decide/checkInstall/checkWrite/
   checkCube (the pure decision surface) are fully covered. */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const WWW = path.join(ROOT, "www");
const PY = "/home/hatch/workspace/halex-public-data/halex-ai/workspace/zinium_1000_5/intelligence.py";

global.window = global;
let store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { store = {}; },
};
for (const f of ["records.js", "genesis.js", "agencies.js", "zinium-core.js",
                 "ledger.js", "space-probe.js", "manifest.js", "directives.js",
                 "chain-share.js", "wifi-relay.js", "chain-mapping.js",
                 "train-zinium.js", "robot-arm.js", "zinium-runtime.js"]) {
  require(path.join(WWW, "js", f));
}

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (extra ? " :: " + extra : "")); }
}

/* ---- 1. Routing parity: JS core vs Python intelligence.py ---- */
const QUESTIONS = [
  "What is Senpi?",
  "Tell me about Chaintarium's blackhole system",
  "What is an agentified blockchain?",
  "What is the builder queue state?",
  "What is ZINIUM 1000^5?",
  "What does chain 690 do?",
  "What is chain 865?",
  "What is the price of bitcoin today?",
  "Build me a trading bot",
  "Tell me about quantum flux capacitors",
  "What is the doomed planet?",
  "What is the genesis ledger?",
];
function pyAnswer(q) {
  const out = execFileSync("python3", [PY, q], { encoding: "utf8" });
  const status = (out.match(/^\[([A-Z-]+)\]/m) || [])[1] || "?";
  const trace = out.match(/^Trace: (\S+) score/m);
  return { status, top: trace ? trace[1] : null };
}
for (const q of QUESTIONS) {
  const js = global.ZiniumCore.answerQuestion(q);
  const py = pyAnswer(q);
  const jsTop = (js.trace && js.trace.length) ? js.trace[0].id : null;
  t("parity: " + q, js.status === py.status && jsTop === py.top,
    "js=" + js.status + "/" + jsTop + " py=" + py.status + "/" + py.top);
}
t("demand returns DEMAND-PLAN, not execution",
  global.ZiniumCore.answerQuestion("Build me a trading bot").status === "DEMAND-PLAN");
t("price question MISSES (no live price data)",
  global.ZiniumCore.answerQuestion("What is the price of bitcoin today?").status === "MISS");
t("unknown topic MISSES with proposal rules intact",
  global.ZiniumCore.answerQuestion("Tell me about quantum flux capacitors").status === "MISS");
t("7 bundled records", global.ZiniumCore.recordCount() === 7);
t("32 first-cube agencies", (global.ZINIUM_AGENCIES || []).length === 32);

/* ---- 2. Ledger chain links ---- */
const v = global.ZiniumLedger.verifyChain();
t("ledger verifies", v.ok === true, JSON.stringify(v));
t("ledger has 5 genesis headers", v.blocks === 5);
t("block 1 anchors to 64 zeros",
  global.ZINIUM_GENESIS_HEADERS[0].previous_hash === "0".repeat(64));
t("each later previous_hash equals prior hash",
  global.ZINIUM_GENESIS_HEADERS.slice(1).every(
    (h, i) => h.previous_hash === global.ZINIUM_GENESIS_HEADERS[i].hash));

/* ---- 3. Space tiers / decide / allocation ---- */
const S = global.ZiniumSpace;
t("tier SMALL on tiny quota", S.tierFor(10 * 1024 * 1024, null) === "SMALL");
t("tier SMALL on low RAM", S.tierFor(null, 1) === "SMALL");
t("tier STANDARD mid quota", S.tierFor(100 * 1024 * 1024, 8) === "STANDARD");
t("tier LARGE big quota+ram", S.tierFor(1024 * 1024 * 1024, 8) === "LARGE");
t("decide fits", S.decide({ bytes: 1000, chains: 0 }, 1024 * 1024 * 1024, 8).verdict === "fits");
t("decide queued over chain cap",
  S.decide({ bytes: 1000, chains: 99 }, 1024 * 1024 * 1024, 8).verdict === "queued");
t("decide refused over quota",
  S.decide({ bytes: 99999999999, chains: 0 }, 1024, 8).verdict === "refused");
t("checkInstall refuses below 100 MB", S.checkInstall(50).ok === false);
t("checkInstall passes above 100 MB", S.checkInstall(200).ok === true);
t("checkInstall unknown free space allows with note", S.checkInstall(null).ok === true);
t("checkWrite refuses over ledger cap",
  S.checkWrite("ledger", 4 * 1024 * 1024, 2 * 1024 * 1024).ok === false);
t("checkWrite passes under cap",
  S.checkWrite("ledger", 4 * 1024 * 1024, 512 * 1024).ok === true);
t("checkCube at cap carries owner options",
  (() => { const r = S.checkCube(5 * 1024 * 1024 * 1024, 4096);
           return r.at_cap === true && r.options && r.options.length === 2; })());
t("checkCube under cap passes", S.checkCube(100, 4096).ok === true);
const im = JSON.parse(fs.readFileSync(path.join(ROOT, "android/app/src/main/assets/install-manifest.json"), "utf8"));
const A = S.ALLOCATION;
t("allocation matches install-manifest.json",
  im.storage_allocation.min_free_space_mb === A.min_free_space_mb &&
  im.storage_allocation.ledger_cap_mb === A.ledger_cap_mb &&
  im.storage_allocation.records_cap_mb === A.records_cap_mb &&
  im.storage_allocation.modules_cap_mb === A.modules_cap_mb &&
  im.storage_allocation.total_app_cap_mb === A.total_app_cap_mb &&
  im.storage_allocation.cube_space_mb === A.cube_space_mb &&
  im.cube.space_mb === 4096 && im.cube.hard_cap === true,
  JSON.stringify(im.storage_allocation));
t("install manifest states github read-only without token",
  im.github.no_token.indexOf("read-only") !== -1);
t("install manifest states download link rule",
  im.download_section.link_rule.indexOf("verified APK only") !== -1);

/* ---- 4. Manifest gates + cube cap + libraries ---- */
store = {};
const M = global.ZiniumManifest;
t("adopt refuses X provenance",
  M.adoptKnowledge({ title: "t", body: "b", provenance: "https://x.com/foo", approved_by: "human" }).ok === false);
t("adopt refuses missing fields",
  M.adoptKnowledge({ title: "t", body: "b" }).ok === false);
t("socket queue refuses unknown category",
  (() => { const r = M.queueSocketItem({ title: "t", body: "b", provenance: "https://example.com", category: "nope", recorded_need: "n" });
           return r.ok === false && r.reason.indexOf("valid categories") !== -1; })());
t("socket queue refuses missing recorded_need",
  M.queueSocketItem({ title: "t", body: "b", provenance: "https://example.com", category: "general" }).ok === false);
const qok = M.queueSocketItem({ title: "Garden notes", body: "Own-words garden notes.",
  provenance: "https://example.com/garden", category: "human-learning", recorded_need: "explain garden basics" });
t("socket queue accepts valid module", qok.ok === true && !!qok.queued.id);
const adopted = M.adoptKnowledge({ title: "Garden notes", body: "Own-words garden notes.",
  provenance: "https://example.com/garden", approved_by: "human-via-socket-queue", lane: "human-learning" });
t("human approval adopts into its category lane",
  adopted.ok === true && adopted.token.lane === "human-learning");
t("adopted token appears in manifest libraries",
  M.libraries().some((l) => l.lane === "human-learning" && l.tokens >= 1));
t("manifest carries cube + libraries",
  (() => { const m = M.buildManifest();
           return m.cube && m.cube.cap_mb === 4096 && Array.isArray(m.libraries); })());
t("cube default cap is 4096 MB", M.effectiveCubeCapMB() === 4096);
t("setCubeCapMB rejects non-positive",
  M.setCubeCapMB(0).ok === false && M.setCubeCapMB("abc").ok === false);
/* At-cap enforcement via a small owner-set cap + a big token. */
t("setCubeCapMB accepts owner override", M.setCubeCapMB(1).ok === true);
const big = M.adoptKnowledge({ title: "Big lib", body: "x".repeat(2 * 1024 * 1024),
  provenance: "https://example.com/big", approved_by: "human", lane: "general" });
t("big adoption lands under the small cap", big.ok === true);
const atCap = M.adoptKnowledge({ title: "One more", body: "small",
  provenance: "https://example.com/more", approved_by: "human", lane: "general" });
t("adoption at cap is refused with owner options",
  atCap.ok === false && atCap.options && atCap.options.length === 2,
  JSON.stringify(atCap));
t("cube status reports at_cap", M.cubeStatus().at_cap === true);
t("owner raising the cap re-enables adoption",
  M.setCubeCapMB(4096).ok === true &&
  M.adoptKnowledge({ title: "After raise", body: "small",
    provenance: "https://example.com/after", approved_by: "human", lane: "general" }).ok === true);
/* Supersession keeps history. */
const first = M.adoptKnowledge({ title: "Old note", body: "old",
  provenance: "https://example.com/old", approved_by: "human", lane: "general" });
const second = M.adoptKnowledge({ title: "New note", body: "new",
  provenance: "https://example.com/new", approved_by: "human", lane: "general",
  supersedes: first.token.id });
t("supersession appends, old record stays readable",
  second.ok === true && second.token.supersedes === first.token.id &&
  M.listLocalRecords().some((r) => r.id === first.token.id));
/* Local chains: DRAFT -> parity -> ACTIVE, rollback. */
const draft = global.ZiniumLedger.requestChain("Test chain", "zinium cube genesis facts", false);
t("chain request starts DRAFT", draft.ok === true && draft.draft.status === "DRAFT");
const act = global.ZiniumLedger.activateDraft(draft.draft.id);
t("parity gate activates a need-traced draft", act.ok === true);
const draft2 = global.ZiniumLedger.requestChain("Bad chain", "asdf qwer zxcv", false);
const act2 = global.ZiniumLedger.activateDraft(draft2.draft.id);
t("parity gate holds an untraced draft", act2.ok === false);
t("rollback deletes a draft",
  global.ZiniumLedger.rollbackDraft(draft2.draft.id).ok === true);
t("bundled headers untouched by local chain ops", global.ZiniumLedger.verifyChain().ok === true);

/* ---- 5. Directives, download section, asset parity ---- */
const dir = global.ZINIUM_DIRECTIVES || "";
for (const needle of ["Construction rules", "DEPOSIT PROCEDURE", "4 GB",
                      "read-only", "ADOPT", "127.0.0.1", "THE CUBE",
                      "never a board flash", "never a paywall"]) {
  t("directives mention: " + needle, dir.indexOf(needle) !== -1);
}
const dl = fs.readFileSync(path.join(ROOT, "download-section.html"), "utf8");
t("download section asks donations first (donation block before download block)",
  dl.indexOf("Support the build") !== -1 &&
  dl.indexOf("Support the build") < dl.indexOf("Download</h3>"));
t("download section carries both public donation addresses",
  dl.indexOf("utJ3CPNT6zHiaQvr356vURiQVQ3GhobWUDbRMUybHww") !== -1 &&
  dl.indexOf("0xE2CF47E4974484A021A72D50e0A2FC7188E2aA38") !== -1);
t("download section states voluntary, never a paywall",
  dl.indexOf("voluntary") !== -1 && dl.indexOf("never locked behind") !== -1);
t("download section publishes no live link (no http href)",
  !/href="https?:/.test(dl));
t("download section shows not-verified state",
  dl.indexOf("APK download appears here once the build") !== -1);
const html = fs.readFileSync(path.join(WWW, "index.html"), "utf8");
for (const needle of ["Agent socket", "GitHub", "The cube", "Approval queue",
                      "Human-first browser learning", "No live LLM"]) {
  t("index.html contains: " + needle, html.indexOf(needle) !== -1);
}
t("assets README equals www README",
  fs.readFileSync(path.join(ROOT, "android/app/src/main/assets/README-AGENT-DIRECTIVES.md"), "utf8") ===
  fs.readFileSync(path.join(WWW, "README-AGENT-DIRECTIVES.md"), "utf8"));
t("assets install-manifest equals www install-manifest",
  fs.readFileSync(path.join(ROOT, "android/app/src/main/assets/install-manifest.json"), "utf8") ===
  fs.readFileSync(path.join(WWW, "install-manifest.json"), "utf8"));

/* ---- 6. ZINIUM running: adopted tokens answer in chat ---- */
store = {};
const live = M.adoptKnowledge({ title: "Lighthouse keeper notes",
  body: "Own-words notes about keeping a lighthouse lamp lit through storms.",
  provenance: "https://example.com/lighthouse", approved_by: "human", lane: "human-learning" });
t("adopted token carries triggers derived from its own words",
  live.ok === true && Array.isArray(live.token.triggers) &&
  live.token.triggers.indexOf("lighthouse") !== -1,
  JSON.stringify(live.token.triggers));
const liveAns = global.ZiniumCore.answerQuestion("How does a lighthouse keeper keep the lamp lit?");
t("chat answers from the adopted token, trace names it locally-adopted",
  liveAns.status === "ANSWERED" && liveAns.trace.length > 0 &&
  liveAns.trace[0].id === live.token.id && liveAns.trace[0].origin === "locally-adopted",
  liveAns.status + " :: " + JSON.stringify(liveAns.trace));
t("chain record count covers bundled + adopted",
  global.ZiniumCore.chainRecordCount() === 8 && global.ZiniumCore.recordCount() === 7);
t("MISS topic list includes the adopted title",
  global.ZiniumCore.answerQuestion("Tell me about quantum flux capacitors").answer.indexOf("Lighthouse keeper notes") !== -1);
/* A token adopted before triggers existed (no triggers field at all)
   must still route, from its own words. */
store["zinium-phone-local-records"] = JSON.stringify([{
  id: "learn-legacy", kind: "TOKEN", title: "Harbor tide tables",
  body: "Own-words notes about reading harbor tide tables before sailing.",
  provenance: "https://example.com/tides", approved_by: "human",
  lane: "human-learning", adopted_at: "2026-11-01T00:00:00Z", supersedes: null }]);
const legacyAns = global.ZiniumCore.answerQuestion("How do I read harbor tide tables before sailing?");
t("legacy trigger-less token still routes from its own words",
  legacyAns.status === "ANSWERED" && legacyAns.trace.length > 0 &&
  legacyAns.trace[0].id === "learn-legacy",
  legacyAns.status + " :: " + JSON.stringify(legacyAns.trace));

/* ---- 7. New tabs: cube sync + robot + share + wifi + mapping + train ---- */
store = {};
const CubeRunner = require(path.join(ROOT, "cube-tab", "chain-runner.js"));
t("cube-tab copy in www matches the cube-tab source",
  fs.readFileSync(path.join(ROOT, "cube-tab", "index.html"), "utf8") ===
    fs.readFileSync(path.join(WWW, "cube-tab", "index.html"), "utf8") &&
  fs.readFileSync(path.join(ROOT, "cube-tab", "chain-runner.js"), "utf8") ===
    fs.readFileSync(path.join(WWW, "cube-tab", "chain-runner.js"), "utf8"));
const slice1000 = CubeRunner.computeChainSlice(1000, "cube");
t("cube slice 1000 points: all computed and verified, none failed",
  slice1000.computed === 1000 && slice1000.verified === 1000 && slice1000.failed === 0,
  JSON.stringify(slice1000));
t("cube origin stays fixed at (0,0,0)",
  JSON.stringify(CubeRunner.originPosition()) === JSON.stringify([0, 0, 0]));
["cube", "sphere", "tetrahedron", "egg"].forEach(function (shape) {
  const s = CubeRunner.computeChainSlice(100, shape);
  t("cube slice 100 verified for shape " + shape,
    s.computed === 100 && s.verified === 100 && s.failed === 0);
});
const armOk = global.RobotArm.create();
armOk.setBase(0); armOk.setShoulder(19); armOk.setElbow(-83); armOk.closeGrip();
armOk.setShoulder(60); armOk.setElbow(-77); armOk.openGrip();
t("robot arm success path: grip, carry, drop in box",
  armOk.getState().state === "success", JSON.stringify(armOk.getState().state));
const armMiss = global.RobotArm.create(); armMiss.closeGrip();
t("robot arm missed grip fails with ball unmoved",
  armMiss.getState().state === "fail");
t("robot protocol never claims a physical arm",
  global.RobotArm.connectionNotice.indexOf("No physical arm connected") !== -1);
t("share reports no live Bluetooth discovery without a bridge",
  global.ChainShare.detectCapabilities().live_discovery_available === false);
t("share import refuses key material",
  global.ChainShare.validateBundle({ format: "halex-chain-bundle", version: 1,
    manifest_summary: {}, adopted_local_records: [], bundled_record_count: 7,
    private_key: "x" }).ok === false);
t("wifi probe with nothing configured is not-ready and makes no network attempt",
  (() => { const p = global.WifiRelay.probe();
           return p.ready === false && p.network_attempt_made === false; })());
t("mapping stays off with no geolocation and records nothing",
  global.ChainMapping.enable().ok === false && global.ChainMapping.pointCount() === 0);
t("train capabilities report per-app usage as user-logged, not measured",
  (() => { const c = global.TrainZinium.capabilities().filter((x) => x.id === "categories")[0];
           return c && c.status === "user-logged" && c.reason.indexOf("UsageStats") !== -1; })());
t("train free-text activity refused",
  global.TrainZinium.recordActivity("hello world").ok === false);
t("train session: start, tap, finish report, delete empties the store",
  (() => { const s = global.TrainZinium.start();
           if (!s.ok) return false;
           global.TrainZinium.recordActivity("work");
           const f = global.TrainZinium.finish();
           const d = global.TrainZinium.deleteAll();
           try { global.TrainZinium.stopTimer(); } catch (e) {}
           return f.ok === true && !!f.report && d.stored === null &&
             global.localStorage.getItem(global.TrainZinium.STORAGE_KEY) === null; })());

/* ---- 8. ZINIUM runtime runs (full proof: tests/test-zinium-runtime.js) ---- */
const RT = global.ZiniumRuntime;
t("runtime loaded from www/js", !!RT && !!RT.Backbone && !!RT.Spine && !!RT.Mesh);
t("runtime backbone is labelled seeded-reference, untrained",
  RT.Backbone.info.kind === "seeded-reference" && RT.Backbone.info.trained === false);
t("runtime spine instantiates chains 500/690/865/656/657",
  JSON.stringify(RT.Spine.instantiate().map((c) => c.id)) ===
  JSON.stringify([500, 690, 865, 656, 657]));
const chatRun = RT.processChat("What does chain 690 do?",
  global.ZiniumCore.answerQuestion("What does chain 690 do?"));
t("chat path runs backbone + spine + mesh end to end",
  chatRun.ok === true && chatRun.spine.chain === 690 &&
  chatRun.mesh.verified === true && chatRun.generatedTokens.length === 24,
  JSON.stringify(chatRun.spine));
let runtimeTamperThrew = false;
try {
  const p = RT.Mesh.createPacket("halex-ai-phone", "500", "chat-process", "hello", 1793700000);
  const w = RT.Mesh.encodePacket(p).replace("hello", "hellp");
  RT.Mesh.decodePacket(w.replace(/aGVsbG8=/, "aGVsbHA="));
} catch (e) { runtimeTamperThrew = /checksum|length/.test(e.message); }
t("runtime mesh rejects a tampered packet", runtimeTamperThrew);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
