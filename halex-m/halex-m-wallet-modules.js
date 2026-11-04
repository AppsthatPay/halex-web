/* halex-m-wallet-modules.js — STAGING ONLY, NOT MERGED, NOT LIVE.
 *
 * Four independent animated wallet modules for HALEX-M, each with its
 * own panel, diagram and controls, so one module's failure never
 * blanks the others. Mounted only when the merge calls one of the
 * mount functions with a container element; nothing runs on load and
 * nothing touches the existing page until mounted.
 *
 * HARD RULES (the whole job — do not relax them at merge):
 * - Public data only. The only network call is a browser fetch to the
 *   DexScreener public token endpoint (see ENDPOINT below), the same
 *   endpoint the page's own token scans already use and the live-feed
 *   contract marks CORS-open. No other host is fetched.
 * - Pasted wallet addresses in module (a) are handled LOCALLY ONLY:
 *   validated and listed in this tab's memory, never sent, never
 *   stored in browser storage, never fetched. Their
 *   balances therefore render "—" in that module by design — that is
 *   not a bug, it is the privacy rule. The existing tab-wallet
 *   Balances panel (connected wallet / its own read-only view) is a
 *   separate, pre-existing surface and is NOT replaced by this module.
 * - Never invent a figure. Any value not actually read renders "—",
 *   never zero and never a plausible number.
 * - Every data surface carries a plain-words badge: LIVE = a public
 *   feed was read in this browser; FALLBACK = the bundled snapshot
 *   layout (which contains no figures) because the feed did not
 *   answer; LOCAL = pasted here only, never sent; MODEL = a diagram
 *   only, never price and never measured transfers.
 * - HALEX-M holds no keys, signs nothing, moves no funds. There is no
 *   seed/private-key input, no signing, no transaction construction,
 *   no wallet connection in this file. A pasted value that looks like
 *   a key or hash is rejected with a warning, never accepted.
 * - Namespacing: the ONLY window/global assignment is
 *   window.HalexMWalletModules. All CSS classes are hm-wm- prefixed.
 *   No existing page global is redefined (no showTab, solRpc,
 *   HalexWallet, HalexSMT, HalexMUnclutter, ChainMoons, or similar).
 * - Vanilla JS, no dependencies. Diagrams are SVG + CSS animation;
 *   prefers-reduced-motion is respected and each diagram has a pause
 *   control where it animates.
 */
