// HALEX-AI live brain adapter: the connection layer between the page
// chat and a visitor-configured, OpenAI-compatible model endpoint.
// Plain script, no modules, no eval, no Function, no third-party code.
//
// What this file is and is not:
// - It is a CONNECTION layer only. It holds no model, no backend, no
//   key, and no default endpoint. A live brain appears only when the
//   visitor configures an endpoint, a model, and a key in the Model
//   section of the settings drawer. Until then the chat behaves
//   exactly as before (bundled packs + ranked retrieval + honest miss)
//   and this adapter issues no network call at all.
// - Endpoint + model + key live ONLY in the visitor's browser
//   localStorage, under the same keys the page already uses
//   (halex_ai_base, halex_ai_model, halex_ai_key). They are never
//   written into page source, never committed, never logged. The key
//   is sent ONLY to the configured endpoint, in the Authorization
//   header of that endpoint's own requests, and nowhere else.
// - With a brain configured, messages route here with streaming:
//   content deltas append to a pending bubble in order, tool calls
//   are displayed (name + arguments) and run against local tools
//   registered on this page, and tool results are appended as plain
//   text. Timeouts and errors surface as plain honest errors
//   in-thread. Nothing is ever invented to fill a gap.
//
// BETTER-THAN-A-PLAIN-MODEL design note (the target this adapter is
// built to grow into; the plug-in points are real, the layers behind
// them are future items, and nothing below is claimed as live):
// A plain chat model answers from weights alone. This brain is meant
// to be better because of the layers around it, none of which a plain
// model has: a persistent internal memory index that remembers what
// was learned and where it came from; a live research agency that
// checks claims against retrieved sources before they are stated;
// a catalog of hundreds of agent patterns to consult as patterns,
// never as running agents; a code library suite for building; and
// a self-build loop that improves the whole system daily from a
// prioritized build list. The adapter exposes exactly two plug-in
// points for those layers, and nothing more: a tools registry
// (registerTool) through which local capabilities reach the model,
// and a memory-context hook (setMemoryContext) whose returned text,
// when non-empty, is prepended to the system prompt. Today the
// registry holds only the page's own local tools, and the memory
// hook returns empty text. When the layers land, they plug in here
// without changing the connection layer. The internal index is never
// named in any visible UI string.
// No em dash characters are used in this file.
(function () {
  'use strict';

  /* ---------------- Pure core (also tested in Node) ---------------- */

  var STORAGE_BASE = 'halex_ai_base';
  var STORAGE_MODEL = 'halex_ai_model';
  var STORAGE_KEY = 'halex_ai_key';
  var DEFAULT_TIMEOUT_MS = 60000;
  var MAX_ROUNDS = 2;

  function trimStr(v) {
    return String(v == null ? '' : v).trim();
  }

  function readStore(store, key) {
    if (!store) return '';
    try {
      if (typeof store.getItem === 'function') return store.getItem(key) || '';
      return store[key] || '';
    } catch (e) {
      return '';
    }
  }

  function getBrainConfig(storeLike) {
    var store = storeLike || null;
    if (!store) {
      try {
        if (typeof localStorage !== 'undefined') store = localStorage;
      } catch (e) {
        store = null;
      }
    }
    return {
      baseUrl: trimStr(readStore(store, STORAGE_BASE)),
      model: trimStr(readStore(store, STORAGE_MODEL)),
      key: readStore(store, STORAGE_KEY)
    };
  }

  function brainConfigured(cfg) {
    if (!cfg) return false;
    return !!(trimStr(cfg.baseUrl) && trimStr(cfg.model) && trimStr(cfg.key));
  }

  function stripTrailingSlash(url) {
    var u = trimStr(url);
    while (u.length > 1 && u.charAt(u.length - 1) === '/') u = u.slice(0, -1);
    return u;
  }

  function buildChatRequest(cfg, messages, stream, tools) {
    var url = stripTrailingSlash(cfg.baseUrl) + '/chat/completions';
    var body = {
      model: cfg.model,
      messages: messages,
      stream: !!stream
    };
    if (tools && tools.length) body.tools = tools;
    return {
      url: url,
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cfg.key
        },
        body: JSON.stringify(body)
      }
    };
  }

  function systemPromptText() {
    return 'You are a general AI built by AI, for everyone and anything. ' +
      'Help with research, writing, building, planning, and any field, ' +
      'in plain language. State what is verified and what is not, and ' +
      'do not invent facts. Hard limits: advisory only, no funds, no ' +
      'wallet keys or seeds, no live trading, no posting on its own, ' +
      'per-action confirmation.';
  }

  function buildMessages(userText, memoryContext) {
    var system = systemPromptText();
    var mem = trimStr(memoryContext || '');
    if (mem) system += '\n\nAdditional context from the local memory index:\n' + mem;
    return [
      { role: 'system', content: system },
      { role: 'user', content: String(userText || '') }
    ];
  }

  /* ---- SSE parsing: pure, order-preserving ---- */

  function parseSSEText(text, state) {
    var st = state || { buffer: '', events: [] };
    var combined = st.buffer + String(text || '');
    var parts = combined.split('\n');
    st.buffer = parts.pop();
    for (var i = 0; i < parts.length; i++) {
      var line = parts[i].replace(/\r$/, '');
      if (line.indexOf('data:') !== 0) continue;
      var payload = line.slice(5).trim();
      if (payload === '[DONE]') {
        st.events.push({ done: true });
        continue;
      }
      var data = null;
      try { data = JSON.parse(payload); } catch (e) { data = null; }
      if (!data) continue;
      var choice = data.choices && data.choices[0] ? data.choices[0] : null;
      if (!choice) continue;
      var ev = { content: '', toolCalls: [], finishReason: choice.finish_reason || null };
      var delta = choice.delta || choice.message || null;
      if (delta) {
        if (typeof delta.content === 'string') ev.content = delta.content;
        var tcs = delta.tool_calls || [];
        for (var j = 0; j < tcs.length; j++) {
          var tc = tcs[j] || {};
          var fn = tc.function || {};
          ev.toolCalls.push({
            index: typeof tc.index === 'number' ? tc.index : j,
            id: tc.id || '',
            name: fn.name || '',
            args: typeof fn.arguments === 'string' ? fn.arguments : ''
          });
        }
      }
      st.events.push(ev);
    }
    return st;
  }

  function mergeToolCallDeltas(list, deltas) {
    for (var i = 0; i < deltas.length; i++) {
      var d = deltas[i];
      var idx = typeof d.index === 'number' ? d.index : list.length;
      var slot = null;
      for (var j = 0; j < list.length; j++) {
        if (list[j].index === idx) { slot = list[j]; break; }
      }
      if (!slot) {
        slot = { index: idx, id: '', name: '', args: '' };
        list.push(slot);
      }
      if (d.id) slot.id = d.id;
      if (d.name) slot.name = d.name;
      if (d.args) slot.args += d.args;
    }
    return list;
  }

  function extractToolArgText(argsJson) {
    var raw = String(argsJson || '');
    if (!raw) return '';
    var parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    if (parsed && typeof parsed === 'object') {
      var keys = ['query', 'input', 'text', 'address', 'topic', 'question'];
      for (var i = 0; i < keys.length; i++) {
        if (typeof parsed[keys[i]] === 'string' && parsed[keys[i]]) return parsed[keys[i]];
      }
      try { return JSON.stringify(parsed); } catch (e) { return raw; }
    }
    return raw;
  }

  /* ---- Tools registry: local capabilities the brain may call ---- */

  function createToolRegistry() {
    var tools = {};
    var order = [];
    return {
      register: function (name, fn, description) {
        var n = trimStr(name);
        if (!n || typeof fn !== 'function') return false;
        if (!tools[n]) order.push(n);
        tools[n] = { fn: fn, description: String(description || '') };
        return true;
      },
      has: function (name) { return !!tools[trimStr(name)]; },
      get: function (name) { return tools[trimStr(name)] || null; },
      list: function () {
        return order.map(function (n) {
          return { name: n, description: tools[n].description };
        });
      },
      definitions: function () {
        return order.map(function (n) {
          return {
            type: 'function',
            function: {
              name: n,
              description: tools[n].description,
              parameters: {
                type: 'object',
                properties: { query: { type: 'string' } },
                required: []
              }
            }
          };
        });
      }
    };
  }

  function defaultToolDescriptions() {
    var ext = null;
    try {
      if (typeof globalThis !== 'undefined' && globalThis.HalexAIExt) ext = globalThis.HalexAIExt;
      else if (typeof window !== 'undefined' && window.HalexAIExt) ext = window.HalexAIExt;
    } catch (e) { ext = null; }
    if (ext && ext.TOOLS) return ext.TOOLS;
    return [
      { name: 'lesson_lookup', description: 'Look up a lesson in the bundled lesson index.' },
      { name: 'brand_guard_check', description: 'Check a domain, handle, or token address against the canonical list.' },
      { name: 'web_research', description: 'Research a topic on the web.' },
      { name: 'build_file', description: 'Build a starter page, doc, report, or script.' },
      { name: 'lookup_token', description: 'Look up a token by contract address or name.' }
    ];
  }

  function defaultToolRegistry() {
    var registry = createToolRegistry();
    var ext = null;
    try {
      if (typeof globalThis !== 'undefined' && globalThis.HalexAIExt) ext = globalThis.HalexAIExt;
      else if (typeof window !== 'undefined' && window.HalexAIExt) ext = window.HalexAIExt;
    } catch (e) { ext = null; }
    defaultToolDescriptions().forEach(function (t) {
      registry.register(t.name, function (argText) {
        if (ext && typeof ext.runToolStub === 'function') {
          try { return String(ext.runToolStub(t.name, argText)); } catch (e) { return 'Tool result (' + t.name + '): the local tool failed to run, so no result is claimed.'; }
        }
        return 'Tool result (' + t.name + '): no local implementation is registered on this page, so nothing was run and nothing is claimed.';
      }, t.description);
    });
    return registry;
  }

  /* ---- One streaming round against the endpoint ---- */

  function decodeChunk(chunk) {
    if (typeof chunk === 'string') return chunk;
    try {
      if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(chunk);
    } catch (e) {}
    return String(chunk || '');
  }

  function runBrainRound(cfg, messages, fetchFn, opts) {
    var o = opts || {};
    var fetchImpl = fetchFn || null;
    if (!fetchImpl) {
      try { if (typeof fetch !== 'undefined') fetchImpl = fetch; } catch (e) { fetchImpl = null; }
    }
    if (!brainConfigured(cfg)) {
      return Promise.resolve({ ok: false, reason: 'not_configured' });
    }
    if (!fetchImpl) {
      return Promise.resolve({ ok: false, reason: 'no_fetch' });
    }
    var tools = o.tools && o.tools.length ? o.tools : null;
    var req = buildChatRequest(cfg, messages, true, tools);
    var controller = null;
    var timeoutId = null;
    var requestOptions = req.options;
    try {
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        requestOptions = {
          method: req.options.method,
          headers: req.options.headers,
          body: req.options.body,
          signal: controller.signal
        };
      }
    } catch (e) { controller = null; }
    var timeoutMs = typeof o.timeoutMs === 'number' ? o.timeoutMs : DEFAULT_TIMEOUT_MS;
    var timedOut = false;
    var fetchPromise = Promise.resolve().then(function () {
      return fetchImpl(req.url, requestOptions);
    });
    var gatedPromise = fetchPromise;
    if (timeoutMs > 0) {
      var timerPromise = new Promise(function (resolve) {
        timeoutId = setTimeout(function () {
          timedOut = true;
          try { if (controller) controller.abort(); } catch (e) {}
          resolve({ __timeout: true });
        }, timeoutMs);
      });
      gatedPromise = Promise.race([fetchPromise, timerPromise]);
    }
    return gatedPromise.then(function (res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!res || res.__timeout || timedOut) {
        return { ok: false, reason: 'timeout' };
      }
      if (!res.ok) {
        return { ok: false, reason: 'http_error', status: res.status || null };
      }
      var text = '';
      var toolCalls = [];
      var finishReason = null;
      function consumeEvents(events) {
        for (var i = 0; i < events.length; i++) {
          var ev = events[i];
          if (ev.done) continue;
          if (ev.content) {
            text += ev.content;
            if (typeof o.onContent === 'function') o.onContent(ev.content);
          }
          if (ev.toolCalls && ev.toolCalls.length) mergeToolCallDeltas(toolCalls, ev.toolCalls);
          if (ev.finishReason) finishReason = ev.finishReason;
        }
      }
      var body = res.body;
      if (body && typeof body.getReader === 'function') {
        var reader = body.getReader();
        var state = { buffer: '', events: [] };
        var readNext = function () {
          return Promise.resolve(reader.read()).then(function (part) {
            if (part.done) {
              if (state.buffer.trim()) {
                parseSSEText('\n', state);
              }
              consumeEvents(state.events);
              state.events = [];
              return { ok: true, text: text, toolCalls: toolCalls, finishReason: finishReason };
            }
            parseSSEText(decodeChunk(part.value), state);
            consumeEvents(state.events);
            state.events = [];
            return readNext();
          });
        };
        return readNext().catch(function (err) {
          if (timedOut) return { ok: false, reason: 'timeout' };
          return { ok: false, reason: 'request_failed', error: err && err.message ? err.message : String(err) };
        });
      }
      if (typeof res.text === 'function') {
        return Promise.resolve(res.text()).then(function (raw) {
          var state = parseSSEText(raw, { buffer: '', events: [] });
          consumeEvents(state.events);
          return { ok: true, text: text, toolCalls: toolCalls, finishReason: finishReason };
        }).catch(function (err) {
          return { ok: false, reason: 'request_failed', error: err && err.message ? err.message : String(err) };
        });
      }
      if (typeof res.json === 'function') {
        return Promise.resolve(res.json()).then(function (data) {
          var choice = data && data.choices && data.choices[0] ? data.choices[0] : null;
          var content = choice && choice.message ? choice.message.content : '';
          if (typeof content === 'string' && content) {
            text += content;
            if (typeof o.onContent === 'function') o.onContent(content);
          }
          return { ok: true, text: text, toolCalls: toolCalls, finishReason: choice ? (choice.finish_reason || null) : null };
        }).catch(function (err) {
          return { ok: false, reason: 'request_failed', error: err && err.message ? err.message : String(err) };
        });
      }
      return { ok: false, reason: 'empty_response' };
    }).catch(function (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (timedOut) return { ok: false, reason: 'timeout' };
      return { ok: false, reason: 'request_failed', error: err && err.message ? err.message : String(err) };
    });
  }

  /* ---- A full turn: at most one tool round, then a final answer ---- */

  var memoryContextFn = null;

  function setMemoryContext(fn) {
    memoryContextFn = (typeof fn === 'function') ? fn : null;
  }

  function runBrainTurn(cfg, userText, fetchFn, opts) {
    var o = opts || {};
    if (!brainConfigured(cfg)) {
      return Promise.resolve({ ok: false, reason: 'not_configured' });
    }
    var registry = o.registry || defaultToolRegistry();
    var memoryFn = o.memoryContext || null;
    var memText = '';
    try { memText = typeof memoryFn === 'function' ? (memoryFn() || '') : ''; } catch (e) { memText = ''; }
    var messages = buildMessages(userText, memText);
    var toolDefs = registry.definitions();
    var shownCalls = [];
    var roundOpts = {
      tools: toolDefs,
      timeoutMs: o.timeoutMs,
      onContent: o.onContent,
      onToolCall: o.onToolCall,
      onToolResult: o.onToolResult
    };
    return runBrainRound(cfg, messages, fetchFn, roundOpts).then(function (first) {
      if (!first.ok) return first;
      var calls = (first.toolCalls || []).filter(function (c) { return !!c.name; });
      if (!calls.length) {
        return { ok: true, text: first.text, toolCalls: [], finishReason: first.finishReason };
      }
      var followMessages = messages.slice();
      followMessages.push({
        role: 'assistant',
        content: first.text || '',
        tool_calls: calls.map(function (c) {
          return {
            id: c.id || ('call-' + c.index),
            type: 'function',
            function: { name: c.name, arguments: c.args }
          };
        })
      });
      var pending = [];
      var chain = Promise.resolve();
      calls.forEach(function (call) {
        chain = chain.then(function () {
          var argText = extractToolArgText(call.args);
          shownCalls.push({ name: call.name, args: argText });
          if (typeof o.onToolCall === 'function') o.onToolCall({ name: call.name, args: argText });
          var tool = registry.get(call.name);
          var resultText = '';
          var exec = null;
          if (tool) {
            try { exec = Promise.resolve(tool.fn(argText)); } catch (e) { exec = Promise.resolve('Tool result (' + call.name + '): the local tool failed to run, so no result is claimed.'); }
          } else {
            exec = Promise.resolve('Tool result (' + call.name + '): no local implementation is registered on this page, so nothing was run and nothing is claimed.');
          }
          return exec.then(function (result) {
            resultText = String(result == null ? '' : result);
            if (typeof o.onToolResult === 'function') o.onToolResult({ name: call.name, args: argText }, resultText);
            followMessages.push({
              role: 'tool',
              tool_call_id: call.id || ('call-' + call.index),
              content: resultText
            });
            pending.push(resultText);
          });
        });
      });
      return chain.then(function () {
        var secondOpts = {
          timeoutMs: o.timeoutMs,
          onContent: o.onContent
        };
        return runBrainRound(cfg, followMessages, fetchFn, secondOpts).then(function (second) {
          if (!second.ok) {
            return { ok: true, text: first.text, toolCalls: shownCalls, toolResults: pending, finishReason: 'tool_calls', note: 'The follow-up brain request failed, so only the tool calls and their results are shown. No final answer was invented.' };
          }
          var extraCalls = (second.toolCalls || []).filter(function (c) { return !!c.name; });
          var note = '';
          if (extraCalls.length) {
            note = 'The brain asked for more tool calls after the first tool round; this page stops after one tool round, so those calls are shown above with no further round run.';
            extraCalls.forEach(function (c) {
              var argText = extractToolArgText(c.args);
              shownCalls.push({ name: c.name, args: argText });
              if (typeof o.onToolCall === 'function') o.onToolCall({ name: c.name, args: argText });
            });
          }
          return { ok: true, text: second.text, toolCalls: shownCalls, toolResults: pending, finishReason: second.finishReason, note: note };
        });
      });
    });
  }

  /* ---- Status text: never includes the key ---- */

  function brainStatusText(cfg) {
    if (!brainConfigured(cfg)) {
      return 'Live brain: not connected. Answers come from the bundled packs on this page. ' +
        'Add an endpoint, model, and key in the Model section above to connect a live brain. ' +
        'Nothing is sent anywhere until you do.';
    }
    return 'Live brain: connected. Endpoint: ' + cfg.baseUrl + ' Model: ' + cfg.model + '. ' +
      'Messages route to that endpoint with streaming. The key stays in this browser ' +
      'and is sent only to that endpoint.';
  }

  function brainErrorText(result) {
    if (!result) return 'The live brain request failed for an unknown reason. No answer was invented. Local packs are still available: wipe the model settings in Settings to return to offline answers.';
    if (result.reason === 'timeout') return 'The live brain request timed out. No answer was invented. Check the endpoint and try again, or wipe the model settings in Settings to return to offline answers.';
    if (result.reason === 'http_error') return 'The live brain endpoint returned an error (HTTP ' + (result.status || 'unknown') + '). No answer was invented. Check the endpoint, model, and key, or wipe the model settings in Settings to return to offline answers.';
    if (result.reason === 'no_fetch') return 'This browser cannot reach a model endpoint, so no brain request was sent. No answer was invented.';
    if (result.reason === 'not_configured') return 'No live brain is configured, so no brain request was sent.';
    return 'The live brain request failed (' + result.reason + '). No answer was invented. Local packs are still available: wipe the model settings in Settings to return to offline answers.';
  }

  var HalexAIBrain = {
    getBrainConfig: getBrainConfig,
    brainConfigured: brainConfigured,
    brainStatusText: brainStatusText,
    brainErrorText: brainErrorText,
    buildChatRequest: buildChatRequest,
    buildMessages: buildMessages,
    parseSSEText: parseSSEText,
    mergeToolCallDeltas: mergeToolCallDeltas,
    extractToolArgText: extractToolArgText,
    createToolRegistry: createToolRegistry,
    defaultToolRegistry: defaultToolRegistry,
    setMemoryContext: setMemoryContext,
    runBrainRound: runBrainRound,
    runBrainTurn: runBrainTurn
  };

  if (typeof window !== 'undefined') window.HalexAIBrain = HalexAIBrain;
  if (typeof globalThis !== 'undefined') globalThis.HalexAIBrain = HalexAIBrain;
  if (typeof module !== 'undefined' && module.exports) module.exports = HalexAIBrain;

  /* ---------------- Browser wiring (DOM only) ---------------- */
  if (typeof document === 'undefined') return;

  function $(id) { return document.getElementById(id); }

  var inFlight = false;

  function refreshBrainStatus() {
    var el = $('brain-status');
    if (!el) return;
    el.textContent = brainStatusText(getBrainConfig());
  }

  function scrollLog() {
    var log = $('ext-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function buildBubble(text, cls, label) {
    var d = document.createElement('div');
    d.className = 'ext-msg ' + cls;
    if (label) {
      var tag = document.createElement('div');
      tag.className = 'ext-source';
      tag.textContent = label;
      d.appendChild(tag);
    }
    var body = document.createElement('div');
    body.textContent = text;
    d.appendChild(body);
    return { node: d, body: body };
  }

  function removeThinkingClone(clone) {
    if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
  }

  function brainSendFlow(text) {
    var log = $('ext-log');
    var q = $('ext-q');
    if (!log) return;
    var user = buildBubble(text, 'ext-msg-user', 'You');
    log.appendChild(user.node);
    if (q) q.value = '';
    scrollLog();
    var thinkEl = null;
    var tpl = $('thinking-module');
    if (tpl && tpl.content) {
      var frag = tpl.content.cloneNode(true);
      thinkEl = frag.querySelector('.thinking-module');
      if (thinkEl) {
        log.appendChild(frag);
        scrollLog();
      }
    }
    inFlight = true;
    var cfg = getBrainConfig();
    var bubble = null;
    var bodyEl = null;
    function ensureBubble() {
      if (bubble) return;
      var made = buildBubble('', 'ext-msg-ai', 'Live brain');
      bubble = made.node;
      bodyEl = made.body;
      log.appendChild(bubble);
      scrollLog();
    }
    function appendToolBlock(kind, name, argsText, resultText) {
      ensureBubble();
      var block = document.createElement('div');
      block.className = 'brain-tool-block';
      var head = document.createElement('div');
      head.className = 'brain-tool-head';
      head.textContent = kind === 'call'
        ? 'Tool call: ' + name
        : 'Tool result (' + name + ')';
      block.appendChild(head);
      var body = document.createElement('div');
      body.className = 'brain-tool-body';
      body.textContent = kind === 'call' ? argsText : resultText;
      block.appendChild(body);
      bubble.appendChild(block);
      scrollLog();
    }
    var fetchFn = null;
    try { if (typeof fetch !== 'undefined') fetchFn = fetch.bind(window); } catch (e) { fetchFn = null; }
    runBrainTurn(cfg, text, fetchFn, {
      memoryContext: memoryContextFn,
      onContent: function (chunk) {
        ensureBubble();
        if (bodyEl) bodyEl.textContent += chunk;
        scrollLog();
      },
      onToolCall: function (call) {
        appendToolBlock('call', call.name, call.args, '');
      },
      onToolResult: function (call, result) {
        appendToolBlock('result', call.name, '', result);
      }
    }).then(function (result) {
      removeThinkingClone(thinkEl);
      inFlight = false;
      if (!result || !result.ok) {
        var err = buildBubble(brainErrorText(result), 'ext-msg-tool', 'Live brain error');
        log.appendChild(err.node);
        scrollLog();
        return;
      }
      if (result.note) {
        ensureBubble();
        var note = document.createElement('div');
        note.className = 'brain-tool-body';
        note.textContent = result.note;
        bubble.appendChild(note);
        scrollLog();
      }
      if (!bubble) {
        if (result.text) {
          ensureBubble();
          if (bodyEl) bodyEl.textContent = result.text;
        } else {
          var empty = buildBubble('The live brain returned an empty answer. No answer was invented.', 'ext-msg-tool', 'Live brain error');
          log.appendChild(empty.node);
        }
        scrollLog();
      }
    }).catch(function () {
      removeThinkingClone(thinkEl);
      inFlight = false;
      var err = buildBubble(brainErrorText({ reason: 'request_failed' }), 'ext-msg-tool', 'Live brain error');
      log.appendChild(err.node);
      scrollLog();
    });
  }

  function initAdapter() {
    refreshBrainStatus();
    var saveBtn = $('ext-save');
    if (saveBtn) saveBtn.addEventListener('click', function () { setTimeout(refreshBrainStatus, 0); });
    var wipeBtn = $('ext-wipe');
    if (wipeBtn) wipeBtn.addEventListener('click', function () { setTimeout(refreshBrainStatus, 0); });
    var gearBtn = $('settings-toggle');
    if (gearBtn) gearBtn.addEventListener('click', function () { setTimeout(refreshBrainStatus, 0); });

    var panel = $('panel-chat');
    if (!panel) return;
    // Capture phase on the panel runs before the page's own send
    // handlers. The math handler in the page shell runs first and
    // stops math sends, so this adapter never sees them. When no
    // brain is configured this listener does nothing and the page's
    // own handlers answer locally, exactly as before.
    panel.addEventListener('click', function (e) {
      if (!e.target || e.target.id !== 'ext-send') return;
      var q = $('ext-q');
      var text = q ? q.value.trim() : '';
      if (!text) return;
      if (!brainConfigured(getBrainConfig())) return;
      e.preventDefault();
      e.stopPropagation();
      if (inFlight) return;
      brainSendFlow(text);
    }, true);
    panel.addEventListener('keydown', function (e) {
      if (!e.target || e.target.id !== 'ext-q') return;
      if (e.key !== 'Enter' || e.shiftKey) return;
      var text = e.target.value.trim();
      if (!text) return;
      if (!brainConfigured(getBrainConfig())) return;
      e.preventDefault();
      e.stopPropagation();
      if (inFlight) return;
      brainSendFlow(text);
    }, true);
  }

  // Public hooks for future layers: the tools registry and the memory
  // context hook live on the exported object. Both are optional and
  // default to local-only behavior.

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdapter);
  } else {
    initAdapter();
  }
})();
