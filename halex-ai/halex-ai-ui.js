// HALEX-AI workspace UI wiring: chat glue, agent identity, thinking module,
// heartbeat sidebar for the live ZINIUM chain, and Halifact downloads.
// Chat machinery itself runs on halex-ai-ext.js with knowledge.js (unchanged).
// Plain script, no modules, no third-party code. No em dash characters are used.
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function truncate(text, n) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '...' : s;
  }
  function scrollLog() {
    var log = $('ext-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  /* ---------------- Math: hand-written recursive descent parser ----------------
     No dynamic code execution anywhere: input is tokenized character by
     character and anything that is not a number, a known operator, or a
     parenthesis makes the whole input "not math", so normal questions fall
     through to the knowledge lookup untouched. */
  function tokenizeMath(s) {
    var tokens = [];
    var i = 0;
    while (i < s.length) {
      var c = s.charAt(i);
      if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
      if ((c >= '0' && c <= '9') || c === '.') {
        var j = i;
        var dot = false;
        var digit = false;
        while (j < s.length) {
          var d = s.charAt(j);
          if (d >= '0' && d <= '9') { digit = true; j++; }
          else if (d === '.' && !dot) { dot = true; j++; }
          else break;
        }
        if (!digit) return null;
        tokens.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
        i = j;
        continue;
      }
      if ('+-*/%^()'.indexOf(c) !== -1) { tokens.push({ t: c }); i++; continue; }
      return null;
    }
    return tokens;
  }

  function parseMathTokens(tokens) {
    var pos = 0;
    var ops = 0;
    function peek() { return pos < tokens.length ? tokens[pos] : null; }
    function parseExpr() {
      var v = parseTerm();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = tokens[pos++].t;
        ops++;
        var r = parseTerm();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function parseTerm() {
      var v = parseUnary();
      while (peek() && (peek().t === '*' || peek().t === '/' || peek().t === '%')) {
        var op = tokens[pos++].t;
        ops++;
        var r = parseUnary();
        if (op === '*') v = v * r;
        else if (op === '/') v = v / r;
        else v = v % r;
      }
      return v;
    }
    function parseUnary() {
      var tk = peek();
      if (tk && tk.t === '-') { pos++; return -parseUnary(); }
      if (tk && tk.t === '+') { pos++; return parseUnary(); }
      return parsePower();
    }
    function parsePower() {
      var base = parsePrimary();
      if (peek() && peek().t === '^') {
        pos++;
        ops++;
        var exp = parseUnary();
        return Math.pow(base, exp);
      }
      return base;
    }
    function parsePrimary() {
      var tk = peek();
      if (!tk) throw new Error('unexpected end of expression');
      if (tk.t === 'num') { pos++; return tk.v; }
      if (tk.t === '(') {
        pos++;
        var v = parseExpr();
        if (!peek() || peek().t !== ')') throw new Error('missing close parenthesis');
        pos++;
        return v;
      }
      throw new Error('unexpected token');
    }
    var value = parseExpr();
    if (pos !== tokens.length) throw new Error('trailing tokens');
    return { value: value, ops: ops };
  }

  function runMathTokens(s) {
    var tokens = tokenizeMath(s);
    if (!tokens || !tokens.length) return null;
    try {
      return parseMathTokens(tokens);
    } catch (e) {
      return null;
    }
  }

  function formatNumber(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    if (n === 0) return '0';
    var r = Math.round(n * 1e12) / 1e12;
    return String(r);
  }

  function finishMath(exprText, value) {
    if (typeof value !== 'number' || !isFinite(value)) {
      return { expr: exprText, value: value, finite: false, resultText: '', text: exprText + ' = no finite result' };
    }
    var resultText = formatNumber(value);
    return { expr: exprText, value: value, finite: true, resultText: resultText, text: exprText + ' = ' + resultText };
  }

  // Returns a result object when the whole input is a math expression,
  // or null when any part of it is not math.
  function tryMath(raw) {
    var s = String(raw || '').trim();
    if (!s) return null;
    s = s.replace(/\?+\s*$/, '').replace(/=\s*$/, '').trim();
    var low = s.toLowerCase();
    var prefixes = ['what is ', "what's ", 'calculate ', 'compute ', 'solve ', 'how much is '];
    for (var p = 0; p < prefixes.length; p++) {
      if (low.indexOf(prefixes[p]) === 0) {
        s = s.slice(prefixes[p].length).trim();
        low = s.toLowerCase();
        break;
      }
    }
    if (!s) return null;
    var pct = s.match(/^(-?\d+(?:\.\d+)?)\s*%\s*of\s+(.+)$/i);
    if (pct) {
      var inner = runMathTokens(pct[2]);
      if (!inner) return null;
      return finishMath(s, (parseFloat(pct[1]) / 100) * inner.value);
    }
    var parsed = runMathTokens(s);
    if (!parsed || parsed.ops < 1) return null;
    return finishMath(s, parsed.value);
  }

  /* ---------------- Agent identity ---------------- */
  var AGENT_NAME_KEY = 'halex_ai_agent_name';
  var AGENT_AVATAR_KEY = 'halex_ai_agent_avatar';
  var agentName = 'Assistant';
  var agentAvatar = 'logo';

  var AVATAR_OPTIONS = [
    { id: 'logo', label: 'Official logo' },
    { id: 'orb-gold', label: 'Gold oracle' },
    { id: 'orb-teal', label: 'Teal oracle' },
    { id: 'shield', label: 'Gold shield' },
    { id: 'initial', label: 'Initial' }
  ];

  function svgMarkup(id) {
    if (id === 'orb-gold') {
      return '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="none" stroke="#d4af37" stroke-width="2.5"/><circle cx="24" cy="24" r="9" fill="none" stroke="#f0d98c" stroke-width="2"/><circle cx="24" cy="24" r="2.6" fill="#f0d98c"/></svg>';
    }
    if (id === 'orb-teal') {
      return '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="none" stroke="#2dd4bf" stroke-width="2.5"/><circle cx="24" cy="24" r="9" fill="none" stroke="#5aa9ff" stroke-width="2"/><circle cx="24" cy="24" r="2.6" fill="#2dd4bf"/></svg>';
    }
    if (id === 'shield') {
      return '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><path d="M24 4 L40 10 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V10 Z" fill="rgba(212,175,55,.14)" stroke="#d4af37" stroke-width="2.5"/><text x="24" y="31" text-anchor="middle" font-size="17" font-weight="800" fill="#f0d98c">H</text></svg>';
    }
    return '';
  }

  function applyAvatarTo(el, value) {
    if (!el) return;
    var v = value || agentAvatar;
    el.innerHTML = '';
    el.setAttribute('data-avatar', v && v.indexOf('data:') === 0 ? 'custom' : v);
    if (v === 'logo') {
      var brand = $('brand-logo');
      var img = document.createElement('img');
      img.alt = '';
      img.src = brand ? brand.src : '';
      el.appendChild(img);
    } else if (v && v.indexOf('data:') === 0) {
      var up = document.createElement('img');
      up.alt = '';
      up.src = v;
      el.appendChild(up);
    } else if (v === 'initial') {
      var d = document.createElement('span');
      d.className = 'avatar-initial';
      d.textContent = (agentName || 'H').trim().charAt(0).toUpperCase() || 'H';
      el.appendChild(d);
    } else {
      el.innerHTML = svgMarkup(v);
    }
  }

  function markAvatarOptions() {
    var box = $('agent-avatar-options');
    if (!box) return;
    var buttons = box.querySelectorAll('.avatar-option');
    buttons.forEach(function (btn) {
      var on = btn.getAttribute('data-avatar-id') === agentAvatar;
      btn.classList.toggle('sel', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var note = $('agent-avatar-note');
    if (note && agentAvatar && agentAvatar.indexOf('data:') === 0) {
      note.textContent = 'A custom uploaded image is in use as the profile picture.';
    }
  }

  function refreshAgentSurfaces() {
    var head = $('chat-agent-avatar');
    if (head) applyAvatarTo(head);
    document.querySelectorAll('#ext-log .agent-avatar').forEach(function (el) { applyAvatarTo(el); });
    document.querySelectorAll('#ext-log .agent-name').forEach(function (el) { el.textContent = agentName; });
    document.querySelectorAll('.thinking-agent').forEach(function (el) { el.textContent = agentName; });
    markAvatarOptions();
  }

  function setAgentName(value, sourceEl) {
    var v = String(value || '').trim() || 'Assistant';
    agentName = v;
    try { localStorage.setItem(AGENT_NAME_KEY, v); } catch (e) {}
    var head = $('agent-name');
    var setting = $('agent-name-setting');
    if (head && head !== sourceEl) head.value = v;
    if (setting && setting !== sourceEl) setting.value = v;
    refreshAgentSurfaces();
  }

  function setAgentAvatar(value) {
    agentAvatar = value;
    var stored = true;
    try { localStorage.setItem(AGENT_AVATAR_KEY, value); } catch (e) { stored = false; }
    var note = $('agent-avatar-note');
    if (note) {
      note.textContent = stored
        ? ''
        : 'That image is too large to store in this browser. It applies until this tab closes. Pick a smaller image to keep it.';
    }
    refreshAgentSurfaces();
  }

  function buildAvatarOptions() {
    var box = $('agent-avatar-options');
    if (!box) return;
    box.innerHTML = '';
    AVATAR_OPTIONS.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('data-avatar-id', opt.id);
      var prev = document.createElement('span');
      prev.className = 'agent-avatar avatar-preview';
      applyAvatarTo(prev, opt.id);
      var lab = document.createElement('span');
      lab.className = 'avatar-option-label';
      lab.textContent = opt.label;
      btn.appendChild(prev);
      btn.appendChild(lab);
      btn.addEventListener('click', function () { setAgentAvatar(opt.id); });
      box.appendChild(btn);
    });
  }

  function handleAvatarUpload(file) {
    var note = $('agent-avatar-note');
    if (!file) return;
    if (String(file.type || '').indexOf('image/') !== 0) {
      if (note) note.textContent = 'That file is not an image. Pick an image file.';
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var url = String(reader.result || '');
      if (!url) return;
      var img = new Image();
      img.onload = function () {
        try {
          var max = 128;
          var w = img.width || max;
          var h = img.height || max;
          var scale = Math.min(1, max / Math.max(w, h));
          if (scale < 1) {
            var cv = document.createElement('canvas');
            cv.width = Math.max(1, Math.round(w * scale));
            cv.height = Math.max(1, Math.round(h * scale));
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            url = cv.toDataURL('image/png');
          }
        } catch (e) {}
        setAgentAvatar(url);
      };
      img.onerror = function () { setAgentAvatar(url); };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function initIdentity() {
    try {
      agentName = localStorage.getItem(AGENT_NAME_KEY) || 'Assistant';
    } catch (e) {}
    try {
      agentAvatar = localStorage.getItem(AGENT_AVATAR_KEY) || 'logo';
    } catch (e) {}
    if (!agentName) agentName = 'Assistant';
    if (!agentAvatar) agentAvatar = 'logo';
    var head = $('agent-name');
    var setting = $('agent-name-setting');
    if (head) {
      head.value = agentName;
      head.addEventListener('input', function () { setAgentName(head.value, head); });
      head.addEventListener('change', function () { head.value = agentName; });
    }
    if (setting) {
      setting.value = agentName;
      setting.addEventListener('input', function () { setAgentName(setting.value, setting); });
      setting.addEventListener('change', function () { setting.value = agentName; });
    }
    buildAvatarOptions();
    var upload = $('agent-avatar-upload');
    if (upload) {
      upload.addEventListener('change', function () {
        if (upload.files && upload.files[0]) handleAvatarUpload(upload.files[0]);
      });
    }
    refreshAgentSurfaces();
  }

  /* ---------------- ZINIUM page chain + heartbeat ---------------- */
  var CHAIN_KEY = 'halex_ai_zinium_chain_v1';
  var chain = null;
  var chainQueue = Promise.resolve();
  var lastBlockCount = 0;

  function persistChain() {
    try {
      if (chain && window.ZiniumChain) localStorage.setItem(CHAIN_KEY, window.ZiniumChain.serialize(chain));
    } catch (e) {}
  }

  function formatTime(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso || '') : d.toLocaleTimeString();
  }

  function pulseBeat() {
    var p = $('chain-pulse');
    if (!p) return;
    p.classList.remove('beat');
    void p.offsetWidth;
    p.classList.add('beat');
  }

  function refreshChainStatus() {
    var el = $('chain-status');
    if (!el || !window.ZiniumChain || !chain) return;
    window.ZiniumChain.verifyChain(chain).then(function (res) {
      el.textContent = res.valid
        ? 'CHAIN VALID · ' + res.checked + ' blocks checked'
        : 'TAMPERED at block ' + res.badIndex;
      el.className = 'hb-v hb-status ' + (res.valid ? 'ok' : 'bad');
    }).catch(function () {
      el.textContent = 'Could not verify in this browser';
      el.className = 'hb-v hb-status bad';
    });
  }

  function renderChain() {
    var strip = $('chain-strip');
    var count = $('chain-count');
    if (!chain) return;
    var n = chain.blocks.length;
    if (count) count.textContent = String(n);
    var latest = n ? chain.blocks[n - 1] : null;
    var latestEl = $('chain-latest');
    if (latestEl) {
      latestEl.textContent = latest
        ? latest.kind + ' · hash ' + String(latest.hash).slice(0, 12) + '...'
        : 'none yet';
    }
    var actEl = $('chain-last-activity');
    if (actEl) actEl.textContent = latest ? formatTime(latest.time) : 'none yet';
    if (strip) {
      strip.innerHTML = '';
      var start = Math.max(0, n - 10);
      for (var i = start; i < n; i++) {
        var b = chain.blocks[i];
        var chip = document.createElement('div');
        chip.className = 'block-chip';
        var idx = document.createElement('div');
        idx.className = 'idx';
        idx.textContent = 'BLOCK ' + b.index + ' · ' + b.kind;
        var sum = document.createElement('div');
        sum.className = 'sum';
        sum.textContent = truncate(b.summary, 64);
        var hash = document.createElement('div');
        hash.className = 'hash';
        hash.textContent = 'hash ' + String(b.hash).slice(0, 16) + '...';
        chip.appendChild(idx); chip.appendChild(sum); chip.appendChild(hash);
        strip.appendChild(chip);
      }
      strip.scrollTop = strip.scrollHeight;
    }
    if (n > lastBlockCount) pulseBeat();
    lastBlockCount = n;
    refreshChainStatus();
  }

  function chainAppend(kind, summary) {
    if (!window.ZiniumChain || !chain) return Promise.resolve(null);
    chainQueue = chainQueue.then(function () {
      return window.ZiniumChain.appendBlock(chain, kind, summary).then(function (block) {
        persistChain();
        renderChain();
        return block;
      }).catch(function () { return null; });
    });
    return chainQueue;
  }

  function initChain() {
    if (!window.ZiniumChain) return;
    var restored = null;
    try { restored = localStorage.getItem(CHAIN_KEY); } catch (e) { restored = null; }
    chain = restored ? window.ZiniumChain.deserialize(restored) : window.ZiniumChain.createChain();
    if (!chain.blocks.length) {
      chainAppend('genesis', 'HALEX-AI workspace opened. ZINIUM page chain started in this browser.');
    } else {
      renderChain();
      chainAppend('session', 'Workspace reopened. Chain restored from this browser with ' + chain.blocks.length + ' blocks.');
    }
    var verifyBtn = $('chain-verify');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', function () {
        var out = $('verify-result');
        if (out) { out.className = 'verify-result'; out.textContent = 'Recomputing every hash in the chain...'; }
        window.ZiniumChain.verifyChain(chain).then(function (res) {
          if (out) {
            out.className = 'verify-result ' + (res.valid ? 'ok' : 'bad');
            out.textContent = res.valid
              ? 'CHAIN VALID. ' + res.checked + ' blocks recomputed, every hash and link matches.'
              : 'TAMPERED. Chain check failed at block ' + res.badIndex + '.';
          }
          refreshChainStatus();
          chainAppend('verify', 'Chain verification run. Result: ' + (res.valid ? 'CHAIN VALID' : 'TAMPERED at block ' + res.badIndex) + ', ' + res.checked + ' blocks checked.');
        }).catch(function () {
          if (out) { out.className = 'verify-result bad'; out.textContent = 'Verification could not run in this browser.'; }
        });
      });
    }
  }

  /* ---------------- Thinking module (the oracle, in the chat stream) ---------------- */
  var thinking = null;

  function drawOracle(ctx, W, H, t) {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2;
    var base = Math.min(W, H) * 0.30;
    function ring(radius, speed, color, width, phase) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      var start = t * speed + phase;
      ctx.arc(cx, cy, radius, start, start + Math.PI * 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start + Math.PI * 1.6, start + Math.PI * 1.95);
      ctx.stroke();
    }
    var grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, base * 1.15);
    grad.addColorStop(0, 'rgba(240,217,140,0.30)');
    grad.addColorStop(0.55, 'rgba(45,212,191,0.12)');
    grad.addColorStop(1, 'rgba(45,212,191,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, base * 1.15, 0, Math.PI * 2); ctx.fill();
    ring(base * 1.02, 0.25, 'rgba(212,175,55,0.75)', 2, 0);
    ring(base * 0.82, -0.4, 'rgba(45,212,191,0.8)', 2, 2.1);
    ring(base * 0.62, 0.6, 'rgba(90,169,255,0.7)', 1.6, 4.2);
    ring(base * 0.42, -0.8, 'rgba(240,217,140,0.85)', 1.6, 1.2);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(240,217,140,0.95)';
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
    for (var i = 0; i < 7; i++) {
      var ang = t * (0.3 + i * 0.05) + i * (Math.PI * 2 / 7);
      var rad = base * (0.62 + (i % 3) * 0.2);
      var x = cx + Math.cos(ang) * rad;
      var y = cy + Math.sin(ang) * rad * 0.92;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(45,212,191,0.25)';
      ctx.lineWidth = 1;
      ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = i % 2 ? 'rgba(45,212,191,0.95)' : 'rgba(212,175,55,0.95)';
      ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function showThinking() {
    hideThinking();
    var tpl = $('thinking-module');
    var log = $('ext-log');
    if (!tpl || !log || !tpl.content) return;
    var frag = tpl.content.cloneNode(true);
    var el = frag.querySelector('.thinking-module');
    if (!el) return;
    var nameEl = frag.querySelector('.thinking-agent');
    if (nameEl) nameEl.textContent = agentName;
    log.appendChild(frag);
    scrollLog();
    var canvas = el.querySelector('.thinking-canvas');
    if (!canvas || !canvas.getContext) { thinking = { el: el, raf: 0 }; return; }
    var ctx = canvas.getContext('2d');
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var state = { el: el, raf: 0, t: 0 };
    thinking = state;
    drawOracle(ctx, canvas.width, canvas.height, 0);
    if (!reduced) {
      var frame = function () {
        if (thinking !== state) return;
        state.t += 0.02;
        drawOracle(ctx, canvas.width, canvas.height, state.t);
        state.raf = requestAnimationFrame(frame);
      };
      state.raf = requestAnimationFrame(frame);
    }
  }

  function hideThinking() {
    if (!thinking) return;
    if (thinking.raf) cancelAnimationFrame(thinking.raf);
    if (thinking.el && thinking.el.parentNode) thinking.el.parentNode.removeChild(thinking.el);
    thinking = null;
  }

  /* ---------------- Halifacts (per-answer download, no panel) ---------------- */
  function halifactTitle(text) {
    var first = String(text || '').split('\n')[0] || 'HALEX-AI answer';
    var dot = first.indexOf('. ');
    if (dot > 12 && dot < 70) first = first.slice(0, dot + 1);
    return truncate(first, 68) || 'HALEX-AI answer';
  }

  function buildHalifactPayload(answer, when) {
    var title = halifactTitle(answer.text);
    var createdBy = 'Created by ' + agentName + ', source: ' + (answer.label || 'local knowledge');
    var payload = '# ' + title + '\n\n' +
      createdBy + '\n' +
      'Recorded: ' + when.toString() + '\n' +
      'From the HALEX-AI workspace: https://appsthatpay.github.io/halex-web/halex-ai/\n\n' +
      answer.text + '\n';
    return { title: title, createdBy: createdBy, payload: payload };
  }

  function downloadHalifact(answer) {
    var built = buildHalifactPayload(answer, new Date());
    var blob = new Blob([built.payload], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'halifact-' + built.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) + '.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    chainAppend('halifact', 'Halifact created: ' + truncate(built.title, 60));
    chainAppend('download', 'Halifact downloaded as Markdown: ' + truncate(built.title, 55));
  }

  /* ---------------- Chat glue ---------------- */
  function buildMsg(text, cls, label) {
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
    return d;
  }

  function labelOf(node) {
    var el = node.querySelector ? node.querySelector('.ext-source') : null;
    return el ? el.textContent : 'Local knowledge';
  }

  function answerTextOf(node) {
    var text = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      var cls = child.className || '';
      if (cls.indexOf('ext-source') !== -1) continue;
      if (cls.indexOf('agent-line') !== -1) continue;
      if (cls.indexOf('btnrow') !== -1) continue;
      text = child.textContent || '';
    }
    return text || (node.textContent || '');
  }

  function enhanceAnswer(node, withButton) {
    if (!node || node.getAttribute('data-agent-done')) return;
    node.setAttribute('data-agent-done', '1');
    var line = document.createElement('div');
    line.className = 'agent-line';
    var av = document.createElement('span');
    av.className = 'agent-avatar agent-avatar-sm';
    applyAvatarTo(av);
    var nm = document.createElement('span');
    nm.className = 'agent-name';
    nm.textContent = agentName;
    line.appendChild(av);
    line.appendChild(nm);
    node.insertBefore(line, node.firstChild);
    if (withButton) {
      var text = answerTextOf(node);
      var label = labelOf(node);
      if (text) {
        var row = document.createElement('div');
        row.className = 'btnrow';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn ghost halifact-btn';
        btn.textContent = 'Download Halifact (.md)';
        btn.addEventListener('click', function () {
          downloadHalifact({ text: text, label: label });
        });
        row.appendChild(btn);
        node.appendChild(row);
      }
    }
  }

  function isWelcome(node) {
    return String(labelOf(node)).toLowerCase().indexOf('welcome') !== -1;
  }

  function watchAnswers() {
    var log = $('ext-log');
    if (!log) return;
    // Answers already in the stream (the welcome message) get identity only.
    log.querySelectorAll('.ext-msg-ai').forEach(function (node) {
      enhanceAnswer(node, !isWelcome(node));
    });
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          var cls = node.className || '';
          if (cls.indexOf('ext-msg-ai') === -1) return;
          if (cls.indexOf('thinking-module') !== -1) return;
          var welcome = isWelcome(node);
          enhanceAnswer(node, !welcome);
          hideThinking();
          if (welcome) return;
          var bodyText = answerTextOf(node);
          chainAppend('answer', 'Answer rendered in chat (' + labelOf(node) + '): ' + truncate(bodyText, 60));
        });
      });
    });
    observer.observe(log, { childList: true });
  }

  function noteQuestion(text) {
    chainAppend('chat', 'Question asked in chat: ' + truncate(text, 70));
  }

  function handleMathSend(text, math) {
    var log = $('ext-log');
    var q = $('ext-q');
    if (q) q.value = '';
    noteQuestion(text);
    if (log) {
      log.appendChild(buildMsg(text, 'ext-msg-user', 'You'));
      scrollLog();
    }
    showThinking();
    setTimeout(function () {
      if (math.finite) {
        chainAppend('calc', 'Calculated: ' + math.expr + ' = ' + math.resultText);
      } else {
        chainAppend('calc', 'Calculated: ' + math.expr + ' = no finite result');
      }
      var answerText = math.finite
        ? 'Calculation, done locally in this page: ' + math.expr + ' = ' + math.resultText
        : 'That calculation does not produce a finite number. Division by zero is the usual cause. Nothing was guessed.';
      if (log) {
        log.appendChild(buildMsg(answerText, 'ext-msg-ai', 'Local knowledge: calculation'));
        scrollLog();
      }
    }, 450);
  }

  function initSendHandlers() {
    var panel = $('panel-chat');
    if (!panel) return;
    var pendingQuestion = '';

    // Capture phase on the chat panel runs before the chat machinery's own
    // send handlers, while the typed text is still in the box. Math input is
    // fully handled here and never reaches the knowledge lookup.
    panel.addEventListener('click', function (e) {
      if (!e.target || e.target.id !== 'ext-send') return;
      var q = $('ext-q');
      var text = q ? q.value.trim() : '';
      if (!text) return;
      var math = tryMath(text);
      if (math) {
        e.preventDefault();
        e.stopPropagation();
        handleMathSend(text, math);
      } else {
        pendingQuestion = text;
      }
    }, true);
    panel.addEventListener('keydown', function (e) {
      if (!e.target || e.target.id !== 'ext-q') return;
      if (e.key !== 'Enter' || e.shiftKey) return;
      var text = e.target.value.trim();
      if (!text) return;
      var math = tryMath(text);
      if (math) {
        e.preventDefault();
        e.stopPropagation();
        handleMathSend(text, math);
      } else {
        pendingQuestion = text;
      }
    }, true);

    // Bubble phase: for normal sends the machinery runs first, then we log
    // the question on the chain and show the thinking module until the
    // answer lands (the answer watcher hides it).
    function afterSend() {
      if (!pendingQuestion) return;
      var text = pendingQuestion;
      pendingQuestion = '';
      noteQuestion(text);
      showThinking();
    }
    var send = $('ext-send');
    if (send) send.addEventListener('click', afterSend);
    var q = $('ext-q');
    if (q) {
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) afterSend();
      });
    }
  }

  /* ---------------- Settings drawer ---------------- */
  function initSettings() {
    var drawer = $('panel-settings');
    var scrim = $('settings-scrim');
    var openBtn = $('settings-toggle');
    var closeBtn = $('settings-close');
    if (!drawer) return;
    function setOpen(open) {
      drawer.hidden = !open;
      if (scrim) scrim.hidden = !open;
      if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (openBtn) openBtn.addEventListener('click', function () { setOpen(drawer.hidden); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
  }

  function init() {
    initIdentity();
    initSettings();
    initChain();
    watchAnswers();
    initSendHandlers();
  }

  var HalexAIUi = {
    halifactTitle: halifactTitle,
    buildHalifactPayload: buildHalifactPayload,
    truncate: truncate
  };
  var HalexAIMath = {
    tryMath: tryMath,
    formatNumber: formatNumber
  };
  if (typeof window !== 'undefined') {
    window.HalexAIUi = HalexAIUi;
    window.HalexAIMath = HalexAIMath;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HalexAIUi = HalexAIUi;
    globalThis.HalexAIMath = HalexAIMath;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HalexAIUi: HalexAIUi, HalexAIMath: HalexAIMath };
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
