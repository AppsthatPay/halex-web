/* HALEX-M upgrade — STAGING ONLY.
 *
 * HALEX-M AI tab (in-tab chat, blockchain-centric), SMT shared draft
 * across the HALEX-M AI tab / Skills Lab Forge / Trading tab, Chaintarium
 * unclutter toggles, and the Skills Lab Q&A trading-strategy builder
 * ending in a trading card.
 *
 * Hard limits, kept from the page: HALEX-M holds no keys, signs nothing,
 * moves no funds. Wallet connect is read-only. Paper runs recorded here
 * are local records only — no fills are simulated, no contract is
 * deployed, and live execution is NOT wired in this static page. Any
 * figure not actually read is reported NOT READ, never invented. There
 * is no risk score, no VERIFIED label, and no seed/private-key input
 * anywhere in this file.
 *
 * SMT is the page's own definition: the Skills Lab builder, the patient
 * librarian of the Lab, the partner in the Skill Forge. That definition
 * governs; this file does not redefine it.
 */
(function () {
  'use strict';

  /* ---------- small helpers ---------- */
  function el(id) { return document.getElementById(id); }
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtUsd(v) {
    if (v == null || !isFinite(v)) return 'NOT READ';
    if (Math.abs(v) >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
    return '$' + Number(v).toFixed(2);
  }
  function fmtPrice(v) {
    if (v == null || !isFinite(v)) return 'NOT READ';
    if (v === 0) return '$0';
    if (Math.abs(v) < 0.0001) return '$' + Number(v).toExponential(2);
    return '$' + Number(v).toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }
  function isEvmAddr(s) { return /^0x[0-9a-fA-F]{40}$/.test(s || ''); }
  function isEvmTx(s) { return /^0x[0-9a-fA-F]{64}$/.test(s || ''); }
  function isSolAddr(s) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s || ''); }
  function isSolSig(s) { return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(s || ''); }

  /* ---------- SMT shared draft (in-page only) ---------- */
  var DRAFT = {
    chains: [], strategyType: '', strategyCustom: '',
    token: { address: '', name: '', symbol: '', meta: 'NOT READ', metaNote: '' },
    size: '', maxPerTrade: '', maxConcurrent: '',
    stopPct: '', takeProfitPct: '', slippagePct: '', gasReserve: '',
    paperHours: 72,
    settings: {
      accelOnly: true, skipOneSided: true, mayhemFailClosed: true,
      trailRunner: false, ladderExits: true, requireLinks: true,
      capDailyPaper: false, autoFadeWallet: false
    },
    notes: [], qaStep: 0
  };
  window.HalexSMT = {
    draft: DRAFT,
    addNote: function (note) {
      if (note) DRAFT.notes.push(String(note));
      renderDraft();
    }
  };
  var SETTING_LABELS = {
    accelOnly: 'Only buy while buys are accelerating (never into a flat tape)',
    skipOneSided: 'Skip one-sided tape (many buys, almost no sells)',
    mayhemFailClosed: 'Mayhem-mode tokens fail closed (no verifiable links = no trade)',
    trailRunner: 'Trail the runner instead of selling everything at the first target',
    ladderExits: 'Ladder exits: sell in rungs as the trade works',
    requireLinks: 'Require a verifiable website or social link before any paper entry',
    capDailyPaper: 'Cap paper trades per day for this skill',
    autoFadeWallet: 'If a mirrored wallet fades, fade the skill with it'
  };

  function renderDraft() {
    var box = el('smt-draft-body');
    if (!box) return;
    var d = DRAFT, html = '';
    function piece(title, body) {
      html += '<div class="draft-piece"><b>' + title + '</b><div>' + body + '</div></div>';
    }
    piece('Chains', d.chains.length ? escHtml(d.chains.join(', ')) : 'Not set yet — the Q&A builder in this tab sets it.');
    piece('Strategy', d.strategyType ? escHtml(d.strategyType) + (d.strategyCustom ? ' — ' + escHtml(d.strategyCustom) : '') : 'Not set yet.');
    piece('Token', d.token.address ? escHtml(d.token.symbol || '') + ' ' + escHtml(d.token.address) + ' · metadata: ' + escHtml(d.token.meta) : 'No contract address yet — the Q&A builder requires one.');
    piece('Size and caps', (d.size || '—') + ' per trade · max per trade ' + (d.maxPerTrade || '—') + ' · max concurrent ' + (d.maxConcurrent || '—'));
    piece('Risk', 'Stop ' + (d.stopPct || '—') + '% · take-profit ' + (d.takeProfitPct || '—') + '% · slippage ' + (d.slippagePct || '—') + '% · gas reserve ' + (d.gasReserve || '—'));
    piece('Paper-test plan', d.paperHours + ' hours of paper testing, then the gate below — before live is even offered.');
    var on = [];
    Object.keys(SETTING_LABELS).forEach(function (k) { if (d.settings[k]) on.push(SETTING_LABELS[k]); });
    piece('Settings on', on.length ? escHtml(on.join(' · ')) : 'None on.');
    piece('Notes from chats', d.notes.length ? escHtml(d.notes.slice(-6).join('\n')) : 'Nothing yet — use “Add to SMT draft” in the HALEX-M AI or Trading chat.');
    box.innerHTML = html;
  }

  /* ---------- chat plumbing ---------- */
  function chatMsg(logId, who, text) {
    var box = el(logId);
    if (!box) return;
    var d = document.createElement('div');
    d.className = 'halexm-msg ' + who;
    var w = document.createElement('span');
    w.className = 'who';
    w.textContent = who === 'user' ? 'You' : 'HALEX-M AI';
    d.appendChild(w);
    d.appendChild(document.createTextNode(String(text)));
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  /* ---------- live reads (page patterns only) ---------- */
  function dsTokenRead(address) {
    return fetch('https://api.dexscreener.com/latest/dex/tokens/' + encodeURIComponent(address))
      .then(function (r) { if (!r.ok) throw new Error('DexScreener answered HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var pairs = (j && j.pairs) || [];
        var want = String(address).toLowerCase();
        var mine = pairs.filter(function (p) { return p.baseToken && String(p.baseToken.address || '').toLowerCase() === want; });
        if (!mine.length) return null;
        mine.sort(function (a, b) { return ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0); });
        return mine[0];
      });
  }
  function scanTokenText(address) {
    return dsTokenRead(address).then(function (p) {
      if (!p) return 'Token scan — ' + address + '\nNo live pair found for this contract on DexScreener. An untracked contract is itself a flag: nothing below is claimed.\nPrice: NOT READ\nLiquidity: NOT READ\nCustody: NOT READ (LP custody is proven on-chain in the live gate, not here)\nSell simulation at size: NOT READ\nHolder and deployer forensics: NOT READ';
      var lines = [];
      lines.push('Token scan — live DexScreener pair');
      lines.push('Name: ' + ((p.baseToken && p.baseToken.name) || 'NOT READ'));
      lines.push('Symbol: ' + ((p.baseToken && p.baseToken.symbol) || 'NOT READ'));
      lines.push('Chain: ' + (p.chainId || 'NOT READ') + ' · venue: ' + (p.dexId || 'NOT READ'));
      lines.push('Price: ' + fmtPrice(p.priceUsd != null ? Number(p.priceUsd) : null));
      lines.push('Liquidity: ' + fmtUsd(p.liquidity ? p.liquidity.usd : null));
      lines.push('Volume 24h: ' + fmtUsd(p.volume ? p.volume.h24 : null));
      lines.push('Tape 24h: ' + ((p.txns && p.txns.h24) ? (p.txns.h24.buys + ' buys / ' + p.txns.h24.sells + ' sells') : 'NOT READ'));
      lines.push('Market cap / FDV: ' + fmtUsd(p.marketCap || p.fdv || null));
      var webs = (p.info && p.info.websites) || [];
      var socials = (p.info && p.info.socials) || [];
      lines.push('Websites: ' + (webs.length ? webs.map(function (w) { return w.url || w.label || ''; }).join(', ') : 'NOT READ — no website in the pair info block'));
      lines.push('Socials: ' + (socials.length ? socials.map(function (s) { return (s.type || '') + ' ' + (s.url || ''); }).join(', ') : 'NOT READ — no social link in the pair info block'));
      lines.push('Pair: ' + (p.url || 'NOT READ'));
      lines.push('No risk score is given here — this page does not compute one. Custody, sell simulation, and holder/deployer forensics are NOT READ in this view; they run on-chain in the live gate before any buy.');
      lines.push('Advisory only. HALEX-M holds no keys, signs nothing, moves no funds.');
      return lines.join('\n');
    }).catch(function (e) {
      return 'Token scan — DexScreener did not answer (' + (e && e.message ? e.message : String(e)) + '). Nothing was read, so nothing is claimed. Try again in a moment.';
    });
  }
  function scanWalletText(address) {
    if (isEvmAddr(address)) {
      return Promise.resolve('Wallet scan — ' + address + '\nEVM wallet balances: NOT READ in this chat. EVM balances in HALEX-M are read through the connected injected provider in the Wallet tab, not from a pasted address here. Connect a wallet there to see its balances, read-only.');
    }
    if (!isSolAddr(address)) return Promise.resolve('Wallet scan — that does not look like a Solana wallet address or an EVM address (0x + 40 hex characters). Paste a full address.');
    if (typeof solRpc !== 'function') return Promise.resolve('Wallet scan — the Solana read helper is not loaded in this page, so nothing was read. NOT READ.');
    var programs = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'];
    var calls = [solRpc('getBalance', [address])];
    programs.forEach(function (pr) {
      calls.push(solRpc('getTokenAccountsByOwner', [address, { programId: pr }, { encoding: 'jsonParsed' }]).catch(function () { return { value: [] }; }));
    });
    return Promise.all(calls).then(function (res) {
      var bal = res[0];
      var lamports = bal && typeof bal === 'object' ? Number(bal.value || 0) : Number(bal || 0);
      var count = 0;
      res.slice(1).forEach(function (r) { count += ((r && r.value) || []).length; });
      var lines = [];
      lines.push('Wallet scan — Solana, live public RPC read');
      lines.push('Address: ' + address);
      lines.push('SOL balance: ' + (lamports / 1e9).toFixed(6) + ' SOL');
      lines.push('Token accounts held: ' + count + ' (balances per token: NOT READ in this view — open the Wallet tab to view a full read-only breakdown)');
      lines.push('USD value: NOT READ (no price read was run for this scan)');
      lines.push('Advisory only. This read never connects, signs, or moves anything.');
      return lines.join('\n');
    }).catch(function (e) {
      return 'Wallet scan — the Solana RPC did not answer (' + (e && e.message ? e.message : String(e)) + '). NOT READ.';
    });
  }
  function scanTxText(hash) {
    if (isEvmTx(hash)) {
      return Promise.resolve('Transaction scan — ' + hash + '\nEVM transaction lookup: NOT READ. No EVM transaction lookup is wired in this page, so nothing is claimed about this hash.');
    }
    if (!isSolSig(hash)) return Promise.resolve('Transaction scan — that does not look like a Solana signature or an EVM transaction hash. Paste the full hash.');
    if (typeof solRpc !== 'function') return Promise.resolve('Transaction scan — the Solana read helper is not loaded in this page. NOT READ.');
    return solRpc('getTransaction', [hash, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }])
      .then(function (tx) {
        if (!tx || !tx.meta) return 'Transaction scan — no transaction found for that signature on the Solana RPC. NOT READ.';
        var lines = [];
        lines.push('Transaction scan — Solana, live public RPC read');
        lines.push('Signature: ' + hash);
        lines.push('Slot: ' + (tx.slot != null ? tx.slot : 'NOT READ'));
        lines.push('Status: ' + (tx.meta.err ? 'FAILED on-chain (' + JSON.stringify(tx.meta.err) + ')' : 'Confirmed, no error reported'));
        lines.push('Fee: ' + (tx.meta.fee != null ? (tx.meta.fee / 1e9) + ' SOL' : 'NOT READ'));
        lines.push('Balance changes per address: NOT READ in this view (no address was supplied with the signature).');
        return lines.join('\n');
      })
      .catch(function (e) {
        return 'Transaction scan — the Solana RPC did not answer (' + (e && e.message ? e.message : String(e)) + '). NOT READ.';
      });
  }

  /* ---------- the answer pipeline ---------- */
  var BC_TOPICS = [
    ['smart contract', 'smart contract'], ['allowance', 'allowance'],
    ['paper proving', 'paper proving'], ['paper test', 'paper proving'],
    ['solana fee', 'solana fees'], ['gas fee', 'gas'],
    ['slippage', 'slippage'], ['liquidity', 'liquidity'],
    ['transfer', 'transfer'], ['blockchain', 'blockchain'],
    ['address control', 'address control']
  ];
  function halexmAnswer(text) {
    var q = String(text || '').trim();
    if (!q) return Promise.resolve('Ask me about a blockchain topic, paste a contract address to scan it, or say “build a skill with me” to open the Q&A builder in the Skills Lab.');
    if (typeof HalexMBlockchain !== 'undefined' && HalexMBlockchain.checkRequest) {
      var chk = HalexMBlockchain.checkRequest(q);
      if (chk.refused) return Promise.resolve(chk.message);
    }
    var scan = q.match(/^scan\s+(token|wallet|tx|transaction)\s+(\S+)/i);
    if (scan) {
      var kind = scan[1].toLowerCase();
      if (kind === 'token') return scanTokenText(scan[2]);
      if (kind === 'wallet') return scanWalletText(scan[2]);
      return scanTxText(scan[2]);
    }
    if (isEvmAddr(q) || isSolAddr(q)) return scanTokenText(q).then(function (t) {
      return t + '\n\n(That looked like a contract or mint address, so it was scanned as a token. For a wallet, say “scan wallet <address>”.)';
    });
    if (isEvmTx(q) || isSolSig(q)) return scanTxText(q);
    if (/build.*skill|skill builder|trading card|q&a builder/.test(q.toLowerCase())) {
      return Promise.resolve('The skill builder lives in the Skills Lab tab, as a multi-step Q&A that ends in a trading card. Tap “Open the Skills Lab builder” below (or the Skills Lab tab) — your answers there land in the same SMT draft this chat shares, and the card offers paper first, with live disabled until a real signed executor exists.');
    }
    if (typeof HalexMBlockchain !== 'undefined' && HalexMBlockchain.explainBlockchain) {
      var low = q.toLowerCase(), hit = null;
      for (var i = 0; i < BC_TOPICS.length; i++) {
        if (low.indexOf(BC_TOPICS[i][0]) !== -1) { hit = BC_TOPICS[i][1]; break; }
      }
      if (hit) return Promise.resolve(HalexMBlockchain.explainBlockchain(hit, {}));
    }
    if (typeof HalexMAI !== 'undefined' && HalexMAI.answerLocal) {
      return Promise.resolve(HalexMAI.answerLocal(q));
    }
    return Promise.resolve('HALEX-M AI is advisory only: it explains, scans through public reads, and helps build skills. It never trades, never signs, and never moves funds.');
  }
  function wireChat(logId, inputId, sendId, draftId) {
    var input = el(inputId), send = el(sendId);
    if (!input || !send) return;
    function go() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      chatMsg(logId, 'user', text);
      chatMsg(logId, 'halex', 'Reading…');
      halexmAnswer(text).then(function (ans) {
        var box = el(logId);
        if (box && box.lastChild) box.removeChild(box.lastChild);
        chatMsg(logId, 'halex', ans);
        window.HalexMChatLast = { q: text, a: ans };
      });
    }
    send.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); }
    });
    var db = draftId ? el(draftId) : null;
    if (db) db.addEventListener('click', function () {
      var last = window.HalexMChatLast;
      if (!last) return;
      window.HalexSMT.addNote('Chat note — asked: ' + last.q.slice(0, 120));
      window.HalexSMT.addNote('Chat note — answered: ' + last.a.slice(0, 200));
      if (typeof toast === 'function') toast('Added to the SMT draft — see it in the Skills Lab.');
    });
  }

  /* ---------- options lists that route to the HALEX-M AI tab ---------- */
  var OPTIONS = {
    chaintarium: ['Explain Chaintarium', 'How do I unclutter the cosmos?', 'Scan a token (paste its contract)', 'What does custody mean?'],
    trading: ['Build a trading skill with me', 'Explain the paper-test gate', 'Scan a token (paste its contract)', 'What is a copycat swarm?'],
    research: ['Explain Token DNA', 'What is a copycat swarm?', 'Scan a token (paste its contract)', 'What does custody mean?'],
    skills: ['Build a trading skill with me', 'Explain the paper-test gate', 'What is slippage?', 'Scan a token (paste its contract)']
  };
  function renderOptLists() {
    var lists = document.querySelectorAll('.halexm-optlist');
    lists.forEach(function (list) {
      var ctx = list.getAttribute('data-context') || 'trading';
      var opts = OPTIONS[ctx] || OPTIONS.trading;
      opts.forEach(function (opt) {
        var b = document.createElement('button');
        b.className = 'btn';
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', function () {
          if (typeof showTab === 'function') showTab('halexmai');
          var inp = el('halexmai-input');
          if (inp) { inp.value = opt; inp.focus(); }
        });
        list.appendChild(b);
      });
    });
  }

  /* ---------- Chaintarium unclutter toggles ---------- */
  window.HalexMUnclutter = { collapseInactive: false, highSignal: false, streamlineFeed: false };
  var savedLayers = null;
  function syncUnclutter() {
    var u = window.HalexMUnclutter;
    var b;
    b = el('uncl-collapse-inactive');
    if (b) { b.textContent = 'Collapse inactive tokens: ' + (u.collapseInactive ? 'on' : 'off'); b.setAttribute('aria-pressed', u.collapseInactive ? 'true' : 'false'); }
    b = el('uncl-high-signal');
    if (b) { b.textContent = 'High-signal only: ' + (u.highSignal ? 'on' : 'off'); b.setAttribute('aria-pressed', u.highSignal ? 'true' : 'false'); }
    b = el('uncl-streamline-feed');
    if (b) { b.textContent = 'Streamline tx feed: ' + (u.streamlineFeed ? 'on' : 'off'); b.setAttribute('aria-pressed', u.streamlineFeed ? 'true' : 'false'); }
  }
  function initUnclutter() {
    var u = window.HalexMUnclutter;
    var b = el('uncl-collapse-inactive');
    if (b) b.addEventListener('click', function () {
      u.collapseInactive = !u.collapseInactive;
      syncUnclutter();
      if (typeof renderTrackPanel === 'function') renderTrackPanel();
    });
    b = el('uncl-high-signal');
    if (b) b.addEventListener('click', function () {
      u.highSignal = !u.highSignal;
      if (typeof chainLayers !== 'undefined' && typeof applyChainLayers === 'function') {
        if (u.highSignal) {
          savedLayers = {};
          Object.keys(chainLayers).forEach(function (k) { savedLayers[k] = chainLayers[k]; });
          ['platforms', 'wallets', 'rugs', 'bundles'].forEach(function (k) { if (k in chainLayers) chainLayers[k] = true; });
          ['transactions', 'flows', 'labels', 'scan'].forEach(function (k) { if (k in chainLayers) chainLayers[k] = false; });
        } else if (savedLayers) {
          Object.keys(savedLayers).forEach(function (k) { chainLayers[k] = savedLayers[k]; });
        }
        applyChainLayers();
      }
      syncUnclutter();
    });
    b = el('uncl-streamline-feed');
    if (b) b.addEventListener('click', function () {
      u.streamlineFeed = !u.streamlineFeed;
      var f = el('surf-feed');
      if (f) f.classList.toggle('sf-compact', u.streamlineFeed);
      syncUnclutter();
    });
    syncUnclutter();
  }

  /* ---------- Skills Lab Q&A builder + trading card ---------- */
  var QA_CHAINS = ['Solana', 'Base', 'Ethereum', 'Arbitrum', 'Polygon'];
  var QA_TYPES = ['snipe', 'momentum', 'mirror', 'dip', 'custom'];
  function qaNote(msg) {
    var n = el('qa-note');
    if (n) n.textContent = msg || '';
  }
  function qaVal(id) { var e = el(id); return e ? e.value.trim() : ''; }
  function renderQA() {
    var body = el('qa-body');
    if (!body) return;
    var d = DRAFT, step = d.qaStep, html = '';
    function checked(v, arr) { return arr.indexOf(v) !== -1 ? ' checked' : ''; }
    if (step === 0) {
      html += '<p class="note">Step 1 of 6 — which chain or chains does this skill watch?</p>';
      QA_CHAINS.forEach(function (c) {
        html += '<label class="qa-check"><input type="checkbox" data-qa-chain="' + c + '"' + checked(c, d.chains) + '> ' + c + '</label>';
      });
    } else if (step === 1) {
      html += '<p class="note">Step 2 of 6 — what kind of skill is this?</p>';
      QA_TYPES.forEach(function (t) {
        html += '<label class="qa-check"><input type="radio" name="qa-type" value="' + t + '"' + (d.strategyType === t ? ' checked' : '') + '> ' + (t === 'custom' ? 'Custom — describe it below' : t) + '</label>';
      });
      html += '<label class="flabel" for="qa-custom">Custom description (only needed for Custom)</label><textarea id="qa-custom" rows="2" placeholder="Describe the entry idea in plain words…">' + escHtml(d.strategyCustom) + '</textarea>';
    } else if (step === 2) {
      html += '<p class="note">Step 3 of 6 — the token. A contract address is required (tickers are shared by many tokens).</p>';
      html += '<label class="flabel" for="qa-addr">Contract address (EVM 0x + 40 hex, or Solana mint)</label><input id="qa-addr" type="text" value="' + escHtml(d.token.address) + '" placeholder="0x… or a Solana mint address" autocomplete="off" spellcheck="false" style="width:100%">';
      html += '<div style="display:flex; gap:8px; margin-top:9px; flex-wrap:wrap"><button class="btn" id="qa-meta" type="button">Check metadata (live read)</button></div>';
      html += '<p class="note" id="qa-meta-line">Metadata: ' + escHtml(d.token.meta) + (d.token.name ? ' · ' + escHtml(d.token.name) + ' ($' + escHtml(d.token.symbol) + ')' : '') + (d.token.metaNote ? ' — ' + escHtml(d.token.metaNote) : '') + '</p>';
    } else if (step === 3) {
      html += '<p class="note">Step 4 of 6 — size and caps for the paper run (settings, not an order).</p>';
      html += '<label class="flabel" for="qa-size">Paper size per trade</label><input id="qa-size" type="number" min="0" step="any" value="' + escHtml(d.size) + '">';
      html += '<label class="flabel" for="qa-maxper">Max per trade</label><input id="qa-maxper" type="number" min="0" step="any" value="' + escHtml(d.maxPerTrade) + '">';
      html += '<label class="flabel" for="qa-maxcon">Max concurrent paper positions</label><input id="qa-maxcon" type="number" min="0" step="1" value="' + escHtml(d.maxConcurrent) + '">';
    } else if (step === 4) {
      html += '<p class="note">Step 5 of 6 — risk, written before any paper trade. A skill without a stop is not finished.</p>';
      html += '<label class="flabel" for="qa-stop">Stop-loss (%)</label><input id="qa-stop" type="number" min="0" max="100" step="any" value="' + escHtml(d.stopPct) + '">';
      html += '<label class="flabel" for="qa-tp">Take-profit (%)</label><input id="qa-tp" type="number" min="0" step="any" value="' + escHtml(d.takeProfitPct) + '">';
      html += '<label class="flabel" for="qa-slip">Slippage tolerance (%)</label><input id="qa-slip" type="number" min="0" max="100" step="any" value="' + escHtml(d.slippagePct) + '">';
      html += '<label class="flabel" for="qa-gas">Gas reserve (amount + unit, e.g. 0.01 ETH or 0.05 SOL)</label><input id="qa-gas" type="text" value="' + escHtml(d.gasReserve) + '" placeholder="0.01 ETH">';
    } else if (step === 5) {
      html += '<p class="note">Step 6 of 6 — paper-test duration, then any optional settings. Going back keeps everything you set.</p>';
      html += '<label class="flabel" for="qa-hours">Paper-test duration (hours)</label><input id="qa-hours" type="number" min="1" step="1" value="' + escHtml(d.paperHours) + '">';
      html += '<div style="margin-top:10px"><b style="font-size:13.5px">Optional settings</b></div>';
      Object.keys(SETTING_LABELS).forEach(function (k) {
        html += '<label class="qa-check"><input type="checkbox" data-qa-setting="' + k + '"' + (d.settings[k] ? ' checked' : '') + '> ' + escHtml(SETTING_LABELS[k]) + '</label>';
      });
    }
    body.innerHTML = html;
    var nav = el('qa-nav');
    if (nav) {
      nav.innerHTML = '';
      if (step > 0) {
        var back = document.createElement('button');
        back.className = 'btn'; back.type = 'button'; back.textContent = '← Back';
        back.addEventListener('click', function () { if (qaCollect(true)) { d.qaStep--; renderQA(); } });
        nav.appendChild(back);
      }
      if (step < 5) {
        var next = document.createElement('button');
        next.className = 'btn primary'; next.type = 'button'; next.textContent = 'Next →';
        next.addEventListener('click', function () { if (qaCollect(false)) { d.qaStep++; renderQA(); } });
        nav.appendChild(next);
      } else {
        var agree = document.createElement('button');
        agree.className = 'btn primary'; agree.type = 'button'; agree.textContent = 'Agree and show the trading card';
        agree.addEventListener('click', function () { if (qaCollect(false)) renderCard(); });
        nav.appendChild(agree);
      }
    }
    var meta = el('qa-meta');
    if (meta) meta.addEventListener('click', function () {
      var addr = qaVal('qa-addr');
      if (!isEvmAddr(addr) && !isSolAddr(addr)) { qaNote('That does not look like a contract address — EVM 0x + 40 hex characters, or a Solana mint.'); return; }
      d.token.address = addr;
      meta.textContent = 'Checking…'; meta.disabled = true;
      dsTokenRead(addr).then(function (p) {
        if (p) {
          d.token.name = (p.baseToken && p.baseToken.name) || '';
          d.token.symbol = (p.baseToken && p.baseToken.symbol) || '';
          d.token.meta = 'READ — live DexScreener pair';
          d.token.metaNote = 'Chain ' + (p.chainId || '') + ', venue ' + (p.dexId || '') + ', liquidity ' + fmtUsd(p.liquidity ? p.liquidity.usd : null);
        } else {
          d.token.meta = 'NOT READ — no live pair for this contract on DexScreener';
          d.token.metaNote = 'The skill can still be built, but its token is unverified until a pair appears.';
        }
        renderQA(); renderDraft();
      }).catch(function () {
        d.token.meta = 'NOT READ — DexScreener did not answer';
        d.token.metaNote = 'The skill can still be built; the check can be re-run later.';
        renderQA(); renderDraft();
      });
    });
    var chainBoxes = body.querySelectorAll('[data-qa-chain]');
    chainBoxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        d.chains = [];
        body.querySelectorAll('[data-qa-chain]').forEach(function (x) { if (x.checked) d.chains.push(x.getAttribute('data-qa-chain')); });
        renderDraft();
      });
    });
    var typeRadios = body.querySelectorAll('[name="qa-type"]');
    typeRadios.forEach(function (r) {
      r.addEventListener('change', function () { d.strategyType = r.value; renderDraft(); });
    });
    var settingBoxes = body.querySelectorAll('[data-qa-setting]');
    settingBoxes.forEach(function (cb) {
      cb.addEventListener('change', function () { d.settings[cb.getAttribute('data-qa-setting')] = cb.checked; renderDraft(); });
    });
    qaNote('');
  }
  function qaNum(id) { var v = qaVal(id); if (v === '') return null; var n = Number(v); return isFinite(n) ? n : null; }
  function qaCollect(goingBack) {
    var d = DRAFT, step = d.qaStep;
    if (step === 1) {
      var sel = document.querySelector('#qa-body [name="qa-type"]:checked');
      if (sel) d.strategyType = sel.value;
      d.strategyCustom = qaVal('qa-custom');
      if (!goingBack && !d.strategyType) { qaNote('Pick a strategy type first.'); return false; }
      if (!goingBack && d.strategyType === 'custom' && !d.strategyCustom) { qaNote('Custom needs a plain-words description.'); return false; }
    }
    if (step === 2) {
      var addr = qaVal('qa-addr');
      if (addr) d.token.address = addr;
      if (!goingBack && !isEvmAddr(d.token.address) && !isSolAddr(d.token.address)) { qaNote('A contract address is required — EVM 0x + 40 hex, or a Solana mint.'); return false; }
    }
    if (step === 3) {
      var sz = qaVal('qa-size'), mp = qaVal('qa-maxper'), mc = qaVal('qa-maxcon');
      if (sz) d.size = sz; if (mp) d.maxPerTrade = mp; if (mc) d.maxConcurrent = mc;
      if (!goingBack && (qaNum('qa-size') == null || qaNum('qa-size') <= 0)) { qaNote('Paper size per trade must be a number above zero.'); return false; }
    }
    if (step === 4) {
      var st = qaVal('qa-stop'), tp = qaVal('qa-tp'), sl = qaVal('qa-slip'), gas = qaVal('qa-gas');
      if (st) d.stopPct = st; if (tp) d.takeProfitPct = tp; if (sl) d.slippagePct = sl; if (gas) d.gasReserve = gas;
      if (!goingBack) {
        if (qaNum('qa-stop') == null || qaNum('qa-stop') < 0 || qaNum('qa-stop') > 100) { qaNote('Stop-loss must be a percentage between 0 and 100.'); return false; }
        if (qaNum('qa-slip') == null || qaNum('qa-slip') < 0 || qaNum('qa-slip') > 100) { qaNote('Slippage tolerance must be a percentage between 0 and 100.'); return false; }
        if (!d.gasReserve) { qaNote('A gas reserve is required — name the amount and unit, e.g. 0.01 ETH.'); return false; }
      }
    }
    if (step === 5) {
      var hrs = qaNum('qa-hours');
      if (hrs != null) d.paperHours = hrs;
      if (!goingBack && (hrs == null || hrs < 1)) { qaNote('Paper-test duration must be at least 1 hour.'); return false; }
    }
    if (step === 0 && !goingBack && !d.chains.length) { qaNote('Pick at least one chain first.'); return false; }
    renderDraft();
    return true;
  }
  function gateTextFor(record) {
    if (typeof HalexMBlockchain !== 'undefined' && HalexMBlockchain.checkPaperGate) {
      return HalexMBlockchain.checkPaperGate(record).reason;
    }
    return 'NOT PROVEN: gate check unavailable in this view. Live is not offered.';
  }
  function renderCard() {
    var d = DRAFT, card = el('trading-card');
    if (!card) return;
    var on = [];
    Object.keys(SETTING_LABELS).forEach(function (k) { if (d.settings[k]) on.push(SETTING_LABELS[k]); });
    function row(l, v) { return '<div class="trow"><span>' + l + '</span><b>' + escHtml(v == null || v === '' ? '—' : v) + '</b></div>'; }
    card.hidden = false;
    card.innerHTML =
      '<h3>Trading card — ' + escHtml(d.strategyType || 'Unnamed skill') + '</h3>' +
      row('Chains', d.chains.join(', ')) +
      row('Strategy', d.strategyType + (d.strategyCustom ? ' — ' + d.strategyCustom : '')) +
      row('Token contract', d.token.address) +
      row('Token metadata', d.token.meta + (d.token.name ? ' · ' + d.token.name + ' ($' + d.token.symbol + ')' : '')) +
      row('Paper size per trade', d.size) +
      row('Max per trade', d.maxPerTrade) +
      row('Max concurrent', d.maxConcurrent) +
      row('Stop-loss', d.stopPct + '%') +
      row('Take-profit', d.takeProfitPct + '%') +
      row('Slippage tolerance', d.slippagePct + '%') +
      row('Gas reserve', d.gasReserve) +
      row('Settings on', on.length ? on.join(' · ') : 'None') +
      '<p class="note" style="margin-top:10px"><b>Paper-test plan:</b> run on paper for ' + d.paperHours + ' hours. The paper-test gate is: win rate ≥65% over ≥30 closed paper trades, profit factor ≥1.2 — all three, measured from recorded paper trades. Gate status for this card right now: ' + escHtml(gateTextFor({ closedTrades: 0, winRate: null, profitFactor: null })) + '</p>' +
      '<p class="note"><b>Smart-contract note:</b> in this static page a “smart-contract enabled skill” means this skill config plus its paper-arena record. No contract is deployed by this page, and no live trading runs from it. Deployment needs a signed executor that does not exist here.</p>' +
      '<div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap">' +
      '<button class="btn primary" id="card-execute" type="button">A. Execute card — start paper run</button>' +
      '<button class="btn" id="card-keep" type="button">B. Keep building</button></div>' +
      '<label class="qa-check live-off" style="margin-top:12px"><input type="checkbox" disabled> Switch to live currency — DISABLED. Live execution is not wired in this static page: HALEX-M holds no keys, signs nothing, and moves no funds. Live is not offered until the paper gate above is proven AND a real signed executor exists.</label>' +
      '<p class="note" id="card-run-note"></p>';
    var ex = el('card-execute');
    if (ex) ex.addEventListener('click', function () {
      var run = {
        id: 'paper-' + Date.now(), config: JSON.parse(JSON.stringify(DRAFT)),
        startedAt: new Date().toISOString(), status: 'PAPER',
        closedTrades: 0, winRate: null, profitFactor: null
      };
      try {
        var runs = JSON.parse(localStorage.getItem('halexm-paper-runs') || '[]');
        runs.push(run);
        localStorage.setItem('halexm-paper-runs', JSON.stringify(runs));
      } catch (e) { /* storage unavailable: the run record stays in-page only */ }
      var note = el('card-run-note');
      if (note) note.textContent = 'Paper run recorded locally (id ' + run.id + '). This is a local record only: no fills are simulated, so closed trades stay at 0 and the gate stays NOT PROVEN until real paper results are recorded from the desk. No real funds move, ever, from this card.';
      if (typeof toast === 'function') toast('Paper run recorded — local record only, no funds moved.');
    });
    var keep = el('card-keep');
    if (keep) keep.addEventListener('click', function () {
      d.qaStep = 0;
      renderQA();
      var b = el('qa-builder');
      if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Forge sync: Forge pieces land in the same draft ---------- */
  function syncForgeToDraft() {
    try {
      if (typeof forge === 'undefined') return;
      if (forge.theme) DRAFT.strategyType = forge.theme;
      if (forge.wallet) DRAFT.notes.push('Forge is watching wallet ' + forge.wallet);
      if (forge.entry) DRAFT.notes.push('Forge entry: ' + forge.entry);
      if (forge.exit) DRAFT.notes.push('Forge exit: ' + forge.exit);
      if (forge.risk) DRAFT.notes.push('Forge risk: ' + forge.risk);
      renderDraft();
    } catch (e) { /* Forge not present in this view; draft stands alone */ }
  }
  function wrapForge() {
    try {
      if (typeof forgeSend === 'function' && !forgeSend._halexmWrapped) {
        var orig = forgeSend;
        var wrapped = function () { orig(); setTimeout(syncForgeToDraft, 650); };
        wrapped._halexmWrapped = true;
        forgeSend = wrapped;
      }
    } catch (e) { /* Forge send not wrappable; draft still works from the other chats */ }
  }

  /* ---------- init ---------- */
  function init() {
    wireChat('halexmai-log', 'halexmai-input', 'halexmai-send', 'halexmai-draft');
    wireChat('trading-log', 'trading-input', 'trading-send', 'trading-draft');
    renderOptLists();
    initUnclutter();
    renderDraft();
    renderQA();
    wrapForge();
    var labBtn = el('halexmai-open-lab');
    if (labBtn) labBtn.addEventListener('click', function () {
      if (typeof showTab === 'function') showTab('skills');
    });
    var aiGreet = el('halexmai-log');
    if (aiGreet && !aiGreet.hasChildNodes()) {
      chatMsg('halexmai-log', 'halex', 'HALEX-M AI here — blockchain-centric, advisory only. I explain Token DNA, custody, liquidity, paper proving, and the rest of the HALEX-M knowledge base. Paste a contract address and I will scan it through the live DexScreener public read, or say “scan wallet <address>” / “scan tx <hash>”. I never trade, never sign, and never move funds. Anything I have not read, I mark NOT READ.');
    }
    var trGreet = el('trading-log');
    if (trGreet && !trGreet.hasChildNodes()) {
      chatMsg('trading-log', 'halex', 'Trading-desk chat. Ask about a skill, a token scan, or the paper-test gate — this chat shares the same SMT draft as the HALEX-M AI tab and the Skills Lab Forge.');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
