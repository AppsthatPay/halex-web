/* HALEX-M ZINIUM¹ — the internal system chain for HALEX-M (STAGING 2026-11-04).
 *
 * What ZINIUM¹ is (Jeffrey, 2026-11-04 ~16:31 EST): storage and system
 * software for HALEX-M on its own internal chain, built per user, per
 * HALEX-M deployment and install. The Braintree runs inside it; it
 * facilitates anything the Chaintarium needs; its small agentified
 * processors carry the workings of ZINIUM⁵ minus the heavier payload
 * additions and flash state capabilities. It exists so HALEX-M's
 * trading system processes locally, on its own chain, at a faster pace.
 *
 * What ZINIUM¹ is NOT: not a cryptocurrency chain, not a wallet, holds
 * no keys that sign anything, never trades. HALEX CHAIN / HALEX
 * Intelligence Chain is the separate cryptocurrency chain; ZINIUM⁵ is
 * the separate HALEX-AI infrastructure chain. ZINIUM¹ is system
 * software only.
 *
 * Lineage: a JavaScript port of the Gemini Python submission of
 * 2026-11-04 (intake: halex-m-zinium1-20261104/intake/), adapted:
 * - Mitosis follows Jeffrey's CORRECTED doctrine only (see requestMitosis).
 *   Gemini's block-count/capacity trigger (100/150) is NOT ported.
 *   There is no record cap.
 * - Packet integrity uses a per-install key generated at genesis.
 *   That key is a PACKET INTEGRITY KEY: it tags packets so tampering
 *   is detectable locally. It is NOT a wallet key, NOT a signing key,
 *   and it is generated on the install — there is no hardcoded secret
 *   anywhere in this file (Gemini's hardcoded default was dropped).
 * - Tenant isolation is a permission table + integrity tags only.
 *   Gemini's per-tenant private keys are NOT ported.
 * - NOT built, deliberately: consensus nodes, a WebSocket server,
 *   "ZK proofs" (a SHA-256 hash of data here is a COMMITMENT, labeled
 *   as such, never a proof), hardware register buses.
 * - Braintree evaluation traces in this module are deterministic
 *   records of what was routed/decided. They are not a learned model
 *   and are never described as one.
 *
 * Persistence: the chain for an install lives in localStorage under
 * halexm-zinium1-<installId>. The install id itself is generated once
 * and kept under halexm-zinium1-install-id so the same install finds
 * its own chain again. In node (the harness) an in-memory storage
 * with the same getItem/setItem shape is used instead.
 *
 * Pure logic + storage. No DOM, no network, no trading, no signing.
 * Works in the browser as window.HalexMZinium1 and in node via
 * module.exports, in the same style as halex-m-braintree.js.
 */
