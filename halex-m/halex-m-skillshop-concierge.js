/* HALEX-M Skill Shop Concierge (STAGING PROTOTYPE, 2026-11-04).
 *
 * Turns a visitor's free-text request ("Give me a trade skill that
 * will make me lots of money", "Create a trading strategy for 5$ on
 * Solana", ...) into exactly 3 plain-English offers drawn from the
 * Braintree skill inventory (44 skills), matched against organized
 * toggle groups. When nothing in the inventory fits, it files a
 * strategy-build request RECORD to the 300 agency via the Skill Lab
 * operator (300-OP-01), entering the Braintree proposal lifecycle
 * (PROPOSED -> security gates -> paper proof -> human review ->
 * FILED). Record only: nothing executes, nothing trades.
 *
 * Hard guardrails:
 * - No profit is ever promised. Profit-seeking wording is reframed
 *   as a goal plus a plain risk disclosure.
 * - Skills are proprietary: offers describe what a running skill/set
 *   DOES in plain English. Raw recipes / .md internals are never
 *   exposed, quoted, or reconstructed.
 * - No keys, no signing, no spending, no wallet connection. Key /
 *   wallet / seed / credential requests get the Skills Lab fixed
 *   refusal, verbatim.
 * - Paper first, always. Live trading is not offered by this module;
 *   in HALEX-M it stays visitor-wallet gated elsewhere, and
 *   HALEX_WC_PROJECT_ID stays "" (WalletConnect disabled).
 * - Measured status is read from the inventory record (status +
 *   gate) and labeled honestly: proven / paper-testing / unproven.
 *   No performance number is ever invented here.
 *
 * Pure logic, no network, no DOM. Browser global
 * window.HalexMSkillShopConcierge; node via module.exports. On the
 * static HALEX-M page this is a LOCAL matcher: there is no live LLM
 * endpoint behind it (see SPEC.md).
 */
