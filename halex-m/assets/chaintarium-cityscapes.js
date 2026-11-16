/* ---------------- Chaintarium cityscapes — 300 builder lane (staging) ----------------
   Jeffrey's cityscape legend, implemented exactly as stated, as a pure
   model layer first and a Three.js builder second. No fetch, no network,
   no keys, no signing, no prices, no live holdings. Every structure
   built here is a MODEL marker on a stylized research map unless the
   caller supplies a real record and labels it live; the demo and the
   merge map both say MODEL on their face. Nothing runs on load.
   One global only: window.HalexMChaintariumCityscapes. */
(function(){
  "use strict";

  /* 20 structure types, added by type. Each type carries the legend
     shape, colours, size class, layer, and a plain-English card blurb.
     Every type is clickable: every built mesh carries
     userData.structure with its full descriptor. */
  var LEGEND = [
    { id:"wallet-octagon-dome", label:"Wallet", shape:"octagon-dome",
      colors:{ body:0x0a0c10, trim:0x2a2f3a, top:0x1a1e28, light:0x8fa0bd },
      sizeClass:"micro", layer:"wallets",
      blurb:"A wallet: micro sized, the smallest of buildings, a tiny black octagon with stacked mini domes on top." },
    { id:"deployer-unrugged", label:"Deployment wallet (unrugged)", shape:"dome-round",
      colors:{ body:0xff7a1a, trim:0x0a0c10, top:0xff7a1a, light:0xff9f2e },
      sizeClass:"micro", layer:"wallets",
      blurb:"A deployment wallet for an unrugged token: an orange and black domed round micro building." },
    { id:"deployer-good", label:"Deployment wallet (good quality)", shape:"dome-round",
      colors:{ body:0x1fae5a, trim:0x0a3d22, top:0x35d465, light:0x35d465 },
      sizeClass:"micro", layer:"wallets",
      blurb:"A deployment wallet for a good quality token deployment: a green domed round micro building." },
    { id:"deployer-rugged", label:"Deployment wallet (rugged)", shape:"dome-round",
      colors:{ body:0xd92b20, trim:0x3d0a0a, top:0xff5148, light:0xff5148 },
      sizeClass:"micro", layer:"rugs",
      blurb:"A deployment wallet for a rugged token: a red domed round micro building." },
    { id:"deployer-rug-funded-trace", label:"Rug-funded wallet trace", shape:"dome-round-trace",
      colors:{ body:0xd92b20, trim:0x0a0c10, top:0xff5148, light:0xff5148 },
      sizeClass:"micro", layer:"rugs",
      blurb:"A wallet funded by a rug: a red domed building with a roadmap trace line showing where the rug money went." },
    { id:"token-miniscule", label:"Token (miniscule)", shape:"tower-squat",
      colors:{ body:0x241a08, trim:0xffc24b, top:0xffc24b, light:0xffc24b },
      sizeClass:"miniscule", layer:"platforms",
      blurb:"A token at the smallest scale: few holders, low volume, short history on chain." },
    { id:"token-tiny", label:"Token (tiny)", shape:"tower-squat",
      colors:{ body:0x241a08, trim:0xffc24b, top:0xffc24b, light:0xffc24b },
      sizeClass:"tiny", layer:"platforms",
      blurb:"A token at a small scale: growing holders and volume, some history on chain." },
    { id:"token-macro", label:"Token (macro large)", shape:"tower-solid",
      colors:{ body:0x2b2010, trim:0xffb03a, top:0xffc24b, light:0xffb03a },
      sizeClass:"macro", layer:"platforms",
      blurb:"A token at macro large scale: many holders, heavy volume, long history on chain. Solid and broad, never a needle." },
    { id:"transfer-street", label:"Transfer street", shape:"street",
      colors:{ body:0x1a232e, trim:0x5aa9ff, top:0x5aa9ff, light:0x5aa9ff },
      sizeClass:"street", layer:"transactions",
      blurb:"A transfer, drawn as a gridded street: lines follow transfers and token sends." },
    { id:"swap-intersection", label:"Swap intersection", shape:"intersection",
      colors:{ body:0x1a232e, trim:0xffc24b, top:0xffc24b, light:0xffc24b },
      sizeClass:"street", layer:"transactions",
      blurb:"A swap, drawn as an intersection where transfer streets cross." },
    { id:"market-maker-tower", label:"Market maker tower", shape:"tower-black-red",
      colors:{ body:0x0a0c10, trim:0xd92b20, top:0x0a0c10, light:0xff5148 },
      sizeClass:"tower", layer:"bundles",
      blurb:"A market maker (for example pump.fun and others): a black tower with red trim and a slow flashing red foundation block." },
    { id:"market-maker-roadway", label:"Market maker roadway", shape:"roadway",
      colors:{ body:0x1a232e, trim:0xff5148, top:0xff5148, light:0xff5148 },
      sizeClass:"street", layer:"bundles",
      blurb:"A tracked roadway from a market maker to the tokens it launched, with the wallets buying around those tokens." },
    { id:"theft-hex-dome", label:"Reported theft wallet", shape:"hexagon-dome",
      colors:{ body:0xd92b20, trim:0x7a1210, top:0xff5148, light:0xff5148 },
      sizeClass:"micro", layer:"rugs",
      blurb:"A reported theft wallet holding theft reported funds: a red hexagon with a round dome." },
    { id:"theft-fund-trace", label:"Theft fund trace", shape:"trace-line",
      colors:{ body:0xd92b20, trim:0xff5148, top:0xff5148, light:0xff5148 },
      sizeClass:"street", layer:"rugs",
      blurb:"A road map line for the tracked movements of reported theft funds." },
    { id:"whale-pyramid", label:"Whale wallet", shape:"pyramid-eye",
      colors:{ body:0xc9a227, trim:0xdfe9ff, top:0x05070a, light:0xffd23e },
      sizeClass:"macroscopic", layer:"wallets",
      blurb:"A whale wallet: a macroscopic gold metallic pyramid with silver trim, a black onyx top, and an eye in the top block section." },
    { id:"exchange-tower", label:"Exchange wallet tower", shape:"tower-square-redtop",
      colors:{ body:0xdfe9ff, trim:0xd92b20, top:0xff5148, light:0xff5148 },
      sizeClass:"miniscule", layer:"platforms",
      blurb:"An exchange wallet: a red and white square miniscule tower with a red lighted top." },
    { id:"basket-tower", label:"Exchange basket tower", shape:"tower-square-redtop",
      colors:{ body:0xdfe9ff, trim:0xd92b20, top:0xff5148, light:0xff5148 },
      sizeClass:"miniscule", layer:"platforms",
      blurb:"An exchange basket: a cluster of red and white square miniscule towers with red lighted tops." },
    { id:"dex-capital", label:"DEX (capital building)", shape:"capital-rectangle",
      colors:{ body:0xf4f7ff, trim:0x1fae5a, top:0x35d465, light:0x35d465 },
      sizeClass:"micro", layer:"platforms",
      blurb:"A DEX: a capital building styled micro building, a white and green rectangle structure." },
    { id:"dex-bad-flag", label:"DEX (bad, red flags)", shape:"capital-flagged",
      colors:{ body:0xf4f7ff, trim:0xd92b20, top:0xd92b20, light:0xff5148 },
      sizeClass:"micro", layer:"platforms",
      blurb:"A bad DEX: the same capital building, but with red flags. Other DEXes carry white flags." },
    { id:"offramp-hex", label:"Off ramp wallet", shape:"hexagon-squaretop",
      colors:{ body:0xe86a92, trim:0xd92b20, top:0x0a0c10, light:0xffffff },
      sizeClass:"micro", layer:"wallets",
      blurb:"An off ramp wallet: a pink and red hexagon with a square top in black with a white light." }
  ];

  function legendById(id){
    for(var i = 0; i < LEGEND.length; i++) if(LEGEND[i].id === id) return LEGEND[i];
    return null;
  }
  function hashStr(s){
    var h = 0, i, ch;
    s = String(s);
    for(i = 0; i < s.length; i++){ ch = s.charCodeAt(i); h = ((h << 5) - h + ch) | 0; }
    return Math.abs(h);
  }
  function hash01(a, b, seed){
    var n = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function log10p(v){ return Math.log(Math.max(0, v) + 1) / Math.LN10; }

  /* Token sizing, exactly as ordered: miniscule to tiny to macro large
     depending on wallet holders, volume, and history on chain.
     Monotonic in every input; no price, no invented holding. */
  function tokenTier(holders, volumeUsd, historyYears){
    var score = log10p(holders) * 0.5 + log10p(volumeUsd) * 0.3 + (Number(historyYears) || 0) * 0.2;
    if(score < 2) return "token-miniscule";
    if(score < 4) return "token-tiny";
    return "token-macro";
  }
  function sizeFor(typeId, metrics){
    var m = metrics || {};
    switch(typeId){
      case "wallet-octagon-dome": return { w:0.22, h:0.30, d:0.22 };
      case "deployer-unrugged": case "deployer-good": case "deployer-rugged":
      case "deployer-rug-funded-trace": return { w:0.26, h:0.32, d:0.26 };
      case "token-miniscule": return { w:0.12, h:0.18, d:0.12 };
      case "token-tiny": return { w:0.28, h:0.55, d:0.28 };
      case "token-macro": return { w:0.80, h:1.95, d:0.80 };
      case "transfer-street": case "market-maker-roadway": case "theft-fund-trace":
        return { w:2.20, h:0.06, d:0.30 };
      case "swap-intersection": return { w:0.60, h:0.08, d:0.60 };
      case "market-maker-tower": return { w:0.66, h:1.85, d:0.66 };
      case "theft-hex-dome": return { w:0.35, h:0.50, d:0.35 };
      case "whale-pyramid": return { w:1.75, h:1.35, d:1.75 };
      case "exchange-tower": case "basket-tower": return { w:0.18, h:0.45, d:0.18 };
      case "dex-capital": case "dex-bad-flag": return { w:0.55, h:0.42, d:0.38 };
      case "offramp-hex": return { w:0.30, h:0.38, d:0.30 };
      default: return { w:0.25, h:0.35, d:0.25 };
    }
  }

  /* Deterministic district layout: streets on a grid, structures
     placed beside streets, swaps at crossings. Same seed + same items
     = same cityscape, every time. Items are caller records; with no
     items, one MODEL example of every type is built and labelled so. */
  function buildCityscape(seed, items){
    var list = items && items.length ? items : LEGEND.map(function(t, i){
      return { type: t.id, label: t.label, source: "MODEL" };
    });
    if(!items || !items.length){
      /* cleanup pass 2026-11-04: a denser MODEL district — extra macro
         structures join the one-of-each set so the patch reads as a
         built-up city district, not a single row of samples */
      ["whale-pyramid", "market-maker-tower", "token-macro", "token-macro", "token-tiny", "token-tiny", "dex-capital"].forEach(function(tid){
        var t = legendById(tid); if(t) list.push({ type: t.id, label: t.label, source: "MODEL" });
      });
    }
    var out = [], i, it, leg, tierId;
    for(i = 0; i < list.length; i++){
      it = list[i] || {};
      tierId = it.type;
      if(it.type === "token" || !legendById(tierId)){
        tierId = tokenTier(it.holders || 0, it.volumeUsd || 0, it.historyYears || 0);
        if(it.type && legendById(it.type)) tierId = it.type;
      }
      leg = legendById(tierId);
      if(!leg) continue;
      var gx = (i % 6) - 2.5, gz = Math.floor(i / 6) - 1.5;
      var jx = (hash01(i, 11, seed) - 0.5) * 0.5, jz = (hash01(i, 23, seed) - 0.5) * 0.5;
      var size = sizeFor(tierId, it);
      out.push({
        id: "city-" + i, type: tierId, label: it.label || leg.label,
        shape: leg.shape, colors: leg.colors, sizeClass: leg.sizeClass,
        layer: leg.layer, blurb: leg.blurb, size: size,
        position: { x: gx * 1.6 + jx, z: gz * 1.6 + jz, street: (i % 6) },
        source: it.source || "MODEL", clickable: true,
        metrics: { holders: it.holders || null, volumeUsd: it.volumeUsd || null, historyYears: it.historyYears || null }
      });
    }
    return { seed: seed, source: "MODEL unless a caller record says live", structures: out };
  }

  /* Dying-system presentation: dim, fading toward the blackhole,
     crumbling scale jitter, dead chains labelled dead. Clicking a
     dying world opens its card (see demo / showDyingInfo in the page);
     it never claims a live feed from a dead chain. */
  function buildDyingSystem(chains){
    var out = [], i, c;
    for(i = 0; i < (chains || []).length; i++){
      c = chains[i] || {};
      var dim = clamp(0.85 - i * 0.05, 0.25, 0.85);
      out.push({
        id: c.id || ("dying-" + i), name: c.name || "Unknown", sym: c.sym || "",
        status: c.status || "dying chain", mainId: c.mainId || null,
        note: c.note || "", dim: dim, opacity: dim,
        crumble: 0.92 + hash01(i, 41, 7) * 0.12,
        fadeTowardBlackhole: true, clickable: true,
        clickAction: "card",
        liveFeed: false
      });
    }
    return out;
  }

  /* Slow flashing red foundation for market-maker towers. Pure math:
     updateFlash(t, flashers) sets emissiveIntensity on each flasher
     material; the period is slow (about 8 seconds), never strobing. */
  function updateFlash(t, flashers){
    (flashers || []).forEach(function(f){
      var v = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.8 + (f.phase || 0)));
      if(f.material) f.material.emissiveIntensity = v;
    });
  }

  /* Three.js builder. THREE is supplied by the caller (the page's
     vendored r170 build); in tests a stub with the same constructors works.
     Returns { group, clickables, flashers }. Every mesh gets
     userData.structure = its descriptor, so raycast clicks resolve. */
  function buildMeshes(THREE, city, opts){
    var group = new THREE.Group();
    var clickables = [], flashers = [], trails = [], pulsers = [];
    /* opts.windowTexture (a THREE CanvasTexture of a lit-window grid)
       is applied as the emissive map on tower-class structures, so
       their emissive colour reads as lit windows. Optional: callers
       without a texture (tests, stubs) get the original materials. */
    var winTex = (opts && opts.windowTexture) || null;
    function mat(hex, emissive, ei, tex, winTint){
      var p = { color: hex, emissive: emissive, emissiveIntensity: ei, roughness: 0.5, metalness: 0.55 };
      if(tex && winTex){ p.emissiveMap = winTex; if(winTint) p.emissive = winTint; }
      return new THREE.MeshStandardMaterial(p);
    }
    function put(mesh, st){
      mesh.userData.structure = st;
      group.add(mesh);
      clickables.push({ mesh: mesh, structure: st });
      return mesh;
    }
    (city.structures || []).forEach(function(st, idx){
      var s = st.size, x = st.position.x, z = st.position.z, col = st.colors;
      var base;
      if(st.shape === "octagon-dome"){
        base = new THREE.Mesh(new THREE.CylinderGeometry(s.w, s.w, s.h * 0.6, 8), mat(col.body, col.body, 0.2));
        base.position.set(x, s.h * 0.3, z);
        put(base, st);
        var dome = new THREE.Mesh(new THREE.SphereGeometry(s.w * 0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(col.top, col.top, 0.3));
        dome.position.set(x, s.h * 0.6, z);
        put(dome, st);
      } else if(st.shape === "dome-round" || st.shape === "dome-round-trace"){
        base = new THREE.Mesh(new THREE.CylinderGeometry(s.w, s.w * 1.1, s.h * 0.5, 16), mat(col.body, col.body, 0.3));
        base.position.set(x, s.h * 0.25, z);
        put(base, st);
        var d2 = new THREE.Mesh(new THREE.SphereGeometry(s.w, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(col.top, col.top, 0.4));
        d2.position.set(x, s.h * 0.5, z);
        put(d2, st);
        if(st.shape === "dome-round-trace"){
          var lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.05, z), new THREE.Vector3(x + 1.2, 0.05, z + 0.6)]);
          var ln = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: col.light, transparent: true, opacity: 0.8 }));
          put(ln, st);
        }
      } else if(st.shape === "pyramid-eye"){
        base = new THREE.Mesh(new THREE.ConeGeometry(s.w, s.h, 4), mat(col.body, col.body, 0.35));
        base.position.set(x, s.h / 2, z); base.rotation.y = Math.PI / 4;
        put(base, st);
        var top = new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.3, s.h * 0.22, s.w * 0.3), mat(col.top, col.top, 0.2));
        top.position.set(x, s.h * 0.95, z); top.rotation.y = Math.PI / 4;
        put(top, st);
        var eye = new THREE.Mesh(new THREE.SphereGeometry(s.w * 0.08, 8, 8), mat(0xffd23e, 0xffd23e, 0.9));
        eye.position.set(x, s.h * 0.95, z);
        eye.userData.eye = true;
        put(eye, st);
      } else if(st.shape === "hexagon-dome"){
        base = new THREE.Mesh(new THREE.CylinderGeometry(s.w, s.w, s.h * 0.6, 6), mat(col.body, col.body, 0.3));
        base.position.set(x, s.h * 0.3, z);
        put(base, st);
        var hd = new THREE.Mesh(new THREE.SphereGeometry(s.w * 0.85, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(col.top, col.top, 0.4));
        hd.position.set(x, s.h * 0.6, z);
        put(hd, st);
      } else if(st.shape === "hexagon-squaretop"){
        base = new THREE.Mesh(new THREE.CylinderGeometry(s.w, s.w, s.h * 0.7, 6), mat(col.body, col.body, 0.3));
        base.position.set(x, s.h * 0.35, z);
        put(base, st);
        var sq = new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.9, s.h * 0.3, s.w * 0.9), mat(col.top, col.top, 0.2));
        sq.position.set(x, s.h * 0.85, z);
        put(sq, st);
        var lamp = new THREE.Mesh(new THREE.SphereGeometry(s.w * 0.12, 8, 8), mat(0xffffff, 0xffffff, 1.0));
        lamp.position.set(x, s.h + 0.05, z);
        put(lamp, st);
      } else if(st.shape === "tower-black-red"){
        base = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.w), mat(col.body, col.body, 0.55, true, 0xffb27a));
        base.position.set(x, s.h / 2, z);
        put(base, st);
        var trim = new THREE.Mesh(new THREE.BoxGeometry(s.w * 1.08, s.h * 0.08, s.w * 1.08), mat(col.trim, col.trim, 0.5));
        trim.position.set(x, s.h * 0.85, z);
        put(trim, st);
        var foundMat = new THREE.MeshStandardMaterial({ color: 0x3d0a0a, emissive: 0xff5148, emissiveIntensity: 0.5, roughness: 0.5, metalness: 0.4 });
        var found = new THREE.Mesh(new THREE.BoxGeometry(s.w * 1.25, 0.12, s.w * 1.25), foundMat);
        found.position.set(x, 0.06, z);
        put(found, st);
        flashers.push({ material: foundMat, phase: idx * 0.7 });
      } else if(st.shape === "capital-rectangle" || st.shape === "capital-flagged"){
        base = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), mat(col.body, col.body, 0.55, true, 0xdfe9ff));
        base.position.set(x, s.h / 2, z);
        put(base, st);
        var roof = new THREE.Mesh(new THREE.BoxGeometry(s.w * 1.1, 0.08, s.d * 1.1), mat(col.trim, col.trim, 0.4));
        roof.position.set(x, s.h + 0.04, z);
        put(roof, st);
        if(st.shape === "capital-flagged"){
          var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), mat(0x8a8a8a, 0x8a8a8a, 0.2));
          pole.position.set(x + s.w * 0.3, s.h + 0.3, z);
          put(pole, st);
          var flag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.02), mat(0xd92b20, 0xd92b20, 0.5));
          flag.position.set(x + s.w * 0.3 + 0.15, s.h + 0.45, z);
          put(flag, st);
        } else {
          var wflag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.02), mat(0xffffff, 0xffffff, 0.3));
          wflag.position.set(x + s.w * 0.3 + 0.15, s.h + 0.45, z);
          put(wflag, st);
        }
      } else if(st.shape === "street" || st.shape === "roadway"){
        base = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), mat(col.body, col.body, 0.2));
        base.position.set(x, s.h / 2, z);
        put(base, st);
        /* new-look night pass: a lit strip runs the length of the
           street, and a bright pulse rides it in the direction of
           flow (the street's +x). The pulse is a child of the street
           mesh, so the page's surface transform carries it along.
           updateTrails() below advances the pulses. */
        var strip = new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.96, 0.02, s.d * 0.42),
          new THREE.MeshBasicMaterial({ color: col.light, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
        strip.position.set(0, s.h / 2 + 0.02, 0);
        base.add(strip);
        var pulse = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, s.d * 0.85),
          new THREE.MeshBasicMaterial({ color: col.light, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
        pulse.position.set(-(s.w - 0.34) / 2, s.h / 2 + 0.05, 0);
        base.add(pulse);
        trails.push({ node: pulse, len: s.w - 0.34, speed: 0.22 + (idx % 5) * 0.05, phase: (idx * 0.37) % 1 });
      } else if(st.shape === "intersection"){
        base = new THREE.Mesh(new THREE.CylinderGeometry(s.w / 2, s.w / 2, s.h, 16), mat(col.body, col.trim, 0.4));
        base.position.set(x, s.h / 2, z);
        put(base, st);
        /* new-look night pass: swaps glow — an additive disc on top
           of the crossing, breathing via updatePulse() below. */
        var glowMat = new THREE.MeshBasicMaterial({ color: col.light, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        var glow = new THREE.Mesh(new THREE.CylinderGeometry(s.w * 0.62, s.w * 0.62, 0.03, 16), glowMat);
        glow.position.set(0, s.h / 2 + 0.03, 0);
        base.add(glow);
        pulsers.push({ material: glowMat, speed: 1.6, phase: idx * 0.9 });
      } else if(st.shape === "trace-line"){
        var tg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.05, z), new THREE.Vector3(x + 1.4, 0.05, z - 0.5)]);
        var tl = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: col.light, transparent: true, opacity: 0.85 }));
        put(tl, st);
      } else {
        base = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), mat(col.body, col.body, 0.55, true, 0xffc98a));
        base.position.set(x, s.h / 2, z);
        put(base, st);
      }
    });
    return { group: group, clickables: clickables, flashers: flashers, trails: trails, pulsers: pulsers };
  }

  /* New-look night pass: advance the street light trails. Each trail
     is a bright pulse riding its street in the flow direction; the
     position is the street's local +x, so the page's baked surface
     transform aims it along the street on the world. */
  function updateTrails(t, trails){
    (trails || []).forEach(function(tr){
      if(!tr.node) return;
      var f = (t * (tr.speed || 0.25) + (tr.phase || 0)) % 1;
      tr.node.position.x = -tr.len / 2 + f * tr.len;
    });
  }
  /* New-look night pass: breathe the swap-intersection glow discs. */
  function updatePulse(t, pulsers){
    (pulsers || []).forEach(function(p){
      if(!p.material) return;
      p.material.opacity = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * (p.speed || 1.6) + (p.phase || 0)));
    });
  }

  var api = {
    LEGEND: LEGEND, legendById: legendById, tokenTier: tokenTier,
    sizeFor: sizeFor, buildCityscape: buildCityscape,
    buildDyingSystem: buildDyingSystem, updateFlash: updateFlash,
    buildMeshes: buildMeshes, updateTrails: updateTrails,
    updatePulse: updatePulse
  };
  if(typeof module !== "undefined" && module.exports) module.exports = api;
  if(typeof window !== "undefined") window.HalexMChaintariumCityscapes = api;
})();
