// HALEX-AI plugin system + answer engine.
// Plugins are bundled JSON knowledge packs. The page loads packs offline:
// no network calls are made from the page. Live internet access stays on
// the BUILDER and intake side, per the harvest doctrine.
// Adding a pack means adding one pack file and one script line in
// index.html. The chat code (halex-ai-ext.js) is never edited for a pack.
// Plain script, no modules, no third-party code. No dynamic code execution.
// Note: the honest-miss sentence below is prescribed wording and keeps its
// punctuation exactly as specified.
(function () {
  'use strict';

  var packs = [];
  var queuedPacks = [];
  var lastByQuestion = {};

  var STOPWORDS = {
    what: true, is: true, the: true, a: true, an: true, tell: true, me: true,
    about: true, how: true, do: true, does: true, can: true, you: true,
    your: true, i: true, please: true, give: true, show: true, explain: true,
    of: true, on: true, in: true, for: true, to: true, and: true, or: true,
    with: true, my: true, want: true, know: true, are: true, be: true
  };

  function normalizeToken(w) {
    if (w === 'mice') return 'mouse';
    // Light plural fold, applied equally to questions and entries, so it
    // can only merge forms of the same word, never favor one entry.
    if (w.length > 3 && w.charAt(w.length - 1) === 's' && w.charAt(w.length - 2) !== 's') {
      return w.slice(0, -1);
    }
    return w;
  }

  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(function (w) { return w.length > 0; })
      .map(normalizeToken);
  }

  function contentTokens(text) {
    return tokenize(text).filter(function (w) { return !STOPWORDS[w]; });
  }

  function wordSet(text) {
    var words = tokenize(text);
    var set = {};
    for (var i = 0; i < words.length; i++) set[words[i]] = true;
    return set;
  }

  function scoreWords(queryWords, targetText, weight) {
    var set = wordSet(targetText);
    var score = 0;
    for (var i = 0; i < queryWords.length; i++) {
      if (set[queryWords[i]]) score += weight;
    }
    return score;
  }

  function registerPack(pack) {
    if (!pack || typeof pack !== 'object') return false;
    if (!pack.id || typeof pack.id !== 'string') return false;
    if (!Array.isArray(pack.entries) || !pack.entries.length) return false;
    for (var i = 0; i < packs.length; i++) {
      if (packs[i].id === pack.id) return false;
    }
    for (var j = 0; j < pack.entries.length; j++) {
      var e = pack.entries[j];
      if (!e || !e.title || !e.body) return false;
      if (!Array.isArray(e.patterns)) e.patterns = [];
      if (!Array.isArray(e.sources)) e.sources = [];
    }
    packs.push(pack);
    return true;
  }

  function collectPending() {
    var g = null;
    try {
      if (typeof globalThis !== 'undefined') g = globalThis;
      else if (typeof window !== 'undefined') g = window;
    } catch (e) { g = null; }
    if (g && Array.isArray(g.HalexAIPluginPacks) && g.HalexAIPluginPacks.length) {
      var pending = g.HalexAIPluginPacks.slice();
      g.HalexAIPluginPacks.length = 0;
      for (var i = 0; i < pending.length; i++) registerPack(pending[i]);
    }
    for (var j = 0; j < queuedPacks.length; j++) registerPack(queuedPacks[j]);
    queuedPacks.length = 0;
  }

  function listPacks() {
    collectPending();
    return packs.map(function (p) {
      return { id: p.id, name: p.name, version: p.version, entries: p.entries.length, provenance: p.provenance };
    });
  }

  // Ranked retrieval: token overlap with weights, plus a phrase bonus when a
  // whole trigger phrase appears in the question. Returns the BEST matches,
  // not the first keyword hit.
  function search(query) {
    collectPending();
    var queryWords = contentTokens(query);
    var raw = String(query || '').toLowerCase();
    if (!queryWords.length) return [];
    var scored = [];
    for (var pi = 0; pi < packs.length; pi++) {
      var pack = packs[pi];
      for (var ei = 0; ei < pack.entries.length; ei++) {
        var entry = pack.entries[ei];
        var score = 0;
        score += scoreWords(queryWords, entry.patterns.join(' '), 4);
        score += scoreWords(queryWords, entry.title, 3);
        score += scoreWords(queryWords, entry.body, 1);
        for (var k = 0; k < entry.patterns.length; k++) {
          var phrase = String(entry.patterns[k] || '').toLowerCase();
          if (phrase && phrase.indexOf(' ') !== -1 && raw.indexOf(phrase) !== -1) score += 10;
          if (phrase && phrase.indexOf(' ') === -1 && raw.indexOf(phrase) !== -1) score += 6;
        }
        if (score > 0) {
          scored.push({ pack: pack, entry: entry, score: score, packOrder: pi, entryOrder: ei });
        }
      }
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (a.packOrder !== b.packOrder) return a.packOrder - b.packOrder;
      return a.entryOrder - b.entryOrder;
    });
    return scored;
  }

  var HIT_THRESHOLD = 10;
  var MISS_TEXT = "I don't have that in my library yet — I'll learn it.";

  function entryKey(hit) {
    return hit.pack.id + '::' + hit.entry.title;
  }

  function formatHit(hit) {
    var src = hit.entry.sources && hit.entry.sources.length
      ? hit.entry.sources.join('; ')
      : 'bundled pack';
    return hit.entry.title + '\n' + hit.entry.body + '\nSource: ' + src + ' (pack: ' + (hit.pack.name || hit.pack.id) + ')';
  }

  function answer(query) {
    var q = String(query || '').trim();
    var norm = q.toLowerCase().replace(/\s+/g, ' ');
    var ranked = search(q);
    if (!ranked.length || ranked[0].score < HIT_THRESHOLD) {
      var related = [];
      for (var i = 0; i < ranked.length && related.length < 3; i++) {
        related.push(ranked[i].entry.title);
      }
      var miss = MISS_TEXT + ' New knowledge packs arrive with HALEX-AI updates.';
      if (related.length) {
        miss += ' Closest topics in my library: ' + related.join('; ') + '.';
      }
      return { text: miss, source: 'miss', score: ranked.length ? ranked[0].score : 0, related: related };
    }
    var lastKey = lastByQuestion[norm];
    var chosen = ranked[0];
    if (lastKey && entryKey(chosen) === lastKey) {
      if (ranked.length > 1) {
        chosen = ranked[1];
      } else {
        // Single match, just used: vary the presentation instead of
        // repeating the identical text. Same facts, plus related titles
        // from the same pack, so the answer is never byte-identical.
        var siblings = [];
        for (var p = 0; p < chosen.pack.entries.length && siblings.length < 3; p++) {
          if (chosen.pack.entries[p].title !== chosen.entry.title) siblings.push(chosen.pack.entries[p].title);
        }
        var varied = formatHit(chosen);
        if (siblings.length) {
          varied += '\n\nAlso in this pack: ' + siblings.join('; ') + '.';
        } else {
          varied += '\n\nAsked again, so here is the same entry once more with its source line repeated for reference.';
        }
        lastByQuestion[norm] = entryKey(chosen);
        return { text: varied, source: 'plugin', entry: chosen.entry, pack: chosen.pack, score: chosen.score };
      }
    }
    lastByQuestion[norm] = entryKey(chosen);
    return { text: formatHit(chosen), source: 'plugin', entry: chosen.entry, pack: chosen.pack, score: chosen.score };
  }

  function queuePack(pack) {
    queuedPacks.push(pack);
  }

  var HalexAIPlugins = {
    registerPack: registerPack,
    queuePack: queuePack,
    listPacks: listPacks,
    search: search,
    answer: answer,
    HIT_THRESHOLD: HIT_THRESHOLD,
    MISS_TEXT: MISS_TEXT
  };

  if (typeof window !== 'undefined') {
    window.HalexAIPlugins = HalexAIPlugins;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HalexAIPlugins = HalexAIPlugins;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HalexAIPlugins;
  }
})();
