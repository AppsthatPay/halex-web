/* APEX² rendered results upgrade (STAGING 2026-11-03).
 *
 * More detail per result, deeper history, and the ordered upgrades:
 * - UNLIMITED chain movement record: no artificial cap. The full
 *   record stays retrievable; rendering pages through it (page size
 *   + cursor) so the page stays usable at any length.
 * - ANIMATED HOPS: a hop-by-hop playback state machine over the
 *   movement record (play / pause / step / reset, index + speed).
 *   Playback is a rendering of the record, never new data.
 * - Original funding sources, chain-life starting point, traceable
 *   funding, and a deeper analytical research section per search —
 *   all computed by halex-m-apex3.js from supplied records and
 *   rendered here.
 *
 * Pure logic + HTML strings (escaped). No DOM access, no network.
 * Browser global window.HalexMApex2Results; node via module.exports.
 */
(function (root) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function dash(v) { return (v == null || v === '') ? '—' : v; }

  function buildDetailSections(result, apex3) {
    // result: normalized APEX² result (from halex-m-apex2-multichain.js)
    // plus optional { graph, trace, lifeStart, flags }.
    // apex3: the APEX³ module (or null — sections then say so).
    var sections = [];
    sections.push({ title: 'Overview', body: [
      'Token: ' + dash(result.tokenName) + ' (' + dash(result.tokenSymbol) + ')',
      'Chain: ' + dash(result.chainId) + ' · Venue: ' + dash(result.dexId),
      'Price: ' + (result.priceUsd != null ? '$' + result.priceUsd : '—'),
      'Liquidity: ' + (result.liquidityUsd != null ? '$' + result.liquidityUsd : '—'),
      'Market cap: ' + (result.marketCap != null ? '$' + result.marketCap : '—'),
      'Volume 24h: ' + (result.volume24h != null ? '$' + result.volume24h : '—'),
      'Price change 24h: ' + (result.priceChange24h != null ? result.priceChange24h + '%' : '—'),
      'Buys/sells 24h: ' + (result.txns24h ? dash(result.txns24h.buys) + ' / ' + dash(result.txns24h.sells) : '—'),
      'Pair: ' + dash(result.pairUrl)
    ].join('\n') });
    if (result.info && (result.info.websites || result.info.socials)) {
      var sites = ((result.info.websites || []).map(function (w) { return w.url || w.label || w; })).join(', ');
      var socials = ((result.info.socials || []).map(function (s) { return (s.type || '') + ': ' + (s.url || ''); })).join(', ');
      sections.push({ title: 'Metadata (DexScreener info block)', body: 'Websites: ' + (sites || 'none found') + '\nSocials: ' + (socials || 'none found') });
    } else {
      sections.push({ title: 'Metadata (DexScreener info block)', body: 'No info block returned — name and symbol alone are not metadata.' });
    }
    if (apex3 && result.graph) {
      sections.push({ title: 'Funding — original sources', body: (result.trace && result.trace.ok)
        ? 'Origin: ' + result.trace.originAddress + ' (' + result.trace.hopCount + ' hop(s) back). ' + result.trace.trailEnds + '.'
        : 'Funding trace: not run — supply transfer records from a public chain read.' });
      sections.push({ title: 'Chain-life starting point', body: result.lifeStart
        ? (result.lifeStart.startTs != null ? new Date(result.lifeStart.startTs).toISOString() + ' (' + result.lifeStart.source + ')' : 'Unknown — ' + result.lifeStart.source)
        : 'Unknown — no events supplied.' });
      sections.push({ title: 'Deeper analytical research', body: apex3.analysisSection(result.graph, result.trace || null, result.lifeStart || null, result.flagCount || 0) });
    } else {
      sections.push({ title: 'Funding / history', body: 'Supply transfer records from a public chain read to fill funding sources, chain-life start, and the movement record. Nothing is shown until real records arrive.' });
    }
    return sections;
  }

  function pageMovementRecord(edges, pageSize, cursor) {
    // Unlimited record, paged rendering. edges: full hop list (any
    // length, no cap). cursor: start index (0 default). Returns the
    // page plus nextCursor (null when the record is exhausted) and
    // the total, so the UI can show "showing X–Y of Z" truthfully.
    var list = Array.isArray(edges) ? edges : [];
    var size = Math.max(1, Math.floor(pageSize) || 25);
    var start = Math.max(0, Math.floor(cursor) || 0);
    var page = list.slice(start, start + size);
    var next = (start + size < list.length) ? start + size : null;
    return { page: page, total: list.length, from: start, to: start + page.length, nextCursor: next, exhausted: next === null };
  }

  function createHopPlayback(edges) {
    // Animated-hop playback state machine over the movement record.
    var list = Array.isArray(edges) ? edges : [];
    var state = { index: -1, playing: false, speedMs: 900, done: list.length === 0 };
    function current() { return (state.index >= 0 && state.index < list.length) ? list[state.index] : null; }
    function step() {
      if (state.index + 1 >= list.length) { state.playing = false; state.done = true; return { hop: current(), state: snapshot() }; }
      state.index += 1;
      if (state.index + 1 >= list.length) state.done = true;
      return { hop: current(), state: snapshot() };
    }
    function play() { if (!list.length) return snapshot(); state.playing = true; state.done = false; return snapshot(); }
    function pause() { state.playing = false; return snapshot(); }
    function reset() { state.index = -1; state.playing = false; state.done = list.length === 0; return snapshot(); }
    function snapshot() { return { index: state.index, playing: state.playing, speedMs: state.speedMs, done: state.done, total: list.length, current: current() }; }
    function setSpeed(ms) { state.speedMs = Math.max(100, Math.floor(ms) || 900); return snapshot(); }
    return { step: step, play: play, pause: pause, reset: reset, snapshot: snapshot, setSpeed: setSpeed };
  }

  function renderDetailHTML(sections) {
    return sections.map(function (s) {
      return '<section class="hm-ar2-detail"><h3>' + esc(s.title) + '</h3><pre>' + esc(s.body) + '</pre></section>';
    }).join('\n');
  }

  var api = {
    buildDetailSections: buildDetailSections,
    pageMovementRecord: pageMovementRecord,
    createHopPlayback: createHopPlayback,
    renderDetailHTML: renderDetailHTML
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMApex2Results = api;
})(typeof window !== 'undefined' ? window : this);
