/* HALEX-M Skills Lab — modernized card package (STAGING ONLY).
 *
 * Additive only. It defines exactly one global, window.HalexMSkillsLab,
 * and redefines nothing that already exists on the page (no showTab,
 * no toast, no HalexSMT, no SKILLS). All CSS classes are prefixed
 * hm-sl-. All rendering escapes interpolated text.
 *
 * What this file does:
 *   - animated trade-skill cards for the five Lab shapes, each carrying
 *     measured evidence from paper-test-simulator.js (a fixed 40-bar
 *     synthetic labelled tape — a logic test, NOT market performance
 *     and NOT live results), plus one IDEA card with no win rate and
 *     no profit claim;
 *   - diagrams of the trade framework, wallet allocations, and fund
 *     address — allocations and fund address show ONLY values supplied
 *     through HalexMSkillsLab.configure() (the user's own configured
 *     values) and render as "—" when unconfigured. Nothing is invented;
 *   - paper / live toggles that show their TRUE state. Paper is the
 *     default. Live is armed only when a visitor wallet is actually
 *     connected (see halex-m-skills-lab-wallet.js); toggling live on
 *     executes nothing — every live trade still needs the visitor's
 *     explicit confirmation of the exact trade before anything is
 *     signed in the visitor's own wallet. HALEX-M itself holds no keys
 *     and never signs.
 *
 * Load order (see MERGE-MAP.md): paper-test-simulator.js first (it
 * recomputes the same evidence deterministically), then this file,
 * then halex-m-skills-lab-wallet.js. This file works without either:
 * it falls back to the embedded measured evidence below, and to
 * paper mode with no wallet connected.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dash(v) { return (v == null || v === '') ? '—' : v; }
  function pct(v) { return v == null ? '—' : (v + '%'); }
  function pf(v) { return v == null ? '—' : String(v); }

  /* Measured evidence, run 2026-11-01 with paper-test-simulator.js on
   * its fixed 40-bar synthetic tape. These numbers are the run output,
   * copied verbatim; when the simulator is loaded, render() recomputes
   * them and uses the recomputed values (identical by construction).
   * Gate: PROVEN needs >= 30 closed trades AND >= 65% win rate AND
   * profit factor >= 1.2. None of the five clears the 30-trade leg, so
   * every card below reads NOT PROVEN — including the three whose win
   * rate alone is above 65%. That distinction is the point. */
  var EMBEDDED_EVIDENCE = {
    momentum: { trades: 20, wins: 12, losses: 8, flats: 0, winRatePct: 60, profitFactor: 2.52, gate: 'NOT PROVEN' },
    mirror:   { trades: 13, wins: 9,  losses: 4, flats: 0, winRatePct: 69.2, profitFactor: 3.97, gate: 'NOT PROVEN' },
    fresh:    { trades: 6,  wins: 4,  losses: 2, flats: 0, winRatePct: 66.7, profitFactor: 4.05, gate: 'NOT PROVEN' },
    meanrev:  { trades: 12, wins: 8,  losses: 4, flats: 0, winRatePct: 66.7, profitFactor: 2.46, gate: 'NOT PROVEN' },
    dip:      { trades: 10, wins: 5,  losses: 5, flats: 0, winRatePct: 50, profitFactor: 1.4, gate: 'NOT PROVEN' }
  };

  var SKILLS = [
    { key: 'momentum', name: 'Second-wave momentum', status: 'TESTED',
      entry: 'Enter only after the first move proves demand: buys accelerating, with sells present too — never on a single green candle.',
      exit: 'Sell in rungs on the way up and trail the runner; a hard time cap closes the trade if it has not worked inside its window.',
      guards: 'Two-sided flow required. No averaging down. Daily loss cap stops new paper entries.',
      watches: 'Confirmed strength: rising buys with sells present too, not a lone candle.',
      breaks: 'Chasing a top. A vertical run that is already exhausted looks exactly like strength until it reverses.',
      suggestion: 'Paper-test next: extend the tape past 30 closed trades so the gate count can actually be judged, then re-check the win rate — it sits below the bar on this run.',
      explain: 'Second-wave momentum gives up the first doubling to skip most of the failures. It waits for proof, then rides what the first crowd started.' },
    { key: 'mirror', name: 'Wallet mirror', status: 'TESTED',
      entry: 'Mirror a watched wallet\u2019s fresh buys, sized behind that wallet\u2019s own record — only after that record survives an audit.',
      exit: 'Exit with the watched wallet\u2019s own exits where readable; otherwise the written stop and time cap decide — never hope.',
      guards: 'Audit first. If the wallet fades, the skill fades too. No unaudited wallet is ever mirrored.',
      watches: 'One wallet\u2019s fresh buys, scored on its own entries, exits, and behaviour in losers.',
      breaks: 'The wallet could be washing its own volume, feeding late buyers its exits, or simply fading.',
      suggestion: 'Paper-test next: grow the audited-wallet sample — only 13 of 40 bars qualified here — before trusting the above-bar win figure.',
      explain: 'Wallet mirror is only as good as the wallet. The audit is the skill; the copying is just the mechanism.' },
    { key: 'fresh', name: 'Fresh-launch screen', status: 'TESTED',
      entry: 'Screen brand-new pools for accelerating buys, two-sided tape, and a verifiable link. Most candidates fail, and that is the point.',
      exit: 'Hard time stop on every entry: a launch that has not moved inside its window is closed and the capital moves on.',
      guards: 'Fresh pools only, filtered hard: acceleration, two-sided flow, links, custody. Small size by design.',
      watches: 'New pools only — acceleration, two-sided flow, a verifiable link, custody.',
      breaks: 'Most launches fail fast. This shape has a low hit rate by design and needs a hard time stop and small size.',
      suggestion: 'Paper-test next: run a longer fresh-pool tape — only 6 of 40 bars qualified — and confirm the time stop, not just the entries.',
      explain: 'Fresh-launch screening is a filter that says no almost every time. Its value is in the launches it refuses, not the ones it takes.' },
    { key: 'meanrev', name: 'Mean-reversion', status: 'TESTED',
      entry: 'Buy after an overextended move fades back toward its recent average — never while the token is still mid-collapse.',
      exit: 'Exit at the average or on the floor rule: break the floor and the thesis is dead, no debate.',
      guards: 'A floor rule that kills the thesis if broken. No averaging down past it.',
      watches: 'An extended move losing steam, with the average as the magnet.',
      breaks: 'A falling token keeps falling. Without a floor rule, reversion buying becomes catching a grave.',
      suggestion: 'Paper-test next: separate fading moves from collapsing ones in the tape and re-measure — the floor rule is what the next run must prove.',
      explain: 'Mean-reversion buys calm after excess. It only works when the move is fading, not when it is falling apart.' },
    { key: 'dip', name: 'Dip buy', status: 'TESTED',
      entry: 'Buy the pullback after a strong first move, with real volume and two-sided flow — and only while the pullback holds above the first move\u2019s midpoint.',
      exit: 'Break the first move\u2019s midpoint and exit at once. No debate, no averaging down.',
      guards: 'Midpoint floor is the whole skill. Strong first move required before any pullback counts.',
      watches: 'A strong first move with real volume and two-sided flow, then a pullback that holds above its midpoint.',
      breaks: 'A dead bounce looks like a dip. The midpoint floor is what separates the two.',
      suggestion: 'Paper-test next: the win figure sits at the coin-flip line on this run — test whether the midpoint floor, enforced strictly, lifts it before adding size.',
      explain: 'Dip buying pays for patience with a better price. The floor rule does the deciding so the trader does not have to argue with a chart.' }
  ];

  /* IDEA cards carry NO win rate, NO profit claim, NO trade counts.
   * Keep every field of this object free of percentages and figures. */
  var IDEA = {
    key: 'stall-idea', name: 'Stall-exit scalper', status: 'IDEA',
    entry: 'A starting shape only: enter on a small, defined trigger, and close the trade if it makes no progress inside its window.',
    exit: 'Stall exit: no progress inside the window means the trade closes and the capital moves on.',
    guards: 'To be written with the skill: stop, time cap, and size cap, before any paper test.',
    watches: 'Progress inside the window — or the absence of it.',
    breaks: 'Choppy trades that would have worked get closed for being boring; that trade-off is unmeasured until paper-tested.',
    suggestion: 'Paper-test next: write the trigger in testable words first, then run it on paper. Until then this stays an idea.',
    explain: 'This is a template, not a skill. It earns numbers only in the paper arena, under the gate.'
  };

  var config = { fundAddress: null, allocations: [] };
  var filter = 'all';
  var liveArmed = {};
  var paperOn = {};

  function evidenceFor(key) {
    try {
      if (window.HalexMSkillsLabSim && window.HalexMSkillsLabSim.runSkill) {
        var r = window.HalexMSkillsLabSim.runSkill(key);
        if (r) return { trades: r.trades, wins: r.wins, losses: r.losses, flats: r.flats, winRatePct: r.winRatePct, profitFactor: r.profitFactor, gate: r.gate };
      }
    } catch (e) { /* fall through to embedded evidence */ }
    return EMBEDDED_EVIDENCE[key];
  }

  function walletState() {
    try {
      if (window.HalexMSkillsLabWallet && window.HalexMSkillsLabWallet.getState) {
        return window.HalexMSkillsLabWallet.getState();
      }
    } catch (e) { /* no wallet module: paper default */ }
    return { mode: 'paper', connected: false, connector: null, address: null, chainId: null,
      walletConnectAvailable: false, walletConnectReason: 'Wallet module not loaded.' };
  }

  function liveToggleHTML(skillKey) {
    var w = walletState();
    var armed = !!liveArmed[skillKey];
    if (!w.connected) {
      return '<label class="hm-sl-toggle hm-sl-toggle-live">' +
        '<input type="checkbox" disabled data-hm-sl-live="' + esc(skillKey) + '" aria-label="Live mode for ' + esc(skillKey) + ' (disabled: no wallet connected)"> ' +
        '<span><b>Live mode — DISABLED</b><span class="hm-sl-toggle-note">No visitor wallet connected, so paper mode is the default. Connect your own wallet in the wallet panel below; HALEX-M never holds keys and never signs. Toggling live alone would never execute a trade — every live trade still needs your explicit confirmation of the exact trade.</span></span></label>';
    }
    return '<label class="hm-sl-toggle hm-sl-toggle-live">' +
      '<input type="checkbox" data-hm-sl-live="' + esc(skillKey) + '"' + (armed ? ' checked' : '') + ' aria-label="Live mode for ' + esc(skillKey) + '"> ' +
      '<span><b>Live mode — ' + (armed ? 'LIVE-READY (connected, awaiting your per-trade confirmation)' : 'connected, awaiting your choice') + '</b>' +
      '<span class="hm-sl-toggle-note">Wallet connected (' + esc(w.connector || '—') + '). Live-ready means ready to review a trade — nothing is signed or moved until you confirm the exact amount, token, slippage, and fees for that trade in the wallet panel.</span></span></label>';
  }

  function paperToggleHTML(skillKey) {
    var on = paperOn[skillKey] !== false;
    return '<label class="hm-sl-toggle hm-sl-toggle-paper">' +
      '<input type="checkbox" data-hm-sl-paper="' + esc(skillKey) + '"' + (on ? ' checked' : '') + ' aria-label="Paper mode for ' + esc(skillKey) + '"> ' +
      '<span><b>Paper mode (default)</b><span class="hm-sl-toggle-note">Paper arena: a local record only. No funds move in paper mode, ever.</span></span></label>';
  }

  function cardHTML(skill, index) {
    var ev = evidenceFor(skill.key);
    var statusCls = skill.status === 'TESTED' ? 'hm-sl-chip-tested' : 'hm-sl-chip-idea';
    var delay = (index * 90) + 'ms';
    return '<article class="hm-sl-card" data-hm-sl-card="' + esc(skill.key) + '" style="--hm-sl-delay:' + esc(delay) + '">' +
      '<div class="hm-sl-card-head"><h3 class="hm-sl-card-name">' + esc(skill.name) + '</h3>' +
      '<span class="hm-sl-chip ' + statusCls + '">' + esc(skill.status) + '</span></div>' +
      '<p class="hm-sl-evidence-note">Evidence: deterministic paper-test simulator, fixed 40-bar synthetic labelled tape, run 2026-11-01. A logic test — not market performance, not live results.</p>' +
      '<dl class="hm-sl-evidence">' +
      '<div><dt>Closed paper trades</dt><dd>' + esc(ev.trades) + '</dd></div>' +
      '<div><dt>Wins</dt><dd>' + esc(ev.wins) + '</dd></div>' +
      '<div><dt>Losses</dt><dd>' + esc(ev.losses) + '</dd></div>' +
      '<div><dt>Win rate</dt><dd>' + pct(ev.winRatePct) + '</dd></div>' +
      '<div><dt>Profit factor</dt><dd>' + pf(ev.profitFactor) + '</dd></div>' +
      '<div><dt>Paper-test gate</dt><dd>' + esc(ev.gate) + ' (needs 30+ trades, 65%+, factor 1.2+)</dd></div>' +
      '</dl>' +
      '<section class="hm-sl-section"><h4>Framework — entry and exit in plain words</h4>' +
      '<p><b>Entry:</b> ' + esc(skill.entry) + '</p>' +
      '<p><b>Exit:</b> ' + esc(skill.exit) + '</p>' +
      '<p><b>Guards:</b> ' + esc(skill.guards) + '</p></section>' +
      '<section class="hm-sl-section"><h4>Deeper knowledge</h4>' +
      '<p><b>What it watches:</b> ' + esc(skill.watches) + '</p>' +
      '<p><b>What breaks it:</b> ' + esc(skill.breaks) + '</p></section>' +
      '<section class="hm-sl-section"><h4>Suggestion — what to paper-test next</h4>' +
      '<p>' + esc(skill.suggestion) + '</p></section>' +
      '<div class="hm-sl-toggles">' + paperToggleHTML(skill.key) + liveToggleHTML(skill.key) + '</div>' +
      '<button class="hm-sl-btn" type="button" data-hm-sl-explain="' + esc(skill.key) + '">Explain this skill in plain words</button>' +
      '</article>';
  }

  function ideaCardHTML() {
    /* Deliberately figure-free: no win rate, no profit claim, no
     * trade counts, no percentages anywhere in this card. */
    return '<article class="hm-sl-card hm-sl-card-idea" data-hm-sl-card="idea" style="--hm-sl-delay:480ms">' +
      '<div class="hm-sl-card-head"><h3 class="hm-sl-card-name">' + esc(IDEA.name) + '</h3>' +
      '<span class="hm-sl-chip hm-sl-chip-idea">IDEA — template only, not a proven skill</span></div>' +
      '<p class="hm-sl-evidence-note">No win rate attached. No profit claim. A shape earns a record only in the paper arena, under the gate.</p>' +
      '<section class="hm-sl-section"><h4>Framework — entry and exit in plain words</h4>' +
      '<p><b>Entry:</b> ' + esc(IDEA.entry) + '</p>' +
      '<p><b>Exit:</b> ' + esc(IDEA.exit) + '</p>' +
      '<p><b>Guards:</b> ' + esc(IDEA.guards) + '</p></section>' +
      '<section class="hm-sl-section"><h4>Deeper knowledge</h4>' +
      '<p><b>What it watches:</b> ' + esc(IDEA.watches) + '</p>' +
      '<p><b>What breaks it:</b> ' + esc(IDEA.breaks) + '</p></section>' +
      '<section class="hm-sl-section"><h4>Suggestion — what to paper-test next</h4>' +
      '<p>' + esc(IDEA.suggestion) + '</p></section>' +
      '<div class="hm-sl-toggles">' + paperToggleHTML('idea') + liveToggleHTML('idea') + '</div>' +
      '<button class="hm-sl-btn" type="button" data-hm-sl-explain="idea">Explain this idea in plain words</button>' +
      '</article>';
  }

  function frameworkDiagramHTML() {
    var steps = [
      ['Trigger', 'A testable condition fires — acceleration, a watched buy, a pullback holding.'],
      ['Guards', 'Custody, two-sided flow, copycat screen, size cap. A failed guard is a skip, not a debate.'],
      ['Entry', 'Paper size only, written before the trade.'],
      ['Exit', 'Stop, take-profit rungs, time cap, thin-exit — written before entry, while calm.'],
      ['Autopsy', 'Every close gets a written lesson, win or loss.'],
      ['Gate', 'Proven only at 30+ closed paper trades, 65%+, profit factor 1.2+. Until then: paper.']
    ];
    var html = '<section class="hm-sl-diagram" aria-label="Trade framework diagram"><h3 class="hm-sl-diagram-title">Trade framework — how every skill runs</h3><ol class="hm-sl-flow">';
    steps.forEach(function (s) {
      html += '<li><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></li>';
    });
    return html + '</ol></section>';
  }

  function walletDiagramHTML() {
    var w = walletState();
    var fund = dash(config.fundAddress);
    var allocHTML;
    if (!config.allocations.length) {
      allocHTML = '<p class="hm-sl-alloc-row"><span>Allocations</span><b>—</b></p>' +
        '<p class="hm-sl-note">No allocation configured. Set your own values with HalexMSkillsLab.configure() — nothing is shown until you supply it.</p>';
    } else {
      allocHTML = config.allocations.map(function (a) {
        var pctVal = (typeof a.pct === 'number' && isFinite(a.pct)) ? Math.max(0, Math.min(100, a.pct)) : null;
        return '<div class="hm-sl-alloc-row"><span>' + esc(a.label) + '</span><b>' + (pctVal === null ? '—' : pctVal + '%') + '</b>' +
          '<div class="hm-sl-bar" role="img" aria-label="' + esc(a.label) + ' ' + (pctVal === null ? '—' : pctVal + '%') + '">' +
          '<span style="width:' + (pctVal === null ? 0 : pctVal) + '%"></span></div></div>';
      }).join('');
    }
    var modeText = w.connected
      ? ('Connected (' + (w.connector || '—') + ') — live-ready only for trades you confirm one by one')
      : 'Paper mode (default) — no wallet connected';
    return '<section class="hm-sl-diagram" aria-label="Wallet allocations and fund address diagram"><h3 class="hm-sl-diagram-title">Wallet allocations and fund address</h3>' +
      '<p class="hm-sl-alloc-row"><span>Mode</span><b>' + esc(modeText) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Connected visitor address</span><b>' + esc(dash(w.address)) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Fund address (your configured value)</span><b>' + esc(fund) + '</b></p>' +
      allocHTML +
      '<p class="hm-sl-note">The fund address and allocations above are shown only as configured by you. When unconfigured they read "—". HALEX-M never supplies, guesses, or displays an owner wallet address.</p></section>';
  }

  function statusStripHTML() {
    var w = walletState();
    var wcNote = '';
    if (typeof window !== 'undefined' && window.HalexMSkillsLabWallet && !w.walletConnectAvailable) {
      wcNote = '<p class="hm-sl-note">' + esc(w.walletConnectReason || 'WalletConnect is unavailable right now.') + ' The injected-wallet path and paper mode keep working.</p>';
    }
    return '<div class="hm-sl-status" role="status"><p><b>Lab mode:</b> ' +
      (w.connected ? 'Connected — live-ready only for trades you confirm one by one.' : 'Paper (default) — no wallet connected, no funds move.') +
      '</p>' + wcNote + '</div>';
  }

  function buildHTML() {
    var cards = [];
    SKILLS.forEach(function (s, i) {
      if (filter === 'all' || filter === 'tested') cards.push(cardHTML(s, i));
    });
    if (filter === 'all' || filter === 'idea') cards.push(ideaCardHTML());
    return statusStripHTML() + frameworkDiagramHTML() + walletDiagramHTML() +
      '<div class="hm-sl-filters" role="group" aria-label="Filter skill cards">' +
      '<button class="hm-sl-btn' + (filter === 'all' ? ' hm-sl-btn-on' : '') + '" type="button" data-hm-sl-filter="all">Show all cards</button>' +
      '<button class="hm-sl-btn' + (filter === 'tested' ? ' hm-sl-btn-on' : '') + '" type="button" data-hm-sl-filter="tested">Tested skills only</button>' +
      '<button class="hm-sl-btn' + (filter === 'idea' ? ' hm-sl-btn-on' : '') + '" type="button" data-hm-sl-filter="idea">Ideas only</button>' +
      '</div>' +
      '<div class="hm-sl-explain" id="hm-sl-explain" aria-live="polite"><p class="hm-sl-note">Tap "Explain this skill in plain words" on any card and the explanation appears here.</p></div>' +
      '<div class="hm-sl-grid">' + cards.join('') + '</div>';
  }

  function explainText(key) {
    if (key === 'idea') return IDEA.explain;
    for (var i = 0; i < SKILLS.length; i++) {
      if (SKILLS[i].key === key) return SKILLS[i].explain;
    }
    return '—';
  }

  function wire(root) {
    if (!root || !root.querySelectorAll) return;
    var filterBtns = root.querySelectorAll('[data-hm-sl-filter]');
    for (var i = 0; i < filterBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          filter = btn.getAttribute('data-hm-sl-filter');
          render();
        });
      })(filterBtns[i]);
    }
    var explainBtns = root.querySelectorAll('[data-hm-sl-explain]');
    for (var j = 0; j < explainBtns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var box = document.getElementById('hm-sl-explain');
          if (box) box.innerHTML = '<p>' + esc(explainText(btn.getAttribute('data-hm-sl-explain'))) + '</p>';
        });
      })(explainBtns[j]);
    }
    var paperBoxes = root.querySelectorAll('[data-hm-sl-paper]');
    for (var k = 0; k < paperBoxes.length; k++) {
      (function (box) {
        box.addEventListener('change', function () {
          paperOn[box.getAttribute('data-hm-sl-paper')] = box.checked;
        });
      })(paperBoxes[k]);
    }
    var liveBoxes = root.querySelectorAll('[data-hm-sl-live]');
    for (var m = 0; m < liveBoxes.length; m++) {
      (function (box) {
        /* A disabled live toggle has no handler effect: it cannot be
         * turned on. An enabled one arms nothing — it only records
         * that the visitor chose live-ready display. Execution still
         * requires a per-trade confirmation in the wallet panel. */
        box.addEventListener('change', function () {
          if (box.disabled) { box.checked = false; return; }
          liveArmed[box.getAttribute('data-hm-sl-live')] = box.checked;
          render();
        });
      })(liveBoxes[m]);
    }
  }

  function render() {
    if (typeof document === 'undefined') return null;
    var root = document.getElementById('hm-sl-root');
    if (!root) return null;
    root.innerHTML = buildHTML();
    wire(root);
    return root;
  }

  function configure(opts) {
    if (!opts || typeof opts !== 'object') return config;
    if (typeof opts.fundAddress === 'string') {
      config.fundAddress = opts.fundAddress.trim() ? opts.fundAddress.trim() : null;
    } else if (opts.fundAddress === null) {
      config.fundAddress = null;
    }
    if (Array.isArray(opts.allocations)) {
      config.allocations = opts.allocations.filter(function (a) {
        return a && typeof a.label === 'string' && a.label.trim();
      }).map(function (a) {
        return { label: a.label.trim(), pct: (typeof a.pct === 'number' && isFinite(a.pct)) ? a.pct : null };
      });
    }
    render();
    return { fundAddress: config.fundAddress, allocations: config.allocations };
  }

  var api = {
    version: '2026-11-01-skills-lab',
    buildHTML: buildHTML, render: render, refreshToggles: render,
    configure: configure, getConfig: function () { return { fundAddress: config.fundAddress, allocations: config.allocations }; },
    explainText: explainText, embeddedEvidence: EMBEDDED_EVIDENCE
  };
  window.HalexMSkillsLab = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
