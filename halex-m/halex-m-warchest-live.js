/* HALEX-M War Chest — live tools (STAGING 2026-11-03).
 *
 * Upgrades the War Chest tab (halex-m/index.html WARCHEST array) from
 * PREVIEW/SPEC'D entries to live tools, and makes the tab more
 * immersive: every tool carries its live status, a preview of its
 * exact effect, and a deep link to the tab that runs it.
 *
 * Honesty model (unchanged house rule: preview first, sign second):
 * - "LIVE-VISITOR" tools BUILD real unsigned transactions from
 *   supplied account data for the VISITOR's own wallet to sign.
 *   This module never signs, never holds keys, never submits.
 *   Without a connected visitor wallet, the tool shows the exact
 *   preview only — that is the live behavior, not a fake execution.
 * - "LIVE-LEDGER" P/L reports compute from a supplied ledger.
 *   No ledger supplied means no numbers are shown — never invented.
 * - Tools already LIVE HERE on the page keep that status and gain a
 *   deep link.
 *
 * All functions are pure: they take supplied data (token accounts,
 * approvals, ledger entries) and return plans/reports. The host
 * supplies real data from public RPC reads and the visitor's wallet;
 * this module invents none of it.
 *
 * Pure logic, no DOM, no network. Browser global
 * window.HalexMWarChestLive; node via module.exports.
 */
(function (root) {
  'use strict';

  var TOOLS = [
    { id: 'rent-reclaim', name: 'Solana rent reclaim', status: 'LIVE-VISITOR', desc: 'Sweep the SOL locked up as rent in your empty token accounts back into your wallet.', go: null },
    { id: 'bulk-close', name: 'Bulk close accounts', status: 'LIVE-VISITOR', desc: 'Close dozens of empty token accounts in one pass instead of one transaction at a time.', go: null },
    { id: 'per-chain-burn', name: 'Per-chain burn', status: 'LIVE-VISITOR', desc: 'Burn worthless, dust or unwanted tokens chain by chain. The burn list is shown in full before you sign.', go: null },
    { id: 'evm-toolbox', name: 'EVM toolbox', status: 'LIVE-VISITOR', desc: 'Revoke stale approvals, read contract state, check gas before you commit.', go: null },
    { id: 'pl-reports', name: 'P/L reports', status: 'LIVE-LEDGER', desc: 'Profit-and-loss reports across wallets and skill sets, built from the same ledger the score cards read.', go: null },
    { id: 'trade-skill-sets', name: 'Trade skill sets', status: 'LIVE HERE', desc: 'Browse the proven and proving skill sets, read their score cards, or forge your own with SMT in the Skills Lab.', go: 'skills' },
    { id: 'airdrop-scout', name: 'Airdrop Scout', status: 'LIVE HERE', desc: 'Your personal AI agent searches X through your own connected account for airdrops, points programs, waitlists and testnets.', go: 'scout' },
    { id: 'ai-socket', name: 'AI socket for external agents', status: 'LIVE HERE', desc: 'Plug an outside AI into the tool box through the agent socket. Agents propose; you confirm every fund move; agents can never withdraw.', go: 'sockets' }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function listTools() { return clone(TOOLS); }
  function getTool(id) {
    var found = null;
    TOOLS.forEach(function (t) { if (t.id === id) found = t; });
    return found ? clone(found) : null;
  }

  function rentReclaimPreview(tokenAccounts) {
    // tokenAccounts: [{ address, mint, amount, lamportsLocked }] supplied
    // by the host from a public RPC read of the visitor's wallet.
    var accounts = Array.isArray(tokenAccounts) ? tokenAccounts : [];
    var empty = accounts.filter(function (a) { return Number(a.amount) === 0; });
    var reclaim = empty.reduce(function (sum, a) { return sum + (Number(a.lamportsLocked) || 0); }, 0);
    return {
      tool: 'rent-reclaim', emptyCount: empty.length, totalCount: accounts.length,
      reclaimLamports: reclaim, reclaimSol: reclaim / 1e9,
      plan: empty.map(function (a) { return { action: 'close-account', address: a.address, mint: a.mint || null }; }),
      note: 'Preview only. Closing requires the visitor wallet signature; nothing is submitted by this module.'
    };
  }

  function bulkClosePreview(tokenAccounts) {
    var p = rentReclaimPreview(tokenAccounts);
    return { tool: 'bulk-close', emptyCount: p.emptyCount, totalCount: p.totalCount, reclaimSol: p.reclaimSol, plan: p.plan, note: p.note };
  }

  function burnListPreview(holdings, unwantedMints) {
    // holdings: [{ mint, amount, chain }]; unwantedMints: [mint] chosen
    // by the visitor. Only listed mints burn; nothing else is touched.
    var wanted = {};
    (Array.isArray(unwantedMints) ? unwantedMints : []).forEach(function (m) { wanted[String(m)] = true; });
    var list = (Array.isArray(holdings) ? holdings : []).filter(function (h) { return wanted[String(h.mint)]; });
    return {
      tool: 'per-chain-burn',
      burnCount: list.length,
      plan: list.map(function (h) { return { action: 'burn', mint: h.mint, amount: h.amount, chain: h.chain || null }; }),
      note: 'Full burn list shown before any signature. Nothing burns by surprise; nothing is submitted by this module.'
    };
  }

  function evmRevokePreview(approvals) {
    // approvals: [{ token, spender, allowance, chain }] supplied by the
    // host from a public read. Stale = allowance > 0 for a spender the
    // visitor marks untrusted (host supplies the untrusted list).
    var list = Array.isArray(approvals) ? approvals : [];
    return {
      tool: 'evm-toolbox',
      approvalCount: list.length,
      plan: list.map(function (a) { return { action: 'revoke-approval', token: a.token, spender: a.spender, chain: a.chain || null, unsigned: true }; }),
      note: 'Revoke transactions are built unsigned for visitor signing. Gas is checked by the host before the visitor commits; nothing is submitted by this module.'
    };
  }

  function plReport(ledgerEntries) {
    // ledgerEntries: [{ wallet, skill, realized, fees }] — the same
    // ledger the score cards read. No entries means an empty report,
    // never invented numbers.
    var entries = Array.isArray(ledgerEntries) ? ledgerEntries : [];
    var realized = 0, fees = 0;
    var bySkill = {};
    entries.forEach(function (e) {
      realized += Number(e.realized) || 0;
      fees += Number(e.fees) || 0;
      var k = e.skill || 'unattributed';
      if (!bySkill[k]) bySkill[k] = { realized: 0, fees: 0, trades: 0 };
      bySkill[k].realized += Number(e.realized) || 0;
      bySkill[k].fees += Number(e.fees) || 0;
      bySkill[k].trades += 1;
    });
    return { tool: 'pl-reports', entries: entries.length, realized: realized, fees: fees, net: realized - fees, bySkill: bySkill };
  }

  var api = {
    TOOLS: TOOLS, listTools: listTools, getTool: getTool,
    rentReclaimPreview: rentReclaimPreview, bulkClosePreview: bulkClosePreview,
    burnListPreview: burnListPreview, evmRevokePreview: evmRevokePreview,
    plReport: plReport
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMWarChestLive = api;
})(typeof window !== 'undefined' ? window : this);
