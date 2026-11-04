/* HALEX-M Braintree — skill registry + reasoning core (STAGING 2026-11-03).
 *
 * What Braintree is here: the named intelligence core in HALEX-M that
 * HALEX-AI calls only where communication is needed (joint ZINIUM +
 * Braintree thinking; that bridge is OFF by default in halex-m-ai.js).
 * This module gives Braintree its registry: every skill pulled from
 * repositories and agent programs, labeled, categorized by what it does,
 * toggleable, composing a skills list. It registers RUNNING SYSTEMS
 * only — never proprietary recipe internals.
 *
 * Execution gates (unchanged from the Skills Lab package):
 * - Paper is the default. Live execution is visitor-wallet client-side
 *   signing only, after a confirmed review of exact amount/token/
 *   slippage/fees. HALEX-M holds no keys and never signs server-side.
 * - REOWN_PROJECT_ID is EMPTY until Jeffrey supplies his own. It is
 *   never invented. Without it, WalletConnect stays disabled and
 *   renders "WalletConnect needs a project ID (owner supplies it)".
 * - No skill in this registry trades, signs, spends, or moves funds
 *   on its own. Skills propose; the visitor confirms; agents never
 *   withdraw.
 *
 * Proposal lifecycle (from the Drex drafts' gates): a skill proposal
 * moves DRAFT -> PROPOSED -> GATED (both security gates pass) ->
 * PAPER-PROVEN (measured paper proof) -> REVIEWED (human review) ->
 * FILED. A proposal that fails a gate stays where it failed, with the
 * reason recorded. Nothing auto-files to live funds.
 *
 * Pure logic, no DOM, no network, no keys. Works in the browser as
 * window.HalexMBraintree and in node via module.exports.
 */
