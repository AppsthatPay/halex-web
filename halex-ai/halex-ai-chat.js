// HALEX-AI chat shell: history + task chats, attachments with honest
// handling, light/dark theme, and the top heartbeat monitor.
// The answering brain is untouched: halex-ai-ext.js (with the plugin
// packs) plus halex-ai-ui.js (math first) still own every answer.
// This shell only frames the thread, stores conversations locally, and
// handles attachments honestly. Plain script, no modules, no eval,
// no Function, no network calls, no third-party code.
// No em dash characters are used in this file.
(function () {
  'use strict';

  /* ---------------- Pure attachment logic (also tested in Node) ---------------- */

  function fileExt(name) {
    var n = String(name || '').toLowerCase();
    var dot = n.lastIndexOf('.');
    return dot === -1 ? '' : n.slice(dot);
  }

  function classifyAttachment(file) {
    var type = String((file && file.type) || '').toLowerCase();
    var ext = fileExt(file && file.name);
    if (type.indexOf('image/') === 0) return 'image';
    if (type.indexOf('video/') === 0) return 'video';
    if (type.indexOf('audio/') === 0) return 'audio';
    if (type.indexOf('text/') === 0) return 'text';
    if (type === 'application/json' || ext === '.json' || ext === '.md' ||
        ext === '.csv' || ext === '.html' || ext === '.css' ||
        ext === '.js' || ext === '.xml' || ext === '.txt') return 'text';
    return 'other';
  }

  function attachmentNote(kind, readOk) {
    if (kind === 'image' && readOk === false) {
      return 'I could not read that attachment: it does not open as an image, so I will not guess at what it contains.';
    }
    if (kind === 'image') {
      return 'I can show this image in the thread, but I cannot interpret what is in it: this page has no vision model, so I will not describe its contents.';
    }
    if (kind === 'text' && readOk === false) {
      return 'I could not read that file, so I will not guess at its contents.';
    }
    if (kind === 'text') {
      return 'The text above is quoted into this thread so it stays part of the conversation. The local answer engine answers from its bundled packs, not from the file, so it does not analyze the file itself.';
    }
    if (kind === 'video') {
      return 'I cannot read video on this page: the file stays in the thread as an attachment, and I will not describe its contents.';
    }
    if (kind === 'audio') {
      return 'I cannot read audio on this page: the file stays in the thread as an attachment, and I will not describe its contents.';
    }
    return 'I cannot read this kind of file on this page: it stays in the thread as an attachment, and I will not describe its contents.';
  }

  function excerptText(text, limit) {
    var s = String(text || '');
    var n = limit || 2000;
    if (s.length <= n) return s;
    return s.slice(0, n) + '\n... [truncated, first ' + n + ' characters shown]';
  }

  var HALEXChat = {
    classifyAttachment: classifyAttachment,
    attachmentNote: attachmentNote,
    excerptText: excerptText
  };

  if (typeof window !== 'undefined') window.HALEXChat = HALEXChat;
  if (typeof globalThis !== 'undefined') globalThis.HALEXChat = HALEXChat;
  if (typeof module !== 'undefined' && module.exports) module.exports = HALEXChat;

  /* ---------------- Browser shell (DOM only) ---------------- */
  if (typeof document === 'undefined') return;

  function $(id) { return document.getElementById(id); }
  function truncate(s, n) {
    var t = String(s || '').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1) + '...' : t;
  }
  function formatSize(bytes) {
    var b = Number(bytes || 0);
    if (b < 1024) return b + ' bytes';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /* ----- Theme: light is the default, dark only by toggle ----- */
  var THEME_KEY = 'halex_ai_theme';
  function applyTheme(theme) {
    var t = theme === 'dark' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    var btn = $('chat-theme-toggle');
    if (btn) btn.textContent = t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    return t;
  }
  function readTheme() {
    try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
  }

  /* ----- History store: conversations live in localStorage only ----- */
  var STORE_KEY = 'halex_ai_chats_v1';
  var store = null;
  var storeLoaded = false;

  function newConversation(kind, num) {
    return {
      id: 'c' + num,
      kind: kind,
      title: kind === 'task' ? 'Task chat ' + num : 'Chat ' + num,
      html: ''
    };
  }

  function loadStore() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.conversations && parsed.conversations.length) {
          storeLoaded = true;
          store = parsed;
          return;
        }
      } catch (e) {}
    }
    store = { version: 1, currentId: 'c1', nextNum: 2, conversations: [newConversation('main', 1)] };
    store.conversations[0].title = 'Main chat';
    storeLoaded = false;
  }

  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function currentConversation() {
    for (var i = 0; i < store.conversations.length; i++) {
      if (store.conversations[i].id === store.currentId) return store.conversations[i];
    }
    return store.conversations[0];
  }

  function scrollThread() {
    var log = $('ext-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function snapshotCurrent() {
    var log = $('ext-log');
    var conv = currentConversation();
    if (!log || !conv) return;
    var thinking = log.querySelectorAll('.thinking-module');
    for (var i = 0; i < thinking.length; i++) {
      if (thinking[i].parentNode) thinking[i].parentNode.removeChild(thinking[i]);
    }
    conv.html = log.innerHTML;
    var firstUser = log.querySelector('.ext-msg-user');
    if (firstUser) {
      var text = firstUser.textContent || '';
      if (conv.title === 'Main chat' || /^Chat \d+$/.test(conv.title) || /^Task chat \d+$/.test(conv.title)) {
        var excerpt = truncate(text, 40);
        if (excerpt) conv.title = excerpt;
      }
    }
    saveStore();
  }

  function rebuildHistorySelect() {
    var sel = $('chat-history');
    if (!sel) return;
    sel.innerHTML = '';
    store.conversations.forEach(function (conv) {
      var opt = document.createElement('option');
      opt.value = conv.id;
      opt.textContent = (conv.kind === 'task' ? 'Task: ' : '') + conv.title;
      if (conv.id === store.currentId) opt.selected = true;
      sel.appendChild(opt);
    });
    var optNew = document.createElement('option');
    optNew.value = '__new__';
    optNew.textContent = 'New chat...';
    sel.appendChild(optNew);
  }

  function systemNote(text) {
    var log = $('ext-log');
    if (!log) return;
    var d = document.createElement('div');
    d.className = 'ext-msg ext-msg-tool';
    var tag = document.createElement('div');
    tag.className = 'ext-source';
    tag.textContent = 'System';
    d.appendChild(tag);
    var body = document.createElement('div');
    body.textContent = text;
    d.appendChild(body);
    log.appendChild(d);
    scrollThread();
  }

  function switchConversation(id) {
    snapshotCurrent();
    var conv = null;
    for (var i = 0; i < store.conversations.length; i++) {
      if (store.conversations[i].id === id) conv = store.conversations[i];
    }
    if (!conv) return;
    store.currentId = conv.id;
    var log = $('ext-log');
    if (log) log.innerHTML = conv.html || '';
    rebuildHistorySelect();
    scrollThread();
    saveStore();
  }

  function createConversation(kind) {
    snapshotCurrent();
    var conv = newConversation(kind, store.nextNum);
    store.nextNum++;
    store.conversations.push(conv);
    store.currentId = conv.id;
    var log = $('ext-log');
    if (log) log.innerHTML = '';
    rebuildHistorySelect();
    if (kind === 'task') {
      systemNote('Task chat started. Tell me what to do here; this thread stays separate from your main chat.');
    } else {
      systemNote('New chat started. Conversations stay in this browser only.');
    }
    saveStore();
    scrollThread();
  }

  /* ----- Heartbeat monitor: fast trace while thinking, slow idle ----- */
  var sendTimer = null;
  function refreshPulse() {
    var log = $('ext-log');
    var thinking = false;
    if (log && log.querySelector('.thinking-module')) thinking = true;
    if (sendTimer) thinking = true;
    document.body.classList.toggle('is-thinking', thinking);
    var label = $('pulse-label');
    if (label) label.textContent = thinking ? 'Thinking...' : 'Ready';
  }

  function markSend() {
    if (sendTimer) clearTimeout(sendTimer);
    sendTimer = setTimeout(function () { sendTimer = null; refreshPulse(); }, 900);
    refreshPulse();
  }

  function initPulse() {
    var log = $('ext-log');
    if (log && typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function () {
        refreshPulse();
        scheduleSnapshot();
      });
      observer.observe(log, { childList: true, subtree: false });
    }
    var send = $('ext-send');
    if (send) send.addEventListener('click', markSend);
    var q = $('ext-q');
    if (q) {
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) markSend();
      });
    }
    refreshPulse();
  }

  var snapshotTimer = null;
  function scheduleSnapshot() {
    if (snapshotTimer) clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(function () { snapshotTimer = null; snapshotCurrent(); rebuildHistorySelect(); }, 400);
  }

  /* ----- Attachments: shown in the thread, never faked ----- */
  function appendAttachmentNote(kind, readOk) {
    var log = $('ext-log');
    if (!log) return;
    var d = document.createElement('div');
    d.className = 'ext-msg ext-msg-ai';
    var tag = document.createElement('div');
    tag.className = 'ext-source';
    tag.textContent = 'Attachment note';
    d.appendChild(tag);
    var body = document.createElement('div');
    body.textContent = attachmentNote(kind, readOk);
    d.appendChild(body);
    log.appendChild(d);
    scrollThread();
  }

  function handleAttachedFile(file) {
    var log = $('ext-log');
    if (!log || !file) return;
    var kind = classifyAttachment(file);
    var chip = document.createElement('div');
    chip.className = 'ext-msg ext-msg-user attachment-block';
    var meta = document.createElement('div');
    meta.className = 'attachment-meta';
    meta.textContent = 'Attached: ' + (file.name || 'file') + ' (' + formatSize(file.size) + ')';
    chip.appendChild(meta);
    log.appendChild(chip);
    scrollThread();

    if (kind === 'image') {
      try {
        var dataReader = new FileReader();
        dataReader.onload = function () {
          try { window.HalexAIPendingImage = dataReader.result; } catch (e) {}
        };
        dataReader.readAsDataURL(file);
      } catch (e) {}
      var url = null;
      try { url = URL.createObjectURL(file); } catch (e) { url = null; }
      if (!url) { appendAttachmentNote('image', false); return; }
      var img = document.createElement('img');
      img.className = 'attachment-thumb';
      img.alt = 'Attached image';
      var noted = false;
      img.onload = function () { if (!noted) { noted = true; appendAttachmentNote('image', true); } };
      img.onerror = function () {
        if (noted) return;
        noted = true;
        if (img.parentNode) img.parentNode.removeChild(img);
        var fail = document.createElement('div');
        fail.className = 'attachment-meta';
        fail.textContent = 'This file does not open as an image.';
        chip.appendChild(fail);
        appendAttachmentNote('image', false);
      };
      img.src = url;
      chip.appendChild(img);
      return;
    }

    if (kind === 'text') {
      var reader = new FileReader();
      reader.onload = function () {
        var quote = document.createElement('pre');
        quote.className = 'attachment-quote';
        quote.textContent = excerptText(reader.result, 2000);
        chip.appendChild(quote);
        scrollThread();
        appendAttachmentNote('text', true);
      };
      reader.onerror = function () { appendAttachmentNote('text', false); };
      try { reader.readAsText(file); } catch (e) { appendAttachmentNote('text', false); }
      return;
    }

    appendAttachmentNote(kind, true);
  }

  function initAttach() {
    var btn = $('chat-attach');
    var input = $('chat-attach-input');
    if (!btn || !input) return;
    btn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) handleAttachedFile(input.files[0]);
      try { input.value = ''; } catch (e) {}
    });
  }

  function initHistoryControls() {
    var sel = $('chat-history');
    if (sel) {
      sel.addEventListener('change', function () {
        if (sel.value === '__new__') { createConversation('main'); return; }
        switchConversation(sel.value);
      });
    }
    var taskBtn = $('chat-task-new');
    if (taskBtn) {
      taskBtn.addEventListener('click', function () { createConversation('task'); });
    }
    var clearBtn = $('chat-clear-history');
    var armed = false;
    var armTimer = null;
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          clearBtn.textContent = 'Click again to confirm clearing all history';
          armTimer = setTimeout(function () {
            armed = false;
            clearBtn.textContent = 'Clear all chat history';
          }, 5000);
          return;
        }
        if (armTimer) clearTimeout(armTimer);
        armed = false;
        clearBtn.textContent = 'Clear all chat history';
        try { localStorage.removeItem(STORE_KEY); } catch (e) {}
        loadStore();
        var log = $('ext-log');
        if (log) log.innerHTML = '';
        rebuildHistorySelect();
        systemNote('Chat history cleared. Starting a fresh chat.');
        saveStore();
      });
    }
  }

  function init() {
    applyTheme(readTheme());
    var themeBtn = $('chat-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var current = document.body.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
    loadStore();
    rebuildHistorySelect();
    if (storeLoaded) {
      var conv = currentConversation();
      var log = $('ext-log');
      if (log) log.innerHTML = conv ? (conv.html || '') : '';
    }
    initPulse();
    initAttach();
    initHistoryControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
