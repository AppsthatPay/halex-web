// HALEX-AI in-page ZINIUM chain: a real SHA-256 hash chain that runs in the browser.
// Plain script, no modules, no third-party code. Core works in Node for tests,
// DOM wiring lives in halex-ai-ui.js.
// Honest scope: this is a live demo of the same hash-chain design used by the
// HALEX-ZENIUM ledger. It chains actions taken on this page only. It is not
// the production ledger and claims nothing beyond this page.
// No em dash characters are used in this file.
(function () {
  'use strict';

  var GENESIS_PREV = 'GENESIS';

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = '';
    for (var i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16);
      if (h.length < 2) h = '0' + h;
      out += h;
    }
    return out;
  }

  // Returns a function(text) -> Promise<hex string>.
  // Browser: SubtleCrypto. Node: the built-in crypto module.
  function defaultHashFn() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
      return function (text) {
        var data = new TextEncoder().encode(text);
        return window.crypto.subtle.digest('SHA-256', data).then(toHex);
      };
    }
    if (typeof require !== 'undefined') {
      try {
        var nodeCrypto = require('crypto');
        return function (text) {
          return Promise.resolve(nodeCrypto.createHash('sha256').update(text, 'utf8').digest('hex'));
        };
      } catch (e) {
        return null;
      }
    }
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      return function (text) {
        var data = new TextEncoder().encode(text);
        return crypto.subtle.digest('SHA-256', data).then(toHex);
      };
    }
    return null;
  }

  function blockString(block) {
    return [block.index, block.time, block.kind, block.summary, block.prev].join('|');
  }

  function createChain() {
    return { blocks: [] };
  }

  // Appends a block. hashFn is optional (tests inject one); time is optional
  // (tests inject a fixed clock). Returns a Promise for the new block.
  function appendBlock(chain, kind, summary, hashFn, timeIso) {
    var hash = hashFn || defaultHashFn();
    if (!hash) return Promise.reject(new Error('no_hash_function'));
    var prev = chain.blocks.length ? chain.blocks[chain.blocks.length - 1].hash : GENESIS_PREV;
    var block = {
      index: chain.blocks.length,
      time: timeIso || new Date().toISOString(),
      kind: String(kind || 'note'),
      summary: String(summary || ''),
      prev: prev,
      hash: ''
    };
    return Promise.resolve(hash(blockString(block))).then(function (hex) {
      block.hash = hex;
      chain.blocks.push(block);
      return block;
    });
  }

  // Recomputes every hash and every prev link. A single edited summary,
  // hash, or link makes the chain invalid at that block.
  function verifyChain(chain, hashFn) {
    var hash = hashFn || defaultHashFn();
    if (!hash) return Promise.reject(new Error('no_hash_function'));
    var blocks = chain.blocks || [];
    var result = { valid: true, checked: blocks.length, badIndex: -1 };
    var chainPromise = Promise.resolve();
    blocks.forEach(function (block, i) {
      chainPromise = chainPromise.then(function () {
        if (!result.valid) return null;
        var expectedPrev = i === 0 ? GENESIS_PREV : blocks[i - 1].hash;
        if (block.prev !== expectedPrev || block.index !== i) {
          result.valid = false;
          result.badIndex = i;
          return null;
        }
        return Promise.resolve(hash(blockString(block))).then(function (hex) {
          if (hex !== block.hash) {
            result.valid = false;
            result.badIndex = i;
          }
        });
      });
    });
    return chainPromise.then(function () { return result; });
  }

  function serialize(chain) {
    return JSON.stringify({ blocks: chain.blocks });
  }

  function deserialize(text) {
    try {
      var data = JSON.parse(text);
      if (!data || !Array.isArray(data.blocks)) return createChain();
      return { blocks: data.blocks };
    } catch (e) {
      return createChain();
    }
  }

  var ZiniumChain = {
    GENESIS_PREV: GENESIS_PREV,
    createChain: createChain,
    appendBlock: appendBlock,
    verifyChain: verifyChain,
    serialize: serialize,
    deserialize: deserialize,
    blockString: blockString
  };

  if (typeof window !== 'undefined') window.ZiniumChain = ZiniumChain;
  if (typeof globalThis !== 'undefined') globalThis.ZiniumChain = ZiniumChain;
  if (typeof module !== 'undefined' && module.exports) module.exports = ZiniumChain;
})();
