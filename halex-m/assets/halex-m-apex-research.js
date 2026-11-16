/* =====================================================================
   halex-m-apex-research.js — STAGING ONLY, NOT MERGED, NOT LIVE.
   APEX² Research: modernized APEX search + research-lab result
   renderer. Additive only: this file defines exactly one global,
   window.HalexMApexResearch, and redefines nothing the page already
   owns (showTab, toast, runLab and the rest are left untouched).

   What it does:
   - Fetches a token read from the public DexScreener API in the
     browser (token lookup by address, or search by ticker / query).
     No keys, no auth, no backend.
   - Renders animated result cards with graphical depth: a tape
     mini-chart (real buys/sells per window), an activity mini-chart
     (real price-change windows), a liquidity bar (current depth
     only), and a labelled MODEL exit-impact curve (see below).
   - Shows deeper token analysis in sections — token, liquidity,
     activity, links, custody signal, risk flags — that animate in
     progressively (CSS stagger; content is present from first paint,
     never hidden behind a timer).
   - Shows a visible depth meter per result: which checks ran
     (metadata, links, liquidity, tape, custody) and which are still
     pending. The meter is a checklist, NEVER a score: it carries no
     percentage, no total, and no verdict.

   Honesty rules, enforced in code (same contract as the staged
   Chaintarium live-feed files):
   - Every data surface carries a LIVE or FALLBACK label in plain
     words. LIVE = public feeds fetched in the browser. FALLBACK =
     bundled snapshot, labelled as such, used only when the live
     fetch fails (or before the first live read).
   - Charts plot REAL series or LABELED MODELS only. The tape and
     activity mini-charts plot numbers actually returned by
     DexScreener for this pair. The exit-impact curve is a MODEL:
     it is computed from current liquidity with its formula shown,
     labelled MODEL on the chart itself, and NEVER presented as
     price. With no price-history series supplied, no price curve
     is drawn at all — the price area says so and shows "—".
   - Missing data renders as "—". An unrun check renders as
     "not checked", never as a pass. Custody is ALWAYS "not checked"
     here: LP custody is proven on-chain in the live gate, not in
     this browser view, so this renderer never claims it.
   - Evidence is sorted newest first, and evidence older than
     15 minutes (or any bundled snapshot) is marked stale.
   - This renderer issues NO gate verdict and NO score. Risk flags
     below are factual observations from the read data (for
     example, "no sells in 24h"), not a verdict about the token.
   - HALEX-M holds no keys, signs nothing, moves no funds. No live
     execution wiring exists in this file. Nothing here is a trade,
     a paper record presented as a trade, or a real result.
   - The in-app name is APEX² Research throughout. No other
     product or engine name appears in any user-visible string.
   ===================================================================== */
