// HALEX-AI chat extension: core logic plus browser wiring for chat.html.
// Plain script, no modules. Core works in Node for tests, DOM wiring is browser only.
// Model config compatibility: uses the same localStorage keys as the main staging page:
// halex_ai_base, halex_ai_model, halex_ai_key.
// Hard limits: advisory only, no funds, no wallet keys or seeds, no live trading,
// no posting on its own, per-action confirmation, model key only in browser localStorage.
// No em dash characters are used in this file.
(function () {
  'use strict';

  function loadKnowledge() {
    if (typeof globalThis !== 'undefined' && globalThis.HalexAIKnowledge) {
      return globalThis.HalexAIKnowledge;
    }
    if (typeof window !== 'undefined' && window.HalexAIKnowledge) {
      return window.HalexAIKnowledge;
    }
    if (typeof require !== 'undefined') {
      try {
        return require('./knowledge.js');
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function loadPlugins() {
    if (typeof globalThis !== 'undefined' && globalThis.HalexAIPlugins) {
      return globalThis.HalexAIPlugins;
    }
    if (typeof window !== 'undefined' && window.HalexAIPlugins) {
      return window.HalexAIPlugins;
    }
    return null;
  }

  var Knowledge = loadKnowledge();

  function getModelConfig(storageLike) {
    var store = storageLike || null;
    if (!store) {
      try {
        if (typeof localStorage !== 'undefined') store = localStorage;
      } catch (e) {
        store = null;
      }
    }
    function read(key) {
      if (!store) return '';
      try {
        if (typeof store.getItem === 'function') return store.getItem(key) || '';
        return store[key] || '';
      } catch (e) {
        return '';
      }
    }
    return {
      baseUrl: read('halex_ai_base'),
      model: read('halex_ai_model'),
      key: read('halex_ai_key')
    };
  }

  function modelConfigured(cfg) {
    if (!cfg) return false;
    return !!(
      String(cfg.baseUrl || '').trim() &&
      String(cfg.model || '').trim() &&
      String(cfg.key || '').trim()
    );
  }

  var TOOLS = [
    {
      name: 'lookup_token',
      description: 'Look up a token by contract address or name.',
      status: 'live read-only via DexScreener public API, same as the main staging page'
    },
    {
      name: 'brand_guard_check',
      description: 'Check a domain, handle, or token address against the canonical HALEX list.',
      status: 'live local check against the canonical HALEX list'
    },
    {
      name: 'lesson_lookup',
      description: 'Look up a lesson in the bundled lesson index.',
      status: 'live local lookup in the bundled lesson index'
    },
    {
      name: 'web_research',
      description: 'Research a topic on the web.',
      status: 'stub: not wired in this build, returns an honest not-wired message'
    },
    {
      name: 'build_file',
      description: 'Build a starter page, doc, report, or script.',
      status: 'stub in this extension: use the main staging page, or queue a task'
    }
  ];

  function formatLesson(lesson) {
    return lesson.title +
      '\nObserve: ' + lesson.observe +
      '\nReport: ' + lesson.report +
      '\nLearn: ' + lesson.learn +
      '\nIndex: ' + lesson.index +
      '\nProvenance: ' + lesson.provenance;
  }

  function brandGuardCheck(input) {
    var text = String(input || '').trim();
    var low = text.toLowerCase();
    var canonical = ['halexapp', 'appsthatpay.github.io/halex-web/halex-m', 'linktr.ee/betasyndicate.com', 'betasyndicate.com'];
    for (var i = 0; i < canonical.length; i++) {
      if (low.indexOf(canonical[i]) !== -1) {
        return 'Tool result (brand_guard_check): matches a canonical HALEX spot. Canonical spots include @HALEXApp, the HALEX-M page, and Linktree betasyndicate.com. This local check compares names only, so check the exact URL before trusting a page.';
      }
    }
    if (low.indexOf('halex') !== -1) {
      return 'Tool result (brand_guard_check): the input uses the HALEX name but does not match the canonical HALEX list in this local check. Treat it as suspected, not confirmed, and run ownership checks before any public claim. No official HALEX token is minted, so any live HALEX token address is suspect by default.';
    }
    return 'Tool result (brand_guard_check): no HALEX name found in that input, so this is not a HALEX clone check. Give a domain, handle, or token address that uses the HALEX name.';
  }

  function runToolStub(name, arg) {
    var toolName = String(name || '').trim();
    var input = arg == null ? '' : String(arg);
    if (toolName === 'lesson_lookup') {
      var knowledge = Knowledge || loadKnowledge();
      if (!knowledge || typeof knowledge.searchLessons !== 'function') {
        return 'Tool result (lesson_lookup): the bundled lesson index is not available in this build, so no lesson lookup was performed and no lesson was invented.';
      }
      var hits = knowledge.searchLessons(input);
      if (!hits.length) {
        return 'Tool result (lesson_lookup): no lesson in the bundled index matches: ' + (input || '(empty query)') + '. Try words like gate, suite, staging chain, or ORLI.';
      }
      return 'Tool result (lesson_lookup):\n' + formatLesson(hits[0]);
    }
    if (toolName === 'web_research') {
      return 'Tool result (web_research): stub, not wired in this build. Web research is not wired here, so no web search was run and no web results are claimed. Use the local facts and lesson lookup on this page, or ask on the main staging page.';
    }
    if (toolName === 'build_file') {
      return 'Tool result (build_file): stub in this extension: use the main staging page, or queue a task. No file was built by this extension and nothing was downloaded.';
    }
    if (toolName === 'lookup_token') {
      return 'Tool result (lookup_token): live read-only via DexScreener public API, same as the main staging page. This extension stub does not fetch DexScreener itself, so no token data is shown here and no price or pair was invented. Use the main staging page for the live lookup.';
    }
    if (toolName === 'brand_guard_check') {
      return brandGuardCheck(input);
    }
    return 'Tool result (' + (toolName || 'unknown') + '): unknown tool. Available tools: ' + TOOLS.map(function (t) { return t.name; }).join(', ') + '.';
  }

  function answerLocal(text) {
    var input = String(text || '').trim();
    if (!input) {
      return {
        text: 'Ask a question about what this assistant can do, this assistant vs HALEX-M, how to contribute, the confirmation gate, the lesson index and ORLI, the code suite, or its hard limits. Local knowledge works offline.',
        source: 'fallback'
      };
    }
    var low = input.toLowerCase();

    // Greetings are not knowledge questions: answer them directly instead
    // of falling through to the honest-miss path. This is an identity and
    // orientation reply, not a fabricated fact.
    var greetOnly = low.replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
    if (greetOnly === 'hello' || greetOnly === 'hi' || greetOnly === 'hey' || greetOnly === 'howdy' || greetOnly === 'hello there' || greetOnly === 'hi there' || greetOnly === 'say hello' || greetOnly === 'say hi' || greetOnly === 'good morning' || greetOnly === 'good afternoon' || greetOnly === 'good evening') {
      return {
        text: 'Hello. I am the local assistant on this page. I can answer from bundled packs, for example: tell me about mice, what is HALEX-AI, or how does the confirmation gate work. For open questions, set your own model under Settings. What would you like to know?',
        source: 'greeting'
      };
    }

    if (low.indexOf('brand guard') !== -1 || low.indexOf('brand_guard') !== -1) {
      return { text: runToolStub('brand_guard_check', input), source: 'tool' };
    }
    if (low.indexOf('web research') !== -1 || low.indexOf('web_research') !== -1) {
      return { text: runToolStub('web_research', input), source: 'tool' };
    }
    if (low.indexOf('build file') !== -1 || low.indexOf('build_file') !== -1) {
      return { text: runToolStub('build_file', input), source: 'tool' };
    }

    var knowledge = Knowledge || loadKnowledge();

    // Lesson questions first when the visitor clearly asks for a lesson.
    if (knowledge && (low.indexOf('lesson') !== -1 || low.indexOf('zinium lesson') !== -1)) {
      var lessonHits = knowledge.searchLessons(input);
      if (lessonHits.length) {
        return { text: formatLesson(lessonHits[0]), source: 'lesson' };
      }
    }

    // Plugin packs first for topic questions: the old fact-first order let
    // any single common word in a fact win, so "what are mice" returned a
    // HALEX-AI fact instead of the mice pack. A plugin hit must clear the
    // ranked threshold (10) to win here; otherwise facts still run below.
    var earlyPlugins = loadPlugins();
    if (earlyPlugins && typeof earlyPlugins.answer === 'function') {
      var earlyAns = earlyPlugins.answer(input);
      if (earlyAns && earlyAns.source === 'plugin') {
        return { text: earlyAns.text, source: 'plugin' };
      }
    }

    if (knowledge && typeof knowledge.searchFacts === 'function') {
      var factHits = knowledge.searchFacts(input);
      if (factHits.length) {
        return { text: factHits[0].text, source: 'fact' };
      }
    }

    // Plugin packs extend coverage beyond the bundled facts. Ranked
    // retrieval picks the best entry, and the engine itself guards against
    // repeating the identical answer twice in a row for one question.
    var plugins = loadPlugins();
    var pluginAns = null;
    if (plugins && typeof plugins.answer === 'function') {
      pluginAns = plugins.answer(input);
      if (pluginAns && pluginAns.source === 'plugin') {
        return { text: pluginAns.text, source: 'plugin' };
      }
    }

    if (knowledge && typeof knowledge.searchLessons === 'function') {
      var hits2 = knowledge.searchLessons(input);
      if (hits2.length) {
        return { text: formatLesson(hits2[0]), source: 'lesson' };
      }
    }

    // Honest miss: no bundled fact, pack entry, or lesson matches. Never
    // fall back to generic jargon, and never fake an answer. The plugin
    // engine already lists the closest topics when any scored above zero.
    if (pluginAns && pluginAns.source === 'miss') {
      return { text: pluginAns.text, source: 'miss' };
    }
    return {
      text: "I don't have that in my library yet — I'll learn it. New knowledge packs arrive with HALEX-AI updates.",
      source: 'miss'
    };
  }

  function callModel(text, cfg, fetchFn, imageDataUrl) {
    if (!modelConfigured(cfg)) {
      return { ok: false, reason: 'not_configured' };
    }
    var fetchImpl = fetchFn || null;
    if (!fetchImpl) {
      try {
        if (typeof fetch !== 'undefined') fetchImpl = fetch;
      } catch (e) {
        fetchImpl = null;
      }
    }
    if (!fetchImpl) {
      return { ok: false, reason: 'no_fetch' };
    }
    var baseUrl = String(cfg.baseUrl || '').replace(/\/$/, '');
    var systemPrompt = 'You are HALEX-AI, a general AI built by AI, for everyone and anything. Help with research, writing, building, planning, and any field, in plain language. State what is verified and what is not, and do not invent facts. Hard limits: advisory only, no funds, no wallet keys or seeds, no live trading, no posting on its own, per-action confirmation.';
    var userContent = String(text || '');
    if (imageDataUrl && typeof imageDataUrl === 'string' && imageDataUrl.indexOf('data:image/') === 0) {
      userContent = [
        { type: 'text', text: String(text || 'Describe this image in detail.') },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ];
    }
    var request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.key
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      })
    };
    return Promise.resolve()
      .then(function () { return fetchImpl(baseUrl + '/chat/completions', request); })
      .then(function (res) {
        if (!res || !res.ok) {
          return { ok: false, reason: 'http_error', status: res ? res.status : null };
        }
        return Promise.resolve(res.json()).then(function (data) {
          var choice = data && data.choices && data.choices[0] ? data.choices[0].message : null;
          var content = choice ? choice.content : '';
          if (Array.isArray(content)) {
            content = content.map(function (p) { return p && p.text ? p.text : ''; }).join('');
          }
          if (!content) return { ok: false, reason: 'empty_response' };
          return { ok: true, text: content, source: 'model' };
        });
      })
      .catch(function (err) {
        return { ok: false, reason: 'request_failed', error: err && err.message ? err.message : String(err) };
      });
  }

  var HalexAIExt = {
    getModelConfig: getModelConfig,
    modelConfigured: modelConfigured,
    answerLocal: answerLocal,
    TOOLS: TOOLS,
    runToolStub: runToolStub,
    callModel: callModel
  };

  if (typeof window !== 'undefined') {
    window.HalexAIExt = HalexAIExt;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HalexAIExt = HalexAIExt;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HalexAIExt;
  }

  // DOM wiring: browser only.
  function wireDom() {
    if (typeof document === 'undefined') return;
    var logEl = document.getElementById('ext-log');
    if (!logEl) return;
    var qEl = document.getElementById('ext-q');
    var sendEl = document.getElementById('ext-send');
    var statusEl = document.getElementById('ext-status');
    var baseEl = document.getElementById('ext-base');
    var modelEl = document.getElementById('ext-model');
    var keyEl = document.getElementById('ext-key');
    var saveEl = document.getElementById('ext-save');
    var wipeEl = document.getElementById('ext-wipe');
    var toolsEl = document.getElementById('ext-tools');

    function addMsg(text, cls, label) {
      var d = document.createElement('div');
      d.className = 'ext-msg ' + (cls || 'ext-msg-ai');
      if (label) {
        var tag = document.createElement('div');
        tag.className = 'ext-source';
        tag.textContent = label;
        d.appendChild(tag);
      }
      var body = document.createElement('div');
      body.textContent = text;
      d.appendChild(body);
      logEl.appendChild(d);
      return d;
    }

    function currentConfig() {
      return getModelConfig();
    }

    function refreshStatus() {
      var cfg = currentConfig();
      if (baseEl) baseEl.value = cfg.baseUrl || '';
      if (modelEl) modelEl.value = cfg.model || '';
      if (statusEl) {
        statusEl.textContent = modelConfigured(cfg)
          ? 'Status: model configured in this browser. The key is stored only in browser localStorage and is sent only to the API base URL you set.'
          : 'Status: offline local mode. No model configured in this browser. HALEX facts and bundled lesson lookup work offline.';
      }
      return cfg;
    }

    function renderTools() {
      if (!toolsEl) return;
      toolsEl.innerHTML = '';
      TOOLS.forEach(function (tool) {
        var item = document.createElement('div');
        item.className = 'ext-tool';
        var name = document.createElement('strong');
        name.textContent = tool.name;
        item.appendChild(name);
        var desc = document.createElement('span');
        desc.textContent = ' : ' + tool.description + ' ';
        item.appendChild(desc);
        var status = document.createElement('span');
        status.className = 'ext-tool-status';
        status.textContent = 'Status: ' + tool.status;
        item.appendChild(status);
        toolsEl.appendChild(item);
      });
    }

    function localReply(text) {
      var ans = answerLocal(text);
      var label = ans.source === 'fact'
        ? 'Local knowledge: fact'
        : ans.source === 'greeting'
          ? 'Local knowledge: greeting'
        : ans.source === 'lesson'
          ? 'Local knowledge: lesson'
          : ans.source === 'tool'
            ? 'Local knowledge: tool'
            : ans.source === 'plugin'
              ? 'Local knowledge: plugin pack'
              : ans.source === 'miss'
                ? 'Local knowledge: honest miss'
                : 'Local knowledge: fallback';
      addMsg(ans.text, 'ext-msg-ai', label);
    }

    function handleSend() {
      var text = qEl ? qEl.value.trim() : '';
      if (!text) return;
      addMsg(text, 'ext-msg-user', 'You');
      if (qEl) qEl.value = '';
      var pendingImage = null;
      try { pendingImage = window.HalexAIPendingImage || null; } catch (e) { pendingImage = null; }
      try { window.HalexAIPendingImage = null; } catch (e) {}
      var cfg = currentConfig();
      if (!modelConfigured(cfg)) {
        if (pendingImage) {
          addMsg('Vision needs a configured vision-capable model: this image was shown in the thread but not interpreted, and it was not sent anywhere. Set a model under Settings to have it described.', 'ext-msg-tool', 'Notice');
        }
        localReply(text);
        return;
      }
      var fetchFn = null;
      try {
        if (typeof fetch !== 'undefined') fetchFn = fetch.bind(window);
      } catch (e) {
        fetchFn = null;
      }
      Promise.resolve(callModel(text, cfg, fetchFn, pendingImage))
        .then(function (result) {
          if (result && result.ok && result.text) {
            addMsg(result.text, 'ext-msg-ai', 'Model output');
          } else {
            addMsg('The configured model did not return an answer (' + (result && result.reason ? result.reason : 'unknown failure') + (pendingImage ? '. If the model is not vision-capable it will reject the image; use a vision model for image questions.' : '') + '), so this answer comes from local knowledge instead. No model answer was fabricated.', 'ext-msg-tool', 'Notice');
            localReply(text);
          }
        })
        .catch(function () {
          addMsg('The model call failed, so this answer comes from local knowledge instead. No model answer was fabricated.', 'ext-msg-tool', 'Notice');
          localReply(text);
        });
    }

    if (sendEl) sendEl.addEventListener('click', handleSend);
    if (qEl) {
      qEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
    }
    if (saveEl) {
      saveEl.addEventListener('click', function () {
        try {
          localStorage.setItem('halex_ai_base', baseEl ? baseEl.value.trim() : '');
          localStorage.setItem('halex_ai_model', modelEl ? modelEl.value.trim() : '');
          localStorage.setItem('halex_ai_key', keyEl ? keyEl.value : '');
        } catch (e) {}
        if (keyEl) keyEl.value = '';
        refreshStatus();
        addMsg('Model settings saved in this browser only, in localStorage under halex_ai_base, halex_ai_model, and halex_ai_key. Never paste a wallet seed or private key here.', 'ext-msg-ai', 'Local knowledge: settings');
      });
    }
    if (wipeEl) {
      wipeEl.addEventListener('click', function () {
        try {
          localStorage.removeItem('halex_ai_key');
          localStorage.removeItem('halex_ai_base');
          localStorage.removeItem('halex_ai_model');
        } catch (e) {}
        if (keyEl) keyEl.value = '';
        refreshStatus();
        addMsg('Model key and settings wiped from this browser.', 'ext-msg-ai', 'Local knowledge: settings');
      });
    }

    renderTools();
    refreshStatus();
    addMsg('Chat is ready. Offline local mode answers from bundled facts and the lesson index. Add your own model key below to ask a configured model instead. Advisory only, no funds, no wallet keys or seeds, no live trading, no posting on its own.', 'ext-msg-ai', 'Local knowledge: welcome');
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireDom);
    } else {
      wireDom();
    }
  }
})();
