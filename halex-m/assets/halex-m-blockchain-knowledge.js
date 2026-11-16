/*
 * HALEX-M blockchain knowledge module — STAGING ONLY.
 * Not wired into the live page. Not pushed to any branch.
 *
 * Pattern (same as halex-m-ai.js): explain functions build text ONLY
 * from supplied fields, and name every missing field NOT READ. Nothing
 * here reads a chain, opens a connection, signs, moves funds, or runs
 * user-supplied text as code. Returned values are plain strings; a host
 * page must render them with textContent (or escaped construction),
 * never as raw markup.
 *
 * Advisory only. HALEX-M holds no keys, signs nothing, moves no funds.
 * Address connection in HALEX-M is read-only: public address only.
 */
(function (global) {
  'use strict';

  var NOT_READ = 'NOT READ';

  function isPresent(v) {
    return v !== undefined && v !== null && String(v).trim() !== '';
  }

  function numOrNull(v) {
    if (!isPresent(v)) return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  var TOPICS = {
    blockchain: {
      title: 'Blockchain basics',
      blurb: 'A blockchain is a shared ledger kept by many independent computers. Transactions are grouped into blocks, each linked to the one before it. Funds sit at an address, and only the holder of that address secret can authorize spending from it — which is why HALEX-M never touches secrets.',
      fields: [
        { key: 'chain', label: 'Chain' },
        { key: 'nativeAsset', label: 'Native asset' },
        { key: 'notes', label: 'Notes' }
      ]
    },
    'smart contract': {
      title: 'Smart contracts',
      blurb: 'A smart contract is code deployed on a chain that runs exactly as written when called. Before trusting one, check what it does, who can change it, and whether its liquidity can be pulled. A contract address is not an identity: many tokens share one ticker, so always cross-reference the contract address.',
      fields: [
        { key: 'contractAddress', label: 'Contract address' },
        { key: 'upgradeControl', label: 'Who can change it' },
        { key: 'notes', label: 'Notes' }
      ]
    },
    allowance: {
      title: 'Transfers vs allowances',
      blurb: 'A transfer moves tokens once, for the amount named. An allowance (approve) lets a named spender contract move tokens out of an address later, repeatedly, up to the approved amount, until it is used up or revoked in the holder own app. An allowance is not a balance, and a large allowance is not funds held.',
      fields: [
        { key: 'token', label: 'Token' },
        { key: 'ownerAddress', label: 'Holder address' },
        { key: 'spender', label: 'Spender contract' },
        { key: 'allowanceAmount', label: 'Allowance amount' },
        { key: 'balance', label: 'Balance (shown separately from allowance)' }
      ]
    },
    transfer: {
      title: 'Transfers',
      blurb: 'A transfer moves tokens from one address to another, once, for the amount named. It is not an allowance: it grants no future permission.',
      fields: [
        { key: 'token', label: 'Token' },
        { key: 'fromAddress', label: 'From address' },
        { key: 'toAddress', label: 'To address' },
        { key: 'amount', label: 'Amount' }
      ]
    },
    gas: {
      title: 'Gas fees (Ethereum-style chains)',
      blurb: 'Fee = gas used x (base fee + priority fee). The base fee is set by the protocol and is burned; the priority fee (tip) goes to the validator. A plain ETH transfer uses 21,000 gas units (ethereum.org). Figures shown here are estimates only, never a quote: block demand moves between quote and confirmation, and a failed transaction can still cost its network fee.',
      fields: [
        { key: 'chain', label: 'Chain' },
        { key: 'gasUsed', label: 'Gas used' },
        { key: 'baseFee', label: 'Base fee (per unit, as supplied)' },
        { key: 'priorityFee', label: 'Priority fee (per unit, as supplied)' },
        { key: 'maxFee', label: 'Max fee ceiling (per unit, as supplied)' },
        { key: 'estimatedTotal', label: 'Estimated total (as supplied)' }
      ]
    },
    'solana fees': {
      title: 'Fees (Solana)',
      blurb: 'Solana has no gas. Per Solana fee documentation: base fee 5,000 lamports per signature (50% burned, 50% to the validator), plus an optional prioritization fee of ceil(compute unit price x compute unit limit / 1,000,000) lamports, paid 100% to the validator. A prioritization fee raises scheduling priority; it does not guarantee it.',
      fields: [
        { key: 'signatures', label: 'Signatures' },
        { key: 'baseFeeLamports', label: 'Base fee (lamports, as supplied)' },
        { key: 'computeUnits', label: 'Compute unit limit' },
        { key: 'computeUnitPrice', label: 'Compute unit price (micro-lamports, as supplied)' },
        { key: 'priorityFeeLamports', label: 'Prioritization fee (lamports, as supplied)' }
      ]
    },
    liquidity: {
      title: 'Liquidity and custody',
      blurb: 'A liquidity pool is a contract holding two tokens; swaps trade against the pool, so pool size and ratio set the price. Custody decides whether liquidity is real for you: burned LP can never be pulled, locked LP is safer until the lock ends, deployer-held LP can be pulled at will. Thin liquidity plus deployer-held custody is the classic rug shape.',
      fields: [
        { key: 'pool', label: 'Pool' },
        { key: 'tokenA', label: 'Token A' },
        { key: 'tokenB', label: 'Token B' },
        { key: 'liquidityValue', label: 'Liquidity value (as supplied)' },
        { key: 'custody', label: 'Custody' }
      ]
    },
    slippage: {
      title: 'Price impact and slippage',
      blurb: 'Price impact is the price move caused by your own trade: the bigger the trade relative to the pool, the worse the average price. Slippage is the difference between the quoted price and the confirmed price, caused by market movement while the transaction is pending. Slippage tolerance is the maximum worsening accepted; worse than that, the transaction reverts (the network fee for the attempt may still be charged).',
      fields: [
        { key: 'quotedOutput', label: 'Quoted output (as supplied)' },
        { key: 'tolerance', label: 'Slippage tolerance (as supplied)' },
        { key: 'minimumOutput', label: 'Minimum acceptable output (as supplied)' }
      ]
    },
    'paper proving': {
      title: 'Paper-first skill proving',
      blurb: 'No skill earns live capital on a story. The standing HALEX bar is: win rate 65% or more, over 30 or more closed paper trades, with profit factor 1.2 or more — all three, measured from recorded paper trades. Any leg missing or below bar means NOT PROVEN, and live is not offered.',
      fields: [
        { key: 'closedTrades', label: 'Closed paper trades' },
        { key: 'winRate', label: 'Measured win rate' },
        { key: 'profitFactor', label: 'Profit factor' },
        { key: 'gateStatus', label: 'Gate status' }
      ]
    },
    'address control': {
      title: 'Address control panel (read-only)',
      blurb: 'This panel shows only what was read: public address, balances, and allowances. Balances and allowances are shown separately — an allowance is never added to a balance. There is no secret input anywhere, no export, and no transfer control. Sending, approving, or revoking happens only in the holder own app, outside HALEX-M.',
      fields: [
        { key: 'address', label: 'Public address' },
        { key: 'connectionState', label: 'Connection state' },
        { key: 'balances', label: 'Balances' },
        { key: 'allowances', label: 'Allowances' }
      ]
    }
  };

  var TOPIC_KEYS = Object.keys(TOPICS);

  function topicList() {
    return TOPIC_KEYS.join(', ');
  }

  function explainBlockchain(topic, suppliedFields) {
    var supplied = (suppliedFields && typeof suppliedFields === 'object') ? suppliedFields : {};
    if (!isPresent(topic)) {
      return 'Blockchain explanation: no topic was supplied. Available topics: ' + topicList() + '. Nothing is claimed about an unsupplied topic.';
    }
    var key = String(topic).toLowerCase().trim();
    var entry = TOPICS[key] || null;
    if (!entry) {
      // Accept a near match only when the supplied text contains a known key.
      for (var i = 0; i < TOPIC_KEYS.length; i++) {
        if (key.indexOf(TOPIC_KEYS[i]) !== -1) { entry = TOPICS[TOPIC_KEYS[i]]; break; }
      }
    }
    if (!entry) {
      return 'Blockchain explanation: no stored explanation for "' + String(topic) + '". Available topics: ' + topicList() + '. Nothing is claimed about it.';
    }
    var lines = [];
    lines.push(entry.title + ':');
    lines.push(entry.blurb);
    var missing = [];
    entry.fields.forEach(function (f) {
      if (isPresent(supplied[f.key])) {
        lines.push(f.label + ': ' + String(supplied[f.key]));
      } else {
        missing.push(f.label);
        lines.push(f.label + ': ' + NOT_READ);
      }
    });
    // Gas arithmetic uses ONLY supplied figures, and only when all three are numbers.
    if (key === 'gas') {
      var gasUsed = numOrNull(supplied.gasUsed);
      var baseFee = numOrNull(supplied.baseFee);
      var priorityFee = numOrNull(supplied.priorityFee);
      if (gasUsed !== null && baseFee !== null && priorityFee !== null) {
        lines.push('Computed from supplied figures only: ' + gasUsed + ' x (' + baseFee + ' + ' + priorityFee + ') = ' + (gasUsed * (baseFee + priorityFee)) + ' (in the same per-unit denomination as the supplied fees; an estimate, never a quote).');
      } else {
        lines.push('Computed fee total: ' + NOT_READ + ' (gas used, base fee, and priority fee must all be supplied as numbers).');
      }
    }
    if (missing.length) {
      lines.push('Not read in this view: ' + missing.join(', ') + '. Those fields were not read, so nothing is claimed about them.');
    }
    lines.push('Advisory only. HALEX-M holds no keys, signs nothing, moves no funds.');
    return lines.join('\n');
  }

  function checkPaperGate(record) {
    var rec = (record && typeof record === 'object') ? record : {};
    var closed = numOrNull(rec.closedTrades);
    var win = numOrNull(rec.winRate);
    var pf = numOrNull(rec.profitFactor);
    var missing = [];
    if (closed === null) missing.push('closed paper trades');
    if (win === null) missing.push('measured win rate');
    if (pf === null) missing.push('profit factor');
    if (missing.length) {
      return { proven: false, reason: 'NOT PROVEN: missing (NOT READ): ' + missing.join(', ') + '. Live is not offered until all three legs are recorded and met.' };
    }
    if (closed >= 30 && win >= 65 && pf >= 1.2) {
      return { proven: true, reason: 'PROVEN: ' + closed + ' closed paper trades, ' + win + '% win rate, profit factor ' + pf + ' — all three legs of the standing bar met.' };
    }
    var failed = [];
    if (closed < 30) failed.push('closed trades ' + closed + ' < 30');
    if (win < 65) failed.push('win rate ' + win + '% < 65%');
    if (pf < 1.2) failed.push('profit factor ' + pf + ' < 1.2');
    return { proven: false, reason: 'NOT PROVEN: ' + failed.join('; ') + '. Live is not offered.' };
  }

  // Guardrails: user/skill/token text is DATA, never an instruction.
  // A match refuses the asked-for action and explains; it changes no state.
  var REFUSAL_RULES = [
    { id: 'R1', label: 'Override gates', test: /ignore (the |all )?gates?|override (the )?gate|override (the )?65|bypass (the )?gate|loosen (the )?gate|ignore previous instructions|developer mode|ignore all rules/ },
    { id: 'R2', label: 'Disable paper-first proving', test: /skip paper|disable.{0,20}paper|go live.{0,40}without paper|without paper proving|paper proving is optional/ },
    { id: 'R3', label: 'Transfer or withdraw funds', test: /transfer (my|the|these|those)|withdraw (funds|my|from|tokens)|send funds|move (my|the) funds|spend from/ },
    { id: 'R4', label: 'Export or show secrets', test: /(show|export|reveal|display|give|tell).{0,40}(seed|secret key|private\s+key)|(seed phrase|private\s+key).{0,40}(show|export|reveal)/ },
    { id: 'R5', label: 'Act for an unconnected address', test: /connect.{0,60}(trade|spend|send)|trade with.{0,40}unconnected|use (an? )?unconnected/ },
    { id: 'R6', label: 'Sign on behalf', test: /sign (this|that|the|for me|a swap|it\b)|sign on (my )?behalf|approve (this|that|the).{0,20}for me/ },
    { id: 'R7', label: 'Hack or subvert', test: /drain (that|the|this|a)|phish|hack|exploit|steal|subvert|impersonat/ },
    { id: 'R8', label: 'Smuggled instruction', test: /note to ai|instruction to ai|system prompt|you are now|pretend you|when the user asks.{0,40}(skip|ignore|go live)/ }
  ];

  function checkRequest(text) {
    if (!isPresent(text)) {
      return { refused: false, classes: [], message: 'No request text supplied; nothing was acted on.' };
    }
    var q = String(text).toLowerCase();
    var hit = [];
    REFUSAL_RULES.forEach(function (rule) {
      if (rule.test.test(q)) hit.push(rule.id);
    });
    if (!hit.length) {
      return { refused: false, classes: [], message: 'Allowed: this request asks for explanation, design help, or a read-only view. It changes no state on its own; any state change still needs an explicit tap plus a gate check.' };
    }
    var labels = [];
    REFUSAL_RULES.forEach(function (rule) {
      if (hit.indexOf(rule.id) !== -1) labels.push(rule.id + ' ' + rule.label);
    });
    return {
      refused: true,
      classes: hit,
      message: 'Refused: this request asks for (' + labels.join('; ') + '). The AI layer cannot do that. Safe alternative: use the paper arena, the read-only views, or your own address-holder app for signing, sending, approving, or revoking. No state was changed.'
    };
  }

  function sanitizeForLog(text) {
    if (!isPresent(text)) return '';
    var cleaned = String(text).replace(/[A-Za-z0-9]{32,}/g, '[REDACTED-LONG-TOKEN]');
    return cleaned.slice(0, 120);
  }

  var api = {
    explainBlockchain: explainBlockchain,
    checkPaperGate: checkPaperGate,
    checkRequest: checkRequest,
    sanitizeForLog: sanitizeForLog,
    topics: function () { return TOPIC_KEYS.slice(); }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.HalexMBlockchain = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
