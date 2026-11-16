/* =====================================================================
   halex-m-trading-token-view.js — STAGING ONLY, NOT MERGED.
   HALEX-M Trading View + Token View upgrade package (2026-11-01).

   What this is: an ADDITIVE, vanilla-JS module (no dependencies, no
   build step) that renders two richer surfaces for the HALEX-M page:
     (1) a Trading View panel — animated chart + animated bundle-flow
         diagram (bundles moving between wallets/pools), and
     (2) a Token View panel — deeper token analysis (liquidity,
         buys/sells, holder shape, age, links, custody signal), each
         field animated in and each carrying its own source label.

   What this is NOT: it holds no keys, signs nothing, moves no funds,
   and wires NO live execution of any kind. It never presents a
   simulation, paper record, or model as a real trade, fill, or
   balance. Paper-test records are not rendered here at all.

   HONESTY CONTRACT (follows the Chaintarium staging contract in
   ~/workspace/ts-spaces/halex-m-sandbox/, read — not copied):
     - Charts plot REAL series or LABELED MODELS only. A model curve
       is NEVER presented as price: model output is labelled MODEL,
       its axis reads "shape units", never "$", and its caption says
       "shape only, not price".
     - Every data surface carries a LIVE or FALLBACK label in plain
       words. LIVE = public feeds fetched in the browser.
       FALLBACK = bundled snapshot, labelled as such.
     - NEVER invent a number. A missing field renders as "—", never
       as a plausible figure. The bundled SNAPSHOT below therefore
       carries NO numeric price/liquidity/volume values at all — it
       is a structural shape (field names + nulls + a labelled MODEL
       series) so a fallback paint can never be mistaken for a quote.
     - Only fields actually present in a payload are copied out.
       Unknown shapes are kept raw and marked unparsed, never
       reshaped by invention.
     - Live reads use public endpoints only (DexScreener public token
       lookup, the same endpoint halex-m-upgrade.js already uses).
       ANY fetch failure (network, CORS refusal, non-OK status, bad
       JSON) falls back to the labelled snapshot — never to invented
       data — and the label flips to FALLBACK.

   NAMESPACING: this file defines exactly one global,
   window.HalexMTradingView. It redefines NO page global (showTab,
   toast, tokenCard, checkCard, openToken, esc, fmtUsd, fmtPrice,
   fmtPct, ageStr, $, $$, and friends are untouched). It touches NO
   DOM on load and performs NO fetch on load. The merge wires it in
   by calling mountTradingPanel() / mountTokenPanel() / the render
   functions below — see MERGE-MAP.md.
   ===================================================================== */
