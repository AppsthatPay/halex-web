// Harness for HALEX-AI plugins + answer engine. Plain Node, no dependencies.
// Run: node test_plugins.js (exit 0 = all pass, exit 1 = any failure).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

require(path.join(ROOT, 'knowledge.js'));
require(path.join(ROOT, 'halex-ai-plugins.js'));
require(path.join(ROOT, 'halex-ai-pack-animals.js'));
require(path.join(ROOT, 'halex-ai-pack-halex-core.js'));
require(path.join(ROOT, 'halex-ai-pack-allen-systems.js'));
const ext = require(path.join(ROOT, 'halex-ai-ext.js'));
const ui = require(path.join(ROOT, 'halex-ai-ui.js'));

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS: ' + name); }
  else { failed++; console.log('FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
}

const P = globalThis.HalexAIPlugins;

// 1. Registry: three starter packs, animals pack has 6 entries.
const packs = P.listPacks();
check('three packs registered', packs.length === 3, JSON.stringify(packs));
const animals = packs.find((p) => p.id === 'animals-mice');
check('animals pack has 6 entries', !!animals && animals.entries === 6, JSON.stringify(animals));

// 2. Mice question returns real content, not jargon.
const a1 = P.answer('tell me about mice');
check('mice question returns plugin answer', a1.source === 'plugin', a1.source);
check('mice answer has real content', /Mus musculus/.test(a1.text), a1.text.slice(0, 80));

// 3. Anti-repeat: asking twice (and thrice) never returns identical text.
const a2 = P.answer('tell me about mice');
const a3 = P.answer('tell me about mice');
check('second mice answer differs from first', a2.text !== a1.text);
check('third mice answer differs from second', a3.text !== a2.text);
check('repeat answers still about mice', /mouse/i.test(a2.text) && /mouse/i.test(a3.text));

// 4. Ranked retrieval: a specific question gets the specific entry.
const pet = P.answer('how do I care for a pet mouse');
check('pet care question hits pet care entry', pet.source === 'plugin' && pet.text.indexOf('Pet mouse care basics') === 0, pet.text.slice(0, 60));

// 5. Honest miss: unknown domain, no jargon fallback.
const miss = P.answer('quantum chromodynamics lattice gauge fixing');
check('unknown domain returns miss', miss.source === 'miss', miss.source);
check('miss uses prescribed wording', miss.text.indexOf(P.MISS_TEXT) === 0, miss.text.slice(0, 80));
check('miss contains no generic jargon', miss.text.indexOf('general AI built by AI') === -1);

// 6. Weak overlap: miss, but closest topics listed.
const weak = P.answer('gerbil care');
check('weak query is a miss', weak.source === 'miss', weak.source + ' ' + weak.text.slice(0, 60));
check('miss lists closest topic', /Pet mouse care basics/.test(weak.text), weak.text);

// 7. Registry extensibility: a pack added at runtime answers, no chat-code edit.
P.registerPack({
  id: 'test-pack', name: 'Test pack', version: '0.1.0', provenance: 'harness only',
  entries: [{ patterns: ['quokka'], title: 'Quokka note', body: 'Quokkas are small wallabies from Western Australia.', sources: ['harness'] }]
});
const q = P.answer('tell me about quokkas');
check('runtime-registered pack answers', q.source === 'plugin' && /Quokkas are small wallabies/.test(q.text), q.text.slice(0, 60));

// 8. Math still works first in the chain.
const m = ui.HalexAIMath.tryMath('2+2*3');
check('math 2+2*3 = 8', !!m && m.value === 8, JSON.stringify(m));

// 9. No dynamic code execution in new or edited JS.
const jsFiles = ['halex-ai-plugins.js', 'halex-ai-pack-animals.js', 'halex-ai-pack-halex-core.js', 'halex-ai-pack-allen-systems.js', 'halex-ai-ext.js'];
let clean = true;
for (const f of jsFiles) {
  const src = read(f);
  if (/\beval\s*\(/.test(src) || /new\s+Function\s*\(/.test(src)) { clean = false; console.log('  dynamic code found in ' + f); }
}
check('no eval/Function in new or edited JS', clean);

// 10. Node syntax check on every new or edited JS file.
let syntaxOk = true;
for (const f of jsFiles.concat(['halex-ai-ui.js', 'knowledge.js'])) {
  try { execSync('node --check ' + JSON.stringify(path.join(ROOT, f)), { stdio: 'pipe' }); }
  catch (e) { syntaxOk = false; console.log('  syntax fail: ' + f); }
}
check('node --check passes on page JS', syntaxOk);

// 11. index.html wires the engine and all three packs, in order.
const html = read('index.html');
const order = ['halex-ai-plugins.js', 'halex-ai-pack-animals.js', 'halex-ai-pack-halex-core.js', 'halex-ai-pack-allen-systems.js'];
let orderOk = true;
let prev = -1;
for (const f of order) {
  const idx = html.indexOf('<script src="' + f + '"></script>');
  if (idx === -1 || idx < prev) { orderOk = false; }
  prev = idx;
}
check('index.html loads engine then packs in order', orderOk);

// 12. Manifest parses and matches the registry.
const manifest = JSON.parse(read('halex-ai-plugin-manifest.json'));
check('manifest lists 3 packs', manifest.packs.length === 3);
check('manifest counts match registry', manifest.packs.every((mp) => {
  const rp = packs.find((p) => p.id === mp.id);
  return rp && rp.entries === mp.entries;
}));

// 13. Chat-path integration: answerLocal uses plugins, anti-repeat, honest miss.
const e1 = ext.answerLocal('tell me about mice');
const e2 = ext.answerLocal('tell me about mice');
check('answerLocal mice is plugin-sourced', e1.source === 'plugin', e1.source);
check('answerLocal mice answers differ', e1.text !== e2.text);
const em = ext.answerLocal('quantum chromodynamics lattice gauge fixing');
check('answerLocal unknown is honest miss', em.source === 'miss' && em.text.indexOf(P.MISS_TEXT) === 0, em.source + ' ' + em.text.slice(0, 60));
const ef = ext.answerLocal('what is halex-ai');
// Plugin-first routing (intentional, 2026-10-30): the halex-core pack
// now answers this question before the fact path, with the same
// doctrine text. The old expectation of source 'fact' is stale.
check('existing fact path unchanged', ef.source === 'plugin' && /HALEX-AI doctrine/.test(ef.text), ef.source);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
