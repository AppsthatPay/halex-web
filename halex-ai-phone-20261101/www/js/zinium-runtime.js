/* ZINIUM RUNTIME — the 2026-11-03 upgrade, RUNNING in this app.
   JavaScript port of the staging package halex-upgrade-20261103
   (zinium_neural_backbone.py / zinium_spine.py / zinium_mesh.py),
   rebuilt to execute inside this WebView instead of being carried as
   a provenance record:

   1. ZiniumBackbone — a real transformer forward pass in JS: token
      embeddings + sinusoidal positional encoding, multi-head scaled
      dot-product attention with a causal mask, pre-LN blocks, GELU
      feed-forward, LM head, and a greedy generate() loop.
      HONEST LABEL: its weights are a deterministic SEEDED REFERENCE
      model (fixed seed, generated in code). It is NOT trained, NOT a
      learned language model, and its generated continuation is
      characters from an untrained head — shown in the UI labelled as
      exactly that. It aids the reply's processing trace; the chat
      ANSWER still comes from the chain records (ZiniumCore). Per
      doctrine, conversation tokens aid decisions/replies only — this
      runtime never decides, executes, signs, spends, or trades.
   2. ZiniumSpine — instantiates the chain processor records LOCALLY
      in the app (chains 500, 690, 865, 656, 657, with readable
      metadata), routes each chat process through one chain, runs a
      real deterministic stateful computation over the process tokens
      on that chain, appends the routing to an on-phone spine ledger,
      and RETURNS errors — routing failures are recorded in
      spine.errors and surfaced, never swallowed. (The staging spine
      wrote records only and instantiated nothing; this one does.)
   3. ZiniumMesh — the packet layer with a real SHA-256 CHECKSUM
      (pure-JS implementation below; a checksum detects corruption,
      it does not authenticate or sign anyone). Packets encode, verify,
      and decode inside the app. Transfer is user-initiated only
      (share sheet / manual paths — see ChainShare). sniff() and
      clone_traffic() REFUSE outright. No silent installs, ever.
   GPU: none in this app — dispatch is CPU (this JS) only, and
   gpuAvailable stays false. No network, no keys, no signing.
   Loads in Node (guarded storage access) for the test harness. */
