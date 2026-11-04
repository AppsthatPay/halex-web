/* HALEX-M Skills Lab — deterministic paper-test simulator (STAGING ONLY).
 *
 * Purpose: measure whether each Lab skill's RULES fire as written, on one
 * fixed, labelled, synthetic tape. This is a logic test, not market
 * performance: the tape is synthetic (not market data), no live results
 * are claimed, and no funds move. Run it with Node:
 *   node paper-test-simulator.js
 * It prints one result line per skill plus a JSON summary.
 *
 * Rules (plain words, matching the Skills Lab shapes):
 *   second-wave momentum : enter when buys are accelerating AND flow is
 *     two-sided.
 *   wallet mirror         : enter only on a watched-wallet buy whose
 *     wallet record has survived an audit.
 *   fresh-launch screen   : enter only on a fresh pool with accelerating
 *     buys AND two-sided flow.
 *   mean-reversion        : enter when an overextended move is fading
 *     toward its recent average.
 *   dip buy               : enter on a pullback that holds, with
 *     two-sided flow.
 *
 * Tape row: [accel, twoSided, fresh, pullbackHolds, extendedFade,
 *   walletBuy, walletAudited, outcomePct]
 * outcomePct is the labelled next-move percent for that bar. Win means
 * outcomePct > 0, loss means outcomePct < 0, flat (0) counts as closed
 * but neither win nor loss. Profit factor = gross wins / gross losses
 * (absolute); it is NOT computable when there are no losses, and then
 * renders as null ("—" in the UI), never as infinity.
 *
 * Paper-test gate (standing HALEX rule): PROVEN only when closed trades
 * >= 30 AND win rate >= 65% AND profit factor >= 1.2. Anything else is
 * NOT PROVEN. A reworked skill restarts its count.
 *
 * No keys, no signing, no funds, no network, no outside brand names.
 * Lab names only.
 */
(function (root) {
  'use strict';

  // Fixed labelled tape: 40 bars. Deterministic by construction — no
  // randomness, no clock, no network. Editing this tape changes the
  // results, which is why TEST-EVIDENCE.md records the run output.
  var TAPE = [
    [1, 1, 1, 0, 0, 1, 1,  18], [1, 1, 0, 0, 0, 0, 0,  -9],
    [0, 1, 0, 1, 0, 1, 0,   7], [1, 0, 1, 0, 0, 0, 0, -14],
    [1, 1, 0, 0, 1, 1, 1,  11], [0, 0, 0, 1, 0, 0, 0,  -6],
    [1, 1, 1, 0, 0, 1, 1,  24], [0, 1, 0, 0, 1, 0, 0,   5],
    [1, 1, 0, 1, 0, 1, 0, -11], [0, 1, 0, 1, 1, 0, 0,   9],
    [1, 0, 0, 0, 0, 1, 1,  15], [1, 1, 0, 0, 0, 0, 0,   8],
    [0, 0, 1, 0, 0, 0, 0, -18], [1, 1, 1, 0, 1, 1, 1,  -7],
    [0, 1, 0, 1, 0, 1, 1,  13], [1, 1, 0, 1, 0, 0, 0,  -5],
    [0, 1, 0, 0, 1, 0, 0, -12], [1, 1, 0, 0, 0, 1, 0,   6],
    [1, 0, 0, 1, 0, 0, 0,   4], [0, 1, 1, 0, 0, 1, 1,  19],
    [1, 1, 0, 0, 1, 0, 0,  10], [0, 0, 0, 1, 0, 1, 0,  -8],
    [1, 1, 1, 0, 0, 0, 0,  22], [1, 1, 0, 1, 1, 1, 1,  -4],
    [0, 1, 0, 0, 1, 0, 0,   3], [1, 0, 0, 0, 0, 1, 1, -16],
    [1, 1, 0, 1, 0, 0, 0,  14], [0, 1, 1, 0, 0, 0, 0, -10],
    [1, 1, 0, 0, 0, 1, 1,   9], [0, 1, 0, 1, 1, 1, 0,   6],
    [1, 1, 1, 0, 0, 0, 0, -13], [1, 1, 0, 0, 1, 0, 0,  12],
    [0, 0, 0, 1, 0, 1, 1,   5], [1, 1, 0, 1, 0, 1, 0,  -9],
    [0, 1, 0, 0, 1, 0, 0,  -3], [1, 1, 1, 0, 0, 1, 1,  17],
    [1, 0, 0, 1, 0, 0, 0,   2], [0, 1, 0, 0, 1, 0, 0,   8],
    [1, 1, 0, 1, 0, 1, 1,  -6], [1, 1, 0, 0, 0, 0, 0,  10]
  ];

  var RULES = {
    momentum: function (r) { return r[0] === 1 && r[1] === 1; },
    mirror:   function (r) { return r[5] === 1 && r[6] === 1; },
    fresh:    function (r) { return r[2] === 1 && r[0] === 1 && r[1] === 1; },
    meanrev:  function (r) { return r[4] === 1; },
    dip:      function (r) { return r[3] === 1 && r[1] === 1; }
  };

  var NAMES = {
    momentum: 'Second-wave momentum',
    mirror: 'Wallet mirror',
    fresh: 'Fresh-launch screen',
    meanrev: 'Mean-reversion',
    dip: 'Dip buy'
  };

  function runSkill(key) {
    var rule = RULES[key];
    var trades = 0, wins = 0, losses = 0, flats = 0;
    var grossWin = 0, grossLoss = 0;
    TAPE.forEach(function (row) {
      if (!rule(row)) return;
      var outcome = row[7];
      trades += 1;
      if (outcome > 0) { wins += 1; grossWin += outcome; }
      else if (outcome < 0) { losses += 1; grossLoss += -outcome; }
      else { flats += 1; }
    });
    var winRate = trades > 0 ? (wins / trades) * 100 : null;
    var profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;
    var gateProven = trades >= 30 && winRate !== null && winRate >= 65 &&
      profitFactor !== null && profitFactor >= 1.2;
    return {
      key: key, name: NAMES[key], tapeBars: TAPE.length,
      trades: trades, wins: wins, losses: losses, flats: flats,
      winRatePct: winRate === null ? null : Math.round(winRate * 10) / 10,
      grossWinPct: grossWin, grossLossPct: grossLoss,
      profitFactor: profitFactor === null ? null : Math.round(profitFactor * 100) / 100,
      gate: gateProven ? 'PROVEN' : 'NOT PROVEN'
    };
  }

  function runAll() {
    return Object.keys(RULES).map(runSkill);
  }

  var api = { TAPE: TAPE, RULES: RULES, NAMES: NAMES, runSkill: runSkill, runAll: runAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMSkillsLabSim = api;

  // CLI: print results when run directly with Node.
  if (typeof module !== 'undefined' && require.main === module) {
    var results = runAll();
    results.forEach(function (r) {
      console.log(r.key + ' | ' + r.name + ' | trades=' + r.trades +
        ' wins=' + r.wins + ' losses=' + r.losses + ' flats=' + r.flats +
        ' winRate=' + (r.winRatePct === null ? '—' : r.winRatePct + '%') +
        ' profitFactor=' + (r.profitFactor === null ? '—' : r.profitFactor) +
        ' gate=' + r.gate);
    });
    console.log(JSON.stringify({ tapeBars: TAPE.length, results: results }));
  }
})(typeof window !== 'undefined' ? window : globalThis);
