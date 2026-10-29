/*
 * HALEX-M AI panel module.
 * HALEX-M is Advanced Blockchain Intelligence: AI-layered blockchain
 * trading intelligence, powerful research tools, trading and market feeds.
 * It is the Swiss Army knife of blockchain and blockchain AI.
 *
 * Independence rule: this panel is fully independent and crypto-specialized.
 * It works with no connection to HALEX-AI, including when HALEX-M ships
 * as an APK with its own AI on device.
 *
 * Bridges:
 * - HALEX-AI bridge: off by default, config-driven. Used only where
 *   communication is needed, the named case being a joint-thinking
 *   request that needs ZINIUM and Braintree thinking together.
 * - Assistant socket: socket-style channel to the assistant AI (Allen).
 *   Endpoint is empty by default and the honest state is not connected.
 * No invented endpoints. No fake live answers over either bridge.
 *
 * Hard limits: advisory only. This panel never trades, never signs,
 * and never moves funds.
 */
(function (global) {
  'use strict';

  var KB = [
    {
      keys: ['token dna', 'dna', 'scorecard'],
      topic: 'Token DNA',
      text: 'Token DNA is the profile on every token scorecard in HALEX-M. It has 7 fields: Type, Birth, Deployer lineage, Tracebacks, Custody, Family, and Use case. A field that has not been read is reported as not read. It is never filled in or guessed.'
    },
    {
      keys: ['type'],
      topic: 'Token DNA: Type',
      text: 'Type says what kind of token it is, for example a memecoin, a utility token, an AI token, a DeFi token, or an impersonation-risk class token.'
    },
    {
      keys: ['birth', 'minted', 'launchpad', 'pool type'],
      topic: 'Token DNA: Birth',
      text: 'Birth says how a token was minted: the launchpad or venue, the pool type, the mint mechanics, and the birth time.'
    },
    {
      keys: ['deployer', 'lineage', 'deployer lineage', 'serial', 'prior launches'],
      topic: 'Token DNA: Deployer lineage',
      text: 'Deployer lineage is the history of the wallet that minted the token: wallet age, prior launches, prior outcomes and rug rate, and any serial-seed launch-kit fingerprint. A deployer with a long line of short-lived launches is a warning sign, not proof on its own.'
    },
    {
      keys: ['traceback', 'tracebacks', 'funding', 'funded'],
      topic: 'Token DNA: Tracebacks',
      text: 'Tracebacks follow the funding lineage of the deployer wallet: who funded it and the funding-graph hops behind it. Fresh funding from a known bad source matters more than wallet age alone.'
    },
    {
      keys: ['custody', 'burned', 'locked', 'lp', 'liquidity pool'],
      topic: 'Token DNA: Custody',
      text: 'Custody says who controls the liquidity pool. Burned LP means the liquidity can never be pulled. Locked LP means it is safer for a set time, until the lock ends. Deployer-held LP means the deployer can pull it at will, and that is a hard warning.'
    },
    {
      keys: ['copycat', 'family', 'siblings', 'same name', 'swarm', 'respin'],
      topic: 'Token DNA: Family and copycats',
      text: 'Family is the copycat census: same-name siblings, whether this token is the original or a respin, and any cross-chain swarm using the same name. Many same-name copies launched close together is a swarm pattern and a risk sign.'
    },
    {
      keys: ['use case', 'purpose', 'utility claim'],
      topic: 'Token DNA: Use case',
      text: 'Use case is the claimed purpose taken from a website, socials, or description if one is found. If none is found, the field says none found.'
    },
    {
      keys: ['liquidity', 'liq', 'pool size'],
      topic: 'Liquidity basics',
      text: 'Liquidity is the pool that lets people buy and sell. Thin liquidity means small trades move the price a lot and exits can fail or slip badly. Liquidity size alone proves nothing: check custody too, because deployer-held liquidity can be pulled at will.'
    },
    {
      keys: ['apex', 'apex2', 'apex²', 'research', 'watched'],
      topic: 'APEX² Research',
      text: 'APEX² Research is the watched-list research lab inside HALEX-M. When you pick a token to watch, APEX² Research builds its report card, including the Token DNA profile, and keeps reviewing it.'
    },
    {
      keys: ['chaintarium', 'cosmos', 'planet', 'towers', '3d'],
      topic: 'Chaintarium',
      text: 'Chaintarium is the 3D cosmos inside HALEX-M. Chains are planets, tokens are towers, and wallets are square buildings. Surface scene values are a stylized deterministic model and are labelled as such in the app. Live reads come through search and the Cosmos Tracker.'
    },
    {
      keys: ['wallet connect', 'walletconnect', 'connect wallet', 'seed phrase', 'private key', 'sign'],
      topic: 'Wallet connect safety',
      text: 'Wallet connect in HALEX-M is read-only: it shares the public address only, and nothing is signed or sent. WalletConnect pairing activates only once HALEX own project ID is configured. The app never asks a user for a project ID, a seed phrase, or a private key. Never share those anywhere.'
    },
    {
      keys: ['halex-ai', 'halex ai', 'scope', 'difference', 'general ai'],
      topic: 'HALEX-M scope vs HALEX-AI scope',
      text: 'HALEX-M is the crypto-specialized AI: blockchain trading intelligence, research tools, and market feeds, and it runs fully on its own. HALEX-AI is the general AI for any field. HALEX-M calls HALEX-AI only where communication is needed, for example a joint-thinking request that needs ZINIUM and Braintree thinking together. That bridge is off by default.'
    },
    {
      keys: ['halex-m', 'halex m', 'what is halex', 'preview', 'token minted'],
      topic: 'HALEX-M basics',
      text: 'HALEX-M is Advanced Blockchain Intelligence from HALEX. Public preview: https://appsthatpay.github.io/halex-web/halex-m/ . Canonical spots: @HALEXApp on X, the HALEX-M page above, and Linktree betasyndicate.com. No official HALEX token is minted yet.'
    },
    {
      keys: ['trade', 'buy', 'sell', 'swap', 'execute'],
      topic: 'Advisory only',
      text: 'This panel is advisory only. It explains, summarizes, and narrates research. It never trades, never signs, and never moves funds.'
    }
  ];

  var config = {
    halexAiBridge: { enabled: false, endpoint: '' },
    assistantSocket: { enabled: false, endpoint: '', state: 'not connected' }
  };

  var assistantSocket = null;

  var DNA_FIELDS = [
    { key: 'type', label: 'Type' },
    { key: 'birth', label: 'Birth' },
    { key: 'deployerLineage', label: 'Deployer lineage' },
    { key: 'tracebacks', label: 'Tracebacks' },
    { key: 'custody', label: 'Custody' },
    { key: 'family', label: 'Family' },
    { key: 'useCase', label: 'Use case' }
  ];

  function isPresent(v) {
    return v !== undefined && v !== null && String(v).trim() !== '';
  }

  function custodyNote(value) {
    var v = String(value).toLowerCase();
    if (v.indexOf('burn') !== -1) return 'Burned LP means the liquidity can never be pulled.';
    if (v.indexOf('lock') !== -1) return 'Locked LP means it is safer for a set time, until the lock ends.';
    if (v.indexOf('deployer') !== -1 || v.indexOf('held') !== -1) return 'Deployer-held LP means the deployer can pull it at will. Hard warning.';
    return '';
  }

  function explainToken(dna) {
    if (!dna || typeof dna !== 'object' || Object.keys(dna).length === 0) {
      return 'No token data yet: no token data was handed to the panel yet. Select a token in HALEX-M or hand the panel a token object, and it will explain only the fields that were actually read.';
    }
    var lines = [];
    var heading = 'Token explanation';
    if (isPresent(dna.symbol)) heading += ' for ' + String(dna.symbol);
    lines.push(heading + ':');
    if (isPresent(dna.symbol)) lines.push('Symbol: ' + String(dna.symbol));
    if (isPresent(dna.chain)) lines.push('Chain: ' + String(dna.chain));
    var missing = [];
    DNA_FIELDS.forEach(function (field) {
      if (isPresent(dna[field.key])) {
        lines.push(field.label + ': ' + String(dna[field.key]));
        if (field.key === 'custody') {
          var note = custodyNote(dna[field.key]);
          if (note) lines.push('Custody note: ' + note);
        }
      } else {
        missing.push(field.label);
        lines.push(field.label + ': not read in this view');
      }
    });
    if (!isPresent(dna.chain)) {
      lines.push('Chain: not read in this view');
    }
    if (missing.length) {
      lines.push('Not read in this view: ' + missing.join(', ') + '. Those fields were not read, so nothing is claimed about them.');
    } else {
      lines.push('All 7 Token DNA fields were present in the data handed to the panel.');
    }
    lines.push('This is advisory only. The panel never trades, never signs, and never moves funds.');
    return lines.join('\n');
  }

  function summarizeFeed(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return 'Feed summary: no feed items handed to the panel yet. When the host app hands over feed items, the panel counts them by chain and by kind and lists them.';
    }
    var byChain = {};
    var byKind = {};
    items.forEach(function (item) {
      var chain = item && isPresent(item.chain) ? String(item.chain) : 'unknown chain';
      var kind = item && isPresent(item.kind) ? String(item.kind) : 'unknown kind';
      byChain[chain] = (byChain[chain] || 0) + 1;
      byKind[kind] = (byKind[kind] || 0) + 1;
    });
    var lines = [];
    lines.push('Feed summary: ' + items.length + (items.length === 1 ? ' item' : ' items'));
    lines.push('By chain:');
    Object.keys(byChain).sort().forEach(function (k) { lines.push('  ' + k + ': ' + byChain[k]); });
    lines.push('By kind:');
    Object.keys(byKind).sort().forEach(function (k) { lines.push('  ' + k + ': ' + byKind[k]); });
    lines.push('Listing:');
    items.forEach(function (item) {
      if (!item) { lines.push('  - (empty item)'); return; }
      var parts = [];
      if (isPresent(item.symbol)) parts.push(String(item.symbol));
      if (isPresent(item.chain)) parts.push('on ' + String(item.chain));
      if (isPresent(item.kind)) parts.push('[' + String(item.kind) + ']');
      if (isPresent(item.note)) parts.push(String(item.note));
      lines.push('  - ' + (parts.length ? parts.join(' ') : '(no details)'));
    });
    return lines.join('\n');
  }

  function narrateResearch(findings) {
    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return 'APEX² Research: no findings handed to the panel yet. When the host app hands over findings, the panel narrates them here with their severity.';
    }
    var lines = [];
    lines.push('APEX² Research narrative: ' + findings.length + (findings.length === 1 ? ' finding' : ' findings'));
    findings.forEach(function (f, i) {
      if (!f) { lines.push((i + 1) + '. (empty finding)'); return; }
      var title = isPresent(f.title) ? String(f.title) : 'Untitled finding';
      var severity = isPresent(f.severity) ? String(f.severity) : 'not rated';
      var detail = isPresent(f.detail) ? String(f.detail) : 'No detail provided.';
      lines.push((i + 1) + '. [' + severity + '] ' + title + ': ' + detail);
    });
    lines.push('Advisory only: this narrative reports what was handed to the panel. It does not invent findings.');
    return lines.join('\n');
  }

  function answerLocal(text) {
    var fallback = 'I am the HALEX-M AI panel. I run fully on my own, with no HALEX-AI connection needed. I can explain Token DNA (Type, Birth, Deployer lineage, Tracebacks, Custody, Family, Use case), custody and copycat risk, liquidity basics, APEX² Research, Chaintarium, and wallet connect safety. I can also explain a selected token, summarize feed items, and narrate APEX² findings when the host app hands that data over. I am advisory only: I never trade, never sign, and never move funds. Ask me about any of those topics.';
    if (!text || String(text).trim() === '') return fallback;
    var q = String(text).toLowerCase();
    var best = null;
    var bestScore = 0;
    KB.forEach(function (entry) {
      var score = 0;
      entry.keys.forEach(function (k) { if (q.indexOf(k.toLowerCase()) !== -1) score += k.length; });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    if (best) return best.topic + ': ' + best.text;
    return fallback;
  }

  function buildJointThinkingEnvelope(question, context) {
    return {
      type: 'zinium_braintree_joint_thinking',
      version: 1,
      question: question,
      context: context || {},
      expects: 'answer + provenance'
    };
  }

  function askHalexAI(question, context) {
    var bridge = config.halexAiBridge || {};
    if (!bridge.enabled || !bridge.endpoint) {
      return {
        ok: false,
        state: 'not_configured',
        message: 'The HALEX-AI bridge is off by default and is not configured. HALEX-M runs on its own. The bridge is used only for joint ZINIUM + Braintree thinking where communication is needed, and no answer is fabricated while it is off.'
      };
    }
    var envelope = buildJointThinkingEnvelope(question, context);
    if (typeof fetch !== 'function') {
      return Promise.resolve({ ok: false, state: 'error', message: 'Fetch is not available in this environment, so the HALEX-AI bridge call could not be made.' });
    }
    return fetch(bridge.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    }).then(function (res) {
      return res.json();
    }).then(function (data) {
      return { ok: true, state: 'answered', answer: data, provenance: data && data.provenance ? data.provenance : 'halex-ai-bridge' };
    }).catch(function (err) {
      return { ok: false, state: 'error', message: 'HALEX-AI bridge call failed: ' + (err && err.message ? err.message : String(err)) };
    });
  }

  function assistantStatus() {
    var sock = config.assistantSocket || {};
    if (!sock.endpoint) {
      return { state: 'not connected', message: 'No assistant endpoint is configured, so the socket to the assistant AI (Allen) is not connected. This is the default and honest state. HALEX-M still runs fully on its own.' };
    }
    return { state: sock.state || 'not connected', message: 'Assistant socket state: ' + (sock.state || 'not connected') + '.' };
  }

  function connectAssistant() {
    var sock = config.assistantSocket || {};
    if (!sock.endpoint) {
      config.assistantSocket.state = 'not connected';
      return { ok: false, state: 'not connected', message: 'No assistant endpoint is configured, so no socket was opened. Configure an endpoint in HalexMAI.config.assistantSocket first.' };
    }
    if (typeof WebSocket !== 'function') {
      return { ok: false, state: 'error', message: 'WebSocket is not available in this environment, so the assistant socket could not be opened.' };
    }
    try {
      assistantSocket = new WebSocket(sock.endpoint);
    } catch (err) {
      return { ok: false, state: 'error', message: 'Assistant socket failed to open: ' + (err && err.message ? err.message : String(err)) };
    }
    config.assistantSocket.enabled = true;
    config.assistantSocket.state = 'connecting';
    assistantSocket.onopen = function () { config.assistantSocket.state = 'connected'; };
    assistantSocket.onclose = function () { config.assistantSocket.state = 'not connected'; assistantSocket = null; };
    assistantSocket.onerror = function () { config.assistantSocket.state = 'error'; };
    return { ok: true, state: 'connecting', message: 'Assistant socket opening to the configured endpoint.' };
  }

  function sendToAssistant(text) {
    if (!assistantSocket || (typeof WebSocket !== 'undefined' && assistantSocket.readyState !== WebSocket.OPEN)) {
      return { ok: false, state: 'not connected', message: 'The assistant socket is not open, so nothing was sent. No message is fabricated or queued as if it were delivered.' };
    }
    assistantSocket.send(JSON.stringify({ type: 'assistant_message', text: text, provenance: 'halex-m-ai-panel' }));
    return { ok: true, state: 'sent', message: 'Message sent over the assistant socket.' };
  }

  function bridgeStatus() {
    var ai = config.halexAiBridge || {};
    var sock = config.assistantSocket || {};
    return {
      independence: 'HALEX-M AI runs on its own, no HALEX-AI connection needed',
      halexAiBridge: {
        enabled: !!ai.enabled,
        endpoint: ai.endpoint || '',
        state: ai.enabled && ai.endpoint ? 'configured' : 'not_configured'
      },
      assistantSocket: {
        enabled: !!sock.enabled,
        endpoint: sock.endpoint || '',
        state: sock.endpoint ? (sock.state || 'not connected') : 'not connected'
      }
    };
  }

  var api = {
    KB: KB,
    config: config,
    explainToken: explainToken,
    summarizeFeed: summarizeFeed,
    narrateResearch: narrateResearch,
    answerLocal: answerLocal,
    buildJointThinkingEnvelope: buildJointThinkingEnvelope,
    askHalexAI: askHalexAI,
    assistantStatus: assistantStatus,
    connectAssistant: connectAssistant,
    sendToAssistant: sendToAssistant,
    bridgeStatus: bridgeStatus
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.HalexMAI = api;

  // DOM part, browser only.
  if (typeof document !== 'undefined') {
    var mount = function () {
      if (document.getElementById('halex-m-ai-button')) return;
      var styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = 'halex-m-ai.css';
      styleLink.id = 'halex-m-ai-css';
      if (!document.getElementById('halex-m-ai-css')) document.head.appendChild(styleLink);

      var btn = document.createElement('button');
      btn.id = 'halex-m-ai-button';
      btn.className = 'halex-m-ai-button';
      btn.type = 'button';
      btn.textContent = 'HALEX-M AI';
      document.body.appendChild(btn);

      var panel = document.createElement('div');
      panel.id = 'halex-m-ai-panel';
      panel.className = 'halex-m-ai-panel';
      panel.hidden = true;
      panel.innerHTML =
        '<div class="halex-m-ai-header"><strong>HALEX-M AI</strong>' +
        '<button type="button" class="halex-m-ai-close" aria-label="Close">x</button></div>' +
        '<div class="halex-m-ai-status"></div>' +
        '<div class="halex-m-ai-output" aria-live="polite"></div>' +
        '<div class="halex-m-ai-actions">' +
        '<button type="button" data-action="explain">Explain selected token</button>' +
        '<button type="button" data-action="feed">Summarize feed</button>' +
        '<button type="button" data-action="findings">APEX² findings</button>' +
        '</div>' +
        '<form class="halex-m-ai-form"><input type="text" class="halex-m-ai-input" placeholder="Ask about Token DNA, custody, Chaintarium..." />' +
        '<button type="submit">Ask</button></form>' +
        '<p class="halex-m-ai-note">Advisory only. Never trades, never signs, never moves funds.</p>';
      document.body.appendChild(panel);

      var statusEl = panel.querySelector('.halex-m-ai-status');
      var outputEl = panel.querySelector('.halex-m-ai-output');
      function renderStatus() {
        var s = bridgeStatus();
        statusEl.textContent = s.independence + ' | HALEX-AI bridge: ' + s.halexAiBridge.state + ' | Assistant socket: ' + s.assistantSocket.state;
      }
      function show(text) { outputEl.textContent = text; }
      function hostData() { return (typeof window !== 'undefined' && window.HalexMAIData) || {}; }

      btn.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        renderStatus();
        if (!panel.hidden && !outputEl.textContent) show(answerLocal(''));
      });
      panel.querySelector('.halex-m-ai-close').addEventListener('click', function () { panel.hidden = true; });
      panel.querySelectorAll('[data-action]').forEach(function (b) {
        b.addEventListener('click', function () {
          var data = hostData();
          var action = b.getAttribute('data-action');
          if (action === 'explain') show(explainToken(data.selectedToken));
          if (action === 'feed') show(summarizeFeed(data.feed));
          if (action === 'findings') show(narrateResearch(data.findings));
          renderStatus();
        });
      });
      panel.querySelector('.halex-m-ai-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var input = panel.querySelector('.halex-m-ai-input');
        show(answerLocal(input.value));
      });
      renderStatus();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