(function (root) {
  'use strict';

  /* ================= storage ================= */

  function memoryStorage() {
    var m = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; }
    };
  }
  function defaultStorage() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        var t = '__z1_probe__';
        localStorage.setItem(t, '1'); localStorage.removeItem(t);
        return localStorage;
      }
    } catch (e) { /* storage unavailable (private mode etc.) — fall back */ }
    return memoryStorage();
  }

  var INSTALL_ID_KEY = 'halexm-zinium1-install-id';
  function storageKeyFor(installId) { return 'halexm-zinium1-' + installId; }

  function randomHex(bytes) {
    var arr = new Uint8Array(bytes);
    try {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) { crypto.getRandomValues(arr); return hexOfBytes(arr); }
    } catch (e) { /* fall through */ }
    try {
      var nc = require('crypto'); // node only; browsers never reach here with crypto present
      return nc.randomBytes(bytes).toString('hex');
    } catch (e) { /* last resort below */ }
    var out = '';
    for (var i = 0; i < bytes * 2; i++) out += Math.floor(Math.random() * 16).toString(16);
    return out;
  }

  /* ================= canonical form ================= */

  // Stable stringify: object keys sorted at every depth, so hashes do
  // not depend on property insertion order.
  function canonical(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
    var keys = Object.keys(v).sort();
    return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + canonical(v[k]); }).join(',') + '}';
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ================= SHA-256 (sync, self-contained) =================
   * crypto.subtle is async-only; the chain API here is synchronous
   * (same style as the Braintree registry), so SHA-256 and HMAC-SHA256
   * are implemented in plain JS. Correctness is asserted in the harness
   * against node crypto on multiple inputs. */

  var K256 = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function utf8Bytes(str) {
    var out = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var cp = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(++i) - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    }
    return out;
  }
  function hexOfBytes(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += ('0' + (bytes[i] & 0xff).toString(16)).slice(-2);
    return s;
  }
  function bytesOfHex(hex) {
    var out = [];
    for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
    return out;
  }

  function sha256Bytes(input) {
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var bytes = input.slice();
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    // 64-bit length; message sizes here are far below 2^32 bits
    bytes.push(0, 0, 0, 0, (bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);
    var w = new Array(64);
    for (var chunk = 0; chunk < bytes.length; chunk += 64) {
      var i, t;
      for (i = 0; i < 16; i++) {
        w[i] = ((bytes[chunk + i * 4] << 24) | (bytes[chunk + i * 4 + 1] << 16) | (bytes[chunk + i * 4 + 2] << 8) | bytes[chunk + i * 4 + 3]) | 0;
      }
      for (t = 16; t < 64; t++) {
        var s0 = (rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3)) | 0;
        var s1 = (rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10)) | 0;
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) | 0;
        var ch = ((e & f) ^ (~e & g)) | 0;
        var temp1 = (h + S1 + ch + K256[t] + w[t]) | 0;
        var S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) | 0;
        var maj = ((a & b) ^ (a & c) ^ (b & c)) | 0;
        var temp2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = [];
    H.forEach(function (word) {
      out.push((word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff);
    });
    return out;
  }
  function sha256Hex(str) { return hexOfBytes(sha256Bytes(utf8Bytes(String(str)))); }

  // HMAC-SHA256 over UTF-8 strings, hex out. Used ONLY as a packet
  // integrity tag keyed by the per-install packet integrity key.
  function hmacSha256Hex(keyStr, msgStr) {
    var key = utf8Bytes(String(keyStr));
    if (key.length > 64) key = sha256Bytes(key);
    while (key.length < 64) key.push(0);
    var ipad = key.map(function (b) { return b ^ 0x36; });
    var opad = key.map(function (b) { return b ^ 0x5c; });
    var inner = sha256Bytes(ipad.concat(utf8Bytes(String(msgStr))));
    return hexOfBytes(sha256Bytes(opad.concat(inner)));
  }
  function tagsEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* ================= BraindataChain ================= */

  var ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  function blockHash(block) {
    return sha256Hex(canonical({
      index: block.index, timestamp: block.timestamp, type: block.type,
      data: block.data, previousHash: block.previousHash
    }));
  }

  function BraindataChain(chainId) {
    this.chainId = chainId;
    this.blocks = [];
    var genesis = {
      index: 0, timestamp: Date.now(), type: 'GENESIS_INIT',
      data: { event: 'GENESIS_INIT', chain: chainId, system: 'ZINIUM1', for: 'HALEX-M' },
      previousHash: ZERO_HASH
    };
    genesis.hash = blockHash(genesis);
    this.blocks.push(genesis);
  }
  BraindataChain.prototype.tip = function () { return this.blocks[this.blocks.length - 1]; };
  BraindataChain.prototype.height = function () { return this.blocks.length; };
  BraindataChain.prototype.append = function (type, data) {
    var block = {
      index: this.blocks.length, timestamp: Date.now(), type: type,
      data: data, previousHash: this.tip().hash
    };
    block.hash = blockHash(block);
    this.blocks.push(block);
    return clone(block);
  };
  // Tamper evidence: recompute every hash and every link.
  BraindataChain.prototype.verify = function () {
    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      if (b.index !== i) return { ok: false, height: this.blocks.length, badIndex: i, reason: 'index mismatch at block ' + i };
      var expectedPrev = i === 0 ? ZERO_HASH : this.blocks[i - 1].hash;
      if (b.previousHash !== expectedPrev) return { ok: false, height: this.blocks.length, badIndex: i, reason: 'previous-hash link broken at block ' + i };
      if (blockHash(b) !== b.hash) return { ok: false, height: this.blocks.length, badIndex: i, reason: 'hash mismatch at block ' + i + ' (stored data was altered)' };
    }
    return { ok: true, height: this.blocks.length };
  };
  BraindataChain.prototype.serialize = function () {
    return { chainId: this.chainId, blocks: clone(this.blocks) };
  };
  BraindataChain.fromSerialized = function (obj) {
    var chain = Object.create(BraindataChain.prototype);
    chain.chainId = obj.chainId;
    chain.blocks = clone(obj.blocks || []);
    return chain;
  };

  /* ================= BraintreeCell ================= */

  function BraintreeCell(chain, persist) {
    this.chain = chain;
    this._persist = persist || function () {};
  }
  // A deterministic evaluation trace, committed as a block. Honest
  // label: this records that a directive was evaluated and routed;
  // it is not learned-model reasoning.
  BraintreeCell.prototype.evaluate = function (directiveType, parameters) {
    var trace = {
      evaluator: 'ZINIUM1-BRAINTREE',
      directive: directiveType,
      parameters: parameters || {},
      status: 'evaluated',
      timestamp: Date.now(),
      contextCommitment: sha256Hex(canonical(parameters || {})).slice(0, 12)
    };
    this.chain.append('BRAINTREE_EVAL', { evaluation_trace: trace });
    this._persist();
    return clone(trace);
  };

  /* ================= KnowledgeModulator ================= */

  var PLANES = ['User', 'App', 'AI', 'Device', 'Comms'];

  function KnowledgeModulator(braintree, packetIntegrityKey, persist) {
    this.braintree = braintree;
    // PACKET INTEGRITY KEY — per-install, generated at genesis, stored
    // locally with the chain. Tags packets for local tamper evidence.
    // NOT a wallet key. NOT a signing key. Never leaves the install.
    this._packetIntegrityKey = packetIntegrityKey;
    this._persist = persist || function () {};
  }
  KnowledgeModulator.prototype.tagFor = function (packet) {
    var clean = { source: packet.source, target: packet.target, payload: packet.payload, timestamp: packet.timestamp };
    return hmacSha256Hex(this._packetIntegrityKey, canonical(clean));
  };
  KnowledgeModulator.prototype.route = function (sourcePlane, targetPlane, payload) {
    if (PLANES.indexOf(sourcePlane) === -1) return { ok: false, reason: 'unknown source plane: ' + sourcePlane };
    if (PLANES.indexOf(targetPlane) === -1) return { ok: false, reason: 'unknown target plane: ' + targetPlane };
    var packet = { source: sourcePlane, target: targetPlane, payload: payload, timestamp: Date.now() };
    packet.integrityTag = this.tagFor(packet);
    var trace = this.braintree.evaluate('MODULATE_KNOWLEDGE', { source: sourcePlane, target: targetPlane, size: canonical(payload).length });
    packet.routingTrace = trace;
    return { ok: true, packet: packet };
  };
  KnowledgeModulator.prototype.verifyPacket = function (packet) {
    if (!packet || !packet.integrityTag) return false;
    return tagsEqual(this.tagFor(packet), packet.integrityTag);
  };
  KnowledgeModulator.prototype.receive = function (packet) {
    if (!this.verifyPacket(packet)) {
      return { ok: false, refused: true, reason: 'packet integrity tag invalid — packet dropped (forged or altered in transit between planes)' };
    }
    return { ok: true, packet: clone(packet) };
  };

  /* ================= Zinium1Core ================= */

  function formatSlotId(slotId) {
    return slotId.indexOf('halex_m_') === 0 ? slotId : 'halex_m_' + slotId;
  }

  function Zinium1Core(state, storage) {
    this.installId = state.installId;
    this.chainId = state.chainId;
    this.storage = storage;
    this.storageKey = storageKeyFor(state.installId);
    this.chain = BraindataChain.fromSerialized(state.chain);
    this.daughters = (state.daughters || []).map(function (d) { return BraindataChain.fromSerialized(d); });
    this._packetIntegrityKey = state.packetIntegrityKey; // see KnowledgeModulator note — integrity only
    this._slots = {};       // formatted slot id -> function (runtime only, never persisted)
    this._permissions = state.permissions || {}; // module id -> [formatted slot ids]
    var self = this;
    var persist = function () { self._persist(); };
    this.braintree = new BraintreeCell(this.chain, persist);
    this.modulator = new KnowledgeModulator(this.braintree, this._packetIntegrityKey, persist);
  }
  Zinium1Core.prototype._persist = function () {
    var state = {
      version: 1,
      installId: this.installId,
      chainId: this.chainId,
      packetIntegrityKey: this._packetIntegrityKey,
      chain: this.chain.serialize(),
      daughters: this.daughters.map(function (d) { return d.serialize(); }),
      permissions: this._permissions
    };
    try { this.storage.setItem(this.storageKey, JSON.stringify(state)); } catch (e) { /* storage full/blocked: chain still works in memory */ }
  };
  Zinium1Core.prototype.commit = function (type, data) {
    var block = this.chain.append(type, data);
    this._persist();
    return block;
  };
  Zinium1Core.prototype.verify = function () {
    var root = this.chain.verify();
    if (!root.ok) return root;
    for (var i = 0; i < this.daughters.length; i++) {
      var dv = this.daughters[i].verify();
      if (!dv.ok) return { ok: false, height: this.chain.height(), badIndex: dv.badIndex, reason: 'daughter ' + this.daughters[i].chainId + ': ' + dv.reason };
    }
    return { ok: true, height: this.chain.height(), daughters: this.daughters.length };
  };
  Zinium1Core.prototype.status = function () {
    var v = this.verify();
    return {
      system: 'ZINIUM1', chainId: this.chainId, installId: this.installId,
      height: this.chain.height(), verified: v.ok,
      daughters: this.daughters.length, storageKey: this.storageKey,
      crypto: false, trading: false, keysHeld: 'packet-integrity-only'
    };
  };
  // A SHA-256 hash of data. Labeled a COMMITMENT everywhere — it is
  // not a zero-knowledge proof and is never presented as one.
  Zinium1Core.prototype.commitmentFor = function (data) { return sha256Hex(canonical(data)); };

  /* ---- commit helpers for HALEX-M's real work ---- */
  Zinium1Core.prototype.commitSkillLifecycle = function (evt) {
    return this.commit('SKILL_LIFECYCLE', {
      skillId: evt.skillId || null, proposalId: evt.proposalId || null,
      from: evt.from || null, to: evt.to || null, note: evt.note || ''
    });
  };
  Zinium1Core.prototype.commitChaintariumSnapshot = function (snapshot) {
    return this.commit('CHAINTARIUM_SNAPSHOT', {
      snapshotCommitment: this.commitmentFor(snapshot || {}), // hash commitment, NOT a proof
      summary: snapshot && snapshot.summary ? snapshot.summary : snapshot
    });
  };
  Zinium1Core.prototype.commitPaperTradeEvent = function (evt) {
    var data = clone(evt || {});
    data.paper = true; // ZINIUM¹ records paper events only; it never trades
    return this.commit('PAPER_TRADE_EVENT', data);
  };
  Zinium1Core.prototype.commitWatchlistChange = function (change) {
    return this.commit('WATCHLIST_CHANGE', clone(change || {}));
  };

  /* ---- HALEX-M slot gateway: permission table + integrity tags ----
   * Adapted from Gemini's multitenant design WITHOUT private keys:
   * a module may execute only the slots in its permission row, and a
   * routed packet must carry a valid integrity tag. Cross-permission
   * attempts are refused with a reason, never silently dropped. */
  Zinium1Core.prototype.registerModule = function (moduleId, allowedSlots) {
    this._permissions[moduleId] = (allowedSlots || []).map(formatSlotId);
    this._persist();
    return { ok: true, module: moduleId, allowedSlots: this._permissions[moduleId].slice() };
  };
  Zinium1Core.prototype.registerSlot = function (slotId, fn) {
    if (typeof fn !== 'function') return { ok: false, reason: 'slot executable must be a function' };
    var id = formatSlotId(slotId);
    this._slots[id] = fn;
    return { ok: true, slot: id };
  };
  Zinium1Core.prototype.executeSlot = function (moduleId, slotId, payload) {
    var id = formatSlotId(slotId);
    if (!this._slots[id]) return { ok: false, refused: true, reason: 'slot ' + id + ' is not registered' };
    var allowed = this._permissions[moduleId] || [];
    if (allowed.indexOf(id) === -1) {
      return { ok: false, refused: true, reason: 'module "' + moduleId + '" is not permitted to execute slot "' + id + '" (permission table)' };
    }
    // If the payload arrived as a modulated packet, its integrity tag
    // must verify before anything executes.
    if (payload && payload.integrityTag) {
      var recv = this.modulator.receive(payload);
      if (!recv.ok) return recv;
      payload = payload.payload;
    }
    this.braintree.evaluate('SLOT_EXECUTION', { module: moduleId, slot: id });
    var result = this._slots[id](payload);
    var receipt = this.commit('SLOT_EXECUTION', { module: moduleId, slot: id, resultCommitment: this.commitmentFor(result === undefined ? null : result) });
    return { ok: true, slot: id, result: result, blockIndex: receipt.index, blockHash: receipt.hash };
  };

  /* ---- Mitosis — CORRECTED DOCTRINE ONLY ----
   * A daughter chain spawns ONLY when:
   *   (1) a process requests a token/process it needs to complete, or
   *   (2) more exact processors are needed for the same instance.
   * Block count / capacity NEVER triggers mitosis. There is no record
   * cap. Any other trigger kind is refused with a reason. */
  Zinium1Core.prototype.requestMitosis = function (trigger) {
    if (!trigger || typeof trigger !== 'object') return { ok: false, refused: true, reason: 'mitosis needs a trigger object' };
    var valid = false, detail = null;
    if (trigger.kind === 'process-request' && trigger.requested && trigger.forProcess) {
      valid = true; detail = { requested: trigger.requested, forProcess: trigger.forProcess };
    } else if (trigger.kind === 'exact-processors-needed' && trigger.forInstance && (trigger.count == null || typeof trigger.count === 'number')) {
      valid = true; detail = { forInstance: trigger.forInstance, count: trigger.count == null ? null : trigger.count };
    }
    if (!valid) {
      return { ok: false, refused: true, reason: 'not a corrected mitosis trigger: only (1) a process requesting a token/process it needs to complete, or (2) more exact processors needed for the same instance. Capacity/block-count triggers are refused by doctrine.' };
    }
    var parentTip = this.chain.tip().hash;
    var daughter = new BraindataChain(this.chainId + '-M' + (this.daughters.length + 1));
    daughter.append('MITOSIS_INHERITANCE', {
      event: 'MITOSIS_INHERITANCE', parentChain: this.chainId,
      inheritedRootHash: parentTip, trigger: clone(trigger)
    });
    this.daughters.push(daughter);
    this.commit('MITOSIS_SPAWN', { daughterChain: daughter.chainId, anchoredToParentHash: parentTip, trigger: clone(trigger), detail: detail });
    return { ok: true, daughterChain: daughter.chainId, anchoredToParentHash: parentTip, daughterHeight: daughter.height() };
  };

  /* ================= factory ================= */

  function createCore(options) {
    options = options || {};
    var storage = options.storage || defaultStorage();
    if (!options.fresh) {
      var existingId = null;
      try { existingId = storage.getItem(INSTALL_ID_KEY); } catch (e) { /* ignore */ }
      if (existingId) {
        var raw = null;
        try { raw = storage.getItem(storageKeyFor(existingId)); } catch (e) { /* ignore */ }
        if (raw) {
          try { return new Zinium1Core(JSON.parse(raw), storage); } catch (e) { /* corrupted state: fall through to a fresh genesis, never crash the page */ }
        }
      }
    }
    var installId = 'z1-' + randomHex(8);
    var chainId = 'ZINIUM1-' + installId.slice(3).toUpperCase();
    var chain = new BraindataChain(chainId);
    var state = {
      version: 1, installId: installId, chainId: chainId,
      // PACKET INTEGRITY KEY — generated once for this install at
      // genesis. Local packet tamper-evidence only. NOT a wallet key.
      packetIntegrityKey: randomHex(32),
      chain: chain.serialize(), daughters: [], permissions: {}
    };
    try { storage.setItem(INSTALL_ID_KEY, installId); } catch (e) { /* ignore */ }
    var core = new Zinium1Core(state, storage);
    core._persist();
    return core;
  }

  var api = {
    PLANES: PLANES,
    BraindataChain: BraindataChain,
    BraintreeCell: BraintreeCell,
    KnowledgeModulator: KnowledgeModulator,
    Zinium1Core: Zinium1Core,
    createCore: createCore,
    memoryStorage: memoryStorage,
    storageKeyFor: storageKeyFor,
    INSTALL_ID_KEY: INSTALL_ID_KEY,
    sha256Hex: sha256Hex,
    hmacSha256Hex: hmacSha256Hex,
    canonical: canonical
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMZinium1 = api;
})(typeof window !== 'undefined' ? window : this);
