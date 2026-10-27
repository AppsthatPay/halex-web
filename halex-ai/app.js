// HALEX AI staging v0.2 — Allen modeled as software, on a limited scale.
// Plain JavaScript agent loop. Not Allen, no Allen memory or authority.
// Advisory only. No trading, no keys, no posting. Read-only public APIs only.
// Model key, if supplied, lives only in this browser's localStorage.
(function () {
  'use strict';
  var logEl = document.getElementById('log');
  var qEl = document.getElementById('q');
  var queueEl = document.getElementById('queueList');
  var modelStatus = document.getElementById('modelStatus');

  function addMsg(text, cls) {
    var d = document.createElement('div');
    d.className = 'msg ' + (cls || 'ai');
    d.textContent = text;
    logEl.appendChild(d);
    logEl.scrollIntoView(false);
    return d;
  }
  function toolMsg(text) { return addMsg(text, 'tool'); }

  function getModel() {
    try {
      return {
        baseUrl: localStorage.getItem('halex_ai_base') || '',
        model: localStorage.getItem('halex_ai_model') || '',
        key: localStorage.getItem('halex_ai_key') || ''
      };
    } catch (e) { return { baseUrl: '', model: '', key: '' }; }
  }
  function refreshModelStatus() {
    var m = getModel();
    modelStatus.textContent = m.key && m.baseUrl && m.model
      ? 'Model: connected in this browser only (key stored locally, never in the repo).'
      : 'Model: offline HALEX mode. No key stored.';
    document.getElementById('baseUrl').value = m.baseUrl;
    document.getElementById('modelName').value = m.model;
  }
  function getQueue() {
    try { return JSON.parse(localStorage.getItem('halex_ai_queue') || '[]'); }
    catch (e) { return []; }
  }
  function saveQueue(q) {
    try { localStorage.setItem('halex_ai_queue', JSON.stringify(q)); } catch (e) {}
    renderQueue();
  }
  function renderQueue() {
    var q = getQueue();
    if (!q.length) { queueEl.textContent = 'Queue is empty.'; return; }
    queueEl.textContent = q.map(function (t, i) {
      return (i + 1) + '. [' + t.status + '] ' + t.title + ' — ' + t.detail;
    }).join('\n');
  }

  var KNOWLEDGE = [
    ['token dna', 'Token DNA, in plain words: every token gets a profile with 7 parts. Type (memecoin, utility, AI, DeFi, or impersonation risk). Birth (where it launched, pool type, birth time). Deployer lineage (that wallet\'s age, past launches, rug rate). Tracebacks (who funded the deployer). Custody (LP burned, locked, or held by the deployer). Family (same-name copycats, original vs respin, cross-chain swarm). Use case (claimed purpose, or none found). Custody is the sharpest part: burned means never pullable, locked means safer for a set time, deployer-held means pullable at will.'],
    ['custody', 'Custody in plain words: burned LP means the liquidity tokens are destroyed, so nobody can pull the pool. Locked LP means locked in a locker for a set time. Deployer-held LP means the deployer still holds it and can pull it at will. That last one is a hard warning, not a buy signal.'],
    ['brand guard', 'Brand Guard, in plain words: HALEX watches for clones and fakes. Real HALEX spots are @HALEXApp, the HALEX-M page, and Linktree betasyndicate.com. No official HALEX token is minted yet, so any live HALEX token CA is suspect by default. A hit is staged as suspected, then under review, then confirmed only after Jeffrey confirms it. Never post a public accusation from a suspected hit alone.'],
    ['what is halex', 'HALEX is Advanced Blockchain Intelligence. HALEX-M is the token research terminal: live feeds, Token DNA, APEX² Research, and Chaintarium. HALEX AI is a separate assistant program built from open components. It answers, explains, drafts, and queues tasks. It never trades, never holds keys, and never posts on its own.'],
    ['fund the trades', 'Fund the Trades, in plain words: people can fund small live trading rounds so HALEX skills learn on real trades. Paper first, gate first, honest measured win rates, no returns promised. A funder who comments a trigger phrase can get a new wallet created for them, but no funds go back until Jeffrey approves that return in the main chat. No key is ever shared.'],
    ['halex ai', 'HALEX AI is Allen modeled as software, on a limited scale. It is NOT Allen, does not have Allen\'s memory or authority, and is not a copy of any proprietary assistant. It works like Allen in miniature: collaborate, research first and read back before building, build pages, docs, reports and scripts, ask before external posts or destructive changes, and queue tasks for Allen on every refill. Primary model route: a hosted open-weight frontier model (Kimi K3 recommended, via Together AI or Fireworks AI, exact model ID confirmed at the host). Fallback: DeepSeek V4.1 Flash. Offline mode, which this page runs today, uses HALEX knowledge and read-only tools with no model at all. The upgrade loop: HALEX AI queues tasks, Allen reviews them, patches the code, bumps the version, and pushes a new version, and HALEX AI runs it.'],
    ['workflows', 'HALEX AI workflows, modeled after Allen: (1) Research first, read back before building. (2) Collaborate in the open, show plan, tools, and result. (3) Build pages, docs, reports, scripts and small apps as downloadable starters. (4) Trade gates as advisory warnings only, never a trade. (5) Brand Guard staging: suspected, under review, confirmed only after Jeffrey confirms. (6) HALEX build process: staging first, verify, publish only on approval. (7) Task queue and refill handoff to Allen. Full list: SKILLS.md in the staging folder.']
  ];

  function knowledgeAnswer(text) {
    var low = text.toLowerCase();
    for (var i = 0; i < KNOWLEDGE.length; i++) {
      if (low.indexOf(KNOWLEDGE[i][0]) !== -1) return KNOWLEDGE[i][1];
    }
    return null;
  }

  function fmtPair(p) {
    var info = p.info || {};
    var webs = (info.websites || []).map(function (w) { return w.url || w.label || ''; }).filter(Boolean).join(', ');
    var socials = (info.socials || []).map(function (s) { return (s.type || '') + ': ' + (s.url || ''); }).join(', ');
    return 'Pair: ' + (p.chainId || '?') + ' ' + (p.baseToken ? p.baseToken.symbol : '?') + '/' + (p.quoteToken ? p.quoteToken.symbol : '?') +
      '\nPrice USD: ' + (p.priceUsd || 'unknown') +
      '\nLiquidity USD: ' + (p.liquidity ? p.liquidity.usd : 'unknown') +
      '\nMarket cap: ' + (p.marketCap || p.fdv || 'unknown') +
      '\nBuys/sells (24h): ' + (p.txns && p.txns.h24 ? p.txns.h24.buys + '/' + p.txns.h24.sells : 'unknown') +
      '\nWebsites: ' + (webs || 'none found') +
      '\nSocials: ' + (socials || 'none found') +
      '\nDex: ' + (p.dexId || 'unknown') + ' — Pair address: ' + (p.pairAddress || 'unknown');
  }

  async function lookupToken(query) {
    query = (query || '').trim();
    if (!query) return 'No token address or name given. Type: lookup token 0x... or lookup token NAME.';
    toolMsg('Tool: lookup_token — checking DexScreener for: ' + query);
    try {
      var url = /^0x[0-9a-fA-F]{40}$/.test(query)
        ? 'https://api.dexscreener.com/latest/dex/tokens/' + query
        : 'https://api.dexscreener.com/latest/dex/search?q=' + encodeURIComponent(query);
      var res = await fetch(url);
      if (!res.ok) return 'DexScreener returned HTTP ' + res.status + '. That can mean the token is unindexed there, not that it does not exist. Try again later, and do not treat a missing DexScreener result as a clean bill of health.';
      var data = await res.json();
      var pairs = data.pairs || [];
      if (!pairs.length) return 'DexScreener found no live pairs for: ' + query + '. That means unindexed or no live pair on that route, not proof the token is safe or fake. Check the official project channel before trusting any same-ticker pair.';
      var top = pairs.slice(0, 3).map(fmtPair).join('\n---\n');
      return 'DexScreener result for: ' + query + '\n' + top +
        '\n\nNote: DexScreener liquidity can be stale. Custody (burned, locked, or deployer-held) is a separate chain check, and this lookup alone is not a buy verdict.';
    } catch (e) {
      return 'Lookup failed in this browser (' + e.message + '). DexScreener may be blocking this browser or offline. No data was invented.';
    }
  }

  function brandGuardCheck(input) {
    input = (input || '').trim();
    toolMsg('Tool: brand_guard_check — comparing against the canonical HALEX list: ' + input);
    var low = input.toLowerCase();
    var canonical = ['halexapp', 'appsthatpay.github.io/halex-web/halex-m', 'linktr.ee/betasyndicate.com', 'betasyndicate.com'];
    var isCanonical = canonical.some(function (c) { return low.indexOf(c) !== -1; });
    if (isCanonical) return 'Matches a canonical HALEX spot. Real HALEX spots: @HALEXApp, the HALEX-M page, and Linktree betasyndicate.com. This check alone does not prove a linked page is safe; check the exact URL, not just the name.';
    if (low.indexOf('halexrtrade.online') !== -1) return 'SUSPECTED, not confirmed. halexrtrade.online is NOT ours. At last check (2026-10-27) it returned only Account Suspended, so it was not live then. It stays on watch as suspected. If it comes back live, run full ownership checks and report to Jeffrey before any public post. Do not call it an operating scam while it is suspended.';
    if (low.indexOf('halex') !== -1) return 'SUSPECTED, needs ownership checks. Anything using the HALEX name, logo, or a HALEX token CA that is not on the canonical list above must be checked: domain control, logo match, copied HALEX-M copy, fake download or wallet-connect buttons, and any token CA shown. Remember: no official HALEX token is minted yet, so any live HALEX token CA is suspect by default. Stage: suspected. No public accusation from this check alone.';
    return 'No HALEX name found in that input, so this is not a HALEX clone check. Give me a domain, handle, or token CA that uses the HALEX name.';
  }

  function draftPost(topic) {
    topic = (topic || 'HALEX').trim();
    toolMsg('Tool: draft_post — drafting only, nothing posted.');
    return 'Draft (not posted, needs your approval before anything goes out):\n\nCrypto trading is noisy. Base blockchain traders need clear signals, not hype. HALEX Advanced Blockchain Intelligence reads the chain itself, checks custody and copycats, and shows the work. That is what HALEX-M is building, in the open, in development now. Topic: ' + topic + '.\n\nWant a shorter version, or one for a specific token? Tell me the token and I will draft from its actual data, not from a template.';
  }

  function listWorkflows() {
    toolMsg('Tool: list_workflows — Allen-modeled skill library.');
    return 'HALEX AI workflows:\n1. Research first, read back before building.\n2. Collaborate in the open.\n3. Build pages, docs, reports, scripts, small apps (downloadable starters).\n4. Trade gates, advisory only, never a trade.\n5. Brand Guard staging.\n6. HALEX build process: staging first, verify, publish only on approval.\n7. Task queue and refill handoff to Allen.\n\nAsk: build a page about X, or build a report about Y, and I will first read back a short plan, then build a starter file you can download.';
  }

  function buildFile(kind, topic) {
    kind = (kind || 'doc').toLowerCase();
    topic = (topic || 'HALEX').trim();
    // Research read-back first, per the Allen-modeled workflow.
    var plan = 'Research read-back before building:\n- Topic: ' + topic + '\n- Type: ' + kind + '\n- What it will do: explain ' + topic + ' in plain English, with HALEX context, and no invented prices, addresses, or links.\n- What it will NOT do: trade, move funds, hold keys, post to X, or claim to be live.\n- What is unverified: any token data in it, unless you give me a contract address to look up first.';
    toolMsg('Tool: build_file — research read-back done, building a ' + kind + ' starter.');
    var body = '';
    if (kind.indexOf('page') !== -1) {
      body = '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8">\n<title>' + topic + '</title></head>\n<body>\n<h1>' + topic + '</h1>\n<p>HALEX AI starter page. Built in staging, not published. Advisory only.</p>\n<p>Topic: ' + topic + '. Add verified facts before publishing.</p>\n</body>\n</html>\n';
    } else if (kind.indexOf('script') !== -1) {
      body = '# HALEX AI starter script: ' + topic + '\n# Advisory only. Read-only by design. No keys, no trades, no sends.\nprint("Topic: ' + topic.replace(/"/g, '') + '")\nprint("Verify every fact before using this.")\n';
    } else {
      body = '# ' + topic + '\n\nHALEX AI starter ' + kind + '. Built in staging, not published.\n\n## What this covers\n- Plain-English explanation of ' + topic + '.\n- What is verified, and what is not.\n\n## Limits\nAdvisory only. No funds, no keys, no live trading. Verify every fact before publishing.\n';
    }
    var ext = kind.indexOf('page') !== -1 ? 'html' : kind.indexOf('script') !== -1 ? 'py' : 'md';
    var blob = new Blob([body], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'halex-ai-' + kind + '. ' + ext;
    a.download = 'halex-ai-' + kind + '.' + ext;
    a.click();
    URL.revokeObjectURL(a.href);
    return plan + '\n\nBuilt and downloaded a starter ' + kind + ' file for: ' + topic + '. It is a starter, not a live deployment. Review it, add verified facts, and only then ask Allen to publish it.';
  }

  function queueTask(title, detail) {
    var q = getQueue();
    var t = {
      id: 'task-' + Date.now(),
      title: title || 'HALEX AI task',
      detail: detail || '',
      status: 'open',
      created_by: 'halex-ai',
      created_at: new Date().toISOString()
    };
    q.push(t);
    saveQueue(q);
    toolMsg('Tool: queue_task — queued: ' + t.title);
    return 'Queued for Allen review: ' + t.title + '. Download the queue JSON to hand it over. Nothing is built or posted from a queue item until Jeffrey approves it.';
  }

  function toolsForModel() {
    return [
      { type: 'function', function: { name: 'lookup_token', description: 'Look up a token on DexScreener by contract address or name.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
      { type: 'function', function: { name: 'brand_guard_check', description: 'Check a domain, handle or token CA against the canonical HALEX list.', parameters: { type: 'object', properties: { input: { type: 'string' } }, required: ['input'] } } },
      { type: 'function', function: { name: 'queue_task', description: 'Queue a task for Allen review.', parameters: { type: 'object', properties: { title: { type: 'string' }, detail: { type: 'string' } }, required: ['title'] } } },
      { type: 'function', function: { name: 'list_workflows', description: 'List the Allen-modeled workflow library.', parameters: { type: 'object', properties: {} } } },
      { type: 'function', function: { name: 'build_file', description: 'Research read-back first, then build a downloadable starter page, doc, report, or script. Never a live deployment.', parameters: { type: 'object', properties: { kind: { type: 'string' }, topic: { type: 'string' } }, required: ['kind', 'topic'] } } }
    ];
  }

  async function runTool(name, args) {
    if (name === 'lookup_token') return await lookupToken(args.query);
    if (name === 'brand_guard_check') return brandGuardCheck(args.input);
    if (name === 'queue_task') return queueTask(args.title, args.detail);
    if (name === 'list_workflows') return listWorkflows();
    if (name === 'build_file') return buildFile(args.kind, args.topic);
    return 'Unknown tool: ' + name;
  }

  async function modelAnswer(text) {
    var m = getModel();
    var system = 'You are HALEX AI, Allen modeled as software on a limited scale. You are NOT Allen, you do not have Allen\'s memory or authority, and you are not a copy of any proprietary assistant. Follow the Allen-modeled workflows: research first and read back before building, collaborate in the open, ask before external posts or destructive changes, and queue tasks for Allen review. Advisory only. Never move funds, hold keys, trade live, or post to X. Use the provided tools for token lookups, Brand Guard checks, workflows, builds, and queueing tasks. Plain English, no em dash, no invented prices or addresses. Say what is verified and what is not.';
    var messages = [{ role: 'system', content: system }, { role: 'user', content: text }];
    for (var round = 0; round < 3; round++) {
      var res = await fetch(m.baseUrl.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + m.key },
        body: JSON.stringify({ model: m.model, messages: messages, tools: toolsForModel(), tool_choice: 'auto' })
      });
      if (!res.ok) throw new Error('Model API returned HTTP ' + res.status);
      var data = await res.json();
      var choice = data.choices && data.choices[0] ? data.choices[0].message : null;
      if (!choice) throw new Error('Model returned no message.');
      messages.push(choice);
      var calls = choice.tool_calls || [];
      if (!calls.length) return choice.content || '(Model returned an empty answer.)';
      for (var i = 0; i < calls.length; i++) {
        var fn = calls[i].function;
        var args = {};
        try { args = JSON.parse(fn.arguments || '{}'); } catch (e) {}
        var out = await runTool(fn.name, args);
        toolMsg('Tool result (' + fn.name + '): ' + out);
        messages.push({ role: 'tool', tool_call_id: calls[i].id, content: out });
      }
    }
    return 'Tool loop reached its 3-round cap. The tool results above are the verified part; ask again for a summary if needed.';
  }

  async function localAnswer(text) {
    var low = text.toLowerCase();
    var addr = text.match(/0x[0-9a-fA-F]{40}/);
    if (low.indexOf('lookup') !== -1 || addr) {
      var q = addr ? addr[0] : text.replace(/lookup token/i, '').trim();
      return await lookupToken(q);
    }
    if (low.indexOf('brand guard') !== -1 || low.indexOf('halexrtrade') !== -1 || low.indexOf('clone') !== -1) {
      return brandGuardCheck(text);
    }
    if (low.indexOf('draft') !== -1) {
      return draftPost(text.replace(/draft( a post about)?/i, '').trim());
    }
    if (low.indexOf('workflow') !== -1) {
      return listWorkflows();
    }
    if (low.indexOf('build') !== -1) {
      var kind = 'doc';
      if (low.indexOf('page') !== -1) kind = 'page';
      else if (low.indexOf('script') !== -1) kind = 'script';
      else if (low.indexOf('report') !== -1) kind = 'report';
      var topic = text.replace(/build (a )?(page|doc|report|script)?( about)?/i, '').trim() || 'HALEX';
      return buildFile(kind, topic);
    }
    var k = knowledgeAnswer(text);
    if (k) return k;
    return 'HALEX AI (offline mode): I work like Allen on a limited scale. I can help with HALEX questions, Token DNA, custody, Brand Guard, token lookups, drafts, builds, workflows, and queueing tasks for Allen. Try one of these:\n- explain Token DNA\n- lookup token 0x...\n- brand guard halexrtrade.online\n- draft a post about HALEX Chain\n- build a page about HALEX Chain\n- show workflows\n\nIf you add a model API key in the Model API slot below, I can also answer open questions with a hosted open model. I never trade, hold keys, or post on my own. I am not Allen and I do not have Allen\'s memory or authority.';
  }

  async function handleAsk() {
    var text = qEl.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    qEl.value = '';
    var m = getModel();
    try {
      var ans;
      if (m.key && m.baseUrl && m.model) {
        toolMsg('Plan: using the connected hosted model with HALEX tools.');
        ans = await modelAnswer(text);
      } else {
        toolMsg('Plan: offline HALEX mode (no model key). Using knowledge and read-only tools.');
        ans = await localAnswer(text);
      }
      addMsg(ans, 'ai');
    } catch (e) {
      addMsg('Model call failed (' + e.message + '). Falling back to offline HALEX mode.\n' + 'Tip: check the base URL, model ID, and key in the Model API slot. The key stays in this browser only.', 'ai');
      try { addMsg(await localAnswer(text), 'ai'); } catch (e2) { addMsg('Offline fallback also failed: ' + e2.message, 'ai'); }
    }
  }

  document.getElementById('send').addEventListener('click', handleAsk);
  qEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  });
  document.getElementById('queueBtn').addEventListener('click', function () {
    var text = qEl.value.trim() || 'HALEX AI task';
    addMsg(queueTask(text, 'Queued from the HALEX AI staging page.'), 'ai');
  });
  document.getElementById('downloadBtn').addEventListener('click', function () {
    var payload = { program: 'halex-ai', version: '0.2-staging', framing: 'Allen modeled as software, on a limited scale. Not Allen, no Allen memory or authority, no Muse copy.', tasks: getQueue(), notes: ['Advisory only. Nothing in this queue is approved until Jeffrey approves it.'] };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'halex-ai-queue.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('clearBtn').addEventListener('click', function () {
    try { localStorage.removeItem('halex_ai_queue'); localStorage.removeItem('halex_ai_key'); localStorage.removeItem('halex_ai_base'); localStorage.removeItem('halex_ai_model'); } catch (e) {}
    logEl.innerHTML = '';
    renderQueue();
    refreshModelStatus();
    addMsg('Cleared chat, queue, and model settings in this browser.', 'ai');
  });
  document.getElementById('saveModel').addEventListener('click', function () {
    try {
      localStorage.setItem('halex_ai_base', document.getElementById('baseUrl').value.trim());
      localStorage.setItem('halex_ai_model', document.getElementById('modelName').value.trim());
      localStorage.setItem('halex_ai_key', document.getElementById('apiKey').value);
    } catch (e) {}
    refreshModelStatus();
    addMsg('Model settings saved in this browser only. Never paste a wallet seed or private key here.', 'ai');
  });
  document.getElementById('wipeModel').addEventListener('click', function () {
    try { localStorage.removeItem('halex_ai_key'); localStorage.removeItem('halex_ai_base'); localStorage.removeItem('halex_ai_model'); } catch (e) {}
    document.getElementById('apiKey').value = '';
    refreshModelStatus();
    addMsg('Model key and settings wiped from this browser.', 'ai');
  });

  refreshModelStatus();
  renderQueue();
  addMsg('HALEX AI staging v0.2 is ready. Allen modeled as software, on a limited scale, not Allen himself. Offline HALEX mode works now, no key needed. Ask about Token DNA, look up a token, check Brand Guard, draft a post, build a page, show workflows, or queue a task for Allen.', 'ai');
})();
