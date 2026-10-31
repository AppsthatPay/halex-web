// Node test for halex-ai-chain-brain.js (staging conversational layer).
// Run: node test_chain_brain.js
'use strict';
var assert = require('assert');
var HalexChainBrain = require('../../../halex-ai-chain-brain.js');

var brain = HalexChainBrain.createChainBrain();
assert.strictEqual(brain.registerChain('Chain-01', 'Fauna Chain', 'fauna').status, 'REGISTERED');
assert.strictEqual(brain.createAgency('ag-01', 'Chain-01', 'fauna', 0, 999).status, 'AGENCY_CREATED');
assert.strictEqual(
  brain.storeRecord('rec-mouse', 'Chain-01', 'ag-01', 'fauna',
    'The house mouse is a small rodent that lives close to people.').status, 'STORED');

var match = brain.respond('What do you know about the house mouse?');
assert.strictEqual(match.status, 'MATCH');
assert.ok(match.answer.indexOf('house mouse') !== -1);
assert.ok(match.answer.indexOf('What else about fauna interests you?') !== -1);
assert.ok(match.answer.indexOf('What else would you like to know?') !== -1);

var miss = brain.respond('Tell me about quantum bananas from Mars');
assert.strictEqual(miss.status, 'MISS');
assert.ok(miss.answer.indexOf("don't have a record") !== -1);
assert.ok(miss.availableCategories.indexOf('fauna') !== -1);

var before = brain.recordCount();
brain.respond('What do you know about the house mouse?');
assert.strictEqual(brain.recordCount(), before, 'respond must store nothing');

assert.strictEqual(
  brain.storeRecord('rec-sec', 'Chain-01', 'ag-01', 'fauna', 'private_key: 0x123').status,
  'REFUSED_SENSITIVE');

console.log('halex-ai-chain-brain: 4 checks passed (match, miss, stores-nothing, sensitive-refused)');
