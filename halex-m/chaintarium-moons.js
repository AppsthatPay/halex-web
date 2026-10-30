/* ---------------- Chaintarium planetarium helpers ----------------
   Pure, testable logic for the Chaintarium declutter pass (2026-10-29):
   the wallet color code, the surface layer switches, the planet-view
   search query classification, and the token / wallet moon-system
   model (bubblemaps reimagined as a planetarium).

   Nothing in here reads the chain or invents data. Models are built
   only from rows the page actually read, or from an explicitly
   labelled stylized generator. No network, no wallet code, no keys. */
(function(){
  "use strict";

  /* The color code, exactly as ordered: wallet classes first, then
     the two building classes for tokens on a planet surface. */
  var WALLET_CLASSES = {
    normal:   { css:"#35d465", hex:0x35d465, label:"Normal wallet",            blurb:"a normal wallet" },
    deployer: { css:"#ffd23e", hex:0xffd23e, label:"Deployer wallet",          blurb:"it deployed tokens" },
    farmer:   { css:"#ff9f2e", hex:0xff9f2e, label:"Liquidity farmer",         blurb:"it farms liquidity or creates bundled tokens" },
    stolen:   { css:"#ff5148", hex:0xff5148, label:"Holds stolen liquidity",   blurb:"it holds stolen liquidity" },
    exchange: { css:"#b45cff", hex:0xb45cff, top:"#35d465", label:"Exchange basket", blurb:"an exchange basket, purple with a green top" },
    fresh:    { css:"#f4f7ff", hex:0xf4f7ff, label:"Newly created wallet",     blurb:"a newly created wallet" },
    empty:    { css:"#39404d", hex:0x141a22, label:"Empty wallet",             blurb:"an empty wallet, drawn as a black square" }
  };
  var BUILDING_CLASSES = {
    good: { css:"#ffc24b", hex:0xffc24b, label:"Token in good standing", blurb:"a gold building: a token with liquidity and good standing" },
    dead: { css:"#05070a", hex:0x05070a, label:"Rugged or dead project", blurb:"a black triangle building: a rugged or dead project" }
  };

  /* The surface layers the side toolbar switches on and off. */
  var LAYER_DEFS = [
    { key:"platforms",    label:"Platforms",    dot:"#b45cff" },
    { key:"wallets",      label:"Wallets",      dot:"#35d465" },
    { key:"transactions", label:"Transactions", dot:"#5aa9ff" },
    { key:"flows",        label:"Token flows",  dot:"#2ee6c8" },
    { key:"rugs",         label:"Rugs",         dot:"#ff5148" },
    { key:"bundles",      label:"Bundles",      dot:"#ff9f2e" },
    { key:"labels",       label:"Labels",       dot:"#ffe1a8" },
    { key:"scan",         label:"Scan card",    dot:"#ffd98a" }
  ];
  function defaultLayerState(){
    var s = {};
    LAYER_DEFS.forEach(function(d){ s[d.key] = true; });
    return s;
  }
  /* Apply a layer state to the live targets: the surface element
     (class flags drive the label and scan-card CSS), the per-layer
     THREE groups (visible flag), and the toolbar buttons
     (aria-pressed). Deliberately DOM-light so the harness can drive
     it with plain fakes. */
  function applyLayerState(state, targets){
    if(!state || !targets) return;
    LAYER_DEFS.forEach(function(d){
      var on = state[d.key] !== false;
      if(targets.rootEl && targets.rootEl.classList)
        targets.rootEl.classList.toggle("lyr-off-" + d.key, !on);
      if(targets.groups && targets.groups[d.key])
        targets.groups[d.key].visible = on;
      if(targets.buttons) targets.buttons.forEach(function(b){
        if(b && b.dataset && b.dataset.layer === d.key && b.setAttribute)
          b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  }

  /* What kind of thing did the user type into the planet search?
     Address shapes only; names are resolved by the caller against
     the chain catalog and live token search. */
  function classifySurfQuery(q){
    var s = String(q == null ? "" : q).trim();
    if(/^0x[0-9a-fA-F]{40}$/.test(s)) return { kind:"address", chain:"evm", address:s };
    if(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return { kind:"address", chain:"solana", address:s };
    if(s.length >= 2) return { kind:"text", text:s };
    return { kind:"empty" };
  }

  /* Moon sizing: radius grows with the square root of the holding,
     so ordering is always monotonic in the holding itself. */
  var MOON_MIN_R = 0.34, MOON_MAX_R = 1.55;
  function radiusFor(value, maxValue){
    var v = Number(value) || 0, m = Number(maxValue) || 0;
    if(v <= 0 || m <= 0) return MOON_MIN_R;
    var r = MOON_MIN_R + (MOON_MAX_R - MOON_MIN_R) * Math.sqrt(Math.min(1, v / m));
    return Math.round(r * 1000) / 1000;
  }
  /* Below this share of the biggest holding, a holder is dust and
     renders as a speckle, never a moon. */
  var DUST_FRACTION = 0.01;

  /* Build the moon-system model from holder rows:
     [{ address, label, value, cls }] in any order. Returns moons
     (sorted by value, biggest first) placed on a deterministic
     golden-angle spiral around the center, dust as speckles, and
     link pairs (indices into moons) for the bubblemaps-style lines
     drawn behind the moons: every moon links toward the center, and
     neighbouring moons link to each other in a ring. */
  function buildMoonModel(holders){
    var rows = (holders || []).filter(function(h){ return h && (Number(h.value) || 0) > 0; });
    rows.sort(function(a, b){ return (Number(b.value) || 0) - (Number(a.value) || 0); });
    var max = rows.length ? (Number(rows[0].value) || 0) : 0;
    var moons = [], speckles = [];
    rows.forEach(function(h, i){
      var v = Number(h.value) || 0;
      if(max > 0 && v < max * DUST_FRACTION){ speckles.push({ address:h.address || "", label:h.label || "", value:v, cls:h.cls || "normal" }); return; }
      var ang = i * 2.39996; /* golden angle */
      var dist = 9.5 + (i % 5) * 1.9 + Math.floor(i / 5) * 1.15;
      moons.push({
        address: h.address || "", label: h.label || "", value: v,
        cls: WALLET_CLASSES[h.cls] ? h.cls : "normal",
        radius: radiusFor(v, max),
        angle: Math.round(ang * 10000) / 10000,
        dist: Math.round(dist * 100) / 100,
        tilt: Math.round(Math.sin(i * 1.7) * 0.38 * 1000) / 1000
      });
    });
    var links = [];
    for(var i = 0; i < moons.length; i++){
      if(i > 0) links.push([i, i - 1]);           /* ring links */
      if(i >= 5 && i % 3 === 0) links.push([i, i - 5]); /* cross links */
    }
    return { moons: moons, speckles: speckles, links: links, maxValue: max, holderCount: rows.length };
  }

  /* Deterministic stylized holder rows for chains where the page has
     no live holder read. This is a MODEL and the view labels it as
     one (live holder read: NOT READ). Seeded by the token address so
     the same token always draws the same sky. */
  function hashStr(s){
    var h = 2166136261;
    s = String(s || "");
    for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }
  function stylizedHolders(seedStr, count){
    var n = count || 24, out = [];
    for(var i = 0; i < n; i++){
      var r = hashStr(seedStr + ":" + i);
      var r2 = hashStr(seedStr + ":v:" + i);
      var value = Math.pow(10, 2 + r2 * 4) * (1 - i / (n + 6));
      var cls = "normal";
      if(i === 0) cls = "deployer";
      else if(i === 1) cls = "exchange";
      else if(r > 0.86) cls = "farmer";
      else if(r > 0.78) cls = "fresh";
      out.push({ address:"", label:"Model holder " + (i + 1), value: Math.round(value * 100) / 100, cls: cls });
    }
    return out;
  }

  /* The render-mode picker: one place that decides what a search
     opens, keyed on the search type and its classification.
       chain                     -> "surface"      (the planet itself)
       token, healthy            -> "token-moons"  (token planet, holder moons)
       token, rugged or dead     -> "rug-replay"   (deployment to rug, looping)
       wallet                    -> "wallet-system" (wallet-centered moons)
       transaction, normal       -> "tx-green"     (one simple green flow)
       transaction, rug-linked   -> "rug-replay"
     Future modes slot in here, nowhere else. */
  function pickRenderMode(input){
    input = input || {};
    if(input.type === "chain") return "surface";
    if(input.type === "token") return input.rugged ? "rug-replay" : "token-moons";
    if(input.type === "wallet") return "wallet-system";
    if(input.type === "transaction") return input.rugLinked ? "rug-replay" : "tx-green";
    return "surface";
  }

  /* Rug replay steps: the ordered story of a rug, built from a moon
     model plus whatever recorded facts the caller actually has.
     Each step: { t (0..1 through the loop), kind, ... }. Extraction
     flows run from the token (index -1 = the center) to the biggest
     extractors; the present-day step names the wallets that stay lit
     (still carrying value or tied into a farming structure). The
     builder never invents recorded facts: callers pass `recorded`
     facts separately and the view labels anything else as a stylized
     reconstruction. */
  function buildRugReplaySteps(model, opts){
    opts = opts || {};
    var moons = (model && model.moons) || [];
    var steps = [];
    steps.push({ t:0.00, kind:"deploy", note:"Deployment: the token is created and its first pool opens." });
    var arrivals = Math.min(moons.length, 8);
    for(var i = 0; i < arrivals; i++){
      steps.push({ t:0.08 + i * (0.30 / Math.max(1, arrivals)), kind:"arrive", moon:i,
        note:"A wallet joins the holder sky." });
    }
    steps.push({ t:0.42, kind:"seed-hype", note:"Trading heats up: buys pile in and the price runs." });
    var extractors = moons.map(function(m, ix){ return ix; })
      .sort(function(a, b){ return (moons[b].value || 0) - (moons[a].value || 0); })
      .slice(0, Math.min(4, moons.length));
    extractors.forEach(function(ix, k){
      steps.push({ t:0.52 + k * 0.09, kind:"extract", moon:ix,
        note:"Value flows out to one of the wallets that took the most." });
    });
    steps.push({ t:0.88, kind:"rug", note:"The rug: liquidity is pulled and the price collapses." });
    var stillLit = extractors.filter(function(ix){
      var cls = moons[ix] && moons[ix].cls;
      return cls === "stolen" || cls === "farmer" || cls === "deployer";
    });
    steps.push({ t:0.96, kind:"present", lit:stillLit,
      note:"Present day: wallets still lit are still carrying value, or tied into a wallet-farming structure." });
    steps.sort(function(a, b){ return a.t - b.t; });
    return { steps:steps, extractors:extractors, stillLit:stillLit, durationMs: opts.durationMs || 16000 };
  }

  window.ChainMoons = {
    WALLET_CLASSES: WALLET_CLASSES,
    BUILDING_CLASSES: BUILDING_CLASSES,
    LAYER_DEFS: LAYER_DEFS,
    defaultLayerState: defaultLayerState,
    applyLayerState: applyLayerState,
    classifySurfQuery: classifySurfQuery,
    radiusFor: radiusFor,
    DUST_FRACTION: DUST_FRACTION,
    buildMoonModel: buildMoonModel,
    stylizedHolders: stylizedHolders,
    pickRenderMode: pickRenderMode,
    buildRugReplaySteps: buildRugReplaySteps,
    hashStr: hashStr
  };
})();