(function (root) {
  "use strict";

  /* ================= utilities: RNG, UTF-8, SHA-256, base64 ================= */

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNormal(seed) {
    var rand = mulberry32(seed), spare = null;
    return function () {
      if (spare !== null) { var v = spare; spare = null; return v; }
      var u = 0, v = 0, s = 0;
      do { u = rand() * 2 - 1; v = rand() * 2 - 1; s = u * u + v * v; } while (s >= 1 || s === 0);
      var m = Math.sqrt(-2.0 * Math.log(s) / s);
      spare = v * m;
      return u * m;
    };
  }
  function utf8Bytes(str) {
    var out = [];
    var s = String(str);
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
        var c2 = s.charCodeAt(i + 1);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          var cp = 0x10000 + ((c - 0xD800) * 0x400) + (c2 - 0xDC00);
          out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F),
                   0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
          i++;
        } else out.push(0xEF, 0xBF, 0xBD);
      } else if (c >= 0xDC00 && c <= 0xDFFF) out.push(0xEF, 0xBF, 0xBD);
      else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
    return out;
  }
  function utf8FromBytes(bytes) {
    var out = "", i = 0;
    while (i < bytes.length) {
      var b = bytes[i];
      if (b < 0x80) { out += String.fromCharCode(b); i += 1; }
      else if (b < 0xE0) { out += String.fromCharCode(((b & 0x1F) << 6) | (bytes[i + 1] & 0x3F)); i += 2; }
      else if (b < 0xF0) { out += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F)); i += 3; }
      else {
        var cp = (((b & 0x07) << 18) | ((bytes[i + 1] & 0x3F) << 12) |
                  ((bytes[i + 2] & 0x3F) << 6) | (bytes[i + 3] & 0x3F)) - 0x10000;
        out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF));
        i += 4;
      }
    }
    return out;
  }
  /* Pure-JS SHA-256 (FIPS 180-4) over the UTF-8 bytes of a string.
     Returns lowercase hex. Verified against Node's crypto in the
     harness (tests/test-zinium-runtime.js). */
  var SHA_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256Hex(str) {
    var bytes = utf8Bytes(str);
    var bitLenHi = Math.floor(bytes.length / 0x20000000);
    var bitLenLo = (bytes.length << 3) >>> 0;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    bytes.push((bitLenHi >>> 24) & 0xFF, (bitLenHi >>> 16) & 0xFF, (bitLenHi >>> 8) & 0xFF, bitLenHi & 0xFF,
               (bitLenLo >>> 24) & 0xFF, (bitLenLo >>> 16) & 0xFF, (bitLenLo >>> 8) & 0xFF, bitLenLo & 0xFF);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    function rr(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (var off = 0; off < bytes.length; off += 64) {
      var i, t;
      for (i = 0; i < 16; i++) {
        w[i] = ((bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) |
                (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3]) | 0;
      }
      for (i = 16; i < 64; i++) {
        var s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + SHA_K[t] + w[t]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) {
      var s = (x >>> 0).toString(16);
      while (s.length < 8) s = "0" + s;
      return s;
    }).join("");
  }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function b64encode(str) {
    var bytes = utf8Bytes(str), out = "", i;
    for (i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0,
          b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out += B64[(b0 >> 2) & 63] + B64[((b0 & 3) << 4) | (b1 >> 4)];
      out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : "=";
      out += i + 2 < bytes.length ? B64[b2 & 63] : "=";
    }
    return out;
  }
  function b64decode(b64) {
    var clean = String(b64).replace(/[^A-Za-z0-9+/=]/g, ""), bytes = [], i;
    for (i = 0; i < clean.length; i += 4) {
      var c0 = B64.indexOf(clean[i]), c1 = B64.indexOf(clean[i + 1]),
          c2 = clean[i + 2] === "=" ? 0 : B64.indexOf(clean[i + 2]),
          c3 = clean[i + 3] === "=" ? 0 : B64.indexOf(clean[i + 3]);
      bytes.push(((c0 << 2) | (c1 >> 4)) & 0xFF);
      if (clean[i + 2] !== "=") bytes.push((((c1 & 15) << 4) | (c2 >> 2)) & 0xFF);
      if (clean[i + 3] !== "=") bytes.push((((c2 & 3) << 6) | c3) & 0xFF);
    }
    return utf8FromBytes(bytes);
  }

  /* ================= 1. Neural backbone (seeded reference) ================= */

  var VOCAB_BASE = 32, VOCAB_SIZE = 95; /* printable ASCII 32..126 */
  function tokenize(text) {
    var s = String(text || ""), out = [];
    for (var i = 0; i < s.length; i++) {
      var code = s.charCodeAt(i);
      if (code < VOCAB_BASE || code > 126) code = 32;
      out.push(code - VOCAB_BASE);
    }
    return out;
  }
  function detokenize(tokens) {
    return tokens.map(function (t) {
      return String.fromCharCode(VOCAB_BASE + Math.max(0, Math.min(VOCAB_SIZE - 1, t)));
    }).join("");
  }
  function sinusoidalPE(seqLen, dModel) {
    var pe = [], pos, i;
    for (pos = 0; pos < seqLen; pos++) {
      var row = [];
      for (i = 0; i < dModel; i++) {
        var div = Math.exp(-Math.log(10000.0) * Math.floor(i / 2) * 2 / dModel);
        row.push(i % 2 === 0 ? Math.sin(pos * div) : Math.cos(pos * div));
      }
      pe.push(row);
    }
    return pe;
  }
  function linear(rows, w, bias) { /* rows: (seq,in) w: (in,out) -> (seq,out) */
    var out = [];
    for (var r = 0; r < rows.length; r++) {
      var row = new Array(w[0].length).fill(0);
      for (var i = 0; i < w.length; i++) {
        var xi = rows[r][i];
        if (xi === 0) continue;
        var wr = w[i];
        for (var j = 0; j < wr.length; j++) row[j] += xi * wr[j];
      }
      if (bias) for (var k = 0; k < row.length; k++) row[k] += bias[k];
      out.push(row);
    }
    return out;
  }
  function layerNorm(rows, gamma, beta) {
    return rows.map(function (row) {
      var mean = 0, i;
      for (i = 0; i < row.length; i++) mean += row[i];
      mean /= row.length;
      var varr = 0;
      for (i = 0; i < row.length; i++) varr += (row[i] - mean) * (row[i] - mean);
      varr /= row.length;
      var inv = 1.0 / Math.sqrt(varr + 1e-5);
      return row.map(function (x, j) { return (x - mean) * inv * gamma[j] + beta[j]; });
    });
  }
  function gelu(x) {
    return 0.5 * x * (1.0 + Math.tanh(Math.sqrt(2.0 / Math.PI) * (x + 0.044715 * x * x * x)));
  }
  function softmax(row) {
    var max = -Infinity, i;
    for (i = 0; i < row.length; i++) if (row[i] > max) max = row[i];
    var sum = 0, out = row.map(function (x) { var e = Math.exp(x - max); sum += e; return e; });
    return out.map(function (e) { return e / sum; });
  }
  function randMatrix(normal, rows, cols, scale) {
    var m = [];
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) row.push(normal() * scale);
      m.push(row);
    }
    return m;
  }

  function createBackbone(opts) {
    var o = opts || {};
    var dModel = o.dModel || 32, nHeads = o.nHeads || 4,
        nLayers = o.nLayers || 2, dFf = o.dFf || 128,
        maxLen = o.maxLen || 256, seed = (o.seed !== undefined ? o.seed : 20261103);
    if (dModel % nHeads !== 0) throw new Error("d_model must divide evenly by n_heads");
    var dHead = dModel / nHeads;
    var scale = 1.0 / Math.sqrt(dModel);
    var normal = makeNormal(seed);
    var embedding = randMatrix(normal, VOCAB_SIZE, dModel, scale);
    var blocks = [];
    for (var li = 0; li < nLayers; li++) {
      blocks.push({
        wQ: randMatrix(normal, dModel, dModel, scale),
        wK: randMatrix(normal, dModel, dModel, scale),
        wV: randMatrix(normal, dModel, dModel, scale),
        wO: randMatrix(normal, dModel, dModel, scale),
        w1: randMatrix(normal, dModel, dFf, scale),
        b1: new Array(dFf).fill(0),
        w2: randMatrix(normal, dFf, dModel, scale),
        b2: new Array(dModel).fill(0),
        ln1g: new Array(dModel).fill(1), ln1b: new Array(dModel).fill(0),
        ln2g: new Array(dModel).fill(1), ln2b: new Array(dModel).fill(0)
      });
    }
    var lnG = new Array(dModel).fill(1), lnB = new Array(dModel).fill(0);
    var wHead = randMatrix(normal, dModel, VOCAB_SIZE, scale);
    var bHead = new Array(VOCAB_SIZE).fill(0);

    function attention(x, blk) {
      var seq = x.length;
      var Q = linear(x, blk.wQ), K = linear(x, blk.wK), V = linear(x, blk.wV);
      var out = [];
      for (var i = 0; i < seq; i++) out.push(new Array(dModel).fill(0));
      for (var h = 0; h < nHeads; h++) {
        var off = h * dHead;
        for (var i2 = 0; i2 < seq; i2++) {
          var scores = [], j;
          for (j = 0; j < seq; j++) {
            if (j > i2) { scores.push(-1e9); continue; } /* causal mask */
            var s = 0;
            for (var d = 0; d < dHead; d++) s += Q[i2][off + d] * K[j][off + d];
            scores.push(s / Math.sqrt(dHead));
          }
          var attn = softmax(scores);
          for (j = 0; j <= i2; j++) {
            var a = attn[j];
            if (a === 0) continue;
            for (var d2 = 0; d2 < dHead; d2++) out[i2][off + d2] += a * V[j][off + d2];
          }
        }
      }
      return linear(out, blk.wO);
    }
    function hidden(tokens) {
      if (!tokens.length) throw new Error("backbone needs at least one token");
      if (tokens.length > maxLen) throw new Error("sequence longer than max_len " + maxLen);
      var pe = sinusoidalPE(tokens.length, dModel);
      var h = tokens.map(function (t, i) {
        if (t < 0 || t >= VOCAB_SIZE) throw new Error("token out of vocab: " + t);
        return embedding[t].map(function (v, j) { return v + pe[i][j]; });
      });
      for (var li = 0; li < blocks.length; li++) {
        var blk = blocks[li];
        var a = attention(layerNorm(h, blk.ln1g, blk.ln1b), blk);
        h = h.map(function (row, i) { return row.map(function (v, j) { return v + a[i][j]; }); });
        var f = linear(layerNorm(h, blk.ln2g, blk.ln2b), blk.w1, blk.b1)
          .map(function (row) { return row.map(gelu); });
        f = linear(f, blk.w2, blk.b2);
        h = h.map(function (row, i) { return row.map(function (v, j) { return v + f[i][j]; }); });
      }
      return layerNorm(h, lnG, lnB);
    }
    function forward(tokens) {
      return linear(hidden(tokens), wHead, bHead);
    }
    function generate(seedTokens, maxNew) {
      var tokens = seedTokens.slice();
      var n = (maxNew === undefined ? 16 : maxNew);
      for (var i = 0; i < n; i++) {
        var logits = forward(tokens);
        var last = logits[logits.length - 1];
        var best = 0;
        for (var j = 1; j < last.length; j++) if (last[j] > last[best]) best = j;
        tokens.push(best);
      }
      return tokens;
    }
    return {
      info: { kind: "seeded-reference", trained: false, seed: seed,
              vocabSize: VOCAB_SIZE, dModel: dModel, nHeads: nHeads,
              nLayers: nLayers, dFf: dFf, maxLen: maxLen,
              note: "Deterministic seeded reference weights — NOT a trained or learned model." },
      tokenize: tokenize, detokenize: detokenize,
      sinusoidalPE: sinusoidalPE, hidden: hidden, forward: forward,
      generate: generate
    };
  }

  /* ================= 2. Spine: in-app chain processor records ================= */

  var CHAIN_META = [
    { id: 500, name: "Chain 500 — Brainchain center",
      role: "Canonical center chain of the 1000^5 cube, center coordinate (500, 500, 500, 500, 500). Routes general processing." },
    { id: 690, name: "Chain 690 — Q&A and math",
      role: "Question-answering and calculator-verified math processor records (231 Q&A entries, 1000 verified equations in the staging records)." },
    { id: 865, name: "Chain 865 — owner-design obscured software",
      role: "Jeffrey's design records for obscured software-socket processor records. Design coordinates only — no key values exist here." },
    { id: 656, name: "Chain 656 — processor chain",
      role: "Instantiated processor chain from the staging records. General processing lane." },
    { id: 657, name: "Chain 657 — processor chain",
      role: "Instantiated processor chain from the staging records. General processing lane." }
  ];
  var LANE_CHAIN = { "chain-690": 690, "chain-865": 865,
                     "cube-genesis": 500, "chain-doctrine": 500, "general": 500 };
  var FALLBACK_CHAINS = [500, 656, 657];
  function chainForLane(lane) {
    if (lane && LANE_CHAIN.hasOwnProperty(lane)) return LANE_CHAIN[lane];
    var s = String(lane || "general"), hsum = 0;
    for (var i = 0; i < s.length; i++) hsum = (hsum * 31 + s.charCodeAt(i)) >>> 0;
    return FALLBACK_CHAINS[hsum % FALLBACK_CHAINS.length];
  }

  var LS_SPINE = "zinium-phone-spine-ledger";
  var memLedger = [];
  function loadLedger() {
    try {
      if (typeof localStorage !== "undefined") {
        var v = JSON.parse(localStorage.getItem(LS_SPINE) || "[]");
        return Array.isArray(v) ? v : [];
      }
    } catch (e) { /* fall through to memory copy */ }
    return memLedger.slice();
  }
  function saveLedger(list) {
    memLedger = list.slice();
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LS_SPINE, JSON.stringify(list));
        return true;
      }
    } catch (e) { return false; }
    return true;
  }

  function createSpine() {
    var chains = {}, errors = [];
    CHAIN_META.forEach(function (meta) {
      var normal = makeNormal(meta.id * 7919 + 17);
      chains[meta.id] = {
        meta: meta,
        projection: randMatrix(normal, 16, 16, 1.0 / 4),
        state: new Array(16).fill(0),
        processed: 0, lastDigest: null, lastAt: null
      };
    });
    function instantiate() {
      return CHAIN_META.map(function (m) {
        return { id: m.id, name: m.name, role: m.role,
                 kind: "agentified populated processor record",
                 status: "INSTANTIATED (in-app)", processed: chains[m.id].processed };
      });
    }
    function route(process) {
      var p = process || {};
      try {
        var chainId = p.chainId;
        if (chainId === undefined || chainId === null) chainId = chainForLane(p.lane);
        var chain = chains[chainId];
        if (!chain) throw new Error("unknown chain " + chainId + " — not instantiated in this app");
        var tokens = p.tokens || tokenize(p.text || "");
        if (!tokens.length) throw new Error("empty process — nothing to route");
        /* Real deterministic, stateful compute over the tokens:
           a 16-wide feature mix projected through the chain's own
           seeded projection, carried in the chain's state. Same input
           on a fresh chain reproduces exactly; chain history is part
           of the state, so the digest names input + chain + history. */
        var feat = new Array(16).fill(0);
        tokens.forEach(function (t, i) { feat[(t + i) % 16] += 1; });
        var mixed = chain.projection.map(function (row) {
          var s = 0;
          for (var j = 0; j < 16; j++) s += row[j] * (chain.state[j] + feat[j] / Math.max(1, tokens.length));
          return Math.tanh(s);
        });
        chain.state = mixed;
        chain.processed += 1;
        var digest = sha256Hex(chainId + "|" + tokens.join(",") + "|" +
          mixed.map(function (v) { return v.toFixed(8); }).join(","));
        chain.lastDigest = digest;
        chain.lastAt = new Date().toISOString();
        var entry = { kind: "spine-route", chain: chainId, lane: p.lane || "general",
                      tokens: tokens.length, digest: digest, at: chain.lastAt };
        var ledger = loadLedger();
        ledger.push(entry);
        if (ledger.length > 50) ledger = ledger.slice(ledger.length - 50);
        saveLedger(ledger);
        return { ok: true, chain: chainId, chainName: chain.meta.name,
                 tokens: tokens.length, digest: digest,
                 processed: chain.processed, entry: entry };
      } catch (err) {
        var record = { error: String(err && err.message ? err.message : err),
                       process: { chainId: p.chainId, lane: p.lane }, at: new Date().toISOString() };
        errors.push(record); /* recorded and returned — never swallowed */
        return { ok: false, error: record.error, recorded: true };
      }
    }
    return { instantiate: instantiate, route: route, chainForLane: chainForLane,
             errors: errors,
             ledger: function () { return loadLedger(); },
             status: function () {
               return CHAIN_META.map(function (m) {
                 var c = chains[m.id];
                 return { id: m.id, name: m.name, role: m.role, processed: c.processed,
                          lastDigest: c.lastDigest, lastAt: c.lastAt };
               });
             } };
  }

  /* ================= 3. Mesh: checksum packet layer ================= */

  function meshChecksum(src, chain, kind, data) {
    return sha256Hex(String(src) + String(chain) + String(kind) + String(data));
  }
  function createPacket(src, chain, kind, data, timestamp) {
    return { src: String(src), chain: String(chain), kind: String(kind),
             data: String(data),
             timestamp: (timestamp === undefined ? Math.floor(Date.now() / 1000) : timestamp) };
  }
  function encodePacket(p) {
    var header = [p.src, p.chain, p.kind, utf8Bytes(p.data).length,
                  meshChecksum(p.src, p.chain, p.kind, p.data), p.timestamp].join("|");
    return header + "\n" + b64encode(p.data);
  }
  function decodePacket(wire) {
    var nl = String(wire).indexOf("\n");
    if (nl < 0) throw new Error("malformed packet: no header/payload split");
    var parts = String(wire).slice(0, nl).split("|");
    if (parts.length !== 6) throw new Error("malformed packet header");
    var src = parts[0], chain = parts[1], kind = parts[2],
        length = parseInt(parts[3], 10), checksum = parts[4], timestamp = parseInt(parts[5], 10);
    var data = b64decode(String(wire).slice(nl + 1));
    if (utf8Bytes(data).length !== length) throw new Error("packet length mismatch");
    if (meshChecksum(src, chain, kind, data) !== checksum)
      throw new Error("packet checksum mismatch (tampered or corrupt)");
    return { src: src, chain: chain, kind: kind, data: data, timestamp: timestamp,
             checksum: checksum, verified: true };
  }
  var Mesh = {
    checksum: meshChecksum, createPacket: createPacket,
    encodePacket: encodePacket, decodePacket: decodePacket,
    loopback: function (packet) { return decodePacket(encodePacket(packet)); },
    sniff: function () { throw new Error("refused: sniffing other devices' traffic is not permitted"); },
    clone_traffic: function () { throw new Error("refused: cloning other devices' traffic is not permitted"); },
    deployViaBluetoothSeed: function (packet) {
      return { status: "unavailable",
               reason: "No Bluetooth transfer runs from this runtime. Sharing leaves this phone only through your own share sheet or a manual bundle you approve (see the Share tab). Nothing was sent.",
               packet_chain: packet ? packet.chain : null };
    }
  };

  /* ================= chat path: backbone + spine + mesh per message ================= */

  var backbone = createBackbone();
  var spine = createSpine();
  spine.instantiate();

  function processChat(question, answerResult, opts) {
    var o = opts || {};
    var maxNew = (o.maxNew === undefined ? 24 : o.maxNew);
    var tokensIn = tokenize(question || "");
    if (!tokensIn.length) tokensIn = tokenize(" ");
    var started = Date.now();
    var prompt = tokensIn.slice(0, backbone.info.maxLen - maxNew);
    var generated = backbone.generate(prompt, maxNew);
    var continuationTokens = generated.slice(prompt.length);
    var continuation = detokenize(continuationTokens);
    var lane = "general";
    if (answerResult && answerResult.trace && answerResult.trace.length) {
      lane = answerResult.trace[0].lane || "general";
    }
    var route = spine.route({ lane: lane, tokens: tokensIn, text: question });
    var packet = Mesh.createPacket("halex-ai-phone", route.ok ? route.chain : 500,
      "chat-process", JSON.stringify({ q: String(question || ""), tokens: tokensIn.length }));
    var meshResult;
    try {
      var back = Mesh.loopback(packet);
      meshResult = { verified: back.verified === true,
                     checksum: meshChecksum(packet.src, packet.chain, packet.kind, packet.data) };
    } catch (err) {
      meshResult = { verified: false, error: String(err && err.message ? err.message : err) };
    }
    return {
      ok: route.ok && meshResult.verified,
      model: backbone.info,
      tokensIn: tokensIn.length,
      generatedTokens: continuationTokens,
      continuation: continuation,
      lane: lane,
      spine: route,
      mesh: meshResult,
      ms: Date.now() - started,
      boundary: "The backbone and spine aid this reply's processing trace only. " +
        "The answer text comes from the chain records. This runtime never decides, " +
        "executes, signs, spends, or trades."
    };
  }

  function status() {
    return { model: backbone.info, chains: spine.status(),
             spineErrors: spine.errors.length,
             gpuAvailable: false,
             note: "Backbone: seeded reference (untrained). Spine: in-app records. Mesh: checksum only, not a signature." };
  }

  var api = { Backbone: backbone, createBackbone: createBackbone,
              Spine: spine, createSpine: createSpine, Mesh: Mesh,
              sha256Hex: sha256Hex, tokenize: tokenize, detokenize: detokenize,
              sinusoidalPE: sinusoidalPE, chainForLane: chainForLane,
              CHAIN_META: CHAIN_META, processChat: processChat, status: status };
  root.ZiniumRuntime = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
