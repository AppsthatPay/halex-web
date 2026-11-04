/* HALEX-M ZINIUM¹ — page glue (STAGING 2026-11-04).
 *
 * Additive only. Loads after halex-m-braintree.js. If the ZINIUM¹
 * module (halex-m-zinium1.js) is absent or anything here fails, the
 * page behaves exactly as before — every step is guarded.
 *
 * What it does:
 * 1. Boots this install's ZINIUM¹ core (restores the per-install chain
 *    from localStorage, or creates its genesis) and exposes it as
 *    window.HalexMZinium1Core.
 * 2. Wraps the Braintree registry factories so registries created
 *    after this file loads commit a ZINIUM¹ SKILL_LIFECYCLE block on
 *    propose / gate / file transitions. The original registry methods
 *    run unchanged and their return values are passed through; the
 *    chain write is a side record, wrapped in its own try/catch.
 *
 * Background and unseen (Jeffrey, 2026-11-04): ZINIUM¹ renders no
 * user-facing surface and makes no reports to the user. It is part of
 * the HALEX-M software, running silently for HALEX-M's own AI
 * intelligence agentified processing.
 *
 * ZINIUM¹ is a system chain for HALEX-M software: not a cryptocurrency
 * chain, holds no wallet keys (a local packet integrity key only),
 * never signs, never trades. Paper events only.
 */
(function () {
  'use strict';

  var Z = (typeof window !== 'undefined') ? window.HalexMZinium1 : null;
  if (!Z) return; // ZINIUM¹ absent: no behavior change, by design.

  var core = null;
  try { core = Z.createCore(); } catch (e) { core = null; }
  if (!core) return;
  window.HalexMZinium1Core = core;

  /* A status slot through the gateway, so the gateway has one real
   * HALEX-M slot from the page itself (permissioned to the page). */
  try {
    core.registerSlot('zinium1_status', function () { return core.status(); });
    core.registerModule('halex-m-page', ['halex_m_zinium1_status']);
  } catch (e) { /* non-fatal */ }

  /* Commit helpers other HALEX-M modules may call when present. */
  window.HalexMZinium1Commit = {
    skillLifecycle: function (evt) { try { return core.commitSkillLifecycle(evt || {}); } catch (e) { return null; } },
    chaintariumSnapshot: function (snap) { try { return core.commitChaintariumSnapshot(snap || {}); } catch (e) { return null; } },
    paperTradeEvent: function (evt) { try { return core.commitPaperTradeEvent(evt || {}); } catch (e) { return null; } },
    watchlistChange: function (change) { try { return core.commitWatchlistChange(change || {}); } catch (e) { return null; } }
  };

  /* ---- Braintree lifecycle wiring ---- */
  function wrapRegistry(reg) {
    if (!reg || reg.__zinium1Wrapped) return reg;
    try { reg.__zinium1Wrapped = true; } catch (e) { return reg; }
    var origPropose = reg.propose, origGate = reg.gate, origFile = reg.file;
    if (typeof origPropose === 'function') {
      reg.propose = function (proposal) {
        var res = origPropose.apply(reg, arguments);
        try {
          if (res && res.ok && window.HalexMZinium1Commit) {
            window.HalexMZinium1Commit.skillLifecycle({ proposalId: proposal && proposal.id, skillId: proposal && proposal.skillId, from: null, to: 'PROPOSED', note: 'braintree propose()' });
          }
        } catch (e) { /* record-only side effect; never break the registry */ }
        return res;
      };
    }
    if (typeof origGate === 'function') {
      reg.gate = function (proposalId, gateName, passed, note) {
        var before = null;
        try { var bp = reg.getProposal && reg.getProposal(proposalId); before = bp ? bp.stage : null; } catch (e) { /* ignore */ }
        var res = origGate.apply(reg, arguments);
        try {
          if (res && res.ok && res.proposal && window.HalexMZinium1Commit) {
            window.HalexMZinium1Commit.skillLifecycle({ proposalId: proposalId, skillId: res.proposal.skillId, from: before, to: res.proposal.stage, note: 'gate ' + gateName + (passed ? ' passed' : ' failed') });
          }
        } catch (e) { /* ignore */ }
        return res;
      };
    }
    if (typeof origFile === 'function') {
      reg.file = function (proposalId) {
        var res = origFile.apply(reg, arguments);
        try {
          if (res && res.ok && window.HalexMZinium1Commit) {
            window.HalexMZinium1Commit.skillLifecycle({ proposalId: proposalId, skillId: res.proposal ? res.proposal.skillId : null, from: 'REVIEWED', to: 'FILED', note: 'braintree file()' });
          }
        } catch (e) { /* ignore */ }
        return res;
      };
    }
    return reg;
  }

  try {
    var B = window.HalexMBraintree;
    if (B && typeof B.createRegistry === 'function') {
      var origCreate = B.createRegistry;
      B.createRegistry = function () { return wrapRegistry(origCreate.apply(B, arguments)); };
      var origDefault = B.defaultRegistry;
      if (typeof origDefault === 'function') {
        B.defaultRegistry = function () { return wrapRegistry(origDefault.apply(B, arguments)); };
      }
    }
  } catch (e) { /* registry unwired; page unchanged */ }

})();
