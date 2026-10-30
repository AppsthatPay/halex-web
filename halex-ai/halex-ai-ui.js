// HALEX-AI workspace UI wiring: core visual, nav, Halifacts, live ZINIUM chain,
// usage counters, and honest not-built-yet buttons.
// Chat itself runs on halex-ai-ext.js with knowledge.js (unchanged machinery).
// Plain script, no modules, no third-party code. No em dash characters are used.
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function truncate(text, n) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '...' : s;
  }

  /* ---------------- ZINIUM page chain ---------------- */
  var CHAIN_KEY = 'halex_ai_zinium_chain_v1';
  var chain = null;
  var chainQueue = Promise.resolve();

  function persistChain() {
    try {
      if (chain && window.ZiniumChain) localStorage.setItem(CHAIN_KEY, window.ZiniumChain.serialize(chain));
    } catch (e) {}
  }

  function renderChain() {
    var strip = $('chain-strip');
    var count = $('chain-count');
    if (!strip || !chain) return;
    strip.innerHTML = '';
    chain.blocks.forEach(function (b, i) {
      if (i > 0) {
        var arrow = document.createElement('div');
        arrow.className = 'chain-arrow';
        arrow.textContent = '>';
        strip.appendChild(arrow);
      }
      var chip = document.createElement('div');
      chip.className = 'block-chip';
      var idx = document.createElement('div');
      idx.className = 'idx';
      idx.textContent = 'BLOCK ' + b.index;
      var kind = document.createElement('div');
      kind.className = 'kind';
      kind.textContent = b.kind;
      var sum = document.createElement('div');
      sum.className = 'sum';
      sum.textContent = truncate(b.summary, 64);
      var hash = document.createElement('div');
      hash.className = 'hash';
      hash.textContent = 'hash ' + String(b.hash).slice(0, 16) + '...';
      var prev = document.createElement('div');
      prev.className = 'prev';
      prev.textContent = 'prev ' + String(b.prev).slice(0, 16) + (b.prev === 'GENESIS' ? '' : '...');
      chip.appendChild(idx); chip.appendChild(kind); chip.appendChild(sum);
      chip.appendChild(hash); chip.appendChild(prev);
      strip.appendChild(chip);
    });
    if (count) count.textContent = String(chain.blocks.length);
    strip.scrollLeft = strip.scrollWidth;
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
          chainAppend('verify', 'Chain verification run. Result: ' + (res.valid ? 'CHAIN VALID' : 'TAMPERED at block ' + res.badIndex) + ', ' + res.checked + ' blocks checked.');
        }).catch(function () {
          if (out) { out.className = 'verify-result bad'; out.textContent = 'Verification could not run in this browser.'; }
        });
      });
    }
  }

  /* ---------------- Halifacts ---------------- */
  var halifacts = [];
  var lastAnswer = null;

  function halifactTitle(text) {
    var first = String(text || '').split('\n')[0] || 'HALEX-AI answer';
    var dot = first.indexOf('. ');
    if (dot > 12 && dot < 70) first = first.slice(0, dot + 1);
    return truncate(first, 68) || 'HALEX-AI answer';
  }

  function bumpUsage() {
    var n = halifacts.length;
    try {
      var total = parseInt(localStorage.getItem('halex_ai_halifacts_made') || '0', 10) || 0;
      total += 1;
      localStorage.setItem('halex_ai_halifacts_made', String(total));
      n = total;
    } catch (e) {}
    var el = $('usage-halifacts');
    if (el) el.textContent = String(n);
  }

  function buildHalifactPayload(answer, when) {
    var title = halifactTitle(answer.text);
    var createdBy = 'Created by HALEX-AI, source: ' + (answer.label || 'local knowledge');
    var payload = '# ' + title + '\n\n' +
      createdBy + '\n' +
      'Recorded: ' + when.toString() + '\n' +
      'From the HALEX-AI workspace: https://appsthatpay.github.io/halex-web/halex-ai/\n\n' +
      answer.text + '\n';
    return { title: title, createdBy: createdBy, payload: payload };
  }

  function createHalifact(answer) {
    if (!answer || !answer.text) return null;
    var when = new Date();
    var built = buildHalifactPayload(answer, when);
    var title = built.title;
    var createdBy = built.createdBy;
    var payload = built.payload;
    var fact = { title: title, createdBy: createdBy, when: when, payload: payload, text: answer.text };
    halifacts.unshift(fact);
    renderHalifacts();
    bumpUsage();
    chainAppend('halifact', 'Halifact created: ' + truncate(title, 60));
    return fact;
  }

  function renderHalifacts() {
    var box = $('halifact-list');
    var empty = $('halifact-empty');
    if (!box) return;
    box.innerHTML = '';
    if (empty) empty.style.display = halifacts.length ? 'none' : 'block';
    halifacts.forEach(function (fact) {
      var card = document.createElement('div');
      card.className = 'halifact';
      var h = document.createElement('h3');
      h.textContent = fact.title;
      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = fact.createdBy + ' · ' + fact.when.toLocaleString();
      var sum = document.createElement('div');
      sum.className = 'sum';
      sum.textContent = truncate(fact.text, 300);
      var row = document.createElement('div');
      row.className = 'btnrow';
      var dl = document.createElement('button');
      dl.className = 'btn';
      dl.type = 'button';
      dl.textContent = 'Download';
      dl.addEventListener('click', function () {
        var blob = new Blob([fact.payload], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'halifact-' + fact.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) + '.md';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        chainAppend('download', 'Halifact downloaded as Markdown: ' + truncate(fact.title, 55));
      });
      var open = document.createElement('button');
      open.className = 'btn ghost';
      open.type = 'button';
      open.textContent = 'Open in New Tab';
      open.addEventListener('click', function () {
        var blob = new Blob([fact.payload], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      });
      row.appendChild(dl); row.appendChild(open);
      card.appendChild(h); card.appendChild(meta); card.appendChild(sum); card.appendChild(row);
      box.appendChild(card);
    });
  }

  function watchChat() {
    var log = $('ext-log');
    if (!log) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          var cls = node.className || '';
          if (cls.indexOf('ext-msg-ai') === -1) return;
          var labelEl = node.querySelector ? node.querySelector('.ext-source') : null;
          var label = labelEl ? labelEl.textContent : 'Local knowledge';
          if (String(label).toLowerCase().indexOf('welcome') !== -1) return;
          var bodyText = '';
          for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType === 1 && (child.className || '').indexOf('ext-source') === -1) {
              bodyText = child.textContent || '';
            }
          }
          if (!bodyText) bodyText = node.textContent || '';
          lastAnswer = { text: bodyText, label: label };
          chainAppend('answer', 'Answer rendered in chat (' + label + '): ' + truncate(bodyText, 60));
          createHalifact(lastAnswer);
        });
      });
    });
    observer.observe(log, { childList: true });
  }

  function watchQuestion() {
    function note() {
      var q = $('ext-q');
      var text = q ? q.value.trim() : '';
      if (text) chainAppend('chat', 'Question asked in chat: ' + truncate(text, 70));
    }
    var send = $('ext-send');
    if (send) send.addEventListener('click', note);
    var q = $('ext-q');
    if (q) q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) note();
    });
    var make = $('make-halifact');
    if (make) make.addEventListener('click', function () {
      var noteEl = $('halifact-note');
      if (lastAnswer) {
        createHalifact(lastAnswer);
        if (noteEl) noteEl.textContent = 'Halifact created from the latest answer.';
      } else if (noteEl) {
        noteEl.textContent = 'Ask a question in chat first. Every answer becomes a Halifact automatically, and this button makes another copy.';
      }
    });
  }

  /* ---------------- Not built yet ---------------- */
  function initNotYet() {
    var note = $('notyet-note');
    document.querySelectorAll('.notyet-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var feature = btn.getAttribute('data-feature') || 'That feature';
        if (note) {
          note.style.display = 'block';
          note.textContent = feature + ': We don\'t have that yet. Nothing was run and nothing was faked. It stays on the Not Built Yet list until it really works.';
          var panel = $('panel-works');
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  /* ---------------- Nav, search, selection ---------------- */
  function initNav() {
    var buttons = document.querySelectorAll('.nav button[data-target]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var target = $(btn.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    var search = $('side-search');
    if (search) {
      search.addEventListener('input', function () {
        var needle = search.value.toLowerCase();
        document.querySelectorAll('.list li[data-name]').forEach(function (li) {
          var name = (li.getAttribute('data-name') || '').toLowerCase();
          li.style.display = !needle || name.indexOf(needle) !== -1 ? '' : 'none';
        });
      });
    }
    document.querySelectorAll('.list li').forEach(function (li) {
      li.addEventListener('click', function () {
        var parent = li.parentElement;
        if (parent) parent.querySelectorAll('li').forEach(function (x) { x.classList.remove('sel'); });
        li.classList.add('sel');
      });
    });
  }

  /* ---------------- Usage facts ---------------- */
  function initUsage() {
    try {
      var made = parseInt(localStorage.getItem('halex_ai_halifacts_made') || '0', 10) || 0;
      var el = $('usage-halifacts');
      if (el) el.textContent = String(made);
    } catch (e) {}
    var k = window.HalexAIKnowledge;
    if (k) {
      var f = $('usage-facts'); if (f && k.FACTS) f.textContent = String(k.FACTS.length);
      var l = $('usage-lessons'); if (l && k.LESSONS) l.textContent = String(k.LESSONS.length);
    }
    if (window.HalexAIExt) {
      var cfg = window.HalexAIExt.getModelConfig();
      var m = $('usage-model');
      if (m) m.textContent = window.HalexAIExt.modelConfigured(cfg)
        ? 'Configured in this browser'
        : 'Not configured. Offline local mode';
    }
  }

  /* ---------------- Core visual ---------------- */
  function initCore() {
    var canvas = $('core-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var W = 0, H = 0, t = 0;
    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(280, r.width); H = Math.max(160, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function ring(cx, cy, radius, speed, color, width, dashPhase) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      var start = t * speed + dashPhase;
      ctx.arc(cx, cy, radius, start, start + Math.PI * 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start + Math.PI * 1.6, start + Math.PI * 1.95);
      ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var base = Math.min(W, H) * 0.30;
      var grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, base * 1.15);
      grad.addColorStop(0, 'rgba(240,217,140,0.30)');
      grad.addColorStop(0.55, 'rgba(45,212,191,0.12)');
      grad.addColorStop(1, 'rgba(45,212,191,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, base * 1.15, 0, Math.PI * 2); ctx.fill();
      ring(cx, cy, base * 1.02, 0.25, 'rgba(212,175,55,0.75)', 2, 0);
      ring(cx, cy, base * 0.82, -0.4, 'rgba(45,212,191,0.8)', 2, 2.1);
      ring(cx, cy, base * 0.62, 0.6, 'rgba(90,169,255,0.7)', 1.6, 4.2);
      ring(cx, cy, base * 0.42, -0.8, 'rgba(240,217,140,0.85)', 1.6, 1.2);
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
    function frame() {
      t += 0.008;
      draw();
      if (!document.hidden) requestAnimationFrame(frame);
      else setTimeout(function () { requestAnimationFrame(frame); }, 400);
    }
    size();
    window.addEventListener('resize', size);
    draw();
    if (!reduced) requestAnimationFrame(frame);
  }

  function init() {
    initNav();
    initUsage();
    initCore();
    initChain();
    watchChat();
    watchQuestion();
    initNotYet();
    renderHalifacts();
  }

  var HalexAIUi = {
    halifactTitle: halifactTitle,
    buildHalifactPayload: buildHalifactPayload,
    truncate: truncate
  };
  if (typeof window !== 'undefined') window.HalexAIUi = HalexAIUi;
  if (typeof globalThis !== 'undefined') globalThis.HalexAIUi = HalexAIUi;
  if (typeof module !== 'undefined' && module.exports) module.exports = HalexAIUi;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
