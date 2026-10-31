/* ZINIUM cube bridge — STAGING ONLY, read-only, no network, no keys.
 *
 * Wires the 1000^5 first-cube records into the HALEX-AI app as a
 * record viewer + record Q&A. It does NOT run Python, does NOT
 * execute bytecode, does NOT train, and does NOT talk to a live
 * model. It answers only from zinium-cube-state.json, which is
 * a snapshot generated from the staging ledger.
 *
 * Usage in a page:
 *   <script src="zinium-cube-state.json" type="application/json" id="cube-state"></script>
 *   <script src="zinium-cube-bridge.js"></script>
 *   HalexCube.answer("What is token think?")
 *   // -> {status: "ANSWERED", answer: "...", source: "ledger block 4"}
 *   // Unknown topics -> {status: "MISS", answer: "I don't have that in the cube records..."}
 *
 * Questions are handled in memory only and are never sent anywhere.
 */
(function () {
  "use strict";
  var state = null;
  try {
    var el = document.getElementById("cube-state");
    if (el) state = JSON.parse(el.textContent);
  } catch (e) { state = null; }

  function topics() {
    return state && state.qa_topics ? state.qa_topics.join("; ") : "cube records";
  }
  function miss() {
    return { status: "MISS", answer: "I don't have that in the cube records. I can answer about: " + topics() + ".", source: "none" };
  }
  function answer(question) {
    if (!state) return { status: "ERROR", answer: "Cube state snapshot is not loaded.", source: "none" };
    var q = String(question || "").toLowerCase();
    if (q.indexOf("think") !== -1) return { status: "ANSWERED", answer: "Token 'think' is an open record, 10,000,000,100 integer units, deployed to the center wallet and shared as a copy to all 31 other first-cube agencies. It is not a crypto asset and has no value.", source: "ledger block 4" };
    if (q.indexOf("how many agencies") !== -1) return { status: "ANSWERED", answer: "The first cube has " + state.agencies_count + " agencies, one per cell where each axis is 500 or 501.", source: "agencies.json" };
    if (q.indexOf("center") !== -1) return { status: "ANSWERED", answer: "The center corner is (500, 500, 500, 500, 500), attached to Brainchain chain 500.", source: "ledger block 1" };
    if (q.indexOf("mandate") !== -1) return { status: "ANSWERED", answer: state.mandate, source: "agencies.json" };
    if (q.indexOf("technolog") !== -1) return { status: "ANSWERED", answer: "The first chain technologies are: " + state.technologies.join(", ") + ". Each is a text manifest record, never executed.", source: "ledger block 3" };
    if (q.indexOf("last block") !== -1) return { status: "ANSWERED", answer: "The last block is block " + state.last_block + " (" + state.last_kind + "), hash " + state.last_hash + ".", source: "ledger.jsonl" };
    if (q.indexOf("how many blocks") !== -1 || q.indexOf("blocks") !== -1) return { status: "ANSWERED", answer: "The ledger has " + state.blocks + " blocks.", source: "ledger.jsonl" };
    if (q.indexOf("operational") !== -1 || q.indexOf("await") !== -1) return { status: "ANSWERED", answer: "Agencies are " + state.agency_status + " and, after each bounded pass, back to " + state.operational_state + ".", source: "ledger last block" };
    return miss();
  }
  window.HalexCube = { state: state, answer: answer, topics: topics };
})();
