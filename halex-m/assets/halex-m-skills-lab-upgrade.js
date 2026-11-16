/* HALEX-M Skill Lab upgrade (STAGING 2026-11-03).
 *
 * Builds on the staged Skills Lab package (halex-m-skills-lab.js):
 * - every skill type organized by what it does (Braintree categories),
 * - each skill labeled and toggleable, toggles composing a skills list,
 * - a Skill Lab TEXT WINDOW operated by 300-OP-01, one of the 300,
 *   with Braintree access: it lists, toggles, explains, and composes
 *   skills. It takes NO external action, holds no keys, signs nothing,
 *   moves no funds, and refuses key/wallet/signing/seed/credential
 *   requests outright.
 *
 * The operator is a pure function of (input, registry): no network,
 * no DOM. The host wires its input box to operatorReply() and renders
 * the returned text. Refusals are fixed strings, never elaborated
 * into instructions.
 *
 * Pure logic. Browser global window.HalexMSkillsLabUpgrade; node via
 * module.exports.
 */
(function (root) {
  'use strict';

  var REFUSAL = 'I cannot do that here. The Skill Lab never takes keys, wallet connections, signatures, seed phrases, or credentials, and it never moves funds. I can list skills, explain a skill, toggle a skill, or build a skills list from toggled-on skills.';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function organizeByCategory(registry) {
    // registry: a Braintree registry object (createRegistry result).
    var cats = registry.categories();
    var out = {};
    Object.keys(cats).forEach(function (c) {
      out[c] = registry.list({ category: c }).map(function (s) {
        return { id: s.id, label: s.label, status: s.status, gate: s.gate || '', on: registry.isOn(s.id) };
      });
    });
    return out;
  }

  function buildSkillsList(registry, ids) {
    // Compose a skills list from the given ids, honoring toggles.
    // Returns { skills, refused } — refusals carry reasons, never
    // silent drops.
    return registry.composeList(ids);
  }

  function isForbiddenRequest(text) {
    var t = String(text || '').toLowerCase();
    var patterns = ['seed phrase', 'private key', 'secret key', 'sign this', 'connect wallet', 'send ', 'transfer ', 'password', 'mnemonic', 'keystore', 'withdraw'];
    for (var i = 0; i < patterns.length; i++) {
      if (t.indexOf(patterns[i]) !== -1) return true;
    }
    return false;
  }

  function operatorReply(input, registry) {
    // 300-OP-01: the Skill Lab text-window operator.
    var text = String(input || '').trim();
    if (!text) return 'Ask me to list skills, explain a skill, toggle a skill on or off, or build a skills list. Example: "list trading skills" or "explain Wallet mirror".';
    if (isForbiddenRequest(text)) return REFUSAL;
    var lower = text.toLowerCase();

    var listMatch = lower.match(/list\s+(\w+)?\s*skills/);
    if (listMatch) {
      var cat = (listMatch[1] || '').replace(/s$/, '');
      var cats = ['trading', 'research', 'security', 'wallet', 'intelligence', 'decision'];
      if (cat && cats.indexOf(cat) === -1) return 'I do not have a category called "' + cat + '". Categories are: ' + cats.join(', ') + '.';
      var skills = cat ? registry.list({ category: cat }) : registry.list();
      if (!skills.length) return 'No skills in that category.';
      return skills.map(function (s) {
        return (registry.isOn(s.id) ? '[ON] ' : '[OFF] ') + s.label + ' (' + s.id + ', ' + s.status + ')';
      }).join('\n');
    }

    var explainMatch = lower.match(/explain\s+(.+)/);
    if (explainMatch) {
      var want = explainMatch[1].trim();
      var found = registry.list().filter(function (s) {
        return s.id.toLowerCase() === want.toLowerCase() || s.label.toLowerCase().indexOf(want.toLowerCase()) !== -1;
      })[0];
      if (!found) return 'I do not know a skill called "' + want + '". Ask me to list skills to see the full list.';
      return found.label + ' (' + found.id + ', ' + found.category + ', ' + found.status + '): ' + found.desc + ' Gate: ' + (found.gate || '—') + '. Currently ' + (registry.isOn(found.id) ? 'ON' : 'OFF') + '.';
    }

    var toggleMatch = lower.match(/turn\s+(on|off)\s+(.+)/);
    if (toggleMatch) {
      var wantId = toggleMatch[2].trim();
      var target = registry.list().filter(function (s) {
        return s.id.toLowerCase() === wantId.toLowerCase() || s.label.toLowerCase() === wantId.toLowerCase();
      })[0];
      if (!target) return 'I do not know a skill called "' + wantId + '". Ask me to list skills to see the full list.';
      var res = registry.toggle(target.id, toggleMatch[1] === 'on');
      if (!res.ok) return 'Cannot toggle ' + target.label + ': ' + res.error;
      return target.label + ' is now ' + (res.on ? 'ON' : 'OFF') + '.';
    }

    var buildMatch = lower.match(/build (a )?skills? list/);
    if (buildMatch) {
      var onSkills = registry.list({ onOnly: true });
      if (!onSkills.length) return 'No skills are toggled on right now, so the list would be empty. Turn some skills on first.';
      return 'Skills list (' + onSkills.length + ' toggled-on skills):\n' + onSkills.map(function (s) { return '- ' + s.label + ' (' + s.id + ', ' + s.category + ')'; }).join('\n');
    }

    return 'I can list skills, explain a skill, toggle a skill on or off, or build a skills list from toggled-on skills. Try: "list trading skills".';
  }

  var api = {
    OPERATOR_ID: '300-OP-01',
    organizeByCategory: organizeByCategory,
    buildSkillsList: buildSkillsList,
    operatorReply: operatorReply,
    REFUSAL: REFUSAL
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMSkillsLabUpgrade = api;
})(typeof window !== 'undefined' ? window : this);