(function () {
  'use strict';

  var root = (typeof window !== 'undefined') ? window : globalThis;

  var VERSION = '0.1.0-staging-20261101';
  var LIVE_LABEL = 'LIVE — public feeds fetched in the browser';
  var FALLBACK_LABEL = 'FALLBACK — bundled snapshot, not live data';
  var MODEL_LABEL = 'MODEL — shape only, not price';
  var DEXSCREENER_TOKEN_URL = 'https://api.dexscreener.com/latest/dex/tokens/';

  /* ---- bundled snapshot: structure only, NO numeric values. ----
     Every numeric field is null on purpose, so a fallback render
     shows "—" for every figure instead of a plausible-looking
     invented quote. The model series is shape units, not price. */
  var SNAPSHOT = {
    kind: 'snapshot-fallback',
    token: {
      name: null, symbol: null, chainId: null, dexId: null,
      priceUsd: null, liquidityUsd: null, volume24hUsd: null,
      marketCapUsd: null, fdvUsd: null,
      buys24h: null, sells24h: null, buys1h: null, sells1h: null,
      pairCreatedAt: null, pairAddress: null, pairUrl: null,
      websites: [], socials: [], description: null,
      holders: null, holderTopSharePct: null, linkedGroups: null,
      custody: null, custodyNote: null, gateScore: null, gateLabel: null,
      unparsed: false
    },
    /* Deterministic MODEL shape (sine blend, seeded by index only).
       Units are abstract shape units 0–100. Never dollars. */
    modelSeries: modelSeries(48, 'halex-m-tv-fallback'),
    bundles: []
  };

  /* ---------------- small pure helpers ---------------- */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function dash(v) { return isNum(v) ? v : null; }
  function fmtUsd(v) {
    if (!isNum(v)) return '—';
    if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    if (v === 0) return '$0';
    return '$' + v.toFixed(2);
  }
  function fmtPrice(v) {
    if (!isNum(v)) return '—';
    if (Math.abs(v) >= 1) return '$' + v.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    if (v === 0) return '$0';
    return '$' + v.toExponential(2);
  }
  function fmtInt(v) {
    if (!isNum(v)) return '—';
    return Math.round(v).toLocaleString('en-US');
  }
  function fmtPct(v) {
    if (!isNum(v)) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
  }
  function ageStr(ts) {
    if (!isNum(ts)) return '—';
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 3600) return Math.floor(s / 60) + 'm old';
    if (s < 86400) return Math.floor(s / 3600) + 'h old';
    return Math.floor(s / 86400) + 'd old';
  }
  function shortAddr(a) {
    if (!a || typeof a !== 'string') return '—';
    if (a.length <= 14) return a;
    return a.slice(0, 6) + '…' + a.slice(-4);
  }
  /* Deterministic model shape — same seed string, same curve, every
     load. No random-number calls anywhere in this file. */
  function modelSeries(n, seedStr) {
    var seed = 2166136261, i;
    for (i = 0; i < (seedStr || '').length; i++) {
      seed ^= seedStr.charCodeAt(i); seed = (seed * 16777619) >>> 0;
    }
    var out = [], x, s;
    for (i = 0; i < n; i++) {
      x = i / Math.max(1, n - 1);
      s = (seed % 97) / 97;
      out.push(Math.round((50
        + 30 * Math.sin(x * Math.PI * 2 * (1 + Math.floor(s * 2)))
        + 12 * Math.sin(x * Math.PI * 5 + s * 6)) * 10) / 10);
    }
    return out;
  }
  function sourceOf(opts) {
    opts = opts || {};
    return opts.source === 'live' ? 'live' : 'fallback';
  }
  function sourceBadge(source) {
    if (source === 'live') {
      return '<span class="hm-tv-badge hm-tv-badge-live">' + escHtml(LIVE_LABEL) + '</span>';
    }
    return '<span class="hm-tv-badge hm-tv-badge-fallback">' + escHtml(FALLBACK_LABEL) + '</span>';
  }
  function sourceLabel(source) {
    return source === 'live' ? LIVE_LABEL : FALLBACK_LABEL;
  }

  /* ---------------- live read: DexScreener public API only -------- */
  function normalizeDexPair(p) {
    if (!p || typeof p !== 'object') return null;
    var tx24 = (p.txns && p.txns.h24) || {};
    var tx1 = (p.txns && p.txns.h1) || {};
    var info = p.info || {};
    return {
      name: (p.baseToken && p.baseToken.name) || null,
      symbol: (p.baseToken && p.baseToken.symbol) || null,
      chainId: p.chainId || null, dexId: p.dexId || null,
      priceUsd: isNum(Number(p.priceUsd)) && p.priceUsd != null ? Number(p.priceUsd) : null,
      liquidityUsd: (p.liquidity && isNum(p.liquidity.usd)) ? p.liquidity.usd : null,
      volume24hUsd: (p.volume && isNum(p.volume.h24)) ? p.volume.h24 : null,
      marketCapUsd: isNum(p.marketCap) ? p.marketCap : (isNum(p.fdv) ? p.fdv : null),
      fdvUsd: isNum(p.fdv) ? p.fdv : null,
      buys24h: isNum(tx24.buys) ? tx24.buys : null,
      sells24h: isNum(tx24.sells) ? tx24.sells : null,
      buys1h: isNum(tx1.buys) ? tx1.buys : null,
      sells1h: isNum(tx1.sells) ? tx1.sells : null,
      priceChange24h: (p.priceChange && isNum(p.priceChange.h24)) ? p.priceChange.h24 : null,
      pairCreatedAt: isNum(p.pairCreatedAt) ? p.pairCreatedAt : null,
      pairAddress: p.pairAddress || null, pairUrl: p.url || null,
      websites: Array.isArray(info.websites) ? info.websites : [],
      socials: Array.isArray(info.socials) ? info.socials : [],
      description: info.description || null,
      holders: null, holderTopSharePct: null, linkedGroups: null,
      custody: null, custodyNote: null, gateScore: null, gateLabel: null,
      unparsed: false
    };
  }
  /* Copy only fields present on the caller's token object; anything
     absent stays null and renders "—". Never fills a gap. */
  function normalizeToken(raw) {
    if (!raw || typeof raw !== 'object') return null;
    /* DexScreener pair shape only when baseToken is present; a plain
       page token object ({chainId, address, price, ...}) must take the
       plain path below or its price/liquidity fields would be lost. */
    if (raw.baseToken) {
      var t = normalizeDexPair(raw);
      /* A DexScreener-shaped object may still carry page-side fields
         (gate result, holder read) — copy them only if present. */
      if (raw.gateRes && isNum(raw.gateRes.score)) t.gateScore = raw.gateRes.score;
      if (raw.gateRes && raw.gateRes.gate) t.gateLabel = raw.gateRes.gate.label || null;
      return t;
    }
    return {
      name: raw.name || null, symbol: raw.symbol || null,
      chainId: raw.chainId || null, dexId: raw.dexId || raw.dex || null,
      priceUsd: isNum(raw.price) ? raw.price : (isNum(raw.priceUsd) ? raw.priceUsd : null),
      liquidityUsd: isNum(raw.liquidity) ? raw.liquidity : (isNum(raw.liquidityUsd) ? raw.liquidityUsd : null),
      volume24hUsd: isNum(raw.volume24) ? raw.volume24 : (isNum(raw.volume24hUsd) ? raw.volume24hUsd : null),
      marketCapUsd: isNum(raw.mcap) ? raw.mcap : (isNum(raw.marketCapUsd) ? raw.marketCapUsd : null),
      fdvUsd: isNum(raw.fdvUsd) ? raw.fdvUsd : null,
      buys24h: (raw.txns && isNum(raw.txns.buys)) ? raw.txns.buys : (isNum(raw.buys24h) ? raw.buys24h : null),
      sells24h: (raw.txns && isNum(raw.txns.sells)) ? raw.txns.sells : (isNum(raw.sells24h) ? raw.sells24h : null),
      buys1h: isNum(raw.buys1h) ? raw.buys1h : null,
      sells1h: isNum(raw.sells1h) ? raw.sells1h : null,
      priceChange24h: isNum(raw.change24) ? raw.change24 : (isNum(raw.priceChange24h) ? raw.priceChange24h : null),
      pairCreatedAt: isNum(raw.createdAt) ? raw.createdAt : (isNum(raw.pairCreatedAt) ? raw.pairCreatedAt : null),
      pairAddress: raw.pairAddress || null, pairUrl: raw.pairUrl || null,
      websites: Array.isArray(raw.websites) ? raw.websites : [],
      socials: Array.isArray(raw.socials) ? raw.socials : [],
      description: raw.description || null,
      holders: isNum(raw.holders) ? raw.holders : null,
      holderTopSharePct: isNum(raw.holderTopSharePct) ? raw.holderTopSharePct : null,
      linkedGroups: isNum(raw.linkedGroups) ? raw.linkedGroups : null,
      custody: raw.custody || null, custodyNote: raw.custodyNote || null,
      gateScore: isNum(raw.gateScore) ? raw.gateScore : null,
      gateLabel: raw.gateLabel || null,
      unparsed: false
    };
  }
  function fetchTokenLive(address, fetchImpl) {
    var f = fetchImpl || (typeof root.fetch !== 'undefined' ? root.fetch.bind(root) : null);
    if (!f) return Promise.resolve({ ok: false, source: 'fallback', pair: null, error: 'no fetch available in this environment' });
    if (!address || typeof address !== 'string') {
      return Promise.resolve({ ok: false, source: 'fallback', pair: null, error: 'no address supplied' });
    }
    var result;
    try {
      result = f(DEXSCREENER_TOKEN_URL + encodeURIComponent(address));
    } catch (e) {
      return Promise.resolve({ ok: false, source: 'fallback', pair: null, error: String(e && e.message ? e.message : e) });
    }
    return Promise.resolve(result).then(function (resp) {
      if (!resp || typeof resp.json !== 'function') return { ok: false, source: 'fallback', pair: null, error: 'unreadable response' };
      if (resp.status && (resp.status < 200 || resp.status >= 300)) {
        return { ok: false, source: 'fallback', pair: null, error: 'HTTP ' + resp.status };
      }
      return resp.json().then(function (j) {
        var pairs = (j && j.pairs) || [];
        var want = String(address).toLowerCase();
        var mine = pairs.filter(function (p) {
          return p.baseToken && String(p.baseToken.address || '').toLowerCase() === want;
        });
        if (!mine.length) return { ok: false, source: 'fallback', pair: null, error: 'no live pair for this contract' };
        mine.sort(function (a, b) { return ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0); });
        return { ok: true, source: 'live', pair: normalizeDexPair(mine[0]), error: null };
      }, function (e) { return { ok: false, source: 'fallback', pair: null, error: 'bad JSON: ' + e.message }; });
    }, function (e) {
      return { ok: false, source: 'fallback', pair: null, error: String(e && e.message ? e.message : e) };
    });
  }

  /* ---------------- chart: real series OR labelled model ---------- */
  /* Returns { points, path, min, max } in a 0–100 viewBox, or null
     when the series is too short to plot — the caller then renders
     the "—" empty state instead of inventing points. */
  function chartGeometry(series, width, height) {
    if (!Array.isArray(series) || series.length < 2) return null;
    var nums = series.filter(isNum);
    if (nums.length < 2) return null;
    var min = Math.min.apply(null, nums), max = Math.max.apply(null, nums);
    var span = (max - min) || 1;
    var w = width || 100, h = height || 100, pad = 4;
    var pts = nums.map(function (v, i) {
      var x = pad + (i / (nums.length - 1)) * (w - pad * 2);
      var y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, v: v };
    });
    var path = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y; }).join(' ');
    return { points: pts, path: path, min: min, max: max, count: nums.length };
  }
  /* kind: 'price' = caller-supplied REAL series (closes/OHLCV from a
     live feed the caller names in seriesSource). kind: 'model' =
     illustrative shape only. A model is never formatted as dollars
     and never captioned as price. */
  function buildChartHTML(series, opts) {
    opts = opts || {};
    var kind = opts.kind === 'model' ? 'model' : 'price';
    var source = sourceOf(opts);
    var geo = chartGeometry(series, 100, 56);
    var title = kind === 'model' ? MODEL_LABEL : 'Price chart';
    var axisNote = kind === 'model' ? 'Vertical axis: shape units (not dollars, not price)'
      : 'Vertical axis: price in USD';
    var seriesSource = opts.seriesSource
      ? escHtml(opts.seriesSource)
      : (kind === 'model' ? 'Deterministic model shape (this package)' : 'Caller-supplied series — see source badge');
    if (!geo) {
      return '<div class="hm-tv-chart hm-tv-chart-empty" role="img" aria-label="No chart data">' +
        '<div class="hm-tv-chart-head"><span class="hm-tv-chart-title">' + escHtml(title) + '</span>' + sourceBadge(source) + '</div>' +
        '<div class="hm-tv-chart-emptybody">—</div>' +
        '<p class="hm-tv-note">No series supplied, so no curve is drawn. A chart is left empty rather than drawn from invented data.</p>' +
        '<p class="hm-tv-source">Source: ' + seriesSource + ' · ' + escHtml(sourceLabel(source)) + '</p></div>';
    }
    var yLabel = kind === 'model' ? 'shape' : fmtPrice(geo.max);
    var yLabelLow = kind === 'model' ? 'shape' : fmtPrice(geo.min);
    return '<div class="hm-tv-chart" role="img" aria-label="' + escHtml(title) + ', ' + geo.count + ' points">' +
      '<div class="hm-tv-chart-head"><span class="hm-tv-chart-title">' + escHtml(title) + '</span>' + sourceBadge(source) + '</div>' +
      '<svg class="hm-tv-chart-svg" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="28" x2="100" y2="28" class="hm-tv-grid" />' +
      '<path class="hm-tv-chart-line" d="' + escHtml(geo.path) + '" fill="none" />' +
      '<circle class="hm-tv-chart-dot" cx="' + geo.points[geo.points.length - 1].x + '" cy="' + geo.points[geo.points.length - 1].y + '" r="2" />' +
      '</svg>' +
      '<div class="hm-tv-chart-axis"><span>' + escHtml(yLabel) + '</span><span>' + escHtml(axisNote) + '</span><span>' + escHtml(yLabelLow) + '</span></div>' +
      '<p class="hm-tv-source">Source: ' + seriesSource + ' · ' + escHtml(sourceLabel(source)) +
      (kind === 'model' ? ' · This model curve is not market price and is not a trade signal.' : '') + '</p></div>';
  }

  /* ---------------- bundle-flow diagram --------------------------- */
  /* bundles: [{ from, to, label, amountUsd }] — amountUsd may be null
     and then renders "—". Nodes are laid out deterministically in
     first-appearance order; no coordinates are invented from data
     that is not there. Empty input renders an explicit "—" state,
     never a fabricated flow. */
  function buildBundleDiagramHTML(bundles, opts) {
    opts = opts || {};
    var source = sourceOf(opts);
    var list = Array.isArray(bundles) ? bundles : [];
    var head = '<div class="hm-tv-bundles"><div class="hm-tv-chart-head">' +
      '<span class="hm-tv-chart-title">Bundle flows — wallets ↔ pools</span>' + sourceBadge(source) + '</div>';
    if (!list.length) {
      return head +
        '<div class="hm-tv-bundles-empty">—</div>' +
        '<p class="hm-tv-note">No bundle transfers supplied, so no flow is drawn. Bundles appear here only when a transfer list is supplied by the caller or a live feed.</p>' +
        '<p class="hm-tv-source">Source: ' + escHtml(opts.bundlesSource || 'No bundle source supplied') + ' · ' + escHtml(sourceLabel(source)) + '</p></div>';
    }
    var nodes = [], nodeIdx = {};
    list.forEach(function (b) {
      [b.from, b.to].forEach(function (n) {
        if (n && !(n in nodeIdx)) { nodeIdx[n] = nodes.length; nodes.push(n); }
      });
    });
    var W = 100, H = 56, xFor = function (i) { return 10 + (nodes.length <= 1 ? 40 : (i / (nodes.length - 1)) * 80); };
    var nodeY = function (i) { return i % 2 === 0 ? 14 : 42; };
    var edges = list.map(function (b, i) {
      var a = nodeIdx[b.from], c = nodeIdx[b.to];
      if (a == null || c == null || a === c) return '';
      var x1 = xFor(a), y1 = nodeY(a), x2 = xFor(c), y2 = nodeY(c);
      var mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 10;
      var d = 'M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + my + ' ' + x2 + ' ' + y2;
      return '<path class="hm-tv-flow" d="' + escHtml(d) + '" fill="none" data-bundle-index="' + i + '" />' +
        '<circle class="hm-tv-flow-dot" r="1.8" data-bundle-index="' + i + '">' +
        '<title>' + escHtml(b.label || (b.from + ' → ' + b.to)) + '</title></circle>';
    }).join('');
    var nodeEls = nodes.map(function (n, i) {
      var isPool = /pool|lp|pair/i.test(n);
      return '<g class="hm-tv-node" data-node="' + escHtml(n) + '">' +
        '<circle cx="' + xFor(i) + '" cy="' + nodeY(i) + '" r="4" class="' + (isPool ? 'hm-tv-node-pool' : 'hm-tv-node-wallet') + '" />' +
        '<text x="' + xFor(i) + '" y="' + (nodeY(i) + 11) + '" text-anchor="middle" class="hm-tv-node-label">' + escHtml(shortAddr(n)) + '</text></g>';
    }).join('');
    var rows = list.map(function (b) {
      return '<li class="hm-tv-field"><span class="hm-tv-field-label">' +
        escHtml(b.label || (shortAddr(b.from) + ' → ' + shortAddr(b.to))) + '</span>' +
        '<b class="hm-tv-field-value">' + (isNum(b.amountUsd) ? fmtUsd(b.amountUsd) : '—') + '</b></li>';
    }).join('');
    return head +
      '<svg class="hm-tv-bundle-svg" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animated bundle-flow diagram">' +
      edges + nodeEls + '</svg>' +
      '<ul class="hm-tv-fieldlist">' + rows + '</ul>' +
      '<p class="hm-tv-note">Animated diagram only: dots travel the arcs above to show direction of flow. Amounts shown are the supplied transfer amounts; a missing amount renders "—". This diagram is not a trade, fill, or balance.</p>' +
      '<p class="hm-tv-source">Source: ' + escHtml(opts.bundlesSource || 'Caller-supplied bundle list') + ' · ' + escHtml(sourceLabel(source)) + '</p></div>';
  }
  /* Browser-only animation: steps each .hm-tv-flow-dot along its arc
     with requestAnimationFrame. No-op (returns {started:false}) in
     a non-DOM environment or under prefers-reduced-motion, where the
     static diagram + CSS pulse already carry the meaning. */
  function animateBundles(container) {
    try {
      if (!container || typeof container.querySelectorAll !== 'function') return { started: false, reason: 'no DOM container' };
      if (typeof root.requestAnimationFrame !== 'function') return { started: false, reason: 'no requestAnimationFrame' };
      if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return { started: false, reason: 'prefers-reduced-motion' };
      }
      var paths = container.querySelectorAll('.hm-tv-flow');
      var dots = container.querySelectorAll('.hm-tv-flow-dot');
      if (!paths.length || !dots.length) return { started: false, reason: 'no flows in container' };
      var start = null, stopped = false;
      var getLen = function (p) { try { return p.getTotalLength(); } catch (e) { return 100; } };
      var getPt = function (p, d) { try { return p.getPointAtLength(d); } catch (e) { return { x: 0, y: 0 }; } };
      var step = function (now) {
        if (stopped) return;
        if (start === null) start = now;
        var t = ((now - start) % 4000) / 4000;
        dots.forEach(function (dot, i) {
          var p = paths[i % paths.length];
          var len = getLen(p);
          var pt = getPt(p, len * ((t + i * 0.13) % 1));
          dot.setAttribute('cx', String(pt.x));
          dot.setAttribute('cy', String(pt.y));
        });
        root.requestAnimationFrame(step);
      };
      root.requestAnimationFrame(step);
      return { started: true, stop: function () { stopped = true; } };
    } catch (e) {
      return { started: false, reason: String(e && e.message ? e.message : e) };
    }
  }

  /* ---------------- Token View panel ------------------------------ */
  function fieldRow(label, value, source, delay) {
    return '<li class="hm-tv-field" style="--hm-tv-delay:' + delay + 'ms">' +
      '<span class="hm-tv-field-label">' + escHtml(label) + '</span>' +
      '<b class="hm-tv-field-value">' + escHtml(value) + '</b>' +
      '<span class="hm-tv-field-source">Source: ' + escHtml(source) + '</span></li>';
  }
  function buildTokenPanelHTML(rawToken, opts) {
    opts = opts || {};
    var source = sourceOf(opts);
    var t = normalizeToken(rawToken);
    if (!t) {
      return '<section class="hm-tv-token" aria-label="Token view">' +
        '<div class="hm-tv-chart-head"><span class="hm-tv-chart-title">Token view</span>' + sourceBadge(source) + '</div>' +
        '<p class="hm-tv-note">No token supplied — every field below renders "—" until a token is passed in or a live read succeeds.</p>' +
        '<ul class="hm-tv-fieldlist">' +
        fieldRow('Price', '—', 'No token supplied', 0) +
        fieldRow('Liquidity', '—', 'No token supplied', 60) +
        fieldRow('Buys / sells (24h)', '—', 'No token supplied', 120) +
        fieldRow('Holder shape', '—', 'No token supplied', 180) +
        fieldRow('Age', '—', 'No token supplied', 240) +
        fieldRow('Links', '—', 'No token supplied', 300) +
        fieldRow('Custody signal', '—', 'No token supplied', 360) +
        '</ul>' +
        '<p class="hm-tv-source">Source: ' + escHtml(sourceLabel(source)) + '</p></section>';
    }
    var title = (t.name || t.symbol) ? escHtml((t.name || '') + (t.symbol ? ' ($' + t.symbol + ')' : '')) : 'Token view';
    var buysSells = (t.buys24h != null || t.sells24h != null)
      ? (fmtInt(t.buys24h) + ' buys / ' + fmtInt(t.sells24h) + ' sells')
      : '—';
    var buysSells1h = (t.buys1h != null || t.sells1h != null)
      ? ('1h: ' + fmtInt(t.buys1h) + ' buys / ' + fmtInt(t.sells1h) + ' sells')
      : null;
    var holder = t.holders != null
      ? (fmtInt(t.holders) + ' holders' + (t.holderTopSharePct != null ? ' · top holder ' + fmtPct(t.holderTopSharePct) : '') +
         (t.linkedGroups != null ? ' · ' + fmtInt(t.linkedGroups) + ' linked groups' : ''))
      : '—';
    var holderSource = t.holders != null
      ? 'Live gate · holder read (supplied with this token)'
      : 'Holder read not supplied — the live gate holder read is not in this view';
    var custody = t.custody || '—';
    var custodySource = t.custody
      ? 'Live gate · on-chain position read (supplied with this token)'
      : 'Custody not read in this view — the live gate proves custody on-chain before any buy';
    var links = [];
    (t.websites || []).forEach(function (w) { if (w && w.url) links.push('<a class="hm-tv-link" href="' + escHtml(w.url) + '" target="_blank" rel="noopener">' + escHtml(w.label || 'Website') + '</a>'); });
    (t.socials || []).forEach(function (s) { if (s && s.url) links.push('<a class="hm-tv-link" href="' + escHtml(s.url) + '" target="_blank" rel="noopener">' + escHtml(s.type || 'Social') + '</a>'); });
    if (t.pairUrl) links.push('<a class="hm-tv-link" href="' + escHtml(t.pairUrl) + '" target="_blank" rel="noopener">DexScreener pair</a>');
    var rows = '';
    rows += fieldRow('Price', fmtPrice(t.priceUsd), source === 'live' ? 'DexScreener public pairs API · live fetch in browser' : 'Bundled snapshot — no live price read', 0);
    rows += fieldRow('Liquidity', fmtUsd(t.liquidityUsd), source === 'live' ? 'DexScreener public pairs API · live fetch in browser' : 'Bundled snapshot — no live liquidity read', 60);
    rows += fieldRow('Volume 24h', fmtUsd(t.volume24hUsd), source === 'live' ? 'DexScreener public pairs API · live fetch in browser' : 'Bundled snapshot — no live volume read', 120);
    rows += fieldRow('Market cap / FDV', fmtUsd(t.marketCapUsd), source === 'live' ? 'DexScreener public pairs API · live fetch in browser' : 'Bundled snapshot — no live market-cap read', 180);
    rows += fieldRow('Buys / sells (24h)', buysSells + (buysSells1h ? ' · ' + buysSells1h : ''), source === 'live' ? 'DexScreener public pairs API · txns h24/h1' : 'Bundled snapshot — no live tape read', 240);
    rows += fieldRow('Price change 24h', fmtPct(t.priceChange24h), source === 'live' ? 'DexScreener public pairs API · priceChange h24' : 'Bundled snapshot — no live change read', 300);
    rows += fieldRow('Holder shape', holder, holderSource, 360);
    rows += fieldRow('Age', ageStr(t.pairCreatedAt) + (t.chainId ? ' · ' + t.chainId : '') + (t.dexId ? ' · ' + t.dexId : ''), source === 'live' ? 'DexScreener public pairs API · pairCreatedAt' : 'Bundled snapshot — no live age read', 420);
    rows += fieldRow('Custody signal', custody + (t.custodyNote ? ' — ' + t.custodyNote : ''), custodySource, 480);
    if (t.gateLabel) rows += fieldRow('Gate verdict (page gate, if supplied)', t.gateLabel + (t.gateScore != null ? ' · score ' + t.gateScore : ''), 'Page gate result supplied with this token — not computed here', 540);
    var linksRow = '<li class="hm-tv-field" style="--hm-tv-delay:600ms">' +
      '<span class="hm-tv-field-label">Links</span>' +
      '<span class="hm-tv-field-value">' + (links.length ? links.join(' · ') : '—') + '</span>' +
      '<span class="hm-tv-field-source">Source: ' + escHtml(source === 'live' ? 'DexScreener pair info block · live fetch in browser' : 'Bundled snapshot — no live links read') + '</span></li>';
    var desc = t.description ? '<p class="hm-tv-note">' + escHtml(t.description) + '</p>' : '';
    return '<section class="hm-tv-token" aria-label="Token view">' +
      '<div class="hm-tv-chart-head"><span class="hm-tv-chart-title">' + title + '</span>' + sourceBadge(source) + '</div>' +
      desc +
      '<ul class="hm-tv-fieldlist">' + rows + linksRow + '</ul>' +
      '<p class="hm-tv-note">Advisory only. HALEX-M holds no keys, signs nothing, moves no funds. Nothing here is a trade, a fill, or a balance.</p>' +
      '<p class="hm-tv-source">Source: ' + escHtml(sourceLabel(source)) + '</p></section>';
  }

  /* ---------------- Trading View panel ---------------------------- */
  function buildTradingPanelHTML(opts) {
    opts = opts || {};
    var source = sourceOf(opts);
    var chartKind = opts.chartKind === 'model' ? 'model' : 'price';
    var series = chartKind === 'model'
      ? (Array.isArray(opts.modelSeries) ? opts.modelSeries : SNAPSHOT.modelSeries)
      : (Array.isArray(opts.series) ? opts.series : null);
    var chart = buildChartHTML(series, {
      kind: chartKind, source: source,
      seriesSource: opts.seriesSource || (chartKind === 'model' ? 'Deterministic model shape (this package)' : 'Caller-supplied real series')
    });
    var bundles = buildBundleDiagramHTML(opts.bundles, { source: source, bundlesSource: opts.bundlesSource });
    return '<section class="hm-tv-trading" aria-label="Trading view">' +
      '<div class="hm-tv-chart-head"><span class="hm-tv-chart-title">Trading view — animated chart + bundle flows</span>' + sourceBadge(source) + '</div>' +
      '<p class="hm-tv-note">Aggressive, animated charting. A price curve appears only from a real series the caller supplies; otherwise the labelled MODEL shape is shown. Nothing here trades, fills, or moves funds.</p>' +
      chart + bundles +
      '<p class="hm-tv-source">Source: ' + escHtml(sourceLabel(source)) + '</p></section>';
  }

  /* ---------------- render / mount (DOM-guarded, additive) -------- */
  function setHTML(container, html) {
    if (!container || typeof container !== 'object') return false;
    try { container.innerHTML = html; return true; } catch (e) { return false; }
  }
  function resolveEl(target) {
    if (!target) return null;
    if (typeof target === 'object') return target;
    if (typeof target === 'string' && typeof root.document !== 'undefined' && root.document.getElementById) {
      return root.document.getElementById(target);
    }
    return null;
  }
  function renderTradingPanel(container, opts) {
    var el = resolveEl(container);
    if (!el) return false;
    var ok = setHTML(el, buildTradingPanelHTML(opts || {}));
    if (ok) animateBundles(el);
    return ok;
  }
  function renderTokenPanel(container, token, opts) {
    var el = resolveEl(container);
    if (!el) return false;
    return setHTML(el, buildTokenPanelHTML(token, opts || {}));
  }
  /* Merge-time mounts only — never auto-run on load. Each returns
     false (no throw) when its anchor is absent, so a missing anchor
     can never break the page. See MERGE-MAP.md for anchors. */
  function mountTradingPanel() {
    var host = resolveEl('hm-tv-trading-host');
    if (!host) return false;
    return renderTradingPanel(host, { source: 'fallback', chartKind: 'model' });
  }
  function mountTokenPanel(token, opts) {
    var host = resolveEl('hm-tv-token-host');
    if (!host) return false;
    return renderTokenPanel(host, token, opts || { source: 'fallback' });
  }
  /* Live refresh for one address: tries the public DexScreener read,
     renders the token panel + a model-or-price trading panel from the
     result, and ALWAYS labels the outcome. Never throws. */
  function refreshTokenPanel(container, address, fetchImpl) {
    var el = resolveEl(container);
    if (!el) return Promise.resolve(false);
    return fetchTokenLive(address, fetchImpl).then(function (res) {
      if (res.ok && res.pair) {
        return renderTokenPanel(el, res.pair, { source: 'live' });
      }
      renderTokenPanel(el, SNAPSHOT.token, { source: 'fallback' });
      return false;
    });
  }

  root.HalexMTradingView = {
    VERSION: VERSION,
    LIVE_LABEL: LIVE_LABEL, FALLBACK_LABEL: FALLBACK_LABEL, MODEL_LABEL: MODEL_LABEL,
    SNAPSHOT: SNAPSHOT,
    escHtml: escHtml, fmtUsd: fmtUsd, fmtPrice: fmtPrice, fmtInt: fmtInt, fmtPct: fmtPct, ageStr: ageStr,
    modelSeries: modelSeries, chartGeometry: chartGeometry,
    sourceBadge: sourceBadge, sourceLabel: sourceLabel,
    normalizeToken: normalizeToken, normalizeDexPair: normalizeDexPair,
    fetchTokenLive: fetchTokenLive,
    buildChartHTML: buildChartHTML, buildBundleDiagramHTML: buildBundleDiagramHTML,
    buildTokenPanelHTML: buildTokenPanelHTML, buildTradingPanelHTML: buildTradingPanelHTML,
    renderTradingPanel: renderTradingPanel, renderTokenPanel: renderTokenPanel,
    animateBundles: animateBundles,
    mountTradingPanel: mountTradingPanel, mountTokenPanel: mountTokenPanel,
    refreshTokenPanel: refreshTokenPanel
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.HalexMTradingView;
})();
