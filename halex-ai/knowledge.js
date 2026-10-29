// HALEX-AI knowledge base: facts and ZINIUM lessons for the general-AI chat extension.
// Plain script, no modules. Works in the browser and in Node for tests.
// No em dash characters are used in this file.
(function () {
  'use strict';

  var FACTS = [
    {
      keys: ['what is halex-ai', 'halex-ai', 'halex ai', 'what is halex ai', 'general ai', 'who built halex-ai'],
      topic: 'What HALEX-AI is',
      text: 'HALEX-AI is a general AI built by AI, for everyone and anything: research, writing, building, planning, and work in any field. It is not a blockchain product. Blockchain intelligence is one branch of its tool layer, not its identity. It is built in the open by many AI systems and human collaborators, coordinated by the assistant Allen.'
    },
    {
      keys: ['what can halex-ai do', 'what can you do', 'capabilities', 'can halex-ai do', 'abilities', 'help with'],
      topic: 'What HALEX-AI can do',
      text: 'HALEX-AI can help with research, writing, building pages, docs, reports and scripts, planning tasks, explaining topics in plain language, verifying claims, and looking up its bundled knowledge and ZINIUM lessons. Where a tool is not wired in a given build, it says so honestly instead of pretending. Any model-powered open question needs a model configured by the visitor in their own browser.'
    },
    {
      keys: ['halex-ai vs halex-m', 'halex-ai and halex-m', 'difference halex-ai halex-m', 'halex-m', 'halex m', 'siblings'],
      topic: 'HALEX-AI vs HALEX-M',
      text: 'HALEX-AI and HALEX-M are siblings, not the same system. HALEX-AI is the general AI described on this page, for everyone and anything. HALEX-M is the separate blockchain intelligence app, with its own AI, focused on token and chain research. They are related projects, but they are not one system and neither one is the other.'
    },
    {
      keys: ['how to contribute', 'contribute', 'contribution', 'collaborate', 'built in the open', 'collaborators'],
      topic: 'How to contribute',
      text: 'HALEX-AI is built in the open by many AI systems and human collaborators, coordinated by the assistant Allen. Contributions are welcome from any AI system or human collaborator. Every contribution passes a confirmation gate before merging. Sound work is merged and credited to its contributor. Lessons from the work are indexed into ZINIUM with provenance and a seed marker in the form ZINIUM-SEED-[NAME].'
    },
    {
      keys: ['confirmation gate', 'gate', 'merge gate', 'before merging', 'quality gate', 'approval gate'],
      topic: 'The confirmation gate',
      text: 'Every contribution to HALEX-AI passes a confirmation gate before merging. The gate checks that the work runs, that tests pass, that data is clean, and that nothing is hidden. Sound work is merged and credited. Work that fails the gate is returned with the faults named, so the contributor can fix and resubmit. A gate that only runs contributor tests can miss faults those tests do not cover, so adversarial probes belong in every gate pass.'
    },
    {
      keys: ['zinium', 'orli', 'observe report learn index', 'lesson index', 'memory'],
      topic: 'ZINIUM and ORLI',
      text: 'ZINIUM is the lesson and memory index for HALEX work. Lessons are indexed into ZINIUM using the ORLI loop: Observe, Report, Learn, Index. Each lesson records what was observed, what was reported, what was learned, and where it is indexed, with provenance and a seed marker in the form ZINIUM-SEED-[NAME], for example ZINIUM-SEED-ALLEN for work seeded by Allen and ZINIUM-SEED-GEMINI for work seeded by Gemini.'
    },
    {
      keys: ['code suite', 'suite', 'modules', 'tests', 'first merged code', 'suite v4', 'suite v5'],
      topic: 'The code suite',
      text: 'The first merged HALEX-AI code suite has 9 modules: core conversation engine, research engine, writing assistant, task planner, ZINIUM memory, claim verifier, safety auditor, improvement engine, and token explainer, each with tests. Suite v4 had 26 tests. Suite v5 added an in-house rewritten claim verifier (seed ZINIUM-SEED-ALLEN) plus a research synthesis add-on: 39 tests, 38 pass, and 1 documented expected failure.'
    },
    {
      keys: ['halex wallet', 'wallet'],
      topic: 'HALEX Wallet',
      text: 'HALEX Wallet is a wallet project in the wider HALEX suite. This chat page does not hold wallet keys or seeds, does not move funds, and never asks for a wallet key or seed. A model API key is not a wallet key, and neither one belongs anywhere except its own proper place.'
    },
    {
      keys: ['halex chain', 'chain', 'blockchain project'],
      topic: 'HALEX Chain',
      text: 'HALEX Chain is a chain design in the wider HALEX suite. It is at design stage, not deployed, and no token is minted. Any live token claiming to be an official HALEX token should be treated as suspect until verified through official HALEX channels.'
    },
    {
      keys: ['limits', 'limitations', 'hard limits', 'cannot do', 'can not do', 'advisory only', 'safety limits'],
      topic: 'Hard limits',
      text: 'Hard limits for HALEX-AI: advisory only, no funds, no wallet keys or seeds, no live trading, no posting on its own, per-action confirmation for anything beyond advice, and a model key, if the visitor adds one, lives only in browser localStorage. It does not move money, does not trade, does not hold secrets, and does not act externally on its own.'
    }
  ];

  var LESSONS = [
    {
      id: 'ZINIUM-LESSON-GEMINI-SUITE-20261029',
      title: 'HALEX-AI Code Suite v4 gate lesson',
      observe: 'A 9-module general-AI suite arrived after three gated returns.',
      report: 'The gate ran the contributor tests verbatim (all pass), then adversarial probes found two faults the contributor tests missed (a context matcher matching any single word, and a broken test guard).',
      learn: 'A gate that only runs contributor tests misses faults those tests do not cover, so adversarial probes belong in every gate pass.',
      index: 'halex-ai/workspace/gemini/halex-ai-suite/',
      provenance: 'Contributor Gemini (ZINIUM-SEED-GEMINI), gate and patches Allen, human approval Jeffrey Allen Kaufman.'
    },
    {
      id: 'ZINIUM-LESSON-ZENIUM-STAGING-CHAIN',
      title: 'HALEX-ZENIUM staging chain lesson',
      observe: 'HALEX-ZENIUM is a staging lesson ledger design where each lesson block links to the previous block by hash, forming an append-only chain.',
      report: 'The staging chain currently holds genesis and staging sample blocks only, and those blocks are labelled as samples. It is not presented as a live production ledger.',
      learn: 'A hash-chained, append-only ledger makes later edits to earlier lessons visible, but a staging chain with sample blocks proves the format only. It does not prove production use.',
      index: 'halex-zenium staging chain, genesis and staging sample blocks.',
      provenance: 'Staging record for HALEX-AI knowledge bundle, seeded by Allen (ZINIUM-SEED-ALLEN), human approval Jeffrey Allen Kaufman.'
    },
    {
      id: 'ZINIUM-LESSON-ORLI-LOOP',
      title: 'The ORLI loop as a lesson',
      observe: 'Useful lessons were being learned during HALEX work, but a lesson that is not written down in a fixed shape is easy to lose or blur.',
      report: 'ZINIUM records each lesson with four steps: Observe what happened, Report the verified detail, Learn the rule that follows, and Index where the lesson belongs, with provenance.',
      learn: 'Observe, Report, Learn, Index (ORLI) keeps lessons checkable: each part can be checked on its own, and provenance says who contributed and who approved.',
      index: 'ZINIUM lesson index, ORLI loop.',
      provenance: 'Staging record for HALEX-AI knowledge bundle, seeded by Allen (ZINIUM-SEED-ALLEN), human approval Jeffrey Allen Kaufman.'
    },
    {
      id: 'ZINIUM-LESSON-ZENIUM-HONEST-LABELLING',
      title: 'Labelling staging samples honestly',
      observe: 'The HALEX-ZENIUM staging chain holds a small number of blocks, and readers could mistake a sample for real usage history.',
      report: 'The genesis and staging sample blocks in the staging chain are labelled as samples, and the chain is described as staging, not production.',
      learn: 'Label samples as samples and staging as staging, in the record itself. Honest labels stop a format demo from being read as a track record.',
      index: 'halex-zenium staging chain, sample block labels.',
      provenance: 'Staging record for HALEX-AI knowledge bundle, seeded by Allen (ZINIUM-SEED-ALLEN), human approval Jeffrey Allen Kaufman.'
    }
  ];

  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(function (w) { return w.length > 0; });
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

  function searchFacts(text) {
    var queryWords = tokenize(text);
    if (!queryWords.length) return [];
    var scored = [];
    for (var i = 0; i < FACTS.length; i++) {
      var fact = FACTS[i];
      var score = 0;
      score += scoreWords(queryWords, fact.keys.join(' '), 3);
      score += scoreWords(queryWords, fact.topic, 2);
      score += scoreWords(queryWords, fact.text, 1);
      // Bonus when a full trigger phrase appears in the query.
      var low = String(text || '').toLowerCase();
      for (var k = 0; k < fact.keys.length; k++) {
        if (fact.keys[k] && low.indexOf(fact.keys[k]) !== -1) score += 5;
      }
      if (score > 0) scored.push({ fact: fact, score: score, order: i });
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.order - b.order;
    });
    return scored.map(function (entry) { return entry.fact; });
  }

  function searchLessons(text) {
    var queryWords = tokenize(text);
    if (!queryWords.length) return [];
    var scored = [];
    for (var i = 0; i < LESSONS.length; i++) {
      var lesson = LESSONS[i];
      var combined = [lesson.id, lesson.title, lesson.observe, lesson.report, lesson.learn, lesson.index, lesson.provenance].join(' ');
      var score = 0;
      score += scoreWords(queryWords, lesson.title, 3);
      score += scoreWords(queryWords, combined, 1);
      if (score > 0) scored.push({ lesson: lesson, score: score, order: i });
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.order - b.order;
    });
    return scored.map(function (entry) { return entry.lesson; });
  }

  var HalexAIKnowledge = {
    FACTS: FACTS,
    LESSONS: LESSONS,
    searchFacts: searchFacts,
    searchLessons: searchLessons
  };

  // UMD tail: browser global and Node export.
  if (typeof window !== 'undefined') {
    window.HalexAIKnowledge = HalexAIKnowledge;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HalexAIKnowledge = HalexAIKnowledge;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HalexAIKnowledge;
  }
})();
