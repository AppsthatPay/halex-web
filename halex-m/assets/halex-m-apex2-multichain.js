/* APEX² multi-chain search (STAGING 2026-11-03).
 *
 * Extends the staged APEX² Research package (single-token research via
 * DexScreener) to search ALL chains, not Solana-only. The DexScreener
 * search endpoint already returns pairs across chains; this module
 * normalizes those pairs, labels every result with its chain, and
 * filters by chain on request. It adds no new data source and invents
 * no pair, price, or chain.
 *
 * Fetch is dependency-injected: the host passes its fetch (browser
 * fetch), and the harness passes a stub. The core never fetches on
 * its own, so node tests stay honest.
 *
 * Pure logic + injected fetch. Browser global window.HalexMApex2Multichain;
 * node via module.exports.
 */
(function (root) {
  'use strict';

  var SEARCH_URL = 'https://api.dexscreener.com/latest/dex/search?q=';
  var TOKEN_URL = 'https://api.dexscreener.com/latest/dex/tokens/';

  function searchUrl(query) { return SEARCH_URL + encodeURIComponent(String(query || '')); }
  function tokenUrl(address) { return TOKEN_URL + encodeURIComponent(String(address || '')); }

  function normalizePair(p) {
    if (!p) return null;
    return {
      chainId: p.chainId || null,
      dexId: p.dexId || null,
      pairAddress: p.pairAddress || null,
      pairUrl: p.url || null,
      tokenAddress: (p.baseToken && p.baseToken.address) || null,
      tokenName: (p.baseToken && p.baseToken.name) || null,
      tokenSymbol: (p.baseToken && p.baseToken.symbol) || null,
      priceUsd: (p.priceUsd != null) ? Number(p.priceUsd) : null,
      liquidityUsd: (p.liquidity && p.liquidity.usd != null) ? Number(p.liquidity.usd) : null,
      marketCap: (p.marketCap != null) ? Number(p.marketCap) : null,
      volume24h: (p.volume && p.volume.h24 != null) ? Number(p.volume.h24) : null,
      priceChange24h: (p.priceChange && p.priceChange.h24 != null) ? Number(p.priceChange.h24) : null,
      txns24h: p.txns ? { buys: (p.txns.h24 && p.txns.h24.buys != null) ? p.txns.h24.buys : null, sells: (p.txns.h24 && p.txns.h24.sells != null) ? p.txns.h24.sells : null } : null,
      pairCreatedAt: p.pairCreatedAt || null,
      info: p.info || null
    };
  }

  function normalizeSearchResponse(json) {
    if (!json || !Array.isArray(json.pairs)) return { results: [], chains: [] };
    var results = [];
    json.pairs.forEach(function (p) {
      var n = normalizePair(p);
      if (n) results.push(n);
    });
    var chains = [];
    results.forEach(function (r) {
      if (r.chainId && chains.indexOf(r.chainId) === -1) chains.push(r.chainId);
    });
    return { results: results, chains: chains };
  }

  function filterByChain(normalized, chainId) {
    if (!chainId || chainId === 'all') return normalized;
    return { results: normalized.results.filter(function (r) { return r.chainId === chainId; }), chains: normalized.chains };
  }

  function search(query, fetchImpl) {
    // Returns a Promise of the normalized search. fetchImpl must be a
    // fetch-like function (url) -> Promise<{json()}>. No default fetch
    // is assumed, so a missing impl is a refused call, not a silent one.
    if (typeof fetchImpl !== 'function') return Promise.reject(new Error('search requires a fetch implementation from the host'));
    if (!query || !String(query).trim()) return Promise.reject(new Error('search requires a query'));
    return fetchImpl(searchUrl(query)).then(function (res) { return res.json(); }).then(function (json) { return normalizeSearchResponse(json); });
  }

  var api = {
    SEARCH_URL: SEARCH_URL, TOKEN_URL: TOKEN_URL,
    searchUrl: searchUrl, tokenUrl: tokenUrl,
    normalizePair: normalizePair, normalizeSearchResponse: normalizeSearchResponse,
    filterByChain: filterByChain, search: search
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMApex2Multichain = api;
})(typeof window !== 'undefined' ? window : this);
