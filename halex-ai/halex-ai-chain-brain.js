// HALEX-AI Chain-Brain conversational layer (staging).
// Mirrors chain_brain/conversational_engine.py in plain browser JS.
// No modules, no third-party code, no network, no storage of the
// user's question. Reads a conversation message, routes by keyword
// overlap to stored chain-brain records, and answers in flowing
// human dialog with a follow-up question. A miss says so honestly.
// Keyword overlap is routing, not understanding.
(function (root) {
  'use strict';

  var STOPWORDS = {
    a: 1, an: 1, the: 1, is: 1, are: 1, was: 1, were: 1, do: 1,
    does: 1, did: 1, what: 1, which: 1, who: 1, whom: 1, whose: 1,
    when: 1, where: 1, why: 1, how: 1, tell: 1, me: 1, about: 1,
    please: 1, can: 1, you: 1, i: 1, we: 1, of: 1, on: 1, in: 1,
    to: 1, for: 1, and: 1, or: 1, with: 1, that: 1, this: 1,
    know: 1, something: 1, anything: 1, more: 1
  };

  var SENSITIVE = [
    /private[_\s-]?key/i, /seed[_\s-]?phrase/i, /bip39/i,
    /password/i, /secret[_\s-]?key/i, /bearer\s+[a-zA-Z0-9_\-\.]+/i
  ];

  function tokens(text) {
    var words = String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    var out = [];
    for (var i = 0; i < words.length; i++) {
      if (!STOPWORDS[words[i]]) out.push(words[i]);
    }
    return out;
  }

  function isSensitive(text) {
    for (var i = 0; i < SENSITIVE.length; i++) {
      if (SENSITIVE[i].test(text)) return true;
    }
    return false;
  }

  function createChainBrain() {
    var records = [];
    var chains = {};
    var agencies = {};

    function registerChain(id, name, category) {
      if (!/^Chain-(0[1-9]|[1-9][0-9]|[1-9][0-9]{2}|1000)$/.test(id)) {
        return { status: 'ERROR', reason: 'INVALID_CHAIN_ID_FORMAT' };
      }
      if (chains[id]) return { status: 'ERROR', reason: 'ALREADY_EXISTS' };
      chains[id] = { id: id, name: name, category: category };
      return { status: 'REGISTERED', chain: chains[id] };
    }

    function createAgency(agencyId, chainId, category, start, end) {
      if (!chains[chainId]) return { status: 'NOT_FOUND', reason: 'CHAIN_NOT_FOUND' };
      if (start < 0 || end >= 100000000 || start > end) {
        return { status: 'ERROR', reason: 'INVALID_ADDRESS_RANGE' };
      }
      agencies[agencyId] = { agencyId: agencyId, chainId: chainId, category: category, start: start, end: end };
      return { status: 'AGENCY_CREATED', agency: agencies[agencyId] };
    }

    function storeRecord(id, chainId, agencyId, category, content) {
      if (isSensitive(content) || isSensitive(id) || isSensitive(category)) {
        return { status: 'REFUSED_SENSITIVE' };
      }
      var agency = agencies[agencyId];
      if (!chains[chainId]) return { status: 'NOT_FOUND', reason: 'CHAIN_NOT_FOUND' };
      if (!agency) return { status: 'NOT_FOUND', reason: 'AGENCY_NOT_FOUND' };
      if (agency.chainId !== chainId) return { status: 'ERROR', reason: 'AGENCY_DOES_NOT_BELONG_TO_CHAIN' };
      if (agency.category !== category) return { status: 'ERROR', reason: 'CATEGORY_MISMATCH_WITH_AGENCY' };
      var rec = { id: id, chainId: chainId, agencyId: agencyId, category: category, content: content };
      records.push(rec);
      return { status: 'STORED', record: rec };
    }

    function availableCategories() {
      var seen = {};
      var out = [];
      for (var i = 0; i < records.length; i++) {
        if (!seen[records[i].category]) { seen[records[i].category] = 1; out.push(records[i].category); }
      }
      return out.sort();
    }

    // Read one conversation message. Stores nothing. Returns an
    // answer object with a human follow-up, match or honest miss.
    function respond(text) {
      var question = {};
      var qt = tokens(text);
      for (var i = 0; i < qt.length; i++) question[qt[i]] = 1;
      var best = null;
      var bestScore = 0;
      for (var r = 0; r < records.length; r++) {
        var rec = records[r];
        var ct = tokens(rec.content);
        var catT = tokens(rec.category);
        var score = 0;
        for (var c = 0; c < ct.length; c++) if (question[ct[c]]) score += 1;
        for (var k = 0; k < catT.length; k++) if (question[catT[k]]) score += 2;
        if (score > bestScore) { bestScore = score; best = rec; }
      }
      if (!best || bestScore <= 0) {
        var cats = availableCategories();
        var catLine = cats.length ? ' I do have records on: ' + cats.join(', ') + '.' : '';
        var followUp = 'What else interests you?';
        return {
          status: 'MISS',
          answer: 'Good question, and I want to be straight with you: ' +
            'I don\'t have a record on that in this chain-brain yet, ' +
            'so I won\'t guess at one.' + catLine + ' ' + followUp,
          followUp: followUp,
          availableCategories: cats
        };
      }
      var follow = 'What else about ' + best.category + ' interests you? What else would you like to know?';
      return {
        status: 'MATCH',
        answer: 'Good question. Here\'s what I have on ' + best.category + ': ' +
          best.content + ' That comes from the ' + best.category +
          ' records in this chain-brain, so it\'s something stored here, ' +
          'not something I made up on the spot. ' + follow,
        followUp: follow,
        recordId: best.id,
        category: best.category,
        chainId: best.chainId,
        agencyId: best.agencyId
      };
    }

    return {
      registerChain: registerChain,
      createAgency: createAgency,
      storeRecord: storeRecord,
      availableCategories: availableCategories,
      respond: respond,
      recordCount: function () { return records.length; }
    };
  }

  var api = { createChainBrain: createChainBrain, tokens: tokens, isSensitive: isSensitive };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.HalexChainBrain = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
