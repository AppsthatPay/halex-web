/* HALEX-M agentified tabs (STAGING 2026-11-03).
 *
 * "Agentified, hidden but working in the background" means: every tab
 * owns a background worker record that keeps working while the tab is
 * not visible — it polls its data, refreshes its state, and reports a
 * heartbeat. Workers run in-page (no separate servers, no invented
 * backends). Each worker has a visible status line so "hidden" never
 * means "unobservable": the user can always see what is running, when
 * it last ticked, and how deep its queue is.
 *
 * Worker states: IDLE (registered, not yet ticked), WORKING (ticked
 * within its interval), STALE (no tick for 3x its interval), STOPPED
 * (explicitly stopped; never auto-restarted into trading).
 * A worker NEVER trades, signs, or moves funds. Tab workers only
 * refresh data and render state.
 *
 * Pure logic, no DOM. Browser global window.HalexMTabsAgentified;
 * node via module.exports.
 */
(function (root) {
  'use strict';

  var TABS = [
    { id: 'home', label: 'Home', intervalMs: 60000 },
    { id: 'apex1', label: 'APEX¹', intervalMs: 60000 },
    { id: 'markets', label: 'Markets', intervalMs: 30000 },
    { id: 'apex2', label: 'APEX²', intervalMs: 30000 },
    { id: 'rusty', label: 'Rusty', intervalMs: 60000 },
    { id: 'news', label: 'News', intervalMs: 60000 },
    { id: 'trading', label: 'Trading', intervalMs: 30000 },
    { id: 'skills', label: 'Skills Lab', intervalMs: 30000 },
    { id: 'research', label: 'Research', intervalMs: 60000 },
    { id: 'chaintarium', label: 'Chaintarium', intervalMs: 120000 },
    { id: 'sockets', label: 'AI Sockets', intervalMs: 60000 },
    { id: 'security', label: 'Security', intervalMs: 60000 },
    { id: 'warchest', label: 'War Chest', intervalMs: 60000 },
    { id: 'scout', label: 'Airdrop Scout', intervalMs: 120000 },
    { id: 'know', label: 'Know', intervalMs: 120000 },
    { id: 'swap', label: 'Swap', intervalMs: 60000 },
    { id: 'wallet', label: 'Wallet', intervalMs: 30000 },
    { id: 'halexmai', label: 'HALEX-M AI', intervalMs: 60000 },
    { id: 'apex3', label: 'APEX³', intervalMs: 60000 }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function createTabWorkers(tabDefs) {
    var workers = {};
    var order = [];
    (tabDefs || TABS).forEach(function (t) {
      if (!t || !t.id) return;
      if (workers[t.id]) throw new Error('duplicate tab worker: ' + t.id);
      workers[t.id] = { id: t.id, label: t.label || t.id, intervalMs: t.intervalMs || 60000, state: 'IDLE', lastTick: null, ticks: 0, queue: 0 };
      order.push(t.id);
    });
    function tick(id, nowMs, queueDepth) {
      if (!workers[id]) return { ok: false, error: 'unknown tab worker: ' + id };
      var w = workers[id];
      w.state = 'WORKING';
      w.lastTick = nowMs;
      w.ticks += 1;
      if (typeof queueDepth === 'number') w.queue = queueDepth;
      return { ok: true, worker: clone(w) };
    }
    function stop(id) {
      if (!workers[id]) return { ok: false, error: 'unknown tab worker: ' + id };
      workers[id].state = 'STOPPED';
      return { ok: true, worker: clone(workers[id]) };
    }
    function status(id, nowMs) {
      if (!workers[id]) return null;
      var w = clone(workers[id]);
      if (w.state === 'WORKING' && w.lastTick != null && (nowMs - w.lastTick) > 3 * w.intervalMs) w.state = 'STALE';
      return w;
    }
    function statusStrip(nowMs) {
      return order.map(function (id) { return status(id, nowMs); });
    }
    function workingCount(nowMs) {
      return statusStrip(nowMs).filter(function (w) { return w.state === 'WORKING'; }).length;
    }
    return { tick: tick, stop: stop, status: status, statusStrip: statusStrip, workingCount: workingCount, count: order.length };
  }

  var api = { TABS: TABS, createTabWorkers: createTabWorkers, defaultWorkers: function () { return createTabWorkers(TABS); } };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMTabsAgentified = api;
})(typeof window !== 'undefined' ? window : this);
