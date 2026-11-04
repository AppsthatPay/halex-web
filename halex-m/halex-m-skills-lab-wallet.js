/* HALEX-M Skills Lab — visitor-wallet connect + execution wiring (STAGING ONLY).
 *
 * Corrected architecture (owner correction, 2026-11-01): HALEX-M is not
 * blocked from real trading by being statically hosted. A static page
 * CAN execute real trades because signing happens client-side in the
 * visitor's own wallet — the way DEX frontends work. This module wires
 * that path, honestly and narrowly:
 *
 *   - VISITOR'S WALLET ONLY. The only account ever used is the account
 *     the visitor connects in this browser, through their own wallet.
 *     HALEX-M itself holds no keys, stores no keys, and never signs
 *     anything itself. There is no server-side signing anywhere in this
 *     package, and no owner wallet is ever touched.
 *   - PAPER IS THE DEFAULT. Until a visitor connects a wallet, every
 *     control reads paper mode and nothing can be submitted.
 *   - TWO CONNECT PATHS. (1) Injected wallet: the browser's own wallet
 *     provider, used only after an explicit visitor tap. (2) Wallet
 *     Connect / Reown: needs a project ID from the owner's account.
 *     That ID is NOT on disk, is never invented here, and lives only in
 *     a clearly-marked config slot (see configure()). While it is
 *     absent, the WalletConnect path renders as "WalletConnect needs a
 *     project ID (owner supplies it)" and stays disabled, while the
 *     injected-wallet path and paper mode keep working. When a project
 *     ID is configured but the host page has not loaded a WalletConnect
 *     SDK, the path renders that fact instead of pretending to connect.
 *   - SESSION + EXECUTOR WIRING, BUILT HERE: connect -> build a review
 *     (exact amount, token, slippage, fees) -> visitor explicitly
 *     confirms that exact review -> submit sends it to the visitor's
 *     wallet for signing. Execution is refused unless ALL of these hold
 *     at submit time: a wallet is connected, a review exists, the
 *     review was explicitly confirmed, and the submitted trade matches
 *     the confirmed review exactly. A swap route / quote (destination
 *     and calldata) must be supplied by the caller; this module never
 *     invents a router, a quote, or a fee — an unquoted fee reads "—"
 *     and a review without a supplied route is refused, not submitted.
 *   - SESSION IS IN-MEMORY ONLY. Disconnect clears it. Nothing about
 *     the session is persisted to storage.
 *
 * Additive only: defines exactly one global, window.HalexMSkillsLabWallet.
 * It redefines nothing. It never connects on load — every provider call
 * follows an explicit visitor tap. Load order: after
 * halex-m-skills-lab.js (see MERGE-MAP.md); it also works standalone.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dash(v) { return (v == null || v === '') ? '—' : v; }
  function isAddress(a) { return typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a); }

  var projectId = null; /* config slot: owner-supplied Reown project ID. Empty by default. Never invented. */
  var wcConnector = null; /* host-registered WalletConnect adapter (see setWalletConnectConnector). */
  var subscribers = [];

  var session = {
    connected: false, connector: null, address: null, chainId: null,
    connectedAt: null, lastReview: null, lastSubmitted: null, lastError: null
  };

  function notify() {
    subscribers.forEach(function (fn) { try { fn(getState()); } catch (e) { /* subscriber failure must not break state */ } });
    try {
      if (window.HalexMSkillsLab && window.HalexMSkillsLab.refreshToggles) window.HalexMSkillsLab.refreshToggles();
    } catch (e) { /* skills module absent: fine */ }
  }

  function walletConnectStatus() {
    if (!projectId) return { available: false, reason: 'WalletConnect needs a project ID (owner supplies it).' };
    if (!wcConnector) return { available: false, reason: 'WalletConnect project ID is configured, but no WalletConnect SDK is loaded in this page yet.' };
    return { available: true, reason: '' };
  }

  function liveState() {
    if (!session.connected) return 'paper';
    if (session.lastReview && !session.lastReview.confirmed) return 'connected-awaiting-confirmation';
    return 'live-ready';
  }

  function getState() {
    var wc = walletConnectStatus();
    return {
      mode: session.connected ? 'connected' : 'paper',
      liveState: liveState(),
      connected: session.connected,
      connector: session.connector,
      address: session.address,
      chainId: session.chainId,
      walletConnectAvailable: wc.available,
      walletConnectReason: wc.reason,
      hasReview: !!session.lastReview,
      reviewConfirmed: !!(session.lastReview && session.lastReview.confirmed),
      lastSubmitted: session.lastSubmitted,
      lastError: session.lastError
    };
  }

  function configure(opts) {
    if (opts && typeof opts === 'object' && typeof opts.reownProjectId === 'string') {
      projectId = opts.reownProjectId.trim() ? opts.reownProjectId.trim() : null;
    }
    notify();
    /* The ID value itself is never returned, logged, or rendered. */
    return { reownProjectIdPresent: !!projectId };
  }

  function setWalletConnectConnector(connector) {
    /* Host adapter contract: connect() -> Promise<{address, chainId}>,
     * request(payload) -> Promise<result>, disconnect() -> Promise<void>
     * (optional). Registered by the host page after it loads the
     * official Reown SDK; this package ships no SDK and no ID. */
    if (connector && typeof connector.connect === 'function' && typeof connector.request === 'function') {
      wcConnector = connector;
      notify();
      return true;
    }
    return false;
  }

  function injectedProvider() {
    try { return (typeof window !== 'undefined' && window.ethereum) ? window.ethereum : null; }
    catch (e) { return null; }
  }

  function markConnected(connectorName, address, chainId) {
    session.connected = true;
    session.connector = connectorName;
    session.address = address;
    session.chainId = chainId || null;
    session.connectedAt = new Date().toISOString();
    session.lastReview = null;
    session.lastError = null;
    notify();
    render();
    return { ok: true, address: address, chainId: session.chainId };
  }

  function fail(reason) {
    session.lastError = reason;
    notify();
    render();
    return { ok: false, reason: reason };
  }

  function connectInjected() {
    var provider = injectedProvider();
    if (!provider || typeof provider.request !== 'function') {
      return Promise.resolve(fail('No injected wallet found in this browser. Paper mode keeps working; connect a wallet app extension to use the injected path.'));
    }
    return provider.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
      if (!accounts || !accounts.length || !isAddress(accounts[0])) {
        return fail('The injected wallet returned no usable account. Nothing was connected.');
      }
      var address = accounts[0];
      return provider.request({ method: 'eth_chainId' }).then(function (chainId) {
        return markConnected('injected', address, typeof chainId === 'string' ? chainId : null);
      }, function () {
        return markConnected('injected', address, null);
      });
    }, function (err) {
      return fail('Injected-wallet connection was not completed' + (err && err.message ? ': ' + err.message : '.') + ' Paper mode keeps working.');
    });
  }

  function connectWalletConnect() {
    var wc = walletConnectStatus();
    if (!wc.available) return Promise.resolve(fail(wc.reason + ' Paper mode keeps working.'));
    return wcConnector.connect().then(function (result) {
      if (!result || !isAddress(result.address)) {
        return fail('WalletConnect returned no usable account. Nothing was connected.');
      }
      return markConnected('walletconnect', result.address, result.chainId || null);
    }, function (err) {
      return fail('WalletConnect connection was not completed' + (err && err.message ? ': ' + err.message : '.') + ' Paper mode keeps working.');
    });
  }

  function activeProvider() {
    if (!session.connected) return null;
    if (session.connector === 'injected') return injectedProvider();
    if (session.connector === 'walletconnect') return wcConnector;
    return null;
  }

  var reviewCounter = 0;
  function buildReview(input) {
    if (!input || typeof input !== 'object') return { ok: false, reason: 'No trade details supplied — nothing to review.' };
    if (!isAddress(input.tokenAddress)) return { ok: false, reason: 'Token address is not a valid address. Nothing was reviewed.' };
    var amount = Number(input.amount);
    if (!isFinite(amount) || amount <= 0) return { ok: false, reason: 'Amount must be a number greater than zero. Nothing was reviewed.' };
    var slippage = Number(input.slippagePct);
    if (!isFinite(slippage) || slippage < 0 || slippage > 100) return { ok: false, reason: 'Slippage must be between 0 and 100. Nothing was reviewed.' };
    var tx = null;
    if (input.tx !== undefined && input.tx !== null) {
      if (!input.tx || typeof input.tx !== 'object' || !isAddress(input.tx.to)) {
        return { ok: false, reason: 'The supplied swap route is incomplete (no valid destination). Nothing was reviewed.' };
      }
      tx = { to: input.tx.to, data: (typeof input.tx.data === 'string' ? input.tx.data : ''), value: (typeof input.tx.value === 'string' ? input.tx.value : '0x0') };
    }
    reviewCounter += 1;
    var review = {
      id: 'review-' + reviewCounter,
      tokenAddress: input.tokenAddress,
      amount: String(input.amount),
      slippagePct: slippage,
      /* Fees are never invented: only a caller-supplied quote figure is
       * shown; otherwise the fee reads "—". */
      estimatedFee: (input.estimatedFee !== undefined && input.estimatedFee !== null && String(input.estimatedFee) !== '') ? String(input.estimatedFee) : null,
      tx: tx, confirmed: false
    };
    session.lastReview = review;
    session.lastError = null;
    notify();
    render();
    return { ok: true, review: review };
  }

  function confirmTrade(reviewId, opts) {
    if (!session.connected) return { ok: false, reason: 'No visitor wallet connected. Connect your own wallet first — paper mode is the default.' };
    if (!session.lastReview || session.lastReview.id !== reviewId) return { ok: false, reason: 'No matching trade review is pending. Build a review first.' };
    if (!opts || opts.confirmed !== true) return { ok: false, reason: 'Explicit confirmation required: pass confirmed=true from the visitor\u2019s confirm tap. Nothing was confirmed.' };
    session.lastReview.confirmed = true;
    session.lastError = null;
    notify();
    render();
    return { ok: true, review: session.lastReview };
  }

  function sameTrade(a, b) {
    if (!a || !b) return false;
    return a.tokenAddress === b.tokenAddress && String(a.amount) === String(b.amount) &&
      Number(a.slippagePct) === Number(b.slippagePct) &&
      !!a.tx && !!b.tx && a.tx.to === b.tx.to && a.tx.data === b.tx.data && a.tx.value === b.tx.value;
  }

  function submitConfirmedTrade(reviewId, trade) {
    if (!session.connected) return Promise.resolve({ ok: false, reason: 'No visitor wallet connected. Nothing was submitted.' });
    if (!session.lastReview || session.lastReview.id !== reviewId) return Promise.resolve({ ok: false, reason: 'No matching confirmed review. Nothing was submitted.' });
    if (!session.lastReview.confirmed) return Promise.resolve({ ok: false, reason: 'This trade has not been explicitly confirmed. Confirm the exact trade first — nothing was submitted.' });
    if (!session.lastReview.tx) return Promise.resolve({ ok: false, reason: 'No swap route/quote supplied for this review. Nothing was submitted.' });
    if (!trade || !sameTrade(session.lastReview, trade)) return Promise.resolve({ ok: false, reason: 'The submitted trade does not match the confirmed review exactly. Nothing was submitted.' });
    var provider = activeProvider();
    if (!provider || typeof provider.request !== 'function') return Promise.resolve({ ok: false, reason: 'No wallet provider available to sign with. Nothing was submitted.' });
    var txParams = { from: session.address, to: session.lastReview.tx.to, data: session.lastReview.tx.data, value: session.lastReview.tx.value };
    var submittedReview = session.lastReview;
    /* One-shot confirmation: a confirmed review authorizes exactly one
     * submission. The flag clears before the provider call so a retry
     * cannot re-submit on the same confirmation. */
    session.lastReview.confirmed = false;
    return provider.request({ method: 'eth_sendTransaction', params: [txParams] }).then(function (result) {
      session.lastSubmitted = { reviewId: submittedReview.id, tokenAddress: submittedReview.tokenAddress, amount: submittedReview.amount, result: (typeof result === 'string' ? result : 'submitted') };
      session.lastReview = null;
      session.lastError = null;
      notify();
      render();
      return { ok: true, submitted: session.lastSubmitted };
    }, function (err) {
      session.lastError = 'The visitor wallet did not submit this trade' + (err && err.message ? ': ' + err.message : '.') + ' Nothing was moved by HALEX-M.';
      notify();
      render();
      return { ok: false, reason: session.lastError };
    });
  }

  function disconnect() {
    var provider = activeProvider();
    session.connected = false;
    session.connector = null;
    session.address = null;
    session.chainId = null;
    session.connectedAt = null;
    session.lastReview = null;
    session.lastSubmitted = null;
    session.lastError = null;
    notify();
    render();
    if (provider && typeof provider.disconnect === 'function') {
      try { var p = provider.disconnect(); if (p && typeof p.catch === 'function') p.catch(function () {}); } catch (e) { /* disconnect is best-effort */ }
    }
    return { ok: true };
  }

  function subscribe(fn) {
    if (typeof fn === 'function') subscribers.push(fn);
    return getState();
  }

  function reviewHTML() {
    var r = session.lastReview;
    if (!r) return '<p class="hm-sl-note">No trade review yet. Fill in a trade below and tap "Review this trade" — reviewing changes nothing and moves nothing.</p>';
    return '<div class="hm-sl-review">' +
      '<p><b>Review — check every line before confirming.</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Token</span><b>' + esc(r.tokenAddress) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Amount</span><b>' + esc(r.amount) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Slippage</span><b>' + esc(r.slippagePct) + '%</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Estimated fee</span><b>' + esc(dash(r.estimatedFee)) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Swap route</span><b>' + (r.tx ? esc(r.tx.to) : '— (no quote supplied)') + '</b></p>' +
      '<p class="hm-sl-note">' + (r.confirmed ? 'Confirmed by you. One submission is authorized for exactly this trade.' : 'Not confirmed yet. Nothing is signed until you tap "Confirm this exact trade".') + '</p></div>';
  }

  function buildPanelHTML() {
    var st = getState();
    var wc = walletConnectStatus();
    var wcBtn = wc.available
      ? '<button class="hm-sl-btn" type="button" data-hm-sl-wc>Connect with WalletConnect</button>'
      : '<button class="hm-sl-btn" type="button" disabled data-hm-sl-wc>Connect with WalletConnect</button>' +
        '<p class="hm-sl-note">' + esc(wc.reason) + ' The injected-wallet path and paper mode keep working.</p>';
    var submitted = st.lastSubmitted
      ? '<p class="hm-sl-note">Last submission (visitor wallet): token ' + esc(st.lastSubmitted.tokenAddress) + ', amount ' + esc(st.lastSubmitted.amount) + ', result ' + esc(st.lastSubmitted.result) + '.</p>'
      : '';
    return '<section class="hm-sl-wallet" aria-label="Visitor wallet panel">' +
      '<h3 class="hm-sl-diagram-title">Visitor wallet — paper first, your wallet only</h3>' +
      '<p class="hm-sl-alloc-row"><span>Mode</span><b>' + esc(st.liveState) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Connected address</span><b>' + esc(dash(st.address)) + '</b></p>' +
      '<p class="hm-sl-alloc-row"><span>Chain</span><b>' + esc(dash(st.chainId)) + '</b></p>' +
      '<p class="hm-sl-note">Paper mode is the default. HALEX-M holds no keys and never signs: signing happens in your own wallet, and only for a trade you confirmed line by line. No owner wallet is ever used here.</p>' +
      '<div class="hm-sl-wallet-btns">' +
      '<button class="hm-sl-btn hm-sl-btn-on" type="button" data-hm-sl-connect-injected>Connect injected wallet</button>' +
      wcBtn +
      '<button class="hm-sl-btn" type="button" data-hm-sl-disconnect' + (st.connected ? '' : ' disabled') + '>Disconnect</button>' +
      '</div>' +
      (st.lastError ? '<p class="hm-sl-note hm-sl-error">' + esc(st.lastError) + '</p>' : '') +
      '<div class="hm-sl-trade-form">' +
      '<label class="hm-sl-field" for="hm-sl-w-token">Token address (your trade)</label>' +
      '<input class="hm-sl-input" id="hm-sl-w-token" type="text" inputmode="text" autocomplete="off" placeholder="0x… (40 hex characters)">' +
      '<label class="hm-sl-field" for="hm-sl-w-amount">Amount</label>' +
      '<input class="hm-sl-input" id="hm-sl-w-amount" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 0.01">' +
      '<label class="hm-sl-field" for="hm-sl-w-slippage">Slippage (%)</label>' +
      '<input class="hm-sl-input" id="hm-sl-w-slippage" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 1">' +
      '<p class="hm-sl-note">Fees read "—" unless a quote supplies one. A trade without a supplied swap route is refused, not submitted.</p>' +
      '<button class="hm-sl-btn" type="button" data-hm-sl-review>Review this trade</button>' +
      '</div>' + reviewHTML() +
      '<div class="hm-sl-wallet-btns">' +
      '<button class="hm-sl-btn" type="button" data-hm-sl-confirm' + (st.hasReview && st.connected && !st.reviewConfirmed ? '' : ' disabled') + '>Confirm this exact trade</button>' +
      '<button class="hm-sl-btn hm-sl-btn-on" type="button" data-hm-sl-submit' + (st.hasReview && st.reviewConfirmed ? '' : ' disabled') + '>Sign and submit in my wallet</button>' +
      '</div>' + submitted +
      '</section>';
  }

  function render() {
    if (typeof document === 'undefined') return null;
    var root = document.getElementById('hm-sl-wallet');
    if (!root) return null;
    root.innerHTML = buildPanelHTML();
    wirePanel(root);
    return root;
  }

  function wirePanel(root) {
    if (!root || !root.querySelectorAll) return;
    function on(attr, fn) {
      var els = root.querySelectorAll('[' + attr + ']');
      for (var i = 0; i < els.length; i++) {
        (function (el) { el.addEventListener('click', fn); })(els[i]);
      }
    }
    on('data-hm-sl-connect-injected', function () { connectInjected(); });
    on('data-hm-sl-wc', function () { connectWalletConnect(); });
    on('data-hm-sl-disconnect', function () { disconnect(); });
    on('data-hm-sl-review', function () {
      var t = document.getElementById('hm-sl-w-token');
      var a = document.getElementById('hm-sl-w-amount');
      var s = document.getElementById('hm-sl-w-slippage');
      var res = buildReview({
        tokenAddress: t ? t.value.trim() : '',
        amount: a ? a.value.trim() : '',
        slippagePct: s ? s.value.trim() : ''
      });
      if (!res.ok) { session.lastError = res.reason; notify(); render(); }
    });
    on('data-hm-sl-confirm', function () {
      if (session.lastReview) {
        var res = confirmTrade(session.lastReview.id, { confirmed: true });
        if (!res.ok) { session.lastError = res.reason; notify(); render(); }
      }
    });
    on('data-hm-sl-submit', function () {
      if (session.lastReview) {
        var r = session.lastReview;
        submitConfirmedTrade(r.id, { tokenAddress: r.tokenAddress, amount: r.amount, slippagePct: r.slippagePct, tx: r.tx });
      }
    });
  }

  var api = {
    version: '2026-11-01-skills-lab-wallet',
    configure: configure, getConfig: function () { return { reownProjectIdPresent: !!projectId }; },
    setWalletConnectConnector: setWalletConnectConnector,
    getState: getState, subscribe: subscribe,
    connectInjected: connectInjected, connectWalletConnect: connectWalletConnect,
    buildReview: buildReview, confirmTrade: confirmTrade,
    submitConfirmedTrade: submitConfirmedTrade, disconnect: disconnect,
    buildPanelHTML: buildPanelHTML, render: render
  };
  window.HalexMSkillsLabWallet = api;

  /* Never auto-connect: render the panel only. Every provider call
   * follows an explicit visitor tap on a panel button. */
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
    else render();
  }
})();
