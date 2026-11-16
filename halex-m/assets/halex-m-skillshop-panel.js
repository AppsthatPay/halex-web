/* HALEX-M Skill Shop — page panel glue (2026-11-04).
 *
 * DOM-only companion to halex-m-skillshop-concierge.js (pure logic).
 * Renders the Skill Shop panel inside the Skills Lab tab: a free-text
 * box, the concierge's five toggle groups, and the answer — exactly 3
 * offers, a bespoke strategy-build record for the 300 agency, or the
 * fixed refusal. Everything is rendered with textContent; no user
 * text is ever injected as HTML. No network, no keys, no trading:
 * the concierge module itself is record-and-offer only, paper first.
 */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function init() {
    var panel = document.getElementById('skillshop-panel');
    if (!panel) return;
    var C = window.HalexMSkillShopConcierge;
    if (!C) {
      panel.appendChild(el('p', 'note', 'The Skill Shop concierge did not load. The rest of the Skills Lab works as normal.'));
      return;
    }
    var concierge = C.createConcierge();

    var intro = el('p', 'note', 'Tell the shop what you want in your own words. The concierge reads the Braintree skill inventory (44 skills) and answers with exactly 3 sets that fit, each with a paper-first plan at your size. When nothing in the inventory fits, it files a strategy-build request to the 300 agency through the Skill Lab operator instead. Nothing here promises profit, trades, signs, or holds keys.');
    intro.style.cssText = 'margin:0 0 12px; font-size:13px';
    panel.appendChild(intro);

    var ta = document.createElement('textarea');
    ta.id = 'skillshop-text';
    ta.rows = 3;
    ta.placeholder = 'Example: Create a trading strategy for 5$ on Solana';
    ta.style.cssText = 'width:100%; box-sizing:border-box; margin:0 0 10px';
    panel.appendChild(ta);

    var toggleWrap = el('div', 'skillshop-toggles');
    var selects = {};
    C.TOGGLE_GROUPS.forEach(function (g) {
      var lab = el('label', null, g.label + ' ');
      lab.style.cssText = 'display:block; font-size:13px; margin:0 0 8px';
      var sel = document.createElement('select');
      var auto = document.createElement('option');
      auto.value = '';
      auto.textContent = 'From my text (auto)';
      sel.appendChild(auto);
      g.options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      });
      lab.appendChild(sel);
      toggleWrap.appendChild(lab);
      selects[g.id] = sel;
    });
    panel.appendChild(toggleWrap);

    var btn = el('button', 'btn', 'Ask the Skill Shop');
    btn.id = 'skillshop-go';
    panel.appendChild(btn);

    var out = el('div', 'skillshop-results');
    out.id = 'skillshop-results';
    out.setAttribute('aria-live', 'polite');
    out.style.cssText = 'margin-top:12px';
    panel.appendChild(out);

    function render(res) {
      out.innerHTML = '';
      if (!res) { out.appendChild(el('p', 'note', 'No answer came back. Try again.')); return; }
      if (res.type === 'refusal') {
        out.appendChild(el('p', null, res.refusal));
        return;
      }
      if (res.reframe) out.appendChild(el('p', 'note', res.reframe));
      if (res.type === 'bespoke' && res.proposal) {
        var p = res.proposal;
        out.appendChild(el('b', null, 'Nothing in the inventory fits that yet, so a strategy-build request was filed.'));
        out.appendChild(el('p', null, 'Filed to: ' + p.addressedName + ' (' + p.addressedTo + '). Stage: ' + p.stage + '. Path: ' + p.lifecycle.join(' -> ') + '.'));
        out.appendChild(el('p', null, 'Why: ' + p.reason + '.'));
        out.appendChild(el('p', 'note', p.note));
      }
      if (res.type === 'offers' && res.offers) {
        res.offers.forEach(function (o, i) {
          var card = el('div', 'card');
          card.style.cssText = 'margin:0 0 10px';
          card.appendChild(el('b', null, (i + 1) + '. ' + o.name));
          card.appendChild(el('p', null, 'Measured status: ' + o.measuredStatus + (o.measuredStatusText ? ' — ' + o.measuredStatusText : '')));
          card.appendChild(el('p', null, 'Why it fits: ' + o.whyItFits));
          card.appendChild(el('p', null, 'What it does: ' + o.whatItDoes));
          card.appendChild(el('p', null, 'Paper-first plan: ' + o.paperPlan));
          card.appendChild(el('p', 'note', o.proprietaryNote));
          out.appendChild(card);
        });
      }
      if (res.followUp) out.appendChild(el('p', 'note', res.followUp));
      if (res.disclosure) out.appendChild(el('p', 'note', res.disclosure));
    }

    btn.addEventListener('click', function () {
      var toggles = {};
      Object.keys(selects).forEach(function (id) {
        var v = selects[id].value;
        if (v) toggles[id] = v;
      });
      render(concierge.answer(ta.value || '', toggles));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