(function () {
  'use strict';
  var root = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  var NS = 'HalexMWalletModules';
  if (root[NS] && root[NS].__hmWm) return; /* already loaded: never redefine */

  /* ---------- public endpoint (only host this file ever fetches) ---------- */
  var ENDPOINT = 'https://api.dexscreener.com/latest/dex/tokens/';
  var DEX_URL_PREFIX = 'https://dexscreener.com/';

  /* ---------- small helpers (pure; the harness exercises these) ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function numOrNull(v) {
    var n = Number(v);
    return (v == null || v === '' || !isFinite(n)) ? null : n;
  }
  function intOrNull(v) {
    var n = Number(v);
    return (v == null || v === '' || !isFinite(n)) ? null : Math.round(n);
  }
  function dash(v) { return (v == null || v === '' || (typeof v === 'number' && !isFinite(v))) ? '—' : v; }
  function fmtUsd(v) {
    if (v == null || !isFinite(Number(v))) return '—';
    var n = Number(v);
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }
  function fmtPrice(v) {
    if (v == null || !isFinite(Number(v))) return '—';
    var n = Number(v);
    if (n === 0) return '$0';
    if (Math.abs(n) < 0.0001) return '$' + n.toExponential(2);
    return '$' + n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }
  function fmtPct(v) {
    if (v == null || !isFinite(Number(v))) return '—';
    var n = Number(v);
    return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  }
  function fmtInt(v) {
    if (v == null || !isFinite(Number(v))) return '—';
    return String(Math.round(Number(v)));
  }
  function shortAddr(a) {
    if (typeof a !== 'string' || a.length < 10) return '—';
    return a.slice(0, 6) + '…' + a.slice(-4);
  }
  function isEvmAddr(s) { return /^0x[0-9a-fA-F]{40}$/.test(s || ''); }
  function isSolAddr(s) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s || ''); }
  function isKeyLike(s) {
    if (!s) return false;
    if (/^0x[0-9a-fA-F]{64}$/.test(s)) return true;
    if (/^[0-9a-fA-F]{64}$/.test(s)) return true;
    var words = String(s).trim().split(/\s+/);
    if (words.length >= 12) return true; /* word-list secret shape: reject, never accept */
    return false;
  }
  /* A pasted wallet address is either a valid shape, key-like (reject),
     or invalid. This classifies shape only; it proves nothing about
     ownership, and no lookup follows from it in module (a). */
  function classifyPasted(s) {
    var v = String(s || '').trim();
    if (!v) return { kind: 'empty', reason: 'Nothing pasted yet.' };
    if (isKeyLike(v)) return { kind: 'keylike', reason: 'Rejected: that looks like a secret or a transaction hash, not a wallet address. Never paste a seed phrase or private key anywhere — this module accepts wallet addresses only.' };
    if (isEvmAddr(v)) return { kind: 'evm', reason: 'EVM address shape.' };
    if (isSolAddr(v)) return { kind: 'solana', reason: 'Solana address shape.' };
    return { kind: 'invalid', reason: 'That does not look like an EVM address (0x + 40 hex characters) or a Solana address.' };
  }
  function isTokenAddr(s) { return isEvmAddr(s) || isSolAddr(s); }

  var BADGES = {
    live: 'LIVE — public feed read in this browser',
    fallback: 'FALLBACK — bundled snapshot layout; the public feed did not answer, so no figures are shown',
    local: 'LOCAL — pasted here only; never sent, never stored, not fetched',
    model: 'MODEL — diagram only, not price and not measured transfers'
  };
  function badgeHTML(state) {
    return '<span class="hm-wm-badge hm-wm-badge-' + esc(state) + '">' + esc(BADGES[state] || BADGES.fallback) + '</span>';
  }

  /* ---------- DOM helpers (all guarded: a missing element never throws) ---------- */
  function q(el, sel) {
    try { return el && el.querySelector ? el.querySelector(sel) : null; } catch (e) { return null; }
  }
  function qAll(el, sel) {
    try {
      var r = el && el.querySelectorAll ? el.querySelectorAll(sel) : [];
      var out = [];
      for (var i = 0; i < r.length; i++) out.push(r[i]);
      return out;
    } catch (e) { return []; }
  }
  function on(el, ev, fn) {
    try { if (el && el.addEventListener) el.addEventListener(ev, fn); } catch (e) { /* control absent: module still renders */ }
  }
  function setHTML(el, html) { try { if (el) el.innerHTML = html; } catch (e) { /* render failure stays local to this module */ } }
  function setText(el, txt) { try { if (el) el.textContent = txt; } catch (e) { /* ignore */ } }
  function setBadge(rootEl, id, state) {
    var b = q(rootEl, '#' + id);
    if (!b) return;
    try {
      b.textContent = BADGES[state] || BADGES.fallback;
      b.className = 'hm-wm-badge hm-wm-badge-' + state;
    } catch (e) { /* badge stays as rendered */ }
  }
  function nowTime() {
    try { return new Date().toLocaleTimeString(); } catch (e) { return ''; }
  }
  function statRow(label, value) {
    return '<div class="hm-wm-stat"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>';
  }

  /* ---------- public-feed read (DexScreener token lookup only) ---------- */
  function fetchPair(address, fetchImpl) {
    var fetchFn = null;
    try { fetchFn = fetchImpl || (root.fetch ? root.fetch.bind(root) : null); } catch (e) { fetchFn = null; }
    if (!fetchFn) return Promise.resolve({ ok: false, error: 'no fetch available in this environment' });
    var url = ENDPOINT + encodeURIComponent(address);
    var result;
    try { result = fetchFn(url); } catch (e) { return Promise.resolve({ ok: false, error: String(e && e.message ? e.message : e) }); }
    return Promise.resolve(result).then(function (resp) {
      if (!resp || typeof resp.json !== 'function') return { ok: false, error: 'unreadable response' };
      if (typeof resp.status === 'number' && (resp.status < 200 || resp.status >= 300)) return { ok: false, status: resp.status, error: 'HTTP ' + resp.status };
      if (resp.ok === false) return { ok: false, status: resp.status || 0, error: 'HTTP ' + (resp.status || 0) };
      return resp.json().then(function (j) {
        var pairs = (j && j.pairs) || [];
        var want = String(address).toLowerCase();
        var mine = pairs.filter(function (p) { return p.baseToken && String(p.baseToken.address || '').toLowerCase() === want; });
        if (!mine.length) return { ok: false, error: 'no live pair found for this contract' };
        mine.sort(function (a, b) { return ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0); });
        return { ok: true, source: 'live', pair: mine[0], pairs: mine };
      }, function (e) { return { ok: false, error: 'bad JSON: ' + (e && e.message ? e.message : String(e)) }; });
    }, function (e) { return { ok: false, error: String(e && e.message ? e.message : e) }; });
  }
  /* Only fields present in the payload are copied; anything absent is null, never invented. */
  function summarizePair(p) {
    if (!p) return null;
    var url = (typeof p.url === 'string' && p.url.indexOf(DEX_URL_PREFIX) === 0) ? p.url : null;
    return {
      name: (p.baseToken && p.baseToken.name) || null,
      symbol: (p.baseToken && p.baseToken.symbol) || null,
      address: (p.baseToken && p.baseToken.address) || null,
      chain: p.chainId || null,
      dex: p.dexId || null,
      priceUsd: numOrNull(p.priceUsd),
      liq: (p.liquidity ? numOrNull(p.liquidity.usd) : null),
      vol24: (p.volume ? numOrNull(p.volume.h24) : null),
      buys: (p.txns && p.txns.h24 ? intOrNull(p.txns.h24.buys) : null),
      sells: (p.txns && p.txns.h24 ? intOrNull(p.txns.h24.sells) : null),
      chg24: (p.priceChange ? numOrNull(p.priceChange.h24) : null),
      url: url
    };
  }
  function fallbackShell(title, note) {
    return '<div class="hm-wm-panel"><h3 class="hm-wm-title">' + esc(title) + '</h3>' +
      badgeHTML('fallback') +
      '<p class="hm-wm-note">' + esc(note || 'This module could not start. The other modules are unaffected.') + '</p></div>';
  }

  /* ================= (a) Trading wallets — user-pasted, local only =================
     No fetch, no storage, no connection. The list lives in this tab's
     memory and vanishes on reload. Balances are "—" because this
     module deliberately does not fetch them. */
  function mountTradingWallets(container) {
    if (!container) return false;
    try {
      container.innerHTML =
        '<div class="hm-wm-panel"><h3 class="hm-wm-title">Trading wallets — watched locally</h3>' +
        '<span class="hm-wm-badge hm-wm-badge-local" id="hm-wm-a-badge">' + esc(BADGES.local) + '</span>' +
        '<p class="hm-wm-note">Paste a wallet address you want to watch. It stays in this tab only — it is never sent anywhere, never stored, and never fetched. That is why every balance below reads “—”. To see live balances, use the connected-wallet Balances panel already in tab-wallet; this module does not replace it.</p>' +
        '<label class="hm-wm-label" for="hm-wm-a-input">Wallet address to watch (read-only view)</label>' +
        '<input class="hm-wm-input" id="hm-wm-a-input" type="text" placeholder="Paste a wallet address…" autocomplete="off" spellcheck="false">' +
        '<div class="hm-wm-row"><button class="hm-wm-btn hm-wm-btn-primary" id="hm-wm-a-add" type="button">Watch this wallet</button>' +
        '<button class="hm-wm-btn" id="hm-wm-a-clear" type="button">Clear list</button></div>' +
        '<p class="hm-wm-status" id="hm-wm-a-status">No wallets watched yet.</p>' +
        '<div id="hm-wm-a-list"></div>' +
        '<div id="hm-wm-a-diagram"></div>' +
        '<p class="hm-wm-note">HALEX-M holds no keys, signs nothing, moves no funds. Watching a pasted address here connects nothing.</p></div>';
      var watched = [];
      function renderA() {
        var list = q(container, '#hm-wm-a-list');
        var diag = q(container, '#hm-wm-a-diagram');
        var status = q(container, '#hm-wm-a-status');
        if (!watched.length) {
          setHTML(list, '<p class="hm-wm-note">No wallets watched yet — balances: —, holdings: —.</p>');
          setHTML(diag, '<svg class="hm-wm-svg" viewBox="0 0 320 110" role="img" aria-label="Watched-wallets diagram, empty"><circle cx="160" cy="45" r="26" class="hm-wm-node-empty"/><text x="160" y="48" text-anchor="middle" class="hm-wm-svg-text">—</text><text x="160" y="95" text-anchor="middle" class="hm-wm-svg-label">No watched wallets yet</text></svg>');
          setText(status, 'No wallets watched yet.');
          return;
        }
        var rows = watched.map(function (w, i) {
          return '<div class="hm-wm-row hm-wm-watchrow"><div><b>' + esc(shortAddr(w.addr)) + '</b> <span class="hm-wm-note">' + esc(w.kind) + ' · balance: — · holdings: —</span></div>' +
            '<button class="hm-wm-btn hm-wm-btn-small" data-hm-wm-remove="' + i + '" type="button" aria-label="Stop watching ' + esc(shortAddr(w.addr)) + '">Remove</button></div>';
        }).join('');
        setHTML(list, rows);
        qAll(list, '[data-hm-wm-remove]').forEach(function (b) {
          on(b, 'click', function () {
            var idx = Number(b.getAttribute ? b.getAttribute('data-hm-wm-remove') : -1);
            if (idx >= 0 && idx < watched.length) watched.splice(idx, 1);
            renderA();
          });
        });
        var n = watched.length;
        var nodes = watched.map(function (w, i) {
          var x = n === 1 ? 160 : Math.round(30 + (260 * i) / Math.max(1, n - 1));
          return '<circle cx="' + x + '" cy="45" r="24" class="hm-wm-node"/><text x="' + x + '" y="48" text-anchor="middle" class="hm-wm-svg-text">◐</text>' +
            '<text x="' + x + '" y="95" text-anchor="middle" class="hm-wm-svg-label">' + esc(shortAddr(w.addr)) + '</text>';
        }).join('');
        setHTML(diag, '<svg class="hm-wm-svg" viewBox="0 0 320 110" role="img" aria-label="Watched-wallets diagram">' + nodes + '</svg>' +
          '<p class="hm-wm-note">Diagram only — nodes are the addresses you pasted here; no balances or flows are measured in this module.</p>');
        setText(status, watched.length + ' wallet' + (watched.length === 1 ? '' : 's') + ' watched locally. Balances: — (not fetched, by design).');
      }
      on(q(container, '#hm-wm-a-add'), 'click', function () {
        var input = q(container, '#hm-wm-a-input');
        var v = input ? String(input.value || '').trim() : '';
        var c = classifyPasted(v);
        var status = q(container, '#hm-wm-a-status');
        if (c.kind === 'keylike' || c.kind === 'invalid' || c.kind === 'empty') { setText(status, c.reason); return; }
        var dup = watched.some(function (w) { return w.addr === v; });
        if (dup) { setText(status, 'That address is already on the local watch list.'); return; }
        watched.push({ addr: v, kind: c.kind === 'evm' ? 'EVM' : 'Solana' });
        if (input) { try { input.value = ''; } catch (e) { /* ignore */ } }
        setText(status, 'Added locally. This address was not sent anywhere.');
        renderA();
      });
      on(q(container, '#hm-wm-a-clear'), 'click', function () { watched = []; renderA(); });
      renderA();
      return true;
    } catch (e) {
      try { container.innerHTML = fallbackShell('Trading wallets — watched locally', 'This module could not start. The other modules are unaffected.'); } catch (e2) { /* container unusable */ }
      return false;
    }
  }

  /* ================= (b) Price + current trade activity =================
     One public token read per Refresh. The tape is the module's own
     in-memory record of its own reads — nothing else is claimed. */
  function mountPriceActivity(container) {
    if (!container) return false;
    try {
      container.innerHTML =
        '<div class="hm-wm-panel"><h3 class="hm-wm-title">Price + current trade activity</h3>' +
        '<span class="hm-wm-badge hm-wm-badge-fallback" id="hm-wm-b-badge">' + esc(BADGES.fallback) + '</span>' +
        '<p class="hm-wm-note">Paste a public token contract to read its live pair. Until a read succeeds, every figure reads “—” and the badge stays FALLBACK.</p>' +
        '<label class="hm-wm-label" for="hm-wm-b-input">Token contract (public pair lookup)</label>' +
        '<input class="hm-wm-input" id="hm-wm-b-input" type="text" placeholder="Paste a token contract…" autocomplete="off" spellcheck="false">' +
        '<div class="hm-wm-row"><button class="hm-wm-btn hm-wm-btn-primary" id="hm-wm-b-refresh" type="button">Refresh live read</button></div>' +
        '<p class="hm-wm-status" id="hm-wm-b-status">No live read yet.</p>' +
        '<div id="hm-wm-b-stats">' + statRow('Price', '—') + statRow('Liquidity', '—') + statRow('Volume 24h', '—') + statRow('Buys / sells 24h', '—') + statRow('Change 24h', '—') + '</div>' +
        '<div id="hm-wm-b-bars"><p class="hm-wm-note">Buy/sell bars: — (no live read yet).</p></div>' +
        '<div class="hm-wm-sec">Live tape — this module’s own reads</div><div id="hm-wm-b-tape"><p class="hm-wm-note">No reads yet.</p></div>' +
        '<p class="hm-wm-note">Bars show the buy/sell counts from the live pair read only. A single pair read is not a price history — no curve is drawn from it, and no MODEL curve is presented as price.</p></div>';
      var tape = [];
      function renderTape() {
        var t = q(container, '#hm-wm-b-tape');
        if (!tape.length) { setHTML(t, '<p class="hm-wm-note">No reads yet.</p>'); return; }
        setHTML(t, tape.map(function (r) { return '<div class="hm-wm-row hm-wm-taperow"><span>' + esc(r.time) + '</span><span>' + esc(r.text) + '</span></div>'; }).join(''));
      }
      function renderStats(s, live) {
        var st = q(container, '#hm-wm-b-stats');
        var bars = q(container, '#hm-wm-b-bars');
        if (!s) {
          setHTML(st, statRow('Price', '—') + statRow('Liquidity', '—') + statRow('Volume 24h', '—') + statRow('Buys / sells 24h', '—') + statRow('Change 24h', '—'));
          setHTML(bars, '<p class="hm-wm-note">Buy/sell bars: — (no live read).</p>');
          return;
        }
        setHTML(st, statRow('Price', fmtPrice(s.priceUsd)) + statRow('Liquidity', fmtUsd(s.liq)) + statRow('Volume 24h', fmtUsd(s.vol24)) +
          statRow('Buys / sells 24h', fmtInt(s.buys) + ' / ' + fmtInt(s.sells)) + statRow('Change 24h', fmtPct(s.chg24)) +
          statRow('Pair', (s.chain ? s.chain : '—') + ' · ' + (s.dex ? s.dex : '—') + (s.symbol ? ' · ' + s.symbol : '')));
        if (s.buys != null && s.sells != null && (s.buys + s.sells) > 0) {
          var max = Math.max(s.buys, s.sells);
          setHTML(bars, '<div class="hm-wm-barlabel">Buys ' + esc(fmtInt(s.buys)) + '</div><div class="hm-wm-bar"><i class="hm-wm-bar-buy" style="width:' + Math.round(100 * s.buys / max) + '%"></i></div>' +
            '<div class="hm-wm-barlabel">Sells ' + esc(fmtInt(s.sells)) + '</div><div class="hm-wm-bar"><i class="hm-wm-bar-sell" style="width:' + Math.round(100 * s.sells / max) + '%"></i></div>' +
            '<p class="hm-wm-note">Bar lengths are relative within this one live read (longer = larger count).</p>');
        } else {
          setHTML(bars, '<p class="hm-wm-note">Buy/sell bars: — (the live read carried no buy/sell counts).</p>');
        }
      }
      on(q(container, '#hm-wm-b-refresh'), 'click', function () {
        var input = q(container, '#hm-wm-b-input');
        var v = input ? String(input.value || '').trim() : '';
        var status = q(container, '#hm-wm-b-status');
        if (!isTokenAddr(v)) { setText(status, 'Paste a public token contract first (EVM 0x + 40 hex, or a Solana mint). Nothing was read.'); setBadge(container, 'hm-wm-b-badge', 'fallback'); renderStats(null, false); return; }
        setText(status, 'Reading the public pair…');
        fetchPair(v).then(function (r) {
          if (!r.ok) {
            setText(status, 'Public feed did not answer (' + (r.error || 'unknown') + '). Showing the snapshot layout — no figures claimed.');
            setBadge(container, 'hm-wm-b-badge', 'fallback');
            renderStats(null, false);
            tape.unshift({ time: nowTime(), text: 'Feed did not answer — FALLBACK, no figures' });
            tape = tape.slice(0, 8); renderTape(); return;
          }
          var s = summarizePair(r.pair);
          setText(status, 'Live read: ' + (s.symbol || 'token') + (s.chain ? ' on ' + s.chain : '') + '.');
          setBadge(container, 'hm-wm-b-badge', 'live');
          renderStats(s, true);
          tape.unshift({ time: nowTime(), text: 'LIVE — price ' + fmtPrice(s.priceUsd) + ' · buys/sells ' + fmtInt(s.buys) + '/' + fmtInt(s.sells) });
          tape = tape.slice(0, 8); renderTape();
        });
      });
      return true;
    } catch (e) {
      try { container.innerHTML = fallbackShell('Price + current trade activity', 'This module could not start. The other modules are unaffected.'); } catch (e2) { /* ignore */ }
      return false;
    }
  }

  /* ================= (c) Fund movements — animated flows =================
     The diagram is DIRECTION ONLY (buyers → pool → sellers). The
     counts beside it are the live pair's counts when read; individual
     transfers are never claimed, because this endpoint does not report
     them — that field is always "—". */
  function mountFundMovements(container) {
    if (!container) return false;
    try {
      container.innerHTML =
        '<div class="hm-wm-panel"><h3 class="hm-wm-title">Fund movements — animated flows</h3>' +
        '<span class="hm-wm-badge hm-wm-badge-fallback" id="hm-wm-c-badge">' + esc(BADGES.fallback) + '</span>' +
        '<p class="hm-wm-note">Animated diagram of flow direction for one public pair. Arrows show direction only — they are not measured transfers.</p>' +
        '<label class="hm-wm-label" for="hm-wm-c-input">Token contract (public pair lookup)</label>' +
        '<input class="hm-wm-input" id="hm-wm-c-input" type="text" placeholder="Paste a token contract…" autocomplete="off" spellcheck="false">' +
        '<div class="hm-wm-row"><button class="hm-wm-btn hm-wm-btn-primary" id="hm-wm-c-refresh" type="button">Refresh live read</button>' +
        '<button class="hm-wm-btn" id="hm-wm-c-pause" type="button" aria-pressed="false">Pause animation</button></div>' +
        '<p class="hm-wm-status" id="hm-wm-c-status">No live read yet.</p>' +
        '<div id="hm-wm-c-diagram">' +
        '<svg class="hm-wm-svg" viewBox="0 0 320 110" role="img" aria-label="Flow diagram: buyers to pool to sellers">' +
        '<line x1="55" y1="45" x2="265" y2="45" class="hm-wm-flowline"/>' +
        '<g class="hm-wm-flow-dot"><circle cx="0" cy="45" r="6"/></g>' +
        '<g class="hm-wm-flow-dot hm-wm-flow-dot-late"><circle cx="0" cy="45" r="6"/></g>' +
        '<circle cx="40" cy="45" r="24" class="hm-wm-node"/><text x="40" y="48" text-anchor="middle" class="hm-wm-svg-text">Buyers</text>' +
        '<circle cx="160" cy="45" r="24" class="hm-wm-node hm-wm-node-pool"/><text x="160" y="48" text-anchor="middle" class="hm-wm-svg-text">Pool</text>' +
        '<circle cx="280" cy="45" r="24" class="hm-wm-node"/><text x="280" y="48" text-anchor="middle" class="hm-wm-svg-text">Sellers</text>' +
        '<text x="40" y="95" text-anchor="middle" class="hm-wm-svg-label">buys: —</text>' +
        '<text x="160" y="95" text-anchor="middle" class="hm-wm-svg-label">liquidity: —</text>' +
        '<text x="280" y="95" text-anchor="middle" class="hm-wm-svg-label">sells: —</text></svg>' +
        '<p class="hm-wm-note">MODEL diagram — the moving dots illustrate direction only, not the size or timing of any real transfer.</p></div>' +
        '<div id="hm-wm-c-stats">' + statRow('Liquidity', '—') + statRow('Volume 24h', '—') + statRow('Measured individual transfers', '—') + '</div>' +
        '<p class="hm-wm-note">Why transfers read “—”: the public pair endpoint reports pair totals (liquidity, volume, buy/sell counts), not individual transfers between addresses. A module that printed transfers from totals would be inventing them, so it prints “—” instead.</p></div>';
      var paused = false;
      on(q(container, '#hm-wm-c-pause'), 'click', function () {
        var btn = q(container, '#hm-wm-c-pause');
        var diag = q(container, '#hm-wm-c-diagram');
        paused = !paused;
        try { if (diag) diag.classList.toggle('hm-wm-paused', paused); } catch (e) { /* ignore */ }
        setText(btn, paused ? 'Resume animation' : 'Pause animation');
        try { if (btn) btn.setAttribute('aria-pressed', paused ? 'true' : 'false'); } catch (e) { /* ignore */ }
      });
      on(q(container, '#hm-wm-c-refresh'), 'click', function () {
        var input = q(container, '#hm-wm-c-input');
        var v = input ? String(input.value || '').trim() : '';
        var status = q(container, '#hm-wm-c-status');
        var stats = q(container, '#hm-wm-c-stats');
        if (!isTokenAddr(v)) { setText(status, 'Paste a public token contract first. Nothing was read.'); setBadge(container, 'hm-wm-c-badge', 'fallback'); return; }
        setText(status, 'Reading the public pair…');
        fetchPair(v).then(function (r) {
          if (!r.ok) {
            setText(status, 'Public feed did not answer (' + (r.error || 'unknown') + '). Diagram stays MODEL; figures stay “—”.');
            setBadge(container, 'hm-wm-c-badge', 'fallback');
            setHTML(stats, statRow('Liquidity', '—') + statRow('Volume 24h', '—') + statRow('Measured individual transfers', '—'));
            return;
          }
          var s = summarizePair(r.pair);
          setText(status, 'Live read: ' + (s.symbol || 'token') + (s.chain ? ' on ' + s.chain : '') + '. Diagram still shows direction only.');
          setBadge(container, 'hm-wm-c-badge', 'live');
          setHTML(stats, statRow('Liquidity', fmtUsd(s.liq)) + statRow('Volume 24h', fmtUsd(s.vol24)) + statRow('Measured individual transfers', '—'));
          var diag = q(container, '#hm-wm-c-diagram');
          var svg = q(diag, 'svg');
          if (svg) {
            /* Re-label only the three count labels under the nodes; dots keep animating. */
            try {
              var texts = svg.querySelectorAll ? svg.querySelectorAll('text.hm-wm-svg-label') : [];
              if (texts[0]) texts[0].textContent = 'buys: ' + fmtInt(s.buys);
              if (texts[1]) texts[1].textContent = 'liquidity: ' + fmtUsd(s.liq);
              if (texts[2]) texts[2].textContent = 'sells: ' + fmtInt(s.sells);
            } catch (e) { /* labels stay as rendered */ }
          }
        });
      });
      return true;
    } catch (e) {
      try { container.innerHTML = fallbackShell('Fund movements — animated flows', 'This module could not start. The other modules are unaffected.'); } catch (e2) { /* ignore */ }
      return false;
    }
  }

  /* ================= (d) Whale wallets — public observations only =================
     This endpoint reports PAIRS, not wallets. The module therefore
     reports large public pairs and leaves every wallet-identity field
     at "—". Naming a wallet this endpoint never identified would be
     inventing it. No wallet address is hardcoded anywhere in this file. */
  function mountWhaleWallets(container) {
    if (!container) return false;
    try {
      container.innerHTML =
        '<div class="hm-wm-panel"><h3 class="hm-wm-title">Whale wallets — public observations</h3>' +
        '<span class="hm-wm-badge hm-wm-badge-fallback" id="hm-wm-d-badge">' + esc(BADGES.fallback) + '</span>' +
        '<p class="hm-wm-note">Large public pairs observed on the public feed. A large pair is not a named whale wallet — wallet identities are not read from this endpoint, so they read “—”.</p>' +
        '<label class="hm-wm-label" for="hm-wm-d-input">Token contract (public pair lookup)</label>' +
        '<input class="hm-wm-input" id="hm-wm-d-input" type="text" placeholder="Paste a token contract…" autocomplete="off" spellcheck="false">' +
        '<div class="hm-wm-row"><button class="hm-wm-btn hm-wm-btn-primary" id="hm-wm-d-refresh" type="button">Refresh live read</button></div>' +
        '<p class="hm-wm-status" id="hm-wm-d-status">No live read yet.</p>' +
        '<div id="hm-wm-d-rows"><p class="hm-wm-note">Largest public pairs: — (no live read yet).</p></div>' +
        '<div id="hm-wm-d-bars"></div>' +
        '<div>' + statRow('Largest wallet identified', '—') + statRow('Whale wallet address', '—') + statRow('Whale flow measured', '—') + '</div>' +
        '<p class="hm-wm-note">Honest limit, printed on the panel: this module observes pair size (liquidity/volume) from a public feed. It does not identify, name, or track any wallet, large or otherwise.</p></div>';
      on(q(container, '#hm-wm-d-refresh'), 'click', function () {
        var input = q(container, '#hm-wm-d-input');
        var v = input ? String(input.value || '').trim() : '';
        var status = q(container, '#hm-wm-d-status');
        var rows = q(container, '#hm-wm-d-rows');
        var bars = q(container, '#hm-wm-d-bars');
        if (!isTokenAddr(v)) { setText(status, 'Paste a public token contract first. Nothing was read.'); setBadge(container, 'hm-wm-d-badge', 'fallback'); return; }
        setText(status, 'Reading the public pairs…');
        fetchPair(v).then(function (r) {
          if (!r.ok) {
            setText(status, 'Public feed did not answer (' + (r.error || 'unknown') + '). Showing the snapshot layout — no figures claimed.');
            setBadge(container, 'hm-wm-d-badge', 'fallback');
            setHTML(rows, '<p class="hm-wm-note">Largest public pairs: — (feed did not answer).</p>');
            setHTML(bars, '');
            return;
          }
          var list = (r.pairs || []).slice(0, 5).map(function (p) { return summarizePair(p); });
          var maxLiq = 0;
          list.forEach(function (s) { if (s.liq != null && s.liq > maxLiq) maxLiq = s.liq; });
          setText(status, 'LIVE — ' + list.length + ' public pair' + (list.length === 1 ? '' : 's') + ' read. These are pairs, not wallets.');
          setBadge(container, 'hm-wm-d-badge', 'live');
          setHTML(rows, list.map(function (s, i) {
            return '<div class="hm-wm-row hm-wm-watchrow"><div><b>#' + (i + 1) + ' ' + esc(s.symbol || '—') + '</b> <span class="hm-wm-note">' + esc(s.chain || '—') + ' · ' + esc(s.dex || '—') + '</span></div>' +
              '<div><span class="hm-wm-note">liquidity </span><b>' + esc(fmtUsd(s.liq)) + '</b><span class="hm-wm-note"> · volume </span><b>' + esc(fmtUsd(s.vol24)) + '</b></div></div>';
          }).join(''));
          if (maxLiq > 0) {
            setHTML(bars, '<div class="hm-wm-barlabel">Liquidity bars — relative within this returned set only, not wallet size</div>' +
              list.map(function (s) {
                var w = s.liq != null ? Math.round(100 * s.liq / maxLiq) : 0;
                return '<div class="hm-wm-bar"><i style="width:' + w + '%"></i></div>';
              }).join(''));
          } else {
            setHTML(bars, '<p class="hm-wm-note">Liquidity bars: — (the live read carried no liquidity figures).</p>');
          }
        });
      });
      return true;
    } catch (e) {
      try { container.innerHTML = fallbackShell('Whale wallets — public observations', 'This module could not start. The other modules are unaffected.'); } catch (e2) { /* ignore */ }
      return false;
    }
  }

  /* ---------- mount-all: each anchor mounted in its own try/catch ---------- */
  function mountAll() {
    var doc = null;
    try { doc = root.document; } catch (e) { doc = null; }
    if (!doc || !doc.getElementById) return { trading: false, price: false, funds: false, whale: false };
    var out = {};
    var jobs = [
      ['trading', 'hm-wm-trading', mountTradingWallets],
      ['price', 'hm-wm-price', mountPriceActivity],
      ['funds', 'hm-wm-funds', mountFundMovements],
      ['whale', 'hm-wm-whale', mountWhaleWallets]
    ];
    jobs.forEach(function (j) {
      try {
        var el = doc.getElementById(j[1]);
        out[j[0]] = el ? !!j[2](el) : false;
      } catch (e) { out[j[0]] = false; }
    });
    return out;
  }

  root[NS] = {
    __hmWm: true,
    version: '20261101-staging',
    mountTradingWallets: mountTradingWallets,
    mountPriceActivity: mountPriceActivity,
    mountFundMovements: mountFundMovements,
    mountWhaleWallets: mountWhaleWallets,
    mountAll: mountAll,
    /* Test seam only (pure helpers + the feed reader). Not page API. */
    _internals: {
      esc: esc, dash: dash, fmtUsd: fmtUsd, fmtPrice: fmtPrice, fmtPct: fmtPct, fmtInt: fmtInt,
      shortAddr: shortAddr, isEvmAddr: isEvmAddr, isSolAddr: isSolAddr, isKeyLike: isKeyLike,
      classifyPasted: classifyPasted, isTokenAddr: isTokenAddr,
      summarizePair: summarizePair, fetchPair: fetchPair, badgeText: function (s) { return BADGES[s] || BADGES.fallback; }
    }
  };
})();