(function (root) {
  'use strict';

  var HALEX_WC_PROJECT_ID = '';

  // Fixed refusal, verbatim from halex-m-skills-lab-upgrade.js.
  var REFUSAL = 'I cannot do that here. The Skill Lab never takes keys, wallet connections, signatures, seed phrases, or credentials, and it never moves funds. I can list skills, explain a skill, toggle a skill, or build a skills list from toggled-on skills.';

  var RISK_DISCLOSURE = 'Plain talk first: trading can lose money, and no skill in this shop is a sure thing. The offers below are matched to your goal and your risk answers, they start on paper, and a skill only earns a proven label after 30 or more closed paper trades, a 65% or better win rate, and a 1.2 or better profit factor. Anything short of that is labeled paper-testing or unproven, in the open.';

  // The 44-skill Braintree inventory, snapshot of
  // halex-m-braintree-skills.json (same records the live registry
  // carries). The host page may pass a fresher inventory to
  // createConcierge(inventory); this snapshot is the fallback.
  var INVENTORY = [{"id":"SL-momentum","label":"Second-wave momentum","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"TESTED","gate":"NOT PROVEN","desc":"Enter only after the first move proves demand; sell in rungs, trail the runner, hard time cap."},{"id":"SL-mirror","label":"Wallet mirror","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"TESTED","gate":"NOT PROVEN","desc":"Mirror a watched wallet's fresh buys only after that wallet's record survives an audit."},{"id":"SL-fresh","label":"Fresh-launch screen","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"TESTED","gate":"NOT PROVEN","desc":"Screen brand-new pools for accelerating buys, two-sided tape, and a verifiable link. Says no almost every time."},{"id":"SL-meanrev","label":"Mean-reversion","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"TESTED","gate":"NOT PROVEN","desc":"Buy after an overextended move fades toward its average; break the floor and the thesis is dead."},{"id":"SL-dip","label":"Dip buy","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"TESTED","gate":"NOT PROVEN","desc":"Buy the pullback after a strong first move while it holds above the first move's midpoint."},{"id":"SL-stall-idea","label":"Stall-exit scalper","category":"trading","source":"halex-m-tab-upgrades-20261101/skills-lab","status":"IDEA","gate":"NOT A SKILL YET","desc":"Template only: enter on a small defined trigger, close if no progress inside the window. Earns numbers only in the paper arena."},{"id":"HM-trading","label":"HALEX-M Trading System (Trading View + Token View)","category":"trading","source":"halex-m-tab-upgrades-20261101/trading-token-view","status":"STAGED","gate":"PACKAGE 66/66","desc":"The HALEX-M trading system as a trade skill in the Braintree. Paper default; live only via visitor-wallet confirmed review."},{"id":"APEX2","label":"APEX² Research (multi-chain)","category":"research","source":"halex-m-tab-upgrades-20261101/apex-research + this package (multi-chain upgrade)","status":"UPGRADED-STAGED","gate":"PACKAGE 45/45 + THIS PACKAGE","desc":"Token research across ALL chains, not Solana-only. DexScreener public reads; custody proven on-chain in the live gate, never claimed here."},{"id":"APEX3","label":"APEX³ Deep Research & Investigation","category":"research","source":"this package (halex-m-apex3.js)","status":"NEW-STAGED","gate":"THIS PACKAGE","desc":"Tracks theft and stolen items across transactions: hop graphs, funding traces, chain-life starts. Public-data analysis only; no law-enforcement powers claimed."},{"id":"solhag-x-search","label":"SolHaG X Search","category":"research","source":"custom-skills/solhag-x-search","status":"CUSTOM","gate":"ADVISORY-ONLY","desc":"Research tokens, KOLs, catalysts through a signed-in X session. Social is advisory-only, never a verified signal by itself."},{"id":"solhag-socialskills","label":"SolHaG SocialSkills","category":"research","source":"custom-skills/solhag-socialskills","status":"CUSTOM","gate":"ADVISORY-ONLY","desc":"Social-first token intelligence. A signal only when BOTH social and on-chain confirm a real, non-scam project."},{"id":"airdrop-hunter","label":"Airdrop Hunter","category":"research","source":"custom-skills/airdrop-hunter","status":"CUSTOM","gate":"FORM-ONLY HARD STOPS","desc":"Hunt, classify, and sign up form-safe airdrops. No seed, key, signing, fee, or KYC step ever taken by the agent."},{"id":"ZCURE","label":"ZCURE security","category":"security","source":"halex-m/halex-m-zcure.js","status":"STAGED","gate":"PYTHON 27/27 + JS CLIENT 10/10","desc":"Security screening wired into HALEX-M staging only. The remote leg is NOT_WIRED; nothing here claims otherwise."},{"id":"chaintarium","label":"Chaintarium cityscape","category":"security","source":"halex-m-merged-chaintarium-20261103","status":"STAGED","gate":"MERGED COPY 58/58 (NOT LIVE)","desc":"Chain city visualization: wallets, tokens, transfers, theft-wallet markers, whale and exchange shapes. Legend over circuit city; nothing deleted."},{"id":"WC-rent-reclaim","label":"War Chest: Solana rent reclaim","category":"wallet","source":"halex-m/index.html WARCHEST + this package (live wiring)","status":"LIVE-VISITOR","gate":"PREVIEW FIRST, SIGN SECOND","desc":"Sweeps SOL rent from empty token accounts. Builds the real close instructions for visitor signing; preview shows the exact effect first."},{"id":"WC-bulk-close","label":"War Chest: Bulk close accounts","category":"wallet","source":"halex-m/index.html WARCHEST + this package (live wiring)","status":"LIVE-VISITOR","gate":"PREVIEW FIRST, SIGN SECOND","desc":"Closes many empty token accounts in one pass. The close list is shown in full before any signature."},{"id":"WC-burn","label":"War Chest: Per-chain burn","category":"wallet","source":"halex-m/index.html WARCHEST + this package (live wiring)","status":"LIVE-VISITOR","gate":"PREVIEW FIRST, SIGN SECOND","desc":"Burns dust or unwanted tokens chain by chain from a full, shown burn list. Nothing burns by surprise."},{"id":"WC-evm-toolbox","label":"War Chest: EVM toolbox","category":"wallet","source":"halex-m/index.html WARCHEST + this package (live wiring)","status":"LIVE-VISITOR","gate":"PREVIEW FIRST, SIGN SECOND","desc":"Revoke stale approvals, read contract state, check gas before committing. Revoke transactions are built for visitor signing."},{"id":"WC-pl-reports","label":"War Chest: P/L reports","category":"wallet","source":"halex-m/index.html WARCHEST + this package (live wiring)","status":"LIVE-LEDGER","gate":"LEDGER-COMPUTED","desc":"Profit-and-loss reports computed from the supplied ledger, so the report and the record cannot disagree. No ledger supplied means no numbers shown."},{"id":"WC-skill-sets","label":"War Chest: Trade skill sets","category":"wallet","source":"halex-m/index.html WARCHEST","status":"LIVE HERE","gate":"PAGE","desc":"Browse proven and proving skill sets, read their score cards, or forge your own in the Skills Lab."},{"id":"WC-airdrop-scout","label":"War Chest: Airdrop Scout","category":"wallet","source":"halex-m/index.html WARCHEST","status":"LIVE HERE","gate":"PAGE","desc":"Searches X through the visitor's own connected account; form-only signups agent-done, signature steps listed as yours by hand."},{"id":"WC-ai-socket","label":"War Chest: AI socket for external agents","category":"wallet","source":"halex-m/index.html WARCHEST","status":"LIVE HERE","gate":"PAGE","desc":"Plug an outside AI into the toolbox through the agent socket. Agents propose; the visitor confirms every fund move; agents can never withdraw."},{"id":"wallet-modules","label":"Wallet Modules","category":"wallet","source":"halex-m-tab-upgrades-20261101/wallet-modules","status":"STAGED","gate":"PACKAGE 76/76","desc":"Trading wallets, fund movements, balances. The stricter trading-wallets module never sends a pasted address anywhere; that rule survives this merge."},{"id":"coinbase-agent-skill","label":"Coinbase agent skill","category":"wallet","source":"custom-skills/coinbase-agent-skill","status":"CUSTOM","gate":"SETUP ONLY","desc":"Coinbase setup, account connection, and x402 premium-data payments. Setup guidance only; no credentials are stored or invented here."},{"id":"team2-neural-core","label":"Neural Core (team2)","category":"intelligence","source":"pending-builds/team2-neural-core.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side word-hash vectors + 2-layer net with real backprop. Available to Braintree joint thinking only when the HALEX-AI bridge is on."},{"id":"team2-smc-mesh","label":"SMC mesh (team2)","category":"intelligence","source":"pending-builds/team2-smc-mesh.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side 8x8 torus mesh, Dijkstra avoiding failed pods. Bridge-gated; not a HALEX-M execution path."},{"id":"team2-cognition-hub","label":"Cognition Hub (team2)","category":"intelligence","source":"pending-builds/team2-cognition-hub.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side cognition hub. Bridge-gated."},{"id":"team2-inference","label":"Inference engine (team2)","category":"intelligence","source":"pending-builds/team2-inference.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side bigram inference on a caller corpus; an untrained engine refuses. Bridge-gated."},{"id":"team2-tokenizer","label":"Tokenizer (team2)","category":"intelligence","source":"pending-builds/team2-tokenizer.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side lossless tokenizer. Bridge-gated."},{"id":"team2-codex","label":"Codex (team2)","category":"intelligence","source":"pending-builds/team2-codex.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side codex; raises KeyError naming missing fields instead of inventing them. Bridge-gated."},{"id":"team2-cognitive-memory","label":"Cognitive memory (team2)","category":"intelligence","source":"pending-builds/team2-cognitive-memory.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side cosine retrieval + consolidation. Bridge-gated."},{"id":"team2-critic","label":"Metacognitive critic (team2)","category":"intelligence","source":"pending-builds/team2-metacognitive-critic.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side critic, 4 scored checks. Bridge-gated."},{"id":"team2-pod-sched","label":"Pod scheduler (team2)","category":"intelligence","source":"pending-builds/team2-pod-sched.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side priority ordering + utilization/makespan. Bridge-gated."},{"id":"team2-z5-cluster","label":"Z5 cluster (team2)","category":"intelligence","source":"pending-builds/team2-z5-cluster.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side Z5-core sharding model. Bridge-gated."},{"id":"team2-gateway","label":"Gateway (team2)","category":"intelligence","source":"pending-builds/team2-gateway.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51","desc":"HALEX-AI-side HTTP gateway. Bridge-gated."},{"id":"team2-agent-router","label":"Agent router (team2)","category":"intelligence","source":"pending-builds/team2-agent-router.py","status":"STAGED","gate":"TEAM2 HARNESS 51/51 (SHELL EXECUTION DISABLED BY DESIGN)","desc":"HALEX-AI-side planning/validation router. Its terminal-command execution is DESIGN ONLY and disabled: never wired as live arbitrary command execution."},{"id":"halex-complete-20261103","label":"HALEX-AI Selfbuild Completion (21 modules)","category":"intelligence","source":"pending-builds/halex-complete-20261103","status":"STAGED","gate":"HARNESS 41/41","desc":"Completed HALEX-AI submission package: semantic holograph, tree of thought, goal engine, supreme engine, chat, encyclopedia, content suite, vision, and more. Bridge-gated."},{"id":"drex-mitosis-copy","label":"HALEX-M mitosis staging copy (Drex/MiroFish)","category":"intelligence","source":"pending-builds/drex-mirofish-halexm-mitosis-copy-20261103.json","status":"DRAFT","gate":"DESIGN + INVENTORY ONLY","desc":"Staging copy draft distilled from the Drex/MiroFish research. NO copy execution was performed by this draft: no engine mitosis call, no chain record, no live mint."},{"id":"z100-038-wallet-skills","label":"ZINIUM wallet skills (Z100-038)","category":"intelligence","source":"pending-builds/z100-038-wallet-skills.py","status":"STAGED","gate":"ZINIUM CHAIN-500 RECORD","desc":"Wallet-as-processor skill records on chain 500. Staging record; not a HALEX-M execution path."},{"id":"SK-DREX-001","label":"Probability over options","category":"decision","source":"pending-builds/drex-mirofish-braintree-skills-20261103.json","status":"DRAFT-PROPOSAL","gate":"NOT FILED","desc":"Return one probability per known option instead of an essay. Options must be supplied in advance; none are invented."},{"id":"SK-DREX-002","label":"Confidence gating","category":"decision","source":"pending-builds/drex-mirofish-braintree-skills-20261103.json","status":"DRAFT-PROPOSAL","gate":"NOT FILED","desc":"Act only when the leading probability clears a human-set threshold; otherwise wait, with the wait recorded. A threshold is never by itself an order to move funds."},{"id":"SK-DREX-003","label":"Swarm rehearsal","category":"decision","source":"pending-builds/drex-mirofish-braintree-skills-20261103.json","status":"DRAFT-PROPOSAL","gate":"NOT FILED","desc":"Rehearse a decision across a swarm of simulated agents before acting. Proposal only; no rehearsal has been run as a filing."},{"id":"SK-DREX-004","label":"State composition","category":"decision","source":"pending-builds/drex-mirofish-braintree-skills-20261103.json","status":"DRAFT-PROPOSAL","gate":"NOT FILED","desc":"Compose a fixed decision state from fixed inputs before any probability is computed."},{"id":"SK-DREX-005","label":"Decision autopsy","category":"decision","source":"pending-builds/drex-mirofish-braintree-skills-20261103.json","status":"DRAFT-PROPOSAL","gate":"NOT FILED","desc":"After a decision, record what was known, what was chosen, and what happened, so the next decision learns from the last."}];

  // Chains the HALEX-M adapters cover (search + paper everywhere).
  var SUPPORTED_CHAINS = ['solana', 'base', 'ethereum', 'bnb', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'linea', 'blast', 'zksync', 'ink'];
  var CHAIN_ALIASES = {
    solana: 'solana', sol: 'solana', base: 'base', ethereum: 'ethereum', eth: 'ethereum',
    evm: 'evm', bnb: 'bnb', bsc: 'bnb', arbitrum: 'arbitrum', optimism: 'optimism',
    polygon: 'polygon', matic: 'polygon', avalanche: 'avalanche', avax: 'avalanche',
    linea: 'linea', blast: 'blast', zksync: 'zksync', ink: 'ink', sui: 'sui'
  };

  // ---- Organized toggle model -------------------------------------
  // User-facing groups over the free-text parse. Plain-English labels
  // only; the values are the matcher's vocabulary.
  var TOGGLE_GROUPS = [
    { id: 'chain', label: 'Chain', options: [
      { value: 'solana', label: 'Solana' },
      { value: 'base', label: 'Base' },
      { value: 'evm', label: 'EVM chains (Base, Ethereum, and friends)' },
      { value: 'any', label: 'No preference' } ] },
    { id: 'goal', label: 'What you want it to do', options: [
      { value: 'grow', label: 'Grow a small stack, carefully' },
      { value: 'trade', label: 'Make trades for me (paper first)' },
      { value: 'program', label: 'Build me a full trading program' },
      { value: 'research-first', label: 'Research first, trades second' } ] },
    { id: 'risk', label: 'Risk level', options: [
      { value: 'cautious', label: 'Cautious: protect the stack first' },
      { value: 'balanced', label: 'Balanced: steady chances, hard exits' },
      { value: 'bold', label: 'Bold: bigger swings, can lose fast' } ] },
    { id: 'budget', label: 'Budget per run', options: [
      { value: 'micro', label: 'Micro: $10 or less' },
      { value: 'small', label: 'Small: $11 to $50' },
      { value: 'standard', label: 'Standard: $51 to $250' },
      { value: 'any', label: 'Not set yet' } ] },
    { id: 'automation', label: 'How hands-on', options: [
      { value: 'explain', label: 'Explain only: show me, I decide' },
      { value: 'paper-auto', label: 'Paper automatic: it paper-trades, I watch the record' },
      { value: 'assisted', label: 'Assisted: it proposes, I confirm every step' } ] }
  ];

  // Per-skill fit profile for the trading primaries (the only
  // category offered as a trade skill). Behavior text comes from the
  // inventory desc; this map only says where each skill fits.
  var FIT = {
    'SL-momentum': { goals: ['grow', 'trade'], risk: ['balanced', 'bold'], budgets: ['micro', 'small', 'standard'], times: ['fast', 'swing'], chains: ['any', 'solana', 'base', 'evm'] },
    'SL-mirror':    { goals: ['trade', 'grow'], risk: ['balanced', 'cautious'], budgets: ['small', 'standard'], times: ['swing'], chains: ['any', 'solana', 'base', 'evm'] },
    'SL-fresh':     { goals: ['grow', 'trade'], risk: ['bold', 'balanced'], budgets: ['micro', 'small'], times: ['fast'], chains: ['any', 'solana'] },
    'SL-meanrev':   { goals: ['grow', 'trade'], risk: ['cautious', 'balanced'], budgets: ['small', 'standard'], times: ['swing', 'long'], chains: ['any', 'base', 'evm', 'solana'] },
    'SL-dip':       { goals: ['grow', 'trade'], risk: ['cautious', 'balanced'], budgets: ['micro', 'small', 'standard'], times: ['swing'], chains: ['any', 'solana', 'base', 'evm'] },
    'HM-trading':   { goals: ['program', 'trade'], risk: ['cautious', 'balanced', 'bold'], budgets: ['small', 'standard', 'any'], times: ['swing', 'long'], chains: ['any', 'solana', 'base', 'evm'] }
  };
  // Support skills attached to an offer as a set (plain-English roles).
  var SUPPORTS = {
    'SL-momentum': ['APEX2'],
    'SL-mirror': ['APEX2'],
    'SL-fresh': ['APEX2', 'ZCURE'],
    'SL-meanrev': ['APEX2'],
    'SL-dip': ['APEX2'],
    'HM-trading': ['APEX2', 'SK-DREX-002']
  };
  // Requests for capabilities the inventory does not carry at all.
  var BESPOKE_KEYWORDS = ['options', 'futures', 'perpetual', 'perp ', 'shorting', 'grid bot', 'market making', 'arbitrage', 'wheel strategy', 'leveraged', 'leverage'];

  function byId(inv, id) {
    for (var i = 0; i < inv.length; i++) if (inv[i].id === id) return inv[i];
    return null;
  }

  function budgetBand(amount) {
    if (amount == null) return 'any';
    if (amount <= 10) return 'micro';
    if (amount <= 50) return 'small';
    if (amount <= 250) return 'standard';
    return 'standard';
  }

  // ---- (a) Free-text intake ---------------------------------------
  function parseRequest(text) {
    var raw = String(text || '');
    var t = ' ' + raw.toLowerCase().replace(/[^a-z0-9$%. ]/g, ' ') + ' ';
    var p = { chain: null, chainRaw: null, budget: null, budgetBand: 'any',
              goal: null, timeframe: null, risk: null, vague: false,
              profitSeeking: false, unsupportedChain: null };

    Object.keys(CHAIN_ALIASES).forEach(function (k) {
      if (p.chain) return;
      if (t.indexOf(' ' + k + ' ') !== -1 || t.indexOf(' ' + k + ',') !== -1) {
        p.chainRaw = CHAIN_ALIASES[k];
        p.chain = CHAIN_ALIASES[k] === 'evm' ? 'evm' : CHAIN_ALIASES[k];
        if (SUPPORTED_CHAINS.indexOf(p.chain) === -1 && p.chain !== 'evm') p.unsupportedChain = p.chain;
      }
    });

    var bm = raw.match(/\$\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\$|dollars|usd|bucks)/i);
    if (bm) { p.budget = parseFloat(bm[1] || bm[2]); p.budgetBand = budgetBand(p.budget); }

    if (/\b(money|profit|profits|rich|grow|earn|gains?)\b/.test(t)) p.profitSeeking = true;
    if (/\b(program|programme|system)\b/.test(t) && /\b(trad|program|system|strateg)/.test(t)) p.goal = 'program';
    else if (/\b(strateg|trade|trades|trading|skill|set)\b/.test(t)) p.goal = p.profitSeeking ? 'grow' : 'trade';
    if (/\b(research|check|investigat|look into)\b/.test(t)) p.goal = 'research-first';

    if (/\b(scalp|quick|fast|minutes|intraday)\b/.test(t)) p.timeframe = 'fast';
    else if (/\b(long term|hold|weeks|months)\b/.test(t)) p.timeframe = 'long';
    else if (/\b(day|swing|hours)\b/.test(t)) p.timeframe = 'swing';

    if (/\b(safe|careful|cautious|conservative|low risk|protect)\b/.test(t)) p.risk = 'cautious';
    else if (/\b(aggressive|bold|risky|degen|lots of money|big)\b/.test(t)) p.risk = 'bold';

    // Vague = a wish with almost nothing to match on: no chain, no
    // budget, no timeframe, and either profit wording or very few
    // content words.
    var contentWords = raw.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/)
      .filter(function (w) { return w && ['give', 'me', 'a', 'the', 'that', 'will', 'make', 'use', 'what', 'would', 'work', 'best', 'for', 'please', 'can', 'you'].indexOf(w) === -1; });
    p.vague = !p.chain && p.budget == null && !p.timeframe && (p.profitSeeking || contentWords.length <= 3);
    return p;
  }

  function isForbiddenRequest(text) {
    var t = String(text || '').toLowerCase();
    var patterns = ['seed phrase', 'private key', 'secret key', 'sign this', 'connect wallet', 'password', 'mnemonic', 'keystore', 'withdraw', 'my wallet key', 'api key'];
    for (var i = 0; i < patterns.length; i++) if (t.indexOf(patterns[i]) !== -1) return true;
    return false;
  }

  // Honest measured label from the inventory record alone.
  function measuredStatus(skill) {
    var gate = String(skill.gate || '');
    if (/PROVEN(?!.*NOT)/.test(gate) && gate.indexOf('NOT PROVEN') === -1 && skill.status === 'PROVEN') {
      return { label: 'proven', text: 'Proven on its recorded paper gate.' };
    }
    if (skill.status === 'TESTED') {
      return { label: 'paper-testing', text: 'Paper-testing: it has run in the paper arena, and its gate reads "' + gate + '". It has not yet cleared the proven bar (30+ closed paper trades, 65%+ win rate, 1.2+ profit factor), so treat every result as unproven.' };
    }
    if (skill.status === 'IDEA') {
      return { label: 'unproven', text: 'Unproven: this is a template idea, not a working skill yet. It is never offered as a finished skill.' };
    }
    return { label: 'unproven', text: 'Unproven: staged and recorded in the inventory (status ' + skill.status + ', gate "' + gate + '"), with no measured trading record claimed for it.' };
  }

  function paperPlan(skill, parsed, toggles) {
    var size = parsed.budget != null ? ('$' + parsed.budget) : 'a small test size you set';
    var chainTxt = parsed.chain ? (' on ' + parsed.chain) : ' on the chain you pick';
    var auto = (toggles && toggles.automation) || 'paper-auto';
    var autoTxt = auto === 'explain' ? 'You watch each paper step and decide; nothing runs on its own.'
      : auto === 'assisted' ? 'It proposes each paper step and waits for your confirm.'
      : 'It paper-trades on its own and you watch the full record.';
    return 'Paper first' + chainTxt + ' at ' + size + ' per paper trade. ' + autoTxt +
      ' The run is scored trade by trade against the proven bar (30+ closed, 65%+ win rate, 1.2+ profit factor). No live step exists in this shop: a skill that clears the bar still goes through human review before anything else is even discussed.';
  }

  function whyFits(skill, parsed, toggles) {
    var bits = [];
    var fit = FIT[skill.id] || { goals: [], risk: [], budgets: [], times: [], chains: [] };
    var goal = (toggles && toggles.goal) || parsed.goal;
    var risk = (toggles && toggles.risk) || parsed.risk || 'balanced';
    if (parsed.chain && fit.chains.indexOf(parsed.chain) !== -1) bits.push('it runs on ' + parsed.chain + ' through the HALEX-M adapters (search and paper there)');
    if (goal && fit.goals.indexOf(goal) !== -1) bits.push(goal === 'program' ? 'it is the closest thing in the shop to a full trading program, not a single move' : goal === 'grow' ? 'it is a growth-style skill, built to take a defined chance and exit on rules, not hope' : 'it is built to place rule-based trades, which is what you asked for');
    if (fit.risk.indexOf(risk) !== -1) bits.push('its pace matches a ' + risk + ' risk answer');
    if (parsed.budgetBand !== 'any' && fit.budgets.indexOf(parsed.budgetBand) !== -1) bits.push('it fits a ' + parsed.budgetBand + ' budget like yours, so a paper run at your size means something');
    if (parsed.timeframe && fit.times.indexOf(parsed.timeframe) !== -1) bits.push('its holding style matches your timeframe');
    if (!bits.length) bits.push('it is the closest honest match in the current inventory, and its limits are labeled below');
    return 'Why this one: ' + bits.join('; ') + '.';
  }

  function scoreSkill(skill, parsed, toggles) {
    var fit = FIT[skill.id]; if (!fit) return -Infinity;
    var s = 0;
    var goal = (toggles && toggles.goal) || parsed.goal;
    var risk = (toggles && toggles.risk) || parsed.risk || 'balanced';
    var band = (toggles && toggles.budget) || parsed.budgetBand;
    var chain = (toggles && toggles.chain) || parsed.chain;
    if (chain && chain !== 'any') { if (fit.chains.indexOf(chain) !== -1) s += 3; if (chain === 'solana' && skill.id === 'SL-fresh') s += 3; if (chain === 'solana' && skill.id === 'SL-mirror') s += 1; if (chain === 'base' && skill.id === 'HM-trading') s += 1; }
    if (goal && fit.goals.indexOf(goal) !== -1) s += 4;
    if (goal === 'program' && skill.id === 'HM-trading') s += 4;
    if (fit.risk.indexOf(risk) !== -1) s += 2;
    if (risk === 'bold' && skill.id === 'SL-fresh') s += 1;
    if (risk === 'cautious' && skill.id === 'SL-fresh') s -= 2;
    if (band && band !== 'any' && fit.budgets.indexOf(band) !== -1) s += 2;
    if (parsed.timeframe && fit.times.indexOf(parsed.timeframe) !== -1) s += 2;
    if (parsed.profitSeeking && (skill.id === 'SL-momentum' || skill.id === 'SL-dip')) s += 1;
    return s;
  }

  function makeOffer(inv, skill, parsed, toggles) {
    var supports = (SUPPORTS[skill.id] || []).map(function (id) { return byId(inv, id); }).filter(Boolean);
    var ms = measuredStatus(skill);
    var setName = supports.length ? (skill.label + ' + ' + supports.map(function (x) { return x.label; }).join(' + ') + ' (set)') : skill.label;
    var does = skill.desc + (supports.length ? ' In this set, ' + supports.map(function (x) { return x.label + ' adds: ' + x.desc; }).join(' ') : '');
    return {
      skillId: skill.id,
      setIds: [skill.id].concat(supports.map(function (x) { return x.id; })),
      name: setName,
      whyItFits: whyFits(skill, parsed, toggles),
      whatItDoes: does,
      paperPlan: paperPlan(skill, parsed, toggles),
      measuredStatus: ms.label,
      measuredStatusText: ms.text,
      mode: 'paper',
      proprietaryNote: 'You get the running skill and its plain-English behavior. The recipe behind it stays proprietary and is not shown.'
    };
  }

  // ---- (d) Bespoke path -------------------------------------------
  var LIFECYCLE = ['PROPOSED', 'security gates', 'paper proof', 'human review', 'FILED'];
  function bespokeRecord(text, parsed, reason) {
    return {
      kind: 'strategy-build-request',
      addressedTo: '300-OP-01',
      addressedName: 'Skill Lab Operator (of the 300)',
      agency: 'The 300 agency wired into HALEX-M, working through the Skill Lab operator with Braintree access',
      originalRequest: String(text || ''),
      parsed: parsed,
      reason: reason,
      stage: 'PROPOSED',
      lifecycle: LIFECYCLE.slice(),
      gates: { screens: null, machine: null, paperProof: null, humanReview: null },
      history: ['PROPOSED'],
      execution: 'none',
      note: 'This is a filed request record only. The agency designs from the Braintree inventory and its recorded knowledge, the proposal must pass both security gates, prove itself on paper, and pass human review before it is FILED as a skill. Nothing here executes, trades, signs, or moves funds.'
    };
  }

  function needsBespoke(text, parsed) {
    if (parsed.unsupportedChain) return 'the inventory adapters do not cover the ' + parsed.unsupportedChain + ' chain yet';
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < BESPOKE_KEYWORDS.length; i++) {
      if (t.indexOf(BESPOKE_KEYWORDS[i]) !== -1) return 'the inventory carries no ' + BESPOKE_KEYWORDS[i].trim() + ' skill today';
    }
    return null;
  }

  // ---- Main entry ---------------------------------------------------
  function answer(text, toggles, inventory) {
    var inv = inventory || INVENTORY;
    toggles = toggles || {};
    if (isForbiddenRequest(text)) return { type: 'refusal', refusal: REFUSAL };
    var parsed = parseRequest(text);
    var reason = needsBespoke(text, parsed);
    if (reason) {
      return { type: 'bespoke', disclosure: RISK_DISCLOSURE, parsed: parsed,
               proposal: bespokeRecord(text, parsed, reason) };
    }
    var primaries = inv.filter(function (s) { return s.category === 'trading' && FIT[s.id] && s.status !== 'IDEA'; });
    var scored = primaries.map(function (s) { return { s: s, score: scoreSkill(s, parsed, toggles) }; })
      .sort(function (a, b) { return b.score - a.score; });
    var offers = scored.slice(0, 3).map(function (x) { return makeOffer(inv, x.s, parsed, toggles); });
    var out = { type: 'offers', parsed: parsed, offers: offers, disclosure: RISK_DISCLOSURE };
    if (parsed.profitSeeking) out.reframe = 'You asked for profit. No honest shop can promise that, so this was read as a goal: find the skills whose recorded behavior best fits growing a stack, with the risk stated up front.';
    if (parsed.vague) out.followUp = 'That request was wide open, so safe defaults were used (any chain, balanced risk, paper only). Set the toggles, chain, budget, risk, and how hands-on you want it, and the match sharpens.';
    return out;
  }

  // ---- (e) The owner's five examples, verbatim ---------------------
  var DEMO_CASES = [
    'Give me a trade skill that will make me lots of money.',
    'Use the best trading skill to make trades?',
    'What trade skill, or set, or .md would work best for Solana?',
    'Build me a trading program.',
    'Create a trading strategy for 5$ on Solana'
  ];

  function createConcierge(inventory) {
    var inv = inventory || INVENTORY;
    return {
      answer: function (text, toggles) { return answer(text, toggles, inv); },
      parseRequest: parseRequest,
      inventory: inv
    };
  }

  var api = {
    HALEX_WC_PROJECT_ID: HALEX_WC_PROJECT_ID,
    REFUSAL: REFUSAL,
    RISK_DISCLOSURE: RISK_DISCLOSURE,
    INVENTORY: INVENTORY,
    TOGGLE_GROUPS: TOGGLE_GROUPS,
    SUPPORTED_CHAINS: SUPPORTED_CHAINS,
    LIFECYCLE: LIFECYCLE,
    DEMO_CASES: DEMO_CASES,
    parseRequest: parseRequest,
    isForbiddenRequest: isForbiddenRequest,
    measuredStatus: measuredStatus,
    bespokeRecord: bespokeRecord,
    answer: answer,
    createConcierge: createConcierge
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMSkillShopConcierge = api;
})(typeof window !== 'undefined' ? window : this);
