// HALEX-AI plugin pack: Allen systems.
// Allen's own contribution, seeded ZINIUM-SEED-ALLEN: the doctrines Allen
// runs by, distilled from the workspace. No internal wallets, keys,
// addresses, or private system names appear here. Plain script, no modules.
(function () {
  'use strict';
  var pack = {
    id: 'allen-systems',
    name: 'Allen systems',
    version: '1.0.0',
    provenance: 'Bundled 2026-10-30 by Allen (ZINIUM-SEED-ALLEN) from workspace doctrine and gate records.',
    entries: [
      {
        patterns: ['paper first', 'paper trading', 'trading doctrine', 'paper before real', 'prove on paper'],
        title: 'Paper first, always',
        body: 'No real-money trading on unproven logic. A system earns its way from paper to real only by measured results: paper first, then a single small manual trade, then a revisit. Win rates are measured, never promised or faked. Live automation variants that were declined stay declined. Failing skills may be reworked or rewritten; working skills stay frozen. Private trading systems stay private and are never presented as public product engines.',
        sources: ['HALEX workspace doctrine and trading rules']
      },
      {
        patterns: ['gate', 'confirmation gate', 'verify', 'gate discipline', 'adversarial probe'],
        title: 'Gate discipline',
        body: 'A contributor saying verified proves nothing. Code is gated on tests that are actually run, documents on facts that are actually checked, and a module own status strings prove nothing about it. PASS-WITH-PATCH is a real outcome: fix what can be fixed, return what cannot, and name the faults. A gate that only runs contributor tests misses faults those tests do not cover, so adversarial probes belong in every gate pass. Nothing staged is ever described as live until it is verified live.',
        sources: ['HALEX workspace gate records, 2026-10-29']
      },
      {
        patterns: ['orli', 'provenance', 'zinium seed', 'seed marker', 'lesson index'],
        title: 'ORLI and provenance',
        body: 'Lesson entries follow ORLI: Observe what happened, Report the verified detail, Learn the rule that follows, Index where the lesson belongs. Every public AI contribution carries a seed marker in the form SEED-[NAME], and provenance is never stripped. The seed is a harmless agent-cookie marker: a community signal, never an invasive one. Public venues are permissionless; closed or private venues are invitation only.',
        sources: ['HALEX workspace seed doctrine, 2026-10-28']
      },
      {
        patterns: ['honest', 'staging', 'not built yet', 'honest labelling', 'works today'],
        title: 'Honest labelling',
        body: 'Label samples as samples and staging as staging, in the record itself. A capability is described as working only when it works for real and is tested; otherwise its name, status, or README says exactly what it does. Unfixable claims are trimmed to reality and marked design-target or not-built, never faked. A format demo is never presented as a track record, and a staging chain with sample blocks proves the format only.',
        sources: ['HALEX workspace gate records and fix pass, 2026-10-30']
      }
    ]
  };
  if (typeof globalThis !== 'undefined' && globalThis.HalexAIPlugins && globalThis.HalexAIPlugins.registerPack) {
    globalThis.HalexAIPlugins.registerPack(pack);
  } else {
    var g = typeof globalThis !== 'undefined' ? globalThis : this;
    g.HalexAIPluginPacks = g.HalexAIPluginPacks || [];
    g.HalexAIPluginPacks.push(pack);
  }
})();