(function (root) {
  'use strict';

  /* ---------- labels (user-visible, plain words) ---------- */
  var LIVE_LABEL = 'LIVE — public feeds fetched in this browser';
  var FALLBACK_LABEL = 'FALLBACK — bundled snapshot, not live data';
  var MISSING = '—';
  var NOT_CHECKED = 'not checked';
  var STALE_MS = 15 * 60 * 1000; /* evidence older than this is stale */

  /* ---------- small helpers (module-private, not globals) ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function isNum(v) { return v != null && isFinite(Number(v)); }
  function fmtUsd(v) {
    if (!isNum(v)) return MISSING;
    var n = Number(v);
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }
  function fmtPrice(v) {
    if (!isNum(v)) return MISSING;
    var n = Number(v);
    if (n === 0) return '$0';
    if (Math.abs(n) < 0.0001) return '$' + n.toExponential(2);
    return '$' + n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }
  function fmtPct(v) {
    if (!isNum(v)) return MISSING;
    return Number(v).toFixed(1) + '%';
  }
  function fmtCount(v) {
    if (!isNum(v)) return MISSING;
    return Math.round(Number(v)).toLocaleString('en-US');
  }
  function fmtTime(ts) {
    if (!ts) return MISSING;
    var d = new Date(ts);
    if (isNaN(d.getTime())) return MISSING;
    return String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  }
  function isStale(fetchedAt, nowMs) {
    if (!fetchedAt) return true;
    var now = (nowMs != null) ? nowMs : Date.now();
    return (now - new Date(fetchedAt).getTime()) > STALE_MS;
  }
  /* Newest evidence first. Items without a timestamp sort last. */
  function sortEvidenceNewestFirst(evidence) {
    return (evidence || []).slice().sort(function (a, b) {
      var ta = a && a.ts ? new Date(a.ts).getTime() : 0;
      var tb = b && b.ts ? new Date(b.ts).getTime() : 0;
      return tb - ta;
    });
  }

  /* ---------- bundled snapshot (FALLBACK ONLY) ----------
     This is layout / first-paint / fetch-failure cover, exactly as
     in the staged live-feed contract. It is a clearly labelled
     example record — not a live read of any real token, and it is
     never presented as one. Every surface that renders it carries
     the FALLBACK label, and it is marked stale on arrival. */
  var SNAPSHOT = {
    snapshotDate: '2026-11-01',
    note: 'Bundled snapshot example — for layout and fetch-failure cover only.',
    pair: {
      chainId: 'base', dexId: 'example-venue',
      baseToken: { name: 'Bundled snapshot example', symbol: 'EXAMPLE',
        address: '0x0000000000000000000000000000000000000000' },
      priceUsd: null, liquidity: { usd: 42000 },
      volume: { h24: 91000 },
      txns: { m5: { buys: 2, sells: 1 }, h1: { buys: 18, sells: 11 },
        h6: { buys: 90, sells: 64 }, h24: { buys: 310, sells: 240 } },
      priceChange: { h1: 1.2, h6: -3.4, h24: 5.6 },
      info: { websites: [], socials: [], description: '' },
      pairCreatedAt: null, url: ''
    }
  };

  /* ---------- normalize one DexScreener pair into evidence ---------- */
  function buildResult(pair, opts) {
    opts = opts || {};
    var source = opts.source || 'live';
    var fetchedAt = opts.fetchedAt || new Date().toISOString();
    var stale = (source === 'fallback') || isStale(fetchedAt);
    var p = pair || {};
    var base = p.baseToken || {};
    var liq = (p.liquidity && p.liquidity.usd != null) ? Number(p.liquidity.usd) : null;
    var txns = p.txns || {};
    function tx(windowKey) {
      var w = txns[windowKey] || {};
      return { buys: isNum(w.buys) ? w.buys : null,
        sells: isNum(w.sells) ? w.sells : null };
    }
    var tape = { m5: tx('m5'), h1: tx('h1'), h6: tx('h6'), h24: tx('h24') };
    var pc = p.priceChange || {};
    var webs = ((p.info && p.info.websites) || []).map(function (w) { return w.url || w.label || ''; }).filter(Boolean);
    var socials = ((p.info && p.info.socials) || []).map(function (s) { return ((s.type || '') + ' ' + (s.url || '')).trim(); }).filter(Boolean);
    var hasDesc = !!(p.info && p.info.description && String(p.info.description).trim());
    var census = opts.census || null; /* {count, bestOtherLiq} or null = not run */

    /* Depth meter: done / pending / not checked. Never a score. */
    var depth = [
      { key: 'metadata', label: 'Metadata', status: (base.name || base.symbol) ? 'done' : 'not checked',
        detail: base.name ? (base.name + ' ($' + (base.symbol || MISSING) + ')') : NOT_CHECKED },
      { key: 'links', label: 'Links', status: (webs.length || socials.length) ? 'done' : 'not checked',
        detail: (webs.length || socials.length) ? (webs.length + ' website(s) · ' + socials.length + ' social link(s)') : 'no verifiable link in the pair info block' },
      { key: 'liquidity', label: 'Liquidity', status: isNum(liq) ? 'done' : 'not checked',
        detail: isNum(liq) ? fmtUsd(liq) : NOT_CHECKED },
      { key: 'tape', label: 'Tape', status: (tape.h24.buys != null || tape.h24.sells != null) ? 'done' : 'not checked',
        detail: (tape.h24.buys != null || tape.h24.sells != null)
          ? (fmtCount(tape.h24.buys) + ' buys · ' + fmtCount(tape.h24.sells) + ' sells (24h)') : NOT_CHECKED },
      /* Custody is never claimed in this view — see header. */
      { key: 'custody', label: 'Custody', status: 'not checked',
        detail: NOT_CHECKED + ' — proven on-chain in the live gate, not in this view' }
    ];
    if (opts.pending) {
      depth.forEach(function (d) { if (d.status === 'not checked') d.status = 'pending'; });
    }

    /* Risk flags: factual observations only, never a verdict. */
    var flags = [];
    if (tape.h24.buys != null && tape.h24.sells === 0 && tape.h24.buys >= 10) {
      flags.push({ text: 'No sells in 24h despite ' + tape.h24.buys + ' buys — an exit route is not demonstrated in this read window.',
        evidence: fmtCount(tape.h24.buys) + ' buys · 0 sells (24h)' });
    }
    if (isNum(liq) && liq < 5000) {
      flags.push({ text: 'Pool below the $5,000 depth floor used by the desk — selling at size is the risk here, not buying.',
        evidence: fmtUsd(liq) });
    }
    if (!webs.length && !socials.length) {
      flags.push({ text: 'No verifiable website or social link in the pair info block.',
        evidence: 'no website · 0 socials' });
    }
    if (census && census.mimic) {
      flags.push({ text: 'Same-ticker census: a deeper pool trades under this exact ticker elsewhere.',
        evidence: fmtCount(census.count) + ' contracts · deeper pool ' + fmtUsd(census.bestOtherLiq) });
    }
    if (!flags.length) {
      flags.push({ text: 'No risk flag raised by the reads above. That is not a pass: unrun checks are still unrun.',
        evidence: 'flags: none from this read' });
    }

    /* MODEL exit-impact curve: computed from current liquidity.
       Formula (same shape as the desk's modelled exit read):
       impact(size) = size / (liquidity/2 + size) x 100.
       Labelled MODEL everywhere it appears; never a price. */
    var modelSizes = [100, 500, 1000, 5000];
    var model = modelSizes.map(function (size) {
      return { size: size,
        impactPct: isNum(liq) ? (size / (liq / 2 + size) * 100) : null,
        kind: 'MODEL' };
    });

    var evidence = sortEvidenceNewestFirst([
      { ts: fetchedAt, label: 'Pair read', value: (p.dexId || MISSING) + ' on ' + (p.chainId || MISSING) },
      { ts: fetchedAt, label: 'Price', value: fmtPrice(p.priceUsd != null ? Number(p.priceUsd) : null) },
      { ts: fetchedAt, label: 'Liquidity', value: fmtUsd(liq) },
      { ts: fetchedAt, label: 'Volume 24h', value: fmtUsd(p.volume ? p.volume.h24 : null) },
      { ts: fetchedAt, label: 'Tape 24h', value: (tape.h24.buys != null || tape.h24.sells != null)
        ? (fmtCount(tape.h24.buys) + ' buys · ' + fmtCount(tape.h24.sells) + ' sells') : MISSING }
    ]);

    return {
      source: source, fetchedAt: fetchedAt, stale: stale,
      label: source === 'fallback' ? FALLBACK_LABEL : LIVE_LABEL,
      token: { name: base.name || null, symbol: base.symbol || null,
        address: base.address || null, chainId: p.chainId || null, dexId: p.dexId || null,
        pairUrl: p.url || null },
      price: fmtPrice(p.priceUsd != null ? Number(p.priceUsd) : null),
      priceRaw: isNum(p.priceUsd) ? Number(p.priceUsd) : null,
      liquidity: fmtUsd(liq), liquidityRaw: liq,
      volume24h: fmtUsd(p.volume ? p.volume.h24 : null),
      tape: tape, priceChange: { h1: pc.h1 != null ? pc.h1 : null,
        h6: pc.h6 != null ? pc.h6 : null, h24: pc.h24 != null ? pc.h24 : null },
      websites: webs, socials: socials, hasDescription: hasDesc,
      census: census, depth: depth, flags: flags,
      modelExitImpact: model, evidence: evidence
    };
  }

  /* ---------- mini-charts as inline SVG (real series only) ---------- */
  function barsSVG(values, labels, title) {
    /* values: [{buys, sells}] or [number|null]; missing -> gap, never 0-filled silently. */
    var W = 280, H = 64, max = 1;
    values.forEach(function (v) {
      if (v && typeof v === 'object') { max = Math.max(max, v.buys || 0, v.sells || 0); }
      else if (isNum(v)) { max = Math.max(max, Math.abs(v)); }
    });
    var bw = W / Math.max(1, values.length);
    var bars = values.map(function (v, i) {
      var x = i * bw + 4;
      if (v && typeof v === 'object') {
        var bh = (v.buys || 0) / max * (H - 14);
        var sh = (v.sells || 0) / max * (H - 14);
        return '<rect x="' + x.toFixed(1) + '" y="' + (H - 8 - bh).toFixed(1) + '" width="8" height="' + bh.toFixed(1) + '" fill="#2dd4bf"/>' +
          '<rect x="' + (x + 10).toFixed(1) + '" y="' + (H - 8 - sh).toFixed(1) + '" width="8" height="' + sh.toFixed(1) + '" fill="#f59e0b"/>';
      }
      if (isNum(v)) {
        var h = Math.abs(v) / max * (H - 14);
        var col = v >= 0 ? '#31c48d' : '#ef4444';
        return '<rect x="' + x.toFixed(1) + '" y="' + (H - 8 - h).toFixed(1) + '" width="' + Math.max(6, bw - 10).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + col + '"/>';
      }
      return '<text x="' + (x + 6).toFixed(1) + '" y="' + (H - 10) + '" fill="#9aa3b5" font-size="10" text-anchor="middle">' + MISSING + '</text>';
    }).join('');
    var labs = labels.map(function (l, i) {
      return '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (H - 0) + '" fill="#9aa3b5" font-size="9" text-anchor="middle">' + esc(l) + '</text>';
    }).join('');
    return '<svg class="hm-ar-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '">' + bars + labs + '</svg>';
  }
  function modelCurveSVG(model) {
    /* MODEL curve: exit size (x) vs modelled impact % (y). Labelled MODEL on the chart. */
    var W = 280, H = 64, max = 1;
    model.forEach(function (m) { if (isNum(m.impactPct)) max = Math.max(max, m.impactPct); });
    var pts = model.map(function (m, i) {
      var x = 8 + i * ((W - 16) / Math.max(1, model.length - 1));
      var y = isNum(m.impactPct) ? (H - 14 - (m.impactPct / max) * (H - 22)) : (H - 14);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg class="hm-ar-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="MODEL exit-impact curve, not price">' +
      '<polyline points="' + pts + '" fill="none" stroke="#b45cff" stroke-width="2"/>' +
      '<text x="8" y="12" fill="#b45cff" font-size="10" font-weight="700">MODEL — not price</text></svg>';
  }

  /* ---------- rendering (HTML string; caller injects it) ---------- */
  function depthMeterHTML(depth, sourceLabel) {
    var rows = depth.map(function (d) {
      var cls = d.status === 'done' ? 'hm-ar-done' : d.status === 'pending' ? 'hm-ar-pending' : 'hm-ar-unrun';
      var mark = d.status === 'done' ? '●' : d.status === 'pending' ? '◐' : '○';
      return '<li class="hm-ar-depth-item ' + cls + '"><span class="hm-ar-depth-mark" aria-hidden="true">' + mark + '</span>' +
        '<b>' + esc(d.label) + '</b><span class="hm-ar-depth-status">' + esc(d.status === 'done' ? 'checked' : d.status === 'pending' ? 'pending' : NOT_CHECKED) + '</span>' +
        '<span class="hm-ar-depth-detail">' + esc(d.detail) + '</span></li>';
    }).join('');
    return '<div class="hm-ar-depth"><div class="hm-ar-depth-head"><b>Depth meter</b>' +
      '<span class="hm-ar-source">' + esc(sourceLabel) + '</span></div>' +
      '<p class="hm-ar-note">Which checks ran — not a score, not a verdict. An unrun check is never a pass.</p>' +
      '<ul class="hm-ar-depth-list">' + rows + '</ul></div>';
  }
  function sectionHTML(title, inner, index) {
    return '<section class="hm-ar-section" style="--hm-ar-delay:' + (index * 90) + 'ms">' +
      '<h4 class="hm-ar-section-title">' + esc(title) + '</h4>' + inner + '</section>';
  }
  function renderResult(result) {
    if (!result) {
      return '<div class="hm-ar-card"><p class="hm-ar-note">No result to show — run a search first.</p>' +
        '<span class="hm-ar-source">' + esc(FALLBACK_LABEL) + '</span></div>';
    }
    var t = result.token || {};
    var tapeVals = [result.tape.m5, result.tape.h1, result.tape.h6, result.tape.h24];
    var tapeLabels = ['5m', '1h', '6h', '24h'];
    var pcVals = [result.priceChange.h1, result.priceChange.h6, result.priceChange.h24];
    var staleBadge = result.stale
      ? '<span class="hm-ar-stale">stale — re-run for a fresh read (last read ' + esc(fmtTime(result.fetchedAt)) + ')</span>'
      : '<span class="hm-ar-fresh">fresh read ' + esc(fmtTime(result.fetchedAt)) + '</span>';
    var linksInner = '';
    if (result.websites.length) linksInner += '<p>Websites: ' + result.websites.map(function (u) { return '<a class="hm-ar-link" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + '</a>'; }).join(' · ') + '</p>';
    if (result.socials.length) linksInner += '<p>Socials: ' + esc(result.socials.join(' · ')) + '</p>';
    if (!result.websites.length && !result.socials.length) linksInner += '<p>No verifiable link in the pair info block — ' + NOT_CHECKED + ' as a pass, and treated as a flag below.</p>';
    linksInner += '<p class="hm-ar-note">Description present: ' + (result.hasDescription ? 'yes' : MISSING) + '</p>';
    var evidenceInner = '<ol class="hm-ar-evidence">' + result.evidence.map(function (e) {
      return '<li><b>' + esc(e.label) + '</b> <span>' + esc(e.value) + '</span> <span class="hm-ar-ev-time">' + esc(fmtTime(e.ts)) + '</span></li>';
    }).join('') + '</ol><p class="hm-ar-note">Newest evidence first.</p>';
    var flagsInner = result.flags.map(function (f) {
      return '<div class="hm-ar-flag"><b>' + esc(f.text) + '</b><span class="hm-ar-ev">' + esc(f.evidence) + '</span></div>';
    }).join('');
    var modelInner = '<p class="hm-ar-note">MODEL — modelled exit impact from current liquidity. Formula: impact = size / (liquidity / 2 + size) × 100. This curve is a model, not price, and not a promise about any exit.</p>' +
      modelCurveSVG(result.modelExitImpact) +
      '<p class="hm-ar-model-vals">' + result.modelExitImpact.map(function (m) {
        return 'Sell ' + fmtUsd(m.size) + ': ' + (isNum(m.impactPct) ? m.impactPct.toFixed(1) + '%' : MISSING) + ' (MODEL)';
      }).join(' · ') + '</p>';
    var priceInner = result.priceRaw != null
      ? '<p class="hm-ar-big">' + esc(result.price) + '</p><p class="hm-ar-note">Price from the pair read. No price-history curve is drawn here: with no price-history series supplied, a price curve would be invented.</p>'
      : '<p class="hm-ar-big">' + MISSING + '</p><p class="hm-ar-note">No price read — no price curve is drawn, rather than drawn from invented data.</p>';
    function sec(title, inner, index) {
      return sectionHTML(title, inner + '<p class="hm-ar-note">Source: ' + esc(result.label) + '</p>', index);
    }
    var html = '<article class="hm-ar-card">' +
      '<header class="hm-ar-head"><div><p class="hm-ar-eyebrow">APEX² Research</p><h3 class="hm-ar-title">' + esc(t.name || MISSING) + ' ' +
        '<span class="hm-ar-sym">$' + esc(t.symbol || MISSING) + '</span></h3>' +
        '<p class="hm-ar-sub">' + esc(t.chainId || MISSING) + ' · ' + esc(t.dexId || MISSING) + '</p>' +
        '<p class="hm-ar-addr">' + esc(t.address || MISSING) + '</p></div>' +
        '<span class="hm-ar-source">' + esc(result.label) + '</span></header>' +
      '<div class="hm-ar-freshrow">' + staleBadge + '</div>' +
      depthMeterHTML(result.depth, result.label) +
      sec('Token', priceInner + '<p>Contract: ' + esc(t.address || MISSING) + '</p>' +
        (t.pairUrl ? '<p><a class="hm-ar-link" href="' + esc(t.pairUrl) + '" target="_blank" rel="noopener">View pair on DexScreener</a></p>' : ''), 0) +
      sec('Liquidity', '<p class="hm-ar-big">' + esc(result.liquidity) + '</p>' +
        '<p>Volume 24h: ' + esc(result.volume24h) + '</p>' + modelInner, 1) +
      sec('Activity — buy/sell tape (real counts)', '<p class="hm-ar-note">Real buys/sells returned by DexScreener per window. Teal = buys, amber = sells. ' + esc(result.label) + '.</p>' +
        barsSVG(tapeVals, tapeLabels, 'Buy/sell tape, real counts per window') +
        '<p>24h: ' + esc(fmtCount(result.tape.h24.buys)) + ' buys · ' + esc(fmtCount(result.tape.h24.sells)) + ' sells</p>', 2) +
      sec('Activity — price change (real windows)', '<p class="hm-ar-note">Real price-change windows returned by DexScreener. Green = up, red = down. ' + esc(result.label) + '.</p>' +
        barsSVG(pcVals, ['1h', '6h', '24h'], 'Price change, real windows') +
        '<p>1h ' + esc(fmtPct(result.priceChange.h1)) + ' · 6h ' + esc(fmtPct(result.priceChange.h6)) + ' · 24h ' + esc(fmtPct(result.priceChange.h24)) + '</p>', 3) +
      sec('Links', linksInner, 4) +
      sec('Custody signal', '<p>Custody: ' + NOT_CHECKED + '</p>' +
        '<p class="hm-ar-note">LP custody is proven on-chain in the live gate, not in this view. Nothing here claims a custody result.</p>', 5) +
      sec('Risk flags (observations, not a verdict)', flagsInner +
        '<p class="hm-ar-note">This renderer issues no gate verdict and no score. Flags above are observations from the read data only.</p>', 6) +
      sec('Evidence (newest first)', evidenceInner, 7) +
      '<p class="hm-ar-foot">HALEX-M holds no keys, signs nothing, moves no funds. Advisory only — not a trade, not a recommendation.</p>' +
      '</article>';
    return html;
  }
  function renderSkeleton() {
    return '<div class="hm-ar-card" aria-busy="true"><div class="hm-ar-skeleton"></div><div class="hm-ar-skeleton"></div>' +
      '<p class="hm-ar-note">Reading live data… checks show as pending until each read lands.</p></div>';
  }

  /* ---------- live fetch (browser fetch of public endpoints only) ---------- */
  function pickPair(j, address) {
    var pairs = (j && j.pairs) || [];
    if (!pairs.length) return null;
    if (address) {
      var want = String(address).toLowerCase();
      var mine = pairs.filter(function (p) { return p.baseToken && String(p.baseToken.address || '').toLowerCase() === want; });
      if (mine.length) {
        mine.sort(function (a, b) { return ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0); });
        return mine[0];
      }
    }
    pairs.sort(function (a, b) { return ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0); });
    return pairs[0];
  }
  function fetchImplOf(impl) {
    if (impl) return impl;
    if (typeof root.fetch !== 'undefined') return root.fetch.bind(root);
    return null;
  }
  /* Returns a Promise of a normalized result. Any failure -> FALLBACK
     snapshot result, never a throw, never an invented live read. */
  function searchToken(query, fetchImpl, opts) {
    opts = opts || {};
    var f = fetchImplOf(fetchImpl);
    var q = String(query || '').trim();
    if (!q) return Promise.resolve(buildResult(null, { source: 'fallback', fetchedAt: new Date().toISOString() }));
    var isAddr = q.length >= 32 && !/\s/.test(q);
    var url = isAddr
      ? 'https://api.dexscreener.com/latest/dex/tokens/' + encodeURIComponent(q)
      : 'https://api.dexscreener.com/latest/dex/search?q=' + encodeURIComponent(q);
    if (!f) return Promise.resolve(snapshotResult());
    var fallback = function () { return snapshotResult(); };
    return f(url).then(function (r) {
      if (!r || typeof r.json !== 'function') return fallback();
      if (r.status && (r.status < 200 || r.status >= 300)) return fallback();
      return r.json().then(function (j) {
        var pair = pickPair(j, isAddr ? q : null);
        if (!pair) return fallback();
        var sym = pair.baseToken && pair.baseToken.symbol;
        if (!sym || opts.skipCensus) {
          return buildResult(pair, { source: 'live', fetchedAt: new Date().toISOString() });
        }
        /* Ticker census (second public read): how many contracts share
           the ticker, and how deep is the deepest other pool? If this
           read fails, census stays null = not checked, not a pass. */
        return f('https://api.dexscreener.com/latest/dex/search?q=' + encodeURIComponent(sym))
          .then(function (r2) { return r2.json(); })
          .then(function (sj) {
            var deepest = {};
            (sj.pairs || []).forEach(function (pr) {
              if (!pr.baseToken || pr.baseToken.symbol !== sym) return;
              var a = pr.baseToken.address, l = (pr.liquidity && pr.liquidity.usd) || 0;
              if (deepest[a] == null || l > deepest[a]) deepest[a] = l;
            });
            var addrs = Object.keys(deepest);
            var thisAddr = String(pair.baseToken.address || '').toLowerCase();
            var thisLiq = (pair.liquidity && pair.liquidity.usd) || 0;
            var bestOther = 0;
            addrs.forEach(function (a) { if (a.toLowerCase() !== thisAddr && deepest[a] > bestOther) bestOther = deepest[a]; });
            var census = { count: Math.max(1, addrs.length), bestOtherLiq: bestOther,
              mimic: bestOther >= 50000 && bestOther >= 10 * Math.max(thisLiq, 1) };
            return buildResult(pair, { source: 'live', fetchedAt: new Date().toISOString(), census: census });
          })
          .catch(function () {
            return buildResult(pair, { source: 'live', fetchedAt: new Date().toISOString(), census: null });
          });
      }, fallback);
    }, fallback);
  }
  function snapshotResult() {
    var r = buildResult(SNAPSHOT.pair, { source: 'fallback', fetchedAt: new Date().toISOString() });
    r.snapshotNote = SNAPSHOT.note;
    r.snapshotDate = SNAPSHOT.snapshotDate;
    return r;
  }

  /* ---------- mounting (additive; caller passes its own elements) ----------
     mountSearch({input, button, output}) wires a search box to the
     renderer without touching any page global. The merge wires it to
     the APEX² Research Lab input/output (or to a new card in
     tab-research) — see MERGE-MAP.md. No mount runs on load. */
  function mountSearch(opts) {
    opts = opts || {};
    var doc = (typeof document !== 'undefined') ? document : null;
    if (!doc) return null;
    var input = opts.input || null, button = opts.button || null, output = opts.output || null;
    if (!input || !button || !output) return null;
    function go() {
      var q = input.value ? input.value.trim() : '';
      if (!q) { output.innerHTML = '<p class="hm-ar-note">Paste a contract address or a ticker first.</p>'; return; }
      output.innerHTML = renderSkeleton();
      searchToken(q).then(function (result) {
        output.innerHTML = renderResult(result);
      });
    }
    button.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); }
    });
    return { run: go, searchToken: searchToken, renderResult: renderResult };
  }

  /* The single global this file defines. Everything else is private. */
  root.HalexMApexResearch = {
    VERSION: '20261101-staging',
    LIVE_LABEL: LIVE_LABEL, FALLBACK_LABEL: FALLBACK_LABEL,
    MISSING: MISSING, NOT_CHECKED: NOT_CHECKED, STALE_MS: STALE_MS,
    formatUsd: fmtUsd, formatPrice: fmtPrice, formatPct: fmtPct, formatCount: fmtCount,
    isStale: isStale, sortEvidenceNewestFirst: sortEvidenceNewestFirst,
    buildResult: buildResult, renderResult: renderResult, renderSkeleton: renderSkeleton,
    depthMeterHTML: depthMeterHTML, barsSVG: barsSVG, modelCurveSVG: modelCurveSVG,
    searchToken: searchToken, snapshotResult: snapshotResult,
    snapshot: SNAPSHOT, mountSearch: mountSearch
  };
})(typeof window !== 'undefined' ? window : globalThis);
