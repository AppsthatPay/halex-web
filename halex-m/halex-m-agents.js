/* HALEX-M full-knowledge agents (STAGING 2026-11-03).
 *
 * 20 HALEX-M agents that organize the system BEHIND the 300 trading
 * lane. They do NOT trade, hold keys, sign, spend, or move funds.
 * The 300 keeps trading exactly as it is; these agents monitor,
 * organize, and report, and their work is wired into the Braintree
 * registry alongside all other trading skills.
 *
 * "Keep live" = each agent carries a runtime heartbeat: status starts
 * STAGED, and heartbeat() moves it to LIVE with a lastSeen timestamp.
 * A heartbeat is a status report, not a trade and not an execution.
 *
 * The 21st record, 300-OP-01, is one of the 300 assigned to operate
 * the Skill Lab text window with Braintree access (see
 * halex-m-skills-lab-upgrade.js for the operator itself).
 *
 * Pure logic, no DOM, no network, no keys. Browser global
 * window.HalexMAgents; node via module.exports.
 */
(function (root) {
  'use strict';

  var KNOWLEDGE_INDEX = [
    'halex-m/index.html (live tree, read-only reference)',
    'halex-m-merged-chaintarium-20261103 (merged staging copy)',
    'halex-m-tab-upgrades-20261101 (Trading View, APEX² Research, Wallet Modules, Skills Lab)',
    'halex-m-braintree.js (this package: Braintree registry)',
    'halex-m-apex3.js (this package: APEX³ investigation)',
    'halex-m-apex2-multichain.js (this package: multi-chain search)',
    'halex-m-multichain.js (this package: chain adapters)',
    'halex-m-warchest-live.js (this package: War Chest live tools)',
    'pending-builds/drex-mirofish-* (Drex/MiroFish research + drafts)',
    'pending-builds/team2-*.py (HALEX-AI-side staged modules, bridge-gated)',
    'pending-builds/halex-complete-20261103 (21-module completion package)'
  ];

  var AGENTS = [
    { id: 'HM-AGENT-01', name: 'Braintree Registrar', role: 'registry', skills: ['HM-trading', 'APEX2', 'APEX3'], desc: 'Owns the Braintree registry, proposals, and filing gates. Nothing files without proposal, both gates, paper proof, and human review.' },
    { id: 'HM-AGENT-02', name: 'Trade Signal Organizer', role: 'trading', skills: ['HM-trading', 'SL-momentum', 'SL-mirror', 'SL-fresh', 'SL-meanrev', 'SL-dip'], desc: 'Organizes 300 trade signals behind the 300 lane. Organizes only; never trades, never overrides the 300.' },
    { id: 'HM-AGENT-03', name: 'Risk and Guards', role: 'trading', skills: ['SL-momentum', 'SL-mirror', 'SL-fresh', 'SL-meanrev', 'SL-dip'], desc: 'Watches guards, loss caps, custody flags, and floor rules. Flags only; never vetoes by itself and never moves funds.' },
    { id: 'HM-AGENT-04', name: 'Research Lead', role: 'research', skills: ['APEX2', 'solhag-x-search', 'solhag-socialskills'], desc: 'Runs APEX² multi-chain searches and keeps social evidence labeled advisory-only.' },
    { id: 'HM-AGENT-05', name: 'Investigation Lead', role: 'research', skills: ['APEX3', 'chaintarium'], desc: 'Runs APEX³ theft and stolen-item investigations across transactions.' },
    { id: 'HM-AGENT-06', name: 'Security Auditor', role: 'security', skills: ['ZCURE', 'chaintarium'], desc: 'Runs ZCURE screens and keeps the remote-leg NOT_WIRED limit visible.' },
    { id: 'HM-AGENT-07', name: 'Wallet Operator', role: 'wallet', skills: ['wallet-modules', 'WC-evm-toolbox'], desc: 'Operates wallet modules and the visitor-wallet flows. Never sends a pasted address anywhere the stricter module forbids.' },
    { id: 'HM-AGENT-08', name: 'War Chest Keeper', role: 'wallet', skills: ['WC-rent-reclaim', 'WC-bulk-close', 'WC-burn', 'WC-evm-toolbox', 'WC-pl-reports', 'WC-skill-sets', 'WC-airdrop-scout', 'WC-ai-socket'], desc: 'Keeps every War Chest tool live and preview-first. A tool shows its exact effect before any signature is ever asked.' },
    { id: 'HM-AGENT-09', name: 'Chain Adapter Chief', role: 'trading', skills: ['HM-trading'], desc: 'Owns the multi-chain adapters: search + paper on every chain besides Solana; live only through the visitor wallet.' },
    { id: 'HM-AGENT-10', name: 'Chaintarium Cartographer', role: 'security', skills: ['chaintarium', 'APEX3'], desc: 'Maintains the cityscape legend and theft-wallet markers. Legend over circuit city; nothing deleted.' },
    { id: 'HM-AGENT-11', name: 'Skill Lab Liaison', role: 'registry', skills: ['SL-momentum', 'SL-mirror', 'SL-fresh', 'SL-meanrev', 'SL-dip', 'SK-DREX-001', 'SK-DREX-002', 'SK-DREX-003', 'SK-DREX-004', 'SK-DREX-005'], desc: 'Syncs the Skill Lab with the Braintree registry so toggles and lists never disagree.' },
    { id: 'HM-AGENT-12', name: 'Paper Proof Runner', role: 'trading', skills: ['SL-momentum', 'SL-mirror', 'SL-fresh', 'SL-meanrev', 'SL-dip'], desc: 'Runs paper tests and records measured evidence. A skill clears the gate only on 30+ closed trades, 65%+ win rate, and 1.2+ profit factor.' },
    { id: 'HM-AGENT-13', name: 'Content and Publishing', role: 'registry', skills: ['airdrop-hunter'], desc: 'Prepares posts, articles, and research drafts. Prepares only: nothing publishes externally without Jeffrey\'s approval.' },
    { id: 'HM-AGENT-14', name: 'ZINIUM Liaison', role: 'intelligence', skills: ['team2-neural-core', 'team2-smc-mesh', 'team2-cognition-hub', 'halex-complete-20261103'], desc: 'Liaison to ZINIUM + HALEX-AI thinking. The bridge is OFF by default; while off, no answer is fabricated.' },
    { id: 'HM-AGENT-15', name: 'Solana Specialist', role: 'research', skills: ['APEX2', 'WC-rent-reclaim', 'WC-bulk-close', 'WC-burn'], desc: 'Solana depth: rent, accounts, burns, and Solana-side research.' },
    { id: 'HM-AGENT-16', name: 'EVM Specialist', role: 'research', skills: ['APEX2', 'WC-evm-toolbox'], desc: 'EVM depth: Base, Ethereum, BSC, and the other adapters; approvals and gas.' },
    { id: 'HM-AGENT-17', name: 'Funding Trace Analyst', role: 'research', skills: ['APEX3', 'APEX2'], desc: 'Traces original funding sources, chain-life starts, and traceable funding for every APEX²/APEX³ search.' },
    { id: 'HM-AGENT-18', name: 'Market Feed Watcher', role: 'research', skills: ['APEX2'], desc: 'Watches feed freshness and reports stale feeds. Never deletes or rebuilds a feed database.' },
    { id: 'HM-AGENT-19', name: 'Social Signal Analyst', role: 'research', skills: ['solhag-x-search', 'solhag-socialskills'], desc: 'Reads social signals as possibilities, roughly 10% trust, blacklist first. Never a verified signal alone.' },
    { id: 'HM-AGENT-20', name: 'System Health Monitor', role: 'registry', skills: [], desc: 'Reports daemon and tab-worker heartbeats, stalls, and gaps. Reporting only; restarts follow the watchdog rules, never silent self-repair.' },
    { id: '300-OP-01', name: 'Skill Lab Operator (of the 300)', role: 'operator', skills: ['SL-momentum', 'SL-mirror', 'SL-fresh', 'SL-meanrev', 'SL-dip', 'HM-trading', 'APEX2', 'APEX3'], desc: 'One of the 300, assigned to the HALEX-M Skill Lab text window with Braintree access. Lists, toggles, explains, and composes skills. No external actions, no keys, no signing, no funds.' }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function createRoster(records) {
    var agents = {};
    var order = [];
    (records || AGENTS).forEach(function (a) {
      if (!a || !a.id) return;
      if (agents[a.id]) throw new Error('duplicate agent id: ' + a.id);
      var rec = clone(a);
      rec.status = 'STAGED';
      rec.lastSeen = null;
      rec.knowledge = KNOWLEDGE_INDEX.slice();
      agents[a.id] = rec;
      order.push(a.id);
    });
    function list() { return order.map(function (id) { return clone(agents[id]); }); }
    function get(id) { return agents[id] ? clone(agents[id]) : null; }
    function byRole(role) { return list().filter(function (a) { return a.role === role; }); }
    function forSkill(skillId) { return list().filter(function (a) { return a.skills.indexOf(skillId) !== -1; }); }
    function heartbeat(id, ts) {
      if (!agents[id]) return { ok: false, error: 'unknown agent: ' + id };
      agents[id].status = 'LIVE';
      agents[id].lastSeen = ts || new Date().toISOString();
      return { ok: true, agent: clone(agents[id]) };
    }
    function liveCount() { return list().filter(function (a) { return a.status === 'LIVE'; }).length; }
    return { list: list, get: get, byRole: byRole, forSkill: forSkill, heartbeat: heartbeat, liveCount: liveCount, count: order.length };
  }

  var api = { AGENTS: AGENTS, KNOWLEDGE_INDEX: KNOWLEDGE_INDEX, createRoster: createRoster, defaultRoster: function () { return createRoster(AGENTS); } };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMAgents = api;
})(typeof window !== 'undefined' ? window : this);