(function (root) {
  'use strict';

  var REOWN_PROJECT_ID = ''; // EMPTY BY DESIGN — owner supplies it. Never invent.

  var CATEGORIES = ['trading', 'research', 'security', 'wallet', 'intelligence', 'decision'];

  /* Seed inventory. Status words are honest and load-bearing:
   * TESTED = paper-tested in the Skills Lab package (its gate verdict
   *   in `gate`); IDEA = template, not a skill until paper-tested.
   * STAGED = package built + harness green, not merged, not live.
   * LIVE HERE / LIVE-VISITOR / LIVE-LEDGER = live on the page model
   *   (visitor-wallet signing, or ledger computation).
   * DRAFT-PROPOSAL / DRAFT = proposal only, not filed, no execution.
   * CUSTOM = adopted custom skill; its own hard stops still apply. */
  var SKILLS = [
    // ---- trading: Skills Lab package (paper-tested 2026-11-01) ----
    { id: 'SL-momentum', label: 'Second-wave momentum', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'TESTED', gate: 'NOT PROVEN', desc: 'Enter only after the first move proves demand; sell in rungs, trail the runner, hard time cap.' },
    { id: 'SL-mirror', label: 'Wallet mirror', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'TESTED', gate: 'NOT PROVEN', desc: 'Mirror a watched wallet\'s fresh buys only after that wallet\'s record survives an audit.' },
    { id: 'SL-fresh', label: 'Fresh-launch screen', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'TESTED', gate: 'NOT PROVEN', desc: 'Screen brand-new pools for accelerating buys, two-sided tape, and a verifiable link. Says no almost every time.' },
    { id: 'SL-meanrev', label: 'Mean-reversion', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'TESTED', gate: 'NOT PROVEN', desc: 'Buy after an overextended move fades toward its average; break the floor and the thesis is dead.' },
    { id: 'SL-dip', label: 'Dip buy', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'TESTED', gate: 'NOT PROVEN', desc: 'Buy the pullback after a strong first move while it holds above the first move\'s midpoint.' },
    { id: 'SL-stall-idea', label: 'Stall-exit scalper', category: 'trading', source: 'halex-m-tab-upgrades-20261101/skills-lab', status: 'IDEA', gate: 'NOT A SKILL YET', desc: 'Template only: enter on a small defined trigger, close if no progress inside the window. Earns numbers only in the paper arena.' },
    { id: 'HM-trading', label: 'HALEX-M Trading System (Trading View + Token View)', category: 'trading', source: 'halex-m-tab-upgrades-20261101/trading-token-view', status: 'STAGED', gate: 'PACKAGE 66/66', desc: 'The HALEX-M trading system as a trade skill in the Braintree. Paper default; live only via visitor-wallet confirmed review.' },
    // ---- research ----
    { id: 'APEX2', label: 'APEX² Research (multi-chain)', category: 'research', source: 'halex-m-tab-upgrades-20261101/apex-research + this package (multi-chain upgrade)', status: 'UPGRADED-STAGED', gate: 'PACKAGE 45/45 + THIS PACKAGE', desc: 'Token research across ALL chains, not Solana-only. DexScreener public reads; custody proven on-chain in the live gate, never claimed here.' },
    { id: 'APEX3', label: 'APEX³ Deep Research & Investigation', category: 'research', source: 'this package (halex-m-apex3.js)', status: 'NEW-STAGED', gate: 'THIS PACKAGE', desc: 'Tracks theft and stolen items across transactions: hop graphs, funding traces, chain-life starts. Public-data analysis only; no law-enforcement powers claimed.' },
    { id: 'solhag-x-search', label: 'SolHaG X Search', category: 'research', source: 'custom-skills/solhag-x-search', status: 'CUSTOM', gate: 'ADVISORY-ONLY', desc: 'Research tokens, KOLs, catalysts through a signed-in X session. Social is advisory-only, never a verified signal by itself.' },
    { id: 'solhag-socialskills', label: 'SolHaG SocialSkills', category: 'research', source: 'custom-skills/solhag-socialskills', status: 'CUSTOM', gate: 'ADVISORY-ONLY', desc: 'Social-first token intelligence. A signal only when BOTH social and on-chain confirm a real, non-scam project.' },
    { id: 'airdrop-hunter', label: 'Airdrop Hunter', category: 'research', source: 'custom-skills/airdrop-hunter', status: 'CUSTOM', gate: 'FORM-ONLY HARD STOPS', desc: 'Hunt, classify, and sign up form-safe airdrops. No seed, key, signing, fee, or KYC step ever taken by the agent.' },
    // ---- security ----
    { id: 'ZCURE', label: 'ZCURE security', category: 'security', source: 'halex-m/halex-m-zcure.js', status: 'STAGED', gate: 'PYTHON 27/27 + JS CLIENT 10/10', desc: 'Security screening wired into HALEX-M staging only. The remote leg is NOT_WIRED; nothing here claims otherwise.' },
    { id: 'chaintarium', label: 'Chaintarium cityscape', category: 'security', source: 'halex-m-merged-chaintarium-20261103', status: 'STAGED', gate: 'MERGED COPY 58/58 (NOT LIVE)', desc: 'Chain city visualization: wallets, tokens, transfers, theft-wallet markers, whale and exchange shapes. Legend over circuit city; nothing deleted.' },
    // ---- wallet: War Chest tools + modules ----
    { id: 'WC-rent-reclaim', label: 'War Chest: Solana rent reclaim', category: 'wallet', source: 'halex-m/index.html WARCHEST + this package (live wiring)', status: 'LIVE-VISITOR', gate: 'PREVIEW FIRST, SIGN SECOND', desc: 'Sweeps SOL rent from empty token accounts. Builds the real close instructions for visitor signing; preview shows the exact effect first.' },
    { id: 'WC-bulk-close', label: 'War Chest: Bulk close accounts', category: 'wallet', source: 'halex-m/index.html WARCHEST + this package (live wiring)', status: 'LIVE-VISITOR', gate: 'PREVIEW FIRST, SIGN SECOND', desc: 'Closes many empty token accounts in one pass. The close list is shown in full before any signature.' },
    { id: 'WC-burn', label: 'War Chest: Per-chain burn', category: 'wallet', source: 'halex-m/index.html WARCHEST + this package (live wiring)', status: 'LIVE-VISITOR', gate: 'PREVIEW FIRST, SIGN SECOND', desc: 'Burns dust or unwanted tokens chain by chain from a full, shown burn list. Nothing burns by surprise.' },
    { id: 'WC-evm-toolbox', label: 'War Chest: EVM toolbox', category: 'wallet', source: 'halex-m/index.html WARCHEST + this package (live wiring)', status: 'LIVE-VISITOR', gate: 'PREVIEW FIRST, SIGN SECOND', desc: 'Revoke stale approvals, read contract state, check gas before committing. Revoke transactions are built for visitor signing.' },
    { id: 'WC-pl-reports', label: 'War Chest: P/L reports', category: 'wallet', source: 'halex-m/index.html WARCHEST + this package (live wiring)', status: 'LIVE-LEDGER', gate: 'LEDGER-COMPUTED', desc: 'Profit-and-loss reports computed from the supplied ledger, so the report and the record cannot disagree. No ledger supplied means no numbers shown.' },
    { id: 'WC-skill-sets', label: 'War Chest: Trade skill sets', category: 'wallet', source: 'halex-m/index.html WARCHEST', status: 'LIVE HERE', gate: 'PAGE', desc: 'Browse proven and proving skill sets, read their score cards, or forge your own in the Skills Lab.' },
    { id: 'WC-airdrop-scout', label: 'War Chest: Airdrop Scout', category: 'wallet', source: 'halex-m/index.html WARCHEST', status: 'LIVE HERE', gate: 'PAGE', desc: 'Searches X through the visitor\'s own connected account; form-only signups agent-done, signature steps listed as yours by hand.' },
    { id: 'WC-ai-socket', label: 'War Chest: AI socket for external agents', category: 'wallet', source: 'halex-m/index.html WARCHEST', status: 'LIVE HERE', gate: 'PAGE', desc: 'Plug an outside AI into the toolbox through the agent socket. Agents propose; the visitor confirms every fund move; agents can never withdraw.' },
    { id: 'wallet-modules', label: 'Wallet Modules', category: 'wallet', source: 'halex-m-tab-upgrades-20261101/wallet-modules', status: 'STAGED', gate: 'PACKAGE 76/76', desc: 'Trading wallets, fund movements, balances. The stricter trading-wallets module never sends a pasted address anywhere; that rule survives this merge.' },
    { id: 'coinbase-agent-skill', label: 'Coinbase agent skill', category: 'wallet', source: 'custom-skills/coinbase-agent-skill', status: 'CUSTOM', gate: 'SETUP ONLY', desc: 'Coinbase setup, account connection, and x402 premium-data payments. Setup guidance only; no credentials are stored or invented here.' },
    // ---- intelligence: HALEX-AI side, bridge-gated (bridge OFF by default) ----
    { id: 'team2-neural-core', label: 'Neural Core (team2)', category: 'intelligence', source: 'pending-builds/team2-neural-core.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side word-hash vectors + 2-layer net with real backprop. Available to Braintree joint thinking only when the HALEX-AI bridge is on.' },
    { id: 'team2-smc-mesh', label: 'SMC mesh (team2)', category: 'intelligence', source: 'pending-builds/team2-smc-mesh.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side 8x8 torus mesh, Dijkstra avoiding failed pods. Bridge-gated; not a HALEX-M execution path.' },
    { id: 'team2-cognition-hub', label: 'Cognition Hub (team2)', category: 'intelligence', source: 'pending-builds/team2-cognition-hub.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side cognition hub. Bridge-gated.' },
    { id: 'team2-inference', label: 'Inference engine (team2)', category: 'intelligence', source: 'pending-builds/team2-inference.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side bigram inference on a caller corpus; an untrained engine refuses. Bridge-gated.' },
    { id: 'team2-tokenizer', label: 'Tokenizer (team2)', category: 'intelligence', source: 'pending-builds/team2-tokenizer.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side lossless tokenizer. Bridge-gated.' },
    { id: 'team2-codex', label: 'Codex (team2)', category: 'intelligence', source: 'pending-builds/team2-codex.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side codex; raises KeyError naming missing fields instead of inventing them. Bridge-gated.' },
    { id: 'team2-cognitive-memory', label: 'Cognitive memory (team2)', category: 'intelligence', source: 'pending-builds/team2-cognitive-memory.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side cosine retrieval + consolidation. Bridge-gated.' },
    { id: 'team2-critic', label: 'Metacognitive critic (team2)', category: 'intelligence', source: 'pending-builds/team2-metacognitive-critic.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side critic, 4 scored checks. Bridge-gated.' },
    { id: 'team2-pod-sched', label: 'Pod scheduler (team2)', category: 'intelligence', source: 'pending-builds/team2-pod-sched.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side priority ordering + utilization/makespan. Bridge-gated.' },
    { id: 'team2-z5-cluster', label: 'Z5 cluster (team2)', category: 'intelligence', source: 'pending-builds/team2-z5-cluster.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side Z5-core sharding model. Bridge-gated.' },
    { id: 'team2-gateway', label: 'Gateway (team2)', category: 'intelligence', source: 'pending-builds/team2-gateway.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51', desc: 'HALEX-AI-side HTTP gateway. Bridge-gated.' },
    { id: 'team2-agent-router', label: 'Agent router (team2)', category: 'intelligence', source: 'pending-builds/team2-agent-router.py', status: 'STAGED', gate: 'TEAM2 HARNESS 51/51 (SHELL EXECUTION DISABLED BY DESIGN)', desc: 'HALEX-AI-side planning/validation router. Its terminal-command execution is DESIGN ONLY and disabled: never wired as live arbitrary command execution.' },
    { id: 'halex-complete-20261103', label: 'HALEX-AI Selfbuild Completion (21 modules)', category: 'intelligence', source: 'pending-builds/halex-complete-20261103', status: 'STAGED', gate: 'HARNESS 41/41', desc: 'Completed HALEX-AI submission package: semantic holograph, tree of thought, goal engine, supreme engine, chat, encyclopedia, content suite, vision, and more. Bridge-gated.' },
    { id: 'drex-mitosis-copy', label: 'HALEX-M mitosis staging copy (Drex/MiroFish)', category: 'intelligence', source: 'pending-builds/drex-mirofish-halexm-mitosis-copy-20261103.json', status: 'DRAFT', gate: 'DESIGN + INVENTORY ONLY', desc: 'Staging copy draft distilled from the Drex/MiroFish research. NO copy execution was performed by this draft: no engine mitosis call, no chain record, no live mint.' },
    { id: 'z100-038-wallet-skills', label: 'ZINIUM wallet skills (Z100-038)', category: 'intelligence', source: 'pending-builds/z100-038-wallet-skills.py', status: 'STAGED', gate: 'ZINIUM CHAIN-500 RECORD', desc: 'Wallet-as-processor skill records on chain 500. Staging record; not a HALEX-M execution path.' },
    // ---- decision: Drex/MiroFish drafts (proposals, NOT filed) ----
    { id: 'SK-DREX-001', label: 'Probability over options', category: 'decision', source: 'pending-builds/drex-mirofish-braintree-skills-20261103.json', status: 'DRAFT-PROPOSAL', gate: 'NOT FILED', desc: 'Return one probability per known option instead of an essay. Options must be supplied in advance; none are invented.' },
    { id: 'SK-DREX-002', label: 'Confidence gating', category: 'decision', source: 'pending-builds/drex-mirofish-braintree-skills-20261103.json', status: 'DRAFT-PROPOSAL', gate: 'NOT FILED', desc: 'Act only when the leading probability clears a human-set threshold; otherwise wait, with the wait recorded. A threshold is never by itself an order to move funds.' },
    { id: 'SK-DREX-003', label: 'Swarm rehearsal', category: 'decision', source: 'pending-builds/drex-mirofish-braintree-skills-20261103.json', status: 'DRAFT-PROPOSAL', gate: 'NOT FILED', desc: 'Rehearse a decision across a swarm of simulated agents before acting. Proposal only; no rehearsal has been run as a filing.' },
    { id: 'SK-DREX-004', label: 'State composition', category: 'decision', source: 'pending-builds/drex-mirofish-braintree-skills-20261103.json', status: 'DRAFT-PROPOSAL', gate: 'NOT FILED', desc: 'Compose a fixed decision state from fixed inputs before any probability is computed.' },
    { id: 'SK-DREX-005', label: 'Decision autopsy', category: 'decision', source: 'pending-builds/drex-mirofish-braintree-skills-20261103.json', status: 'DRAFT-PROPOSAL', gate: 'NOT FILED', desc: 'After a decision, record what was known, what was chosen, and what happened, so the next decision learns from the last.' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function createRegistry(seed) {
    var skills = {};
    var order = [];
    (seed || SKILLS).forEach(function (s) {
      if (!s || !s.id) return;
      if (skills[s.id]) throw new Error('duplicate skill id: ' + s.id);
      if (CATEGORIES.indexOf(s.category) === -1) throw new Error('unknown category for ' + s.id + ': ' + s.category);
      skills[s.id] = clone(s);
      order.push(s.id);
    });
    var toggles = {}; // id -> true (on) / false (off); default: on for LIVE + TESTED, off for DRAFT/IDEA/STAGED
    order.forEach(function (id) {
      var st = skills[id].status;
      toggles[id] = (st === 'LIVE HERE' || st === 'LIVE-VISITOR' || st === 'LIVE-LEDGER' || st === 'TESTED' || st === 'CUSTOM');
    });
    var proposals = {}; // proposalId -> record

    function list(filter) {
      return order.filter(function (id) {
        if (!filter) return true;
        if (filter.category && skills[id].category !== filter.category) return false;
        if (filter.status && skills[id].status !== filter.status) return false;
        if (filter.onOnly && !toggles[id]) return false;
        return true;
      }).map(function (id) { return clone(skills[id]); });
    }
    function get(id) { return skills[id] ? clone(skills[id]) : null; }
    function toggle(id, on) {
      if (!skills[id]) return { ok: false, error: 'unknown skill: ' + id };
      if (skills[id].status === 'IDEA') return { ok: false, error: 'IDEA is a template, not a skill; it cannot be toggled on until paper-tested' };
      toggles[id] = !!on;
      return { ok: true, id: id, on: toggles[id] };
    }
    function isOn(id) { return !!toggles[id]; }
    function composeList(ids) {
      // Build a skills list from toggled-on skills. Unknown ids and
      // IDEA entries are refused with reasons, never silently dropped.
      var out = { skills: [], refused: [] };
      (ids || []).forEach(function (id) {
        var s = skills[id];
        if (!s) { out.refused.push({ id: id, reason: 'unknown skill' }); return; }
        if (s.status === 'IDEA') { out.refused.push({ id: id, reason: 'IDEA template, not a skill' }); return; }
        if (!toggles[id]) { out.refused.push({ id: id, reason: 'toggled off' }); return; }
        out.skills.push(clone(s));
      });
      return out;
    }
    function categories() {
      var out = {};
      CATEGORIES.forEach(function (c) { out[c] = list({ category: c }).length; });
      return out;
    }
    function propose(proposal) {
      // proposal: { id, skillId, summary }. Lifecycle gates recorded.
      if (!proposal || !proposal.id || !proposal.skillId) return { ok: false, error: 'proposal needs id and skillId' };
      if (!skills[proposal.skillId]) return { ok: false, error: 'unknown skill: ' + proposal.skillId };
      if (proposals[proposal.id]) return { ok: false, error: 'duplicate proposal id: ' + proposal.id };
      proposals[proposal.id] = {
        id: proposal.id, skillId: proposal.skillId, summary: proposal.summary || '',
        stage: 'PROPOSED',
        gates: { screens: null, machine: null, paperProof: null, humanReview: null },
        history: ['PROPOSED']
      };
      return { ok: true, proposal: clone(proposals[proposal.id]) };
    }
    function gate(proposalId, gateName, passed, note) {
      var p = proposals[proposalId];
      if (!p) return { ok: false, error: 'unknown proposal: ' + proposalId };
      if (['screens', 'machine', 'paperProof', 'humanReview'].indexOf(gateName) === -1) return { ok: false, error: 'unknown gate: ' + gateName };
      p.gates[gateName] = { passed: !!passed, note: note || '' };
      if (!passed) { p.stage = 'HELD'; p.history.push('HELD at ' + gateName + ': ' + (note || '')); return { ok: true, proposal: clone(p) }; }
      if (p.gates.screens && p.gates.screens.passed && p.gates.machine && p.gates.machine.passed && p.stage === 'PROPOSED') { p.stage = 'GATED'; p.history.push('GATED'); }
      if (p.gates.paperProof && p.gates.paperProof.passed && p.stage === 'GATED') { p.stage = 'PAPER-PROVEN'; p.history.push('PAPER-PROVEN'); }
      if (p.gates.humanReview && p.gates.humanReview.passed && p.stage === 'PAPER-PROVEN') { p.stage = 'REVIEWED'; p.history.push('REVIEWED'); }
      return { ok: true, proposal: clone(p) };
    }
    function file(proposalId) {
      var p = proposals[proposalId];
      if (!p) return { ok: false, error: 'unknown proposal: ' + proposalId };
      if (p.stage !== 'REVIEWED') return { ok: false, error: 'cannot file from stage ' + p.stage + '; REVIEWED is required (proposal, both gates, paper proof, human review)' };
      p.stage = 'FILED'; p.history.push('FILED');
      return { ok: true, proposal: clone(p) };
    }
    function getProposal(id) { return proposals[id] ? clone(proposals[id]) : null; }
    return {
      list: list, get: get, toggle: toggle, isOn: isOn, composeList: composeList,
      categories: categories, propose: propose, gate: gate, file: file,
      getProposal: getProposal, count: order.length,
      execution: {
        reownProjectId: REOWN_PROJECT_ID,
        walletConnectEnabled: REOWN_PROJECT_ID !== '',
        paperDefault: true, serverSideSigning: false, keysHeld: false
      }
    };
  }

  var api = {
    SKILLS: SKILLS, CATEGORIES: CATEGORIES, REOWN_PROJECT_ID: REOWN_PROJECT_ID,
    createRegistry: createRegistry,
    defaultRegistry: function () { return createRegistry(SKILLS); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMBraintree = api;
})(typeof window !== 'undefined' ? window : this);
