/* HALEX-M Skills Lab expansion — STAGING ONLY.
 *
 * Builds on the HALEX-M upgrade (halex-m-upgrade.js): the shared SMT
 * draft, the Q&A builder, and the trading card are left alone. This
 * file only ADDS cards inside the Skills Lab tab: Allen's method,
 * strategy ideas, a guided picker, suggestions, an expanded settings
 * center, a trade tools picker, assimilated Lab roll entries, info
 * panels (in HTML), and markup + deployment options.
 *
 * Hard limits, kept from the page: HALEX-M holds no keys, signs
 * nothing, moves no funds. Wallet connect is read-only. Paper runs
 * recorded here are local records only — no fills are simulated, no
 * contract is deployed, and live execution is NOT wired in this
 * static page. Any figure not actually read is NOT READ, never
 * invented. Ideas are labeled IDEA, never proven skills, and carry
 * no win rate or profit claim. No outside brand is shown in the
 * assimilated section — Lab names only.
 */
(function () {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function draft() {
    if (window.HalexSMT && window.HalexSMT.draft) return window.HalexSMT.draft;
    return null;
  }
  function note(msg) {
    try { if (window.HalexSMT) window.HalexSMT.addNote(msg); } catch (e) { /* draft notes are best-effort */ }
  }
  function scrollTo(id) {
    var b = el(id);
    if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function toast(msg) { try { if (typeof window.toast === 'function') window.toast(msg); } catch (e) {} }

  /* ---------- strategy shapes (IDEAS, templates only) ---------- */
  var SHAPES = {
    momentum: {
      name: 'Second-wave momentum',
      plain: 'Enter after the first move proves demand, then ride the strength the first crowd created.',
      watches: 'Confirmed strength: rising buys with sells present too, not a single green candle.',
      breaks: 'Chasing a top. A vertical run that is already exhausted looks exactly like strength until it reverses.',
      type: 'momentum',
      custom: 'Second-wave entry: enter only on confirmed strength after the first move, with a written exit before entry.'
    },
    mirror: {
      name: 'Wallet mirror',
      plain: 'Mirror a watched wallet\'s fresh buys, sized behind that wallet\'s own record.',
      watches: 'One wallet\'s fresh buys, scored on its own entries, exits, and behavior in losers.',
      breaks: 'The wallet could be washing its own volume, feeding late buyers its exits, or simply fading. Mirror without an audit is a guess.',
      type: 'mirror',
      custom: 'Mirror a watched wallet\'s fresh buys only after that wallet\'s own record survives an audit; fade the skill if the wallet fades.'
    },
    fresh: {
      name: 'Fresh-launch screen',
      plain: 'Screen brand-new pools for accelerating buys, two-sided tape, and a verifiable link.',
      watches: 'New pools only, filtered hard: acceleration, two-sided flow, links, custody — most candidates fail and that is the point.',
      breaks: 'Most launches fail fast. This shape has a low hit rate by design and needs a hard time stop and small size.',
      type: 'snipe',
      custom: 'Screen fresh pools for accelerating buys, two-sided tape, and a verifiable link; hard time stop on every entry.'
    },
    meanrev: {
      name: 'Mean-reversion',
      plain: 'Buy after an overextended move fades back toward its recent average.',
      watches: 'An extended move losing steam, with the average as the magnet — not a falling token mid-collapse.',
      breaks: 'A falling token keeps falling. Without a floor rule, reversion buying becomes catching a grave.',
      type: 'custom',
      custom: 'Mean-reversion: enter as an overextended move fades toward its recent average, with a floor rule that kills the thesis if broken.'
    },
    dip: {
      name: 'Dip buy',
      plain: 'Buy the pullback after a strong first move, with a floor: break the first move\'s midpoint and the thesis is dead.',
      watches: 'A strong first move with real volume and two-sided flow, then a pullback that holds above its midpoint.',
      breaks: 'A dead bounce looks like a dip. The midpoint floor is the whole skill — no averaging down past it.',
      type: 'dip',
      custom: 'Dip buy after a strong first move with real volume and two-sided flow; break the first move\'s midpoint and exit, no debate.'
    }
  };
  var SHAPE_ORDER = ['momentum', 'mirror', 'fresh', 'meanrev', 'dip'];

  function prefillShape(key) {
    var d = draft(), s = SHAPES[key];
    if (!d || !s) return;
    d.strategyType = s.type;
    d.strategyCustom = s.custom;
    note('Lab idea picked: ' + s.name + ' — pre-filled into the Q&A draft as a template, not a proven skill.');
    scrollTo('qa-builder');
    toast('Idea pre-filled into the Q&A draft.');
  }

  function renderIdeas() {
    var box = el('lab-ideas');
    if (!box) return;
    var html = '';
    SHAPE_ORDER.forEach(function (key) {
      var s = SHAPES[key];
      html += '<div class="lab-idea"><div class="lab-idea-head"><b>' + esc(s.name) + '</b> <span class="lab-chip">IDEA — template only, not a proven skill</span></div>' +
        '<p>' + esc(s.plain) + '</p>' +
        '<p><b>It watches:</b> ' + esc(s.watches) + '</p>' +
        '<p><b>What breaks it:</b> ' + esc(s.breaks) + '</p>' +
        '<p class="note" style="margin:6px 0 0">No win rate attached. No profit claim. A shape earns a record only in the paper arena, under the gate.</p>' +
        '<button class="btn" data-idea="' + key + '" type="button">Use this idea — pre-fill the Q&amp;A</button></div>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-idea]').forEach(function (b) {
      b.addEventListener('click', function () { prefillShape(b.getAttribute('data-idea')); });
    });
  }

  /* ---------- Allen's method walkthrough ---------- */
  var METHOD = [
    { t: '1. Idea + thesis in one sentence', x: 'If you cannot say the idea in one sentence, it is not ready to build. The sentence names the trigger, the reason, and the exit — not just "buy good tokens".', act: 'thesis' },
    { t: '2. Token knowledge first', x: 'Contract address, metadata, custody, deployer history, copycat census — before any entry rule. Never ticker alone: many tokens share one ticker, and the wrong one is the trap.', act: 'token' },
    { t: '3. Entry rules as testable conditions', x: 'An entry rule must be checkable: "buys accelerating AND sells present AND a verifiable link" can be tested; "looks strong" cannot. If it cannot be tested, it cannot be proven.', act: 'entry' },
    { t: '4. Exit rules BEFORE entry', x: 'Stop, take-profit, time cap, and thin-exit are written before the first trade, while you are calm. A trade without a written exit is a hope, and hope is not a skill.', act: 'exit' },
    { t: '5. Size, caps, and gas reserve', x: 'Size per trade, max per trade, max concurrent, and a named gas reserve. Caps are what keep one bad trade from ending the skill.', act: 'size' },
    { t: '6. Paper arena under the gate', x: 'Run on paper until the gate is proven: win rate 65% or better over 30 or more closed paper trades, profit factor 1.2 or better. All three, measured — not felt.', act: 'paper' },
    { t: '7. Autopsy every close', x: 'Every close, win or loss, gets a written lesson: what worked, what broke, what changes. Skills that skip the autopsy repeat their losses on schedule.', act: 'autopsy' },
    { t: '8. Only then is live even offered', x: 'Live is offered only after the gate is proven AND a real signed executor exists. Until both are true, the skill stays on paper — that is discipline, not delay.', act: 'live' }
  ];
  function applyStep(i) {
    var d = draft(), m = METHOD[i], msg = '';
    if (!d) return;
    if (!d.labSettings) d.labSettings = {};
    if (m.act === 'thesis') {
      if (!d.strategyCustom) d.strategyCustom = 'Thesis: [token or wallet] [entry trigger] because [reason]. I exit by [exit rule], and the trade is dead if [floor].';
      msg = 'Step 1 applied — a one-sentence thesis template is in the draft. Replace the brackets with your own words in the Q&A builder.';
    } else if (m.act === 'token') {
      msg = 'Step 2 applied — token knowledge first. The Q&A builder requires a contract address and checks metadata by live read or marks it NOT READ.';
    } else if (m.act === 'entry') {
      d.labSettings.entryAccel = true; d.labSettings.entryTwoSided = true;
      msg = 'Step 3 applied — entry toggles on: accelerating buys AND two-sided flow. Review them in the expanded settings center below.';
      renderSettings();
    } else if (m.act === 'exit') {
      d.labSettings.exitTimeCap = true; d.labSettings.exitThin = true; d.labSettings.exitTrailing = true;
      msg = 'Step 4 applied — exit toggles on: time cap, thin-exit, and trailing exit. Your stop and take-profit percentages are still yours to set in the Q&A builder.';
      renderSettings();
    } else if (m.act === 'size') {
      msg = 'Step 5 applied — size, caps, and gas reserve live in the Q&A builder (steps 4 and 5 there). Set numbers, not vibes.';
    } else if (m.act === 'paper') {
      msg = 'Step 6 applied — paper arena under the gate: 65% or better, 30 or more closed paper trades, profit factor 1.2 or better, all measured.';
    } else if (m.act === 'autopsy') {
      msg = 'Step 7 applied — autopsy every close. Wins and losses both get a written lesson, or the lesson is lost.';
    } else {
      msg = 'Step 8 applied — live is offered only after the gate is proven AND a signed executor exists. Neither is claimed here.';
    }
    note('Allen method — ' + m.t + '.');
    var n = el('lab-method-note');
    if (n) n.textContent = msg;
    scrollTo('qa-builder');
  }
  function renderMethod() {
    var box = el('lab-method-steps');
    if (!box) return;
    var html = '';
    METHOD.forEach(function (m, i) {
      html += '<div class="lab-step"><b>' + esc(m.t) + '</b><p>' + esc(m.x) + '</p>' +
        '<button class="btn" data-step="' + i + '" type="button">Use this step</button></div>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () { applyStep(Number(b.getAttribute('data-step'))); });
    });
  }

  /* ---------- guided picker: open context chat ---------- */
  var PICK = { goal: '', chain: '', risk: '', time: '', q: 0 };
  var PICK_QS = [
    'What is the goal — what should this skill actually do? (For example: mirror a wallet, catch fresh launches, ride momentum, buy dips.)',
    'Which chain or chains? (Solana, Base, Ethereum, Arbitrum, Polygon — one or several.)',
    'How much risk can this skill take? (Conservative, moderate, or aggressive — in your own words is fine.)',
    'How much time does it get, and what caps should bind it? (Hours per day, a paper-test duration, a max loss per day — whatever matters to you.)'
  ];
  function pickerMsg(who, text) {
    var box = el('lab-picker-log');
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
  function scanPicker(text) {
    var low = ' ' + text.toLowerCase() + ' ';
    if (!PICK.goal) {
      if (/mirror|copy|follow|track|watch/.test(low) && /wallet|address/.test(low)) PICK.goal = 'mirror';
      else if (/fresh|new launch|snipe|just launched|new pool/.test(low)) PICK.goal = 'fresh';
      else if (/momentum|trend|breakout|strength|second wave/.test(low)) PICK.goal = 'momentum';
      else if (/dip|pullback|bounce/.test(low)) PICK.goal = 'dip';
      else if (/revert|average|range|fade/.test(low)) PICK.goal = 'meanrev';
      else if (text.trim()) PICK.goal = 'custom:' + text.trim().slice(0, 120);
    }
    if (!PICK.chain) {
      var chains = [];
      ['solana', 'base', 'ethereum', 'arbitrum', 'polygon'].forEach(function (c) {
        if (low.indexOf(c) !== -1) chains.push(c);
      });
      if (chains.length) PICK.chain = chains.join(', ');
    }
    if (!PICK.risk) {
      if (/conservative|careful|safe|small|low risk|hate.*drawdown|patient/.test(low)) PICK.risk = 'conservative';
      else if (/aggressive|big|fast|high risk|degenerate/.test(low)) PICK.risk = 'aggressive';
      else if (/moderate|balanced|medium/.test(low)) PICK.risk = 'moderate';
    }
    if (!PICK.time) {
      var m = text.match(/(\d+)\s*(hour|hours|day|days)/i);
      if (m) PICK.time = m[0];
      else if (/few hours|couple of hours/.test(low)) PICK.time = 'a few hours a day';
      else if (/all day|full time|always on/.test(low)) PICK.time = 'all day';
      else if (/weekend|evening|part time/.test(low)) PICK.time = 'part time';
    }
    var d = draft();
    if (d) {
      d.labPicker = { goal: PICK.goal, chain: PICK.chain, risk: PICK.risk, time: PICK.time };
    }
  }
  function picksFor() {
    var primary = (PICK.goal && SHAPES[PICK.goal]) ? PICK.goal : 'momentum';
    var complements = { momentum: ['dip', 'fresh'], mirror: ['momentum', 'fresh'], fresh: ['momentum', 'dip'], dip: ['momentum', 'meanrev'], meanrev: ['dip', 'momentum'] };
    var list = [primary].concat(complements[primary] || ['dip', 'fresh']);
    return list.slice(0, 3);
  }
  function shapeTradeoff(key) {
    var t = {
      momentum: 'Trade-off: you give up the first doubling to skip most of the failures. Patient, but you will watch runners leave without you.',
      mirror: 'Trade-off: the skill is only as good as the wallet, and the wallet must be audited first. If it fades, the skill must fade too.',
      fresh: 'Trade-off: earliest entries, lowest hit rate. Needs a hard time stop and small size, or the failures eat the winners.',
      dip: 'Trade-off: better prices than chasing, but a dead bounce looks identical to a dip until the floor breaks.',
      meanrev: 'Trade-off: calm entries in choppy markets, but a trending market punishes reversion buying again and again.'
    };
    return t[key] || '';
  }
  function renderPicks() {
    var box = el('lab-picker-picks');
    if (!box) return;
    var keys = picksFor();
    var html = '<b style="font-size:13.5px">Suggested shapes — with trade-offs. You pick; the chat does not decide for you.</b>';
    keys.forEach(function (key, i) {
      var s = SHAPES[key];
      html += '<div class="lab-sugg"><b>' + (i === 0 ? 'First suggestion: ' : 'Also consider: ') + esc(s.name) + '</b>' +
        '<p>' + esc(s.plain) + '</p><p>' + esc(shapeTradeoff(key)) + '</p>' +
        '<p><b>What breaks it:</b> ' + esc(s.breaks) + '</p>' +
        '<button class="btn" data-pick="' + key + '" type="button">Pick this shape — pre-fill the Q&amp;A</button></div>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-pick]').forEach(function (b) {
      b.addEventListener('click', function () { prefillShape(b.getAttribute('data-pick')); renderSuggestions(); });
    });
  }
  function pickerAdvance() {
    if (!PICK.goal) { PICK.q = 0; return PICK_QS[0]; }
    if (!PICK.chain) { PICK.q = 1; return PICK_QS[1]; }
    if (!PICK.risk) { PICK.q = 2; return PICK_QS[2]; }
    if (!PICK.time) { PICK.q = 3; return PICK_QS[3]; }
    return '';
  }
  function pickerSend() {
    var inp = el('lab-picker-input');
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) { toast('Type your answer first — in your own words.'); return; }
    inp.value = '';
    pickerMsg('user', text);
    scanPicker(text);
    var next = pickerAdvance();
    if (next) {
      pickerMsg('halex', 'Understood. ' + next);
    } else {
      pickerMsg('halex', 'That covers goal, chain, risk, and time. Below are two to three shapes that fit what you said, each with its trade-off and what breaks it. Read them, then pick one — or keep talking and I will re-suggest.');
      renderPicks();
      renderSuggestions();
    }
  }
  function pickerSkip() {
    var order = ['goal', 'chain', 'risk', 'time'];
    var key = order[PICK.q] || 'goal';
    PICK[key] = 'Skipped — user decides later';
    pickerMsg('halex', 'Skipped — that question stays open and you decide it later. ' + (pickerAdvance() || ''));
    if (!pickerAdvance()) { renderPicks(); renderSuggestions(); }
  }
  function wirePicker() {
    var send = el('lab-picker-send'), skip = el('lab-picker-skip'), inp = el('lab-picker-input');
    if (send) send.addEventListener('click', pickerSend);
    if (skip) skip.addEventListener('click', pickerSkip);
    if (inp) inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pickerSend(); }
    });
    var log = el('lab-picker-log');
    if (log && !log.hasChildNodes()) {
      pickerMsg('halex', 'Let us pick a strategy together. I will ask four things — goal, chain, risk, time and caps — but you can also just talk freely and I will listen for the answers inside what you say. Nothing here trades, and every suggestion shows its reasoning so you can judge it.');
      pickerMsg('halex', PICK_QS[0]);
    }
  }

  /* ---------- suggestions from answers + Lab roll ---------- */
  function rollEntries() {
    try {
      var all = (typeof SKILLS !== 'undefined') ? SKILLS : [];
      return all.filter(function (s) {
        return s && s.status && s.rec && !/^(Allen2|AllenX|TEST01)/.test(s.name || '');
      });
    } catch (e) { return []; }
  }
  function renderSuggestions() {
    var box = el('lab-suggestions');
    if (!box) return;
    var d = draft();
    var ans = (d && d.labPicker) ? d.labPicker : PICK;
    var html = '';
    if (!ans.goal && !ans.chain && !ans.risk) {
      html = '<p class="note">No answers yet — talk in the guided picker above and suggestions will appear here, built from your words. Until then, the Lab roll below is the only evidence on offer.</p>';
    } else {
      var keys = picksFor();
      html = '<p class="note">Built from your answers' +
        (ans.goal ? ' — goal: ' + esc(ans.goal) : '') +
        (ans.chain ? ' · chain: ' + esc(ans.chain) : '') +
        (ans.risk ? ' · risk: ' + esc(ans.risk) : '') +
        (ans.time ? ' · time: ' + esc(ans.time) : '') + '. Reasoning is shown in plain words; nothing here is a promised result.</p>';
      keys.forEach(function (key) {
        var s = SHAPES[key];
        var why = 'Suggested because ';
        if (PICK.goal === key) why += 'your goal matches this shape directly. ';
        else if (ans.risk === 'conservative' && (key === 'momentum' || key === 'dip')) why += 'your risk reads conservative, and this is one of the patient shapes. ';
        else if (ans.risk === 'aggressive' && key === 'fresh') why += 'your risk reads aggressive, and this is the earliest, highest-churn shape. ';
        else why += 'it contrasts with your first suggestion, so you can compare trade-offs instead of taking one option. ';
        if (key === 'mirror' && d && (!d.token || !d.token.address) && !(d.notes || []).join(' ').match(/wallet/i)) why += 'Warning inside the reasoning: a mirror shape needs a wallet address and an audit of that wallet before it is anything more than a guess. ';
        html += '<div class="lab-sugg"><b>' + esc(s.name) + '</b><p>' + esc(why) + esc(shapeTradeoff(key)) + '</p>' +
          '<button class="btn" data-sugg="' + key + '" type="button">Use this suggestion — pre-fill the Q&amp;A</button></div>';
      });
    }
    var roll = rollEntries();
    html += '<div class="lab-roll-note"><b>Lab roll evidence — the Lab\'s own list, measured status only:</b>';
    if (!roll.length) {
      html += '<p class="note">The Lab roll is not readable from this view right now, so no roll evidence is claimed here.</p>';
    } else {
      roll.forEach(function (s) {
        html += '<p><b>' + esc(s.name) + '</b> — status ' + esc(s.status) + ', record ' + esc(s.rec) +
          (s.wr ? ', win figure on the roll: ' + esc(s.wr) : '') +
          '. <span class="note">That figure is the roll\'s own measured record, not a promise about your skill.</span></p>';
      });
    }
    html += '<p class="note">Gate status for any new skill: NOT PROVEN until it measures 65% or better over 30 or more closed paper trades with profit factor 1.2 or better. The gate is the evidence that matters.</p></div>';
    box.innerHTML = html;
    box.querySelectorAll('[data-sugg]').forEach(function (b) {
      b.addEventListener('click', function () { prefillShape(b.getAttribute('data-sugg')); });
    });
  }

  /* ---------- expanded settings center ---------- */
  var LAB_SETTINGS = [
    { k: 'requireCustodyProof', n: 'Require custody proof before entry', d: 'What it does: a paper entry is allowed only when LP custody is proven — burned or locked on-chain.', h: 'When it helps: it filters out the most common rug shape, a deployer holding the pool.', r: 'What it risks: fewer candidates, and slow or missing custody reads can stall entries that were fine.' },
    { k: 'requireDeployerClean', n: 'Skip deployers with a rug history', d: 'What it does: a deployer wallet with rug launches on its record blocks the entry.', h: 'When it helps: serial ruggers repeat; their history is the cheapest warning available.', r: 'What it risks: a new wallet has no history at all, so this rule cannot judge it either way.' },
    { k: 'skipCopycatSwarm', n: 'Skip same-name swarms', d: 'What it does: when many same-ticker contracts appear together, the candidate is skipped as a swarm member.', h: 'When it helps: swarms are built to catch ticker-only buyers; skipping them removes the trap.', r: 'What it risks: the genuine original inside a swarm gets skipped along with the copies.' },
    { k: 'requireSellSim', n: 'Require a sell simulation at size', d: 'What it does: before entry, a simulated sell at the paper size must return at least 90% of what the price implies.', h: 'When it helps: it catches one-way tape — tokens that look buyable but cannot be sold.', r: 'What it risks: simulation reads can fail or go stale, and a pass is still not a real fill.' },
    { k: 'requireDepth', n: 'Require depth: size must be small vs the pool', d: 'What it does: the paper size must be a small fraction of pool liquidity, so the entry itself does not move the price.', h: 'When it helps: it keeps paper results honest — huge size in a tiny pool is fantasy P&L.', r: 'What it risks: small pools with real momentum get skipped for being small.' },
    { k: 'entryAccel', n: 'Enter only while buys are accelerating', d: 'What it does: buys must be speeding up, not merely existing, at the moment of entry.', h: 'When it helps: acceleration separates live demand from a flat tape with a few old buys.', r: 'What it risks: you enter later than the earliest buyers, and some runners are already gone.' },
    { k: 'entryTwoSided', n: 'Enter only on two-sided flow', d: 'What it does: buys AND sells must both be present — real flow, not a buy-only tape.', h: 'When it helps: one-sided tape is the shape of traps and wash flow; two-sided flow is a market, not a stage.', r: 'What it risks: very fresh pools may not have sells yet, so early entries get skipped.' },
    { k: 'exitTrailing', n: 'Trailing exit from the peak', d: 'What it does: once the trade works, the exit trails below the best price reached, selling into the fall from the peak.', h: 'When it helps: it banks part of a run instead of round-tripping a winner back to flat.', r: 'What it risks: normal pullbacks trigger the trail early, and the trade exits before the bigger move.' },
    { k: 'exitTimeCap', n: 'Hard time cap on every trade', d: 'What it does: a trade that has not worked inside its window is closed at the cap, win, lose, or flat.', h: 'When it helps: dead capital moves on instead of sitting in a token that already told you it is not moving.', r: 'What it risks: slow winners get cut for being slow, not for being wrong.' },
    { k: 'exitThin', n: 'Thin-exit: close if liquidity thins', d: 'What it does: if pool liquidity falls below half its entry level, the trade exits.', h: 'When it helps: thinning liquidity is often the early sign of an exit door closing.', r: 'What it risks: normal liquidity wobble can force an exit from a trade that was fine.' },
    { k: 'exitStall', n: 'Stall exit: close on no progress', d: 'What it does: if the trade makes no progress inside its window, it is closed and the capital moves on.', h: 'When it helps: it stops a skill from babysitting flat trades while better setups pass by.', r: 'What it risks: choppy trades that would have worked get closed for being boring.' },
    { k: 'scaleIn', n: 'Ladder entries: enter in rungs', d: 'What it does: the position is built in rungs instead of all at once, so a bad first rung costs less.', h: 'When it helps: it turns one all-or-nothing guess into several smaller, revisable decisions.', r: 'What it risks: later rungs may never fill, and the full size never gets on.' },
    { k: 'capDailyLoss', n: 'Daily loss cap stops new entries', d: 'What it does: after the day\'s paper loss cap is hit, no new paper entries open until the next day.', h: 'When it helps: it stops revenge-trading — the pattern where one bad day becomes three.', r: 'What it risks: a good setup late in a bad day gets skipped on principle.' },
    { k: 'autopsyCounts', n: 'Only autopsied closes count toward the gate', d: 'What it does: a closed paper trade counts toward the 30-trade gate only when its written lesson exists.', h: 'When it helps: it forces the habit the method demands — no lesson, no credit.', r: 'What it risks: the gate takes longer to prove, because unexamined closes do not count.' }
  ];
  function labSettingsObj() {
    var d = draft();
    if (!d) return {};
    if (!d.labSettings) d.labSettings = {};
    return d.labSettings;
  }
  function renderSettings() {
    var box = el('lab-settings');
    if (!box) return;
    var cur = labSettingsObj();
    var html = '';
    LAB_SETTINGS.forEach(function (s) {
      html += '<label class="lab-toggle"><span class="lab-toggle-top"><input type="checkbox" data-lab-setting="' + s.k + '"' + (cur[s.k] ? ' checked' : '') + '> <b>' + esc(s.n) + '</b></span>' +
        '<span class="lab-expl">' + esc(s.d) + ' ' + esc(s.h) + ' ' + esc(s.r) + '</span></label>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-lab-setting]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        cur[cb.getAttribute('data-lab-setting')] = cb.checked;
        renderSettingsSummary();
      });
    });
    renderSettingsSummary();
  }
  function renderSettingsSummary() {
    var s = el('lab-settings-summary');
    if (!s) return;
    var cur = labSettingsObj();
    var on = LAB_SETTINGS.filter(function (x) { return cur[x.k]; }).map(function (x) { return x.n; });
    s.textContent = on.length ? 'On: ' + on.join(' · ') + '. These travel with the draft into the trading card and the markup below.' : 'None of the expanded settings are on yet. The Q&A builder\'s own settings still apply.';
  }

  /* ---------- trade tools picker (page tools only) ---------- */
  var LAB_TOOLS = [
    { k: 'token-dna', n: 'Token DNA scorecard', w: 'Token scorecard in this page', x: 'The 7-field profile — Type, Birth, Deployer lineage, Tracebacks, Custody, Family, Use case. A field not read is marked NOT READ, never filled in.' },
    { k: 'apex2', n: 'APEX² Research', w: 'APEX² Research tab', x: 'The full token investigation view: contract, metadata, price, liquidity, buy/sell tape, and community activity, with the gate verdict and its evidence.' },
    { k: 'chaintarium', n: 'Chaintarium search', w: 'Chaintarium tab search bar', x: 'Search a wallet or token and the cosmos plants its beacon on the world — the visual map of wallets, tokens, pools, and farms.' },
    { k: 'tape', n: 'Buy/sell tape + liquidity reads', w: 'APEX² Research report', x: 'The live tape and liquidity depth behind a token: who is buying, who is selling, and how deep the pool is. One-sided tape is a skip signal.' },
    { k: 'deployer', n: 'Deployer lineage', w: 'Token DNA field', x: 'The history of the wallet that minted the token: age, prior launches, prior outcomes, and any serial-seed launch-kit fingerprint.' },
    { k: 'custody', n: 'Custody check', w: 'Token DNA field', x: 'Who controls the liquidity pool: burned, locked, or deployer-held. Deployer-held liquidity is a hard warning, not a detail.' },
    { k: 'copycat', n: 'Copycat census', w: 'Token DNA field', x: 'Same-name siblings, original vs respin, and cross-chain swarms. Many same-name copies launched close together is a swarm pattern.' }
  ];
  function labToolsArr() {
    var d = draft();
    if (!d) return [];
    if (!d.labTools) d.labTools = [];
    return d.labTools;
  }
  function renderTools() {
    var box = el('lab-tools');
    if (!box) return;
    var cur = labToolsArr();
    var html = '';
    LAB_TOOLS.forEach(function (t) {
      html += '<label class="lab-toggle"><span class="lab-toggle-top"><input type="checkbox" data-lab-tool="' + t.k + '"' + (cur.indexOf(t.k) !== -1 ? ' checked' : '') + '> <b>' + esc(t.n) + '</b> <span class="note">— ' + esc(t.w) + '</span></span>' +
        '<span class="lab-expl">' + esc(t.x) + '</span></label>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-lab-tool]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var k = cb.getAttribute('data-lab-tool');
        var arr = labToolsArr();
        if (cb.checked) { if (arr.indexOf(k) === -1) arr.push(k); }
        else { var i = arr.indexOf(k); if (i !== -1) arr.splice(i, 1); }
        renderToolsSummary();
      });
    });
    renderToolsSummary();
  }
  function renderToolsSummary() {
    var s = el('lab-tools-summary');
    if (!s) return;
    var cur = labToolsArr();
    var names = LAB_TOOLS.filter(function (t) { return cur.indexOf(t.k) !== -1; }).map(function (t) { return t.n; });
    s.textContent = names.length ? 'Toolkit in the draft: ' + names.join(' · ') + '.' : 'No tools picked yet. A strategy with no tools is a guess with a name — pick at least one read it can actually use.';
  }

  /* ---------- assimilated Lab roll ---------- */
  function renderAssimilated() {
    var box = el('lab-assimilated');
    if (!box) return;
    var roll = rollEntries();
    var html = '';
    if (!roll.length) {
      html = '<p class="note">The Lab roll is not readable from this view right now, so no assimilated entries are listed here rather than guessed.</p>';
    } else {
      roll.forEach(function (s) {
        html += '<div class="lab-assim"><b>' + esc(s.name) + '</b> <span class="lab-chip">' + esc(s.status) + '</span>' +
          '<p>' + esc(s.desc || '') + '</p>' +
          '<p class="note" style="margin:4px 0 0">Measured record on the roll: ' + esc(s.rec) +
          (s.wr ? ' · roll figure: ' + esc(s.wr) : '') + '. That is the roll\'s own record, not a promise about any new skill.</p></div>';
      });
    }
    html += '<p class="note" style="margin-top:10px">Forged skills join this list once they have a paper record. Until then they live in the draft and the Q&amp;A builder — not here, and not dressed as proven.</p>';
    box.innerHTML = html;
  }

  /* ---------- markup + deployment ---------- */
  function markupPrompt() {
    var d = draft();
    if (!d) return 'No draft yet — build in the Q&A builder first.';
    var lines = [];
    lines.push('SKILL: ' + (d.strategyType || 'Unnamed skill'));
    if (d.strategyCustom) lines.push('Thesis: ' + d.strategyCustom);
    lines.push('Chains: ' + (d.chains && d.chains.length ? d.chains.join(', ') : 'not set'));
    lines.push('Token contract: ' + (d.token && d.token.address ? d.token.address : 'REQUIRED — no ticker-only skill'));
    lines.push('Token metadata: ' + (d.token && d.token.meta ? d.token.meta : 'NOT READ'));
    lines.push('Paper size per trade: ' + (d.size || 'not set'));
    lines.push('Max per trade: ' + (d.maxPerTrade || 'not set') + ' · Max concurrent: ' + (d.maxConcurrent || 'not set'));
    lines.push('Stop-loss: ' + (d.stopPct || 'not set') + '% · Take-profit: ' + (d.takeProfitPct || 'not set') + '% · Slippage: ' + (d.slippagePct || 'not set') + '% · Gas reserve: ' + (d.gasReserve || 'not set'));
    var cur = d.labSettings || {};
    var on = LAB_SETTINGS.filter(function (x) { return cur[x.k]; }).map(function (x) { return x.n; });
    lines.push('Expanded settings on: ' + (on.length ? on.join('; ') : 'none'));
    var tools = (d.labTools || []).map(function (k) {
      var t = null;
      LAB_TOOLS.forEach(function (x) { if (x.k === k) t = x; });
      return t ? t.n : k;
    });
    lines.push('Toolkit: ' + (tools.length ? tools.join('; ') : 'none picked'));
    lines.push('Paper-test plan: ' + (d.paperHours || 72) + ' hours, then the gate: 65% or better over 30 or more closed paper trades, profit factor 1.2 or better.');
    lines.push('Live: NOT OFFERED until the gate is proven AND a real signed executor exists. This page holds no keys, signs nothing, and moves no funds.');
    return lines.join('\n');
  }
  function markupConfig() {
    var d = draft();
    if (!d) return '{}';
    var cur = d.labSettings || {};
    var on = {};
    LAB_SETTINGS.forEach(function (x) { on[x.k] = !!cur[x.k]; });
    var cfg = {
      strategyType: d.strategyType || null,
      thesis: d.strategyCustom || null,
      chains: d.chains || [],
      token: { address: (d.token && d.token.address) || null, metadata: (d.token && d.token.meta) || 'NOT READ' },
      size: { perTrade: d.size || null, maxPerTrade: d.maxPerTrade || null, maxConcurrent: d.maxConcurrent || null },
      risk: { stopPct: d.stopPct || null, takeProfitPct: d.takeProfitPct || null, slippagePct: d.slippagePct || null, gasReserve: d.gasReserve || null },
      expandedSettings: on,
      toolkit: d.labTools || [],
      paperTestHours: d.paperHours || 72,
      paperTestGate: { winRatePct: 65, minClosedTrades: 30, profitFactor: 1.2 },
      live: { offered: false, reason: 'No signed executor in this static page; HALEX-M holds no keys, signs nothing, moves no funds.' }
    };
    return JSON.stringify(cfg, null, 2);
  }
  function renderMarkup() {
    var p = el('lab-markup-prompt'), c = el('lab-markup-config');
    if (p) p.value = markupPrompt();
    if (c) c.textContent = markupConfig();
  }
  function wireMarkup() {
    var r = el('lab-markup-refresh');
    if (r) r.addEventListener('click', function () { renderMarkup(); toast('Markup refreshed from the draft.'); });
    var paper = el('lab-markup-paper');
    if (paper) paper.addEventListener('click', function () {
      var d = draft();
      var run = {
        id: 'paper-' + Date.now(), config: d ? JSON.parse(JSON.stringify(d)) : {},
        startedAt: new Date().toISOString(), status: 'PAPER',
        closedTrades: 0, winRate: null, profitFactor: null
      };
      try {
        var runs = JSON.parse(localStorage.getItem('halexm-paper-runs') || '[]');
        runs.push(run);
        localStorage.setItem('halexm-paper-runs', JSON.stringify(runs));
      } catch (e) { /* storage unavailable: record stays in-page only */ }
      var n = el('lab-markup-note');
      if (n) n.textContent = 'Paper run recorded locally (id ' + run.id + '). Local record only: no fills simulated, closed trades stay at 0, gate stays NOT PROVEN until real paper results are recorded. No real funds move, ever, from this card.';
      toast('Paper run recorded — local record only, no funds moved.');
    });
    var wallet = el('lab-markup-wallet');
    if (wallet) wallet.addEventListener('click', function () {
      var out = el('forge-output-card');
      var n = el('lab-markup-note');
      if (out && !out.hidden) { scrollTo('forge-output-card'); }
      else {
        if (n) n.textContent = 'The wallet pick lives in the Forge output card and appears once a skill is forged. Forge in the Skill Forge above, then come back here.';
        scrollTo('forge-input');
      }
    });
  }

  /* ---------- init ---------- */
  function init() {
    renderMethod();
    renderIdeas();
    wirePicker();
    renderSuggestions();
    renderSettings();
    renderTools();
    renderAssimilated();
    renderMarkup();
    wireMarkup();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
