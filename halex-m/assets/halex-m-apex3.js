/* APEX³ — deep research and investigative system (STAGING 2026-11-03).
 *
 * Tracks theft and stolen items across transactions. It works on
 * transfer records supplied by the host (from public chain reads) plus
 * the Chaintarium theft-wallet markers: it builds a hop graph, flags
 * stolen items and theft wallets, walks funding back to its origin,
 * and reports the starting point of a chain of movement.
 *
 * Honesty rules:
 * - A flag is an INVESTIGATION FLAG, not a verdict: it says an
 *   address or item was reported stolen, with the report source
 *   labeled. It never claims law-enforcement action, an exchange
 *   freeze, or recovered funds.
 * - Funding sources are traced from SUPPLIED transfers only. If the
 *   trail runs out, the trace says "trail ends here" with the last
 *   known hop — it never invents an earlier hop.
 * - Chain-life start = the earliest event in the supplied record
 *   (pair creation or first transfer), labeled with its source.
 * - No custody, price, or balance claim is computed from thin
 *   evidence; missing data renders as "not checked", never a number.
 *
 * Pure logic, no DOM, no network. Browser global window.HalexMApex3;
 * node via module.exports.
 */
(function (root) {
  'use strict';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function buildHopGraph(transfers) {
    // transfers: [{ tx, from, to, amount, token, chain, ts }] — the
    // host supplies these from public chain reads. Sorted by ts.
    var list = (Array.isArray(transfers) ? transfers.slice() : []).filter(function (t) { return t && t.from && t.to; });
    list.sort(function (a, b) { return (Number(a.ts) || 0) - (Number(b.ts) || 0); });
    var nodes = {};
    var edges = [];
    list.forEach(function (t, i) {
      if (!nodes[t.from]) nodes[t.from] = { address: t.from, hopsOut: 0, hopsIn: 0 };
      if (!nodes[t.to]) nodes[t.to] = { address: t.to, hopsOut: 0, hopsIn: 0 };
      nodes[t.from].hopsOut += 1;
      nodes[t.to].hopsIn += 1;
      edges.push({ index: i, tx: t.tx || null, from: t.from, to: t.to, amount: (t.amount != null) ? Number(t.amount) : null, token: t.token || null, chain: t.chain || null, ts: t.ts || null });
    });
    return { nodes: nodes, edges: edges, hopCount: edges.length };
  }

  function flagTheft(flags, address, reason, source) {
    // flags: { address -> { reason, source } } record. Returns a new
    // record; the caller owns persistence. Source is always labeled
    // (e.g. "Chaintarium theft-wallet marker", "user report").
    var out = clone(flags || {});
    if (!address || !reason) return { ok: false, error: 'flag requires an address and a reason', flags: out };
    out[String(address)] = { reason: reason, source: source || 'unlabeled report', flaggedAt: new Date().toISOString() };
    return { ok: true, flags: out };
  }

  function traceFunding(graph, startAddress) {
    // Walk BACKWARD from startAddress through the hop graph to the
    // earliest funding hop reachable from supplied transfers. If the
    // trail ends, say so — never invent an earlier hop.
    if (!graph || !startAddress) return { ok: false, error: 'trace requires a graph and a start address' };
    var path = [];
    var current = String(startAddress);
    var seen = {};
    var guard = 0;
    while (guard < 10000) {
      guard += 1;
      if (seen[current]) break; // loop: stop, do not spin
      seen[current] = true;
      var inbound = null;
      for (var i = graph.edges.length - 1; i >= 0; i--) {
        if (graph.edges[i].to === current) { inbound = graph.edges[i]; break; }
      }
      if (!inbound) break;
      path.unshift(inbound);
      current = inbound.from;
    }
    return {
      ok: true, startAddress: String(startAddress),
      originAddress: path.length ? path[0].from : String(startAddress),
      hopCount: path.length, path: path,
      trailEnds: path.length ? 'trail ends at earliest supplied transfer' : 'no supplied transfers reach this address'
    };
  }

  function chainLifeStart(graph, pairCreatedAt) {
    // Earliest event in the supplied record. pairCreatedAt (DexScreener)
    // or the first transfer's ts, whichever is earlier and present.
    var firstTs = null;
    var source = null;
    if (pairCreatedAt != null) { firstTs = Number(pairCreatedAt); source = 'pair creation (DexScreener pairCreatedAt)'; }
    if (graph && graph.edges.length) {
      var t = Number(graph.edges[0].ts);
      if (!isNaN(t) && (firstTs == null || t < firstTs)) { firstTs = t; source = 'first supplied transfer'; }
    }
    return { startTs: firstTs, source: source || 'no events supplied' };
  }

  function trackStolenItem(graph, flags, itemAddress) {
    // Follow one flagged item/address through the hop graph: every hop
    // that touches it, in order, plus whether each hop endpoint is
    // itself flagged. An unflagged item still traces; the trace just
    // says it is not flagged.
    var hops = (graph && graph.edges ? graph.edges : []).filter(function (e) { return e.from === itemAddress || e.to === itemAddress; });
    var flag = flags ? flags[String(itemAddress)] : null;
    return {
      item: String(itemAddress),
      flagged: !!flag, flagReason: flag ? flag.reason : null, flagSource: flag ? flag.source : null,
      hopCount: hops.length, hops: hops
    };
  }

  function analysisSection(graph, trace, lifeStart, flagCount) {
    // Deeper analytical research section, built ONLY from computed
    // facts. No verdict is drawn from thin evidence: counts and
    // endpoints are stated, and gaps are stated as gaps.
    var nodeCount = graph ? Object.keys(graph.nodes).length : 0;
    var edgeCount = graph ? graph.edges.length : 0;
    var lines = [];
    lines.push('Movement record: ' + edgeCount + ' hop(s) across ' + nodeCount + ' wallet(s) in the supplied record.');
    if (trace && trace.ok) {
      lines.push('Funding trace from ' + trace.startAddress + ': ' + trace.hopCount + ' hop(s) back to origin ' + trace.originAddress + '. ' + trace.trailEnds + '.');
    } else {
      lines.push('Funding trace: not run — no start address was supplied.');
    }
    if (lifeStart) {
      lines.push('Chain-life start: ' + (lifeStart.startTs != null ? new Date(lifeStart.startTs).toISOString() + ' (' + lifeStart.source + ')' : 'unknown — ' + lifeStart.source) + '.');
    }
    lines.push('Theft flags in this investigation: ' + (flagCount || 0) + '. A flag is an investigation flag, not a verdict and not a recovery claim.');
    if (edgeCount === 0) lines.push('Gap: no transfers were supplied, so no movement, funding, or theft path can be shown. Supply transfer records from a public chain read to fill this section.');
    return lines.join('\n');
  }

  var api = {
    buildHopGraph: buildHopGraph, flagTheft: flagTheft,
    traceFunding: traceFunding, chainLifeStart: chainLifeStart,
    trackStolenItem: trackStolenItem, analysisSection: analysisSection
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMApex3 = api;
})(typeof window !== 'undefined' ? window : this);
